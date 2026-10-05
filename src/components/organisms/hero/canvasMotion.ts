import { motion } from '../../../config/motion';
import { gsap } from '../../../lib/gsap';
import {
  ANCHORS,
  ROUGH_MIX,
  controlPoints,
  pointAt,
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
import { buildSchedule, stepOf, type StepId } from './canvasSchedule';

interface CanvasElements {
  parts: CanvasParts;
  content: HTMLElement;
  halo: SVGElement;
  controls: Element[];
  boxes: HTMLElement[];
  rings: HTMLElement[];
  dotTips: HTMLElement[];
  tokens: HTMLElement[];
  cursorTip: HTMLElement;
}

const POP_SECONDS = 0.35;
const RING_SECONDS = 0.5;
const REACH_SECONDS = 0.3;
const REACH_DELAY = 0.1;
const GRAB_SECONDS = 0.12;
const CONTROLS_DIMMED = 0.3;
const TOKEN_OFFSET = 6;
const TOKEN_STAGGER = 0.08;
const TOKEN_DELAY = 0.2;
const POP_EASE = 'back.out(2.6)';
// The tip of the arrow sits 1.5 px inside its box; the press shrinks toward that point.
const CURSOR_TIP_ORIGIN = '1.5px 1.5px';
const GRABBED_DOT_SCALE = 1.5;

function all<T extends Element>(root: Element, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

function collect(root: HTMLElement): CanvasElements | null {
  const content = root.querySelector<HTMLElement>('[data-canvas-content]');
  const halo = root.querySelector<SVGElement>('[data-canvas-halo]');
  const cursor = root.querySelector<HTMLElement>('[data-canvas-cursor]');
  const cursorTip = root.querySelector<HTMLElement>('[data-canvas-cursor-tip]');
  if (!content || !halo || !cursor || !cursorTip) return null;

  return {
    parts: {
      curves: all<SVGPathElement>(root, '[data-canvas-curve]'),
      handleLines: all<SVGPathElement>(root, '[data-canvas-handle-line]'),
      handleDots: all<HTMLElement>(root, '[data-canvas-handle-dot]'),
      cursor,
    },
    content,
    halo,
    controls: all(root, '[data-canvas-controls]'),
    boxes: all<HTMLElement>(root, '[data-canvas-anchor-box]'),
    rings: all<HTMLElement>(root, '[data-canvas-anchor-ring]'),
    dotTips: all<HTMLElement>(root, '[data-canvas-dot-tip]'),
    tokens: all<HTMLElement>(root, '[data-canvas-token]'),
    cursorTip,
  };
}

function setActive(elements: CanvasElements, index: number): void {
  elements.boxes.forEach((box, position) => {
    box.dataset.active = String(position === index);
  });
}

// Puts every animated element in its first-frame state. It runs on build and on each loop.
function resetScene(elements: CanvasElements, state: CanvasState, renderer: CanvasRenderer): void {
  assignState(state, initialState());
  renderer.render(state);
  gsap.set(elements.content, { opacity: 0 });
  gsap.set(elements.halo, { opacity: 0 });
  gsap.set(elements.controls, { opacity: 1 });
  gsap.set(elements.boxes, { scale: 0 });
  gsap.set(elements.rings, { opacity: 0 });
  gsap.set(elements.dotTips, { scale: 1 });
  gsap.set(elements.tokens, { opacity: 0, y: TOKEN_OFFSET });
  gsap.set(elements.parts.cursor, { opacity: 0 });
  gsap.set(elements.cursorTip, { transformOrigin: CURSOR_TIP_ORIGIN });
  setActive(elements, -1);
}

// Back to the markup React rendered, which is the finished still frame.
function restoreStill(elements: CanvasElements, renderer: CanvasRenderer): void {
  renderer.render(finalState());
  const animated = [
    elements.content,
    elements.halo,
    ...elements.controls,
    ...elements.boxes,
    ...elements.rings,
    ...elements.dotTips,
    ...elements.tokens,
    elements.parts.cursor,
    elements.cursorTip,
  ];
  gsap.set(animated, { clearProps: 'opacity,transform,scale,y,transformOrigin' });
  elements.boxes.forEach((box) => delete box.dataset.active);
}

function buildTimeline(elements: CanvasElements, state: CanvasState, renderer: CanvasRenderer) {
  const schedule = buildSchedule();
  const step = (id: StepId) => stepOf(schedule, id);
  const rough = sampleCurve(controlPoints(ROUGH_MIX));
  const out = motion.ease.out.gsap;
  const inOut = motion.ease.inOut.gsap;

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

  const moveCursorTo = (id: StepId, target: { x: number; y: number }) => {
    const { at, duration } = step(id);
    tl.to(state.cursor, { x: target.x, y: target.y, duration, ease: inOut }, at);
  };

  const click = (id: StepId, index: number) => {
    const { at } = step(id);
    tl.call(() => setActive(elements, index), undefined, at);
    fromTo(elements.boxes[index], { scale: 0 }, { scale: 1, duration: POP_SECONDS, ease: POP_EASE }, at);
    fromTo(
      elements.rings[index],
      { scale: 1, opacity: 0.7 },
      { scale: 2.8, opacity: 0, duration: RING_SECONDS },
      at,
    );
    tl.to(state.reach, { [index]: 1, duration: REACH_SECONDS }, at + REACH_DELAY);
    fromTo(elements.cursorTip, { scale: 0.85 }, { scale: 1, duration: motion.duration.fast }, at);
  };

  // The pen rides the tip of the stroke, so it looks like the pen is what draws the segment.
  const leg = (id: StepId, stop: number) => {
    const { at, duration } = step(id);
    const followTip = () => {
      const tip = pointAt(rough, state.trace);
      state.cursor.x = tip.x;
      state.cursor.y = tip.y;
    };
    tl.to(state, { trace: stop, duration, ease: inOut, onUpdate: followTip }, at);
  };

  // The drag moves a handle dot, and the pen holds it.
  const drag = (id: StepId, key: 'second' | 'third', anchor: number, side: 'in' | 'out', dot: number) => {
    const { at, duration } = step(id);
    tl.to(elements.dotTips[dot], { scale: GRABBED_DOT_SCALE, duration: GRAB_SECONDS }, at);
    tl.to(
      state,
      {
        [key]: 1,
        duration,
        ease: inOut,
        onUpdate: () => {
          const handle = controlPoints(state)[anchor][side];
          state.cursor.x = handle.x;
          state.cursor.y = handle.y;
        },
      },
      at,
    );
    tl.to(elements.dotTips[dot], { scale: 1, duration: GRAB_SECONDS }, at + duration - GRAB_SECONDS);
  };

  const [, second, third] = controlPoints(ROUGH_MIX);
  const stops = rough.stops;

  fromTo(elements.content, { opacity: 0 }, { opacity: 1, duration: step('fadeIn').duration }, 0);
  fromTo(elements.parts.cursor, { opacity: 0 }, { opacity: 1, duration: motion.duration.fast }, step('approach').at);
  moveCursorTo('approach', ANCHORS[0]);

  click('click1', 0);
  leg('leg1', stops[1]);
  click('click2', 1);
  leg('leg2', stops[2]);
  click('click3', 2);
  leg('leg3', stops[3]);
  click('click4', 3);

  moveCursorTo('reachSecond', second.out);
  tl.call(() => setActive(elements, 1), undefined, step('dragSecond').at);
  drag('dragSecond', 'second', 1, 'out', 3);
  moveCursorTo('reachThird', third.in);
  tl.call(() => setActive(elements, 2), undefined, step('dragThird').at);
  drag('dragThird', 'third', 2, 'in', 4);

  const finish = step('tokens');
  tl.call(() => setActive(elements, -1), undefined, finish.at);
  tl.to(elements.parts.cursor, { opacity: 0, duration: motion.duration.fast }, finish.at);
  tl.to(elements.controls, { opacity: CONTROLS_DIMMED, duration: motion.duration.base }, finish.at);
  tl.to(elements.halo, { opacity: 1, duration: motion.duration.base }, finish.at);
  tl.to(
    elements.tokens,
    { opacity: 1, y: 0, duration: motion.duration.fast + 0.15, stagger: TOKEN_STAGGER },
    finish.at + TOKEN_DELAY,
  );

  const fade = step('fadeOut');
  tl.to([elements.content, ...elements.tokens], { opacity: 0, duration: fade.duration, ease: 'none' }, fade.at);
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
  const renderer = createCanvasRenderer(elements.parts);
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
