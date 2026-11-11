import { useState, useEffect, useRef, type ReactNode } from 'react';
import type { Language } from '../types';
import { translations } from '../i18n/translations';
import { languageFromPath, pathForLanguage } from '../i18n/route';
import { applyHead } from '../seo/head';
import { LanguageContext } from './languageCore';

interface LanguageProviderProps {
  children: ReactNode;
  // The prerender passes the language of the page it writes. Without it the URL decides.
  initialLanguage?: Language;
}

const languageFromLocation = (): Language =>
  typeof window === 'undefined' ? 'es' : languageFromPath(window.location.pathname);

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => initialLanguage ?? languageFromLocation());
  const isFirstRender = useRef(true);

  // The prerendered head already matches the first language; later switches rewrite it.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      document.documentElement.lang = language;
      return;
    }
    applyHead(language);
  }, [language]);

  useEffect(() => {
    const syncWithUrl = () => setLanguage(languageFromLocation());
    window.addEventListener('popstate', syncWithUrl);
    return () => window.removeEventListener('popstate', syncWithUrl);
  }, []);

  const toggleLanguage = () => {
    const next: Language = language === 'es' ? 'en' : 'es';
    const { search, hash } = window.location;
    window.history.pushState(null, '', `${pathForLanguage(next)}${search}${hash}`);
    setLanguage(next);
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
