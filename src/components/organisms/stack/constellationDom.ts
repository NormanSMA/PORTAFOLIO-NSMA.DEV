import {
  clamp,
  edgeOpacity,
  nodeOpacity,
  nodeScale,
  project,
  rotate,
  TILT_DEGREES,
  type ConstellationLayout,
  type Edge,
  type Projected,
  type Vec3,
} from './constellationMath';

export interface ConstellationParts {
  nodes: HTMLElement[];
  lines: SVGLineElement[];
  label: HTMLElement;
}

interface Scene {
  points: readonly Vec3[];
  edges: readonly Edge[];
  names: readonly string[];
}

const ACTIVE_Z_INDEX = 1000;
const DIMMED_EDGE_FACTOR = 0.4;
const HOT_EDGE_OPACITY = 0.9;
const LABEL_GAP_PX = 6;
const LABEL_MARGIN_PX = 2;
// The SVG viewBox spans -50..50 so line coordinates are percentages of the square and need no resize handling.
const VIEWBOX_SPAN = 100;

const round = (value: number) => Math.round(value * 10) / 10;

// Imperative on purpose: the sphere moves every frame and React must not re-render for it.
// A style is touched only when its stepped value changes, so a frame mostly rewrites transforms.
export function createConstellationRenderer(scene: Scene, parts: ConstellationParts, getLayout: () => ConstellationLayout) {
  const { points, edges, names } = scene;
  const { nodes, lines, label } = parts;
  const writtenOpacity: number[] = [];
  const writtenZIndex: number[] = [];
  const writtenStroke: number[] = [];
  let projected: Projected[] = [];
  let active = -1;
  let labelSize = { width: 0, height: 0 };
  let lastYaw = 0;

  const writeNode = (index: number, layout: ConstellationLayout) => {
    const { x, y, depth } = projected[index];
    const half = layout.nodeSize / 2;
    const node = nodes[index];
    const isActive = index === active;
    const left = round(layout.size / 2 + x * layout.radius - half);
    const top = round(layout.size / 2 + y * layout.radius - half);
    node.style.transform = `translate3d(${left}px, ${top}px, 0) scale(${nodeScale(depth).toFixed(3)})`;

    const opacity = isActive ? 1 : nodeOpacity(depth);
    if (opacity !== writtenOpacity[index]) node.style.opacity = String(opacity);
    writtenOpacity[index] = opacity;
    const zIndex = isActive ? ACTIVE_Z_INDEX : Math.round(depth * 100);
    if (zIndex !== writtenZIndex[index]) node.style.zIndex = String(zIndex);
    writtenZIndex[index] = zIndex;
  };

  const writeEdge = (index: number, layout: ConstellationLayout) => {
    const [a, b] = edges[index];
    const unit = (layout.radius / layout.size) * VIEWBOX_SPAN;
    const line = lines[index];
    line.setAttribute('x1', (projected[a].x * unit).toFixed(2));
    line.setAttribute('y1', (projected[a].y * unit).toFixed(2));
    line.setAttribute('x2', (projected[b].x * unit).toFixed(2));
    line.setAttribute('y2', (projected[b].y * unit).toFixed(2));

    const base = edgeOpacity(projected[a].depth, projected[b].depth);
    const touchesActive = a === active || b === active;
    const stroke = active < 0 ? base : touchesActive ? HOT_EDGE_OPACITY : base * DIMMED_EDGE_FACTOR;
    if (stroke !== writtenStroke[index]) line.setAttribute('stroke-opacity', stroke.toFixed(2));
    writtenStroke[index] = stroke;
  };

  // Below the chip unless that would leave the square; clamped sideways so the name is never cut.
  const writeLabel = (layout: ConstellationLayout) => {
    if (active < 0) return;
    const { x, y, depth } = projected[active];
    const reach = (layout.nodeSize * nodeScale(depth)) / 2 + LABEL_GAP_PX;
    const centerX = layout.size / 2 + x * layout.radius;
    const centerY = layout.size / 2 + y * layout.radius;
    const below = centerY + reach + labelSize.height <= layout.size;
    const halfWidth = labelSize.width / 2;
    const left = clamp(centerX, halfWidth + LABEL_MARGIN_PX, layout.size - halfWidth - LABEL_MARGIN_PX) - halfWidth;
    const top = below ? centerY + reach : centerY - reach - labelSize.height;
    label.style.transform = `translate3d(${round(left)}px, ${round(top)}px, 0)`;
  };

  const render = (yaw: number) => {
    lastYaw = yaw;
    const layout = getLayout();
    if (layout.size === 0) return;
    projected = points.map((point) => project(rotate(point, yaw, TILT_DEGREES)));
    nodes.forEach((_, index) => writeNode(index, layout));
    lines.forEach((_, index) => writeEdge(index, layout));
    writeLabel(layout);
  };

  // The name is measured here, once per change, so the frame loop never reads layout.
  const setActive = (index: number) => {
    if (index === active) return;
    if (active >= 0) nodes[active].removeAttribute('data-active');
    active = index;
    if (index >= 0) {
      nodes[index].setAttribute('data-active', 'true');
      label.textContent = names[index];
      labelSize = { width: label.offsetWidth, height: label.offsetHeight };
    }
    label.style.opacity = index >= 0 ? '1' : '0';
    edges.forEach(([a, b], edgeIndex) => {
      if (index >= 0 && (a === index || b === index)) lines[edgeIndex].setAttribute('data-hot', 'true');
      else lines[edgeIndex].removeAttribute('data-hot');
    });
    render(lastYaw);
  };

  const indexOfNode = (target: EventTarget | null) => {
    const node = target instanceof Element ? target.closest('[data-node]') : null;
    return node ? nodes.indexOf(node as HTMLElement) : -1;
  };

  return { render, setActive, getActive: () => active, indexOfNode };
}
