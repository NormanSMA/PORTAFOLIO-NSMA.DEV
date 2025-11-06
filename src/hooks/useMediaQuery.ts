import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia(query);
    // Handler can ignore the event and just read the current mediaQuery.matches
    const handleChange = () => {
      setMatches(mediaQuery.matches);
    };

    // Use modern addEventListener when available
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange as EventListener);
      return () => mediaQuery.removeEventListener('change', handleChange as EventListener);
    }

    // Fallback for older browsers
    mediaQuery.addListener(handleChange as (ev: MediaQueryListEvent) => void);
    return () => mediaQuery.removeListener(handleChange as (ev: MediaQueryListEvent) => void);
  }, [query]);

  return matches;
}

// Helper hooks para breakpoints comunes
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
