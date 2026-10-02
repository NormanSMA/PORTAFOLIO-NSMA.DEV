import { useRef } from 'react';
import { Container } from '../atoms/Container';
import { motion } from '../../config/motion';
import { typography } from '../../config/typography';
import { socialLinks } from '../../data/social';
import { useLanguage, useMotion } from '../../hooks';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { cn } from '../../utils/helpers';
import { ContactCard } from './contact/ContactCard';

// The section sets its own order; the footer lists the same links in another one.
const channels = ['Email', 'GitHub', 'LinkedIn'].flatMap((name) =>
  socialLinks.filter((link) => link.name === name),
);

// Cards start slightly smaller; desktop gets a shorter rise and less scale so it reads calmer.
const cardScale = { mobile: 0.96, desktop: 0.98 } as const;

export function Contact() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  // Reduced motion returns before hiding anything, so the content is visible from the first paint.
  useMotion(sectionRef, ({ noReducedMotion, desktop }) => {
    const section = sectionRef.current;
    if (!noReducedMotion || !section) return;

    const items = gsap.utils.toArray<HTMLElement>('[data-contact-reveal]', section);
    const cards = gsap.utils.toArray<HTMLElement>('[data-contact-card]', section);

    gsap.set(items, { opacity: 0, y: desktop ? motion.offset.reveal / 2 : motion.offset.reveal });
    gsap.set(cards, { scale: desktop ? cardScale.desktop : cardScale.mobile });

    // Batching triggers each card as it enters: stacked on mobile one by one, in a row on desktop together.
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
          stagger: motion.stagger.base,
          clearProps: 'transform,opacity',
          overwrite: true,
        }),
    });
  });

  return (
    <section ref={sectionRef} id="contact" aria-labelledby="contact-heading" className="bg-ink py-section">
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center lg:mx-0 lg:items-start lg:text-left">
          <h2 id="contact-heading" data-contact-reveal className={cn(typography.h1, 'text-fg')}>
            {t('contact.title')}
          </h2>
          <p data-contact-reveal className={cn(typography.bodyLarge, 'text-fg-muted')}>
            {t('contact.description')}
          </p>
          <p data-contact-reveal className={cn(typography.body, 'font-medium text-fg')}>
            {t('contact.availability')}
          </p>
        </div>

        <ul
          role="list"
          aria-label={t('contact.channels.label')}
          className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6"
        >
          {channels.map((link) => (
            <li key={link.name} data-contact-reveal data-contact-card className="flex">
              <ContactCard link={link} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
