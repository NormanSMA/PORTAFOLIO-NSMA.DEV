import { useState, useEffect, useRef, useCallback } from 'react';

interface StackingHookOptions {
  cardCount: number;
  mobileStickyTop?: number;
  mobileIncrement?: number;
  mobileDistance?: number;
  desktopStickyTop?: number;
  desktopIncrement?: number;
  desktopDistance?: number;
}

export function useStackingCards({
  cardCount,
  mobileStickyTop = 80,
  mobileIncrement = 20,
  mobileDistance = 200,
  desktopStickyTop = 120,
  desktopIncrement = 35,
  desktopDistance = 250,
}: StackingHookOptions) {
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leftColumnRef = useRef<HTMLDivElement>(null);

  // Sync isMobile flag
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Main scroll handler
  const handleScroll = useCallback(() => {
    const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!motionOk) return;

    if (isMobile) {
      if (!containerRef.current) return;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const stickyTop = mobileStickyTop + (index * mobileIncrement);
        const nextCard = cardRefs.current[index + 1];
        let progress = 0;

        if (rect.top <= stickyTop + 1) {
          if (nextCard) {
            const nextRect = nextCard.getBoundingClientRect();
            progress = Math.max(0, Math.min(1, (stickyTop - nextRect.top + 80) / mobileDistance));
          } else {
            // Last card fades slightly based on overall container scroll progress
            const parentRect = containerRef.current!.getBoundingClientRect();
            const sectionProgress = Math.max(0, Math.min(1, -parentRect.top / (parentRect.height - window.innerHeight)));
            progress = Math.max(0, Math.min(0.4, sectionProgress * 0.8));
          }
        }

        card.style.setProperty('--progress', Math.min(progress, 0.7).toString());
      });
    } else {
      if (!containerRef.current || !leftColumnRef.current) return;

      const parentRect = containerRef.current.getBoundingClientRect();
      const sectionProgress = Math.max(0, Math.min(1, -parentRect.top / (parentRect.height - window.innerHeight)));
      leftColumnRef.current.style.setProperty('--section-progress', sectionProgress.toString());

      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const stickyTop = desktopStickyTop + (index * desktopIncrement);
        const nextCard = cardRefs.current[index + 1];
        let progress = 0;

        if (rect.top <= stickyTop + 1) {
          if (nextCard) {
            const nextRect = nextCard.getBoundingClientRect();
            progress = Math.max(0, Math.min(1, (stickyTop - nextRect.top + 100) / desktopDistance));
          } else {
            progress = Math.max(0, Math.min(0.4, sectionProgress * 0.8));
          }
        }

        card.style.setProperty('--progress', Math.min(progress, 0.7).toString());
      });
    }
  }, [isMobile, cardCount, mobileStickyTop, mobileIncrement, mobileDistance, desktopStickyTop, desktopIncrement, desktopDistance]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run initially to set starting values
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Adjust cardRefs size if cardCount changes
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, cardCount);
  }, [cardCount]);

  return {
    isMobile,
    containerRef,
    cardRefs,
    leftColumnRef,
  };
}
