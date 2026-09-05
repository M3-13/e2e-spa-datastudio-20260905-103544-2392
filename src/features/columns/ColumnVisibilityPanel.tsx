import type { CSSProperties } from 'react';
import { useAppState } from '../../state/AppStateContext';

const actionsStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-1)',
  marginBottom: 'var(--space-2)',
};

const compactButtonStyle: CSSProperties = {
  padding: '8px 16px',
};

const listStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: 'var(--space-1)',
};

const itemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-1)',
  cursor: 'pointer',
};

const checkboxStyle: CSSProperties = {
  width: '16px',
  height: '16px',
  accentColor: 'var(--color-accent)',
  cursor: 'pointer',
  flexShrink: 0,
};

const labelStyle: CSSProperties = {
  fontSize: '14px',
  color: 'var(--color-fg)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export default function ColumnVisibilityPanel() {
  const { state, dispatch } = useAppState();
  const { dataset, visibleColumnIds, status } = state;

  if (!dataset || status !== 'ready') {
    return null;
  }

  const columns = dataset.columns;
  const visibleSet =
    visibleColumnIds === null
      ? new Set(columns.map((column) => column.id))
      : new Set(visibleColumnIds);

  const allVisible = columns.every((column) => visibleSet.has(column.id));
  const noneVisible = columns.every((column) => !visibleSet.has(column.id));

  function toggleColumn(columnId: string) {
    dispatch({ type: 'TOGGLE_COLUMN', columnId });
  }

  function showAll() {
    for (const column of columns) {
      if (!visibleSet.has(column.id)) {
        dispatch({ type: 'TOGGLE_COLUMN', columnId: column.id });
      }
    }
  }

  function hideAll() {
    for (const column of columns) {
      if (visibleSet.has(column.id)) {
        dispatch({ type: 'TOGGLE_COLUMN', columnId: column.id });
      }
    }
  }

  return (
    <section className="panel" aria-label="Spaltenauswahl">
      <h2 className="panel-title">Spalten</h2>
      <div style={actionsStyle}>
        <button
          type="button"
          className="btn btn-secondary"
          style={compactButtonStyle}
          onClick={showAll}
          disabled={allVisible}
        >
          Alle anzeigen
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          style={compactButtonStyle}
          onClick={hideAll}
          disabled={noneVisible}
        >
          Keine
        </button>
      </div>
      <div style={listStyle}>
        {columns.map((column) => (
          <label key={column.id} style={itemStyle}>
            <input
              type="checkbox"
              style={checkboxStyle}
              checked={visibleSet.has(column.id)}
              onChange={() => toggleColumn(column.id)}
            />
            <span style={labelStyle}>{column.name}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
