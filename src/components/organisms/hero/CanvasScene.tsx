import {
  CURSOR_START,
  FINISHED_MIX,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  controlPoints,
  curvePath,
  handlePath,
  sceneTransform,
} from './canvasGeometry';

const VIEW_BOX = `0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`;
const FINISHED = controlPoints(FINISHED_MIX);
const FINISHED_PATH = curvePath(FINISHED);

// The blur is static: it is drawn once from the finished curve and only its opacity changes, so no frame re-blurs it.
const HALO_REGION = { x: -40, y: -40, width: SCENE_WIDTH + 80, height: SCENE_HEIGHT + 80 };

const MARKER = 'absolute left-0 top-0';

function Halo() {
  return (
    <svg
      data-canvas-halo
      viewBox={VIEW_BOX}
      className="absolute inset-0 size-full overflow-visible"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        {(['hero-canvas-haze', 'hero-canvas-glow'] as const).map((id, index) => (
          <filter key={id} id={id} filterUnits="userSpaceOnUse" {...HALO_REGION} colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={index === 0 ? 9 : 3.5} />
          </filter>
        ))}
      </defs>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={FINISHED_PATH} className="stroke-primary-500" strokeWidth="22" strokeOpacity="0.1" filter="url(#hero-canvas-haze)" />
        <path d={FINISHED_PATH} className="stroke-secondary-500" strokeWidth="9" strokeOpacity="0.26" filter="url(#hero-canvas-glow)" />
      </g>
    </svg>
  );
}

// The curve and its handle lines. pathLength 1 lets the trace be a dash offset from 1 to 0 whatever the real length is.
function Strokes() {
  return (
    <svg viewBox={VIEW_BOX} className="absolute inset-0 size-full overflow-visible" focusable="false" aria-hidden="true">
      <g fill="none" strokeLinejoin="round">
        <path
          data-canvas-curve
          d={FINISHED_PATH}
          pathLength={1}
          strokeDasharray="1"
          className="hero-canvas-edge stroke-secondary-400"
          strokeOpacity="0.35"
        />
        <path
          data-canvas-curve
          d={FINISHED_PATH}
          pathLength={1}
          strokeDasharray="1"
          className="hero-canvas-core stroke-secondary-50"
        />
      </g>
      <g data-canvas-controls fill="none">
        {FINISHED.map((point) => (
          <path
            key={point.anchor.x}
            data-canvas-handle-line
            d={handlePath(point, 1)}
            className="hero-canvas-handle stroke-fg-subtle"
          />
        ))}
      </g>
    </svg>
  );
}

function Handles() {
  return (
    <>
      {FINISHED.flatMap((point) => [point.in, point.out]).map((side, slot) => (
        <span key={slot} data-canvas-handle-dot className={MARKER} style={{ transform: sceneTransform(side) }}>
          <span data-canvas-dot-tip className="absolute -left-[2.5px] -top-[2.5px] block size-[5px] rounded-pill bg-fg" />
        </span>
      ))}
    </>
  );
}

function Anchors() {
  return (
    <>
      {FINISHED.map((point) => (
        <span key={point.anchor.x} className={MARKER} style={{ transform: sceneTransform(point.anchor) }}>
          <span
            data-canvas-anchor-ring
            className="absolute -left-[3.5px] -top-[3.5px] block size-[7px] border border-primary-400 opacity-0"
          />
          <span
            data-canvas-anchor-box
            data-active="false"
            className="absolute -left-[3.5px] -top-[3.5px] block size-[7px] border border-fg bg-ink motion-safe:transition-colors motion-safe:duration-fast motion-safe:ease-out data-[active=true]:bg-primary-400"
          />
        </span>
      ))}
    </>
  );
}

// An arrow pointer: white with an ink outline, the tip on the top left corner of its box.
function Cursor() {
  return (
    <span data-canvas-cursor className={`${MARKER} opacity-0`} style={{ transform: sceneTransform(CURSOR_START) }}>
      <span data-canvas-cursor-tip className="absolute -left-[1.5px] -top-[1.5px] block h-5 w-3.5">
        <svg viewBox="0 0 14 20" className="size-full" focusable="false">
          <path
            d="M1.5 1.5V15.8L5.2 12.6L7.9 18.4L10.5 17.2L7.8 11.5H12.9Z"
            strokeWidth="1"
            strokeLinejoin="round"
            className="fill-fg stroke-ink"
          />
        </svg>
      </span>
    </span>
  );
}

// Everything inside the scene box. The animation fades this wrapper as one piece.
export function CanvasScene() {
  return (
    <div data-canvas-content className="absolute inset-0">
      <Halo />
      <Strokes />
      <div data-canvas-controls className="absolute inset-0">
        <Handles />
        <Anchors />
      </div>
      <Cursor />
    </div>
  );
}
