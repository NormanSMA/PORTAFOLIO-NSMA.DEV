import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { useLanguage } from '../../hooks';
import { Container } from '../atoms';
// import { generateEmailTemplate } from '../../utils/email';
import { typography } from '../../config/typography';
import DecryptedText from '../atoms/DecryptedText';

interface FormData {
  fullName: string;
  email: string;
  contactReasons: {
    proposal: boolean;
    collaboration: boolean;
    advisory: boolean;
    others: boolean;
  };
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  message?: string;
}

// Fallback owner email if not in env
const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL || 'norman.martinez003@gmail.com';

export function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    contactReasons: {
      proposal: false,
      collaboration: false,
      advisory: false,
      others: false,
    },
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Custom validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('contact.form.errors.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.form.errors.emailInvalid');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.errors.messageRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // EmailJS configuration
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

    // Build readable list of selected reasons
    const reasonLabels: Record<string, string> = {
      proposal: t('contact.form.reasons.proposal.title'),
      collaboration: t('contact.form.reasons.collaboration.title'),
      advisory: t('contact.form.reasons.advisory.title'),
      others: t('contact.form.reasons.others.title'),
    };

    const selectedReasons = Object.entries(formData.contactReasons)
      .filter(([, v]) => v)
      .map(([k]) => {
        const label = reasonLabels[k] || k;
        return `<span style="display: inline-block; background-color: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.35); padding: 6px 12px; margin-right: 8px; margin-bottom: 8px; font-family: 'DM Sans', sans-serif; font-weight: bold; font-size: 13px; color: #93C5FD;">${label}</span>`;
      })
      .join(' ');

    // Generate HTML content - REMOVED because template uses its own HTML
    // const htmlContent = generateEmailTemplate({...});

    // Generate HTML content - REMOVED because template uses its own HTML
    // const htmlContent = generateEmailTemplate({...});

    // Helper to get metadata with fallback
    const getMetadata = async () => {
      try {
        // Try primary service
        const response = await fetch('https://ipapi.co/json');
        if (!response.ok) throw new Error('Primary IP service failed');
        const data = await response.json();
        return {
          ip: data.ip || 'Unknown IP',
          location: `${data.city}, ${data.region}, ${data.country_name}`,
          device: navigator.userAgent || 'Unknown Device'
        };
      } catch {
        try {
          // Fallback service (db-ip.com free tier)
          const response = await fetch('https://api.db-ip.com/v2/free/self');
          const data = await response.json();
          return {
            ip: data.ipAddress || 'Unknown IP',
            location: `${data.city}, ${data.countryName}`,
            device: navigator.userAgent || 'Unknown Device'
          };
        } catch {
          return {
            ip: 'Not available',
            location: 'Not available',
            device: navigator.userAgent || 'Unknown Device'
          };
        }
      }
    };

    // Fetch metadata
    const metadata = await getMetadata();

    // Build template params matching the User's EmailJS Template
    const templateParams = {
      from_name: formData.fullName,
      from_email: formData.email,
      message: formData.message,
      reasons: selectedReasons || 'No especificado',
      received_at: new Date().toLocaleString(),
      owner_email: OWNER_EMAIL,
      // Metadata params
      ip: metadata.ip,
      location: metadata.location,
      device: metadata.device,
    };

    try {
      if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        console.warn('EmailJS env vars not set. Skipping email send.');
        setSubmitStatus('success');
      } else {
        if (PUBLIC_KEY) {
          try {
            emailjs.init(PUBLIC_KEY);
          } catch (e) {
            console.error('EmailJS init error:', e);
          }
        }

        console.log('Sending email with:', { SERVICE_ID, TEMPLATE_ID, params: templateParams });

        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
        setSubmitStatus('success');
      }


      // Reset form
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
      });
      setErrors({});

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('EmailJS error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReason = (reason: keyof FormData['contactReasons']) => {
    setFormData(prev => ({
      ...prev,
      contactReasons: {
        ...prev.contactReasons,
        [reason]: !prev.contactReasons[reason],
      },
    }));
  };

  const reasons: Array<{ key: keyof FormData['contactReasons']; label: string }> = [
    { key: 'proposal', label: t('contact.form.reasons.proposal.title') },
    { key: 'collaboration', label: t('contact.form.reasons.collaboration.title') },
    { key: 'advisory', label: t('contact.form.reasons.advisory.title') },
    { key: 'others', label: t('contact.form.reasons.others.title') },
  ];

  const reasonDescriptions: Record<keyof FormData['contactReasons'], string> = {
    proposal: t('contact.form.reasons.proposal.desc'),
    collaboration: t('contact.form.reasons.collaboration.desc'),
    advisory: t('contact.form.reasons.advisory.desc'),
    others: t('contact.form.reasons.others.desc'),
  };

  const contactCards = [
    {
      title: 'Email',
      value: 'norman.martinez003@gmail.com',
      href: 'mailto:norman.martinez003@gmail.com',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'LinkedIn',
      value: '@norman-martinez',
      href: 'https://linkedin.com/in/norman-martinez',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      title: 'GitHub',
      value: '@NormanSMA',
      href: 'https://github.com/NormanSMA',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      ),
    },
  ];

  // Clear error when user starts typing
  const handleInputChange = (field: keyof FormErrors, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <section id="contact" aria-labelledby="contact-heading" className="py-16 md:py-24 lg:py-28 bg-light-bg dark:bg-dark-bg relative overflow-hidden">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-10 lg:mb-12">
          <h2 id="contact-heading" className={`${typography.h2} text-light-text dark:text-dark-text mb-4`}>
            <DecryptedText tag="span" text={t('contact.title')} parentClassName="inline-block" animateOn="view" startDelay={0} speed={40} maxIterations={12} />
          </h2>
          <p className={`${typography.sectionSubtitle} text-light-textSecondary dark:text-dark-textSecondary max-w-2xl mx-auto`}>
            <DecryptedText tag="span" text={t('contact.subtitle')} parentClassName="inline-block" animateOn="view" startDelay={350} speed={60} maxIterations={18} />
          </p>
        </div>

        <div className="grid gap-6 xl:gap-8 items-start max-w-6xl mx-auto lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.1fr)]">

          {/* Left Panel: Info & Social */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-light-border/80 bg-light-card p-5 shadow-lg dark:border-dark-border/80 dark:bg-dark-card sm:p-6">
              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
                {t('nav.contact')}
              </h3>

              <p className={`${typography.body} text-light-textSecondary dark:text-dark-textSecondary mb-4`}>
                {t('contact.description')}
              </p>

              <div className="space-y-3 relative z-10">
                {contactCards.map((card) => (
                  <a
                    key={card.title}
                    href={card.href}
                    target={card.href.startsWith('http') ? '_blank' : undefined}
                    rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={`${t('contact.label')} - ${card.title}: ${card.value}`}
                    className="flex items-center gap-4 rounded-2xl border border-light-border/80 bg-light-bg p-3 shadow-sm transition-all hover:border-primary-500/60 dark:border-dark-border/80 dark:bg-dark-bg dark:hover:border-primary-500/60"
                  >
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
                      {card.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">{card.title}</p>
                      <p className="truncate text-base font-semibold text-light-text dark:text-dark-text">{card.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="rounded-2xl border border-light-border/80 bg-light-card p-5 shadow-lg dark:border-dark-border/80 dark:bg-dark-card sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-light-text dark:text-dark-text"
                  >
                    {t('contact.form.fullName')}
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder={t('contact.form.fullNamePlaceholder')}
                    className={`w-full px-4 py-3 rounded-xl bg-light-bg dark:bg-dark-bg border text-light-text dark:text-dark-text placeholder-light-textSecondary dark:placeholder-dark-textSecondary focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all
                      ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-light-border dark:border-dark-border'}
                    `}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-light-text dark:text-dark-text"
                  >
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={t('contact.form.emailPlaceholder')}
                    className={`w-full px-4 py-3 rounded-xl bg-light-bg dark:bg-dark-bg border text-light-text dark:text-dark-text placeholder-light-textSecondary dark:placeholder-dark-textSecondary focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all
                      ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-light-border dark:border-dark-border'}
                    `}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Reasons */}
                <div className="space-y-2">
                <label className="block text-sm font-medium text-light-text dark:text-dark-text">
                  {t('contact.form.reason')}
                </label>
                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  {t('contact.form.selectHint')}
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {reasons.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleReason(key)}
                      className={`flex items-start justify-between gap-4 rounded-2xl border p-3 text-left transition-all duration-200 cursor-pointer
                        ${formData.contactReasons[key]
                          ? 'bg-primary-500/10 text-light-text dark:text-dark-text border-primary-500/70 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]'
                          : 'bg-light-bg dark:bg-dark-bg text-light-textSecondary dark:text-dark-textSecondary border-light-border/80 dark:border-dark-border/80 hover:border-primary-500/50'
                        }
                        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 dark:focus:ring-offset-dark-card
                      `}
                    >
                      <div>
                        <span className="block text-base font-semibold text-light-text dark:text-dark-text">{label}</span>
                        <span className="mt-1 block text-sm leading-5 text-light-textSecondary dark:text-dark-textSecondary">
                          {reasonDescriptions[key]}
                        </span>
                      </div>
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          formData.contactReasons[key]
                            ? 'border-primary-500 bg-primary-500/15 text-primary-500 shadow-[0_0_0_1px_rgba(99,102,241,0.18)]'
                            : 'border-light-textSecondary/45 bg-light-textSecondary/10 text-light-textSecondary/60 dark:border-dark-textSecondary/45 dark:bg-dark-textSecondary/10 dark:text-dark-textSecondary/60'
                        }`}
                        aria-hidden
                      >
                        <span className={`h-2.5 w-2.5 rounded-full bg-current ${formData.contactReasons[key] ? 'opacity-100' : 'opacity-0'}`} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-light-text dark:text-dark-text"
                >
                  {t('contact.form.message')}
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder={t('contact.form.messagePlaceholder')}
                  className={`w-full px-4 py-3 rounded-xl bg-light-bg dark:bg-dark-bg border text-light-text dark:text-dark-text placeholder-light-textSecondary dark:placeholder-dark-textSecondary focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none
                    ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-light-border dark:border-dark-border'}
                  `}
                />
                {errors.message && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-bold py-3.5 rounded-2xl shadow-lg shadow-primary-500/20 transition-all duration-200
                  ${isSubmitting
                    ? 'bg-light-border dark:bg-dark-border text-light-textSecondary/50 dark:text-dark-textSecondary/50 cursor-not-allowed shadow-none'
                    : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-500/30 hover:scale-[1.01] active:scale-[0.99]'
                  }
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('contact.form.sending')}
                  </span>
                ) : t('contact.form.submit')}
              </button>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                  <p className="text-center text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t('contact.form.successMessage')}
                  </p>
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <p className="text-center text-red-600 dark:text-red-400 font-medium flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {t('contact.form.errorMessage')}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
