import { StrictMode } from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';

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

import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { useLanguage } from '../../../hooks';
import { translations } from '../../../i18n/translations';
import { DesignCanvas } from './DesignCanvas';

function LanguageButton() {
  const { toggleLanguage } = useLanguage();
  return <button onClick={toggleLanguage}>toggle</button>;
}

function renderCanvas() {
  return render(
    <LanguageProvider>
      <LanguageButton />
      <DesignCanvas />
    </LanguageProvider>,
  );
}

afterEach(() => {
  cleanup();
  media.matching = [];
  globalThis.localStorage?.clear();
});

describe('DesignCanvas', () => {
  it('es una sola imagen con la descripción de la curva en español', () => {
    renderCanvas();
    const image = screen.getByRole('img');
    expect(image.getAttribute('aria-label')).toBe(translations.es.hero.canvas.label);
    expect(image.getAttribute('aria-label')).toBe(
      'Una curva con cuatro puntos conectados que se acomodan en orden, con un pulso de luz que la recorre',
    );
  });

  it('describe la curva en inglés cuando cambia el idioma', () => {
    renderCanvas();
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(translations.en.hero.canvas.label);
    expect(translations.en.hero.canvas.label).toBe(
      'A curve with four connected points that snap into order, with a pulse of light travelling along it',
    );
  });

  it('no muestra ningún texto: ni etiqueta de marco ni muestras ni palabras sueltas', () => {
    renderCanvas();
    const image = screen.getByRole('img');
    expect(image.textContent).toBe('');
    expect(screen.queryByText('Diseño de interfaces')).toBeNull();
    expect(screen.queryByText('#6366F1')).toBeNull();
    expect(screen.queryByText('Sora')).toBeNull();
  });

  it('ya no declara las claves del marco ni de los tokens', () => {
    expect(Object.keys(translations.es.hero.canvas)).toEqual(['label']);
    expect(Object.keys(translations.en.hero.canvas)).toEqual(['label']);
  });

  it('todo lo visible dentro de la imagen está oculto a la tecnología de asistencia', () => {
    renderCanvas();
    const image = screen.getByRole('img');
    expect(Array.from(image.children).filter((child) => child.getAttribute('aria-hidden') !== 'true')).toHaveLength(0);
    expect(image.querySelectorAll('a, button, input')).toHaveLength(0);
  });

  it('dibuja cuatro nodos, ocho puntos de manija, tres guías y una curva con halo', () => {
    const { container } = renderCanvas();
    expect(container.querySelectorAll('[data-canvas-node]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-canvas-handle-dot]')).toHaveLength(8);
    expect(container.querySelectorAll('[data-canvas-handle-line]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-canvas-guide]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-canvas-curve]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-canvas-halo]')).toHaveLength(1);
  });

  it('el estado de primer pintado es el final: manijas al 30 %, sin pulso ni cursor', () => {
    const { container } = renderCanvas();
    container.querySelectorAll('[data-canvas-handles]').forEach((group) => {
      expect(group.getAttribute('class')).toContain('opacity-30');
    });
    expect((container.querySelector('[data-canvas-pulse]') as HTMLElement).className).toContain('opacity-0');
    expect((container.querySelector('[data-canvas-cursor]') as HTMLElement).className).toContain('opacity-0');
    container.querySelectorAll('[data-canvas-node]').forEach((node) => {
      expect(node.getAttribute('data-active')).toBe('false');
    });
  });

  it('sin reduced motion arranca el ciclo con los nodos desalineados y lo limpia al desmontar', () => {
    media.matching = ['(prefers-reduced-motion: no-preference)'];
    const { container, unmount } = renderCanvas();
    const nodes = Array.from(container.querySelectorAll<HTMLElement>('[data-canvas-node]'));
    const disordered = nodes.map((node) => node.style.transform);
    const content = container.querySelector('[data-canvas-content]') as HTMLElement;
    expect(content.style.opacity).toBe('0');
    unmount();
    const restored = nodes.map((node) => node.style.transform);
    expect(restored).not.toEqual(disordered);
    expect(content.style.opacity).toBe('');
  });

  it('es compatible con StrictMode: el doble montaje deja un solo ciclo y se limpia', () => {
    media.matching = ['(prefers-reduced-motion: no-preference)'];
    const { container, unmount } = render(
      <StrictMode>
        <LanguageProvider>
          <DesignCanvas />
        </LanguageProvider>
      </StrictMode>,
    );
    const root = container.querySelector('[role="img"]') as HTMLElement;
    expect(root.dataset.running).toBe('true');
    unmount();
    expect(root.dataset.running).toBeUndefined();
  });

  it('con reduced motion deja el dibujo terminado, sin ciclo y con los nodos en su sitio', () => {
    media.matching = ['(prefers-reduced-motion: reduce)'];
    const { container } = renderCanvas();
    const content = container.querySelector('[data-canvas-content]') as HTMLElement;
    expect(content.style.opacity).toBe('');
    expect(container.querySelector('[data-running]')).toBeNull();
  });
});
