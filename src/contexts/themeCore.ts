import { createContext, useContext } from 'react';
import type { ThemeContextType } from '../types';

// Keep the context and hook separate from the provider component file so
// fast-refresh only sees component exports in that file.
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeFromContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
