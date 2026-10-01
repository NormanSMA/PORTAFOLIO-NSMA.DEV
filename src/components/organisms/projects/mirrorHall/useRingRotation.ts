import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';
import { gsap } from '../../../../lib/gsap';
import {
  activeIndexFor,
  clamp,
  estimateVelocity,
  isSettled,
  shortestRotation,
  stepSpring,
  trackSample,
  wheelDelta,
  wrapIndex,
  type AngleSample,
} from './ringMath';

export type RingPhase = 'idle' | 'dragging' | 'settling';

interface EngineOptions {
  count: number;
  degreesPerPixel: number;
  reducedMotion: boolean;
  onFrame: (angle: number) => void;
  onActiveChange: (index: number) => void;
  onPhaseChange: (phase: RingPhase) => void;
}

interface DragState {
  pointerId: number;
  startX: number;
  lastX: number;
  engaged: boolean;
  samples: AngleSample[];
}

type StagePointerEvent = PointerEvent<HTMLElement>;

const DRAG_THRESHOLD_PX = 4;
// The release velocity is projected this far ahead; the spring then eases the ring out to that point.
const COAST_SECONDS = 0.4;
const MIN_FLING_DEGREES_PER_SECOND = 20;
const MAX_FLING_DEGREES_PER_SECOND = 1200;
const MAX_FRAME_SECONDS = 1 / 30;

// Plain closure state: the ring moves every frame and must not go through React renders.
function createRingEngine(getOptions: () => EngineOptions) {
  let angle = 0;
  let target = 0;
  let velocity = 0;
  let active = 0;
  let pinned = false;
  let visible = true;
  let running = false;
  let phase: RingPhase = 'idle';
  let drag: DragState | null = null;

  const setPhase = (next: RingPhase) => {
    if (next === phase) return;
    phase = next;
    getOptions().onPhaseChange(next);
  };

  const setActive = (index: number) => {
    if (index === active) return;
    active = index;
    getOptions().onActiveChange(index);
  };

  // While a goTo is pinned the active card is the requested one, not whichever passes the front on the way.
  const publish = () => {
    getOptions().onFrame(angle);
    if (!pinned) setActive(activeIndexFor(angle, getOptions().count));
  };

  const tick = (_time: number, deltaTime: number) => {
    const next = stepSpring({ angle, velocity }, target, Math.min(deltaTime / 1000, MAX_FRAME_SECONDS));
    angle = next.angle;
    velocity = next.velocity;
    if (isSettled(next, target)) settle();
    publish();
  };

  const attach = () => {
    if (running) return;
    running = true;
    gsap.ticker.add(tick);
  };

  const detach = () => {
    if (!running) return;
    running = false;
    gsap.ticker.remove(tick);
  };

  function settle() {
    angle = target;
    velocity = 0;
    detach();
    setPhase('idle');
  }

  const beginSpring = () => {
    if (!visible) {
      settle();
      publish();
      return;
    }
    setPhase('settling');
    attach();
  };

  const freeze = () => {
    if (phase !== 'settling') return;
    detach();
    target = angle;
    velocity = 0;
    pinned = false;
    setPhase('idle');
    publish();
  };

  const jumpBy = (degrees: number) => {
    angle += degrees;
    target = angle;
    velocity = 0;
    publish();
  };

  const goTo = (index: number) => {
    const { count, reducedMotion } = getOptions();
    if (count === 0) return;
    const next = wrapIndex(index, count);
    pinned = true;
    setActive(next);
    target = shortestRotation(angle, next, count);
    if (!reducedMotion) {
      beginSpring();
      return;
    }
    settle();
    publish();
  };

  const stepBy = (delta: number) => {
    const next = wrapIndex(active + delta, getOptions().count);
    goTo(next);
    return next;
  };

  const handleWheel = (event: WheelEvent) => {
    const amount = wheelDelta(event);
    if (amount === 0 || drag?.engaged) return;
    event.preventDefault();
    const { degreesPerPixel, reducedMotion } = getOptions();
    pinned = false;
    if (reducedMotion) {
      jumpBy(-amount * degreesPerPixel);
      return;
    }
    target += -amount * degreesPerPixel;
    beginSpring();
  };

  const engageDrag = (event: StagePointerEvent, state: DragState) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    state.engaged = true;
    state.lastX = event.clientX;
    state.samples = [{ time: event.timeStamp, angle }];
    pinned = false;
    setPhase('dragging');
  };

  const onPointerDown = (event: StagePointerEvent) => {
    if (drag || (event.pointerType === 'mouse' && event.button !== 0)) return;
    drag = { pointerId: event.pointerId, startX: event.clientX, lastX: event.clientX, engaged: false, samples: [] };
    freeze();
  };

  const onPointerMove = (event: StagePointerEvent) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!drag.engaged) {
      if (Math.abs(event.clientX - drag.startX) < DRAG_THRESHOLD_PX) return;
      engageDrag(event, drag);
    }
    jumpBy((event.clientX - drag.lastX) * getOptions().degreesPerPixel);
    drag.lastX = event.clientX;
    drag.samples = trackSample(drag.samples, { time: event.timeStamp, angle });
  };

  const endDrag = (event: StagePointerEvent, withInertia: boolean) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const finished = drag;
    drag = null;
    if (!finished.engaged) return;
    const flick = withInertia && !getOptions().reducedMotion ? estimateVelocity(finished.samples, event.timeStamp) : 0;
    if (Math.abs(flick) < MIN_FLING_DEGREES_PER_SECOND) {
      setPhase('idle');
      return;
    }
    velocity = clamp(flick, -MAX_FLING_DEGREES_PER_SECOND, MAX_FLING_DEGREES_PER_SECOND);
    target = angle + velocity * COAST_SECONDS;
    beginSpring();
  };

  const refresh = () => {
    const { count } = getOptions();
    if (count > 0 && active >= count) {
      angle = 0;
      target = 0;
      velocity = 0;
      pinned = false;
      detach();
      setPhase('idle');
      setActive(0);
    }
    publish();
  };

  const setVisible = (next: boolean) => {
    visible = next;
    if (!next && phase === 'settling') {
      settle();
      publish();
    }
  };

  const dispose = () => {
    detach();
    drag = null;
  };

  return {
    goTo,
    stepBy,
    refresh,
    setVisible,
    dispose,
    handleWheel,
    stageProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event: StagePointerEvent) => endDrag(event, true),
      onPointerCancel: (event: StagePointerEvent) => endDrag(event, false),
      // Touch pointers are implicitly captured by the card under the finger; the capture handoff to the
      // stage fires this event on that card and it bubbles up, so only the stage's own event counts.
      onLostPointerCapture: (event: StagePointerEvent) => {
        if (event.target === event.currentTarget) endDrag(event, false);
      },
    },
  };
}

interface RingRotationOptions extends EngineOptions {
  stageRef: RefObject<HTMLElement | null>;
}

export function useRingRotation({ stageRef, ...options }: RingRotationOptions) {
  const optionsRef = useRef<EngineOptions>(options);
  useLayoutEffect(() => {
    optionsRef.current = options;
  });
  const [engine] = useState(() => createRingEngine(() => optionsRef.current));

  useEffect(() => () => engine.dispose(), [engine]);

  // React registers wheel as passive; preventDefault for horizontal scroll needs a native listener.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.addEventListener('wheel', engine.handleWheel, { passive: false });
    return () => stage.removeEventListener('wheel', engine.handleWheel);
  }, [engine, stageRef]);

  return engine;
}
