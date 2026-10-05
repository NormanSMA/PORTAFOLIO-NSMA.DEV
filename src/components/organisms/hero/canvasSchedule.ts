// Two schedules in seconds. The intro plays once, when the page loads: the artboard draws itself and the nodes appear out
// of order. The cycle then loops for good, very slowly: the nodes appear in a mess, the pen puts each one on its grid
// point, a pulse of light runs along the curve, and a pause. The fade that closes the cycle hides the jump back to the mess.
export type NodeNumber = 1 | 2 | 3 | 4;
export type NodeStepId = `${'take' | 'move' | 'snap'}${NodeNumber}`;
export type TravelStepId = `travel${2 | 3 | 4}`;
export type StepId =
  | 'fadeIn'
  | 'approach'
  | NodeStepId
  | TravelStepId
  | 'relax'
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

const FADE_IN = 1;
const APPROACH = 1.1;
// Each node: the pen travels to it, takes it, drags it to its grid point, and releases it with a soft snap.
const TRAVEL = 1.1;
const TAKE = 0.3;
const MOVE = 1;
const SNAP = 0.4;
// The pen leaves and the handles step back before the pulse starts.
const RELAX = 1;
// One constant-speed pass: the nodes and their labels light exactly when the pulse crosses them.
const FLOW = 6;
const TAIL = 1;
const REST = 3;
const FADE_OUT = 1.2;

// The first run joins the cycle here: the content is already on screen and the pen is about to enter.
export const CYCLE_JOIN = FADE_IN;

export function buildSchedule(): Step[] {
  const steps: Step[] = [{ id: 'fadeIn', at: 0, duration: FADE_IN }];
  let clock = FADE_IN;

  const push = (id: StepId, duration: number) => {
    steps.push({ id, at: clock, duration });
    clock += duration;
  };

  push('approach', APPROACH);
  NODE_NUMBERS.forEach((node) => {
    if (node > 1) push(`travel${node as 2 | 3 | 4}`, TRAVEL);
    push(`take${node}`, TAKE);
    push(`move${node}`, MOVE);
    push(`snap${node}`, SNAP);
  });
  push('relax', RELAX);
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
    flow: [start('relax'), end('tail')],
    pause: [start('rest'), end('rest')],
  };
}

export type IntroStepId = 'frame' | 'dots' | 'guides' | 'nodes' | 'handles' | 'curve' | 'hold';

export interface IntroStep {
  id: IntroStepId;
  at: number;
  duration: number;
}

// The frame draws itself and its four corners appear as the line reaches them. The dots light in a wave from the center
// and the guides slide in while that happens. Then the nodes fade in out of order and the irregular curve is drawn through them.
export function buildIntroSchedule(): IntroStep[] {
  return [
    { id: 'frame', at: 0, duration: 2.4 },
    { id: 'dots', at: 0.5, duration: 1.9 },
    { id: 'guides', at: 1, duration: 1.4 },
    { id: 'nodes', at: 2.4, duration: 1.9 },
    { id: 'handles', at: 2.6, duration: 1.4 },
    { id: 'curve', at: 2.8, duration: 1.6 },
    { id: 'hold', at: 4.4, duration: 0.6 },
  ];
}

export function introStepOf(steps: readonly IntroStep[], id: IntroStepId): IntroStep {
  const step = steps.find((candidate) => candidate.id === id);
  if (!step) throw new Error(`Unknown intro step ${id}`);
  return step;
}

export function introLength(steps: readonly IntroStep[]): number {
  return Math.max(...steps.map((step) => step.at + step.duration));
}
