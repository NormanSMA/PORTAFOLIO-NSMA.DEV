import { describe, it, expect, vi, afterEach } from 'vitest';

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

vi.mock('../../lib/scroll', () => ({ scrollToSection: vi.fn() }));

import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { scrollToSection } from '../../lib/scroll';
import { Hero } from './Hero';

const REDUCED = '(prefers-reduced-motion: reduce)';

function renderHero() {
  return render(
    <LanguageProvider>
      <Hero />
    </LanguageProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.mocked(scrollToSection).mockClear();
  media.matching = [];
});

describe('Hero', () => {
  it('tiene un único h1 con el nombre completo como nombre accesible', () => {
    renderHero();
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].getAttribute('aria-label')).toBe('Norman Martínez');
  });

  it('muestra el titular en dos líneas cortas y la disponibilidad en español', () => {
    renderHero();
    expect(screen.getByText('Ingeniero en Sistemas')).toBeTruthy();
    expect(screen.getByText('Desarrollo web, bases de datos y cloud')).toBeTruthy();
    expect(screen.getByText('Busco pasantía o empleo · Managua o remoto')).toBeTruthy();
  });

  it('no repite un resumen: solo nombre, titular, disponibilidad y el CTA', () => {
    const { container } = renderHero();
    expect(container.querySelectorAll('p')).toHaveLength(2);
    expect(screen.queryByText(/quinto año/)).toBeNull();
  });

  it('ofrece un solo CTA que lleva a projects con scrollToSection', () => {
    renderHero();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);

    const cta = screen.getByRole('link', { name: 'Ver proyectos' });
    expect(cta.getAttribute('href')).toBe('#projects');

    const notPrevented = fireEvent.click(cta);
    expect(notPrevented).toBe(false);
    expect(scrollToSection).toHaveBeenCalledWith('projects');
  });

  it('junto al texto hay un lienzo descrito como una sola imagen con las cuatro etiquetas de los nodos', () => {
    renderHero();
    const canvas = screen.getByRole('img', { name: /ordenar, alinear, conectar y fluir/ });
    expect(canvas.closest('#home')).toBeTruthy();
    expect(canvas.textContent).toBe('OrdenarAlinearConectarFluir');
  });

  it('con movimiento, la disponibilidad y el botón entran por opacidad y siguen en el orden de tabulación', () => {
    media.matching = ['(prefers-reduced-motion: no-preference)'];
    renderHero();
    const availability = screen.getByText('Busco pasantía o empleo · Managua o remoto');
    const cta = screen.getByRole('link', { name: 'Ver proyectos' });
    expect(availability.style.opacity).toBe('0');
    expect(cta.style.opacity).toBe('0');
    expect(cta.style.visibility).toBe('');
    expect(cta.style.pointerEvents).toBe('');

    cta.focus();
    expect(document.activeElement).toBe(cta);
  });

  it('el nombre y las dos líneas del rol nunca se ocultan para el reveal', () => {
    media.matching = ['(prefers-reduced-motion: no-preference)'];
    renderHero();
    for (const text of ['Ingeniero en Sistemas', 'Desarrollo web, bases de datos y cloud']) {
      const line = screen.getByText(text);
      expect(line.style.opacity).toBe('');
      expect(line.closest('[data-hero-reveal]')).toBeNull();
    }
  });

  it('con reduced motion la disponibilidad y el botón se ven desde el primer pintado', () => {
    media.matching = [REDUCED];
    renderHero();
    expect(screen.getByText('Busco pasantía o empleo · Managua o remoto').style.opacity).toBe('');
    expect(screen.getByRole('link', { name: 'Ver proyectos' }).style.opacity).toBe('');
  });

  it('con reduced motion pinta el nombre como texto plano', () => {
    media.matching = [REDUCED];
    renderHero();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBe('Norman Martínez');
    expect(heading.querySelector('.split-char')).toBeNull();
  });

  it('sin reduced motion divide el nombre en letras', () => {
    renderHero();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.querySelectorAll('.split-char')).toHaveLength('NormanMartínez'.length);
  });
});
