import { useState, useEffect, useRef } from 'react';
import { throttle } from '../utils/helpers';

export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const savedHandler = useRef<() => void | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = throttle(() => {
      setScrollPosition(window.scrollY || window.pageYOffset);
    }, 100);

    savedHandler.current = handler;

    window.addEventListener('scroll', handler, { passive: true });
    // set initial position synchronously
    handler();

    return () => {
      if (savedHandler.current) {
        window.removeEventListener('scroll', savedHandler.current as EventListener);
      }
    };
  }, []);

  return scrollPosition;
}
