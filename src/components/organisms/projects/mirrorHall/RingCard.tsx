import type { CSSProperties, FocusEvent, KeyboardEvent } from 'react';
import { typography } from '../../../../config/typography';
import { cn } from '../../../../utils/helpers';
import { ExternalLinkIcon } from '../../../atoms/icons';
import type { MirrorHallItem } from '../MirrorHall';
import { indexStep } from './ringMath';

interface RingCardProps {
  item: MirrorHallItem;
  index: number;
  count: number;
  active: boolean;
  ariaLabel: string;
  onSelect: (index: number) => void;
  onClick: (index: number) => void;
  onEnter: (index: number) => void;
}

const DEFAULT_OPEN_LABEL = '(abre en una pestaña nueva)';

// Only keyboard focus brings a card forward: a mouse press may be the start of a drag.
function hasKeyboardFocus(element: HTMLElement): boolean {
  try {
    return element.matches(':focus-visible');
  } catch {
    return true;
  }
}

export function RingCard({ item, index, count, active, ariaLabel, onSelect, onClick, onEnter }: RingCardProps) {
  const style = { '--mh-i': index, '--mh-angle': `${index * indexStep(count)}deg` } as CSSProperties;
  // Only the front card opens its link; the others bring themselves to the front.
  const opensLink = active && Boolean(item.href);
  const label = opensLink ? `${ariaLabel} ${item.openLabel ?? DEFAULT_OPEN_LABEL}` : ariaLabel;

  const handleFocus = (event: FocusEvent<HTMLLIElement>) => {
    if (!active && hasKeyboardFocus(event.currentTarget)) onSelect(index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.key !== 'Enter' || event.repeat || event.target !== event.currentTarget) return;
    event.preventDefault();
    onEnter(index);
  };

  return (
    <li
      className={cn('mh-card', opensLink && 'mh-card--link')}
      style={style}
      data-ring-index={index}
      aria-label={label}
      aria-hidden={false}
      aria-current={active ? 'true' : undefined}
      tabIndex={active ? 0 : -1}
      onClick={() => onClick(index)}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
    >
      <div className="mh-card-body">
        <div className="mh-face">
          {item.image}
          <div className="mh-veil-top" aria-hidden="true" />
          <div className="mh-veil-bottom" aria-hidden="true" />
          <p className={cn(typography.meta, 'absolute right-4 top-4 text-fg')}>{item.label}</p>
          <div className="absolute inset-x-4 bottom-4">
            <p className={cn(typography.h5, 'flex items-center gap-2 text-fg')}>
              <span>{item.title}</span>
              {opensLink && (
                <span aria-hidden="true" className="shrink-0 text-fg-muted">
                  <ExternalLinkIcon className="h-4 w-4" />
                </span>
              )}
            </p>
            {/* Three lines: on a phone the card is narrow and a 70-character caption needs them. */}
            <p className={cn(typography.caption, 'mt-1 line-clamp-3 text-fg-muted')}>{item.caption}</p>
          </div>
        </div>
        <div className="mh-reflection" aria-hidden="true" inert>
          <div className="mh-ripple">{item.image}</div>
        </div>
      </div>
      <div className="mh-pool" aria-hidden="true" />
    </li>
  );
}
