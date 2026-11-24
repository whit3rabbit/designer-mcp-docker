import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type ThemeMode = 'light' | 'dark';
export type LayoutMode =
  | 'vertical'
  | 'collapsed'
  | 'hover'
  | 'horizontal'
  | 'two-column'
  | 'frameless'
  | 'content-overlay'
  | 'compact-topbar'
  | 'sidebarless';
export type ContentWidth = 'fluid' | 'boxed' | 'narrow';
export type SidebarSkin = 'light' | 'dark' | 'brand';
export type CardStyle = 'elevated' | 'bordered' | 'borderless' | 'flat' | 'glass';
export type NavbarStyle = 'attached' | 'floating' | 'detached' | 'blur';
export type LayoutPosition = 'fixed' | 'scrollable';
export type TextDir = 'ltr' | 'rtl';

export interface ThemeSettings {
  theme: ThemeMode;
  layout: LayoutMode;
  contentWidth: ContentWidth;
  sidebarSkin: SidebarSkin;
  cardStyle: CardStyle;
  navbarStyle: NavbarStyle;
  layoutPosition: LayoutPosition;
  dir: TextDir;
}

const STORAGE_KEY = 'rd-theme-settings';

function loadInitial(): ThemeSettings {
  const defaults: ThemeSettings = {
    theme: 'light',
    layout: 'vertical',
    contentWidth: 'fluid',
    sidebarSkin: 'light',
    cardStyle: 'elevated',
    navbarStyle: 'attached',
    layoutPosition: 'fixed',
    dir: 'ltr',
  };
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export function syncHtmlAttributes(s: ThemeSettings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', s.theme);
  root.classList.toggle('dark', s.theme === 'dark');
  root.setAttribute('data-layout', s.layout);
  root.setAttribute('data-content-width', s.contentWidth);
  root.setAttribute('data-sidebar-skin', s.sidebarSkin);
  root.setAttribute('data-card-style', s.cardStyle);
  root.setAttribute('data-navbar-style', s.navbarStyle);
  root.setAttribute('data-layout-position', s.layoutPosition);
  root.setAttribute('dir', s.dir);
}

export const useThemeStore = defineStore('rd-theme', () => {
  const settings = ref<ThemeSettings>(loadInitial());
  const pageOverride = ref<Partial<ThemeSettings> | null>(null);

  const effective = (): ThemeSettings =>
    pageOverride.value ? { ...settings.value, ...pageOverride.value } : settings.value;

  watch(
    [settings, pageOverride],
    () => {
      syncHtmlAttributes(effective());
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value));
      } catch {
        // ignore storage quota errors
      }
    },
    { deep: true, immediate: true },
  );

  function toggleDarkMode() {
    settings.value.theme = settings.value.theme === 'dark' ? 'light' : 'dark';
  }

  function toggleSidebar() {
    settings.value.layout = settings.value.layout === 'collapsed' ? 'vertical' : 'collapsed';
  }

  function setLayout(layout: LayoutMode) {
    settings.value.layout = layout;
  }

  function toggleDir() {
    settings.value.dir = settings.value.dir === 'rtl' ? 'ltr' : 'rtl';
  }

  // Ephemeral per-page override — does not mutate persisted storage
  function updatePageSettings(partial: Partial<ThemeSettings>): () => void {
    pageOverride.value = partial;
    return () => {
      pageOverride.value = null;
    };
  }

  return {
    settings,
    pageOverride,
    effective,
    toggleDarkMode,
    toggleSidebar,
    setLayout,
    toggleDir,
    updatePageSettings,
  };
});
