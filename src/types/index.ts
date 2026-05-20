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

// Component Props
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

// Project Types — acorde a los datos reales en src/data/projects.ts
export interface Project {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string | null;
  image: string;
  imageDark?: string;
  url: string | null;
  technologies: string[];
  icon: React.ComponentType;
}

// Skill Types — acorde a src/data/skills.ts
export interface Skill {
  name: string;
  icon: React.ComponentType;
}

// Service Types — acorde a src/data/services.ts
export interface Service {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

// Social Link Types — acorde a src/data/social.ts
export interface SocialLink {
  name: string;
  url: string;
  icon: React.ComponentType;
}
