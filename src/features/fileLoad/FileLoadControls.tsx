import { useCallback, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { useAppState } from '../../state/AppStateContext';
import { parseCsv } from '../../data/csvParser';

const MAX_FILE_SIZE = 100 * 1024 * 1024;

export default function FileLoadControls() {
  const { dispatch } = useAppState();
  const [isDragging, setIsDragging] = useState(false);

  const loadFile = useCallback(
    (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        dispatch({
          type: 'LOAD_ERROR',
          message:
            'Die Datei ist zu groß. Das Limit liegt bei 100 MB pro Datei.',
        });
        return;
      }

      dispatch({ type: 'LOAD_START' });

      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : '';
        try {
          const dataset = parseCsv(text);
          dispatch({
            type: 'LOAD_SUCCESS',
            dataset: { ...dataset, fileName: file.name },
          });
        } catch (error) {
          dispatch({
            type: 'LOAD_ERROR',
            message:
              error instanceof Error
                ? error.message
                : 'Die Datei konnte nicht gelesen werden.',
          });
        }
      };
      reader.onerror = () => {
        dispatch({
          type: 'LOAD_ERROR',
          message: 'Die Datei konnte nicht gelesen werden.',
        });
      };
      reader.readAsText(file);
    },
    [dispatch],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadFile(file);
    }
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      loadFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="card">
      <h2 className="panel-title">CSV-Datei laden</h2>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: isDragging
            ? '2px solid var(--color-accent)'
            : '2px dashed var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: isDragging
            ? 'var(--color-accent_soft)'
            : 'var(--color-surface)',
          transition: 'border-color 0.15s ease, background-color 0.15s ease',
        }}
      >
        <p className="muted">
          Ziehen Sie eine CSV-Datei hierher, oder wählen Sie eine Datei aus.
        </p>
        <label className="btn btn-secondary">
          Datei auswählen
          <input
            type="file"
            accept=".csv"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
}
