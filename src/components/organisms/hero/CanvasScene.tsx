import { typography } from '../../../config/typography';
import { useLanguage } from '../../../hooks';
import { cn } from '../../../utils/helpers';
import {
  ALIGNED_MIX,
  CURSOR_START,
  NODE_ROWS,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  controlPoints,
  curvePath,
  handlePath,
  sceneTransform,
} from './canvasGeometry';

const VIEW_BOX = `0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`;
const ALIGNED = controlPoints(ALIGNED_MIX);
const ALIGNED_PATH = curvePath(ALIGNED);

// The blur is static: it is drawn once from the aligned curve and only its opacity changes, so no frame re-blurs it.
const HALO_REGION = { x: -40, y: -40, width: SCENE_WIDTH + 80, height: SCENE_HEIGHT + 80 };

const MARKER = 'absolute left-0 top-0';
const LABEL_KEYS = ['first', 'second', 'third', 'fourth'] as const;

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
        <path d={ALIGNED_PATH} className="stroke-primary-500" strokeWidth="22" strokeOpacity="0.1" filter="url(#hero-canvas-haze)" />
        <path d={ALIGNED_PATH} className="stroke-secondary-500" strokeWidth="9" strokeOpacity="0.26" filter="url(#hero-canvas-glow)" />
      </g>
    </svg>
  );
}

// The curve, the trail of the pulse, and the handle lines. pathLength 1 lets the trail be a dash offset from 1 to 0.
// The trail takes butt caps: with round caps a hidden dash still leaves a dot at the end of the path.
// The handles rest at 30 percent: the animation lifts them to full while the pen works and lowers them again.
function Strokes() {
  return (
    <svg viewBox={VIEW_BOX} className="absolute inset-0 size-full overflow-visible" focusable="false" aria-hidden="true">
      <g fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path data-canvas-curve d={ALIGNED_PATH} pathLength={1} className="hero-canvas-edge stroke-secondary-400" strokeOpacity="0.35" />
        <path
          data-canvas-trail
          d={ALIGNED_PATH}
          pathLength={1}
          strokeDasharray="1 2"
          strokeDashoffset="1"
          strokeLinecap="butt"
          className="hero-canvas-trail stroke-primary-400"
          strokeOpacity="0.5"
        />
        <path data-canvas-curve d={ALIGNED_PATH} pathLength={1} className="hero-canvas-core stroke-secondary-50" />
      </g>
      <g data-canvas-handles fill="none" className="opacity-30">
        {ALIGNED.map((point) => (
          <path key={point.anchor.x} data-canvas-handle-line d={handlePath(point)} className="hero-canvas-handle stroke-fg-subtle" />
        ))}
      </g>
    </svg>
  );
}

function Handles() {
  return (
    <div data-canvas-handles className="absolute inset-0 opacity-30">
      {ALIGNED.flatMap((point) => [point.in, point.out]).map((side, slot) => (
        <span key={slot} data-canvas-handle-dot className={MARKER} style={{ transform: sceneTransform(side) }}>
          <span data-canvas-dot-tip className="absolute -left-[2.5px] -top-[2.5px] block size-[5px] rounded-pill bg-fg" />
        </span>
      ))}
    </div>
  );
}

// A node is a small rounded square with nothing inside. Lit, it takes a primary border and a soft ring; the pulse ring
// is the burst that the animation plays when the node is placed or crossed.
function Nodes() {
  return (
    <>
      {ALIGNED.map((point) => (
        <span
          key={point.anchor.x}
          data-canvas-node
          data-active="false"
          className={`group ${MARKER}`}
          style={{ transform: sceneTransform(point.anchor) }}
        >
          <span data-canvas-node-burst className="hero-canvas-node-box absolute rounded-[3px] border border-primary-400 opacity-0" />
          <span className="hero-canvas-node-ring absolute rounded-[5px] border border-primary-400/45 opacity-0 motion-safe:transition-opacity motion-safe:duration-fast group-data-[active=true]:opacity-100" />
          <span
            data-canvas-node-box
            className="hero-canvas-node-box absolute rounded-[3px] border border-fg/70 bg-ink motion-safe:transition-colors motion-safe:duration-fast motion-safe:ease-out group-data-[active=true]:border-primary-400"
          />
        </span>
      ))}
    </>
  );
}

// One word per node, left to right. The labels of the upper row sit above their node and the lower row's sit below,
// away from the wave, 14 px from the node's center. They stay where the nodes end up, so nothing here moves with the pen.
function Labels() {
  const { t } = useLanguage();

  return (
    <>
      {ALIGNED.map((point, index) => (
        <span key={point.anchor.x} className={MARKER} style={{ transform: sceneTransform(point.anchor) }}>
          <span
            className={cn('absolute left-0 -translate-x-1/2', NODE_ROWS[index] === 0 ? 'bottom-[14px]' : 'top-[14px]')}
          >
            <span
              data-canvas-label
              data-lit="false"
              className={cn(
                typography.caption,
                'hero-canvas-label block whitespace-nowrap text-[12px] text-fg-muted sm:text-[13px] data-[lit=true]:text-fg',
              )}
            >
              {t(`hero.canvas.nodes.${LABEL_KEYS[index]}`)}
            </span>
          </span>
        </span>
      ))}
    </>
  );
}

// The pulse: a small bright point with a static soft halo around it.
function Pulse() {
  return (
    <span data-canvas-pulse className={`${MARKER} opacity-0`} style={{ transform: sceneTransform(ALIGNED[0].anchor) }}>
      <span className="absolute -left-[9px] -top-[9px] block size-[18px] rounded-pill bg-[radial-gradient(circle,rgb(var(--color-secondary-100)/0.5),transparent_70%)]" />
      <span className="absolute -left-[2.5px] -top-[2.5px] block size-[5px] rounded-pill bg-fg" />
    </span>
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

// Everything that moves or fades inside the scene box. The animation fades this wrapper as one piece.
export function CanvasScene() {
  return (
    <div data-canvas-content className="absolute inset-0">
      <Halo />
      <Strokes />
      <Handles />
      <Nodes />
      <Labels />
      <Pulse />
      <Cursor />
    </div>
  );
}
