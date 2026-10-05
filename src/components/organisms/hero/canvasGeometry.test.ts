import { describe, it, expect } from 'vitest';
import {
  ANCHORS,
  CURSOR_START,
  FINISHED_MIX,
  ROUGH_MIX,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  controlPoints,
  curvePath,
  handlePath,
  pointAt,
  sampleCurve,
  sceneTransform,
} from './canvasGeometry';

const finished = controlPoints(FINISHED_MIX);
const rough = controlPoints(ROUGH_MIX);

describe('anclajes y manijas', () => {
  it('hay cuatro anclajes ordenados de izquierda a derecha', () => {
    expect(ANCHORS).toHaveLength(4);
    const xs = ANCHORS.map((anchor) => anchor.x);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
  });

  it('cada anclaje tiene dos manijas y la entrante es el espejo de la saliente', () => {
    for (const point of finished) {
      expect(point.in.x + point.out.x).toBeCloseTo(2 * point.anchor.x);
      expect(point.in.y + point.out.y).toBeCloseTo(2 * point.anchor.y);
    }
  });

  it('todo cabe en la escena, manijas incluidas', () => {
    for (const set of [finished, rough]) {
      for (const point of set) {
        for (const p of [point.anchor, point.in, point.out]) {
          expect(p.x).toBeGreaterThanOrEqual(0);
          expect(p.x).toBeLessThanOrEqual(SCENE_WIDTH);
          expect(p.y).toBeGreaterThanOrEqual(0);
          expect(p.y).toBeLessThanOrEqual(SCENE_HEIGHT);
        }
      }
    }
    expect(CURSOR_START.x).toBeLessThan(SCENE_WIDTH);
    expect(CURSOR_START.y).toBeLessThan(SCENE_HEIGHT);
  });

  it('la curva final es una S simétrica respecto al centro de la escena', () => {
    const [first, second, third, fourth] = finished;
    expect(first.anchor.x + fourth.anchor.x).toBeCloseTo(SCENE_WIDTH);
    expect(first.anchor.y + fourth.anchor.y).toBeCloseTo(SCENE_HEIGHT);
    expect(second.anchor.x + third.anchor.x).toBeCloseTo(SCENE_WIDTH);
    expect(second.anchor.y + third.anchor.y).toBeCloseTo(SCENE_HEIGHT);
    expect(second.anchor.y).toBeGreaterThan(first.anchor.y);
    expect(third.anchor.y).toBeLessThan(first.anchor.y);
  });

  it('la edición solo mueve las manijas de los dos anclajes centrales', () => {
    expect(rough[0]).toEqual(finished[0]);
    expect(rough[3]).toEqual(finished[3]);
    expect(rough[1].out).not.toEqual(finished[1].out);
    expect(rough[2].in).not.toEqual(finished[2].in);
    expect(rough[1].anchor).toEqual(finished[1].anchor);
  });

  it('con la mezcla a mitad las manijas quedan entre la forma tosca y la final', () => {
    const half = controlPoints({ second: 0.5, third: 0.5 });
    expect(half[1].out.y).toBeCloseTo((rough[1].out.y + finished[1].out.y) / 2);
    expect(half[2].in.x).toBeCloseTo((rough[2].in.x + finished[2].in.x) / 2);
  });
});

describe('trazado', () => {
  it('genera un path con un M y tres cúbicas', () => {
    const d = curvePath(finished);
    expect(d.startsWith('M')).toBe(true);
    expect(d.match(/C/g)).toHaveLength(3);
    expect(d).toMatch(/^M[\d. C-]+$/);
  });

  it('cambia el path cuando cambian las manijas y no cuando no cambian', () => {
    expect(curvePath(rough)).not.toBe(curvePath(finished));
    expect(curvePath(controlPoints({ ...FINISHED_MIX }))).toBe(curvePath(finished));
  });

  it('la línea de manija pasa por el anclaje y crece con el alcance', () => {
    const point = finished[1];
    expect(handlePath(point, 0)).toBe(
      `M${point.anchor.x.toFixed(2)} ${point.anchor.y.toFixed(2)}L${point.anchor.x.toFixed(2)} ${point.anchor.y.toFixed(2)}L${point.anchor.x.toFixed(2)} ${point.anchor.y.toFixed(2)}`,
    );
    expect(handlePath(point, 1)).toContain(`${point.out.x.toFixed(2)} ${point.out.y.toFixed(2)}`);
  });
});

describe('tabla de la curva', () => {
  const table = sampleCurve(rough);

  it('las paradas van de 0 a 1 en orden creciente, una por anclaje', () => {
    expect(table.stops).toHaveLength(4);
    expect(table.stops[0]).toBe(0);
    expect(table.stops[3]).toBeCloseTo(1);
    expect(table.stops[1]).toBeGreaterThan(0);
    expect(table.stops[2]).toBeGreaterThan(table.stops[1]);
    expect(table.stops[3]).toBeGreaterThan(table.stops[2]);
  });

  it('en cada parada el punto es el anclaje', () => {
    table.stops.forEach((stop, index) => {
      const p = pointAt(table, stop);
      expect(p.x).toBeCloseTo(ANCHORS[index].x, 0);
      expect(p.y).toBeCloseTo(ANCHORS[index].y, 0);
    });
  });

  it('fuera de rango se queda en los extremos', () => {
    expect(pointAt(table, -1)).toEqual({ x: ANCHORS[0].x, y: ANCHORS[0].y });
    const end = pointAt(table, 2);
    expect(end.x).toBeCloseTo(ANCHORS[3].x);
    expect(end.y).toBeCloseTo(ANCHORS[3].y);
  });

  it('el punto avanza de izquierda a derecha en la forma final', () => {
    const final = sampleCurve(finished);
    const xs = [0.1, 0.3, 0.5, 0.7, 0.9].map((f) => pointAt(final, f).x);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
  });

  it('la curva final pasa por el centro de la escena, donde cruzan las guías', () => {
    const middle = pointAt(sampleCurve(finished), 0.5);
    expect(middle.x).toBeCloseTo(SCENE_WIDTH / 2, 0);
    expect(middle.y).toBeCloseTo(SCENE_HEIGHT / 2, 0);
  });
});

describe('posición en la caja', () => {
  it('convierte la escena a unidades de contenedor sin leer el layout', () => {
    expect(sceneTransform({ x: 0, y: 0 })).toBe('translate(0.000cqw, 0.000cqh)');
    expect(sceneTransform({ x: SCENE_WIDTH / 2, y: SCENE_HEIGHT })).toBe('translate(50.000cqw, 100.000cqh)');
  });
});
