# Menu

Choose actions and settings from a button or a context menu.

Start with a trigger and a few actions. Add groups, checkboxes, radio choices, or submenus as the task grows. The menu handles focus, arrow keys, typeahead, and dismissal.

<ComponentExample
  name="menu/basic"
  inspect
  caption="Press Open Menu and choose an item, with the pointer or the arrow keys and Enter. The menu closes and the console logs your choice."
/>

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

## Composition

Use the following composition to build a `ui-menu`:

```text
ui-menu
├── ui-menu-trigger
│   └── button
└── ui-menu-content
    ├── ui-menu-item
    └── ui-menu-item
```

Give items a `value` and handle the menu’s `action` event to run the selected command. A Group and GroupLabel can organize related actions; a Separator divides them without becoming a focus stop.

Pass a promise to `event.detail.waitUntil()` in the menu’s `action` listener or an item’s `select` listener to keep the item pending. It gets `data-pending`, `aria-busy` and `aria-disabled`, the menu stays open, and choosing it again does nothing until the promise settles. The menu closes once it resolves. A rejection keeps it open and puts the reason in the item’s `error` state until the next try. After a second, screen readers hear the `pending-announcement` attribute, “Loading” by default.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/menu"
</script>

<ui-menu>
  <ui-menu-trigger>
    <button>Actions</button>
  </ui-menu-trigger>
  <ui-menu-content>
    <ui-menu-item value="rename">Rename</ui-menu-item>
    <ui-menu-item value="duplicate">Duplicate</ui-menu-item>
  </ui-menu-content>
</ui-menu>
```

## Submenus

Nest a Sub, SubTrigger, and SubContent to add another level. Hover or press the arrow key toward a submenu to open it. The menu lets a pointer travel diagonally into the submenu without accidentally choosing an item it passes over. Escape closes only the submenu and returns focus to its trigger, as the menu pattern asks.

```ts title="submenu.ts"
import "@ui-sdk/web/menu"
import { ChevronRight, createElement } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-menu>
      <ui-menu-trigger>
        <button>Edit</button>
      </ui-menu-trigger>
      <ui-menu-content>
        <ui-menu-item value="undo" shortcut="mod+z">Undo</ui-menu-item>
        <ui-menu-item value="redo" shortcut="mod+shift+z">Redo</ui-menu-item>
        <ui-menu-separator></ui-menu-separator>
        <ui-menu-sub>
          <ui-menu-sub-trigger>
            Find
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </ui-menu-sub-trigger>
          <ui-menu-sub-content>
            <ui-menu-item value="find" shortcut="mod+f">Find…</ui-menu-item>
            <ui-menu-item value="find-next" shortcut="mod+g">Find next</ui-menu-item>
            <ui-menu-item value="find-previous" shortcut="mod+shift+g">Find previous</ui-menu-item>
          </ui-menu-sub-content>
        </ui-menu-sub>
        <ui-menu-sub>
          <ui-menu-sub-trigger>
            Transform
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </ui-menu-sub-trigger>
          <ui-menu-sub-content>
            <ui-menu-sub>
              <ui-menu-sub-trigger>
                Case
                ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
              </ui-menu-sub-trigger>
              <ui-menu-sub-content>
                <ui-menu-item value="uppercase">Uppercase</ui-menu-item>
                <ui-menu-item value="lowercase">Lowercase</ui-menu-item>
              </ui-menu-sub-content>
            </ui-menu-sub>
            <ui-menu-item value="trim">Trim whitespace</ui-menu-item>
          </ui-menu-sub-content>
        </ui-menu-sub>
      </ui-menu-content>
    </ui-menu>
  `
  root
    .querySelector("ui-menu")!
    .addEventListener("action", (event) =>
      log(root, `Chose ${event.detail.value}`)
    )
}

export { mount }
```

Open Edit, then Find or Transform. Use the arrows to enter and leave each level; choosing an action closes the menu tree.

## Shortcuts

An item’s `shortcut` displays a platform-specific hint and sets `aria-keyshortcuts`. `mod+s` reads as Command+S on Apple platforms and Control+S elsewhere.

In markup, this is a hint: your app owns the key handler. [Data menus](#menus-as-data) also register their shortcuts while closed. Letters and digits match physical keys, including combinations such as Option+N.

```ts title="shortcuts.ts"
import "@ui-sdk/web/menu"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-menu>
      <ui-menu-trigger>
        <button>File</button>
      </ui-menu-trigger>
      <ui-menu-content>
        <ui-menu-item value="new-tab" shortcut="mod+t">New tab</ui-menu-item>
        <ui-menu-item value="new-window" shortcut="mod+n">New window</ui-menu-item>
        <ui-menu-item value="open" shortcut="mod+o">Open…</ui-menu-item>
        <ui-menu-separator></ui-menu-separator>
        <ui-menu-item value="save" shortcut="mod+s">Save</ui-menu-item>
        <ui-menu-item value="save-as" shortcut="mod+shift+s">Save as…</ui-menu-item>
        <ui-menu-separator></ui-menu-separator>
        <ui-menu-item value="print" shortcut="mod+p">Print…</ui-menu-item>
      </ui-menu-content>
    </ui-menu>
  `
  root
    .querySelector("ui-menu")!
    .addEventListener("action", (event) =>
      log(root, `Chose ${event.detail.value}`)
    )
}

export { mount }
```

Open File to see shortcut hints for your platform. Choose an item to report its action; this markup example does not register global shortcuts.

## Icons

Put decorative icons in ItemIcon so screen readers and typeahead ignore them. `mirror` flips a directional icon in right-to-left text. An icon-only item still needs an `aria-label`.

`data-has-icon` on items and `data-has-icons` on the menu let text line up when only some items have icons.

```ts title="icons.ts"
import "@ui-sdk/web/menu"
import { Code, createElement, Download, Link, Mail, Reply, Share } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-menu>
      <ui-menu-trigger>
        <button>
          ${createElement(Share, { "aria-hidden": "true" }).outerHTML}
          Share
        </button>
      </ui-menu-trigger>
      <ui-menu-content>
        <ui-menu-item value="copy-link">
          <ui-menu-item-icon>
            ${createElement(Link, { "aria-hidden": "true" }).outerHTML}
          </ui-menu-item-icon>
          Copy link
        </ui-menu-item>
        <ui-menu-item value="email">
          <ui-menu-item-icon>
            ${createElement(Mail, { "aria-hidden": "true" }).outerHTML}
          </ui-menu-item-icon>
          Email
        </ui-menu-item>
        <ui-menu-item value="reply">
          <ui-menu-item-icon mirror>
            ${createElement(Reply, { "aria-hidden": "true" }).outerHTML}
          </ui-menu-item-icon>
          Reply
        </ui-menu-item>
        <ui-menu-separator></ui-menu-separator>
        <ui-menu-item value="download">
          <ui-menu-item-icon>
            ${createElement(Download, { "aria-hidden": "true" }).outerHTML}
          </ui-menu-item-icon>
          Download
        </ui-menu-item>
        <ui-menu-item value="embed">
          <ui-menu-item-icon>
            ${createElement(Code, { "aria-hidden": "true" }).outerHTML}
          </ui-menu-item-icon>
          Embed
        </ui-menu-item>
      </ui-menu-content>
    </ui-menu>
  `
  root
    .querySelector("ui-menu")!
    .addEventListener("action", (event) =>
      log(root, `Chose ${event.detail.value}`)
    )
}

export { mount }
```

Open Share and type an item’s name. The icons aren’t part of the item’s accessible name or the text typeahead matches.

## Checkboxes

Checkbox items toggle independently and stay open by default. Listen for `checkedchange`; set `checked` to control the item, or use `default-checked` for its initial state. An ItemIndicator renders the check; `keep-mounted` preserves its space while unchecked. Style `data-checked` and `data-unchecked` for each state.

```ts title="checkboxes.ts"
import "@ui-sdk/web/menu"
import { Check, createElement } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-menu>
      <ui-menu-trigger>
        <button>View</button>
      </ui-menu-trigger>
      <ui-menu-content>
        <ui-menu-group>
          <ui-menu-group-label>Appearance</ui-menu-group-label>
          <ui-menu-checkbox-item value="status-bar" default-checked>
            <ui-menu-item-indicator keep-mounted>
              ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
            </ui-menu-item-indicator>
            Status bar
          </ui-menu-checkbox-item>
          <ui-menu-checkbox-item value="minimap">
            <ui-menu-item-indicator keep-mounted>
              ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
            </ui-menu-item-indicator>
            Minimap
          </ui-menu-checkbox-item>
        </ui-menu-group>
        <ui-menu-separator></ui-menu-separator>
        <ui-menu-checkbox-item value="line-numbers" default-checked>
          <ui-menu-item-indicator keep-mounted>
            ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
          </ui-menu-item-indicator>
          Line numbers
        </ui-menu-checkbox-item>
        <ui-menu-checkbox-item value="word-wrap">
          <ui-menu-item-indicator keep-mounted>
            ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
          </ui-menu-item-indicator>
          Word wrap
        </ui-menu-checkbox-item>
      </ui-menu-content>
    </ui-menu>
  `
  for (const item of root.querySelectorAll("ui-menu-checkbox-item")) {
    item.addEventListener("checkedchange", (event) => {
      log(root, `${item.value} ${event.detail.value ? "on" : "off"}`)
    })
  }
}

export { mount }
```

Open View and toggle Status bar or Minimap. The menu stays open so you can change several settings, and the console logs each one.

## Radio Group

Radio items choose one value in their group and stay open by default. Listen for `valuechange`; set `value` to control the group, or use `default-value` for its initial state. Give the group a `name` when it should identify itself in the menu’s value-change callback.

```ts title="radio-group.ts"
import "@ui-sdk/web/menu"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-menu>
      <ui-menu-trigger>
        <button>Panel</button>
      </ui-menu-trigger>
      <ui-menu-content>
        <ui-menu-radio-group name="position" default-value="bottom">
          <ui-menu-group-label>Position</ui-menu-group-label>
          ${["Top", "Bottom", "Right"]
            .map(
              (option) => `
                <ui-menu-radio-item value="${option.toLowerCase()}">
                  <ui-menu-item-indicator></ui-menu-item-indicator>
                  ${option}
                </ui-menu-radio-item>
              `
            )
            .join("")}
        </ui-menu-radio-group>
        <ui-menu-separator></ui-menu-separator>
        <ui-menu-radio-group default-value="comfortable">
          <ui-menu-group-label>Density</ui-menu-group-label>
          ${["Compact", "Comfortable"]
            .map(
              (option) => `
                <ui-menu-radio-item value="${option.toLowerCase()}">
                  <ui-menu-item-indicator></ui-menu-item-indicator>
                  ${option}
                </ui-menu-radio-item>
              `
            )
            .join("")}
        </ui-menu-radio-group>
      </ui-menu-content>
    </ui-menu>
  `
  const [position, density] = root.querySelectorAll("ui-menu-radio-group")
  position.addEventListener("valuechange", (event) =>
    log(root, `Panel at the ${event.detail.value}`)
  )
  density.addEventListener("valuechange", (event) =>
    log(root, `${event.detail.value} density`)
  )
}

export { mount }
```

Open Panel and choose a position. Only one item in each group is checked, the menu stays open, and the console logs the change.

## Context Menu

A ContextTrigger opens at a right-click or long press. Give the area a tab stop so Shift+F10 and the context-menu key can open it from the keyboard. Right-clicking elsewhere in the same area repositions an open menu.

Set `disabled` to leave that area’s native browser menu available. Context triggers can pass a payload too.

```ts title="context-menu.ts"
import "@ui-sdk/web/menu"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-menu>
      <ui-menu-context-trigger tabindex="0">Right-click or long-press here</ui-menu-context-trigger>
      <ui-menu-content>
        <ui-menu-item value="back">Back</ui-menu-item>
        <ui-menu-item value="forward" disabled>Forward</ui-menu-item>
        <ui-menu-item value="reload">Reload</ui-menu-item>
        <ui-menu-separator></ui-menu-separator>
        <ui-menu-item value="save">Save page as…</ui-menu-item>
        <ui-menu-item value="print">Print…</ui-menu-item>
      </ui-menu-content>
    </ui-menu>
  `
  root
    .querySelector("ui-menu")!
    .addEventListener("action", (event) =>
      log(root, `Chose ${event.detail.value}`)
    )
}

export { mount }
```

Right-click or long-press the area, or focus it and press Shift+F10. Choose an action and the console logs it.

## Placement

`side` and `align` choose the starting position. The menu flips or shifts when it does not fit; `data-side` reports where it ended up. Logical alignment and submenu keys follow the surrounding text direction. See the shared [popup guide](../popups.md) for the positioning contract.

```html
<ui-menu-content side="right" align="start"></ui-menu-content>
```

## Offsets and Collision Padding

`side-offset` sets the gap, `align-offset` shifts along the anchor, and `collision-padding` leaves room around the viewport. Use `--anchor-width` to match the trigger's width and `--available-height` to scroll a long list.

```html
<ui-menu-content
  side-offset="8"
  align-offset="-4"
  collision-padding="24"
></ui-menu-content>
```

## Modal

The default `modal="pointer"` consumes an outside press while closing the menu. `true` also locks scrolling and makes the page inert. `false` lets the outside press reach its target after closing.

```html
<ui-menu modal="false">
  <ui-menu-trigger>
    <button>Actions</button>
  </ui-menu-trigger>
  <ui-menu-content></ui-menu-content>
</ui-menu>
```

## Submenu Delay

`delay` is the hover wait in milliseconds, 100 by default. It applies to the submenus directly inside that menu. Set it on a Sub to change the delay for the next level.

```html
<ui-menu delay="300">
  <ui-menu-trigger>
    <button>File</button>
  </ui-menu-trigger>
  <ui-menu-content>
    <ui-menu-sub delay="0">
      <ui-menu-sub-trigger>Open recent</ui-menu-sub-trigger>
      <ui-menu-sub-content></ui-menu-sub-content>
    </ui-menu-sub>
  </ui-menu-content>
</ui-menu>
```

## Keyboard Navigation

Arrow keys wrap by default; `loop` false stops at the ends. Typing finds an item by name. If an item has extra descriptive text, set `label` to the text typeahead should match. `label` does not replace its accessible name; use `aria-label` for that.

```html
<ui-menu loop="false">
  <ui-menu-trigger>
    <button>Status</button>
  </ui-menu-trigger>
  <ui-menu-content>
    <ui-menu-item value="busy" label="Do not disturb">
      Do not disturb
      <span>Notifications are muted</span>
    </ui-menu-item>
  </ui-menu-content>
</ui-menu>
```

## Focus After Closing

When the menu closes with focus inside it, focus returns to the trigger. If an action removes the trigger or moves people on to something else, set `final-focus` on the content to a selector, or to `"none"` to leave focus where the action put it. See [popup focus](../popups.md#focus) for the shared focus rules.

```html
<ui-menu-content final-focus="#file-list"></ui-menu-content>
```

## Disabled Items

Disabled items remain focusable so people can discover them, but cannot run or open a submenu. A disabled Trigger is a native disabled button and cannot receive focus. Add `focusable-when-disabled` to keep it in the tab order, so it can host a tooltip that says why; presses still do nothing.

```ts title="disabled.ts"
import "@ui-sdk/web/menu"
import { Check, ChevronRight, createElement } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="row">
      <ui-menu>
        <ui-menu-trigger>
          <button>Document</button>
        </ui-menu-trigger>
        <ui-menu-content>
          <ui-menu-item value="undo" shortcut="mod+z" disabled>
            Undo
          </ui-menu-item>
          <ui-menu-item value="redo" shortcut="mod+shift+z">
            Redo
          </ui-menu-item>
          <ui-menu-separator></ui-menu-separator>
          <ui-menu-checkbox-item value="autosave" default-checked disabled>
            <ui-menu-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-menu-item-indicator>
            Autosave
          </ui-menu-checkbox-item>
          <ui-menu-separator></ui-menu-separator>
          <ui-menu-radio-group default-value="pdf">
            <ui-menu-group-label>Export as</ui-menu-group-label>
            <ui-menu-radio-item value="pdf">
              <ui-menu-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-menu-item-indicator>
              PDF
            </ui-menu-radio-item>
            <ui-menu-radio-item value="docx" disabled>
              <ui-menu-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-menu-item-indicator>
              Word
            </ui-menu-radio-item>
            <ui-menu-radio-item value="markdown">
              <ui-menu-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-menu-item-indicator>
              Markdown
            </ui-menu-radio-item>
          </ui-menu-radio-group>
          <ui-menu-separator></ui-menu-separator>
          <ui-menu-sub>
            <ui-menu-sub-trigger disabled>
              Move to
              ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
            </ui-menu-sub-trigger>
            <ui-menu-sub-content>
              <ui-menu-item>Archive</ui-menu-item>
            </ui-menu-sub-content>
          </ui-menu-sub>
        </ui-menu-content>
      </ui-menu>
      <ui-menu>
        <ui-menu-trigger disabled>
          <button>Locked</button>
        </ui-menu-trigger>
        <ui-menu-content>
          <ui-menu-item>Unlock</ui-menu-item>
        </ui-menu-content>
      </ui-menu>
    </div>
  `
  root
    .querySelector("ui-menu")!
    .addEventListener("action", (event) =>
      log(root, `Chose ${event.detail.value}`)
    )
}

export { mount }
```

Open Document and move through its items with the arrow keys. Disabled actions remain discoverable but cannot run; Locked cannot open a menu.

## Keeping the Menu Open

Plain items close when selected; checkbox and radio items stay open. `close-on-select` changes either default. A selection handler can also prevent the default event to keep it open for one action.

```html
<ui-menu-item id="zoom-in" close-on-select="false">Zoom in</ui-menu-item>
<ui-menu-checkbox-item value="fit" close-on-select
  >Fit to window</ui-menu-checkbox-item
>

<script type="module">
  document
    .querySelector("#zoom-in")
    .addEventListener("select", () => setZoom(zoom + 10))
</script>
```

## Container

Menus render in place and use the top layer. `container` moves the popup to another element; submenus remain inside their parent popup. Set `container` to that element’s selector, as the [popup guide](../popups.md) explains.

```html
<ui-menu container="#panel"></ui-menu>
```

## Animation

The menu stays mounted through an exit animation. `data-starting-style`, `data-ending-style`, `data-side`, and `--transform-origin` describe the transition. `keep-mounted` leaves the closed content hidden afterward; `openchangecomplete` reports when it finishes.

```ts title="animation.ts"
import "@ui-sdk/web/menu"
import { ChevronRight, createElement } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-menu>
      <ui-menu-trigger>
        <button>Animated</button>
      </ui-menu-trigger>
      <ui-menu-content keep-mounted>
        <ui-menu-item>Back</ui-menu-item>
        <ui-menu-item>Forward</ui-menu-item>
        <ui-menu-item>Reload</ui-menu-item>
        <ui-menu-separator></ui-menu-separator>
        <ui-menu-sub>
          <ui-menu-sub-trigger>
            More tools
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </ui-menu-sub-trigger>
          <ui-menu-sub-content>
            <ui-menu-item>Save page as…</ui-menu-item>
            <ui-menu-item>Developer tools</ui-menu-item>
          </ui-menu-sub-content>
        </ui-menu-sub>
      </ui-menu-content>
    </ui-menu>
  `
  const menu = root.querySelector("ui-menu")!
  menu.addEventListener("openchange", (event) =>
    log(root, event.detail.value ? "Opening" : "Closing")
  )
  menu.addEventListener("openchangecomplete", (event) =>
    log(root, event.detail.value ? "Finished opening" : "Finished closing")
  )
}

export { mount }
```

Open Animated, then its More tools submenu, and close them. The console logs Opening or Closing, then when the animation finishes.

## Presentation

`presentation="auto"` uses a sheet on small touch screens and a popover elsewhere; `"sheet"` always requests a sheet. The sheet keeps menu roles and keys. Submenus replace the current level, and Escape or the arrow toward the parent goes back. Context menus and menus in a menubar remain popovers.

Use `data-presentation` or the content’s `presentation` state for the two layouts. Leave a sheet’s translation to the SDK. `--sheet-backdrop` sets its dimming color, and the sheet is modal unless `modal` is false. The [popup guide](../popups.md) covers shared presentation behavior.

```ts title="presentation.ts"
import "@ui-sdk/web/menu"
import {
  ChevronRight,
  createElement,
  Download,
  Link,
  Share,
  Trash,
} from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-menu presentation="sheet">
      <ui-menu-trigger>
        <button>Options</button>
      </ui-menu-trigger>
      <ui-menu-content>
        <ui-menu-item value="share">
          ${createElement(Share, { "aria-hidden": "true" }).outerHTML}
          Share
        </ui-menu-item>
        <ui-menu-item value="copy-link">
          ${createElement(Link, { "aria-hidden": "true" }).outerHTML}
          Copy link
        </ui-menu-item>
        <ui-menu-sub>
          <ui-menu-sub-trigger>
            ${createElement(Download, { "aria-hidden": "true" }).outerHTML}
            Move to
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </ui-menu-sub-trigger>
          <ui-menu-sub-content>
            <ui-menu-item value="inbox">Inbox</ui-menu-item>
            <ui-menu-item value="archive">Archive</ui-menu-item>
          </ui-menu-sub-content>
        </ui-menu-sub>
        <ui-menu-separator></ui-menu-separator>
        <ui-menu-item value="delete" destructive>
          ${createElement(Trash, { "aria-hidden": "true" }).outerHTML}
          Delete
        </ui-menu-item>
      </ui-menu-content>
    </ui-menu>
  `
  root
    .querySelector("ui-menu")!
    .addEventListener("action", (event) =>
      log(root, `Chose ${event.detail.value}`)
    )
}

export { mount }
```

Open Options as a sheet, enter Move to, then go back or choose a destination. You can drag downward to dismiss the sheet.

## Controlled

Read or set the element’s `open` property, and listen for `openchange`. A change carries a reason, and `event.preventDefault()` can refuse it. A controller can open the menu from another control; see [state and events](../state-and-events.md) and [controllers](../controllers.md) for that shared pattern.

```ts
const menu = document.querySelector("ui-menu")!

menu.open = true
menu.addEventListener("openchange", (event) => {
  console.log(event.detail.value, event.detail.reason)
})
```

## Triggers Outside the Menu

Give the menu an `id` and connect external triggers with `for`. Assign their `payload` properties and read the active row through `api.getPayload()`. Only the active trigger is expanded and receives focus back. Code can also open with a `payload` and `anchor`; the Promise resolves when the menu closes.

```ts title="payload.ts"
import type { UiMenuElement } from "@ui-sdk/web/menu"
import "@ui-sdk/web/menu"
import { createElement, Ellipsis } from "lucide"
import { log } from "./log"

type File = { name: string; size: string }

const files: File[] = [
  { name: "Roadmap.pdf", size: "2.4 MB" },
  { name: "Budget.xlsx", size: "860 KB" },
  { name: "Team photo.jpg", size: "5.1 MB" },
]

let count = 0

function mount(root: HTMLElement) {
  const id = `file-actions-${++count}`
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button>Open ${files[0].name} Actions</button>
      </div>
      <ul data-slot="list"></ul>
      <ui-menu id="${id}">
        <ui-menu-content align="end">
          <ui-menu-group>
            <ui-menu-group-label></ui-menu-group-label>
            <ui-menu-item value="open">Open</ui-menu-item>
            <ui-menu-item value="rename">Rename</ui-menu-item>
            <ui-menu-item value="duplicate">Duplicate</ui-menu-item>
          </ui-menu-group>
          <ui-menu-separator></ui-menu-separator>
          <ui-menu-item value="delete">Delete</ui-menu-item>
        </ui-menu-content>
      </ui-menu>
    </div>
  `
  const menu = root.querySelector<UiMenuElement<File>>("ui-menu")!
  const label = root.querySelector("ui-menu-group-label")!

  for (const file of files) {
    const row = document.createElement("li")
    row.dataset.slot = "row"
    row.innerHTML = `${file.name}<span data-slot="hint">${file.size}</span>`
    const trigger = Object.assign(document.createElement("ui-menu-trigger"), {
      payload: file,
    })
    trigger.setAttribute("for", id)
    trigger.innerHTML = `
      <button data-variant="ghost" data-size="sm" aria-label="Actions for ${file.name}">
        ${createElement(Ellipsis, { "aria-hidden": "true" }).outerHTML}
      </button>
    `
    row.append(trigger)
    root.querySelector("ul")!.append(row)
  }

  menu.addEventListener("payloadchange", (event) => {
    const file = event.detail.value
    label.textContent = file?.name ?? ""
  })
  menu.addEventListener("action", (event) => {
    const { value } = event.detail
    log(root, `${value} ${menu.api.getPayload()?.name}`)
  })

  const opener = root.querySelector<HTMLButtonElement>(
    '[data-slot="controls"] button'
  )!
  opener.addEventListener("click", async () => {
    const result = await menu.api.open({ payload: files[0], anchor: opener })
    log(root, `Closed with ${result.reason}`)
  })
}

export { mount }
```

Open the actions for different files. One menu shows the active row; opening from code uses the same payload and reports the closing reason.

## Menus as Data

`items` accepts `MenuData`: actions, groups, checkboxes, radio groups, and submenus. A string is shorthand for an item whose label and value match. Data menus register their shortcuts even while closed; set `item-shortcuts` to `false` to turn that off.

Listen on each part, or capture its `checkedchange` and `valuechange` events on the menu with `{ capture: true }`. Read the new state from `detail.value` and identify the item’s `value` or group’s `name` on the event target. Either change can be canceled. You can also supply a `<template>` of your own parts, which the menu fills from `items` while it keeps the shortcuts registered. The [lists and menus guide](../lists-and-menus.md) covers the data shape.

```html
<ui-menu>
  <ui-menu-trigger>
    <button>File</button>
  </ui-menu-trigger>
</ui-menu>

<script type="module">
  const fileMenu = [
    { value: "open", label: "Open…", shortcut: "mod+o" },
    { type: "separator" },
    {
      type: "checkbox",
      value: "toolbar",
      label: "Toolbar",
      defaultChecked: true,
    },
    {
      type: "radio-group",
      name: "sort",
      label: "Sort by",
      defaultValue: "name",
      items: [
        { value: "name", label: "Name" },
        { value: "date", label: "Date modified" },
      ],
    },
    { type: "submenu", label: "Share", items: ["Copy link", "Email"] },
  ]

  const menu = document.querySelector("ui-menu")
  menu.items = fileMenu
  menu.addEventListener("action", (event) => run(event.detail.value))
</script>
```

## Links and Custom Rendering

Put a native link inside `<ui-menu-item as-child>`, as the shared [composition API](../parts-and-composition.md) describes. Enter follows the link like a click, preserving its target and modifier-key behavior.

```html
<ui-menu-item as-child>
  <a href="#composition">Composition</a>
</ui-menu-item>
```

## Custom Rendering

See [Links and Custom Rendering](#links-and-custom-rendering) for a native link. The shared [composition guide](../parts-and-composition.md) covers element replacement and state-based rendering.

## Styling

Use `data-highlighted` for the active item, `data-disabled` for unavailable actions, and `data-checked` for selected settings. Popup sizing and motion hooks are shared with the [styling guide](../styling-and-animation.md).

Each part has a `data-slot`, such as `menu-item`, and its state attributes are listed under [Data Attributes](#data-attributes).

### `<ui-menu-content>`
- `--anchor-width`: Width of the anchor, usually the trigger. Use it to match widths.
- `--anchor-height`: Height of the anchor.
- `--available-width`: Space beside the popup, up to the viewport edge. Not inherited either.
- `--available-height`: Space between the anchor and the viewport edge. Use it for max-height. Not inherited, so a child that needs it copies it on the popup, like `[--list-height:var(--available-height)]`, and reads `max-h-(--list-height)`. The first popup registers both names for the whole page with `CSS.registerProperty`, so they don't inherit anywhere. A page that needs them to inherit calls it first, with `inherits: true`. An `@property` rule can't, since a registration in script wins.
- `--transform-origin`: The point on the anchor the popup opens from. Use it to scale from the right place.
- `--arrow-offset`: Where the anchor's center falls along the popup's edge, kept `arrowPadding` from the corners. Position a ::before arrow with it.
- `--drawer-progress`: While it presents as a sheet: how far open the sheet is, from 0 closed to 1 at its largest snap point. Never past 1.
- `--drawer-dim`: While it presents as a sheet: how dim the page behind is, from 0 to 1. The backdrop's opacity follows it.
- `--drawer-expand`: While it presents as a sheet: 0 at the second-largest snap point and below, 1 at the largest. With one snap point, the whole travel.
- `--drawer-stack`: While it presents as a sheet: how many sheets opened from inside this one are open above it, rising smoothly as each one opens. Push it back with it.
- `--sheet-backdrop`: Set it yourself: the color the page dims to while it presents as a sheet. Black at 0.2 by default.

### `<ui-menu-viewport>`
- `--keyboard-inset`: While it presents as a sheet: how many pixels of the page the on-screen keyboard covers, 0 without one.
- `--visual-viewport-width`: While it presents as a sheet: the width of the part of the page you can see.
- `--visual-viewport-height`: While it presents as a sheet: the height of the part of the page you can see, above the keyboard.
- `--visual-viewport-top`: While it presents as a sheet: how far the part of the page you can see is scrolled from the top of the layout, as when the keyboard pushes it up.

## Data Attributes

`<ui-menu-radio-group>`, `<ui-menu-group>`, `<ui-menu-group-label>`, `<ui-menu-separator>` and `<ui-menu-shortcut>` have no state attributes.

### `<ui-menu-trigger>`
`[data-slot="menu-trigger"]`

- `data-closed`: Present on a trigger while the menu isn't open from it.
- `data-open`: Present on the trigger that opened the menu, while it's open.

### `<ui-menu-context-trigger>`
`[data-slot="menu-context-trigger"]`

- `data-closed`: Present on an area while the menu isn't open from it.
- `data-disabled`: Present when the item can't be chosen.

### `<ui-menu-content>`
`[data-slot="menu-content"]`

- `data-closed`: Present while the menu is closed, including while it animates out.
- `data-presentation` (`popover`, `sheet`): How the menu presents this time it's open. Submenus present like their root.
- `data-nested`: Present on submenus.
- `data-open`: Present while the menu is open. A submenu trigger has it while its submenu is open.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the menu animates out. Style the state you animate to.
- `data-has-icons`: Present while any item inside holds an icon part, so items without one can line up.

### `<ui-menu-item>`
`[data-slot="menu-item"]`

- `data-disabled`: Present when the item can't be chosen.
- `data-has-icon`: Present on an item while it holds an icon part.

### `<ui-menu-checkbox-item>`
`[data-slot="menu-checkbox-item"]`

- `data-checked`: Present on checked checkbox items, and on the radio item that's its group's value.
- `data-unchecked`: Present on items that aren't checked.

### `<ui-menu-item-indicator>`
`[data-slot="menu-item-indicator"]`

- `data-checked`: Present while its item is checked.
- `data-unchecked`: Present while its item isn't checked, with `keepMounted`.

### `<ui-menu-radio-item>`
`[data-slot="menu-radio-item"]`

- `data-checked`: Present on checked checkbox items, and on the radio item that's its group's value.
- `data-unchecked`: Present on items that aren't checked.

### `<ui-menu-item-icon>`
`[data-slot="menu-item-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

## API Reference

Props are attributes in kebab case, like `default-checked` and `side-offset`. Attributes can change at any time, including the options on `<ui-menu>`: `"false"` is false, and numbers are numbers. Callbacks are DOM events.

### Menu

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `open?` (`boolean`): Whether the menu is open. Pass it to control the menu.
- `defaultOpen?` (`boolean`): Whether the menu starts open, when uncontrolled.
- `openchange event`: Runs when the menu wants to open or close. `details.reason` says why, and `details.cancel()` stops it.
- `openchangecomplete event`: Runs once the menu has finished opening or closing, after any animation.
- `payloadchange event`: Runs when the payload the content shows changes: a trigger or context area with another payload opens the menu, or takes the open menu over, which fires no `openchange`, and so does a controller's `open({ payload })` on the open menu. `details.cancel()` keeps the previous payload.
- `action event`: Runs for every plain item, including items in submenus, with the item's value. Return a Promise to mark the item pending until it settles: it gets `data-pending`, `aria-busy` and `aria-disabled`, the menu stays open, and choosing it again waits. It closes once the Promise resolves, and a rejection keeps it open with the reason in the item's `error` state until the next try.
- `pendingAnnouncement?` (`string`): What screen readers hear once an item has been pending for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `checkedchange event`: Runs when any checkbox item in the menu or its submenus toggles, with the item's value in `details.value`. Made for data menus.
- `valuechange event`: Runs when any radio group in the menu or its submenus changes, with the group in `details.group`. Made for data menus.
- `items?` (`MenuData`): The menu as data. Renders the content for you, unless you place a content part of your own, and runs the items' shortcuts.
- `itemShortcuts?` (`boolean`): Whether a data menu runs its items' shortcuts while closed.
- `loop?` (`boolean`): Whether arrow keys wrap from the last item to the first.
- `delay?` (`number`): Milliseconds the pointer rests on a submenu trigger before its submenu opens.
- `presentation?` (`PresentationSetting<"popover">`): How the menu presents. `"sheet"` slides it up from the bottom of the screen, where it can be swiped away and submenus open in its place, and `"auto"` does that on small touch screens. Decided each time it opens; the server renders `"popover"` for `"auto"`. A context menu and a menu in a menubar are always popovers.
- `controller?` (`PopupController<any, MenuOpenChangeReason, MenuOpenOptions, string, MenuPayloadChangeReason>`): Opens, closes and inspects the menu from anywhere, and connects triggers outside it. Create one with `createMenuController()`.
- `modal?` (`"pointer" | boolean`): `"pointer"`: an outside press only closes the menu. `true`: also locks scroll, traps focus and makes the rest of the page inert. `false`: outside presses reach what they hit.
- `dismissible?` (`boolean`): Whether Escape, an outside press, focus or the window leaving, Android's back gesture and a sheet's swipe can close it. Triggers, Close parts and the controller always can. Pass `false` while it holds unsaved work, and ask in `dismissattempt`.
- `dismissattempt event`: Runs when `dismissible` refused a dismissal made on purpose: Escape, an outside press, back or a swipe. Focus or the window leaving is refused without it. Ask "Discard changes?" here.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### MenuTrigger

A trigger outside the menu names it with `for="menu-id"`, and takes `payload` as a property.

- `disabled?` (`boolean`): Stops the trigger from opening the menu. A native button can't be focused or pressed, unless `focusableWhenDisabled` is set.
- `focusableWhenDisabled?` (`boolean`): Keeps a disabled trigger in the tab order with `aria-disabled` instead of the native attribute, so it can host a tooltip that says why. Presses still do nothing.
- `payload?` (`unknown`): Data for the content to render when this trigger opens the menu, like the row it belongs to.
- `shortcut?` (`string`): A keyboard shortcut that opens the menu from anywhere, like `"mod+j"`. `mod` is Command on Apple platforms and Control elsewhere. Sets `aria-keyshortcuts`.
- `controller?` (`PopupController<any, MenuOpenChangeReason, MenuOpenOptions, string, MenuPayloadChangeReason>`): Connects a trigger outside the menu, like one per table row, to the menu with this controller.

### MenuContextTrigger

- `disabled?` (`boolean`): Stops a right-click, a long press or Shift+F10 from opening the menu here. The browser's own menu shows instead.
- `payload?` (`unknown`): Data for the content to render when this area opens the menu, like the row it belongs to.
- `controller?` (`PopupController<any, MenuOpenChangeReason, MenuOpenOptions, string, MenuPayloadChangeReason>`): Connects an area outside the menu to the menu with this controller.

### MenuContent

- `side?` (`Side`): Which side of the anchor the popup opens on. Flips to the other side when there isn't room. Which side of the trigger the menu opens on. Submenus open to the side, mirrored in right-to-left layouts.
- `align?` (`Align`): How the popup lines up with the anchor along that side. `start` and `end` follow the reading direction. How the menu lines up with the trigger along that side.
- `sideOffset?` (`number`): Gap between the anchor and the popup, in pixels. Gap between the trigger and the menu, in pixels.
- `alignOffset?` (`number`): Shift along the anchor, in pixels. Shift along the trigger, in pixels. Submenus default to lining up their first item with the trigger.
- `collisionPadding?` (`number`): Space to keep from the viewport edges, in pixels.
- `arrowPadding?` (`number`): Space to keep between the arrow and the popup's corners, in pixels.
- `anchor?` (`string | Anchor | null`): Positions the popup against this instead of its trigger: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. It's read on every check, so it can move. A controller's `open({ anchor })` wins for that open.
- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `finalFocus?` (`PopupFocusTarget`): Where focus goes when the menu closes while focus is inside it. `"trigger"` returns it to the trigger and `"none"` leaves it. A CSS selector, an element or a function picks a specific element.
- `keepMounted?` (`boolean`): Whether the menu stays in the page, hidden, while closed. For animation libraries that drive the exit from state.

### MenuItem

- `value?` (`string`): Passed to `action` when the item runs.
- `label?` (`string`): The text typeahead matches, when the content isn't plain text. It isn't the accessible name: use `aria-label` for that.
- `disabled?` (`boolean`): Keeps the item focusable but stops it from running, as the menu pattern asks. Sets `data-disabled` and `aria-disabled`.
- `destructive?` (`boolean`): Styles the item as dangerous, like Delete. Sets `data-destructive`.
- `shortcut?` (`string`): A keyboard shortcut like `"mod+n"`. Shows `⌘N` on Apple platforms and `Ctrl+N` elsewhere, and sets `aria-keyshortcuts`.
- `closeOnSelect?` (`boolean`): Whether running the item closes the menu.
- `select event`: Runs when the item is selected, by pointer or keyboard, with the event that selected it, or a new `select` Event when no DOM event did. Call `event.preventDefault()` to keep the menu open and skip `action`. Return a Promise to mark the item pending until it settles, like `action`.

### MenuCheckboxItem

- `value` (`string`): Identifies the item, in the menu's `checkedchange`.
- `label?` (`string`): The text typeahead matches, when the content isn't plain text. It isn't the accessible name: use `aria-label` for that.
- `disabled?` (`boolean`): Keeps the item focusable but stops it from toggling, as the menu pattern asks.
- `checked?` (`boolean`): Whether the item is checked. Pass it to control the item.
- `defaultChecked?` (`boolean`): Whether the item starts checked, when uncontrolled.
- `checkedchange event`: Runs when the item wants to toggle. `details.reason` says why, and `details.cancel()` stops it.
- `closeOnSelect?` (`boolean`): Whether toggling closes the menu.

### MenuRadioGroup

- `value?` (`T | null`): The selected value. Pass it to control the group. `null` selects nothing.
- `defaultValue?` (`T | null`): The value selected at first, when uncontrolled.
- `valuechange event`: Runs when the selection wants to change. `details.reason` says why, and `details.cancel()` stops it.
- `name?` (`string`): Identifies the group in the menu's `valuechange`. Defaults to a generated id.

### MenuRadioItem

- `value` (`string`): Selected in the group when the item is chosen.
- `label?` (`string`): The text typeahead matches, when the content isn't plain text. It isn't the accessible name: use `aria-label` for that.
- `disabled?` (`boolean`): Keeps the item focusable but stops it from being chosen, as the menu pattern asks.
- `closeOnSelect?` (`boolean`): Whether choosing the item closes the menu.

### MenuItemIndicator

- `keepMounted?` (`boolean`): Whether the indicator stays in the page while its item is unchecked, so it can be styled or animated in both states.

### MenuItemIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

### MenuSub

- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.
- `open?` (`boolean`): Whether the menu is open. Pass it to control the menu.
- `defaultOpen?` (`boolean`): Whether the menu starts open, when uncontrolled.
- `openchange event`: Runs when the menu wants to open or close. `details.reason` says why, and `details.cancel()` stops it.
- `openchangecomplete event`: Runs once the menu has finished opening or closing, after any animation.
- `loop?` (`boolean`): Whether arrow keys wrap from the last item to the first.
- `delay?` (`number`): Milliseconds the pointer rests on a submenu trigger before its submenu opens.

### MenuSubTrigger

- `disabled?` (`boolean`): Keeps the submenu trigger focusable but stops it from opening its submenu, as the menu pattern asks. Sets `data-disabled` and `aria-disabled`.

### MenuSubContent

It takes the same attributes as `ui-menu-content`.

### MenuGroup, MenuGroupLabel and MenuSeparator

These take no attributes of their own.

### State

The same state shows as data attributes on each element.

`MenuTrigger`, `MenuContextTrigger` and `MenuSubTrigger`:

- `open` (`boolean`): Whether the menu is open from this trigger.
- `disabled` (`boolean`): Whether the trigger's `disabled` prop is set, or the menubar it's in is disabled.

`MenuContent`:

- `open` (`boolean`): Whether the menu is open. False while it animates out.
- `nested` (`boolean`): Whether this is a submenu.
- `presentation` (`Presentation`): How the menu is shown.
- `payload` (`Payload | undefined`): The payload of the last open, from the trigger that opened it or a controller, typed as the controller's `Payload`.

`MenuItem`:

- `highlighted` (`boolean`): Whether the item has keyboard focus or is under the pointer.
- `disabled` (`boolean`): Whether the item can't be chosen.
- `pending` (`boolean`): Whether its `onSelect` or `onAction` Promise is running.
- `error` (`unknown`): Why its last action failed, until it runs again.

`MenuCheckboxItem` and `MenuRadioItem`:

- `highlighted` (`boolean`): Whether the item has keyboard focus or is under the pointer.
- `disabled` (`boolean`): Whether the item can't be chosen.
- `checked` (`boolean`): Whether the item is on: its `checked` prop when you pass one, otherwise `defaultChecked` until a press changes it.

`MenuRadioGroup`:

- `value` (`string | null`): The selected value, or null when nothing is selected.

`MenuItemIndicator`:

- `checked` (`boolean`): Whether its checkbox item is on, or its radio item is its group's value. While false, the indicator isn't shown unless `keepMounted` is set.
- `disabled` (`boolean`): Whether the item can't be chosen.

`MenuItemIcon`:

- `mirror` (`boolean`): Whether it flips in right-to-left text.

### Reasons

`event.detail.reason` says why the menu or a submenu opened or closed.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `trigger-hover` (`PointerEvent`): The pointer rested on a trigger, or left it, with hover opening.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `focus-out` (`KeyboardEvent | FocusEvent`): Focus left the layer, or Tab moved it out.
- `window-blur` (`FocusEvent`): The window lost focus.
- `submenu-switch` (`KeyboardEvent | PointerEvent`): Another submenu in the same menu, or another menu in the same menubar, took over.
- `parent-close` (`none`): The parent layer closed.
- `trigger-release` (`PointerEvent`): A press-and-hold open was released outside the popup.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

For a payload change, it says what opened the menu or took it over.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `trigger-hover` (`PointerEvent`): The pointer rested on a trigger, or left it, with hover opening.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

With `dismissible` false, the refused dismissals `dismissattempt` reports:

- `outside-press` (`MouseEvent`): A press outside the layer.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.

Checkbox items report why they toggled, in `checkedchange`:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

Radio groups report why their value changed, in `valuechange`:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods. The `open` property reads and sets whether the menu is
open.

Every write method takes an optional `{ reason, event }`, passed to `openchange`. `open()` also takes `focus`: `"first"`, `"last"`, `"popup"` or `"none"`.

- `isOpen()` (`() => boolean`): Whether it's open. False as soon as it starts closing, while it still animates out.
- `setOpen(open, options?)` (`(open: boolean, options?: PopupChangeOptions<MenuOpenChangeReason> | undefined) => boolean`): Opens or closes it. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (PopupChangeOptions<MenuPayloadChangeReason> & { payload?: Payload | undefined; anchor?: Anchor | undefined; signal?: AbortSignal | undefined; } & MenuOpenOptions) | undefined) => Promise<...>`): Opens it, and resolves once it closes, with why, how and any return value. Resolves exactly once and never rejects: on the next close from any source, when `signal` aborts, or with reason `"unmount"` when the component leaves the page.
- `close(options?)` (`(options?: (PopupChangeOptions<MenuOpenChangeReason> & { returnValue?: Result | undefined; }) | undefined) => boolean`): Closes it. `returnValue` is passed to the promise `open()` returned. Returns false when the close was canceled or it was already closed.
- `toggle(options?)` (`(options?: PopupChangeOptions<MenuOpenChangeReason> | undefined) => boolean`): Opens it when it's closed, and closes it when it's open. Returns false when the change was canceled.
- `getPayload()` (`() => Payload | undefined`): The payload of the last open, from a controller or the trigger that opened it.
- `focus()` (`() => void`): Moves focus to the trigger that opened it last, or the first trigger.

### Events

Events fire on their own element and don't bubble, with the new state in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` cancels the change.

| Member                     | On                      | Description                                                                             |
| -------------------------- | ----------------------- | --------------------------------------------------------------------------------------- |
| `open` property, attribute | `ui-menu`               | Whether the menu is open. The attribute sets where it starts, and is live               |
| `api` property             | `ui-menu`               | The [controller](#controller)                                                           |
| `items` property           | `ui-menu`               | A data menu, rendered from its `<template>`                                             |
| `openchange` event         | `ui-menu`               | `detail: { value: open, reason, event, source }`                                        |
| `openchangecomplete` event | `ui-menu`               | `detail: { value: open }`, after the animation                                          |
| `payloadchange` event      | `ui-menu`               | `detail: { value: payload, reason, event, source }`, when the content's payload changes |
| `action` event             | `ui-menu`               | `detail: { value }` for every plain item                                                |
| `dismissattempt` event     | `ui-menu`               | `detail: { reason, event }`, when a dismissal was refused                               |
| `select` event             | `ui-menu-item`          | Before the menu closes. `preventDefault()` keeps it open                                |
| `checkedchange` event      | `ui-menu-checkbox-item` | `detail: { value: checked, reason, event, source }`. Listen on the item                 |
| `valuechange` event        | `ui-menu-radio-group`   | `detail: { value, reason, event, source }`. Listen on the group                         |
| `payload` property         | `ui-menu-trigger`       | Data for the content, read when the trigger connects                                    |
| `for` attribute            | `ui-menu-trigger`       | The `id` of a menu the trigger opens from outside it                                    |

## Accessibility

The menu follows the [WAI-ARIA menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/).

### Tested Behavior

Every line below is an automated test.

**Trigger**

- Advertises its menu and reflects the open state.
- Click opens the menu and moves focus into it.
- Click on the open trigger closes the menu.
- Enter opens the menu and focuses the first item.
- Space opens the menu and focuses the first item.
- ArrowDown opens the menu and focuses the first item.
- ArrowUp opens the menu and focuses the last item.
- A click on a trigger in a shadow root opens the menu, and it stays open. Vue and web components only.

**Keyboard navigation**

- ArrowDown and ArrowUp move between items, skipping separators and labels.
- Disabled items are focusable.
- Focus wraps at both ends.
- Home and End move to the first and last items.
- Typing a character moves to the next item that starts with it.
- Typing several characters quickly matches the whole prefix.

**Activation**

- Enter on an item runs it, closes the menu and returns focus.
- Clicking an item runs it and closes the menu.
- Disabled items do nothing.
- Checkbox items toggle and keep the menu open.
- Radio items select one value and keep the menu open.
- Hovering an item highlights it.

**Dismissal**

- Escape closes the menu and returns focus to the trigger.
- Clicking outside closes the menu.
- Escape while an input method is composing text leaves the menu open.
- Pressing a scrollbar outside the menu leaves it open.
- Tab closes the menu.

**Submenu**

- The submenu trigger advertises its menu.
- ArrowRight opens the submenu and focuses its first item.
- Enter opens the submenu and focuses its first item.
- Space opens the submenu and focuses its first item.
- ArrowLeft closes the submenu and returns focus to its trigger.
- Nested submenus open and run their items.
- Submenu keyboard navigation stays inside the submenu.
- Keys pressed in quick succession are never lost.
- Clicking outside closes every menu.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while using the menu with a keyboard.
- Item shortcuts are announced.

Runs in React, Vue and web components.
