import type { ComponentType, SVGProps } from 'react';
import {
  AwsIcon,
  CssIcon,
  DockerIcon,
  HtmlIcon,
  PhpIcon,
  PostgresIcon,
  ReactIcon,
  SqlIcon,
  TailwindIcon,
  TypeScriptIcon,
  WordPressIcon,
} from '../components/atoms/icons/tech';
import { AstroIcon } from '../components/atoms/icons';

export type SkillIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type SkillGroupId = 'languages' | 'frontend' | 'backend' | 'databases' | 'cloud' | 'tools';

export interface Skill {
  name: string;
  // Services behind the name, shown next to it (for example AWS: Lightsail, S3).
  detail?: string;
  icon?: SkillIcon;
  // Replaces the icon's default classes; the icon needs it when a brand color vanishes on a dark surface.
  iconClassName?: string;
}

export interface SkillGroup {
  id: SkillGroupId;
  skills: Skill[];
}

// Source: CV maestro (2026-09). Only brands that already have an icon in atoms/icons/tech get one.
export const skillGroups: SkillGroup[] = [
  {
    id: 'languages',
    skills: [
      { name: 'JavaScript' },
      { name: 'TypeScript', icon: TypeScriptIcon },
      { name: 'PHP', icon: PhpIcon },
      { name: 'SQL' },
    ],
  },
  {
    id: 'frontend',
    skills: [
      { name: 'HTML', icon: HtmlIcon },
      { name: 'CSS', icon: CssIcon },
      { name: 'React', icon: ReactIcon },
      { name: 'Next.js' },
      { name: 'Vue.js' },
      { name: 'Astro', icon: AstroIcon },
      { name: 'Tailwind CSS', icon: TailwindIcon },
    ],
  },
  {
    id: 'backend',
    skills: [{ name: 'Node.js' }, { name: 'Laravel' }],
  },
  {
    id: 'databases',
    skills: [
      { name: 'PostgreSQL', icon: PostgresIcon },
      { name: 'MySQL' },
      { name: 'SQL Server', icon: SqlIcon },
    ],
  },
  {
    id: 'cloud',
    skills: [
      // The wordmark ships in navy, which disappears on the dark surface.
      { name: 'AWS', detail: 'Lightsail, S3', icon: AwsIcon, iconClassName: 'size-full [&>path]:fill-fg' },
      { name: 'Docker', icon: DockerIcon },
      { name: 'Vercel' },
    ],
  },
  {
    id: 'tools',
    skills: [{ name: 'Git' }, { name: 'GitHub' }, { name: 'WordPress', icon: WordPressIcon }],
  },
];

// Kept for IconCloud in EducationSkills until that section is removed.
export const technicalSkills = skillGroups
  .flatMap((group) => group.skills)
  .flatMap(({ name, icon }) => (icon ? [{ name, icon }] : []));
