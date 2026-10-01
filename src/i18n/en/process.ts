export const process = {
  title: 'Work Process',
  subtitle: 'A simple route to move from an idea to something usable.',
  steps: {
    discovery: {
      title: 'Discovery',
      description: 'I understand the goal, context, and priorities before starting.',
    },
    strategy: {
      title: 'Visual & technical strategy',
      description: 'I define structure and visual direction before building.',
    },
    build: {
      title: 'Build & validation',
      description: 'I develop, test, and adjust with short review cycles.',
    },
    optimize: {
      title: 'Optimization & launch',
      description: 'I fix details, improve accessibility, and prepare deployment.',
    },
  },
} as const;
