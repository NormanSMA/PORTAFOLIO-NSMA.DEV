import { describe, it, expect } from 'vitest';
import { computeLayout } from './ringLayout';
import { RADIANS_PER_DEGREE, TILT_DEGREES } from './ringMath';

const widths = [320, 375, 768, 1024, 1440];

describe('computeLayout: tarjeta horizontal', () => {
  it('llega a 440 px en escritorio y a 230 px con 375 px de pantalla', () => {
    expect(computeLayout(1440, 7).cardWidth).toBe(440);
    expect(computeLayout(1200, 7).cardWidth).toBe(440);
    expect(computeLayout(375, 7).cardWidth).toBe(230);
  });

  it('crece con la pantalla y nunca baja de 200 px', () => {
    const sizes = widths.map((width) => computeLayout(width, 7).cardWidth);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(computeLayout(320, 7).cardWidth).toBeGreaterThanOrEqual(200);
    expect(computeLayout(100, 7).cardWidth).toBe(200);
  });

  it('la imagen conserva la relacion 16:10 y el pie suma a la altura de la tarjeta', () => {
    for (const width of widths) {
      const { cardWidth, cardHeight, imageHeight, footerHeight } = computeLayout(width, 7);
      expect(imageHeight / cardWidth, `width ${width}`).toBeCloseTo(10 / 16, 2);
      expect(footerHeight).toBeGreaterThanOrEqual(56);
      expect(footerHeight).toBeLessThanOrEqual(64);
      expect(cardHeight).toBe(imageHeight + footerHeight);
    }
  });

  it('las medidas son enteras y pares para que el frente caiga sobre pixeles', () => {
    for (const width of widths) {
      const { cardWidth, imageHeight, footerHeight, stageHeight } = computeLayout(width, 7);
      for (const value of [cardWidth, imageHeight, footerHeight, stageHeight]) {
        expect(value % 2, `width ${width}`).toBe(0);
      }
    }
  });

  it('la tarjeta queda centrada en la pantalla', () => {
    for (const width of widths) {
      const { cardLeft, cardWidth } = computeLayout(width, 7);
      expect(Math.abs(cardLeft * 2 + cardWidth - width)).toBeLessThanOrEqual(1);
    }
  });
});

describe('computeLayout: anillo', () => {
  it('las tarjetas vecinas no se cruzan de 3 a 12 tarjetas', () => {
    for (const width of widths) {
      for (let count = 3; count <= 12; count += 1) {
        const { cardWidth, radius } = computeLayout(width, count);
        const polygonSide = 2 * radius * Math.tan(Math.PI / count);
        expect(cardWidth, `${width}px x ${count}`).toBeLessThan(polygonSide);
      }
    }
  });

  it('con 7 tarjetas conserva la forma del original: radio y perspectiva en proporcion', () => {
    for (const width of [375, 1440]) {
      const { radius, perspective, cardWidth } = computeLayout(width, 7);
      expect(radius / cardWidth).toBeGreaterThan(1.2);
      expect(radius / cardWidth).toBeLessThan(1.94);
      expect(perspective / cardWidth).toBeCloseTo(1400 / 330, 1);
    }
  });

  it('el anillo es mas pequeno en movil', () => {
    const desktop = computeLayout(1440, 7);
    const mobile = computeLayout(375, 7);
    expect(mobile.radius).toBeLessThan(desktop.radius);
    expect(mobile.perspective).toBeLessThan(desktop.perspective);
    expect(mobile.stageHeight).toBeLessThan(desktop.stageHeight);
  });

  it('el escenario cabe holgado alrededor de la tarjeta y del reflejo', () => {
    for (const width of widths) {
      const { stageHeight, cardHeight } = computeLayout(width, 7);
      expect(stageHeight, `width ${width}`).toBeGreaterThan(cardHeight * 1.4);
      expect(stageHeight, `width ${width}`).toBeLessThan(cardHeight * 2.2);
    }
  });

  it('con menos de 3 tarjetas calcula geometria finita', () => {
    for (const count of [0, 1, 2]) {
      const layout = computeLayout(800, count);
      expect(Number.isFinite(layout.radius)).toBe(true);
      expect(layout.radius).toBeGreaterThan(0);
      expect(Number.isFinite(layout.stageHeight)).toBe(true);
    }
  });

  it('degreesPerPixel es positivo y finito', () => {
    for (const width of widths) {
      const { degreesPerPixel } = computeLayout(width, 7);
      expect(degreesPerPixel).toBeGreaterThan(0.05);
      expect(degreesPerPixel).toBeLessThan(0.4);
    }
  });
});

describe('computeLayout: la tarjeta frontal en el plano de la pantalla', () => {
  it('desplaza el anillo hacia atras justo lo que el frente se adelanta con la inclinacion', () => {
    for (const width of widths) {
      const { radius, frontZ } = computeLayout(width, 7);
      expect(frontZ).toBeLessThan(0);
      expect(frontZ).toBeCloseTo(-radius * Math.cos(TILT_DEGREES * RADIANS_PER_DEGREE), 6);
    }
  });

  it('el suelo es una elipse centrada bajo las tarjetas, mas ancha que alta', () => {
    for (const width of widths) {
      const { floorRadiusX, floorRadiusY, cardWidth, radius } = computeLayout(width, 7);
      expect(floorRadiusX, `width ${width}`).toBeGreaterThan(radius);
      expect(floorRadiusX, `width ${width}`).toBeGreaterThan(floorRadiusY * 2);
      expect(floorRadiusX, `width ${width}`).toBeGreaterThan(cardWidth);
    }
  });
});
