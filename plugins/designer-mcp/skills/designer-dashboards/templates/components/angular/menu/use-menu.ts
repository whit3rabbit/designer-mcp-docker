import type { NavItem } from '../configs/navigation.config';

function normalizePath(value: string): string {
  if (value === '/') return '/';
  return value.replace(/\/+$/, '') || '/';
}

export function isNavActive(item: NavItem, pathname: string): boolean {
  const rawTarget = item.activeUrl ?? item.path;
  if (!rawTarget) return false;
  const cleanPath = normalizePath(pathname);
  const cleanTarget = normalizePath(rawTarget);
  if (item.activeOptions?.exact) return cleanPath === cleanTarget;
  if (cleanTarget === '/') return cleanPath === '/';
  return cleanPath === cleanTarget || cleanPath.startsWith(`${cleanTarget}/`);
}

export function isNavSubtreeActive(item: NavItem, pathname: string): boolean {
  if (isNavActive(item, pathname)) return true;
  return (item.children ?? []).some((child) => isNavSubtreeActive(child, pathname));
}

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

export function filterNavByAuthority(items: NavItem[], userRoles: string[]): NavItem[] {
  return items.reduce<NavItem[]>((acc, item) => {
    if (item.authority && item.authority.length > 0) {
      if (!item.authority.some((role) => userRoles.includes(role))) return acc;
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

export function getHorizontalNav(items: NavItem[]): NavItem[] {
  return items.filter((item) => item.type !== 'title' && item.meta?.horizontalMenu !== false);
}

export function getPinnedNavItems(items: NavItem[]): NavItem[] {
  const out: NavItem[] = [];
  for (const item of items) {
    if (item.type !== 'title' && item.pinned && item.path) out.push(item);
    if (item.children) out.push(...getPinnedNavItems(item.children));
  }
  return out;
}

export function getNavChildrenAtLevel(items: NavItem[], pathname: string, level = 1): NavItem[] {
  if (level <= 0) return items;
  const activeBranch = items.find((item) => isNavSubtreeActive(item, pathname));
  if (!activeBranch?.children?.length) return [];
  return getNavChildrenAtLevel(activeBranch.children, pathname, level - 1);
}
