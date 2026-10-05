import {
  CURSOR_START,
  FINISHED_MIX,
  controlPoints,
  curvePath,
  handlePath,
  lerpPoint,
  sceneTransform,
  type EditMix,
  type Point,
} from './canvasGeometry';

// Everything that changes by geometry. GSAP tweens these numbers; the renderer turns them into DOM writes.
export interface CanvasState extends EditMix {
  // Share of the curve already drawn.
  trace: number;
  // Per anchor, how far its handles have grown from the anchor, 0 to 1.
  reach: number[];
  cursor: Point;
}

export function initialState(): CanvasState {
  return { trace: 0, reach: [0, 0, 0, 0], second: 0, third: 0, cursor: { ...CURSOR_START } };
}

// The complete curve with every handle out: what the page shows without motion.
export function finalState(): CanvasState {
  return { trace: 1, reach: [1, 1, 1, 1], ...FINISHED_MIX, cursor: { ...CURSOR_START } };
}

// GSAP holds references to `reach` and `cursor`, so a reset writes into them instead of replacing them.
export function assignState(target: CanvasState, source: CanvasState): void {
  target.trace = source.trace;
  target.second = source.second;
  target.third = source.third;
  source.reach.forEach((value, index) => {
    target.reach[index] = value;
  });
  target.cursor.x = source.cursor.x;
  target.cursor.y = source.cursor.y;
}

export interface CanvasParts {
  // Core and edge share one shape and one dash.
  curves: SVGPathElement[];
  handleLines: SVGPathElement[];
  // In and out dot of each anchor, in anchor order.
  handleDots: HTMLElement[];
  cursor: HTMLElement;
}

export interface CanvasRenderer {
  render(state: CanvasState): void;
}

// Skipping an identical write keeps a still frame free of style and attribute changes.
function remember<T>(slots: T[], index: number, value: T): boolean {
  if (slots[index] === value) return false;
  slots[index] = value;
  return true;
}

export function createCanvasRenderer(parts: CanvasParts): CanvasRenderer {
  const curveShape: string[] = [];
  const dash: string[] = [];
  const lines: string[] = [];
  const dots: string[] = [];
  const dotVisibility: string[] = [];
  const cursorPlace: string[] = [];

  return {
    render(state) {
      const points = controlPoints(state);

      if (remember(curveShape, 0, curvePath(points))) {
        parts.curves.forEach((curve) => curve.setAttribute('d', curveShape[0]));
      }

      const offset = (1 - state.trace).toFixed(4);
      if (remember(dash, 0, offset)) {
        parts.curves.forEach((curve) => curve.style.setProperty('stroke-dashoffset', offset));
      }

      points.forEach((point, index) => {
        const reach = state.reach[index];
        const line = handlePath(point, reach);
        if (remember(lines, index, line)) parts.handleLines[index].setAttribute('d', line);

        const sides = [point.in, point.out];
        sides.forEach((side, sideIndex) => {
          const slot = index * 2 + sideIndex;
          const place = sceneTransform(lerpPoint(point.anchor, side, reach));
          if (remember(dots, slot, place)) parts.handleDots[slot].style.transform = place;
          // A dot sitting on its anchor would show before the anchor does.
          const visibility = reach > 0 ? 'visible' : 'hidden';
          if (remember(dotVisibility, slot, visibility)) parts.handleDots[slot].style.visibility = visibility;
        });
      });

      const cursor = sceneTransform(state.cursor);
      if (remember(cursorPlace, 0, cursor)) parts.cursor.style.transform = cursor;
    },
  };
}
