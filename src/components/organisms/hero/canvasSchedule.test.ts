import { describe, it, expect } from 'vitest';
import { buildSchedule, cycleLength, phaseRanges, stepOf, type StepId } from './canvasSchedule';

const schedule = buildSchedule();

describe('ciclo del lienzo', () => {
  it('sigue el orden: aparece, traza cuatro anclajes, edita dos manijas, muestra tokens y cierra', () => {
    const order = schedule.map((step) => step.id);
    const expected: StepId[] = [
      'fadeIn',
      'approach',
      'click1',
      'leg1',
      'click2',
      'leg2',
      'click3',
      'leg3',
      'click4',
      'reachSecond',
      'dragSecond',
      'reachThird',
      'dragThird',
      'tokens',
      'hold',
      'fadeOut',
    ];
    expect(order).toEqual(expected);
  });

  it('cada paso empieza cuando termina el anterior, salvo el fundido inicial', () => {
    const rest = schedule.slice(1);
    rest.slice(1).forEach((step, index) => {
      const previous = rest[index];
      expect(step.at).toBeCloseTo(previous.at + previous.duration);
    });
    expect(stepOf(schedule, 'fadeIn').at).toBe(0);
    expect(stepOf(schedule, 'approach').at).toBe(0);
  });

  it('el ciclo dura cerca de 10 s', () => {
    expect(cycleLength(schedule)).toBeGreaterThan(9.5);
    expect(cycleLength(schedule)).toBeLessThan(10.5);
  });

  it('las fases duran unos 4.5 s, 3 s y 1 s', () => {
    const { trace, edit, tokens } = phaseRanges(schedule);
    expect(trace[1] - trace[0]).toBeGreaterThan(4.2);
    expect(trace[1] - trace[0]).toBeLessThan(4.8);
    expect(edit[1] - edit[0]).toBeGreaterThan(2.6);
    expect(edit[1] - edit[0]).toBeLessThan(3.2);
    expect(tokens[1] - tokens[0]).toBeCloseTo(1);
  });

  it('las fases no se pisan y la pausa final pasa de 1 s', () => {
    const { trace, edit, tokens } = phaseRanges(schedule);
    expect(edit[0]).toBeCloseTo(trace[1]);
    expect(tokens[0]).toBeCloseTo(edit[1]);
    expect(stepOf(schedule, 'hold').duration).toBeGreaterThanOrEqual(1.2);
  });

  it('pide un paso que no existe y falla', () => {
    expect(() => stepOf(schedule, 'nope' as StepId)).toThrow();
  });
});
