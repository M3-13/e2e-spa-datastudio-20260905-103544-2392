import { describe, expect, it } from 'vitest';
import {
  computeBarLayout,
  countFrequencies,
  labelTruncationLength,
  rotatedLabelWidth,
} from './BarChart';
import { extractSeries } from './LineChart';

describe('countFrequencies', () => {
  it('zählt die Häufigkeit der Werte einer Spalte in erster Auftretensreihenfolge', () => {
    const rows = [['a'], ['b'], ['a'], ['a'], ['b']];
    expect(countFrequencies(rows, 0)).toEqual([
      { label: 'a', count: 3 },
      { label: 'b', count: 2 },
    ]);
  });

  it('gruppiert leere und nur-Whitespace-Zellen unter "(leer)"', () => {
    const rows = [[''], ['x'], ['  ']];
    expect(countFrequencies(rows, 0)).toEqual([
      { label: '(leer)', count: 2 },
      { label: 'x', count: 1 },
    ]);
  });

  it('gibt bei leerer Eingabe ein leeres Array zurück', () => {
    expect(countFrequencies([], 0)).toEqual([]);
  });
});

describe('computeBarLayout', () => {
  it('hält Balken auch bei hochkardinalen Spalten überlappungsfrei', () => {
    for (const categoryCount of [1, 2, 6, 71, 72, 100, 500]) {
      const { slotWidth, barWidth } = computeBarLayout(categoryCount);
      expect(barWidth).toBeLessThanOrEqual(slotWidth);
      expect(barWidth).toBeGreaterThanOrEqual(8);
      expect(barWidth).toBeLessThanOrEqual(48);
    }
  });

  it('verbreitert die Zeichenfläche, wenn Kategorien nicht mehr in die Basisbreite passen', () => {
    const few = computeBarLayout(4);
    const many = computeBarLayout(100);
    expect(many.totalWidth).toBeGreaterThan(few.totalWidth);
    expect(many.totalWidth).toBeGreaterThanOrEqual(100 * 8);
  });
});

describe('label layout', () => {
  it('kürzt Labels bei steigender Kategorienzahl stärker', () => {
    expect(labelTruncationLength(6)).toBeGreaterThan(labelTruncationLength(60));
    expect(labelTruncationLength(60)).toBeGreaterThanOrEqual(
      labelTruncationLength(500),
    );
  });

  it('rotierte Labels überlappen auch bei hochkardinalen Spalten nicht', () => {
    for (const categoryCount of [7, 20, 21, 60, 61, 100, 500]) {
      const maxLabelLength = labelTruncationLength(categoryCount);
      const { slotWidth } = computeBarLayout(categoryCount, maxLabelLength);
      expect(rotatedLabelWidth(maxLabelLength)).toBeLessThanOrEqual(slotWidth);
    }
  });
});

describe('extractSeries', () => {
  it('extrahiert nur numerische Werte in Zeilenreihenfolge', () => {
    const rows = [['1'], ['2'], ['x'], ['4']];
    expect(extractSeries(rows, 0)).toEqual([
      { index: 0, value: 1 },
      { index: 1, value: 2 },
      { index: 3, value: 4 },
    ]);
  });

  it('gibt bei fehlenden Zahlen ein leeres Array zurück', () => {
    expect(extractSeries([['a'], ['b']], 0)).toEqual([]);
  });
});
