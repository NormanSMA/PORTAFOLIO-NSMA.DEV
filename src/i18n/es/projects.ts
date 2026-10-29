export const projects = {
  title: 'Proyectos',
  subtitle: 'Proyectos personales, de tesis y de clientes. Elige uno en el carrusel para ver su ficha.',
  autofinops: {
    title: 'AutoFinOps-NI',
    category: 'UiPath RPA & SQL',
    caption: 'Bot RPA que concilia facturas PDF y las audita en PostgreSQL.',
    description:
      'Bot RPA empresarial (Dispatcher + Performer en REFramework) que lee facturas PDF por correo IMAP, consulta la tasa oficial del BCN vía SOAP, valida IVA (15%) y retención IR (2%) de Nicaragua, y audita cada transacción en PostgreSQL 17 con tablero en Metabase y reporte diario en Excel/HTML.',
    altDesktop: 'Captura del tablero de Metabase de AutoFinOps-NI, con datos ficticios',
    highlights: {
      speed: '~1.7 s por factura (vs. 4.5 min manual)',
      run: 'Prueba real: 19 facturas, 78.95 % de éxito y C$ 125,518.46 aprobados',
      exceptions: 'Manejo de excepciones BRE y reintentos en Orchestrator',
      infra: 'Docker Compose: PostgreSQL 17 + Metabase + GreenMail',
    },
    views: {
      demo: 'Demo en video de 49 s: del correo con PDF al reporte',
      metabase: 'Tablero de Metabase con los KPI de conciliación',
      orchestrator: 'Cola Invoices_Queue en UiPath Orchestrator',
      correo: 'Correo de reporte a gerencia con el Excel adjunto',
    },
  },
  tracore: {
    title: 'TRACORE',
    category: 'Tesis PCE (UAM)',
    caption: 'Plataforma de gestión y trazabilidad para Soluciones Creativas.',
    description:
      'Plataforma web de gestión operativa y trazabilidad para Soluciones Creativas (Estelí, Nicaragua), desarrollada como piloto de culminación de estudios en la UAM. Conecta cotización, orden de trabajo, consumo de materiales y costos en un solo flujo: una cotización aprobada pasa a orden sin volver a digitar, descuenta inventario por etapa y registra cada cambio en una bitácora inmutable.',
    altDesktop: 'Captura de una orden de trabajo de TRACORE, con datos de demostración',
    highlights: {
      entry: 'Cero doble digitación (Cotización → Orden)',
      inventory: 'Control de inventario y costo real por etapa',
      audit: 'Bitácora de auditoría inmutable',
    },
    views: {
      cotizacion: 'Cotización aprobada con acceso directo a su orden de trabajo',
      avance: 'Orden de trabajo con avance por etapas y responsables',
      costos: 'Materiales de la orden: estimado, consumido y costo real',
      bitacora: 'Bitácora de la orden: cada cambio queda con usuario y fecha',
    },
  },
  ecopulse: {
    title: 'EcoPulse',
    category: 'Next.js & Datos',
    caption: 'Mapa en vivo de sismos, incendios, clima y calidad del aire.',
    description:
      'Plataforma de monitoreo y visualización de datos en tiempo real sobre sismos, incendios forestales, clima y calidad del aire a nivel global. Integra múltiples APIs externas sobre Supabase con representación en mapa 2D y globo 3D.',
    altDesktop: 'Captura de la versión de escritorio de EcoPulse',
    highlights: {
      views: 'Mapa 2D y globo 3D interactivos',
      hazards: 'Sismos, incendios, clima y calidad del aire en un solo mapa',
      sources: 'Datos en tiempo real desde varias APIs externas',
    },
    views: {
      mapa: 'Mapa 2D con capas, eventos recientes y línea de tiempo',
      regional: 'Mapa regional con los eventos agrupados por zona',
      atmosfera: 'Capas de calidad del aire y radar de lluvia activas',
      globo: 'Globo 3D con los sismos de las últimas 24 horas',
    },
  },
  turno: {
    title: 'Turno',
    category: 'Prototipo · Next.js & PostgreSQL',
    caption: 'Pide comida con anticipación en el campus y evita la fila.',
    description:
      'Sistema de reserva anticipada y control de capacidad para cafeterías universitarias: permite programar la hora de retiro y, cuando un bloque horario se llena, redistribuye la demanda sugiriendo el siguiente turno disponible. Desarrollado como prototipo de optimización operativa.',
    altDesktop: 'Captura de la versión de escritorio de Turno, con datos de demostración',
    highlights: {
      booking: 'Reserva anticipada con hora de retiro',
      capacity: 'Control de capacidad por bloque horario',
      redistribution: 'Sugiere el siguiente turno cuando un bloque se llena',
    },
    views: {
      inicio: 'Inicio: el receso con y sin Turno',
      comercio: 'Menú de un comercio del campus',
      pedido: 'Pedido con elección de la hora de retiro',
      como: 'Cómo funciona: el tiempo del receso',
    },
  },
  iuris: {
    title: 'Iuris Consultus',
    category: 'Astro & Cloud',
    caption: 'Sitio web bilingüe de una firma legal en Nicaragua.',
    description:
      'Plataforma web corporativa bilingüe (español e inglés) para la firma legal Iuris Consultus Nicaragua. Gestioné el proyecto de principio a fin con el cliente: levantamiento de requerimientos, desarrollo, configuración de dominio/DNS, certificado SSL, SEO técnico y mantenimiento continuo en producción.',
    altDesktop: 'Captura de la versión de escritorio de Iuris Consultus',
    highlights: {
      bilingual: 'Sitio bilingüe en español e inglés',
      delivery: 'Del levantamiento de requerimientos a producción',
      operation: 'Dominio, DNS, SSL, SEO técnico y mantenimiento',
    },
    views: {
      inicio: 'Página de inicio en español',
      servicios: 'Áreas de práctica de la firma',
      nosotros: 'La firma y su equipo',
      ingles: 'Versión en inglés del sitio',
    },
  },
  claudehub: {
    title: 'ClaudeHub',
    category: 'Electron / Node · IA & FinOps',
    caption: 'App de escritorio que mide el uso de Claude Code (modo demo).',
    description:
      'Aplicación de escritorio para monitorear y auditar el consumo de tokens y costos por sesión al trabajar con agentes de IA (Claude Code). Facilita el control de uso y presupuesto en flujos de trabajo asistidos por inteligencia artificial. Las capturas son del modo demo, con datos ficticios.',
    altDesktop: 'Captura de ClaudeHub en modo demo, con datos ficticios',
    highlights: {
      usage: 'Consumo de tokens por sesión, modelo y proyecto',
      agents: 'Límites del plan y agentes activos en vivo',
      cost: 'Valor de API estimado para controlar el presupuesto',
    },
    views: {
      resumen: 'Resumen del consumo: valor de API, tokens y días activos',
      agentes: 'Ritmo de uso, límites del plan y agentes activos',
      modelos: 'Consumo y valor de API por modelo',
      sesiones: 'Tabla de sesiones con tokens y valor de API',
    },
  },
  systech: {
    title: 'SYSTECH UAM',
    category: 'Liderazgo Web · WordPress & MySQL',
    caption: 'Sitio oficial del congreso de ingeniería de la UAM.',
    description:
      'Sitio oficial del congreso anual de ingeniería y tecnología de la Universidad Americana (UAM). Como líder del equipo web, coordiné el despliegue, la administración de contenidos, la base de datos y la estabilidad del portal durante el evento.',
    altDesktop: 'Captura de la versión de escritorio del sitio de SYSTECH UAM',
    highlights: {
      lead: 'Liderazgo del equipo web',
      content: 'Despliegue y administración de contenidos',
      stability: 'Base de datos y estabilidad del portal durante el evento',
    },
    views: {
      inicio: 'Página principal del congreso',
      edicion: 'Página de la edición 2025',
      mapa: 'Mapa interactivo del evento',
    },
  },
  pantano: {
    title: 'Hotel El Pantano',
    category: 'Cliente Real · Astro',
    caption: 'Sitio de un hotel y restaurante en Nueva Segovia.',
    description:
      'Plataforma web comercial para el Hotel y Restaurante El Pantano (Nueva Segovia): digitaliza el catálogo de habitaciones, menú y eventos, y canaliza las reservas directamente hacia WhatsApp. Proyecto freelance entregado llave en mano.',
    altDesktop: 'Captura de la versión de escritorio del sitio de Hotel El Pantano',
    highlights: {
      catalog: 'Catálogo de habitaciones, menú y eventos',
      whatsapp: 'Reservas canalizadas directo a WhatsApp',
      turnkey: 'Proyecto freelance entregado llave en mano',
    },
    views: {
      inicio: 'Inicio del hotel y restaurante',
      menu: 'Carta del restaurante',
      habitaciones: 'Cabañas y habitaciones',
      eventos: 'Jardines y salón para eventos',
    },
  },
  portfolio: {
    title: 'Este portafolio',
    category: 'React 19',
    caption: 'Este sitio, con animaciones en 3D.',
    description:
      'Mi sitio personal bilingüe (español e inglés) con visualización 3D interactiva del stack técnico y animaciones fluidas.',
    altDesktop: 'Captura de la versión de escritorio de este portafolio',
    highlights: {
      bilingual: 'Sitio bilingüe en español e inglés',
      scene: 'Visualización 3D interactiva del stack técnico',
      motion: 'Animaciones fluidas con GSAP',
    },
    views: {
      inicio: 'Inicio con la curva animada de cuatro nodos',
      'sobre-mi': 'Sección Sobre mí',
      proyectos: 'Carrusel 3D de proyectos',
      servicios: 'Servicios y proceso de trabajo',
    },
  },
  status: {
    production: 'En producción',
    paused: 'En pausa',
    delivered: 'Entregado',
    active: 'Activo',
    completed: 'Completado',
    pilot: 'En piloto',
  },
  ui: {
    galleryTitle: 'Vistas del proyecto',
    openView: 'Ampliar',
    video: 'Video',
    viewCounter: 'de',
    closeView: 'Cerrar',
    previousView: 'Vista anterior',
    nextView: 'Vista siguiente',
    demo: 'Ver demo',
    code: 'Ver código',
    privateCode: 'Código privado (Cliente / Tesis PCE)',
    newTab: '(abre en una pestaña nueva)',
    ringLabel: 'Carrusel de proyectos',
    cardOf: 'de',
    previous: 'Proyecto anterior',
    next: 'Proyecto siguiente',
    detailsTitle: 'Ficha del proyecto',
    featured: 'Destacado',
    technologies: 'Tecnologías',
  },
} as const;
