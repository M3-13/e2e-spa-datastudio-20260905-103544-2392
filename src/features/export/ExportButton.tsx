import { useAppState } from '../../state/AppStateContext';
import { applyFilters, getVisibleColumns } from '../../data/pipeline';
import { buildExportFileName, exportCsv } from './exportCsv';

export default function ExportButton() {
  const { state } = useAppState();
  const { dataset, visibleColumnIds, filters } = state;
  const disabled = state.status !== 'ready' || dataset === null;

  const handleExport = () => {
    if (dataset === null) {
      return;
    }

    const visibleColumns = getVisibleColumns(dataset, visibleColumnIds);
    const filteredRows = applyFilters(dataset, filters);
    const csv = exportCsv(dataset, visibleColumns, filteredRows);
    const fileName = buildExportFileName(dataset.fileName);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      className="btn btn-secondary"
      disabled={disabled}
      onClick={handleExport}
    >
      CSV exportieren
    </button>
  );
}
