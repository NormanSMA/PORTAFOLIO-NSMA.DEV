import { typography } from '../../../config/typography';
import { useLanguage } from '../../../hooks';
import { cn } from '../../../utils/helpers';

const stepIds = ['discovery', 'strategy', 'build', 'optimize'] as const;

// With motion allowed the numerals start muted and light up when the scroll reaches their step
// (data-lit, set in progressProcess). Without motion, or on desktop, they are always lit.
const numeralStyles = cn(
  typography.h3,
  'tabular-nums text-primary-400',
  'motion-safe:max-lg:text-fg-subtle motion-safe:max-lg:transition-colors motion-safe:max-lg:duration-base',
  'motion-safe:max-lg:group-data-[lit=true]:text-primary-400',
);

const railStyles = 'absolute inset-y-0 left-0 w-0.5 lg:hidden';

interface ProcessStripProps {
  labelId: string;
}

export function ProcessStrip({ labelId }: ProcessStripProps) {
  const { t } = useLanguage();

  return (
    <div data-process className="relative pl-6 lg:pl-0">
      <span aria-hidden="true" className={cn(railStyles, 'bg-line')} />
      <span
        aria-hidden="true"
        data-process-fill
        className={cn(railStyles, 'origin-top bg-primary-400 motion-reduce:hidden')}
      />
      <ol
        role="list"
        aria-labelledby={labelId}
        data-reveal-group="desktop"
        className="lg:grid lg:grid-cols-4"
      >
        {stepIds.map((id, index) => (
          <li
            key={id}
            data-reveal
            data-process-step
            className={cn(
              'group grid grid-cols-[3rem_1fr] py-5',
              'lg:grid-cols-1 lg:content-start lg:gap-y-3 lg:border-t lg:border-line lg:px-6 lg:pb-0 lg:pt-6 lg:first:pl-0 lg:last:pr-0',
              index > 0 && 'lg:border-l',
            )}
          >
            <span aria-hidden="true" className={numeralStyles}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-2">
              <h4 className={cn(typography.h5, 'text-fg')}>{t(`process.steps.${id}.title`)}</h4>
              <p className={cn(typography.bodySmall, 'text-fg-muted')}>
                {t(`process.steps.${id}.description`)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
