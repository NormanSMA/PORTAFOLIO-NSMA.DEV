export const process = {
  title: 'Proceso de trabajo',
  steps: {
    discovery: {
      title: 'Descubrimiento y reglas',
      description: 'Entiendo el proceso actual, identifico dónde se pierde tiempo o datos y defino las reglas y plazos antes de construir.',
    },
    strategy: {
      title: 'Diseño de datos y arquitectura',
      description: 'Modelo la base de datos, elijo las herramientas (web, cloud o RPA) y estructuro cómo fluirá la información.',
    },
    build: {
      title: 'Construcción y pruebas',
      description: 'Desarrollo por etapas bajo Scrum, valido casos de error y pruebo con datos reales o de aceptación.',
    },
    optimize: {
      title: 'Despliegue y trazabilidad',
      description: 'Publico en producción con dominio, SSL o contenedores Docker, dejando bitácoras, métricas y documentación clara.',
    },
  },
} as const;
