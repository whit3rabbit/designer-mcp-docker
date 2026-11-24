---
name: init
description: >-
  Interactive dashboard project initializer (designer-dashboards:init). Walks the user through
  choosing frontend framework, package manager (pnpm/bun/npm/yarn), hosting target
  (Vercel/Cloudflare/Docker), backend & data mode, and design preset, then scaffolds a
  clean @core/@layouts/@menu starter project. Use when starting a new dashboard project,
  scaffolding from a starter, or initializing a dashboard workspace.
---

# `designer-dashboards:init` — Stack Wizard & Starter Scaffolder

Use this skill when starting a new dashboard project or initializing a dashboard workspace from a premade starter template.

## Step 1: Interactive Stack Discovery

If the user has not already specified these choices, use `ask_question` to gather them concisely in 1–2 rounds:

1. **Frontend Framework & Tech Stack Profile** (pre-generated profiles in [templates/tech-stacks/catalog.json](../templates/tech-stacks/catalog.json); see [09-tech-stacks.md](../references/09-tech-stacks.md) for the slot-level recommendation matrix):
   - `(Recommended) Next.js 16 Lean Default (nextjs-rabbit-default)` — Next.js App Router + React 19 + Tailwind v4 + ApexCharts + TanStack Table + React Hook Form + Zod + Zustand + Sonner.
   - `Next.js 16 Production SaaS / Enterprise (nextjs-shadcn-enterprise)` — Next.js 16 + Tailwind v4 + `shadcn/ui` on Base UI (`@base-ui/react`) + Recharts/Evil Charts + TanStack Form/Query/Table + Dice Table + Zustand + Nuqs + `kbar` + Clerk + Sentry + OxLint/Oxfmt + Husky + `tweakcn` support.
   - `Real-Time Ops, AI & Telemetry (realtime-ops-telemetry)` — Next.js 16 + ApexCharts (`<LiveChart>`) + TanStack Query + Zustand + Nuqs + `kbar` + Sentry + OxLint/Oxfmt.
   - `React 19 + Vite 8 Client SPA (react-vite-spa)` — fast client SPA with React Router + Zustand + TanStack Query + ApexCharts.
   - `Vue 3 + Vite + Pinia (vue-vite-pinia)` — Vue ecosystem with `vue-i18n`, Pinia, and ApexCharts.
   - `Angular Zoneless + Signals (angular-enterprise-signals)` — enterprise Angular pattern with zoneless change detection and Signals.
   - **Complete React UI Frameworks:** `react-vite-mantine` (Mantine, no Tailwind), `react-vite-heroui` (HeroUI v3), `react-vite-chakra` (Chakra UI v3), `react-vite-mui` (Material UI), `react-vite-antd` (Ant Design), `react-vite-primereact` (PrimeReact), `react-vite-daisyui` (daisyUI v5).
   - **Headless, Motion & AI Ecosystems:** `react-vite-baseui` (Base UI), `react-vite-cossui` (coss ui), `react-vite-arkui` (Ark UI), `react-vite-reactbits` (React Bits), `react-vite-magicui` (Magic UI), `react-vite-aceternity` (Aceternity UI), `react-vite-21stdev` (21st.dev registry), `react-vite-motion` (Motion Primitives).
   - **Modern CSS & Styling Engines:** `react-vite-unocss` (UnoCSS), `react-vite-pandacss` (Panda CSS + Base UI), `react-vite-vanilla-extract` (vanilla-extract + Ark UI), `react-vite-stylex` (StyleX), `react-vite-open-props` (Open Props).
   - *Custom Stack:* Pick a base framework above and swap individual capability slots (e.g., Clerk vs Auth.js, Recharts vs ApexCharts, TanStack Form vs React Hook Form, Nuqs, Sentry, OxLint/Oxfmt, Husky) while keeping one engine per concern.
2. **Package Manager:**
   - `(Recommended) pnpm` · `bun` · `npm` · `yarn`
3. **Hosting & Deployment Target:**
   - `(Recommended) Vercel` · `Cloudflare Pages/Workers` · `Docker + Nginx (self-hosted)` · `Static / Undecided`
4. **Backend & Data Layer:**
   - `(Recommended) Typed Mock Adapter + REST/Server Actions ready (swap-ready)`
   - `Supabase (Postgres + Auth + Realtime)`
   - `Prisma + Postgres/SQLite (Next.js Server Actions)`
   - `External API (OpenAPI / custom REST)`
5. **Starting Design Preset** (21 WCAG AA verified presets in [templates/design-presets/catalog.json](../templates/design-presets/catalog.json); can be refined next in `designer-dashboards:design`):
   - `(Recommended) saas-violet` / `amethyst` / `aurora` — Indigo-violet SaaS with stepped navy dark mode.
   - `obsidian` / `quartz` / `glacier` — Border-driven monochrome & cobalt engineering consoles.
   - `mirage` / `nimbus` / `executive-emerald` — Distinctive teal, botanical green, and emerald themes.
   - `aether` / `cirrus` / `drift` / `horizon` / `nebula` / `solstice` / `twilight` / `vesper` / `zenith` / `zephyr` — Additional ephemeral themes covering dense 13px ops, airy geometric, and vibrant violet/magenta styles.
   - `Custom via designer-dashboards:design` — Capture from a URL/reference or build from scratch.

## Step 2: Scaffold the Starter

Recommend default libraries based on the user's stated preferences and use case (consulting [09-tech-stacks.md](../references/09-tech-stacks.md)), then run the bundled scaffolder script from the `designer-dashboards` root:

```bash
node <designer-dashboards-root>/scripts/scaffold-starter.mjs \
  --starter <nextjs-tailwind|react-vite-tailwind|vue-vite-tailwind|angular-tailwind> \
  --stack <nextjs-rabbit-default|nextjs-shadcn-enterprise|realtime-ops-telemetry|react-vite-spa|vue-vite-pinia|angular-enterprise-signals> \
  --name <project-slug> \
  --out <target-directory> \
  --pm <pnpm|bun|npm|yarn> \
  --hosting <vercel|cloudflare|docker|static> \
  --preset <saas-violet|slate-minimal|teal-precision|executive-emerald|...> \
  --mode <demo|starter-kit> \
  --backend <mock|authjs-prisma|supabase|better-auth|clerk>
```

What the scaffolder emits:
- Clean `package.json` with **zero dead dependencies** (one icon lib, one chart lib, one table lib, one form stack, one toast lib, one state/query engine), seeded from the chosen `--stack` profile (or base `--starter`).
- `@core/` (tokens, theme engine, `httpClient`, `localeStore`, `routeKeyStore`, `useFormat` Intl helper), `@layouts/` (`AppShell` + `BlankShell`), `@menu/` (nav renderer).
- Production-shaped data layer: `src/fake-db/` + `src/app/api/*/route.ts` + `src/app/server/actions.ts` (Next.js server-first) or `QueryClientProvider` + `httpClient.ts` (`DATA_MODE=mock|live` for SPAs).
- `src/configs/navigation.config.ts` conforming to [nav-ir.schema.json](../templates/starters/nav-ir.schema.json).
- `design-system/` seeded from the chosen preset, compiled via `<designer-dashboards-root>/scripts/build-tokens.mjs` into `styles.css`, `_ds_manifest.json`, and `_adherence.oxlintrc.json`, plus `user-overrides.css` for safe project-level overrides.
- Working ESLint flat config (`typescript-eslint` + `jsx-a11y` / `eslint-plugin-vue`) and stack tooling configs when enabled by the profile (`.oxlintrc.json` extending `_adherence.oxlintrc.json`, `.husky/pre-commit`, `lint-staged`).
- `--mode starter-kit` (lean single-dashboard starter) or `--mode demo` (full showcase), and `--backend` wiring (`authjs-prisma`, `supabase`, `better-auth`, `clerk`, or `mock`).
- Inline FOUC-prevention theme script in the root HTML/layout.
- Hosting starter file (`vercel.json`, `Dockerfile` + `nginx.conf.example`, or `wrangler.toml`) when requested.
- `.env.example` with stack provider keys (e.g. Clerk/Sentry when selected; never `.env` with real secrets).
- Initial `locales/{en,es,fr,de,ar}.json` so i18n, ICU plurals, and Arabic RTL verification work from day one.

## Step 3: Post-Scaffold Verification & Next Step

1. Run `node <designer-dashboards-root>/scripts/verify-dashboard.mjs <target-directory>` to confirm the freshly scaffolded repo passes token parity, WCAG AA contrast, and hygiene checks.
2. Report the generated directory tree, chosen stack commands (`<pm> install`, `<pm> dev`), and suggest running `designer-dashboards:design` (to customize tokens/brand) or `designer-dashboards:pages` (to pick a vertical dashboard recipe).
