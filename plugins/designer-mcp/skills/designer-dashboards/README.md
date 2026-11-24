# Designer Dashboards

An opinionated skill suite inside the `designer-mcp` plugin for building production-grade dashboards—distilled from an exhaustive 17-template commercial dashboard audit and built on the `design-system` OpenDesign contract (`DESIGN.md` + `theme.json` + `DESIGN.evidence.json` + `_ds_manifest.json` + `_adherence.oxlintrc.json`).

## Subskills

| Subskill | Purpose |
|---|---|
| `designer-dashboards` | Root router: orient, pick the right subskill, and consult the distilled best-practice references. |
| `designer-dashboards:init` | Interactive stack wizard & project scaffolder: frontend (Next.js, React+Vite, Vue+Vite, Angular), package manager (`pnpm`/`bun`/`npm`/`yarn`), hosting (Vercel, Cloudflare, Docker/Nginx), backend & data mode. |
| `designer-dashboards:design` | OpenDesign / `design-system` workflow: pick a premade preset or capture a reference, generate `DESIGN.md`, `theme.json`, `DESIGN.evidence.json`, `styles.css` (with soft/tonal ladders + FOUC-free dark mode), `_ds_manifest.json`, and `_adherence.oxlintrc.json`. |
| `designer-dashboards:ui` | Dashboard UI primitives: 4px spacing & sizing, single-pipeline icons (Iconify/Lucide), ApexCharts (10 presets + `<LiveChart>`), TanStack server-mode DataGrid, KPI stat cards, 12 form primitives + wizards, Sonner/Radix feedback & chrome, restrained motion. |
| `designer-dashboards:login` | Auth & security: 7-page core auth suite (`login`, `register`, `forgot`, `reset`, `2FA/OTP`, `verify-email`, `401`) across reusable shells (`split/cover`, `basic`, `boxed`), single-source RBAC `authority` guards, NextAuth/Supabase/Better Auth wiring, and secret hygiene. |
| `designer-dashboards:pages` | Information architecture & pages: unified Nav IR (`nav-ir.schema.json`), derived breadcrumbs/titles, standard dashboard recipe, 4 app shells (list-detail, board, stream, full-canvas), industry verticals, print invoices, and AI assistant chrome. |
| `designer-dashboards:audit` | Quality gate: token parity & lint adherence, 18-point WCAG 2.1 AA check, RTL logical-property verification, dependency pruning, and secret scanning. |

## Skill Layout

```text
designer-dashboards/
├── SKILL.md                        # Root router + progressive-disclosure references
├── GUIDE.md                        # Complete dashboard engineering guide (17-template synthesis)
├── rules/AGENTS.md                 # Always-on guardrails
├── references/                     # 10 distilled best-practice reference docs
├── scripts/
│   ├── build-tokens.mjs            # Generate styles.css, _ds_manifest.json, _adherence.oxlintrc.json + WCAG contrast report
│   ├── scaffold-starter.mjs        # Stamp out a starter template with chosen stack, preset, fonts, icons & UI kit
│   ├── generate.mjs                # On-demand generator for vertical dashboards, 5-email set, auth-suite, and app shells
│   ├── lint-nav.mjs                # Navigation IR & modern web guidance linter
│   └── verify-dashboard.mjs        # Verify token parity, WCAG AA contrast, RTL, locale parity, a11y, deps, and secrets
├── templates/
│   ├── assets/                     # Bundled SIL OFL variable .woff2 fonts + ISC Lucide SVG sprite/pack catalogs
│   ├── components/
│   │   ├── react/                  # Full UI kit, AppShell, AuthShell, AuthSuite, AppShells, AI drawer, DataGrid, LiveChart
│   │   ├── vue/                    # Vue 3 + Pinia components, NavMenu, AppShell
│   │   ├── angular/                # Angular 22+ Signals components, NavMenu, AppShell
│   │   ├── agnostic/               # Framework-agnostic HTML/CSS shells
│   │   └── frameworks/             # 20 framework kits (Mantine, HeroUI v3, Chakra, MUI, AntD, PrimeReact, daisyUI, Base UI, coss ui, Ark UI, React Bits, Magic UI, Aceternity UI, 21st.dev, Motion Primitives, UnoCSS, Panda CSS, vanilla-extract, StyleX, Open Props)
│   ├── design-presets/             # 21 WCAG 2.1 AA verified OpenDesign presets (4 core + 17 ephemeral) + catalog.json
│   ├── emails/                     # 5 themed transactional HTML email templates
│   ├── starters/                   # 24 runnable starters (Next.js, React+Vite, Vue+Vite, Angular + 20 framework-specific React+Vite starters) + nav-ir.schema.json
│   ├── tech-stacks/                # 26 curated tech-stack profiles + catalog.json
│   └── verticals/                  # 16 industry dashboard widget-set recipes
├── init/                           # designer-dashboards:init
├── design/                         # designer-dashboards:design
├── ui/                             # designer-dashboards:ui
├── login/                          # designer-dashboards:login
├── pages/                          # designer-dashboards:pages
└── audit/                          # designer-dashboards:audit
```

## Quick Start (Scripts)

```bash
# 1. Scaffold a new dashboard starter
node scripts/scaffold-starter.mjs --starter nextjs-tailwind --name my-admin --out ./my-admin --pm pnpm --preset saas-violet

# 2. Build/regenerate design-system artifacts (styles.css, _ds_manifest.json, _adherence.oxlintrc.json)
node scripts/build-tokens.mjs ./my-admin/design-system

# 3. Verify adherence, token parity, WCAG AA contrast, and hygiene
node scripts/verify-dashboard.mjs ./my-admin
```

## Installing

`designer-dashboards` ships as part of the `designer-mcp` plugin (`plugins/designer-mcp/skills/designer-dashboards/`) and is included in the offline skill zip (`/skill`) and marketplace zip (`/skill/marketplace.zip`).
