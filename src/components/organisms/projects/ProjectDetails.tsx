import { useLanguage } from '../../../hooks/useLanguage';
import { typography } from '../../../config/typography';
import { cn } from '../../../utils/helpers';
import { ExternalLinkIcon } from '../../atoms/icons';
import type { LocalizedProject } from '../../../types';
import { formatMetricDate, formatMetricValue } from './formatMetric';

interface ProjectDetailsProps {
  project: LocalizedProject;
}

interface ExternalLinkProps {
  href: string;
  label: string;
  newTabLabel: string;
  className: string;
}

const linkBase = cn(
  typography.bodySmall,
  'inline-flex min-h-target items-center justify-center gap-2 rounded-control px-5 font-medium',
  'motion-safe:transition-colors motion-safe:duration-fast motion-safe:ease-out',
);
const demoLink = cn(linkBase, 'bg-primary-600 text-fg pointer-fine:hover:bg-primary-700');
const codeLink = cn(linkBase, 'border border-line-control text-fg pointer-fine:hover:bg-fg/5');

function Separator() {
  return (
    <span aria-hidden="true" className="text-fg-subtle">
      ·
    </span>
  );
}

function ExternalLink({ href, label, newTabLabel, className }: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      <span>
        {label}
        <span className="sr-only"> {newTabLabel}</span>
      </span>
      <span aria-hidden="true">
        <ExternalLinkIcon className="h-4 w-4" />
      </span>
    </a>
  );
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
  const { t, language } = useLanguage();
  const { links, metrics, technologies } = project;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
      <div className="flex flex-col items-start gap-4">
        <p className={cn(typography.meta, 'flex flex-wrap items-center gap-x-3 gap-y-1 text-fg-muted')}>
          {project.tier === 'featured' && (
            <>
              <span className="text-primary-400">{t('projects.ui.featured')}</span>
              <Separator />
            </>
          )}
          <span>{project.category}</span>
          <Separator />
          <span>{project.year}</span>
          <Separator />
          <span className={project.status === 'production' ? 'text-success' : undefined}>
            {project.statusLabel}
          </span>
        </p>
        <h3 className={cn(typography.h3, 'text-fg')}>{project.title}</h3>
        <p className={cn(typography.body, 'max-w-prose text-fg-muted')}>{project.description}</p>
        {(links.live || links.repo) && (
          <div className="flex flex-wrap gap-3 pt-2">
            {links.live && (
              <ExternalLink
                href={links.live}
                label={t('projects.ui.demo')}
                newTabLabel={t('projects.ui.newTab')}
                className={demoLink}
              />
            )}
            {links.repo && (
              <ExternalLink
                href={links.repo}
                label={t('projects.ui.code')}
                newTabLabel={t('projects.ui.newTab')}
                className={codeLink}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h4 className={cn(typography.eyebrow, 'text-fg-muted')}>{t('projects.ui.technologies')}</h4>
          <ul className="flex flex-wrap gap-2">
            {technologies.map((technology) => (
              <li
                key={technology}
                className={cn(typography.meta, 'rounded-control border border-line-strong px-3 py-1 text-fg-muted')}
              >
                {technology}
              </li>
            ))}
          </ul>
        </div>

        {metrics.length > 0 && (
          <div className="flex flex-col gap-3">
            <h4 className={cn(typography.eyebrow, 'text-fg-muted')}>{t('projects.ui.metrics')}</h4>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
              {metrics.map((metric) => (
                <div key={metric.labelKey} className="flex flex-col gap-1">
                  <dt className={cn(typography.caption, 'text-fg-muted')}>{metric.label}</dt>
                  <dd className={cn(typography.h4, 'tabular-nums text-fg')}>{formatMetricValue(metric, language)}</dd>
                  <dd className={cn(typography.caption, 'text-fg-subtle')}>
                    {t('projects.ui.asOf')} {formatMetricDate(metric.asOf, language)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
