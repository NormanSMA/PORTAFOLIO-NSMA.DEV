// The shader reads its palette from the design tokens at runtime, so a token change reaches the canvas.
export type Rgb = [number, number, number];

export interface HeroPalette {
  ink: Rgb;
  core: Rgb;
  inner: Rgb;
  halo: Rgb;
}

// Same values as src/styles/tokens.css; used only when a variable cannot be read.
const FALLBACK: Record<string, Rgb> = {
  ink: [10, 10, 15],
  fg: [255, 255, 255],
  'fg-muted': [180, 180, 184],
  'primary-500': [99, 102, 241],
  'secondary-100': [219, 234, 254],
  'secondary-400': [96, 165, 250],
  'secondary-500': [59, 130, 246],
};

const CHANNEL_MAX = 255;

// Token values are space separated channels such as "99 102 241".
export function parseChannels(raw: string): Rgb | null {
  const parts = raw.trim().split(/\s+/).map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null;
  return [parts[0], parts[1], parts[2]];
}

export function mixRgb(from: Rgb, to: Rgb, amount: number): Rgb {
  return [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount,
    from[2] + (to[2] - from[2]) * amount,
  ];
}

function normalize(rgb: Rgb): Rgb {
  return [rgb[0] / CHANNEL_MAX, rgb[1] / CHANNEL_MAX, rgb[2] / CHANNEL_MAX];
}

export function readHeroPalette(root: Element = document.documentElement): HeroPalette {
  const styles = getComputedStyle(root);
  const token = (name: string): Rgb =>
    parseChannels(styles.getPropertyValue(`--color-${name}`)) ?? FALLBACK[name];

  // Cool white core: foreground pulled slightly toward the blue scale. One accent hue only, indigo into blue.
  const core = mixRgb(mixRgb(token('fg'), token('fg-muted'), 0.3), token('secondary-100'), 0.2);
  const inner = mixRgb(token('secondary-400'), core, 0.25);
  const halo = mixRgb(token('primary-500'), token('secondary-500'), 0.5);

  return {
    ink: normalize(token('ink')),
    core: normalize(core),
    inner: normalize(inner),
    halo: normalize(halo),
  };
}
