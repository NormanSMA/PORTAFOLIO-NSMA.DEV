import { useRef } from 'react';
import { motion } from '../../config/motion';
import { typography } from '../../config/typography';
import { useLanguage, useMotion } from '../../hooks';
import { gsap } from '../../lib/gsap';
import { cn } from '../../utils/helpers';
import { Container } from '../atoms/Container';
import { ProcessStrip } from './approach/ProcessStrip';
import { ServiceList } from './approach/ServiceList';

const blockLabel = cn(typography.eyebrow, 'mb-4 text-fg-muted');

export function Approach() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  // Each group reveals its own items once; with reduced motion nothing is hidden, so nothing runs.
  useMotion(sectionRef, ({ noReducedMotion }) => {
    const section = sectionRef.current;
    if (!noReducedMotion || !section) return;

    gsap.utils.toArray<HTMLElement>('[data-reveal-group]', section).forEach((group) => {
      gsap.from(group.querySelectorAll('[data-reveal]'), {
        y: motion.offset.reveal,
        opacity: 0,
        duration: motion.duration.base,
        ease: motion.ease.out.gsap,
        stagger: motion.stagger.base,
        scrollTrigger: { trigger: group, start: motion.scrollStart.reveal, once: true },
      });
    });
  });

  return (
    <section id="approach" ref={sectionRef} aria-labelledby="approach-heading" className="py-section">
      <Container>
        <div data-reveal-group className="max-w-2xl">
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
