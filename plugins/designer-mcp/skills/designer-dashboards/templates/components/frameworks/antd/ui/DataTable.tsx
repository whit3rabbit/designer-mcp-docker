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
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import { Checkbox, Empty, Input, Pagination, Spin } from 'antd';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';

export interface DataTableProps<TData extends object> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchPlaceholder?: string;
  searchable?: boolean;
  selectable?: boolean;
  pageSize?: number;
  loading?: boolean;
  emptyText?: string;
  toolbarExtra?: React.ReactNode;
  onSelectionChange?: (selectedRows: TData[]) => void;
  getRowId?: (row: TData, index: number) => string;
}

export function DataTable<TData extends object>({
  data,
  columns,
  searchPlaceholder = 'Search records…',
  searchable = true,
  selectable = false,
  pageSize = 10,
  loading = false,
  emptyText = 'No matching records',
  toolbarExtra,
  onSelectionChange,
  getRowId,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const tableColumns = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!selectable) return columns;

    const selectionCol: ColumnDef<TData, unknown> = {
      id: '__select__',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          aria-label="Select all rows on page"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          aria-label={`Select row ${row.id}`}
        />
      ),
      size: 44,
      enableSorting: false,
    };

    return [selectionCol, ...columns];
  }, [columns, selectable]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize },
    },
    getRowId,
    enableRowSelection: selectable,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  React.useEffect(() => {
    if (!onSelectionChange) return;
    const selected = table.getSelectedRowModel().rows.map((r) => r.original);
    onSelectionChange(selected);
  }, [rowSelection, onSelectionChange, table]);

  const totalRows = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize: currentPageSize } = table.getState().pagination;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(searchable || toolbarExtra) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {searchable ? (
            <Input
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                table.setPageIndex(0);
              }}
              placeholder={searchPlaceholder}
              prefix={<Search size={15} aria-hidden="true" style={{ color: 'var(--color-text-muted)' }} />}
              allowClear
              aria-label={searchPlaceholder}
              style={{ maxWidth: 320 }}
            />
          ) : (
            <span />
          )}
          {toolbarExtra && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{toolbarExtra}</div>
          )}
        </div>
      )}

      <Spin spinning={loading}>
        <div
          style={{
            overflowX: 'auto',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'start',
              fontSize: 13,
              color: 'var(--color-text)',
            }}
          >
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  style={{
                    backgroundColor: 'var(--color-surface-elevated)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
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
                        style={{
                          paddingBlock: 10,
                          paddingInline: 14,
                          fontWeight: 600,
                          fontSize: 12,
                          color: 'var(--color-text-muted)',
                          whiteSpace: 'nowrap',
                          width: header.column.columnDef.size,
                        }}
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              background: 'transparent',
                              border: 'none',
                              padding: 0,
                              color: 'inherit',
                              font: 'inherit',
                              cursor: 'pointer',
                            }}
                          >
                            <span>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            {sorted === 'asc' ? (
                              <ArrowUp size={13} aria-hidden="true" />
                            ) : sorted === 'desc' ? (
                              <ArrowDown size={13} aria-hidden="true" />
                            ) : (
                              <ArrowUpDown size={13} aria-hidden="true" style={{ opacity: 0.45 }} />
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={tableColumns.length}
                    style={{ padding: 32, textAlign: 'center' }}
                  >
                    <Empty description={emptyText} />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: row.getIsSelected()
                        ? 'var(--color-primary-surface)'
                        : 'transparent',
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{
                          paddingBlock: 11,
                          paddingInline: 14,
                          verticalAlign: 'middle',
                        }}
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
      </Spin>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {totalRows} {totalRows === 1 ? 'record' : 'records'}
          {selectable && Object.keys(rowSelection).length > 0
            ? ` · ${Object.keys(rowSelection).length} selected`
            : ''}
        </span>

        <Pagination
          current={pageIndex + 1}
          pageSize={currentPageSize}
          total={totalRows}
          showSizeChanger
          pageSizeOptions={['5', '10', '20', '50']}
          onChange={(page, size) => {
            table.setPageIndex(page - 1);
            if (size !== currentPageSize) table.setPageSize(size);
          }}
          size="small"
        />
      </div>
    </div>
  );
}
