import { describe, it, expect } from 'vitest';
import { getHead, renderHeadTags, renderJsonLd, applyHead } from './head';

// The tags with their values blanked: both languages must write the same set in the same order.
const tagKeys = (html: string) =>
  html
    .replace(/(content|href)="[^"]*"/g, '$1=""')
    .replace(/<title>[^<]*<\/title>/, '<title></title>')
    .replace(/(<script type="application\/ld\+json">)[^<]*(<\/script>)/, '$1$2');

describe('head', () => {
  it('da a cada idioma su canonical y los mismos hreflang', () => {
    const es = getHead('es');
    const en = getHead('en');
    expect(es.canonical).toBe('https://nsma.dev/');
    expect(en.canonical).toBe('https://nsma.dev/en');
    expect(es.alternates).toEqual(en.alternates);
    expect(es.alternates.map((alt) => alt.hreflang)).toEqual(['es', 'en', 'x-default']);
    expect(es.ogLocale).toBe(en.ogLocaleAlternate);
    expect(en.ogLocale).toBe(es.ogLocaleAlternate);
  });

  it('mantiene title y description en largos razonables', () => {
    for (const lang of ['es', 'en'] as const) {
      const head = getHead(lang);
      expect(head.title.length).toBeLessThanOrEqual(90);
      expect(head.description.length).toBeGreaterThanOrEqual(70);
      expect(head.description.length).toBeLessThanOrEqual(160);
    }
  });

  it('escribe las mismas etiquetas en ambos idiomas', () => {
    expect(tagKeys(renderHeadTags('es'))).toEqual(tagKeys(renderHeadTags('en')));
    expect(renderHeadTags('en')).toContain('<link rel="canonical" href="https://nsma.dev/en" />');
  });

  it('genera JSON-LD valido y sin cierre de script literal', () => {
    for (const lang of ['es', 'en'] as const) {
      const json = renderJsonLd(lang);
      expect(json).not.toContain('<');
      const data = JSON.parse(json);
      const types = data['@graph'].map((node: { '@type': string }) => node['@type']);
      expect(types).toEqual(['WebSite', 'Person', 'ProfilePage']);
    }
  });

  it('actualiza el head del documento al cambiar de idioma', () => {
    document.head.innerHTML = renderHeadTags('es');
    applyHead('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe(getHead('en').title);
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://nsma.dev/en');
    expect(document.head.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe('en_US');
  });
});
