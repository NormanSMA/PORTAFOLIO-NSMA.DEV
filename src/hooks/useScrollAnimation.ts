import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useScrollAnimation(
  ref: RefObject<HTMLElement>,
  options: UseScrollAnimationOptions = {}
) {
  const [isVisible, setIsVisible] = useState(false);
  const { threshold = 0.1, rootMargin = '0px' } = options;

  useEffect(() => {
    if (typeof window === 'undefined' || !ref?.current) return;

    // If user prefers reduced motion, avoid using observer/animations and
    // show content immediately so it doesn't rely on motion cues.
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (element) observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      try {
        observer.disconnect();
      } catch {
        // ignore
      }
    };
  }, [ref, threshold, rootMargin]);

  return isVisible;
}
