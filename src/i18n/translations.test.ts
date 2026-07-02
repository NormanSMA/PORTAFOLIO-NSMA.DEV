import { describe, it, expect } from 'vitest';
import { translations } from './translations';

type Dict = { [key: string]: string | Dict };

function collectKeys(obj: Dict, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [path] : collectKeys(value, path);
  });
}

describe('translations', () => {
  it('ES y EN tienen exactamente las mismas claves', () => {
    const esKeys = collectKeys(translations.es as unknown as Dict).sort();
    const enKeys = collectKeys(translations.en as unknown as Dict).sort();
    expect(esKeys).toEqual(enKeys);
  });

  it('ninguna traducción está vacía', () => {
    for (const lang of ['es', 'en'] as const) {
      const keys = collectKeys(translations[lang] as unknown as Dict);
      for (const key of keys) {
        const value = key
          .split('.')
          .reduce<unknown>((acc, k) => (acc as Dict)[k], translations[lang]);
        expect(String(value).trim(), `${lang}.${key} está vacía`).not.toBe('');
      }
    }
  });
});
