// Theme Types
export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Language Types
export type Language = 'es' | 'en';

export interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

// Project Types
export type ProjectId = 'ecopulse' | 'turno' | 'iuris' | 'claudehub' | 'systech' | 'pantano' | 'portfolio';

export type ProjectTier = 'featured' | 'secondary';

export type ProjectStatus = 'production' | 'paused' | 'delivered' | 'active';

export interface ProjectMetric {
  labelKey: string;
  value: number;
  // Only 'percent' needs a suffix; plain counts carry no unit.
  unit?: 'percent';
  // ISO date (YYYY-MM-DD) of the measurement.
  asOf: string;
}

// Language-independent data. Copy lives in src/i18n and is resolved by getProjects(t).
export interface Project {
  id: ProjectId;
  tier: ProjectTier;
  category: string;
  year: number;
  status: ProjectStatus;
  technologies: string[];
  links: { live?: string; repo?: string };
  metrics: ProjectMetric[];
  hasMobileImage: boolean;
}

export interface LocalizedProjectMetric extends ProjectMetric {
  label: string;
}

export interface LocalizedProject extends Project {
  title: string;
  caption: string;
  description: string;
  statusLabel: string;
  altDesktop: string;
  altMobile?: string;
  metrics: LocalizedProjectMetric[];
}

// Skill Types
export interface Skill {
  name: string;
  level: number;
  icon: string;
  category: 'frontend' | 'backend' | 'tools' | 'other';
}

// Experience Types
export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string;
  technologies: string[];
}
