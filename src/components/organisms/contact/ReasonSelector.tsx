import { typography } from '../../../config/typography';
import { useLanguage } from '../../../hooks/useLanguage';
import { cn } from '../../../utils/helpers';
import { REASON_KEYS, type ReasonKey } from './validation';

interface ReasonSelectorProps {
  value: Record<ReasonKey, boolean>;
  onToggle: (reason: ReasonKey) => void;
}

// Real checkboxes in a fieldset: the browser gives each one its role, state and keyboard handling.
// The box is drawn here because a native one does not guarantee 3:1 against the surface.
export function ReasonSelector({ value, onToggle }: ReasonSelectorProps) {
  const { t } = useLanguage();

  return (
    <fieldset aria-describedby="contact-reason-hint" className="min-w-0">
      <legend className={cn(typography.bodySmall, 'mb-1 p-0 font-medium text-fg')}>
        {t('contact.form.reason')}
      </legend>
      <p id="contact-reason-hint" className={cn(typography.bodySmall, 'text-fg-muted')}>
        {t('contact.form.selectHint')}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {REASON_KEYS.map((key) => (
          <label
            key={key}
            className="flex cursor-pointer items-start gap-3 rounded-control border border-line-control px-4 py-3 transition-colors duration-fast ease-out has-[:checked]:border-primary-400 pointer-fine:hover:bg-fg/5"
          >
            <span className="relative mt-0.5 inline-flex size-5 shrink-0">
              <input
                type="checkbox"
                name="reasons"
                value={key}
                checked={value[key]}
                onChange={() => onToggle(key)}
                className="peer m-0 size-5 shrink-0 !cursor-pointer appearance-none rounded border border-line-control bg-ink checked:border-primary-500 checked:bg-primary-500"
              />
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 m-auto hidden size-3.5 text-fg peer-checked:block"
              >
                <path d="M3.5 8.5l3 3 6-7" />
              </svg>
            </span>
            <span className="flex flex-col gap-1">
              <span className={cn(typography.body, 'font-medium text-fg')}>
                {t(`contact.form.reasons.${key}.title`)}
              </span>
              <span className={cn(typography.bodySmall, 'text-fg-muted')}>
                {t(`contact.form.reasons.${key}.desc`)}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
