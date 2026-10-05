import { describe, it, expect, vi } from 'vitest';
import {
  ALIGNED_MIX,
  ANCHORS,
  controlPoints,
  curvePath,
  pointAt,
  sampleCurve,
  sceneTransform,
} from './canvasGeometry';
import {
  assignState,
  createCanvasRenderer,
  finalState,
  initialState,
  type CanvasParts,
} from './canvasRenderer';

const SVG = 'http://www.w3.org/2000/svg';
const aligned = sampleCurve(controlPoints(ALIGNED_MIX));

function makeParts(): CanvasParts {
  return {
    curves: [document.createElementNS(SVG, 'path'), document.createElementNS(SVG, 'path')],
    trails: [document.createElementNS(SVG, 'path')],
    handleLines: Array.from({ length: 4 }, () => document.createElementNS(SVG, 'path')),
    handleDots: Array.from({ length: 8 }, () => document.createElement('span')),
    nodes: Array.from({ length: 4 }, () => document.createElement('span')),
    pulse: document.createElement('span'),
    cursor: document.createElement('span'),
  };
}

describe('renderizador del lienzo', () => {
  it('pinta el estado final: curva alineada, nodos en su sitio y estela oculta', () => {
    const parts = makeParts();
    createCanvasRenderer(parts, aligned).render(finalState());

    const expected = curvePath(controlPoints(ALIGNED_MIX));
    parts.curves.forEach((curve) => expect(curve.getAttribute('d')).toBe(expected));
    expect(Number(parts.trails[0].style.getPropertyValue('stroke-dashoffset'))).toBe(1);
    parts.nodes.forEach((node, index) => expect(node.style.transform).toBe(sceneTransform(ANCHORS[index])));
  });

  it('en el estado inicial los nodos están desalineados y la curva es otra', () => {
    const parts = makeParts();
    const renderer = createCanvasRenderer(parts, aligned);
    renderer.render(finalState());
    const alignedShape = parts.curves[0].getAttribute('d');
    renderer.render(initialState());

    expect(parts.curves[0].getAttribute('d')).not.toBe(alignedShape);
    parts.nodes.forEach((node, index) => expect(node.style.transform).not.toBe(sceneTransform(ANCHORS[index])));
  });

  it('mover un nodo reforma el path y solo reescribe la posición de ese nodo', () => {
    const parts = makeParts();
    const renderer = createCanvasRenderer(parts, aligned);
    const state = initialState();
    renderer.render(state);
    const before = parts.curves[0].getAttribute('d');
    const untouched = parts.nodes.map((node) => node.style.transform);

    state.mix[1] = 1;
    renderer.render(state);
    expect(parts.curves[0].getAttribute('d')).not.toBe(before);
    expect(parts.nodes[1].style.transform).toBe(sceneTransform(ANCHORS[1]));
    [0, 2, 3].forEach((index) => expect(parts.nodes[index].style.transform).toBe(untouched[index]));
  });

  it('el pulso sigue la curva alineada y la estela avanza con él', () => {
    const parts = makeParts();
    const renderer = createCanvasRenderer(parts, aligned);
    const state = finalState();
    state.pulse = 0.5;
    renderer.render(state);

    expect(parts.pulse.style.transform).toBe(sceneTransform(pointAt(aligned, 0.5)));
    expect(Number(parts.trails[0].style.getPropertyValue('stroke-dashoffset'))).toBeCloseTo(0.5);
  });

  it('no repite escrituras cuando el estado no cambia', () => {
    const parts = makeParts();
    const renderer = createCanvasRenderer(parts, aligned);
    const state = finalState();
    renderer.render(state);

    const writes = vi.spyOn(parts.curves[0], 'setAttribute');
    const nodeWrites = vi.spyOn(parts.nodes[0].style, 'transform', 'set');
    const cursorWrites = vi.spyOn(parts.cursor.style, 'transform', 'set');
    renderer.render(state);
    expect(writes).not.toHaveBeenCalled();
    expect(nodeWrites).not.toHaveBeenCalled();
    expect(cursorWrites).not.toHaveBeenCalled();
  });

  it('assignState copia en sitio para no soltar las referencias que tiene GSAP', () => {
    const target = finalState();
    const mix = target.mix;
    const cursor = target.cursor;
    assignState(target, initialState());
    expect(target.mix).toBe(mix);
    expect(target.cursor).toBe(cursor);
    expect(target.mix).toEqual([0, 0, 0, 0]);
    expect(target.pulse).toBe(0);
  });
});
