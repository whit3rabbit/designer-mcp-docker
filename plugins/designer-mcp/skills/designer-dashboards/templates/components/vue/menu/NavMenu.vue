<script setup lang="ts">
import { computed, reactive } from 'vue';
import AppIcon from '../@core/icons/AppIcon.vue';
import type { NavItem } from '../configs/navigation.config';
import { getPinnedNavItems, isNavActive, isNavSubtreeActive } from './useMenu';

const props = withDefaults(
  defineProps<{
    items: NavItem[];
    pathname: string;
    collapsed?: boolean;
    showPinned?: boolean;
    pinnedLabel?: string;
    ariaLabel?: string;
  }>(),
  {
    collapsed: false,
    showPinned: true,
    pinnedLabel: 'Pinned',
    ariaLabel: 'Sidebar navigation',
  },
);

const emit = defineEmits<{
  (e: 'navigate', path: string): void;
}>();

const openMap = reactive<Record<string, boolean>>({});
const expandedLimitMap = reactive<Record<string, boolean>>({});

function isGroupOpen(item: NavItem): boolean {
  if (openMap[item.key] !== undefined) return openMap[item.key];
  return Boolean(item.expanded) || isNavSubtreeActive(item, props.pathname);
}

function toggleGroup(key: string) {
  openMap[key] = !openMap[key];
}

const pinnedItems = computed(() => (props.showPinned ? getPinnedNavItems(props.items) : []));

function handleItemClick(e: MouseEvent, item: NavItem) {
  if (item.disabled) {
    e.preventDefault();
    return;
  }
  if (item.path && !item.isExternalLink) {
    e.preventDefault();
    emit('navigate', item.path);
  }
}

function visibleChildren(item: NavItem): NavItem[] {
  const list = item.children ?? [];
  if (!item.collapseLimit || expandedLimitMap[item.key]) return list;
  return list.slice(0, item.collapseLimit);
}
</script>

<template>
  <nav :aria-label="ariaLabel" class="space-y-1">
    <!-- Pinned Quick-Access Section -->
    <div v-if="!collapsed && pinnedItems.length > 0" class="mb-3 space-y-1">
      <div
        :style="{ color: 'var(--color-text-muted)' }"
        class="px-3 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider"
      >
        {{ pinnedLabel }}
      </div>
      <a
        v-for="item in pinnedItems"
        :key="`pin-${item.key}`"
        :href="item.path ?? '#'"
        :aria-current="isNavActive(item, pathname) ? 'page' : undefined"
        :style="{
          backgroundColor: isNavActive(item, pathname) ? 'var(--color-primary-surface)' : 'transparent',
          color: isNavActive(item, pathname) ? 'var(--color-primary)' : 'inherit',
          borderRadius: 'var(--radius-md)',
        }"
        class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors"
        @click="handleItemClick($event, item)"
      >
        <AppIcon v-if="item.icon" :name="item.icon" :size="16" class="shrink-0" />
        <span class="truncate">{{ item.title }}</span>
      </a>
    </div>

    <!-- Primary Nav Tree -->
    <template v-for="item in items" :key="item.key">
      <div
        v-if="item.type === 'title' && !collapsed"
        :style="{ color: 'var(--color-text-muted)' }"
        class="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider"
      >
        {{ item.title }}
      </div>

      <div v-else-if="(item.type === 'collapse' || item.type === 'group') && item.children?.length" class="space-y-1">
        <button
          type="button"
          :aria-expanded="isGroupOpen(item)"
          :title="collapsed ? item.title : undefined"
          :style="{
            backgroundColor: isNavSubtreeActive(item, pathname) ? 'var(--color-primary-surface)' : 'transparent',
            color: isNavSubtreeActive(item, pathname) ? 'var(--color-primary)' : 'inherit',
            borderRadius: 'var(--radius-md)',
          }"
          class="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm font-medium transition-colors"
          :class="collapsed && 'justify-center px-2'"
          @click="toggleGroup(item.key)"
        >
          <span class="flex min-w-0 items-center gap-2.5">
            <AppIcon v-if="item.icon" :name="item.icon" :size="18" class="shrink-0" />
            <span v-if="!collapsed" class="truncate">{{ item.title }}</span>
          </span>
          <AppIcon
            v-if="!collapsed"
            name="chevron-right"
            :size="14"
            class="shrink-0 transition-transform"
            :class="isGroupOpen(item) && 'rotate-90'"
          />
        </button>

        <div v-if="!collapsed && isGroupOpen(item)" class="space-y-0.5 ps-4">
          <template v-for="child in visibleChildren(item)" :key="child.key">
            <div v-if="child.type === 'title'" :style="{ color: 'var(--color-text-muted)' }" class="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase">
              {{ child.title }}
            </div>
            <div v-else class="group flex items-center gap-1">
              <a
                :href="child.path ?? '#'"
                :target="child.isExternalLink ? '_blank' : undefined"
                :rel="child.isExternalLink ? 'noopener noreferrer' : undefined"
                :aria-current="isNavActive(child, pathname) ? 'page' : undefined"
                :style="{
                  backgroundColor: isNavActive(child, pathname) ? 'var(--color-primary-surface)' : 'transparent',
                  color: isNavActive(child, pathname) ? 'var(--color-primary)' : 'inherit',
                  borderRadius: 'var(--radius-md)',
                }"
                class="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors"
                @click="handleItemClick($event, child)"
              >
                <AppIcon v-if="child.icon" :name="child.icon" :size="16" class="shrink-0" />
                <span class="flex-1 truncate">{{ child.title }}</span>
                <span
                  v-if="child.badge"
                  :style="{
                    backgroundColor: `var(--color-${child.badge.color ?? 'primary'}-surface)`,
                    color: `var(--color-${child.badge.color ?? 'primary'})`,
                    borderRadius: 'var(--radius-full)',
                  }"
                  class="px-2 py-0.5 text-[11px] font-semibold"
                >
                  {{ child.badge.value }}
                </span>
              </a>
              <button
                v-if="child.quickCreate"
                type="button"
                :title="child.quickCreate.tooltip"
                :aria-label="child.quickCreate.tooltip"
                class="rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                @click="emit('navigate', child.quickCreate.path)"
              >
                <AppIcon name="plus" :size="14" />
              </button>
            </div>
          </template>
          <button
            v-if="item.collapseLimit && item.children.length > item.collapseLimit"
            type="button"
            :style="{ color: 'var(--color-text-muted)' }"
            class="px-3 py-1 text-xs font-medium hover:underline"
            @click="expandedLimitMap[item.key] = !expandedLimitMap[item.key]"
          >
            {{ expandedLimitMap[item.key] ? 'Show less' : `Show ${item.children.length - item.collapseLimit} more` }}
          </button>
        </div>
      </div>

      <a
        v-else-if="item.type === 'item'"
        :href="item.path ?? '#'"
        :target="item.isExternalLink ? '_blank' : undefined"
        :rel="item.isExternalLink ? 'noopener noreferrer' : undefined"
        :title="collapsed ? item.title : undefined"
        :aria-current="isNavActive(item, pathname) ? 'page' : undefined"
        :style="{
          backgroundColor: isNavActive(item, pathname) ? 'var(--color-primary-surface)' : 'transparent',
          color: isNavActive(item, pathname) ? 'var(--color-primary)' : 'inherit',
          borderRadius: 'var(--radius-md)',
        }"
        class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors"
        :class="collapsed && 'justify-center px-2'"
        @click="handleItemClick($event, item)"
      >
        <AppIcon v-if="item.icon" :name="item.icon" :size="18" class="shrink-0" />
        <span v-if="!collapsed" class="flex-1 truncate">{{ item.title }}</span>
      </a>
    </template>
  </nav>
</template>
