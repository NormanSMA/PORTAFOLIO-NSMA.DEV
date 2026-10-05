import { CENTER_X, GUIDE_REST_OPACITY, ROW_Y, SCENE_HEIGHT, SCENE_WIDTH, gridDotsPath } from './canvasGeometry';

const VIEW_BOX = `0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`;
const DOTS = gridDotsPath();

// Two lines across the scene sit on the rows that nodes occupy and one runs down the center. Each row line flashes when
// a node snaps onto it, so the guides carry the order without a word.
export function CanvasGrid() {
  return (
    <svg
      viewBox={VIEW_BOX}
      className="absolute inset-0 size-full overflow-visible"
      focusable="false"
      aria-hidden="true"
    >
      <path d={DOTS} fill="none" strokeLinecap="round" className="hero-canvas-dot stroke-fg" strokeOpacity="0.26" />
      <g className="hero-canvas-guide stroke-primary-400" fill="none">
        {ROW_Y.map((y) => (
          <line key={y} data-canvas-guide x1={0} x2={SCENE_WIDTH} y1={y} y2={y} opacity={GUIDE_REST_OPACITY} />
        ))}
        <line x1={CENTER_X} x2={CENTER_X} y1={0} y2={SCENE_HEIGHT} opacity={GUIDE_REST_OPACITY} />
      </g>
    </svg>
  );
}
