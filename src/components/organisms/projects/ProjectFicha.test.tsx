import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { getProjects } from '../../../data/projects';
import { translations } from '../../../i18n/translations';
import { ProjectFicha } from './ProjectFicha';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// The reserve mounts only from md up, so each test states the width it simulates.
function stubWidth(isMdUp: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('min-width: 768px') ? isMdUp : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
}

const translateEs = (key: string) => {
  const value = key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], translations.es);
  return typeof value === 'string' ? value : key;
};

const projects = getProjects(translateEs);

function renderFicha(activeIndex: number) {
  const view = (index: number) => (
    <LanguageProvider>
      <ProjectFicha projects={projects} activeIndex={index} />
    </LanguageProvider>
  );
  const result = render(view(activeIndex));
  return { ...result, show: (index: number) => result.rerender(view(index)) };
}

const region = () => screen.getByRole('region', { name: 'Ficha del proyecto' });
const enterBlock = () => region().querySelector('.ficha-enter') as HTMLElement;

describe('ProjectFicha', () => {
  it('es una region anunciada con cortesia, sin caja propia y de ancho acotado', () => {
    renderFicha(0);

    expect(region().getAttribute('aria-live')).toBe('polite');
    expect(region().className).toContain('max-w-4xl');
    expect(region().className).not.toMatch(/\b(border|bg-|p-card|shadow)/);
  });

  it('muestra solo la ficha del proyecto activo para la tecnologia de apoyo', () => {
    renderFicha(5);

    const titles = screen.getAllByRole('heading', { level: 3 });
    expect(titles.map((title) => title.textContent)).toEqual(['Turno']);
  });

  it('cambia de ficha al cambiar el proyecto activo y reinicia la entrada', () => {
    const { show } = renderFicha(0);
    const first = enterBlock();
    expect(first.className).toContain('ficha-enter');

    show(4);

    expect(screen.getByRole('heading', { level: 3, name: 'ClaudeHub' })).toBeTruthy();
    expect(enterBlock()).not.toBe(first);
  });

  it('sin ancho de md no monta las copias de reserva', () => {
    stubWidth(false);
    renderFicha(0);
    expect(region().querySelectorAll('[aria-hidden="true"][inert]')).toHaveLength(0);
  });

  it('reserva la altura de la mas alta solo desde md, con copias ocultas e inertes', () => {
    stubWidth(true);
    renderFicha(0);

    const copies = Array.from(region().querySelectorAll('[aria-hidden="true"][inert]'));
    expect(copies).toHaveLength(projects.length);
    for (const copy of copies) {
      expect(copy.className).toContain('invisible');
      expect(copy.className).toContain('max-md:hidden');
    }
    // TRACORE shows a label instead of links: every other ficha keeps its buttons in the reserved copy.
    expect(copies.filter((copy) => copy.querySelector('a'))).toHaveLength(projects.length - 1);
  });
});
