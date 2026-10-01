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
