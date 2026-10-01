import type { CSSProperties } from 'react';

type ProjectImageKind = 'desktop' | 'mobile';

interface ProjectImageProps {
  projectId: string;
  kind: ProjectImageKind;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}

// Widths and intrinsic size must match scripts/capture-projects.mjs; the intrinsic size reserves space and avoids layout shift.
const projectImageSpecs = {
  desktop: { widths: [480, 800, 1200, 1600], width: 1600, height: 1000 },
  mobile: { widths: [240, 360, 480, 720], width: 720, height: 1558 },
} as const;

export function ProjectImage({ projectId, kind, alt, sizes, priority = false, className, style }: ProjectImageProps) {
  const { widths, width, height } = projectImageSpecs[kind];
  const basePath = `/projects/${projectId}/${kind}`;
  const buildSrcSet = (format: 'avif' | 'webp') =>
    widths.map((w) => `${basePath}-${w}.${format} ${w}w`).join(', ');

  return (
    <picture>
      <source type="image/avif" srcSet={buildSrcSet('avif')} sizes={sizes} />
      <img
        src={`${basePath}-${widths[1]}.webp`}
        srcSet={buildSrcSet('webp')}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className={className}
        style={style}
      />
    </picture>
  );
}
