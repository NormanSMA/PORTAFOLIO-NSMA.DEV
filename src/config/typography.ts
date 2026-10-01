// Sizes are arbitrary length classes over the --text-* tokens, not custom fontSize keys,
// because tailwind-merge reads an unknown text-* class as a color and drops it in cn().

const display =
  'font-display font-extrabold text-balance text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[var(--tracking-display)]';
const h1 =
  'font-display font-extrabold text-balance text-[length:var(--text-h1)] leading-[var(--leading-heading)] tracking-[var(--tracking-heading)]';
const h2 =
  'font-display font-bold text-balance text-[length:var(--text-h2)] leading-[var(--leading-heading)] tracking-[var(--tracking-heading)]';
const h3 =
  'font-display font-semibold text-balance text-[length:var(--text-h3)] leading-[var(--leading-title)] tracking-[var(--tracking-title)]';
const h4 =
  'font-display font-semibold text-[length:var(--text-h4)] leading-[var(--leading-title)] tracking-[var(--tracking-title)]';
const h5 =
  'font-display font-semibold text-[length:var(--text-h5)] leading-[var(--leading-title)] tracking-[var(--tracking-title)]';
const bodyLarge = 'font-body text-[length:var(--text-lead)] leading-[var(--leading-body)]';
const body = 'font-body text-[length:var(--text-body)] leading-[var(--leading-body)]';
const bodySmall = 'font-body text-[length:var(--text-body-sm)] leading-[var(--leading-body)]';
const caption = 'font-body text-[length:var(--text-caption)] leading-[var(--leading-meta)]';
const eyebrow =
  'font-mono font-medium uppercase text-[length:var(--text-eyebrow)] leading-[var(--leading-meta)] tracking-[var(--tracking-eyebrow)]';
const meta = 'font-mono text-[length:var(--text-meta)] leading-[var(--leading-meta)]';
const numeral =
  'font-display font-extrabold tabular-nums text-[length:var(--text-numeral)] leading-[var(--leading-display)] tracking-[var(--tracking-display)]';

export const typography = {
  display,
  h1,
  h2,
  h3,
  h4,
  h5,
  bodyLarge,
  body,
  bodySmall,
  caption,
  eyebrow,
  meta,
  numeral,

  // Legacy aliases for components not yet rewritten; new code uses the keys above.
  sectionTitle: h1,
  sectionSubtitle: bodyLarge,
  cardTitle: h3,
  cardSubtitle: h4,
  secondary: bodySmall,
  small: caption,
  tag: eyebrow,
  statsNumber: numeral,
} as const;
