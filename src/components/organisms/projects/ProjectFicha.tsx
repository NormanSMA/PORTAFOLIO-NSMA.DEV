import { memo, useRef } from 'react';
import { motion } from '../../../config/motion';
import { useLanguage } from '../../../hooks/useLanguage';
import { useMotion } from '../../../hooks/useMotion';
import { gsap } from '../../../lib/gsap';
import { Card } from '../../atoms/Card';
import type { LocalizedProject } from '../../../types';
import { ProjectDetails } from './ProjectDetails';

interface ProjectFichaProps {
  projects: LocalizedProject[];
  activeIndex: number;
}

// Every project renders invisibly in the same grid cell, so the cell is as tall as the tallest
// ficha and the page does not jump when the active project changes. On narrow screens the
// tallest ficha is about twice the average, so the reserve is dropped there: the ficha sits
// below the ring and the content under it is off screen while the ring moves.
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

export function ProjectFicha({ projects, activeIndex }: ProjectFichaProps) {
  const { t } = useLanguage();
  const active = projects[activeIndex] ?? projects[0];
  const contentRef = useRef<HTMLDivElement>(null);

  // Opacity is the only animated property; with reduced motion the content swaps instantly.
  useMotion(
    contentRef,
    ({ noReducedMotion }) => {
      if (!noReducedMotion || !contentRef.current) return;
      gsap.fromTo(
        contentRef.current,
        { opacity: 0 },
        { opacity: 1, duration: motion.duration.fast, ease: motion.ease.out.gsap },
      );
    },
    [active.id],
  );

  return (
    <Card
      variant="project"
      featured={active.tier === 'featured'}
      role="region"
      aria-label={t('projects.ui.detailsTitle')}
      aria-live="polite"
    >
      <div className="grid">
        <div ref={contentRef} className="col-start-1 row-start-1">
          <ProjectDetails project={active} />
        </div>
        <HeightReserve projects={projects} />
      </div>
    </Card>
  );
}
