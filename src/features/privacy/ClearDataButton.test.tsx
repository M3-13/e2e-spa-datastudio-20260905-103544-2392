import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppStateProvider } from '../../state/AppStateContext';
import type { AppState } from '../../types';
import ClearDataButton from './ClearDataButton';

const STORAGE_KEY = 'csv-datastudio-v1';

function darkState(): AppState {
  return {
    status: 'ready',
    errorMessage: null,
    dataset: {
      columns: [{ id: 'col-0', name: 'Name', type: 'text' }],
      rows: [['Alice']],
      fileName: 'test.csv',
    },
    visibleColumnIds: ['col-0'],
    sort: { columnId: 'col-0', direction: 'asc' },
    page: 3,
    pageSize: 50,
    searchQuery: 'a',
    filters: [{ columnId: 'col-0', op: 'contains', value: 'a' }],
    chartColumnId: 'col-0',
    chartType: 'bar',
    theme: 'dark',
  };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('ClearDataButton', () => {
  it('löscht nach Bestätigung Datensatz und alle Ansichtseinstellungen inklusive Theme', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(darkState()));

    render(
      <AppStateProvider>
        <ClearDataButton />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Daten löschen' }));
    fireEvent.click(screen.getByRole('button', { name: 'Wirklich löschen?' }));

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const persisted = JSON.parse(raw as string) as AppState;

    expect(persisted.dataset).toBeNull();
    expect(persisted.filters).toEqual([]);
    expect(persisted.sort).toBeNull();
    expect(persisted.visibleColumnIds).toBeNull();
    expect(persisted.theme).toBe('light');
  });
});
