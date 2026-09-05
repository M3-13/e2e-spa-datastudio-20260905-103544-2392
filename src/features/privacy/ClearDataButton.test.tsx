import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppStateProvider, useAppState } from '../../state/AppStateContext';
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

function StateProbe() {
  const { state } = useAppState();
  return (
    <span data-testid="state-probe">
      {state.theme}|{state.dataset === null ? 'leer' : 'daten'}
    </span>
  );
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('ClearDataButton', () => {
  it('löscht nach Bestätigung Datensatz und alle Ansichtseinstellungen aus dem LocalStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(darkState()));

    render(
      <AppStateProvider>
        <ClearDataButton />
        <StateProbe />
      </AppStateProvider>,
    );

    expect(screen.getByTestId('state-probe').textContent).toBe('dark|daten');

    fireEvent.click(screen.getByRole('button', { name: 'Daten löschen' }));
    fireEvent.click(screen.getByRole('button', { name: 'Wirklich löschen?' }));

    expect(screen.getByTestId('state-probe').textContent).toBe('light|leer');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
