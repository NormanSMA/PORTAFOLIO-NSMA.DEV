import { describe, it, expect, afterEach, vi } from 'vitest';

// ScrollTrigger calls window.matchMedia while registering, so the stub must exist before the imports run.
// No query matches: the section renders in its reduced-motion state, with every block visible.
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

vi.mock('../../lib/scroll', () => ({ scrollToSection: vi.fn() }));

import { render, screen, within, cleanup, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { useLanguage } from '../../hooks';
import { scrollToSection } from '../../lib/scroll';
import { Experience } from './Experience';

type Language = 'es' | 'en';

// The provider starts in Spanish; the toggle switches to English through the real context.
function LanguageToggle() {
  const { toggleLanguage } = useLanguage();
  return (
    <button type="button" onClick={toggleLanguage}>
      toggle-language
    </button>
  );
}

function renderExperience(language: Language) {
  render(
    <LanguageProvider>
      <LanguageToggle />
      <Experience />
    </LanguageProvider>,
  );
  if (language === 'en') fireEvent.click(screen.getByText('toggle-language'));
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const copy = {
  es: {
    heading: 'Experiencia',
    timeline: 'Trayectoria profesional',
    organizations: ['Iuris Consultus Nicaragua', 'Hotel-Restaurante El Pantano', 'Congreso SYSTECH, UAM'],
    education: 'Educación',
    certifications: 'Certificaciones',
    languages: 'Idiomas',
    viewProject: 'Ver proyecto',
  },
  en: {
    heading: 'Experience',
    timeline: 'Professional experience',
    organizations: ['Iuris Consultus Nicaragua', 'Hotel-Restaurante El Pantano', 'SYSTECH Congress, UAM'],
    education: 'Education',
    certifications: 'Certifications',
    languages: 'Languages',
    viewProject: 'View project',
  },
} as const;

describe.each(['es', 'en'] as const)('Experience (%s)', (language) => {
  const text = copy[language];

  it('expone la seccion con su encabezado h2', () => {
    renderExperience(language);
    const heading = screen.getByRole('heading', { level: 2, name: text.heading });
    const section = heading.closest('section');
    expect(section?.id).toBe('experience');
    expect(section?.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('muestra tres entradas de experiencia con 2 o 3 vinetas', () => {
    renderExperience(language);
    const timeline = screen.getByRole('list', { name: text.timeline });
    const entries = Array.from(timeline.children) as HTMLElement[];
    expect(entries).toHaveLength(3);

    entries.forEach((entry, index) => {
      expect(within(entry).getByText(text.organizations[index])).toBeTruthy();
      const bullets = within(entry).getAllByRole('listitem');
      expect(bullets.length).toBeGreaterThanOrEqual(2);
      expect(bullets.length).toBeLessThanOrEqual(3);
    });
  });

  it('ordena las entradas de la mas reciente a la mas antigua', () => {
    renderExperience(language);
    const timeline = screen.getByRole('list', { name: text.timeline });
    const years = Array.from(timeline.children).map((entry) =>
      Number(entry.querySelector('time')?.getAttribute('datetime')),
    );

    expect(years).toEqual([2026, 2025, 2025]);
    expect([...years].sort((a, b) => b - a)).toEqual(years);
  });

  it('incluye los bloques de educacion, certificaciones e idiomas', () => {
    renderExperience(language);
    expect(screen.getByRole('heading', { level: 3, name: text.education })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: text.certifications })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: text.languages })).toBeTruthy();
    expect(screen.getByText('Universidad Americana (UAM)')).toBeTruthy();
  });

  it('lista las cuatro certificaciones sin anos ni resultados', () => {
    renderExperience(language);
    const heading = screen.getByRole('heading', { level: 3, name: text.certifications });
    const list = within(heading.parentElement as HTMLElement).getByRole('list');
    const items = within(list).getAllByRole('listitem');

    expect(items).toHaveLength(4);
    items.forEach((item) => expect(item.textContent).not.toMatch(/\d{4}/));
  });

  it('lleva a la seccion de proyectos desde cada entrada', () => {
    renderExperience(language);
    const buttons = screen.getAllByRole('button', { name: new RegExp(`^${text.viewProject}:`) });
    expect(buttons).toHaveLength(3);

    fireEvent.click(buttons[0]);
    expect(scrollToSection).toHaveBeenCalledWith('projects');
  });
});
