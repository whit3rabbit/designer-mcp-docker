import * as React from 'react';
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
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
import { Search } from 'lucide-react';
import { Card } from './Card';
import { Input } from './Input';

export interface DataTableProps<TData extends object> {
  title?: string;
  subtitle?: string;
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  toolbarExtra?: React.ReactNode;
}

export function DataTable<TData extends object>({
  title,
  subtitle,
  data,
  columns,
  searchPlaceholder = 'Filter records…',
  pageSizeOptions = [5, 10, 25],
  initialPageSize = 5,
  toolbarExtra,
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
      pagination: { pageIndex: 0, pageSize: initialPageSize },
    },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <Card
      title={title}
      subtitle={subtitle}
      noPadding
      action={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            startAdornment={<Search size={16} aria-hidden="true" />}
            fullWidth={false}
            sx={{ minWidth: { xs: 160, sm: 240 } }}
          />
          {toolbarExtra}
        </Stack>
      }
    >
      <TableContainer>
        <Table size="small" aria-label={title ?? 'Data table'}>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                sx={{ bgcolor: 'var(--color-surface-subtle)' }}
              >
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();

                  return (
                    <TableCell
                      key={header.id}
                      sortDirection={sorted || false}
                      aria-sort={
                        sorted === 'asc'
                          ? 'ascending'
                          : sorted === 'desc'
                            ? 'descending'
                            : undefined
                      }
                      sx={{
                        fontWeight: 600,
                        color: 'var(--color-text-muted)',
                        borderBottomColor: 'var(--color-border)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <TableSortLabel
                          active={Boolean(sorted)}
                          direction={sorted === 'desc' ? 'desc' : 'asc'}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableSortLabel>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No matching records found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                    '& td': { borderBottomColor: 'var(--color-border)' },
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ borderTop: '1px solid var(--color-border)' }}>
        <TablePagination
          component="div"
          count={totalRows}
          page={pageIndex}
          onPageChange={(_e, nextPage) => table.setPageIndex(nextPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
          rowsPerPageOptions={pageSizeOptions}
        />
      </Box>
    </Card>
  );
}
