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

// Language-independent data. Copy lives in src/i18n and is resolved by getProjects(t).
export interface Project {
  id: ProjectId;
  tier: ProjectTier;
  category: string;
  year: number;
  status: ProjectStatus;
  // The five most representative ones: the ficha is a summary, not the full stack.
  technologies: string[];
  links: { live?: string; repo?: string };
  hasMobileImage: boolean;
  // CSS object-position that frames the desktop capture inside a portrait card.
  imagePosition: string;
}

export interface LocalizedProject extends Project {
  title: string;
  caption: string;
  description: string;
  statusLabel: string;
  altDesktop: string;
  altMobile?: string;
}
