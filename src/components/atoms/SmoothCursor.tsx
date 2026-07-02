import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const DESKTOP_POINTER_QUERY = '(any-hover: hover) and (any-pointer: fine)';
const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, label';

export function SmoothCursor() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

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
    const el = cursorRef.current;
    if (!isEnabled || !el) {
      return;
    }

    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0, scale: 1, force3D: true });
    const xTo = gsap.quickTo(el, 'x', { duration: 0.3, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.3, ease: 'power3.out' });

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return;
      }

      xTo(event.clientX);
      yTo(event.clientY);

      const target = event.target as HTMLElement | null;
      const nextInteractive = Boolean(target?.closest(INTERACTIVE_SELECTOR));
      setIsInteractive(nextInteractive);

      gsap.to(el, {
        scale: nextInteractive ? 1.25 : 1,
        opacity: 1,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    const handlePointerLeave = () => {
      setIsInteractive(false);
      gsap.to(el, { scale: 1, opacity: 0, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
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
      gsap.killTweensOf(el);
    };
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block opacity-0 will-change-transform"
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute h-10 w-10 rounded-full border border-primary-500/35 bg-primary-500/10 blur-[1px]" />
        <div className="h-2.5 w-2.5 rounded-full bg-primary-500 shadow-[0_0_18px_rgba(99,102,241,0.5)]" />
        {isInteractive && (
          <div className="absolute h-14 w-14 rounded-full border border-primary-400/50" />
        )}
      </div>
    </div>
  );
}
