<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AppIcon from '../@core/icons/AppIcon.vue';
import { useThemeStore } from '../@core/theme/themeStore';
import { navigationConfig, type NavItem } from '../configs/navigation.config';
import {
  filterNavByAuthority,
  getCurrentNavItem,
  getHorizontalNav,
  getNavBreadcrumb,
  isNavActive,
  isNavSubtreeActive,
} from '../@menu/useMenu';
import NavMenu from '../@menu/NavMenu.vue';
import HorizontalNav from '../@menu/HorizontalNav.vue';
import Breadcrumb from '../components/ui/Breadcrumb.vue';

const props = withDefaults(
  defineProps<{
    brandName?: string;
    pathname: string;
    userRoles?: string[];
  }>(),
  {
    brandName: 'Designer Dashboards',
    userRoles: () => ['admin', 'user'],
  },
);

const emit = defineEmits<{
  (e: 'navigate', path: string): void;
}>();

const themeStore = useThemeStore();
const mobileOpen = ref(false);
const twoColGroupKey = ref<string | null>(null);

const effective = computed(() => themeStore.effective());
const visibleNav = computed(() => filterNavByAuthority(navigationConfig, props.userRoles));
const mainNav = computed(() => visibleNav.value.filter((i) => !i.bottom));
const bottomNav = computed(() => visibleNav.value.filter((i) => i.bottom));
const horizontalNav = computed(() => getHorizontalNav(visibleNav.value));
const currentItem = computed(() => getCurrentNavItem(visibleNav.value, props.pathname));
const breadcrumbItems = computed(() =>
  getNavBreadcrumb(visibleNav.value, props.pathname).map((item) => ({
    label: item.title,
    href: item.path,
  })),
);

const isCollapsed = computed(() => effective.value.layout === 'collapsed' || effective.value.layout === 'hover');
const isHorizontal = computed(() => effective.value.layout === 'horizontal' || effective.value.layout === 'compact-topbar');
const isTwoColumn = computed(() => effective.value.layout === 'two-column');
const isSidebarless = computed(() => effective.value.layout === 'sidebarless');

watch(
  [() => props.pathname, currentItem],
  () => {
    if (currentItem.value && typeof document !== 'undefined') {
      document.title = `${currentItem.value.title} · ${props.brandName}`;
    }
    const owner = visibleNav.value.find(
      (i) => (i.type === 'collapse' || i.type === 'group') && i.children?.length && isNavSubtreeActive(i, props.pathname),
    );
    twoColGroupKey.value = owner?.key ?? null;
  },
  { immediate: true },
);

const twoColGroup = computed(
  () => visibleNav.value.find((i) => i.key === twoColGroupKey.value && i.children?.length) ?? null,
);

function handleNavigate(path: string) {
  mobileOpen.value = false;
  emit('navigate', path);
}
</script>

<template>
  <div
    :style="{ backgroundColor: 'var(--color-canvas)', color: 'var(--color-text)' }"
    class="flex min-h-screen"
  >
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:text-sm focus:font-semibold"
    >
      Skip to content
    </a>

    <!-- Two-Column Rail + Panel -->
    <template v-if="isTwoColumn && !isSidebarless">
      <aside
        :style="{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }"
        class="hidden w-[76px] shrink-0 flex-col items-center border-e py-4 lg:flex"
      >
        <div class="mb-4 font-bold">RD</div>
        <div class="flex flex-1 flex-col gap-2">
          <button
            v-for="item in mainNav.filter((i) => i.type !== 'title')"
            :key="item.key"
            type="button"
            :title="item.title"
            :aria-label="item.title"
            :style="{
              backgroundColor: isNavSubtreeActive(item, pathname) || isNavActive(item, pathname) ? 'var(--color-primary-surface)' : 'transparent',
              color: isNavSubtreeActive(item, pathname) || isNavActive(item, pathname) ? 'var(--color-primary)' : 'inherit',
            }"
            class="rounded-md p-2.5"
            @click="item.children?.length ? (twoColGroupKey = item.key) : item.path && handleNavigate(item.path)"
          >
            <AppIcon v-if="item.icon" :name="item.icon" :size="18" />
          </button>
        </div>
      </aside>
      <aside
        v-if="twoColGroup"
        :style="{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }"
        class="hidden w-56 shrink-0 border-e p-4 lg:block"
      >
        <div :style="{ color: 'var(--color-text-muted)' }" class="mb-2 text-xs font-semibold uppercase tracking-wider">
          {{ twoColGroup.title }}
        </div>
        <NavMenu :items="twoColGroup.children ?? []" :pathname="pathname" :show-pinned="false" @navigate="handleNavigate" />
      </aside>
    </template>

    <!-- Standard / Collapsed / Hover Sidebar -->
    <aside
      v-else-if="!isHorizontal && !isSidebarless"
      :style="{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }"
      class="hidden shrink-0 flex-col border-e p-3 transition-all lg:flex"
      :class="isCollapsed ? 'w-[76px]' : 'w-[272px]'"
    >
      <div class="mb-4 flex items-center justify-between px-2">
        <span v-if="!isCollapsed" class="text-base font-bold">{{ brandName }}</span>
        <span v-else class="mx-auto font-bold">RD</span>
      </div>
      <div class="flex-1 overflow-y-auto">
        <NavMenu :items="mainNav" :pathname="pathname" :collapsed="isCollapsed" @navigate="handleNavigate" />
      </div>
      <div v-if="bottomNav.length" class="border-t pt-3" :style="{ borderColor: 'var(--color-border)' }">
        <NavMenu :items="bottomNav" :pathname="pathname" :collapsed="isCollapsed" :show-pinned="false" @navigate="handleNavigate" />
      </div>
    </aside>

    <!-- Mobile Drawer -->
    <div v-if="mobileOpen" class="fixed inset-0 z-50 flex lg:hidden">
      <div class="fixed inset-0 bg-black/50" @click="mobileOpen = false" />
      <aside :style="{ backgroundColor: 'var(--color-surface)' }" class="relative z-10 w-72 p-4">
        <div class="mb-4 flex items-center justify-between">
          <span class="font-bold">{{ brandName }}</span>
          <button type="button" aria-label="Close menu" @click="mobileOpen = false">
            <AppIcon name="x" :size="18" />
          </button>
        </div>
        <NavMenu :items="visibleNav" :pathname="pathname" @navigate="handleNavigate" />
      </aside>
    </div>

    <!-- Main Column -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header
        v-if="!currentItem?.meta?.hideHeader"
        :style="{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }"
        class="flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 lg:px-6"
      >
        <div class="flex items-center gap-3">
          <button type="button" class="rounded-md p-2 lg:hidden" aria-label="Open menu" @click="mobileOpen = true">
            <AppIcon name="menu" :size="18" />
          </button>
          <span v-if="isHorizontal" class="font-bold">{{ brandName }}</span>
          <HorizontalNav v-if="isHorizontal" :items="horizontalNav" :pathname="pathname" @navigate="handleNavigate" />
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="rounded-md p-2" aria-label="Toggle sidebar" @click="themeStore.toggleSidebar()">
            <AppIcon name="panel-left" :size="18" />
          </button>
          <button type="button" class="rounded-md p-2" aria-label="Toggle dark mode" @click="themeStore.toggleDarkMode()">
            <AppIcon :name="effective.theme === 'dark' ? 'sun' : 'moon'" :size="18" />
          </button>
          <button type="button" class="rounded-md px-2 py-1 text-xs font-medium" @click="themeStore.toggleDir()">
            {{ effective.dir.toUpperCase() }}
          </button>
        </div>
      </header>

      <main
        id="main-content"
        tabindex="-1"
        class="flex-1 p-4 focus:outline-none lg:p-6"
        :class="effective.contentWidth === 'boxed' && 'mx-auto w-full max-w-[1400px]'"
      >
        <div v-if="breadcrumbItems.length" class="mb-4">
          <Breadcrumb :items="breadcrumbItems" />
        </div>
        <slot />
      </main>
    </div>
  </div>
</template>
