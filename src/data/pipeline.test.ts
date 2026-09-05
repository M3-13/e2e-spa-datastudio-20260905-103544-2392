import { describe, expect, it } from 'vitest';
import {
  applyFilters,
  getVisibleColumns,
  matchesFilter,
  parseNumber,
} from './pipeline';
import type { ColumnDef, ColumnFilter, Dataset } from '../types';

const columns: ColumnDef[] = [
  { id: 'col-0', name: 'Name', type: 'text' },
  { id: 'col-1', name: 'Alter', type: 'number' },
  { id: 'col-2', name: 'Stadt', type: 'text' },
];

const dataset: Dataset = {
  columns,
  fileName: 'test.csv',
  rows: [
    ['Alice', '30', 'Berlin'],
    ['Bob', '25', 'Hamburg'],
    ['Charlie', '40', 'Berlin'],
  ],
};

describe('parseNumber', () => {
  it('parst ganze Zahlen', () => {
    expect(parseNumber('30')).toBe(30);
  });

  it('parst Dezimalzahlen', () => {
    expect(parseNumber('3.14')).toBeCloseTo(3.14);
  });

  it('liefert null für leere Eingaben', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('   ')).toBeNull();
  });

  it('liefert null für nicht-numerische Eingaben', () => {
    expect(parseNumber('abc')).toBeNull();
  });

  it('entfernt umgebende Leerzeichen', () => {
    expect(parseNumber(' 42 ')).toBe(42);
  });
});

describe('getVisibleColumns', () => {
  it('liefert alle Spalten, wenn visibleColumnIds null ist', () => {
    expect(getVisibleColumns(dataset, null)).toEqual(columns);
  });

  it('filtert auf sichtbare Ids in natuerlicher Spaltenreihenfolge', () => {
    expect(getVisibleColumns(dataset, ['col-2', 'col-0'])).toEqual([
      columns[0],
      columns[2],
    ]);
  });

  it('liefert eine leere Liste für eine leere Auswahl', () => {
    expect(getVisibleColumns(dataset, [])).toEqual([]);
  });
});

describe('applyFilters', () => {
  it('liefert alle Zeilen ohne Filter', () => {
    expect(applyFilters(dataset, [])).toHaveLength(3);
  });

  it('verknüpft mehrere Filter mit UND', () => {
    const filters: ColumnFilter[] = [
      { columnId: 'col-2', op: 'equals', value: 'Berlin' },
      { columnId: 'col-1', op: 'gt', value: '30' },
    ];
    expect(applyFilters(dataset, filters)).toEqual([['Charlie', '40', 'Berlin']]);
  });

  it('matcht Text case-insensitiv', () => {
    const filters: ColumnFilter[] = [
      { columnId: 'col-0', op: 'startsWith', value: 'a' },
    ];
    expect(applyFilters(dataset, filters)).toEqual([['Alice', '30', 'Berlin']]);
  });
});

describe('matchesFilter', () => {
  it('contains ist case-insensitiv', () => {
    const filter: ColumnFilter = { columnId: 'col-2', op: 'contains', value: 'berl' };
    expect(matchesFilter(['Alice', '30', 'Berlin'], columns, filter)).toBe(true);
  });

  it('eq vergleicht numerisch', () => {
    const filter: ColumnFilter = { columnId: 'col-1', op: 'eq', value: '25' };
    expect(matchesFilter(['Bob', '25', 'Hamburg'], columns, filter)).toBe(true);
  });

  it('between ist inklusiv', () => {
    const filter: ColumnFilter = {
      columnId: 'col-1',
      op: 'between',
      value: '20',
      valueTo: '35',
    };
    expect(matchesFilter(['Alice', '30', 'Berlin'], columns, filter)).toBe(true);
  });

  it('unbekannte Spalte matcht', () => {
    const filter: ColumnFilter = { columnId: 'col-99', op: 'contains', value: 'x' };
    expect(matchesFilter(['Alice', '30', 'Berlin'], columns, filter)).toBe(true);
  });

  it('nicht-numerische Zelle fällt bei eq auf Textvergleich zurück', () => {
    const filter: ColumnFilter = { columnId: 'col-1', op: 'eq', value: 'abc' };
    expect(matchesFilter(['X', 'abc', 'Y'], columns, filter)).toBe(true);
  });
});
