# Collapsible

Show and hide a panel, preserve its contents, and animate its height.

Use a collapsible to show and hide one panel of content. For a set of panels, use an [accordion](./accordion.md).

```ts title="basic.ts"
import "@ui-sdk/web/collapsible"
import { ChevronDown, createElement } from "lucide"

const items = [
  { name: "Linen shirt", price: "$48.00" },
  { name: "Canvas tote", price: "$18.00" },
  { name: "Wool socks", price: "$18.00" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-collapsible data-variant="card">
      <ui-collapsible-trigger>
        <button type="button" aria-expanded="false">
          <span data-slot="stack">
            <span>Order #4189</span>
            <span data-slot="hint">3 items, $84.00</span>
          </span>
          ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
        </button>
      </ui-collapsible-trigger>
      <ui-collapsible-panel hidden>
        ${items
          .map(
            (item) => `
              <div data-slot="row">
                <span>${item.name}</span>
                <span>${item.price}</span>
              </div>`
          )
          .join("")}
      </ui-collapsible-panel>
    </ui-collapsible>
  `
}

export { mount }
```

Press Order #4189, or focus it and press Enter or Space, to show the items.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the component to register its elements. The import is safe on the server.

```ts
import "@ui-sdk/web/collapsible"
```

## Composition

Use the following composition to build a `ui-collapsible`:

```text
ui-collapsible
├── ui-collapsible-trigger
│   └── button
└── ui-collapsible-panel
```

The trigger wraps your own native button, and the root and panel are block elements. Put other content around them, like a heading or a summary that always shows.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/collapsible"
</script>

<ui-collapsible>
  <ui-collapsible-trigger
    ><button>Order details</button></ui-collapsible-trigger
  >
  <ui-collapsible-panel hidden>2 × Linen shirt</ui-collapsible-panel>
</ui-collapsible>
```

## Build Your Own

`@ui-sdk/web/collapsible` comes with ready-made `ui-collapsible` elements. If you'd like to build your own, with your own element names, start from the `collapsible` primitive in `@ui-sdk/core`:

```ts title="spoiler-elements.ts"
import { collapsible } from "@ui-sdk/core/collapsible"
import { createParts, wrappedButton } from "@ui-sdk/web"

createParts(collapsible, {
  root: "spoiler-box",
  trigger: {
    tag: "spoiler-toggle",
    target: wrappedButton,
    display: "contents",
  },
  panel: "spoiler-content",
})
```

```html
<spoiler-box>
  <spoiler-toggle><button>Show the ending</button></spoiler-toggle>
  <spoiler-content hidden>The butler did it.</spoiler-content>
</spoiler-box>
```

Each element keeps the behavior, state and data attributes of its ready-made counterpart. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Disabled

Set `disabled` on the root to stop its trigger from opening or closing the panel. The trigger stays in the tab order and reports `aria-disabled="true"`. A disabled `<fieldset>` around the collapsible disables it too.

```html
<ui-collapsible disabled>
  <ui-collapsible-trigger><button>Gift options</button></ui-collapsible-trigger>
  <ui-collapsible-panel hidden
    >Add a gift message and wrapping.</ui-collapsible-panel
  >
</ui-collapsible>
```

## Keep Mounted

Closed panels stay in the page with `hidden`, so Tab skips their contents and a field keeps what you typed into it. Set `keep-mounted` on the panel to keep it bound while it's closed, so the trigger's `aria-controls` still points to it.

```ts title="keep-mounted.ts"
import "@ui-sdk/web/collapsible"
import "@ui-sdk/web/field"
import "@ui-sdk/web/textarea"
import { ChevronDown, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-collapsible data-variant="card">
      <ui-collapsible-trigger>
        <button type="button" aria-expanded="false">
          <span data-slot="stack">
            <span>Add a delivery note</span>
            <span data-slot="hint">Optional, for the courier</span>
          </span>
          ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
        </button>
      </ui-collapsible-trigger>
      <ui-collapsible-panel keep-mounted hidden>
        <ui-field>
          <ui-field-label>Delivery note</ui-field-label>
          <ui-textarea>
            <textarea placeholder="Leave it with the front desk…"></textarea>
          </ui-textarea>
        </ui-field>
      </ui-collapsible-panel>
    </ui-collapsible>
  `
}

export { mount }
```

Open Add a delivery note, type a note, then close and reopen the panel. Your note is still there.

## Find in Page

Set `hidden-until-found` on the panel to keep it in the DOM as `hidden="until-found"`. Browser Find and links to content inside the panel can reveal it. The panel opens without an animation so the match is visible immediately.

Write `hidden="until-found"` on the closed panel too, so it is findable before the elements upgrade.

```ts title="find-in-page.ts"
import "@ui-sdk/web/collapsible"
import { ChevronDown, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-collapsible data-variant="card">
      <ui-collapsible-trigger>
        <button type="button" aria-expanded="false">
          <span data-slot="stack">
            <span>Ingredients</span>
            <span data-slot="hint">Morning buns, makes 12</span>
          </span>
          ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
        </button>
      </ui-collapsible-trigger>
      <ui-collapsible-panel hidden-until-found hidden="until-found">
        <p>Flour, butter, brown sugar, eggs, a pinch of cardamom and sea salt.</p>
      </ui-collapsible-panel>
    </ui-collapsible>
  `
}

export { mount }
```

Leave Ingredients closed. Open your browser's Find command and search for cardamom to reveal the panel.

## Controlled

Read or set the element's `open` property. Setting it commits the change without firing `openchange`, like a native input's `value`. Listen for `openchange` to follow the changes people make, and call `event.preventDefault()` in it to cancel the change.

For a button elsewhere on the page, call the element's `api.toggle()`, `api.open()` or `api.close()`. Its `api` property is the [controller](#controller).

```ts title="controlled.ts"
import "@ui-sdk/web/collapsible"
import { ChevronDown, createElement } from "lucide"
import { log } from "./log"

const recoveryCodes = ["7KQ2-M9XD", "P4TR-8HZC", "W3NB-6JUE", "C5YF-2LSA"]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Toggle</button>
      </div>
      <ui-collapsible data-variant="card">
        <ui-collapsible-trigger>
          <button type="button" aria-expanded="false">
            <span data-slot="stack">
              <span>Recovery codes</span>
              <span data-slot="hint">Each code signs you in once</span>
            </span>
            ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-collapsible-trigger>
        <ui-collapsible-panel hidden>
          <div data-slot="stack">
            <ul>${recoveryCodes.map((code) => `<li>${code}</li>`).join("")}</ul>
            <button type="button">Done</button>
          </div>
        </ui-collapsible-panel>
      </ui-collapsible>
    </div>
  `
  const collapsible = root.querySelector("ui-collapsible")!
  root
    .querySelector("[data-slot=controls] button")!
    .addEventListener("click", () => collapsible.api.toggle())
  root
    .querySelector("ui-collapsible-panel button")!
    .addEventListener("click", () => collapsible.api.close())
  collapsible.addEventListener("openchange", (event) => {
    const { value, reason } = event.detail
    log(root, `${value ? "Opened" : "Closed"} (${reason})`)
  })
}

export { mount }
```

Open Recovery codes with Toggle or its trigger, then press Done. The console logs each change and its reason, and Done returns focus to the trigger.

## Animation

Animate the measured `--collapsible-panel-height` between zero and the content's height. `data-starting-style` marks the opening frame, and `data-ending-style` stays on while it closes. The panel stays mounted until its closing animation finishes, and a panel open on its first paint doesn't animate.

```css
[data-slot="collapsible-panel"] {
  height: var(--collapsible-panel-height);
  overflow: hidden;
  transition: height 0.2s ease-out;

  &:is([data-starting-style], [data-ending-style]) {
    height: 0;
  }
}
```

`openchangecomplete` reports when opening or closing has finished.

```ts title="animation.ts"
import "@ui-sdk/web/collapsible"
import { ChevronDown, createElement } from "lucide"
import { log } from "./log"

const notes = [
  "Search now matches file contents, not only names.",
  "Shared links remember the folder they were opened from.",
  "Uploads resume after the connection drops.",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-collapsible data-variant="card">
      <ui-collapsible-trigger>
        <button type="button" aria-expanded="false">
          <span data-slot="stack">
            <span>Release notes</span>
            <span data-slot="hint">Version 2.4, released October 28</span>
          </span>
          ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
        </button>
      </ui-collapsible-trigger>
      <ui-collapsible-panel hidden>
        <ul>
          ${notes.map((note) => `<li>${note}</li>`).join("")}
        </ul>
      </ui-collapsible-panel>
    </ui-collapsible>
  `
  root
    .querySelector("ui-collapsible")!
    .addEventListener("openchangecomplete", (event) => {
      log(root, event.detail.value ? "Finished opening" : "Finished closing")
    })
}

export { mount }
```

Open and close Release notes. The console logs when each animation finishes.

## Custom Rendering

The trigger wraps your own button, so put it inside a heading. Set `as-child` on the panel to bind it to your own element, here an ordered list. Elements have no render functions, so the summary follows the root's `data-open`. See [Parts and Composition](../parts-and-composition.md).

```ts title="render.ts"
import "@ui-sdk/web/collapsible"
import { ChevronDown, createElement } from "lucide"

const updates = [
  { label: "Out for delivery", time: "07:40" },
  { label: "Arrived at the local depot", time: "05:12" },
  { label: "Left the sorting center", time: "Wed 21:03" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-collapsible data-variant="card">
      <h3>
        <ui-collapsible-trigger>
          <button type="button" aria-expanded="false">
            <span data-slot="stack">
              <span>Track parcel</span>
              <span data-slot="hint" data-show="open">3 updates</span>
              <span data-slot="hint" data-show="closed">Arrives Thursday</span>
            </span>
            ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-collapsible-trigger>
      </h3>
      <ui-collapsible-panel as-child>
        <ol hidden>
          ${updates
            .map(
              (update) => `
                <li data-slot="row">
                  <span>${update.label}</span>
                  <span>${update.time}</span>
                </li>`
            )
            .join("")}
        </ol>
      </ui-collapsible-panel>
    </ui-collapsible>
  `
}

export { mount }
```

Press Track parcel to open the ordered list. The summary changes from Arrives Thursday to 3 updates.

## Styling

Use `data-open`, `data-closed` and `data-disabled` to style each state. The examples turn their chevron from the trigger's `data-open`.

Each part has a `data-slot`, such as `collapsible-panel`, and its state attributes are listed under [Data Attributes](#data-attributes).

### `<ui-collapsible-panel>`
- `--collapsible-panel-height`: The panel's content height in pixels while it animates, auto once open and 0px while closed.
- `--collapsible-panel-width`: The panel's content width, the same way. For panels that open sideways.

## Data Attributes

### `<ui-collapsible>`
`[data-slot="collapsible"]`

- `data-open`: Present while the panel is open.
- `data-closed`: Present while the panel is closed, including while it animates out.
- `data-disabled`: Present when the collapsible can't open or close.

### `<ui-collapsible-trigger>`
`[data-slot="collapsible-trigger"]`

- `data-open`: Present while the panel is open.
- `data-closed`: Present while the panel is closed, including while it animates out.
- `data-disabled`: Present when the collapsible can't open or close.

### `<ui-collapsible-panel>`
`[data-slot="collapsible-panel"]`

- `data-open`: Present while the panel is open.
- `data-closed`: Present while the panel is closed, including while it animates out.
- `data-disabled`: Present when the collapsible can't open or close.
- `data-starting-style`: Present for the panel's first frame. Style the state you animate from.
- `data-ending-style`: Present while the panel animates closed. Style the state you animate to.

## API Reference

Props are attributes in kebab case, like `default-open`, `keep-mounted` and `hidden-until-found`: `"false"`
is false. Callbacks are DOM events. Elements have no `controller` attribute: their
`api` property is one.

### Collapsible

- `open?` (`boolean`): Whether the panel is open. Pass it to control the collapsible.
- `defaultOpen?` (`boolean`): Whether the panel is open at first, when uncontrolled.
- `openchange event`: Runs when the panel wants to open or close. `details.reason` says why, and `details.cancel()` stops it.
- `openchangecomplete event`: Runs once the panel has finished opening or closing, after any animation.
- `disabled?` (`boolean`): Stops the trigger from opening or closing the panel. The trigger stays focusable.
- `controller?` (`object`): Opens and closes the panel from anywhere. Create one with `createCollapsibleController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### CollapsibleTrigger

The trigger takes no options of its own. `<ui-collapsible-trigger>` wraps a native `button`.

### CollapsiblePanel

- `keepMounted?` (`boolean`): Whether the panel stays in the page, hidden, while closed.
- `hiddenUntilFound?` (`boolean`): Keeps the closed panel in the page as `hidden="until-found"`, so the browser's find in page can match its text and open it.

### State

The same state shows as data attributes on each element.

- `open` (`boolean`): Whether the panel is open.
- `disabled` (`boolean`): Whether the trigger ignores presses, by its own `disabled` or a disabled fieldset around it. The `open` option and the controller can still open and close it.

### Reasons

`event.detail.reason` says why the panel opened or closed.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `find-in-page` (`Event`): The browser's find in page matched hidden content.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods. The `open` property reads and sets whether the panel is
open.

Every write method takes an optional `{ reason, event }`, and returns `false` when the change was canceled or changed nothing.

- `isOpen()` (`() => boolean`): Whether the panel is open.
- `setOpen(open, options?)` (`(open: boolean, options?: CollapsibleChangeOptions | undefined) => boolean`): Opens or closes the panel. Returns false when the change was canceled or not possible.
- `open(options?)` (`(options?: CollapsibleChangeOptions | undefined) => boolean`): Opens the panel.
- `close(options?)` (`(options?: CollapsibleChangeOptions | undefined) => boolean`): Closes the panel.
- `toggle(options?)` (`(options?: CollapsibleChangeOptions | undefined) => boolean`): Opens the panel when it's closed, and closes it when it's open.
- `focus()` (`() => void`): Moves focus to the trigger.

### Events

Events fire on their own element and don't bubble, with the new state in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` on `openchange` cancels the change.

| Member                     | On               | Description                                                                |
| -------------------------- | ---------------- | -------------------------------------------------------------------------- |
| `open` property, attribute | `ui-collapsible` | Whether the panel is open. The attribute sets where it starts, and is live |
| `api` property             | `ui-collapsible` | The [controller](#controller)                                              |
| `openchange` event         | `ui-collapsible` | `detail: { value: open, reason, event, source }`                           |
| `openchangecomplete` event | `ui-collapsible` | `detail: { value: open }`, after the panel's animation                     |

## Accessibility

The collapsible follows the [WAI-ARIA disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/). The trigger says whether the panel is open with `aria-expanded`, and points to the panel with `aria-controls` while it's bound. Every line below is an automated test.

### Keyboard

| Key          | Does                                                   |
| ------------ | ------------------------------------------------------ |
| Enter, Space | Opens or closes the panel. Focus stays on the trigger. |
| Tab          | Moves from the trigger into an open panel              |

Closing a panel while focus is inside it moves focus back to the trigger.

### Tested Behavior

**Opening and closing**

- Starts closed, with the panel out of the page.
- Clicking the trigger opens the panel, and clicking again closes it.
- The trigger controls the panel.
- Generated ids start with ui-sdk-.
- It can start open.
- An opening can be canceled.
- A disabled collapsible doesn't open.
- A disabled trigger stays focusable and says it's disabled.
- A controller opens and closes it from anywhere.

**Keyboard**

- Enter toggles the panel and keeps focus on the trigger.
- Space toggles the panel and keeps focus on the trigger.
- Tab moves from the open trigger into the panel.
- Tab skips a closed panel.

**Mounting**

- With keepMounted, the closed panel stays in the page, hidden.
- With keepMounted, a class that sets display doesn't show the closed panel.
- With hiddenUntilFound, the closed panel stays findable.
- With hiddenUntilFound, a class that sets display keeps the closed panel findable.
- Finding text in the closed panel opens it.
- Following a link into the closed panel opens it.
- The browser's own find opens the closed panel.

Runs in React, Vue and web components.

Beyond the pattern's baseline:

**Enhancements**

- Closing the panel while focus is inside it moves focus to the trigger.
- OnOpenChangeComplete runs once the animation has finished.
- Find in page reports its own reason and opens without an animation.
- A canceled find in page keeps the panel hidden until found.
- An infinite exit animation still unmounts the panel.
- Parts report open and closed through data attributes.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while using the collapsible with a keyboard.

Runs in React, Vue and web components.
