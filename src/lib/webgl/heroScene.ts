import { Mesh, Program, Renderer, Triangle } from 'ogl';
import { readHeroPalette } from './heroColors';
import { getRenderDpr, getRenderProfile, isTouchDevice } from './heroGate';
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

const CHROMA_OFFSET = 0.0008;
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

function toGl(point: Point, scaleX: number, scaleY: number, bufferHeight: number): [number, number] {
  return [point[0] * scaleX, bufferHeight - point[1] * scaleY];
}

export function mountHeroScene({ host, stage }: HeroSceneTargets): HeroScene | null {
  const canvas = createCanvas();
  if (!createContext(canvas)) return null;

  let renderer: Renderer;
  try {
    renderer = new Renderer({ canvas, alpha: false, depth: false, autoClear: false, webgl: 2 });
  } catch {
    return null;
  }
  if (!renderer.isWebgl2) return null;

  const touch = isTouchDevice();
  const profile = getRenderProfile(touch);
  const palette = readHeroPalette();
  const gl = renderer.gl;

  const uniforms = {
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
  const program = new Program(gl, {
    vertex: VERTEX,
    fragment: FRAGMENT,
    uniforms,
    depthTest: false,
    depthWrite: false,
    cullFace: false,
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program, frustumCulled: false });

  const meter = createFrameMeter();
  const minFrameMs = profile.maxFps ? 1000 / profile.maxFps - 2 : 0;

  let qualityStep: 0 | 1 = 0;
  let monitoring = true;
  let inView = true;
  let frozen = false;
  let disposed = false;
  let shown = false;
  let rafId = 0;
  let clockStart = -1;
  let pausedAt = 0;
  let pausedTotal = 0;
  let lastFrame = 0;
  let lastRender = 0;
  let seconds = 0;

  function render() {
    uniforms.uTime.value = seconds;
    uniforms.uNode.value = nodeProgress(seconds);
    renderer.render({ scene: mesh });
    if (shown) return;
    shown = true;
    // Two frames after the canvas exists, so the opacity transition has a computed start style to leave.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        canvas.style.opacity = '1';
      });
    });
  }

  // Resizing clears the drawing buffer, so every call ends with a render.
  function resize() {
    const hostRect = host.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    if (hostRect.width === 0 || hostRect.height === 0) return;

    renderer.dpr = getRenderDpr(window.devicePixelRatio, profile, qualityStep);
    renderer.setSize(hostRect.width, hostRect.height);
    // OGL writes pixel sizes into the style; CSS keeps ownership of the display size.
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const bufferWidth = canvas.width;
    const bufferHeight = canvas.height;
    const scaleX = bufferWidth / hostRect.width;
    const scaleY = bufferHeight / hostRect.height;
    const layout = computeStage(hostRect, stageRect);
    const from = toGl(layout.ramp.from, scaleX, scaleY, bufferHeight);
    const to = toGl(layout.ramp.to, scaleX, scaleY, bufferHeight);
    const deltaX = to[0] - from[0];
    const deltaY = to[1] - from[1];
    const lengthSquared = deltaX * deltaX + deltaY * deltaY || 1;

    uniforms.uResolution.value = [bufferWidth, bufferHeight];
    uniforms.uCenter.value = toGl(layout.center, scaleX, scaleY, bufferHeight);
    uniforms.uUnit.value = layout.unit * scaleX;
    uniforms.uRampFrom.value = from;
    uniforms.uRampVec.value = [deltaX / lengthSquared, deltaY / lengthSquared];
    uniforms.uChroma.value = touch ? 0 : CHROMA_OFFSET * bufferWidth;
    render();
  }

  function applyQuality(frameAverage: number) {
    const action = decideQuality(frameAverage, qualityStep === 0);
    if (action === 'keep') {
      monitoring = false;
    } else if (action === 'lower') {
      qualityStep = 1;
      meter.reset();
      resize();
    } else {
      monitoring = false;
      frozen = true;
      render();
      syncLoop();
    }
  }

  function frame(now: number) {
    rafId = requestAnimationFrame(frame);
    if (clockStart < 0) clockStart = now;

    if (monitoring && lastFrame > 0) {
      const average = meter.push(now - lastFrame);
      if (average !== null) applyQuality(average);
    }
    lastFrame = now;
    if (frozen || now - lastRender < minFrameMs) return;

    lastRender = now;
    seconds = (now - clockStart - pausedTotal) / 1000;
    render();
  }

  // The loop exists only while the hero is on screen, the tab is visible and the frame budget holds.
  function syncLoop() {
    const shouldRun = !disposed && !frozen && inView && !document.hidden;
    if (shouldRun && rafId === 0) {
      if (pausedAt > 0 && clockStart >= 0) pausedTotal += performance.now() - pausedAt;
      pausedAt = 0;
      lastFrame = 0;
      rafId = requestAnimationFrame(frame);
    } else if (!shouldRun && rafId !== 0) {
      cancelAnimationFrame(rafId);
      rafId = 0;
      pausedAt = performance.now();
    }
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    syncLoop();
    resizeObserver.disconnect();
    visibility.disconnect();
    document.removeEventListener('visibilitychange', syncLoop);
    canvas.removeEventListener('webglcontextlost', dispose);
    canvas.remove();
    // Releases the GPU memory now instead of waiting for the canvas to be collected.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  const resizeObserver = new ResizeObserver(resize);
  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncLoop();
  });

  host.appendChild(canvas);
  resize();
  resizeObserver.observe(host);
  resizeObserver.observe(stage);
  visibility.observe(host);
  document.addEventListener('visibilitychange', syncLoop);
  // Falling back to the poster beats restoring a context that just failed.
  canvas.addEventListener('webglcontextlost', dispose);
  syncLoop();

  return { dispose };
}
