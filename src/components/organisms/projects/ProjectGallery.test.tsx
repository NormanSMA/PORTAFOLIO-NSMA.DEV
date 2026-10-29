import { describe, it, expect, afterEach, vi } from 'vitest';

// useMediaQuery calls window.matchMedia, which jsdom does not implement.
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

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { getProjects } from '../../../data/projects';
import { translations } from '../../../i18n/translations';
import type { LocalizedProject } from '../../../types';
import { ProjectGallery } from './ProjectGallery';

afterEach(cleanup);

const translateEs = (key: string) => {
  const value = key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], translations.es);
  return typeof value === 'string' ? value : key;
};

const projects = getProjects(translateEs);
const byId = (id: string): LocalizedProject => projects.find((p) => p.id === id) as LocalizedProject;

const renderGallery = (project: LocalizedProject, measureOnly = false) =>
  render(
    <LanguageProvider>
      <ProjectGallery project={project} measureOnly={measureOnly} />
    </LanguageProvider>,
  );

const thumbnails = () => document.querySelectorAll<HTMLButtonElement>('ul button');
const dialog = () => document.querySelector('dialog') as HTMLDialogElement;
const caption = () => dialog().querySelector('figcaption')?.textContent;

describe('ProjectGallery', () => {
  it('muestra una miniatura por vista y marca la que es video', () => {
    const project = byId('autofinops');
    renderGallery(project);
    expect(thumbnails()).toHaveLength(project.gallery.length);
    expect(screen.getAllByText('Video')).toHaveLength(1);
    expect(document.querySelector('img')?.getAttribute('src')).toBe('/projects/autofinops/demo-960.webp');
  });

  it('cada miniatura es un boton con el texto de su vista', () => {
    const project = byId('tracore');
    renderGallery(project);
    thumbnails().forEach((button, index) => {
      expect(button.getAttribute('aria-label')).toBe(`Ampliar: ${project.gallery[index].label}`);
    });
  });

  it('abre el visor con la vista elegida y avanza y retrocede en bucle', () => {
    const project = byId('tracore');
    renderGallery(project);
    expect(dialog().open).toBe(false);

    fireEvent.click(thumbnails()[1]);
    expect(dialog().open).toBe(true);
    expect(caption()).toBe(project.gallery[1].label);
    expect(dialog().textContent).toContain('2 de 4');

    fireEvent.click(screen.getByLabelText('Vista siguiente'));
    expect(caption()).toBe(project.gallery[2].label);

    fireEvent.click(screen.getByLabelText('Vista anterior'));
    fireEvent.click(screen.getByLabelText('Vista anterior'));
    fireEvent.click(screen.getByLabelText('Vista anterior'));
    expect(caption()).toBe(project.gallery[3].label);
  });

  it('las flechas del teclado cambian de vista y el boton cerrar vacia el visor', () => {
    renderGallery(byId('iuris'));
    fireEvent.click(thumbnails()[0]);
    fireEvent.keyDown(dialog(), { key: 'ArrowRight' });
    expect(dialog().textContent).toContain('2 de 4');
    fireEvent.keyDown(dialog(), { key: 'ArrowLeft' });
    expect(dialog().textContent).toContain('1 de 4');

    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(dialog().open).toBe(false);
    expect(dialog().querySelector('figure')).toBeNull();
  });

  it('un clic en el fondo cierra el visor', () => {
    renderGallery(byId('iuris'));
    fireEvent.click(thumbnails()[0]);
    fireEvent.click(dialog());
    expect(dialog().open).toBe(false);
  });

  it('la vista de video usa un video con controles y la captura como poster', () => {
    renderGallery(byId('autofinops'));
    fireEvent.click(thumbnails()[0]);
    const video = dialog().querySelector('video') as HTMLVideoElement;
    expect(video.getAttribute('src')).toBe('/projects/autofinops/demo.mp4');
    expect(video.getAttribute('poster')).toBe('/projects/autofinops/demo-1440.webp');
    expect(video.controls).toBe(true);
    expect(video.muted).toBe(true);
  });

  it('en modo de medida reserva el espacio sin imagenes, botones ni visor', () => {
    const project = byId('tracore');
    renderGallery(project, true);
    expect(document.querySelectorAll('li')).toHaveLength(project.gallery.length);
    expect(document.querySelector('img')).toBeNull();
    expect(document.querySelector('button')).toBeNull();
    expect(document.querySelector('dialog')).toBeNull();
  });
});
