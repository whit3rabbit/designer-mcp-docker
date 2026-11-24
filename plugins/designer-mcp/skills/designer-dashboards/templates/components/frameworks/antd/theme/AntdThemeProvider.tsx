'use client';

import * as React from 'react';
import { ConfigProvider, theme as antdTheme, type ThemeConfig } from 'antd';
import type { DirectionType } from 'antd/es/config-provider';

export interface AntdThemeProviderProps {
  children: React.ReactNode;
  /** Optional override for theme mode; defaults to observing `<html data-theme>`. */
  mode?: 'light' | 'dark';
  /** Optional override for text direction; defaults to observing `<html dir>`. */
  direction?: DirectionType;
}

interface ResolvedTokens {
  colorPrimary: string;
  colorBgLayout: string;
  colorBgContainer: string;
  colorBgElevated: string;
  colorBorder: string;
  colorText: string;
  colorTextSecondary: string;
  colorSuccess: string;
  colorWarning: string;
  colorError: string;
  colorInfo: string;
  fontFamily: string;
  fontFamilyCode: string;
  borderRadius: number;
}

/**
 * Resolves a CSS color variable (including OKLCH / color-mix expressions) into
 * an `rgb(...)` string that Ant Design's color derivation algorithm can parse.
 */
function resolveCssColor(varName: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const probe = document.createElement('span');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.color = `var(${varName})`;
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  return computed && computed !== '' ? computed : fallback;
}

function readCssString(varName: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

function readBorderRadius(fallback = 8): number {
  const raw = readCssString('--radius-md', `${fallback}px`);
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readOpenDesignTokens(isDark: boolean): ResolvedTokens {
  return {
    colorPrimary: resolveCssColor('--color-primary', isDark ? 'rgb(99, 102, 241)' : 'rgb(79, 70, 229)'),
    colorBgLayout: resolveCssColor('--color-canvas', isDark ? 'rgb(15, 23, 42)' : 'rgb(248, 250, 252)'),
    colorBgContainer: resolveCssColor('--color-surface', isDark ? 'rgb(30, 41, 59)' : 'rgb(252, 252, 253)'),
    colorBgElevated: resolveCssColor('--color-surface-elevated', isDark ? 'rgb(38, 51, 72)' : 'rgb(250, 251, 252)'),
    colorBorder: resolveCssColor('--color-border', isDark ? 'rgb(51, 65, 85)' : 'rgb(226, 232, 240)'),
    colorText: resolveCssColor('--color-text', isDark ? 'rgb(241, 245, 249)' : 'rgb(15, 23, 42)'),
    colorTextSecondary: resolveCssColor('--color-text-muted', isDark ? 'rgb(148, 163, 184)' : 'rgb(100, 116, 139)'),
    colorSuccess: resolveCssColor('--color-success', 'rgb(22, 163, 74)'),
    colorWarning: resolveCssColor('--color-warning', 'rgb(217, 119, 6)'),
    colorError: resolveCssColor('--color-error', 'rgb(220, 38, 38)'),
    colorInfo: resolveCssColor('--color-info', 'rgb(2, 132, 199)'),
    fontFamily: readCssString('--font-sans', 'Inter, system-ui, -apple-system, sans-serif'),
    fontFamilyCode: readCssString('--font-mono', 'ui-monospace, SFMono-Regular, monospace'),
    borderRadius: readBorderRadius(8),
  };
}

function detectDomDark(): boolean {
  if (typeof document === 'undefined') return false;
  const root = document.documentElement;
  return root.getAttribute('data-theme') === 'dark' || root.classList.contains('dark');
}

function detectDomDir(): DirectionType {
  if (typeof document === 'undefined') return 'ltr';
  return document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
}

export function AntdThemeProvider({
  children,
  mode,
  direction,
}: AntdThemeProviderProps) {
  const [domDark, setDomDark] = React.useState<boolean>(() => detectDomDark());
  const [domDir, setDomDir] = React.useState<DirectionType>(() => detectDomDir());
  const [tokens, setTokens] = React.useState<ResolvedTokens>(() =>
    readOpenDesignTokens(mode ? mode === 'dark' : detectDomDark()),
  );

  const isDark = mode ? mode === 'dark' : domDark;
  const resolvedDir = direction ?? domDir;

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    const sync = () => {
      const nextDark = mode ? mode === 'dark' : detectDomDark();
      setDomDark(nextDark);
      setDomDir(detectDomDir());
      setTokens(readOpenDesignTokens(nextDark));
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'dir', 'style'],
    });

    return () => observer.disconnect();
  }, [mode]);

  const themeConfig = React.useMemo<ThemeConfig>(
    () => ({
      cssVar: true,
      hashed: false,
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: tokens.colorPrimary,
        colorBgLayout: tokens.colorBgLayout,
        colorBgContainer: tokens.colorBgContainer,
        colorBgElevated: tokens.colorBgElevated,
        colorBorder: tokens.colorBorder,
        colorBorderSecondary: tokens.colorBorder,
        colorText: tokens.colorText,
        colorTextSecondary: tokens.colorTextSecondary,
        colorSuccess: tokens.colorSuccess,
        colorWarning: tokens.colorWarning,
        colorError: tokens.colorError,
        colorInfo: tokens.colorInfo,
        fontFamily: tokens.fontFamily,
        fontFamilyCode: tokens.fontFamilyCode,
        borderRadius: tokens.borderRadius,
      },
      components: {
        Card: {
          colorBgContainer: tokens.colorBgContainer,
          colorBorderSecondary: tokens.colorBorder,
        },
        Table: {
          colorBgContainer: tokens.colorBgContainer,
          headerBg: tokens.colorBgElevated,
          borderColor: tokens.colorBorder,
        },
        Modal: {
          contentBg: tokens.colorBgContainer,
          headerBg: tokens.colorBgContainer,
        },
      },
    }),
    [isDark, tokens],
  );

  return (
    <ConfigProvider theme={themeConfig} direction={resolvedDir}>
      {children}
    </ConfigProvider>
  );
}
