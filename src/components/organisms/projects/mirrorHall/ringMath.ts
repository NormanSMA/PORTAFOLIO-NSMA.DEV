// Pure geometry and physics for the card ring. Angles are degrees of rotateY applied to the ring:
// card i sits at i * step, so it faces the viewer when (rotation + i * step) is a multiple of 360.

export const FULL_TURN = 360;
const RADIANS_PER_DEGREE = Math.PI / 180;

export const TILT_DEGREES = -8;
export const SPRING = { stiffness: 60, damping: 20 } as const;

const MAX_SUBSTEP_SECONDS = 1 / 120;
const SETTLE_ANGLE = 0.05;
const SETTLE_VELOCITY = 0.1;

const MIN_OPACITY = 0.25;
const MAX_BLUR_PX = 4;
const BLUR_STEP_PX = 0.5;
const OPACITY_STEP = 0.01;
const DEPTH_STEP = 0.02;

const VELOCITY_WINDOW_MS = 100;
const VELOCITY_STALE_MS = 80;
const WHEEL_LINE_PX = 16;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function quantize(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function wrapIndex(index: number, count: number): number {
  return ((index % count) + count) % count;
}

// Maps to [-180, 180) so the shortest way around is the sign of the result.
export function wrapDegrees(degrees: number): number {
  return ((((degrees + 180) % FULL_TURN) + FULL_TURN) % FULL_TURN) - 180;
}

export function indexStep(count: number): number {
  return FULL_TURN / count;
}

// Subtracting from 0 keeps index 0 at +0 instead of -0.
export function rotationForIndex(index: number, count: number): number {
  return 0 - index * indexStep(count);
}

export function activeIndexFor(rotation: number, count: number): number {
  return wrapIndex(Math.round(-rotation / indexStep(count)), count);
}

export function shortestRotation(current: number, index: number, count: number): number {
  return current + wrapDegrees(rotationForIndex(index, count) - current);
}

// 1 when the card faces the viewer, 0 on the far side: the world Z of the card, normalized.
export function cardDepth(rotation: number, index: number, count: number): number {
  const angle = (rotation + index * indexStep(count)) * RADIANS_PER_DEGREE;
  return (Math.cos(angle) + 1) / 2;
}

export function depthOpacity(depth: number): number {
  return quantize(MIN_OPACITY + (1 - MIN_OPACITY) * depth, OPACITY_STEP);
}

// Stepped so the filter only changes a few times per turn instead of on every frame.
export function depthBlur(depth: number): number {
  return quantize((1 - depth) * MAX_BLUR_PX, BLUR_STEP_PX);
}

export function depthLevel(depth: number): number {
  return quantize(depth, DEPTH_STEP);
}

export interface RingLayout {
  cardWidth: number;
  cardHeight: number;
  radius: number;
  perspective: number;
  stageHeight: number;
  sceneOffset: number;
  floorCenter: number;
  floorRadiusX: number;
  floorRadiusY: number;
  degreesPerPixel: number;
}

// The original piece (330 px cards under a 1400 px perspective) is the reference shape; smaller cards scale it.
const REFERENCE_CARD_WIDTH = 330;
const REFERENCE_PERSPECTIVE = 1400;
const CARD_RATIO = 4 / 3;
// The projected front card is about 1.5 times its size, so 330 px would make the section taller than the viewport.
const MAX_CARD_WIDTH = 270;
// On a phone the front card fills the width at 200 px and the ring stops reading as a ring; 170 leaves a sliver of each neighbor.
const MIN_CARD_WIDTH = 170;
const CARD_WIDTH_SHARE = 0.5;
const MIN_GEOMETRY_COUNT = 3;
// Chord between neighbor centers, in card widths. The original ring (12 cards, R 640, 330 wide) was 1.0.
const NEIGHBOR_SPACING = 1.3;
// Radius over perspective: keeps the projected front card under 1.6 times its size.
const MAX_RADIUS_SHARE = 0.36;
// Card width over polygon side: under 1 so neighbors never intersect.
const POLYGON_FILL = 0.92;
const REFLECTION_REACH = 0.3;
const STAGE_PADDING = 16;
const FLOOR_MARGIN = 0.9;
const DRAG_GAIN = 1.6;

interface Projection {
  perspective: number;
}

// Screen Y (relative to the ring center) of a point of the ring after the tilt and the perspective.
function projectY(y: number, z: number, { perspective }: Projection): number {
  const tilt = TILT_DEGREES * RADIANS_PER_DEGREE;
  const tiltedY = y * Math.cos(tilt) - z * Math.sin(tilt);
  const tiltedZ = y * Math.sin(tilt) + z * Math.cos(tilt);
  return (tiltedY * perspective) / (perspective - tiltedZ);
}

export function computeLayout(containerWidth: number, count: number): RingLayout {
  const half = Math.PI / Math.max(count, MIN_GEOMETRY_COUNT);
  const baseWidth = clamp(containerWidth * CARD_WIDTH_SHARE, MIN_CARD_WIDTH, MAX_CARD_WIDTH);
  const perspective = REFERENCE_PERSPECTIVE * (baseWidth / REFERENCE_CARD_WIDTH);
  const radius = Math.min(
    (NEIGHBOR_SPACING * baseWidth) / (2 * Math.sin(half)),
    MAX_RADIUS_SHARE * perspective,
  );
  const cardWidth = Math.min(baseWidth, POLYGON_FILL * 2 * radius * Math.tan(half));
  const cardHeight = cardWidth * CARD_RATIO;
  const view = { perspective };

  const top = Math.min(projectY(-cardHeight / 2, radius, view), projectY(-cardHeight / 2, -radius, view));
  const bottom = projectY(cardHeight / 2 + cardHeight * REFLECTION_REACH, radius, view);
  const floorRadius = radius + cardWidth * FLOOR_MARGIN;
  const floorFront = projectY(cardHeight / 2, floorRadius, view);
  const floorBack = projectY(cardHeight / 2, -floorRadius, view);
  const frontScale = perspective / (perspective - radius);

  return {
    cardWidth,
    cardHeight,
    radius,
    perspective,
    stageHeight: Math.ceil(bottom - top + STAGE_PADDING * 2),
    sceneOffset: -(top + bottom) / 2,
    floorCenter: (floorFront + floorBack) / 2,
    floorRadiusX: floorRadius * frontScale,
    floorRadiusY: (floorFront - floorBack) / 2,
    degreesPerPixel: (DRAG_GAIN * (1 / RADIANS_PER_DEGREE)) / (radius * frontScale),
  };
}

export interface SpringState {
  angle: number;
  velocity: number;
}

// Semi-implicit Euler in sub-steps: stable for any frame time, and overdamped (zeta 1.29) so it never overshoots.
export function stepSpring(state: SpringState, target: number, seconds: number): SpringState {
  const steps = Math.max(1, Math.ceil(seconds / MAX_SUBSTEP_SECONDS));
  const dt = seconds / steps;
  let { angle, velocity } = state;
  for (let step = 0; step < steps; step += 1) {
    velocity += (SPRING.stiffness * (target - angle) - SPRING.damping * velocity) * dt;
    angle += velocity * dt;
  }
  return { angle, velocity };
}

export function isSettled(state: SpringState, target: number): boolean {
  return Math.abs(target - state.angle) < SETTLE_ANGLE && Math.abs(state.velocity) < SETTLE_VELOCITY;
}

export interface AngleSample {
  time: number;
  angle: number;
}

export function trackSample(samples: AngleSample[], sample: AngleSample): AngleSample[] {
  return [...samples.filter((kept) => sample.time - kept.time <= VELOCITY_WINDOW_MS), sample];
}

// Degrees per second over the last 100 ms. A pause before release means the user stopped on purpose.
export function estimateVelocity(samples: AngleSample[], now: number): number {
  const recent = samples.filter((sample) => now - sample.time <= VELOCITY_WINDOW_MS);
  if (recent.length < 2) return 0;
  const first = recent[0];
  const last = recent[recent.length - 1];
  const seconds = (last.time - first.time) / 1000;
  if (now - last.time > VELOCITY_STALE_MS || seconds <= 0) return 0;
  return (last.angle - first.angle) / seconds;
}

interface WheelInput {
  deltaX: number;
  deltaY: number;
  deltaMode: number;
  shiftKey: boolean;
}

// Only horizontal scrolling or Shift+wheel rotates the ring; a plain vertical wheel returns 0 and goes to the page.
export function wheelDelta({ deltaX, deltaY, deltaMode, shiftKey }: WheelInput): number {
  const horizontal = Math.abs(deltaX) > Math.abs(deltaY);
  if (!horizontal && !shiftKey) return 0;
  const raw = horizontal ? deltaX : deltaY;
  return deltaMode === 1 ? raw * WHEEL_LINE_PX : raw;
}
