import { describe, it, expect } from 'vitest';
import {
  labelOpacity,
  MAX_LABELS,
  MIN_LABEL_DEPTH,
  overlaps,
  pickLabels,
  placeLabel,
  STICKY_DEPTH,
  type Box,
  type LabelCandidate,
  type LabelPlacement,
} from './constellationLabels';

const SQUARE = 400;
const CHIP = 48;
const NAME = { width: 70, height: 18 };

const chipAt = (centerX: number, centerY: number): Box => ({
  left: centerX - CHIP / 2,
  top: centerY - CHIP / 2,
  width: CHIP,
  height: CHIP,
});

const candidate = (index: number, depth: number, centerX: number, centerY: number): LabelCandidate => ({
  index,
  depth,
  chip: chipAt(centerX, centerY),
  size: NAME,
});

const pick = (
  candidates: LabelCandidate[],
  options: { active?: number; previous?: Map<number, LabelPlacement> } = {},
) => pickLabels({ candidates, bounds: SQUARE, active: options.active ?? -1, previous: options.previous ?? new Map() });

describe('placeLabel', () => {
  it('centra el nombre bajo la ficha', () => {
    const box = placeLabel(chipAt(200, 150), NAME, SQUARE, 'below');
    expect(box.left + box.width / 2).toBe(200);
    expect(box.top).toBeGreaterThan(150 + CHIP / 2);
    expect(box.width).toBe(NAME.width);
  });

  it('puede ponerlo sobre la ficha', () => {
    const chip = chipAt(200, 150);
    const box = placeLabel(chip, NAME, SQUARE, 'above');
    expect(box.top + box.height).toBeLessThanOrEqual(chip.top);
  });

  it('lo corre hacia dentro en los bordes laterales para no cortarlo', () => {
    const left = placeLabel(chipAt(CHIP / 2, 100), NAME, SQUARE, 'below');
    const right = placeLabel(chipAt(SQUARE - CHIP / 2, 100), NAME, SQUARE, 'below');
    expect(left.left).toBeGreaterThanOrEqual(0);
    expect(right.left + right.width).toBeLessThanOrEqual(SQUARE);
  });
});

describe('labelOpacity', () => {
  it('es cero donde la ficha deja de tener nombre y uno para las mas cercanas', () => {
    expect(labelOpacity(MIN_LABEL_DEPTH - STICKY_DEPTH)).toBe(0);
    expect(labelOpacity(0.2)).toBe(0);
    expect(labelOpacity(1)).toBe(1);
  });

  it('crece con la profundidad y se cuantiza', () => {
    expect(labelOpacity(0.7)).toBeLessThan(labelOpacity(0.8));
    expect(labelOpacity(0.8)).toBeLessThanOrEqual(labelOpacity(0.9));
    expect(labelOpacity(0.7)).toBe(labelOpacity(0.701));
  });
});

describe('overlaps', () => {
  it('detecta cajas que se tocan y respeta la separacion pedida', () => {
    const a: Box = { left: 0, top: 0, width: 10, height: 10 };
    expect(overlaps(a, { left: 5, top: 5, width: 10, height: 10 })).toBe(true);
    expect(overlaps(a, { left: 12, top: 0, width: 10, height: 10 })).toBe(false);
    expect(overlaps(a, { left: 12, top: 0, width: 10, height: 10 }, 4)).toBe(true);
  });
});

describe('pickLabels', () => {
  it('nombra las fichas del frente y deja sin nombre las del fondo', () => {
    const picked = pick([candidate(0, 0.95, 100, 100), candidate(1, 0.9, 300, 100), candidate(2, 0.2, 200, 300)]);
    expect([...picked.keys()].sort()).toEqual([0, 1]);
  });

  it('nombra como mucho seis fichas', () => {
    const candidates = Array.from({ length: 10 }, (_, index) =>
      candidate(index, 0.99 - index * 0.01, 40 + (index % 5) * 80, 60 + Math.floor(index / 5) * 160),
    );
    expect(pick(candidates).size).toBe(MAX_LABELS);
  });

  // Near the top edge a name can only go below the chip, so two close chips fight for the same space.
  it('prefiere la ficha mas cercana cuando dos nombres se solaparian', () => {
    const picked = pick([candidate(0, 0.8, 200, 30), candidate(1, 0.95, 215, 30)]);
    expect([...picked.keys()]).toEqual([1]);
  });

  it('pasa el nombre al otro lado de la ficha cuando el primero esta ocupado', () => {
    // Chip 1 sits right over chip 0, so a name under chip 1 would cover chip 0.
    const picked = pick([candidate(0, 0.95, 200, 200), candidate(1, 0.9, 200, 140)]);
    expect(picked.get(0)?.side).toBe('below');
    expect(picked.get(1)?.side).toBe('above');
  });

  it('un nombre no tapa una ficha visible ni se sale del cuadrado', () => {
    const chips = [candidate(0, 0.9, 200, 100), candidate(1, 0.7, 200, 100 + CHIP / 2 + 4 + NAME.height / 2)];
    const picked = pick(chips);
    const named = chips.filter(({ index }) => picked.has(index));

    for (const { index } of named) {
      const placement = picked.get(index) as LabelPlacement;
      expect(placement.box.top).toBeGreaterThanOrEqual(0);
      expect(placement.box.top + placement.box.height).toBeLessThanOrEqual(SQUARE);
      chips
        .filter((other) => other.index !== index)
        .forEach((other) => expect(overlaps(other.chip, placement.box)).toBe(false));
    }
  });

  it('abajo del cuadrado cambia al lado de arriba', () => {
    const picked = pick([candidate(0, 0.95, 200, SQUARE - CHIP / 2)]);
    expect(picked.get(0)?.side).toBe('above');
  });

  it('la ficha activa siempre tiene nombre y quita los que le estorban', () => {
    const picked = pick([candidate(0, 0.95, 200, 30), candidate(1, 0.3, 215, 30)], { active: 1 });
    expect(picked.has(1)).toBe(true);
    expect(picked.has(0)).toBe(false);
  });

  it('la activa no cuenta para el limite', () => {
    const candidates = Array.from({ length: 8 }, (_, index) =>
      candidate(index, 0.99 - index * 0.01, 40 + (index % 4) * 100, 60 + Math.floor(index / 4) * 150),
    );
    const far = candidate(8, 0.1, 200, 380);
    expect(pick([...candidates, far], { active: 8 }).size).toBe(MAX_LABELS + 1);
  });

  it('una ficha que ya tenia nombre lo conserva un poco por debajo del umbral', () => {
    const justBelow = candidate(0, MIN_LABEL_DEPTH - STICKY_DEPTH / 2, 200, 100);
    const before = new Map<number, LabelPlacement>([[0, { side: 'below', box: placeLabel(justBelow.chip, NAME, SQUARE, 'below') }]]);

    expect(pick([justBelow]).size).toBe(0);
    expect(pick([justBelow], { previous: before }).has(0)).toBe(true);
  });

  it('mantiene el lado que tenia mientras siga libre', () => {
    const one = candidate(0, 0.95, 200, 200);
    const before = new Map<number, LabelPlacement>([[0, { side: 'above', box: placeLabel(one.chip, NAME, SQUARE, 'above') }]]);

    expect(pick([one], { previous: before }).get(0)?.side).toBe('above');
    expect(pick([one]).get(0)?.side).toBe('below');
  });
});
