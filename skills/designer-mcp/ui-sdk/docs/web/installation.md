# Installation

Install UI SDK and register its custom elements.

Use these components in an app that supports custom elements. The examples use a bundler, such as Vite, to resolve package imports.

## Install the Packages

```bash
npm install @ui-sdk/web @ui-sdk/core
```

`@ui-sdk/web` provides the custom elements. `@ui-sdk/core` provides their behavior and is a peer dependency. Install both so the components and any helpers you use share one copy of the core.

## Register a Component

Import each component from its own entry to register its tags:

```ts
import "@ui-sdk/web/button"
import "@ui-sdk/web/toggle"
```

A dialog has separate tags for its trigger, content, and title. One import registers them all:

```ts
import "@ui-sdk/web/dialog"
```

Load these imports from your app's browser entry. The root entry, `@ui-sdk/web`, exports helpers and types but registers no elements. Each [component page](./README.md) shows the tags you can use.

## Without a Build Step

A plain HTML page can load the components from ui-sdk.dev, with nothing to install. Add one script, and each component loads the first time its tags appear on the page:

```html
<script type="module" src="https://ui-sdk.dev/web@0.js"></script>

<ui-toggle><button>Bold</button></ui-toggle>
```

`@0` follows the newest 0.x release. To keep a page on one release, use its exact version, like `web@0.4.1.js`. For a quick test, `web.js` with no version follows the newest release of all.

To have an agent build the page, ask it to read web.md first. It's these docs in one file, written for a page that loads `web.js` and `web.css`.

Each component also has its own file, named like its import, if you'd rather list them:

```html
<script type="module" src="https://ui-sdk.dev/web@0/toggle.js"></script>
```

To host the files yourself, copy the `browser` folder from the `@ui-sdk/web` package into your site. It holds `web.js` and the `web` folder it loads from, so keep the two side by side. Browsers only run module scripts from a server, so open the page through one, not from a file on disk.

### Build Your Own

`core.js` has every behavior from `@ui-sdk/core`, along with `definePrimitive` and `createParts`. Import it to build a component we don't ship, on the same page as ours. This one is a small grid of cells you can move through with the arrow keys and select with Shift:

```html
<script type="module">
  import {
    createCellRange,
    createGridFocus,
    createParts,
    definePrimitive,
  } from "https://ui-sdk.dev/web@0/core.js"

  const sheet = definePrimitive({
    name: "sheet",
    options: { rows: "number", cols: "number" },
    state: () => ({ active: null, range: null }),
    api: (context) => {
      const rows = () => context.options().rows
      const cols = () => context.options().cols
      const grid = createGridFocus(context, { key: "active", rows, cols })
      return {
        grid,
        range: createCellRange(context, { key: "range", grid, rows, cols }),
      }
    },
    slots: (slot) => ({
      root: slot({ attrs: () => ({ role: "grid" }) }),
      row: slot({ attrs: () => ({ role: "row" }) }),
      cell: slot({
        props: { row: "number", col: "number" },
        attrs: (state, { props, api }) => ({
          role: "gridcell",
          tabindex: api.grid.tabIndex(state, props),
          ...api.range.cellAttrs(state, props),
        }),
        on: {
          keydown: (event, { api }) => api.range.keydown(event),
          pointerdown: (event, { api, props }) =>
            api.range.pointerdown(event, props),
        },
        bind: (el, { api, props }) => api.range.bind(el, props),
      }),
    }),
  })

  createParts(sheet, {
    root: "my-sheet",
    row: "my-sheet-row",
    cell: "my-sheet-cell",
  })
</script>

<my-sheet rows="2" cols="2" aria-label="Numbers">
  <my-sheet-row>
    <my-sheet-cell row="0" col="0">4</my-sheet-cell>
    <my-sheet-cell row="0" col="1">8</my-sheet-cell>
  </my-sheet-row>
  <my-sheet-row>
    <my-sheet-cell row="1" col="0">15</my-sheet-cell>
    <my-sheet-cell row="1" col="1">16</my-sheet-cell>
  </my-sheet-row>
</my-sheet>
```

Selected cells get `aria-selected` and `data-selected` to style. [Compose Behaviors](./core.md#compose-behaviors) walks through building a primitive, and [Rendering Primitives](./rendering.md) covers `createParts`. `core.js` shares its files with the components, so a page that uses both loads that code once.

## Add Your Styles

Components use light DOM and are unstyled, so you style them with your app's CSS or with Tailwind CSS. [Styling and Animation](./styling-and-animation.md) covers both.

You can render your first component without setting up a provider, a portal root, or a UI SDK stylesheet. CSS Modules need a bundler that imports a class-name map.

For right-to-left layouts, set `dir="rtl"` on the page or a container. Use logical CSS properties, such as `padding-inline-start`, in your styles. [Server Rendering](./server-rendering.md) covers markup before the elements upgrade.

## Editor Support

The package includes `custom-elements.json`, which describes its tags, attributes, properties, and events. Tools that support custom element manifests can read it.

For HTML completion in VS Code, add this to your workspace settings:

```json title=".vscode/settings.json"
{ "html.customData": ["./node_modules/@ui-sdk/web/html-custom-data.json"] }
```

Component imports also register element types with TypeScript. For example, importing `@ui-sdk/web/toggle` gives `document.querySelector("ui-toggle")` its element type.

Continue with [First Component](./first-component.md) to add a working toggle to your page.
