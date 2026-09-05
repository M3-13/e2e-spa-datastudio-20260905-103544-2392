export type Row = string[];

export interface ColumnDef {
  id: string;
  name: string;
  type: 'text' | 'number';
}

export interface Dataset {
  columns: ColumnDef[];
  rows: Row[];
  fileName: string;
}

export type FilterOp =
  | 'contains'
  | 'equals'
  | 'startsWith'
  | 'eq'
  | 'lt'
  | 'gt'
  | 'between';

export interface ColumnFilter {
  columnId: string;
  op: FilterOp;
  value: string;
  valueTo?: string;
}

export interface SortState {
  columnId: string;
  direction: 'asc' | 'desc';
}

export type Status = 'empty' | 'loading' | 'ready' | 'error';

export type Theme = 'light' | 'dark';

export type ChartType = 'bar' | 'line';

export interface AppState {
  status: Status;
  errorMessage: string | null;
  dataset: Dataset | null;
  visibleColumnIds: string[] | null;
  sort: SortState | null;
  page: number;
  pageSize: number;
  searchQuery: string;
  filters: ColumnFilter[];
  chartColumnId: string | null;
  chartType: ChartType;
  theme: Theme;
}
