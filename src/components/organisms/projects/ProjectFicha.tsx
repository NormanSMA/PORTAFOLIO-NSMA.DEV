import { memo } from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import type { LocalizedProject } from '../../../types';
import { ProjectDetails } from './ProjectDetails';
import './projectFicha.css';

interface ProjectFichaProps {
  projects: LocalizedProject[];
  activeIndex: number;
}

// From md up every project renders invisibly in the same grid cell, so the cell is as tall as the
// tallest ficha and the page does not jump when the active project changes. On phones the tallest
// ficha is about twice the average, so the reserve is dropped and the height is free.
const HeightReserve = memo(function HeightReserve({ projects }: { projects: LocalizedProject[] }) {
  return projects.map((project) => (
    <div
      key={project.id}
      aria-hidden="true"
      inert
      className="pointer-events-none invisible col-start-1 row-start-1 max-md:hidden"
    >
      <ProjectDetails project={project} />
    </div>
  ));
});

// No box of its own: the ficha is the caption of the ring above it, so it sits straight on the section.
export function ProjectFicha({ projects, activeIndex }: ProjectFichaProps) {
  const { t } = useLanguage();
  const active = projects[activeIndex] ?? projects[0];

  return (
    <div
      role="region"
      aria-label={t('projects.ui.detailsTitle')}
      aria-live="polite"
      className="mx-auto w-full max-w-2xl"
    >
      <div className="grid">
        {/* The key restarts the entrance animation (projectFicha.css) on every project change. */}
        <div key={active.id} className="ficha-enter col-start-1 row-start-1">
          <ProjectDetails project={active} />
        </div>
        <HeightReserve projects={projects} />
      </div>
    </div>
  );
}
