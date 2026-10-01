import type { Language, ProjectMetric } from '../../../types';

export function formatMetricValue({ value, unit }: Pick<ProjectMetric, 'value' | 'unit'>, language: Language): string {
  if (unit === 'percent') {
    return new Intl.NumberFormat(language, {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  }
  return new Intl.NumberFormat(language).format(value);
}

// UTC avoids a one-day shift: new Date('2026-09-27') is midnight UTC, which is the 26th in Managua.
export function formatMetricDate(isoDate: string, language: Language): string {
  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(isoDate));
}
