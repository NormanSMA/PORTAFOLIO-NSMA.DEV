// GSAP works in seconds; the CSS twins live in src/styles/tokens.css as --duration-* and --ease-*.
export const motion = {
  duration: {
    fast: 0.25,
    base: 0.6,
    slow: 1.1,
  },
  // Penner equivalents: power3 = quart, power2 = cubic.
  ease: {
    out: { gsap: 'power3.out', css: 'cubic-bezier(0.165, 0.84, 0.44, 1)' },
    expo: { gsap: 'expo.out', css: 'cubic-bezier(0.19, 1, 0.22, 1)' },
    inOut: { gsap: 'power2.inOut', css: 'cubic-bezier(0.645, 0.045, 0.355, 1)' },
    in: { gsap: 'power2.in', css: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)' },
  },
  stagger: {
    tight: 0.03,
    base: 0.06,
    loose: 0.12,
  },
  // Lenis already smooths desktop scrolling, so pinned scenes there use tight to avoid double lag.
  scrub: {
    tight: 0.5,
    base: 1,
  },
  offset: {
    reveal: 24,
    hero: 48,
  },
  scrollStart: {
    reveal: 'top 80%',
    pin: 'top top',
  },
  media: {
    noReducedMotion: '(prefers-reduced-motion: no-preference)',
    finePointer: '(hover: hover) and (pointer: fine)',
    desktop: '(min-width: 1024px)',
    mobile: '(max-width: 1023px)',
  },
} as const;
