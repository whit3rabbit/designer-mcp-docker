---
name: heroui-theming
description: "Globally customize HeroUI v3 with CSS tokens, oklch variables, BEM overrides, and themes."
metadata:
  author: heroui
  version: "1.0.0"
---

# HeroUI v3 Theming Guide

HeroUI's look lives in `@heroui/styles`: **theme tokens** and **BEM component classes** in CSS cascade layers (`@layer theme, base, components, utilities;`). Everything visual can be customized globally with CSS—no component wrappers, no JS, works on React, plain HTML, or any framework. For component props/JSX, use `heroui-react`.

## Offline Sources & Inspection

Always inspect the installed `@heroui/styles` (or baked `<cache>/heroui/styles` fallback) before writing overrides:

```bash
node scripts/list_tokens.mjs                           # shared, light, dark, Tailwind mapping
node scripts/list_component_classes.mjs                # all component stylesheets
node scripts/list_component_classes.mjs button switch  # blocks, elements, modifiers, states, tokens
node scripts/list_component_classes.mjs modal --css    # include raw CSS
```

Offline MCP access: `design_kit_docs` (`kit: "heroui"`, `kind: "guide"`, `item: "theming"` / `"colors"` / `"styling"` / `"dark-mode"`) and `design_kit_code` (`kit: "heroui"`, `kind: "styles"` or `"theme"`).

## Decision Ladder

Use the lowest rung that solves the request:

| # | Request | Approach | Reference |
|---|---|---|---|
| 1 | Brand color, radius, shadows | Theme tokens (`@layer theme`) | [references/tokens.md](references/tokens.md) |
| 2 | One component's colors | Component custom properties | [references/components.md](references/components.md) |
| 3 | Shape, typography, layout, states | BEM override in `@layer components` | [references/components.md](references/components.md) |
| 4 | Add a new variant | New modifier class | [references/tokens-and-bem.md](references/tokens-and-bem.md) |
| 5 | Full named theme (light + dark) | `src/themes/<name>/` folder | [references/theme-recipe.md](references/theme-recipe.md) |
| 6 | Restyle an existing preset | Brand palette layered over preset | [references/theme-recipe.md](references/theme-recipe.md#restyling-a-theme-you-didnt-write) |
| 7 | Plain HTML / Vue / Svelte | `@heroui/styles` without React | [references/any-framework.md](references/any-framework.md) |

Load [references/tokens-and-bem.md](references/tokens-and-bem.md) for CSS snippets, the 16 theming rules, and the light/dark verification checklist.
