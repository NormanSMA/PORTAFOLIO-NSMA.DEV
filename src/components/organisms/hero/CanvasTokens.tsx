import { typography } from '../../../config/typography';
import { cn } from '../../../utils/helpers';
import { COLOR_TOKENS, TYPE_TOKENS } from './designTokens';

// Docked to the bottom edge of the artboard: the colors on one line and the two type samples on the next, at every width.
// Below sm each swatch stacks its code under the circle so four fit in 320 px. The row sits in the flow, so its height
// never depends on the animation.
export function CanvasTokens() {
  return (
    <div className="flex flex-col gap-3 border-t border-line px-3 py-3 sm:px-4">
      <ul className="flex items-start justify-between sm:items-center sm:justify-start sm:gap-5">
        {COLOR_TOKENS.map(({ hex, swatch }) => (
          <li key={hex} data-canvas-token className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
            <span className={cn('block size-[18px] rounded-pill border border-line-control', swatch)} />
            <span className={cn(typography.caption, 'tabular-nums text-fg-muted')}>{hex}</span>
          </li>
        ))}
      </ul>
      <ul className="flex items-center gap-5">
        {TYPE_TOKENS.map(({ name, sample }) => (
          <li key={name} data-canvas-token className="flex items-center gap-2">
            <span className={cn(sample, 'text-fg')}>Aa</span>
            <span className={cn(typography.caption, 'text-fg-muted')}>{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
