import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';

const scrollToSection = vi.hoisted(() => vi.fn());
vi.mock('../../lib/scroll', () => ({ scrollToSection }));

import { motion } from '../../config/motion';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { Navbar } from './Navbar';

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  observed: Element[] = [];
  private callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element) {
    this.observed.push(element);
  }

  disconnect() {
    this.observed = [];
  }

  unobserve() {}

  takeRecords() {
    return [];
  }

  cross(target: Element, isIntersecting: boolean) {
    this.callback([{ target, isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

function stubMatchMedia(matching: string[]) {
  window.matchMedia = ((query: string) => ({
    matches: matching.includes(query),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
}

function renderNavbar() {
  return render(
    <LanguageProvider>
      <Navbar />
    </LanguageProvider>,
  );
}

const header = () => screen.getByRole('banner');
const openMenuButton = () => screen.getByRole('button', { name: 'Abrir menú' });

beforeAll(() => {
  // jsdom does not implement the modal dialog API.
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
});

beforeEach(() => {
  // The language persists in localStorage, which some Node versions do not expose to jsdom.
  globalThis.localStorage?.clear();
  stubMatchMedia([motion.media.noReducedMotion]);
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  FakeIntersectionObserver.instances = [];
  scrollToSection.mockClear();
  scrollTo(0);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

describe('Navbar enlaces', () => {
  it('muestra los seis enlaces de seccion en un nav con nombre', () => {
    renderNavbar();
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    const labels = within(nav).getAllByRole('link').map((link) => link.textContent);
    expect(labels).toEqual(['Inicio', 'Sobre mí', 'Proyectos', 'Formación', 'Qué hago', 'Contacto']);
  });

  it('navega con scrollToSection al activar un enlace', () => {
    renderNavbar();
    fireEvent.click(screen.getByRole('link', { name: 'Formación' }));
    expect(scrollToSection).toHaveBeenCalledWith('experience');
  });

  it('el boton del logo vuelve al inicio', () => {
    renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: 'Ir al inicio' }));
    expect(scrollToSection).toHaveBeenCalledWith('home');
  });
});

describe('Navbar idioma', () => {
  it('muestra el idioma destino y lo cambia al pulsar', () => {
    renderNavbar();
    const toEnglish = screen.getByRole('button', { name: 'Cambiar idioma a inglés (EN)' });
    expect(toEnglish.textContent).toBe('EN');

    fireEvent.click(toEnglish);

    const toSpanish = screen.getByRole('button', { name: 'Switch language to Spanish (ES)' });
    expect(toSpanish.textContent).toBe('ES');
    expect(screen.getByRole('link', { name: 'What I do' })).toBeTruthy();
  });
});

describe('Navbar seccion activa', () => {
  it('marca home por defecto y ninguna otra', () => {
    renderNavbar();
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    const current = within(nav).getAllByRole('link').filter((link) => link.getAttribute('aria-current') === 'true');
    expect(current.map((link) => link.textContent)).toEqual(['Inicio']);
  });

  it('marca la seccion que cruza la banda de lectura e ignora las que no existen', () => {
    document.body.innerHTML = '<section id="about"></section><section id="projects"></section>';
    renderNavbar();
    const observer = FakeIntersectionObserver.instances.at(-1)!;
    expect(observer.observed.map((element) => element.id)).toEqual(['about', 'projects']);

    act(() => observer.cross(document.getElementById('projects')!, true));

    const projects = within(screen.getByRole('navigation', { name: 'Navegación principal' })).getByRole('link', { name: 'Proyectos' });
    expect(projects.getAttribute('aria-current')).toBe('true');
  });

  it('observa una seccion que se monta despues de la barra', async () => {
    renderNavbar();
    const observer = FakeIntersectionObserver.instances.at(-1)!;
    expect(observer.observed).toHaveLength(0);

    const late = document.createElement('section');
    late.id = 'contact';
    await act(async () => {
      document.body.appendChild(late);
    });

    expect(observer.observed).toContain(late);
  });
});

describe('Navbar menu movil', () => {
  it('abre y cierra con teclado actualizando aria-expanded', () => {
    renderNavbar();
    const trigger = openMenuButton();
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe(dialog.id);

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(document.documentElement.style.overflow).toBe('hidden');

    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('devuelve el foco al boton al cerrar con el boton de cierre', () => {
    renderNavbar();
    const trigger = openMenuButton();
    fireEvent.click(trigger);

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }));

    expect(document.activeElement).toBe(trigger);
  });

  it('cierra el menu y luego navega al elegir un enlace', () => {
    renderNavbar();
    const trigger = openMenuButton();
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog');

    fireEvent.click(within(dialog).getByRole('link', { name: 'Proyectos' }));

    expect(scrollToSection).toHaveBeenCalledWith('projects');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.documentElement.style.overflow).toBe('');
    expect(document.activeElement).toBe(trigger);
  });
});

describe('Navbar ocultar al hacer scroll', () => {
  const hiddenClass = '-translate-y-full';

  it('se oculta al bajar y reaparece al subir', () => {
    renderNavbar();
    expect(header().className).not.toContain(hiddenClass);

    scrollTo(400);
    expect(header().className).toContain(hiddenClass);

    scrollTo(300);
    expect(header().className).not.toContain(hiddenClass);
  });

  it('no se oculta con el foco de teclado dentro', () => {
    const matches = Element.prototype.matches;
    vi.spyOn(Element.prototype, 'matches').mockImplementation(function matchesFocusVisible(this: Element, selector: string) {
      return selector === ':focus-visible' ? true : matches.call(this, selector);
    });
    renderNavbar();

    act(() => screen.getByRole('button', { name: 'Ir al inicio' }).focus());
    scrollTo(400);

    expect(header().className).not.toContain(hiddenClass);
    vi.restoreAllMocks();
  });

  it('no se oculta con reduced motion', () => {
    stubMatchMedia([]);
    renderNavbar();

    scrollTo(400);

    expect(header().className).not.toContain(hiddenClass);
  });

  it('pasa a fondo solido tras hacer scroll', () => {
    renderNavbar();
    const background = header().firstElementChild as HTMLElement;
    expect(background.className).toContain('opacity-0');

    scrollTo(60);

    expect(background.className).toContain('opacity-100');
  });
});
