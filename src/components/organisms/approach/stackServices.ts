import { motion } from '../../../config/motion';
import { gsap } from '../../../lib/gsap';
import { stack, stackRanges, type StackMetrics } from './stack';

const toPx = (value: string) => Number.parseFloat(value) || 0;

// Runs only when ScrollTrigger refreshes, never per scroll event.
function measure(list: HTMLElement, items: HTMLElement[]): StackMetrics {
  return {
    heights: items.map((item) => item.offsetHeight),
    tops: items.map((item) => toPx(getComputedStyle(item).top)),
    gap: toPx(getComputedStyle(list).rowGap),
  };
}

// The sticky positions come from CSS; this only scrubs the card that is being covered:
// it shrinks and darkens while the next one slides over it. Transform and opacity only.
export function stackServices(list: HTMLElement) {
  const items = gsap.utils.toArray<HTMLElement>('[data-stack-item]', list);

  items.slice(0, -1).forEach((item, index) => {
    const range = (edge: 'start' | 'end') => () => stackRanges(measure(list, items))[index][edge];
    const dim = item.querySelector('[data-stack-dim]');

    gsap
      .timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: list,
          start: range('start'),
          end: range('end'),
          scrub: motion.scrub.tight,
          invalidateOnRefresh: true,
        },
      })
      .fromTo(item, { scale: 1 }, { scale: stack.scale, transformOrigin: 'top center' }, 0)
      .fromTo(dim, { opacity: 0 }, { opacity: stack.dim }, 0);
  });
}
