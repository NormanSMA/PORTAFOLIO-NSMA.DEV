import { typography } from '../../../config/typography';

// Real values of the site, from src/styles/tokens.css. canvasTokens.test.ts reads that file and fails if one drifts.
export interface ColorToken {
  token: string;
  hex: string;
  swatch: string;
}

export interface TypeToken {
  name: string;
  sample: string;
}

export const COLOR_TOKENS: readonly ColorToken[] = [
  { token: 'primary-500', hex: '#6366F1', swatch: 'bg-primary-500' },
  { token: 'secondary-500', hex: '#3B82F6', swatch: 'bg-secondary-500' },
  { token: 'surface', hex: '#1A1A24', swatch: 'bg-surface' },
  { token: 'fg', hex: '#FFFFFF', swatch: 'bg-fg' },
];

export const TYPE_TOKENS: readonly TypeToken[] = [
  { name: 'Sora', sample: typography.h5 },
  { name: 'DM Sans', sample: typography.bodyLarge },
];
