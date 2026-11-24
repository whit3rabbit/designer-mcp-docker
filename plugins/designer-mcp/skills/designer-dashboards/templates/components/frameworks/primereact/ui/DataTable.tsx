import * as React from 'react';
import {
  DataTable as PrimeDataTable,
  type DataTableFilterMeta,
  type DataTableValue,
} from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { Skeleton } from 'primereact/skeleton';
import { Search } from 'lucide-react';
import { Input } from './Input';

export interface DataTableColumn<T extends DataTableValue> {
  field: keyof T & string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  body?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T extends DataTableValue> {
  data: T[];
  columns: DataTableColumn<T>[];
  dataKey?: keyof T & string;
  title?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  globalFilterFields?: (keyof T & string)[];
  paginator?: boolean;
  rows?: number;
  rowsPerPageOptions?: number[];
  loading?: boolean;
  emptyMessage?: string;
  selection?: T[];
  onSelectionChange?: (rows: T[]) => void;
  toolbarActions?: React.ReactNode;
}

export function DataTable<T extends DataTableValue>({
  data,
  columns,
  dataKey = 'id' as keyof T & string,
  title,
  searchable = true,
  searchPlaceholder = 'Search records...',
  globalFilterFields,
  paginator = true,
  rows = 8,
  rowsPerPageOptions = [8, 16, 32],
  loading = false,
  emptyMessage = 'No matching records found.',
  selection,
  onSelectionChange,
  toolbarActions,
}: DataTableProps<T>) {
  const [globalFilterValue, setGlobalFilterValue] = React.useState('');
  const [filters, setFilters] = React.useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const handleGlobalFilterChange = (value: string) => {
    setGlobalFilterValue(value);
    setFilters({
      global: { value: value || null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const resolvedFilterFields = React.useMemo(
    () => globalFilterFields ?? columns.map((col) => col.field),
    [globalFilterFields, columns],
  );

  const header =
    title || searchable || toolbarActions ? (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        {title ? (
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
            {title}
          </h3>
        ) : (
          <span />
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          {searchable ? (
            <div style={{ position: 'relative', minWidth: '15rem' }}>
              <Search
                size={15}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  insetInlineStart: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <Input
                value={globalFilterValue}
                onChange={(e) => handleGlobalFilterChange(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                style={{ paddingInlineStart: '2.125rem' }}
              />
            </div>
          ) : null}
          {toolbarActions}
        </div>
      </div>
    ) : undefined;

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <Skeleton width="30%" height="1.25rem" />
        <Skeleton width="100%" height="2.25rem" />
        <Skeleton width="100%" height="2.25rem" />
        <Skeleton width="100%" height="2.25rem" />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <PrimeDataTable
        value={data}
        dataKey={dataKey}
        header={header}
        filters={filters}
        globalFilterFields={resolvedFilterFields}
        paginator={paginator}
        rows={rows}
        rowsPerPageOptions={rowsPerPageOptions}
        emptyMessage={emptyMessage}
        selectionMode={onSelectionChange ? 'checkbox' : undefined}
        selection={selection}
        onSelectionChange={
          onSelectionChange
            ? (e) => onSelectionChange((e.value as T[]) ?? [])
            : undefined
        }
        rowHover
        scrollable
        tableStyle={{ minWidth: '42rem' }}
      >
        {onSelectionChange ? <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} /> : null}
        {columns.map((col) => (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            sortable={col.sortable ?? true}
            align={col.align}
            style={col.width ? { width: col.width } : undefined}
            body={col.body ? (rowData: T) => col.body!(rowData) : undefined}
          />
        ))}
      </PrimeDataTable>
    </div>
  );
}
