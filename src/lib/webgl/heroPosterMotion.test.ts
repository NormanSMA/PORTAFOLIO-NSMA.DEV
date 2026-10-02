import { describe, it, expect } from 'vitest';
import { HALF_LENGTH } from './heroCurve';
import { SWEEP_ANIMATION, posterMotionCss, readPosterSeconds } from './heroPosterMotion';

function stageWith(animations: Array<{ animationName: string; currentTime: unknown }>) {
  return { getAnimations: () => animations } as unknown as Pick<Element, 'getAnimations'>;
}

describe('posterMotionCss', () => {
  const css = posterMotionCss();
  const sweep = css.match(new RegExp(`@keyframes ${SWEEP_ANIMATION}\\{(.*?)\\}\\}`))?.[1] ?? '';

  it('mueve el póster solo con prefers-reduced-motion: no-preference', () => {
    const mediaStart = css.indexOf('@media (prefers-reduced-motion:no-preference)');
    expect(mediaStart).toBeGreaterThan(0);
    expect(css.slice(0, mediaStart)).not.toMatch(/animation:/);
    expect(css.slice(mediaStart)).toMatch(/\.hero-poster-pulse\{animation:/);
    expect(css.slice(mediaStart)).toMatch(/\.hero-poster-spark\{animation:/);
  });

  it('oculta el destello cuando no hay animación', () => {
    expect(css).toContain('.hero-poster-spark{opacity:0}');
  });

  it('pausa las animaciones mientras el canvas cubre el póster', () => {
    expect(css).toContain("[data-scene='live']");
    expect(css).toContain('animation-play-state:paused');
  });

  it('recorre la curva de punta a punta con pasos que respetan el ease in-out', () => {
    const xs = [...sweep.matchAll(/translate\((-?[\d.]+)px/g)].map((match) => Number(match[1]));
    expect(xs[0]).toBeCloseTo(-HALF_LENGTH);
    expect(xs[xs.length - 1]).toBeCloseTo(HALF_LENGTH);
    expect(xs[Math.floor(xs.length / 2)]).toBeCloseTo(0);
    // Slower at the start than in the middle: the second stop has advanced less than a linear sweep would.
    expect(xs[1] - xs[0]).toBeLessThan((xs[xs.length - 1] - xs[0]) / (xs.length - 1));
  });

  it('atenúa el destello hacia los extremos igual que el filamento', () => {
    const opacities = [...sweep.matchAll(/opacity:([\d.]+)\}/g)].map((match) => Number(match[1]));
    expect(Math.min(...opacities)).toBeCloseTo(0.35, 1);
    expect(Math.max(...opacities)).toBe(1);
  });
});

describe('readPosterSeconds', () => {
  it('lee el tiempo de la animación del destello en segundos', () => {
    const stage = stageWith([
      { animationName: 'hero-poster-pulse', currentTime: 9000 },
      { animationName: SWEEP_ANIMATION, currentTime: 1500 },
    ]);
    expect(readPosterSeconds(stage)).toBe(1.5);
  });

  it('devuelve 0 si la animación no existe, como con reduced motion', () => {
    expect(readPosterSeconds(stageWith([]))).toBe(0);
  });

  it('devuelve 0 si el navegador no ofrece getAnimations', () => {
    expect(readPosterSeconds({} as Pick<Element, 'getAnimations'>)).toBe(0);
  });

  it('ignora un tiempo no numérico', () => {
    expect(readPosterSeconds(stageWith([{ animationName: SWEEP_ANIMATION, currentTime: null }]))).toBe(0);
  });
});
