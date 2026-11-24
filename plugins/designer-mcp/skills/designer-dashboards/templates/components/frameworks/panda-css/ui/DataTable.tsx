'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Search } from 'lucide-react';
import { css } from 'styled-system/css';
import { Input } from './Input';

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export function DataTable<TData>({
  data,
  columns,
  searchPlaceholder = 'Filter records...',
  emptyMessage = 'No matching records found.',
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
  });

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '12px' })}>
      <div className={css({ maxWidth: '320px' })}>
        <Input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          leadingIcon={<Search size={15} />}
        />
      </div>

      <div
        className={css({
          overflowX: 'auto',
          border: '1px solid',
          borderColor: 'border',
          borderRadius: 'lg',
          bg: 'surface',
        })}
      >
        <table
          className={css({
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
            textAlign: 'start',
          })}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className={css({
                  bg: 'surfaceSubtle',
                  borderBottom: '1px solid',
                  borderColor: 'border',
                })}
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      className={css({
                        paddingBlock: '10px',
                        paddingInline: '14px',
                        fontWeight: '600',
                        color: 'textMuted',
                        whiteSpace: 'nowrap',
                      })}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={css({
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            color: 'inherit',
                            fontWeight: 'inherit',
                            _hover: { color: 'text' },
                            _focusVisible: {
                              outline: '2px solid token(colors.primary)',
                              outlineOffset: '2px',
                              borderRadius: 'sm',
                            },
                          })}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <ArrowUpDown size={13} aria-hidden="true" />
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
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={css({
                    paddingBlock: '32px',
                    paddingInline: '16px',
                    textAlign: 'center',
                    color: 'textMuted',
                  })}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={css({
                    borderBottom: '1px solid',
                    borderColor: 'border',
                    _last: { borderBottom: 'none' },
                    _hover: { bg: 'surfaceSubtle' },
                  })}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={css({
                        paddingBlock: '12px',
                        paddingInline: '14px',
                        color: 'text',
                      })}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
