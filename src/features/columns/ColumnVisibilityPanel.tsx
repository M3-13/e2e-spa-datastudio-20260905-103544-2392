import type { CSSProperties } from 'react';
import { getVisibleColumns } from '../../data/pipeline';
import { useAppState } from '../../state/AppStateContext';

const actionsStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-1)',
  flexWrap: 'wrap',
  marginBottom: 'var(--space-2)',
};

const compactButtonStyle: CSSProperties = {
  padding: '8px 16px',
};

const listStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1)',
};

const labelStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-1)',
  fontSize: '14px',
  cursor: 'pointer',
};

const checkboxStyle: CSSProperties = {
  accentColor: 'var(--color-accent)',
};

export default function ColumnVisibilityPanel() {
  const { state, dispatch } = useAppState();
  const { dataset, visibleColumnIds } = state;

  if (dataset === null) {
    return null;
  }

  const columns = dataset.columns;
  const visibleColumns = getVisibleColumns(dataset, visibleColumnIds);
  const visibleIds = new Set(visibleColumns.map((column) => column.id));
  const allVisible = visibleIds.size === columns.length;
  const noneVisible = visibleIds.size === 0;

  const handleToggle = (columnId: string) => {
    dispatch({ type: 'TOGGLE_COLUMN', columnId });
  };

  const handleShowAll = () => {
    for (const column of columns) {
      if (!visibleIds.has(column.id)) {
        dispatch({ type: 'TOGGLE_COLUMN', columnId: column.id });
      }
    }
  };

  const handleHideAll = () => {
    for (const column of columns) {
      if (visibleIds.has(column.id)) {
        dispatch({ type: 'TOGGLE_COLUMN', columnId: column.id });
      }
    }
  };

  return (
    <section className="panel">
      <h2 className="panel-title">Spalten</h2>
      <div style={actionsStyle}>
        <button
          type="button"
          className="btn btn-ghost"
          style={compactButtonStyle}
          onClick={handleShowAll}
          disabled={allVisible}
        >
          Alle anzeigen
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={compactButtonStyle}
          onClick={handleHideAll}
          disabled={noneVisible}
        >
          Keine
        </button>
      </div>
      <ul style={listStyle}>
        {columns.map((column) => (
          <li key={column.id}>
            <label style={labelStyle}>
              <input
                type="checkbox"
                style={checkboxStyle}
                checked={visibleIds.has(column.id)}
                onChange={() => handleToggle(column.id)}
              />
              <span>{column.name}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
