export const sectionStagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.06,
    },
  },
};

export const sectionItem = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

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
        ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

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
        ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};
