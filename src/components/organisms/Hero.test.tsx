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
vi.mock('../webgl/HeroBackground', () => ({ HeroBackground: () => null }));

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

  it('muestra titular, subtexto y disponibilidad en español', () => {
    renderHero();
    expect(screen.getByText('Ingeniero en Sistemas · Desarrollo web, bases de datos y cloud')).toBeTruthy();
    expect(screen.getByText(/quinto año de Ingeniería en Sistemas de Información en la UAM/)).toBeTruthy();
    expect(screen.getByText('Busco pasantía o empleo · Managua o remoto')).toBeTruthy();
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
