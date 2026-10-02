import { describe, it, expect } from 'vitest';
import { stack, stackRanges, stackTop } from './stack';

describe('stackTop', () => {
  it('sube cada tarjeta un escalon sobre la altura de la navbar', () => {
    expect(stackTop(0)).toBe(`calc(${stack.top}rem + 0 * ${stack.step}rem)`);
    expect(stackTop(2)).toBe(`calc(${stack.top}rem + 2 * ${stack.step}rem)`);
  });
});

describe('stackRanges', () => {
  const metrics = { heights: [200, 240, 220], tops: [80, 92, 104], gap: 24 };

  it('genera un tramo por cada tarjeta que queda cubierta', () => {
    expect(stackRanges(metrics)).toHaveLength(2);
    expect(stackRanges({ heights: [200], tops: [80], gap: 24 })).toEqual([]);
  });

  it('empieza cuando la siguiente toca el borde inferior de la anterior y acaba en su posicion fija', () => {
    const [first] = stackRanges(metrics);

    // La segunda tarjeta nace a 200 + 24 px del inicio de la lista.
    expect(first.start).toBe('top+=224 280px');
    expect(first.end).toBe('top+=224 92px');
  });

  it('acumula alturas y huecos para las tarjetas siguientes', () => {
    const [, second] = stackRanges(metrics);

    expect(second.start).toBe('top+=488 332px');
    expect(second.end).toBe('top+=488 104px');
  });
});
