import { vi } from 'vitest';

// Node 22+ exposes a global localStorage getter that shadows the jsdom one and returns undefined
// without --localstorage-file, so tests install an in-memory Storage instead.
export function stubLocalStorage(): Storage {
  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, String(value)),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;

  vi.stubGlobal('localStorage', storage);
  return storage;
}
