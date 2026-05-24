import { useEffect, useState, type ReactNode } from 'react';
import type { Theme } from '../types';
import { THEME_CONFIG } from '../config/constants';
import { ThemeContext } from './themeCore';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      if (typeof window === 'undefined') return THEME_CONFIG.default;

      const root = document.documentElement;
      if (root.classList.contains('dark')) return 'dark';
      if (root.classList.contains('light')) return 'light';

      const savedTheme = localStorage.getItem(THEME_CONFIG.storageKey) as Theme | null;
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;

      if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
      return THEME_CONFIG.default;
    } catch {
      return THEME_CONFIG.default;
    }
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_CONFIG.storageKey, theme);
      }
    } catch {
      // ignore storage/document errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
