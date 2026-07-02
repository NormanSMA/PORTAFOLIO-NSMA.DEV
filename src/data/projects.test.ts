import { describe, it, expect } from 'vitest';
import { getProjects } from './projects';

const t = (key: string) => key;

describe('getProjects', () => {
  const projects = getProjects(t);

  it('devuelve los 4 proyectos', () => {
    expect(projects.map((p) => p.id)).toEqual(['systech', 'pantano', 'bolsa', 'portfolio']);
  });

  it('cada proyecto tiene los campos mínimos', () => {
    for (const project of projects) {
      expect(project.title).toBeTruthy();
      expect(project.image).toMatch(/\.webp$/);
      expect(project.technologies.length).toBeGreaterThan(0);
      expect(project.icon).toBeTruthy();
    }
  });

  it('las URLs externas usan https', () => {
    for (const project of projects) {
      if (project.url) {
        expect(project.url).toMatch(/^https:\/\//);
      }
    }
  });
});
