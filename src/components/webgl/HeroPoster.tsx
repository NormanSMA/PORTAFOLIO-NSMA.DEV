import type { CSSProperties, Ref } from 'react';
import { WORLD_HEIGHT, WORLD_WIDTH, curvePath } from '../../lib/webgl/heroCurve';

interface HeroPosterProps {
  // The shader reads this box to place the filament, so poster and canvas agree on layout.
  stageRef: Ref<HTMLDivElement>;
}

const PATH = curvePath();
const VIEW_BOX = `${-WORLD_WIDTH / 2} ${-WORLD_HEIGHT / 2} ${WORLD_WIDTH} ${WORLD_HEIGHT}`;

// The glow floor and the 30% ramp repeat MIN_GLOW and RAMP_SHARE from heroStage.ts. The ramp keeps text off the brightest light.
// Below the text the stage has a fixed height and the hero reserves room for it with its bottom padding.
const STAGE_BELOW_TEXT =
  'bottom-0 left-0 h-52 w-full md:h-72 [mask-image:linear-gradient(to_bottom,rgb(0_0_0/0.12),black_30%)]';
// From lg up the stage starts where the text column ends; --hero-text-width is set by Hero.
const STAGE_BESIDE_TEXT =
  'lg:bottom-auto lg:left-[var(--hero-stage-left)] lg:right-gutter lg:top-0 lg:h-full lg:w-auto lg:[mask-image:linear-gradient(to_right,rgb(0_0_0/0.12),black_30%)]';

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
          {blur('hero-poster-haze', 0.3)}
          {blur('hero-poster-halo', 0.14)}
          {blur('hero-poster-inner', 0.035)}
          {blur('hero-poster-core', 0.006)}
        </defs>
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={PATH} className="stroke-primary-500" strokeWidth="0.55" strokeOpacity="0.2" filter="url(#hero-poster-haze)" />
          <path d={PATH} className="stroke-primary-500" strokeWidth="0.22" strokeOpacity="0.4" filter="url(#hero-poster-halo)" />
          <path d={PATH} className="stroke-secondary-400" strokeWidth="0.04" strokeOpacity="0.5" filter="url(#hero-poster-inner)" />
          <path d={PATH} className="stroke-fg" strokeWidth="0.014" strokeOpacity="0.9" filter="url(#hero-poster-core)" />
        </g>
      </svg>
    </div>
  );
}
