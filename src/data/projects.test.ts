import { describe, it, expect } from 'vitest';
import { translations } from '../i18n/translations';
import { getProjects, projectDefinitions } from './projects';

const identity = (key: string) => key;

const lookup = (language: 'es' | 'en') => (key: string) => {
  const value = key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], translations[language]);
  return typeof value === 'string' ? value : '';
};

describe('getProjects', () => {
  const projects = getProjects(identity);

  it('devuelve los 7 proyectos en el orden del anillo', () => {
    expect(projects.map((p) => p.id)).toEqual([
      'ecopulse',
      'turno',
      'iuris',
      'claudehub',
      'systech',
      'pantano',
      'portfolio',
    ]);
  });

  it('marca como destacados solo los tres primeros', () => {
    expect(projects.map((p) => p.tier)).toEqual([
      'featured',
      'featured',
      'featured',
      'secondary',
      'secondary',
      'secondary',
      'secondary',
    ]);
  });

  it('cada proyecto tiene los campos minimos', () => {
    for (const project of projects) {
      expect(project.title).toBeTruthy();
      expect(project.technologies.length).toBeGreaterThan(0);
      expect(project.year).toBeGreaterThanOrEqual(2025);
      expect(['production', 'paused', 'delivered', 'active']).toContain(project.status);
      expect(project.links.live || project.links.repo).toBeTruthy();
    }
  });

  it('las URLs externas son https validas', () => {
    for (const project of projects) {
      for (const url of Object.values(project.links)) {
        expect(new URL(url).protocol).toBe('https:');
      }
    }
  });

  it('no incluye el proyecto eliminado de Bolsa de Trabajo', () => {
    expect(JSON.stringify(projectDefinitions).toLowerCase()).not.toContain('bolsa');
    expect(projects.some((p) => p.id.includes('bolsa'))).toBe(false);
    expect(JSON.stringify(translations.es.projects).toLowerCase()).not.toContain('bolsa');
    expect(JSON.stringify(translations.en.projects).toLowerCase()).not.toContain('bolsa');
  });

  it('el Pantano solo enlaza el dominio de Vercel', () => {
    const pantano = projects.find((p) => p.id === 'pantano');
    expect(pantano?.links.live).toBe('https://hotel-el-pantano.vercel.app/');
    expect(JSON.stringify(pantano?.links)).not.toContain('.org');
  });

  it('el portafolio no enlaza un repositorio hasta confirmarlo', () => {
    expect(projects.find((p) => p.id === 'portfolio')?.links.repo).toBeUndefined();
  });

  it('solo los cuatro proyectos con captura movil lo declaran', () => {
    const withMobile = projects.filter((p) => p.hasMobileImage).map((p) => p.id);
    expect(withMobile).toEqual(['ecopulse', 'turno', 'iuris', 'pantano']);
  });

  it('muestra entre 1 y 5 etiquetas de tecnologia por proyecto', () => {
    for (const project of projects) {
      expect(project.technologies.length, project.id).toBeGreaterThanOrEqual(1);
      expect(project.technologies.length, project.id).toBeLessThanOrEqual(5);
    }
  });

  it('ningun proyecto lleva cifras medidas', () => {
    for (const project of projectDefinitions) {
      expect(project).not.toHaveProperty('metrics');
    }
    expect(translations.es.projects).not.toHaveProperty('metrics');
    expect(translations.en.projects).not.toHaveProperty('metrics');
    expect(translations.es.projects.ui).not.toHaveProperty('metrics');
    expect(translations.es.projects.ui).not.toHaveProperty('asOf');
    expect(translations.en.projects.ui).not.toHaveProperty('asOf');
  });
});

// Words a non-technical reader would trip on: the ficha keeps the stack in its tags, not in the prose.
const JARGON =
  /PostGIS|\bRLS\b|\bSSR\b|\bCI\b|\bCSP\b|Supabase|MapLibre|Cesium|Astro|React|Next\.js|Electron|Hono|GSAP|OGL|WebGL|JSONL|Vercel|\bA\/B\b|shader|service_role|honeypot/i;

const sentenceCount = (text: string) => text.split(/[.!?]+\s/).filter(Boolean).length;

describe.each(['es', 'en'] as const)('copy de proyectos (%s)', (language) => {
  const projects = getProjects(lookup(language));

  it('cada proyecto tiene caption de una linea y descripcion de una o dos frases', () => {
    for (const project of projects) {
      expect(project.caption, `${project.id} caption`).toBeTruthy();
      expect(project.caption.length, `${project.id} caption`).toBeLessThanOrEqual(70);
      expect(project.description, `${project.id} description`).toBeTruthy();
      expect(sentenceCount(project.description), `${project.id} description`).toBeLessThanOrEqual(2);
      expect(project.description.length, `${project.id} description`).toBeLessThanOrEqual(180);
    }
  });

  it('el texto no usa nombres de librerias ni siglas tecnicas', () => {
    for (const project of projects) {
      expect(project.caption, `${project.id} caption`).not.toMatch(JARGON);
      expect(project.description, `${project.id} description`).not.toMatch(JARGON);
    }
  });

  it('el texto no lleva cifras (solo "3D")', () => {
    for (const project of projects) {
      const text = `${project.caption} ${project.description}`.replace(/3D/g, '');
      expect(text, project.id).not.toMatch(/\d/);
    }
  });

  it('cada proyecto tiene titulo, estado y texto alternativo', () => {
    for (const project of projects) {
      expect(project.title, `${project.id} title`).toBeTruthy();
      expect(project.statusLabel, `${project.id} status`).toBeTruthy();
      expect(project.altDesktop, `${project.id} altDesktop`).toBeTruthy();
      if (project.hasMobileImage) {
        expect(project.altMobile, `${project.id} altMobile`).toBeTruthy();
        expect(project.altMobile).not.toBe(project.altDesktop);
      }
    }
  });

  it('ClaudeHub aclara que la captura es del modo demo', () => {
    const claudehub = projects.find((p) => p.id === 'claudehub');
    expect(claudehub?.caption.toLowerCase()).toMatch(/demo/);
    expect(claudehub?.description.toLowerCase()).toMatch(/demo/);
  });
});
