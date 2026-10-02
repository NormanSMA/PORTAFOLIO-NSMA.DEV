// One pass of the node is readable as a deliberate movement; shorter reads as a flicker, longer as static.
export const NODE_PASS_SECONDS = 5;

export const WARMUP_FRAMES = 4;
export const SAMPLE_FRAMES = 60;
export const SLOW_FRAME_MS = 24;

// 'fallback' retires the canvas and leaves the animated poster.
export type QualityAction = 'keep' | 'lower' | 'fallback';

// The poster's sweep animation is sampled from this same easing, so poster and canvas move the node alike.
export function easeNode(linear: number): number {
  return linear < 0.5 ? 4 * linear ** 3 : 1 - (-2 * linear + 2) ** 3 / 2;
}

// The node goes end to end in one pass and comes back in the next, so it never teleports.
export function nodeProgress(seconds: number): number {
  const phase = (seconds / NODE_PASS_SECONDS) % 2;
  return easeNode(phase <= 1 ? phase : 2 - phase);
}

// Waits out the canvas fade-in so the poster and the canvas never show two different positions, then eases in.
const DRIFT_DELAY_SECONDS = 1.2;
const DRIFT_RAMP_SECONDS = 3;

// Share of the sway in use after `canvasSeconds` of canvas life.
export function driftAmount(canvasSeconds: number): number {
  const progress = Math.min(Math.max((canvasSeconds - DRIFT_DELAY_SECONDS) / DRIFT_RAMP_SECONDS, 0), 1);
  return progress * progress * (3 - 2 * progress);
}

export function decideQuality(averageFrameMs: number, canLower: boolean): QualityAction {
  if (averageFrameMs <= SLOW_FRAME_MS) return 'keep';
  return canLower ? 'lower' : 'fallback';
}

export interface FrameMeter {
  // Returns the window average once SAMPLE_FRAMES samples are in, otherwise null.
  push(frameMs: number): number | null;
  reset(): void;
}

// The first frames pay for shader compilation and buffer allocation, so they are not counted.
export function createFrameMeter(): FrameMeter {
  let skipped = 0;
  let total = 0;
  let count = 0;

  return {
    push(frameMs) {
      if (skipped < WARMUP_FRAMES) {
        skipped += 1;
        return null;
      }
      total += frameMs;
      count += 1;
      if (count < SAMPLE_FRAMES) return null;
      const average = total / count;
      total = 0;
      count = 0;
      return average;
    },
    reset() {
      skipped = 0;
      total = 0;
      count = 0;
    },
  };
}
