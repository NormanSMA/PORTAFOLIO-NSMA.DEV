// Language Types
export type Language = 'es' | 'en';

export interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

// Project Types
export type ProjectId =
  | 'autofinops'
  | 'tracore'
  | 'ecopulse'
  | 'turno'
  | 'iuris'
  | 'claudehub'
  | 'systech'
  | 'pantano'
  | 'portfolio';

export type ProjectTier = 'featured' | 'secondary';

export type ProjectStatus ='production' | 'paused' | 'delivered' | 'active' | 'completed' | 'pilot';

// One view of the gallery: its files are public/projects/<id>/<slug>-<width>.<avif|webp>, plus
// <slug>.mp4 when video is set (the images are then the poster of that video).
export interface ProjectView {
  slug: string;
  video?: boolean;
}

// Language-independent data. Copy lives in src/i18n and is resolved by getProjects(t).
export interface Project {
  id: ProjectId;
  tier: ProjectTier;
  year: number;
  status: ProjectStatus;
  // The stack as the project's own repo declares it, in the order it reads best.
  technologies: string[];
  // Keys of the short points under the description: copy lives at projects.<id>.highlights.<key>.
  highlights?: string[];
  // Extra views beyond the card image. Copy (the caption of each) lives at projects.<id>.views.<slug>.
  gallery?: ProjectView[];
  // The code is not public (client or thesis): the ficha shows a label in place of the links.
  privateCode?: boolean;
  links: { live?: string; repo?: string };
}

export interface LocalizedView extends ProjectView {
  label: string;
}

export interface LocalizedProject extends Project {
  title: string;
  category: string;
  caption: string;
  description: string;
  statusLabel: string;
  altDesktop: string;
  highlights: string[];
  gallery: LocalizedView[];
}
