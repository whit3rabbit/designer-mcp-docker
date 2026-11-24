'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'light' | 'dark';
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
export type CardStyle = 'elevated' | 'bordered' | 'borderless' | 'flat' | 'glass';
export type SidebarSkin = 'light' | 'dark' | 'brand';
export type NavbarStyle = 'attached' | 'floating' | 'detached' | 'blur';
export type LayoutPosition = 'fixed' | 'scrollable';
export type Direction = 'ltr' | 'rtl';
export type PrimaryPreset = 'default' | 'indigo' | 'emerald' | 'teal' | 'rose' | 'amber';

const PRIMARY_PRESET_OKLCH: Record<Exclude<PrimaryPreset, 'default'>, string> = {
  indigo: 'oklch(0.54 0.22 272)',
  emerald: 'oklch(0.55 0.16 155)',
  teal: 'oklch(0.54 0.14 188)',
  rose: 'oklch(0.56 0.21 15)',
  amber: 'oklch(0.58 0.16 68)',
};

export interface ThemeState {
  theme: ThemeMode;
  primaryPreset: PrimaryPreset;
  layout: LayoutMode;
  contentWidth: ContentWidth;
  cardStyle: CardStyle;
  sidebarSkin: SidebarSkin;
  navbarStyle: NavbarStyle;
  layoutPosition: LayoutPosition;
  dir: Direction;
  setTheme: (theme: ThemeMode) => void;
  setPrimaryPreset: (preset: PrimaryPreset) => void;
  toggleDarkMode: () => void;
  setLayout: (layout: LayoutMode) => void;
  toggleSidebar: () => void;
  setContentWidth: (contentWidth: ContentWidth) => void;
  setCardStyle: (cardStyle: CardStyle) => void;
  setSidebarSkin: (sidebarSkin: SidebarSkin) => void;
  setNavbarStyle: (navbarStyle: NavbarStyle) => void;
  setLayoutPosition: (layoutPosition: LayoutPosition) => void;
  toggleDir: () => void;
  updatePageSettings: (partial: Partial<Pick<ThemeState, 'layout' | 'contentWidth' | 'cardStyle' | 'sidebarSkin' | 'navbarStyle' | 'layoutPosition'>>) => void;
  resetSettings: () => void;
}

const DEFAULTS = {
  theme: 'system' as ThemeMode,
  primaryPreset: 'default' as PrimaryPreset,
  layout: 'vertical' as LayoutMode,
  contentWidth: 'fluid' as ContentWidth,
  cardStyle: 'elevated' as CardStyle,
  sidebarSkin: 'light' as SidebarSkin,
  navbarStyle: 'attached' as NavbarStyle,
  layoutPosition: 'fixed' as LayoutPosition,
  dir: 'ltr' as Direction,
};

function applyDomAttributes(
  state: Pick<
    ThemeState,
    'theme' | 'primaryPreset' | 'layout' | 'contentWidth' | 'cardStyle' | 'sidebarSkin' | 'navbarStyle' | 'layoutPosition' | 'dir'
  >,
) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const isDark =
    state.theme === 'dark' ||
    (state.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  root.classList.toggle('dark', isDark);
  root.setAttribute('data-layout', state.layout);
  root.setAttribute('data-content-width', state.contentWidth);
  root.setAttribute('data-card-style', state.cardStyle);
  root.setAttribute('data-sidebar-skin', state.sidebarSkin);
  root.setAttribute('data-navbar-style', state.navbarStyle);
  root.setAttribute('data-layout-position', state.layoutPosition);
  root.setAttribute('dir', state.dir);
  if (state.primaryPreset && state.primaryPreset !== 'default') {
    const color = PRIMARY_PRESET_OKLCH[state.primaryPreset];
    root.style.setProperty('--color-primary', color);
    root.style.setProperty('--color-primary-surface', `color-mix(in oklch, ${color} 14%, transparent)`);
    root.style.setProperty('--color-primary-border', `color-mix(in oklch, ${color} 32%, transparent)`);
    root.style.setProperty('--color-primary-hover', `color-mix(in oklch, ${color} 88%, black)`);
  } else {
    root.style.removeProperty('--color-primary');
    root.style.removeProperty('--color-primary-surface');
    root.style.removeProperty('--color-primary-border');
    root.style.removeProperty('--color-primary-hover');
  }
  try {
    localStorage.setItem('rd-theme', state.theme);
  } catch {
    // ignore storage errors
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      setTheme: (theme) => {
        set({ theme });
        applyDomAttributes({ ...get(), theme });
      },
      setPrimaryPreset: (primaryPreset) => {
        set({ primaryPreset });
        applyDomAttributes({ ...get(), primaryPreset });
      },
      toggleDarkMode: () => {
        const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        applyDomAttributes({ ...get(), theme: next });
      },
      setLayout: (layout) => {
        set({ layout });
        applyDomAttributes({ ...get(), layout });
      },
      toggleSidebar: () => {
        const next: LayoutMode = get().layout === 'collapsed' ? 'vertical' : 'collapsed';
        set({ layout: next });
        applyDomAttributes({ ...get(), layout: next });
      },
      setContentWidth: (contentWidth) => {
        set({ contentWidth });
        applyDomAttributes({ ...get(), contentWidth });
      },
      setCardStyle: (cardStyle) => {
        set({ cardStyle });
        applyDomAttributes({ ...get(), cardStyle });
      },
      setSidebarSkin: (sidebarSkin) => {
        set({ sidebarSkin });
        applyDomAttributes({ ...get(), sidebarSkin });
      },
      setNavbarStyle: (navbarStyle) => {
        set({ navbarStyle });
        applyDomAttributes({ ...get(), navbarStyle });
      },
      setLayoutPosition: (layoutPosition) => {
        set({ layoutPosition });
        applyDomAttributes({ ...get(), layoutPosition });
      },
      toggleDir: () => {
        const next: Direction = get().dir === 'ltr' ? 'rtl' : 'ltr';
        set({ dir: next });
        applyDomAttributes({ ...get(), dir: next });
      },
      updatePageSettings: (partial) => {
        const next = { ...get(), ...partial };
        set(partial);
        applyDomAttributes(next);
      },
      resetSettings: () => {
        set(DEFAULTS);
        applyDomAttributes(DEFAULTS);
      },
    }),
    {
      name: 'rd-settings',
      onRehydrateStorage: () => (state) => {
        if (state) applyDomAttributes(state);
      },
    },
  ),
);

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = useThemeStore.getState();
    if (state.theme === 'system') applyDomAttributes(state);
  });
}
