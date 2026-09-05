import type { CSSProperties } from 'react';
import { useAppState } from '../../state/AppStateContext';

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '8px 12px',
  minHeight: 44,
  fontSize: 14,
  color: 'var(--color-fg)',
};

export default function SearchBar() {
  const { state, dispatch } = useAppState();

  return (
    <div style={{ marginBottom: 'var(--space-2)' }}>
      <input
        type="search"
        role="searchbox"
        aria-label="Volltextsuche"
        placeholder="Suche…"
        style={inputStyle}
        value={state.searchQuery}
        onChange={(event) =>
          dispatch({ type: 'SET_SEARCH', query: event.target.value })
        }
      />
    </div>
  );
}
