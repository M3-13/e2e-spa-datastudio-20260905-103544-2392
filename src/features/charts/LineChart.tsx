import type { ColumnDef, Row } from '../../types';
import { parseNumber } from '../../data/pipeline';

export interface LinePoint {
  index: number;
  value: number;
}

export function extractSeries(rows: Row[], columnIndex: number): LinePoint[] {
  const points: LinePoint[] = [];
  for (let index = 0; index < rows.length; index += 1) {
    const value = parseNumber(rows[index][columnIndex]);
    if (value !== null) {
      points.push({ index, value });
    }
  }
  return points;
}

function buildSegments(points: LinePoint[]): LinePoint[][] {
  const segments: LinePoint[][] = [];
  let current: LinePoint[] = [];
  for (const point of points) {
    if (current.length > 0 && point.index - current[current.length - 1].index > 1) {
      segments.push(current);
      current = [];
    }
    current.push(point);
  }
  if (current.length > 0) {
    segments.push(current);
  }
  return segments;
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(2).replace(/\.?0+$/, '');
}

interface LineChartProps {
  columns: ColumnDef[];
  rows: Row[];
  columnId: string;
}

const WIDTH = 640;
const HEIGHT = 320;
const MARGIN = { top: 20, right: 16, bottom: 40, left: 56 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

export default function LineChart({ columns, rows, columnId }: LineChartProps) {
  const columnIndex = columns.findIndex((column) => column.id === columnId);
  const points = extractSeries(rows, columnIndex);

  if (points.length === 0) {
    return (
      <div className="chart-empty muted">
        Für ein Liniendiagramm eine Spalte mit Zahlenwerten wählen.
      </div>
    );
  }

  const totalRows = Math.max(1, rows.length);
  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const xFor = (index: number) =>
    totalRows <= 1
      ? MARGIN.left + PLOT_WIDTH / 2
      : MARGIN.left + (index / (totalRows - 1)) * PLOT_WIDTH;
  const yFor = (value: number) =>
    MARGIN.top + PLOT_HEIGHT - ((value - minValue) / range) * PLOT_HEIGHT;

  const segments = buildSegments(points);

  const yTicks: number[] = [];
  if (maxValue === minValue) {
    yTicks.push(minValue);
  } else {
    const yTickCount = 5;
    for (let i = 0; i < yTickCount; i += 1) {
      yTicks.push(minValue + (range * i) / (yTickCount - 1));
    }
  }

  const xTickCount = Math.min(5, totalRows);
  const xTicks: number[] = [];
  for (let i = 0; i < xTickCount; i += 1) {
    xTicks.push(
      Math.round((i * (totalRows - 1)) / Math.max(1, xTickCount - 1)),
    );
  }

  const baselineY = MARGIN.top + PLOT_HEIGHT;
  const columnName = columns[columnIndex]?.name ?? columnId;

  return (
    <svg
      className="chart-svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height={HEIGHT}
      role="img"
      aria-label={`Liniendiagramm der Spalte ${columnName}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <style>{`
        .chart-svg .line-path {
          fill: none;
          stroke: var(--color-accent);
          stroke-width: 2px;
        }
        .chart-svg .point { fill: var(--color-accent); }
        .chart-svg .axis-line { stroke: var(--color-border); }
        .chart-svg .grid-line { stroke: var(--color-border); stroke-dasharray: 3 3; }
        .chart-svg .tick-label {
          fill: var(--color-muted);
          font-size: 12px;
          font-family: var(--font-family);
        }
      `}</style>

      {yTicks.map((tick) => {
        const y = yFor(tick);
        return (
          <g key={`y-${tick}`}>
            <line
              className="grid-line"
              x1={MARGIN.left}
              y1={y}
              x2={WIDTH - MARGIN.right}
              y2={y}
            />
            <text
              className="tick-label"
              x={MARGIN.left - 8}
              y={y + 4}
              textAnchor="end"
            >
              {formatNumber(tick)}
            </text>
          </g>
        );
      })}

      {xTicks.map((tick) => {
        const x = xFor(tick);
        return (
          <text
            key={`x-${tick}`}
            className="tick-label"
            x={x}
            y={baselineY + 16}
            textAnchor="middle"
          >
            {tick}
          </text>
        );
      })}

      <line
        className="axis-line"
        x1={MARGIN.left}
        y1={baselineY}
        x2={WIDTH - MARGIN.right}
        y2={baselineY}
      />
      <line
        className="axis-line"
        x1={MARGIN.left}
        y1={MARGIN.top}
        x2={MARGIN.left}
        y2={baselineY}
      />

      {segments.map((segment) => (
        <polyline
          key={segment.map((point) => point.index).join('-')}
          className="line-path"
          points={segment
            .map((point) => `${xFor(point.index)},${yFor(point.value)}`)
            .join(' ')}
        />
      ))}

      {points.map((point) => (
        <circle
          key={point.index}
          className="point"
          cx={xFor(point.index)}
          cy={yFor(point.value)}
          r={3}
        />
      ))}
    </svg>
  );
}
