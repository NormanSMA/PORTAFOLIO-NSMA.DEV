import { describe, it, expect } from 'vitest';
import { techIcons } from './techIcons';

// surface-raised (32 32 44): the fill of the constellation chips.
const CHIP_CHANNELS = [32, 32, 44] as const;
const GRAPHIC_CONTRAST = 3;

function channelLuminance(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance([red, green, blue]: readonly number[]): number {
  return 0.2126 * channelLuminance(red) + 0.7152 * channelLuminance(green) + 0.0722 * channelLuminance(blue);
}

function hexChannels(hex: string): number[] {
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
}

function contrastOnChip(hex: string): number {
  const light = luminance(hexChannels(hex));
  const dark = luminance(CHIP_CHANNELS);
  return (light + 0.05) / (dark + 0.05);
}

describe('techIcons', () => {
  it('cada icono trae un trazo de simple-icons o un componente', () => {
    for (const [id, icon] of Object.entries(techIcons)) {
      expect(Boolean(icon.path) !== Boolean(icon.component), id).toBe(true);
    }
  });

  it('las marcas casi negras usan el token de texto y no su hex', () => {
    for (const id of ['nextjs', 'vercel', 'github'] as const) {
      expect(techIcons[id].color, id).toBe('rgb(var(--color-fg))');
    }
  });

  it('el wordmark de AWS se pinta con el token de texto para verse sobre fondo oscuro', () => {
    expect(techIcons.aws.className).toContain('[&>path]:fill-fg');
  });

  it('cada color de marca mantiene 3:1 sobre la ficha oscura', () => {
    for (const [id, icon] of Object.entries(techIcons)) {
      if (!icon.color.startsWith('#')) continue;
      expect(contrastOnChip(icon.color), id).toBeGreaterThanOrEqual(GRAPHIC_CONTRAST);
    }
  });
});
