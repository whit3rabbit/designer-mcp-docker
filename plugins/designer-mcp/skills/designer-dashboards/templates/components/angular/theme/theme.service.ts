import { Injectable, effect, signal } from '@angular/core';

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
export type TextDir = 'ltr' | 'rtl';

export interface ThemeSettings {
  theme: ThemeMode;
  layout: LayoutMode;
  contentWidth: ContentWidth;
  sidebarSkin: SidebarSkin;
  cardStyle: CardStyle;
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

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly settings = signal<ThemeSettings>(loadInitial());
  private readonly pageOverride = signal<Partial<ThemeSettings> | null>(null);

  constructor() {
    effect(() => {
      const s = this.effective();
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.setAttribute('data-theme', s.theme);
        root.classList.toggle('dark', s.theme === 'dark');
        root.setAttribute('data-layout', s.layout);
        root.setAttribute('data-content-width', s.contentWidth);
        root.setAttribute('data-sidebar-skin', s.sidebarSkin);
        root.setAttribute('data-card-style', s.cardStyle);
        root.setAttribute('dir', s.dir);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings()));
      } catch {
        // ignore storage quota errors
      }
    });
  }

  effective(): ThemeSettings {
    const ov = this.pageOverride();
    return ov ? { ...this.settings(), ...ov } : this.settings();
  }

  toggleDarkMode(): void {
    this.settings.update((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
  }

  toggleSidebar(): void {
    this.settings.update((s) => ({
      ...s,
      layout: s.layout === 'collapsed' ? 'vertical' : 'collapsed',
    }));
  }

  setLayout(layout: LayoutMode): void {
    this.settings.update((s) => ({ ...s, layout }));
  }

  toggleDir(): void {
    this.settings.update((s) => ({ ...s, dir: s.dir === 'rtl' ? 'ltr' : 'rtl' }));
  }

  updatePageSettings(partial: Partial<ThemeSettings>): () => void {
    this.pageOverride.set(partial);
    return () => this.pageOverride.set(null);
  }
}
