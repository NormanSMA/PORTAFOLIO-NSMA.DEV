import { useEffect, useRef, useState, type FormEvent } from 'react';
import { isCoolingDown, isTooFast, markSent } from './antiSpam';
import { sendContact, type ReasonLabels } from './sendContact';
import {
  createEmptyFields,
  hasErrors,
  validateContact,
  type ContactErrors,
  type ContactFields,
  type ReasonKey,
  type TextFieldName,
} from './validation';

export type SubmitStatus = 'idle' | 'sending' | 'success' | 'error' | 'throttled';

const SUCCESS_VISIBLE_MS = 5_000;

export function useContactForm(reasonLabels: ReasonLabels) {
  const [fields, setFields] = useState<ContactFields>(createEmptyFields);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [honeypot, setHoneypot] = useState('');
  const mountedAtRef = useRef(Date.now());

  // The success message hides itself; the timer is cleared if the status changes or the form unmounts.
  useEffect(() => {
    if (status !== 'success') return;
    const timer = setTimeout(() => setStatus('idle'), SUCCESS_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const setField = (name: TextFieldName, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const toggleReason = (reason: ReasonKey) => {
    setFields((prev) => ({
      ...prev,
      contactReasons: { ...prev.contactReasons, [reason]: !prev.contactReasons[reason] },
    }));
  };

  // Honeypot and the 3 s trap return without feedback so a bot learns nothing from the response.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (honeypot) return;
    if (isTooFast(mountedAtRef.current)) return;

    if (isCoolingDown()) {
      setStatus('throttled');
      return;
    }

    const found = validateContact(fields);
    setErrors(found);
    if (hasErrors(found)) return;

    setStatus('sending');

    try {
      const result = await sendContact(fields, reasonLabels);
      if (result === 'sent') markSent();
      setFields(createEmptyFields());
      setErrors({});
      setStatus('success');
    } catch (error) {
      console.error('EmailJS error:', error);
      setStatus('error');
    }
  };

  return {
    fields,
    errors,
    status,
    honeypot,
    setHoneypot,
    setField,
    toggleReason,
    handleSubmit,
  };
}
