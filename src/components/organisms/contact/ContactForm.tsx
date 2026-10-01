import { Button } from '../../atoms/Button';
import { useLanguage } from '../../../hooks/useLanguage';
import { Field } from './Field';
import { FormStatus } from './FormStatus';
import { ReasonSelector } from './ReasonSelector';
import { useContactForm } from './useContactForm';
import type { ErrorCode } from './validation';

export function ContactForm() {
  const { t } = useLanguage();
  const form = useContactForm({
    proposal: t('contact.form.reasons.proposal.title'),
    collaboration: t('contact.form.reasons.collaboration.title'),
    advisory: t('contact.form.reasons.advisory.title'),
    others: t('contact.form.reasons.others.title'),
  });

  const errorText = (code?: ErrorCode) => (code ? t(`contact.form.errors.${code}`) : undefined);

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <div className="flex flex-col gap-6">
        {/* Honeypot: invisible para personas, irresistible para bots */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden opacity-0">
          <label htmlFor="company-website">{t('contact.form.honeypotLabel')}</label>
          <input
            type="text"
            id="company-website"
            name="company-website"
            tabIndex={-1}
            autoComplete="off"
            value={form.honeypot}
            onChange={(event) => form.setHoneypot(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Field
            id="fullName"
            label={t('contact.form.fullName')}
            value={form.fields.fullName}
            onChange={(value) => form.setField('fullName', value)}
            error={errorText(form.errors.fullName)}
            autoComplete="name"
            placeholder={t('contact.form.fullNamePlaceholder')}
          />
          <Field
            id="email"
            type="email"
            label={t('contact.form.email')}
            value={form.fields.email}
            onChange={(value) => form.setField('email', value)}
            error={errorText(form.errors.email)}
            autoComplete="email"
            placeholder={t('contact.form.emailPlaceholder')}
          />
        </div>

        <ReasonSelector value={form.fields.contactReasons} onToggle={form.toggleReason} />

        <Field
          id="message"
          multiline
          label={t('contact.form.message')}
          value={form.fields.message}
          onChange={(value) => form.setField('message', value)}
          error={errorText(form.errors.message)}
          placeholder={t('contact.form.messagePlaceholder')}
        />

        <Button type="submit" size="lg" disabled={form.status === 'sending'} className="w-full sm:w-auto sm:self-start">
          {form.status === 'sending' ? t('contact.form.sending') : t('contact.form.submit')}
        </Button>
      </div>

      <FormStatus status={form.status} />
    </form>
  );
}
