import type { CSSProperties } from 'react';
import { useAppState } from '../../state/AppStateContext';

const PAGE_SIZES = [10, 25, 50, 100];

const toolbarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-3)',
  flexWrap: 'wrap',
  marginTop: 'var(--space-2)',
};

const pageSizeGroupStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-1)',
};

const selectStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '8px 12px',
  minHeight: 44,
  fontSize: 14,
  color: 'var(--color-fg)',
};

const infoStyle: CSSProperties = {
  color: 'var(--color-muted)',
  fontSize: 13,
};

const buttonStyle: CSSProperties = {
  width: 36,
  height: 36,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-fg)',
  fontSize: 14,
  cursor: 'pointer',
};

const activeButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: 'var(--color-accent)',
  color: '#FFFFFF',
  borderColor: 'var(--color-accent)',
};

interface PaginationProps {
  totalRows: number;
}

export default function Pagination({ totalRows }: PaginationProps) {
  const { state, dispatch } = useAppState();
  const { page, pageSize } = state;

  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const first = totalRows === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const last = Math.min(safePage * pageSize, totalRows);

  return (
    <div style={toolbarStyle}>
      <label style={pageSizeGroupStyle}>
        <span className="muted" style={{ fontSize: 13 }}>
          Zeilen pro Seite
        </span>
        <select
          style={selectStyle}
          value={pageSize}
          onChange={(event) => {
            dispatch({ type: 'SET_PAGE_SIZE', pageSize: Number(event.target.value) });
            dispatch({ type: 'SET_PAGE', page: 1 });
          }}
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
        <button
          type="button"
          style={buttonStyle}
          disabled={safePage <= 1}
          onClick={() => dispatch({ type: 'SET_PAGE', page: safePage - 1 })}
          aria-label="Vorherige Seite"
        >
          ←
        </button>
        <span style={infoStyle}>
          {first}–{last} von {totalRows}
        </span>
        <button
          type="button"
          style={buttonStyle}
          disabled={safePage >= totalPages}
          onClick={() => dispatch({ type: 'SET_PAGE', page: safePage + 1 })}
          aria-label="Nächste Seite"
        >
          →
        </button>
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-0)' }}>
        <span className="muted" style={{ fontSize: 13, marginRight: 'var(--space-1)' }}>
          Seite
        </span>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            style={p === safePage ? activeButtonStyle : buttonStyle}
            onClick={() => dispatch({ type: 'SET_PAGE', page: p })}
            aria-current={p === safePage ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
