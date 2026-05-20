// Easing estándar del proyecto — cubic-bezier suave y natural
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Duración base para animaciones de entrada
export const DURATION = 0.5;

// Variant estándar para hover en cards y botones
export const hoverLift = {
  y: -4,
  transition: { duration: 0.26, ease: EASE },
};

// Variant estándar para iconos con micro-bounce
export const iconBounce = {
  y: [0, -4, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

// Variant estándar para iconos con wobble en hover
export const iconWobble = {
  rotate: [0, -10, 10, -10, 10, 0],
  scale: 1.15,
  transition: { duration: 0.5, ease: 'easeInOut' as const },
};

// Stagger para secciones
export const sectionStagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.06,
    },
  },
};

// Item con fade + slide up
export const sectionItem = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION,
      ease: EASE,
    },
  },
};

// Slide desde la izquierda
export const sectionSlideLeft = {
  hidden: {
    opacity: 0,
    x: -28,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.55,
      ease: EASE,
    },
  },
};

// Slide desde la derecha
export const sectionSlideRight = {
  hidden: {
    opacity: 0,
    x: 28,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.55,
      ease: EASE,
    },
  },
};
