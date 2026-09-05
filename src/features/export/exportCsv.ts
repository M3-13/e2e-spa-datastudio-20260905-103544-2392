import type { ColumnDef, Dataset, Row } from '../../types';

const FORMULA_PREFIX = /^[=+\-@]/;

export function escapeCellValue(value: string): string {
  if (FORMULA_PREFIX.test(value)) {
    return `'${value}`;
  }
  return value;
}

export function csvQuote(value: string): string {
  if (
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildExportFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]*$/, '');
  return base.length > 0 ? `${base}.csv` : 'export.csv';
}

export function exportCsv(
  dataset: Dataset,
  visibleColumns: ColumnDef[],
  filteredRows: Row[],
): string {
  if (visibleColumns.length === 0) {
    return '';
  }

  const indexes = visibleColumns.map((column) =>
    dataset.columns.findIndex((candidate) => candidate.id === column.id),
  );

  const header = visibleColumns.map((column) => csvQuote(column.name)).join(',');

  const lines = filteredRows.map((row) =>
    indexes
      .map((index) => {
        const cell = index >= 0 ? (row[index] ?? '') : '';
        return csvQuote(escapeCellValue(cell));
      })
      .join(','),
  );

  return [header, ...lines].join('\n');
}
