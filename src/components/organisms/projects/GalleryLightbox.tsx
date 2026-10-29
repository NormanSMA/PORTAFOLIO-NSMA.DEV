import { useEffect, useRef } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { typography } from '../../../config/typography';
import { useLanguage } from '../../../hooks/useLanguage';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { cn } from '../../../utils/helpers';
import { Button } from '../../atoms/Button';
import { ProjectImage } from '../../atoms/ProjectImage';
import type { LocalizedView, ProjectId } from '../../../types';

interface GalleryLightboxProps {
  projectId: ProjectId;
  views: LocalizedView[];
  // Index of the open view, or null when the dialog is closed.
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const MEDIA_CLASS = 'max-h-[70vh] w-auto max-w-full rounded-control bg-surface object-contain';
const NAV_KEYS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 };

// The native modal dialog traps focus, closes on Escape and gives focus back to the thumbnail that opened it.
// It stays mounted while closed so that close() can restore the focus; its content only exists while open.
export function GalleryLightbox({ projectId, views, index, onIndexChange, onClose }: GalleryLightboxProps) {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const open = index !== null;
  const view = index === null ? undefined : views[index];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
  }, [open]);

  // The page behind must not scroll (Lenis reads the wheel on the window, so the dialog opts out of it too).
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  const step = (delta: number) => {
    if (index === null) return;
    onIndexChange((index + delta + views.length) % views.length);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    const delta = NAV_KEYS[event.key];
    if (!delta || event.altKey || event.ctrlKey || event.metaKey) return;
    // The video controls use the arrows to seek.
    if ((event.target as HTMLElement).tagName === 'VIDEO') return;
    event.preventDefault();
    step(delta);
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const counter = index === null ? '' : `${index + 1} ${t('projects.ui.viewCounter')} ${views.length}`;

  return (
    <dialog
      ref={dialogRef}
      aria-label={t('projects.ui.galleryTitle')}
      data-lenis-prevent
      className="m-auto w-[min(96vw,1100px)] max-w-none rounded-card border border-line-strong bg-ink p-0 text-fg backdrop:bg-black/80"
      onClose={onClose}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      {view && (
        <div className="flex flex-col gap-3 p-3 sm:p-4">
          <figure className="flex flex-col items-center gap-3">
            {view.video ? (
              <video
                key={view.slug}
                className={MEDIA_CLASS}
                src={`/projects/${projectId}/${view.slug}.mp4`}
                poster={`/projects/${projectId}/${view.slug}-1440.webp`}
                aria-label={view.label}
                controls
                muted
                playsInline
                autoPlay={!reducedMotion}
              />
            ) : (
              <ProjectImage
                key={view.slug}
                projectId={projectId}
                name={view.slug}
                alt={view.label}
                sizes="(min-width: 1100px) 1068px, 96vw"
                priority
                className={MEDIA_CLASS}
              />
            )}
            <figcaption className={cn(typography.bodySmall, 'max-w-prose text-center text-pretty text-fg-muted')}>
              {view.label}
            </figcaption>
          </figure>
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" size="sm" aria-label={t('projects.ui.previousView')} onClick={() => step(-1)}>
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </Button>
            <p className={cn(typography.bodySmall, 'tabular-nums text-fg-muted')}>{counter}</p>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" aria-label={t('projects.ui.nextView')} onClick={() => step(1)}>
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" aria-label={t('projects.ui.closeView')} onClick={onClose}>
                <X aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
