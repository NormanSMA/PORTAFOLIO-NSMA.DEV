import { typography } from '../../../config/typography';
import { useLanguage } from '../../../hooks/useLanguage';
import { cn } from '../../../utils/helpers';
import type { SubmitStatus } from './useContactForm';

interface FormStatusProps {
  status: SubmitStatus;
}

const messageStyles = cn(typography.bodySmall, 'mt-6 rounded-control border px-4 py-3 font-medium');

// Both regions stay mounted and empty until a state arrives: screen readers announce
// text that changes inside a live region, not a region that appears already filled.
export function FormStatus({ status }: FormStatusProps) {
  const { t } = useLanguage();

  return (
    <>
      <div role="status">
        {status === 'throttled' && (
          <p className={cn(messageStyles, 'border-line-strong text-fg-muted')}>
            {t('contact.form.throttledMessage')}
          </p>
        )}
        {status === 'success' && (
          <p className={cn(messageStyles, 'border-success/40 text-success')}>
            {t('contact.form.successMessage')}
          </p>
        )}
      </div>
      <div role="alert">
        {status === 'error' && (
          <p className={cn(messageStyles, 'border-danger/40 text-danger')}>
            {t('contact.form.errorMessage')}
          </p>
        )}
      </div>
    </>
  );
}
