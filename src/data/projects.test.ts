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

  it('devuelve los proyectos en el orden del anillo', () => {
    expect(projects.map((p) => p.id)).toEqual([
      'autofinops',
      'tracore',
      'iuris',
      'ecopulse',
      'claudehub',
      'turno',
      'systech',
      'pantano',
      'portfolio',
    ]);
  });

  it('marca como destacados los proyectos principales del anillo', () => {
    expect(projects.map((p) => p.tier)).toEqual([
      'featured',
      'featured',
      'featured',
      'featured',
      'secondary',
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
      expect(['production', 'paused', 'delivered', 'active', 'completed', 'pilot']).toContain(project.status);
      expect(project.category, `${project.id} category`).toBeTruthy();
      expect(project.privateCode || project.links.live || project.links.repo, project.id).toBeTruthy();
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

  it('TRACORE no enlaza el codigo: es del cliente y de la tesis', () => {
    const tracore = projects.find((p) => p.id === 'tracore');
    expect(tracore?.privateCode).toBe(true);
    expect(tracore?.links).toEqual({});
  });

  it('el portafolio no enlaza un repositorio hasta confirmarlo', () => {
    expect(projects.find((p) => p.id === 'portfolio')?.links.repo).toBeUndefined();
  });

  it('la tarjeta solo usa la captura de escritorio: no quedan campos ni textos moviles', () => {
    for (const project of projectDefinitions) {
      expect(project).not.toHaveProperty('hasMobileImage');
      expect(project).not.toHaveProperty('imagePosition');
    }
    for (const project of projects) {
      expect(project).not.toHaveProperty('altMobile');
    }
    expect(JSON.stringify(translations.es.projects)).not.toContain('altMobile');
    expect(JSON.stringify(translations.en.projects)).not.toContain('altMobile');
  });

  it('muestra entre 1 y 8 etiquetas de tecnologia por proyecto', () => {
    for (const project of projects) {
      expect(project.technologies.length, project.id).toBeGreaterThanOrEqual(1);
      expect(project.technologies.length, project.id).toBeLessThanOrEqual(8);
    }
  });

  it('cada ruta de imagen y video existe en public/projects', () => {
    const files = (project: (typeof projects)[number]) => {
      const names = ['desktop', ...project.gallery.map((view) => view.slug)];
      const images = names.flatMap((name) =>
        [480, 960, 1440, 1920].flatMap((width) => ['avif', 'webp'].map((format) => `${name}-${width}.${format}`)),
      );
      return [...images, ...project.gallery.filter((view) => view.video).map((view) => `${view.slug}.mp4`)];
    };
    // Only the file names are listed: nothing is imported, and the public folder is not bundled.
    const published = new Set(Object.keys(import.meta.glob('/public/projects/**/*')));
    expect(published.size).toBeGreaterThan(0);
    for (const project of projects) {
      for (const file of files(project)) {
        expect(published.has(`/public/projects/${project.id}/${file}`), `${project.id}/${file}`).toBe(true);
      }
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

// Words a non-technical reader would trip on: the caption (one line under the card) stays free of them.
// The description and the highlights are the technical read of the project and may name the stack.
const JARGON =
  /PostGIS|\bRLS\b|\bSSR\b|\bCI\b|\bCSP\b|Supabase|MapLibre|Cesium|Astro|React|Next\.js|Electron|Hono|GSAP|OGL|WebGL|JSONL|Vercel|\bA\/B\b|shader|service_role|honeypot/i;

const sentenceCount = (text: string) => text.split(/[.!?]+\s/).filter(Boolean).length;

describe.each(['es', 'en'] as const)('copy de proyectos (%s)', (language) => {
  const projects = getProjects(lookup(language));

  it('cada proyecto tiene caption de una linea y descripcion de hasta tres frases', () => {
    for (const project of projects) {
      expect(project.caption, `${project.id} caption`).toBeTruthy();
      expect(project.caption.length, `${project.id} caption`).toBeLessThanOrEqual(70);
      expect(project.description, `${project.id} description`).toBeTruthy();
      expect(sentenceCount(project.description), `${project.id} description`).toBeLessThanOrEqual(3);
      expect(project.description.length, `${project.id} description`).toBeLessThanOrEqual(500);
    }
  });

  it('el caption no usa nombres de librerias ni siglas tecnicas', () => {
    for (const project of projects) {
      expect(project.caption, `${project.id} caption`).not.toMatch(JARGON);
    }
  });

  it('el caption no lleva cifras (solo "3D")', () => {
    for (const project of projects) {
      expect(project.caption.replace(/3D/g, ''), project.id).not.toMatch(/\d/);
    }
  });

  it('los puntos clave y las vistas de la galeria tienen texto', () => {
    for (const project of projects) {
      expect(project.highlights.length, `${project.id} highlights`).toBeLessThanOrEqual(4);
      for (const highlight of project.highlights) expect(highlight, `${project.id} highlight`).toBeTruthy();
      for (const view of project.gallery) expect(view.label, `${project.id} ${view.slug}`).toBeTruthy();
    }
  });

  it('cada proyecto tiene titulo, estado y texto alternativo', () => {
    for (const project of projects) {
      expect(project.title, `${project.id} title`).toBeTruthy();
      expect(project.statusLabel, `${project.id} status`).toBeTruthy();
      expect(project.altDesktop, `${project.id} altDesktop`).toBeTruthy();
    }
  });

  it('ClaudeHub aclara que la captura es del modo demo', () => {
    const claudehub = projects.find((p) => p.id === 'claudehub');
    expect(claudehub?.caption.toLowerCase()).toMatch(/demo/);
    expect(claudehub?.description.toLowerCase()).toMatch(/demo/);
  });
});
