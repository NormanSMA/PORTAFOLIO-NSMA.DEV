import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const DESKTOP_POINTER_QUERY = '(any-hover: hover) and (any-pointer: fine)';
const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, label';

export function SmoothCursor() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springX = useSpring(cursorX, { damping: 38, stiffness: 520, mass: 0.8 });
  const springY = useSpring(cursorY, { damping: 38, stiffness: 520, mass: 0.8 });
  const scale = useSpring(1, { damping: 30, stiffness: 450, mass: 0.7 });
  const opacity = useSpring(0, { damping: 30, stiffness: 300, mass: 0.7 });

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_POINTER_QUERY);

    const updateEnabled = () => {
      setIsEnabled(mediaQuery.matches);
      if (!mediaQuery.matches) {
        document.body.style.cursor = '';
      }
    };

    updateEnabled();
    mediaQuery.addEventListener('change', updateEnabled);

    return () => {
      mediaQuery.removeEventListener('change', updateEnabled);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return;
      }

      cursorX.set(event.clientX);
      cursorY.set(event.clientY);

      const target = event.target as HTMLElement | null;
      const nextInteractive = Boolean(target?.closest(INTERACTIVE_SELECTOR));
      setIsInteractive(nextInteractive);

      scale.set(nextInteractive ? 1.25 : 1);
      opacity.set(1);
    };

    const handlePointerLeave = () => {
      setIsInteractive(false);
      scale.set(1);
      opacity.set(0);
    };

    document.body.style.cursor = 'none';
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', handlePointerLeave);
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', handlePointerLeave);
      document.removeEventListener('mouseleave', handlePointerLeave);
      document.body.style.cursor = '';
    };
  }, [cursorX, cursorY, isEnabled, opacity, scale]);

  if (!isEnabled) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
      style={{
        x: springX,
        y: springY,
        scale,
        opacity,
        translateX: '-50%',
        translateY: '-50%',
        willChange: 'transform, opacity',
      }}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute h-10 w-10 rounded-full border border-primary-500/35 bg-primary-500/10 blur-[1px]" />
        <div className="h-2.5 w-2.5 rounded-full bg-primary-500 shadow-[0_0_18px_rgba(99,102,241,0.5)]" />
        {isInteractive && (
          <div className="absolute h-14 w-14 rounded-full border border-primary-400/50" />
        )}
      </div>
    </motion.div>
  );
}