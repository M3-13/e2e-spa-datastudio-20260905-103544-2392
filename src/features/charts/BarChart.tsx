import type { ColumnDef, Row } from '../../types';

export interface BarDatum {
  label: string;
  count: number;
}

export function countFrequencies(rows: Row[], columnIndex: number): BarDatum[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const raw = row[columnIndex] ?? '';
    const key = raw.trim() === '' ? '(leer)' : raw;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries(), ([label, count]) => ({ label, count }));
}

function truncateLabel(label: string, maxLength = 12): string {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label;
}

const FONT_SIZE = 12;
const AVG_GLYPH_WIDTH = 7;
const ROTATION_RADIANS = Math.PI / 4;

export function rotatedLabelWidth(labelLength: number): number {
  return (
    labelLength * AVG_GLYPH_WIDTH * Math.cos(ROTATION_RADIANS) +
    FONT_SIZE * Math.sin(ROTATION_RADIANS)
  );
}

export function labelTruncationLength(categoryCount: number): number {
  if (categoryCount <= 6) {
    return 12;
  }
  if (categoryCount <= 20) {
    return 8;
  }
  if (categoryCount <= 60) {
    return 5;
  }
  return 4;
}

interface BarChartProps {
  columns: ColumnDef[];
  rows: Row[];
  columnId: string;
}

const HEIGHT = 320;
const MARGIN = { top: 20, right: 16, bottom: 56, left: 56 };
const BASE_WIDTH = 640;
const BASE_PLOT_WIDTH = BASE_WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const MIN_BAR_WIDTH = 8;
const MAX_BAR_WIDTH = 48;

export interface BarLayout {
  slotWidth: number;
  barWidth: number;
  plotWidth: number;
  totalWidth: number;
}

export function computeBarLayout(
  categoryCount: number,
  maxLabelLength = labelTruncationLength(categoryCount),
): BarLayout {
  const minSlot = Math.max(MIN_BAR_WIDTH * 1.25, rotatedLabelWidth(maxLabelLength));
  const slotWidth = Math.max(BASE_PLOT_WIDTH / categoryCount, minSlot);
  const barWidth = Math.min(
    Math.max(slotWidth * 0.75, MIN_BAR_WIDTH),
    MAX_BAR_WIDTH,
  );
  const plotWidth = slotWidth * categoryCount;
  const totalWidth = plotWidth + MARGIN.left + MARGIN.right;
  return { slotWidth, barWidth, plotWidth, totalWidth };
}

function makeTicks(max: number, count = 5): number[] {
  const step = Math.max(1, Math.ceil(max / (count - 1)));
  const ticks: number[] = [];
  for (let value = 0; value < max; value += step) {
    ticks.push(value);
  }
  ticks.push(max);
  return ticks;
}

export default function BarChart({ columns, rows, columnId }: BarChartProps) {
  const columnIndex = columns.findIndex((column) => column.id === columnId);
  const data = countFrequencies(rows, columnIndex);

  if (data.length === 0) {
    return null;
  }

  const maxCount = Math.max(...data.map((datum) => datum.count));
  const maxLabelLength = labelTruncationLength(data.length);
  const { slotWidth, barWidth, totalWidth } = computeBarLayout(
    data.length,
    maxLabelLength,
  );
  const ticks = makeTicks(maxCount);
  const rotateLabels = data.length > 6;

  const baselineY = MARGIN.top + PLOT_HEIGHT;
  const rightEdge = totalWidth - MARGIN.right;
  const yFor = (count: number) =>
    MARGIN.top + PLOT_HEIGHT - (count / maxCount) * PLOT_HEIGHT;

  const columnName = columns[columnIndex]?.name ?? columnId;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        className="chart-svg"
        viewBox={`0 0 ${totalWidth} ${HEIGHT}`}
        style={{ width: '100%', minWidth: totalWidth }}
        height={HEIGHT}
        role="img"
        aria-label={`Balkendiagramm der Spalte ${columnName}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <style>{`
          .chart-svg .bar { fill: var(--color-accent); }
          .chart-svg .bar:hover { fill: var(--color-chart_2); }
          .chart-svg .axis-line { stroke: var(--color-border); }
          .chart-svg .grid-line { stroke: var(--color-border); stroke-dasharray: 3 3; }
          .chart-svg .tick-label {
            fill: var(--color-muted);
            font-size: 12px;
            font-family: var(--font-family);
          }
        `}</style>

        {ticks.map((tick) => {
          const y = yFor(tick);
          return (
            <g key={tick}>
              <line
                className="grid-line"
                x1={MARGIN.left}
                y1={y}
                x2={rightEdge}
                y2={y}
              />
              <text
                className="tick-label"
                x={MARGIN.left - 8}
                y={y + 4}
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          );
        })}

        <line
          className="axis-line"
          x1={MARGIN.left}
          y1={baselineY}
          x2={rightEdge}
          y2={baselineY}
        />
        <line
          className="axis-line"
          x1={MARGIN.left}
          y1={MARGIN.top}
          x2={MARGIN.left}
          y2={baselineY}
        />

        {data.map((datum, index) => {
          const x =
            MARGIN.left + index * slotWidth + (slotWidth - barWidth) / 2;
          const height = (datum.count / maxCount) * PLOT_HEIGHT;
          const y = baselineY - height;
          const labelX = MARGIN.left + index * slotWidth + slotWidth / 2;
          const labelY = baselineY + 16;
          return (
            <g key={`${datum.label}-${index}`}>
              <rect
                className="bar"
                x={x}
                y={y}
                width={barWidth}
                height={height}
                rx={2}
              >
                <title>{`${datum.label}: ${datum.count}`}</title>
              </rect>
              <text
                className="tick-label"
                x={labelX}
                y={labelY}
                textAnchor={rotateLabels ? 'end' : 'middle'}
                transform={
                  rotateLabels ? `rotate(-45 ${labelX} ${labelY})` : undefined
                }
              >
                {truncateLabel(datum.label, maxLabelLength)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
