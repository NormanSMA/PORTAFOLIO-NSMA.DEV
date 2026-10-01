import type { RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { motion } from '../config/motion';
import { gsap } from '../lib/gsap';

export type MotionConditions = Record<keyof typeof motion.media, boolean>;

type MotionSetup = (conditions: MotionConditions) => void | (() => void);

// The setup runs once per dependency change: list every reactive value it reads.
// The matchMedia is reverted explicitly so cleanup does not rely on useGSAP and gsap
// resolving to the same module copy (they do not under Vitest).
export function useMotion(
  scope: RefObject<Element | null>,
  setup: MotionSetup,
  dependencies: unknown[] = [],
) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motion.media, (context) => setup(context.conditions as MotionConditions));
      return () => mm.revert();
    },
    { scope, dependencies, revertOnUpdate: true },
  );
}
