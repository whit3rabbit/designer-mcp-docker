---
name: dashboards-audit
description: "Dashboard quality, token adherence, WCAG 2.1 AA, RTL, dependency hygiene, and security auditor."
---

# `designer-dashboards:audit` — Adherence, Accessibility, RTL & Hygiene Gate

Use this skill before releasing a dashboard, after major UI changes, or when upgrading an existing template to Designer Dashboards standards.

Consult [08-a11y-i18n-motion.md](../references/08-a11y-i18n-motion.md) for the full 18-point WCAG 2.1 AA spec.

## Step 1: Run Automated Verification Script

Execute the bundled verifier against the target dashboard project:

```bash
node <designer-dashboards-root>/scripts/verify-dashboard.mjs <project-directory>
# Or run the standalone Nav IR & Modern Web Guidance linter directly:
node <designer-dashboards-root>/scripts/lint-nav.mjs <project-directory-or-file>
```

It automatically checks:
1. **Design-system parity:** `DESIGN.md`, `theme.json`, `DESIGN.evidence.json`, `styles.css`, `_ds_manifest.json`, and `_adherence.oxlintrc.json` all exist and stay in sync.
2. **WCAG AA contrast:** All foreground/background pairs in `theme.json` pass >= `4.5:1` (normal text) and >= `3:1` (large/UI) in both light and dark modes.
3. **Adherence & State/Data scan:** Flags raw hex literals (`#xxxxxx`) in component files outside `design-system/`, physical RTL-breaking utility classes (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `border-l-`, `border-r-`, `rounded-l-`, `rounded-r-`, `text-left`, `text-right`) and raw CSS physical properties (`margin-left`, `padding-right`, `left:`, `right:`, `text-align: left/right` across all `src/**/*.css`), pure `#000000` canvas/body usage, external Google Fonts CDN links (`fonts.googleapis.com`), `'use client'` on Next.js `app/**/page.tsx` wrappers, and >3 React Context providers in `src/context/`.
4. **Dependency, build & test hygiene:** Flags redundant multi-engine bloat (charts, toasts, icons, maps, tables, forms, state engines `redux`+`zustand`, DnD libs, or legacy `moment`/`jquery`/`date-fns`+`dayjs`), unused installed query libraries (`@tanstack/react-query`/`swr`), warns on direct `apexcharts`/`react-apexcharts`/`vue3-apexcharts` imports outside `<ChartWrapper>`/`<LiveChart>`, committed build outputs (`dist/`, `.next/`, `build/`), and verifies ESLint (`typescript-eslint` + `jsx-a11y`) + Playwright `axe-core` (`tests/a11y.spec.ts`) run cleanly.
5. **Secret, XSS & Auth hygiene:** Flags suspected hardcoded API keys/tokens in `src/`, `NEXT_PUBLIC_`/`VITE_` leaks on server secret names (including `NEXT_PUBLIC_GEMINI_API_KEY` / `VITE_AI_API_KEY` — AI keys must stay server-only behind `/api/ai/*`), committed `.env` or `*.db`/`*.sqlite` files, `eval()`/`new Function()` calls, unsanitized HTML sinks (`dangerouslySetInnerHTML`/`v-html`/`[innerHTML]`, e.g., raw `marked` output in AI chat bubbles without `DOMPurify` or `streamdown`), `target="_blank"` without `rel="noopener"`, verifies `.env.example`, and checks `webp`/`avif` image optimization and server-first layout boundaries.

## Step 2: Complete the 18-Point WCAG 2.1 AA Checklist

Review and fix any gaps across:
- **Shell:** Skip-to-content link, semantic `<header>/<nav>/<main>`, heading hierarchy (`h1` -> `h2`), `aria-current="page"`, focus management on route change (`<main tabIndex={-1}>`).
- **Keyboard:** Arrow-key/`Home`/`End` nav in sidebar & DataGrid (`role="grid"`, `aria-sort`), focus trap + `aria-modal` + ESC + trigger restore in modals/drawers, keyboard move controls on Kanban.
- **Forms & Controls:** Explicit `<label htmlFor>`, `aria-invalid` + `aria-describedby`, `autocomplete="one-time-code"` on OTP, `aria-label` on every icon-only button (`React`, `Vue`, `Angular`).
- **Charts & Live Regions:** `role="img"` + `aria-label` + accessible data-table toggle on every chart; `aria-live="polite"` on toasts, skeletons, and AI streaming.
- **Tokens & Preferences:** Global `:focus-visible` ring token (`--color-primary-focus-ring`), `@media (prefers-reduced-motion: reduce)`, `prefers-contrast` / `forced-colors` fallbacks, `eslint-plugin-jsx-a11y` (React) / `eslint-plugin-vuejs-accessibility` (Vue) / `@angular-eslint/template/*` (Angular) + `axe-core` in CI.

## Step 3: RTL & Localization Spot-Check

- Switch to Arabic (`ar`) and verify `<html lang="ar" dir="rtl">` (+ Radix `DirectionProvider`) updates automatically, `translateKey` values resolve from `locales/*.json` with zero untranslated UI strings, sidebar flips to inline-start, chart axes mirror cleanly, no clipped text, and numbers/dates format via `Intl.NumberFormat` / `Intl.DateTimeFormat` + `dayjs.locale(...)`.

## Step 4: Report Findings

Summarize pass/fail counts by category (Design Tokens, Contrast, WCAG AA, RTL, Dependencies, Security) with exact clickable file paths for every remaining issue.
