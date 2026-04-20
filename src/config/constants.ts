// App Configuration
export const APP_CONFIG = {
  name: 'nsma.dev',
  title: 'Norman Martínez | Ingeniero en Sistemas',
  description: 'Portafolio profesional de Norman Martínez - Ingeniero en Sistemas de Información',
  author: 'Norman Martínez',
  email: 'norman.martinez003@gmail.com',
  github: 'https://github.com/NormanSMA',
  linkedin: 'https://www.linkedin.com/in/norman-martinez',
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  default: 'dark',
  storageKey: 'nsma-theme',
} as const;

// Language Configuration
export const LANGUAGE_CONFIG = {
  default: 'es',
  storageKey: 'nsma-language',
  supported: ['es', 'en'],
} as const;
