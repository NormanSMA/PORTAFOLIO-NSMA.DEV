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
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold, rootMargin]);

  return isVisible;
}
