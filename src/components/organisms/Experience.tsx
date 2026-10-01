import { useRef } from 'react';
import { useLanguage, useMotion } from '../../hooks';
import { Container } from '../atoms';
import { motion } from '../../config/motion';
import { typography } from '../../config/typography';
import { gsap } from '../../lib/gsap';
import { cn } from '../../utils/helpers';
import { experienceEntries } from './experience/entries';
import { SideBlocks } from './experience/SideBlocks';
import { TimelineEntry } from './experience/TimelineEntry';

const reveal = {
  opacity: 0,
  y: motion.offset.reveal,
  duration: motion.duration.base,
  ease: motion.ease.out.gsap,
  clearProps: 'opacity,transform',
};

export function Experience() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  // Each entry reveals when it enters the viewport; the delay staggers those that enter together.
  useMotion(sectionRef, ({ noReducedMotion }) => {
    const section = sectionRef.current;
    if (!noReducedMotion || !section) return;

    const entries = gsap.utils.toArray<HTMLElement>('[data-reveal="entry"]', section);
    entries.forEach((entry, index) => {
      gsap.from(entry, {
        ...reveal,
        delay: index * motion.stagger.loose,
        scrollTrigger: { trigger: entry, start: motion.scrollStart.reveal, once: true },
      });
    });

    const side = section.querySelector<HTMLElement>('[data-reveal="side"]');
    if (!side) return;
    gsap.from(gsap.utils.toArray<HTMLElement>('[data-reveal="block"]', side), {
      ...reveal,
      stagger: motion.stagger.loose,
      scrollTrigger: { trigger: side, start: motion.scrollStart.reveal, once: true },
    });
  });

  return (
    <section ref={sectionRef} id="experience" aria-labelledby="experience-heading" className="py-section">
      <Container>
        <h2 id="experience-heading" className={cn(typography.h2, 'text-fg')}>
          {t('experience.title')}
        </h2>
        <div className="mt-10 grid gap-12 lg:mt-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] xl:gap-16">
          <ol role="list" aria-label={t('experience.timelineLabel')} className="flex flex-col gap-6">
            {experienceEntries.map((entry) => (
              <TimelineEntry key={entry.id} entry={entry} />
            ))}
          </ol>
          <SideBlocks />
        </div>
      </Container>
    </section>
  );
}
