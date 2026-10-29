import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from '../../config/motion';
import { gsap } from '../../lib/gsap';
import { isIntroPlaying, markIntroLanded } from '../../lib/intro';

// The page opens behind an ink veil. A frame draws itself around the whole screen, with a square at each corner as the
// line reaches it, then shrinks onto the frame of the hero canvas while the veil lifts and the page comes into focus.
// When the frame lands, the canvas takes over (lib/intro): it starts its own intro with the frame already drawn.
const DRAW_AT = 0.3;
const DRAW_SECONDS = 1.4;
const MORPH_AT = 1.9;
const MORPH_SECONDS = 1.4;
const VEIL_AT = 2.1;
const VEIL_SECONDS = 1.6;
const HANDOFF_SECONDS = 0.25;
const BLUR_PX = 14;
const FRAME_INSET = 20;
const CORNER_SIZE = 7;
// The corner pops over this share of the outline once the line has reached it.
const CORNER_POP = 0.03;
const CANVAS_SELECTOR = '.hero-canvas-scene';
const SKIP_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchmove'] as const;

interface FrameBox {
  x: number;
  y: number;
  w: number;
  h: number;
  // How much of the outline is drawn, from 0 to 1.
  draw: number;
  blur: number;
  // The opacity of the veil's ink. The veil itself stays opaque as a layer: fading the layer would fade its blur with it.
  veil: number;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

// Where along the outline (top left, clockwise) each corner sits, from 0 to 1.
function cornerFractions(width: number, height: number): number[] {
  const perimeter = 2 * (width + height);
  return [0, width, width + height, 2 * width + height].map((length) => length / perimeter);
}

function IntroLayer({ onDone }: { onDone: () => void }) {
  const veilRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<SVGRectElement>(null);
  const cornerRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const veil = veilRef.current;
    const layer = layerRef.current;
    const frame = frameRef.current;
    const corners = cornerRefs.current.filter((corner): corner is HTMLSpanElement => corner !== null);
    if (!veil || !layer || !frame || corners.length !== 4) return;

    const box: FrameBox = {
      x: FRAME_INSET,
      y: FRAME_INSET,
      w: window.innerWidth - 2 * FRAME_INSET,
      h: window.innerHeight - 2 * FRAME_INSET,
      draw: 0,
      blur: BLUR_PX,
      veil: 1,
    };
    const fractions = cornerFractions(box.w, box.h);

    const render = () => {
      frame.setAttribute('x', String(box.x));
      frame.setAttribute('y', String(box.y));
      frame.setAttribute('width', String(box.w));
      frame.setAttribute('height', String(box.h));
      frame.style.strokeDashoffset = (1 - box.draw).toFixed(4);
      const points = [
        [box.x, box.y],
        [box.x + box.w, box.y],
        [box.x + box.w, box.y + box.h],
        [box.x, box.y + box.h],
      ];
      corners.forEach((corner, index) => {
        const [x, y] = points[index];
        corner.style.transform = `translate3d(${x - CORNER_SIZE / 2}px, ${y - CORNER_SIZE / 2}px, 0)`;
        corner.style.opacity = String(clamp((box.draw - fractions[index]) / CORNER_POP));
      });
      const blur = `blur(${box.blur.toFixed(2)}px)`;
      veil.style.backdropFilter = blur;
      veil.style.setProperty('-webkit-backdrop-filter', blur);
      veil.style.backgroundColor = `rgb(var(--color-ink) / ${box.veil.toFixed(3)})`;
    };

    // Read when the move starts, so the frame lands where the canvas is at that moment.
    const target = () => {
      const rect = document.querySelector(CANVAS_SELECTOR)?.getBoundingClientRect();
      return rect && rect.width > 0 ? { x: rect.left, y: rect.top, w: rect.width, h: rect.height } : box;
    };

    let landed = false;
    const land = () => {
      if (landed) return;
      landed = true;
      markIntroLanded();
    };

    const timeline = gsap.timeline({
      defaults: { ease: 'sine.inOut' },
      onUpdate: render,
      onComplete: () => {
        land();
        onDone();
      },
    });
    timeline.to(box, { draw: 1, duration: DRAW_SECONDS }, DRAW_AT);
    timeline.to(
      box,
      {
        x: () => target().x,
        y: () => target().y,
        w: () => target().w,
        h: () => target().h,
        duration: MORPH_SECONDS,
        ease: motion.ease.inOut.gsap,
      },
      MORPH_AT,
    );
    timeline.to(box, { blur: 0, duration: VEIL_SECONDS }, VEIL_AT);
    timeline.to(box, { veil: 0, duration: VEIL_SECONDS, ease: 'power2.out' }, VEIL_AT);
    timeline.call(land, undefined, MORPH_AT + MORPH_SECONDS);
    timeline.to(layer, { opacity: 0, duration: HANDOFF_SECONDS, ease: 'none' }, MORPH_AT + MORPH_SECONDS + 0.05);
    render();

    // Anything the visitor does means they want the page: the intro jumps to its end.
    const skip = () => timeline.progress(1, false);
    SKIP_EVENTS.forEach((name) => window.addEventListener(name, skip, { passive: true, once: true }));

    return () => {
      SKIP_EVENTS.forEach((name) => window.removeEventListener(name, skip));
      timeline.kill();
    };
  }, [onDone]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-intro">
      <div ref={veilRef} className="absolute inset-0 bg-ink" />
      <div ref={layerRef} className="absolute inset-0">
        <svg className="absolute inset-0 size-full" focusable="false">
          <rect
            ref={frameRef}
            fill="none"
            strokeWidth={1}
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
            className="stroke-fg-subtle"
          />
        </svg>
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            ref={(element) => {
              cornerRefs.current[index] = element;
            }}
            className="absolute left-0 top-0 block size-[7px] border border-fg bg-ink opacity-0"
          />
        ))}
      </div>
    </div>
  );
}

export function PageIntro() {
  // Read once, on the first render: whether the intro plays is decided before React starts.
  const [playing] = useState(isIntroPlaying);
  const [done, setDone] = useState(false);
  // A stable callback: a new one on every render would restart the timeline.
  const finish = useCallback(() => setDone(true), []);

  if (!playing || done) return null;
  return <IntroLayer onDone={finish} />;
}
