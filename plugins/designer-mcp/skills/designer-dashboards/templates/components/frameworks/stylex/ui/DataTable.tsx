import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
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
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { tokens } from '../theme/tokens.stylex';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchPlaceholder?: string;
  pageSize?: number;
  caption?: string;
}

const styles = stylex.create({
  wrapper: {
    overflow: 'hidden',
  },
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    paddingBlock: '16px',
    paddingInline: '20px',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.border,
  },
  searchBox: {
    width: 'min(280px, 100%)',
  },
  count: {
    fontSize: tokens.textXs,
    color: tokens.textMuted,
    fontVariantNumeric: 'tabular-nums',
  },
  scrollArea: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: tokens.fontSans,
    fontSize: tokens.textSm,
    textAlign: 'start',
  },
  th: {
    paddingBlock: '12px',
    paddingInline: '16px',
    fontSize: tokens.textXs,
    fontWeight: 600,
    color: tokens.textMuted,
    backgroundColor: tokens.surfaceSubtle,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.border,
    whiteSpace: 'nowrap',
    textAlign: 'start',
  },
  sortBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    fontWeight: 'inherit',
    fontSize: 'inherit',
    cursor: 'pointer',
  },
  tr: {
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.surfaceSubtle,
    },
    transitionProperty: 'background-color',
    transitionDuration: '120ms',
  },
  td: {
    paddingBlock: '12px',
    paddingInline: '16px',
    color: tokens.text,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.border,
    whiteSpace: 'nowrap',
  },
  empty: {
    paddingBlock: '32px',
    paddingInline: '16px',
    textAlign: 'center',
    color: tokens.textMuted,
    fontSize: tokens.textSm,
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    paddingBlock: '12px',
    paddingInline: '20px',
    fontSize: tokens.textXs,
    color: tokens.textMuted,
  },
  pageActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
});

export function DataTable<TData>({
  data,
  columns,
  searchPlaceholder = 'Filter rows...',
  pageSize = 6,
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

  const wrapperSx = stylex.props(styles.wrapper);

  return (
    <Card className={wrapperSx.className} style={wrapperSx.style}>
      <div {...stylex.props(styles.toolbar)}>
        <div {...stylex.props(styles.searchBox)}>
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            leadingIcon={<Search size={15} aria-hidden="true" />}
          />
        </div>
        <span {...stylex.props(styles.count)}>
          {table.getFilteredRowModel().rows.length} records
        </span>
      </div>

      <div {...stylex.props(styles.scrollArea)}>
        <table {...stylex.props(styles.table)}>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={
                        sorted === 'asc'
                          ? 'ascending'
                          : sorted === 'desc'
                            ? 'descending'
                            : 'none'
                      }
                      {...stylex.props(styles.th)}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          {...stylex.props(styles.sortBtn)}
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
                <td colSpan={columns.length} {...stylex.props(styles.empty)}>
                  No matching records found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} {...stylex.props(styles.tr)}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} {...stylex.props(styles.td)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div {...stylex.props(styles.pagination)}>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
        </span>
        <div {...stylex.props(styles.pageActions)}>
          <Button
            variant="outline"
            tone="neutral"
            size="xs"
            iconOnly
            aria-label="Previous page"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            tone="neutral"
            size="xs"
            iconOnly
            aria-label="Next page"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight size={14} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
