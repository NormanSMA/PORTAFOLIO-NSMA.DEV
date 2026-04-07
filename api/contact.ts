import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolveMx } from 'node:dns/promises';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import ContactNotificationEmail from '../src/emails/ContactNotificationEmail';
import {
  contactReasonKeys,
  formatContactReasons,
  isValidEmail,
  normalizeContactText,
  type ContactRequestPayload,
  type ContactReasonKey,
} from '../src/utils/contact';

type ApiRequest = IncomingMessage & {
  body?: unknown;
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type ApiResponse = ServerResponse & {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

const ownerEmail = process.env.CONTACT_TO_EMAIL || process.env.VITE_OWNER_EMAIL || 'norman.martinez003@gmail.com';
const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>';
const resendApiKey = process.env.RESEND_API_KEY;

function sendJson(res: ApiResponse, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function parseBody(body: unknown): ContactRequestPayload {
  if (typeof body === 'string') {
    return JSON.parse(body) as ContactRequestPayload;
  }

  if (body && typeof body === 'object') {
    return body as ContactRequestPayload;
  }

  throw new Error('Invalid request body');
}

function getLanguage(language: unknown): 'es' | 'en' {
  return language === 'en' ? 'en' : 'es';
}

function getReasonArray(reasons: unknown): ContactReasonKey[] {
  if (!Array.isArray(reasons)) {
    return [];
  }

  return reasons.filter((reason): reason is ContactReasonKey => contactReasonKeys.includes(reason as ContactReasonKey));
}

async function emailHasMxRecord(email: string) {
  const domain = email.split('@')[1];
  if (!domain) {
    return false;
  }

  try {
    const mxRecords = await resolveMx(domain);
    return mxRecords.length > 0;
  } catch {
    return false;
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, {
      ok: false,
      message: 'Method not allowed',
    });
    return;
  }

  try {
    const payload = parseBody(req.body);
    const language = getLanguage(payload.language);
    const fullName = normalizeContactText(payload.fullName || '');
    const email = normalizeContactText(payload.email || '');
    const message = normalizeContactText(payload.message || '');
    const reasons = getReasonArray(payload.reasons);

    if (payload.company && normalizeContactText(payload.company)) {
      sendJson(res, 200, {
        ok: true,
        message: language === 'es' ? 'Mensaje recibido.' : 'Message received.',
      });
      return;
    }

    const errors: Record<string, string> = {};
    if (!fullName) {
      errors.fullName = language === 'es' ? 'El nombre es requerido' : 'Name is required';
    }
    if (!email) {
      errors.email = language === 'es' ? 'El correo es requerido' : 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = language === 'es' ? 'Correo inválido' : 'Invalid email';
    }
    if (!message) {
      errors.message = language === 'es' ? 'El mensaje es requerido' : 'Message is required';
    }

    if (Object.keys(errors).length > 0) {
      sendJson(res, 400, {
        ok: false,
        message: language === 'es' ? 'Revisa los campos marcados.' : 'Check the highlighted fields.',
        errors,
      });
      return;
    }

    if (!(await emailHasMxRecord(email))) {
      sendJson(res, 400, {
        ok: false,
        message: language === 'es'
          ? 'El correo no parece ser válido o no tiene un dominio con buzón activo.'
          : 'The email does not appear to be valid or the domain does not have an active mailbox.',
        errors: {
          email: language === 'es'
            ? 'El dominio del correo no es válido'
            : 'The email domain is invalid',
        },
      });
      return;
    }

    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY');
    }

    const resend = new Resend(resendApiKey);
    const receivedAt = new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date());

    const emailHtml = await render(
      ContactNotificationEmail({
        fullName,
        email,
        message,
        reasons,
        language,
        receivedAt,
      })
    );

    const response = await resend.emails.send({
      from: fromEmail,
      to: [ownerEmail],
      replyTo: email,
      subject: `${language === 'es' ? 'Nuevo mensaje' : 'New message'} · ${fullName}`,
      html: emailHtml,
    });

    sendJson(res, 200, {
      ok: true,
      message: language === 'es' ? 'Mensaje enviado con éxito.' : 'Message sent successfully.',
      id: response.data?.id ?? null,
      summary: formatContactReasons(reasons, language),
    });
  } catch (error) {
    console.error('Contact API error:', error);

    sendJson(res, 500, {
      ok: false,
      message: 'Unable to process contact request',
    });
  }
}