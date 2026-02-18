import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { useLanguage } from '../../hooks';
import { Container } from '../atoms';
import { generateEmailTemplate } from '../../utils/email';

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

    // Generate HTML content
    const htmlContent = generateEmailTemplate({
      fullName: formData.fullName,
      email: formData.email,
      message: formData.message,
      reasons: selectedReasons || 'No especificado',
    });

    // Build template params
    const templateParams = {
      from_name: formData.fullName,
      from_email: formData.email,
      subject: `Nuevo contacto — ${formData.fullName}`,
      message: formData.message,
      reasons: selectedReasons || 'No especificado',
      received_at: new Date().toLocaleString(),
      owner_email: OWNER_EMAIL,
      html_content: htmlContent,
    };

    try {
      if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        console.warn('EmailJS env vars not set. Skipping email send.');
        setSubmitStatus('success');
      } else {
        if (PUBLIC_KEY) {
          try {
            emailjs.init(PUBLIC_KEY);
          } catch {
            // ignore init errors
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
    <section id="contact" className="py-16 md:py-24 bg-light-bg dark:bg-dark-bg">
      <Container>
        {/* Main Card Container */}
        <div className="max-w-6xl mx-auto shadow-2xl rounded-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
          
          {/* Left Panel - Dark/Light theme matching submit button */}
          <div className="bg-light-text dark:bg-dark-text w-full lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center text-light-bg dark:text-dark-bg relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-light-bg dark:bg-dark-bg opacity-10 pointer-events-none"></div>
            <div className="absolute bottom-[-40px] left-[-40px] w-64 h-64 rounded-full bg-light-bg dark:bg-dark-bg opacity-10 pointer-events-none"></div>
            
            <div className="relative z-10 space-y-6">
              <h3 className="text-lg font-medium tracking-wide uppercase opacity-90">
                {t('contact.label')}
              </h3>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                {t('contact.title')}
              </h2>
              <p className="text-lg md:text-xl opacity-90 leading-relaxed font-light">
                {t('contact.subtitle')}
              </p>
              
              {/* Chat Icon */}
              <div className="mt-8 opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="bg-light-card dark:bg-dark-card w-full lg:w-3/5 p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Name & Email - 2 columns on desktop, 1 on mobile */}
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
                    className={`w-full px-4 py-3 rounded-lg bg-light-bg dark:bg-dark-bg border text-light-text dark:text-dark-text placeholder-light-textSecondary dark:placeholder-dark-textSecondary focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors
                      ${errors.fullName ? 'border-red-500' : 'border-light-border dark:border-dark-border'}
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
                    className={`w-full px-4 py-3 rounded-lg bg-light-bg dark:bg-dark-bg border text-light-text dark:text-dark-text placeholder-light-textSecondary dark:placeholder-dark-textSecondary focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors
                      ${errors.email ? 'border-red-500' : 'border-light-border dark:border-dark-border'}
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

              {/* Contact Reasons - Chips */}
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
                      className={`px-5 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
                        ${formData.contactReasons[key]
                          ? 'bg-primary-500 text-white border border-primary-500 hover:bg-primary-600'
                          : 'bg-light-bg dark:bg-dark-bg text-light-textSecondary dark:text-dark-textSecondary border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border'
                        }
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-card
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
                  className={`w-full px-4 py-3 rounded-lg bg-light-bg dark:bg-dark-bg border text-light-text dark:text-dark-text placeholder-light-textSecondary dark:placeholder-dark-textSecondary focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors resize-none
                    ${errors.message ? 'border-red-500' : 'border-light-border dark:border-dark-border'}
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
                className={`w-full font-bold py-4 rounded-lg shadow-lg transition-all duration-200
                  ${isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-light-text dark:bg-dark-text text-light-bg dark:text-dark-bg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'
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

              {/* Success/Error Messages */}
              {submitStatus === 'success' && (
                <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                  <p className="text-center text-green-700 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t('contact.form.successMessage')}
                  </p>
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
                  <p className="text-center text-red-700 dark:text-red-400 font-medium flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
