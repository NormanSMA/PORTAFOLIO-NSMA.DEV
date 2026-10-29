import { useRef } from 'react';
import { useLanguage, useMotion } from '../../hooks';
import { motion } from '../../config/motion';
import { typography } from '../../config/typography';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { cn } from '../../utils/helpers';
import { Container } from '../atoms';
import { AboutPhoto } from './about/AboutPhoto';

export function About() {
  const { t } = useLanguage();
  const scope = useRef<HTMLElement>(null);

  // Reduced motion returns before touching anything, so the content is never hidden.
  useMotion(scope, ({ noReducedMotion }) => {
    if (!noReducedMotion) return;

    const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', scope.current);
    gsap.set(items, { opacity: 0, y: motion.offset.reveal });
    ScrollTrigger.batch(items, {
      start: motion.scrollStart.reveal,
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: motion.duration.base,
          ease: motion.ease.out.gsap,
          stagger: motion.stagger.base,
          overwrite: true,
        }),
    });
  });

  return (
    <section id="about" ref={scope} aria-labelledby="about-heading" className="py-section">
      <Container>
        <h2 id="about-heading" data-reveal className={cn(typography.h2, 'text-center text-fg lg:text-left')}>
          {t('about.title')}
        </h2>

        <div className="mt-10 grid items-center gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-x-16">
          <div data-reveal className="mx-auto max-w-72 md:max-w-sm lg:col-span-5 lg:mx-0 lg:max-w-none">
            <AboutPhoto alt={t('about.photoAlt')} />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-7">
            <p data-reveal className={cn(typography.bodyLarge, 'max-w-prose text-fg-muted')}>
              {t('about.bio.study')}
            </p>
            <p data-reveal className={cn(typography.bodyLarge, 'max-w-prose text-fg-muted')}>
              {t('about.bio.work')}
            </p>
            <p data-reveal className={cn(typography.bodyLarge, 'max-w-prose text-fg-muted')}>
              {t('about.bio.goals')}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
