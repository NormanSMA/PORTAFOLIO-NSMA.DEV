import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { typography } from '../../../config/typography';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { cn } from '../../../utils/helpers';
import { Button } from '../../atoms/Button';
import './mirrorHall/mirrorHall.css';
import { RingCard } from './mirrorHall/RingCard';
import { writeRingFrame } from './mirrorHall/ringDom';
import { TILT_DEGREES } from './mirrorHall/ringMath';
import { type RingPhase, useRingRotation } from './mirrorHall/useRingRotation';
import { useRingLayout } from './mirrorHall/useRingLayout';

export interface MirrorHallItem {
  id: string;
  label: string;
  title: string;
  image: ReactNode;
  // When set, the card face is a real link that opens in a new tab once the card is in front.
  href?: string;
  // Accessible text added to the front card's name when it has an href, e.g. "(opens in a new tab)".
  openLabel?: string;
}

export interface MirrorHallProps {
  items: MirrorHallItem[];
  ariaLabel: string;
  previousLabel: string;
  nextLabel: string;
  onActiveChange: (index: number) => void;
  // Accessible name of each card; the default is Spanish, pass one for other languages.
  getCardLabel?: (position: number, total: number, title: string) => string;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const POOL_DEPTH_RATIO = 1.1;
const ARROW_DIRECTION: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

const defaultCardLabel = (position: number, total: number, title: string) =>
  `${position} de ${total}: ${title}`;

const pad = (value: number) => String(value).padStart(2, '0');

// A linked card is focused through its anchor; a card without a link is focused itself.
function focusCard(card: Element | undefined) {
  const target = card?.querySelector<HTMLElement>('a[href]') ?? (card as HTMLElement | undefined);
  target?.focus({ preventScroll: true });
}

export function MirrorHall({
  items,
  ariaLabel,
  previousLabel,
  nextLabel,
  onActiveChange,
  getCardLabel = defaultCardLabel,
}: MirrorHallProps) {
  const count = items.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const layout = useRingLayout(rootRef, count);

  const handleActiveChange = useCallback(
    (index: number) => {
      setActiveIndex(index);
      onActiveChange(index);
    },
    [onActiveChange],
  );
  const handleFrame = useCallback((angle: number) => {
    if (ringRef.current) writeRingFrame(ringRef.current, angle);
  }, []);
  const handlePhase = useCallback((phase: RingPhase) => {
    if (rootRef.current) rootRef.current.dataset.phase = phase;
  }, []);

  const rotation = useRingRotation({
    stageRef,
    count,
    degreesPerPixel: layout.degreesPerPixel,
    reducedMotion,
    onFrame: handleFrame,
    onActiveChange: handleActiveChange,
    onPhaseChange: handlePhase,
  });

  useLayoutEffect(() => {
    rotation.refresh();
  }, [rotation, count]);

  // No frames and no ripple while the ring is outside the viewport.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries[entries.length - 1].isIntersecting;
      root.dataset.offscreen = String(!visible);
      rotation.setVisible(visible);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [rotation]);

  // The front card's anchor opens its link natively (a real target="_blank" link, which embedded browsers
  // respect), but only without a drag and, for a pointer, once the ring has stopped: a double click on a side
  // card must bring it forward, not also open it. A click with detail 0 comes from the keyboard (Enter on the
  // focused link), so it is deliberate and does not wait for the ring.
  const handleCardClick = (event: MouseEvent<HTMLElement>, index: number) => {
    const dragged = rotation.wasDragged();
    const linked = Boolean(items[index].href);
    const atRest = event.detail === 0 || rootRef.current?.dataset.phase === 'idle';
    const opensLink = linked && index === activeIndex && !dragged && atRest;
    if (opensLink) return;
    if (linked) event.preventDefault();
    if (!dragged) rotation.goTo(index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const direction = ARROW_DIRECTION[event.key];
    if (!direction || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement;
    const onCard = target.closest('[data-ring-index]') !== null;
    if (target !== event.currentTarget && !onCard) return;
    event.preventDefault();
    const next = rotation.stepBy(direction);
    // Roving focus: the focused card follows the front one.
    if (onCard) focusCard(ringRef.current?.children[next]);
  };

  if (count === 0) return null;

  const rootStyle = {
    '--mh-card-w': `${layout.cardWidth}px`,
    '--mh-card-h': `${layout.cardHeight}px`,
    '--mh-card-left': `${layout.cardLeft}px`,
    '--mh-image-h': `${layout.imageHeight}px`,
    '--mh-foot-h': `${layout.footerHeight}px`,
    '--mh-radius': `${layout.radius}px`,
    '--mh-perspective': `${layout.perspective}px`,
    '--mh-front-z': `${layout.frontZ}px`,
    '--mh-tilt': `${TILT_DEGREES}deg`,
    '--mh-pool-depth': `${layout.cardWidth * POOL_DEPTH_RATIO}px`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className="mh-root"
      style={rootStyle}
      role="group"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      data-phase="idle"
      onKeyDown={handleKeyDown}
    >
      <div
        ref={stageRef}
        className="mh-stage"
        style={{ height: layout.stageHeight }}
        onDragStart={(event) => event.preventDefault()}
        {...rotation.stageProps}
      >
        <div className="mh-scene" style={{ transform: `translateY(${layout.sceneOffset}px)` }}>
          <div
            className="mh-floor"
            aria-hidden="true"
            style={{
              top: `calc(50% + ${layout.floorCenter}px)`,
              width: layout.floorRadiusX * 2,
              height: layout.floorRadiusY * 2,
            }}
          />
          <div className="mh-tilt">
            <ul ref={ringRef} className="mh-ring">
              {items.map((item, index) => (
                <RingCard
                  key={item.id}
                  item={item}
                  index={index}
                  count={count}
                  active={index === activeIndex}
                  ariaLabel={getCardLabel(index + 1, count, item.title)}
                  onSelect={rotation.goTo}
                  onClick={handleCardClick}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-3 px-gutter sm:gap-6">
        <Button variant="outline" onClick={() => rotation.stepBy(-1)}>
          {previousLabel}
        </Button>
        <p className={cn(typography.bodySmall, 'min-w-[5.5ch] text-center tabular-nums text-fg-muted')}>
          {pad(activeIndex + 1)} / {pad(count)}
        </p>
        <Button variant="outline" onClick={() => rotation.stepBy(1)}>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
