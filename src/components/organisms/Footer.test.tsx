import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

const scrollToSection = vi.hoisted(() => vi.fn());
vi.mock('../../lib/scroll', () => ({ scrollToSection }));

import { LanguageProvider } from '../../contexts/LanguageContext';
import { Footer } from './Footer';

function renderFooter() {
  return render(
    <LanguageProvider>
      <Footer />
    </LanguageProvider>,
  );
}

beforeEach(() => {
  globalThis.localStorage?.clear();
  scrollToSection.mockClear();
});

afterEach(cleanup);

describe('Footer', () => {
  it('es un contentinfo con la frase de marca', () => {
    renderFooter();
    expect(screen.getByRole('contentinfo')).toBeTruthy();
    expect(screen.getByText('Ingeniero en Sistemas · Desarrollo web, bases de datos y cloud')).toBeTruthy();
  });

  it('lista los mismos enlaces de seccion que la barra y navega con scrollToSection', () => {
    renderFooter();
    const nav = screen.getByRole('navigation', { name: 'Navegación del pie de página' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#home',
      '#about',
      '#projects',
      '#experience',
      '#approach',
      '#contact',
    ]);

    fireEvent.click(within(nav).getByRole('link', { name: 'Contacto' }));
    expect(scrollToSection).toHaveBeenCalledWith('contact');
  });

  it('enlaza GitHub y LinkedIn en pestana nueva y el correo con mailto', () => {
    renderFooter();
    const github = screen.getByRole('link', { name: /GitHub/ });
    const linkedin = screen.getByRole('link', { name: /LinkedIn/ });
    const email = screen.getByRole('link', { name: /norman\.martinez003@gmail\.com/ });

    expect(github.getAttribute('href')).toBe('https://github.com/NormanSMA');
    expect(linkedin.getAttribute('href')).toBe('https://www.linkedin.com/in/norman-martinez');
    expect(email.getAttribute('href')).toBe('mailto:norman.martinez003@gmail.com');

    for (const link of [github, linkedin]) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.textContent).toContain('se abre en una pestaña nueva');
    }
    expect(email.getAttribute('target')).toBeNull();
  });

  it('muestra el copyright con el ano actual', () => {
    renderFooter();
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} Norman Martínez. Todos los derechos reservados.`)).toBeTruthy();
  });

  it('el logo vuelve al inicio', () => {
    renderFooter();
    fireEvent.click(screen.getByRole('link', { name: 'Ir al inicio' }));
    expect(scrollToSection).toHaveBeenCalledWith('home');
  });
});
