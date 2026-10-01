import type { CSSProperties, Ref } from 'react';
import { HALF_LENGTH, WORLD_HEIGHT, WORLD_WIDTH, curvePath } from '../../lib/webgl/heroCurve';

interface HeroPosterProps {
  // The shader reads this box to place the filament, so poster and canvas agree on layout.
  stageRef: Ref<HTMLDivElement>;
}

const PATH = curvePath();
const VIEW_BOX = `${-WORLD_WIDTH / 2} ${-WORLD_HEIGHT / 2} ${WORLD_WIDTH} ${WORLD_HEIGHT}`;

// The 30% ramp repeats RAMP_SHARE from heroStage.ts. It keeps text off the brightest light; the shader floors at MIN_GLOW where this goes to zero.
// Below the text the stage has a fixed height and the hero reserves room for it with its bottom padding.
const STAGE_BELOW_TEXT =
  'bottom-0 left-0 h-52 w-full md:h-72 [mask-image:linear-gradient(to_bottom,transparent,black_30%)]';
// From lg up the stage starts where the text column ends; --hero-text-width is set by Hero.
const STAGE_BESIDE_TEXT =
  'lg:bottom-auto lg:left-[var(--hero-stage-left)] lg:right-0 lg:top-0 lg:h-full lg:w-auto lg:[mask-image:linear-gradient(to_right,transparent,black_30%)]';

const STAGE_LEFT =
  'calc((100% - min(100%, var(--container-max))) / 2 + var(--gutter) + var(--hero-text-width, 30rem) + 2rem)';

function blur(id: string, deviation: number) {
  return (
    <filter id={id} filterUnits="userSpaceOnUse" x="-4" y="-3" width="8" height="6" colorInterpolationFilters="sRGB">
      <feGaussianBlur stdDeviation={deviation} />
    </filter>
  );
}

// First paint: the same filament as still SVG. It is also the whole hero when WebGL is off.
export function HeroPoster({ stageRef }: HeroPosterProps) {
  return (
    <div
      ref={stageRef}
      className={`absolute ${STAGE_BELOW_TEXT} ${STAGE_BESIDE_TEXT}`}
      style={{ '--hero-stage-left': STAGE_LEFT } as CSSProperties}
    >
      <svg
        viewBox={VIEW_BOX}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full overflow-visible"
        focusable="false"
        aria-hidden="true"
      >
        <defs>
          {/* The shader dims the last 30% of the filament at each end; this mask does the same. */}
          <linearGradient id="hero-poster-taper-fade" gradientUnits="userSpaceOnUse" x1={-HALF_LENGTH} x2={HALF_LENGTH} y1="0" y2="0">
            <stop offset="0" stopColor="white" stopOpacity="0.35" />
            <stop offset="0.15" stopColor="white" />
            <stop offset="0.85" stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0.35" />
          </linearGradient>
          <mask id="hero-poster-taper" maskUnits="userSpaceOnUse" x="-4" y="-3" width="8" height="6">
            <rect x="-4" y="-3" width="8" height="6" fill="url(#hero-poster-taper-fade)" />
          </mask>
          {blur('hero-poster-haze', 0.3)}
          {blur('hero-poster-halo', 0.14)}
          {blur('hero-poster-inner', 0.035)}
          {blur('hero-poster-core', 0.006)}
        </defs>
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" mask="url(#hero-poster-taper)">
          {/* Indigo and blue stacked at half strength stand in for the shader's mixed halo color. */}
          <path d={PATH} className="stroke-primary-500" strokeWidth="0.55" strokeOpacity="0.08" filter="url(#hero-poster-haze)" />
          <path d={PATH} className="stroke-secondary-500" strokeWidth="0.55" strokeOpacity="0.1" filter="url(#hero-poster-haze)" />
          <path d={PATH} className="stroke-primary-500" strokeWidth="0.2" strokeOpacity="0.22" filter="url(#hero-poster-halo)" />
          <path d={PATH} className="stroke-secondary-500" strokeWidth="0.2" strokeOpacity="0.3" filter="url(#hero-poster-halo)" />
          <path d={PATH} className="stroke-secondary-400" strokeWidth="0.08" strokeOpacity="0.55" filter="url(#hero-poster-inner)" />
          <path d={PATH} className="stroke-fg" strokeWidth="0.016" strokeOpacity="0.95" filter="url(#hero-poster-core)" />
        </g>
      </svg>
    </div>
  );
}
