# HeroUI v3 Tokens, BEM Overrides, Rules & Checklist

All CSS snippets go in the app's main CSS file **after** `@import "@heroui/styles";`.

## 1. Theme Tokens

```css
@layer theme {
  :root {
    --accent: oklch(0.55 0.2 300);
    --accent-foreground: var(--snow);
    --radius: 0.375rem;
  }
  :root, .light, [data-theme="light"] {
    --background: oklch(0.98 0.01 300);
  }
  .dark, [data-theme="dark"] {
    --background: oklch(0.16 0.02 300);
  }
}
```
Mode-specific tokens (`--background`, `--surface`, `--foreground`, shadows) need both light and dark blocks.

## 2. Component Custom Properties

```css
@layer components {
  .button--primary {
    --button-bg: var(--foreground);
    --button-bg-hover: color-mix(in oklab, var(--foreground) 88%, var(--background));
    --button-bg-pressed: color-mix(in oklab, var(--foreground) 80%, var(--background));
    --button-fg: var(--background);
  }
}
```

## 3. BEM Overrides & New Modifiers

```css
@layer components {
  .button { @apply font-semibold tracking-wide uppercase; }
  .card { @apply border border-border; }
  .card--transparent { @apply border-none; }
  .button:active, .button[data-pressed="true"] { transform: scale(0.95); }
}
```
New modifiers assign all of the component's custom properties inside `@layer components` (e.g. `.button--brand { --button-bg: ...; }`).

## 4. Named Themes & Without React

- **Named theme (`src/themes/<name>/`):** `index.css` imports `./variables.css` (`layer(theme)`) and `./components/index.css` (`layer(components)`), activated via `<html data-theme="<name>-light">` / `<name>-dark`. Read [theme-recipe.md](theme-recipe.md) for the full recipe and material selectors.
- **Plain HTML / non-React:** Link `heroui.min.css` and apply BEM classes + `role` / `aria-*` / `data-*` attributes ([any-framework.md](any-framework.md)).

## 5. Rules

1. **Tokens before overrides**; **`oklch()`** for colors; **semantic tokens**, never hardcoded colors.
2. **Keep `-foreground` pairs readable** (WCAG AA 4.5:1) and define **both light and dark modes**.
3. **Style states twice:** pseudo-class + data attribute (`:hover` + `[data-hovered="true"]`, `:active` + `[data-pressed="true"]`, `:focus-visible` + `[data-focus-visible="true"]`, `:disabled` + `[data-disabled="true"]`).
4. **Overrides go in `@layer components`**, never unlayered and never `!important`; match base specificity and re-assert clobbered modifiers.
5. **Preserve focus rings** (`@apply shadow-[…]`, never `none`) and **`motion-reduce:transition-none`**.
6. **Apply themes on `<html>`**, use **complete class names** only, **never edit `node_modules`**, remove conflicting unlayered `:root` leftovers, keep **one material** across all "on" states, and keep **text in rem, shape in px** when text scales.

## 6. Verification Checklist (Light & Dark)

- [ ] CSS builds cleanly (`@apply` utilities valid)
- [ ] Canvas & text (`bg-background text-foreground`)
- [ ] Button variants + states; Input/Select/Checkbox/Radio/Switch states
- [ ] Card, Accordion, Table, Tabs, Popover, Tooltip, Modal, Toast, Chip/Badge/Alert
- [ ] Consistent material on all "on" states; `motion-reduce` intact; `DESIGN.md` updated if present
