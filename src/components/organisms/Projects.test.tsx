import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';

// gsap's ScrollTrigger and useMediaQuery call window.matchMedia, so the stub must exist before the imports run.
vi.hoisted(() => {
  window.matchMedia = ((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  })) as unknown as typeof window.matchMedia;
});

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { Projects } from './Projects';

// Plain DOM queries: role queries walk the whole accessibility tree, which is slow with seven ring cards.
const frontCard = () => document.querySelector('.mh-card[tabindex="0"]') as HTMLElement;
const filledLink = () => document.querySelector('.ficha-enter a.bg-primary-600') as HTMLAnchorElement;
const fichaTitle = () => document.querySelector('.ficha-enter h3')?.textContent;
const nextProject = () => fireEvent.click(screen.getByText('Proyecto siguiente'));

beforeEach(() => {
  vi.spyOn(window, 'open').mockImplementation(() => null);
  render(
    <LanguageProvider>
      <Projects />
    </LanguageProvider>,
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Projects: anillo y ficha', () => {
  it('la tarjeta frontal abre la demo del proyecto en una pestana nueva', () => {
    fireEvent.click(frontCard());
    expect(window.open).toHaveBeenCalledWith('https://ecopulse-eta-two.vercel.app/', '_blank', 'noopener,noreferrer');
  });

  it('el nombre accesible de la frontal incluye el aviso de pestana nueva', () => {
    expect(frontCard().getAttribute('aria-label')).toBe('1 de 7: EcoPulse (abre en una pestaña nueva)');
  });

  it('sin demo, la tarjeta frontal abre el repositorio', () => {
    for (let step = 0; step < 3; step += 1) nextProject();
    expect(fichaTitle()).toBe('ClaudeHub');
    fireEvent.click(frontCard());
    expect(window.open).toHaveBeenCalledWith('https://github.com/NormanSMA/ClaudeHub', '_blank', 'noopener,noreferrer');
  });

  it('la tarjeta frontal abre el mismo destino que el boton relleno de la ficha', () => {
    for (let step = 0; step < 7; step += 1) {
      const filled = filledLink();
      expect(filled).not.toBeNull();
      fireEvent.click(frontCard());
      expect(window.open).toHaveBeenLastCalledWith(filled.getAttribute('href'), '_blank', 'noopener,noreferrer');
      nextProject();
    }
  });

  it('la ficha sigue al proyecto activo y no tiene cifras', () => {
    expect(fichaTitle()).toBe('EcoPulse');
    nextProject();
    expect(fichaTitle()).toBe('Turno');
    expect(screen.queryByText('Cifras medidas')).toBeNull();
  });
});
