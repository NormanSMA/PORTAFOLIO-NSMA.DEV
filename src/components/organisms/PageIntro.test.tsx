import { afterEach, describe, expect, it, vi } from 'vitest';

// GSAP and its ScrollTrigger call matchMedia when they load, so the stub must exist before the imports run.
vi.hoisted(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  })) as unknown as typeof window.matchMedia;
});

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { PageIntro } from './PageIntro';

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.intro;
});

describe('PageIntro', () => {
  it('sin intro no pinta nada', () => {
    const { container } = render(<PageIntro />);
    expect(container.firstChild).toBeNull();
  });

  it('con intro pinta un velo y un marco ocultos a la tecnologia de apoyo y sin capturar clics', () => {
    document.documentElement.dataset.intro = 'playing';
    const { container } = render(<PageIntro />);
    const layer = container.firstElementChild as HTMLElement;
    expect(layer.getAttribute('aria-hidden')).toBe('true');
    expect(layer.className).toContain('pointer-events-none');
    expect(layer.querySelector('rect')).not.toBeNull();
    expect(layer.querySelectorAll('span')).toHaveLength(4);
  });

  it('cualquier tecla salta la intro: aterriza y se quita', () => {
    document.documentElement.dataset.intro = 'playing';
    const { container } = render(<PageIntro />);
    expect(document.documentElement.dataset.intro).toBe('playing');

    act(() => {
      fireEvent.keyDown(window, { key: 'Enter' });
    });
    expect(document.documentElement.dataset.intro).toBe('landed');
    expect(container.firstChild).toBeNull();
  });
});
