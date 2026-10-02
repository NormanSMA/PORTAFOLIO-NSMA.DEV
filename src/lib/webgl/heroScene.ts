import { Mesh, Program, Renderer, Triangle } from 'ogl';
import { readHeroPalette } from './heroColors';
import { getRenderDpr, getRenderProfile, isSoftwareRenderer, isTouchDevice, type RenderProfile } from './heroGate';
import { FRAGMENT, VERTEX } from './heroShader';
import { readPosterSeconds } from './heroPosterMotion';
import { MIN_GLOW, computeStage, type Point } from './heroStage';
import { createFrameMeter, decideQuality, driftAmount, nodeProgress } from './heroTiming';

export interface HeroScene {
  dispose(): void;
}

interface HeroSceneTargets {
  // Element the canvas fills and is appended to.
  host: HTMLElement;
  // Box that places the filament; defined in CSS by the poster.
  stage: HTMLElement;
}

interface GpuParts {
  canvas: HTMLCanvasElement;
  renderer: Renderer;
  mesh: Mesh;
  uniforms: Record<string, { value: number | number[] }>;
}

const CHROMA_OFFSET = 0.0004;
const FILM_GRAIN = 0.03;
// HeroPoster pauses its animations while this attribute is on the host.
const LIVE_SCENE = 'live';
const FADE_IN = 'opacity var(--duration-slow) var(--ease-out)';
// Matches --duration-slow; the canvas is removed once its fade-out has played.
const FADE_OUT_MS = 1100;

function rendererName(gl: WebGL2RenderingContext): string | null {
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  return info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : null;
}

// Creating the context first lets software rendering be refused (this shader runs far too slowly there), and OGL
// then reuses the same context from the canvas. Asking the browser to fail on a "performance caveat" is not used:
// it also refuses valid GPUs on some drivers, so the renderer name decides and the frame meter backs it up.
function createContext(canvas: HTMLCanvasElement): WebGL2RenderingContext | null {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    depth: false,
    antialias: false,
    powerPreference: 'low-power',
  });
  if (!gl || !isSoftwareRenderer(rendererName(gl))) return gl;
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return null;
}

function createCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0';
  canvas.style.transition = FADE_IN;
  return canvas;
}

function createUniforms(): GpuParts['uniforms'] {
  const palette = readHeroPalette();
  return {
    uResolution: { value: [1, 1] },
    uTime: { value: 0 },
    uNode: { value: 0 },
    uDrift: { value: 0 },
    uCenter: { value: [0, 0] },
    uUnit: { value: 1 },
    uRampFrom: { value: [0, 0] },
    uRampVec: { value: [0, 0] },
    uMinGlow: { value: MIN_GLOW },
    uChroma: { value: 0 },
    uGrain: { value: FILM_GRAIN },
    uInk: { value: palette.ink },
    uCore: { value: palette.core },
    uInner: { value: palette.inner },
    uHalo: { value: palette.halo },
  };
}

// Returns null where WebGL2 is missing, refused or only available in software.
function createGpuParts(): GpuParts | null {
  const canvas = createCanvas();
  if (!createContext(canvas)) return null;

  let renderer: Renderer;
  try {
    renderer = new Renderer({ canvas, alpha: false, depth: false, autoClear: false, webgl: 2 });
  } catch {
    return null;
  }
  if (!renderer.isWebgl2) return null;

  const uniforms = createUniforms();
  const program = new Program(renderer.gl, {
    vertex: VERTEX,
    fragment: FRAGMENT,
    uniforms,
    depthTest: false,
    depthWrite: false,
    cullFace: false,
  });
  const geometry = new Triangle(renderer.gl);
  return { canvas, renderer, mesh: new Mesh(renderer.gl, { geometry, program, frustumCulled: false }), uniforms };
}

function toGl(point: Point, scaleX: number, scaleY: number, bufferHeight: number): [number, number] {
  return [point[0] * scaleX, bufferHeight - point[1] * scaleY];
}

// Owns the render loop. The loop exists only while the hero is on screen, the tab is visible and the frame budget holds.
class HeroSceneRuntime implements HeroScene {
  private readonly gpu: GpuParts;
  private readonly targets: HeroSceneTargets;
  private readonly startSeconds: number;
  private readonly touch = isTouchDevice();
  private readonly profile: RenderProfile = getRenderProfile(this.touch);
  private readonly meter = createFrameMeter();
  private readonly minFrameMs = this.profile.maxFps ? 1000 / this.profile.maxFps - 2 : 0;
  private readonly resizeObserver = new ResizeObserver(() => this.resize());
  private readonly visibility = new IntersectionObserver(([entry]) => {
    this.inView = entry.isIntersecting;
    this.syncLoop();
  });

  private qualityStep: 0 | 1 = 0;
  private monitoring = true;
  private inView = true;
  private frozen = false;
  private retired = false;
  private disposed = false;
  private shown = false;
  private retireTimer = 0;
  private rafId = 0;
  private readonly clockStart = performance.now();
  private pausedAt = 0;
  private pausedTotal = 0;
  private lastFrame = 0;
  private lastRender = 0;
  private seconds = 0;

  // The scene clock starts at the poster's own, so node and pulse carry on from where the poster is.
  constructor(gpu: GpuParts, targets: HeroSceneTargets, startSeconds: number) {
    this.gpu = gpu;
    this.targets = targets;
    this.startSeconds = startSeconds;
    this.seconds = startSeconds;
  }

  start() {
    const { host, stage } = this.targets;
    host.appendChild(this.gpu.canvas);
    this.resize();
    this.resizeObserver.observe(host);
    this.resizeObserver.observe(stage);
    this.visibility.observe(host);
    document.addEventListener('visibilitychange', this.syncLoop);
    // Falling back to the poster beats restoring a context that just failed.
    this.gpu.canvas.addEventListener('webglcontextlost', this.dispose);
    this.syncLoop();
  }

  private render() {
    const { renderer, mesh, uniforms } = this.gpu;
    uniforms.uTime.value = this.seconds;
    uniforms.uNode.value = nodeProgress(this.seconds);
    uniforms.uDrift.value = driftAmount(this.seconds - this.startSeconds);
    renderer.render({ scene: mesh });
    if (this.shown) return;
    this.shown = true;
    // Two frames after the canvas exists, so the opacity transition has a computed start style to leave.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.reveal());
    });
  }

  // The poster keeps moving under the fade so the crossfade has no stall, then rests while the canvas covers it.
  private reveal() {
    const { canvas } = this.gpu;
    if (this.disposed) return;
    canvas.style.opacity = '1';
    canvas.addEventListener('transitionend', this.cover, { once: true });
  }

  private cover = () => {
    if (!this.disposed && !this.retired) this.targets.host.dataset.scene = LIVE_SCENE;
  };

  // Resizing clears the drawing buffer, so every call ends with a render.
  private resize() {
    const { host, stage } = this.targets;
    const { canvas, renderer, uniforms } = this.gpu;
    const hostRect = host.getBoundingClientRect();
    if (hostRect.width === 0 || hostRect.height === 0) return;

    renderer.dpr = getRenderDpr(window.devicePixelRatio, this.profile, this.qualityStep);
    renderer.setSize(hostRect.width, hostRect.height);
    // OGL writes pixel sizes into the style; CSS keeps ownership of the display size.
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const bufferHeight = canvas.height;
    const scaleX = canvas.width / hostRect.width;
    const scaleY = bufferHeight / hostRect.height;
    const layout = computeStage(hostRect, stage.getBoundingClientRect());
    const from = toGl(layout.ramp.from, scaleX, scaleY, bufferHeight);
    const to = toGl(layout.ramp.to, scaleX, scaleY, bufferHeight);
    const deltaX = to[0] - from[0];
    const deltaY = to[1] - from[1];
    const lengthSquared = deltaX * deltaX + deltaY * deltaY || 1;

    uniforms.uResolution.value = [canvas.width, bufferHeight];
    uniforms.uCenter.value = toGl(layout.center, scaleX, scaleY, bufferHeight);
    uniforms.uUnit.value = layout.unit * scaleX;
    uniforms.uRampFrom.value = from;
    uniforms.uRampVec.value = [deltaX / lengthSquared, deltaY / lengthSquared];
    uniforms.uChroma.value = this.touch ? 0 : CHROMA_OFFSET * canvas.width;
    this.render();
  }

  private applyQuality(frameAverage: number) {
    const action = decideQuality(frameAverage, this.qualityStep === 0);
    if (action === 'keep') {
      this.monitoring = false;
    } else if (action === 'lower') {
      this.qualityStep = 1;
      this.meter.reset();
      this.resize();
    } else {
      this.monitoring = false;
      this.retire();
    }
  }

  // A canvas that cannot hold the frame budget is worse than none: the animated poster takes over and the
  // canvas fades out over it instead of freezing on one frame.
  private retire() {
    this.retired = true;
    this.frozen = true;
    this.syncLoop();
    delete this.targets.host.dataset.scene;
    this.gpu.canvas.style.opacity = '0';
    this.retireTimer = window.setTimeout(this.dispose, FADE_OUT_MS);
  }

  private frame = (now: number) => {
    this.rafId = requestAnimationFrame(this.frame);

    if (this.monitoring && this.lastFrame > 0) {
      const average = this.meter.push(now - this.lastFrame);
      if (average !== null) this.applyQuality(average);
    }
    this.lastFrame = now;
    if (this.frozen || now - this.lastRender < this.minFrameMs) return;

    this.lastRender = now;
    this.seconds = this.startSeconds + (now - this.clockStart - this.pausedTotal) / 1000;
    this.render();
  };

  private syncLoop = () => {
    const shouldRun = !this.disposed && !this.frozen && this.inView && !document.hidden;
    if (shouldRun && this.rafId === 0) {
      // Time spent paused does not count, so the motion resumes where it stopped.
      if (this.pausedAt > 0) this.pausedTotal += performance.now() - this.pausedAt;
      this.pausedAt = 0;
      this.lastFrame = 0;
      this.rafId = requestAnimationFrame(this.frame);
    } else if (!shouldRun && this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
      this.pausedAt = performance.now();
    }
  };

  dispose = () => {
    if (this.disposed) return;
    this.disposed = true;
    window.clearTimeout(this.retireTimer);
    delete this.targets.host.dataset.scene;
    this.syncLoop();
    this.resizeObserver.disconnect();
    this.visibility.disconnect();
    document.removeEventListener('visibilitychange', this.syncLoop);
    this.gpu.canvas.removeEventListener('webglcontextlost', this.dispose);
    this.gpu.canvas.remove();
    // Releases the GPU memory now instead of waiting for the canvas to be collected.
    this.gpu.renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}

export function mountHeroScene(targets: HeroSceneTargets): HeroScene | null {
  const gpu = createGpuParts();
  if (!gpu) return null;

  const runtime = new HeroSceneRuntime(gpu, targets, readPosterSeconds(targets.stage));
  runtime.start();
  return runtime;
}
