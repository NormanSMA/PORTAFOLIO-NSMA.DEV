export const REASON_KEYS = ['proposal', 'collaboration', 'advisory', 'others'] as const;

export type ReasonKey = (typeof REASON_KEYS)[number];
export type TextFieldName = 'fullName' | 'email' | 'message';
export type ErrorCode = 'nameRequired' | 'emailRequired' | 'emailInvalid' | 'messageRequired';

export interface ContactFields {
  fullName: string;
  email: string;
  contactReasons: Record<ReasonKey, boolean>;
  message: string;
}

// An undefined value means the field has no error, so a cleared error can stay as a key.
export type ContactErrors = Partial<Record<TextFieldName, ErrorCode | undefined>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function createEmptyFields(): ContactFields {
  return {
    fullName: '',
    email: '',
    contactReasons: { proposal: false, collaboration: false, advisory: false, others: false },
    message: '',
  };
}

// Returns error codes, not text, so the message follows the language active at render time.
export function validateContact(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {};

  if (!fields.fullName.trim()) {
    errors.fullName = 'nameRequired';
  }

  if (!fields.email.trim()) {
    errors.email = 'emailRequired';
  } else if (!EMAIL_PATTERN.test(fields.email)) {
    errors.email = 'emailInvalid';
  }

  if (!fields.message.trim()) {
    errors.message = 'messageRequired';
  }

  return errors;
}

export function hasErrors(errors: ContactErrors): boolean {
  return Object.values(errors).some(Boolean);
}
