// App Configuration
export const APP_CONFIG = {
  name: 'nsma.dev',
  title: 'Norman Martínez | Ingeniero en Sistemas',
  description: 'Portafolio profesional de Norman Martínez - Ingeniero en Sistemas de Información',
  author: 'Norman Martínez',
  email: 'normanma8@gmail.com',
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

// Animation Configuration
export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
  },
  ease: {
    default: [0.4, 0.0, 0.2, 1],
    smooth: [0.25, 0.1, 0.25, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Colors (matching your design)
export const COLORS = {
  dark: {
    bg: '#0A0A0F',
    card: '#1A1A24',
    border: '#2A2A34',
    text: '#FFFFFF',
    textSecondary: '#B4B4B8',
  },
  light: {
    bg: '#FFFFFF',
    card: '#F9FAFB',
    border: '#E5E7EB',
    text: '#1F2937',
    textSecondary: '#6B7280',
  },
  primary: {
    main: '#6366F1',
    light: '#818CF8',
    dark: '#4F46E5',
  },
  secondary: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
  },
} as const;
