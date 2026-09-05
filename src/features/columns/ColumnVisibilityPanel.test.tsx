import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppStateProvider, useAppState } from '../../state/AppStateContext';
import ColumnVisibilityPanel from './ColumnVisibilityPanel';
import type { Dataset } from '../../types';

const dataset: Dataset = {
  fileName: 'beispiel.csv',
  columns: [
    { id: 'col-0', name: 'Name', type: 'text' },
    { id: 'col-1', name: 'Alter', type: 'number' },
    { id: 'col-2', name: 'Stadt', type: 'text' },
  ],
  rows: [
    ['Anna', '30', 'Berlin'],
    ['Ben', '25', 'Köln'],
  ],
};

function Harness() {
  const { dispatch } = useAppState();
  useEffect(() => {
    dispatch({ type: 'LOAD_SUCCESS', dataset });
  }, [dispatch]);
  return <ColumnVisibilityPanel />;
}

function renderPanel() {
  return render(
    <AppStateProvider>
      <Harness />
    </AppStateProvider>,
  );
}

function checkboxes() {
  return screen.getAllByRole('checkbox') as HTMLInputElement[];
}

describe('ColumnVisibilityPanel', () => {
  it('rendert eine Checkbox pro Spalte', () => {
    renderPanel();
    expect(checkboxes()).toHaveLength(3);
  });

  it('blendet eine Spalte beim Umschalten aus', () => {
    renderPanel();
    const checkbox = screen.getByRole('checkbox', {
      name: 'Name',
    }) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it('blendet mit "Keine" alle Spalten aus', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Keine' }));
    for (const checkbox of checkboxes()) {
      expect(checkbox.checked).toBe(false);
    }
  });

  it('blendet mit "Alle anzeigen" alle Spalten wieder ein', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Keine' }));
    fireEvent.click(screen.getByRole('button', { name: 'Alle anzeigen' }));
    for (const checkbox of checkboxes()) {
      expect(checkbox.checked).toBe(true);
    }
  });
});
