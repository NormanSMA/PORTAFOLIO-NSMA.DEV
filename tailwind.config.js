const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Legacy: removed with the light theme.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: token('ink'),
        surface: {
          DEFAULT: token('surface'),
          raised: token('surface-raised'),
        },
        fg: {
          DEFAULT: token('fg'),
          muted: token('fg-muted'),
          subtle: token('fg-subtle'),
        },
        bronze: {
          DEFAULT: token('bronze'),
          bright: token('bronze-bright'),
          deep: token('bronze-deep'),
        },
        sapphire: {
          DEFAULT: token('sapphire'),
          soft: token('sapphire-soft'),
        },
        mint: token('mint'),
        danger: token('danger'),
        focus: 'rgb(var(--focus-ring-color) / <alpha-value>)',
        // Fixed-alpha hairlines: opacity modifiers do not apply to them.
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
          control: 'var(--line-control)',
        },
        // Legacy palette (primary, secondary, accent, dark, light): removed when every section uses the tokens above.
        primary: {
          DEFAULT: '#6366F1',
          50: '#F5F5FF',
          100: '#EBEBFF',
          200: '#D4D4FF',
          300: '#B8B8FF',
          400: '#9C9CFF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        secondary: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        accent: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
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
      },
      // sans stays as an alias of body because Preflight reads it for <html>.
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        sans: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      spacing: {
        section: 'var(--section-padding)',
        gutter: 'var(--gutter)',
        card: 'var(--card-padding)',
      },
      maxWidth: {
        container: 'var(--container-max)',
      },
      minWidth: {
        target: 'var(--target-min)',
      },
      minHeight: {
        target: 'var(--target-min)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
        pill: 'var(--radius-pill)',
      },
      zIndex: {
        below: 'var(--z-below)',
        raised: 'var(--z-raised)',
        nav: 'var(--z-nav)',
        overlay: 'var(--z-overlay)',
        toast: 'var(--z-toast)',
        skip: 'var(--z-skip)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
      // Same intent as the Tailwind defaults with the GSAP curves from src/config/motion.ts.
      transitionTimingFunction: {
        out: 'var(--ease-out)',
        expo: 'var(--ease-expo)',
        'in-out': 'var(--ease-in-out)',
        in: 'var(--ease-in)',
      },
      backgroundImage: {
        metal: 'var(--gradient-metal)',
        'bronze-sheen': 'var(--gradient-bronze)',
        halo: 'var(--gradient-halo)',
      },
      // Legacy animations: StarBorder keeps star-movement-*; the rest go with the old sections.
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'fadeIn': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
        'star-movement-top': 'star-movement-top linear infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'star-movement-bottom': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
        },
        'star-movement-top': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(100%, 0%)', opacity: '0' },
        },
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        raised: 'var(--shadow-raised)',
        'glow-bronze': 'var(--glow-bronze)',
        'glow-sapphire': 'var(--glow-sapphire)',
        // Legacy indigo glow.
        'glow': '0 0 20px rgba(99, 102, 241, 0.5)',
        'glow-lg': '0 0 30px rgba(99, 102, 241, 0.6)',
      },
    },
  },
  plugins: [
    // Hover effects only for real pointers; touch screens keep a sticky :hover otherwise.
    function ({ addVariant }) {
      addVariant('pointer-fine', '@media (hover: hover) and (pointer: fine)');
    },
  ],
}
