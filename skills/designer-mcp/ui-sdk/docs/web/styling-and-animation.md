# Styling and Animation

Style the rendered elements and add entry and exit transitions.

Parts render without styles. The component demos use plain CSS, and the same state attributes and CSS variables work with Tailwind CSS or any other stylesheet.

## Style a Part

Style the element that receives the behavior. For a toggle, that is the button inside its wrapper. Import `@ui-sdk/web/toggle` on this page:

```html
<ui-toggle>
  <button
    class="rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm data-pressed:bg-neutral-100 data-disabled:opacity-50"
  >
    Bold
  </button>
</ui-toggle>
```

State attributes such as `data-pressed` and `data-disabled` are present or absent. Others have values, such as `data-side="top"`. Each component's Styling section lists its attributes and CSS variables.

## CSS Modules

CSS Modules need a bundler that imports a class-name map. With plain CSS, use an ordinary class name and load the stylesheet instead. Import the module and pass its class to the button:

```html
<ui-toggle id="bold"><button>Bold</button></ui-toggle>
```

```ts
import "@ui-sdk/web/toggle"
import styles from "./toggle.module.css"

const button = document.querySelector("#bold button")!
button.classList.add(styles.toggle)
```

```css title="toggle.module.css"
.toggle {
  cursor: default;
  border: 1px solid var(--input, #e5e5e5);
  border-radius: 1.125rem;
  background: transparent;
  padding: 0.375rem 0.625rem;
  color: inherit;
  font: inherit;
  font-size: 0.875rem;
}

.toggle[data-pressed] {
  background: var(--muted, #f5f5f5);
}

.toggle[data-disabled] {
  opacity: 0.5;
}

.toggle:focus-visible {
  outline: 2px solid var(--ring, #a3a3a3);
  outline-offset: 2px;
}
```

## Animate Opening and Closing

Import `@ui-sdk/web/popover`, then style `data-starting-style` for entry and `data-ending-style` for exit:

```html
<ui-popover id="details">
  <ui-popover-trigger><button>Details</button></ui-popover-trigger>
  <ui-popover-content
    class="origin-(--transform-origin) transition-[opacity,scale] duration-150 data-starting-style:scale-96 data-starting-style:opacity-0 data-ending-style:scale-96 data-ending-style:opacity-0 motion-reduce:transition-none"
  >
    <ui-popover-title>Project Details</ui-popover-title>
    <p>Last updated today.</p>
    <ui-popover-close><button>Done</button></ui-popover-close>
  </ui-popover-content>
</ui-popover>
```

The popup stays shown until its exit transition or animation finishes, then becomes hidden. Put exit styles on `data-ending-style`; `data-closed` describes state but doesn't wait for an exit.

Popups provide `--anchor-width` and `--available-height` for sizing. Use those and `data-slot` rather than generated IDs. [Popups](./popups.md) covers placement and containers.

## The ui-sdk Layer

A few behaviors need a little CSS, like keeping a closed popup hidden or giving each element a default `display`, so ui-sdk adds it to the page in a cascade layer named `ui-sdk`. Declare that layer at the top of the stylesheet your page links, so your own styles win over it wherever the page puts them. With Tailwind, put it above `@import "tailwindcss"`:

```css
@layer ui-sdk;
```

## Content Security Policy

A Content Security Policy without `'unsafe-inline'` in `style-src` blocks the CSS ui-sdk adds to the page. Give ui-sdk your policy's nonce with a meta tag in the page's `<head>`, next to where your server writes the policy:

```html
<meta property="csp-nonce" nonce="your-nonce" />
```

With Vite, set `html.cspNonce` in your Vite config to a placeholder, and Vite writes this tag for you. Your server replaces the placeholder with a new nonce on each request. Shadow roots need nothing: ui-sdk adopts constructed style sheets there, which no policy blocks.

If your policy has no nonce for styles, add the tag without the `nonce` attribute, and ui-sdk adopts constructed style sheets on the page too. If your code replaces `document.adoptedStyleSheets`, ui-sdk adds its sheets back as elements update or are added.
