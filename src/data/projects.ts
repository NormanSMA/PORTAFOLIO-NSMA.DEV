import type { LocalizedProject, Project } from '../types';

// Order is the order of the ring: featured projects first.
export const projectDefinitions: readonly Project[] = [
  {
    id: 'ecopulse',
    tier: 'featured',
    category: 'Next.js',
    year: 2026,
    status: 'production',
    technologies: ['Next.js 15', 'TypeScript', 'Supabase', 'MapLibre GL', 'Cesium'],
    links: {
      live: 'https://ecopulse-eta-two.vercel.app/',
      repo: 'https://github.com/NormanSMA/EcoPulse',
    },
  },
  {
    id: 'turno',
    tier: 'featured',
    category: 'Next.js',
    year: 2026,
    status: 'paused',
    technologies: ['Next.js 16', 'TypeScript', 'PostgreSQL 17', 'Prisma 7', 'PWA'],
    links: {
      live: 'https://turno-umber.vercel.app/',
      repo: 'https://github.com/NormanSMA/turno',
    },
  },
  {
    id: 'iuris',
    tier: 'featured',
    category: 'Astro',
    year: 2026,
    status: 'delivered',
    technologies: ['Astro', 'React', 'TypeScript', 'Tailwind CSS', 'SEO'],
    links: { live: 'https://iurisnicaragua.com/' },
  },
  {
    id: 'claudehub',
    tier: 'secondary',
    category: 'Electron / Node',
    year: 2026,
    status: 'active',
    technologies: ['Electron', 'Node.js', 'TypeScript', 'React 19', 'Hono'],
    links: { repo: 'https://github.com/NormanSMA/ClaudeHub' },
  },
  {
    id: 'systech',
    tier: 'secondary',
    category: 'WordPress',
    year: 2025,
    status: 'delivered',
    technologies: ['WordPress', 'PHP', 'MySQL', 'CSS'],
    links: { live: 'https://systech.uam.edu.ni/' },
  },
  {
    id: 'pantano',
    tier: 'secondary',
    category: 'Astro',
    year: 2025,
    status: 'delivered',
    technologies: ['Astro', 'Tailwind CSS', 'Alpine.js', 'TypeScript', 'SEO'],
    links: { live: 'https://hotel-el-pantano.vercel.app/' },
  },
  {
    id: 'portfolio',
    tier: 'secondary',
    category: 'React',
    year: 2026,
    status: 'active',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'GSAP', 'OGL'],
    // The repo link stays out until Norman confirms it is public.
    links: { live: 'https://portafolio-nsma-dev.vercel.app/' },
  },
];

export const getProjects = (t: (key: string) => string): LocalizedProject[] =>
  projectDefinitions.map((project) => ({
    ...project,
    title: t(`projects.${project.id}.title`),
    caption: t(`projects.${project.id}.caption`),
    description: t(`projects.${project.id}.description`),
    statusLabel: t(`projects.status.${project.status}`),
    altDesktop: t(`projects.${project.id}.altDesktop`),
  }));
