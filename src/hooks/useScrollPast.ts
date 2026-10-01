import { useEffect, useState } from 'react';

// Browsers fire scroll at most once per frame and React skips equal state, so no throttle is needed.
export function useScrollPast(threshold: number): boolean {
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const update = () => setIsPast(window.scrollY > threshold);

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [threshold]);

  return isPast;
}
