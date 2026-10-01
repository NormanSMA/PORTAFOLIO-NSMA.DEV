export const NODE_PASS_SECONDS = 6;

export const WARMUP_FRAMES = 4;
export const SAMPLE_FRAMES = 60;
export const SLOW_FRAME_MS = 24;

export type QualityAction = 'keep' | 'lower' | 'freeze';

// The node goes end to end in one pass and comes back in the next, so it never teleports.
export function nodeProgress(seconds: number): number {
  const phase = (seconds / NODE_PASS_SECONDS) % 2;
  const linear = phase <= 1 ? phase : 2 - phase;
  return linear < 0.5 ? 4 * linear ** 3 : 1 - (-2 * linear + 2) ** 3 / 2;
}

export function decideQuality(averageFrameMs: number, canLower: boolean): QualityAction {
  if (averageFrameMs <= SLOW_FRAME_MS) return 'keep';
  return canLower ? 'lower' : 'freeze';
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
