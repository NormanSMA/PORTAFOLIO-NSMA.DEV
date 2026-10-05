import { describe, it, expect } from 'vitest';
import {
  CYCLE_JOIN,
  buildIntroSchedule,
  buildSchedule,
  cycleLength,
  introLength,
  introStepOf,
  phaseRanges,
  stepOf,
  type IntroStepId,
  type StepId,
} from './canvasSchedule';

const schedule = buildSchedule();
const intro = buildIntroSchedule();

describe('ciclo del lienzo', () => {
  it('sigue el orden: aparece, el cursor viaja y coloca cuatro nodos, corre el pulso, descansa y cierra', () => {
    const expected: StepId[] = [
      'fadeIn',
      'approach',
      'take1',
      'move1',
      'snap1',
      'travel2',
      'take2',
      'move2',
      'snap2',
      'travel3',
      'take3',
      'move3',
      'snap3',
      'travel4',
      'take4',
      'move4',
      'snap4',
      'relax',
      'flow',
      'tail',
      'rest',
      'fadeOut',
    ];
    expect(schedule.map((step) => step.id)).toEqual(expected);
  });

  it('cada paso empieza cuando termina el anterior', () => {
    schedule.slice(1).forEach((step, index) => {
      const previous = schedule[index];
      expect(step.at).toBeCloseTo(previous.at + previous.duration);
    });
    expect(stepOf(schedule, 'fadeIn').at).toBe(0);
  });

  it('el ciclo es muy lento: dura entre 22 y 26 s', () => {
    expect(cycleLength(schedule)).toBeGreaterThanOrEqual(22);
    expect(cycleLength(schedule)).toBeLessThanOrEqual(26);
  });

  it('el acomodo dura al menos 9 s y el pulso al menos 5 s', () => {
    const { settle } = phaseRanges(schedule);
    expect(settle[1] - settle[0]).toBeGreaterThanOrEqual(9);
    expect(stepOf(schedule, 'flow').duration).toBeGreaterThanOrEqual(5);
  });

  it('las fases duran unos 2 s, 10 s, 8 s y 3 s', () => {
    const { disorder, settle, flow, pause } = phaseRanges(schedule);
    expect(disorder[1] - disorder[0]).toBeGreaterThanOrEqual(2);
    expect(disorder[1] - disorder[0]).toBeLessThanOrEqual(2.4);
    expect(settle[1] - settle[0]).toBeGreaterThanOrEqual(9.5);
    expect(settle[1] - settle[0]).toBeLessThanOrEqual(10.5);
    expect(flow[1] - flow[0]).toBeCloseTo(8);
    expect(pause[1] - pause[0]).toBeCloseTo(3);
  });

  it('las fases van en orden y no se pisan', () => {
    const { disorder, settle, flow, pause } = phaseRanges(schedule);
    expect(settle[0]).toBeCloseTo(disorder[1]);
    expect(flow[0]).toBeCloseTo(settle[1]);
    expect(pause[0]).toBeCloseTo(flow[1]);
  });

  it('cada nodo se toma, se arrastra y se suelta en ese orden, y el siguiente viaja después', () => {
    for (const node of [1, 2, 3, 4] as const) {
      const take = stepOf(schedule, `take${node}`);
      const move = stepOf(schedule, `move${node}`);
      const snap = stepOf(schedule, `snap${node}`);
      expect(move.at).toBeCloseTo(take.at + take.duration);
      expect(snap.at).toBeCloseTo(move.at + move.duration);
    }
    const travel = stepOf(schedule, 'travel2');
    expect(travel.at).toBeCloseTo(stepOf(schedule, 'snap1').at + stepOf(schedule, 'snap1').duration);
    expect(travel.duration).toBeGreaterThanOrEqual(1);
  });

  it('el arrastre y el viaje del cursor son lentos: casi un segundo o más', () => {
    for (const node of [1, 2, 3, 4] as const) {
      expect(stepOf(schedule, `move${node}`).duration).toBeGreaterThanOrEqual(0.9);
    }
  });

  it('la primera vez el ciclo entra justo cuando termina su propio fundido', () => {
    expect(CYCLE_JOIN).toBeCloseTo(stepOf(schedule, 'fadeIn').duration);
    expect(stepOf(schedule, 'approach').at).toBeCloseTo(CYCLE_JOIN);
  });

  it('pide un paso que no existe y falla', () => {
    expect(() => stepOf(schedule, 'nope' as StepId)).toThrow();
  });
});

describe('intro del lienzo', () => {
  it('sigue el orden: marco, puntos, guías, nodos, manijas, curva y pausa', () => {
    expect(intro.map((step) => step.id)).toEqual<IntroStepId[]>([
      'frame',
      'dots',
      'guides',
      'nodes',
      'handles',
      'curve',
      'hold',
    ]);
  });

  it('el marco se dibuja en 2.4 s y los nodos entran después de que termina', () => {
    const frame = introStepOf(intro, 'frame');
    expect(frame.at).toBe(0);
    expect(frame.duration).toBeGreaterThanOrEqual(2.4);
    expect(introStepOf(intro, 'nodes').at).toBeGreaterThanOrEqual(frame.at + frame.duration);
  });

  it('la ola de puntos y las guías empiezan mientras se dibuja el marco', () => {
    const frame = introStepOf(intro, 'frame');
    for (const id of ['dots', 'guides'] as const) {
      const step = introStepOf(intro, id);
      expect(step.at).toBeGreaterThan(0);
      expect(step.at).toBeLessThan(frame.at + frame.duration);
    }
  });

  it('los nodos aparecen y la curva se dibuja entre 2.4 s y 4.4 s, despacio', () => {
    const nodes = introStepOf(intro, 'nodes');
    const curve = introStepOf(intro, 'curve');
    expect(nodes.at).toBeCloseTo(2.4);
    expect(curve.at).toBeGreaterThanOrEqual(nodes.at);
    expect(curve.at + curve.duration).toBeCloseTo(4.4);
    expect(curve.duration).toBeGreaterThanOrEqual(1.5);
  });

  it('el intro dura entre 4.4 s y 6 s', () => {
    expect(introLength(intro)).toBeGreaterThanOrEqual(4.4);
    expect(introLength(intro)).toBeLessThanOrEqual(6);
  });

  it('pide un paso que no existe y falla', () => {
    expect(() => introStepOf(intro, 'nope' as IntroStepId)).toThrow();
  });
});
