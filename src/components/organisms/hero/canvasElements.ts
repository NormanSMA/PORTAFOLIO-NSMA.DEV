import { gsap } from '../../../lib/gsap';
import { GUIDE_REST_OPACITY } from './canvasGeometry';
import {
  assignState,
  finalState,
  initialState,
  type CanvasParts,
  type CanvasRenderer,
  type CanvasState,
} from './canvasRenderer';

// The pieces of the scene that the animation touches, collected once from the markup React rendered.
export interface CanvasElements {
  parts: CanvasParts;
  content: HTMLElement;
  halo: SVGElement;
  handles: Element[];
  // The two row guides, upper first, and the one down the center.
  guides: SVGLineElement[];
  centerGuide: SVGLineElement;
  frame: SVGRectElement;
  corners: HTMLElement[];
  dotRings: SVGPathElement[];
  boxes: HTMLElement[];
  bursts: HTMLElement[];
  labels: HTMLElement[];
  cursorTip: HTMLElement;
}

// How far a label rises while it fades in, in pixels.
export const LABEL_RISE = 4;
// The intro starts the guides away from their place and slides them in, in scene units.
export const GUIDE_SLIDE = 40;
export const CORNER_START_SCALE = 0.4;
// The curve and the frame are drawn with a dash on a path of normalized length 1. A hair past 1 hides the dash completely.
export const HIDDEN_DASH = 1.01;
const DASH_PATTERN = '1 2';
export const HANDLES_LIFTED = 1;
// The tip of the arrow sits 1.5 px inside its box; the press shrinks toward that point.
const CURSOR_TIP_ORIGIN = '1.5px 1.5px';

// GSAP rounds the length properties it tweens to whole numbers, which would turn a dash offset between 0 and 1 into
// a jump. The dash is written directly from the tweened number instead.
export function setDash(shapes: readonly SVGElement[], offset: number): void {
  shapes.forEach((shape) => {
    shape.style.setProperty('stroke-dasharray', DASH_PATTERN);
    shape.style.setProperty('stroke-dashoffset', offset.toFixed(4));
  });
}

export function clearDash(shapes: readonly SVGElement[]): void {
  shapes.forEach((shape) => {
    shape.style.removeProperty('stroke-dasharray');
    shape.style.removeProperty('stroke-dashoffset');
  });
}

function all<T extends Element>(root: Element, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

export function collectElements(root: HTMLElement): CanvasElements | null {
  const content = root.querySelector<HTMLElement>('[data-canvas-content]');
  const halo = root.querySelector<SVGElement>('[data-canvas-halo]');
  const pulse = root.querySelector<HTMLElement>('[data-canvas-pulse]');
  const cursor = root.querySelector<HTMLElement>('[data-canvas-cursor]');
  const cursorTip = root.querySelector<HTMLElement>('[data-canvas-cursor-tip]');
  const centerGuide = root.querySelector<SVGLineElement>('[data-canvas-center-guide]');
  const frame = root.querySelector<SVGRectElement>('[data-canvas-frame]');
  if (!content || !halo || !pulse || !cursor || !cursorTip || !centerGuide || !frame) return null;

  return {
    parts: {
      curves: all<SVGPathElement>(root, '[data-canvas-curve]'),
      trails: all<SVGPathElement>(root, '[data-canvas-trail]'),
      handleLines: all<SVGPathElement>(root, '[data-canvas-handle-line]'),
      handleDots: all<HTMLElement>(root, '[data-canvas-handle-dot]'),
      nodes: all<HTMLElement>(root, '[data-canvas-node]'),
      pulse,
      cursor,
    },
    content,
    halo,
    handles: all(root, '[data-canvas-handles]'),
    guides: all<SVGLineElement>(root, '[data-canvas-guide]'),
    centerGuide,
    frame,
    corners: all<HTMLElement>(root, '[data-canvas-corner]'),
    dotRings: all<SVGPathElement>(root, '[data-canvas-dot-ring]'),
    boxes: all<HTMLElement>(root, '[data-canvas-node-box]'),
    bursts: all<HTMLElement>(root, '[data-canvas-node-burst]'),
    labels: all<HTMLElement>(root, '[data-canvas-label]'),
    cursorTip,
  };
}

export function setLit(elements: CanvasElements, index: number, lit: boolean): void {
  elements.parts.nodes[index].dataset.active = String(lit);
}

export function setLabelLit(elements: CanvasElements, index: number, lit: boolean): void {
  elements.labels[index].dataset.lit = String(lit);
}

// Puts the cycle in its first frame: nodes in a mess, nothing else on screen but the artboard. It runs on build and on each loop.
export function resetScene(elements: CanvasElements, state: CanvasState, renderer: CanvasRenderer): void {
  assignState(state, initialState());
  renderer.render(state);
  gsap.set(elements.content, { opacity: 0 });
  gsap.set(elements.halo, { opacity: 0 });
  gsap.set(elements.handles, { opacity: HANDLES_LIFTED });
  gsap.set(elements.guides, { opacity: GUIDE_REST_OPACITY });
  gsap.set(elements.boxes, { scale: 1 });
  gsap.set(elements.bursts, { opacity: 0 });
  gsap.set(elements.labels, { opacity: 0, y: LABEL_RISE });
  gsap.set(elements.parts.trails, { opacity: 1 });
  gsap.set([elements.parts.pulse, elements.parts.cursor], { opacity: 0 });
  gsap.set(elements.cursorTip, { transformOrigin: CURSOR_TIP_ORIGIN });
  elements.parts.nodes.forEach((_, index) => {
    setLit(elements, index, false);
    setLabelLit(elements, index, false);
  });
}

// Puts the first run in its first frame: the artboard is not drawn yet, and the nodes, the handles and the curve are hidden
// inside a content layer that is already visible. It runs once, after resetScene.
export function resetIntro(elements: CanvasElements): void {
  gsap.set(elements.content, { opacity: 1 });
  setDash([elements.frame, ...elements.parts.curves], HIDDEN_DASH);
  gsap.set(elements.corners, { opacity: 0, scale: CORNER_START_SCALE });
  gsap.set(elements.dotRings, { opacity: 0 });
  gsap.set(elements.guides, { opacity: 0, y: GUIDE_SLIDE });
  gsap.set(elements.guides[1], { y: -GUIDE_SLIDE });
  gsap.set(elements.centerGuide, { opacity: 0, x: GUIDE_SLIDE });
  gsap.set(elements.parts.nodes, { opacity: 0 });
  gsap.set(elements.handles, { opacity: 0 });
}

// Back to the markup React rendered, which is the finished still frame. The wrappers that the renderer positions
// keep their transform; only what GSAP wrote is cleared.
export function restoreStill(elements: CanvasElements, renderer: CanvasRenderer): void {
  renderer.render(finalState());
  const faded = [
    elements.content,
    elements.halo,
    ...elements.handles,
    ...elements.guides,
    elements.centerGuide,
    ...elements.dotRings,
    ...elements.bursts,
    ...elements.labels,
    ...elements.parts.trails,
    ...elements.parts.nodes,
    elements.parts.pulse,
    elements.parts.cursor,
  ];
  gsap.set(faded, { clearProps: 'opacity' });
  gsap.set([...elements.guides, elements.centerGuide], { clearProps: 'transform' });
  clearDash([elements.frame, ...elements.parts.curves]);
  gsap.set(elements.corners, { clearProps: 'opacity,transform,scale' });
  gsap.set(elements.labels, { clearProps: 'transform' });
  gsap.set([...elements.boxes, elements.cursorTip], { clearProps: 'transform,scale,transformOrigin' });
  elements.parts.nodes.forEach((_, index) => {
    setLit(elements, index, false);
    setLabelLit(elements, index, false);
  });
}
