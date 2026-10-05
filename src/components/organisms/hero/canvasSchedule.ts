// The cycle in seconds. Three phases: draw the curve anchor by anchor, drag two handles to reshape it, show the tokens.
// A pause and a short fade close the loop so the restart is not a cut.
export type StepId =
  | 'fadeIn'
  | 'approach'
  | 'click1'
  | 'leg1'
  | 'click2'
  | 'leg2'
  | 'click3'
  | 'leg3'
  | 'click4'
  | 'reachSecond'
  | 'dragSecond'
  | 'reachThird'
  | 'dragThird'
  | 'tokens'
  | 'hold'
  | 'fadeOut';

export interface Step {
  id: StepId;
  at: number;
  duration: number;
}

export type PhaseId = 'trace' | 'edit' | 'tokens';

const FADE_IN = 0.3;
const APPROACH = 0.6;
const CLICK = 0.4;
// The legs follow the arc length of each segment, so the pen keeps a similar speed along the whole S.
const LEGS = [0.75, 0.95, 0.75] as const;
const REACH_SECOND = 0.7;
const DRAG_SECOND = 0.85;
const REACH_THIRD = 0.5;
const DRAG_THIRD = 0.75;
const TOKENS = 1;
const HOLD = 1.3;
const FADE_OUT = 0.35;

const SEQUENCE: readonly [StepId, number][] = [
  ['approach', APPROACH],
  ['click1', CLICK],
  ['leg1', LEGS[0]],
  ['click2', CLICK],
  ['leg2', LEGS[1]],
  ['click3', CLICK],
  ['leg3', LEGS[2]],
  ['click4', CLICK],
  ['reachSecond', REACH_SECOND],
  ['dragSecond', DRAG_SECOND],
  ['reachThird', REACH_THIRD],
  ['dragThird', DRAG_THIRD],
  ['tokens', TOKENS],
  ['hold', HOLD],
  ['fadeOut', FADE_OUT],
];

// The fade-in overlaps the approach, so the pen enters while the scene appears.
export function buildSchedule(): Step[] {
  let clock = 0;
  const steps: Step[] = [{ id: 'fadeIn', at: 0, duration: FADE_IN }];
  SEQUENCE.forEach(([id, duration]) => {
    steps.push({ id, at: clock, duration });
    clock += duration;
  });
  return steps;
}

export function stepOf(steps: readonly Step[], id: StepId): Step {
  const step = steps.find((candidate) => candidate.id === id);
  if (!step) throw new Error(`Unknown step ${id}`);
  return step;
}

export function cycleLength(steps: readonly Step[]): number {
  return Math.max(...steps.map((step) => step.at + step.duration));
}

// Start and end of each phase, for the audit of the cycle and for the tests.
export function phaseRanges(steps: readonly Step[]): Record<PhaseId, [number, number]> {
  const start = (id: StepId) => stepOf(steps, id).at;
  const end = (id: StepId) => stepOf(steps, id).at + stepOf(steps, id).duration;
  return {
    trace: [start('approach'), end('click4')],
    edit: [start('reachSecond'), end('dragThird')],
    tokens: [start('tokens'), end('tokens')],
  };
}
