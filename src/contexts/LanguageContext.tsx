import { useState, useEffect, type ReactNode } from 'react';
import type { Language } from '../types';
import { LANGUAGE_CONFIG } from '../config/constants';
import { translations } from '../i18n/translations';
import { LanguageContext } from './languageCore';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      if (typeof window === 'undefined') return LANGUAGE_CONFIG.default;
      const savedLanguage = localStorage.getItem(LANGUAGE_CONFIG.storageKey) as Language | null;
      return savedLanguage || LANGUAGE_CONFIG.default;
    } catch {
      return LANGUAGE_CONFIG.default;
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_CONFIG.storageKey, language);
        document.documentElement.lang = language;
      }
    } catch {
      // ignore storage/document errors
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === 'es' ? 'en' : 'es'));
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
