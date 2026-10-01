export const contact = {
  title: "Let's work together",
  description: 'Tell me about the offer, project, or question. I reply by email.',
  availability: 'Looking for an internship or a job · Managua or remote',
  channels: {
    label: 'Direct channels',
    email: 'Email',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    newTab: '(opens in a new tab)',
  },
  form: {
    fullName: 'Full name',
    fullNamePlaceholder: 'Your name',
    email: 'Email',
    emailPlaceholder: 'you@email.com',
    reason: 'Reason for contact',
    selectHint: 'Pick one or more reasons. Put the details in the message.',
    errors: {
      nameRequired: 'Enter your name',
      emailRequired: 'Enter your email',
      emailInvalid: 'Enter a valid email',
      messageRequired: 'Enter a message',
    },
    // The titles also go into the email as the reason chips, so keep them stable.
    reasons: {
      proposal: {
        title: 'Job proposal',
        desc: 'Job offer or freelance project',
      },
      collaboration: {
        title: 'Collaboration',
        desc: 'Work together on a project',
      },
      advisory: {
        title: 'Advisory',
        desc: 'Technical consulting or mentoring',
      },
      others: {
        title: 'Other',
        desc: 'Other reason',
      },
    },
    message: 'Message',
    messagePlaceholder: 'What you need, timelines, or references',
    submit: 'Send message',
    sending: 'Sending…',
    successMessage: "Message sent. I'll reply by email.",
    errorMessage: 'The message could not be sent. Try again.',
    throttledMessage: 'You just sent a message. Wait a minute before sending another.',
    honeypotLabel: 'Do not fill this field',
  },
} as const;
