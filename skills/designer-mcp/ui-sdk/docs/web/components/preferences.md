# Preferences

Apply user preferences to data attributes so your styles can follow them.

`<ui-preferences>` puts your preferences on `data-*` attributes and keeps them up to date. Use it around a part of your app, or apply a preference to the whole page.

```ts title="basic.ts"
import { createLocalStorage, createPreference } from "@ui-sdk/core"
import "@ui-sdk/web/button"
import "@ui-sdk/web/preferences"
import { log } from "./log"

const view = createPreference({
  values: ["list", "grid"],
  defaultValue: "list",
  attribute: "data-view",
  storage: createLocalStorage("ui-sdk-preferences-view"),
})

const files = [
  { name: "Q3 roadmap.pdf", detail: "2.4 MB" },
  { name: "Launch checklist.md", detail: "12 KB" },
  { name: "Offsite photos", detail: "24 items" },
  { name: "Brand assets.zip", detail: "18 MB" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-preferences>
      <div data-slot="stack">
        <div data-slot="controls" role="group" aria-label="View">
          <ui-button><button type="button" data-value="list">List</button></ui-button>
          <ui-button><button type="button" data-value="grid">Grid</button></ui-button>
        </div>
        <ul data-slot="files" aria-label="Files">
          ${files.map((file) => `<li><span>${file.name}</span><span data-slot="hint">${file.detail}</span></li>`).join("")}
        </ul>
      </div>
    </ui-preferences>
  `

  const preferences = root.querySelector("ui-preferences")!
  const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-value]")]
  preferences.preferences = [view]

  const update = () => {
    const { value } = view.get()
    for (const button of buttons) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.value === value)
      )
    }
  }
  const choose = (event: MouseEvent) => {
    const next = (event.currentTarget as HTMLButtonElement).dataset.value as
      "list" | "grid"
    view.set(next, { reason: "press", event })
    log(root, `Saved the ${next} view`)
  }

  const stop = view.subscribe(update)
  update()
  for (const button of buttons) {
    button.addEventListener("click", choose)
  }

  return () => {
    stop()
    for (const button of buttons) {
      button.removeEventListener("click", choose)
    }
    preferences.preferences = []
  }
}

export { mount }
```

Choose Grid, then reload the page. The files come back in the view you chose, and the console logs each change.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the component once to register its element:

```ts
import "@ui-sdk/web/preferences"
```

## Usage

Define the preference you want to apply. Here, `view` chooses how a file list is laid out:

```ts title="preferences.ts"
import { createPreference } from "@ui-sdk/core"

const view = createPreference({
  values: ["list", "grid"],
  defaultValue: "list",
  attribute: "data-view",
})

export { view }
```

Wrap the content in `<ui-preferences>`, then style it by the preference's attribute:

```html title="file-list.html"
<ui-preferences>
  <ul data-slot="files">
    <li>Q3 roadmap.pdf</li>
    <li>Launch checklist.md</li>
  </ul>
</ui-preferences>
<script type="module" src="./file-list.ts"></script>
```

Set the element's `preferences` property to your list:

```ts title="file-list.ts"
import "@ui-sdk/web/preferences"
import { view } from "./preferences"

const preferences = document.querySelector("ui-preferences")!
preferences.preferences = [view]
```

```css
[data-view="grid"] [data-slot="files"] {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
```

The element starts with `data-view="list"`. Calling `view.set("grid")` updates it, and the list becomes a grid. `<ui-preferences>` renders with `display: contents`, so it adds no box of its own.

## Save the Value

Add `storage` to save the choice between visits:

```ts title="preferences.ts"
import { createLocalStorage, createPreference } from "@ui-sdk/core"

const view = createPreference({
  values: ["list", "grid"],
  defaultValue: "list",
  attribute: "data-view",
  storage: createLocalStorage("ui-sdk-preferences-view"),
})

export { view }
```

The preference now saves changes in local storage and restores the saved value when the page reloads. You can also [use session storage or cookies with `createPreference`](../core.md#remember-the-choice).

## Read the Value

Use `get()` and `subscribe()` when the value affects your content. This function keeps a Grid button pressed while the grid view is on, toggles the view when it's pressed and returns its cleanup:

```ts title="view-switch.ts"
import { view } from "./preferences"

function bindViewSwitch(button: HTMLButtonElement) {
  const update = () => {
    button.setAttribute("aria-pressed", String(view.get().value === "grid"))
  }
  const toggle = () => view.set(view.get().value === "grid" ? "list" : "grid")

  const stop = view.subscribe(update)
  update()
  button.addEventListener("click", toggle)
  return () => {
    stop()
    button.removeEventListener("click", toggle)
  }
}

export { bindViewSwitch }
```

Call `bindViewSwitch(button)` when the button mounts, and call the returned function when it is removed. Pass the same preference instance wherever you need its value. Subscriptions also work outside `<ui-preferences>`.

## Apply to the Whole Page

Set `global: true` when defining the preference:

```ts
const view = createPreference({
  values: ["list", "grid"],
  defaultValue: "list",
  attribute: "data-view",
  global: true,
  storage: createLocalStorage("ui-sdk-preferences-view"),
})
```

Keep assigning it to `<ui-preferences>`. Its attribute now goes on `<html>`, so styles throughout the page can use it. A global preference needs only one connected `<ui-preferences>` element to apply it.

## Multiple Preferences

Assign more than one preference in the list. For example, you can apply `view` alongside a [color scheme](../core.md#choose-a-color-scheme):

```ts
import { createColorScheme } from "@ui-sdk/core"

const colorScheme = createColorScheme()

preferences.preferences = [view, colorScheme]
```

Each preference uses its own attribute and `global` option. Wrappers that share a preference instance follow the same value. For independent choices, use separate preference instances and different storage keys.

## Server Rendering

To apply saved values before the page paints, write `preferencesScript([...])` into your server-rendered HTML as the element's first child:

```ts title="server.ts"
import { preferencesScript } from "@ui-sdk/core"
import { view } from "./preferences"

const page = `<ui-preferences>
  <script>${preferencesScript([view])}</script>
  <main>…</main>
</ui-preferences>`
```

The script applies the saved attributes as the browser parses the page. Your client module then assigns the same preferences to the element, as in [Usage](#usage), to keep them current.

Follow the [server rendering setup](../server-rendering.md#show-them-before-the-scripts-load) for the complete page and client module, including how to keep cookie-backed preferences separate for each request.

If your Content Security Policy requires a nonce, put the nonce from your response on the `<script>` you write into the HTML.

## API Reference

### ui-preferences

Set `preferences` as a JavaScript property. It accepts preferences created with `createPreference` or `createColorScheme`.

- `preferences` (`readonly PreferenceLike[]`): The preferences to show, from `createPreference` or `createColorScheme`. Example: [Usage](#usage).
