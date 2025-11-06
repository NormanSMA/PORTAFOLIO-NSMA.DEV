import { useLanguageFromContext } from '../contexts/languageCore';

// Re-export the hook under the stable `src/hooks` path.
export const useLanguage = useLanguageFromContext;
