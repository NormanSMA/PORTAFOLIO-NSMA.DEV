import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { createConstellationEngine, type EngineOptions } from './constellationEngine';
import { createConstellationRenderer, type ConstellationParts } from './constellationDom';
import type { ConstellationGraph } from './constellationGraph';
import { computeLayout, type ConstellationLayout } from './constellationMath';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
// One turn in 40 seconds: slow enough to read the chips as they pass.
const IDLE_DEGREES_PER_SECOND = 9;

type PointerListener = [type: string, handler: (event: PointerEvent) => void];

interface LiveState {
  layout: ConstellationLayout;
  reducedMotion: boolean;
}

function useElementWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);

  // Layout effect: the chip size must be known before the first paint to avoid a visible jump.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => setWidth(Math.round(element.clientWidth));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

function collectParts(root: HTMLElement): ConstellationParts {
  return {
    nodes: Array.from(root.querySelectorAll<HTMLElement>('[data-node]')),
    labels: Array.from(root.querySelectorAll<HTMLElement>('[data-label]')),
    lines: Array.from(root.querySelectorAll<SVGLineElement>('[data-edge]')),
  };
}

// Frames run only while the sphere is on screen and the tab is in front.
function observeVisibility(root: HTMLElement, onChange: (visible: boolean) => void) {
  let intersecting = typeof IntersectionObserver === 'undefined';
  const report = () => onChange(intersecting && !document.hidden);
  const observer =
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver((entries) => {
          intersecting = entries[entries.length - 1].isIntersecting;
          report();
        });
  observer?.observe(root);
  document.addEventListener('visibilitychange', report);
  report();
  return () => {
    observer?.disconnect();
    document.removeEventListener('visibilitychange', report);
  };
}

// Wires the markup to the engine and the renderer. React renders the DOM once; everything that
// moves goes through refs, so a frame or a hover never triggers a render.
export function useConstellation(rootRef: RefObject<HTMLElement | null>, graph: ConstellationGraph) {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const width = useElementWidth(rootRef);
  const layout = useMemo(() => computeLayout(width), [width]);
  const live = useRef<LiveState>({ layout, reducedMotion });
  const refresh = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    live.current = { layout, reducedMotion };
  });

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const parts = collectParts(root);
    const scene = { points: graph.points, edges: graph.edges };
    const renderer = createConstellationRenderer(scene, parts, () => live.current.layout);
    // Getters read the live values, so the engine never holds a stale layout and the options are not rebuilt per frame.
    const options: EngineOptions = {
      idleSpeed: IDLE_DEGREES_PER_SECOND,
      get degreesPerPixel() {
        return live.current.layout.degreesPerPixel;
      },
      get reducedMotion() {
        return live.current.reducedMotion;
      },
      onFrame: renderer.render,
      onDragStart: () => renderer.setActive(-1),
      // Touch has no hover: a tap on a chip shows its name, a second tap or a tap elsewhere hides it.
      onTap: (target, pointerType) => {
        if (pointerType === 'mouse') return;
        const index = renderer.indexOfNode(target);
        renderer.setActive(index === renderer.getActive() ? -1 : index);
      },
    };
    const engine = createConstellationEngine(() => options);

    const isMouse = (event: PointerEvent) => event.pointerType === 'mouse';
    // Hovering the sphere stops the idle spin so a chip holds still under the cursor.
    const listeners: PointerListener[] = [
      ...Object.entries(engine.pointerHandlers),
      ['pointerover', (event) => isMouse(event) && renderer.setActive(renderer.indexOfNode(event.target))],
      ['pointerenter', (event) => isMouse(event) && engine.setPaused(true)],
      [
        'pointerleave',
        (event) => {
          if (!isMouse(event)) return;
          engine.setPaused(false);
          renderer.setActive(-1);
        },
      ],
    ];
    listeners.forEach(([type, handler]) => root.addEventListener(type, handler as EventListener));
    const stopObserving = observeVisibility(root, engine.setVisible);

    refresh.current = () => {
      renderer.measure();
      engine.refresh();
    };
    refresh.current();
    // The names change width once the web font arrives, and the label rules read that width.
    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) refresh.current?.();
    });

    return () => {
      alive = false;
      refresh.current = null;
      stopObserving();
      listeners.forEach(([type, handler]) => root.removeEventListener(type, handler as EventListener));
      engine.dispose();
    };
  }, [rootRef, graph]);

  // A new layout or motion preference redraws the current pose.
  useLayoutEffect(() => {
    refresh.current?.();
  }, [layout, reducedMotion]);

  return { layout };
}
