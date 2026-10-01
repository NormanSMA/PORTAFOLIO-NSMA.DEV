import { describe, it, expect, vi } from 'vitest';

// ScrollTrigger calls window.matchMedia while registering, so the stub must exist before the imports run.
const media = vi.hoisted(() => {
  const state = { matching: [] as string[] };
  window.matchMedia = ((query: string) => ({
    matches: state.matching.includes(query),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  })) as unknown as typeof window.matchMedia;
  return state;
});

import { renderHook } from '@testing-library/react';
import { motion } from '../config/motion';
import { useMotion, type MotionConditions } from './useMotion';

describe('useMotion', () => {
  it('entrega a setup las cuatro condiciones de motion.media', () => {
    media.matching = [motion.media.noReducedMotion, motion.media.desktop];
    const scope = { current: document.createElement('div') };
    const setup = vi.fn<(conditions: MotionConditions) => void>();

    renderHook(() => useMotion(scope, setup));

    expect(setup).toHaveBeenCalledTimes(1);
    expect(setup.mock.calls[0][0]).toEqual({
      noReducedMotion: true,
      finePointer: false,
      desktop: true,
      mobile: false,
    });
  });

  it('ejecuta la limpieza de setup al desmontar', () => {
    media.matching = [motion.media.noReducedMotion];
    const scope = { current: document.createElement('div') };
    const cleanup = vi.fn();

    const { unmount } = renderHook(() => useMotion(scope, () => cleanup));
    expect(cleanup).not.toHaveBeenCalled();

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
