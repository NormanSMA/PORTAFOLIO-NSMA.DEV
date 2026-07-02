import { describe, it, expect } from 'vitest';
import { cn } from './helpers';

describe('cn', () => {
  it('combina clases simples', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('ignora valores falsy', () => {
    const hidden: boolean = false;
    expect(cn('a', hidden && 'b', undefined, null)).toBe('a');
  });

  it('resuelve conflictos de Tailwind quedándose con la última clase', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});
