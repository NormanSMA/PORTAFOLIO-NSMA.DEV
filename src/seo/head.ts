import { APP_CONFIG } from '../config/constants';
import { pathForLanguage } from '../i18n/route';
import { translations } from '../i18n/translations';
import type { Language } from '../types';

// Single source of the per-language head: the build writes it into each prerendered page
// and the client updates the same tags when the visitor switches language.
export const SITE_URL = 'https://nsma.dev';
const LANGUAGES: Language[] = ['es', 'en'];
const OG_LOCALE: Record<Language, string> = { es: 'es_ES', en: 'en_US' };
const OG_IMAGE = { url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, type: 'image/png' };

export function urlFor(language: Language): string {
  const path = pathForLanguage(language);
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

export interface HeadData {
  language: Language;
  title: string;
  description: string;
  ogDescription: string;
  imageAlt: string;
  canonical: string;
  ogLocale: string;
  ogLocaleAlternate: string;
  alternates: { hreflang: string; href: string }[];
}

export function getHead(language: Language): HeadData {
  const seo = translations[language].seo;
  const other = language === 'es' ? 'en' : 'es';
  return {
    language,
    title: seo.title,
    description: seo.description,
    ogDescription: seo.ogDescription,
    imageAlt: seo.imageAlt,
    canonical: urlFor(language),
    ogLocale: OG_LOCALE[language],
    ogLocaleAlternate: OG_LOCALE[other],
    alternates: [
      ...LANGUAGES.map((lang) => ({ hreflang: lang, href: urlFor(lang) })),
      { hreflang: 'x-default', href: urlFor('es') },
    ],
  };
}

const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderJsonLd(language: Language): string {
  const head = getHead(language);
  const person = `${SITE_URL}/#person`;
  const website = `${SITE_URL}/#website`;
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': website,
        url: urlFor('es'),
        name: APP_CONFIG.name,
        inLanguage: LANGUAGES,
        publisher: { '@id': person },
      },
      {
        '@type': 'Person',
        '@id': person,
        name: APP_CONFIG.author,
        url: urlFor('es'),
        image: `${SITE_URL}/norman_sf-800w.webp`,
        jobTitle: translations[language].seo.jobTitle,
        sameAs: [APP_CONFIG.github, APP_CONFIG.linkedin],
      },
      {
        '@type': 'ProfilePage',
        '@id': `${head.canonical}#profile`,
        url: head.canonical,
        name: head.title,
        description: head.description,
        inLanguage: language,
        isPartOf: { '@id': website },
        mainEntity: { '@id': person },
      },
    ],
  };
  // JSON-LD is not executed, but a literal "</script>" inside it would still end the element.
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function renderHeadTags(language: Language): string {
  const head = getHead(language);
  const meta = (attr: 'name' | 'property', key: string, content: string | number) =>
    `<meta ${attr}="${key}" content="${escapeAttr(String(content))}" />`;

  return [
    `<title>${escapeAttr(head.title)}</title>`,
    meta('name', 'description', head.description),
    `<link rel="canonical" href="${head.canonical}" />`,
    ...head.alternates.map((alt) => `<link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`),
    meta('property', 'og:type', 'website'),
    meta('property', 'og:url', head.canonical),
    meta('property', 'og:site_name', APP_CONFIG.name),
    meta('property', 'og:locale', head.ogLocale),
    meta('property', 'og:locale:alternate', head.ogLocaleAlternate),
    meta('property', 'og:title', head.title),
    meta('property', 'og:description', head.ogDescription),
    meta('property', 'og:image', OG_IMAGE.url),
    meta('property', 'og:image:type', OG_IMAGE.type),
    meta('property', 'og:image:width', OG_IMAGE.width),
    meta('property', 'og:image:height', OG_IMAGE.height),
    meta('property', 'og:image:alt', head.imageAlt),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', head.title),
    meta('name', 'twitter:description', head.ogDescription),
    meta('name', 'twitter:image', OG_IMAGE.url),
    meta('name', 'twitter:image:alt', head.imageAlt),
    `<script type="application/ld+json">${renderJsonLd(language)}</script>`,
  ].join('\n    ');
}

function setContent(selector: string, value: string) {
  document.head.querySelector(selector)?.setAttribute('content', value);
}

// Only attributes and document.title: none is a Trusted Types sink. The JSON-LD stays as prerendered,
// since crawlers read each language from its own URL.
export function applyHead(language: Language) {
  const head = getHead(language);
  document.documentElement.lang = language;
  document.title = head.title;
  setContent('meta[name="description"]', head.description);
  document.head.querySelector('link[rel="canonical"]')?.setAttribute('href', head.canonical);
  setContent('meta[property="og:url"]', head.canonical);
  setContent('meta[property="og:locale"]', head.ogLocale);
  setContent('meta[property="og:locale:alternate"]', head.ogLocaleAlternate);
  setContent('meta[property="og:title"]', head.title);
  setContent('meta[property="og:description"]', head.ogDescription);
  setContent('meta[property="og:image:alt"]', head.imageAlt);
  setContent('meta[name="twitter:title"]', head.title);
  setContent('meta[name="twitter:description"]', head.ogDescription);
  setContent('meta[name="twitter:image:alt"]', head.imageAlt);
}
