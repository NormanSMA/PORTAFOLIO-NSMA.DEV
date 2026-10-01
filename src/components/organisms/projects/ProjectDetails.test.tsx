import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { getProjects } from '../../../data/projects';
import { translations } from '../../../i18n/translations';
import type { LocalizedProject } from '../../../types';
import { ProjectDetails } from './ProjectDetails';

afterEach(cleanup);

const translateEs = (key: string) => {
  const value = key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], translations.es);
  return typeof value === 'string' ? value : key;
};

const projects = getProjects(translateEs);
const byId = (id: string): LocalizedProject => {
  const project = projects.find((p) => p.id === id);
  if (!project) throw new Error(`Proyecto ${id} no encontrado`);
  return project;
};

function renderDetails(project: LocalizedProject) {
  return render(
    <LanguageProvider>
      <ProjectDetails project={project} />
    </LanguageProvider>,
  );
}

describe('ProjectDetails', () => {
  it('abre los enlaces en pestana nueva y avisa a los lectores de pantalla', () => {
    renderDetails(byId('ecopulse'));

    const demo = screen.getByRole('link', { name: /Ver demo/ });
    const code = screen.getByRole('link', { name: /Ver código/ });

    expect(demo.getAttribute('href')).toBe('https://ecopulse-eta-two.vercel.app/');
    expect(demo.getAttribute('target')).toBe('_blank');
    expect(demo.getAttribute('rel')).toBe('noopener noreferrer');
    expect(demo.textContent).toContain('(abre en una pestaña nueva)');
    expect(code.getAttribute('href')).toBe('https://github.com/NormanSMA/EcoPulse');
  });

  it('omite el enlace al repositorio cuando no existe', () => {
    renderDetails(byId('portfolio'));

    expect(screen.getByRole('link', { name: /Ver demo/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Ver código/ })).toBeNull();
  });

  it('omite el enlace a la demo cuando no existe', () => {
    renderDetails(byId('claudehub'));

    expect(screen.queryByRole('link', { name: /Ver demo/ })).toBeNull();
    expect(screen.getByRole('link', { name: /Ver código/ })).toBeTruthy();
  });

  it('muestra cada cifra con su fecha de medicion', () => {
    renderDetails(byId('turno'));

    const list = screen.getByRole('heading', { name: 'Cifras medidas' }).parentElement as HTMLElement;
    expect(within(list).getByText('669')).toBeTruthy();
    expect(within(list).getAllByText(/^Al 27 sep/).length).toBe(3);
    expect(within(list).getByText(/^Al 31 ago 2026$/)).toBeTruthy();
  });

  it('no muestra el bloque de cifras cuando el proyecto no tiene', () => {
    renderDetails(byId('iuris'));

    expect(screen.queryByRole('heading', { name: 'Cifras medidas' })).toBeNull();
  });

  it('usa h3 para el titulo y marca solo los destacados', () => {
    const { unmount } = renderDetails(byId('turno'));
    expect(screen.getByRole('heading', { level: 3, name: 'Turno' })).toBeTruthy();
    expect(screen.getByText('Destacado')).toBeTruthy();
    unmount();

    renderDetails(byId('systech'));
    expect(screen.queryByText('Destacado')).toBeNull();
  });
});
