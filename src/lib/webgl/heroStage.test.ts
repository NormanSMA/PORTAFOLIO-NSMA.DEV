import { describe, it, expect } from 'vitest';
import { computeStage } from './heroStage';

describe('computeStage', () => {
  it('escritorio: el filamento queda a la derecha y la rampa avanza en x', () => {
    const host = { left: 0, top: 0, width: 1440, height: 900 };
    const stage = { left: 576, top: 0, width: 864, height: 900 };
    const result = computeStage(host, stage);

    expect(result.center).toEqual([1008, 450]);
    expect(result.unit).toBeCloseTo(864 / 3.4);
    expect(result.ramp.from).toEqual([576, 0]);
    expect(result.ramp.to[0]).toBeGreaterThan(576);
    expect(result.ramp.to[1]).toBe(0);
  });

  it('móvil: el filamento queda abajo y la rampa avanza en y', () => {
    const host = { left: 0, top: 0, width: 375, height: 812 };
    const stage = { left: 0, top: 455, width: 375, height: 357 };
    const result = computeStage(host, stage);

    expect(result.center).toEqual([187.5, 633.5]);
    expect(result.unit).toBeCloseTo(375 / 3.4);
    expect(result.ramp.from).toEqual([0, 455]);
    expect(result.ramp.to[0]).toBe(0);
    expect(result.ramp.to[1]).toBeGreaterThan(455);
  });

  it('mide el stage desde la esquina del host', () => {
    const host = { left: 100, top: 40, width: 1000, height: 600 };
    const stage = { left: 500, top: 40, width: 600, height: 600 };
    expect(computeStage(host, stage).center).toEqual([700, 300]);
  });

  it('limita la escala por el lado más corto', () => {
    const host = { left: 0, top: 0, width: 1440, height: 400 };
    const stage = { left: 576, top: 0, width: 864, height: 400 };
    expect(computeStage(host, stage).unit).toBeCloseTo(400 / 2.2);
  });
});
