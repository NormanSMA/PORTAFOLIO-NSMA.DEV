import { useLanguage } from '../../../hooks';
import { typography } from '../../../config/typography';
import { cn } from '../../../utils/helpers';
import { Card } from '../../atoms';

const certifications = [
  { name: 'scrum', issuer: 'scrumIssuer' },
  { name: 'rpa', issuer: 'rpaIssuer' },
  { name: 'docker', issuer: null },
  { name: 'efset', issuer: null },
] as const;

const languages = [
  { name: 'spanish', level: 'spanishLevel' },
  { name: 'english', level: 'englishLevel' },
] as const;

const headingStyles = cn(typography.h5, 'text-fg');

// Education, certifications and languages: one Card each; the section reveals each card on its own.
export function SideBlocks() {
  const { t } = useLanguage();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card variant="info" data-reveal="card">
        <h3 className={headingStyles}>{t('experience.education.title')}</h3>
        <div className="flex flex-col gap-1">
          <p className={cn(typography.body, 'font-medium text-fg')}>{t('experience.education.institution')}</p>
          <p className={cn(typography.bodySmall, 'text-fg-muted')}>{t('experience.education.degree')}</p>
        </div>
        <div className={cn(typography.meta, 'flex flex-col gap-1 tabular-nums text-fg-muted')}>
          <p>{t('experience.education.period')}</p>
          <p>{t('experience.education.year')}</p>
        </div>
      </Card>

      <Card variant="info" data-reveal="card">
        <h3 className={headingStyles}>{t('experience.certifications.title')}</h3>
        <ul role="list" className="flex flex-col gap-4">
          {certifications.map(({ name, issuer }) => (
            <li key={name} className="flex flex-col">
              <span className={cn(typography.bodySmall, 'text-fg')}>{t(`experience.certifications.${name}`)}</span>
              {issuer && (
                <span className={cn(typography.caption, 'text-fg-muted')}>
                  {t(`experience.certifications.${issuer}`)}
                </span>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card variant="info" data-reveal="card">
        <h3 className={headingStyles}>{t('experience.languages.title')}</h3>
        <dl className={cn(typography.bodySmall, 'flex flex-col gap-2')}>
          {languages.map(({ name, level }) => (
            <div key={name} className="flex items-baseline justify-between gap-4">
              <dt className="text-fg">{t(`experience.languages.${name}`)}</dt>
              <dd className="text-fg-muted">{t(`experience.languages.${level}`)}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
