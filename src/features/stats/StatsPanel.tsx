import type { CSSProperties } from 'react';
import { useAppState } from '../../state/AppStateContext';
import { applyFilters, getVisibleColumns } from '../../data/pipeline';
import { computeStats, type ColumnStats } from './statsEngine';
import type { ColumnDef } from '../../types';

function formatNumber(value: number | null): string {
  if (value === null) {
    return '–';
  }
  if (Number.isInteger(value)) {
    return value.toLocaleString('de-DE');
  }
  return value.toLocaleString('de-DE', { maximumFractionDigits: 4 });
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 'var(--space-2)',
};

const cardStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3)',
  backgroundColor: 'var(--color-bg)',
};

const cardTitleStyle: CSSProperties = {
  margin: '0 0 var(--space-2)',
  fontSize: '14px',
  fontWeight: 600,
};

const listStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: 'var(--space-1) var(--space-2)',
  margin: 0,
};

const labelStyle: CSSProperties = {
  margin: 0,
  color: 'var(--color-muted)',
  fontSize: '13px',
};

const valueStyle: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-mono)',
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'right',
  fontSize: '13px',
};

function StatRow({ label, value }: { label: string; value: number | null }) {
  return (
    <>
      <dt style={labelStyle}>{label}</dt>
      <dd style={valueStyle}>{formatNumber(value)}</dd>
    </>
  );
}

function StatsCard({ column, stats }: { column: ColumnDef; stats: ColumnStats }) {
  return (
    <div style={cardStyle}>
      <h3 style={cardTitleStyle}>{column.name}</h3>
      <dl style={listStyle}>
        <StatRow label="Anzahl" value={stats.count} />
        <StatRow label="Summe" value={stats.sum} />
        <StatRow label="Mittelwert" value={stats.mean} />
        <StatRow label="Minimum" value={stats.min} />
        <StatRow label="Maximum" value={stats.max} />
        <StatRow label="Fehlend" value={stats.missing} />
      </dl>
    </div>
  );
}

export default function StatsPanel() {
  const { state } = useAppState();
  const { dataset, visibleColumnIds, filters, status } = state;

  if (!dataset || status !== 'ready') {
    return null;
  }

  const visibleColumns = getVisibleColumns(dataset, visibleColumnIds);
  const filteredRows = applyFilters(dataset, filters);
  const numericColumns = visibleColumns.filter((c) => c.type === 'number');

  if (numericColumns.length === 0) {
    return null;
  }

  return (
    <section className="panel stats-panel" aria-label="Kennzahlen">
      <h2 className="panel-title">Kennzahlen</h2>
      <div style={gridStyle}>
        {numericColumns.map((column) => (
          <StatsCard
            key={column.id}
            column={column}
            stats={computeStats(dataset, visibleColumns, filteredRows, column.id)}
          />
        ))}
      </div>
    </section>
  );
}
