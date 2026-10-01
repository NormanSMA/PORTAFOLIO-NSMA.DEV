import { WORLD_HEIGHT, WORLD_WIDTH } from './heroCurve';

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type Point = readonly [number, number];

export interface Stage {
  // CSS pixels measured from the host's top-left corner.
  center: Point;
  // CSS pixels per world unit.
  unit: number;
  // The glow climbs from MIN_GLOW to full strength between these two points.
  ramp: { from: Point; to: Point };
}

// Glow floor and ramp length. The poster mask in HeroPoster repeats these two numbers.
export const MIN_GLOW = 0.12;
export const RAMP_SHARE = 0.35;

const BESIDE_TEXT_MAX_SHARE = 0.9;

// The stage box is the one defined in CSS by the poster, so layout stays in a single place.
export function computeStage(host: Box, stage: Box): Stage {
  const left = stage.left - host.left;
  const top = stage.top - host.top;
  const unit = Math.min(stage.width / WORLD_WIDTH, stage.height / WORLD_HEIGHT);
  // A stage narrower than the host sits beside the text and ramps along x; a full-width one sits below it and ramps along y.
  const besideText = stage.width < host.width * BESIDE_TEXT_MAX_SHARE;

  return {
    center: [left + stage.width / 2, top + stage.height / 2],
    unit,
    ramp: {
      from: [left, top],
      to: besideText
        ? [left + stage.width * RAMP_SHARE, top]
        : [left, top + stage.height * RAMP_SHARE],
    },
  };
}
