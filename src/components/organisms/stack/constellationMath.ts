// Pure geometry and motion math for the tech constellation. Nodes live on a unit sphere that spins
// around a tilted vertical axis; the screen shows a perspective projection of it.

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// x and y are in unit-sphere radii; depth runs from 0 (far side) to 1 (facing the viewer).
export interface Projected {
  x: number;
  y: number;
  depth: number;
}

export type Edge = readonly [number, number];

const RADIANS_PER_DEGREE = Math.PI / 180;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export const TILT_DEGREES = 14;
export const CAMERA_DISTANCE = 3.2;
export const FULL_TURN = 360;

const MIN_NODE_SCALE = 0.62;
const MIN_NODE_OPACITY = 0.3;
const OPACITY_STEP = 0.02;
const MIN_EDGE_OPACITY = 0.05;
const MAX_EDGE_OPACITY = 0.55;

const VELOCITY_WINDOW_MS = 100;
const VELOCITY_STALE_MS = 80;
// Speed closes about 95 % of its gap to the target in 0.75 s, so a fling fades out in roughly that time.
const RELAX_RATE = 4;

const NODE_SHARE = 0.15;
const MIN_NODE_SIZE = 36;
const MAX_NODE_SIZE = 64;
const EDGE_PADDING = 2;
// Drag moves the front of the sphere about this many times the pointer distance.
const DRAG_GAIN = 1.2;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function quantize(value: number, step: number): number {
  return Math.round(value / step) * step;
}

// Points spread evenly on a unit sphere: one per latitude slice, each turned by the golden angle.
export function fibonacciSphere(count: number): Vec3[] {
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - ((index + 0.5) / count) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * index;
    return { x: Math.cos(theta) * ring, y, z: Math.sin(theta) * ring };
  });
}

// Yaw spins the sphere around its vertical axis; tilt then leans that axis toward the viewer.
export function rotate({ x, y, z }: Vec3, yawDegrees: number, tiltDegrees: number): Vec3 {
  const yaw = yawDegrees * RADIANS_PER_DEGREE;
  const tilt = tiltDegrees * RADIANS_PER_DEGREE;
  const turnedX = x * Math.cos(yaw) + z * Math.sin(yaw);
  const turnedZ = -x * Math.sin(yaw) + z * Math.cos(yaw);
  return {
    x: turnedX,
    y: y * Math.cos(tilt) - turnedZ * Math.sin(tilt),
    z: y * Math.sin(tilt) + turnedZ * Math.cos(tilt),
  };
}

export function project({ x, y, z }: Vec3, distance = CAMERA_DISTANCE): Projected {
  const factor = distance / (distance - z);
  return { x: x * factor, y: y * factor, depth: (z + 1) / 2 };
}

// The widest a point of the unit sphere can land from the center once the perspective stretches it.
export function maxExtent(distance = CAMERA_DISTANCE): number {
  return distance / Math.sqrt(distance * distance - 1);
}

function distanceSquared(a: Vec3, b: Vec3): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
}

// Each node links to its k closest neighbors; a pair that picks each other is drawn once.
export function nearestNeighbors(points: readonly Vec3[], k: number): Edge[] {
  const edges = new Map<string, Edge>();
  points.forEach((point, index) => {
    points
      .map((other, otherIndex) => ({ otherIndex, gap: distanceSquared(point, other) }))
      .filter(({ otherIndex }) => otherIndex !== index)
      .sort((a, b) => a.gap - b.gap)
      .slice(0, k)
      .forEach(({ otherIndex }) => {
        const edge: Edge = index < otherIndex ? [index, otherIndex] : [otherIndex, index];
        edges.set(`${edge[0]}-${edge[1]}`, edge);
      });
  });
  return [...edges.values()];
}

// Round-robin across the lists, so neighbors on the sphere come from different groups and the colors mix.
export function interleave<T>(lists: readonly (readonly T[])[]): T[] {
  const rows = Math.max(0, ...lists.map((list) => list.length));
  return Array.from({ length: rows }, (_, row) => lists.flatMap((list) => (row < list.length ? [list[row]] : []))).flat();
}

export function nodeScale(depth: number): number {
  return MIN_NODE_SCALE + (1 - MIN_NODE_SCALE) * depth;
}

// Stepped so the opacity style is rewritten a few times per turn instead of on every frame.
export function nodeOpacity(depth: number): number {
  return quantize(MIN_NODE_OPACITY + (1 - MIN_NODE_OPACITY) * depth, OPACITY_STEP);
}

export function edgeOpacity(depthA: number, depthB: number): number {
  const depth = (depthA + depthB) / 2;
  return quantize(MIN_EDGE_OPACITY + (MAX_EDGE_OPACITY - MIN_EDGE_OPACITY) * depth * depth, OPACITY_STEP);
}

export interface ConstellationLayout {
  size: number;
  nodeSize: number;
  radius: number;
  degreesPerPixel: number;
}

// The sphere radius leaves room for half a chip on every side, so no node leaves the square.
export function computeLayout(size: number): ConstellationLayout {
  const nodeSize = clamp(size * NODE_SHARE, MIN_NODE_SIZE, MAX_NODE_SIZE);
  const radius = Math.max(0, (size - nodeSize) / 2 - EDGE_PADDING) / maxExtent();
  const degreesPerPixel = radius > 0 ? DRAG_GAIN / radius / RADIANS_PER_DEGREE : 0;
  return { size, nodeSize, radius, degreesPerPixel };
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

// Eases the speed toward the target (the idle spin, or zero while paused); frame-rate independent.
export function relaxVelocity(velocity: number, target: number, seconds: number): number {
  return target + (velocity - target) * Math.exp(-RELAX_RATE * seconds);
}
