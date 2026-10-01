import { REASON_KEYS, type ContactFields, type ReasonKey } from './validation';

export type ReasonLabels = Record<ReasonKey, string>;
export type SendResult = 'sent' | 'skipped';

// Used when VITE_OWNER_EMAIL is not set.
const FALLBACK_OWNER_EMAIL = 'norman.martinez003@gmail.com';

// Email clients ignore CSS variables and classes, so the chip keeps literal inline colors.
function reasonChip(label: string): string {
  return `<span style="display: inline-block; background-color: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.35); padding: 6px 12px; margin-right: 8px; margin-bottom: 8px; font-family: 'DM Sans', sans-serif; font-weight: bold; font-size: 13px; color: #93C5FD;">${label}</span>`;
}

export function buildReasonsHtml(
  selected: Record<ReasonKey, boolean>,
  labels: ReasonLabels,
): string {
  return REASON_KEYS.filter((key) => selected[key])
    .map((key) => reasonChip(labels[key] || key))
    .join(' ');
}

// Without the three EmailJS variables nothing is sent and the call reports 'skipped',
// so local development shows the success state without a real delivery.
export async function sendContact(
  fields: ContactFields,
  labels: ReasonLabels,
): Promise<SendResult> {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS env vars not set. Skipping email send.');
    return 'skipped';
  }

  const templateParams = {
    from_name: fields.fullName,
    from_email: fields.email,
    message: fields.message,
    reasons: buildReasonsHtml(fields.contactReasons, labels) || 'No especificado',
    received_at: new Date().toLocaleString(),
    owner_email: (import.meta.env.VITE_OWNER_EMAIL as string | undefined) || FALLBACK_OWNER_EMAIL,
  };

  // Loaded on the first submit so the library stays out of the section chunk.
  const { default: emailjs } = await import('@emailjs/browser');

  try {
    emailjs.init(publicKey);
  } catch (error) {
    console.error('EmailJS init error:', error);
  }

  await emailjs.send(serviceId, templateId, templateParams);
  return 'sent';
}
