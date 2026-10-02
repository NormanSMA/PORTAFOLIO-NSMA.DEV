import { motion } from '../../../config/motion';
import { gsap, ScrollTrigger } from '../../../lib/gsap';

// The rail fills down to this line of the viewport; a step lights up as its top crosses it.
const readingLine = '65%';
const stepShift = 16;

// Returns the cleanup that clears the lit state, which lives in an attribute outside GSAP's revert.
export function progressProcess(process: HTMLElement): () => void {
  const list = process.querySelector<HTMLElement>('ol');
  const fill = process.querySelector('[data-process-fill]');
  const steps = gsap.utils.toArray<HTMLElement>('[data-process-step]', process);
  if (!list) return () => {};

  gsap.fromTo(
    fill,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      transformOrigin: 'top center',
      scrollTrigger: { trigger: list, start: `top ${readingLine}`, end: `bottom ${readingLine}`, scrub: true },
    },
  );

  steps.forEach((step) => {
    gsap.from(step, {
      opacity: 0,
      x: -stepShift,
      duration: motion.duration.base,
      ease: motion.ease.out.gsap,
      scrollTrigger: { trigger: step, start: motion.scrollStart.reveal, once: true },
    });

    ScrollTrigger.create({
      trigger: step,
      start: `top ${readingLine}`,
      onEnter: () => step.setAttribute('data-lit', 'true'),
      onLeaveBack: () => step.removeAttribute('data-lit'),
    });
  });

  return () => steps.forEach((step) => step.removeAttribute('data-lit'));
}
