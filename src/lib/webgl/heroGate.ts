// Decides whether the hero loads WebGL at all. Kept pure so the decision is unit tested.

export interface HeroEnvironment {
  prefersReducedMotion: boolean;
  saveData: boolean;
  hasWebGL2: boolean;
  // Gigabytes from navigator.deviceMemory; undefined where the API does not exist (Safari, Firefox).
  deviceMemory?: number;
}

export interface RenderProfile {
  dprCap: number;
  // First entry is the starting render scale, second is the single step down.
  scaleSteps: readonly [number, number];
  maxFps: number | null;
}

interface NavigatorHints {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
}

const MIN_DEVICE_MEMORY_GB = 4;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const TOUCH_QUERY = '(pointer: coarse)';

export function shouldEnableWebGL(env: HeroEnvironment): boolean {
  if (env.prefersReducedMotion || env.saveData || !env.hasWebGL2) return false;
  return env.deviceMemory === undefined || env.deviceMemory >= MIN_DEVICE_MEMORY_GB;
}

// Checking the constructor avoids creating a throwaway context just to probe support.
export function readHeroEnvironment(win: Window = window): HeroEnvironment {
  const hints = win.navigator as Navigator & NavigatorHints;
  return {
    prefersReducedMotion: win.matchMedia(REDUCED_MOTION_QUERY).matches,
    saveData: hints.connection?.saveData === true,
    hasWebGL2: 'WebGL2RenderingContext' in win,
    deviceMemory: hints.deviceMemory,
  };
}

export function isTouchDevice(win: Window = window): boolean {
  return win.matchMedia(TOUCH_QUERY).matches;
}

export function getRenderProfile(touch: boolean): RenderProfile {
  return touch
    ? { dprCap: 1.5, scaleSteps: [0.75, 0.5], maxFps: 30 }
    : { dprCap: 2, scaleSteps: [1, 0.6], maxFps: null };
}

export function getRenderDpr(devicePixelRatio: number, profile: RenderProfile, step: 0 | 1): number {
  return Math.min(devicePixelRatio, profile.dprCap) * profile.scaleSteps[step];
}
