import { useLanguage } from '../../../hooks';
import { scrollToSection } from '../../../lib/scroll';
import { typography } from '../../../config/typography';
import { cn } from '../../../utils/helpers';
import { Card } from '../../atoms';
import type { ExperienceEntry } from './entries';

interface TimelineEntryProps {
  entry: ExperienceEntry;
}

// --node-y is the vertical center of the date line: card padding plus half of its line box.
// Each li draws the line down to the next node; 1.5rem is the gap between entries.
const nodeStyles =
  '[--node-y:calc(var(--card-padding)_+_var(--text-lead)_*_0.8)] before:absolute before:left-1 before:top-[var(--node-y)] before:h-[calc(100%_+_1.5rem)] before:w-px before:bg-line last:before:hidden';

export function TimelineEntry({ entry }: TimelineEntryProps) {
  const { t } = useLanguage();
  const base = `experience.${entry.id}`;
  const organization = t(`${base}.organization`);

  return (
    <li
      data-reveal="entry"
      className={cn('relative pl-6 md:pl-8', nodeStyles)}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-[calc(var(--node-y)_-_4.5px)] size-[9px] rounded-pill border border-line-control bg-ink"
      />
      <Card variant="timeline">
        <Card.Header className="items-start md:self-start">
          <time dateTime={entry.year} className={cn(typography.bodyLarge, 'font-medium tabular-nums text-primary-400')}>
            {entry.year}
          </time>
        </Card.Header>
        <Card.Body>
          <h3 className={cn(typography.h4, 'text-fg')}>{t(`${base}.role`)}</h3>
          <p className={cn(typography.body, 'text-fg-muted')}>{organization}</p>
          <ul role="list" className={cn(typography.bodySmall, 'mt-2 list-disc space-y-2 pl-5 text-fg-muted marker:text-fg-subtle')}>
            {entry.bullets.map((bullet) => (
              <li key={bullet}>{t(`${base}.${bullet}`)}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => scrollToSection('projects')}
            aria-label={`${t('experience.viewProject')}: ${organization}`}
            className="mt-2 inline-flex min-h-target w-fit items-center rounded-control text-primary-400 underline underline-offset-4 pointer-fine:hover:text-primary-300"
          >
            {t('experience.viewProject')}
          </button>
        </Card.Body>
      </Card>
    </li>
  );
}
