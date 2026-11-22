# Resizable

Resize, collapse, and save panel layouts with pointer and keyboard controls.

Use a resizable group to let people size the panes of a layout, like a file list beside an editor, by dragging the handle between them or with the keyboard.

```ts title="basic.ts"
import "@ui-sdk/web/resizable"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-resizable>
      <ui-resizable-panel default-size="35" min-size="20">
        <h3>Files</h3>
        <ul>
          <li>page.tsx</li>
          <li>layout.tsx</li>
          <li>globals.css</li>
        </ul>
      </ui-resizable-panel>
      <ui-resizable-handle aria-label="Resize files"></ui-resizable-handle>
      <ui-resizable-panel default-size="65" min-size="40">
        <ui-resizable orientation="vertical">
          <ui-resizable-panel default-size="60" min-size="30">
            <h3>page.tsx</h3>
            <span data-slot="hint">Saved just now</span>
          </ui-resizable-panel>
          <ui-resizable-handle aria-label="Resize editor"></ui-resizable-handle>
          <ui-resizable-panel default-size="40" min-size="30">
            <h3>Terminal</h3>
            <span data-slot="hint">Ready on port 3000</span>
          </ui-resizable-panel>
        </ui-resizable>
      </ui-resizable-panel>
    </ui-resizable>
  `
}

export { mount }
```

Drag the handle beside Files, then the one between page.tsx and Terminal.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. On the server the import does nothing.

```ts
import "@ui-sdk/web/resizable"
```

## Composition

Use the following composition to build a `ui-resizable`:

```text
ui-resizable
├── ui-resizable-panel
├── ui-resizable-handle
└── ui-resizable-panel
```

Put a handle between the panels you want to resize, and name it with `aria-label`, like "Resize files". The group lays its panels out in a row, so give it a size, and each panel's size is a percentage of the space the panels share. A group can sit inside a panel, like an editor above a terminal.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/resizable"
</script>

<ui-resizable>
  <ui-resizable-panel default-size="30">Files</ui-resizable-panel>
  <ui-resizable-handle aria-label="Resize files"></ui-resizable-handle>
  <ui-resizable-panel>Editor</ui-resizable-panel>
</ui-resizable>
```

The panel without `default-size` takes what's left, here 70%.

## Build Your Own

`@ui-sdk/web/resizable` comes with ready-made `ui-resizable` elements. If you'd like to build your own, with your own element names, start from the `resizable` primitive in `@ui-sdk/core`:

```ts title="split-view-elements.ts"
import { resizable } from "@ui-sdk/core/resizable"
import { createParts } from "@ui-sdk/web"

createParts(resizable, {
  root: { tag: "split-view", display: "block" },
  panel: { tag: "split-view-pane", display: "block" },
  handle: { tag: "split-view-divider", display: "block" },
})
```

```html
<split-view>
  <split-view-pane default-size="30">Files</split-view-pane>
  <split-view-divider aria-label="Resize files"></split-view-divider>
  <split-view-pane>Editor</split-view-pane>
</split-view>
```

Each element keeps the behavior, state and data attributes of its ready-made counterpart: the root lays the panels out, each pane writes its size to `--resizable-panel-size`, and the divider is the focusable separator. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Vertical

Set `orientation="vertical"` to stack the panels, and give the group a height. ArrowUp and ArrowDown move the handle. Every part gets `data-orientation` with the group's direction, so a vertical group's handle is `[data-slot="resizable-handle"][data-orientation="vertical"]`.

```ts title="vertical.ts"
import "@ui-sdk/web/resizable"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-resizable orientation="vertical">
      <ui-resizable-panel default-size="45" min-size="25">
        <h3>Inbox</h3>
        <span data-slot="hint">3 unread messages</span>
      </ui-resizable-panel>
      <ui-resizable-handle aria-label="Resize inbox"></ui-resizable-handle>
      <ui-resizable-panel default-size="55" min-size="25">
        <h3>Quarterly report</h3>
        <span data-slot="hint">From Hollis Grant</span>
      </ui-resizable-panel>
    </ui-resizable>
  `
}

export { mount }
```

Drag the handle between Inbox and Quarterly report, or focus it and use ArrowUp and ArrowDown.

## Handle

Put anything inside a handle, like a grip that shows it can be dragged. The handle can stay a thin line: its hit area is at least 10 pixels across, centered on it, and 24 for touch, without any styles.

```ts title="handle.ts"
import "@ui-sdk/web/resizable"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-resizable>
      <ui-resizable-panel default-size="35" min-size="20">
        <h3>Channels</h3>
        <ul>
          <li>general</li>
          <li>design</li>
          <li>releases</li>
        </ul>
      </ui-resizable-panel>
      <ui-resizable-handle aria-label="Resize channels"><div></div></ui-resizable-handle>
      <ui-resizable-panel default-size="65" min-size="20">
        <h3>general</h3>
        <span data-slot="hint">Kofi Mensah: The release notes are ready.</span>
      </ui-resizable-panel>
    </ui-resizable>
  `
}

export { mount }
```

Grab the grip beside Channels, or focus the handle and use the arrow keys.

## Collapsible

`collapsible` lets a panel collapse below its `min-size` to `collapsed-size`, 0 by default: by dragging past the midpoint to its collapsed size, with Enter or a double-click on its handle, or through the controller. Dragging back past the same point opens it at its minimum, and Enter restores the size it had. A collapsed panel gets `data-collapsed`, and at size 0 its content leaves the tab order and the accessibility tree.

```ts title="collapsible.ts"
import "@ui-sdk/web/resizable"
import { createElement, Folder, Search, Settings } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-resizable>
      <ui-resizable-panel default-size="30" min-size="25" collapsible collapsed-size="48px">
        <ul>
          <li data-slot="row">
            ${createElement(Folder, { "aria-hidden": "true" }).outerHTML}
            <span>Files</span>
          </li>
          <li data-slot="row">
            ${createElement(Search, { "aria-hidden": "true" }).outerHTML}
            <span>Search</span>
          </li>
          <li data-slot="row">
            ${createElement(Settings, { "aria-hidden": "true" }).outerHTML}
            <span>Settings</span>
          </li>
        </ul>
      </ui-resizable-panel>
      <ui-resizable-handle aria-label="Resize sidebar"><div></div></ui-resizable-handle>
      <ui-resizable-panel min-size="40">
        <h3>README.md</h3>
        <span data-slot="hint">Edited by Inès Moreau</span>
      </ui-resizable-panel>
    </ui-resizable>
  `
}

export { mount }
```

Drag the sidebar closed to leave only its icons, or focus its handle and press Enter to collapse and restore it.

## Sizes in Pixels

Sizes are percentages as numbers, or strings with `%`, `px` or `rem`. Pixel and rem bounds hold as the group resizes, so a navigation with `min-size="160px"` never gets narrower, and a change they cause reports the `resize` reason.

```ts title="sizes.ts"
import "@ui-sdk/web/resizable"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-resizable>
      <ui-resizable-panel default-size="200px" min-size="160px" max-size="320px">
        <h3>Docs</h3>
        <ul>
          <li>Getting Started</li>
          <li>Components</li>
          <li>Guides</li>
        </ul>
      </ui-resizable-panel>
      <ui-resizable-handle aria-label="Resize navigation"><div></div></ui-resizable-handle>
      <ui-resizable-panel min-size="30">
        <h3>Getting Started</h3>
        <span data-slot="hint">Install the packages</span>
      </ui-resizable-panel>
    </ui-resizable>
  `
}

export { mount }
```

Resize Docs. It stays between 160 and 320 pixels wide, whatever the width of the group.

## Default Layout

`default-layout` sets every panel's size at once, in order, like `"25,35,40"`. Otherwise panels without `default-size` share what's left evenly.

```ts title="default-layout.ts"
import "@ui-sdk/web/resizable"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-resizable default-layout="25,35,40">
      <ui-resizable-panel min-size="15">
        <h3>Mail</h3>
        <ul>
          <li>Inbox</li>
          <li>Drafts</li>
          <li>Sent</li>
        </ul>
      </ui-resizable-panel>
      <ui-resizable-handle aria-label="Resize folders"></ui-resizable-handle>
      <ui-resizable-panel min-size="15">
        <h3>Inbox</h3>
        <ul>
          <li>Hollis Grant</li>
          <li>Inès Moreau</li>
          <li>Kofi Mensah</li>
        </ul>
      </ui-resizable-panel>
      <ui-resizable-handle aria-label="Resize inbox"></ui-resizable-handle>
      <ui-resizable-panel min-size="15">
        <h3>Quarterly report</h3>
        <span data-slot="hint">From Hollis Grant</span>
      </ui-resizable-panel>
    </ui-resizable>
  `
}

export { mount }
```

The three mail panels start at 25, 35 and 40 percent. Resize any of them.

## Controlled

Set the element's `layout` property, and listen for `layoutchange` for the reason. The layout is one percentage per panel, in order, adding up to 100. Every change carries a [reason](#reasons), like `drag`, `step-key` or `collapse`, and `event.preventDefault()` keeps the current layout. Setting `layout` fires `layoutchange` too, with the `imperative` reason.

```ts title="controlled.ts"
import "@ui-sdk/web/resizable"
import { log } from "./log"

const format = (layout: number[]) => layout.map(Math.round).join(" / ")

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-layout="50,50">Split Evenly</button>
        <button type="button" data-layout="30,70">Reset</button>
      </div>
      <ui-resizable default-layout="30,70">
        <ui-resizable-panel min-size="20">
          <h3>Files</h3>
          <ul>
            <li>page.tsx</li>
            <li>layout.tsx</li>
            <li>globals.css</li>
          </ul>
        </ui-resizable-panel>
        <ui-resizable-handle aria-label="Resize files"></ui-resizable-handle>
        <ui-resizable-panel min-size="20">
          <h3>page.tsx</h3>
          <span data-slot="hint">Saved just now</span>
        </ui-resizable-panel>
      </ui-resizable>
    </div>
  `
  const group = root.querySelector("ui-resizable")!
  let layout = [30, 70]
  group.addEventListener("layoutchange", (event) => {
    const { value, reason } = event.detail
    if (format(value) !== format(layout)) {
      log(root, `${format(value)} (${reason})`)
    }
    layout = value
  })
  root
    .querySelectorAll<HTMLButtonElement>("[data-layout]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => (group.layout = button.dataset.layout!.split(",").map(Number))
      )
    })
}

export { mount }
```

Resize Files to log the layout and its reason. Split Evenly and Reset set the layout from outside.

## Saving on Complete

`layoutchange` fires on every frame of a drag. `layoutcommit` fires once, when the interaction that changed the layout ends: the pointer lifts, the key comes up, or a panel collapses. Save there.

```ts title="complete.ts"
import "@ui-sdk/web/resizable"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-resizable>
      <ui-resizable-panel default-size="40" min-size="20">
        <h3>Files</h3>
        <ul>
          <li>page.tsx</li>
          <li>layout.tsx</li>
          <li>globals.css</li>
        </ul>
      </ui-resizable-panel>
      <ui-resizable-handle aria-label="Resize files"></ui-resizable-handle>
      <ui-resizable-panel min-size="20">
        <h3>page.tsx</h3>
        <span data-slot="hint">Saved just now</span>
      </ui-resizable-panel>
    </ui-resizable>
  `
  root
    .querySelector("ui-resizable")!
    .addEventListener("layoutcommit", (event) => {
      log(
        root,
        `Saved ${event.detail.value.map(Math.round).join(" / ")} (${event.detail.reason})`
      )
    })
}

export { mount }
```

Drag the handle and release it, or press an arrow key. The console logs the layout once, when you let go.

## Persistence

`auto-save-id` saves the layout in `localStorage` when an interaction completes and restores it when the group attaches in the browser. Server markup starts with the default sizes. Each set of panels keeps its own layout, so a panel that comes and goes gets its sizes back. Give panels an `id` so the saved layout survives changes elsewhere on the page.

It's the same idea as [Preferences](./preferences.md), which saves one choice between visits, like a theme. Resizable saves the whole layout, under its `auto-save-id`.

```ts title="persistence.ts"
import "@ui-sdk/web/resizable"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-resizable auto-save-id="docs-persistence">
      <ui-resizable-panel id="docs-sidebar" default-size="30" min-size="20">
        <h3>Outline</h3>
        <ul>
          <li>Introduction</li>
          <li>Installation</li>
          <li>Usage</li>
        </ul>
      </ui-resizable-panel>
      <ui-resizable-handle aria-label="Resize outline"><div></div></ui-resizable-handle>
      <ui-resizable-panel id="docs-content" min-size="30">
        <h3>Introduction</h3>
        <span data-slot="hint">Last edited by Wren Takahashi</span>
      </ui-resizable-panel>
    </ui-resizable>
  `
}

export { mount }
```

Resize Outline, then reload this page to restore its saved width.

## Storage

The `storage` property takes anything with `getItem` and `setItem`, like `sessionStorage` or a cookie. That's the browser's storage shape, not the [storage](./preferences.md#save-the-value) helpers Preferences takes, such as `createLocalStorage`, which each keep one value. Choose between local storage, session storage and a cookie as you would for a preference, under [Remember the Choice](../core.md#remember-the-choice).

This example keeps the layout in `sessionStorage`, for the tab's session. It sets `storage` before the group is in the page, so the group restores from it when it attaches:

```ts title="storage.ts"
import "@ui-sdk/web/resizable"
import type { ResizableStorage } from "@ui-sdk/web"

const session: ResizableStorage = {
  getItem: (key) => sessionStorage.getItem(key),
  setItem: (key, value) => sessionStorage.setItem(key, value),
}

function mount(root: HTMLElement) {
  const group = document.createElement("ui-resizable")
  group.storage = session
  group.setAttribute("auto-save-id", "docs-storage")
  group.innerHTML = `
    <ui-resizable-panel id="session-chats" default-size="35" min-size="20">
      <h3>Messages</h3>
      <ul>
        <li>Inès Moreau</li>
        <li>Kofi Mensah</li>
        <li>Wren Takahashi</li>
      </ul>
    </ui-resizable-panel>
    <ui-resizable-handle aria-label="Resize messages"></ui-resizable-handle>
    <ui-resizable-panel id="session-thread" min-size="20">
      <h3>Inès Moreau</h3>
      <span data-slot="hint">Can we move the review to Friday?</span>
    </ui-resizable-panel>
  `
  root.replaceChildren(group)
}

export { mount }
```

Resize Messages, then reload. The width comes back in this tab, but not in a new one.

A server can't read `localStorage`, so it renders each panel's `default-size` and the saved layout arrives when the elements attach. To render the saved layout on the first paint, keep it in a cookie and write the sizes into each panel's `default-size`. Here your server reads them from the request's `Cookie` header. It imports `resizableStorageKey`, which names the cookie:

```ts title="server.ts"
import { resizableStorageKey } from "@ui-sdk/core/resizable"

function editor(cookie: string | null) {
  const value = cookie?.match(
    new RegExp(`(?:^|; )${resizableStorageKey("editor")}=([^;]*)`)
  )?.[1]
  const saved = value ? JSON.parse(decodeURIComponent(value)) : {}
  const [sidebar = 25, main = 75] = saved["sidebar,main"] ?? []
  return `<ui-resizable auto-save-id="editor">
  <ui-resizable-panel id="sidebar" default-size="${sidebar}"></ui-resizable-panel>
  <ui-resizable-handle aria-label="Resize sidebar"></ui-resizable-handle>
  <ui-resizable-panel id="main" default-size="${main}"></ui-resizable-panel>
</ui-resizable>`
}
```

```ts title="page.ts"
import "@ui-sdk/web/resizable"
import type { ResizableStorage } from "@ui-sdk/web"

const cookieStorage: ResizableStorage = {
  getItem: (key) => {
    const value = document.cookie.match(
      new RegExp(`(?:^|; )${key}=([^;]*)`)
    )?.[1]
    return value === undefined ? null : decodeURIComponent(value)
  },
  setItem: (key, value) => {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000`
  },
}

document.querySelector("ui-resizable")!.storage = cookieStorage
```

## Controller

The element's `api` collapses, expands and resizes panels from anywhere, by id or index, and reads the layout with `getLayout()`. Changes it makes report the `imperative` reason.

```ts title="controller.ts"
import "@ui-sdk/web/resizable"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-action="collapse">Collapse</button>
        <button type="button" data-action="expand">Expand</button>
        <button type="button" data-action="resize">240px</button>
        <button type="button" data-action="read">Read</button>
      </div>
      <ui-resizable>
        <ui-resizable-panel id="controller-sidebar" default-size="30" min-size="20" collapsible>
          <h3>Files</h3>
          <ul>
            <li>page.tsx</li>
            <li>layout.tsx</li>
            <li>globals.css</li>
          </ul>
        </ui-resizable-panel>
        <ui-resizable-handle aria-label="Resize files"></ui-resizable-handle>
        <ui-resizable-panel min-size="30">
          <h3>page.tsx</h3>
          <span data-slot="hint">Saved just now</span>
        </ui-resizable-panel>
      </ui-resizable>
    </div>
  `
  const editor = root.querySelector("ui-resizable")!.api
  const actions: Record<string, () => void> = {
    collapse: () => editor.collapse("controller-sidebar"),
    expand: () => editor.expand("controller-sidebar"),
    resize: () => editor.resize("controller-sidebar", "240px"),
    read: () =>
      log(
        root,
        `Layout ${editor.getLayout().map(Math.round).join(" / ")}${editor.isCollapsed("controller-sidebar") ? ", collapsed" : ""}`
      ),
  }
  root
    .querySelectorAll<HTMLButtonElement>("[data-action]")
    .forEach((button) => {
      button.addEventListener("click", () => actions[button.dataset.action!]())
    })
}

export { mount }
```

Use Collapse, Expand and 240px to move Files from outside the group, and Read to log its sizes.

## Step Size

`step` sets how far an arrow key moves a handle, 1% by default, and `large-step` how far Shift with an arrow moves it, 10% by default.

```ts title="keyboard.ts"
import "@ui-sdk/web/resizable"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-resizable step="5" large-step="25">
      <ui-resizable-panel default-size="50" min-size="20">
        <h3>Original</h3>
        <span data-slot="hint">v1.2.0</span>
      </ui-resizable-panel>
      <ui-resizable-handle aria-label="Resize original"></ui-resizable-handle>
      <ui-resizable-panel default-size="50" min-size="20">
        <h3>Changes</h3>
        <span data-slot="hint">v1.3.0</span>
      </ui-resizable-panel>
    </ui-resizable>
  `
}

export { mount }
```

Focus the handle between Original and Changes. The arrow keys move it 5%, Shift with an arrow 25%, and Home and End as far as it goes.

## Disabled

`disabled` on a handle fixes it in place. On the group it fixes every handle. Disabled handles leave the tab order, and their panels keep their sizes. A disabled `<fieldset>` around the group fixes every handle too.

```ts title="disabled.ts"
import "@ui-sdk/web/checkbox"
import "@ui-sdk/web/resizable"
import { Check, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <ui-checkbox>
            <ui-checkbox-indicator>
              ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
            </ui-checkbox-indicator>
          </ui-checkbox>
          Lock layout
        </label>
      </div>
      <ui-resizable>
        <ui-resizable-panel min-size="15">
          <h3>Pinned</h3>
          <span data-slot="hint">2 notes</span>
        </ui-resizable-panel>
        <ui-resizable-handle disabled aria-label="Resize pinned"></ui-resizable-handle>
        <ui-resizable-panel min-size="15">
          <h3>Inbox</h3>
          <span data-slot="hint">3 unread</span>
        </ui-resizable-panel>
        <ui-resizable-handle aria-label="Resize inbox"></ui-resizable-handle>
        <ui-resizable-panel min-size="15">
          <h3>Message</h3>
          <span data-slot="hint">From Kofi Mensah</span>
        </ui-resizable-panel>
      </ui-resizable>
    </div>
  `
  const group = root.querySelector("ui-resizable")!
  root
    .querySelector("ui-checkbox")!
    .addEventListener("checkedchange", (event) => {
      group.toggleAttribute("disabled", event.detail.value === true)
    })
}

export { mount }
```

The handle after Pinned stays fixed. Drag the one after Inbox, then check Lock layout to fix it too.

## Custom Rendering

Elements have no render functions. Style each part from its data attributes, like a panel's `data-collapsed` or a handle's `data-dragging`, and read sizes from `--resizable-panel-size` or `layoutchange`, as this example does. See [Parts and Composition](../parts-and-composition.md) for choosing the elements parts bind.

```ts title="render.ts"
import "@ui-sdk/web/resizable"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-resizable>
      <ui-resizable-panel default-size="35" min-size="20" collapsible>
        <h3>Files</h3>
        <span data-slot="hint">35%</span>
      </ui-resizable-panel>
      <ui-resizable-handle aria-label="Resize files"></ui-resizable-handle>
      <ui-resizable-panel min-size="30">
        <h3>Editor</h3>
        <span data-slot="hint">65%</span>
      </ui-resizable-panel>
    </ui-resizable>
  `
  const [files, editor] = root.querySelectorAll("[data-slot=hint]")
  root
    .querySelector("ui-resizable")!
    .addEventListener("layoutchange", (event) => {
      const [filesSize, editorSize] = event.detail.value
      files.textContent =
        filesSize === 0 ? "Collapsed" : `${Math.round(filesSize)}%`
      editor.textContent = `${Math.round(editorSize)}%`
    })
}

export { mount }
```

Resize Files to see both panels report their size, or collapse it to see Collapsed.

The primitive writes drag sizes directly to panel styles. A `layoutchange` listener also runs on every frame of the drag.

## Styling

Parts are unstyled, apart from the layout they need: the group is a flex row or column, panels take their size as a flex basis, and handles don't shrink and take `touch-action: none`. Give the group a size, the handle a width or height and a background, and style it with `data-hovering`, `data-dragging` and `:focus-visible`. While a handle is hovered or dragged, its cursor shows over the whole page, and points the only way it can go at a limit.

Each part has a `data-slot`, such as `resizable-handle`, and its state attributes are listed under [Data Attributes](#data-attributes).

### `<ui-resizable-panel>`
- `--resizable-panel-size`: The panel's share of the group, as a percentage. Written on every frame of a drag, without a render.

## Data Attributes

### `<ui-resizable>`
`[data-slot="resizable"]`

- `data-orientation` (`horizontal`, `vertical`): The group's direction, on every part. A handle's own `aria-orientation` is the other one, since it runs across the group.
- `data-disabled`: Present when the group, or this handle, is disabled.
- `data-dragging`: Present while a handle of the group is being dragged.

### `<ui-resizable-panel>`
`[data-slot="resizable-panel"]`

- `data-orientation` (`horizontal`, `vertical`): The group's direction, on every part. A handle's own `aria-orientation` is the other one, since it runs across the group.
- `data-collapsed`: Present while a collapsible panel is collapsed.

### `<ui-resizable-handle>`
`[data-slot="resizable-handle"]`

- `data-orientation` (`horizontal`, `vertical`): The group's direction, on every part. A handle's own `aria-orientation` is the other one, since it runs across the group.
- `data-disabled`: Present when the group, or this handle, is disabled.
- `data-dragging`: Present while this handle is being dragged.
- `data-hovering`: Present while the pointer is over the handle or within its hit area, which reaches past the handle itself.

## API Reference

Props are attributes in kebab case, like `default-size` and `auto-save-id`. A layout is written as `"30,70"`. `storage` and `controller` are properties. Callbacks are DOM events.

### Resizable

- `layout?` (`number[]`): Each panel's size in percent, in panel order, like `[25, 75]`. Pass it to control the group.
- `defaultLayout?` (`number[]`): The layout at first, when uncontrolled. Panels' own `defaultSize` is what a server renders, so prefer that with server rendering.
- `layoutchange event`: Runs while the layout changes: on every frame of a drag and every key. `details.cancel()` keeps the layout.
- `layoutcommit event`: Runs once an interaction that changed the layout ends: the pointer lifts, the key comes up, or a panel collapses. For saving.
- `orientation?` (`"horizontal" | "vertical"`): The direction panels are laid out in. Horizontal panels sit side by side, vertical ones stack.
- `disabled?` (`boolean`): Stops every handle: no drags, no keys, and handles leave the tab order.
- `step?` (`number`): How far an arrow key moves a handle, in percent.
- `largeStep?` (`number`): How far Shift with an arrow key moves a handle, in percent.
- `autoSaveId?` (`string`): Saves the layout when an interaction completes and restores it on the next visit, under this key. Give panels an `id` so it survives changes elsewhere on the page.
- `storage?` (`ResizableStorage`): Where `autoSaveId` saves: anything with `getItem` and `setItem`, like a cookie store a server can read.
- `controller?` (`object`): Resizes the group from anywhere. Create one with `createResizableController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### ResizablePanel

- `id?` (`string`): Identifies the panel for the controller, `aria-controls` and saved layouts. It's the element's id. Generated when left out.
- `defaultSize?` (`ResizableSize`): Where the panel starts, in percent or with a unit, like `30` or `"240px"`. Without one, panels share what's left evenly. A server renders this size.
- `minSize?` (`ResizableSize`): The smallest the panel gets while open.
- `maxSize?` (`ResizableSize`): The largest the panel gets.
- `collapsible?` (`boolean`): Lets the panel collapse below its minimum to `collapsedSize`: by dragging past half the way there, with Enter or a double-click on its handle, or through the controller.
- `collapsedSize?` (`ResizableSize`): The size a collapsible panel collapses to. At 0, its content leaves the tab order and the accessibility tree.

### ResizableHandle

- `disabled?` (`boolean`): Stops this handle: no drags and no keys, and it leaves the tab order.

### State

The same state shows as data attributes on each element.

- `orientation` (`"horizontal" | "vertical"`): The direction panels are laid out in.
- `disabled` (`boolean`): Whether the group is disabled.
- `dragging` (`boolean`): Whether a handle is being dragged.
- `layout` (`number[]`): Each panel's size in percent. Reading it renders on every frame of a drag.

Panels:

- `orientation` (`"horizontal" | "vertical"`): The direction panels are laid out in.
- `size` (`number`): The panel's size in percent. Reading it renders on every frame of a drag.
- `collapsed` (`boolean`): Whether the panel is down at its `collapsedSize`, below its minimum.
- `collapsible` (`boolean`): Whether the panel can collapse.

Handles:

- `orientation` (`"horizontal" | "vertical"`): The direction panels are laid out in. The separator itself runs across it.
- `disabled` (`boolean`): Whether the handle can't move.
- `dragging` (`boolean`): Whether the handle is being dragged.
- `hovering` (`boolean`): Whether the pointer is over the handle or within its hit area.

### Reasons

`event.detail.reason` says why the layout changed.

- `drag` (`PointerEvent`): A slider thumb or a resize handle was dragged, or an item was dragged to a new place in a list.
- `step-key` (`KeyboardEvent`): Arrow, Page Up, Page Down, Home or End stepped a slider or a number input.
- `collapse` (`MouseEvent | KeyboardEvent`): Enter or a double-click on a resize handle collapsed the panel beside it, or restored it.
- `resize` (`none`): The group changed size, so panels with sizes in pixels moved to stay within their bounds.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods. The `layout` property reads and sets the layout.

Write methods take an optional `{ reason, event }`, fire the change event like a drag, and return `false` when nothing changed or the change was canceled.

- `getLayout()` (`() => number[]`): Each panel's size in percent, in order.
- `setLayout(layout, options?)` (`(layout: number[], options?: ResizableChangeOptions | undefined) => boolean`): Sets every panel's size at once, in percent. It's fitted to the panels' bounds and adds up to 100. Returns whether anything changed.
- `collapse(panel, options?)` (`(panel: string | number, options?: ResizableChangeOptions | undefined) => boolean`): Collapses a collapsible panel, by its id or its index. Returns whether it collapsed.
- `expand(panel, options?)` (`(panel: string | number, options?: ResizableChangeOptions | undefined) => boolean`): Expands a collapsed panel to the size it had before it collapsed, or its minimum. Returns whether it expanded.
- `resize(panel, size, options?)` (`(panel: string | number, size: ResizableSize, options?: ResizableChangeOptions | undefined) => boolean`): Resizes one panel, by its id or its index, like `resize("sidebar", "240px")`. Its neighbours give or take the difference.
- `isCollapsed(panel)` (`(panel: string | number) => boolean`): Whether a panel is collapsed.

### Events

Events fire on their own element and don't bubble, with the layout in `event.detail.value` and the `reason`, `event` and `source` beside it. Calling `preventDefault()` on `layoutchange` cancels the change.

| Member                       | On             | Description                                                 |
| ---------------------------- | -------------- | ----------------------------------------------------------- |
| `layout` property, attribute | `ui-resizable` | The layout. The attribute sets it as text, like `"30,70"`   |
| `api` property               | `ui-resizable` | The [controller](#controller)                               |
| `layoutchange` event         | `ui-resizable` | `detail: { value, reason, event, source }`, on every change |
| `layoutcommit` event         | `ui-resizable` | `detail: { value, reason, event, source }`, once it ends    |

## Accessibility

Handles follow the [WAI-ARIA window splitter pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/). Each is a focusable `separator` whose `aria-valuenow` is the size of the panel before it, with `aria-valuemin` and `aria-valuemax` as far as the panels allow, `aria-controls` pointing at that panel, and `aria-orientation` running across the group. Name each handle with `aria-label`.

### Keyboard

Focus a handle and press the arrow keys along the group's axis to move it by `step`, or with Shift by `large-step`. Home and End move it as far as the panels allow, and Enter collapses or restores a collapsible panel beside it. A panel at its minimum passes the rest of a move on to the next one. Disabled handles leave the tab order.

### Tested Behavior

Every line below is an automated test.

**Keyboard**

- Starts at each panel's default size, and panels without one share the rest.
- ArrowRight grows the panel before the handle by one step, and ArrowLeft shrinks it.
- Shift with an arrow key moves by the large step.
- Arrows across the group's axis do nothing.
- ArrowDown and ArrowUp move a vertical group's handle.
- Home collapses a collapsible panel, and End grows it to its maximum.
- Home stops at the minimum of a panel that can't collapse.
- Enter collapses the panel before the handle, and restores its size.
- Enter collapses the panel after the handle when only that one can collapse.
- One step past a collapsible panel's minimum collapses it.
- A panel at its minimum passes the rest on to the next one.
- End stops where the panels' bounds meet.
- Keys pressed without waiting all land.
- Keys complete the change once they come up.
- Step and large step set how far keys move.
- A canceled change keeps the layout.
- A controlled group follows its layout.
- A controlled group that ignores a change completes nothing. React and Vue only.
- A disabled handle stops a move from the next one, so the panels past it keep their sizes.
- DefaultLayout sets where the panels start.
- A disabled group's handles leave the tab order and ignore drags.

**Pointer**

- Dragging a handle moves it with the pointer.
- A drag reports its moves with the drag reason and completes once.
- Dragging past a disabled handle moves nothing beyond it.
- Dragging a vertical group's handle moves it up and down.
- Dragging past half a collapsible panel's minimum collapses it, and back opens it.
- A drag stops at the panels' bounds.
- A double-click on a handle collapses its panel, and another restores it.
- A press just beside the thin handle drags it.
- A press farther from the handle doesn't drag.
- Where two handles meet, one drag moves both.
- A drag shows the axis cursor over the whole page until it ends.

**Controller**

- Collapses and expands a panel, with the imperative reason.
- Resizes a panel to a size in pixels.

**Container**

- A panel with a minimum in pixels keeps it as the group shrinks.
- Panels keep their share as the group grows.

**Pages around a group**

- A layer above a handle keeps its presses.
- A press beside a handle doesn't click what's under it.
- Only the main button drags.
- An iframe under the pointer doesn't stop a drag.
- At a limit, the cursor points the only way a handle can go.
- A saved layout is there on the first paint.

Runs in React, Vue and web components.
