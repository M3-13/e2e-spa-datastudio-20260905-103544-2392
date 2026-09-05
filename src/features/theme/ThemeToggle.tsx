import { useEffect } from 'react';
import { useAppState } from '../../state/AppStateContext';

export default function ThemeToggle() {
  const { state, dispatch } = useAppState();
  const isDark = state.theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <button
      type="button"
      className="btn btn-secondary"
      aria-pressed={isDark}
      aria-label={
        isDark ? 'Auf hellen Modus wechseln' : 'Auf dunklen Modus wechseln'
      }
      onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
    >
      {isDark ? 'Hell' : 'Dunkel'}
    </button>
  );
}
