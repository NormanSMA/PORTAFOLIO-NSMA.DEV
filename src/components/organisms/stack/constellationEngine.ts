import { gsap } from '../../../lib/gsap';
import {
  clamp,
  estimateVelocity,
  FULL_TURN,
  relaxVelocity,
  trackSample,
  type AngleSample,
} from './constellationMath';

export interface EngineOptions {
  // Idle spin in degrees per second; the engine eases back to it after a drag or a pause.
  idleSpeed: number;
  degreesPerPixel: number;
  reducedMotion: boolean;
  onFrame: (yaw: number) => void;
  onDragStart: () => void;
  onTap: (target: EventTarget | null, pointerType: string) => void;
}

interface DragState {
  pointerId: number;
  startX: number;
  lastX: number;
  engaged: boolean;
  samples: AngleSample[];
}

const DRAG_THRESHOLD_PX = 4;
const MIN_FLING_DEGREES_PER_SECOND = 20;
const MAX_FLING_DEGREES_PER_SECOND = 720;
const MAX_FRAME_SECONDS = 1 / 30;
const REST_SPEED = 0.05;
// Yaw at rest: turned a little so the first view is not a perfectly symmetric front.
const INITIAL_YAW = 20;

// Plain closure state, like the projects ring: the sphere moves every frame and must not go through React.
export function createConstellationEngine(getOptions: () => EngineOptions) {
  let yaw = INITIAL_YAW;
  let velocity = 0;
  let paused = false;
  let visible = false;
  let dragging = false;
  let running = false;
  let drag: DragState | null = null;

  const targetSpeed = () => {
    const { idleSpeed, reducedMotion } = getOptions();
    return paused || reducedMotion ? 0 : idleSpeed;
  };

  // No frames while hidden, dragging (pointer events draw) or settled: a still sphere costs nothing.
  const needsFrames = () =>
    visible && !dragging && !getOptions().reducedMotion && (targetSpeed() !== 0 || Math.abs(velocity) > REST_SPEED);

  const publish = () => getOptions().onFrame(yaw);

  const tick = (_time: number, deltaMs: number) => {
    const seconds = Math.min(deltaMs / 1000, MAX_FRAME_SECONDS);
    velocity = relaxVelocity(velocity, targetSpeed(), seconds);
    yaw = (yaw + velocity * seconds) % FULL_TURN;
    publish();
    if (needsFrames()) return;
    if (targetSpeed() === 0) velocity = 0;
    detach();
  };

  function attach() {
    if (running) return;
    running = true;
    gsap.ticker.add(tick);
  }

  function detach() {
    if (!running) return;
    running = false;
    gsap.ticker.remove(tick);
  }

  const sync = () => (needsFrames() ? attach() : detach());

  const engage = (event: PointerEvent, state: DragState) => {
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    state.engaged = true;
    state.lastX = event.clientX;
    state.samples = [{ time: event.timeStamp, angle: yaw }];
    velocity = 0;
    dragging = true;
    detach();
    getOptions().onDragStart();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (drag || (event.pointerType === 'mouse' && event.button !== 0)) return;
    drag = { pointerId: event.pointerId, startX: event.clientX, lastX: event.clientX, engaged: false, samples: [] };
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!drag.engaged) {
      if (Math.abs(event.clientX - drag.startX) < DRAG_THRESHOLD_PX) return;
      engage(event, drag);
    }
    yaw = (yaw + (event.clientX - drag.lastX) * getOptions().degreesPerPixel) % FULL_TURN;
    drag.lastX = event.clientX;
    drag.samples = trackSample(drag.samples, { time: event.timeStamp, angle: yaw });
    publish();
  };

  const finishDrag = (event: PointerEvent, withInertia: boolean) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const finished = drag;
    drag = null;
    dragging = false;
    if (!finished.engaged) {
      if (withInertia) getOptions().onTap(event.target, event.pointerType);
      return;
    }
    const flick = withInertia && !getOptions().reducedMotion ? estimateVelocity(finished.samples, event.timeStamp) : 0;
    velocity =
      Math.abs(flick) < MIN_FLING_DEGREES_PER_SECOND
        ? 0
        : clamp(flick, -MAX_FLING_DEGREES_PER_SECOND, MAX_FLING_DEGREES_PER_SECOND);
    sync();
  };

  const setVisible = (next: boolean) => {
    visible = next;
    sync();
  };

  const setPaused = (next: boolean) => {
    paused = next;
    sync();
  };

  // Redraws the current pose: the layout or the reduced-motion preference changed.
  const refresh = () => {
    if (getOptions().reducedMotion) velocity = 0;
    publish();
    sync();
  };

  const dispose = () => {
    detach();
    drag = null;
  };

  return {
    setVisible,
    setPaused,
    refresh,
    dispose,
    pointerHandlers: {
      pointerdown: onPointerDown,
      pointermove: onPointerMove,
      pointerup: (event: PointerEvent) => finishDrag(event, true),
      pointercancel: (event: PointerEvent) => finishDrag(event, false),
      lostpointercapture: (event: PointerEvent) => finishDrag(event, false),
    },
  };
}
