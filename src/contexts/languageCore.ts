import { createContext, useContext } from 'react';
import type { LanguageContextType } from '../types';

// Core context and hook kept in a separate module so provider file can
// export only components (prevents react-refresh lint errors).
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguageFromContext(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
