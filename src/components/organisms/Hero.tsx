import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { motion } from '../../config/motion';
import { typography } from '../../config/typography';
import { useLanguage, useMediaQuery, useMotion } from '../../hooks';
import { gsap } from '../../lib/gsap';
import { scrollToSection } from '../../lib/scroll';
import { cn } from '../../utils/helpers';
import { Container } from '../atoms';
import SplitText from '../atoms/SplitText';
import { HeroBackground } from '../webgl/HeroBackground';

const NAME = 'Norman Martínez';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const TEXT_WIDTH_VARIABLE = { '--hero-text-width': '30rem' } as CSSProperties;

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

  // Everything but the name comes in after the first letters, so the type leads.
  useMotion(contentRef, ({ noReducedMotion }) => {
    if (!noReducedMotion) return;
    gsap.from('[data-hero-reveal]', {
      y: motion.offset.reveal,
      opacity: 0,
      delay: motion.duration.base,
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
    // The filament sits below the text until lg and beside it from lg up: the bottom padding is the room reserved for it.
    // HeroPoster reads --hero-text-width to start its stage where the text column ends.
    <section
      id="home"
      aria-labelledby="home-heading"
      style={TEXT_WIDTH_VARIABLE}
      className="relative isolate flex min-h-svh items-center overflow-hidden bg-ink pb-40 pt-24 md:pb-60 lg:pb-20 lg:pt-20"
    >
      <HeroBackground />
      <Container className="relative">
        <div ref={contentRef} className="max-w-[var(--hero-text-width)]">
          <HeroTitle />
          <p data-hero-reveal className={cn(typography.h4, 'mt-6 text-fg')}>
            {t('hero.role')}
          </p>
          <p data-hero-reveal className={cn(typography.bodyLarge, 'mt-6 text-fg-muted')}>
            {t('hero.summary')}
          </p>
          <p data-hero-reveal className={cn(typography.body, 'mt-4 font-medium text-fg')}>
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
      </Container>
    </section>
  );
}
