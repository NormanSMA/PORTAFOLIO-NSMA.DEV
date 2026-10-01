import { useState } from 'react';
import { ProjectImage } from '../../atoms/ProjectImage';
import type { LocalizedProject } from '../../../types';

type ProjectCardFaceProps = Pick<LocalizedProject, 'id' | 'altDesktop' | 'altMobile' | 'hasMobileImage'>;

// A missing image hides itself so the card keeps its surface fill instead of showing a broken-image icon.
export function ProjectCardFace({ id, altDesktop, altMobile, hasMobileImage }: ProjectCardFaceProps) {
  const [desktopFailed, setDesktopFailed] = useState(false);
  const [mobileFailed, setMobileFailed] = useState(false);
  const showMobile = hasMobileImage && altMobile && !mobileFailed;

  return (
    <div className="relative h-full w-full overflow-hidden bg-surface">
      {!desktopFailed && (
        <div
          className="absolute inset-0 [&>picture]:block [&>picture]:h-full"
          onErrorCapture={() => setDesktopFailed(true)}
        >
          <ProjectImage
            projectId={id}
            kind="desktop"
            alt={altDesktop}
            sizes="(min-width: 768px) 720px, 560px"
            className="h-full w-full object-cover object-left-top"
          />
        </div>
      )}
      {showMobile && (
        <div
          className="absolute bottom-3 right-3 w-[34%] overflow-hidden rounded-control border border-line bg-surface shadow-card [&>picture]:block"
          onErrorCapture={() => setMobileFailed(true)}
        >
          <ProjectImage
            projectId={id}
            kind="mobile"
            alt={altMobile}
            sizes="128px"
            className="block h-auto w-full"
          />
        </div>
      )}
    </div>
  );
}
