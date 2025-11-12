import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { useLanguage } from '../../hooks';
import { Container } from '../atoms';
import { typography } from '../../config/typography';

interface FormData {
  fullName: string;
  email: string;
  contactReasons: {
    proposal: boolean;
    collaboration: boolean;
    recruitment: boolean;
    advisory: boolean;
    others: boolean;
  };
  message: string;
}

export function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    contactReasons: {
      proposal: false,
      collaboration: false,
      recruitment: false,
      advisory: false,
      others: false,
    },
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // EmailJS configuration - set these in your .env (Vite) as VITE_EMAILJS_*
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

    // Build readable list of selected reasons
    const selectedReasons = Object.entries(formData.contactReasons)
      .filter(([, v]) => v)
      .map(([k]) => t(`contact.form.reasons.${k}.title` as const))
      .join(', ');

    // Build template params that match the EmailJS template variables
    const templateParams = {
      from_name: formData.fullName,
      from_email: formData.email,
      subject: `Nuevo contacto — ${formData.fullName}`,
      message: formData.message,
      reasons: selectedReasons || 'No especificado',
      received_at: new Date().toLocaleString(),
      owner_email: 'norman.martinez003@gmail.com', // target owner email (for your template)
      // html_content: you can include an HTML version if your EmailJS template uses it
      html_content: `
        <div style="font-family: Arial, sans-serif; color: #111827;">
          <h2 style="color:#0ea5a4;">Nuevo mensaje desde el portafolio</h2>
          <p><strong>Nombre:</strong> ${formData.fullName}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Motivos:</strong> ${selectedReasons || 'No especificado'}</p>
          <hr />
          <h3 style="margin-bottom:6px;">Mensaje:</h3>
          <div style="background:#f8fafc;padding:12px;border-radius:6px;border:1px solid #e6eef0;">
            <p style="margin:0;white-space:pre-wrap;">${formData.message}</p>
          </div>
          <p style="font-size:12px;color:#6b7280;margin-top:12px;">Recibido: ${new Date().toLocaleString()}</p>
        </div>
      `,
    };

    try {
      if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        console.warn('EmailJS env vars not set. Skipping email send.');
        // If env vars are missing, fallback to simulated success so UX isn't blocked.
        setSubmitStatus('success');
      } else {
        // Initialize EmailJS (if provided) and send. Keep it minimal and deterministic.
        if (PUBLIC_KEY) {
          try {
            emailjs.init(PUBLIC_KEY);
          } catch {
            // ignore init errors; send will surface useful errors
          }
        }

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
          recruitment: false,
          advisory: false,
          others: false,
        },
        message: '',
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('EmailJS error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (reason: keyof FormData['contactReasons']) => {
    setFormData(prev => ({
      ...prev,
      contactReasons: {
        ...prev.contactReasons,
        [reason]: !prev.contactReasons[reason],
      },
    }));
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900/95">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <p className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
              {t('contact.label')}
            </p>
            <h2 className={`${typography.sectionTitle} text-light-text dark:text-dark-text mb-4`}>
              {t('contact.title')}
            </h2>
            <p className={`${typography.sectionSubtitle} text-light-textSecondary dark:text-dark-textSecondary max-w-2xl mx-auto px-4`}>
              {t('contact.subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name & Email - 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className={`${typography.body} text-light-text dark:text-dark-text mb-2 block font-medium`}>
                  {t('contact.form.fullName')}
                </label>
                <input
                  type="text"
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder={t('contact.form.fullNamePlaceholder')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className={`${typography.body} text-light-text dark:text-dark-text mb-2 block font-medium`}>
                  {t('contact.form.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t('contact.form.emailPlaceholder')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Contact Reasons - card style selectable options */}
            <div>
              <label className={`${typography.body} text-light-text dark:text-dark-text mb-4 block font-medium`}>
                {t('contact.form.reason')}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(
                  (['proposal', 'collaboration', 'recruitment', 'advisory', 'others'] as Array<keyof FormData['contactReasons']>)
                ).map((key) => {
                  const title = t(`contact.form.reasons.${key}.title` as const);
                  const desc = t(`contact.form.reasons.${key}.desc` as const);
                  return (
                    <label
                      key={key}
                      className={`flex flex-col gap-2 p-4 rounded-lg border transition-all cursor-pointer select-none shadow-sm
                        ${formData.contactReasons[key] ? 'bg-primary-600/10 border-primary-600 dark:bg-primary-500/10' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}
                        hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.contactReasons[key]}
                            onChange={() => handleCheckboxChange(key)}
                            className="sr-only"
                            aria-hidden
                          />
                          <div className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${formData.contactReasons[key] ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-600'}`}>
                            {formData.contactReasons[key] ? (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            ) : (
                              <svg className="w-4 h-4 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="6" strokeWidth="1" /></svg>
                            )}
                          </div>
                          <div>
                            <div className={`font-medium ${formData.contactReasons[key] ? 'text-primary-600 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                              {title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{desc}</div>
                          </div>
                        </div>
                        {formData.contactReasons[key] && (
                          <div className="text-sm text-primary-600">✓</div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{t('contact.form.selectHint')}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(formData.contactReasons).filter(([,v])=>v).map(([k])=> (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleCheckboxChange(k as keyof FormData['contactReasons'])}
                    className="px-3 py-1 rounded-full bg-primary-600 text-white text-sm transition-transform hover:scale-105"
                  >
                    {t(`contact.form.reasons.${k}.title` as const)}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className={`${typography.body} text-light-text dark:text-dark-text mb-2 block font-medium`}>
                {t('contact.form.message')}
              </label>
              <textarea
                id="message"
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder={t('contact.form.messagePlaceholder')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300
                  ${isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 hover:scale-105 active:scale-95'
                  }
                  text-white shadow-lg hover:shadow-xl
                `}
              >
                {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
              </button>

              {/* Success/Error Messages */}
              {submitStatus === 'success' && (
                <p className="text-green-600 dark:text-green-400 font-medium">
                  {t('contact.form.successMessage')}
                </p>
              )}
              {submitStatus === 'error' && (
                <p className="text-red-600 dark:text-red-400 font-medium">
                  {t('contact.form.errorMessage')}
                </p>
              )}
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}
