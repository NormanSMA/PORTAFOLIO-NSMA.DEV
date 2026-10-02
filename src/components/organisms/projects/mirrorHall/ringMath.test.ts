import { describe, it, expect } from 'vitest';
import {
  activeIndexFor,
  cardDepth,
  depthBlur,
  depthOpacity,
  estimateVelocity,
  isSettled,
  rotationForIndex,
  shortestRotation,
  stepSpring,
  trackSample,
  wheelDelta,
  wrapDegrees,
  wrapIndex,
} from './ringMath';

describe('indices y angulos', () => {
  it('wrapIndex envuelve en ambos sentidos', () => {
    expect(wrapIndex(7, 7)).toBe(0);
    expect(wrapIndex(-1, 7)).toBe(6);
    expect(wrapIndex(15, 7)).toBe(1);
  });

  it('wrapDegrees devuelve el rango [-180, 180)', () => {
    expect(wrapDegrees(190)).toBe(-170);
    expect(wrapDegrees(-190)).toBe(170);
    expect(wrapDegrees(720)).toBe(0);
    expect(wrapDegrees(-180)).toBe(-180);
  });

  it('rotationForIndex lleva la tarjeta al frente y no devuelve -0', () => {
    expect(rotationForIndex(0, 7)).toBe(0);
    expect(rotationForIndex(1, 4)).toBe(-90);
    expect(rotationForIndex(3, 12)).toBe(-90);
  });

  it('activeIndexFor elige la tarjeta mas cercana al angulo 0', () => {
    expect(activeIndexFor(0, 7)).toBe(0);
    expect(activeIndexFor(-51.43, 7)).toBe(1);
    expect(activeIndexFor(-25, 7)).toBe(0);
    expect(activeIndexFor(-27, 7)).toBe(1);
    expect(activeIndexFor(51.43, 7)).toBe(6);
    expect(activeIndexFor(-360 * 3 - 51.43, 7)).toBe(1);
  });

  it('shortestRotation toma el camino angular mas corto', () => {
    expect(shortestRotation(0, 1, 7)).toBeCloseTo(-360 / 7);
    expect(shortestRotation(0, 6, 7)).toBeCloseTo(360 / 7);
    expect(shortestRotation(-300, 0, 7)).toBeCloseTo(-360);
    expect(shortestRotation(350, 0, 7)).toBeCloseTo(360);
  });

  it('shortestRotation termina con la tarjeta pedida al frente', () => {
    for (let index = 0; index < 7; index += 1) {
      const target = shortestRotation(123.4, index, 7);
      expect(activeIndexFor(target, 7)).toBe(index);
      expect(Math.abs(target - 123.4)).toBeLessThanOrEqual(180);
    }
  });
});

describe('profundidad', () => {
  it('la tarjeta frontal tiene profundidad 1 y la trasera 0', () => {
    expect(cardDepth(0, 0, 4)).toBeCloseTo(1);
    expect(cardDepth(0, 2, 4)).toBeCloseTo(0);
    expect(cardDepth(0, 1, 4)).toBeCloseTo(0.5);
  });

  it('opacidad va de .25 a 1', () => {
    expect(depthOpacity(0)).toBeCloseTo(0.25);
    expect(depthOpacity(1)).toBeCloseTo(1);
    expect(depthOpacity(0.5)).toBeCloseTo(0.63, 1);
  });

  it('el desenfoque va de 0 a 4 px en pasos de .5', () => {
    expect(depthBlur(1)).toBe(0);
    expect(depthBlur(0)).toBe(4);
    for (const depth of [0.75, 0.5, 0.33, 0.12]) {
      expect((depthBlur(depth) * 2) % 1).toBe(0);
    }
  });

  it('no hay desenfoque con profundidad de 0.8 o mas: ni la frontal ni las vecinas', () => {
    for (const depth of [1, 0.99, 0.9, 0.81, 0.8]) {
      expect(depthBlur(depth), `depth ${depth}`).toBe(0);
    }
    // The neighbors of a ring of 7 sit at about 0.81.
    expect(depthBlur(cardDepth(0, 1, 7))).toBe(0);
    expect(depthBlur(0.79)).toBeGreaterThanOrEqual(0);
    expect(depthBlur(0.4)).toBeGreaterThan(0);
  });

  it('el desenfoque crece de forma monotona hacia el fondo del anillo', () => {
    let previous = -1;
    for (let depth = 1; depth >= 0; depth -= 0.05) {
      const blur = depthBlur(depth);
      expect(blur).toBeGreaterThanOrEqual(previous);
      previous = blur;
    }
  });
});

describe('resorte', () => {
  const run = (start: { angle: number; velocity: number }, target: number, seconds: number) => {
    let state = start;
    const frame = 1 / 60;
    const trace: number[] = [];
    for (let time = 0; time < seconds; time += frame) {
      state = stepSpring(state, target, frame);
      trace.push(state.angle);
    }
    return { state, trace };
  };

  it('converge al objetivo sin sobrepasarlo desde el reposo', () => {
    const { state, trace } = run({ angle: 0, velocity: 0 }, -51.4, 4);
    expect(isSettled(state, -51.4)).toBe(true);
    expect(Math.min(...trace)).toBeGreaterThanOrEqual(-51.4 - 1e-6);
  });

  it('con velocidad de lanzamiento recorre el objetivo sin rebotar', () => {
    const velocity = 400;
    const target = velocity * 0.4;
    const { state, trace } = run({ angle: 0, velocity }, target, 5);
    expect(isSettled(state, target)).toBe(true);
    expect(Math.max(...trace)).toBeLessThanOrEqual(target + 1e-6);
  });

  it('da el mismo resultado con un solo cuadro largo o varios cortos', () => {
    const long = stepSpring({ angle: 0, velocity: 0 }, 30, 0.1);
    let short = { angle: 0, velocity: 0 };
    for (let i = 0; i < 6; i += 1) short = stepSpring(short, 30, 0.1 / 6);
    expect(long.angle).toBeCloseTo(short.angle, 1);
  });

  it('isSettled exige posicion y velocidad bajas', () => {
    expect(isSettled({ angle: 9.99, velocity: 0 }, 10)).toBe(true);
    expect(isSettled({ angle: 9.99, velocity: 50 }, 10)).toBe(false);
    expect(isSettled({ angle: 5, velocity: 0 }, 10)).toBe(false);
  });
});

describe('velocidad del puntero', () => {
  it('estima grados por segundo con las muestras recientes', () => {
    const samples = [
      { time: 1000, angle: 0 },
      { time: 1050, angle: 5 },
      { time: 1100, angle: 10 },
    ];
    expect(estimateVelocity(samples, 1100)).toBeCloseTo(100);
  });

  it('devuelve 0 con una muestra o con una pausa antes de soltar', () => {
    expect(estimateVelocity([{ time: 0, angle: 0 }], 10)).toBe(0);
    const samples = [
      { time: 1000, angle: 0 },
      { time: 1050, angle: 10 },
    ];
    expect(estimateVelocity(samples, 1200)).toBe(0);
  });

  it('trackSample descarta muestras de mas de 100 ms', () => {
    let samples = [{ time: 0, angle: 0 }];
    samples = trackSample(samples, { time: 60, angle: 1 });
    samples = trackSample(samples, { time: 130, angle: 2 });
    expect(samples.map((sample) => sample.time)).toEqual([60, 130]);
  });
});

describe('wheelDelta', () => {
  const base = { deltaMode: 0, shiftKey: false };

  it('la rueda vertical se ignora para que pase a la pagina', () => {
    expect(wheelDelta({ ...base, deltaX: 0, deltaY: 120 })).toBe(0);
    expect(wheelDelta({ ...base, deltaX: 10, deltaY: 120 })).toBe(0);
  });

  it('el desplazamiento horizontal gira el anillo', () => {
    expect(wheelDelta({ ...base, deltaX: 40, deltaY: 5 })).toBe(40);
    expect(wheelDelta({ ...base, deltaX: -40, deltaY: 5 })).toBe(-40);
  });

  it('Shift con rueda vertical gira el anillo', () => {
    expect(wheelDelta({ ...base, shiftKey: true, deltaX: 0, deltaY: 100 })).toBe(100);
  });

  it('convierte lineas a pixeles', () => {
    expect(wheelDelta({ deltaMode: 1, shiftKey: false, deltaX: 3, deltaY: 0 })).toBe(48);
  });
});
