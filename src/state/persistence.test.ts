import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  clearPersistedState,
  loadPersistedState,
  savePersistedState,
} from './persistence';
import type { AppState, ColumnDef, Row } from '../types';

const STORAGE_KEY = 'csv-datastudio-v1';

function makeState(overrides: Partial<AppState> = {}): AppState {
  return {
    status: 'ready',
    errorMessage: null,
    dataset: {
      columns: [
        { id: 'col-0', name: 'Name', type: 'text' },
        { id: 'col-1', name: 'Alter', type: 'number' },
      ],
      fileName: 'test.csv',
      rows: [
        ['Alice', '30'],
        ['Bob', '25'],
      ],
    },
    visibleColumnIds: ['col-0'],
    sort: { columnId: 'col-1', direction: 'desc' },
    page: 2,
    pageSize: 10,
    searchQuery: 'ali',
    filters: [{ columnId: 'col-0', op: 'contains', value: 'a' }],
    chartColumnId: 'col-1',
    chartType: 'line',
    theme: 'dark',
    ...overrides,
  };
}

const emptyState: AppState = {
  status: 'empty',
  errorMessage: null,
  dataset: null,
  visibleColumnIds: null,
  sort: null,
  page: 1,
  pageSize: 20,
  searchQuery: '',
  filters: [],
  chartColumnId: null,
  chartType: 'bar',
  theme: 'light',
};

function store(value: unknown): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('savePersistedState / loadPersistedState', () => {
  it('speichert und stellt den kompletten Zustand wieder her', () => {
    const state = makeState();
    savePersistedState(state);
    expect(loadPersistedState()).toEqual(state);
  });

  it('stellt den leeren Zustand ohne Dataset wieder her', () => {
    savePersistedState(emptyState);
    expect(loadPersistedState()).toEqual(emptyState);
  });

  it('liefert null, wenn nichts gespeichert ist', () => {
    expect(loadPersistedState()).toBeNull();
  });
});

describe('loadPersistedState validiert korrupte Daten', () => {
  it('liefert null bei korruptem JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{ das ist kein json');
    expect(loadPersistedState()).toBeNull();
  });

  it('liefert null, wenn der gespeicherte Wert kein Objekt ist', () => {
    store('nur ein string');
    expect(loadPersistedState()).toBeNull();
  });

  it('liefert null bei fehlenden Feldern', () => {
    store({ status: 'ready' });
    expect(loadPersistedState()).toBeNull();
  });
});

describe('loadPersistedState validiert Typen', () => {
  it('liefert null bei ungültigem status', () => {
    store(makeState({ status: 'kaputt' as AppState['status'] }));
    expect(loadPersistedState()).toBeNull();
  });

  it('liefert null bei ungültigem theme', () => {
    store(makeState({ theme: 'blau' as AppState['theme'] }));
    expect(loadPersistedState()).toBeNull();
  });

  it('liefert null bei ungültigem chartType', () => {
    store(makeState({ chartType: 'pie' as AppState['chartType'] }));
    expect(loadPersistedState()).toBeNull();
  });

  it('liefert null, wenn columns kein Array ist', () => {
    store(
      makeState({
        dataset: {
          columns: 'nicht-ein-array' as unknown as ColumnDef[],
          rows: [],
          fileName: 'x.csv',
        },
      }),
    );
    expect(loadPersistedState()).toBeNull();
  });

  it('liefert null, wenn eine Spalte einen ungültigen Typ hat', () => {
    store(
      makeState({
        dataset: {
          columns: [{ id: 'col-0', name: 'Name', type: 'date' as 'text' }],
          rows: [['Alice']],
          fileName: 'x.csv',
        },
      }),
    );
    expect(loadPersistedState()).toBeNull();
  });

  it('liefert null, wenn rows keine String-Arrays sind', () => {
    store(
      makeState({
        dataset: {
          columns: [{ id: 'col-0', name: 'Name', type: 'text' }],
          rows: [[42]] as unknown as Row[],
          fileName: 'x.csv',
        },
      }),
    );
    expect(loadPersistedState()).toBeNull();
  });

  it('liefert null bei einem ungültigen Filter', () => {
    store(
      makeState({
        filters: [
          { columnId: 'col-0', op: 'nope' as 'contains', value: 'a' },
        ],
      }),
    );
    expect(loadPersistedState()).toBeNull();
  });

  it('liefert null bei ungültiger Sortierung', () => {
    store(makeState({ sort: { columnId: 'col-1', direction: 'up' as 'asc' } }));
    expect(loadPersistedState()).toBeNull();
  });

  it('liefert null bei nicht-numerischer Seitengröße', () => {
    store(makeState({ pageSize: 'viel' as unknown as number }));
    expect(loadPersistedState()).toBeNull();
  });
});

describe('clearPersistedState', () => {
  it('entfernt den gespeicherten Zustand', () => {
    savePersistedState(makeState());
    clearPersistedState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(loadPersistedState()).toBeNull();
  });
});
