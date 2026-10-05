import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { motion } from '../../config/motion';
import { typography } from '../../config/typography';
import { useLanguage, useMediaQuery, useMotion } from '../../hooks';
import { gsap } from '../../lib/gsap';
import { scrollToSection } from '../../lib/scroll';
import { cn } from '../../utils/helpers';
import { Container } from '../atoms';
import SplitText from '../atoms/SplitText';
import { DesignCanvas } from './hero/DesignCanvas';

const NAME = 'Norman Martínez';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// The letters start hidden inside SplitText's own effect; the heading stays invisible until that effect has run,
// so the plain text never flashes before the reveal. Child effects run before this one.
function HeroTitle() {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (reducedMotion) {
    return (
      <h1 id="home-heading" className={cn(typography.display, 'text-fg')}>
        {NAME}
      </h1>
    );
  }

  // SplitText turns every letter into its own span, so the label keeps screen readers on the whole name.
  return (
    <h1 id="home-heading" aria-label={NAME} className={cn(typography.display, 'text-fg', !ready && 'invisible')}>
      <span aria-hidden="true" className="block">
        <SplitText
          tag="span"
          text={NAME}
          splitType="words"
          delay={motion.stagger.tight * 1000}
          duration={motion.duration.slow}
          ease={motion.ease.expo.gsap}
          from={{ opacity: 0, y: motion.offset.hero }}
          to={{ opacity: 1, y: 0 }}
          textAlign="left"
          animateOn="mount"
        />
      </span>
    </h1>
  );
}

export function Hero() {
  const { t } = useLanguage();
  const contentRef = useRef<HTMLDivElement>(null);

  // The name leads and the availability line and the button follow two beats later. The role lines are the largest
  // block that is not split into letters, so they are the LCP element: they stay out of the reveal and paint with the page.
  useMotion(contentRef, ({ noReducedMotion }) => {
    if (!noReducedMotion) return;
    gsap.from('[data-hero-reveal]', {
      y: motion.offset.reveal,
      opacity: 0,
      delay: motion.stagger.base * 2,
      duration: motion.duration.base,
      ease: motion.ease.out.gsap,
      stagger: motion.stagger.base,
    });
  });

  const handleProjectsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection('projects');
  };

  return (
    // The text column is 30rem; from lg the design canvas takes the rest of the row, and below lg it sits under the text.
    <section
      id="home"
      aria-labelledby="home-heading"
      className="relative isolate flex min-h-svh items-center overflow-hidden bg-ink pb-16 pt-24 lg:py-20"
    >
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:gap-16">
          <div ref={contentRef} className="max-w-[30rem]">
            <HeroTitle />
            <p className="mt-6">
              <span className={cn(typography.h4, 'block text-fg')}>{t('hero.role')}</span>
              <span className={cn(typography.bodyLarge, 'mt-1 block text-fg-muted')}>{t('hero.focus')}</span>
            </p>
            <p data-hero-reveal className={cn(typography.body, 'mt-6 font-medium text-fg')}>
              {t('hero.availability')}
            </p>
            <a
              data-hero-reveal
              href="#projects"
              onClick={handleProjectsClick}
              className="mt-10 inline-flex min-h-target items-center justify-center rounded-control bg-fg px-8 font-body font-semibold text-ink motion-safe:transition-colors motion-safe:duration-fast motion-safe:ease-out pointer-fine:hover:bg-fg/85"
            >
              {t('hero.cta.projects')}
            </a>
          </div>
          <DesignCanvas />
        </div>
      </Container>
    </section>
  );
}
