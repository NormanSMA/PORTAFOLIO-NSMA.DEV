import { afterEach } from 'vitest';

// The language lives in the URL: a test that switches to /en must not leak it into the next one.
afterEach(() => {
  window.history.replaceState(null, '', '/');
});
