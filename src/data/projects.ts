import type { LocalizedProject, Project } from '../types';

// Order is the order of the ring.
export const projectDefinitions: readonly Project[] = [
  {
    id: 'autofinops',
    tier: 'featured',
    year: 2026,
    status: 'completed',
    technologies: [
      'UiPath Studio 26.10',
      'REFramework',
      'Orchestrator Queues',
      'PostgreSQL 17',
      'Docker Compose',
      'Metabase BI',
      'BCN SOAP API',
    ],
    highlights: ['speed', 'run', 'exceptions', 'infra'],
    gallery: [
      { slug: 'demo', video: true },
      { slug: 'metabase' },
      { slug: 'orchestrator' },
      { slug: 'correo' },
    ],
    links: { repo: 'https://github.com/NormanSMA/autofinops-rpa-engine' },
  },
  {
    id: 'tracore',
    tier: 'featured',
    year: 2026,
    status: 'pilot',
    technologies: ['Next.js 16', 'React 19', 'TypeScript', 'Prisma 7', 'PostgreSQL 17', 'Tailwind CSS', 'Docker'],
    highlights: ['entry', 'inventory', 'audit'],
    gallery: [{ slug: 'cotizacion' }, { slug: 'avance' }, { slug: 'costos' }, { slug: 'bitacora' }],
    // The code belongs to the client and to the thesis: the ficha shows a label instead of the links.
    privateCode: true,
    links: {},
  },
  {
    id: 'iuris',
    tier: 'featured',
    year: 2026,
    status: 'production',
    technologies: ['Astro', 'React', 'TypeScript', 'Tailwind CSS', 'DNS & Hosting Admin', 'SEO'],
    highlights: ['bilingual', 'delivery', 'operation'],
    gallery: [{ slug: 'inicio' }, { slug: 'servicios' }, { slug: 'nosotros' }, { slug: 'ingles' }],
    links: { live: 'https://iurisnicaragua.com/' },
  },
  {
    id: 'ecopulse',
    tier: 'featured',
    year: 2026,
    status: 'production',
    technologies: ['Next.js 15', 'TypeScript', 'Supabase (PostgreSQL)', 'MapLibre GL', 'Cesium'],
    highlights: ['views', 'hazards', 'sources'],
    gallery: [{ slug: 'mapa' }, { slug: 'regional' }, { slug: 'atmosfera' }, { slug: 'globo' }],
    links: {
      live: 'https://ecopulse.nsma.dev/',
      repo: 'https://github.com/NormanSMA/EcoPulse',
    },
  },
  {
    id: 'claudehub',
    tier: 'secondary',
    year: 2026,
    status: 'active',
    technologies: ['Electron', 'Node.js', 'TypeScript', 'React 19', 'Hono'],
    highlights: ['usage', 'agents', 'cost'],
    gallery: [{ slug: 'resumen' }, { slug: 'agentes' }, { slug: 'modelos' }, { slug: 'sesiones' }],
    links: { repo: 'https://github.com/NormanSMA/ClaudeHub' },
  },
  {
    id: 'turno',
    tier: 'secondary',
    year: 2026,
    status: 'paused',
    technologies: ['Next.js 16', 'TypeScript', 'PostgreSQL 17', 'Prisma 7', 'PWA'],
    highlights: ['booking', 'capacity', 'redistribution'],
    gallery: [{ slug: 'inicio' }, { slug: 'comercio' }, { slug: 'pedido' }, { slug: 'como' }],
    // The published deployment is gone (404): only the repo stays until it is deployed again.
    links: { repo: 'https://github.com/NormanSMA/turno' },
  },
  {
    id: 'systech',
    tier: 'secondary',
    year: 2025,
    status: 'delivered',
    technologies: ['WordPress', 'PHP', 'MySQL', 'CSS', 'Web Administration'],
    highlights: ['lead', 'content', 'stability'],
    gallery: [{ slug: 'inicio' }, { slug: 'edicion' }, { slug: 'mapa' }],
    links: { live: 'https://systech.uam.edu.ni/' },
  },
  {
    id: 'pantano',
    tier: 'secondary',
    year: 2025,
    status: 'delivered',
    // Alpine.js is not in the repo (no dependency, no usage), so the stack leaves it out.
    technologies: ['Astro', 'Tailwind CSS', 'TypeScript', 'SEO'],
    highlights: ['catalog', 'whatsapp', 'turnkey'],
    gallery: [{ slug: 'inicio' }, { slug: 'menu' }, { slug: 'habitaciones' }, { slug: 'eventos' }],
    links: { live: 'https://hotel-el-pantano.vercel.app/' },
  },
  {
    id: 'portfolio',
    tier: 'secondary',
    year: 2026,
    status: 'active',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'GSAP'],
    highlights: ['bilingual', 'scene', 'motion'],
    gallery: [{ slug: 'inicio' }, { slug: 'sobre-mi' }, { slug: 'proyectos' }, { slug: 'servicios' }],
    // The repo link stays out until Norman confirms it is public.
    links: { live: 'https://nsma.dev/' },
  },
];

export const getProjects = (t: (key: string) => string): LocalizedProject[] =>
  projectDefinitions.map((project) => ({
    ...project,
    title: t(`projects.${project.id}.title`),
    category: t(`projects.${project.id}.category`),
    caption: t(`projects.${project.id}.caption`),
    description: t(`projects.${project.id}.description`),
    statusLabel: t(`projects.status.${project.status}`),
    altDesktop: t(`projects.${project.id}.altDesktop`),
    highlights: (project.highlights ?? []).map((key) => t(`projects.${project.id}.highlights.${key}`)),
    gallery: (project.gallery ?? []).map((view) => ({ ...view, label: t(`projects.${project.id}.views.${view.slug}`) })),
  }));
