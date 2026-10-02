import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { typography } from '../../../config/typography';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { cn } from '../../../utils/helpers';
import { Button } from '../../atoms/Button';
import './mirrorHall/mirrorHall.css';
import { RingCard } from './mirrorHall/RingCard';
import { writeRingFrame } from './mirrorHall/ringDom';
import { type RingPhase, useRingRotation } from './mirrorHall/useRingRotation';
import { useRingLayout } from './mirrorHall/useRingLayout';

export interface MirrorHallItem {
  id: string;
  label: string;
  title: string;
  caption: string;
  image: ReactNode;
  // When set, the front card opens it in a new tab on click or Enter.
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

  // The front card opens its link only once the ring has stopped; any other card comes to the front.
  const activateCard = (index: number) => {
    const { href } = items[index];
    if (href && index === activeIndex && rootRef.current?.dataset.phase === 'idle') {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    rotation.goTo(index);
  };

  const handleCardClick = (index: number) => {
    if (!rotation.wasDragged()) activateCard(index);
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
    if (onCard) (ringRef.current?.children[next] as HTMLElement | undefined)?.focus({ preventScroll: true });
  };

  if (count === 0) return null;

  const rootStyle = {
    '--mh-card-w': `${layout.cardWidth}px`,
    '--mh-card-h': `${layout.cardHeight}px`,
    '--mh-radius': `${layout.radius}px`,
    '--mh-perspective': `${layout.perspective}px`,
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
                  onEnter={activateCard}
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
