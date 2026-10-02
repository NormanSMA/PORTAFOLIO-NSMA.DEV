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

import { render, screen, within, cleanup, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { skillGroups } from '../../data/skills';
import { useLanguage } from '../../hooks';
import { translations } from '../../i18n/translations';
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
  const view = render(
    <LanguageProvider>
      <LanguageToggle />
      <Experience />
    </LanguageProvider>,
  );
  if (language === 'en') fireEvent.click(screen.getByText('toggle-language'));
  return view;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const copy = {
  es: {
    heading: 'Formación y stack',
    education: 'Educación',
    certifications: 'Certificaciones',
    languages: 'Idiomas',
    hint: 'Arrastra para girar',
  },
  en: {
    heading: 'Education and stack',
    education: 'Education',
    certifications: 'Certifications',
    languages: 'Languages',
    hint: 'Drag to rotate',
  },
} as const;

describe.each(['es', 'en'] as const)('Experience (%s)', (language) => {
  const text = copy[language];

  it('expone la seccion con su encabezado h2 y el ancla experience', () => {
    renderExperience(language);
    const heading = screen.getByRole('heading', { level: 2, name: text.heading });
    const section = heading.closest('section');
    expect(section?.id).toBe('experience');
    expect(section?.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('ya no muestra la linea de tiempo de experiencia', () => {
    renderExperience(language);
    expect(screen.queryByText('Iuris Consultus Nicaragua')).toBeNull();
    expect(screen.queryByText('Hotel-Restaurante El Pantano')).toBeNull();
    expect(screen.queryByRole('button', { name: /^(Ver proyecto|View project)/ })).toBeNull();
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

  it('pone el stack primero y lista cada grupo con sus tecnologias', () => {
    const { container } = renderExperience(language);
    const stack = screen.getByRole('heading', { level: 3, name: translations[language].skills.title });
    const education = screen.getByRole('heading', { level: 3, name: text.education });
    expect(stack.compareDocumentPosition(education) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelectorAll('[data-reveal="card"]')).toHaveLength(4);

    for (const group of skillGroups) {
      const list = screen.getByRole('list', { name: translations[language].skills.groups[group.id] });
      const names = within(list)
        .getAllByRole('listitem')
        .map((item) => item.textContent);
      expect(names).toHaveLength(group.skills.length);
      for (const skill of group.skills) {
        expect(names.some((name) => name?.startsWith(skill.name))).toBe(true);
      }
    }
  });

  it('oculta la constelacion a los lectores de pantalla y muestra la pista de arrastre', () => {
    const { container } = renderExperience(language);
    const sphere = container.querySelector('[data-constellation]');

    expect(sphere?.getAttribute('aria-hidden')).toBe('true');
    expect(sphere?.querySelectorAll('[data-node]')).toHaveLength(
      skillGroups.reduce((total, group) => total + group.skills.length, 0),
    );
    expect(screen.getByText(text.hint)).toBeTruthy();
  });
});
