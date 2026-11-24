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
  type SortingState,
} from '@tanstack/react-table';
import { clsx } from 'clsx';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  headerAction?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<TData>({
  data,
  columns,
  title,
  description,
  searchPlaceholder = 'Filter rows...',
  pageSize = 6,
  headerAction,
  emptyMessage = 'No matching records found.',
  className,
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
    initialState: {
      pagination: { pageSize },
    },
  });

  const { pageIndex } = table.getState().pagination;
  const pageCount = Math.max(1, table.getPageCount());

  return (
    <Card
      variant="bordered"
      padding="none"
      className={clsx('overflow-hidden', className)}
    >
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title ? (
            <h3 className="text-base font-semibold text-[var(--color-text)]">{title}</h3>
          ) : null}
          {description ? (
            <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={setGlobalFilter}
            startIcon={<Search className="size-4" />}
            className="w-full sm:w-60"
          />
          {headerAction}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-start text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                style={{ backgroundColor: 'var(--color-surface-subtle)' }}
                className="border-b border-[var(--color-border)]"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const ariaSort =
                    sorted === 'asc'
                      ? 'ascending'
                      : sorted === 'desc'
                        ? 'descending'
                        : canSort
                          ? 'none'
                          : undefined;

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={ariaSort}
                      className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1.5 rounded hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === 'asc' ? (
                            <ArrowUp className="size-3.5" aria-hidden="true" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown className="size-3.5" aria-hidden="true" />
                          ) : (
                            <ArrowUpDown className="size-3.5 opacity-50" aria-hidden="true" />
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
          <tbody className="divide-y divide-[var(--color-border)]">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-[var(--color-surface-subtle)]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-[var(--color-text)]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-text-muted)]">
        <span>
          Page {pageIndex + 1} of {pageCount} ({table.getFilteredRowModel().rows.length} rows)
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            tone="neutral"
            size="xs"
            iconOnly
            aria-label="Previous page"
            isDisabled={!table.getCanPreviousPage()}
            onPress={() => table.previousPage()}
          >
            <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            tone="neutral"
            size="xs"
            iconOnly
            aria-label="Next page"
            isDisabled={!table.getCanNextPage()}
            onPress={() => table.nextPage()}
          >
            <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
