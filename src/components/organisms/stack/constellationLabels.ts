// Pure rules for the names next to the chips: where a name sits, how it fades with depth,
// and which chips earn one. Boxes are in pixels, relative to the square that holds the sphere.
import { clamp, quantize } from './constellationMath';

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export type Side = 'below' | 'above';

export interface LabelCandidate {
  index: number;
  depth: number;
  chip: Box;
  size: Size;
}

export interface LabelPlacement {
  side: Side;
  box: Box;
}

interface PickInput {
  candidates: readonly LabelCandidate[];
  // Side of the square that holds the sphere, in pixels: a name never leaves it.
  bounds: number;
  // Hovered or tapped chip: always named, and it claims its space first.
  active: number;
  // Chips named on the previous frame keep their name, and its side, so a drifting chip does not flicker or jump.
  previous: ReadonlyMap<number, LabelPlacement>;
}

export const MAX_LABELS = 6;
// A chip earns a name from this depth on, and keeps it down to MIN_LABEL_DEPTH - STICKY_DEPTH,
// where the fade reaches zero: a chip drifting across the limit never flickers.
export const MIN_LABEL_DEPTH = 0.66;
export const STICKY_DEPTH = 0.06;

const LABEL_FADE_END = 0.86;
const OPACITY_STEP = 0.05;
const GAP_PX = 4;
const MARGIN_PX = 2;
const SEPARATION_PX = 4;
// Chips this deep still read as objects, so a name must not cover them.
const OBSTACLE_DEPTH = 0.35;

// Centered under or over the chip; clamped sideways so the name is never cut.
export function placeLabel(chip: Box, label: Size, bounds: number, side: Side): Box {
  const centerX = chip.left + chip.width / 2;
  const left = clamp(centerX - label.width / 2, MARGIN_PX, bounds - label.width - MARGIN_PX);
  const top = side === 'below' ? chip.top + chip.height + GAP_PX : chip.top - GAP_PX - label.height;
  return { left, top, width: label.width, height: label.height };
}

// Zero where a named chip stops being named, full for the nearest chips, a straight ramp between.
export function labelOpacity(depth: number): number {
  const start = MIN_LABEL_DEPTH - STICKY_DEPTH;
  return quantize(clamp((depth - start) / (LABEL_FADE_END - start), 0, 1), OPACITY_STEP);
}

export function overlaps(a: Box, b: Box, padding = 0): boolean {
  return (
    a.left < b.left + b.width + padding &&
    b.left < a.left + a.width + padding &&
    a.top < b.top + b.height + padding &&
    b.top < a.top + a.height + padding
  );
}

const insideSquare = ({ top, height }: Box, bounds: number) => top >= 0 && top + height <= bounds;

function rank({ index, depth }: LabelCandidate, active: number, previous: ReadonlyMap<number, LabelPlacement>): number {
  if (index === active) return Infinity;
  return depth + (previous.has(index) ? STICKY_DEPTH : 0);
}

// The side it had last frame goes first, so a name only jumps when its side became impossible.
function sidesToTry(previous: Side | undefined): Side[] {
  return previous === 'above' ? ['above', 'below'] : ['below', 'above'];
}

// Greedy from the nearest chip outward: a name is kept only if it covers no other name and no visible chip.
export function pickLabels({ candidates, bounds, active, previous }: PickInput): Map<number, LabelPlacement> {
  const eligible = candidates
    .filter(({ index, depth }) => index === active || depth >= MIN_LABEL_DEPTH - (previous.has(index) ? STICKY_DEPTH : 0))
    .sort((a, b) => rank(b, active, previous) - rank(a, active, previous));
  const obstacles = candidates.filter(({ depth }) => depth >= OBSTACLE_DEPTH);
  const kept = new Map<number, LabelPlacement>();
  let named = 0;

  for (const candidate of eligible) {
    const forced = candidate.index === active;
    if (!forced && named >= MAX_LABELS) break;
    const { index, chip, size } = candidate;
    const boxes = sidesToTry(previous.get(index)?.side).map((side) => ({ side, box: placeLabel(chip, size, bounds, side) }));
    const fitting = boxes.filter(({ box }) => insideSquare(box, bounds));
    const free = fitting.find(({ box }) => {
      const coversName = [...kept.values()].some((other) => overlaps(other.box, box, SEPARATION_PX));
      const coversChip = obstacles.some((other) => other.index !== index && overlaps(other.chip, box));
      return !coversName && !coversChip;
    });
    const choice = free ?? (forced ? (fitting[0] ?? boxes[0]) : undefined);
    if (!choice) continue;
    kept.set(index, choice);
    if (!forced) named += 1;
  }
  return kept;
}
