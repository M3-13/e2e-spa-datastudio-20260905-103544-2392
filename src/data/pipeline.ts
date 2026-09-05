import type { ColumnDef, ColumnFilter, Dataset, Row } from '../types';

export function getVisibleColumns(
  dataset: Dataset,
  visibleColumnIds: string[] | null,
): ColumnDef[] {
  if (visibleColumnIds === null) {
    return dataset.columns;
  }
  const idSet = new Set(visibleColumnIds);
  return dataset.columns.filter((column) => idSet.has(column.id));
}

export function applyFilters(dataset: Dataset, filters: ColumnFilter[]): Row[] {
  if (filters.length === 0) {
    return dataset.rows;
  }
  return dataset.rows.filter((row) =>
    filters.every((filter) => matchesFilter(row, dataset.columns, filter)),
  );
}

export function matchesFilter(
  row: Row,
  columns: ColumnDef[],
  filter: ColumnFilter,
): boolean {
  const columnIndex = columns.findIndex((column) => column.id === filter.columnId);
  if (columnIndex < 0) {
    return true;
  }
  const cell = row[columnIndex] ?? '';
  const value = filter.value;

  switch (filter.op) {
    case 'contains':
      return cell.toLowerCase().includes(value.toLowerCase());
    case 'equals':
      return cell.toLowerCase() === value.toLowerCase();
    case 'startsWith':
      return cell.toLowerCase().startsWith(value.toLowerCase());
    case 'eq': {
      const a = parseNumber(cell);
      const b = parseNumber(value);
      if (a === null || b === null) {
        return cell.toLowerCase() === value.toLowerCase();
      }
      return a === b;
    }
    case 'lt': {
      const a = parseNumber(cell);
      const b = parseNumber(value);
      if (a === null || b === null) {
        return false;
      }
      return a < b;
    }
    case 'gt': {
      const a = parseNumber(cell);
      const b = parseNumber(value);
      if (a === null || b === null) {
        return false;
      }
      return a > b;
    }
    case 'between': {
      const a = parseNumber(cell);
      const b = parseNumber(value);
      const c = filter.valueTo !== undefined ? parseNumber(filter.valueTo) : null;
      if (a === null || b === null || c === null) {
        return false;
      }
      return a >= b && a <= c;
    }
  }
}

export function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }
  const parsed = parseFloat(trimmed);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}
