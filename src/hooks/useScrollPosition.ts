import { useState, useEffect } from 'react';
import { throttle } from '../utils/helpers';

export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setScrollPosition(window.scrollY);
    }, 100);

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Get initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollPosition;
}
