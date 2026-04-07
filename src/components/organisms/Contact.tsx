import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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

export function Contact() {
  const { t, language } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [formData, setFormData] = useState<ContactFormState>({
    fullName: '',
    email: '',
    contactReasons: {
      proposal: false,
      collaboration: false,
      advisory: false,
      others: false,
    },
    message: '',
    company: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const reasons: Array<{ key: ContactReasonKey; label: string; desc: string }> = [
    {
      key: 'proposal',
      label: t('contact.form.reasons.proposal.title'),
      desc: t('contact.form.reasons.proposal.desc'),
    },
    {
      key: 'collaboration',
      label: t('contact.form.reasons.collaboration.title'),
      desc: t('contact.form.reasons.collaboration.desc'),
    },
    {
      key: 'advisory',
      label: t('contact.form.reasons.advisory.title'),
      desc: t('contact.form.reasons.advisory.desc'),
    },
    {
      key: 'others',
      label: t('contact.form.reasons.others.title'),
      desc: t('contact.form.reasons.others.desc'),
    },
  ];

  const directChannels = [
    {
      key: 'email',
      title: 'Email',
      value: APP_CONFIG.email,
      href: `mailto:${APP_CONFIG.email}`,
      Icon: Mail,
    },
    {
      key: 'linkedin',
      title: 'LinkedIn',
      value: '@norman-martinez',
      href: 'https://www.linkedin.com/in/norman-martinez',
      Icon: Linkedin,
    },
    {
      key: 'github',
      title: 'GitHub',
      value: '@NormanSMA',
      href: 'https://github.com/NormanSMA',
      Icon: Github,
    },
  ];

  const handleInputChange = (
    field: keyof Pick<ContactFormState, 'fullName' | 'email' | 'message' | 'company'>,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field !== 'company' && errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleReason = (reason: ContactReasonKey) => {
    setFormData((prev) => ({
      ...prev,
      contactReasons: {
        ...prev.contactReasons,
        [reason]: !prev.contactReasons[reason],
      },
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        ok: boolean;
        message?: string;
        errors?: FormErrors;
      };

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
        contactReasons: {
          proposal: false,
          collaboration: false,
          advisory: false,
          others: false,
        },
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
    <section id="contact" className="relative overflow-hidden bg-light-bg py-14 md:py-18 dark:bg-dark-bg">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_32%)]"
        aria-hidden
      />
      <Container>
        <motion.div
          className="relative z-10 mb-10 text-center lg:mb-12"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 26 }}
          whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className={`${typography.sectionTitle} mb-4 text-light-text dark:text-dark-text`}>
            {t('contact.title')}
          </h2>
          <p className={`${typography.sectionSubtitle} mx-auto max-w-2xl text-light-textSecondary dark:text-dark-textSecondary`}>
            {t('contact.subtitle')}
          </p>
        </motion.div>

        <div className="relative z-10 mx-auto grid max-w-6xl items-start gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          <div className="space-y-8 lg:sticky lg:top-32">
            <motion.div
              className="relative overflow-hidden rounded-3xl border border-light-border/80 bg-light-card p-7 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] dark:border-dark-border dark:bg-dark-card hover-lift-soft"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -30, y: 20 }}
              whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
              whileHover={reduceMotion ? undefined : { y: -7 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />

              <h3 className="mb-6 text-2xl font-bold text-light-text dark:text-dark-text">
                {language === 'es' ? 'Contacto' : 'Contact'}
              </h3>

              <div className="relative z-10 space-y-6">
                <p className={`${typography.body} text-light-textSecondary dark:text-dark-textSecondary`}>
                  {language === 'es'
                    ? 'Aquí encontrarás una forma directa y clara de contactarme para nuevos proyectos, colaboraciones o asesorías.'
                    : 'Here you will find a direct and clear way to contact me for new projects, collaborations or advisory work.'}
                </p>

                <div>
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-light-text dark:text-dark-text">
                    {language === 'es' ? 'Trabajemos Juntos' : 'Let us work together'}
                  </h4>
                  <div className="space-y-3">
                    {directChannels.map((channel, index) => (
                      <motion.a
                        key={channel.key}
                        href={channel.href}
                        target={channel.key === 'email' ? undefined : '_blank'}
                        rel={channel.key === 'email' ? undefined : 'noopener noreferrer'}
                        className="group flex items-center gap-4 rounded-2xl border border-light-border bg-light-bg p-4 transition-all hover:border-primary-500/70 dark:border-dark-border dark:bg-dark-bg"
                        whileHover={reduceMotion ? undefined : { y: -4, x: 3 }}
                        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
                      >
                        <motion.div 
                          className="rounded-xl bg-primary-500/10 p-2.5 text-primary-600 transition-colors group-hover:text-primary-700 group-hover:bg-primary-500/20 dark:text-primary-400 dark:group-hover:text-primary-300"
                          animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
                          whileHover={reduceMotion ? undefined : { 
                            rotate: [0, -10, 10, -10, 10, 0],
                            scale: 1.15
                          }}
                          transition={reduceMotion ? undefined : {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.2
                          }}
                        >
                          <channel.Icon className="w-[26px] h-[26px]" />
                        </motion.div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">{channel.title}</p>
                          <p className="truncate font-semibold text-light-text dark:text-dark-text">{channel.value}</p>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="rounded-3xl border border-light-border/80 bg-light-card p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] dark:border-dark-border dark:bg-dark-card md:p-7"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 30, y: 20 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
            whileHover={reduceMotion ? undefined : { y: -5 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-light-text dark:text-dark-text">
                    {t('contact.form.fullName')}
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(event) => handleInputChange('fullName', event.target.value)}
                    placeholder={t('contact.form.fullNamePlaceholder')}
                    className={`w-full rounded-xl border bg-light-bg px-4 py-3 text-light-text outline-none transition-all placeholder:text-light-textSecondary focus:border-transparent focus:ring-2 dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-textSecondary ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-light-border dark:border-dark-border'}`}
                  />
                  {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-dark-text">
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(event) => handleInputChange('email', event.target.value)}
                    placeholder={t('contact.form.emailPlaceholder')}
                    className={`w-full rounded-xl border bg-light-bg px-4 py-3 text-light-text outline-none transition-all placeholder:text-light-textSecondary focus:border-transparent focus:ring-2 dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-textSecondary ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-light-border dark:border-dark-border'}`}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text">
                    {t('contact.form.reason')}
                  </label>
                  <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                    {t('contact.form.selectHint')}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {reasons.map(({ key, label, desc }) => {
                    const isActive = formData.contactReasons[key];

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleReason(key)}
                        aria-pressed={isActive}
                        className={`rounded-2xl border p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:focus:ring-offset-dark-card ${isActive ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'border-light-border bg-light-bg text-light-textSecondary hover:border-primary-500/50 dark:border-dark-border dark:bg-dark-bg dark:text-dark-textSecondary'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-light-text dark:text-dark-text">{label}</p>
                            <p className="mt-1 text-sm leading-5 text-light-textSecondary dark:text-dark-textSecondary">{desc}</p>
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

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-light-text dark:text-dark-text">
                  {t('contact.form.message')}
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(event) => handleInputChange('message', event.target.value)}
                  placeholder={t('contact.form.messagePlaceholder')}
                  className={`w-full resize-none rounded-xl border bg-light-bg px-4 py-3 text-light-text outline-none transition-all placeholder:text-light-textSecondary focus:border-transparent focus:ring-2 dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-textSecondary ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-light-border dark:border-dark-border'}`}
                />
                {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-xl py-3.5 font-bold shadow-lg shadow-primary-500/20 transition-all duration-200 ${isSubmitting ? 'cursor-not-allowed bg-gray-400 text-white' : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-500/30 hover:scale-[1.01] active:scale-[0.99]'}`}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('contact.form.sending')}
                  </span>
                ) : t('contact.form.submit')}
              </button>

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
          </motion.div>
        </div>
      </Container>
    </section>
  );
}