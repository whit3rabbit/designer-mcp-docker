# Reference 09: Tech Stack Profiles & Library Recommendations

Designer Dashboards supports both **pre-generated tech stack profiles** (in [templates/tech-stacks/](../templates/tech-stacks/catalog.json)) and **slot-level library customization** during `designer-dashboards:init`, while strictly preserving Designer Dashboards' **Single-Engine Laws** (one chart engine, one table engine, one form engine, one toast engine, one icon pipeline).

---

## 1. Pre-Generated Tech Stack Profiles (`templates/tech-stacks/`)

Rather than forcing every project into one rigid dependency list, `templates/tech-stacks/catalog.json` indexes curated, version-pinned profiles organized by use case:

| Stack ID | Framework | Use Case | Key Libraries |
|---|---|---|---|
| `nextjs-rabbit-default` | Next.js 16 | General SaaS (Lean Default) | Tailwind v4, ApexCharts, TanStack Table, React Hook Form + Zod, Zustand, Sonner, Lucide, ESLint + jsx-a11y |
| `nextjs-shadcn-enterprise` | Next.js 16 | Production Multi-Tenant SaaS | Tailwind v4, shadcn/ui on `@base-ui/react`, Recharts + Evil Charts, TanStack Table + Dice Table, TanStack Form + Zod, TanStack React Query, Zustand, Nuqs, `kbar`, Clerk, Sentry, OxLint + Oxfmt, Husky, tweakcn |
| `react-vite-spa` | React 19 + Vite 8 | Client SPA / Internal Tool | React Router, TanStack Query, Zustand, ApexCharts, TanStack Table, React Hook Form + Zod, Sonner |
| `realtime-ops-telemetry` | Next.js 16 | Real-Time Ops / AI / Telemetry | ApexCharts (`<LiveChart>`), TanStack Query, Zustand, Nuqs, `kbar`, Sentry, OxLint + Oxfmt, Husky |
| `vue-vite-pinia` | Vue 3 + Vite | Vue Ecosystem | Pinia, Vue-i18n, ApexCharts (`vue3-apexcharts`), TanStack Vue Table, VeeValidate + Zod, Vue Sonner |
| `angular-enterprise-signals` | Angular | Enterprise Angular | Zoneless Signals, Tailwind v4, ApexCharts, Angular Reactive Forms, Lucide Angular |
| `react-vite-mantine` | React 19 + Vite 8 | Dashboards, SaaS, Tools (No Tailwind) | Mantine v8 (`@mantine/core`, `hooks`, `notifications`, `dates`), CSS Modules, ApexCharts, TanStack Table |
| `react-vite-heroui` | React 19 + Vite 8 | Modern Polished SaaS | HeroUI v3 (`@heroui/react`), React Aria, Tailwind v4, ApexCharts, TanStack Table |
| `react-vite-chakra` | React 19 + Vite 8 | Customizable Design System (No Tailwind) | Chakra UI v3, Ark UI, Emotion, ApexCharts, TanStack Table |
| `react-vite-mui` | React 19 + Vite 8 | Enterprise & Complex Apps (No Tailwind) | Material UI v7 (`cssVariables: true`), Emotion, ApexCharts, TanStack Table |
| `react-vite-antd` | React 19 + Vite 8 | Data-Heavy Admin Apps (No Tailwind) | Ant Design (`ConfigProvider` + `cssVar`), ApexCharts, TanStack Table |
| `react-vite-primereact` | React 19 + Vite 8 | Tables & Enterprise Widgets | PrimeReact, PrimeIcons, ApexCharts |
| `react-vite-daisyui` | React 19 + Vite 8 | Quick Themed Interfaces | daisyUI v5 (`@plugin "daisyui/theme"`), Tailwind v4, ApexCharts, TanStack Table |
| `react-vite-baseui` | React 19 + Vite 8 | Headless Design System (No Tailwind) | `@base-ui/react` primitives + OpenDesign CSS variables, ApexCharts, TanStack Table |
| `react-vite-cossui` | React 19 + Vite 8 | Minimal Product SaaS | coss ui (`@base-ui/react` + Tailwind v4 + `cva`), ApexCharts, TanStack Table |
| `react-vite-arkui` | React 19 + Vite 8 | State-Machine Headless UI (No Tailwind) | `@ark-ui/react` + OpenDesign CSS variables, ApexCharts, TanStack Table |
| `react-vite-reactbits` | React 19 + Vite 8 | Animated UI, Shaders & Backgrounds | React Bits (`motion/react` + Aurora/Spotlight/ClickSpark), Tailwind v4, ApexCharts |
| `react-vite-magicui` | React 19 + Vite 8 | Animated Bento Dashboards | Magic UI (`BentoGrid`, `BorderBeam`, `NumberTicker`, `DotPattern`), Tailwind v4, `motion/react` |
| `react-vite-aceternity` | React 19 + Vite 8 | Creative 3D & Spotlight UI | Aceternity UI (`Card3D`, `Spotlight`, `MovingBorder`, `BackgroundBeams`, `FloatingDock`), Tailwind v4, `motion/react` |
| `react-vite-21stdev` | React 19 + Vite 8 | AI-Assisted Prototyping | 21st.dev `components.json` registry + `@base-ui/react`, Tailwind v4, ApexCharts |
| `react-vite-motion` | React 19 + Vite 8 | Tactile Motion Primitives | `motion/react` (`MotionConfig reducedMotion="user"`, `TextEffect`, `AnimatedNumber`, `MorphingDialog`), Tailwind v4 |
| `react-vite-unocss` | React 19 + Vite 8 | Atomic Utility CSS | UnoCSS (`@unocss/preset-wind4`), `uno.config.ts` OpenDesign bridge, ApexCharts |
| `react-vite-pandacss` | React 19 + Vite 8 | Type-Safe Zero-Runtime CSS | Panda CSS (`@pandacss/dev`) + `@base-ui/react`, `panda.config.ts` OpenDesign `semanticTokens` |
| `react-vite-vanilla-extract` | React 19 + Vite 8 | Zero-Runtime TS CSS | `@vanilla-extract/css` + `@vanilla-extract/recipes` + `@ark-ui/react`, ApexCharts |
| `react-vite-stylex` | React 19 + Vite 8 | Compile-Time Atomic CSS | `@stylexjs/stylex` + `@stylexjs/unplugin`, `defineVars` OpenDesign bridge |
| `react-vite-open-props` | React 19 + Vite 8 | Lightweight CSS Tokens | `open-props` + `postcss-jit-props` + OpenDesign color tokens |

Pass `--stack <id>` to `scripts/scaffold-starter.mjs` to stamp out any profile directly:

```bash
node scripts/scaffold-starter.mjs \
  --stack nextjs-shadcn-enterprise \
  --name my-saas-admin \
  --out ./my-saas-admin \
  --pm pnpm \
  --hosting vercel \
  --preset saas-violet
```

---

## 2. Default Library Recommendation Matrix (During `designer-dashboards:init`)

When the user does not specify every library upfront, recommend defaults based on their **framework + use case + preferences**:

| Capability Slot | Lean Default | Enterprise / Modern Alt | Recommend When |
|---|---|---|---|
| **UI Primitives** | Native `<dialog>`/Popover or `radix-ui` | `shadcn/ui` on `@base-ui/react` | User wants copy-in shadcn components on Base UI primitives |
| **Charts** *(1 engine)* | `apexcharts` | `recharts` (+ Evil Charts) | User wants composable React SVG charts (`ShadcnChart.tsx`) or Evil Charts |
| **Tables** *(1 engine)* | `@tanstack/react-table` | `@tanstack/react-table` + Dice Table | User wants DiceUI Data Table styling over TanStack Table |
| **Forms** *(1 engine)* | `react-hook-form` + `zod` | `@tanstack/react-form` + `zod` | User already uses TanStack Query/Table and wants signal-reactive forms |
| **Data Fetching** | Next.js RSC + Server Actions | `@tanstack/react-query` | Client SPA, polling, optimistic mutations, or infinite/cursor feeds |
| **Client UI State** | `zustand` | `zustand` (React) / `pinia` (Vue) / Signals (Angular) | Always use scoped micro-stores; never monolithic global stores |
| **URL Search State** | Framework `searchParams` | `nuqs` | User wants shareable/bookmarkable table filters, tabs, and pagination |
| **Command+K** | Built-in `CommandPalette` (`cmdk`) | `kbar` | User wants nested action trees, dynamic registration, and rich shortcut bindings |
| **Auth** | `AUTH_MODE=demo` / Auth.js / Better Auth | `@clerk/nextjs` / Supabase | User wants zero-ops managed auth, orgs, MFA, and prebuilt portals |
| **Error Tracking** | None (dev/prototype) | `@sentry/nextjs` | Production deployment needing source-mapped errors and session replay |
| **Lint & Format** | ESLint + `jsx-a11y` | `oxlint` + `oxfmt` | User wants Rust-speed linting/formatting alongside `_adherence.oxlintrc.json` |
| **Pre-commit Hooks** | None | `husky` + `lint-staged` | Team repo enforcing `lint` + `tokens:check` before every commit |
| **Themes** | 21 OpenDesign presets | `tweakcn` -> `design-system/theme.json` | User brings a `tweakcn` theme; map its OKLCH vars into `design-system/` |
| **AI & Streaming** | `AIProvider` (`fetch` SSE + mock stream) | `ai` + `@ai-sdk/react` (`useChat`) + `@ai-sdk/google` | Dashboard ships `/apps/ai-chat`, assistant drawer, copywriter, or DataGrid NLQ |
| **Streaming Markdown** | `marked` + `DOMPurify` | `streamdown` (`@streamdown/code`, `@streamdown/mermaid`) | Real-time token streaming where unterminated fences/links would flicker |
| **Agentic UI** *(optional)* | Custom `Drawer` + `aiStore` | `@assistant-ui/react` or `shadcn/ui` AI Elements | Multi-step tool calls, reasoning accordions, or human-in-the-loop approvals |

---

## 3. Integrating `nextjs-shadcn-enterprise` with Designer Dashboards Laws

Stacks like `Kiranism/next-shadcn-dashboard-starter` align cleanly with Designer Dashboards when mapped to the right layers:

1. **Single-Engine Compliance:**
   - **Evil Charts** wraps **Recharts** (`recharts` is the single chart engine — do not also install `apexcharts`). Bind `--chart-1..10` and `--chart-tooltip-*` via [ShadcnChart.tsx](../templates/components/react/ui/ShadcnChart.tsx).
   - **Dice Table** wraps **TanStack Table** (`@tanstack/react-table` is the single table engine). Preserve the `DataGridFetchParams` / `DataGridResponse` server contract.
   - **TanStack Form + Zod** is the single form engine — do not also install `react-hook-form`.
2. **State & URL Discipline:**
   - **Zustand** owns client-only UI micro-stores (`themeStore`, `sidebarStore`, `aiStore`).
   - **TanStack React Query** owns server-cache/mutations.
   - **Nuqs** owns URL-synced filter/sort/pagination state (`NuqsAdapter` in root layout) — keep URL state out of Zustand.
3. **Theming (`tweakcn` -> OpenDesign):**
   - Import `tweakcn` OKLCH variables into `design-system/theme.json` and run `tokens:build` so `styles.css`, `_ds_manifest.json`, and `_adherence.oxlintrc.json` remain the single source of truth with WCAG AA contrast verification.
4. **Auth & Observability:**
   - **Clerk** (`@clerk/nextjs`) protects `(private)` routes via `clerkMiddleware()` and verifies sessions server-side (`auth()`) in every Server Action and `/api/*` route. Keep `CLERK_SECRET_KEY` server-only.
   - **Sentry** (`@sentry/nextjs`) captures client/server/edge exceptions; keep `SENTRY_AUTH_TOKEN` out of `NEXT_PUBLIC_*` and `.env` out of git.
5. **Tooling (`OxLint` + `Oxfmt` + `Husky`):**
   - Extend `design-system/_adherence.oxlintrc.json` from `.oxlintrc.json` so OpenDesign token rules run at Rust speed in both `oxlint` and Husky's `pre-commit` hook alongside `tokens:check`.
