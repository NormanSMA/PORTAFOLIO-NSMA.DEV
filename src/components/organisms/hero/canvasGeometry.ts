// The hero draws one Bezier curve with four anchors, the way a pen tool does. Every number lives in scene units:
// a 340 x 200 box, the same 17:10 ratio as the box on screen, so a point maps to a percentage without distortion.
export const SCENE_WIDTH = 340;
export const SCENE_HEIGHT = 200;

export interface Point {
  x: number;
  y: number;
}

export interface ControlPoint {
  anchor: Point;
  in: Point;
  out: Point;
}

// How far the two middle anchors have moved from the rough drag to the finished handles: 0 is rough, 1 is finished.
export interface EditMix {
  second: number;
  third: number;
}

// The S of the previous hero: it starts at mid height, dips to a valley, climbs to a hill and ends at mid height.
export const ANCHORS: readonly Point[] = [
  { x: 38, y: 100 },
  { x: 113, y: 160 },
  { x: 227, y: 40 },
  { x: 302, y: 100 },
];

// Each anchor is smooth: the incoming handle mirrors the outgoing one. These are the outgoing vectors.
// The rough set is what a first drag leaves; the finished set is the symmetric S that the edit phase reaches.
const ROUGH_VECTORS: readonly Point[] = [
  { x: 28, y: 23 },
  { x: 24, y: -10 },
  { x: 24, y: -10 },
  { x: 28, y: 23 },
];
const FINISHED_VECTORS: readonly Point[] = [
  { x: 28, y: 23 },
  { x: 32, y: 0 },
  { x: 32, y: 0 },
  { x: 28, y: 23 },
];

export const ROUGH_MIX: EditMix = { second: 0, third: 0 };
export const FINISHED_MIX: EditMix = { second: 1, third: 1 };

// The anchors whose handles the edit phase drags; the first and last keep the same handles throughout.
export const EDITED_ANCHORS = [1, 2] as const;

// Where the pen enters the scene before the first click.
export const CURSOR_START: Point = { x: 14, y: 176 };

export function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

export function lerpPoint(from: Point, to: Point, amount: number): Point {
  return { x: lerp(from.x, to.x, amount), y: lerp(from.y, to.y, amount) };
}

function mixFor(index: number, mix: EditMix): number {
  if (index === EDITED_ANCHORS[0]) return mix.second;
  if (index === EDITED_ANCHORS[1]) return mix.third;
  return 1;
}

export function handleVector(index: number, amount: number): Point {
  return lerpPoint(ROUGH_VECTORS[index], FINISHED_VECTORS[index], amount);
}

export function controlPoints(mix: EditMix): ControlPoint[] {
  return ANCHORS.map((anchor, index) => {
    const vector = handleVector(index, mixFor(index, mix));
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

// One cubic segment per pair of neighbouring anchors: out handle of the first, in handle of the second.
export function curvePath(points: readonly ControlPoint[]): string {
  const segments = points.slice(1).map((next, index) => {
    const previous = points[index];
    return `C${format(previous.out)} ${format(next.in)} ${format(next.anchor)}`;
  });
  return `M${format(points[0].anchor)}${segments.join('')}`;
}

// A handle line runs from the incoming handle through the anchor to the outgoing handle.
// `reach` pulls both handles toward the anchor, so 0 hides them and 1 shows them whole.
export function handlePath(point: ControlPoint, reach: number): string {
  const inner = lerpPoint(point.anchor, point.in, reach);
  const outer = lerpPoint(point.anchor, point.out, reach);
  return `M${format(inner)}L${format(point.anchor)}L${format(outer)}`;
}

export interface CurveTable {
  x: number[];
  y: number[];
  // Share of the total length at each sample, from 0 to 1.
  length: number[];
  // Share of the total length at each anchor, so the trace can stop exactly on one.
  stops: number[];
}

function cubic(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

const SAMPLES_PER_SEGMENT = 48;

// Samples the curve so the pen can ride the drawn tip without reading anything from the page.
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
