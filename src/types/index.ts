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

// Project Types
export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
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
