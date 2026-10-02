import { describe, it, expect } from 'vitest';
import {
  CAMERA_DISTANCE,
  clamp,
  computeLayout,
  edgeOpacity,
  estimateVelocity,
  fibonacciSphere,
  interleave,
  LABEL_ROOM,
  maxExtent,
  nearestNeighbors,
  nodeOpacity,
  nodeScale,
  project,
  relaxVelocity,
  rotate,
  trackSample,
  type Vec3,
} from './constellationMath';

const length = ({ x, y, z }: Vec3) => Math.hypot(x, y, z);

describe('fibonacciSphere', () => {
  it('devuelve tantos puntos como nodos', () => {
    expect(fibonacciSphere(0)).toEqual([]);
    expect(fibonacciSphere(22)).toHaveLength(22);
  });

  it('deja todos los puntos sobre la esfera unitaria', () => {
    for (const point of fibonacciSphere(22)) {
      expect(length(point)).toBeCloseTo(1, 10);
    }
  });

  it('reparte las latitudes de arriba a abajo sin tocar los polos', () => {
    const heights = fibonacciSphere(22).map((point) => point.y);
    expect(heights[0]).toBeLessThan(1);
    expect(heights[21]).toBeGreaterThan(-1);
    expect([...heights].sort((a, b) => b - a)).toEqual(heights);
  });

  it('no deja un hemisferio vacio: el centro de masa queda cerca del origen', () => {
    const points = fibonacciSphere(22);
    const mean = (axis: keyof Vec3) => points.reduce((sum, point) => sum + point[axis], 0) / points.length;
    expect(Math.abs(mean('x'))).toBeLessThan(0.1);
    expect(Math.abs(mean('y'))).toBeLessThan(0.05);
    expect(Math.abs(mean('z'))).toBeLessThan(0.1);
  });
});

describe('rotate', () => {
  it('conserva la distancia al centro', () => {
    for (const point of fibonacciSphere(10)) {
      expect(length(rotate(point, 137, 14))).toBeCloseTo(1, 10);
    }
  });

  it('con yaw 0 y tilt 0 deja el punto donde estaba', () => {
    const point = { x: 0.3, y: -0.4, z: Math.sqrt(1 - 0.25) };
    const turned = rotate(point, 0, 0);
    expect(turned.x).toBeCloseTo(point.x, 10);
    expect(turned.y).toBeCloseTo(point.y, 10);
    expect(turned.z).toBeCloseTo(point.z, 10);
  });

  it('un cuarto de giro lleva el frente hacia la derecha', () => {
    const turned = rotate({ x: 0, y: 0, z: 1 }, 90, 0);
    expect(turned.x).toBeCloseTo(1, 10);
    expect(turned.z).toBeCloseTo(0, 10);
  });

  it('una vuelta completa devuelve la pose inicial', () => {
    const point = { x: 0.5, y: 0.5, z: Math.sqrt(0.5) };
    const turned = rotate(point, 360, 0);
    expect(turned.x).toBeCloseTo(point.x, 10);
    expect(turned.z).toBeCloseTo(point.z, 10);
  });

  it('la inclinacion no cambia el eje de giro: el yaw sigue girando alrededor de el', () => {
    const tilted = rotate({ x: 0, y: 1, z: 0 }, 75, 14);
    const other = rotate({ x: 0, y: 1, z: 0 }, 200, 14);
    expect(tilted.y).toBeCloseTo(other.y, 10);
    expect(tilted.z).toBeCloseTo(other.z, 10);
  });
});

describe('project', () => {
  it('el frente tiene profundidad 1 y el fondo 0', () => {
    expect(project({ x: 0, y: 0, z: 1 }).depth).toBe(1);
    expect(project({ x: 0, y: 0, z: -1 }).depth).toBe(0);
    expect(project({ x: 0, y: 0, z: 0 }).depth).toBe(0.5);
  });

  it('la perspectiva agranda lo cercano y achica lo lejano', () => {
    const near = project({ x: 0.5, y: 0, z: 0.5 });
    const far = project({ x: 0.5, y: 0, z: -0.5 });
    expect(near.x).toBeGreaterThan(0.5);
    expect(far.x).toBeLessThan(0.5);
  });

  it('en el plano medio no deforma', () => {
    const point = project({ x: 0.7, y: -0.2, z: 0 });
    expect(point.x).toBeCloseTo(0.7, 10);
    expect(point.y).toBeCloseTo(-0.2, 10);
  });

  it('ningun punto de la esfera supera la extension maxima', () => {
    const limit = maxExtent();
    for (let degrees = 0; degrees < 360; degrees += 1) {
      const projected = project(rotate({ x: 0, y: 0, z: 1 }, degrees, 0));
      expect(Math.abs(projected.x)).toBeLessThanOrEqual(limit + 1e-9);
    }
    const widest = project(rotate({ x: 0, y: 0, z: 1 }, Math.acos(1 / CAMERA_DISTANCE) * (180 / Math.PI), 0));
    expect(widest.x).toBeCloseTo(limit, 6);
  });
});

describe('nearestNeighbors', () => {
  const points = fibonacciSphere(22);

  it('cada nodo queda unido al menos a sus k vecinos', () => {
    const edges = nearestNeighbors(points, 3);
    for (let index = 0; index < points.length; index += 1) {
      const links = edges.filter(([a, b]) => a === index || b === index).length;
      expect(links).toBeGreaterThanOrEqual(3);
    }
  });

  it('no repite pares ni une un nodo consigo mismo', () => {
    const edges = nearestNeighbors(points, 3);
    const keys = edges.map(([a, b]) => `${a}-${b}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const [a, b] of edges) {
      expect(a).toBeLessThan(b);
    }
  });

  it('elige de verdad a los mas cercanos', () => {
    const line: Vec3[] = [0, 1, 2, 10].map((x) => ({ x, y: 0, z: 0 }));
    expect(nearestNeighbors(line, 1)).toEqual(expect.arrayContaining([[0, 1], [1, 2], [2, 3]]));
    expect(nearestNeighbors(line, 1)).not.toContainEqual([0, 3]);
  });

  it('es determinista', () => {
    expect(nearestNeighbors(points, 3)).toEqual(nearestNeighbors(points, 3));
  });
});

describe('profundidad', () => {
  it('los nodos del frente son mas grandes y mas nitidos que los del fondo', () => {
    expect(nodeScale(1)).toBe(1);
    expect(nodeScale(0)).toBeLessThan(nodeScale(0.5));
    expect(nodeScale(0.5)).toBeLessThan(nodeScale(1));
    expect(nodeOpacity(1)).toBe(1);
    expect(nodeOpacity(0)).toBeLessThan(nodeOpacity(0.5));
    expect(nodeOpacity(0)).toBeGreaterThan(0);
  });

  it('las conexiones se apagan con la profundidad media de sus extremos', () => {
    expect(edgeOpacity(1, 1)).toBeGreaterThan(edgeOpacity(0.5, 0.5));
    expect(edgeOpacity(0.5, 0.5)).toBeGreaterThan(edgeOpacity(0, 0));
    expect(edgeOpacity(1, 0)).toBe(edgeOpacity(0, 1));
    expect(edgeOpacity(0, 0)).toBeGreaterThan(0);
  });

  it('cuantiza la opacidad para no reescribir el estilo en cada fotograma', () => {
    expect(nodeOpacity(0.6)).toBe(nodeOpacity(0.605));
  });
});

describe('interleave', () => {
  it('alterna entre las listas y conserva todos los elementos', () => {
    expect(interleave([['a1', 'a2', 'a3'], ['b1'], ['c1', 'c2']])).toEqual(['a1', 'b1', 'c1', 'a2', 'c2', 'a3']);
  });

  it('acepta listas vacias', () => {
    expect(interleave([])).toEqual([]);
    expect(interleave([[], []])).toEqual([]);
  });
});

describe('computeLayout', () => {
  it('escala la ficha con el ancho y la acota', () => {
    expect(computeLayout(200).nodeSize).toBe(34);
    expect(computeLayout(340).nodeSize).toBeCloseTo(44.2, 5);
    expect(computeLayout(800).nodeSize).toBe(64);
  });

  it('deja media ficha libre en cada borde y sitio para un nombre bajo la ultima fila', () => {
    for (const size of [260, 340, 480, 640]) {
      const { nodeSize, radius, centerX, centerY } = computeLayout(size);
      const reach = radius * maxExtent() + nodeSize / 2;
      expect(centerX - reach).toBeGreaterThanOrEqual(0);
      expect(centerX + reach).toBeLessThanOrEqual(size);
      expect(centerY - reach).toBeGreaterThanOrEqual(0);
      expect(centerY + reach + LABEL_ROOM).toBeLessThanOrEqual(size);
    }
  });

  it('centra la esfera en horizontal y la sube lo justo para dar sitio a los nombres', () => {
    const { size, centerX, centerY } = computeLayout(400);
    expect(centerX).toBe(size / 2);
    expect(centerY).toBeLessThan(size / 2);
    expect(size / 2 - centerY).toBeCloseTo(LABEL_ROOM / 2, 5);
  });

  it('sin ancho medido no dibuja ni arrastra', () => {
    const layout = computeLayout(0);
    expect(layout.radius).toBe(0);
    expect(layout.degreesPerPixel).toBe(0);
  });

  it('arrastrar mueve mas grados en una esfera pequena', () => {
    expect(computeLayout(260).degreesPerPixel).toBeGreaterThan(computeLayout(544).degreesPerPixel);
  });
});

describe('inercia', () => {
  it('estima la velocidad de los ultimos 100 ms', () => {
    const samples = trackSample(trackSample([], { time: 0, angle: 0 }), { time: 50, angle: 10 });
    expect(estimateVelocity(samples, 60)).toBeCloseTo(200, 5);
  });

  it('una pausa antes de soltar significa que el usuario se detuvo', () => {
    const samples = trackSample(trackSample([], { time: 0, angle: 0 }), { time: 50, angle: 10 });
    expect(estimateVelocity(samples, 140)).toBe(0);
  });

  it('descarta las muestras viejas', () => {
    const samples = trackSample(trackSample([], { time: 0, angle: 0 }), { time: 500, angle: 50 });
    expect(samples).toHaveLength(1);
  });

  it('la velocidad vuelve al ritmo de reposo sin depender de la tasa de fotogramas', () => {
    const oneStep = relaxVelocity(300, 9, 1 / 30);
    const twoSteps = relaxVelocity(relaxVelocity(300, 9, 1 / 60), 9, 1 / 60);
    expect(oneStep).toBeCloseTo(twoSteps, 10);
    expect(relaxVelocity(300, 9, 3)).toBeCloseTo(9, 0);
    expect(relaxVelocity(300, 0, 1)).toBeLessThan(20);
  });

  it('clamp acota el valor', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
  });
});
