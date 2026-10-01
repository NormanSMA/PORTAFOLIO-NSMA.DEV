export const contact = {
  label: 'CONTÁCTAME',
  title: 'Trabajemos Juntos',
  subtitle: 'Si tienes una idea, una mejora o una consulta, escríbeme y la revisamos.',
  description: 'Aquí encontrarás una forma directa y clara de contactarme para nuevos proyectos, colaboraciones o asesorías.',
  form: {
    fullName: 'Nombre Completo',
    fullNamePlaceholder: 'Escribe tu nombre aquí',
    email: 'Correo Electrónico',
    emailPlaceholder: 'tu@email.com',
    reason: 'Motivo de contacto',
    selectHint: 'Selecciona uno o más motivos y describe los detalles en el mensaje.',
    errors: {
      nameRequired: 'El nombre es requerido',
      emailRequired: 'El correo es requerido',
      emailInvalid: 'Correo inválido',
      messageRequired: 'El mensaje es requerido',
    },
    reasons: {
      proposal: {
        title: 'Propuesta de trabajo',
        desc: 'Oferta laboral o proyecto freelance',
      },
      collaboration: {
        title: 'Colaboración',
        desc: 'Trabajar juntos en un proyecto',
      },
      advisory: {
        title: 'Asesoría',
        desc: 'Consultoría técnica o mentoría',
      },
      others: {
        title: 'Otro',
        desc: 'Otro motivo',
      },
    },
    message: 'Tu Mensaje',
    messagePlaceholder: 'Cuéntame qué necesitas, plazos o referencias...',
    submit: 'Enviar Mensaje',
    sending: 'Enviando...',
    successMessage: '¡Mensaje enviado con éxito! Te responderé pronto.',
    errorMessage: 'Hubo un error. Por favor intenta de nuevo.',
    throttledMessage: 'Acabas de enviar un mensaje. Espera un minuto antes de enviar otro.',
  },
} as const;
