import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { useLanguage } from '../../hooks';
import { Container } from '../atoms';
// import { generateEmailTemplate } from '../../utils/email';
import { typography } from '../../config/typography';
import { socialLinks } from '../../data/social';

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
  const { t, language } = useLanguage();
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
      newErrors.fullName = language === 'es' ? 'El nombre es requerido' : 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = language === 'es' ? 'El correo es requerido' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'es' ? 'Correo inválido' : 'Invalid email';
    }

    if (!formData.message.trim()) {
      newErrors.message = language === 'es' ? 'El mensaje es requerido' : 'Message is required';
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
      .map(([k]) => reasonLabels[k] || k)
      .join(', ');

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

  // Clear error when user starts typing
  const handleInputChange = (field: keyof FormErrors, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-light-bg dark:bg-dark-bg relative overflow-hidden">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className={`${typography.sectionTitle} text-light-text dark:text-dark-text mb-4`}>
            {t('contact.title')}
          </h2>
          <p className={`${typography.sectionSubtitle} text-light-textSecondary dark:text-dark-textSecondary max-w-2xl mx-auto`}>
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">

          {/* Left Panel: Info & Social */}
          <div className="space-y-8 lg:sticky lg:top-32">
            <div className="bg-light-card dark:bg-dark-card rounded-2xl p-8 border border-light-border dark:border-dark-border shadow-lg relative overflow-hidden">
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-6">
                {language === 'es' ? 'Contacto' : 'Contact'}
              </h3>

              <div className="space-y-6 relative z-10">
                <p className={`${typography.body} text-light-textSecondary dark:text-dark-textSecondary`}>
                  {language === 'es'
                    ? 'Aquí encontrarás mi información de contacto para colaborar en nuevos proyectos o discutir oportunidades laborales.'
                    : 'Here you will find my contact information to collaborate on new projects or discuss job opportunities.'
                  }
                </p>

                {/* Email Direct Link */}
                <a
                  href="mailto:norman.martinez003@gmail.com"
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border hover:border-primary-500 dark:hover:border-primary-500 transition-colors group"
                >
                  <div className="p-3 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="break-all">
                    <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary font-medium">Email</p>
                    <p className="text-light-text dark:text-dark-text font-semibold">norman.martinez003@gmail.com</p>
                  </div>
                </a>

                {/* Social Links Row */}
                <div>
                  <h4 className="text-sm font-semibold text-light-text dark:text-dark-text mb-4 uppercase tracking-wider">
                    {language === 'es' ? 'Encuéntrame en' : 'Find me on'}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text hover:text-primary-500 dark:hover:text-primary-400 border border-light-border dark:border-dark-border hover:border-primary-500 dark:hover:border-primary-500 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        aria-label={social.name}
                      >
                        <svg className="w-6 h-6" fill={social.stroke ? "none" : "currentColor"} stroke={social.stroke ? "currentColor" : "none"} viewBox="0 0 24 24">
                          {social.stroke ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={social.iconPath} />
                          ) : (
                            <path d={social.iconPath} />
                          )}
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="bg-light-card dark:bg-dark-card rounded-2xl p-8 border border-light-border dark:border-dark-border shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className={`w-full px-4 py-3 rounded-lg bg-light-bg dark:bg-dark-bg border text-light-text dark:text-dark-text placeholder-light-textSecondary dark:placeholder-dark-textSecondary focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all
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
                    className={`w-full px-4 py-3 rounded-lg bg-light-bg dark:bg-dark-bg border text-light-text dark:text-dark-text placeholder-light-textSecondary dark:placeholder-dark-textSecondary focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all
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
              <div className="space-y-3">
                <label className="block text-sm font-medium text-light-text dark:text-dark-text">
                  {t('contact.form.reason')}
                </label>
                <div className="flex flex-wrap gap-3">
                  {reasons.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleReason(key)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border
                        ${formData.contactReasons[key]
                          ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500'
                          : 'bg-light-bg dark:bg-dark-bg text-light-textSecondary dark:text-dark-textSecondary border-light-border dark:border-dark-border hover:border-primary-500/50'
                        }
                        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 dark:focus:ring-offset-dark-card
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
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
                  className={`w-full px-4 py-3 rounded-lg bg-light-bg dark:bg-dark-bg border text-light-text dark:text-dark-text placeholder-light-textSecondary dark:placeholder-dark-textSecondary focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none
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
                className={`w-full font-bold py-3.5 rounded-lg shadow-lg shadow-primary-500/20 transition-all duration-200
                  ${isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
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
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-center text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t('contact.form.successMessage')}
                  </p>
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
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
