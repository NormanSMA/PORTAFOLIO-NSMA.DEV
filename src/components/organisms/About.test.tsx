import { describe, it, expect, afterEach, vi } from 'vitest';

// ScrollTrigger calls window.matchMedia while registering, so the stub must exist before the imports run.
// Nothing matches, so useMotion takes the reduced-motion path and the content stays as rendered.
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

import { render, screen, cleanup } from '@testing-library/react';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { LANGUAGE_CONFIG } from '../../config/constants';
import { About } from './About';

// jsdom here exposes no usable localStorage, so the language is injected through a Map-backed stub.
function renderAbout(language: 'es' | 'en') {
  const store = new Map<string, string>([[LANGUAGE_CONFIG.storageKey, language]]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  });
  return render(
    <LanguageProvider>
      <About />
    </LanguageProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('About', () => {
  it('expone la seccion about con su h2 como etiqueta', () => {
    const { container } = renderAbout('es');
    const section = container.querySelector('section#about');
    const heading = screen.getByRole('heading', { level: 2, name: 'Sobre mí' });

    expect(section?.getAttribute('aria-labelledby')).toBe('about-heading');
    expect(heading.id).toBe('about-heading');
  });

  it('muestra la foto con texto alternativo, carga diferida y tamano intrinseco', () => {
    renderAbout('es');
    const photo = screen.getByRole('img', { name: /Retrato de Norman Martínez/ });

    expect(photo.getAttribute('loading')).toBe('lazy');
    expect(photo.getAttribute('decoding')).toBe('async');
    expect(photo.getAttribute('width')).toBe('1600');
    expect(photo.getAttribute('height')).toBe('2000');
    expect(photo.getAttribute('srcset')).toContain('/norman_sf-1200w.webp 1200w');
  });

  it('centra la foto en pantallas estrechas y la suelta de la columna en escritorio', () => {
    renderAbout('es');
    const frame = screen.getByRole('img', { name: /Retrato de Norman Martínez/ }).closest('[data-reveal]');

    expect(frame?.classList.contains('mx-auto')).toBe(true);
    expect(frame?.classList.contains('lg:mx-0')).toBe(true);
  });

  it('no muestra estadisticas ni cifras de experiencia', () => {
    renderAbout('es');

    expect(screen.queryByText(/Proyectos Completados/i)).toBeNull();
    expect(screen.queryByText(/Años de Experiencia/i)).toBeNull();
    expect(screen.queryByText(/Tecnologías Dominadas/i)).toBeNull();
  });

  it('ya no incluye el stack tecnico: vive en Formacion y stack', () => {
    renderAbout('es');

    expect(screen.queryByText('Stack técnico')).toBeNull();
    expect(screen.queryByRole('list', { name: 'Lenguajes' })).toBeNull();
  });

  it('traduce el contenido al ingles', () => {
    renderAbout('en');

    expect(screen.getByRole('heading', { level: 2, name: 'About me' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'See projects' }).getAttribute('href')).toBe('#projects');
  });
});
