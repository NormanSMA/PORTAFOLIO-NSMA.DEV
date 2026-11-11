import { StrictMode } from 'react';
import { prerender } from 'react-dom/static';
import App from './App';
import type { Language } from './types';

export { renderHeadTags } from './seo/head';

// Waits for every lazy section, so the prerendered page carries the whole site and not a Suspense fallback.
// React outlines large boundaries into <template> plus an inline script that moves them in place; the CSP blocks
// inline scripts, so an unlimited chunk size keeps every section inline.
export async function render(language: Language): Promise<string> {
  const { prelude } = await prerender(
    <StrictMode>
      <App initialLanguage={language} />
    </StrictMode>,
    { progressiveChunkSize: Number.MAX_SAFE_INTEGER },
  );
  return new Response(prelude).text();
}
