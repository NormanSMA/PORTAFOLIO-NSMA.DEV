import { describe, it, expect } from 'vitest';
import {
  NODE_PASS_SECONDS,
  SAMPLE_FRAMES,
  WARMUP_FRAMES,
  createFrameMeter,
  decideQuality,
  driftAmount,
  easeNode,
  nodeProgress,
} from './heroTiming';

describe('easeNode', () => {
  it('fija los extremos y el punto medio', () => {
    expect(easeNode(0)).toBe(0);
    expect(easeNode(0.5)).toBeCloseTo(0.5);
    expect(easeNode(1)).toBeCloseTo(1);
  });

  it('es simétrica: lo que avanza al inicio lo recupera al final', () => {
    expect(easeNode(0.2) + easeNode(0.8)).toBeCloseTo(1);
  });
});

describe('nodeProgress', () => {
  it('recorre la curva de un extremo al otro en 5 s y vuelve', () => {
    expect(NODE_PASS_SECONDS).toBe(5);
    expect(nodeProgress(0)).toBe(0);
    expect(nodeProgress(2.5)).toBeCloseTo(0.5);
    expect(nodeProgress(5)).toBeCloseTo(1);
    expect(nodeProgress(7.5)).toBeCloseTo(0.5);
    expect(nodeProgress(10)).toBeCloseTo(0);
  });

  it('acelera suave en los extremos (ease in-out)', () => {
    expect(nodeProgress(0.3)).toBeLessThan(0.3 / NODE_PASS_SECONDS);
    expect(nodeProgress(NODE_PASS_SECONDS - 0.3)).toBeGreaterThan(1 - 0.3 / NODE_PASS_SECONDS);
  });

  it('se mantiene dentro de 0 y 1', () => {
    for (let seconds = 0; seconds < 40; seconds += 0.25) {
      const value = nodeProgress(seconds);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});

describe('driftAmount', () => {
  it('no mueve la curva mientras el canvas aparece sobre el póster', () => {
    expect(driftAmount(0)).toBe(0);
    expect(driftAmount(1.2)).toBe(0);
  });

  it('sube de forma gradual hasta el vaivén completo', () => {
    expect(driftAmount(2)).toBeGreaterThan(0);
    expect(driftAmount(2)).toBeLessThan(driftAmount(3));
    expect(driftAmount(4.2)).toBeCloseTo(1);
    expect(driftAmount(60)).toBe(1);
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

  it('retira el canvas si ya no queda escalón', () => {
    expect(decideQuality(30, false)).toBe('fallback');
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
