import { afterEach, describe, expect, it, vi } from 'vitest';
import { isIntroPlaying, markIntroLanded, onIntroLanded, startIntroIfAllowed } from './intro';

function stubMotion(reduced: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query === '(prefers-reduced-motion: no-preference)' ? !reduced : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  delete document.documentElement.dataset.intro;
  window.history.replaceState(null, '', '/');
  vi.useRealTimers();
});

describe('estado de la intro de la pagina', () => {
  it('con movimiento permitido y sin hash empieza en playing', () => {
    stubMotion(false);
    startIntroIfAllowed();
    expect(isIntroPlaying()).toBe(true);
  });

  it('con movimiento reducido no hay intro', () => {
    stubMotion(true);
    startIntroIfAllowed();
    expect(isIntroPlaying()).toBe(false);
    expect(document.documentElement.dataset.intro).toBeUndefined();
  });

  it('un enlace con hash va directo a la seccion, sin intro', () => {
    stubMotion(false);
    window.history.replaceState(null, '', '/#projects');
    startIntroIfAllowed();
    expect(isIntroPlaying()).toBe(false);
  });

  it('markIntroLanded pasa a landed y avisa a quien espera', () => {
    stubMotion(false);
    startIntroIfAllowed();
    const callback = vi.fn();
    onIntroLanded(callback);
    expect(callback).not.toHaveBeenCalled();

    markIntroLanded();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(isIntroPlaying()).toBe(false);
    expect(document.documentElement.dataset.intro).toBe('landed');
  });

  it('sin intro, onIntroLanded llama al momento', () => {
    const callback = vi.fn();
    onIntroLanded(callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('quien deja de esperar no recibe el aviso', () => {
    stubMotion(false);
    startIntroIfAllowed();
    const callback = vi.fn();
    onIntroLanded(callback)();
    markIntroLanded();
    expect(callback).not.toHaveBeenCalled();
  });

  it('si la intro nunca aterriza, el plazo la da por terminada', () => {
    vi.useFakeTimers();
    stubMotion(false);
    startIntroIfAllowed();
    expect(isIntroPlaying()).toBe(true);
    vi.advanceTimersByTime(9100);
    expect(isIntroPlaying()).toBe(false);
  });
});
