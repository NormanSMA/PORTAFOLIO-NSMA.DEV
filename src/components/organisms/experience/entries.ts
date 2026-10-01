export interface ExperienceEntry {
  id: 'iuris' | 'pantano' | 'systech';
  year: string;
  bullets: readonly ('bullet1' | 'bullet2' | 'bullet3')[];
}

// Most recent first; the order of this list is the order on screen.
export const experienceEntries: readonly ExperienceEntry[] = [
  { id: 'iuris', year: '2026', bullets: ['bullet1', 'bullet2', 'bullet3'] },
  { id: 'pantano', year: '2025', bullets: ['bullet1', 'bullet2', 'bullet3'] },
  { id: 'systech', year: '2025', bullets: ['bullet1', 'bullet2'] },
];
