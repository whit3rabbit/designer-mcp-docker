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
import {
  Group,
  Pagination,
  ScrollArea,
  Stack,
  Table,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import { Input } from './Input';
import { Select } from './Select';

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchPlaceholder?: string;
  initialPageSize?: number;
  emptyMessage?: string;
  ariaLabel?: string;
}

export function DataTable<TData>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  initialPageSize = 5,
  emptyMessage = 'No matching records found.',
  ariaLabel = 'Data table',
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
      pagination: { pageSize: initialPageSize },
    },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = Math.max(table.getPageCount(), 1);
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <Stack gap="md">
      <Group justify="space-between" gap="sm" wrap="wrap">
        <Input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.currentTarget.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          leftSection={<Search size={16} />}
          style={{ flex: '1 1 240px', maxWidth: 340 }}
        />

        <Group gap="xs">
          <Text size="xs" style={{ color: 'var(--color-text-muted)' }}>
            Rows per page
          </Text>
          <Select
            aria-label="Rows per page"
            value={String(pageSize)}
            onChange={(val) => {
              if (val) table.setPageSize(Number(val));
            }}
            data={['5', '10', '20', '50']}
            w={84}
            allowDeselect={false}
          />
        </Group>
      </Group>

      <ScrollArea>
        <Table
          aria-label={ariaLabel}
          highlightOnHover
          verticalSpacing="sm"
          horizontalSpacing="md"
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <Table.Thead style={{ backgroundColor: 'var(--color-surface-subtle)' }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <Table.Th
                      key={header.id}
                      style={{
                        color: 'var(--color-text-muted)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <UnstyledButton
                          onClick={header.column.getToggleSortingHandler()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            color: 'var(--color-text)',
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sorted === 'asc' ? (
                            <ArrowUp size={14} />
                          ) : sorted === 'desc' ? (
                            <ArrowDown size={14} />
                          ) : (
                            <ArrowUpDown size={14} style={{ opacity: 0.5 }} />
                          )}
                        </UnstyledButton>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </Table.Th>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Thead>

          <Table.Tbody>
            {table.getRowModel().rows.length === 0 ? (
              <Table.Tr>
                <Table.Td
                  colSpan={columns.length}
                  style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}
                >
                  {emptyMessage}
                </Table.Td>
              </Table.Tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <Table.Tr key={row.id} style={{ borderColor: 'var(--color-border)' }}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Td key={cell.id} style={{ color: 'var(--color-text)' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Group justify="space-between" align="center" wrap="wrap">
        <Text size="xs" style={{ color: 'var(--color-text-muted)' }}>
          {totalRows} {totalRows === 1 ? 'record' : 'records'}
        </Text>
        <Pagination
          total={pageCount}
          value={pageIndex + 1}
          onChange={(nextPage) => table.setPageIndex(nextPage - 1)}
          size="sm"
          radius="md"
        />
      </Group>
    </Stack>
  );
}
