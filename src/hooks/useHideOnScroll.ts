import { useEffect, useState } from 'react';

// Near the top the bar always shows; the tolerance ignores jitter such as the mobile address bar resizing.
const ALWAYS_VISIBLE_ABOVE = 96;
const DIRECTION_TOLERANCE = 8;

export function useHideOnScroll(enabled: boolean): boolean {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let anchorY = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY < ALWAYS_VISIBLE_ABOVE) {
        setIsHidden(false);
        anchorY = currentY;
        return;
      }

      const travelled = currentY - anchorY;
      if (Math.abs(travelled) < DIRECTION_TOLERANCE) return;
      setIsHidden(travelled > 0);
      anchorY = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled]);

  return enabled && isHidden;
}
