<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from '../@core/icons/AppIcon.vue';
import type { NavItem } from '../configs/navigation.config';
import { isNavActive, isNavSubtreeActive } from './useMenu';

defineProps<{
  items: NavItem[];
  pathname: string;
}>();

const emit = defineEmits<{
  (e: 'navigate', path: string): void;
}>();

const openKey = ref<string | null>(null);

function navigate(item: NavItem, e: MouseEvent) {
  if (item.disabled) {
    e.preventDefault();
    return;
  }
  if (item.path && !item.isExternalLink) {
    e.preventDefault();
    openKey.value = null;
    emit('navigate', item.path);
  }
}

function groupColumns(children: NavItem[]) {
  const cols: Array<{ header?: NavItem; links: NavItem[] }> = [];
  for (const child of children) {
    if (child.type === 'title') cols.push({ header: child, links: [] });
    else if (cols.length > 0) cols[cols.length - 1].links.push(child);
    else cols.push({ links: [child] });
  }
  return cols;
}
</script>

<template>
  <nav aria-label="Horizontal menu" class="flex items-center gap-1 overflow-x-auto">
    <div v-for="item in items" :key="item.key" class="relative">
      <template v-if="item.children?.length">
        <button
          type="button"
          :aria-expanded="openKey === item.key"
          :style="{
            backgroundColor: isNavSubtreeActive(item, pathname) ? 'var(--color-primary-surface)' : 'transparent',
            color: isNavSubtreeActive(item, pathname) ? 'var(--color-primary)' : 'inherit',
            borderRadius: 'var(--radius-md)',
          }"
          class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap"
          @click="openKey = openKey === item.key ? null : item.key"
        >
          <AppIcon v-if="item.icon" :name="item.icon" :size="16" />
          <span>{{ item.title }}</span>
          <AppIcon name="chevron-down" :size="14" />
        </button>

        <div
          v-if="openKey === item.key"
          :style="{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }"
          class="fixed z-50 mt-2 border p-4 shadow-lg"
        >
          <div
            v-if="item.meta?.megaMenu"
            class="grid gap-6"
            :style="{ gridTemplateColumns: `repeat(${Math.min(groupColumns(item.children).length, 4)}, minmax(11rem, 1fr))` }"
          >
            <div v-for="(col, idx) in groupColumns(item.children)" :key="col.header?.key ?? idx" class="space-y-1">
              <div v-if="col.header" :style="{ color: 'var(--color-text-muted)' }" class="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider">
                {{ col.header.title }}
              </div>
              <a
                v-for="link in col.links"
                :key="link.key"
                :href="link.path ?? '#'"
                class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:opacity-80"
                @click="navigate(link, $event)"
              >
                <AppIcon v-if="link.icon" :name="link.icon" :size="15" />
                <span>{{ link.title }}</span>
              </a>
            </div>
          </div>

          <div v-else class="min-w-48 space-y-1">
            <a
              v-for="child in item.children.filter((c) => c.type !== 'title')"
              :key="child.key"
              :href="child.path ?? '#'"
              :aria-current="isNavActive(child, pathname) ? 'page' : undefined"
              class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:opacity-80"
              @click="navigate(child, $event)"
            >
              <AppIcon v-if="child.icon" :name="child.icon" :size="15" />
              <span>{{ child.title }}</span>
            </a>
          </div>
        </div>
      </template>

      <a
        v-else
        :href="item.path ?? '#'"
        :aria-current="isNavActive(item, pathname) ? 'page' : undefined"
        :style="{
          backgroundColor: isNavActive(item, pathname) ? 'var(--color-primary-surface)' : 'transparent',
          color: isNavActive(item, pathname) ? 'var(--color-primary)' : 'inherit',
          borderRadius: 'var(--radius-md)',
        }"
        class="flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap"
        @click="navigate(item, $event)"
      >
        <AppIcon v-if="item.icon" :name="item.icon" :size="16" />
        <span>{{ item.title }}</span>
      </a>
    </div>
  </nav>
</template>
