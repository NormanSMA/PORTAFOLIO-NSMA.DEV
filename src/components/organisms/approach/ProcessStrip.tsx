import { typography } from '../../../config/typography';
import { useLanguage } from '../../../hooks';
import { cn } from '../../../utils/helpers';

const stepIds = ['discovery', 'strategy', 'build', 'optimize'] as const;

interface ProcessStripProps {
  labelId: string;
}

export function ProcessStrip({ labelId }: ProcessStripProps) {
  const { t } = useLanguage();

  return (
    <ol role="list" aria-labelledby={labelId} data-reveal-group className="lg:grid lg:grid-cols-4">
      {stepIds.map((id, index) => (
        <li
          key={id}
          data-reveal
          className={cn(
            'grid grid-cols-[3rem_1fr] border-t border-line py-6',
            'lg:grid-cols-1 lg:content-start lg:gap-y-3 lg:px-6 lg:pb-0 lg:first:pl-0 lg:last:pr-0',
            index > 0 && 'lg:border-l',
          )}
        >
          <span aria-hidden="true" className={cn(typography.h3, 'tabular-nums text-primary-400')}>
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
  );
}
