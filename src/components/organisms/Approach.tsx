import { useRef } from 'react';
import { motion } from '../../config/motion';
import { typography } from '../../config/typography';
import { useLanguage, useMotion } from '../../hooks';
import { gsap } from '../../lib/gsap';
import { cn } from '../../utils/helpers';
import { Container } from '../atoms/Container';
import { ProcessStrip } from './approach/ProcessStrip';
import { progressProcess } from './approach/progressProcess';
import { ServiceList } from './approach/ServiceList';
import { stackServices } from './approach/stackServices';

const blockLabel = cn(typography.eyebrow, 'mb-4 text-fg-muted');

function revealGroup(group: HTMLElement) {
  gsap.from(group.querySelectorAll('[data-reveal]'), {
    y: motion.offset.reveal,
    opacity: 0,
    duration: motion.duration.base,
    ease: motion.ease.out.gsap,
    stagger: motion.stagger.base,
    scrollTrigger: { trigger: group, start: motion.scrollStart.reveal, once: true },
  });
}

export function Approach() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  // Below lg the two blocks move on their own (pile of cards, progress rail) and only the heading
  // reveals; from lg up each group reveals once. With reduced motion nothing is hidden, so nothing runs.
  // The language is a dependency because the copy changes the card heights the pile measures.
  useMotion(
    sectionRef,
    ({ noReducedMotion, mobile }) => {
      const section = sectionRef.current;
      if (!noReducedMotion || !section) return;

      gsap.utils.toArray<HTMLElement>('[data-reveal-group]', section).forEach((group) => {
        if (!mobile || group.dataset.revealGroup === 'all') revealGroup(group);
      });
      if (!mobile) return;

      const list = section.querySelector<HTMLElement>('[data-stack]');
      const process = section.querySelector<HTMLElement>('[data-process]');
      if (list) stackServices(list);
      return process ? progressProcess(process) : undefined;
    },
    [language],
  );

  return (
    <section id="approach" ref={sectionRef} aria-labelledby="approach-heading" className="py-section">
      <Container>
        <div data-reveal-group="all" className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <h2 id="approach-heading" data-reveal className={cn(typography.h2, 'text-fg')}>
            {t('services.heading')}
          </h2>
          <p data-reveal className={cn(typography.bodyLarge, 'mt-4 text-fg-muted')}>
            {t('services.subtitle')}
          </p>
        </div>

        <div className="mt-12">
          <h3 id="approach-services-label" className={blockLabel}>
            {t('services.title')}
          </h3>
          <ServiceList labelId="approach-services-label" />
        </div>

        <div className="mt-16">
          <h3 id="approach-process-label" className={blockLabel}>
            {t('process.title')}
          </h3>
          <ProcessStrip labelId="approach-process-label" />
        </div>
      </Container>
    </section>
  );
}
