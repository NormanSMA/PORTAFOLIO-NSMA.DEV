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

import { render, screen, cleanup, within } from '@testing-library/react';
import { motion } from '../../config/motion';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { translations } from '../../i18n/translations';
import { Approach } from './Approach';

const { services, process } = translations.es;

function renderApproach() {
  return render(
    <LanguageProvider>
      <Approach />
    </LanguageProvider>,
  );
}

afterEach(() => {
  cleanup();
  media.matching = [];
});

describe('Approach', () => {
  it('expone la seccion approach con su h2', () => {
    renderApproach();

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.id).toBe('approach-heading');
    expect(heading.textContent).toBe(services.heading);

    const section = document.getElementById('approach');
    expect(section?.tagName).toBe('SECTION');
    expect(section?.getAttribute('aria-labelledby')).toBe('approach-heading');
  });

  it('lista los tres servicios en orden', () => {
    renderApproach();

    const list = screen.getByRole('list', { name: services.title });
    const titles = within(list)
      .getAllByRole('listitem')
      .map((item) => within(item).getByRole('heading', { level: 4 }).textContent);

    expect(titles).toEqual([services.webDev.title, services.backend.title, services.deployment.title]);
  });

  it('lista los cuatro pasos del proceso numerados y en orden', () => {
    renderApproach();

    const list = screen.getByRole('list', { name: process.title });
    const steps = within(list)
      .getAllByRole('listitem')
      .map((item) => [
        item.querySelector('span')?.textContent,
        within(item).getByRole('heading', { level: 4 }).textContent,
      ]);

    expect(steps).toEqual([
      ['01', process.steps.discovery.title],
      ['02', process.steps.strategy.title],
      ['03', process.steps.build.title],
      ['04', process.steps.optimize.title],
    ]);
  });

  it('deja todo el contenido visible con reduced motion', () => {
    media.matching = [];
    const { container } = renderApproach();

    const hidden = [...container.querySelectorAll<HTMLElement>('[data-reveal]')].filter(
      (element) => element.style.opacity === '0',
    );
    expect(hidden).toEqual([]);
  });

  it('oculta los elementos de cada grupo hasta que llegue el scroll en escritorio', () => {
    media.matching = [motion.media.noReducedMotion, motion.media.desktop];
    const { container } = renderApproach();

    const items = [...container.querySelectorAll<HTMLElement>('[data-reveal]')];
    expect(items).toHaveLength(2 + 3 + 4);
    expect(items.every((element) => element.style.opacity === '0')).toBe(true);
  });

  it('en escritorio no aplica la pila ni la linea de progreso', () => {
    media.matching = [motion.media.noReducedMotion, motion.media.desktop];
    const { container } = renderApproach();

    const dims = [...container.querySelectorAll<HTMLElement>('[data-stack-dim]')];
    const fill = container.querySelector<HTMLElement>('[data-process-fill]');
    expect(dims.every((dim) => dim.style.opacity === '')).toBe(true);
    expect(fill?.style.transform).toBe('');
  });

  it('en movil solo revela el encabezado y anima la pila y la linea del proceso', () => {
    media.matching = [motion.media.noReducedMotion, motion.media.mobile];
    const { container } = renderApproach();

    const hidden = [...container.querySelectorAll<HTMLElement>('[data-reveal]')].filter(
      (element) => element.style.opacity === '0',
    );
    // Dos del encabezado y cuatro pasos que entran con scroll; las tarjetas se apilan sin ocultarse.
    expect(hidden).toHaveLength(2 + 4);

    const dims = [...container.querySelectorAll<HTMLElement>('[data-stack-dim]')];
    expect(dims.map((dim) => dim.style.opacity)).toEqual(['0', '0', '']);

    // GSAP escribe la transformacion inicial (escala 0) al crear la linea; jsdom no la serializa como scale().
    const fill = container.querySelector<HTMLElement>('[data-process-fill]');
    expect(fill?.style.transform).not.toBe('');
  });

  it('con reduced motion en movil no apila ni oculta nada', () => {
    media.matching = [motion.media.mobile];
    const { container } = renderApproach();

    const touched = [...container.querySelectorAll<HTMLElement>('[data-stack-item], [data-process-step]')].filter(
      (element) => element.style.transform !== '' || element.style.opacity !== '',
    );
    expect(touched).toEqual([]);
    expect(container.querySelector<HTMLElement>('[data-process-fill]')?.style.transform).toBe('');
  });
});
