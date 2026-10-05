// One curve through four nodes. Every number lives in scene units: a 320 x 200 box with a 20-unit grid, so the box
// and the grid share one ratio (16:10) and the box holds a whole number of cells on both axes.
export const SCENE_WIDTH = 320;
export const SCENE_HEIGHT = 200;
export const GRID_STEP = 20;

export interface Point {
  x: number;
  y: number;
}

export interface ControlPoint {
  anchor: Point;
  in: Point;
  out: Point;
}

// The two rows that nodes occupy, as guides. Row 0 is the upper one; they sit on grid lines.
export const ROW_Y = [60, 140] as const;
// Down, up, down, up. The pattern is point-symmetric about the center of the scene.
export const NODE_ROWS = [1, 0, 1, 0] as const;
export const NODE_SPACING = 80;
export const FIRST_NODE_X = 40;
export const CENTER_X = SCENE_WIDTH / 2;
export const GUIDE_REST_OPACITY = 0.25;

// Aligned nodes sit on grid points: equal spacing, two rows, symmetric.
export const ANCHORS: readonly Point[] = NODE_ROWS.map((row, index) => ({
  x: FIRST_NODE_X + index * NODE_SPACING,
  y: ROW_Y[row],
}));

// Horizontal handles of one length on every node: the curve leaves and enters each node flat.
export const HANDLE_LENGTH = 32;
const ALIGNED_VECTOR: Point = { x: HANDLE_LENGTH, y: 0 };

// The first state: fixed offsets, off the grid, with handles of different length and slant.
// The values are arbitrary on purpose and deterministic, so every cycle starts from the same mess.
export const DISORDERED_ANCHORS: readonly Point[] = [
  { x: 58, y: 54 },
  { x: 92, y: 124 },
  { x: 232, y: 70 },
  { x: 276, y: 150 },
];
const DISORDERED_VECTORS: readonly Point[] = [
  { x: 26, y: 12 },
  { x: 13, y: 22 },
  { x: 24, y: -20 },
  { x: 20, y: 14 },
];

// Where the pen enters the scene before it reaches the first node.
export const CURSOR_START: Point = { x: 14, y: 176 };

// How far each node has moved from its disordered place to its grid point: 0 is disordered, 1 is aligned.
export type NodeMix = readonly number[];
export const DISORDERED_MIX: NodeMix = [0, 0, 0, 0];
export const ALIGNED_MIX: NodeMix = [1, 1, 1, 1];

export function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

export function lerpPoint(from: Point, to: Point, amount: number): Point {
  return { x: lerp(from.x, to.x, amount), y: lerp(from.y, to.y, amount) };
}

export function anchorAt(index: number, amount: number): Point {
  return lerpPoint(DISORDERED_ANCHORS[index], ANCHORS[index], amount);
}

// Each node is smooth: the incoming handle mirrors the outgoing one.
export function controlPoints(mix: NodeMix): ControlPoint[] {
  return ANCHORS.map((_, index) => {
    const anchor = anchorAt(index, mix[index]);
    const vector = lerpPoint(DISORDERED_VECTORS[index], ALIGNED_VECTOR, mix[index]);
    return {
      anchor,
      in: { x: anchor.x - vector.x, y: anchor.y - vector.y },
      out: { x: anchor.x + vector.x, y: anchor.y + vector.y },
    };
  });
}

function format(point: Point): string {
  return `${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
}

// One cubic segment per pair of neighbouring nodes: out handle of the first, in handle of the second.
export function curvePath(points: readonly ControlPoint[]): string {
  const segments = points.slice(1).map((next, index) => {
    const previous = points[index];
    return `C${format(previous.out)} ${format(next.in)} ${format(next.anchor)}`;
  });
  return `M${format(points[0].anchor)}${segments.join('')}`;
}

// A handle line runs from the incoming handle through the node to the outgoing handle.
export function handlePath(point: ControlPoint): string {
  return `M${format(point.in)}L${format(point.anchor)}L${format(point.out)}`;
}

// The dots of the grid as zero-length subpaths: with round caps each one draws a dot, in scene units, so a node
// sitting on a grid point sits on a dot at any width.
export function gridDotsPath(): string {
  const dots: string[] = [];
  for (let y = 0; y <= SCENE_HEIGHT; y += GRID_STEP) {
    for (let x = 0; x <= SCENE_WIDTH; x += GRID_STEP) dots.push(`M${x} ${y}h0`);
  }
  return dots.join('');
}

// The same dots grouped in rings of equal distance from the center, nearest first, so the intro can light them in a wave
// with one element per ring instead of one per dot.
export function gridDotRings(): string[] {
  const rings = new Map<number, string[]>();
  for (let y = 0; y <= SCENE_HEIGHT; y += GRID_STEP) {
    for (let x = 0; x <= SCENE_WIDTH; x += GRID_STEP) {
      const distance = Math.hypot(x - CENTER_X, y - SCENE_HEIGHT / 2) / GRID_STEP;
      const ring = Math.round(distance * 2);
      rings.set(ring, [...(rings.get(ring) ?? []), `M${x} ${y}h0`]);
    }
  }
  return [...rings.entries()].sort(([a], [b]) => a - b).map(([, dots]) => dots.join(''));
}

// Where along the frame outline (top left, clockwise) each corner sits, from 0 to 1: the intro pops a corner as the
// drawn line reaches it.
export function frameCornerFractions(): number[] {
  const perimeter = 2 * (SCENE_WIDTH + SCENE_HEIGHT);
  return [0, SCENE_WIDTH, SCENE_WIDTH + SCENE_HEIGHT, 2 * SCENE_WIDTH + SCENE_HEIGHT].map((length) => length / perimeter);
}

export interface CurveTable {
  x: number[];
  y: number[];
  // Share of the total length at each sample, from 0 to 1.
  length: number[];
  // Share of the total length at each node, so the pulse can be timed to reach one exactly.
  stops: number[];
}

function cubic(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

const SAMPLES_PER_SEGMENT = 48;

// Samples the curve so the pulse can ride it without reading anything from the page.
export function sampleCurve(points: readonly ControlPoint[]): CurveTable {
  const x: number[] = [];
  const y: number[] = [];
  const cumulative: number[] = [];
  const stopIndexes: number[] = [0];
  let total = 0;

  points.slice(1).forEach((next, segment) => {
    const previous = points[segment];
    for (let step = segment === 0 ? 0 : 1; step <= SAMPLES_PER_SEGMENT; step += 1) {
      const t = step / SAMPLES_PER_SEGMENT;
      const px = cubic(previous.anchor.x, previous.out.x, next.in.x, next.anchor.x, t);
      const py = cubic(previous.anchor.y, previous.out.y, next.in.y, next.anchor.y, t);
      if (x.length > 0) total += Math.hypot(px - x[x.length - 1], py - y[y.length - 1]);
      x.push(px);
      y.push(py);
      cumulative.push(total);
    }
    stopIndexes.push(x.length - 1);
  });

  return {
    x,
    y,
    length: cumulative.map((value) => value / total),
    stops: stopIndexes.map((index) => cumulative[index] / total),
  };
}

export function pointAt(table: CurveTable, fraction: number): Point {
  const last = table.length.length - 1;
  if (fraction <= 0) return { x: table.x[0], y: table.y[0] };
  if (fraction >= 1) return { x: table.x[last], y: table.y[last] };

  let low = 0;
  let high = last;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (table.length[middle] <= fraction) low = middle;
    else high = middle;
  }
  const span = table.length[high] - table.length[low];
  const amount = span === 0 ? 0 : (fraction - table.length[low]) / span;
  return {
    x: lerp(table.x[low], table.x[high], amount),
    y: lerp(table.y[low], table.y[high], amount),
  };
}

// Percentages of the box written as container units, so a marker keeps its pixel size and follows the box at any width.
export function sceneTransform(point: Point): string {
  const x = (point.x / SCENE_WIDTH) * 100;
  const y = (point.y / SCENE_HEIGHT) * 100;
  return `translate(${x.toFixed(3)}cqw, ${y.toFixed(3)}cqh)`;
}
