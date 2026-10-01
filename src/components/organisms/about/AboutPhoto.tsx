import { cn } from '../../../utils/helpers';

interface AboutPhotoProps {
  alt: string;
  className?: string;
}

// The cutout has alpha: the surface shows through, so the frame is the only chrome.
// The top third of the file is empty; the 1.25 scale from the bottom edge crops it without changing the 4:5 box.
export function AboutPhoto({ alt, className }: AboutPhotoProps) {
  return (
    <div className={cn('overflow-hidden rounded-card border border-line bg-surface', className)}>
      <img
        src="/norman_sf-800w.webp"
        srcSet="/norman_sf-480w.webp 480w, /norman_sf-800w.webp 800w, /norman_sf-1200w.webp 1200w"
        sizes="(min-width: 1024px) 545px, (min-width: 768px) 480px, 360px"
        alt={alt}
        width={1600}
        height={2000}
        loading="lazy"
        decoding="async"
        className="block aspect-[4/5] h-auto w-full origin-bottom scale-125 object-cover"
      />
    </div>
  );
}
