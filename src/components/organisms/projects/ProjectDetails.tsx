import { useLanguage } from '../../../hooks/useLanguage';
import { typography } from '../../../config/typography';
import { cn } from '../../../utils/helpers';
import { ExternalLinkIcon } from '../../atoms/icons';
import type { LocalizedProject } from '../../../types';
import { ProjectGallery } from './ProjectGallery';

interface ProjectDetailsProps {
  project: LocalizedProject;
  // The invisible copies that reserve the ficha height do not load the gallery images.
  measureOnly?: boolean;
}

interface ExternalLinkProps {
  href: string;
  label: string;
  newTabLabel: string;
  emphasis: 'primary' | 'secondary';
}

const linkBase = cn(
  typography.bodySmall,
  'inline-flex min-h-target items-center justify-center gap-2 rounded-control border px-5 font-medium',
  'motion-safe:transition-colors motion-safe:duration-fast motion-safe:ease-out',
);
const linkEmphasis = {
  primary: 'border-transparent bg-primary-600 text-fg pointer-fine:hover:bg-primary-700',
  secondary: 'border-line-control text-fg pointer-fine:hover:bg-fg/5',
} as const;

function Separator() {
  return (
    <span aria-hidden="true" className="text-fg-subtle">
      ·
    </span>
  );
}

function ExternalLink({ href, label, newTabLabel, emphasis }: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(linkBase, linkEmphasis[emphasis])}>
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

export function ProjectDetails({ project, measureOnly = false }: ProjectDetailsProps) {
  const { t } = useLanguage();
  const { links, technologies, highlights } = project;
  const newTabLabel = t('projects.ui.newTab');

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className={cn(typography.meta, 'flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-fg-muted')}>
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
      <p className={cn(typography.body, 'max-w-prose text-pretty text-fg-muted')}>{project.description}</p>
      {highlights.length > 0 && (
        // Equal columns that fill the row: three points in one row, four in two rows of two.
        <ul className={cn('grid w-full gap-3', highlights.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
          {highlights.map((highlight) => (
            <li
              key={highlight}
              className={cn(
                typography.bodySmall,
                'flex items-center justify-center rounded-control border border-line-strong px-4 py-3 text-center text-pretty text-fg',
              )}
            >
              {highlight}
            </li>
          ))}
        </ul>
      )}
      <ProjectGallery project={project} measureOnly={measureOnly} />
      <ul aria-label={t('projects.ui.technologies')} className="flex flex-wrap justify-center gap-2">
        {technologies.map((technology) => (
          <li
            key={technology}
            className={cn(typography.caption, 'rounded-control border border-line-strong px-2.5 py-0.5 text-fg-muted')}
          >
            {technology}
          </li>
        ))}
      </ul>
      {project.privateCode && (
        <p className={cn(typography.bodySmall, 'pt-2 text-fg-muted')}>{t('projects.ui.privateCode')}</p>
      )}
      {(links.live || links.repo) && (
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {links.live && (
            <ExternalLink
              href={links.live}
              label={t('projects.ui.demo')}
              newTabLabel={newTabLabel}
              emphasis="primary"
            />
          )}
          {links.repo && (
            // The filled button is the one the ring card opens: the demo, or the repo when there is none.
            <ExternalLink
              href={links.repo}
              label={t('projects.ui.code')}
              newTabLabel={newTabLabel}
              emphasis={links.live ? 'secondary' : 'primary'}
            />
          )}
        </div>
      )}
    </div>
  );
}
