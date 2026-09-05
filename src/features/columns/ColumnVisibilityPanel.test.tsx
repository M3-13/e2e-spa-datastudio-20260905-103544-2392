import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ColumnVisibilityPanel from './ColumnVisibilityPanel';
import { AppStateProvider, useAppState } from '../../state/AppStateContext';
import type { Dataset } from '../../types';

const dataset: Dataset = {
  columns: [
    { id: 'col-0', name: 'Name', type: 'text' },
    { id: 'col-1', name: 'Alter', type: 'number' },
    { id: 'col-2', name: 'Stadt', type: 'text' },
  ],
  fileName: 'test.csv',
  rows: [['Alice', '30', 'Berlin']],
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

function checkboxes(): HTMLInputElement[] {
  return screen.getAllByRole('checkbox') as HTMLInputElement[];
}

describe('ColumnVisibilityPanel', () => {
  it('zeigt fuer jede Spalte eine Checkbox', () => {
    renderPanel();
    expect(checkboxes()).toHaveLength(3);
    expect(screen.getByLabelText('Name')).toBeDefined();
    expect(screen.getByLabelText('Alter')).toBeDefined();
    expect(screen.getByLabelText('Stadt')).toBeDefined();
  });

  it('blendet eine Spalte per Klick aus', () => {
    renderPanel();
    const alter = screen.getByLabelText('Alter') as HTMLInputElement;
    expect(alter.checked).toBe(true);
    fireEvent.click(alter);
    expect(alter.checked).toBe(false);
  });

  it('Keine blendet alle Spalten aus', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Keine' }));
    for (const checkbox of checkboxes()) {
      expect(checkbox.checked).toBe(false);
    }
  });

  it('Alle anzeigen blendet alle Spalten wieder ein', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Keine' }));
    fireEvent.click(screen.getByRole('button', { name: 'Alle anzeigen' }));
    for (const checkbox of checkboxes()) {
      expect(checkbox.checked).toBe(true);
    }
  });
});
