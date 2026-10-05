import { CENTER_X, GUIDE_REST_OPACITY, ROW_Y, SCENE_HEIGHT, SCENE_WIDTH, gridDotRings } from './canvasGeometry';

const VIEW_BOX = `0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`;
const DOT_RINGS = gridDotRings();

// The artboard: the frame, the dots of the grid, and the guides. Two guides run across the scene on the rows that nodes
// occupy and one runs down the center; each row guide flashes when a node snaps onto it. The frame and the dots are
// separate elements so the intro can draw the frame as a line and light the dots in rings from the center.
export function CanvasGrid() {
  return (
    <svg
      viewBox={VIEW_BOX}
      className="absolute inset-0 size-full overflow-visible"
      focusable="false"
      aria-hidden="true"
    >
      <g fill="none" strokeLinecap="round" className="hero-canvas-dot stroke-fg" strokeOpacity="0.26">
        {DOT_RINGS.map((dots) => (
          <path key={dots} data-canvas-dot-ring d={dots} />
        ))}
      </g>
      <rect
        data-canvas-frame
        x={0}
        y={0}
        width={SCENE_WIDTH}
        height={SCENE_HEIGHT}
        pathLength={1}
        fill="none"
        className="hero-canvas-guide stroke-line-strong"
      />
      <g className="hero-canvas-guide stroke-primary-400" fill="none">
        {ROW_Y.map((y) => (
          <line key={y} data-canvas-guide x1={0} x2={SCENE_WIDTH} y1={y} y2={y} opacity={GUIDE_REST_OPACITY} />
        ))}
        <line
          data-canvas-center-guide
          x1={CENTER_X}
          x2={CENTER_X}
          y1={0}
          y2={SCENE_HEIGHT}
          opacity={GUIDE_REST_OPACITY}
        />
      </g>
    </svg>
  );
}
