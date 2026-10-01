import { useEffect, useRef } from 'react';
import { useMediaQuery } from '../../hooks';
import { readHeroEnvironment, shouldEnableWebGL } from '../../lib/webgl/heroGate';
import type { HeroScene } from '../../lib/webgl/heroScene';
import { HeroPoster } from './HeroPoster';

// Creating the GPU context and linking the shader is one 60 ms task on desktop and several times that on a phone.
// Waiting out the entrance animation and the load work keeps that task from landing on top of them.
const SETTLE_MS = 3000;
// Upper bound so a busy main thread cannot hold the canvas back for good.
const IDLE_TIMEOUT_MS = 1500;
const FALLBACK_DELAY_MS = 300;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function whenIdle(task: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(task, { timeout: IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, FALLBACK_DELAY_MS);
  return () => window.clearTimeout(id);
}

function whenSettled(task: () => void): () => void {
  let cancelIdle = () => {};
  const settle = window.setTimeout(() => {
    cancelIdle = whenIdle(task);
  }, SETTLE_MS);
  return () => {
    window.clearTimeout(settle);
    cancelIdle();
  };
}

// The poster paints with the page; the canvas is created later, only where WebGL pays off, and fades in over it.
export function HeroBackground() {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  useEffect(() => {
    const host = hostRef.current;
    const stage = stageRef.current;
    if (!host || !stage || reducedMotion || !shouldEnableWebGL(readHeroEnvironment())) return;

    let cancelled = false;
    let scene: HeroScene | null = null;

    const cancelScheduled = whenSettled(() => {
      import('../../lib/webgl/heroScene')
        .then(({ mountHeroScene }) => {
          if (!cancelled) scene = mountHeroScene({ host, stage });
        })
        .catch(() => {
          // A failed chunk leaves the poster, which is already a complete hero.
        });
    });

    return () => {
      cancelled = true;
      cancelScheduled();
      scene?.dispose();
    };
  }, [reducedMotion]);

  return (
    <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-below overflow-hidden">
      <HeroPoster stageRef={stageRef} />
    </div>
  );
}
