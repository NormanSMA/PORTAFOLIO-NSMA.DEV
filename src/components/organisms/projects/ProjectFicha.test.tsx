import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { getProjects } from '../../../data/projects';
import { translations } from '../../../i18n/translations';
import { ProjectFicha } from './ProjectFicha';

afterEach(cleanup);

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
    expect(region().className).toContain('max-w-2xl');
    expect(region().className).not.toMatch(/\b(border|bg-|p-card|shadow)/);
  });

  it('muestra solo la ficha del proyecto activo para la tecnologia de apoyo', () => {
    renderFicha(1);

    const titles = screen.getAllByRole('heading', { level: 3 });
    expect(titles.map((title) => title.textContent)).toEqual(['Turno']);
  });

  it('cambia de ficha al cambiar el proyecto activo y reinicia la entrada', () => {
    const { show } = renderFicha(0);
    const first = enterBlock();
    expect(first.className).toContain('ficha-enter');

    show(3);

    expect(screen.getByRole('heading', { level: 3, name: 'ClaudeHub' })).toBeTruthy();
    expect(enterBlock()).not.toBe(first);
  });

  it('reserva la altura de la mas alta solo desde md, con copias ocultas e inertes', () => {
    renderFicha(0);

    const copies = Array.from(region().querySelectorAll('[aria-hidden="true"][inert]'));
    expect(copies).toHaveLength(projects.length);
    for (const copy of copies) {
      expect(copy.className).toContain('invisible');
      expect(copy.className).toContain('max-md:hidden');
      expect(copy.querySelectorAll('a')).not.toHaveLength(0);
    }
  });
});
