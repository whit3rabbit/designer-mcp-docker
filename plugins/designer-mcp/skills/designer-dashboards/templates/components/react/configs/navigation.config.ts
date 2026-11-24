// Designer Dashboards Unified Navigation IR — the app's primary information architecture.
// Routes, breadcrumbs, page titles, document titles, RBAC filtering, horizontal-nav
// membership, and the Cmd+K search index all derive from this one tree.
// Conforms to templates/starters/nav-ir.schema.json.

export type NavItemType = 'title' | 'group' | 'collapse' | 'item';

export interface NavItem {
  key: string;                // Unique stable ID (breadcrumb anchor + aria wiring)
  title: string;              // Fallback display label
  translateKey: string;       // i18n key resolved via resolveLabel() — from day one
  type: NavItemType;          // 'title' = non-clickable section header
  icon?: string;              // IconRegistry string key — NEVER JSX
  path?: string;              // Route href (required on type 'item')
  description?: string;       // Tooltip / page-header subtitle
  badge?: { value: string; color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' };
  authority?: string[];       // RBAC roles — filters BOTH this menu and route access
  disabled?: boolean;
  expanded?: boolean;         // Initial open state of a collapse group
  pinned?: boolean;           // Also listed in the sidebar "Pinned" quick-access section
  pinnable?: boolean;         // User-toggleable bookmark/shortcut (localStorage)
  bottom?: boolean;           // Bottom-of-sidebar zone (settings/logout)
  isExternalLink?: boolean;
  activeUrl?: string;         // Base prefix for dynamic detail routes (/orders/details/:id)
  activeOptions?: { exact?: boolean; queryParams?: 'exact' | 'ignored' };
  quickCreate?: { tooltip: string; path: string }; // Inline `+` quick-create action
  collapseLimit?: number;     // Inline "Show N more / Show less" truncation
  meta?: {
    horizontalMenu?: boolean; // false hides this top-level item from the horizontal navbar
    megaMenu?: boolean;       // Horizontal navbar renders children as mega-menu columns
    horizontalMenuLayout?: 'dropdown' | 'columns' | 'tabs' | 'thumbnail-grid';
    layout?: 'vertical' | 'collapsed' | 'hover' | 'horizontal' | 'two-column' | 'frameless' | 'content-overlay' | 'compact-topbar' | 'sidebarless';
    container?: 'fluid' | 'boxed' | 'narrow';  // Per-page content-width override
    hideHeader?: boolean;
    hideFooter?: boolean;
    promoSlot?: boolean;
  };
  children?: NavItem[];       // Recursive; 3 levels recommended, 5 supported
}

// Leaf paths must match routes that exist in the app. Run
// `node <designer-dashboards>/scripts/generate.mjs page settings` (or `vertical ecommerce`)
// to create the pages referenced below, or adjust paths to your routes.
export const navigationConfig: NavItem[] = [
  {
    key: 'section-main',
    title: 'Main',
    translateKey: 'nav.sectionMain',
    type: 'title',
  },
  {
    key: 'dashboards',
    title: 'Dashboards',
    translateKey: 'nav.dashboards',
    type: 'collapse',
    icon: 'layout-dashboard',
    expanded: true,
    children: [
      {
        key: 'analytics',
        title: 'Analytics',
        translateKey: 'nav.analytics',
        type: 'item',
        icon: 'bar-chart-3',
        path: '/dashboard/analytics',
        authority: ['admin', 'user'],
        pinned: true,
      },
      {
        key: 'ecommerce',
        title: 'E-commerce',
        translateKey: 'nav.ecommerce',
        type: 'item',
        icon: 'shopping-cart',
        path: '/dashboard/ecommerce',
        badge: { value: 'New', color: 'success' },
        authority: ['admin', 'user'],
      },
    ],
  },
  {
    key: 'section-platform',
    title: 'Platform',
    translateKey: 'nav.sectionPlatform',
    type: 'title',
  },
  {
    key: 'ui-toolkit',
    title: 'UI Toolkit',
    translateKey: 'nav.uiToolkit',
    type: 'collapse',
    icon: 'sparkles',
    meta: { megaMenu: true },
    children: [
      {
        key: 'ui-elements',
        title: 'Elements',
        translateKey: 'nav.uiElements',
        type: 'title',
      },
      {
        key: 'icons',
        title: 'Icon Catalog',
        translateKey: 'nav.icons',
        type: 'item',
        icon: 'zap',
        path: '/ui/icons',
      },
      {
        key: 'styleguide',
        title: 'Styleguide',
        translateKey: 'nav.styleguide',
        type: 'item',
        icon: 'table',
        path: '/ui/styleguide',
      },
    ],
  },
  {
    key: 'docs',
    title: 'Documentation',
    translateKey: 'nav.docs',
    type: 'item',
    icon: 'arrow-up-right',
    path: 'https://github.com/your-org/your-dashboard/wiki',
    isExternalLink: true,
    meta: { horizontalMenu: false },
  },
  {
    key: 'settings',
    title: 'Settings',
    translateKey: 'nav.settings',
    type: 'item',
    icon: 'settings',
    path: '/settings',
    bottom: true,
    authority: ['admin'],
    activeOptions: { exact: true },
  },
];
