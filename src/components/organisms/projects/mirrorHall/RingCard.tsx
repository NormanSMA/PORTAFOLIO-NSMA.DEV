import type { CSSProperties, FocusEvent, KeyboardEvent, MouseEvent } from 'react';
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
  onClick: (event: MouseEvent<HTMLElement>, index: number) => void;
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

interface CardContentProps {
  item: MirrorHallItem;
  showOpenIcon: boolean;
}

// The capture goes whole on top; the title and the status take one line each in the strip below it.
function CardContent({ item, showOpenIcon }: CardContentProps) {
  return (
    <>
      <div className="mh-shot">{item.image}</div>
      <div className="mh-foot">
        <p className={cn(typography.h5, 'flex items-center gap-2 text-fg')}>
          <span className="truncate">{item.title}</span>
          {showOpenIcon && (
            <span aria-hidden="true" className="shrink-0 text-fg-muted">
              <ExternalLinkIcon className="h-4 w-4" />
            </span>
          )}
        </p>
        <p className={cn(typography.caption, 'truncate text-fg-muted')}>{item.label}</p>
      </div>
    </>
  );
}

export function RingCard({ item, index, count, active, ariaLabel, onSelect, onClick }: RingCardProps) {
  const style = { '--mh-i': index, '--mh-angle': `${index * indexStep(count)}deg` } as CSSProperties;
  const linked = Boolean(item.href);
  // Only the front card opens its link; the others bring themselves to the front.
  const opensLink = active && linked;
  const label = opensLink ? `${ariaLabel} ${item.openLabel ?? DEFAULT_OPEN_LABEL}` : ariaLabel;
  const content = <CardContent item={item} showOpenIcon={opensLink} />;

  const handleFocus = (event: FocusEvent<HTMLLIElement>) => {
    if (!active && hasKeyboardFocus(event.target as HTMLElement)) onSelect(index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.key !== 'Enter' || event.repeat || event.target !== event.currentTarget) return;
    event.preventDefault();
    onSelect(index);
  };

  // A linked card puts its name and its tab stop on the anchor; a card without a link keeps them on the item.
  const itemProps = linked ? {} : { 'aria-label': label, tabIndex: active ? 0 : -1 };

  return (
    <li
      className={cn('mh-card', opensLink && 'mh-card--link')}
      style={style}
      data-ring-index={index}
      aria-hidden={false}
      aria-current={active ? 'true' : undefined}
      onClick={(event) => onClick(event, index)}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      {...itemProps}
    >
      <div className="mh-card-body">
        {linked ? (
          <a
            className="mh-face"
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            tabIndex={active ? 0 : -1}
          >
            {content}
          </a>
        ) : (
          <div className="mh-face">{content}</div>
        )}
        <div className="mh-reflection" aria-hidden="true" inert>
          <div className="mh-ripple">{item.image}</div>
        </div>
      </div>
      <div className="mh-pool" aria-hidden="true" />
    </li>
  );
}
