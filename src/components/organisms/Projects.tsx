import { useMemo, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Container } from '../atoms/Container';
import { typography } from '../../config/typography';
import { getProjects } from '../../data/projects';
import { cn } from '../../utils/helpers';
import { MirrorHall, type MirrorHallItem } from './projects/MirrorHall';
import { ProjectCardFace } from './projects/ProjectCardFace';
import { ProjectFicha } from './projects/ProjectFicha';

export function Projects() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  // The provider recreates t on each of its renders, which today only happen on a language change.
  const projects = useMemo(() => getProjects(t), [t]);
  const items = useMemo<MirrorHallItem[]>(
    () =>
      projects.map((project) => ({
        id: project.id,
        label: project.statusLabel,
        title: project.title,
        // Same target as the filled button of the ficha: the demo, or the repo when there is none.
        href: project.links.live ?? project.links.repo,
        openLabel: t('projects.ui.newTab'),
        image: <ProjectCardFace id={project.id} altDesktop={project.altDesktop} />,
      })),
    [projects, t],
  );

  return (
    <section id="projects" aria-labelledby="projects-heading" className="relative overflow-x-clip bg-ink py-section">
      <Container>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2 id="projects-heading" className={cn(typography.h2, 'text-fg')}>
            {t('projects.title')}
          </h2>
          <p className={cn(typography.bodyLarge, 'text-balance text-fg-muted')}>{t('projects.subtitle')}</p>
        </div>
      </Container>

      <div className="mt-12 md:mt-16">
        <MirrorHall
          items={items}
          ariaLabel={t('projects.ui.ringLabel')}
          previousLabel={t('projects.ui.previous')}
          nextLabel={t('projects.ui.next')}
          getCardLabel={(position, total, title) => `${position} ${t('projects.ui.cardOf')} ${total}: ${title}`}
          onActiveChange={setActiveIndex}
        />
      </div>

      <Container className="mt-10 md:mt-12">
        <ProjectFicha projects={projects} activeIndex={activeIndex} />
      </Container>
    </section>
  );
}
