import {
  ALIGNED_MIX,
  CURSOR_START,
  DISORDERED_MIX,
  controlPoints,
  curvePath,
  handlePath,
  pointAt,
  sceneTransform,
  type CurveTable,
  type Point,
} from './canvasGeometry';

// Everything that changes by geometry. GSAP tweens these numbers; the renderer turns them into DOM writes.
export interface CanvasState {
  // Per node, how far it has moved from its disordered place to its grid point, 0 to 1.
  mix: number[];
  // Share of the aligned curve the pulse has covered.
  pulse: number;
  cursor: Point;
}

export function initialState(): CanvasState {
  return { mix: [...DISORDERED_MIX], pulse: 0, cursor: { ...CURSOR_START } };
}

// Aligned nodes, no pulse, no cursor: what the page shows without motion.
export function finalState(): CanvasState {
  return { mix: [...ALIGNED_MIX], pulse: 0, cursor: { ...CURSOR_START } };
}

// GSAP holds references to `mix` and `cursor`, so a reset writes into them instead of replacing them.
export function assignState(target: CanvasState, source: CanvasState): void {
  source.mix.forEach((value, index) => {
    target.mix[index] = value;
  });
  target.pulse = source.pulse;
  target.cursor.x = source.cursor.x;
  target.cursor.y = source.cursor.y;
}

export interface CanvasParts {
  // Edge and core share one shape.
  curves: SVGPathElement[];
  // The lit copy of the aligned curve that the pulse leaves behind, drawn with a dash offset.
  trails: SVGPathElement[];
  handleLines: SVGPathElement[];
  // In and out dot of each node, in node order.
  handleDots: HTMLElement[];
  nodes: HTMLElement[];
  pulse: HTMLElement;
  cursor: HTMLElement;
}

export interface CanvasRenderer {
  render(state: CanvasState): void;
}

// Skipping an identical write keeps a still frame, and the nodes that are not moving, free of style and attribute changes.
function remember<T>(slots: T[], index: number, value: T): boolean {
  if (slots[index] === value) return false;
  slots[index] = value;
  return true;
}

// `aligned` is the sampled aligned curve: the pulse rides it, which is the shape the curve has once the nodes are placed.
export function createCanvasRenderer(parts: CanvasParts, aligned: CurveTable): CanvasRenderer {
  const shape: string[] = [];
  const dash: string[] = [];
  const lines: string[] = [];
  const dots: string[] = [];
  const nodes: string[] = [];
  const placed: string[] = [];

  return {
    render(state) {
      const points = controlPoints(state.mix);

      if (remember(shape, 0, curvePath(points))) {
        parts.curves.forEach((curve) => curve.setAttribute('d', shape[0]));
      }

      const offset = (1 - state.pulse).toFixed(4);
      if (remember(dash, 0, offset)) {
        parts.trails.forEach((trail) => trail.style.setProperty('stroke-dashoffset', offset));
      }

      points.forEach((point, index) => {
        const line = handlePath(point);
        if (remember(lines, index, line)) parts.handleLines[index].setAttribute('d', line);

        const node = sceneTransform(point.anchor);
        if (remember(nodes, index, node)) parts.nodes[index].style.transform = node;

        [point.in, point.out].forEach((side, sideIndex) => {
          const slot = index * 2 + sideIndex;
          const place = sceneTransform(side);
          if (remember(dots, slot, place)) parts.handleDots[slot].style.transform = place;
        });
      });

      const pulse = sceneTransform(pointAt(aligned, state.pulse));
      const cursor = sceneTransform(state.cursor);
      if (remember(placed, 0, pulse)) parts.pulse.style.transform = pulse;
      if (remember(placed, 1, cursor)) parts.cursor.style.transform = cursor;
    },
  };
}
