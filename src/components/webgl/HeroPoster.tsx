import type { Ref } from 'react';
import { WORLD_HEIGHT, WORLD_WIDTH, curvePath } from '../../lib/webgl/heroCurve';

interface HeroPosterProps {
  // The shader reads this box to place the filament, so poster and canvas agree on layout.
  stageRef: Ref<HTMLDivElement>;
}

const PATH = curvePath();
const VIEW_BOX = `${-WORLD_WIDTH / 2} ${-WORLD_HEIGHT / 2} ${WORLD_WIDTH} ${WORLD_HEIGHT}`;

// The glow floor and ramp length repeat MIN_GLOW and RAMP_SHARE from heroStage.ts. The ramp keeps text off the brightest light.
const STAGE_BELOW_TEXT = 'left-0 top-[56%] h-[44%] w-full [mask-image:linear-gradient(to_bottom,rgb(0_0_0/0.12),black_35%)]';
const STAGE_BESIDE_TEXT =
  'md:left-[40%] md:top-0 md:h-full md:w-[60%] md:[mask-image:linear-gradient(to_right,rgb(0_0_0/0.12),black_35%)]';

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
    <div ref={stageRef} className={`absolute ${STAGE_BELOW_TEXT} ${STAGE_BESIDE_TEXT}`}>
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
          <path d={PATH} className="stroke-primary-500" strokeWidth="0.22" strokeOpacity="0.45" filter="url(#hero-poster-halo)" />
          <path d={PATH} className="stroke-secondary-400" strokeWidth="0.05" strokeOpacity="0.7" filter="url(#hero-poster-inner)" />
          <path d={PATH} className="stroke-fg" strokeWidth="0.016" strokeOpacity="0.95" filter="url(#hero-poster-core)" />
        </g>
      </svg>
    </div>
  );
}
