import { useEffect, useRef } from 'react';
import { motion } from '../../../config/motion';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

interface NavLineProps {
  activeId: string;
}

interface Span {
  left: number;
  right: number;
}

interface LineState extends Span {
  targetLeft: number;
  targetRight: number;
  // The edge that points the way moves fast and the other follows, so the line stretches while it travels.
  movingRight: boolean;
  placed: boolean;
}

// Per-second rates of the exponential catch-up: the leading edge is more than twice as quick as the trailing one.
const LEAD_RATE = 16;
const TRAIL_RATE = 7;
const MAX_STEP_SECONDS = 0.05;
const SETTLE_PX = 0.25;
// The node of the line shows only while the line travels: it is fully visible when an edge is this far from its target.
const NODE_FULL_AT_PX = 24;
const NODE_SIZE = 6;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

// The span of the active link's text, in the coordinates of the wrapper the line lives in.
function measure(scope: HTMLElement): Span | null {
  const link = scope.querySelector<HTMLElement>('a[aria-current="true"]');
  if (!link) return null;
  const base = scope.getBoundingClientRect();
  const box = link.getBoundingClientRect();
  const padding = parseFloat(getComputedStyle(link).paddingLeft) || 0;
  return { left: box.left - base.left + padding, right: box.right - base.left - padding };
}

function paint(state: LineState, bar: HTMLElement, node: HTMLElement) {
  bar.style.transform = `translate3d(${state.left}px, 0, 0) scaleX(${Math.max(0, state.right - state.left)})`;
  const lead = state.movingRight ? state.right : state.left;
  const gap = Math.max(Math.abs(state.targetLeft - state.left), Math.abs(state.targetRight - state.right));
  node.style.transform = `translate3d(${lead - NODE_SIZE / 2}px, 0, 0)`;
  node.style.opacity = String(clamp(gap / NODE_FULL_AT_PX));
}

function snap(state: LineState, target: Span) {
  state.left = state.targetLeft = target.left;
  state.right = state.targetRight = target.right;
}

// One single line under the bar: a bright segment that slides to the active link, with nothing drawn along the rest of
// the list. It moves like the hero curve does, softly and without cuts: the front edge leaves first and the back
// edge follows, and a small square node, the same one the hero draws on its curve, rides the front edge while it moves.
export function NavLine({ activeId }: NavLineProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const allowsMotion = useMediaQuery(motion.media.noReducedMotion);
  const state = useRef<LineState>({
    left: 0,
    right: 0,
    targetLeft: 0,
    targetRight: 0,
    movingRight: true,
    placed: false,
  });

  useEffect(() => {
    const scope = rootRef.current?.parentElement;
    const bar = barRef.current;
    const node = nodeRef.current;
    if (!scope || !bar || !node) return;
    const line = state.current;
    const target = measure(scope);
    if (!target) return;

    if (!line.placed || !allowsMotion) {
      snap(line, target);
      line.placed = true;
      paint(line, bar, node);
      return;
    }

    line.movingRight = target.left + target.right > line.targetLeft + line.targetRight;
    line.targetLeft = target.left;
    line.targetRight = target.right;

    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const seconds = Math.min(MAX_STEP_SECONDS, (now - last) / 1000);
      last = now;
      const leftRate = line.movingRight ? TRAIL_RATE : LEAD_RATE;
      const rightRate = line.movingRight ? LEAD_RATE : TRAIL_RATE;
      line.left += (line.targetLeft - line.left) * (1 - Math.exp(-leftRate * seconds));
      line.right += (line.targetRight - line.right) * (1 - Math.exp(-rightRate * seconds));
      const settled =
        Math.abs(line.targetLeft - line.left) < SETTLE_PX && Math.abs(line.targetRight - line.right) < SETTLE_PX;
      if (settled) snap(line, { left: line.targetLeft, right: line.targetRight });
      paint(line, bar, node);
      if (!settled) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [activeId, allowsMotion]);

  // A language change or a resize moves the links: the line goes straight to the new place instead of travelling.
  useEffect(() => {
    const scope = rootRef.current?.parentElement;
    const bar = barRef.current;
    const node = nodeRef.current;
    if (!scope || !bar || !node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      const target = measure(scope);
      if (!target) return;
      snap(state.current, target);
      state.current.placed = true;
      paint(state.current, bar, node);
    });
    observer.observe(scope);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-2">
      <div
        ref={barRef}
        className="absolute bottom-1 left-0 h-0.5 w-px origin-left bg-primary-400"
        style={{ transform: 'scaleX(0)' }}
      />
      <div
        ref={nodeRef}
        className="absolute bottom-0.5 left-0 h-1.5 w-1.5 border border-fg bg-ink"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
