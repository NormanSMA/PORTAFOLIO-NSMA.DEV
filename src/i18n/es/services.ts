export const services = {
  heading: 'Qué hago y cómo trabajo',
  title: 'Servicios',
  subtitle: 'Trabajo por proyecto, desde los requisitos hasta el sitio publicado.',
  webDev: {
    title: 'Desarrollo web y aplicaciones',
    description: 'Desarrollo sitios con Astro y React, y sitios en WordPress. Si el proyecto lo pide, agrego versión bilingüe, mejoras de rendimiento y SEO básico.',
  },
  backend: {
    title: 'Backend y APIs',
    description: 'Construyo APIs con Node.js y PHP (Laravel) sobre PostgreSQL o MySQL. Integro servicios externos y valido los datos que recibe cada endpoint.',
  },
  deployment: {
    title: 'Hosting y despliegue',
    description: 'Publico en Vercel y configuro el dominio y el certificado SSL. Después del lanzamiento reviso el sitio y hago los ajustes de mantenimiento.',
  },
} as const;
