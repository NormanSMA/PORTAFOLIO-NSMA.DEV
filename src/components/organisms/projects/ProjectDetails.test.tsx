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
    expect(code.getAttribute('target')).toBe('_blank');
    expect(code.getAttribute('rel')).toBe('noopener noreferrer');
    expect(code.textContent).toContain('(abre en una pestaña nueva)');
  });

  it('todos los enlaces externos de todos los proyectos abren en otra ventana', () => {
    for (const project of projects) {
      const { unmount } = renderDetails(project);
      const links = screen.queryAllByRole('link');
      if (!project.privateCode) expect(links.length, project.id).toBeGreaterThan(0);
      for (const link of links) {
        expect(link.getAttribute('target'), project.id).toBe('_blank');
        expect(link.getAttribute('rel'), project.id).toBe('noopener noreferrer');
      }
      unmount();
    }
  });

  it('omite el enlace al repositorio cuando no existe', () => {
    renderDetails(byId('portfolio'));

    expect(screen.getByRole('link', { name: /Ver demo/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Ver código/ })).toBeNull();
  });

  it('con codigo privado muestra la etiqueta en lugar de los enlaces', () => {
    renderDetails(byId('tracore'));

    expect(screen.getByText('Código privado (Cliente / Tesis PCE)')).toBeTruthy();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('omite el enlace a la demo cuando no existe', () => {
    renderDetails(byId('claudehub'));

    expect(screen.queryByRole('link', { name: /Ver demo/ })).toBeNull();
    expect(screen.getByRole('link', { name: /Ver código/ })).toBeTruthy();
  });

  it('el boton relleno es el enlace principal: la demo, o el repo si no hay demo', () => {
    const { unmount } = renderDetails(byId('ecopulse'));
    expect(screen.getByRole('link', { name: /Ver demo/ }).className).toContain('bg-primary-600');
    expect(screen.getByRole('link', { name: /Ver código/ }).className).not.toContain('bg-primary-600');
    unmount();

    renderDetails(byId('claudehub'));
    expect(screen.getByRole('link', { name: /Ver código/ }).className).toContain('bg-primary-600');
  });

  it('los enlaces tienen alto tactil de al menos 44 px', () => {
    renderDetails(byId('ecopulse'));
    for (const link of screen.getAllByRole('link')) {
      expect(link.className).toContain('min-h-target');
    }
  });

  it('no muestra cifras medidas', () => {
    renderDetails(byId('turno'));

    expect(screen.queryByRole('heading', { name: 'Cifras medidas' })).toBeNull();
    expect(screen.queryByText(/^Al \d/)).toBeNull();
    expect(screen.queryByRole('term')).toBeNull();
  });

  it('muestra como mucho 5 etiquetas de tecnologia, en una lista con nombre', () => {
    renderDetails(byId('turno'));

    const list = screen.getByRole('list', { name: 'Tecnologías' });
    const tags = within(list).getAllByRole('listitem');
    expect(tags.length).toBeLessThanOrEqual(5);
    expect(tags.map((tag) => tag.textContent)).toEqual(byId('turno').technologies);
  });

  it('muestra la linea de meta en texto plano: destacado, categoria, anio y estado', () => {
    renderDetails(byId('iuris'));

    const meta = screen.getByText('Destacado').parentElement as HTMLElement;
    expect(meta.textContent).toBe('Destacado·Astro & Cloud·2026·En producción');
  });

  it('usa h3 para el titulo y marca solo los destacados', () => {
    const { unmount } = renderDetails(byId('iuris'));
    expect(screen.getByRole('heading', { level: 3, name: 'Iuris Consultus' })).toBeTruthy();
    expect(screen.getByText('Destacado')).toBeTruthy();
    unmount();

    renderDetails(byId('systech'));
    expect(screen.queryByText('Destacado')).toBeNull();
  });

  it('muestra los puntos clave entre la descripcion y las tecnologias', () => {
    const project = byId('autofinops');
    renderDetails(project);
    for (const highlight of project.highlights) expect(screen.getByText(highlight)).toBeTruthy();

    const first = screen.getByText(project.highlights[0]);
    const technologies = screen.getByRole('list', { name: 'Tecnologías' });
    const description = screen.getByText(project.description);
    expect(description.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(first.compareDocumentPosition(technologies) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('incluye la galeria con una miniatura por vista', () => {
    const project = byId('tracore');
    renderDetails(project);
    expect(screen.getByRole('list', { name: 'Vistas del proyecto' }).querySelectorAll('button')).toHaveLength(
      project.gallery.length,
    );
  });
});
