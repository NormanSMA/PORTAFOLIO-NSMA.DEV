export const COOLDOWN_MS = 60_000;
export const MIN_FILL_MS = 3_000;
export const RATE_LIMIT_KEY = 'nsma-contact-last-sent';

function readLastSentAt(): number | null {
  try {
    const raw = window.localStorage.getItem(RATE_LIMIT_KEY);
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function markSent(): void {
  try {
    window.localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
  } catch {
    // localStorage no disponible (modo privado); el honeypot sigue activo
  }
}

export function isCoolingDown(): boolean {
  const lastSentAt = readLastSentAt();
  return lastSentAt !== null && lastSentAt !== 0 && Date.now() - lastSentAt < COOLDOWN_MS;
}

// A person needs a few seconds to fill the form; a bot posts the moment it mounts.
export function isTooFast(mountedAt: number): boolean {
  return Date.now() - mountedAt < MIN_FILL_MS;
}
