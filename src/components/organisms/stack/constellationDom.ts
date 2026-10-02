import {
  labelOpacity,
  pickLabels,
  type Box,
  type LabelCandidate,
  type LabelPlacement,
  type Size,
} from './constellationLabels';
import {
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
  // One name per node, same order: names are separate elements so they stay unscaled and sharp.
  labels: HTMLElement[];
  lines: SVGLineElement[];
}

interface Scene {
  points: readonly Vec3[];
  edges: readonly Edge[];
}

const ACTIVE_Z_INDEX = 1000;
// Names sit above every chip so one never hides under a neighbor.
const LABEL_Z_INDEX = 200;
const DIMMED_EDGE_FACTOR = 0.4;
const HOT_EDGE_OPACITY = 0.9;
// The SVG viewBox spans 0..100 so line coordinates are percentages of the square and need no resize handling.
const VIEWBOX_SPAN = 100;

const round = (value: number) => Math.round(value * 10) / 10;

// Imperative on purpose: the sphere moves every frame and React must not re-render for it.
// A style is touched only when its stepped value changes, so a frame mostly rewrites transforms.
export function createConstellationRenderer(scene: Scene, parts: ConstellationParts, getLayout: () => ConstellationLayout) {
  const { points, edges } = scene;
  const { nodes, labels, lines } = parts;
  const writtenOpacity: number[] = [];
  const writtenZIndex: number[] = [];
  const writtenStroke: number[] = [];
  const writtenLabelOpacity: number[] = [];
  const writtenLabelZIndex: number[] = [];
  let projected: Projected[] = [];
  let labelSizes: Size[] = labels.map(() => ({ width: 0, height: 0 }));
  let named = new Map<number, LabelPlacement>();
  let active = -1;
  let lastYaw = 0;

  const chipBox = (index: number, layout: ConstellationLayout): Box => {
    const { x, y, depth } = projected[index];
    const side = layout.nodeSize * nodeScale(depth);
    return {
      left: layout.centerX + x * layout.radius - side / 2,
      top: layout.centerY + y * layout.radius - side / 2,
      width: side,
      height: side,
    };
  };

  const writeNode = (index: number, layout: ConstellationLayout) => {
    const { depth } = projected[index];
    const node = nodes[index];
    const isActive = index === active;
    const half = layout.nodeSize / 2;
    const chip = chipBox(index, layout);
    const left = round(chip.left + chip.width / 2 - half);
    const top = round(chip.top + chip.height / 2 - half);
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
    const unit = VIEWBOX_SPAN / layout.size;
    const line = lines[index];
    line.setAttribute('x1', ((layout.centerX + projected[a].x * layout.radius) * unit).toFixed(2));
    line.setAttribute('y1', ((layout.centerY + projected[a].y * layout.radius) * unit).toFixed(2));
    line.setAttribute('x2', ((layout.centerX + projected[b].x * layout.radius) * unit).toFixed(2));
    line.setAttribute('y2', ((layout.centerY + projected[b].y * layout.radius) * unit).toFixed(2));

    const base = edgeOpacity(projected[a].depth, projected[b].depth);
    const touchesActive = a === active || b === active;
    const stroke = active < 0 ? base : touchesActive ? HOT_EDGE_OPACITY : base * DIMMED_EDGE_FACTOR;
    if (stroke !== writtenStroke[index]) line.setAttribute('stroke-opacity', stroke.toFixed(2));
    writtenStroke[index] = stroke;
  };

  const writeLabel = (index: number, depth: number, placement: LabelPlacement | undefined) => {
    const element = labels[index];
    const opacity = !placement ? 0 : index === active ? 1 : labelOpacity(depth);
    // An unnamed label is left where it faded out, so it costs nothing until it is named again.
    if (placement) {
      element.style.transform = `translate3d(${round(placement.box.left)}px, ${round(placement.box.top)}px, 0)`;
    }
    if (opacity !== writtenLabelOpacity[index]) element.style.opacity = String(opacity);
    writtenLabelOpacity[index] = opacity;
    const zIndex = index === active ? ACTIVE_Z_INDEX + 1 : LABEL_Z_INDEX + Math.round(depth * 100);
    if (zIndex !== writtenLabelZIndex[index]) element.style.zIndex = String(zIndex);
    writtenLabelZIndex[index] = zIndex;
  };

  const writeLabels = (layout: ConstellationLayout) => {
    const candidates = projected.map(
      (entry, index): LabelCandidate => ({ index, depth: entry.depth, chip: chipBox(index, layout), size: labelSizes[index] }),
    );
    named = pickLabels({ candidates, bounds: layout.size, active, previous: named });
    candidates.forEach(({ index, depth }) => writeLabel(index, depth, named.get(index)));
  };

  const render = (yaw: number) => {
    lastYaw = yaw;
    const layout = getLayout();
    if (layout.size === 0) return;
    projected = points.map((point) => project(rotate(point, yaw, TILT_DEGREES)));
    nodes.forEach((_, index) => writeNode(index, layout));
    lines.forEach((_, index) => writeEdge(index, layout));
    writeLabels(layout);
  };

  // Names are measured here, never in the frame loop. Call again when the font or the layout changes.
  const measure = () => {
    labelSizes = labels.map((label) => ({ width: label.offsetWidth, height: label.offsetHeight }));
  };

  const setActive = (index: number) => {
    if (index === active) return;
    if (active >= 0) {
      nodes[active].removeAttribute('data-active');
      labels[active].removeAttribute('data-active');
    }
    active = index;
    if (index >= 0) {
      nodes[index].setAttribute('data-active', 'true');
      labels[index].setAttribute('data-active', 'true');
    }
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

  return { render, measure, setActive, getActive: () => active, indexOfNode };
}
