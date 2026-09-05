import { AppStateProvider } from './state/AppStateContext';
import FileLoadControls from './features/fileLoad/FileLoadControls';
import StatusPanel from './features/status/StatusPanel';
import DataTable from './features/table/DataTable';
import ColumnVisibilityPanel from './features/columns/ColumnVisibilityPanel';
import FilterRow from './features/filter/FilterRow';
import StatsPanel from './features/stats/StatsPanel';
import ChartPanel from './features/charts/ChartPanel';
import ExportButton from './features/export/ExportButton';
import ThemeToggle from './features/theme/ThemeToggle';
import ExampleDataButton from './features/example/ExampleDataButton';
import ClearDataButton from './features/privacy/ClearDataButton';
import LegalFooter from './features/legal/LegalFooter';
import PrivacyNotice from './features/legal/PrivacyNotice';

export default function App() {
  return (
    <AppStateProvider>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">CSV-Datenstudio</h1>
          <div className="app-header-actions">
            <ThemeToggle />
            <ExampleDataButton />
            <ClearDataButton />
          </div>
        </header>

        <main className="app-main">
          <StatusPanel />
          <FileLoadControls />
          <ColumnVisibilityPanel />
          <FilterRow />
          <DataTable />
          <StatsPanel />
          <ChartPanel />
          <ExportButton />
        </main>

        <footer className="app-footer">
          <LegalFooter />
        </footer>

        <PrivacyNotice />
      </div>
    </AppStateProvider>
  );
}
