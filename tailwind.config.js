const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
// DEFAULT is step 500 so bg-primary and border-primary/50 keep working next to bg-primary-600.
const scale = (name) => ({
  DEFAULT: token(`${name}-500`),
  ...Object.fromEntries(steps.map((step) => [step, token(`${name}-${step}`)])),
});

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
        line: {
          DEFAULT: token('line'),
          strong: token('line-strong'),
          control: token('line-control'),
        },
        primary: scale('primary'),
        secondary: scale('secondary'),
        success: token('success'),
        danger: token('danger'),
        focus: 'rgb(var(--focus-ring-color) / <alpha-value>)',
        // heredado, se elimina al final: sections not yet rewritten still use these keys.
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
      // Hero aura and StarBorder only; never on text or cards.
      backgroundImage: {
        brand: 'var(--gradient-brand)',
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
        // Primary CTA only.
        glow: 'var(--glow-primary)',
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
