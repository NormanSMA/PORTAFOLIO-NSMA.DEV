import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';

// ScrollTrigger calls window.matchMedia while registering, so the stub must exist before the imports run.
const media = vi.hoisted(() => {
  const state = { matching: [] as string[] };
  window.matchMedia = ((query: string) => ({
    matches: state.matching.includes(query),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  })) as unknown as typeof window.matchMedia;
  return state;
});

import { scrollToSection, startSmoothScroll } from './scroll';

describe('scrollToSection sin Lenis', () => {
  let scrollIntoView: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    media.matching = [];
    scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView as unknown as typeof Element.prototype.scrollIntoView;
    document.body.innerHTML = '<section id="contact"></section>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('usa scroll suave nativo cuando el usuario permite movimiento', () => {
    scrollToSection('contact');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('salta sin animación con prefers-reduced-motion: reduce', () => {
    media.matching = ['(prefers-reduced-motion: reduce)'];
    scrollToSection('contact');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
  });

  it('ignora un id que no existe', () => {
    scrollToSection('missing');
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

describe('startSmoothScroll', () => {
  it('no crea Lenis con puntero táctil y devuelve una limpieza segura', () => {
    media.matching = [];
    const stop = startSmoothScroll();
    expect(() => stop()).not.toThrow();
  });
});
