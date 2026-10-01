export const projects = {
  title: 'Projects',
  subtitle: 'Personal, thesis and client projects. Pick one on the carousel to see its details.',
  ecopulse: {
    title: 'EcoPulse',
    caption: 'Real-time global environmental and seismic monitor with a 2D map and 3D globe.',
    description:
      'Global environmental and seismic monitor with eight live data layers: earthquakes, observed and modeled air quality, wildfires, weather, global disasters, ISS position and volcanoes. The map uses MapLibre and the 3D globe uses Cesium, with a 2D/3D toggle. Supabase with PostGIS stores the data (public read, write only with service_role), GitHub Actions schedules the ingestion and Discord receives alerts for earthquakes above M6.0.',
    altDesktop: 'Screenshot of the desktop version of EcoPulse',
    altMobile: 'Screenshot of the mobile version of EcoPulse',
  },
  turno: {
    title: 'Turno',
    caption: 'Pre-ordering that reserves kitchen capacity for each time slot.',
    description:
      'Pre-ordering system with capacity-based admission control: it reserves kitchen capacity and, when an order does not fit in a time slot, proposes the next slot with room. It includes an A/B experiment to flatten the demand peak in a 30-minute break. It is my thesis project at UAM, currently on hold, with a core of 31 pure modules that never touch the database or the clock.',
    altDesktop: 'Screenshot of the desktop version of Turno',
    altMobile: 'Screenshot of the mobile version of Turno',
  },
  iuris: {
    title: 'Iuris Consultus',
    caption: 'Bilingual corporate website for the law firm Iuris Consultus Nicaragua.',
    description:
      'Bilingual (es/en) corporate website for the law firm Iuris Consultus Nicaragua, delivered and in maintenance. I covered the full cycle (requirements, development and deployment), domain and hosting administration, and performance and SEO improvements. It uses Astro 6 with server rendering, React 19 for islands, a contact form with a honeypot and rate limiting, a sitemap and social metadata.',
    altDesktop: 'Screenshot of the desktop version of Iuris Consultus',
    altMobile: 'Screenshot of the mobile version of Iuris Consultus',
  },
  claudehub: {
    title: 'ClaudeHub',
    caption: 'Claude Code token monitor. Screenshot from demo mode, with fictitious data.',
    description:
      'Desktop app that monitors Claude Code token usage: per session, orchestrator versus subagents, models used and limit alerts. It reads the local JSONL logs incrementally, uses Hono, React 19 and Electron, and ships a Windows installer; it is open source (MIT), version 0.3.1. The screenshot shows demo mode, with fictitious data.',
    altDesktop: 'Screenshot of ClaudeHub in demo mode, with fictitious data',
  },
  systech: {
    title: 'SYSTECH UAM',
    caption: 'Official site of the annual engineering congress at Universidad Americana.',
    description:
      'Official site of the annual SYSTECH engineering congress at Universidad Americana (UAM). I was the web development lead: I built and administered the site, customized templates and configured plugins for registrations and the agenda. I also published and updated the congress content.',
    altDesktop: 'Screenshot of the desktop version of the SYSTECH UAM site',
  },
  pantano: {
    title: 'Hotel El Pantano',
    caption: 'Website for Hotel y Restaurante El Pantano: rooms, menu, events and bookings.',
    description:
      'Website for Hotel y Restaurante El Pantano in Jalapa, Nueva Segovia, Nicaragua: rooms, menu, events for up to 400 people, history and bookings through WhatsApp. As a freelance project I covered the initial consulting, UX/UI design, development and deployment on Vercel. SEO uses Schema.org structured data.',
    altDesktop: 'Screenshot of the desktop version of the Hotel El Pantano site',
    altMobile: 'Screenshot of the mobile version of the Hotel El Pantano site',
  },
  portfolio: {
    title: 'This portfolio',
    caption: 'This site: WebGL shader with OGL, GSAP animations and a bilingual interface.',
    description:
      'This is the portfolio you are viewing. The background is a WebGL shader built with OGL, scroll animations use GSAP and the interface is bilingual (es/en). The contact form uses EmailJS with anti-spam protection and the site is deployed on Vercel.',
    altDesktop: 'Screenshot of the desktop version of this portfolio',
  },
  status: {
    production: 'In production',
    paused: 'On hold',
    delivered: 'Delivered',
    active: 'Active',
  },
  metrics: {
    tests: 'Automated tests',
    testsUnitIntegration: 'Unit and integration tests',
    testsE2E: 'E2E tests (light and dark theme)',
    coverageCore: 'Core coverage',
    lighthousePerformance: 'Lighthouse: performance',
  },
  ui: {
    demo: 'View demo',
    code: 'View code',
    newTab: '(opens in a new tab)',
    ringLabel: 'Project carousel',
    previous: 'Previous project',
    next: 'Next project',
    detailsTitle: 'Project details',
    featured: 'Featured',
    technologies: 'Technologies',
    metrics: 'Measured figures',
    asOf: 'As of',
  },
} as const;
