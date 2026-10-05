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
    expect(image.getAttribute('aria-label')).toContain('Bézier');
    expect(image.getAttribute('aria-label')).toContain('herramienta pluma');
  });

  it('describe la curva en inglés cuando cambia el idioma', () => {
    renderCanvas();
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(translations.en.hero.canvas.label);
    expect(screen.getByText('Interface design')).toBeTruthy();
  });

  it('nombra el marco como el diseño de interfaces: responde qué es la línea', () => {
    renderCanvas();
    expect(screen.getByText('Diseño de interfaces')).toBeTruthy();
  });

  it('todo lo visible dentro de la imagen está oculto a la tecnología de asistencia', () => {
    const { container } = renderCanvas();
    const image = screen.getByRole('img');
    expect(image.querySelector('[aria-hidden="true"]')).toBeTruthy();
    expect(Array.from(image.children).filter((child) => child.getAttribute('aria-hidden') !== 'true')).toHaveLength(0);
    expect(container.querySelectorAll('p')).toHaveLength(0);
    expect(image.querySelectorAll('a, button, input')).toHaveLength(0);
  });

  it('muestra los cuatro colores reales y las dos tipografías', () => {
    renderCanvas();
    ['#6366F1', '#3B82F6', '#1A1A24', '#FFFFFF', 'Sora', 'DM Sans'].forEach((text) => {
      expect(screen.getByText(text)).toBeTruthy();
    });
    expect(screen.getAllByText('Aa')).toHaveLength(2);
  });

  it('dibuja cuatro anclajes con dos manijas cada uno y una curva con trazo', () => {
    const { container } = renderCanvas();
    expect(container.querySelectorAll('[data-canvas-anchor-box]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-canvas-handle-dot]')).toHaveLength(8);
    expect(container.querySelectorAll('[data-canvas-handle-line]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-canvas-curve]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-canvas-token]')).toHaveLength(6);
  });

  it('sin reduced motion arranca el ciclo y lo limpia al desmontar', () => {
    media.matching = ['(prefers-reduced-motion: no-preference)'];
    const { container, unmount } = renderCanvas();
    const curve = container.querySelector('[data-canvas-curve]') as SVGPathElement;
    expect(Number(curve.style.getPropertyValue('stroke-dashoffset'))).toBe(1);
    unmount();
    expect(Number(curve.style.getPropertyValue('stroke-dashoffset'))).toBe(0);
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

  it('con reduced motion deja el dibujo terminado, sin cursor visible ni trazo oculto', () => {
    media.matching = ['(prefers-reduced-motion: reduce)'];
    const { container } = renderCanvas();
    const curve = container.querySelector('[data-canvas-curve]') as SVGPathElement;
    expect(curve.style.getPropertyValue('stroke-dashoffset')).toBe('');
    const cursor = container.querySelector('[data-canvas-cursor]') as HTMLElement;
    expect(cursor.className).toContain('opacity-0');
    expect(container.querySelector('[data-running]')).toBeNull();
  });
});
