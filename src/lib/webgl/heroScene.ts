import { Mesh, Program, Renderer, Triangle } from 'ogl';
import { readHeroPalette } from './heroColors';
import { getRenderDpr, getRenderProfile, isTouchDevice, type RenderProfile } from './heroGate';
import { FRAGMENT, VERTEX } from './heroShader';
import { MIN_GLOW, computeStage, type Point } from './heroStage';
import { createFrameMeter, decideQuality, nodeProgress } from './heroTiming';

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
const FADE_IN = 'opacity var(--duration-slow) var(--ease-out)';

// OGL does not expose context attributes. Creating the context first lets software rendering be refused
// (it would run this shader far too slowly), and OGL then reuses the same context from the canvas.
function createContext(canvas: HTMLCanvasElement): WebGL2RenderingContext | null {
  return canvas.getContext('webgl2', {
    alpha: false,
    depth: false,
    antialias: false,
    powerPreference: 'low-power',
    failIfMajorPerformanceCaveat: true,
  });
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
  private disposed = false;
  private shown = false;
  private rafId = 0;
  private clockStart = -1;
  private pausedAt = 0;
  private pausedTotal = 0;
  private lastFrame = 0;
  private lastRender = 0;
  private seconds = 0;

  constructor(gpu: GpuParts, targets: HeroSceneTargets) {
    this.gpu = gpu;
    this.targets = targets;
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
    const { canvas, renderer, mesh, uniforms } = this.gpu;
    uniforms.uTime.value = this.seconds;
    uniforms.uNode.value = nodeProgress(this.seconds);
    renderer.render({ scene: mesh });
    if (this.shown) return;
    this.shown = true;
    // Two frames after the canvas exists, so the opacity transition has a computed start style to leave.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        canvas.style.opacity = '1';
      });
    });
  }

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
      this.frozen = true;
      this.render();
      this.syncLoop();
    }
  }

  private frame = (now: number) => {
    this.rafId = requestAnimationFrame(this.frame);
    if (this.clockStart < 0) this.clockStart = now;

    if (this.monitoring && this.lastFrame > 0) {
      const average = this.meter.push(now - this.lastFrame);
      if (average !== null) this.applyQuality(average);
    }
    this.lastFrame = now;
    if (this.frozen || now - this.lastRender < this.minFrameMs) return;

    this.lastRender = now;
    this.seconds = (now - this.clockStart - this.pausedTotal) / 1000;
    this.render();
  };

  private syncLoop = () => {
    const shouldRun = !this.disposed && !this.frozen && this.inView && !document.hidden;
    if (shouldRun && this.rafId === 0) {
      // Time spent paused does not count, so the motion resumes where it stopped.
      if (this.pausedAt > 0 && this.clockStart >= 0) this.pausedTotal += performance.now() - this.pausedAt;
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

  const runtime = new HeroSceneRuntime(gpu, targets);
  runtime.start();
  return runtime;
}
