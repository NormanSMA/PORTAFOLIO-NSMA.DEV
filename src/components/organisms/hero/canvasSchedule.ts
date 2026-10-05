// The cycle in seconds. Four phases: nodes appear out of order, the pen puts each one on its grid point,
// a pulse of light runs along the curve, and a pause. The fade that closes the cycle hides the jump back to the mess.
export type NodeNumber = 1 | 2 | 3 | 4;
export type NodeStepId = `${'take' | 'move' | 'snap'}${NodeNumber}`;
export type StepId =
  | 'fadeIn'
  | 'approach'
  | NodeStepId
  | 'settle'
  | 'flow'
  | 'tail'
  | 'rest'
  | 'fadeOut';

export interface Step {
  id: StepId;
  at: number;
  duration: number;
}

export type PhaseId = 'disorder' | 'settle' | 'flow' | 'pause';

export const NODE_NUMBERS: readonly NodeNumber[] = [1, 2, 3, 4];

const FADE_IN = 0.35;
const APPROACH_AT = 0.6;
const APPROACH = 0.6;
// Each node: the pen reaches it and takes it, drags it to its grid point, and releases it with a snap.
const TAKE = 0.25;
const MOVE = 0.5;
const SNAP = 0.1;
const SETTLE = 0.3;
// One constant-speed pass: the nodes light exactly when the pulse crosses them.
const FLOW = 2.6;
const TAIL = 0.3;
const REST = 1.4;
const FADE_OUT = 0.4;

const SEQUENCE_BEFORE_NODES: readonly Step[] = [
  { id: 'fadeIn', at: 0, duration: FADE_IN },
  { id: 'approach', at: APPROACH_AT, duration: APPROACH },
];

// The fade-in overlaps the approach, so the pen enters while the scene appears.
export function buildSchedule(): Step[] {
  const steps: Step[] = [...SEQUENCE_BEFORE_NODES];
  let clock = APPROACH_AT + APPROACH;

  const push = (id: StepId, duration: number) => {
    steps.push({ id, at: clock, duration });
    clock += duration;
  };

  NODE_NUMBERS.forEach((node) => {
    push(`take${node}`, TAKE);
    push(`move${node}`, MOVE);
    push(`snap${node}`, SNAP);
  });
  push('settle', SETTLE);
  push('flow', FLOW);
  push('tail', TAIL);
  push('rest', REST);
  push('fadeOut', FADE_OUT);
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
    disorder: [0, start('take1')],
    settle: [start('take1'), end('snap4')],
    flow: [start('settle'), end('tail')],
    pause: [start('rest'), end('rest')],
  };
}
