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
  it('es una sola imagen que nombra los cuatro pasos, en español', () => {
    renderCanvas();
    const image = screen.getByRole('img');
    expect(image.getAttribute('aria-label')).toBe(translations.es.hero.canvas.label);
    expect(image.getAttribute('aria-label')).toBe(
      'Cuatro puntos conectados por una curva: ver, claridad, ajuste y meta. Un pulso de luz recorre la curva',
    );
  });

  it('describe la curva en inglés cuando cambia el idioma', () => {
    renderCanvas();
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(translations.en.hero.canvas.label);
    expect(translations.en.hero.canvas.label).toBe(
      'Four points joined by a curve: see, clarity, tweak and goal. A pulse of light travels along it',
    );
  });

  it('rotula los nodos de izquierda a derecha con Ver, Claridad, Ajuste y Meta', () => {
    renderCanvas();
    const labels = Array.from(screen.getByRole('img').querySelectorAll('[data-canvas-label]'));
    expect(labels.map((label) => label.textContent)).toEqual(['Ver', 'Claridad', 'Ajuste', 'Meta']);
  });

  it('rotula los nodos en inglés cuando cambia el idioma', () => {
    renderCanvas();
    fireEvent.click(screen.getByText('toggle'));
    const labels = Array.from(screen.getByRole('img').querySelectorAll('[data-canvas-label]'));
    expect(labels.map((label) => label.textContent)).toEqual(['See', 'Clarity', 'Tweak', 'Goal']);
  });

  it('no muestra más texto que las cuatro etiquetas', () => {
    renderCanvas();
    const image = screen.getByRole('img');
    expect(image.textContent).toBe('VerClaridadAjusteMeta');
    expect(screen.queryByText('Diseño de interfaces')).toBeNull();
    expect(screen.queryByText('#6366F1')).toBeNull();
  });

  it('las etiquetas de la fila alta van arriba del nodo y las de la fila baja abajo', () => {
    renderCanvas();
    const placement = Array.from(screen.getByRole('img').querySelectorAll('[data-canvas-label]')).map((label) =>
      (label.parentElement as HTMLElement).className.includes('bottom-[14px]') ? 'arriba' : 'abajo',
    );
    expect(placement).toEqual(['abajo', 'arriba', 'abajo', 'arriba']);
  });

  it('declara las claves de las etiquetas en ambos idiomas', () => {
    expect(Object.keys(translations.es.hero.canvas.nodes)).toEqual(['first', 'second', 'third', 'fourth']);
    expect(Object.keys(translations.en.hero.canvas.nodes)).toEqual(['first', 'second', 'third', 'fourth']);
    expect(Object.keys(translations.es.hero.canvas)).toEqual(['label', 'nodes']);
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
    expect(container.querySelectorAll('[data-canvas-center-guide]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-canvas-frame]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-canvas-corner]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-canvas-label]')).toHaveLength(4);
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
    container.querySelectorAll<HTMLElement>('[data-canvas-label]').forEach((label) => {
      expect(label.style.opacity).toBe('');
      expect(label.className).not.toContain('opacity-0');
    });
  });

  it('sin reduced motion arranca el intro con el lienzo vacío y los nodos desalineados, y lo limpia al desmontar', () => {
    media.matching = ['(prefers-reduced-motion: no-preference)'];
    const { container, unmount } = renderCanvas();
    const nodes = Array.from(container.querySelectorAll<HTMLElement>('[data-canvas-node]'));
    const labels = Array.from(container.querySelectorAll<HTMLElement>('[data-canvas-label]'));
    const frame = container.querySelector('[data-canvas-frame]') as SVGRectElement;
    const dots = Array.from(container.querySelectorAll<SVGPathElement>('[data-canvas-dot-ring]'));
    const disordered = nodes.map((node) => node.style.transform);

    expect(frame.style.strokeDashoffset).toBe('1.01');
    expect(nodes.every((node) => node.style.opacity === '0')).toBe(true);
    expect(labels.every((label) => label.style.opacity === '0')).toBe(true);
    expect(dots.every((dot) => dot.style.opacity === '0')).toBe(true);

    unmount();
    expect(nodes.map((node) => node.style.transform)).not.toEqual(disordered);
    expect(frame.style.strokeDashoffset).toBe('');
    expect(nodes.every((node) => node.style.opacity === '')).toBe(true);
    expect(labels.every((label) => label.style.opacity === '')).toBe(true);
    expect(dots.every((dot) => dot.style.opacity === '')).toBe(true);
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
