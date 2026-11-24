'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowData,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { clsx } from 'clsx';
import { AppIcon } from '../../@core/icons/registry';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    headerTitle?: string;
    headerClassName?: string;
    cellClassName?: string;
    skeleton?: React.ReactNode;
    filterVariant?: 'text' | 'select';
    filterOptions?: Array<{ label: string; value: string }>;
    expandedContent?: (row: TData) => React.ReactNode;
  }
}

export interface DataGridFetchParams {
  pageIndex: number;
  pageSize: number;
  sorting: Array<{ id: string; desc: boolean }>;
  filters: Array<{ id: string; value: unknown }>;
  searchQuery?: string;
}

export interface DataGridResponse<TData> {
  data: TData[];
  totalCount: number;
  pageCount: number;
}

export interface DataGridProps<TData extends { id: string }> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  loading?: boolean;
  searchPlaceholder?: string;
  exportFilename?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  selectable?: boolean;
  enableColumnFilters?: boolean;
  tableLayout?: { dense?: boolean; striped?: boolean; cellBorder?: boolean };
  renderExpandedRow?: (row: TData) => React.ReactNode;
  onBulkAction?: (selectedIds: string[]) => void;
  bulkActionLabel?: string;
  /** Optional server-mode wiring: supply totalCount/pageCount + callback */
  serverMode?: boolean;
  pageCount?: number;
  totalCount?: number;
  onFetchParamsChange?: (params: DataGridFetchParams) => void;
}

export function DataGrid<TData extends { id: string }>({
  data,
  columns,
  loading = false,
  searchPlaceholder = 'Search records...',
  exportFilename = 'export.csv',
  pageSize = 8,
  pageSizeOptions = [8, 10, 25, 50],
  selectable = false,
  enableColumnFilters = false,
  tableLayout,
  renderExpandedRow,
  onBulkAction,
  bulkActionLabel = 'Action selected',
  serverMode = false,
  pageCount,
  totalCount,
  onFetchParamsChange,
}: DataGridProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize });
  const [showColMenu, setShowColMenu] = React.useState(false);

  React.useEffect(() => {
    if (!showColMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowColMenu(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showColMenu]);

  React.useEffect(() => {
    if (!serverMode || !onFetchParamsChange) return;
    onFetchParamsChange({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      filters: columnFilters,
      searchQuery: globalFilter || undefined,
    });
  }, [serverMode, onFetchParamsChange, pagination, sorting, columnFilters, globalFilter]);

  const effectiveColumns = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    const prefix: ColumnDef<TData, unknown>[] = [];
    if (renderExpandedRow) {
      prefix.push({
        id: '_expand',
        header: () => null,
        cell: ({ row }) => (
          <button
            type="button"
            aria-expanded={Boolean(expandedRows[row.id])}
            aria-label={expandedRows[row.id] ? 'Collapse row' : 'Expand row'}
            onClick={() => setExpandedRows((prev) => ({ ...prev, [row.id]: !prev[row.id] }))}
            className="inline-flex items-center justify-center p-1"
          >
            <AppIcon name={expandedRows[row.id] ? 'chevron-down' : 'chevron-right'} size={14} />
          </button>
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }
    if (selectable) {
      prefix.push({
        id: '_select',
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all rows"
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected();
            }}
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select row ${row.id}`}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }
    return [...prefix, ...columns];
  }, [columns, selectable, renderExpandedRow, expandedRows]);

  const table = useReactTable({
    data,
    columns: effectiveColumns,
    state: { sorting, globalFilter, columnFilters, columnVisibility, rowSelection, pagination },
    manualPagination: serverMode,
    manualSorting: serverMode,
    manualFiltering: serverMode,
    pageCount: serverMode ? (pageCount ?? -1) : undefined,
    onSortingChange: setSorting,
    onGlobalFilterChange: (val) => {
      setGlobalFilter(val);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: serverMode ? undefined : getSortedRowModel(),
    getFilteredRowModel: serverMode ? undefined : getFilteredRowModel(),
    getPaginationRowModel: serverMode ? undefined : getPaginationRowModel(),
  });

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);

  const handleExportCsv = () => {
    const visibleCols = table.getVisibleLeafColumns().filter((c) => c.id !== '_select');
    const header = visibleCols.map((c) => JSON.stringify(String(c.id))).join(',');
    const rows = table.getRowModel().rows.map((row) =>
      visibleCols.map((c) => JSON.stringify(row.getValue(c.id) ?? '')).join(','),
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFilename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <span
            style={{ color: 'var(--color-text-muted)' }}
            className="pointer-events-none absolute inset-y-0 start-3 flex items-center"
          >
            <AppIcon name="search" size={15} />
          </span>
          <input
            type="search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            style={{
              backgroundColor: 'var(--color-canvas)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
            }}
            className="h-9 w-full border pe-3 ps-9 text-sm"
          />
        </div>

        <div className="relative flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && onBulkAction && (
            <Button
              variant="tonal"
              tone="primary"
              size="sm"
              onClick={() => onBulkAction(selectedIds)}
            >
              {bulkActionLabel} ({selectedIds.length})
            </Button>
          )}

          <div className="relative">
            <Button
              variant="outline"
              tone="neutral"
              size="sm"
              aria-expanded={showColMenu}
              onClick={() => setShowColMenu((v) => !v)}
            >
              <AppIcon name="table" size={14} />
              <span>Columns</span>
            </Button>
            {showColMenu && (
              <div
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 'var(--z-popover)',
                }}
                className="absolute end-0 mt-1.5 w-44 space-y-1 border p-2 text-xs"
              >
                {table
                  .getAllLeafColumns()
                  .filter((c) => c.getCanHide())
                  .map((col) => (
                    <label
                      key={col.id}
                      className="flex cursor-pointer items-center gap-2 px-1.5 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={col.getIsVisible()}
                        onChange={col.getToggleVisibilityHandler()}
                      />
                      <span className="truncate capitalize">
                        {(col.columnDef.meta as { headerTitle?: string } | undefined)?.headerTitle ?? col.id}
                      </span>
                    </label>
                  ))}
              </div>
            )}
          </div>

          <Button variant="outline" tone="neutral" size="sm" onClick={handleExportCsv}>
            <AppIcon name="download" size={14} />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Scrollable Table */}
      <div
        style={{ borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
        className="overflow-x-auto border"
      >
        <table
          role="grid"
          onKeyDown={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName !== 'TD') return;
            const row = target.parentElement as HTMLTableRowElement | null;
            if (!row) return;
            const cells = Array.from(row.cells) as HTMLElement[];
            const colIdx = cells.indexOf(target);
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              cells[colIdx + 1]?.focus();
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              cells[colIdx - 1]?.focus();
            } else if (e.key === 'Home') {
              e.preventDefault();
              cells[0]?.focus();
            } else if (e.key === 'End') {
              e.preventDefault();
              cells[cells.length - 1]?.focus();
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              const nextRow = row.nextElementSibling as HTMLTableRowElement | null;
              (nextRow?.cells[colIdx] as HTMLElement | undefined)?.focus();
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              const prevRow = row.previousElementSibling as HTMLTableRowElement | null;
              (prevRow?.cells[colIdx] as HTMLElement | undefined)?.focus();
            }
          }}
          className="w-full border-collapse text-start text-sm"
        >
          <thead
            style={{ backgroundColor: 'var(--color-canvas)', color: 'var(--color-text-muted)' }}
            className="sticky top-0 text-xs uppercase tracking-wider"
          >
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={
                        header.column.getCanSort()
                          ? sorted === 'asc'
                            ? 'ascending'
                            : sorted === 'desc'
                              ? 'descending'
                              : 'none'
                          : undefined
                      }
                      className="px-4 py-3 text-start font-semibold"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex cursor-pointer items-center gap-1 select-none"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === 'asc' && ' ↑'}
                          {sorted === 'desc' && ' ↓'}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
            {enableColumnFilters && (
              <tr style={{ borderColor: 'var(--color-border)' }} className="border-t">
                {table.getHeaderGroups()[0]?.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  if (!header.column.getCanFilter() || header.id.startsWith('_')) {
                    return <th key={header.id} className="px-4 py-2" />;
                  }
                  const val = (header.column.getFilterValue() as string) ?? '';
                  return (
                    <th key={header.id} className="px-4 py-2 font-normal">
                      {meta?.filterVariant === 'select' && meta.filterOptions ? (
                        <select
                          aria-label={`Filter ${meta.headerTitle ?? header.id}`}
                          value={val}
                          onChange={(e) => header.column.setFilterValue(e.target.value || undefined)}
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                            borderRadius: 'var(--radius-sm)',
                          }}
                          className="h-7 w-full border px-2 text-xs"
                        >
                          <option value="">All</option>
                          {meta.filterOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          aria-label={`Filter ${meta?.headerTitle ?? header.id}`}
                          value={val}
                          onChange={(e) => header.column.setFilterValue(e.target.value || undefined)}
                          placeholder="Filter..."
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                            borderRadius: 'var(--radius-sm)',
                          }}
                          className="h-7 w-full border px-2 text-xs"
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderColor: 'var(--color-border)' }} className="border-t">
                  {effectiveColumns.map((col, j) => {
                    const meta = col.meta as { skeleton?: React.ReactNode } | undefined;
                    return (
                      <td key={j} className="px-4 py-3">
                        {meta?.skeleton ?? (
                          <div
                            style={{ borderRadius: 'var(--radius-sm)' }}
                            className="rd-shimmer h-4 w-3/4"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={effectiveColumns.length}>
                  <EmptyState
                    title="No matching records"
                    description="Try clearing your search query or adjusting filters."
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, rIdx) => (
                <React.Fragment key={row.id}>
                  <tr
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                      backgroundColor:
                        tableLayout?.striped && rIdx % 2 === 1 ? 'var(--color-canvas)' : undefined,
                    }}
                    className="border-t transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        tabIndex={0}
                        style={
                          tableLayout?.cellBorder ? { borderColor: 'var(--color-border)' } : undefined
                        }
                        className={clsx(
                          'tabular-nums',
                          tableLayout?.dense ? 'px-3 py-2' : 'px-4 py-3',
                          tableLayout?.cellBorder && 'border-e last:border-e-0',
                          cell.column.columnDef.meta?.cellClassName,
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {renderExpandedRow && expandedRows[row.id] && (
                    <tr style={{ borderColor: 'var(--color-border)' }} className="border-t">
                      <td colSpan={effectiveColumns.length} className="px-4 py-3">
                        {renderExpandedRow(row.original)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--color-text-muted)' }} className="tabular-nums">
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())} (
            {totalCount ?? table.getFilteredRowModel().rows.length} rows)
          </span>
          <label className="inline-flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
            <span>Rows:</span>
            <select
              aria-label="Rows per page"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              style={{
                backgroundColor: 'var(--color-canvas)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                borderRadius: 'var(--radius-sm)',
              }}
              className="h-7 border px-1.5 text-xs"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            tone="neutral"
            size="xs"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            tone="neutral"
            size="xs"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
