import { useState, useEffect } from 'react';
import { throttle } from '../utils/helpers';

export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = throttle(() => {
      setScrollPosition(window.scrollY || window.pageYOffset);
    }, 100);

    window.addEventListener('scroll', handler, { passive: true });
    handler(); // set initial position

    return () => {
      window.removeEventListener('scroll', handler as EventListener);
    };
  }, []);

  return scrollPosition;
}
