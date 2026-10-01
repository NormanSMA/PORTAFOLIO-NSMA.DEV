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
        caption: project.caption,
        image: (
          <ProjectCardFace
            id={project.id}
            altDesktop={project.altDesktop}
            altMobile={project.altMobile}
            hasMobileImage={project.hasMobileImage}
          />
        ),
      })),
    [projects],
  );

  return (
    <section id="projects" aria-labelledby="projects-heading" className="relative overflow-x-clip bg-ink py-section">
      <Container>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2 id="projects-heading" className={cn(typography.h2, 'text-fg')}>
            {t('projects.title')}
          </h2>
          <p className={cn(typography.bodyLarge, 'text-fg-muted')}>{t('projects.subtitle')}</p>
        </div>
      </Container>

      <div className="mt-12 md:mt-16">
        <MirrorHall
          items={items}
          ariaLabel={t('projects.ui.ringLabel')}
          previousLabel={t('projects.ui.previous')}
          nextLabel={t('projects.ui.next')}
          onActiveChange={setActiveIndex}
        />
      </div>

      <Container className="mt-12 md:mt-16">
        <ProjectFicha projects={projects} activeIndex={activeIndex} />
      </Container>
    </section>
  );
}
