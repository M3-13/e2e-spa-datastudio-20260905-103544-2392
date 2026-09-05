import type { ColumnDef, Dataset, Row } from '../../types';
import { parseNumber } from '../../data/pipeline';

export interface ColumnStats {
  count: number;
  sum: number;
  mean: number | null;
  min: number | null;
  max: number | null;
  missing: number;
}

export function computeStats(
  dataset: Dataset,
  visibleColumns: ColumnDef[],
  filteredRows: Row[],
  columnId: string,
): ColumnStats {
  const column = visibleColumns.find((c) => c.id === columnId);
  const columnIndex = dataset.columns.findIndex((c) => c.id === columnId);

  const result: ColumnStats = {
    count: 0,
    sum: 0,
    mean: null,
    min: null,
    max: null,
    missing: 0,
  };

  if (columnIndex < 0 || column?.type !== 'number') {
    return result;
  }

  for (const row of filteredRows) {
    const raw = row[columnIndex];
    const value = raw === undefined ? null : parseNumber(raw);
    if (value === null) {
      result.missing += 1;
      continue;
    }
    result.count += 1;
    result.sum += value;
    if (result.min === null || value < result.min) {
      result.min = value;
    }
    if (result.max === null || value > result.max) {
      result.max = value;
    }
  }

  if (result.count > 0) {
    result.mean = result.sum / result.count;
  }

  return result;
}
