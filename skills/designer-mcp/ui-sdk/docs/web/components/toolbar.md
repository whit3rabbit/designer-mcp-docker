# Toolbar

Give buttons, toggles, menus and fields one tab stop with arrow-key navigation.

Use a Toolbar to group the controls of an editor, a canvas or a table. Tab enters it once, and the arrow keys move between its buttons, toggles, menus and fields.

```ts title="demo.ts"
import "@ui-sdk/web/toolbar"
import "@ui-sdk/web/toggle"
import { Bold, createElement, Italic, Link, Underline } from "lucide"
import { log } from "./log"

const styles = [
  { label: "Bold", icon: Bold },
  { label: "Italic", icon: Italic },
  { label: "Underline", icon: Underline },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-toolbar aria-label="Formatting">
      ${styles
        .map(
          (style) => `
            <ui-toggle>
              <button aria-label="${style.label}">
                <ui-toggle-icon>${createElement(style.icon, { "aria-hidden": "true" }).outerHTML}</ui-toggle-icon>
              </button>
            </ui-toggle>
          `
        )
        .join("")}
      <ui-toolbar-separator></ui-toolbar-separator>
      <ui-toolbar-button>
        <button aria-label="Insert link">
          ${createElement(Link, { "aria-hidden": "true" }).outerHTML}
        </button>
      </ui-toolbar-button>
    </ui-toolbar>
  `
  root.querySelectorAll("ui-toggle").forEach((toggle, index) => {
    const { label } = styles[index]
    toggle.addEventListener("pressedchange", (event) =>
      log(root, `${label} ${event.detail.value ? "on" : "off"}`)
    )
  })
  root
    .querySelector('[aria-label="Insert link"]')!
    .addEventListener("click", () => log(root, "Insert link"))
}

export { mount }
```

Tab into the toolbar, then use Left and Right to move between Bold, Italic, Underline and Insert link. Press Space to toggle the focused style. The console logs each change.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. Import the toggle, menu, select or number input too if you put one inside. On the server the import does nothing.

```ts
import "@ui-sdk/web/toolbar"
```

## Composition

Use the following composition to build a `ui-toolbar`:

```text
ui-toolbar
├── ui-toolbar-button
│   └── button
├── ui-toolbar-separator
├── ui-toolbar-group
│   ├── ui-toolbar-button
│   │   └── button
│   └── ui-toolbar-button
│       └── button
├── ui-toolbar-link
│   └── a
└── ui-toolbar-input
    └── input
```

Put buttons, links and fields straight inside the toolbar, each in its part: a native `button` in `ui-toolbar-button`, a link in `ui-toolbar-link` and an `input` in `ui-toolbar-input`. `ui-toolbar-group` names a set of related items, and `ui-toolbar-separator` draws a line between sets. Toggles and toggle groups join the toolbar on their own, and menu and select triggers join through `ui-toolbar-button`.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/toolbar"
</script>

<ui-toolbar aria-label="Formatting">
  <ui-toolbar-button><button>Undo</button></ui-toolbar-button>
  <ui-toolbar-button><button>Redo</button></ui-toolbar-button>
  <ui-toolbar-separator></ui-toolbar-separator>
  <ui-toolbar-button><button>Insert Link</button></ui-toolbar-button>
</ui-toolbar>
```

Name the toolbar with `aria-label`, and give every icon-only control its own.

## Toggle Groups

A [Toggle](./toggle.md) group inside a toolbar joins its navigation instead of adding another tab stop. Arrow keys move focus without pressing anything; Enter or Space presses the focused toggle.

```ts title="toggle-group.ts"
import "@ui-sdk/web/toolbar"
import "@ui-sdk/web/toggle"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  createElement,
  List,
  ListOrdered,
} from "lucide"
import { log } from "./log"

const alignments = [
  { value: "left", label: "Align left", icon: AlignLeft },
  { value: "center", label: "Align center", icon: AlignCenter },
  { value: "right", label: "Align right", icon: AlignRight },
]

const lists = [
  { value: "bulleted", label: "Bulleted list", icon: List },
  { value: "numbered", label: "Numbered list", icon: ListOrdered },
]

const toggles = (items: typeof alignments) =>
  items
    .map(
      (item) => `
        <ui-toggle value="${item.value}">
          <button aria-label="${item.label}">
            <ui-toggle-icon>${createElement(item.icon, { "aria-hidden": "true" }).outerHTML}</ui-toggle-icon>
          </button>
        </ui-toggle>
      `
    )
    .join("")

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-toolbar aria-label="Paragraph">
      <ui-toggle-group default-value="left" deselectable="false" aria-label="Alignment">
        ${toggles(alignments)}
      </ui-toggle-group>
      <ui-toolbar-separator></ui-toolbar-separator>
      <ui-toggle-group aria-label="List">
        ${toggles(lists)}
      </ui-toggle-group>
    </ui-toolbar>
  `
  const [alignment, list] = root.querySelectorAll("ui-toggle-group")
  alignment.addEventListener("valuechange", (event) =>
    log(root, `Align ${event.detail.value[0]}`)
  )
  list.addEventListener("valuechange", (event) => {
    const [value] = event.detail.value
    log(root, lists.find((list) => list.value === value)?.label ?? "No list")
  })
}

export { mount }
```

Arrow from the alignment group to the list group, then press Space on Align center or Numbered list. The console logs each choice.

## Groups

Use `ui-toolbar-group` to name related controls. Set `disabled` on the group to disable them together; they stay focusable with `aria-disabled`.

```ts title="group.ts"
import "@ui-sdk/web/toolbar"
import { Clipboard, Copy, createElement, Redo, Scissors, Undo } from "lucide"
import { log } from "./log"

const clipboard = [
  { label: "Cut", icon: Scissors },
  { label: "Copy", icon: Copy },
  { label: "Paste", icon: Clipboard },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-toolbar aria-label="Edit">
      <ui-toolbar-group aria-label="Clipboard">
        ${clipboard
          .map(
            (action) => `
              <ui-toolbar-button>
                <button aria-label="${action.label}">
                  ${createElement(action.icon, { "aria-hidden": "true" }).outerHTML}
                </button>
              </ui-toolbar-button>
            `
          )
          .join("")}
      </ui-toolbar-group>
      <ui-toolbar-separator></ui-toolbar-separator>
      <ui-toolbar-group disabled aria-label="History">
        <ui-toolbar-button>
          <button aria-label="Undo">
            ${createElement(Undo, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-toolbar-button>
        <ui-toolbar-button>
          <button aria-label="Redo">
            ${createElement(Redo, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-toolbar-button>
      </ui-toolbar-group>
    </ui-toolbar>
  `
  root
    .querySelectorAll('[aria-label="Clipboard"] button')
    .forEach((button, index) => {
      button.addEventListener("click", () => log(root, clipboard[index].label))
    })
}

export { mount }
```

Move through Cut, Copy and Paste into History with the arrow keys. Undo and Redo stay focusable but do nothing.

## Menus

Wrap a [Menu](./menu.md) trigger in `ui-toolbar-button`. In a horizontal toolbar, Down opens the menu while Left and Right keep moving between toolbar items.

```html
<ui-menu>
  <ui-toolbar-button>
    <ui-menu-trigger><button>Share</button></ui-menu-trigger>
  </ui-toolbar-button>
  <ui-menu-content>…</ui-menu-content>
</ui-menu>
```

```ts title="menu.ts"
import "@ui-sdk/web/toolbar"
import "@ui-sdk/web/menu"
import { ChevronDown, createElement } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-toolbar aria-label="Document">
      <ui-toolbar-button>
        <button data-action="save">Save</button>
      </ui-toolbar-button>
      <ui-menu>
        <ui-toolbar-button>
          <ui-menu-trigger>
            <button>
              Share
              ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-menu-trigger>
        </ui-toolbar-button>
        <ui-menu-content>
          <ui-menu-item value="email">Email</ui-menu-item>
          <ui-menu-item value="link">Copy Link</ui-menu-item>
        </ui-menu-content>
      </ui-menu>
      <ui-toolbar-button>
        <button data-action="print">Print</button>
      </ui-toolbar-button>
    </ui-toolbar>
  `
  root
    .querySelector("[data-action=save]")!
    .addEventListener("click", () => log(root, "Saved"))
  root
    .querySelector("ui-menu")!
    .addEventListener("action", (event) =>
      log(root, `Shared by ${event.detail.value}`)
    )
  root
    .querySelector("[data-action=print]")!
    .addEventListener("click", () => log(root, "Printed"))
}

export { mount }
```

Focus Share and press Down, then choose Email or Copy Link. Escape closes the menu and returns focus to Share.

## Selects

A [Select](./select.md) trigger joins the same way. It keeps its select behavior while it takes part in the toolbar's focus order.

```ts title="select.ts"
import "@ui-sdk/web/toolbar"
import "@ui-sdk/web/select"
import { Check, ChevronsUpDown, createElement, ZoomIn, ZoomOut } from "lucide"
import { log } from "./log"

const zooms = ["50%", "75%", "100%", "150%", "200%"]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-toolbar aria-label="View">
      <ui-toolbar-button data-action="zoom-out">
        <button aria-label="Zoom out">
          ${createElement(ZoomOut, { "aria-hidden": "true" }).outerHTML}
        </button>
      </ui-toolbar-button>
      <ui-select default-value="100%">
        <ui-toolbar-button>
          <ui-select-trigger>
            <button aria-label="Zoom">
              <ui-select-value></ui-select-value>
              ${createElement(ChevronsUpDown, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-select-trigger>
        </ui-toolbar-button>
        <ui-select-content>
          ${zooms
            .map(
              (zoom) => `
                <ui-select-item value="${zoom}">
                  ${zoom}
                  <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
                </ui-select-item>
              `
            )
            .join("")}
        </ui-select-content>
      </ui-select>
      <ui-toolbar-button data-action="zoom-in">
        <button aria-label="Zoom in">
          ${createElement(ZoomIn, { "aria-hidden": "true" }).outerHTML}
        </button>
      </ui-toolbar-button>
    </ui-toolbar>
  `
  const select = root.querySelector("ui-select")!
  const zoomOut = root.querySelector("[data-action=zoom-out]")!
  const zoomIn = root.querySelector("[data-action=zoom-in]")!
  const change = (value: string) => {
    const index = zooms.indexOf(value)
    zoomOut.toggleAttribute("disabled", index === 0)
    zoomIn.toggleAttribute("disabled", index === zooms.length - 1)
    log(root, `Zoom ${value}`)
  }
  const step = (by: number) => {
    const value = zooms[zooms.indexOf(select.value as string) + by]
    select.value = value
    change(value)
  }
  zoomOut.addEventListener("click", () => step(-1))
  zoomIn.addEventListener("click", () => step(1))
  select.addEventListener("valuechange", (event) => {
    const value = event.detail.value as string | null
    if (value) {
      change(value)
    }
  })
}

export { mount }
```

Open Zoom and choose a value, or step it with Zoom out and Zoom in. Each button turns off at the end of the range.

## Fields

Wrap a text field in `ui-toolbar-input`, or another field's control, like a [Number Input](./number-input.md) control. A field keeps Home, End and the arrow keys while they move its caret. At the matching end, with no text selected, an arrow moves to the next item.

Entering a field with an arrow puts its caret at the far end in that direction: press the same arrow again to leave, or the other arrow to edit. A number input keeps Up and Down for stepping its value.

```ts title="input.ts"
import "@ui-sdk/web/toolbar"
import "@ui-sdk/web/number-input"
import { createElement, Minus, Plus } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-toolbar aria-label="Text">
      <ui-number-input default-value="14" min="8" max="72">
        <ui-number-input-group>
          <ui-number-input-decrement>
            <button aria-label="Decrease font size">
              ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-number-input-decrement>
          <ui-toolbar-input>
            <ui-number-input-control>
              <input aria-label="Font size" />
            </ui-number-input-control>
          </ui-toolbar-input>
          <ui-number-input-increment>
            <button aria-label="Increase font size">
              ${createElement(Plus, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-number-input-increment>
        </ui-number-input-group>
      </ui-number-input>
      <ui-toolbar-separator></ui-toolbar-separator>
      <ui-toolbar-input>
        <input aria-label="Find" placeholder="Find…" />
      </ui-toolbar-input>
    </ui-toolbar>
  `
}

export { mount }
```

Move into Font size and press Up or Down to change it. In Find, type a word, then move the caret to an edge before that arrow leaves the field.

## Links

`ui-toolbar-link` joins the same focus order and keeps its link behavior. The demo handles a plain click itself and leaves modified clicks, like opening in a new tab, to the browser.

```ts title="link.ts"
import "@ui-sdk/web/toolbar"
import { Check, createElement, MessageSquare } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-toolbar aria-label="Pull request">
      <ui-toolbar-button>
        <button aria-label="Approve">
          ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
        </button>
      </ui-toolbar-button>
      <ui-toolbar-button>
        <button aria-label="Comment">
          ${createElement(MessageSquare, { "aria-hidden": "true" }).outerHTML}
        </button>
      </ui-toolbar-button>
      <ui-toolbar-separator></ui-toolbar-separator>
      <ui-toolbar-link>
        <a href="#files">Files Changed</a>
      </ui-toolbar-link>
      <ui-toolbar-link>
        <a href="#checks">Checks</a>
      </ui-toolbar-link>
    </ui-toolbar>
  `
  root
    .querySelector('[aria-label="Approve"]')!
    .addEventListener("click", () => log(root, "Approved"))
  root
    .querySelector('[aria-label="Comment"]')!
    .addEventListener("click", () => log(root, "Comment"))
  for (const link of root.querySelectorAll("a")) {
    link.addEventListener("click", (event) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }
      event.preventDefault()
      log(root, `Opened ${link.textContent}`)
    })
  }
}

export { mount }
```

Arrow to Files Changed and press Enter. The console logs the page it opened.

## Vertical

Set `orientation="vertical"` to move with Up and Down, like a canvas tool palette. Separators turn to run across the toolbar.

```ts title="vertical.ts"
import "@ui-sdk/web/toolbar"
import "@ui-sdk/web/toggle"
import {
  createElement,
  MousePointer2,
  Pencil,
  Square,
  Trash2,
  Type,
} from "lucide"
import { log } from "./log"

const tools = [
  { value: "select", label: "Select", icon: MousePointer2 },
  { value: "draw", label: "Draw", icon: Pencil },
  { value: "shape", label: "Shape", icon: Square },
  { value: "text", label: "Text", icon: Type },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-toolbar orientation="vertical" aria-label="Canvas">
      <ui-toggle-group default-value="select" deselectable="false" orientation="vertical" aria-label="Tool">
        ${tools
          .map(
            (tool) => `
              <ui-toggle value="${tool.value}">
                <button aria-label="${tool.label}">
                  <ui-toggle-icon>${createElement(tool.icon, { "aria-hidden": "true" }).outerHTML}</ui-toggle-icon>
                </button>
              </ui-toggle>
            `
          )
          .join("")}
      </ui-toggle-group>
      <ui-toolbar-separator></ui-toolbar-separator>
      <ui-toolbar-button>
        <button aria-label="Delete">
          ${createElement(Trash2, { "aria-hidden": "true" }).outerHTML}
        </button>
      </ui-toolbar-button>
    </ui-toolbar>
  `
  root
    .querySelector("ui-toggle-group")!
    .addEventListener("valuechange", (event) => {
      const [value] = event.detail.value
      log(root, `${tools.find((tool) => tool.value === value)?.label} tool`)
    })
  root
    .querySelector('[aria-label="Delete"]')!
    .addEventListener("click", () => log(root, "Deleted selection"))
}

export { mount }
```

Use Up and Down to move between the tools and Delete. Space picks the focused tool.

## Disabled

A disabled item stays reachable with `aria-disabled`, so people can find it, but it ignores presses, including keys meant for a component wrapped in it. Set `focusable-when-disabled="false"` to skip it instead.

```ts title="disabled.ts"
import "@ui-sdk/web/toolbar"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-toolbar aria-label="Message">
      <ui-toolbar-button>
        <button>Reply</button>
      </ui-toolbar-button>
      <ui-toolbar-button disabled>
        <button>Archive</button>
      </ui-toolbar-button>
      <ui-toolbar-button disabled focusable-when-disabled="false">
        <button>Delete</button>
      </ui-toolbar-button>
    </ui-toolbar>
  `
  for (const button of root.querySelectorAll("button")) {
    button.addEventListener("click", () => log(root, button.textContent!))
  }
}

export { mount }
```

Arrow from Reply to Archive, which is disabled but focusable. Delete is skipped. Only Reply logs a press.

Set `disabled` on the toolbar to disable every item. The toolbar keeps its tab stop, and its fields can't be edited.

```html
<ui-toolbar disabled aria-label="Formatting">
  <ui-toolbar-button><button>Bold</button></ui-toolbar-button>
  <ui-toolbar-input><input aria-label="Find" /></ui-toolbar-input>
</ui-toolbar>
```

## Loop

Arrow keys wrap from the last item to the first by default. Set `loop="false"` to stop at the ends.

```ts title="loop.ts"
import "@ui-sdk/web/toolbar"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-toolbar loop="false" aria-label="Pages">
      ${["First", "Previous", "Next", "Last"]
        .map(
          (label) => `
            <ui-toolbar-button>
              <button>${label}</button>
            </ui-toolbar-button>
          `
        )
        .join("")}
    </ui-toolbar>
  `
  for (const button of root.querySelectorAll("button")) {
    button.addEventListener("click", () =>
      log(root, `${button.textContent} page`)
    )
  }
}

export { mount }
```

Focus Last and press Right. Focus stays there; Home still moves to First.

## Controller

The toolbar element's `api` property is its controller. Its `focus()` moves focus to the item focused last, like the Alt+F10 shortcut editors give their toolbars.

```ts title="controller.ts"
import "@ui-sdk/web/toolbar"
import { registerShortcut } from "@ui-sdk/web"
import { Bold, createElement, Italic, Link } from "lucide"
import { log } from "./log"

const actions = [
  { label: "Bold", icon: Bold },
  { label: "Italic", icon: Italic },
  { label: "Insert link", icon: Link },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Focus Toolbar</button>
      </div>
      <ui-toolbar aria-label="Notes formatting">
        ${actions
          .map(
            (action) => `
              <ui-toolbar-button>
                <button aria-label="${action.label}">
                  ${createElement(action.icon, { "aria-hidden": "true" }).outerHTML}
                </button>
              </ui-toolbar-button>
            `
          )
          .join("")}
      </ui-toolbar>
      <textarea aria-label="Notes" placeholder="Type, then press Alt+F10"></textarea>
    </div>
  `
  const toolbar = root.querySelector("ui-toolbar")!
  root
    .querySelector('[data-slot="controls"] button')!
    .addEventListener("click", () => toolbar.api.focus())
  toolbar.querySelectorAll("button").forEach((button, index) => {
    button.addEventListener("click", () => log(root, actions[index].label))
  })
  return registerShortcut("alt+f10", () => toolbar.api.focus(), {
    allowInInput: true,
  })
}

export { mount }
```

Type in Notes, then press Alt+F10 or choose Focus Toolbar. Press a toolbar button and the console logs it.

## Custom Rendering

Wrap a component's trigger or control in `ui-toolbar-button` or `ui-toolbar-input` to combine their behavior, as the menu, select and number input examples do. The toolbar part finds the native button or field inside and adds its behavior to that same element. [Parts and Composition](../parts-and-composition.md) explains the rendering contract.

## Styling

Use `data-orientation` on the root for a row or a column, and on a separator for the way its line runs, across the toolbar. Use `data-disabled` to style unavailable items and groups. Toggles inside keep their own `data-pressed`.

Each part has a `data-slot`, such as `toolbar-button`, and its state attributes are listed under [Data Attributes](#data-attributes). An item's attributes land on its button, link or field.

## Data Attributes

### `<ui-toolbar>`
`[data-slot="toolbar"]`

- `data-orientation` (`horizontal`, `vertical`): The toolbar's orientation. On a separator, which way the line runs: across the toolbar.
- `data-disabled`: Present when disabled, by the item itself, its group or the toolbar.

### `<ui-toolbar-button>`
`[data-slot="toolbar-button"]`

- `data-disabled`: Present when disabled, by the item itself, its group or the toolbar.
- `data-orientation` (`horizontal`, `vertical`): The toolbar's orientation. On a separator, which way the line runs: across the toolbar.

### `<ui-toolbar-link>`
`[data-slot="toolbar-link"]`

- `data-disabled`: Present when disabled, by the item itself, its group or the toolbar.
- `data-orientation` (`horizontal`, `vertical`): The toolbar's orientation. On a separator, which way the line runs: across the toolbar.

### `<ui-toolbar-input>`
`[data-slot="toolbar-input"]`

- `data-disabled`: Present when disabled, by the item itself, its group or the toolbar.
- `data-orientation` (`horizontal`, `vertical`): The toolbar's orientation. On a separator, which way the line runs: across the toolbar.

### `<ui-toolbar-group>`
`[data-slot="toolbar-group"]`

- `data-disabled`: Present when disabled, by the item itself, its group or the toolbar.
- `data-orientation` (`horizontal`, `vertical`): The toolbar's orientation. On a separator, which way the line runs: across the toolbar.

### `<ui-toolbar-separator>`
`[data-slot="toolbar-separator"]`

- `data-orientation` (`horizontal`, `vertical`): The toolbar's orientation. On a separator, which way the line runs: across the toolbar.

## API Reference

Props are attributes in kebab case, like `focusable-when-disabled`: `"false"` is false, as in `loop="false"`.

### Toolbar

- `orientation?` (`ToolbarOrientation`): Which arrow keys move between items: left and right, or up and down.
- `loop?` (`boolean`): Whether arrow keys wrap from the last item to the first.
- `disabled?` (`boolean`): Stops every item from being used. Items stay focusable with `aria-disabled`, so the toolbar keeps its tab stop and stays discoverable.
- `controller?` (`{ focus: () => void; }`): Focuses the toolbar from anywhere. Create one with `createToolbarController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### ToolbarButton

- `disabled?` (`boolean`): Stops the item from being used. It stays focusable with `aria-disabled`, so arrow keys still reach it and a tooltip can say why.
- `focusableWhenDisabled?` (`boolean`): Whether a disabled item stays reachable with arrow keys. Turn it off to skip it, natively disabled.

### ToolbarInput

- `disabled?` (`boolean`): Stops the item from being used. It stays focusable with `aria-disabled`, so arrow keys still reach it and a tooltip can say why.
- `focusableWhenDisabled?` (`boolean`): Whether a disabled item stays reachable with arrow keys. Turn it off to skip it, natively disabled.

### ToolbarGroup

- `disabled?` (`boolean`): Disables every item in the group. They stay focusable with `aria-disabled`.

`ui-toolbar-link` and `ui-toolbar-separator` take no props of their own.

### State

The same state shows as data attributes on the button inside `ui-toolbar-button`:

- `disabled` (`boolean`): Whether the item is disabled, by itself, its group or the toolbar.
- `orientation` (`ToolbarOrientation`): The toolbar's `orientation` option: `"vertical"`, or `"horizontal"` for anything else.

### Controller

The element's `api` property has the same methods.

- `focus()` (`() => void`): Moves focus to the item that holds the toolbar's tab stop: the one focused last, or the first.

## Accessibility

The toolbar follows the [WAI-ARIA toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/). The root has the `toolbar` role and `aria-orientation`, and separators have the `separator` role.

### Keyboard

The toolbar has one tab stop, a roving focus. Tab enters on the first enabled item, then returns to the item focused last. The next Tab leaves the toolbar.

| Key                        | Action                                          |
| -------------------------- | ----------------------------------------------- |
| `ArrowRight` / `ArrowLeft` | Move focus in a horizontal toolbar              |
| `ArrowDown` / `ArrowUp`    | Move focus in a vertical toolbar                |
| `Home` / `End`             | Focus the first or last item, except in a field |
| `Enter` / `Space`          | Activate a button or toggle, or open its popup  |

Controls keep the keys they use: Down opens a menu, and Up and Down step a number input. Moving focus never presses a toggle. In right-to-left text, Left and Right swap.

### Tested Behavior

Every line below is an automated test.

- The toolbar is named and has a horizontal orientation.
- Tab lands on the first item, and Tab again leaves the toolbar.
- Shift+Tab from after the toolbar lands on its tab stop.
- ArrowRight moves through every item, into toggle groups and out of fields.
- ArrowRight on the last item wraps to the first, and ArrowLeft back.
- Arrow keys never press a toggle, and Space and Enter do.
- Tab comes back to the item focused last.
- A toggle group in the toolbar is no tab stop of its own.
- A disabled button stays reachable, says it's disabled and does nothing.
- A button runs its action when pressed.
- A menu trigger rendered through a button opens with ArrowDown, and arrows still move past it.
- Choosing from a menu in the toolbar returns focus to its trigger.
- A text field keeps Home and End for its caret.
- Up and Down step a number field in the toolbar.
- Separators run across the toolbar.
- A group of buttons is named.
- A link in the toolbar follows its href with Enter.
- With loop off, arrows stop at the ends.
- A disabled toolbar keeps one tab stop, and every item says it's disabled.

**Vertical**

- ArrowDown and ArrowUp move between items, and Left and Right don't.
- Separators run across a vertical toolbar.

**Disabled groups**

- Toggles and toggle groups in a disabled group are disabled.
- A link in a disabled group is disabled, and follows its href once enabled.
- Enabling a group enables the toggles and buttons in it.

Runs in React, Vue and web components.
