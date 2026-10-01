import { useRef } from 'react';
import { Card } from '../atoms/Card';
import { Container } from '../atoms/Container';
import { motion } from '../../config/motion';
import { typography } from '../../config/typography';
import { useLanguage, useMotion } from '../../hooks';
import { gsap } from '../../lib/gsap';
import { cn } from '../../utils/helpers';
import { ContactChannels } from './contact/ContactChannels';
import { ContactForm } from './contact/ContactForm';

export function Contact() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  // Each column rises once as the section enters. Reduced motion skips it and leaves both visible.
  useMotion(sectionRef, ({ noReducedMotion }) => {
    const section = sectionRef.current;
    if (!noReducedMotion || !section) return;

    gsap.from(section.querySelectorAll('[data-contact-reveal]'), {
      y: motion.offset.reveal,
      opacity: 0,
      duration: motion.duration.base,
      ease: motion.ease.out.gsap,
      stagger: motion.stagger.base,
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: section, start: motion.scrollStart.reveal, once: true },
    });
  });

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-heading"
      className="bg-ink py-section"
    >
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div data-contact-reveal className="flex flex-col gap-8 lg:sticky lg:top-28">
            <div className="flex flex-col gap-4">
              <h2 id="contact-heading" className={cn(typography.h1, 'text-fg')}>
                {t('contact.title')}
              </h2>
              <p className={cn(typography.bodyLarge, 'max-w-md text-fg-muted')}>
                {t('contact.description')}
              </p>
              <p className={cn(typography.body, 'font-medium text-fg')}>{t('contact.availability')}</p>
            </div>
            <ContactChannels />
          </div>

          <div data-contact-reveal>
            <Card>
              <ContactForm />
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}
