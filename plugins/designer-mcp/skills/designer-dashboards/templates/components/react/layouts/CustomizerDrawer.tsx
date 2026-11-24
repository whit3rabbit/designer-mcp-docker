'use client';

import * as React from 'react';
import {
  useThemeStore,
  type CardStyle,
  type ContentWidth,
  type LayoutMode,
  type LayoutPosition,
  type NavbarStyle,
  type PrimaryPreset,
  type SidebarSkin,
  type ThemeMode,
} from '../@core/theme/themeStore';
import { Drawer } from '../components/ui/Drawer';
import { Button } from '../components/ui/Button';

export interface CustomizerDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CustomizerDrawer({ open, onClose }: CustomizerDrawerProps) {
  const {
    theme,
    primaryPreset,
    layout,
    contentWidth,
    cardStyle,
    sidebarSkin,
    navbarStyle,
    layoutPosition,
    dir,
    setTheme,
    setPrimaryPreset,
    setLayout,
    setContentWidth,
    setCardStyle,
    setSidebarSkin,
    setNavbarStyle,
    setLayoutPosition,
    toggleDir,
    resetSettings,
  } = useThemeStore();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Theme Customizer"
      description="Live attribute-driven layout, skin, and direction controls."
    >
      <div className="space-y-6 text-xs">
        <div className="space-y-2">
          <p className="font-semibold uppercase tracking-wider">Appearance</p>
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
              <Button
                key={m}
                size="sm"
                variant={theme === m ? 'solid' : 'outline'}
                tone={theme === m ? 'primary' : 'neutral'}
                onClick={() => setTheme(m)}
              >
                {m}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold uppercase tracking-wider">Layout Mode</p>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                'vertical',
                'collapsed',
                'hover',
                'horizontal',
                'two-column',
                'frameless',
                'content-overlay',
                'compact-topbar',
                'sidebarless',
              ] as LayoutMode[]
            ).map((m) => (
              <Button
                key={m}
                size="sm"
                variant={layout === m ? 'solid' : 'outline'}
                tone={layout === m ? 'primary' : 'neutral'}
                onClick={() => setLayout(m)}
              >
                {m}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold uppercase tracking-wider">Content Width</p>
          <div className="grid grid-cols-3 gap-2">
            {(['fluid', 'boxed', 'narrow'] as ContentWidth[]).map((w) => (
              <Button
                key={w}
                size="sm"
                variant={contentWidth === w ? 'solid' : 'outline'}
                tone={contentWidth === w ? 'primary' : 'neutral'}
                onClick={() => setContentWidth(w)}
              >
                {w}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold uppercase tracking-wider">Card Style</p>
          <div className="grid grid-cols-3 gap-2">
            {(['elevated', 'bordered', 'borderless', 'flat', 'glass'] as CardStyle[]).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={cardStyle === s ? 'solid' : 'outline'}
                tone={cardStyle === s ? 'primary' : 'neutral'}
                onClick={() => setCardStyle(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold uppercase tracking-wider">Sidebar Skin</p>
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'dark', 'brand'] as SidebarSkin[]).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={sidebarSkin === s ? 'solid' : 'outline'}
                tone={sidebarSkin === s ? 'primary' : 'neutral'}
                onClick={() => setSidebarSkin(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold uppercase tracking-wider">Navbar Style</p>
          <div className="grid grid-cols-4 gap-2">
            {(['attached', 'floating', 'detached', 'blur'] as NavbarStyle[]).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={navbarStyle === s ? 'solid' : 'outline'}
                tone={navbarStyle === s ? 'primary' : 'neutral'}
                onClick={() => setNavbarStyle(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold uppercase tracking-wider">Shell Position</p>
          <div className="grid grid-cols-2 gap-2">
            {(['fixed', 'scrollable'] as LayoutPosition[]).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={layoutPosition === p ? 'solid' : 'outline'}
                tone={layoutPosition === p ? 'primary' : 'neutral'}
                onClick={() => setLayoutPosition(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold uppercase tracking-wider">Primary Accent</p>
          <div className="grid grid-cols-3 gap-2">
            {(['default', 'indigo', 'emerald', 'teal', 'rose', 'amber'] as PrimaryPreset[]).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={primaryPreset === p ? 'solid' : 'outline'}
                tone={primaryPreset === p ? 'primary' : 'neutral'}
                onClick={() => setPrimaryPreset(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="font-semibold uppercase tracking-wider">Direction ({dir.toUpperCase()})</span>
          <Button size="sm" variant="outline" tone="neutral" onClick={toggleDir}>
            Switch to {dir === 'ltr' ? 'RTL' : 'LTR'}
          </Button>
        </div>

        <div
          style={{ borderColor: 'var(--color-border)' }}
          className="border-t pt-4"
        >
          <Button size="sm" variant="tonal" tone="neutral" className="w-full" onClick={resetSettings}>
            Reset to Defaults
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
