import { describe, expect, it } from 'vitest';
import { EXAMPLE_CSV } from './exampleData';

function splitCsv(text: string): string[][] {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(','));
}

describe('EXAMPLE_CSV', () => {
  it('ist ein nicht-leerer String', () => {
    expect(EXAMPLE_CSV.trim()).not.toBe('');
  });

  it('enthält eine Kopfzeile und mehrere Datenzeilen', () => {
    const rows = splitCsv(EXAMPLE_CSV);
    expect(rows.length).toBeGreaterThanOrEqual(4);
    const header = rows[0];
    const dataRows = rows.slice(1);
    expect(header.length).toBeGreaterThanOrEqual(2);
    expect(dataRows.length).toBeGreaterThanOrEqual(3);
    for (const row of dataRows) {
      expect(row.length).toBe(header.length);
    }
  });

  it('enthält mindestens eine numerische Spalte', () => {
    const rows = splitCsv(EXAMPLE_CSV);
    const header = rows[0];
    const dataRows = rows.slice(1);
    const numericColumnIndices = header
      .map((_, index) => index)
      .filter((index) =>
        dataRows.every((row) => {
          const value = row[index]?.trim();
          return value !== '' && !Number.isNaN(Number(value));
        }),
      );
    expect(numericColumnIndices.length).toBeGreaterThanOrEqual(1);
  });

  it('enthält mindestens eine Textspalte', () => {
    const rows = splitCsv(EXAMPLE_CSV);
    const header = rows[0];
    const dataRows = rows.slice(1);
    const textColumnIndices = header
      .map((_, index) => index)
      .filter((index) =>
        dataRows.some((row) => {
          const value = row[index]?.trim();
          return value !== '' && Number.isNaN(Number(value));
        }),
      );
    expect(textColumnIndices.length).toBeGreaterThanOrEqual(1);
  });
});
