import Lenis from 'lenis';
import { motion } from '../config/motion';
import { gsap, ScrollTrigger } from './gsap';

// Inertial scrolling is for mouse and trackpad users who allow motion; touch keeps native scrolling.
const smoothScrollQuery = `${motion.media.noReducedMotion} and ${motion.media.finePointer}`;
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

let activeLenis: Lenis | null = null;

// matchMedia tears Lenis down and rebuilds it if the user changes either preference mid-session.
export function startSmoothScroll(): () => void {
  const mm = gsap.matchMedia();

  mm.add(smoothScrollQuery, () => {
    const lenis = new Lenis({ autoRaf: false });
    const advance = (seconds: number) => lenis.raf(seconds * 1000);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(advance);
    // Lag smoothing would stretch Lenis time after a long frame and desync ScrollTrigger.
    gsap.ticker.lagSmoothing(0);
    activeLenis = lenis;

    return () => {
      gsap.ticker.remove(advance);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      if (activeLenis === lenis) activeLenis = null;
    };
  });

  return () => mm.revert();
}

export function scrollToSection(id: string): void {
  const section = document.getElementById(id);
  if (!section) return;

  if (activeLenis) {
    activeLenis.scrollTo(section);
    return;
  }

  const prefersReducedMotion = window.matchMedia(reducedMotionQuery).matches;
  section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}
