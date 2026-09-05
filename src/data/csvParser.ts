import type { ColumnDef, Dataset, Row } from '../types';
import { parseNumber } from './pipeline';

const DELIMITERS = [',', ';', '\t', '|'] as const;

function splitLines(text: string): string[] {
  return text.split(/\r\n|\r|\n/);
}

function countOccurrences(line: string, delimiter: string): number {
  let count = 0;
  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === delimiter) {
      count += 1;
    }
  }
  return count;
}

function detectDelimiter(firstLine: string): string | null {
  let bestDelimiter: string | null = null;
  let bestCount = 0;
  for (const delimiter of DELIMITERS) {
    const count = countOccurrences(firstLine, delimiter);
    if (count > bestCount) {
      bestCount = count;
      bestDelimiter = delimiter;
    }
  }
  return bestDelimiter;
}

export function parseCsv(text: string): Dataset {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('Die Datei ist leer.');
  }

  const nonEmptyLines = splitLines(text).filter((line) => line.trim() !== '');
  if (nonEmptyLines.length === 0) {
    throw new Error('Die Datei enthält keine Zeilen.');
  }

  const delimiter = detectDelimiter(nonEmptyLines[0]);
  const splitLine = (line: string): string[] =>
    delimiter === null ? [line] : line.split(delimiter);

  const firstRowCells = splitLine(nonEmptyLines[0]);
  const columnCount = firstRowCells.length;

  if (columnCount === 0) {
    throw new Error('Es konnten keine Spalten erkannt werden.');
  }

  const hasHeader = firstRowCells.some((cell) => parseNumber(cell) === null);

  const columnNames = hasHeader
    ? firstRowCells.map((cell) => cell.trim())
    : firstRowCells.map((_, index) => `Spalte ${index + 1}`);

  const bodyLines = hasHeader ? nonEmptyLines.slice(1) : nonEmptyLines;

  const columns: ColumnDef[] = [];
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    const values = bodyLines
      .map((line) => splitLine(line)[columnIndex] ?? '')
      .filter((value) => value.trim() !== '');
    const isNumeric =
      values.length > 0 && values.every((value) => parseNumber(value) !== null);
    columns.push({
      id: `col-${columnIndex}`,
      name: columnNames[columnIndex] ?? `Spalte ${columnIndex + 1}`,
      type: isNumeric ? 'number' : 'text',
    });
  }

  const rows: Row[] = bodyLines.map((line) =>
    splitLine(line).map((cell) => cell.trim()),
  );

  return { columns, rows, fileName: '' };
}
