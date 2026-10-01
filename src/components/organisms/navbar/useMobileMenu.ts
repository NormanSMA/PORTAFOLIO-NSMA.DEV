import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from '../../../config/motion';

// Reserving the gutter keeps the fixed header from shifting when the scrollbar disappears.
function lockPageScroll(): () => void {
  const root = document.documentElement;
  const { overflow, scrollbarGutter } = root.style;
  root.style.scrollbarGutter = 'stable';
  root.style.overflow = 'hidden';

  return () => {
    root.style.overflow = overflow;
    root.style.scrollbarGutter = scrollbarGutter;
  };
}

function fadeIn(dialog: HTMLDialogElement): void {
  if (typeof dialog.animate !== 'function') return;
  if (!window.matchMedia(motion.media.noReducedMotion).matches) return;

  dialog.animate(
    [
      { opacity: 0, transform: 'translateY(-0.5rem)' },
      { opacity: 1, transform: 'none' },
    ],
    { duration: motion.duration.fast * 1000, easing: motion.ease.out.css },
  );
}

// The native modal dialog traps focus and makes the rest of the page inert.
export function useMobileMenu() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const unlockScrollRef = useRef<(() => void) | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((opener: HTMLElement) => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;

    openerRef.current = opener;
    dialog.showModal();
    unlockScrollRef.current = lockPageScroll();
    setIsOpen(true);
    fadeIn(dialog);
  }, []);

  // Unlocks synchronously so a link click can scroll right after closing the menu.
  const close = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;

    dialog.close();
    unlockScrollRef.current?.();
    unlockScrollRef.current = null;
    setIsOpen(false);
    openerRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    // Matches the lg breakpoint where the navbar swaps the menu button for the inline links.
    const desktop = window.matchMedia(motion.media.desktop);
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) close();
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, [close]);

  useEffect(() => () => unlockScrollRef.current?.(), []);

  return { dialogRef, isOpen, open, close };
}

export type MobileMenuState = ReturnType<typeof useMobileMenu>;
