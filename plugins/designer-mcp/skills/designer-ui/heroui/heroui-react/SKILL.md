---
name: heroui-react
description: "HeroUI v3 React component library (Tailwind CSS v4 + React Aria) components, docs, and oklch themes."
metadata:
  author: heroui
  version: "3.0.1"
---

# HeroUI v3 React Development Guide

HeroUI v3 is a component library built on **Tailwind CSS v4** and **React Aria Components**, providing accessible, customizable UI components for React applications.

Adapted from HeroUI's official agent skills (Apache-2.0) for fully offline use inside the designer-mcp plugin: docs, source, styles, and theme variables are read from disk, never fetched.

---

## CRITICAL: v3 Only - Ignore v2 Knowledge

**This guide is for HeroUI v3 ONLY.** Do NOT apply v2 patterns: the provider, styling, and component API all changed:

| Feature       | v2 (DO NOT USE)                   | v3 (USE THIS)                               |
| ------------- | --------------------------------- | ------------------------------------------- |
| Provider      | `<HeroUIProvider>` required       | **No Provider needed**                      |
| Animations    | `framer-motion` package           | CSS-based, no extra deps                    |
| Component API | Flat props: `<Card title="x">`    | Compound: `<Card><Card.Header>`             |
| Styling       | Tailwind v3 + `@heroui/theme`     | Tailwind v4 + `@heroui/styles`         	  |
| Packages      | `@heroui/system`, `@heroui/theme` | `@heroui/react`, `@heroui/styles` 		  |

```tsx
// DO NOT DO THIS - v2 pattern
import { HeroUIProvider } from "@heroui/react";
import { motion } from "framer-motion";

<HeroUIProvider>
	<Card title="Product" description="A great product" />
</HeroUIProvider>;
```

### CORRECT (v3 patterns)

```tsx
// DO THIS - v3 pattern (no provider, compound components)
import { Card } from "@heroui/react";

<Card>
	<Card.Header>
		<Card.Title>Product</Card.Title>
		<Card.Description>A great product</Card.Description>
	</Card.Header>
</Card>;
```

**Always read v3 docs before implementing.**

---

## Core Principles

- Semantic variants (`primary`, `secondary`, `tertiary`) over visual descriptions
- Composition over configuration (compound components)
- CSS variable-based theming with `oklch` color space
- BEM naming convention for predictable styling

---

## Accessing Documentation & Component Information

**For component details, examples, props, and implementation patterns, always read the offline docs:**

### Offline Sources

Everything this skill needs is on disk, in priority order:

1. **MCP tools** (best): with the designer-mcp MCP server registered, the `design_kit_*` tools (`kit: "heroui"`) serve the same catalog programmatically: `design_kit_list`, `design_kit_search`, `design_kit_docs` (`kind`: `component` | `guide` | `migration`), and `design_kit_code` (`kind`: `source` | `styles` | `theme`).
2. **Installed package**: a project that depends on `@heroui/react` carries version-matched docs in `node_modules/@heroui/react/docs/` (`llms.txt` index, `components/<name>.md`, `guides/<name>.md`).
3. **Baked layer**: `<cache>/heroui/docs` (`<cache>` is `$DESIGN_CACHE_DIR`, `/cache` in the image, or `~/.design-cache`), plus component source (`heroui/source`), per-component CSS (`heroui/styles`), and theme CSS (`heroui/theme`). Override with `HEROUI_DOCS_DIR`. Bake it with `npm run heroui && npm run bake` in a designer-mcp checkout.

### Using Scripts

The scripts follow the same resolution order and print an offline note instead of ever reaching the network:

```bash
# List all components and guides
node scripts/list_components.mjs

# Get component documentation (markdown)
node scripts/get_component_docs.mjs Button
node scripts/get_component_docs.mjs Button Card TextField

# Get component source code (baked layer only)
node scripts/get_source.mjs Button

# Get component CSS styles (BEM classes)
node scripts/get_styles.mjs Button

# Get theme variables (oklch)
node scripts/get_theme.mjs

# Get non-component docs (guides)
node scripts/get_docs.mjs theming
node scripts/get_docs.mjs theming-for-agents
```

**Important:** Always read component docs before implementing. They include complete examples, props, anatomy, and API references.

---

## Installation Essentials

### Quick Install

```bash
npm i @heroui/styles @heroui/react tailwind-variants
```

### Framework Setup (Next.js App Router - Recommended)

1. **Install dependencies:**

```bash
npm i @heroui/styles @heroui/react tailwind-variants tailwindcss @tailwindcss/postcss postcss
```

2. **Create/update `app/globals.css`:**

```css
/* Tailwind CSS v4 - Must be first */
@import "tailwindcss";

/* HeroUI v3 styles - Must be after Tailwind */
@import "@heroui/styles";
```

3. **Import in `app/layout.tsx`:**

```tsx
import "./globals.css";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				{/* No Provider needed in HeroUI v3! */}
				{children}
			</body>
		</html>
	);
}
```

4. **Configure PostCSS (`postcss.config.mjs`):**

```js
export default {
	plugins: {
		"@tailwindcss/postcss": {},
	},
};
```

### Critical Setup Requirements

1. **Tailwind CSS v4 is MANDATORY** - HeroUI v3 will NOT work with Tailwind CSS v3
2. **Use Compound Components** - Components use compound structure (e.g., `Card.Header`, `Card.Content`)
3. **Use onPress, not onClick** - For better accessibility, use `onPress` event handlers
4. **Import Order Matters** - Always import Tailwind CSS before HeroUI styles

---

## Component Patterns

All components use the **compound pattern** shown above (dot-notation subcomponents like `Card.Header`, `Card.Content`). Don't flatten to props, always compose with subcomponents. Read component docs for complete anatomy and examples.

---

## Semantic Variants

HeroUI uses semantic naming to communicate functional intent:

| Variant     | Purpose                           | Usage          |
| ----------- | --------------------------------- | -------------- |
| `primary`   | Main action to move forward       | 1 per context  |
| `secondary` | Alternative actions               | Multiple       |
| `tertiary`  | Dismissive actions (cancel, skip) | Sparingly      |
| `danger`    | Destructive actions               | When needed    |
| `ghost`     | Low-emphasis actions              | Minimal weight |
| `outline`   | Secondary actions                 | Bordered style |

**Don't use raw colors** - semantic variants adapt to themes and accessibility.

---

## Theming

HeroUI v3 uses CSS variables with `oklch` color space:

```css
:root {
	--accent: oklch(0.6204 0.195 253.83);
	--accent-foreground: var(--snow);
	--background: oklch(0.9702 0 0);
	--foreground: var(--eclipse);
}
```

**Get current theme variables:**

```bash
node scripts/get_theme.mjs
```

**Color naming:**

- Without suffix = background (e.g., `--accent`)
- With `-foreground` = text color (e.g., `--accent-foreground`)

**Theme switching:**

```html
<html class="dark" data-theme="dark"></html>
```

For detailed theming, read the offline guide: `node scripts/get_docs.mjs theming` or the `design_kit_docs` MCP tool.

**Global customization and custom themes:** to restyle components app-wide (tokens, BEM class overrides, new variants) or author a complete named light/dark theme, use the bundled sibling skill `heroui-theming` (same plugin, under `designer-ui/heroui/heroui-theming/`).
