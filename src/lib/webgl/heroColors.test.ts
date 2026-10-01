import { describe, it, expect, afterEach } from 'vitest';
import { mixRgb, parseChannels, readHeroPalette } from './heroColors';

afterEach(() => {
  document.documentElement.removeAttribute('style');
});

describe('parseChannels', () => {
  it('lee canales separados por espacios', () => {
    expect(parseChannels('99 102 241')).toEqual([99, 102, 241]);
    expect(parseChannels(' 10  10 15 ')).toEqual([10, 10, 15]);
  });

  it('devuelve null con valores inválidos', () => {
    expect(parseChannels('')).toBeNull();
    expect(parseChannels('99 102')).toBeNull();
    expect(parseChannels('a b c')).toBeNull();
  });
});

describe('mixRgb', () => {
  it('interpola por canal', () => {
    expect(mixRgb([0, 100, 200], [100, 200, 0], 0.5)).toEqual([50, 150, 100]);
  });
});

describe('readHeroPalette', () => {
  it('usa los valores de respaldo cuando no hay variables', () => {
    const palette = readHeroPalette();
    expect(palette.ink[0]).toBeCloseTo(10 / 255);
    expect(palette.halo[2]).toBeGreaterThan(palette.halo[0]);
  });

  it('sigue las variables CSS de los tokens', () => {
    document.documentElement.style.setProperty('--color-ink', '0 0 0');
    document.documentElement.style.setProperty('--color-primary-500', '255 0 0');
    document.documentElement.style.setProperty('--color-secondary-500', '255 0 0');
    const palette = readHeroPalette();
    expect(palette.ink).toEqual([0, 0, 0]);
    expect(palette.halo).toEqual([1, 0, 0]);
  });

  it('mantiene todos los canales entre 0 y 1', () => {
    const palette = readHeroPalette();
    for (const color of Object.values(palette)) {
      for (const channel of color) {
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(1);
      }
    }
  });
});
