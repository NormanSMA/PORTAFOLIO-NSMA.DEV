import { useState } from 'react';
import { ProjectImage } from '../../atoms/ProjectImage';
import type { LocalizedProject } from '../../../types';

type ProjectCardFaceProps = Pick<LocalizedProject, 'id' | 'altDesktop'>;

// The displayed card width, as ringLayout.cardWidthFor computes it: 230 px at 375 px of viewport, 440 px at most.
// The reflection renders this same component, so both images resolve to the same file.
const CARD_SIZES = 'clamp(200px, calc(230px + (100vw - 375px) * 0.313), 440px)';

// The box has the capture's own 16:10 ratio, so cover crops nothing. A missing image hides itself and
// the box keeps its surface fill instead of showing a broken-image icon.
export function ProjectCardFace({ id, altDesktop }: ProjectCardFaceProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="h-full w-full bg-surface [&>picture]:block [&>picture]:h-full"
      onErrorCapture={() => setFailed(true)}
    >
      {!failed && (
        <ProjectImage projectId={id} alt={altDesktop} sizes={CARD_SIZES} className="h-full w-full object-cover" />
      )}
    </div>
  );
}
