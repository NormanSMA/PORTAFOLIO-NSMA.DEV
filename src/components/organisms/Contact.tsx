import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Mail, Linkedin, Github } from 'lucide-react';
import { useLanguage } from '../../hooks';
import { Container } from '../atoms';
import { typography } from '../../config/typography';
import { APP_CONFIG } from '../../config/constants';
import {
  toContactRequestPayload,
  validateContactForm,
  type ContactFormState,
  type ContactReasonKey,
} from '../../utils/contact';

interface FormErrors {
  fullName?: string;
  email?: string;
  message?: string;
}

// ─── Access helpers en lugar de switch ───
const reasonKeys: ContactReasonKey[] = ['proposal', 'collaboration', 'advisory', 'others'];

function getReasonValue(reasons: ContactFormState['contactReasons'], reason: ContactReasonKey): boolean {
  return reasons[reason];
}

function toggleReasonValue(reasons: ContactFormState['contactReasons'], reason: ContactReasonKey): ContactFormState['contactReasons'] {
  return { ...reasons, [reason]: !reasons[reason] };
}

function hasFieldError(errors: FormErrors, field: keyof Pick<ContactFormState, 'fullName' | 'email' | 'message' | 'company'>): boolean {
  if (field === 'company') return false;
  return Boolean(errors[field]);
}

function clearFieldError(currentErrors: FormErrors, field: keyof Pick<ContactFormState, 'fullName' | 'email' | 'message' | 'company'>): FormErrors {
  if (field === 'company') return currentErrors;
  return { ...currentErrors, [field]: undefined };
}

export function Contact() {
  const { t, language } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);

  const [formData, setFormData] = useState<ContactFormState>({
    fullName: '',
    email: '',
    contactReasons: { proposal: false, collaboration: false, advisory: false, others: false },
    message: '',
    company: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Detectar conectividad
  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  const reasons: Array<{ key: ContactReasonKey; label: string; desc: string }> = reasonKeys.map((key) => ({
    key,
    label: t(`contact.form.reasons.${key}.title`),
    desc: t(`contact.form.reasons.${key}.desc`),
  }));

  const directChannels = [
    { key: 'email', title: 'Email', value: APP_CONFIG.email, href: `mailto:${APP_CONFIG.email}`, Icon: Mail },
    { key: 'linkedin', title: 'LinkedIn', value: '@norman-martinez', href: 'https://www.linkedin.com/in/norman-martinez', Icon: Linkedin },
    { key: 'github', title: 'GitHub', value: '@NormanSMA', href: 'https://github.com/NormanSMA', Icon: Github },
  ];

  const handleInputChange = (
    field: keyof Pick<ContactFormState, 'fullName' | 'email' | 'message' | 'company'>,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field !== 'company' && hasFieldError(errors, field)) {
      setErrors((prev) => clearFieldError(prev, field));
    }
  };

  const toggleReason = (reason: ContactReasonKey) => {
    setFormData((prev) => ({
      ...prev,
      contactReasons: toggleReasonValue(prev.contactReasons, reason),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isOnline) {
      setSubmitStatus('error');
      setSubmitMessage(language === 'es' ? 'Sin conexión a internet. Verifica tu conexión.' : 'No internet connection. Please check your connection.');
      return;
    }

    const validation = validateContactForm(formData, language);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setSubmitStatus('error');
      setSubmitMessage(language === 'es' ? 'Revisa los campos del formulario.' : 'Check the form fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const payload = toContactRequestPayload(formData, language);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { ok: boolean; message?: string; errors?: FormErrors };

      if (!response.ok || !result.ok) {
        setSubmitStatus('error');
        setSubmitMessage(result.message || (language === 'es' ? 'No se pudo enviar el mensaje.' : 'The message could not be sent.'));
        setErrors(result.errors || {});
        return;
      }

      setSubmitStatus('success');
      setSubmitMessage(result.message || (language === 'es' ? 'Mensaje enviado con éxito.' : 'Message sent successfully.'));
      setFormData({
        fullName: '',
        email: '',
        contactReasons: { proposal: false, collaboration: false, advisory: false, others: false },
        message: '',
        company: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      setSubmitMessage(language === 'es' ? 'Hubo un error al enviar el mensaje.' : 'There was an error sending the message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-background py-14 md:py-18">
      <Container>
        <div
          className="relative z-10 mb-10 text-center lg:mb-12"
        >
          <h2 className={`${typography.sectionTitle} mb-4 text-foreground`}>
            {t('contact.title')}
          </h2>
          <p className={`${typography.sectionSubtitle} mx-auto max-w-2xl text-muted-foreground`}>
            {t('contact.subtitle')}
          </p>
        </div>

        <div
          className="relative z-10 mx-auto grid max-w-6xl items-start gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8"
        >
          {/* Left Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-32">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-7">

              <h3 className="mb-6 text-2xl font-bold text-foreground">
                {language === 'es' ? 'Contacto' : 'Contact'}
              </h3>

              <div className="relative z-10 space-y-6">
                <p className={`${typography.body} text-muted-foreground`}>
                  {language === 'es'
                    ? 'Aquí encontrarás una forma directa y clara de contactarme para nuevos proyectos, colaboraciones o asesorías.'
                    : 'Here you will find a direct and clear way to contact me for new projects, collaborations or advisory work.'}
                </p>

                <div>
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
                    {language === 'es' ? 'Trabajemos Juntos' : 'Let us work together'}
                  </h4>
                  <div className="space-y-3">
                    {directChannels.map((channel) => (
                      <a
                        key={channel.key}
                        href={channel.href}
                        target={channel.key === 'email' ? undefined : '_blank'}
                        rel={channel.key === 'email' ? undefined : 'noopener noreferrer'}
                        className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4"
                      >
                        <div className="rounded-xl bg-foreground/8 p-2.5 text-foreground">
                          <channel.Icon className="w-[26px] h-[26px]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-muted-foreground">{channel.title}</p>
                          <p className="truncate font-semibold text-foreground">{channel.value}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl border border-border bg-card p-6 md:p-7">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Honeypot */}
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={(event) => handleInputChange('company', event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="absolute left-[-9999px] opacity-0"
                aria-hidden="true"
              />

              {/* Offline banner */}
              {!isOnline && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-center">
                  <p className="text-amber-600 dark:text-amber-400 font-medium">
                    {language === 'es' ? 'Sin conexión a internet. Los mensajes no se podrán enviar.' : 'No internet connection. Messages cannot be sent.'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
                    {t('contact.form.fullName')}
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(event) => handleInputChange('fullName', event.target.value)}
                    placeholder={t('contact.form.fullNamePlaceholder')}
                    className={`w-full rounded-xl border bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-input'}`}
                  />
                  {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(event) => handleInputChange('email', event.target.value)}
                    placeholder={t('contact.form.emailPlaceholder')}
                    className={`w-full rounded-xl border bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-input'}`}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>

              {/* Reasons */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">{t('contact.form.reason')}</label>
                  <p className="text-sm text-muted-foreground">{t('contact.form.selectHint')}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {reasons.map(({ key, label, desc }) => {
                    const isActive = getReasonValue(formData.contactReasons, key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleReason(key)}
                        aria-pressed={isActive}
                        className={`rounded-2xl border p-4 text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-card ${isActive ? 'border-foreground bg-foreground/8 text-foreground' : 'border-border bg-background text-muted-foreground'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">{label}</p>
                            <p className="mt-1 text-sm leading-5 text-muted-foreground">{desc}</p>
                          </div>
                          <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current text-[10px]">
                            {isActive ? '•' : ''}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-foreground">
                  {t('contact.form.message')}
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(event) => handleInputChange('message', event.target.value)}
                  placeholder={t('contact.form.messagePlaceholder')}
                  className={`w-full resize-none rounded-xl border bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-input'}`}
                />
                {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !isOnline}
                className={`w-full rounded-xl py-3.5 font-bold ${isSubmitting || !isOnline ? 'cursor-not-allowed bg-muted text-muted-foreground' : 'bg-foreground text-background'}`}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  t('contact.form.sending')
                ) : t('contact.form.submit')}
              </button>

              {/* Status messages */}
              <div aria-live="polite" className="space-y-3">
                {submitMessage && (
                  <div className={`rounded-xl border p-4 ${submitStatus === 'success' ? 'border-green-500/20 bg-green-500/10' : 'border-red-500/20 bg-red-500/10'}`}>
                    <p className={`flex items-center justify-center gap-2 text-center font-medium ${submitStatus === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        {submitStatus === 'success' ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        )}
                      </svg>
                      <span>{submitMessage}</span>
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
