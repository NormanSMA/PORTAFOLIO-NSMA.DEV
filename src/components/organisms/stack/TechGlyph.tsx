import { techIcons, type TechId } from '../../../data/techIcons';
import { cn } from '../../../utils/helpers';

interface TechGlyphProps {
  tech: TechId;
  className?: string;
}

// Decorative: the caller names the technology in text next to it, so the glyph carries no label of its own.
export function TechGlyph({ tech, className }: TechGlyphProps) {
  const { color, path, component: Icon, className: iconClassName } = techIcons[tech];
  const style = { color };

  if (Icon) {
    return <Icon aria-hidden="true" focusable="false" className={cn('size-full', iconClassName, className)} style={style} />;
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={cn('size-full', className)}
      style={style}
    >
      <path d={path} />
    </svg>
  );
}
