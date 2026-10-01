import { describe, it, expect } from 'vitest';
import { translations } from '../i18n/translations';
import { skillGroups, technicalSkills } from './skills';

describe('skillGroups', () => {
  it('usa las seis categorias acordadas en orden', () => {
    expect(skillGroups.map((group) => group.id)).toEqual([
      'languages',
      'frontend',
      'backend',
      'databases',
      'cloud',
      'tools',
    ]);
  });

  it('no repite habilidades ni deja grupos vacios', () => {
    const names = skillGroups.flatMap((group) => group.skills.map((skill) => skill.name));
    expect(new Set(names).size).toBe(names.length);
    for (const group of skillGroups) {
      expect(group.skills.length).toBeGreaterThan(0);
    }
  });

  it('cada categoria tiene titulo en ES y EN', () => {
    for (const lang of ['es', 'en'] as const) {
      const titles: Record<string, string> = translations[lang].skills.groups;
      for (const group of skillGroups) {
        expect(titles[group.id], `${lang}.skills.groups.${group.id}`).toBeTruthy();
      }
    }
  });

  it('no incluye tecnologias fuera del CV', () => {
    const names = skillGroups.flatMap((group) => group.skills.map((skill) => skill.name));
    expect(names).not.toContain('Java');
  });
});

describe('technicalSkills', () => {
  it('lista solo las habilidades con icono', () => {
    const withIcon = skillGroups.flatMap((group) => group.skills).filter((skill) => skill.icon);
    expect(technicalSkills.map((skill) => skill.name)).toEqual(withIcon.map((skill) => skill.name));
  });
});
