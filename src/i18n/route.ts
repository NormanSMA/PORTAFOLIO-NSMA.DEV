import type { Language } from '../types';

// Each language has its own URL so crawlers index both: Spanish at the root, English under /en.
const LANGUAGE_PATHS: Record<Language, string> = { es: '/', en: '/en' };

export function languageFromPath(pathname: string): Language {
  return /^\/en(\/|$)/.test(pathname) ? 'en' : 'es';
}

export function pathForLanguage(language: Language): string {
  return LANGUAGE_PATHS[language];
}
