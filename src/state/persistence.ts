import type {
  AppState,
  ColumnDef,
  ColumnFilter,
  Dataset,
  SortState,
} from '../types';

const STORAGE_KEY = 'csv-datastudio-v1';

// Unterdrückt die unmittelbar auf clearPersistedState() folgende Speicherung, damit
// der Zustands-Reset im AppStateContext den Schlüssel nicht sofort neu schreibt.
let suppressNextSave = false;

const STATUS_VALUES: readonly string[] = ['empty', 'loading', 'ready', 'error'];
const FILTER_OPS: readonly string[] = [
  'contains',
  'equals',
  'startsWith',
  'eq',
  'lt',
  'gt',
  'between',
];
const COLUMN_TYPES: readonly string[] = ['text', 'number'];
const CHART_TYPES: readonly string[] = ['bar', 'line'];
const THEMES: readonly string[] = ['light', 'dark'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isColumnDef(value: unknown): value is ColumnDef {
  if (!isRecord(value)) return false;
  if (!isString(value.id)) return false;
  if (!isString(value.name)) return false;
  if (!isString(value.type)) return false;
  return COLUMN_TYPES.includes(value.type);
}

function isDataset(value: unknown): value is Dataset {
  if (!isRecord(value)) return false;
  if (!isString(value.fileName)) return false;
  if (!Array.isArray(value.columns) || !value.columns.every(isColumnDef)) {
    return false;
  }
  if (!Array.isArray(value.rows) || !value.rows.every(isStringArray)) {
    return false;
  }
  return true;
}

function isSortState(value: unknown): value is SortState {
  if (!isRecord(value)) return false;
  if (!isString(value.columnId)) return false;
  if (!isString(value.direction)) return false;
  return value.direction === 'asc' || value.direction === 'desc';
}

function isColumnFilter(value: unknown): value is ColumnFilter {
  if (!isRecord(value)) return false;
  if (!isString(value.columnId)) return false;
  if (!isString(value.op)) return false;
  if (!FILTER_OPS.includes(value.op)) return false;
  if (!isString(value.value)) return false;
  if (value.valueTo !== undefined && !isString(value.valueTo)) return false;
  return true;
}

export function isPersistedAppState(value: unknown): value is AppState {
  if (!isRecord(value)) return false;
  if (!isString(value.status)) return false;
  if (!STATUS_VALUES.includes(value.status)) return false;
  if (!isNullableString(value.errorMessage)) return false;
  if (value.dataset !== null && !isDataset(value.dataset)) return false;
  if (value.visibleColumnIds !== null && !isStringArray(value.visibleColumnIds)) {
    return false;
  }
  if (value.sort !== null && !isSortState(value.sort)) return false;
  if (!isFiniteNumber(value.page)) return false;
  if (!isFiniteNumber(value.pageSize) || value.pageSize <= 0) return false;
  if (!isString(value.searchQuery)) return false;
  if (!Array.isArray(value.filters) || !value.filters.every(isColumnFilter)) {
    return false;
  }
  if (!isNullableString(value.chartColumnId)) return false;
  if (!isString(value.chartType)) return false;
  if (!CHART_TYPES.includes(value.chartType)) return false;
  if (!isString(value.theme)) return false;
  if (!THEMES.includes(value.theme)) return false;
  return true;
}

export function loadPersistedState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedAppState(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function savePersistedState(state: AppState): void {
  if (suppressNextSave) {
    suppressNextSave = false;
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // LocalStorage nicht verfügbar oder voll — Persistenz ist optional.
  }
}

export function clearPersistedState(): void {
  suppressNextSave = true;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // LocalStorage nicht verfügbar.
  }
}
