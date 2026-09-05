import type { CSSProperties } from 'react';
import { useAppState } from '../../state/AppStateContext';
import { applyFilters, getVisibleColumns, parseNumber } from '../../data/pipeline';
import type { ColumnDef, Row, SortState } from '../../types';
import SearchBar from './SearchBar';
import Pagination from './Pagination';

function matchesSearch(
  row: Row,
  columnIndexes: number[],
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') {
    return true;
  }
  return columnIndexes.some((index) =>
    (row[index] ?? '').toLowerCase().includes(q),
  );
}

function compareCells(
  a: string,
  b: string,
  type: ColumnDef['type'],
): number {
  if (type === 'number') {
    const an = parseNumber(a);
    const bn = parseNumber(b);
    if (an !== null && bn !== null) {
      return an - bn;
    }
  }
  return a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });
}

const sortButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  background: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
  font: 'inherit',
  color: 'inherit',
  cursor: 'pointer',
};

const sortArrowStyle: CSSProperties = {
  fontSize: 11,
  lineHeight: 1,
};

export default function DataTable() {
  const { state, dispatch } = useAppState();
  const { dataset, visibleColumnIds, sort, page, pageSize, searchQuery, filters, status } =
    state;

  if (status !== 'ready' || dataset === null) {
    return null;
  }

  const columns = getVisibleColumns(dataset, visibleColumnIds);
  const columnIndexes = columns.map(
    (column) => dataset.columns.findIndex((c) => c.id === column.id),
  );

  const filteredRows = applyFilters(dataset, filters);
  const searchedRows = filteredRows.filter((row) =>
    matchesSearch(row, columnIndexes, searchQuery),
  );

  let sortedRows = searchedRows;
  let sortIndex = -1;
  let sortColumn: ColumnDef | undefined;
  if (sort !== null) {
    sortIndex = dataset.columns.findIndex((c) => c.id === sort.columnId);
    sortColumn = sortIndex >= 0 ? dataset.columns[sortIndex] : undefined;
    if (sortColumn !== undefined) {
      const columnType = sortColumn.type;
      const direction = sort.direction === 'asc' ? 1 : -1;
      sortedRows = [...searchedRows].sort(
        (a, b) => direction * compareCells(a[sortIndex] ?? '', b[sortIndex] ?? '', columnType),
      );
    }
  }

  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageRows = sortedRows.slice(startIndex, startIndex + pageSize);

  function handleSort(columnId: string) {
    let nextSort: SortState;
    if (sort !== null && sort.columnId === columnId) {
      nextSort = {
        columnId,
        direction: sort.direction === 'asc' ? 'desc' : 'asc',
      };
    } else {
      nextSort = { columnId, direction: 'asc' };
    }
    dispatch({ type: 'SET_SORT', sort: nextSort });
  }

  return (
    <section aria-label="Datentabelle">
      <SearchBar />
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => {
                const isSorted = sort !== null && sort.columnId === column.id;
                const numeric = column.type === 'number';
                return (
                  <th
                    key={column.id}
                    style={{
                      textAlign: numeric ? 'right' : 'left',
                      color: isSorted ? 'var(--color-accent)' : undefined,
                    }}
                    aria-sort={
                      isSorted
                        ? sort.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    <button
                      type="button"
                      style={sortButtonStyle}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.name}
                      <span style={sortArrowStyle} aria-hidden="true">
                        {isSorted ? (sort.direction === 'asc' ? '↑' : '↓') : ''}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columnIndexes.map((index, colIndex) => {
                  const column = columns[colIndex];
                  const numeric = column.type === 'number';
                  return (
                    <td
                      key={column.id}
                      className={numeric ? 'mono' : undefined}
                      style={{ textAlign: numeric ? 'right' : 'left' }}
                    >
                      {row[index] ?? ''}
                    </td>
                  );
                })}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="muted"
                  style={{ textAlign: 'center', padding: '24px 16px' }}
                >
                  Keine Zeilen für diese Auswahl.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination totalRows={totalRows} />
    </section>
  );
}
