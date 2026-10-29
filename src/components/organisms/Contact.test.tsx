import { describe, it, expect, afterEach, vi } from 'vitest';

// ScrollTrigger calls window.matchMedia while registering, so the stub must exist before the imports run.
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

import { render, screen, cleanup, within } from '@testing-library/react';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { LANGUAGE_CONFIG } from '../../config/constants';
import { translations } from '../../i18n/translations';
import { Contact } from './Contact';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const es = translations.es.contact;
const en = translations.en.contact;

// jsdom here exposes no usable localStorage, so the language is injected through a Map-backed stub.
function renderContact(language: 'es' | 'en' = 'es') {
  const store = new Map<string, string>([[LANGUAGE_CONFIG.storageKey, language]]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  });
  return render(
    <LanguageProvider>
      <Contact />
    </LanguageProvider>,
  );
}

describe('Contact', () => {
  it('es la seccion #contact con su titulo h2 enlazado por aria-labelledby', () => {
    const { container } = renderContact();

    const section = container.querySelector('section#contact');
    expect(section?.getAttribute('aria-labelledby')).toBe('contact-heading');
    const heading = screen.getByRole('heading', { level: 2, name: es.title });
    expect(heading.id).toBe('contact-heading');
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });

  it('muestra la frase breve y la linea de disponibilidad', () => {
    renderContact();

    expect(screen.getByText(es.description)).toBeTruthy();
    expect(screen.getByText('Disponible para empleo o pasantía · Managua o remoto')).toBeTruthy();
  });

  it('lista tres enlaces en este orden: correo, GitHub y LinkedIn', () => {
    renderContact();

    const list = screen.getByRole('list', { name: es.channels.label });
    const links = within(list).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'mailto:norman.martinez003@gmail.com',
      'https://github.com/NormanSMA',
      'https://www.linkedin.com/in/norman-martinez',
    ]);
  });

  it('cada enlace muestra su etiqueta y su valor visible', () => {
    renderContact();

    const [email, github, linkedin] = screen.getAllByRole('link');
    expect(email.textContent).toContain(es.channels.email);
    expect(email.textContent).toContain('norman.martinez003@gmail.com');
    expect(github.textContent).toContain(es.channels.github);
    expect(github.textContent).toContain('github.com/NormanSMA');
    expect(linkedin.textContent).toContain(es.channels.linkedin);
    expect(linkedin.textContent).toContain('linkedin.com/in/norman-martinez');
  });

  it('GitHub y LinkedIn abren en pestana nueva con rel seguro y aviso oculto; el correo no', () => {
    renderContact();

    const [email, github, linkedin] = screen.getAllByRole('link');
    for (const link of [github, linkedin]) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.textContent).toContain(es.channels.newTab);
    }
    expect(email.getAttribute('target')).toBeNull();
    expect(email.getAttribute('rel')).toBeNull();
    expect(email.textContent).not.toContain(es.channels.newTab);
  });

  it('cada enlace envuelve una Card y dibuja un icono decorativo', () => {
    renderContact();

    for (const link of screen.getAllByRole('link')) {
      expect(link.querySelector('[data-variant="info"]')).not.toBeNull();
      expect(link.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    }
  });

  it('ya no hay formulario ni campos de entrada', () => {
    const { container } = renderContact();

    expect(container.querySelector('form, input, textarea, select, button')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('en ingles usa el titulo y las etiquetas en ingles con los mismos enlaces', () => {
    renderContact('en');

    expect(screen.getByRole('heading', { level: 2, name: en.title })).toBeTruthy();
    expect(screen.getByText(en.availability)).toBeTruthy();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[0].textContent).toContain(en.channels.email);
    expect(links[1].textContent).toContain(en.channels.newTab);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'mailto:norman.martinez003@gmail.com',
      'https://github.com/NormanSMA',
      'https://www.linkedin.com/in/norman-martinez',
    ]);
  });
});
