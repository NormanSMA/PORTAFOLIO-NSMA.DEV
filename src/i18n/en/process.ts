export const process = {
  title: 'Work process',
  steps: {
    discovery: {
      title: 'Discovery & rules',
      description: 'I map the current workflow, spot data or time bottlenecks, and define rules and timelines before building.',
    },
    strategy: {
      title: 'Data & architecture design',
      description: 'I model the database, select the right stack (web, cloud, or RPA), and structure how data will flow.',
    },
    build: {
      title: 'Build & validation',
      description: 'I build iteratively under Scrum, handle edge cases, and validate against acceptance test cases.',
    },
    optimize: {
      title: 'Deployment & traceability',
      description: 'I deploy to production with domain, SSL, or Docker containers, leaving clear audit logs, metrics, and documentation.',
    },
  },
} as const;
