export const contact = {
  label: 'GET IN TOUCH',
  title: "Let's Work Together",
  subtitle: 'If you have an idea, an improvement, or a question, send it over and I will review it.',
  description: 'Here you will find a direct and clear way to contact me for new projects, collaborations, or consultations.',
  form: {
    fullName: 'Full Name',
    fullNamePlaceholder: 'Type here',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    reason: 'Reason for contact',
    selectHint: 'Select one or more reasons and describe the details in the message.',
    errors: {
      nameRequired: 'Name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Invalid email',
      messageRequired: 'Message is required',
    },
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
    message: 'Your Message',
    messagePlaceholder: 'Tell me what you need, timelines, or references...',
    submit: 'Send Message',
    sending: 'Sending...',
    successMessage: "Message sent successfully! I'll get back to you soon.",
    errorMessage: 'There was an error. Please try again.',
    throttledMessage: 'You just sent a message. Please wait a minute before sending another.',
  },
} as const;
