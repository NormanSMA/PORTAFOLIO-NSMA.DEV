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
  LABEL_RISE,
  resetScene,
  setLabelLit,
  setLit,
  type CanvasElements,
} from './canvasElements';
import type { CanvasRenderer, CanvasState } from './canvasRenderer';
import { NODE_NUMBERS, buildSchedule, stepOf, type NodeNumber, type StepId } from './canvasSchedule';

const GUIDE_FLASH_OPACITY = 0.6;
const GUIDE_FLASH_SECONDS = 0.9;
const BURST_SECONDS = 1.2;
const BURST_SCALE = 2.6;
const SETTLE_SCALE = 1.2;
const SETTLE_SECONDS = 0.7;
const LABEL_SECONDS = 1.2;
// A node and its label stay lit for about a second after the pen or the pulse reaches them.
const LIT_SECONDS = 1;
const HANDLES_DIMMED = 0.3;
const CURSOR_FADE_SECONDS = 0.6;
const HANDLES_FADE_SECONDS = 1.2;
const HALO_SECONDS = 1.6;
const TRAIL_FADE_DELAY = 0.5;
const TRAIL_FADE_SECONDS = 1.2;
const PRESS_SCALE = 0.85;
const PULSE_FADE_SECONDS = 0.5;

// The loop that runs for good once the intro is done. Every motion is a slow, soft ease: nothing jumps.
export function buildCycle(elements: CanvasElements, state: CanvasState, renderer: CanvasRenderer) {
  const schedule = buildSchedule();
  const step = (id: StepId) => stepOf(schedule, id);
  const end = (id: StepId) => step(id).at + step(id).duration;
  const aligned = sampleCurve(controlPoints(ALIGNED_MIX));
  const soft = 'sine.inOut';
  const out = motion.ease.out.gsap;

  const tl = gsap.timeline({
    repeat: -1,
    paused: true,
    defaults: { ease: soft },
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
      { scale: BURST_SCALE, opacity: 0, duration: BURST_SECONDS, ease: out },
      at,
    );

  const light = (node: number, at: number) => {
    tl.call(() => {
      setLit(elements, node, true);
      setLabelLit(elements, node, true);
    }, undefined, at);
    tl.call(() => {
      setLit(elements, node, false);
      setLabelLit(elements, node, false);
    }, undefined, at + LIT_SECONDS);
  };

  // One node taken: the pen travels to it, it lights, the pen drags it onto its grid point and releases it with a snap.
  const place = (node: NodeNumber) => {
    const index = node - 1;
    const take = step(`take${node}`);
    const move = step(`move${node}`);
    const snap = step(`snap${node}`);
    const start = DISORDERED_ANCHORS[index];

    if (node > 1) {
      const travel = step(`travel${node as 2 | 3 | 4}`);
      tl.to(state.cursor, { x: start.x, y: start.y, duration: travel.duration }, travel.at);
    }
    tl.call(() => setLit(elements, index, true), undefined, take.at);
    fromTo(elements.cursorTip, { scale: PRESS_SCALE }, { scale: 1, duration: take.duration }, take.at);
    tl.to(
      state.mix,
      {
        [index]: 1,
        duration: move.duration,
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
      { opacity: GUIDE_REST_OPACITY, duration: GUIDE_FLASH_SECONDS, ease: out },
      snap.at,
    );
    burst(index, snap.at);
    fromTo(elements.boxes[index], { scale: SETTLE_SCALE }, { scale: 1, duration: SETTLE_SECONDS, ease: out }, snap.at);
    fromTo(
      elements.labels[index],
      { opacity: 0, y: LABEL_RISE },
      { opacity: 1, y: 0, duration: LABEL_SECONDS, ease: out },
      snap.at,
    );
    tl.call(() => setLit(elements, index, false), undefined, snap.at + LIT_SECONDS);
  };

  // The pulse crosses the nodes at constant speed, so each one and its label light at the moment the pulse reaches it.
  const flow = () => {
    const { at, duration } = step('flow');
    fromTo(elements.parts.pulse, { opacity: 0 }, { opacity: 1, duration: PULSE_FADE_SECONDS }, at);
    tl.to(state, { pulse: 1, duration, ease: 'none' }, at);
    aligned.stops.forEach((stop, index) => {
      const crossing = at + stop * duration;
      light(index, crossing);
      burst(index, crossing);
    });
    tl.to(elements.parts.pulse, { opacity: 0, duration: PULSE_FADE_SECONDS }, at + duration);
  };

  fromTo(elements.content, { opacity: 0 }, { opacity: 1, duration: step('fadeIn').duration }, 0);
  fromTo(elements.parts.cursor, { opacity: 0 }, { opacity: 1, duration: CURSOR_FADE_SECONDS }, step('approach').at);
  const first = DISORDERED_ANCHORS[0];
  tl.to(state.cursor, { x: first.x, y: first.y, duration: step('approach').duration }, step('approach').at);

  NODE_NUMBERS.forEach(place);

  // The nodes are placed: the pen leaves, the handles step back, the halo comes in, and the pulse runs.
  const relax = step('relax');
  tl.to(elements.parts.cursor, { opacity: 0, duration: CURSOR_FADE_SECONDS }, relax.at);
  tl.to(elements.handles, { opacity: HANDLES_DIMMED, duration: HANDLES_FADE_SECONDS }, relax.at);
  tl.to(elements.halo, { opacity: 1, duration: HALO_SECONDS }, relax.at);
  flow();

  tl.to(elements.parts.trails, { opacity: 0, duration: TRAIL_FADE_SECONDS }, end('tail') + TRAIL_FADE_DELAY);
  const fade = step('fadeOut');
  tl.to(elements.content, { opacity: 0, duration: fade.duration, ease: 'none' }, fade.at);
  return tl;
}
