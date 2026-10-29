import { motion } from '../../../config/motion';
import { gsap } from '../../../lib/gsap';
import { GUIDE_REST_OPACITY, frameCornerFractions } from './canvasGeometry';
import { HIDDEN_DASH, clearDash, setDash, type CanvasElements } from './canvasElements';
import { buildIntroSchedule, introLength, introStepOf, type IntroStepId } from './canvasSchedule';

const CORNER_SECONDS = 0.9;
const DOT_FADE_SECONDS = 0.9;
const GUIDE_SECONDS = 1.4;
const GUIDE_STAGGER = 0.2;
const NODE_FADE_SECONDS = 1;
const NODE_STAGGER = 0.3;
const HANDLES_FADE_SECONDS = 1.2;

// The run that plays once on load. The cycle takes over when it ends, with the content already on screen.
// Every motion is slow and soft; nothing here is a cut.
export function buildIntro(elements: CanvasElements, { frameDrawn = false }: { frameDrawn?: boolean } = {}) {
  const schedule = buildIntroSchedule(frameDrawn);
  const step = (id: IntroStepId) => introStepOf(schedule, id);
  const soft = 'sine.inOut';
  const out = motion.ease.out.gsap;

  // The frame and the curve are drawn by tweening these numbers; onUpdate turns them into dash offsets.
  const drawn = { frame: frameDrawn ? 0 : HIDDEN_DASH, curve: HIDDEN_DASH };
  let cleared = false;
  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: soft },
    onUpdate: () => {
      if (cleared) return;
      setDash([elements.frame], drawn.frame);
      setDash(elements.parts.curves, drawn.curve);
    },
  });

  // The frame draws with a steady hand and each corner appears as the line reaches it. After the page intro the frame
  // is already there, so it shows at once, in the place where the page intro's frame has just landed.
  const frame = step('frame');
  if (frameDrawn) {
    tl.set(elements.corners, { opacity: 1, scale: 1 }, 0);
  } else {
    tl.to(drawn, { frame: 0, duration: frame.duration, ease: 'none' }, frame.at);
    frameCornerFractions().forEach((fraction, index) => {
      tl.to(
        elements.corners[index],
        { opacity: 1, scale: 1, duration: CORNER_SECONDS, ease: out },
        frame.at + fraction * frame.duration,
      );
    });
  }

  // A slow wave from the center: the rings are ordered nearest first, so a stagger over them runs outward.
  const dots = step('dots');
  const waveSpan = dots.duration - DOT_FADE_SECONDS;
  tl.to(
    elements.dotRings,
    { opacity: 1, duration: DOT_FADE_SECONDS, ease: 'sine.out', stagger: { each: waveSpan / (elements.dotRings.length - 1) } },
    dots.at,
  );

  // The row guides slide in from the middle and the center guide from the side.
  const guides = step('guides');
  tl.to(
    [...elements.guides, elements.centerGuide],
    { opacity: GUIDE_REST_OPACITY, x: 0, y: 0, duration: GUIDE_SECONDS, ease: out, stagger: GUIDE_STAGGER },
    guides.at,
  );

  const nodes = step('nodes');
  tl.to(elements.parts.nodes, { opacity: 1, duration: NODE_FADE_SECONDS, stagger: NODE_STAGGER }, nodes.at);
  tl.to(elements.handles, { opacity: 1, duration: HANDLES_FADE_SECONDS }, step('handles').at);

  // The irregular curve is drawn through the nodes. Its dash is cleared at the end so the cycle redraws it freely.
  const curve = step('curve');
  tl.to(drawn, { curve: 0, duration: curve.duration }, curve.at);
  tl.call(
    () => {
      cleared = true;
      clearDash([elements.frame, ...elements.parts.curves]);
    },
    undefined,
    curve.at + curve.duration,
  );

  // A short pause lets the disorder be seen before the pen enters.
  tl.set({}, {}, introLength(schedule));
  return tl;
}
