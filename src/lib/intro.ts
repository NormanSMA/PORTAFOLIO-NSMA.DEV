import { motion } from '../config/motion';

// The page intro (a frame that opens over a blurred veil) and the hero canvas share one hand-off: the canvas waits
// until the frame has landed on it. The state lives on <html data-intro>, so no component has to import another:
// absent means no intro, "playing" means the frame is still travelling, "landed" means the canvas may start.
const ATTRIBUTE = 'intro';
const LANDED_EVENT = 'intro:landed';
// If the intro never lands (an error, a hidden tab that stalls the clock) the canvas must not wait for ever.
const LANDING_DEADLINE_MS = 9000;

export function isIntroPlaying(): boolean {
  return typeof document !== 'undefined' && document.documentElement.dataset[ATTRIBUTE] === 'playing';
}

// Called once, before React renders. A link with a hash goes straight to a section, and reduced motion
// gets the page with no intro at all.
export function startIntroIfAllowed(): void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
  if (!window.matchMedia(motion.media.noReducedMotion).matches || window.location.hash) return;
  document.documentElement.dataset[ATTRIBUTE] = 'playing';
  window.setTimeout(markIntroLanded, LANDING_DEADLINE_MS);
}

export function markIntroLanded(): void {
  if (!isIntroPlaying()) return;
  document.documentElement.dataset[ATTRIBUTE] = 'landed';
  window.dispatchEvent(new Event(LANDED_EVENT));
}

// Runs the callback now when there is no intro or it has already landed, and otherwise when it lands.
export function onIntroLanded(callback: () => void): () => void {
  if (!isIntroPlaying()) {
    callback();
    return () => {};
  }
  window.addEventListener(LANDED_EVENT, callback, { once: true });
  return () => window.removeEventListener(LANDED_EVENT, callback);
}
