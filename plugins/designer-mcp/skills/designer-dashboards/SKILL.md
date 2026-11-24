---
name: designer-dashboards
description: "Scaffold, style, and audit multi-framework admin dashboards, SaaS consoles, and internal tools (init, design, ui, login, pages, audit)."
---

# Designer Dashboards (`designer-dashboards`)

`designer-dashboards` encodes battle-tested patterns from 17 commercial dashboard templates and 20 modern UI/CSS frameworks into a lean, OpenDesign-governed workflow that eliminates template bloat (multiple icon/chart/toast libraries, cosmetic localStorage auth, zero a11y, copy-paste variants).

## Subskill Routing

Read [rules/AGENTS.md](rules/AGENTS.md) before generating any dashboard code. Activate the matching subskill based on what the user needs right now:

| Need | Subskill | Path |
|---|---|---|
| Start a new dashboard project, pick tech stack profile/libraries/package manager/hosting/backend | `designer-dashboards:init` | [init/SKILL.md](init/SKILL.md) |
| Create or customize `DESIGN.md`, `theme.json`, `DESIGN.evidence.json`, `styles.css` (OKLCH + `color-mix()`, `--chart-*`, `--chart-seq-*`, `@layer vendor` ApexCharts skin), `user-overrides.css`, and `_adherence.oxlintrc.json` | `designer-dashboards:design` | [design/SKILL.md](design/SKILL.md) |
| Build dashboard UI primitives: sizing, icons, `chartPresets` + `<ChartWrapper>` + `<LiveChart>`, `<RegionMap>`, TanStack server-mode `<DataGrid>`, `<FilterBar>`, `<KpiCard>`, `<WidgetCard>`, `<EmptyState>`, `<Skeleton>`, forms, Sonner + native Top-Layer/headless overlays | `designer-dashboards:ui` | [ui/SKILL.md](ui/SKILL.md) |
| Build auth pages (login, register, forgot, reset, 2FA/OTP, verify-email, 401/403), shell variants, RBAC guards, JWT/OAuth/session & backend-aware security | `designer-dashboards:login` | [login/SKILL.md](login/SKILL.md) |
| Define unified Nav IR, derived page chrome, vertical dashboards, 11 app shells, `data-layer`, `fake-db`/API routes, print invoices, multi-framework layouts, AI slot | `designer-dashboards:pages` | [pages/SKILL.md](pages/SKILL.md) |
| Verify token parity, Nav IR & modern web lint rules (`lint-nav.mjs`), ESLint (`typescript-eslint` + `jsx-a11y`), WCAG 2.1 AA 18-point spec, RTL logical properties, state/data hygiene, dependency hygiene, and secret safety | `designer-dashboards:audit` | [audit/SKILL.md](audit/SKILL.md) |

## MCP Tools & Authority

- **Offline MCP lookup:** Use `design_dashboards` (with optional `kind` or `query` filter) and `design_dashboards` to browse or read tech stacks, starters, OpenDesign presets, industry verticals, framework component kits (`mantine`, `heroui`, `chakra`, `mui`, `antd`, `primereact`, `daisyui`, `base-ui`, `coss-ui`, `ark-ui`, `react-bits`, `magic-ui`, `aceternity-ui`, `21st-dev`, `motion-primitives`, `unocss`, `panda-css`, `vanilla-extract`, `stylex`, `open-props`), references, and subskills without needing to locate the skill directory first.
- **Kit ID mapping (`design_dashboards` -> catalog MCP tools):** Seven framework directory ids match `design_kit_*` directly (`chakra`, `mui`, `antd`, `primereact`, `unocss`, `vanilla-extract`, `stylex`). Nine map to a different `kit` argument, and four use their own tool family:

  | Framework directory | Tool | `kit` argument / notes |
  |---|---|---|
  | `coss-ui` | `design_kit_*` | `coss` |
  | `magic-ui` | `design_kit_*` | `magicui` |
  | `motion-primitives` | `design_kit_*` | `motion` |
  | `panda-css` | `design_kit_*` | `panda` |
  | `open-props` | `design_kit_*` | `openprops` |
  | `ark-ui` | `design_kit_*` | `ark` |
  | `react-bits` | `design_kit_*` | `reactbits` (index only, licence-restricted) |
  | `aceternity-ui` | `design_kit_*` | `aceternity` (index only, licence-restricted) |
  | `21st-dev` | `design_kit_*` | `twentyfirst` (index only, licence-restricted) |
  | `mantine` | `design_kit_* (kit: "mantine")` | dedicated tool family |
  | `heroui` | `design_kit_* (kit: "heroui")` | dedicated tool family |
  | `daisyui` | `design_kit_* (kit: "daisyui")` | dedicated tool family |
  | `base-ui` | `design_kit_* (kit: "baseui")` | dedicated tool family (docs only) |

- **Design authority:** The [design-system](../design-system/SKILL.md) skill owns the research workflow, reference lock, and `DESIGN.md` contract. Use [designer-ui](../designer-ui/SKILL.md) for general UI craft and component-library docs (`design_kit_*`, `design_kit_* (kit: "mantine")`, `design_kit_* (kit: "heroui")`, `design_kit_* (kit: "daisyui")`, `design_kit_* (kit: "baseui")`), [designer-documents](../designer-documents/SKILL.md) for file deliverables, and [designer-mcp](../designer-mcp/SKILL.md) for catalog setup.

## Recommended Full-Project Order

In commands below, `<designer-dashboards-root>` is the directory holding this `SKILL.md`. When building a dashboard from scratch, run the subskills in sequence:
1. `designer-dashboards:init` -> scaffold stack, `@core/@layouts/@menu` layers, package manager, hosting config, and FOUC-free pre-paint theme bootstrap.
2. `designer-dashboards:design` -> lock `DESIGN.md` + `theme.json` + contrast-verified OKLCH `styles.css` (`--chart-1..10`, `--chart-seq-1..5`, `--chart-grid`, `--chart-tooltip-bg`, `@layer vendor` chart skin) + `_adherence.oxlintrc.json`.
3. `designer-dashboards:ui` -> wire IconRegistry, Button grammar, `chartPresets` (`<slug>.charts.ts` config-as-data) + `<ChartWrapper>` + `<LiveChart>`, `<RegionMap>`, `<KpiCard>`, `<WidgetCard>` (`@container`, `skeletonVariant`, `collapsible`, `tabs`, `fullscreen`, `pin`), `<EmptyState>`, `<DataGrid>` (`ColumnMeta.skeleton`), `<FilterBar>`, forms, single-engine Sonner toasts + native `<dialog>`/Popover API (or `radix-ui`/`@base-ui/react`) overlays (`--z-*` shell ladder, `--color-scrim`, `CommandPalette`, `NotificationsSheet`), and derived `<PageHeader>`/`<Breadcrumb>` chrome.
4. `designer-dashboards:login` -> generate auth shell, 7-page auth suite, RBAC `authority` guards, and real auth adapter.
5. `designer-dashboards:pages` -> author `navigation.config.ts`, vertical dashboards, app shells, and optional AI assistant panel.
6. `designer-dashboards:audit` -> run `node <designer-dashboards-root>/scripts/verify-dashboard.mjs <project>` and complete the WCAG 2.1 AA + RTL + security gate.

## Security & Auth Baseline (Backend-Aware)

Even when scaffolding frontend dashboards, enforce production security defaults (full details & checklist in [05-auth-and-security.md](references/05-auth-and-security.md)):
- **Real Auth Only in Prod:** Wire **Auth.js/NextAuth + Prisma**, **Better Auth**, **Supabase Auth** (roles in `app_metadata` + RLS, never `user_metadata`), or **Custom JWT + Local DB** (`Argon2id`/`bcrypt >= 12`). Keep demo auth strictly behind `AUTH_MODE=demo`.
- **Tokens, Cookies & Passwords:** `HttpOnly`, `Secure`, `SameSite=Lax|Strict` cookies with explicit TTLs (access JWT `5–15m`, rotating refresh/session `7–30d`, reset/verify tokens `15–60m` hashed); enforce `min 8–12` (`12+` admin), `max 128` passwords with `type="password"` toggle and `autoComplete` tokens.
- **Server-Side Enforcement:** Guard layouts AND every `/api/*` route / Server Action (`getServerSession(authOptions)` + RBAC); fail-closed `useAuthority` on empty roles; sanitize HTML sinks with `DOMPurify`; use parameterized ORMs (no raw SQL); validate redirects with `resolvePostLoginRedirect()`; ship CSP/HSTS/`X-Frame-Options` headers and `.env.example` (never `NEXT_PUBLIC_`/`VITE_` on secrets).

## Progressive-Disclosure References

Load only the reference needed for the current task:
- [01-design-tokens.md](references/01-design-tokens.md)
- [02-navigation-and-layout.md](references/02-navigation-and-layout.md)
- [03-icons-and-typography.md](references/03-icons-and-typography.md)
- [04-data-display-and-charts.md](references/04-data-display-and-charts.md)
- [05-auth-and-security.md](references/05-auth-and-security.md)
- [06-forms-feedback-chrome.md](references/06-forms-feedback-chrome.md)
- [07-state-data-ai.md](references/07-state-data-ai.md)
- [08-a11y-i18n-motion.md](references/08-a11y-i18n-motion.md)
- [09-tech-stacks.md](references/09-tech-stacks.md)
- [10-navigation-examples-and-patterns.md](references/10-navigation-examples-and-patterns.md)

For the full end-to-end overview, see [GUIDE.md](GUIDE.md). For the full layout and script quick start, see [README.md](README.md).
