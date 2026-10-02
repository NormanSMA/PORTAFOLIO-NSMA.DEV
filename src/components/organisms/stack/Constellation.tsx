import { useRef, type CSSProperties } from 'react';
import { typography } from '../../../config/typography';
import { cn } from '../../../utils/helpers';
import type { ConstellationGraph } from './constellationGraph';
import { TechGlyph } from './TechGlyph';
import { useConstellation } from './useConstellation';

interface ConstellationProps {
  graph: ConstellationGraph;
}

// Decorative: the grouped list next to it names every technology, so assistive tech skips the sphere.
// Every position, opacity and line below is written by the renderer on each frame; React draws the markup once.
export function Constellation({ graph }: ConstellationProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { layout } = useConstellation(rootRef, graph);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-constellation
      style={{ '--cs-node': `${layout.nodeSize}px` } as CSSProperties}
      className="relative mx-auto aspect-square w-full max-w-[34rem] touch-pan-y select-none overscroll-x-contain pointer-fine:cursor-grab pointer-fine:active:cursor-grabbing"
    >
      <svg viewBox="-50 -50 100 100" focusable="false" className="absolute inset-0 size-full overflow-visible">
        {graph.edges.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            data-edge
            vectorEffect="non-scaling-stroke"
            strokeWidth={1}
            strokeOpacity={0}
            className="stroke-fg-subtle data-[hot=true]:stroke-primary-400"
          />
        ))}
      </svg>

      {graph.nodes.map((node) => (
        <span
          key={node.tech}
          data-node
          className="absolute left-0 top-0 flex size-[var(--cs-node)] items-center justify-center rounded-control border border-line bg-surface-raised will-change-transform data-[active=true]:border-primary-400"
        >
          <TechGlyph tech={node.tech} className="size-[56%]" />
        </span>
      ))}

      <span
        data-label
        style={{ opacity: 0, zIndex: 2000 }}
        className={cn(
          typography.caption,
          'pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-control border border-line bg-ink px-2 py-1 text-fg motion-safe:transition-opacity motion-safe:duration-fast',
        )}
      />
    </div>
  );
}
