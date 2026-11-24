'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { DataGridFetchParams, DataGridResponse } from '../../components/ui/DataGrid';

export interface UseDataGridQueryOptions<TData> {
  queryKey: string;
  params: DataGridFetchParams;
  fetcher: (params: DataGridFetchParams) => Promise<DataGridResponse<TData>>;
  enabled?: boolean;
}

/**
 * Connects server-mode <DataGrid> fetch params to TanStack Query with
 * keepPreviousData so pagination/sorting transitions never flash empty rows.
 */
export function useDataGridQuery<TData>({
  queryKey,
  params,
  fetcher,
  enabled = true,
}: UseDataGridQueryOptions<TData>) {
  return useQuery<DataGridResponse<TData>>({
    queryKey: [queryKey, params],
    queryFn: () => fetcher(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}
