export const contact = {
  title: 'Trabajemos juntos',
  description: 'Cuéntame sobre la oferta, el proyecto o la consulta. Te respondo por correo.',
  availability: 'Busco pasantía o empleo · Managua o remoto',
  channels: {
    label: 'Canales directos',
    email: 'Correo',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    newTab: '(se abre en una pestaña nueva)',
  },
  form: {
    fullName: 'Nombre completo',
    fullNamePlaceholder: 'Tu nombre',
    email: 'Correo electrónico',
    emailPlaceholder: 'tu@correo.com',
    reason: 'Motivo de contacto',
    selectHint: 'Elige uno o más motivos. Los detalles van en el mensaje.',
    errors: {
      nameRequired: 'Escribe tu nombre',
      emailRequired: 'Escribe tu correo',
      emailInvalid: 'Escribe un correo válido',
      messageRequired: 'Escribe un mensaje',
    },
    // The titles also go into the email as the reason chips, so keep them stable.
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
    message: 'Mensaje',
    messagePlaceholder: 'Qué necesitas, plazos o referencias',
    submit: 'Enviar mensaje',
    sending: 'Enviando…',
    successMessage: 'Mensaje enviado. Te responderé por correo.',
    errorMessage: 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
    throttledMessage: 'Acabas de enviar un mensaje. Espera un minuto antes de enviar otro.',
    honeypotLabel: 'No llenar este campo',
  },
} as const;
