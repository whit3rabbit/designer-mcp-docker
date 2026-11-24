<script setup lang="ts" generic="TData extends { id: string }">
import { ref, computed } from 'vue';
import {
  useVueTable,
  getCoreRowModel,
  FlexRender,
  type ColumnDef,
} from '@tanstack/vue-table';
import AppIcon from '../../@core/icons/AppIcon.vue';
import Button from './Button.vue';
import EmptyState from './EmptyState.vue';

const props = withDefaults(
  defineProps<{
    data: TData[];
    columns: ColumnDef<TData, unknown>[];
    totalCount: number;
    pageCount: number;
    pageIndex: number;
    pageSize: number;
    loading?: boolean;
    searchPlaceholder?: string;
  }>(),
  { loading: false, searchPlaceholder: 'Search records...' },
);

const emit = defineEmits<{
  'update:pageIndex': [page: number];
  'update:search': [query: string];
}>();

const search = ref('');

const table = useVueTable({
  get data() {
    return props.data;
  },
  get columns() {
    return props.columns;
  },
  get pageCount() {
    return props.pageCount;
  },
  manualPagination: true,
  getCoreRowModel: getCoreRowModel(),
});

const visibleColumns = computed(() => table.getAllLeafColumns());
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="relative w-64">
        <AppIcon
          name="search"
          :size="14"
          class="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2"
        />
        <input
          type="search"
          :value="search"
          :placeholder="searchPlaceholder"
          :style="{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
          }"
          class="h-8 w-full border ps-8 pe-3 text-xs"
          @input="search = ($event.target as HTMLInputElement).value; emit('update:search', search)"
        />
      </div>
      <span :style="{ color: 'var(--color-text-muted)' }" class="tabular-nums text-xs">
        {{ totalCount }} records
      </span>
    </div>

    <div
      :style="{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }"
      class="overflow-x-auto border"
    >
      <table class="w-full border-collapse text-start text-xs">
        <thead>
          <tr
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
            :style="{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border)' }"
            class="border-b"
          >
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :style="{ color: 'var(--color-text-muted)' }"
              class="px-4 py-3 font-semibold"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr v-for="i in 5" :key="i" :style="{ borderColor: 'var(--color-border)' }" class="border-b">
              <td v-for="col in visibleColumns" :key="col.id" class="px-4 py-3">
                <div class="rd-shimmer h-4 w-24 rounded" />
              </td>
            </tr>
          </template>
          <tr v-else-if="data.length === 0">
            <td :colspan="visibleColumns.length" class="p-6">
              <EmptyState title="No matching rows" description="Try clearing your search or filters." />
            </td>
          </tr>
          <template v-else>
            <tr
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :style="{ borderColor: 'var(--color-border)' }"
              class="border-b transition-colors hover:bg-[var(--color-canvas)]"
            >
              <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="px-4 py-3">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between text-xs">
      <span :style="{ color: 'var(--color-text-muted)' }" class="tabular-nums">
        Page {{ pageIndex + 1 }} of {{ Math.max(1, pageCount) }}
      </span>
      <div class="flex items-center gap-1.5">
        <Button
          variant="outline"
          tone="neutral"
          size="xs"
          :disabled="pageIndex <= 0"
          @click="emit('update:pageIndex', pageIndex - 1)"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          tone="neutral"
          size="xs"
          :disabled="pageIndex + 1 >= pageCount"
          @click="emit('update:pageIndex', pageIndex + 1)"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>
