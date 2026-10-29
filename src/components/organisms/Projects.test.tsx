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

// Plain DOM queries: role queries walk the whole accessibility tree, which is slow with nine ring cards.
const frontLink = () => document.querySelector('.mh-card[aria-current="true"] a') as HTMLAnchorElement;
const filledLink = () => document.querySelector('.ficha-enter a.bg-primary-600') as HTMLAnchorElement;
const fichaTitle = () => document.querySelector('.ficha-enter h3')?.textContent;
const nextProject = () => fireEvent.click(screen.getByText('Proyecto siguiente'));

// Clicks the link and reports whether the component cancelled it. The document listener runs after React's
// and cancels the navigation anyway, so jsdom never tries to navigate.
function clickLink(anchor: HTMLAnchorElement) {
  let prevented = false;
  const guard = (event: Event) => {
    prevented = event.defaultPrevented;
    event.preventDefault();
  };
  document.addEventListener('click', guard);
  fireEvent.click(anchor);
  document.removeEventListener('click', guard);
  return prevented;
}

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
  it('la tarjeta frontal es un enlace real a la demo que abre en una pestana nueva', () => {
    for (let step = 0; step < 3; step += 1) nextProject();
    expect(fichaTitle()).toBe('EcoPulse');
    const link = frontLink();
    expect(link.getAttribute('href')).toBe('https://ecopulse-eta-two.vercel.app/');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(clickLink(link)).toBe(false);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('el nombre accesible de la frontal incluye el aviso de pestana nueva', () => {
    expect(frontLink().getAttribute('aria-label')).toBe('1 de 9: AutoFinOps-NI (abre en una pestaña nueva)');
  });

  it('sin demo, la tarjeta frontal enlaza el repositorio', () => {
    expect(frontLink().getAttribute('href')).toBe('https://github.com/NormanSMA/autofinops-rpa-engine');
    for (let step = 0; step < 4; step += 1) nextProject();
    expect(fichaTitle()).toBe('ClaudeHub');
    expect(frontLink().getAttribute('href')).toBe('https://github.com/NormanSMA/ClaudeHub');
    expect(frontLink().getAttribute('target')).toBe('_blank');
  });

  it('la tarjeta frontal enlaza el mismo destino que el boton relleno de la ficha', () => {
    for (let step = 0; step < 9; step += 1) {
      const filled = filledLink();
      if (fichaTitle() === 'TRACORE') {
        // Private code: no demo and no repo, so the card is not a link.
        expect(filled).toBeNull();
        expect(frontLink()).toBeNull();
      } else {
        expect(filled).not.toBeNull();
        expect(frontLink().getAttribute('href')).toBe(filled.getAttribute('href'));
      }
      nextProject();
    }
  });

  it('todos los enlaces externos de la seccion abren otra pestana de forma segura', () => {
    for (let step = 0; step < 9; step += 1) {
      const external = document.querySelectorAll<HTMLAnchorElement>('#projects a[href^="http"]');
      if (fichaTitle() !== 'TRACORE') expect(external.length).toBeGreaterThan(0);
      external.forEach((anchor) => {
        expect(anchor.getAttribute('target'), anchor.href).toBe('_blank');
        expect(anchor.getAttribute('rel'), anchor.href).toBe('noopener noreferrer');
      });
      nextProject();
    }
  });

  it('la ficha sigue al proyecto activo y no tiene cifras', () => {
    expect(fichaTitle()).toBe('AutoFinOps-NI');
    nextProject();
    expect(fichaTitle()).toBe('TRACORE');
    expect(screen.queryByText('Cifras medidas')).toBeNull();
  });
});
