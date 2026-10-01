import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { COOLDOWN_MS, MIN_FILL_MS, RATE_LIMIT_KEY, isCoolingDown, isTooFast, markSent } from './antiSpam';
import { stubLocalStorage } from './storageStub';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('isTooFast', () => {
  it('es verdadero antes de 3 s desde el montaje y falso al llegar a 3 s', () => {
    const mountedAt = Date.now();

    vi.advanceTimersByTime(MIN_FILL_MS - 1);
    expect(isTooFast(mountedAt)).toBe(true);

    vi.advanceTimersByTime(1);
    expect(isTooFast(mountedAt)).toBe(false);
  });
});

describe('enfriamiento', () => {
  it('no bloquea cuando nunca se envio un mensaje', () => {
    stubLocalStorage();

    expect(isCoolingDown()).toBe(false);
  });

  it('bloquea durante 60 s despues de markSent y se libera al cumplirse', () => {
    const storage = stubLocalStorage();

    markSent();
    expect(storage.getItem(RATE_LIMIT_KEY)).toBe(String(Date.now()));

    vi.advanceTimersByTime(COOLDOWN_MS - 1);
    expect(isCoolingDown()).toBe(true);

    vi.advanceTimersByTime(1);
    expect(isCoolingDown()).toBe(false);
  });

  it('ignora un valor guardado que no es un numero', () => {
    stubLocalStorage().setItem(RATE_LIMIT_KEY, 'no-es-numero');

    expect(isCoolingDown()).toBe(false);
  });

  it('degrada sin bloquear ni lanzar cuando localStorage no existe', () => {
    vi.stubGlobal('localStorage', undefined);

    expect(isCoolingDown()).toBe(false);
    expect(() => markSent()).not.toThrow();
  });

  it('degrada sin lanzar cuando localStorage falla al leer o escribir', () => {
    const failing = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
    };
    vi.stubGlobal('localStorage', failing);

    expect(isCoolingDown()).toBe(false);
    expect(() => markSent()).not.toThrow();
  });
});
