import { useRef } from 'react';
import { useLanguage, useMotion } from '../../hooks';
import { Container } from '../atoms';
import { motion } from '../../config/motion';
import { typography } from '../../config/typography';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { cn } from '../../utils/helpers';
import { SideBlocks } from './experience/SideBlocks';
import { TechStack } from './stack/TechStack';

const CARD_SCALE_FROM = 0.96;

export function Experience() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  // Reduced motion returns before touching anything, so the content is never hidden.
  // Each card has its own trigger: on a phone the cards are far apart, and the batch staggers the ones that enter together.
  useMotion(sectionRef, ({ noReducedMotion }) => {
    const section = sectionRef.current;
    if (!noReducedMotion || !section) return;

    const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', section);
    gsap.set(items, {
      opacity: 0,
      y: motion.offset.reveal,
      scale: (_index: number, item: HTMLElement) => (item.dataset.reveal === 'card' ? CARD_SCALE_FROM : 1),
    });
    ScrollTrigger.batch(items, {
      start: motion.scrollStart.reveal,
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: motion.duration.base,
          ease: motion.ease.out.gsap,
          stagger: motion.stagger.loose,
          overwrite: true,
          clearProps: 'opacity,transform',
        }),
    });
  });

  return (
    <section ref={sectionRef} id="experience" aria-labelledby="experience-heading" className="py-section">
      <Container>
        <h2 id="experience-heading" data-reveal="heading" className={cn(typography.h2, 'text-fg')}>
          {t('experience.title')}
        </h2>
        <div className="mt-10 flex flex-col gap-6 lg:mt-12">
          <TechStack />
          <SideBlocks />
        </div>
      </Container>
    </section>
  );
}
