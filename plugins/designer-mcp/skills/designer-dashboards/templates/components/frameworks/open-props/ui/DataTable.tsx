import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

export interface DataTableProps<TData extends object> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchPlaceholder?: string;
  pageSize?: number;
  emptyMessage?: string;
  caption?: string;
}

export function DataTable<TData extends object>({
  data,
  columns,
  searchPlaceholder = 'Filter rows...',
  pageSize = 5,
  emptyMessage = 'No matching records found.',
  caption,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const rows = table.getRowModel().rows;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--op-space-sm)' }}>
      <div style={{ maxWidth: '20rem' }}>
        <Input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          startAdornment={<Search size={15} />}
        />
      </div>

      <div className="op-table-wrap">
        <table className="op-table">
          {caption && (
            <caption
              style={{
                padding: 'var(--op-space-sm)',
                fontSize: '0.8125rem',
                color: 'var(--color-text-muted)',
                textAlign: 'start',
              }}
            >
              {caption}
            </caption>
          )}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  return (
                    <th
                      key={header.id}
                      aria-sort={
                        sorted === 'asc'
                          ? 'ascending'
                          : sorted === 'desc'
                            ? 'descending'
                            : canSort
                              ? 'none'
                              : undefined
                      }
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="op-focusable"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            border: 'none',
                            background: 'transparent',
                            color: 'inherit',
                            font: 'inherit',
                            textTransform: 'inherit',
                            letterSpacing: 'inherit',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === 'asc' ? (
                            <ArrowUp size={13} aria-hidden="true" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown size={13} aria-hidden="true" />
                          ) : (
                            <ArrowUpDown size={13} aria-hidden="true" style={{ opacity: 0.55 }} />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    textAlign: 'center',
                    padding: 'var(--op-space-xl)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--op-space-sm)',
          fontSize: '0.8125rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--op-space-2xs)' }}>
          <Button
            variant="outline"
            tone="neutral"
            size="sm"
            iconOnly
            aria-label="Previous page"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft size={15} aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            tone="neutral"
            size="sm"
            iconOnly
            aria-label="Next page"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight size={15} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
