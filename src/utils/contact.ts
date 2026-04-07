export const contactReasonKeys = ['proposal', 'collaboration', 'advisory', 'others'] as const;

export type ContactReasonKey = (typeof contactReasonKeys)[number];

export interface ContactFormState {
  fullName: string;
  email: string;
  contactReasons: Record<ContactReasonKey, boolean>;
  message: string;
  company: string;
}

export interface ContactRequestPayload {
  fullName: string;
  email: string;
  message: string;
  reasons: ContactReasonKey[];
  language: 'es' | 'en';
  company?: string;
}

export interface ContactValidationErrors {
  fullName?: string;
  email?: string;
  message?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const reasonLabels = {
  es: {
    proposal: 'Propuesta de trabajo',
    collaboration: 'Colaboración',
    advisory: 'Asesoría',
    others: 'Otro',
  },
  en: {
    proposal: 'Job proposal',
    collaboration: 'Collaboration',
    advisory: 'Advisory',
    others: 'Other',
  },
} as const;

const validationMessages = {
  es: {
    fullName: 'El nombre es requerido',
    emailRequired: 'El correo es requerido',
    emailInvalid: 'Correo inválido',
    message: 'El mensaje es requerido',
  },
  en: {
    fullName: 'Name is required',
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email',
    message: 'Message is required',
  },
} as const;

export function isValidEmail(email: string) {
  return emailPattern.test(email.trim());
}

export function normalizeContactText(value: string) {
  return value.trim().replace(/\r\n/g, '\n');
}

export function getSelectedContactReasons(contactReasons: Record<ContactReasonKey, boolean>) {
  return contactReasonKeys.filter((reason) => contactReasons[reason]);
}

export function formatContactReasons(reasons: ContactReasonKey[], language: 'es' | 'en') {
  return reasons.map((reason) => reasonLabels[language][reason]).join(', ');
}

export function getContactReasonLabel(reason: ContactReasonKey, language: 'es' | 'en') {
  return reasonLabels[language][reason];
}

export function validateContactForm(values: Pick<ContactFormState, 'fullName' | 'email' | 'message'>, language: 'es' | 'en') {
  const messages = validationMessages[language];
  const errors: ContactValidationErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = messages.fullName;
  }

  if (!values.email.trim()) {
    errors.email = messages.emailRequired;
  } else if (!isValidEmail(values.email)) {
    errors.email = messages.emailInvalid;
  }

  if (!values.message.trim()) {
    errors.message = messages.message;
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

export function toContactRequestPayload(values: ContactFormState, language: 'es' | 'en'): ContactRequestPayload {
  return {
    fullName: normalizeContactText(values.fullName),
    email: normalizeContactText(values.email),
    message: normalizeContactText(values.message),
    reasons: getSelectedContactReasons(values.contactReasons),
    language,
    company: normalizeContactText(values.company),
  };
}