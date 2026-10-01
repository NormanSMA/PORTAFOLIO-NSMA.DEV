import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

const scrollToSection = vi.hoisted(() => vi.fn());
vi.mock('../../lib/scroll', () => ({ scrollToSection }));

import { LanguageProvider } from '../../contexts/LanguageContext';
import { ScrollToTop } from './ScrollToTop';

function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
}

function renderButton() {
  return render(
    <LanguageProvider>
      <ScrollToTop />
    </LanguageProvider>,
  );
}

beforeEach(() => {
  globalThis.localStorage?.clear();
  scrollToSection.mockClear();
  scrollTo(0);
});

afterEach(cleanup);

// jsdom ignores the inert attribute, so the tests read the attribute that browsers act on.
const button = () => screen.getByRole('button', { name: 'Volver arriba', hidden: true });

describe('ScrollToTop', () => {
  it('queda inerte (fuera de la tabulacion y del arbol de accesibilidad) hasta pasar 600 px', () => {
    renderButton();
    expect(button().hasAttribute('inert')).toBe(true);

    scrollTo(600);
    expect(button().hasAttribute('inert')).toBe(true);

    scrollTo(601);
    expect(button().hasAttribute('inert')).toBe(false);
  });

  it('vuelve a ocultarse al regresar arriba', () => {
    renderButton();
    scrollTo(900);
    expect(button().hasAttribute('inert')).toBe(false);

    scrollTo(0);
    expect(button().hasAttribute('inert')).toBe(true);
  });

  it('lleva a la seccion home con scrollToSection', () => {
    renderButton();
    scrollTo(900);

    fireEvent.click(button());

    expect(scrollToSection).toHaveBeenCalledWith('home');
  });
});
