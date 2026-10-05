import { describe, it, expect } from 'vitest';
import { buildSchedule, cycleLength, phaseRanges, stepOf, type StepId } from './canvasSchedule';

const schedule = buildSchedule();

describe('ciclo del lienzo', () => {
  it('sigue el orden: aparece, toma y coloca cuatro nodos, corre el pulso, descansa y cierra', () => {
    const expected: StepId[] = [
      'fadeIn',
      'approach',
      'take1',
      'move1',
      'snap1',
      'take2',
      'move2',
      'snap2',
      'take3',
      'move3',
      'snap3',
      'take4',
      'move4',
      'snap4',
      'settle',
      'flow',
      'tail',
      'rest',
      'fadeOut',
    ];
    expect(schedule.map((step) => step.id)).toEqual(expected);
  });

  it('cada paso empieza cuando termina el anterior, salvo el fundido inicial y el acercamiento', () => {
    const rest = schedule.slice(2);
    rest.slice(1).forEach((step, index) => {
      const previous = rest[index];
      expect(step.at).toBeCloseTo(previous.at + previous.duration);
    });
    expect(stepOf(schedule, 'fadeIn').at).toBe(0);
    expect(stepOf(schedule, 'take1').at).toBeCloseTo(
      stepOf(schedule, 'approach').at + stepOf(schedule, 'approach').duration,
    );
  });

  it('el ciclo dura cerca de 10 s', () => {
    expect(cycleLength(schedule)).toBeGreaterThan(9.4);
    expect(cycleLength(schedule)).toBeLessThan(10.4);
  });

  it('las fases duran unos 1.2 s, 3.4 s, 3.2 s y 1.4 s', () => {
    const { disorder, settle, flow, pause } = phaseRanges(schedule);
    expect(disorder[1] - disorder[0]).toBeCloseTo(1.2);
    expect(settle[1] - settle[0]).toBeCloseTo(3.4);
    expect(flow[1] - flow[0]).toBeGreaterThan(2.8);
    expect(flow[1] - flow[0]).toBeLessThan(3.4);
    expect(pause[1] - pause[0]).toBeGreaterThanOrEqual(1.2);
  });

  it('las fases van en orden y no se pisan', () => {
    const { disorder, settle, flow, pause } = phaseRanges(schedule);
    expect(settle[0]).toBeCloseTo(disorder[1]);
    expect(flow[0]).toBeCloseTo(settle[1]);
    expect(pause[0]).toBeCloseTo(flow[1]);
  });

  it('cada nodo se toma, se arrastra y se suelta en ese orden, y el siguiente espera al anterior', () => {
    for (const node of [1, 2, 3, 4] as const) {
      const take = stepOf(schedule, `take${node}`);
      const move = stepOf(schedule, `move${node}`);
      const snap = stepOf(schedule, `snap${node}`);
      expect(move.at).toBeCloseTo(take.at + take.duration);
      expect(snap.at).toBeCloseTo(move.at + move.duration);
    }
    expect(stepOf(schedule, 'take2').at).toBeGreaterThanOrEqual(
      stepOf(schedule, 'snap1').at + stepOf(schedule, 'snap1').duration - 1e-9,
    );
  });

  it('el pulso corre a velocidad constante durante más de 2 s', () => {
    expect(stepOf(schedule, 'flow').duration).toBeGreaterThan(2);
  });

  it('pide un paso que no existe y falla', () => {
    expect(() => stepOf(schedule, 'nope' as StepId)).toThrow();
  });
});
