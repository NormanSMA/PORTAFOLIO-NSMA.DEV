import { describe, it, expect } from 'vitest';
import { formatMetricDate, formatMetricValue } from './formatMetric';

describe('formatMetricValue', () => {
  it('muestra un conteo sin unidad', () => {
    expect(formatMetricValue({ value: 669 }, 'es')).toBe('669');
  });

  it('usa coma decimal en espanol y punto en ingles para porcentajes', () => {
    expect(formatMetricValue({ value: 96.73, unit: 'percent' }, 'es')).toMatch(/^96,73\s?%$/);
    expect(formatMetricValue({ value: 96.73, unit: 'percent' }, 'en')).toBe('96.73%');
  });
});

describe('formatMetricDate', () => {
  it('conserva el dia ISO sin desfase de zona horaria', () => {
    expect(formatMetricDate('2026-09-27', 'en')).toBe('Sep 27, 2026');
    expect(formatMetricDate('2026-09-27', 'es')).toMatch(/^27 sep/);
  });
});
