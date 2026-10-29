export const projects = {
  title: 'Projects',
  subtitle: 'Personal, thesis and client projects. Pick one on the carousel to see its details.',
  autofinops: {
    title: 'AutoFinOps-NI',
    category: 'UiPath RPA & SQL',
    caption: 'RPA bot that reconciles PDF invoices and audits them in PostgreSQL.',
    description:
      'Enterprise RPA bot (REFramework Dispatcher + Performer) that ingests PDF invoices via IMAP, fetches the official BCN exchange rate via SOAP, validates Nicaraguan VAT (15%) and IR withholding (2%), and logs every transaction in PostgreSQL 17 with a Metabase dashboard and automated Excel/HTML reporting.',
    altDesktop: 'Screenshot of the AutoFinOps-NI Metabase dashboard, with fictitious data',
    highlights: {
      speed: '~1.7 s per invoice (vs. 4.5 min manual)',
      run: 'Real run: 19 invoices, 78.95% success and C$ 125,518.46 approved',
      exceptions: 'BRE handling & automatic Orchestrator queue retries',
      infra: 'Docker Compose: PostgreSQL 17 + Metabase + GreenMail',
    },
    views: {
      demo: '49 s video demo: from the PDF email to the report',
      metabase: 'Metabase dashboard with the reconciliation KPIs',
      orchestrator: 'Invoices_Queue in UiPath Orchestrator',
      correo: 'Report email to management with the Excel attached',
    },
  },
  tracore: {
    title: 'TRACORE',
    category: 'Thesis Pilot (UAM)',
    caption: 'Management and traceability platform for Soluciones Creativas.',
    description:
      'Web operations and traceability management platform built for Soluciones Creativas (Estelí, Nicaragua) as my capstone engineering pilot at UAM. Connects quotes, work orders, material consumption, and real costs in a single workflow: approved quotes convert into orders with zero re-typing, deduct inventory across production stages, and record every change in an immutable audit log.',
    altDesktop: 'Screenshot of a TRACORE work order, with demo data',
    highlights: {
      entry: 'Zero double entry (Quote → Work Order)',
      inventory: 'Live inventory & real cost tracking by stage',
      audit: 'Immutable audit trail log',
    },
    views: {
      cotizacion: 'Approved quote with a direct link to its work order',
      avance: 'Work order with progress by stage and owners',
      costos: 'Order materials: estimated, consumed and real cost',
      bitacora: 'Order audit log: every change keeps its user and date',
    },
  },
  ecopulse: {
    title: 'EcoPulse',
    category: 'Next.js & Data',
    caption: 'Live map of earthquakes, wildfires, weather and air quality.',
    description:
      'Real-time global data monitoring platform tracking earthquakes, wildfires, weather, and air quality. Integrates multiple external APIs backed by Supabase with interactive 2D map and 3D globe views.',
    altDesktop: 'Screenshot of the desktop version of EcoPulse',
    highlights: {
      views: 'Interactive 2D map and 3D globe',
      hazards: 'Earthquakes, wildfires, weather and air quality on one map',
      sources: 'Real-time data from several external APIs',
    },
    views: {
      mapa: '2D map with layers, recent events and a timeline',
      regional: 'Regional map with events grouped by area',
      atmosfera: 'Air quality and rain radar layers switched on',
      globo: '3D globe with the earthquakes of the last 24 hours',
    },
  },
  turno: {
    title: 'Turno',
    category: 'Prototype · Next.js & PostgreSQL',
    caption: 'Order food ahead on campus and skip the line.',
    description:
      'Advance ordering and capacity-control system for campus dining: lets users book pickup windows and automatically redistributes peak-hour demand by suggesting the next available slot. Built as an operational optimization prototype.',
    altDesktop: 'Screenshot of the desktop version of Turno, with demo data',
    highlights: {
      booking: 'Advance booking with a pickup time',
      capacity: 'Capacity control per time slot',
      redistribution: 'Suggests the next slot when one fills up',
    },
    views: {
      inicio: 'Home: the break with and without Turno',
      comercio: 'Menu of a campus shop',
      pedido: 'Order with a pickup time to choose',
      como: 'How it works: the time of the break',
    },
  },
  iuris: {
    title: 'Iuris Consultus',
    category: 'Astro & Cloud',
    caption: 'Bilingual website for a law firm in Nicaragua.',
    description:
      'Bilingual (Spanish/English) corporate web platform for Nicaraguan law firm Iuris Consultus. Managed end-to-end delivery with the client: requirements gathering, development, domain/DNS setup, SSL, technical SEO, and ongoing production maintenance.',
    altDesktop: 'Screenshot of the desktop version of Iuris Consultus',
    highlights: {
      bilingual: 'Bilingual site in Spanish and English',
      delivery: 'From requirements gathering to production',
      operation: 'Domain, DNS, SSL, technical SEO and maintenance',
    },
    views: {
      inicio: 'Home page in Spanish',
      servicios: 'The firm\'s practice areas',
      nosotros: 'The firm and its team',
      ingles: 'English version of the site',
    },
  },
  claudehub: {
    title: 'ClaudeHub',
    category: 'Electron / Node · AI & FinOps',
    caption: 'Desktop app that tracks Claude Code usage (demo mode).',
    description:
      'Desktop telemetry app built to monitor and audit token consumption and session usage when working with AI coding agents (Claude Code), providing visibility over AI-assisted workflow costs. The screenshots come from demo mode, with fictitious data.',
    altDesktop: 'Screenshot of ClaudeHub in demo mode, with fictitious data',
    highlights: {
      usage: 'Token usage by session, model and project',
      agents: 'Plan limits and live active agents',
      cost: 'Estimated API value to keep the budget in check',
    },
    views: {
      resumen: 'Usage overview: API value, tokens and active days',
      agentes: 'Usage pace, plan limits and active agents',
      modelos: 'Usage and API value by model',
      sesiones: 'Session table with tokens and API value',
    },
  },
  systech: {
    title: 'SYSTECH UAM',
    category: 'Web Lead · WordPress & MySQL',
    caption: 'Official website of the UAM engineering congress.',
    description:
      'Official website for the annual engineering and technology congress at Universidad Americana (UAM). As Web Team Lead, I coordinated deployment, content administration, database management, and site reliability throughout the event.',
    altDesktop: 'Screenshot of the desktop version of the SYSTECH UAM site',
    highlights: {
      lead: 'Web team leadership',
      content: 'Deployment and content administration',
      stability: 'Database and site reliability throughout the event',
    },
    views: {
      inicio: 'Home page of the congress',
      edicion: 'Page of the 2025 edition',
      mapa: 'Interactive map of the event',
    },
  },
  pantano: {
    title: 'Hotel El Pantano',
    category: 'Client Project · Astro',
    caption: 'Website for a hotel and restaurant in Nueva Segovia.',
    description:
      'Commercial web platform for Hotel & Restaurant El Pantano (Nueva Segovia): centralizes rooms, menu, and event listings while funneling bookings directly to WhatsApp. Delivered end-to-end as a freelance project.',
    altDesktop: 'Screenshot of the desktop version of the Hotel El Pantano site',
    highlights: {
      catalog: 'Catalog of rooms, menu and events',
      whatsapp: 'Bookings sent straight to WhatsApp',
      turnkey: 'Freelance project delivered end to end',
    },
    views: {
      inicio: 'Home of the hotel and restaurant',
      menu: 'Restaurant menu',
      habitaciones: 'Cabins and rooms',
      eventos: 'Gardens and hall for events',
    },
  },
  portfolio: {
    title: 'This portfolio',
    category: 'React 19',
    caption: 'This site, with 3D animations.',
    description:
      'My bilingual (Spanish/English) personal site featuring an interactive 3D tech stack visualization and smooth animations.',
    altDesktop: 'Screenshot of the desktop version of this portfolio',
    highlights: {
      bilingual: 'Bilingual site in Spanish and English',
      scene: 'Interactive 3D visualization of the tech stack',
      motion: 'Smooth animations with GSAP',
    },
    views: {
      inicio: 'Home with the animated four-node curve',
      'sobre-mi': 'About me section',
      proyectos: '3D project carousel',
      servicios: 'Services and work process',
    },
  },
  status: {
    production: 'In production',
    paused: 'On hold',
    delivered: 'Delivered',
    active: 'Active',
    completed: 'Completed',
    pilot: 'In Pilot',
  },
  ui: {
    galleryTitle: 'Project views',
    openView: 'Enlarge',
    video: 'Video',
    viewCounter: 'of',
    closeView: 'Close',
    previousView: 'Previous view',
    nextView: 'Next view',
    demo: 'View demo',
    code: 'View code',
    privateCode: 'Private code (Client / PCE Thesis)',
    newTab: '(opens in a new tab)',
    ringLabel: 'Project carousel',
    cardOf: 'of',
    previous: 'Previous project',
    next: 'Next project',
    detailsTitle: 'Project details',
    featured: 'Featured',
    technologies: 'Technologies',
  },
} as const;
