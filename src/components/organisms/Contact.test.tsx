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

import { render, screen, cleanup } from '@testing-library/react';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { translations } from '../../i18n/translations';
import { Contact } from './Contact';

afterEach(cleanup);

const es = translations.es.contact;

function renderContact() {
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

  it('muestra los canales directos con sus enlaces reales', () => {
    renderContact();

    const email = screen.getByRole('link', { name: /norman\.martinez003@gmail\.com/ });
    expect(email.getAttribute('href')).toBe('mailto:norman.martinez003@gmail.com');

    const github = screen.getByRole('link', { name: /github\.com\/NormanSMA/ });
    expect(github.getAttribute('href')).toBe('https://github.com/NormanSMA');
    expect(github.getAttribute('target')).toBe('_blank');
    expect(github.getAttribute('rel')).toBe('noopener noreferrer');

    const linkedin = screen.getByRole('link', { name: /linkedin\.com\/in\/norman-martinez/ });
    expect(linkedin.getAttribute('href')).toBe('https://linkedin.com/in/norman-martinez');
  });

  it('muestra la linea de disponibilidad con tildes', () => {
    renderContact();

    expect(screen.getByText('Busco pasantía o empleo · Managua o remoto')).toBeTruthy();
  });

  it('pone el formulario dentro de una Card', () => {
    const { container } = renderContact();

    const card = container.querySelector('[data-variant]');
    expect(card?.querySelector('form')).not.toBeNull();
  });
});
