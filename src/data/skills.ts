import type { TechId } from './techIcons';

export type SkillGroupId = 'languages' | 'frontend' | 'backend' | 'databases' | 'cloud' | 'tools';

export interface Skill {
  name: string;
  // Services behind the name, shown next to it (for example AWS: Lightsail, S3).
  detail?: string;
  // Key into techIcons: the icon and its color live there so every view shows the same one.
  tech: TechId;
}

export interface SkillGroup {
  id: SkillGroupId;
  skills: Skill[];
}

// Source: CV maestro (2026-09).
export const skillGroups: SkillGroup[] = [
  {
    id: 'languages',
    skills: [
      { name: 'JavaScript', tech: 'javascript' },
      { name: 'TypeScript', tech: 'typescript' },
      { name: 'PHP', tech: 'php' },
      { name: 'SQL', tech: 'sql' },
    ],
  },
  {
    id: 'frontend',
    skills: [
      { name: 'HTML', tech: 'html' },
      { name: 'CSS', tech: 'css' },
      { name: 'React', tech: 'react' },
      { name: 'Next.js', tech: 'nextjs' },
      { name: 'Vue.js', tech: 'vue' },
      { name: 'Astro', tech: 'astro' },
      { name: 'Tailwind CSS', tech: 'tailwind' },
    ],
  },
  {
    id: 'backend',
    skills: [
      { name: 'Node.js', tech: 'nodejs' },
      { name: 'Laravel', tech: 'laravel' },
    ],
  },
  {
    id: 'databases',
    skills: [
      { name: 'PostgreSQL', tech: 'postgresql' },
      { name: 'MySQL', tech: 'mysql' },
      { name: 'SQL Server', tech: 'sqlserver' },
    ],
  },
  {
    id: 'cloud',
    skills: [
      { name: 'AWS', detail: 'Lightsail, S3', tech: 'aws' },
      { name: 'Docker', tech: 'docker' },
      { name: 'Vercel', tech: 'vercel' },
    ],
  },
  {
    id: 'tools',
    skills: [
      { name: 'Git', tech: 'git' },
      { name: 'GitHub', tech: 'github' },
      { name: 'WordPress', tech: 'wordpress' },
    ],
  },
];
