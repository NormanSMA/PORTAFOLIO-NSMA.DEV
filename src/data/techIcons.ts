import type { ComponentType, SVGProps } from 'react';
import { Database } from 'lucide-react';
import {
  siAstro,
  siCss,
  siDocker,
  siGit,
  siGithub,
  siHtml5,
  siJavascript,
  siLaravel,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siPhp,
  siPostgresql,
  siReact,
  siTailwindcss,
  siTypescript,
  siVercel,
  siVuedotjs,
  siWordpress,
} from 'simple-icons';
import { AwsIcon } from '../components/atoms/icons/tech/AWSIcon';
import { SqlServerIcon } from '../components/atoms/icons/tech/SqlServerIcon';

export type TechIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface TechIcon {
  // A CSS color: the brand hex, or a token when the brand is black on a dark surface.
  color: string;
  // simple-icons glyph on a 24 x 24 viewBox.
  path?: string;
  // Brands simple-icons does not carry (AWS, SQL Server) and the generic SQL glyph.
  component?: TechIconComponent;
  // Extra classes for the component, for example to recolor a wordmark that vanishes on dark.
  className?: string;
}

// Black brands (Next.js, Vercel, GitHub) disappear on the dark chip, so they take the foreground token.
const FOREGROUND = 'rgb(var(--color-fg))';
const NEUTRAL = 'rgb(var(--color-fg-muted))';

const brand = ({ path, hex }: { path: string; hex: string }): TechIcon => ({ path, color: `#${hex}` });

const icons = {
  javascript: brand(siJavascript),
  typescript: brand(siTypescript),
  php: brand(siPhp),
  // No brand exists for the query language; a neutral database glyph stands in for it.
  sql: { component: Database, color: NEUTRAL },
  html: brand(siHtml5),
  // The official rebeccapurple measures 1.9:1 on the chip; this lighter tone of the same hue holds 3:1.
  css: { path: siCss.path, color: '#8A5CC9' },
  react: brand(siReact),
  nextjs: { path: siNextdotjs.path, color: FOREGROUND },
  vue: brand(siVuedotjs),
  astro: brand(siAstro),
  tailwind: brand(siTailwindcss),
  nodejs: brand(siNodedotjs),
  laravel: brand(siLaravel),
  postgresql: brand(siPostgresql),
  mysql: brand(siMysql),
  // The brand red sits at 2.99:1 on the chip; one step lighter clears 3:1.
  sqlserver: { component: SqlServerIcon, color: '#D1302E' },
  // The wordmark ships in navy, which disappears on the dark surface; the orange smile stays.
  aws: { component: AwsIcon, color: '#FF9900', className: '[&>path]:fill-fg' },
  docker: brand(siDocker),
  vercel: { path: siVercel.path, color: FOREGROUND },
  git: brand(siGit),
  github: { path: siGithub.path, color: FOREGROUND },
  wordpress: brand(siWordpress),
} satisfies Record<string, TechIcon>;

export type TechId = keyof typeof icons;

export const techIcons: Record<TechId, TechIcon> = icons;
