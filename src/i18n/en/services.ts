export const services = {
  heading: 'What I do and how I work',
  title: 'Services',
  subtitle: 'I work project by project, from requirements to a published site.',
  webDev: {
    title: 'Web development and apps',
    description: 'I build sites with Astro and React, and WordPress sites. When the project needs it, I add a bilingual version, performance work, and basic SEO.',
  },
  backend: {
    title: 'Backend and APIs',
    description: 'I build APIs with Node.js and PHP (Laravel) on PostgreSQL or MySQL. I integrate external services and validate the data each endpoint receives.',
  },
  deployment: {
    title: 'Hosting and deployment',
    description: 'I deploy to Vercel and set up the domain and SSL certificate. After launch I check the site and handle maintenance fixes.',
  },
} as const;
