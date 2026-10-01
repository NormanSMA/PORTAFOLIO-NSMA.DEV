import type { CSSProperties, FocusEvent } from 'react';
import { typography } from '../../../../config/typography';
import { cn } from '../../../../utils/helpers';
import type { MirrorHallItem } from '../MirrorHall';
import { indexStep } from './ringMath';

interface RingCardProps {
  item: MirrorHallItem;
  index: number;
  count: number;
  active: boolean;
  ariaLabel: string;
  onSelect: (index: number) => void;
}

// Only keyboard focus brings a card forward: a mouse press may be the start of a drag.
function hasKeyboardFocus(element: HTMLElement): boolean {
  try {
    return element.matches(':focus-visible');
  } catch {
    return true;
  }
}

export function RingCard({ item, index, count, active, ariaLabel, onSelect }: RingCardProps) {
  const style = { '--mh-i': index, '--mh-angle': `${index * indexStep(count)}deg` } as CSSProperties;

  const handleFocus = (event: FocusEvent<HTMLLIElement>) => {
    if (!active && hasKeyboardFocus(event.currentTarget)) onSelect(index);
  };

  return (
    <li
      className="mh-card"
      style={style}
      data-ring-index={index}
      aria-label={ariaLabel}
      aria-hidden={false}
      aria-current={active ? 'true' : undefined}
      tabIndex={active ? 0 : -1}
      onClick={() => onSelect(index)}
      onFocus={handleFocus}
    >
      <div className="mh-card-body">
        <div className="mh-face">
          {item.image}
          <div className="mh-veil-top" aria-hidden="true" />
          <div className="mh-veil-bottom" aria-hidden="true" />
          <p className={cn(typography.meta, 'absolute right-4 top-4 text-fg')}>{item.label}</p>
          <div className="absolute inset-x-4 bottom-4">
            <p className={cn(typography.h5, 'text-fg')}>{item.title}</p>
            <p className={cn(typography.caption, 'mt-1 line-clamp-2 text-fg-muted')}>{item.caption}</p>
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
