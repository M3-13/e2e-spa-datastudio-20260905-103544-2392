import { useAppState } from '../../state/AppStateContext';

export default function StatusPanel() {
  const { state, dispatch } = useAppState();

  switch (state.status) {
    case 'loading':
      return (
        <div className="card" role="status">
          <p className="muted">Datei wird geladen …</p>
        </div>
      );

    case 'error':
      return (
        <div className="card" role="alert">
          <p style={{ color: 'var(--color-error)' }}>
            {state.errorMessage ?? 'Die Datei konnte nicht geladen werden.'}
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => dispatch({ type: 'CLEAR_ALL' })}
          >
            Erneut laden
          </button>
        </div>
      );

    case 'empty':
      return (
        <div className="card">
          <p className="muted">
            Noch keine Daten geladen. Wählen Sie eine CSV-Datei aus oder ziehen
            Sie sie in den Ablagebereich.
          </p>
        </div>
      );

    case 'ready':
      return null;
  }
}
