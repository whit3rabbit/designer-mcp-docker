---
name: design
description: >-
  OpenDesign and /design-system workflow for dashboards (designer-dashboards:design). Guides
  the user through selecting a premade preset or capturing a visual reference, generating
  DESIGN.md, theme.json, DESIGN.evidence.json, styles.css (with soft/tonal ladders and
  FOUC-free dark mode), _ds_manifest.json, and _adherence.oxlintrc.json, then verifying
  WCAG AA contrast and token parity. Use when creating or customizing DESIGN.md,
  theme.json, styles.css, design presets, or dark-mode tokens for a dashboard.
---

# `designer-dashboards:design` — OpenDesign Dashboard System Builder

Built directly on the `/design-system` methodology (OpenDesign `DESIGN.md` + machine-readable JSON + lint adherence), tailored specifically for dense admin dashboards.

Before modifying tokens, read [01-design-tokens.md](../references/01-design-tokens.md) if you need the full token rules.

## Non-Negotiables

- **Grounded visual direction:** Start from either a premade preset in `templates/design-presets/`, a user-provided reference (URL/screenshot/brand hexes), or `/design-system` catalog research (`design_search` / `design_get` when MCP is available). Never invent generic colors from vibe memory.
- **Preserve token roles:** CTA/primary stays primary; semantic status colors (`success`, `warning`, `error`, `info`) stay semantic; soft tints stay surface/container fills with high-contrast text.
- **No pure black:** Never use `#000000` for light-mode body text or dark-mode canvas backgrounds.
- **WCAG AA contrast enforced:** Every text-on-surface pair must pass >= `4.5:1` (normal text) and >= `3:1` (large/UI).

## Step 1: Choose Source Direction

Ask the user (via `ask_question` if not already stated):
1. **Start from a premade dashboard preset** (21 WCAG 2.1 AA verified presets in [templates/design-presets/catalog.json](../templates/design-presets/catalog.json)):
   - **Core starters:** `saas-violet`, `slate-minimal`, `teal-precision`, `executive-emerald`
   - **Ephemeral collection (17 distinct themes):** `aether`, `amethyst`, `aurora`, `cirrus`, `drift`, `glacier`, `horizon`, `mirage`, `nebula`, `nimbus`, `obsidian`, `quartz`, `solstice`, `twilight`, `vesper`, `zenith`, `zephyr`
2. **Adapt from brand colors / reference URL / `/design-system` gallery (`designer:opendesign:*`) / existing `DESIGN.md`:**
   - Collect brand primary hex, preferred font family (from the dashboard shortlist: `Inter`, `Public Sans`, `Plus Jakarta Sans`, `Geist`, `DM Sans`), density (`compact 13px` vs `comfortable 14px`), card style (`elevated | bordered | borderless | flat | glass`), sidebar skin (`light | dark | brand | gradient | transparent`), navbar mode (`floating | detached | blur`), layout mode (`vertical | collapsed | horizontal | two-column | frameless | content-overlay | compact-topbar | sidebarless`), and radius base (`4px | 5px | 6px | 7px | 8px | 12px | 16px`).
   - If the user provides a reference URL or `/design-system` gallery reference (`designer:opendesign:*`), call `design_get` (and `design_claude_package` when available), preserve its token roles and section hierarchy, and record provenance (`tokenOrigins` + explicit `gaps`) in `DESIGN.evidence.json`.
   - When integrating MUI v7 (`enableCssLayer: true`), Vuetify 3, Angular Material 22, Bootstrap 5.3+, or `@ui-sdk/react` / `@ui-sdk/web` alongside Tailwind v4.1+, wrap vendor CSS inside `@layer vendor` / `@layer mui` (`@layer theme, base, vendor, mui, components, utilities;`) so `@layer utilities` wins cleanly.
   - `build-tokens.mjs` also emits `2xl` (`1400px`) / `3xl` (`1650px`) density-scaling breakpoints, `.rd-container` (`container-type: inline-size`) + boxed/narrow widths, `.rd-content-fixed` (`100dvh - 64px`) for fixed-viewport app shells, and light-reset `@media print` rules.

## Step 2: Author the OpenDesign Package (`design-system/`)

Create or update these source files in `<project>/design-system/`:
1. **`DESIGN.md`** — YAML frontmatter (`version: alpha`, `name`, `colors`, `typography`, `spacing`, `rounded`) + concise visual thesis, role rules, and do/don't rules.
2. **`theme.json`** — Machine-readable nested schema (`colors.semantic`, `colors.light`, `colors.dark`, `colors.chart`, `typography`, `layout`, `radius`, `zIndex`) driving the OKLCH/RGB 50–950 tonal scale, colored glows, modal `shadow: none`, runtime preset switching, and FOUC-free pre-paint script.
3. **`DESIGN.evidence.json`** — Provenance (`preset` / `reference` / `override` / `observation`), `tokenOrigins`, and explicit `gaps`.

## Step 3: Build Generated Artifacts & Lint Contract

Run the token compiler:

```bash
node <designer-dashboards-root>/scripts/build-tokens.mjs <project>/design-system
```

This generates deterministically:
- **`styles.css`** — Complete `:root` + `[data-theme="dark"]` / `.dark` CSS custom properties, programmatic 6-subtoken soft/tonal ladders (`main`, `surface`, `border`, `hover`, `pressed`, `focus`) for every semantic color, `--color-surface-subtle`, `--color-scrim`, `--shadow-modal: none`, data-display tokens (`--chart-1..10`, `--chart-1-rgb..10-rgb`, `--chart-seq-1..5`, `--chart-grid`, `--chart-tooltip-bg`, `@layer vendor` ApexCharts tooltip/legend/RTL skinning), attribute contracts for `[data-card-style]`, `[data-sidebar-skin]`, `[data-navbar-style]`, `[data-layout-position]`, and `[data-layout]`, Tailwind v4 `@theme` bridge, `:focus-visible` ring token, and `@media (prefers-reduced-motion: reduce)` reset.
- **`_ds_manifest.json`** — Registry of every CSS variable, token count, and automated WCAG AA contrast audit table.
- **`_adherence.oxlintrc.json`** — Lint contract blocking raw hex values, raw pixel spacing/radii outside tokens, and unapproved fonts.
- **`user-overrides.css`** *(scaffolded once, never overwritten)* — Safe project-level override boundary imported after `styles.css` so custom overrides never trip `tokens:check`.

## Step 4: Verify Parity & Contrast

Run:
```bash
node <designer-dashboards-root>/scripts/build-tokens.mjs <project>/design-system --check
```

If any text/surface contrast pair fails WCAG AA (`< 4.5:1`), retune lightness in `theme.json` and `DESIGN.md` and re-run until all checks pass. Never ship a failing contrast report.
