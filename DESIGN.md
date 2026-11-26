---
version: alpha
name: Designer-MCP Gallery & Static Frontend
---

# Designer-MCP Frontend Design System

> A fast, zero-dependency, offline-first design catalog and component workbench built on a crisp **shadcn/ui Zinc** neutral foundation, adaptive light/dark polarity, instant client-side search (`⌘K`), and multi-facet filtering.

## Overview

- **Theme & Stack:** Dark-first adaptive (`light-dark(...)`) gallery shell in vanilla HTML/CSS/JS paired with **shadcn/ui Neutral** (`Tailwind v4`, `React 19`) for sandboxed component previews.
- **Hosting & Offline Contract:** Builds statically (`npm run build:static`) for GitHub Pages subpath hosting (`/<repo>/`) and runs air-gapped on `:8787` (`docker run --network none`). Every font, icon, script, stylesheet, and thumbnail resolves locally with zero external network requests.
- **Speed as a visual feature:** Content-hashed shared shell CSS/JS (`/shell/*`) and lazy-loaded JSON indices (`/api/designs-index.json`, `/api/components-hub.json`).

## Colors

### Dark Mode (Primary)

| Token | Value | Role | Contrast / Notes |
|---|---|---|---|
| `--bg` | `#09090b` | Page canvas (Zinc 950) | Base ground |
| `--panel` | `#111113` | Card, toolbar, and dialog surface | Subtle elevation over `--bg` |
| `--panel2` | `#18181b` | Input, pill, and secondary surface (Zinc 900) | Interactive controls |
| `--line` | `#27272a` | 1px hairline border & divider (Zinc 800) | Primary structural boundary |
| `--line-strong` | `#3f3f46` | Hover/active border (Zinc 700) | Interactive emphasis |
| `--strong` | `#fafafa` | Headings and high-emphasis text (Zinc 50) | ~19.4:1 on `--bg` |
| `--fg` | `#e4e4e7` | Primary body copy (Zinc 200) | ~15.8:1 on `--bg` |
| `--text` | `#d4d4d8` | Secondary body copy (Zinc 300) | ~13.3:1 on `--bg` |
| `--muted` | `#a1a1aa` | Metadata, labels, placeholders (Zinc 400) | ~7.5:1 on `--bg` |
| `--accent` | `#60a5fa` | Links, active focus rings, selected states | ~7.9:1 on `--bg` |
| `--accent-bg` | `#172554` | Active chip / selected pill background | Pairs with `--accent` |
| `--accent-line` | `#1d4ed8` | Active chip / selected pill border | Pairs with `--accent-bg` |
| `--ok-fg` | `#4ade80` | Success / verified status | ~11.1:1 on `--bg` |
| `--code-bg` | `#050507` | Code block ground | Deepest neutral |
| `--code-fg` | `#e4e4e7` | Code block foreground | ~16.2:1 on `--code-bg` |

### Light Mode

| Token | Value | Role | Contrast / Notes |
|---|---|---|---|
| `--bg` | `#fafafa` | Page canvas (Zinc 50) | Soft neutral ground |
| `--panel` | `#ffffff` | Card, toolbar, and dialog surface | Crisp elevated card |
| `--panel2` | `#f4f4f5` | Input, pill, and secondary surface (Zinc 100) | Subtle inset control |
| `--line` | `#e4e4e7` | 1px hairline border & divider (Zinc 200) | Primary structural boundary |
| `--line-strong` | `#d4d4d8` | Hover/active border (Zinc 300) | Interactive emphasis |
| `--strong` | `#09090b` | Headings and high-emphasis text (Zinc 950) | ~19.4:1 on `--bg` |
| `--fg` | `#18181b` | Primary body copy (Zinc 900) | ~16.9:1 on `--bg` |
| `--text` | `#27272a` | Secondary body copy (Zinc 800) | ~14.1:1 on `--bg` |
| `--muted` | `#52525b` | Metadata, labels, placeholders (Zinc 600) | ~7.4:1 on `--bg` |
| `--accent` | `#2563eb` | Links, active focus rings, selected states | ~4.9:1 on `--bg` |
| `--accent-bg` | `#eff6ff` | Active chip / selected pill background | Pairs with `--accent` |
| `--accent-line` | `#93c5fd` | Active chip / selected pill border | Pairs with `--accent-bg` |
| `--ok-fg` | `#15803d` | Success / verified status | ~4.8:1 on `--bg` |
| `--code-bg` | `#f4f4f5` | Code block ground | Zinc 100 |
| `--code-fg` | `#18181b` | Code block foreground | ~15.8:1 on `--code-bg` |

### Component Preview Sandbox (`frontend/vendor/theme.json`)

Sandboxed component demos (`frontend/starter.tsx`, `frontend/shadcn-gallery.tsx`) use the matching **shadcn Neutral** HSL variables (`--background: 0 0% 3.9%` dark / `0 0% 100%` light, `--border: 0 0% 14.9%` / `0 0% 89.8%`, `--radius: 0.625rem`).

## Typography

- **Primary Sans (`--font`):** `"Inter", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (served locally via `@fontsource-variable/inter` in `frontend/package.json` and system UI fallback).
- **Monospace (`--mono`):** `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` for hex codes, keyboard shortcuts (`⌘K`), `designer:*` URIs, and code snippets.
- **Scale & Scaling:**
  - Page title (`h1` / Display): `clamp(24px, 3vw, 32px)`, weight `700`, tracking `-0.03em`, line-height `1.15`.
  - Section heading (`h2` / Headline): `18px`–`20px`, weight `600`, tracking `-0.02em`.
  - Body / Lead: `14px` / `1.55` (toolbar inputs `13.5px`).
  - Controls & Pills (`Caption`): `12px`–`12.5px`, weight `500`–`600`.
  - Micro badges / Kbd: `10.5px`–`11px` (never below `10px`).
  - **Text Scaling:** `-webkit-text-size-adjust: 100%` with fluid `clamp()` and flex/grid wrapping so text enlarges cleanly up to 200% browser zoom without clipping.

## Layout

- **Container Widths:** `max-width: 1520px`–`1540px` with `clamp(14px, 3vw, 32px)` horizontal gutters, `12px` card border-radius (`8px` for inputs/buttons, `999px` for filter pills), and responsive breakpoints down to mobile viewports.
- **Hit Targets & Safe Areas:** Primary navigation tabs, search inputs, and action buttons maintain >= `28px` desktop / `44px` touch target sizing with `env(safe-area-inset-*)` compatibility on sticky headers.
- **5-Pillar Top Bar:** Sticky frosted header (`--nav-bg` + `backdrop-filter`) with `Design Systems`, `Components`, `Starters`, `Effects & Presets`, `Assets & Docs`, `⌘K` Quick Search trigger, MCP Picks Tray (`⚡ MCP`), Light/Dark toggle, and `Skill` download.

## Components

- **Search & Multi-Facet Filtering:**
  - Global `⌘K` / `/` command palette (`#cmd-palette`) querying prebuilt offline JSON indices across all design systems, components, comparator primitives, and pages.
  - Inline filter toolbars (`.ds-toolbar`, `.hub-panel`) with instant client-side filtering by theme polarity, hue swatch, custom hex distance, ground tone, library, and stack, synced to URL query parameters.
- **Subnavigation (`subnav()`):** Horizontal pill strip beneath the top bar for library-specific routes (`/reui`, `/heroui`, `/mantine`, `/daisyui`, `/baseui`, `/uikits`, `/tailwind`).
- **Cards & Previews:** 1px bordered `--panel` cards with aspect-locked thumbnails (`/thumb/:id`) and sandboxed `<iframe>` live previews (`preview.css`).
- **Interaction States:**
  - **Default:** `--panel2` surface with `--line` 1px border and `--fg` label.
  - **Hover / Pressed:** Border steps to `--line-strong` (or `--accent-line` on active pills); subtle `translateY(1px)` press feedback on primary buttons.
  - **Focus-visible:** `2px solid var(--accent)` with `2px` offset.
  - **Selected:** `--accent-bg` fill, `--accent-line` border, and `aria-pressed="true"` / `aria-selected="true"`.
  - **Disabled:** Reduced opacity (`0.5`), `pointer-events: none`, non-interactive cursor.
  - **Loading / Error:** Skeleton shimmer (`--skel-a` / `--skel-b`) during lazy JSON fetch; `role="alert"` inline fallback with source-view guidance on preview failure.

## Accessibility & Motion

- **Focus Rings:** Every interactive control uses `2px solid var(--accent)` with `2px` offset on `:focus-visible`; preview frames include a zero-specificity `:where(...):focus-visible` fallback.
- **Reduced Motion:** Both gallery (`scripts/lib/ui.mjs`) and preview frames (`frontend/preview.css`, `frontend/build.mjs`) wrap animations/transitions in `@media (prefers-reduced-motion: reduce)` (`0.01ms !important`) and `<MotionConfig reducedMotion="user">`.
- **Screen Readers:** Decorative icons carry `aria-hidden="true"`; error boundaries render `role="alert"` with actionable copy; skip link (`Skip to main content`) precedes `<header>`.

## Do & Don't

- **Do:** Use CSS custom properties (`--bg`, `--panel`, `--line`, `--fg`, `--muted`, `--accent`) so every component adapts seamlessly between dark and light modes.
- **Do:** Keep all static build paths relative (`build-static.mjs`) so GitHub Pages subpath deployments (`/<repo>/`) resolve with zero 404s.
- **Don't:** Hardcode dark-only hex colors, external CDN URLs, Google Fonts links, or inline network fetches in gallery HTML or preview iframes.
- **Don't:** Add decorative gradients, gratuitous card hover animations, or unrequested framework dependencies to the gallery shell.
