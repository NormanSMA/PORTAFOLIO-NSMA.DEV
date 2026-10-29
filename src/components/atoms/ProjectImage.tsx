import type { CSSProperties } from 'react';

interface ProjectImageProps {
  projectId: string;
  // File stem under public/projects/<projectId>/: the card image is "desktop", a gallery view is its slug.
  name?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}

// Widths and intrinsic size must match scripts/capture-projects.mjs; the intrinsic size reserves space and avoids layout shift.
const WIDTHS = [480, 960, 1440, 1920] as const;
const INTRINSIC = { width: 1920, height: 1200 } as const;
const FALLBACK_WIDTH = WIDTHS[1];

export function ProjectImage({
  projectId,
  name = 'desktop',
  alt,
  sizes,
  priority = false,
  className,
  style,
}: ProjectImageProps) {
  const basePath = `/projects/${projectId}/${name}`;
  const buildSrcSet = (format: 'avif' | 'webp') =>
    WIDTHS.map((width) => `${basePath}-${width}.${format} ${width}w`).join(', ');

  return (
    <picture>
      <source type="image/avif" srcSet={buildSrcSet('avif')} sizes={sizes} />
      <img
        src={`${basePath}-${FALLBACK_WIDTH}.webp`}
        srcSet={buildSrcSet('webp')}
        sizes={sizes}
        alt={alt}
        width={INTRINSIC.width}
        height={INTRINSIC.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className={className}
        style={style}
      />
    </picture>
  );
}
