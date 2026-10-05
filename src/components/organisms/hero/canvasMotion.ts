import { motion } from '../../../config/motion';
import { gsap } from '../../../lib/gsap';
import {
  ALIGNED_MIX,
  DISORDERED_ANCHORS,
  GUIDE_REST_OPACITY,
  NODE_ROWS,
  anchorAt,
  controlPoints,
  sampleCurve,
} from './canvasGeometry';
import {
  assignState,
  createCanvasRenderer,
  finalState,
  initialState,
  type CanvasParts,
  type CanvasRenderer,
  type CanvasState,
} from './canvasRenderer';
import { NODE_NUMBERS, buildSchedule, stepOf, type NodeNumber, type Step, type StepId } from './canvasSchedule';

interface CanvasElements {
  parts: CanvasParts;
  content: HTMLElement;
  halo: SVGElement;
  handles: Element[];
  guides: SVGLineElement[];
  boxes: HTMLElement[];
  bursts: HTMLElement[];
  cursorTip: HTMLElement;
}

const GUIDE_FLASH_OPACITY = 0.6;
const GUIDE_FLASH_SECONDS = 0.3;
const BURST_SECONDS = 0.5;
const BURST_SCALE = 2.6;
const SETTLE_SCALE = 1.35;
const SETTLE_SECONDS = 0.35;
const SETTLE_EASE = 'back.out(2.4)';
const LIT_SECONDS = 0.45;
const HANDLES_DIMMED = 0.3;
const HANDLES_LIFTED = 1;
const TRAIL_FADE_DELAY = 0.2;
const TRAIL_FADE_SECONDS = 0.6;
// The tip of the arrow sits 1.5 px inside its box; the press shrinks toward that point.
const CURSOR_TIP_ORIGIN = '1.5px 1.5px';
const PRESS_SCALE = 0.85;

function all<T extends Element>(root: Element, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

function collect(root: HTMLElement): CanvasElements | null {
  const content = root.querySelector<HTMLElement>('[data-canvas-content]');
  const halo = root.querySelector<SVGElement>('[data-canvas-halo]');
  const pulse = root.querySelector<HTMLElement>('[data-canvas-pulse]');
  const cursor = root.querySelector<HTMLElement>('[data-canvas-cursor]');
  const cursorTip = root.querySelector<HTMLElement>('[data-canvas-cursor-tip]');
  if (!content || !halo || !pulse || !cursor || !cursorTip) return null;

  return {
    parts: {
      curves: all<SVGPathElement>(root, '[data-canvas-curve]'),
      trails: all<SVGPathElement>(root, '[data-canvas-trail]'),
      handleLines: all<SVGPathElement>(root, '[data-canvas-handle-line]'),
      handleDots: all<HTMLElement>(root, '[data-canvas-handle-dot]'),
      nodes: all<HTMLElement>(root, '[data-canvas-node]'),
      pulse,
      cursor,
    },
    content,
    halo,
    handles: all(root, '[data-canvas-handles]'),
    guides: all<SVGLineElement>(root, '[data-canvas-guide]'),
    boxes: all<HTMLElement>(root, '[data-canvas-node-box]'),
    bursts: all<HTMLElement>(root, '[data-canvas-node-burst]'),
    cursorTip,
  };
}

function setLit(elements: CanvasElements, index: number, lit: boolean): void {
  elements.parts.nodes[index].dataset.active = String(lit);
}

// Puts every animated element in its first-frame state. It runs on build and on each loop.
function resetScene(elements: CanvasElements, state: CanvasState, renderer: CanvasRenderer): void {
  assignState(state, initialState());
  renderer.render(state);
  gsap.set(elements.content, { opacity: 0 });
  gsap.set(elements.halo, { opacity: 0 });
  gsap.set(elements.handles, { opacity: HANDLES_LIFTED });
  gsap.set(elements.guides, { opacity: GUIDE_REST_OPACITY });
  gsap.set(elements.boxes, { scale: 1 });
  gsap.set(elements.bursts, { opacity: 0 });
  gsap.set(elements.parts.trails, { opacity: 1 });
  gsap.set([elements.parts.pulse, elements.parts.cursor], { opacity: 0 });
  gsap.set(elements.cursorTip, { transformOrigin: CURSOR_TIP_ORIGIN });
  elements.parts.nodes.forEach((_, index) => setLit(elements, index, false));
}

// Back to the markup React rendered, which is the finished still frame. The wrappers that the renderer positions
// keep their transform; only what GSAP wrote is cleared.
function restoreStill(elements: CanvasElements, renderer: CanvasRenderer): void {
  renderer.render(finalState());
  const faded = [
    elements.content,
    elements.halo,
    ...elements.handles,
    ...elements.guides,
    ...elements.bursts,
    ...elements.parts.trails,
    elements.parts.pulse,
    elements.parts.cursor,
  ];
  gsap.set(faded, { clearProps: 'opacity' });
  gsap.set([...elements.boxes, elements.cursorTip], { clearProps: 'transform,scale,transformOrigin' });
  elements.parts.nodes.forEach((_, index) => setLit(elements, index, false));
}

function buildTimeline(elements: CanvasElements, state: CanvasState, renderer: CanvasRenderer) {
  const schedule = buildSchedule();
  const step = (id: StepId) => stepOf(schedule, id);
  const end = (id: StepId) => step(id).at + step(id).duration;
  const aligned = sampleCurve(controlPoints(ALIGNED_MIX));
  const out = motion.ease.out.gsap;
  const inOut = motion.ease.inOut.gsap;
  const fast = motion.duration.fast;

  const tl = gsap.timeline({
    repeat: -1,
    paused: true,
    defaults: { ease: out },
    onUpdate: () => renderer.render(state),
  });
  tl.eventCallback('onRepeat', () => resetScene(elements, state, renderer));

  // A fromTo would paint its first frame on creation. The scene is reset explicitly instead, so nothing shows early.
  const fromTo = (target: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars, at: number) =>
    tl.fromTo(target, from, { ...to, immediateRender: false }, at);

  const burst = (node: number, at: number) =>
    fromTo(
      elements.bursts[node],
      { scale: 1, opacity: 0.6 },
      { scale: BURST_SCALE, opacity: 0, duration: BURST_SECONDS },
      at,
    );

  // One node taken: the pen reaches it, it lights, the pen drags it onto its grid point and releases it with a snap.
  const place = (node: NodeNumber) => {
    const index = node - 1;
    const take: Step = step(`take${node}`);
    const move: Step = step(`move${node}`);
    const snap: Step = step(`snap${node}`);
    const start = DISORDERED_ANCHORS[index];

    tl.to(state.cursor, { x: start.x, y: start.y, duration: take.duration, ease: inOut }, take.at);
    tl.call(() => setLit(elements, index, true), undefined, move.at);
    fromTo(elements.cursorTip, { scale: PRESS_SCALE }, { scale: 1, duration: fast }, move.at);
    tl.to(
      state.mix,
      {
        [index]: 1,
        duration: move.duration,
        ease: inOut,
        onUpdate: () => {
          const anchor = anchorAt(index, state.mix[index]);
          state.cursor.x = anchor.x;
          state.cursor.y = anchor.y;
        },
      },
      move.at,
    );

    fromTo(
      elements.guides[NODE_ROWS[index]],
      { opacity: GUIDE_FLASH_OPACITY },
      { opacity: GUIDE_REST_OPACITY, duration: GUIDE_FLASH_SECONDS },
      snap.at,
    );
    burst(index, snap.at);
    fromTo(elements.boxes[index], { scale: SETTLE_SCALE }, { scale: 1, duration: SETTLE_SECONDS, ease: SETTLE_EASE }, snap.at);
    tl.call(() => setLit(elements, index, false), undefined, snap.at + LIT_SECONDS);
  };

  // The pulse crosses the nodes at constant speed, so each one lights at the moment the pulse reaches it.
  const flow = () => {
    const { at, duration } = step('flow');
    fromTo(elements.parts.pulse, { opacity: 0 }, { opacity: 1, duration: fast }, at);
    tl.to(state, { pulse: 1, duration, ease: 'none' }, at);
    aligned.stops.forEach((stop, index) => {
      const crossing = at + stop * duration;
      tl.call(() => setLit(elements, index, true), undefined, crossing);
      burst(index, crossing);
      tl.call(() => setLit(elements, index, false), undefined, crossing + LIT_SECONDS);
    });
    tl.to(elements.parts.pulse, { opacity: 0, duration: fast }, at + duration);
  };

  tl.fromTo(elements.content, { opacity: 0 }, { opacity: 1, duration: step('fadeIn').duration }, 0);
  tl.fromTo(elements.parts.cursor, { opacity: 0 }, { opacity: 1, duration: fast }, step('approach').at);
  const first = DISORDERED_ANCHORS[0];
  tl.to(state.cursor, { x: first.x, y: first.y, duration: step('approach').duration, ease: inOut }, step('approach').at);

  NODE_NUMBERS.forEach(place);

  // The nodes are placed: the pen leaves, the handles step back, the halo comes in, and the pulse runs.
  const settle = step('settle');
  tl.to(elements.parts.cursor, { opacity: 0, duration: fast }, settle.at);
  tl.to(elements.handles, { opacity: HANDLES_DIMMED, duration: motion.duration.base }, settle.at);
  tl.to(elements.halo, { opacity: 1, duration: motion.duration.base }, settle.at);
  flow();

  tl.to(elements.parts.trails, { opacity: 0, duration: TRAIL_FADE_SECONDS }, end('tail') + TRAIL_FADE_DELAY);
  const fade = step('fadeOut');
  tl.to(elements.content, { opacity: 0, duration: fade.duration, ease: 'none' }, fade.at);
  return tl;
}

// Frames run only while the scene is on screen and the tab is in front.
function observeVisibility(root: HTMLElement, onChange: (visible: boolean) => void): () => void {
  let intersecting = typeof IntersectionObserver === 'undefined';
  const report = () => onChange(intersecting && !document.hidden);
  const observer =
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver((entries) => {
          intersecting = entries[entries.length - 1].isIntersecting;
          report();
        });
  observer?.observe(root);
  document.addEventListener('visibilitychange', report);
  report();
  return () => {
    observer?.disconnect();
    document.removeEventListener('visibilitychange', report);
  };
}

// Starts the loop on a scene React already rendered in its finished state, and returns the cleanup.
export function startCanvasMotion(root: HTMLElement): () => void {
  const elements = collect(root);
  if (!elements) return () => {};

  const state = initialState();
  const aligned = sampleCurve(controlPoints(ALIGNED_MIX));
  const renderer = createCanvasRenderer(elements.parts, aligned);
  resetScene(elements, state, renderer);

  const timeline = buildTimeline(elements, state, renderer);
  const stopObserving = observeVisibility(root, (visible) => {
    timeline.paused(!visible);
    root.dataset.running = String(visible);
  });

  return () => {
    stopObserving();
    timeline.kill();
    restoreStill(elements, renderer);
    delete root.dataset.running;
  };
}
