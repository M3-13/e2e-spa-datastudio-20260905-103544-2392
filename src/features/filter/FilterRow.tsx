import { useEffect, useState, type CSSProperties } from 'react';
import { useAppState } from '../../state/AppStateContext';
import { getVisibleColumns } from '../../data/pipeline';
import type { ColumnDef, ColumnFilter, FilterOp } from '../../types';

interface OpOption {
  value: FilterOp;
  label: string;
}

const TEXT_OPS: OpOption[] = [
  { value: 'contains', label: 'enthält' },
  { value: 'equals', label: 'gleich' },
  { value: 'startsWith', label: 'beginnt mit' },
];

const NUMBER_OPS: OpOption[] = [
  { value: 'eq', label: '=' },
  { value: 'lt', label: '<' },
  { value: 'gt', label: '>' },
  { value: 'between', label: 'zwischen' },
];

interface Draft {
  op: FilterOp;
  value: string;
  valueTo: string;
}

function defaultOpFor(column: ColumnDef): FilterOp {
  return column.type === 'number' ? 'eq' : 'contains';
}

function opsFor(column: ColumnDef): OpOption[] {
  return column.type === 'number' ? NUMBER_OPS : TEXT_OPS;
}

function buildDrafts(filters: ColumnFilter[]): Record<string, Draft> {
  const out: Record<string, Draft> = {};
  for (const filter of filters) {
    out[filter.columnId] = {
      op: filter.op,
      value: filter.value,
      valueTo: filter.valueTo ?? '',
    };
  }
  return out;
}

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-1)',
  flexWrap: 'wrap',
};

const columnLabelStyle: CSSProperties = {
  minWidth: '120px',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--color-fg)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const fieldStyle: CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '8px 12px',
  minHeight: '44px',
  color: 'var(--color-fg)',
  fontSize: '14px',
  fontFamily: 'var(--font-family)',
};

const selectStyle: CSSProperties = {
  ...fieldStyle,
  cursor: 'pointer',
};

const valueInputStyle: CSSProperties = {
  ...fieldStyle,
  flex: '1 1 160px',
  minWidth: '120px',
};

const valueToInputStyle: CSSProperties = {
  ...fieldStyle,
  flex: '1 1 160px',
  minWidth: '120px',
};

export default function FilterRow() {
  const { state, dispatch } = useAppState();
  const dataset = state.dataset;
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    buildDrafts(state.filters),
  );

  useEffect(() => {
    setDrafts(buildDrafts(state.filters));
  }, [dataset]);

  if (!dataset) {
    return null;
  }

  const visibleColumns = getVisibleColumns(dataset, state.visibleColumnIds);

  if (visibleColumns.length === 0) {
    return null;
  }

  function syncDraft(columnId: string, draft: Draft) {
    const active =
      draft.op === 'between'
        ? draft.value.trim() !== '' && draft.valueTo.trim() !== ''
        : draft.value.trim() !== '';

    if (active) {
      const patch: Partial<ColumnFilter> = {
        op: draft.op,
        value: draft.value,
      };
      if (draft.op === 'between') {
        patch.valueTo = draft.valueTo;
      } else {
        patch.valueTo = undefined;
      }
      dispatch({ type: 'SET_COLUMN_FILTER', columnId, patch });
    } else {
      dispatch({ type: 'REMOVE_COLUMN_FILTER', columnId });
    }
  }

  function updateDraft(columnId: string, partial: Partial<Draft>) {
    const current = drafts[columnId] ?? {
      op: defaultOpFor(
        visibleColumns.find((column) => column.id === columnId) ?? {
          id: columnId,
          name: columnId,
          type: 'text',
        },
      ),
      value: '',
      valueTo: '',
    };
    const next = { ...current, ...partial };
    setDrafts((prev) => ({ ...prev, [columnId]: next }));
    syncDraft(columnId, next);
  }

  function removeFilter(columnId: string) {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[columnId];
      return next;
    });
    dispatch({ type: 'REMOVE_COLUMN_FILTER', columnId });
  }

  return (
    <section className="panel">
      <h2 className="panel-title">Filter</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {visibleColumns.map((column) => {
          const draft = drafts[column.id] ?? {
            op: defaultOpFor(column),
            value: '',
            valueTo: '',
          };
          const options = opsFor(column);
          const isNumber = column.type === 'number';

          return (
            <div key={column.id} style={rowStyle}>
              <span style={columnLabelStyle} title={column.name}>
                {column.name}
              </span>
              <select
                value={draft.op}
                onChange={(event) =>
                  updateDraft(column.id, { op: event.target.value as FilterOp })
                }
                style={selectStyle}
                aria-label={`Operator für ${column.name}`}
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                inputMode={isNumber ? 'decimal' : 'text'}
                value={draft.value}
                onChange={(event) =>
                  updateDraft(column.id, { value: event.target.value })
                }
                placeholder={isNumber ? 'Wert' : 'Text'}
                style={valueInputStyle}
                aria-label={`Wert für ${column.name}`}
              />
              {draft.op === 'between' && (
                <input
                  type="text"
                  inputMode="decimal"
                  value={draft.valueTo}
                  onChange={(event) =>
                    updateDraft(column.id, { valueTo: event.target.value })
                  }
                  placeholder="bis"
                  style={valueToInputStyle}
                  aria-label={`Bis-Wert für ${column.name}`}
                />
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => removeFilter(column.id)}
                style={{ padding: '8px 12px', minHeight: '44px' }}
                aria-label={`Filter für ${column.name} entfernen`}
              >
                Entfernen
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
