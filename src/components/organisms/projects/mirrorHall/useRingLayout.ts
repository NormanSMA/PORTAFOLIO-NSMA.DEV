import { useLayoutEffect, useMemo, useState, type RefObject } from 'react';
import { computeLayout } from './ringLayout';

// Width used until the first measurement, and in environments without layout (jsdom).
const FALLBACK_WIDTH = 960;

export function useRingLayout(rootRef: RefObject<HTMLElement | null>, count: number) {
  const [width, setWidth] = useState(0);

  // Layout effect: the stage height must be known before the first paint to avoid layout shift.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => setWidth(Math.round(root.clientWidth));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef]);

  return useMemo(() => computeLayout(width || FALLBACK_WIDTH, count), [width, count]);
}
