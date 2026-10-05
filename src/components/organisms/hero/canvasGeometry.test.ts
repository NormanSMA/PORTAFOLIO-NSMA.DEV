import { describe, it, expect } from 'vitest';
import {
  ALIGNED_MIX,
  ANCHORS,
  CENTER_X,
  CURSOR_START,
  DISORDERED_ANCHORS,
  DISORDERED_MIX,
  GRID_STEP,
  HANDLE_LENGTH,
  NODE_ROWS,
  NODE_SPACING,
  ROW_Y,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  controlPoints,
  curvePath,
  gridDotsPath,
  handlePath,
  pointAt,
  sampleCurve,
  sceneTransform,
} from './canvasGeometry';

const aligned = controlPoints(ALIGNED_MIX);
const disordered = controlPoints(DISORDERED_MIX);
const onGrid = (value: number) => value % GRID_STEP === 0;

describe('rejilla', () => {
  it('el paso de la rejilla divide exactamente el ancho y el alto de la escena', () => {
    expect(SCENE_WIDTH % GRID_STEP).toBe(0);
    expect(SCENE_HEIGHT % GRID_STEP).toBe(0);
  });

  it('la escena tiene la proporción 16:10 que usa la caja en pantalla', () => {
    expect(SCENE_WIDTH / SCENE_HEIGHT).toBe(16 / 10);
  });

  it('las cuatro esquinas del marco caen sobre puntos de la rejilla', () => {
    for (const x of [0, SCENE_WIDTH]) {
      for (const y of [0, SCENE_HEIGHT]) {
        expect(gridDotsPath()).toContain(`M${x} ${y}h0`);
      }
    }
  });

  it('dibuja un punto por cruce: 17 columnas por 11 filas', () => {
    expect(gridDotsPath().match(/h0/g)).toHaveLength((SCENE_WIDTH / GRID_STEP + 1) * (SCENE_HEIGHT / GRID_STEP + 1));
  });
});

describe('nodos alineados', () => {
  it('hay cuatro nodos con el mismo espaciado horizontal', () => {
    expect(ANCHORS).toHaveLength(4);
    const gaps = ANCHORS.slice(1).map((anchor, index) => anchor.x - ANCHORS[index].x);
    expect(gaps).toEqual([NODE_SPACING, NODE_SPACING, NODE_SPACING]);
  });

  it('ocupan solo dos filas y alternan abajo, arriba, abajo, arriba', () => {
    expect(new Set(ANCHORS.map((anchor) => anchor.y)).size).toBe(2);
    const [first, second, third, fourth] = ANCHORS;
    expect(first.y).toBeGreaterThan(second.y);
    expect(second.y).toBeLessThan(third.y);
    expect(third.y).toBeGreaterThan(fourth.y);
    expect(first.y).toBe(third.y);
    expect(second.y).toBe(fourth.y);
    expect(NODE_ROWS).toEqual([1, 0, 1, 0]);
  });

  it('las filas coinciden con las dos guías horizontales', () => {
    expect([...new Set(ANCHORS.map((anchor) => anchor.y))].sort((a, b) => a - b)).toEqual([...ROW_Y]);
  });

  it('son simétricos respecto al centro de la escena', () => {
    for (let index = 0; index < 2; index += 1) {
      const mirror = ANCHORS[ANCHORS.length - 1 - index];
      expect(ANCHORS[index].x + mirror.x).toBe(SCENE_WIDTH);
      expect(ANCHORS[index].y + mirror.y).toBe(SCENE_HEIGHT);
    }
  });

  it('cada nodo cae exactamente sobre un punto de la rejilla', () => {
    const dots = gridDotsPath();
    for (const { x, y } of ANCHORS) {
      expect(onGrid(x)).toBe(true);
      expect(onGrid(y)).toBe(true);
      expect(dots).toContain(`M${x} ${y}h0`);
    }
    expect(onGrid(CENTER_X)).toBe(true);
  });

  it('las manijas son horizontales, de igual longitud y simétricas', () => {
    for (const point of aligned) {
      expect(point.in.y).toBe(point.anchor.y);
      expect(point.out.y).toBe(point.anchor.y);
      expect(point.anchor.x - point.in.x).toBe(HANDLE_LENGTH);
      expect(point.out.x - point.anchor.x).toBe(HANDLE_LENGTH);
    }
  });

  it('las manijas caben dentro de la escena', () => {
    for (const point of aligned) {
      for (const p of [point.in, point.out]) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(SCENE_WIDTH);
      }
    }
  });

  it('la curva alineada pasa por el centro de la escena, donde cruza la guía vertical', () => {
    const middle = pointAt(sampleCurve(aligned), 0.5);
    expect(middle.x).toBeCloseTo(SCENE_WIDTH / 2, 0);
    expect(middle.y).toBeCloseTo(SCENE_HEIGHT / 2, 0);
  });
});

describe('desorden inicial', () => {
  it('ningún nodo está sobre un punto de la rejilla ni sobre una de las dos filas', () => {
    for (const { x, y } of DISORDERED_ANCHORS) {
      expect(onGrid(x)).toBe(false);
      expect(onGrid(y)).toBe(false);
      expect(ROW_Y).not.toContain(y);
    }
  });

  it('no tienen espaciado igual y siguen el orden de izquierda a derecha', () => {
    const gaps = DISORDERED_ANCHORS.slice(1).map((anchor, index) => anchor.x - DISORDERED_ANCHORS[index].x);
    expect(gaps.every((gap) => gap > 0)).toBe(true);
    expect(new Set(gaps).size).toBe(3);
  });

  it('las manijas tienen largos distintos y no son horizontales', () => {
    const lengths = disordered.map((point) => Math.hypot(point.out.x - point.anchor.x, point.out.y - point.anchor.y));
    expect(new Set(lengths.map((length) => length.toFixed(2))).size).toBe(4);
    expect(disordered.every((point) => point.out.y !== point.anchor.y)).toBe(true);
  });

  it('todo cabe en la escena, manijas y cursor incluidos', () => {
    for (const set of [disordered, aligned]) {
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
});

describe('acomodo', () => {
  it('con la mezcla a 0 los nodos están en el desorden y a 1 en su sitio', () => {
    disordered.forEach((point, index) => expect(point.anchor).toEqual(DISORDERED_ANCHORS[index]));
    aligned.forEach((point, index) => expect(point.anchor).toEqual(ANCHORS[index]));
  });

  it('mover un solo nodo no toca los demás', () => {
    const moved = controlPoints([1, 0, 0, 0]);
    expect(moved[0].anchor).toEqual(ANCHORS[0]);
    expect(moved[1]).toEqual(disordered[1]);
    expect(moved[3]).toEqual(disordered[3]);
  });

  it('con la mezcla a mitad el nodo queda entre el desorden y su sitio', () => {
    const half = controlPoints([0.5, 0.5, 0.5, 0.5]);
    half.forEach((point, index) => {
      expect(point.anchor.x).toBeCloseTo((DISORDERED_ANCHORS[index].x + ANCHORS[index].x) / 2);
      expect(point.anchor.y).toBeCloseTo((DISORDERED_ANCHORS[index].y + ANCHORS[index].y) / 2);
    });
  });

  it('cada manija sigue siendo espejo de la otra durante el movimiento', () => {
    for (const mix of [[0.3, 0.6, 0.1, 0.9], [1, 0.5, 0, 0.25]]) {
      for (const point of controlPoints(mix)) {
        expect(point.in.x + point.out.x).toBeCloseTo(2 * point.anchor.x);
        expect(point.in.y + point.out.y).toBeCloseTo(2 * point.anchor.y);
      }
    }
  });
});

describe('trazado', () => {
  it('genera un path con un M y tres cúbicas', () => {
    const d = curvePath(aligned);
    expect(d.match(/C/g)).toHaveLength(3);
    expect(d).toMatch(/^M[\d. C-]+$/);
  });

  it('cambia el path cuando cambia un nodo y no cuando no cambia', () => {
    expect(curvePath(disordered)).not.toBe(curvePath(aligned));
    expect(curvePath(controlPoints([...ALIGNED_MIX]))).toBe(curvePath(aligned));
  });

  it('la línea de manija pasa por el nodo', () => {
    const point = aligned[1];
    expect(handlePath(point)).toBe(
      `M${point.in.x.toFixed(2)} ${point.in.y.toFixed(2)}L${point.anchor.x.toFixed(2)} ${point.anchor.y.toFixed(2)}L${point.out.x.toFixed(2)} ${point.out.y.toFixed(2)}`,
    );
  });
});

describe('tabla de la curva', () => {
  const table = sampleCurve(aligned);

  it('las paradas van de 0 a 1 en orden creciente, una por nodo', () => {
    expect(table.stops).toHaveLength(4);
    expect(table.stops[0]).toBe(0);
    expect(table.stops[3]).toBeCloseTo(1);
    for (let index = 1; index < 4; index += 1) expect(table.stops[index]).toBeGreaterThan(table.stops[index - 1]);
  });

  it('en cada parada el punto es el nodo', () => {
    table.stops.forEach((stop, index) => {
      const p = pointAt(table, stop);
      expect(p.x).toBeCloseTo(ANCHORS[index].x, 0);
      expect(p.y).toBeCloseTo(ANCHORS[index].y, 0);
    });
  });

  it('la curva alineada es simétrica: las paradas de los extremos son espejo', () => {
    expect(table.stops[1] + table.stops[2]).toBeCloseTo(1, 2);
  });

  it('fuera de rango se queda en los extremos', () => {
    expect(pointAt(table, -1)).toEqual({ x: ANCHORS[0].x, y: ANCHORS[0].y });
    const end = pointAt(table, 2);
    expect(end.x).toBeCloseTo(ANCHORS[3].x);
    expect(end.y).toBeCloseTo(ANCHORS[3].y);
  });
});

describe('posición en la caja', () => {
  it('convierte la escena a unidades de contenedor sin leer el layout', () => {
    expect(sceneTransform({ x: 0, y: 0 })).toBe('translate(0.000cqw, 0.000cqh)');
    expect(sceneTransform({ x: SCENE_WIDTH / 2, y: SCENE_HEIGHT })).toBe('translate(50.000cqw, 100.000cqh)');
  });
});
