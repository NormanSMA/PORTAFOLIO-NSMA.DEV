import { useState } from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import { typography } from '../../../config/typography';
import { cn } from '../../../utils/helpers';
import { ProjectImage } from '../../atoms/ProjectImage';
import type { LocalizedProject } from '../../../types';
import { GalleryLightbox } from './GalleryLightbox';

interface ProjectGalleryProps {
  project: LocalizedProject;
  // The ficha renders every project invisibly to reserve its height. Those copies keep the same tiles
  // empty, so the 36 thumbnails are not requested a second time and only one dialog exists.
  measureOnly?: boolean;
}

const THUMB_SIZES = '(min-width: 640px) 156px, 45vw';
const TILE_CLASS = 'relative block aspect-[16/10] w-full overflow-hidden rounded-control border border-line-strong bg-surface';

export function ProjectGallery({ project, measureOnly = false }: ProjectGalleryProps) {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { gallery } = project;

  if (gallery.length === 0) return null;

  return (
    <>
      <ul
        aria-label={t('projects.ui.galleryTitle')}
        className="flex w-full max-w-3xl flex-wrap justify-center gap-3"
      >
        {gallery.map((view, index) => (
          // Two per row on phones, four from sm up; three views stay centered at the same size.
          <li key={view.slug} className="w-[calc(50%-0.375rem)] sm:w-[calc(25%-0.5625rem)]">
            {measureOnly ? (
              <span className={TILE_CLASS} />
            ) : (
              <button
                type="button"
                aria-label={`${t('projects.ui.openView')}: ${view.label}`}
                className={cn(
                  TILE_CLASS,
                  'cursor-zoom-in [&>picture]:block [&>picture]:h-full',
                  'motion-safe:transition-colors motion-safe:duration-fast motion-safe:ease-out',
                  'pointer-fine:hover:border-primary-400',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                )}
                onClick={() => setOpenIndex(index)}
              >
                <ProjectImage
                  projectId={project.id}
                  name={view.slug}
                  alt=""
                  sizes={THUMB_SIZES}
                  className="h-full w-full object-cover"
                />
                {view.video && (
                  <span
                    className={cn(
                      typography.caption,
                      'absolute bottom-1.5 left-1.5 rounded-control bg-ink/85 px-2 py-0.5 text-fg',
                    )}
                  >
                    {t('projects.ui.video')}
                  </span>
                )}
              </button>
            )}
          </li>
        ))}
      </ul>
      {!measureOnly && (
        <GalleryLightbox
          projectId={project.id}
          views={gallery}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
