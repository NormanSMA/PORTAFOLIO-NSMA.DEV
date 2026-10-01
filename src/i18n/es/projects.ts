export const projects = {
  title: 'Proyectos',
  subtitle: 'Proyectos personales, de tesis y de clientes. Elige uno en el carrusel para ver su ficha.',
  ecopulse: {
    title: 'EcoPulse',
    caption: 'Monitor ambiental y sísmico global en tiempo real, con mapa 2D y globo 3D.',
    description:
      'Monitor ambiental y sísmico global con ocho capas de datos en vivo: sismos, calidad del aire observada y modelada, incendios, clima, desastres globales, posición de la ISS y volcanes. El mapa usa MapLibre y el globo 3D usa Cesium, con alternancia entre 2D y 3D. Supabase con PostGIS guarda los datos (lectura pública, escritura solo con service_role), GitHub Actions programa la ingesta y Discord recibe alertas de sismos mayores a M6.0.',
    altDesktop: 'Captura de la versión de escritorio de EcoPulse',
    altMobile: 'Captura de la versión móvil de EcoPulse',
  },
  turno: {
    title: 'Turno',
    caption: 'Pedido anticipado que reserva capacidad de cocina por franja horaria.',
    description:
      'Sistema de pedido anticipado con control de admisión por capacidad: reserva capacidad de cocina y, si el pedido no cabe en una franja, propone la siguiente con espacio. Incluye un experimento A/B para aplanar el pico de demanda en un receso de 30 minutos. Es mi proyecto de tesis en la UAM, hoy en pausa, con el núcleo en 31 módulos puros sin acceso a base de datos ni a reloj.',
    altDesktop: 'Captura de la versión de escritorio de Turno',
    altMobile: 'Captura de la versión móvil de Turno',
  },
  iuris: {
    title: 'Iuris Consultus',
    caption: 'Sitio corporativo bilingüe de la firma legal Iuris Consultus Nicaragua.',
    description:
      'Sitio corporativo bilingüe (es/en) de la firma legal Iuris Consultus Nicaragua, entregado y en mantenimiento. Cubrí el ciclo completo (requerimientos, desarrollo y despliegue), la administración del dominio y el hosting, y mejoras de rendimiento y SEO. Usa Astro 6 con render en servidor, React 19 para islas, un formulario de contacto con honeypot y límite de peticiones, sitemap y metadatos sociales.',
    altDesktop: 'Captura de la versión de escritorio de Iuris Consultus',
    altMobile: 'Captura de la versión móvil de Iuris Consultus',
  },
  claudehub: {
    title: 'ClaudeHub',
    caption: 'Monitor de tokens de Claude Code. Captura del modo demo, con datos ficticios.',
    description:
      'Aplicación de escritorio que monitorea el consumo de tokens de Claude Code: por sesión, orquestador frente a subagentes, modelos usados y alertas de límite. Lee los registros JSONL locales de forma incremental, usa Hono, React 19 y Electron, e incluye instalador para Windows; es de código abierto (MIT), versión 0.3.1. La captura muestra el modo demo, con datos ficticios.',
    altDesktop: 'Captura de ClaudeHub en modo demo, con datos ficticios',
  },
  systech: {
    title: 'SYSTECH UAM',
    caption: 'Sitio oficial del congreso anual de ingeniería de la Universidad Americana.',
    description:
      'Sitio oficial del congreso anual de ingeniería SYSTECH de la Universidad Americana (UAM). Fui líder de desarrollo web: desarrollé y administré el sitio, personalicé plantillas y configuré plugins para registros y agenda. También publiqué y actualicé el contenido del congreso.',
    altDesktop: 'Captura de la versión de escritorio del sitio de SYSTECH UAM',
  },
  pantano: {
    title: 'Hotel El Pantano',
    caption: 'Sitio del Hotel y Restaurante El Pantano: habitaciones, menú, eventos y reservas.',
    description:
      'Sitio del Hotel y Restaurante El Pantano, en Jalapa, Nueva Segovia, Nicaragua: habitaciones, menú, eventos de hasta 400 personas, historia y reservas por WhatsApp. Como proyecto freelance cubrí la consultoría inicial, el diseño UX/UI, el desarrollo y el despliegue en Vercel. El SEO usa datos estructurados de Schema.org.',
    altDesktop: 'Captura de la versión de escritorio del sitio de Hotel El Pantano',
    altMobile: 'Captura de la versión móvil del sitio de Hotel El Pantano',
  },
  portfolio: {
    title: 'Este portafolio',
    caption: 'Este sitio: shader WebGL con OGL, animaciones con GSAP e interfaz bilingüe.',
    description:
      'Este es el portafolio que estás viendo. El fondo es un shader WebGL con OGL, las animaciones de scroll usan GSAP y la interfaz es bilingüe (es/en). El formulario de contacto usa EmailJS con protección anti-spam y el sitio se despliega en Vercel.',
    altDesktop: 'Captura de la versión de escritorio de este portafolio',
  },
  status: {
    production: 'En producción',
    paused: 'En pausa',
    delivered: 'Entregado',
    active: 'Activo',
  },
  metrics: {
    tests: 'Pruebas automáticas',
    testsUnitIntegration: 'Pruebas unitarias y de integración',
    testsE2E: 'Pruebas E2E (tema claro y oscuro)',
    coverageCore: 'Cobertura del núcleo',
    lighthousePerformance: 'Lighthouse: rendimiento',
  },
  ui: {
    demo: 'Ver demo',
    code: 'Ver código',
    newTab: '(abre en una pestaña nueva)',
    ringLabel: 'Carrusel de proyectos',
    cardOf: 'de',
    previous: 'Proyecto anterior',
    next: 'Proyecto siguiente',
    detailsTitle: 'Ficha del proyecto',
    featured: 'Destacado',
    technologies: 'Tecnologías',
    metrics: 'Cifras medidas',
    asOf: 'Al',
  },
} as const;
