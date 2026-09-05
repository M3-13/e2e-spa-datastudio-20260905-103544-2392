import { describe, expect, it } from 'vitest';
import { computeStats } from './statsEngine';
import type { ColumnDef, Dataset } from '../../types';

const columns: ColumnDef[] = [
  { id: 'col-0', name: 'Name', type: 'text' },
  { id: 'col-1', name: 'Alter', type: 'number' },
  { id: 'col-2', name: 'Umsatz', type: 'number' },
];

const dataset: Dataset = {
  columns,
  fileName: 'test.csv',
  rows: [
    ['Alice', '30', '12.5'],
    ['Bob', '25', '8'],
    ['Charlie', '40', '9.5'],
    ['', ' ', '20'],
    ['Eve', 'abc', ''],
  ],
};

describe('computeStats', () => {
  it('berechnet Anzahl, Summe, Mittelwert, Minimum und Maximum', () => {
    const stats = computeStats(dataset, columns, dataset.rows, 'col-1');
    expect(stats.count).toBe(3);
    expect(stats.sum).toBe(95);
    expect(stats.mean).toBeCloseTo(95 / 3);
    expect(stats.min).toBe(25);
    expect(stats.max).toBe(40);
  });

  it('zählt leere und nicht-numerische Zellen als fehlend', () => {
    const stats = computeStats(dataset, columns, dataset.rows, 'col-1');
    expect(stats.missing).toBe(2);
  });

  it('überspringt fehlende Werte für die übrigen Kennzahlen', () => {
    const stats = computeStats(dataset, columns, dataset.rows, 'col-2');
    expect(stats.count).toBe(4);
    expect(stats.sum).toBeCloseTo(50);
    expect(stats.mean).toBeCloseTo(12.5);
    expect(stats.min).toBeCloseTo(8);
    expect(stats.max).toBeCloseTo(20);
    expect(stats.missing).toBe(1);
  });

  it('liefert Nullwerte bei ausschließlich fehlenden Zellen', () => {
    const stats = computeStats(
      dataset,
      columns,
      [
        ['A', '', ''],
        ['B', 'abc', ''],
      ],
      'col-1',
    );
    expect(stats.count).toBe(0);
    expect(stats.sum).toBe(0);
    expect(stats.mean).toBeNull();
    expect(stats.min).toBeNull();
    expect(stats.max).toBeNull();
    expect(stats.missing).toBe(2);
  });

  it('berechnet nur über die übergebenen gefilterten Zeilen', () => {
    const filteredRows = [
      ['Alice', '30', '12.5'],
      ['Bob', '25', '8'],
    ];
    const stats = computeStats(dataset, columns, filteredRows, 'col-1');
    expect(stats.count).toBe(2);
    expect(stats.sum).toBe(55);
    expect(stats.mean).toBeCloseTo(27.5);
    expect(stats.missing).toBe(0);
  });

  it('liefert leere Kennzahlen für eine Textspalte', () => {
    const stats = computeStats(dataset, columns, dataset.rows, 'col-0');
    expect(stats.count).toBe(0);
    expect(stats.sum).toBe(0);
    expect(stats.mean).toBeNull();
    expect(stats.min).toBeNull();
    expect(stats.max).toBeNull();
  });

  it('liefert leere Kennzahlen für eine unbekannte Spalten-Id', () => {
    const stats = computeStats(dataset, columns, dataset.rows, 'col-99');
    expect(stats.count).toBe(0);
    expect(stats.missing).toBe(0);
  });

  it('behandelt Zeilen, die kürzer als die Spaltenzahl sind', () => {
    const stats = computeStats(
      dataset,
      columns,
      [['Alice', '30']],
      'col-2',
    );
    expect(stats.count).toBe(0);
    expect(stats.missing).toBe(1);
  });

  it('ignoriert eine Spalte, die nicht in den sichtbaren Spalten enthalten ist', () => {
    const visible = columns.filter((c) => c.id !== 'col-1');
    const stats = computeStats(dataset, visible, dataset.rows, 'col-1');
    expect(stats.count).toBe(0);
  });
});
