import { useCallback, useMemo, useSyncExternalStore } from 'react';

// The server and the first client render (hydration) both read serverDefault, so the prerendered HTML matches;
// React then re-renders with the real value.
export function useMediaQuery(query: string, serverDefault = false): boolean {
  const mediaQuery = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
    return window.matchMedia(query);
  }, [query]);

  const subscribe = useCallback((onChange: () => void) => {
    if (!mediaQuery) return () => {};
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onChange);
      return () => mediaQuery.removeEventListener('change', onChange);
    }

    mediaQuery.addListener(onChange);
    return () => mediaQuery.removeListener(onChange);
  }, [mediaQuery]);

  return useSyncExternalStore(subscribe, () => mediaQuery?.matches ?? serverDefault, () => serverDefault);
}
