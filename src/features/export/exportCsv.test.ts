import { describe, expect, it } from 'vitest';
import {
  buildExportFileName,
  csvQuote,
  escapeCellValue,
  exportCsv,
} from './exportCsv';
import type { ColumnDef, Dataset, Row } from '../../types';

const columns: ColumnDef[] = [
  { id: 'col-0', name: 'Name', type: 'text' },
  { id: 'col-1', name: 'Wert', type: 'number' },
  { id: 'col-2', name: 'Notiz', type: 'text' },
];

const dataset: Dataset = {
  columns,
  fileName: 'daten.csv',
  rows: [
    ['Alice', '10', '=SUM(A1:A2)'],
    ['Bob', '+5', 'hallo'],
  ],
};

describe('escapeCellValue', () => {
  it('escapes values starting with = + - @ by prefixing an apostrophe', () => {
    expect(escapeCellValue('=SUM(A1)')).toBe("'=SUM(A1)");
    expect(escapeCellValue('+1')).toBe("'+1");
    expect(escapeCellValue('-5')).toBe("'-5");
    expect(escapeCellValue('@cmd')).toBe("'@cmd");
  });

  it('leaves other values unchanged', () => {
    expect(escapeCellValue('normal')).toBe('normal');
    expect(escapeCellValue(' a=1')).toBe(' a=1');
    expect(escapeCellValue('')).toBe('');
  });
});

describe('csvQuote', () => {
  it('quotes values containing a comma', () => {
    expect(csvQuote('a,b')).toBe('"a,b"');
  });

  it('quotes values containing a double quote and doubles it', () => {
    expect(csvQuote('say "hi"')).toBe('"say ""hi"""');
  });

  it('quotes values containing a line break', () => {
    expect(csvQuote('line1\nline2')).toBe('"line1\nline2"');
  });

  it('leaves simple values unquoted', () => {
    expect(csvQuote('plain')).toBe('plain');
  });
});

describe('exportCsv', () => {
  it('builds header from visible columns and data from filtered rows', () => {
    const visible = [columns[0], columns[1]];
    const rows: Row[] = [['Alice', '10', 'x']];
    expect(exportCsv(dataset, visible, rows)).toBe('Name,Wert\nAlice,10');
  });

  it('exports only visible columns in their source column order', () => {
    const visible = [columns[2], columns[0]];
    const rows: Row[] = [['Alice', '10', 'Notiz A']];
    expect(exportCsv(dataset, visible, rows)).toBe('Notiz,Name\nNotiz A,Alice');
  });

  it('escapes formula injection on cell values', () => {
    const visible = [columns[2]];
    const rows: Row[] = [['x', 'y', '=1+1']];
    expect(exportCsv(dataset, visible, rows)).toBe("Notiz\n'=1+1");
  });

  it('quotes a cell containing a comma', () => {
    const visible = [columns[2]];
    const rows: Row[] = [['x', 'y', 'a,b']];
    expect(exportCsv(dataset, visible, rows)).toBe('Notiz\n"a,b"');
  });

  it('quotes and escapes a cell containing a line break and formula prefix', () => {
    const visible = [columns[2]];
    const rows: Row[] = [['x', 'y', '=line1\nline2']];
    expect(exportCsv(dataset, visible, rows)).toBe("Notiz\n\"'=line1\nline2\"");
  });

  it('returns an empty string when there are no visible columns', () => {
    const rows: Row[] = [['a', 'b', 'c']];
    expect(exportCsv(dataset, [], rows)).toBe('');
  });

  it('returns only the header when there are no filtered rows', () => {
    const visible = [columns[0], columns[1]];
    expect(exportCsv(dataset, visible, [])).toBe('Name,Wert');
  });

  it('treats missing cell values as empty', () => {
    const visible = [columns[0], columns[1]];
    const rows: Row[] = [['onlyOne']];
    expect(exportCsv(dataset, visible, rows)).toBe('Name,Wert\nonlyOne,');
  });
});

describe('buildExportFileName', () => {
  it('replaces the original extension with .csv', () => {
    expect(buildExportFileName('daten.csv')).toBe('daten.csv');
    expect(buildExportFileName('daten.txt')).toBe('daten.csv');
  });

  it('appends .csv when there is no extension', () => {
    expect(buildExportFileName('daten')).toBe('daten.csv');
  });

  it('falls back to a default name for a dot-only name', () => {
    expect(buildExportFileName('.csv')).toBe('export.csv');
  });
});
