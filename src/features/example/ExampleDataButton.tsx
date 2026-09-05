import { useAppState } from '../../state/AppStateContext';
import { parseCsv } from '../../data/csvParser';
import { EXAMPLE_CSV } from '../../data/exampleData';

export default function ExampleDataButton() {
  const { dispatch } = useAppState();

  const handleClick = () => {
    try {
      const dataset = parseCsv(EXAMPLE_CSV);
      dispatch({
        type: 'LOAD_SUCCESS',
        dataset: { ...dataset, fileName: 'Beispieldatensatz.csv' },
      });
    } catch (error) {
      dispatch({
        type: 'LOAD_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Der Beispieldatensatz konnte nicht geladen werden.',
      });
    }
  };

  return (
    <button type="button" className="btn btn-secondary" onClick={handleClick}>
      Beispieldatensatz laden
    </button>
  );
}
