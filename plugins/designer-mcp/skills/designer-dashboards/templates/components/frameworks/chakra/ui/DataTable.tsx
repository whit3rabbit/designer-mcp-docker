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
import { Box, Flex, Table, Text } from '@chakra-ui/react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchPlaceholder?: string;
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<TData>({
  data,
  columns,
  searchPlaceholder = 'Filter rows...',
  pageSize = 5,
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
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize },
    },
  });

  const rows = table.getRowModel().rows;

  return (
    <Box>
      <Flex justify="space-between" align="center" gap={3} mb={3} flexWrap="wrap">
        <Box maxW="280px" w="full">
          <Input
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            size="sm"
          />
        </Box>
        <Text fontSize="xs" color="var(--color-text-muted)">
          {table.getFilteredRowModel().rows.length} total records
        </Text>
      </Flex>

      <Box
        overflowX="auto"
        borderWidth="1px"
        borderColor="var(--color-border)"
        borderRadius="var(--radius-md)"
        bg="var(--color-surface)"
      >
        <Table.Root size="sm" variant="line">
          <Table.Header bg="var(--color-surface-subtle)">
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} borderColor="var(--color-border)">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <Table.ColumnHeader
                      key={header.id}
                      color="var(--color-text-muted)"
                      fontWeight="semibold"
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      textAlign="start"
                      py={2.5}
                      px={3}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: 'transparent',
                            border: 'none',
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
                            <ArrowUp size={12} aria-hidden="true" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown size={12} aria-hidden="true" />
                          ) : (
                            <ArrowUpDown size={12} aria-hidden="true" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </Table.ColumnHeader>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Header>

          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row>
                <Table.Cell
                  colSpan={columns.length}
                  textAlign="center"
                  py={8}
                  color="var(--color-text-muted)"
                >
                  {emptyMessage}
                </Table.Cell>
              </Table.Row>
            ) : (
              rows.map((row) => (
                <Table.Row
                  key={row.id}
                  borderColor="var(--color-border)"
                  _hover={{ bg: 'var(--color-surface-subtle)' }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell key={cell.id} py={2.5} px={3} color="var(--color-text)" textAlign="start">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {table.getPageCount() > 1 && (
        <Flex justify="space-between" align="center" mt={3} gap={2}>
          <Text fontSize="xs" color="var(--color-text-muted)">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </Text>
          <Flex gap={2}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              leftIcon={<ChevronLeft size={14} />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              rightIcon={<ChevronRight size={14} />}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      )}
    </Box>
  );
}
