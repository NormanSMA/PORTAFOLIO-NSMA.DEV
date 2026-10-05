/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { COLOR_TOKENS, TYPE_TOKENS } from './designTokens';

const tokensCss = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

function hexOf(token: string): string {
  const match = tokensCss.match(new RegExp(`--color-${token}:\\s*(\\d+)\\s+(\\d+)\\s+(\\d+);`));
  if (!match) throw new Error(`Token ${token} not found`);
  const [r, g, b] = match.slice(1).map(Number);
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

describe('tokens que muestra el hero', () => {
  it('cada código de color es el valor real de tokens.css', () => {
    for (const { token, hex } of COLOR_TOKENS) {
      expect(hex, token).toBe(hexOf(token));
    }
  });

  it('muestra cuatro colores y dos tipografías', () => {
    expect(COLOR_TOKENS.map((color) => color.token)).toEqual(['primary-500', 'secondary-500', 'surface', 'fg']);
    expect(TYPE_TOKENS.map((type) => type.name)).toEqual(['Sora', 'DM Sans']);
  });

  it('cada muestra de color usa la clase de su propio token', () => {
    for (const { token, swatch } of COLOR_TOKENS) {
      expect(swatch).toBe(`bg-${token}`);
    }
  });
});
