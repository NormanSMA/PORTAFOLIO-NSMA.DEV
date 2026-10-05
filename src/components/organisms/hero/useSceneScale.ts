import { useLayoutEffect, type RefObject } from 'react';
import { SCENE_WIDTH } from './canvasGeometry';

// Writes the scene-units-per-pixel ratio that the stroke widths in designCanvas.css read.
// It runs before the first paint and on resize, never per frame.
export function useSceneScale(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const scene = ref.current;
    if (!scene) return;

    const apply = () => {
      const width = scene.clientWidth;
      if (width > 0) scene.style.setProperty('--k', (SCENE_WIDTH / width).toFixed(4));
    };
    apply();
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(apply);
    observer.observe(scene);
    return () => observer.disconnect();
  }, [ref]);
}
