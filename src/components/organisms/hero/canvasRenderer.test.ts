import { describe, it, expect, vi } from 'vitest';
import { controlPoints, curvePath, FINISHED_MIX } from './canvasGeometry';
import {
  assignState,
  createCanvasRenderer,
  finalState,
  initialState,
  type CanvasParts,
} from './canvasRenderer';

const SVG = 'http://www.w3.org/2000/svg';

function makeParts(): CanvasParts {
  return {
    curves: [document.createElementNS(SVG, 'path'), document.createElementNS(SVG, 'path')],
    handleLines: Array.from({ length: 4 }, () => document.createElementNS(SVG, 'path')),
    handleDots: Array.from({ length: 8 }, () => document.createElement('span')),
    cursor: document.createElement('span'),
  };
}

describe('renderizador del lienzo', () => {
  it('pinta el estado final: curva completa, manijas visibles y trazo sin desplazamiento', () => {
    const parts = makeParts();
    createCanvasRenderer(parts).render(finalState());

    const expected = curvePath(controlPoints(FINISHED_MIX));
    parts.curves.forEach((curve) => {
      expect(curve.getAttribute('d')).toBe(expected);
      expect(Number(curve.style.getPropertyValue('stroke-dashoffset'))).toBe(0);
    });
    parts.handleDots.forEach((dot) => expect(dot.style.visibility).toBe('visible'));
  });

  it('en el estado inicial el trazo está oculto y las manijas no se ven', () => {
    const parts = makeParts();
    createCanvasRenderer(parts).render(initialState());

    parts.curves.forEach((curve) => {
      expect(Number(curve.style.getPropertyValue('stroke-dashoffset'))).toBe(1);
    });
    parts.handleDots.forEach((dot) => expect(dot.style.visibility).toBe('hidden'));
  });

  it('mover la mezcla de una manija reforma el path de la curva', () => {
    const parts = makeParts();
    const renderer = createCanvasRenderer(parts);
    const state = finalState();
    state.second = 0;
    renderer.render(state);
    const rough = parts.curves[0].getAttribute('d');
    state.second = 1;
    renderer.render(state);
    expect(parts.curves[0].getAttribute('d')).not.toBe(rough);
  });

  it('no repite escrituras cuando el estado no cambia', () => {
    const parts = makeParts();
    const renderer = createCanvasRenderer(parts);
    const state = finalState();
    renderer.render(state);

    const writes = vi.spyOn(parts.curves[0], 'setAttribute');
    const cursorWrites = vi.spyOn(parts.cursor.style, 'transform', 'set');
    renderer.render(state);
    expect(writes).not.toHaveBeenCalled();
    expect(cursorWrites).not.toHaveBeenCalled();
  });

  it('assignState copia en sitio para no soltar las referencias que tiene GSAP', () => {
    const target = finalState();
    const reach = target.reach;
    const cursor = target.cursor;
    assignState(target, initialState());
    expect(target.reach).toBe(reach);
    expect(target.cursor).toBe(cursor);
    expect(target.trace).toBe(0);
    expect(target.reach).toEqual([0, 0, 0, 0]);
  });
});
