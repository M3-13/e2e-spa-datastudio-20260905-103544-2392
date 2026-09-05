import { useState } from 'react';
import { useAppState } from '../../state/AppStateContext';
import { clearPersistedState } from '../../state/persistence';

export default function ClearDataButton() {
  const { dispatch } = useAppState();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setConfirming(true)}
      >
        Daten löschen
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => {
          dispatch({ type: 'CLEAR_ALL' });
          clearPersistedState();
          setConfirming(false);
        }}
      >
        Wirklich löschen?
      </button>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setConfirming(false)}
      >
        Abbrechen
      </button>
    </>
  );
}
