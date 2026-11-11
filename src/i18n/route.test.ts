import { describe, it, expect } from 'vitest';
import { languageFromPath, pathForLanguage } from './route';

describe('route', () => {
  it('lee el idioma de la ruta', () => {
    expect(languageFromPath('/')).toBe('es');
    expect(languageFromPath('/en')).toBe('en');
    expect(languageFromPath('/en/')).toBe('en');
    expect(languageFromPath('/english')).toBe('es');
    expect(languageFromPath('/otra')).toBe('es');
  });

  it('da la ruta de cada idioma', () => {
    expect(pathForLanguage('es')).toBe('/');
    expect(pathForLanguage('en')).toBe('/en');
  });
});
