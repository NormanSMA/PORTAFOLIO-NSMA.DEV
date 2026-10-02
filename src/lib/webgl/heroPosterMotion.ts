import { HALF_LENGTH, curveSlope, curveY } from './heroCurve';
import { NODE_PASS_SECONDS, easeNode } from './heroTiming';

// Pure CSS for the poster, so the hero moves with no WebGL and no script: a breathing glow and a spark that
// travels the filament. Both sit behind prefers-reduced-motion, which leaves the poster still.
export const SWEEP_ANIMATION = 'hero-poster-sweep';
const PULSE_ANIMATION = 'hero-poster-pulse';

// Enough stops that straight segments between them hug the curve; the easing is baked into the stop spacing.
const SWEEP_STOPS = 32;
// The shader's pulse is 1 + 0.4 * sin(t * pi / 2): trough to peak takes 2 s. This is the poster's opacity at the trough.
const PULSE_HALF_PERIOD_SECONDS = 2;
const PULSE_TROUGH_OPACITY = 0.6;
// The shader dims the filament toward both ends; the spark fades the same way.
const END_DIM = 0.65;

function smoothstep(from: number, to: number, value: number): number {
  const progress = Math.min(Math.max((value - from) / (to - from), 0), 1);
  return progress * progress * (3 - 2 * progress);
}

// Position and heading along the curve at evenly spaced moments, with the node's own easing, so the spark and the
// canvas node move alike. SVG y grows downward, so the world y and slope are negated.
function sweepKeyframes(): string {
  const stops = Array.from({ length: SWEEP_STOPS + 1 }, (_, index) => {
    const share = index / SWEEP_STOPS;
    const x = (easeNode(share) - 0.5) * 2 * HALF_LENGTH;
    const opacity = 1 - END_DIM * smoothstep(0.7, 1, Math.abs(x) / HALF_LENGTH);
    const heading = (Math.atan(-curveSlope(x)) * 180) / Math.PI;
    const position = `translate(${x.toFixed(4)}px,${(-curveY(x)).toFixed(4)}px) rotate(${heading.toFixed(2)}deg)`;
    return `${(share * 100).toFixed(3)}%{transform:${position};opacity:${opacity.toFixed(3)}}`;
  });
  return `@keyframes ${SWEEP_ANIMATION}{${stops.join('')}}`;
}

// The spark has no resting position, so it stays hidden until the animation runs.
// [data-scene='live'] is set by the canvas once it covers the poster; nothing is gained by animating what is hidden.
export function posterMotionCss(): string {
  return [
    sweepKeyframes(),
    `@keyframes ${PULSE_ANIMATION}{from{opacity:${PULSE_TROUGH_OPACITY}}to{opacity:1}}`,
    '.hero-poster-spark{opacity:0}',
    '@media (prefers-reduced-motion:no-preference){',
    `.hero-poster-pulse{animation:${PULSE_ANIMATION} ${PULSE_HALF_PERIOD_SECONDS}s cubic-bezier(0.37,0,0.63,1) -${PULSE_HALF_PERIOD_SECONDS / 2}s infinite alternate}`,
    `.hero-poster-spark{animation:${SWEEP_ANIMATION} ${NODE_PASS_SECONDS}s linear infinite alternate}`,
    "[data-scene='live'] :is(.hero-poster-pulse,.hero-poster-spark){animation-play-state:paused}",
    '}',
  ].join('');
}

interface NamedAnimation extends Animation {
  animationName?: string;
}

// Seconds the spark animation has run. The canvas starts its clock here, so its node and pulse continue the poster's.
export function readPosterSeconds(stage: Pick<Element, 'getAnimations'>): number {
  if (typeof stage.getAnimations !== 'function') return 0;
  const sweep = (stage.getAnimations({ subtree: true }) as NamedAnimation[]).find(
    (animation) => animation.animationName === SWEEP_ANIMATION,
  );
  return typeof sweep?.currentTime === 'number' ? sweep.currentTime / 1000 : 0;
}
