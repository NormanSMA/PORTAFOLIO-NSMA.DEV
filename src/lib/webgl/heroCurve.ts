// One definition of the filament for the shader and the static poster, so both draw the same S.
export const HALF_LENGTH = 1.5;
export const AMPLITUDE = 0.36;

// World units that fit inside the stage box; the poster viewBox and the shader scale both derive from these.
export const WORLD_WIDTH = 3.4;
export const WORLD_HEIGHT = 2.2;

const POSTER_SEGMENTS = 64;

export function curveY(x: number): number {
  return AMPLITUDE * Math.sin((x * Math.PI) / HALF_LENGTH);
}

export function curveSlope(x: number): number {
  return AMPLITUDE * (Math.PI / HALF_LENGTH) * Math.cos((x * Math.PI) / HALF_LENGTH);
}

// SVG y grows downward, so the world y is negated.
export function curvePath(): string {
  const points = Array.from({ length: POSTER_SEGMENTS + 1 }, (_, index) => {
    const x = -HALF_LENGTH + (2 * HALF_LENGTH * index) / POSTER_SEGMENTS;
    return `${x.toFixed(4)} ${(-curveY(x)).toFixed(4)}`;
  });
  return `M${points.join(' L')}`;
}
