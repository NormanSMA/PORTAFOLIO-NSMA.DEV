import { describe, it, expect } from 'vitest';
import {
  SAMPLE_FRAMES,
  WARMUP_FRAMES,
  createFrameMeter,
  decideQuality,
  nodeProgress,
} from './heroTiming';

describe('nodeProgress', () => {
  it('recorre la curva de un extremo al otro en 6 s y vuelve', () => {
    expect(nodeProgress(0)).toBe(0);
    expect(nodeProgress(3)).toBeCloseTo(0.5);
    expect(nodeProgress(6)).toBeCloseTo(1);
    expect(nodeProgress(9)).toBeCloseTo(0.5);
    expect(nodeProgress(12)).toBeCloseTo(0);
  });

  it('acelera suave en los extremos (ease in-out)', () => {
    expect(nodeProgress(0.3)).toBeLessThan(0.3 / 6);
    expect(nodeProgress(5.7)).toBeGreaterThan(1 - 0.3 / 6);
  });

  it('se mantiene dentro de 0 y 1', () => {
    for (let seconds = 0; seconds < 40; seconds += 0.25) {
      const value = nodeProgress(seconds);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});

describe('decideQuality', () => {
  it('conserva la calidad con 24 ms o menos', () => {
    expect(decideQuality(16.7, true)).toBe('keep');
    expect(decideQuality(24, false)).toBe('keep');
  });

  it('baja un escalón si hay margen', () => {
    expect(decideQuality(30, true)).toBe('lower');
  });

  it('congela si ya no queda escalón', () => {
    expect(decideQuality(30, false)).toBe('freeze');
  });
});

describe('createFrameMeter', () => {
  it('ignora los fotogramas de calentamiento', () => {
    const meter = createFrameMeter();
    for (let index = 0; index < WARMUP_FRAMES; index += 1) {
      expect(meter.push(500)).toBeNull();
    }
    for (let index = 0; index < SAMPLE_FRAMES - 1; index += 1) {
      expect(meter.push(20)).toBeNull();
    }
    expect(meter.push(20)).toBe(20);
  });

  it('promedia la ventana y empieza otra', () => {
    const meter = createFrameMeter();
    for (let index = 0; index < WARMUP_FRAMES; index += 1) meter.push(0);
    for (let index = 0; index < SAMPLE_FRAMES - 1; index += 1) meter.push(10);
    expect(meter.push(70)).toBeCloseTo((10 * (SAMPLE_FRAMES - 1) + 70) / SAMPLE_FRAMES);
    expect(meter.push(10)).toBeNull();
  });

  it('reset vuelve a ignorar el calentamiento', () => {
    const meter = createFrameMeter();
    for (let index = 0; index < WARMUP_FRAMES + SAMPLE_FRAMES - 1; index += 1) meter.push(10);
    meter.reset();
    expect(meter.push(999)).toBeNull();
    for (let index = 1; index < WARMUP_FRAMES; index += 1) meter.push(999);
    for (let index = 0; index < SAMPLE_FRAMES - 1; index += 1) {
      expect(meter.push(10)).toBeNull();
    }
    expect(meter.push(10)).toBe(10);
  });
});
