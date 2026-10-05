import { useRef } from 'react';
import { useLanguage, useMotion } from '../../../hooks';
import { cn } from '../../../utils/helpers';
import { SCENE_HEIGHT, SCENE_WIDTH } from './canvasGeometry';
import { startCanvasMotion } from './canvasMotion';
import { CanvasGrid } from './CanvasGrid';
import { CanvasScene } from './CanvasScene';
import { useSceneScale } from './useSceneScale';
import './designCanvas.css';

// In the order the frame is drawn, clockwise from the top left, so the intro can pop each one as the line reaches it.
const CORNERS = [
  '-left-[3.5px] -top-[3.5px]',
  '-right-[3.5px] -top-[3.5px]',
  '-bottom-[3.5px] -right-[3.5px]',
  '-bottom-[3.5px] -left-[3.5px]',
] as const;

// The ratio of the box is the ratio of the scene units, so a point of the scene lands on the same point of the box.
const BOX_STYLE = { aspectRatio: `${SCENE_WIDTH} / ${SCENE_HEIGHT}` };

// A curve with four nodes on a design canvas: a frame, a grid, guides and handles. The only text is one word per node.
// The whole figure is one image for assistive tech. Without motion, and before the first frame,
// the markup is the finished drawing: the nodes in their places and the curve lit.
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
      className="pointer-events-none relative w-full max-w-xl select-none lg:max-w-none"
    >
      <div aria-hidden="true">
        <div ref={sceneRef} style={BOX_STYLE} className="hero-canvas-scene relative w-full">
          <CanvasGrid />
          {CORNERS.map((corner) => (
            <span
              key={corner}
              data-canvas-corner
              className={cn('absolute z-raised block size-[7px] border border-fg bg-ink', corner)}
            />
          ))}
          <CanvasScene />
        </div>
      </div>
    </div>
  );
}
