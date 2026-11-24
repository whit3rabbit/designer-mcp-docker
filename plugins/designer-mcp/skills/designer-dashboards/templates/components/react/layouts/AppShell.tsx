'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon } from '../@core/icons/registry';
import { useThemeStore } from '../@core/theme/themeStore';
import {
  filterNavByAuthority,
  getCurrentNavItem,
  getHorizontalNav,
  getNavBreadcrumb,
  getNavSearchIndex,
  isNavActive,
  isNavSubtreeActive,
} from '../@menu/useMenu';
import { navigationConfig, type NavItem } from '../configs/navigation.config';
import { NavMenu } from '../@menu/NavMenu';
import { HorizontalNav } from '../@menu/HorizontalNav';
import { Button } from '../components/ui/Button';
import { CommandPalette } from '../components/ui/CommandPalette';
import { CustomizerDrawer } from './CustomizerDrawer';
import { AiAssistantDrawer } from '../@core/ai/AiAssistantDrawer';

export interface AppShellProps {
  brandName?: string;
  pathname: string;
  onNavigate?: (path: string) => void;
  userRoles?: string[];
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({
  brandName = 'Designer Dashboards',
  pathname,
  onNavigate,
  userRoles = ['admin', 'user'],
  headerActions,
  children,
}: AppShellProps) {
  const { theme, layout, contentWidth, dir, toggleDarkMode, toggleSidebar, toggleDir } =
    useThemeStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [customizerOpen, setCustomizerOpen] = React.useState(false);
  const [aiOpen, setAiOpen] = React.useState(false);
  const mainRef = React.useRef<HTMLElement>(null);
  const [twoColGroupKey, setTwoColGroupKey] = React.useState<string | null>(null);

  const visibleNav = React.useMemo(
    () => filterNavByAuthority(navigationConfig, userRoles),
    [userRoles],
  );
  const mainNav = React.useMemo(() => visibleNav.filter((item) => !item.bottom), [visibleNav]);
  const bottomNav = React.useMemo(() => visibleNav.filter((item) => item.bottom), [visibleNav]);
  const horizontalNav = React.useMemo(() => getHorizontalNav(visibleNav), [visibleNav]);
  const currentItem = React.useMemo(
    () => getCurrentNavItem(visibleNav, pathname),
    [visibleNav, pathname],
  );
  const breadcrumb = React.useMemo(
    () => getNavBreadcrumb(visibleNav, pathname),
    [visibleNav, pathname],
  );
  const searchEntries = React.useMemo(() => getNavSearchIndex(visibleNav), [visibleNav]);

  // Global Cmd+K shortcut
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Sync document.title & move focus on route change (WCAG 2.1 AA)
  React.useEffect(() => {
    if (currentItem) {
      document.title = `${currentItem.title} · ${brandName}`;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, currentItem, brandName]);

  // Two-column rail: follow the active top-level group on navigation
  React.useEffect(() => {
    const owner = visibleNav.find(
      (item) =>
        (item.type === 'collapse' || item.type === 'group') &&
        item.children?.length &&
        isNavSubtreeActive(item, pathname),
    );
    setTwoColGroupKey(owner?.key ?? null);
  }, [pathname, visibleNav]);

  const effectiveLayout = currentItem?.meta?.layout ?? layout;
  const isCollapsed = effectiveLayout === 'collapsed';
  const isHorizontal = effectiveLayout === 'horizontal';
  const isTwoColumn = effectiveLayout === 'two-column';
  const effectiveContainer = currentItem?.meta?.container ?? contentWidth;

  const navigate = (path: string) => {
    onNavigate?.(path);
    setMobileOpen(false);
  };

  const twoColGroup =
    visibleNav.find(
      (item) =>
        item.key === twoColGroupKey &&
        (item.type === 'collapse' || item.type === 'group') &&
        item.children?.length,
    ) ?? null;

  const twoColRailButton = (item: NavItem) => {
    const isGroup = item.type === 'collapse' || item.type === 'group';
    const active = isGroup
      ? item.key === twoColGroupKey && isNavSubtreeActive(item, pathname)
      : isNavActive(item, pathname);
    return (
      <button
        key={item.key}
        type="button"
        title={item.title}
        aria-label={item.title}
        aria-current={active && !isGroup ? 'page' : undefined}
        aria-expanded={isGroup ? item.key === twoColGroupKey : undefined}
        onClick={() => {
          if (isGroup) setTwoColGroupKey(item.key);
          else if (item.path && !item.isExternalLink) navigate(item.path);
        }}
        style={{
          backgroundColor:
            active || (isGroup && item.key === twoColGroupKey)
              ? 'var(--color-primary-surface)'
              : 'transparent',
          color:
            active || (isGroup && item.key === twoColGroupKey)
              ? 'var(--color-primary)'
              : 'inherit',
          borderRadius: 'var(--radius-md)',
        }}
        className="flex w-full cursor-pointer justify-center px-2 py-2 text-sm font-medium"
      >
        {item.icon && <AppIcon name={item.icon} size={18} className="shrink-0" />}
      </button>
    );
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-canvas)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-sans)',
      }}
      className="min-h-screen"
    >
      {/* WCAG 2.1 AA Skip Link */}
      <a
        href="#main-content"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-solid)',
          zIndex: 'var(--z-tooltip)',
          borderRadius: 'var(--radius-md)',
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>

      {/* Mobile Scrim */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          style={{ zIndex: 'var(--z-scrim)' }}
          className="fixed inset-0 bg-[var(--color-scrim)] lg:hidden"
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar (vertical, collapsed & two-column modes) */}
        {!isHorizontal && (
          <aside
            aria-label="Primary navigation"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              zIndex: 'var(--z-sidebar)',
              transition: 'width var(--transition-layout)',
              width: isTwoColumn
                ? undefined
                : isCollapsed
                  ? 'var(--sidebar-collapsed-width)'
                  : 'var(--sidebar-width)',
            }}
            className={clsx(
              'rd-sidebar fixed inset-y-0 start-0 flex flex-col border-e lg:static',
              mobileOpen
                ? 'translate-x-0'
                : 'ltr:-translate-x-full rtl:translate-x-full lg:translate-x-0',
            )}
          >
            {isTwoColumn ? (
              <div className="flex h-full">
                {/* Mini rail: top-level items */}
                <div
                  style={{ width: 'var(--sidebar-collapsed-width)' }}
                  className="flex h-full flex-col"
                >
                  <div
                    style={{ height: 'var(--header-height)', borderColor: 'var(--color-border)' }}
                    className="flex items-center justify-center border-b px-2"
                  >
                    <span
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-on-solid)',
                        borderRadius: 'var(--radius-md)',
                      }}
                      className="flex size-8 shrink-0 items-center justify-center font-bold"
                    >
                      R
                    </span>
                  </div>
                  <nav
                    aria-label="Main menu"
                    className="flex-1 space-y-1 overflow-y-auto p-2"
                  >
                    {mainNav
                      .filter((item) => item.type !== 'title')
                      .map((item) => twoColRailButton(item))}
                  </nav>
                  {bottomNav.length > 0 && (
                    <div
                      style={{ borderColor: 'var(--color-border)' }}
                      className="space-y-1 border-t p-2"
                    >
                      {bottomNav
                        .filter((item) => item.type !== 'title')
                        .map((item) => twoColRailButton(item))}
                    </div>
                  )}
                </div>

                {/* Second column: children of the selected group */}
                {twoColGroup && (
                  <div
                    style={{
                      width: '13rem',
                      borderColor: 'var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                    }}
                    className="flex h-full flex-col border-e"
                  >
                    <div
                      style={{
                        height: 'var(--header-height)',
                        borderColor: 'var(--color-border)',
                      }}
                      className="flex items-center border-b px-4"
                    >
                      <span className="truncate text-sm font-semibold">{twoColGroup.title}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3">
                      <NavMenu
                        items={twoColGroup.children ?? []}
                        pathname={pathname}
                        onNavigate={navigate}
                        variant="panel"
                        ariaLabel={`${twoColGroup.title} submenu`}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div
                  style={{ height: 'var(--header-height)', borderColor: 'var(--color-border)' }}
                  className="flex items-center justify-between border-b px-4"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-on-solid)',
                        borderRadius: 'var(--radius-md)',
                      }}
                      className="flex size-8 shrink-0 items-center justify-center font-bold"
                    >
                      R
                    </span>
                    {!isCollapsed && (
                      <span className="truncate text-sm font-bold tracking-tight">{brandName}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    tone="neutral"
                    size="xs"
                    iconOnly
                    aria-label="Close navigation menu"
                    className="lg:hidden"
                    onClick={() => setMobileOpen(false)}
                  >
                    <AppIcon name="x" size={16} />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  <NavMenu
                    items={mainNav}
                    pathname={pathname}
                    onNavigate={navigate}
                    collapsed={isCollapsed}
                    ariaLabel="Main menu"
                  />
                </div>

                {/* Bottom-of-sidebar zone (settings/logout) */}
                {bottomNav.length > 0 && (
                  <div
                    style={{ borderColor: 'var(--color-border)' }}
                    className="border-t p-3"
                  >
                    <NavMenu
                      items={bottomNav}
                      pathname={pathname}
                      onNavigate={navigate}
                      collapsed={isCollapsed}
                      ariaLabel="Secondary menu"
                    />
                  </div>
                )}

                <div
                  style={{ borderColor: 'var(--color-border)' }}
                  className="hidden border-t p-3 lg:flex lg:justify-end"
                >
                  <Button
                    variant="ghost"
                    tone="neutral"
                    size="xs"
                    iconOnly
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    onClick={toggleSidebar}
                  >
                    <AppIcon name={isCollapsed ? 'chevron-right' : 'chevron-left'} size={16} />
                  </Button>
                </div>
              </>
            )}
          </aside>
        )}

        {/* Main Column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header
            style={{
              height: 'var(--header-height)',
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              zIndex: 'var(--z-header)',
            }}
            className="rd-topbar sticky top-0 flex items-center justify-between gap-4 border-b px-4 lg:px-6"
          >
            <div className="flex items-center gap-3">
              {!isHorizontal && (
                <Button
                  variant="ghost"
                  tone="neutral"
                  size="sm"
                  iconOnly
                  aria-label="Open navigation menu"
                  className="lg:hidden"
                  onClick={() => setMobileOpen(true)}
                >
                  <AppIcon name="menu" size={18} />
                </Button>
              )}

              {isHorizontal ? (
                <HorizontalNav
                  items={horizontalNav}
                  pathname={pathname}
                  onNavigate={navigate}
                />
              ) : (
                <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-xs sm:flex">
                  <span style={{ color: 'var(--color-text-muted)' }}>{brandName}</span>
                  {breadcrumb.map((item) => (
                    <React.Fragment key={item.key}>
                      <span style={{ color: 'var(--color-text-muted)' }}>/</span>
                      <span className="font-medium">{item.title}</span>
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                tone="neutral"
                size="xs"
                aria-label="Open command palette"
                onClick={() => setCmdOpen(true)}
                className="hidden sm:inline-flex"
              >
                <AppIcon name="search" size={14} />
                <span>Search</span>
                <kbd className="ms-1 opacity-70">⌘K</kbd>
              </Button>
              <Button
                variant="ghost"
                tone="neutral"
                size="sm"
                iconOnly
                aria-label="Open AI Assistant"
                onClick={() => setAiOpen(true)}
              >
                <AppIcon name="bot" size={17} />
              </Button>
              <Button
                variant="ghost"
                tone="neutral"
                size="sm"
                iconOnly
                aria-label={`Switch text direction (currently ${dir.toUpperCase()})`}
                onClick={toggleDir}
              >
                <AppIcon name="globe" size={17} />
              </Button>
              <Button
                variant="ghost"
                tone="neutral"
                size="sm"
                iconOnly
                aria-label="Toggle dark mode"
                onClick={toggleDarkMode}
              >
                <AppIcon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
              </Button>
              <Button
                variant="ghost"
                tone="neutral"
                size="sm"
                iconOnly
                aria-label="Open theme customizer"
                onClick={() => setCustomizerOpen(true)}
              >
                <AppIcon name="settings" size={17} />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main
            ref={mainRef}
            id="main-content"
            tabIndex={-1}
            style={{
              maxWidth: effectiveContainer === 'boxed' ? 'var(--content-max-width)' : undefined,
            }}
            className="mx-auto w-full flex-1 p-4 outline-none lg:p-6"
          >
            {currentItem && !currentItem.meta?.hideHeader && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1
                    style={{ fontWeight: 'var(--font-heading-weight)' }}
                    className="text-xl tracking-tight"
                  >
                    {currentItem.title}
                  </h1>
                  {currentItem.description && (
                    <p style={{ color: 'var(--color-text-muted)' }} className="mt-1 text-sm">
                      {currentItem.description}
                    </p>
                  )}
                </div>
                {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
              </div>
            )}
            {children}
          </main>
        </div>
      </div>

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        entries={searchEntries}
        onSelect={navigate}
      />
      <CustomizerDrawer open={customizerOpen} onClose={() => setCustomizerOpen(false)} />
      <AiAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
