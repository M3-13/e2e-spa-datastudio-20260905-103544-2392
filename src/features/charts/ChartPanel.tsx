import type { ChangeEvent } from 'react';
import { useAppState } from '../../state/AppStateContext';
import { applyFilters, getVisibleColumns } from '../../data/pipeline';
import type { ChartType } from '../../types';
import BarChart from './BarChart';
import LineChart from './LineChart';

export default function ChartPanel() {
  const { state, dispatch } = useAppState();
  const { status, dataset, visibleColumnIds, filters, chartColumnId, chartType } =
    state;

  if (status !== 'ready' || !dataset || dataset.columns.length === 0) {
    return null;
  }

  const visibleColumns = getVisibleColumns(dataset, visibleColumnIds);
  const filteredRows = applyFilters(dataset, filters);

  const selectedColumn =
    visibleColumns.find((column) => column.id === chartColumnId) ?? null;

  const handleColumnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_CHART', columnId: event.target.value });
  };

  const handleTypeChange = (type: ChartType) => {
    dispatch({ type: 'SET_CHART', chartType: type });
  };

  return (
    <section className="panel chart-panel">
      <style>{`
        .chart-panel .chart-controls {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          align-items: center;
          margin-bottom: var(--space-3);
        }
        .chart-panel .chart-select {
          min-height: 44px;
          padding: 8px 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background-color: var(--color-surface);
          color: var(--color-fg);
          font-family: var(--font-family);
          font-size: 14px;
        }
        .chart-panel .chart-type-toggle {
          display: inline-flex;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .chart-panel .chart-type-toggle button {
          min-height: 44px;
          padding: 8px 16px;
          border: none;
          cursor: pointer;
          font-family: var(--font-family);
          font-size: 14px;
          font-weight: 600;
          background-color: var(--color-surface);
          color: var(--color-fg);
        }
        .chart-panel .chart-type-toggle button[aria-pressed='true'] {
          background-color: var(--color-accent);
          color: #FFFFFF;
        }
        .chart-panel .chart-empty {
          padding: var(--space-6) var(--space-4);
          text-align: center;
        }
      `}</style>

      <h2 className="panel-title">Diagramm</h2>

      <div className="chart-controls">
        <select
          className="chart-select"
          aria-label="Diagrammspalte"
          value={selectedColumn ? selectedColumn.id : ''}
          onChange={handleColumnChange}
        >
          <option value="">Spalte wählen…</option>
          {visibleColumns.map((column) => (
            <option key={column.id} value={column.id}>
              {column.name}
            </option>
          ))}
        </select>

        <div className="chart-type-toggle" role="group" aria-label="Diagrammtyp">
          <button
            type="button"
            aria-pressed={chartType === 'bar'}
            onClick={() => handleTypeChange('bar')}
          >
            Balken
          </button>
          <button
            type="button"
            aria-pressed={chartType === 'line'}
            onClick={() => handleTypeChange('line')}
          >
            Linie
          </button>
        </div>
      </div>

      {!selectedColumn ? (
        <div className="chart-empty muted">
          Wählen Sie eine Spalte aus, um ein Diagramm zu zeichnen.
        </div>
      ) : chartType === 'bar' ? (
        <BarChart
          columns={dataset.columns}
          rows={filteredRows}
          columnId={selectedColumn.id}
        />
      ) : (
        <LineChart
          columns={dataset.columns}
          rows={filteredRows}
          columnId={selectedColumn.id}
        />
      )}
    </section>
  );
}
