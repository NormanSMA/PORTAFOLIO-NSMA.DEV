import { useRef } from 'react';
import { typography } from '../../../config/typography';
import { useLanguage, useMotion } from '../../../hooks';
import { cn } from '../../../utils/helpers';
import { startCanvasMotion } from './canvasMotion';
import { CanvasScene } from './CanvasScene';
import { CanvasTokens } from './CanvasTokens';
import { useSceneScale } from './useSceneScale';
import './designCanvas.css';

const CORNERS = [
  '-left-[3.5px] -top-[3.5px]',
  '-right-[3.5px] -top-[3.5px]',
  '-bottom-[3.5px] -left-[3.5px]',
  '-bottom-[3.5px] -right-[3.5px]',
] as const;

// The line of the hero as what it is: a Bezier curve on a design canvas. The frame name answers what the line is.
// The whole figure is one image for assistive tech; the visible text inside it is decoration of that image.
// Without motion, and before the first frame, the markup is the finished drawing.
export function DesignCanvas() {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useSceneScale(sceneRef);
  useMotion(rootRef, ({ noReducedMotion }) => {
    const root = rootRef.current;
    if (!noReducedMotion || !root) return;
    return startCanvasMotion(root);
  });

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={t('hero.canvas.label')}
      className="pointer-events-none relative w-full max-w-xl select-none pt-7 lg:max-w-none"
    >
      <div aria-hidden="true">
        <span className={cn(typography.caption, 'absolute left-0 top-0 whitespace-nowrap text-fg-subtle')}>
          {t('hero.canvas.frame')}
        </span>
        <div className="hero-canvas-dots relative border border-line">
          {CORNERS.map((corner) => (
            <span key={corner} className={cn('absolute z-raised block size-[7px] border border-fg bg-ink', corner)} />
          ))}
          <div ref={sceneRef} className="hero-canvas-scene relative aspect-[17/10] w-full">
            <span className="absolute inset-x-0 top-1/2 h-px bg-primary-400/35" />
            <span className="absolute inset-y-0 left-1/2 w-px bg-primary-400/35" />
            <CanvasScene />
          </div>
          <CanvasTokens />
        </div>
      </div>
    </div>
  );
}
