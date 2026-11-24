import type { NavItem } from '../configs/navigation.config';

// Normalize trailing slashes so `/settings/` matches `/settings` cleanly.
function normalizePath(value: string): string {
  if (value === '/') return '/';
  return value.replace(/\/+$/, '') || '/';
}

// Active-state: segment-safe prefix match by default (so /settings matches
// /settings/profile, but /ui/in never matches /ui/inputs).
// `activeOptions.exact` forces an exact match.
export function isNavActive(item: NavItem, pathname: string): boolean {
  const rawTarget = item.activeUrl ?? item.path;
  if (!rawTarget) return false;
  const cleanPath = normalizePath(pathname);
  const cleanTarget = normalizePath(rawTarget);
  if (item.activeOptions?.exact) return cleanPath === cleanTarget;
  if (cleanTarget === '/') return cleanPath === '/';
  return cleanPath === cleanTarget || cleanPath.startsWith(`${cleanTarget}/`);
}

// True when the item itself or any descendant is active — used to highlight
// horizontal-nav dropdown triggers and two-column rails.
export function isNavSubtreeActive(item: NavItem, pathname: string): boolean {
  if (isNavActive(item, pathname)) return true;
  return (item.children ?? []).some((child) => isNavSubtreeActive(child, pathname));
}

// Longest/most-specific match wins: when both a
// parent (/apps) and a child (/apps/mail) carry paths, the child drives the
// page title and document title.
export function getCurrentNavItem(items: NavItem[], pathname: string): NavItem | undefined {
  let best: NavItem | undefined;
  let bestDepth = -1;
  const visit = (list: NavItem[], depth: number) => {
    for (const item of list) {
      if (item.path && isNavActive(item, pathname) && depth > bestDepth) {
        best = item;
        bestDepth = depth;
      }
      if (item.children) visit(item.children, depth + 1);
    }
  };
  visit(items, 0);
  return best;
}

// Ancestor chain for <Breadcrumb> — non-clickable `title` headers are excluded.
export function getNavBreadcrumb(items: NavItem[], pathname: string): NavItem[] {
  for (const item of items) {
    if (item.type === 'title') continue;
    if (item.path && isNavActive(item, pathname)) return [item];
    if (item.children) {
      const chain = getNavBreadcrumb(item.children, pathname);
      if (chain.length > 0) return [item, ...chain];
    }
  }
  return [];
}

// RBAC: prunes unauthorized items AND groups left empty by filtering — the same
// `authority` array drives route guards (AuthorityGuard) so menu and access
// never drift.
export function filterNavByAuthority(items: NavItem[], userRoles: string[]): NavItem[] {
  return items.reduce<NavItem[]>((acc, item) => {
    if (item.authority && item.authority.length > 0) {
      const allowed = item.authority.some((role) => userRoles.includes(role));
      if (!allowed) return acc;
    }
    if (item.children) {
      const filteredChildren = filterNavByAuthority(item.children, userRoles);
      if (filteredChildren.length === 0 && !item.path) return acc;
      acc.push({ ...item, children: filteredChildren });
      return acc;
    }
    acc.push(item);
    return acc;
  }, []);
}

// i18n: resolve `translateKey` through the active translator with `title` as
// fallback. Pass a bound t() from your i18n layer; `translateKey` is authored
// from day one so locale key parity is checkable.
export function resolveLabel(item: NavItem, t: (key: string) => string): string {
  if (!item.translateKey) return item.title;
  const resolved = t(item.translateKey);
  return resolved === item.translateKey ? item.title : resolved;
}

// Horizontal navbar membership: top-level items only, `title` headers hidden,
// opt-out per item via `meta.horizontalMenu: false`. Nested children render as
// dropdowns (or mega-menu columns when `meta.megaMenu`) — one tree feeds every
// layout, never a duplicated horizontal config.
export function getHorizontalNav(items: NavItem[]): NavItem[] {
  return items.filter(
    (item) => item.type !== 'title' && item.meta?.horizontalMenu !== false,
  );
}

export interface NavSearchEntry {
  key: string;
  title: string;
  path: string;
  icon?: string;
  group?: string;
  description?: string;
}

// Flat index for the CommandPalette (Cmd+K) — disabled items excluded.
export function getNavSearchIndex(items: NavItem[], group?: string): NavSearchEntry[] {
  const out: NavSearchEntry[] = [];
  let currentGroup = group;
  for (const item of items) {
    if (item.type === 'title') {
      currentGroup = item.title;
      continue;
    }
    if (item.path && !item.disabled) {
      out.push({
        key: item.key,
        title: item.title,
        path: item.path,
        icon: item.icon,
        group: currentGroup,
        description: item.description,
      });
    }
    if (item.children) {
      out.push(...getNavSearchIndex(item.children, item.title));
    }
  }
  return out;
}

// Leaf items flagged `pinned: true` — rendered as a
// quick-access section at the top of the sidebar.
export function getPinnedNavItems(items: NavItem[]): NavItem[] {
  const out: NavItem[] = [];
  for (const item of items) {
    if (item.type !== 'title' && item.pinned && item.path) out.push(item);
    if (item.children) out.push(...getPinnedNavItems(item.children));
  }
  return out;
}

// Extract the active subtree at a given depth (0-indexed) for contextual
// secondary navbars or two-column panels.
export function getNavChildrenAtLevel(
  items: NavItem[],
  pathname: string,
  level = 1,
): NavItem[] {
  if (level <= 0) return items;
  const activeBranch = items.find((item) => isNavSubtreeActive(item, pathname));
  if (!activeBranch?.children?.length) return [];
  return getNavChildrenAtLevel(activeBranch.children, pathname, level - 1);
}

// Toggle a user-pinnable nav key in a persisted bookmark list.
export function togglePinnedKey(pinnedKeys: string[], key: string): string[] {
  return pinnedKeys.includes(key)
    ? pinnedKeys.filter((k) => k !== key)
    : [...pinnedKeys, key];
}

// Hide a `title` section header when every sibling item before the next `title`
// is already pinned to the quick-access section.
export function shouldHideNavSection(
  sectionKey: string,
  items: NavItem[],
  pinnedKeys: string[],
): boolean {
  const idx = items.findIndex((item) => item.key === sectionKey);
  if (idx === -1) return false;
  const sectionItems: NavItem[] = [];
  for (let i = idx + 1; i < items.length; i++) {
    if (items[i].type === 'title') break;
    sectionItems.push(items[i]);
  }
  return sectionItems.length > 0 && sectionItems.every((item) => pinnedKeys.includes(item.key));
}

// Group mega-menu children by `title` headers into columns.
export function getMegaMenuColumns(
  children: NavItem[],
): Array<{ header?: NavItem; links: NavItem[] }> {
  const columns: Array<{ header?: NavItem; links: NavItem[] }> = [];
  for (const child of children) {
    if (child.type === 'title') {
      columns.push({ header: child, links: [] });
    } else if (columns.length > 0) {
      columns[columns.length - 1].links.push(child);
    } else {
      columns.push({ links: [child] });
    }
  }
  return columns;
}
