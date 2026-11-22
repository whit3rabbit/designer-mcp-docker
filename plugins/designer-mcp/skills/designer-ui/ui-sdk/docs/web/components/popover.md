# Popover

Edit or explore something beside its trigger.

A popover keeps a small task close to the thing it belongs to. Put fields, buttons, or other interactive content inside; it handles placement, focus, and dismissal.

```ts title="basic.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import "@ui-sdk/web/popover"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-popover>
      <ui-popover-trigger>
        <button>Share</button>
      </ui-popover-trigger>
      <ui-popover-content>
        <ui-popover-title>Share this document</ui-popover-title>
        <ui-popover-description>Anyone with the link can view it.</ui-popover-description>
        <ui-field>
          <ui-field-label>Link</ui-field-label>
          <ui-input>
            <input value="acme.app/d/q3-roadmap" readonly />
          </ui-input>
        </ui-field>
        <div data-slot="row">
          <ui-popover-close>
            <button>Cancel</button>
          </ui-popover-close>
          <ui-popover-close>
            <button data-variant="solid">Copy Link</button>
          </ui-popover-close>
        </div>
      </ui-popover-content>
    </ui-popover>
  `
}

export { mount }
```

Press Share to open the popover, then close it with Cancel, Copy Link, Escape, or a press outside. Focus returns to Share.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. Import the field too if you use it. On the server the import does nothing.

```ts
import "@ui-sdk/web/popover"
import "@ui-sdk/web/field"
```

## Composition

Use the following composition to build a `ui-popover`:

```text
ui-popover
├── ui-popover-trigger
│   └── button
└── ui-popover-content
    ├── ui-popover-arrow
    ├── ui-popover-title
    ├── ui-popover-description
    └── ui-popover-close
        └── button
```

The content has the dialog role. Its title names it and its description adds context. The arrow is optional, and a popover can have several Close parts. The trigger can live inside the popover or [connect from elsewhere](#triggers-outside-the-popover).

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/popover"
</script>

<ui-popover>
  <ui-popover-trigger>
    <button>Share</button>
  </ui-popover-trigger>
  <ui-popover-content>
    <ui-popover-title>Share this document</ui-popover-title>
    <ui-popover-description
      >Anyone with the link can view it.</ui-popover-description
    >
    <ui-popover-close>
      <button>Done</button>
    </ui-popover-close>
  </ui-popover-content>
</ui-popover>
```

## Forms

An ordinary form can save a value and then close the popover. Focus starts on the first field and returns to the trigger when the task finishes. A form with `method="dialog"` closes on submission and returns its submit button's value; the [row editor](#triggers-outside-the-popover) shows that version.

```ts title="form.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import "@ui-sdk/web/popover"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-popover>
      <ui-popover-trigger>
        <button>Edit Profile</button>
      </ui-popover-trigger>
      <ui-popover-content>
        <ui-popover-title>Edit profile</ui-popover-title>
        <ui-popover-description>Your name shows on your posts.</ui-popover-description>
        <form data-slot="stack">
          <ui-field>
            <ui-field-label>Name</ui-field-label>
            <ui-input>
              <input name="name" required value="Hollis Grant" />
            </ui-input>
          </ui-field>
          <div data-slot="row">
            <ui-popover-close>
              <button type="button">Cancel</button>
            </ui-popover-close>
            <button type="submit" data-variant="solid">Save</button>
          </div>
        </form>
      </ui-popover-content>
    </ui-popover>
  `
  const popover = root.querySelector("ui-popover")!
  root.querySelector("form")!.addEventListener("submit", (event) => {
    event.preventDefault()
    log(
      root,
      `Saved ${new FormData(event.target as HTMLFormElement).get("name")}`
    )
    popover.open = false
  })
}

export { mount }
```

Open Edit Profile, change the name, and press Save. The popover closes and the console logs the saved name.

## Keep It Open While Editing

Set `dismissible` to false while there is unsaved work. Escape and outside presses then keep the popover open and fire `dismissattempt`, so you can ask whether to discard it. Focus leaving is refused quietly. The trigger, Close parts, and controller can still close it.

```ts title="draft.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/popover"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-popover>
      <ui-popover-trigger>
        <button>Add Note</button>
      </ui-popover-trigger>
      <ui-popover-content>
        <ui-popover-title>Add a note</ui-popover-title>
        <ui-popover-description>Only your team can see it.</ui-popover-description>
        <ui-field>
          <ui-field-label>Note</ui-field-label>
          <textarea placeholder="Call the printer about the proofs."></textarea>
        </ui-field>
        <div data-slot="row" role="alert" hidden>
          Discard your note?
          <div data-slot="row">
            <button type="button" data-size="sm">Keep Editing</button>
            <button type="button" data-size="sm" data-variant="solid">Discard</button>
          </div>
        </div>
        <div data-slot="row">
          <ui-popover-close>
            <button>Cancel</button>
          </ui-popover-close>
          <button type="button" data-variant="solid">Save</button>
        </div>
      </ui-popover-content>
    </ui-popover>
  `
  const popover = root.querySelector("ui-popover")!
  const note = root.querySelector("textarea")!
  const alert = root.querySelector<HTMLElement>('[role="alert"]')!
  const actions = root.querySelector<HTMLElement>(
    'ui-popover-content > [data-slot="row"]:not([role])'
  )!
  const [keep, discard] = alert.querySelectorAll("button")
  const ask = (asking: boolean) => {
    alert.hidden = !asking
    actions.hidden = asking
  }
  const reset = () => {
    ask(false)
    note.value = ""
    popover.removeAttribute("dismissible")
  }
  const close = () => {
    reset()
    popover.open = false
  }
  note.addEventListener("input", () => {
    if (note.value) {
      popover.setAttribute("dismissible", "false")
    } else {
      popover.removeAttribute("dismissible")
    }
  })
  popover.addEventListener("dismissattempt", (event) => {
    log(root, `Kept open (${event.detail.reason})`)
    ask(true)
  })
  keep.addEventListener("click", () => {
    ask(false)
    note.focus()
  })
  discard.addEventListener("click", () => {
    log(root, "Discarded the note")
    close()
  })
  actions
    .querySelector("[data-variant=solid]")!
    .addEventListener("click", () => {
      log(root, note.value ? "Saved the note" : "Nothing to save")
      close()
    })
  popover.addEventListener("openchange", (event) => {
    if (!event.detail.value) {
      reset()
    }
  })
}

export { mount }
```

Open Add Note, type something, then press Escape or click outside. Keep Editing returns to the field; Discard closes the popover and clears the note.

## Placement

`side` chooses an edge of the trigger, `bottom` by default, and `align` lines the popover up with its start, center, or end. Start and end follow text direction. The popover flips or shifts when the requested position doesn't fit, and `data-side` and `data-align` report where it landed. The [popup guide](../popups.md#place-the-content) covers the shared positioning options.

```ts title="placement.ts"
import "@ui-sdk/web/popover"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const sides = [
  { value: "top", label: "Top" },
  { value: "right", label: "Right" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
]
const aligns = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
]

const check = createElement(Check, { "aria-hidden": "true" }).outerHTML
const chevron = createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML

function select(
  attribute: string,
  label: string,
  value: string,
  options: { value: string; label: string }[]
) {
  return `
    <ui-select data-attribute="${attribute}" default-value="${value}">
      <ui-select-label>${label}</ui-select-label>
      <ui-select-trigger>
        <button>
          <ui-select-value></ui-select-value>
          ${chevron}
        </button>
      </ui-select-trigger>
      <ui-select-content hidden>
        ${options
          .map(
            (option) => `
              <ui-select-item value="${option.value}">
                ${option.label}
                <ui-select-item-indicator>${check}</ui-select-item-indicator>
              </ui-select-item>
            `
          )
          .join("")}
      </ui-select-content>
    </ui-select>
  `
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        ${select("side", "Side", "bottom", sides)}
        ${select("align", "Align", "center", aligns)}
      </div>
      <ui-popover>
        <ui-popover-trigger>
          <button>Delivery</button>
        </ui-popover-trigger>
        <ui-popover-content side="bottom" align="center" side-offset="8">
          <ui-popover-title>Delivery window</ui-popover-title>
          <ui-popover-description>Arrives Tuesday between 9 AM and noon.</ui-popover-description>
        </ui-popover-content>
      </ui-popover>
    </div>
  `
  const content = root.querySelector("ui-popover-content")!
  for (const control of root.querySelectorAll("ui-select")) {
    control.addEventListener("valuechange", (event) => {
      const value = event.detail.value
      if (typeof value === "string") {
        content.setAttribute(control.dataset.attribute!, value)
      }
    })
  }
}

export { mount }
```

Choose a side and an alignment, then open Delivery. Near a window edge, the popover flips or shifts to stay visible.

## Offsets

`side-offset` is the gap to the trigger, 4 pixels by default. `align-offset` shifts the popover along the trigger's edge, and `collision-padding` is the space kept from the edges of the window.

```ts title="offsets.ts"
import "@ui-sdk/web/popover"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const choices = [
  {
    attribute: "side-offset",
    label: "Side offset",
    value: "8",
    values: ["4", "8", "16", "24"],
  },
  {
    attribute: "align-offset",
    label: "Align offset",
    value: "0",
    values: ["-16", "0", "16"],
  },
  {
    attribute: "collision-padding",
    label: "Collision padding",
    value: "8",
    values: ["8", "24", "48"],
  },
]

const check = createElement(Check, { "aria-hidden": "true" }).outerHTML
const chevron = createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        ${choices
          .map(
            (choice) => `
              <ui-select data-attribute="${choice.attribute}" default-value="${choice.value}">
                <ui-select-label>${choice.label}</ui-select-label>
                <ui-select-trigger>
                  <button>
                    <ui-select-value></ui-select-value>
                    ${chevron}
                  </button>
                </ui-select-trigger>
                <ui-select-content hidden>
                  ${choice.values
                    .map(
                      (value) => `
                        <ui-select-item value="${value}">
                          ${value}px
                          <ui-select-item-indicator>${check}</ui-select-item-indicator>
                        </ui-select-item>
                      `
                    )
                    .join("")}
                </ui-select-content>
              </ui-select>
            `
          )
          .join("")}
      </div>
      <ui-popover>
        <ui-popover-trigger>
          <button>Delivery</button>
        </ui-popover-trigger>
        <ui-popover-content align="start" side-offset="8" align-offset="0" collision-padding="8">
          <ui-popover-title>Delivery window</ui-popover-title>
          <ui-popover-description>Arrives Tuesday between 9 AM and noon.</ui-popover-description>
        </ui-popover-content>
      </ui-popover>
    </div>
  `
  const content = root.querySelector("ui-popover-content")!
  for (const control of root.querySelectorAll("ui-select")) {
    control.addEventListener("valuechange", (event) => {
      const value = event.detail.value
      if (typeof value === "string") {
        content.setAttribute(control.dataset.attribute!, value)
      }
    })
  }
}

export { mount }
```

Change the offsets and the padding, then open Delivery. The popover moves away from the trigger and along it.

## Arrow

`ui-popover-arrow` follows the side the popover actually uses, including after a flip, and gets the same `data-side`. `arrow-padding` keeps it away from the corners; `data-arrow-clamped` tells you when it can't point at the middle of the trigger. This example cancels dismissal when you press its side buttons, so the open arrow can move.

```ts title="arrow.ts"
import "@ui-sdk/web/popover"
import { CircleQuestionMark, createElement } from "lucide"

const sides = [
  { value: "top", label: "Top" },
  { value: "right", label: "Right" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls" role="group" aria-label="Side">
        ${sides
          .map(
            (option) =>
              `<button type="button" data-size="sm" value="${option.value}" aria-pressed="${option.value === "bottom"}">${option.label}</button>`
          )
          .join("")}
      </div>
      <ui-popover>
        <ui-popover-trigger>
          <button aria-label="Help">${createElement(CircleQuestionMark, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-popover-trigger>
        <ui-popover-content side="bottom" side-offset="10" arrow-padding="12">
          <ui-popover-arrow></ui-popover-arrow>
          <ui-popover-title>Keyboard shortcuts</ui-popover-title>
          <ui-popover-description>Press ? anywhere to see them all.</ui-popover-description>
        </ui-popover-content>
      </ui-popover>
    </div>
  `
  const controls = root.querySelector<HTMLElement>("[data-slot=controls]")!
  const content = root.querySelector("ui-popover-content")!
  controls.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest("button")
    if (!button) {
      return
    }
    content.setAttribute("side", button.value)
    for (const other of controls.querySelectorAll("button")) {
      other.setAttribute("aria-pressed", String(other === button))
    }
  })
  root.querySelector("ui-popover")!.addEventListener("openchange", (event) => {
    const { reason, event: cause } = event.detail
    const inControls =
      cause?.target instanceof Node && controls.contains(cause.target)
    if (inControls && reason !== "escape-key") {
      event.preventDefault()
    }
  })
}

export { mount }
```

Open Help, then press Top, Right, Bottom, or Left. The popover stays open while it and its arrow move to that side.

Keep overflow visible around an arrow that extends outside the panel. If the body needs to scroll, put scrolling on an inner element. You can also draw an arrow with `::before`, using `data-side` and `--arrow-offset` to position it.

## Anchor

Set `anchor` to a CSS selector to position against something other than the trigger. The position is read again as the anchor moves.

```ts title="anchor.ts"
import "@ui-sdk/web/checkbox"
import "@ui-sdk/web/popover"
import { Check, createElement, SlidersHorizontal } from "lucide"

const types = [
  { label: "Documents", checked: true },
  { label: "Images", checked: false },
  { label: "Shared with me", checked: true },
]

const check = createElement(Check, { "aria-hidden": "true" }).outerHTML

let count = 0

function mount(root: HTMLElement) {
  const id = `popover-anchor-${++count}`
  root.innerHTML = `
    <div data-slot="row">
      <input id="${id}" type="search" placeholder="Search files…" aria-label="Search files" />
      <ui-popover>
        <ui-popover-trigger>
          <button aria-label="Search filters">${createElement(SlidersHorizontal, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-popover-trigger>
        <ui-popover-content anchor="#${id}" align="start" side-offset="8">
          <ui-popover-title>Filters</ui-popover-title>
          <ui-popover-description>Show only these kinds of files.</ui-popover-description>
          <div data-slot="stack">
            ${types
              .map(
                (type) => `
                  <label data-slot="label">
                    <ui-checkbox${type.checked ? " default-checked" : ""}>
                      <ui-checkbox-indicator>${check}</ui-checkbox-indicator>
                    </ui-checkbox>
                    ${type.label}
                  </label>
                `
              )
              .join("")}
          </div>
          <div data-slot="row">
            <ui-popover-close>
              <button>Cancel</button>
            </ui-popover-close>
            <ui-popover-close>
              <button data-variant="solid">Apply</button>
            </ui-popover-close>
          </div>
        </ui-popover-content>
      </ui-popover>
    </div>
  `
}

export { mount }
```

Press the filters button. The popover lines up with the search field instead of the small button beside it.

## Modal

`modal` controls how the popover shares the page:

- `"false"`, the default, leaves the page usable, and focus leaving the popover closes it.
- `"trap-focus"` keeps Tab inside while the page can still scroll and receive clicks.
- `"true"` also makes the rest of the page inert and locks scrolling.

```ts title="modal.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/textarea"
import "@ui-sdk/web/popover"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const modes = [
  { value: "false", label: "Non-modal" },
  { value: "trap-focus", label: "Trap focus" },
  { value: "true", label: "Modal" },
]

type Mode = "false" | "trap-focus" | "true"

const notes = {
  false: "Tab can leave, and focus leaving closes it.",
  "trap-focus": "Tab stays inside. The page still scrolls and takes clicks.",
  true: "Tab stays inside. The page is inert and doesn't scroll.",
}

const check = createElement(Check, { "aria-hidden": "true" }).outerHTML

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <ui-select default-value="false">
          <ui-select-label>Modal</ui-select-label>
          <ui-select-trigger>
            <button>
              <ui-select-value></ui-select-value>
              ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-select-trigger>
          <ui-select-content hidden>
            ${modes
              .map(
                (option) => `
                  <ui-select-item value="${option.value}">
                    ${option.label}
                    <ui-select-item-indicator>${check}</ui-select-item-indicator>
                  </ui-select-item>
                `
              )
              .join("")}
          </ui-select-content>
        </ui-select>
      </div>
      <ui-popover modal="false">
        <ui-popover-trigger>
          <button>Add Comment</button>
        </ui-popover-trigger>
        <ui-popover-content>
          <ui-popover-title>Add a comment</ui-popover-title>
          <ui-popover-description>${notes.false}</ui-popover-description>
          <ui-field>
            <ui-field-label>Comment</ui-field-label>
            <ui-textarea>
              <textarea>Looks good to me.</textarea>
            </ui-textarea>
          </ui-field>
          <div data-slot="row">
            <ui-popover-close>
              <button>Cancel</button>
            </ui-popover-close>
            <ui-popover-close>
              <button data-variant="solid">Comment</button>
            </ui-popover-close>
          </div>
        </ui-popover-content>
      </ui-popover>
    </div>
  `
  const popover = root.querySelector("ui-popover")!
  const description = root.querySelector("ui-popover-description")!
  root.querySelector("ui-select")!.addEventListener("valuechange", (event) => {
    const mode = event.detail.value as Mode | null
    if (!mode) {
      return
    }
    popover.setAttribute("modal", mode)
    description.textContent = notes[mode]
  })
}

export { mount }
```

Choose a mode, open Add Comment, and try Tab or clicking the page.

## Focus

Use `initial-focus` to choose the first focused element, or `"none"` to leave focus where it is. `final-focus` controls where focus returns. Opening on hover leaves focus alone; opening with touch focuses the panel itself so no on-screen keyboard appears. See [popup focus](../popups.md#focus) for the shared focus rules.

```ts title="focus.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import "@ui-sdk/web/popover"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="row">
      <ui-popover>
        <ui-popover-trigger>
          <button>Rename</button>
        </ui-popover-trigger>
        <ui-popover-content>
          <ui-popover-title>Rename file</ui-popover-title>
          <ui-popover-description>Focus starts in the first field.</ui-popover-description>
          <ui-field>
            <ui-field-label>Name</ui-field-label>
            <ui-input>
              <input value="Q3 roadmap.pdf" />
            </ui-input>
          </ui-field>
          <div data-slot="row">
            <ui-popover-close>
              <button>Cancel</button>
            </ui-popover-close>
            <ui-popover-close>
              <button data-variant="solid">Save</button>
            </ui-popover-close>
          </div>
        </ui-popover-content>
      </ui-popover>
      <ui-popover>
        <ui-popover-trigger>
          <button>Publish</button>
        </ui-popover-trigger>
        <ui-popover-content initial-focus="[data-autofocus]">
          <ui-popover-title>Publish changes?</ui-popover-title>
          <ui-popover-description>Focus starts on Publish, not Cancel.</ui-popover-description>
          <div data-slot="row">
            <ui-popover-close>
              <button>Cancel</button>
            </ui-popover-close>
            <ui-popover-close>
              <button data-autofocus data-variant="solid">Publish</button>
            </ui-popover-close>
          </div>
        </ui-popover-content>
      </ui-popover>
      <ui-popover>
        <ui-popover-trigger>
          <button>Status</button>
        </ui-popover-trigger>
        <ui-popover-content initial-focus="none" final-focus="none">
          <ui-popover-title>All systems normal</ui-popover-title>
          <ui-popover-description>Focus stays on the trigger.</ui-popover-description>
        </ui-popover-content>
      </ui-popover>
    </div>
  `
}

export { mount }
```

Open each one: Rename focuses its field, Publish focuses its Publish button, and Status leaves focus on the trigger.

## Open on Hover

`open-on-hover` adds pointer opening while keeping click, keyboard, and touch activation. `delay` and `close-delay` control the pause before opening and closing. You can cross the gap into the content and interact with it.

```ts title="hover.ts"
import "@ui-sdk/web/popover"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-popover open-on-hover delay="200" close-delay="150">
      <ui-popover-trigger>
        <button>@kofi</button>
      </ui-popover-trigger>
      <ui-popover-content side-offset="8">
        <ui-popover-arrow></ui-popover-arrow>
        <ui-popover-title>Kofi Mensah</ui-popover-title>
        <ui-popover-description>Engineering manager, platform team.</ui-popover-description>
        <div data-slot="row">
          <button type="button" data-size="sm" data-variant="solid">Follow</button>
        </div>
      </ui-popover-content>
    </ui-popover>
  `
  root
    .querySelector("ui-popover-content button")!
    .addEventListener("click", () => log(root, "Followed @kofi"))
}

export { mount }
```

Hover @kofi, then move into the popover and press Follow. You can also open it by pressing the trigger.

## Controlled

Set the element's `open` property and listen for `openchange` to keep another control in sync. Cancel a proposed change with `event.preventDefault()`. See [state and events](../state-and-events.md) for the common change contract.

```ts title="controlled.ts"
import "@ui-sdk/web/checkbox"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import "@ui-sdk/web/popover"
import { Check, createElement } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <ui-checkbox>
            <ui-checkbox-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-checkbox-indicator>
          </ui-checkbox>
          Open
        </label>
      </div>
      <ui-popover>
        <ui-popover-trigger>
          <button>Set Status</button>
        </ui-popover-trigger>
        <ui-popover-content>
          <ui-popover-title>Set a status</ui-popover-title>
          <ui-popover-description>Your team sees it next to your name.</ui-popover-description>
          <ui-field>
            <ui-field-label>Status</ui-field-label>
            <ui-input>
              <input value="In a meeting" />
            </ui-input>
          </ui-field>
          <div data-slot="row">
            <ui-popover-close>
              <button>Cancel</button>
            </ui-popover-close>
            <ui-popover-close>
              <button data-variant="solid">Save</button>
            </ui-popover-close>
          </div>
        </ui-popover-content>
      </ui-popover>
    </div>
  `
  const controls = root.querySelector('[data-slot="controls"]')!
  const toggle = root.querySelector("ui-checkbox")!
  const popover = root.querySelector("ui-popover")!
  toggle.addEventListener("checkedchange", (event) => {
    popover.open = event.detail.value === true
  })
  popover.addEventListener("openchange", (event) => {
    const { value, reason, event: cause } = event.detail
    const inControls =
      cause?.target instanceof Node && controls.contains(cause.target)
    if (inControls && reason !== "escape-key") {
      return event.preventDefault()
    }
    toggle.checked = value
    log(root, `${value ? "Opened" : "Closed"} (${reason})`)
  })
}

export { mount }
```

Check Open or press Set Status, then close the popover. The console logs each change and its reason.

## Keyboard Shortcut

Set a trigger's `shortcut` to toggle the popover from the keyboard. `mod+i` means Command+I on Apple platforms and Control+I elsewhere. The Shortcut part displays the platform's keys, and the trigger advertises them through `aria-keyshortcuts`.

```ts title="shortcut.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import "@ui-sdk/web/popover"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-popover>
      <ui-popover-trigger shortcut="mod+i">
        <button>
          Invite
          <ui-popover-shortcut></ui-popover-shortcut>
        </button>
      </ui-popover-trigger>
      <ui-popover-content>
        <ui-popover-title>Invite people</ui-popover-title>
        <ui-popover-description>They'll get an email with a link to join.</ui-popover-description>
        <ui-field>
          <ui-field-label>Email</ui-field-label>
          <ui-input>
            <input type="email" placeholder="wren@example.com" />
          </ui-input>
        </ui-field>
        <div data-slot="row">
          <ui-popover-close>
            <button>Cancel</button>
          </ui-popover-close>
          <ui-popover-close>
            <button data-variant="solid">Send Invite</button>
          </ui-popover-close>
        </div>
      </ui-popover-content>
    </ui-popover>
  `
}

export { mount }
```

Press Command+I or Control+I to open Invite. Press the same shortcut again, or Escape, to close it.

## Triggers Outside the Popover

Give the popover an `id`, and point each trigger at it with `for`. Each trigger passes its row as its `payload` property; read the active row with `api.getPayload()` or the `payloadchange` event. Only the active trigger is expanded and receives focus back. Opening from another row updates the same panel, so one editor can serve the whole list.

`api.open({ payload, anchor })` opens it from code and returns a promise with the closing reason and any `returnValue`. The payload stays available during the exit animation. See [controllers](../controllers.md) for the shared pattern.

```ts title="payload.ts"
import "@ui-sdk/web/field"
import type { UiPopoverElement } from "@ui-sdk/web/popover"
import "@ui-sdk/web/popover"
import { log } from "./log"

type Member = { name: string; role: string }

const roles = ["Admin", "Editor", "Viewer"]

let count = 0

function mount(root: HTMLElement) {
  const id = `member-editor-${++count}`
  const members: Member[] = [
    { name: "Hollis Grant", role: "Owner" },
    { name: "Inès Moreau", role: "Editor" },
    { name: "Kofi Mensah", role: "Viewer" },
    { name: "Wren Takahashi", role: "Viewer" },
  ]
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Edit Newest Member</button>
      </div>
      <ul data-slot="list"></ul>
      <ui-popover id="${id}">
        <ui-popover-content align="end" side-offset="8">
          <ui-popover-title></ui-popover-title>
          <ui-popover-description>Roles decide what they can change.</ui-popover-description>
          <form data-slot="stack" method="dialog">
            <ui-field>
              <ui-field-label>Role</ui-field-label>
              <select name="role">
                ${roles.map((role) => `<option>${role}</option>`).join("")}
              </select>
            </ui-field>
            <div data-slot="row">
              <button type="submit" value="cancel" formnovalidate>Cancel</button>
              <button type="submit" value="save" data-variant="solid">Save</button>
            </div>
          </form>
        </ui-popover-content>
      </ui-popover>
    </div>
  `
  const popover = root.querySelector<UiPopoverElement<Member>>("ui-popover")!
  const form = root.querySelector("form")!
  const list = root.querySelector("ul")!

  const rows = new Map<Member, HTMLElement>()
  for (const member of members) {
    const item = document.createElement("li")
    item.dataset.slot = "row"
    item.innerHTML = `${member.name}<span data-slot="hint">${member.role}</span>`
    const trigger = Object.assign(
      document.createElement("ui-popover-trigger"),
      { payload: member }
    )
    trigger.setAttribute("for", id)
    trigger.toggleAttribute("disabled", member.role === "Owner")
    trigger.innerHTML = `<button aria-label="Edit ${member.name}" data-size="sm" data-variant="ghost">Edit</button>`
    item.append(trigger)
    rows.set(member, item)
    list.append(item)
  }

  const show = (member?: Member) => {
    root.querySelector("ui-popover-title")!.textContent = member?.name ?? ""
    form.querySelector("select")!.value = member?.role ?? ""
  }
  popover.addEventListener("payloadchange", (event) => {
    const member = event.detail.value
    show(member)
    if (member) {
      log(root, `Editing ${member.name}`)
    }
  })
  popover.addEventListener("openchange", (event) => {
    if (event.detail.value) {
      show(popover.api.getPayload())
    }
  })
  form.addEventListener("submit", (event) => {
    const member = popover.api.getPayload()
    if ((event.submitter as HTMLButtonElement).value !== "save" || !member) {
      return
    }
    member.role = String(new FormData(form).get("role"))
    rows.get(member)!.querySelector("span")!.textContent = member.role
  })

  const opener = root.querySelector<HTMLButtonElement>(
    "[data-slot=controls] button"
  )!
  opener.addEventListener("click", async () => {
    const result = await popover.api.open({
      payload: members[members.length - 1],
      anchor: opener,
    })
    log(
      root,
      `Closed (${result.reason}), returned ${result.returnValue ?? "nothing"}`
    )
  })
}

export { mount }
```

Edit Inès Moreau or Kofi Mensah and save a new role. The owner can't be edited. Edit Newest Member opens the same editor from code, and the console logs how it closed.

## Animation

The content has `data-starting-style` while it opens and `data-ending-style` while it closes. Transition from those states, and the popover stays mounted until the exit finishes. `openchangecomplete` fires after the transition, and `keep-mounted` keeps the closed content in the page, hidden. See [styling and animation](../styling-and-animation.md) for the common lifecycle.

```ts title="animation.ts"
import "@ui-sdk/web/popover"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-popover>
      <ui-popover-trigger>
        <button>What's New</button>
      </ui-popover-trigger>
      <ui-popover-content keep-mounted>
        <ui-popover-title>What's new</ui-popover-title>
        <ui-popover-description>Comments now support threads and reactions.</ui-popover-description>
        <div data-slot="row">
          <ui-popover-close>
            <button data-variant="solid">Got It</button>
          </ui-popover-close>
        </div>
      </ui-popover-content>
    </ui-popover>
  `
  const popover = root.querySelector("ui-popover")!
  popover.addEventListener("openchange", (event) =>
    log(root, event.detail.value ? "Opening" : "Closing")
  )
  popover.addEventListener("openchangecomplete", (event) =>
    log(root, event.detail.value ? "Open" : "Closed")
  )
}

export { mount }
```

Open What's New, then press Got It. The console logs Opening, Open, Closing, and Closed.

## Presentation

`presentation="sheet"` shows the task as a sheet; `"auto"` chooses a sheet on small touch screens each time it opens. A sheet is modal by default and can be swiped down to dismiss. If dismissal is disabled, it springs back and reports the attempt.

Style `data-presentation` for both layouts. The sheet manages its own position and movement, so leave its translation alone and avoid the floating panel's fixed width. `--sheet-backdrop` sets the dim behind it.

```ts title="presentation.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import "@ui-sdk/web/popover"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-popover presentation="sheet">
      <ui-popover-trigger>
        <button>Add Reminder</button>
      </ui-popover-trigger>
      <ui-popover-content>
        <ui-popover-title>New reminder</ui-popover-title>
        <ui-popover-description>We'll notify you at the time you pick.</ui-popover-description>
        <ui-field>
          <ui-field-label>Remind me to</ui-field-label>
          <ui-input>
            <input value="Send the Q3 roadmap" />
          </ui-input>
        </ui-field>
        <div data-slot="row">
          <ui-popover-close>
            <button>Cancel</button>
          </ui-popover-close>
          <ui-popover-close>
            <button data-variant="solid">Save</button>
          </ui-popover-close>
        </div>
      </ui-popover-content>
    </ui-popover>
  `
}

export { mount }
```

Open Add Reminder as a sheet. Dismiss it with Cancel, Save, Escape, the dimmed area, or a downward swipe on a touch screen.

## Container

Popovers render in place by default and use the browser's top layer. `container` moves their DOM to another element while keyboard order still follows the trigger. See [popups](../popups.md#hidden-content-and-containers) for the shared container behavior.

```html
<div id="details-container"></div>
<ui-popover container="#details-container">
  <ui-popover-trigger>
    <button>Details</button>
  </ui-popover-trigger>
  <ui-popover-content>...</ui-popover-content>
</ui-popover>
```

## Custom Rendering

Elements have no render functions. The trigger and Close parts wrap your own `<button>` or link, and `as-child` on the title uses your own heading. Read state from the data attributes every part sets: here the trigger's button holds both labels, and the stylesheet shows one or the other while `data-open` is set.

```ts title="custom-rendering.ts"
import "@ui-sdk/web/popover"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-popover>
      <ui-popover-trigger shortcut="mod+u">
        <button>
          <span data-hide="open">Show Updates</span>
          <span data-show="open">Hide Updates</span>
          <ui-popover-shortcut></ui-popover-shortcut>
        </button>
      </ui-popover-trigger>
      <ui-popover-content>
        <ui-popover-title as-child><h3>Updates</h3></ui-popover-title>
        <ui-popover-description>Version 2.4 adds threaded comments.</ui-popover-description>
        <ui-popover-close>
          <a href="#">Read the Changelog</a>
        </ui-popover-close>
      </ui-popover-content>
    </ui-popover>
  `
}

export { mount }
```

Open Show Updates. The trigger's label comes from its state, the title renders as an h3, and Close renders as a link.

## Styling

Use `data-open` on the trigger to mark it while its popover shows, and `data-side` and `data-align` to style the content and arrow for where they landed. Put `transform-origin: var(--transform-origin)` on the content so a scale animation starts from the trigger.

Each part has a `data-slot`, such as `popover-content`, and its state attributes are listed under [Data Attributes](#data-attributes).

### `<ui-popover-content>`
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

### `<ui-popover-viewport>`
- `--keyboard-inset`: While it presents as a sheet: how many pixels of the page the on-screen keyboard covers, 0 without one.
- `--visual-viewport-width`: While it presents as a sheet: the width of the part of the page you can see.
- `--visual-viewport-height`: While it presents as a sheet: the height of the part of the page you can see, above the keyboard.
- `--visual-viewport-top`: While it presents as a sheet: how far the part of the page you can see is scrolled from the top of the layout, as when the keyboard pushes it up.

## Data Attributes

`<ui-popover-title>`, `<ui-popover-description>` and `<ui-popover-close>` have no state attributes.

### `<ui-popover-trigger>`
`[data-slot="popover-trigger"]`

- `data-closed`: Present while the popover is closed, including while it animates out.
- `data-disabled`: Present when the trigger is disabled.
- `data-open`: Present while the popover is open. On a trigger, while it's open from that trigger.

### `<ui-popover-content>`
`[data-slot="popover-content"]`

- `data-closed`: Present while the popover is closed, including while it animates out.
- `data-presentation` (`popover`, `sheet`): How the popover presents this time it's open.
- `data-open`: Present while the popover is open. On a trigger, while it's open from that trigger.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the popover animates out. Style the state you animate to.

### `<ui-popover-arrow>`
`[data-slot="popover-arrow"]`

- `data-closed`: Present while the popover is closed, including while it animates out.
- `data-open`: Present while the popover is open. On a trigger, while it's open from that trigger.

## API Reference

Props are attributes in kebab case, like `open-on-hover` and `side-offset`: `"false"` is false, and numbers
are numbers. `anchor` and `container` take CSS selectors. Callbacks are DOM events.

### Popover

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `open?` (`boolean`): Whether the popover is open. Pass it to control the popover.
- `defaultOpen?` (`boolean`): Whether the popover starts open, when uncontrolled.
- `openchange event`: Runs when the popover wants to open or close. `details.reason` says why, and `details.cancel()` stops it.
- `openchangecomplete event`: Runs once the popover has finished opening or closing, after any animation.
- `payloadchange event`: Runs when the payload the content shows changes: a trigger with another payload opens the popover, or takes the open popover over, which fires no `openchange`, and so does a controller's `open({ payload })` on the open popover. `details.cancel()` keeps the previous payload.
- `modal?` (`"trap-focus" | boolean`): `false`: the rest of the page stays usable, and focus leaving the popover closes it. `true`: also traps focus, locks scroll and makes the rest of the page inert, and an outside press only closes the popover. `"trap-focus"`: traps focus but leaves the page scrollable and clickable.
- `openOnHover?` (`boolean`): Whether resting the pointer on the trigger opens the popover. Pressing the trigger still opens it, so keyboard and touch users can too.
- `delay?` (`number`): Milliseconds the pointer rests on the trigger before the popover opens, with `openOnHover`.
- `closeDelay?` (`number`): Milliseconds before the popover closes once the pointer leaves it and its trigger, with `openOnHover`.
- `presentation?` (`PresentationSetting<"popover">`): How the popover presents. `"sheet"` slides it up from the bottom of the screen, where it can be swiped away, and `"auto"` does that on small touch screens. Decided each time it opens; the server renders `"popover"` for `"auto"`.
- `controller?` (`PopupController<any, PopoverOpenChangeReason, {}, string, PopoverPayloadChangeReason>`): Opens, closes and inspects the popover from anywhere, and connects triggers outside it. Create one with `createPopoverController()`.
- `dismissible?` (`boolean`): Whether Escape, an outside press, focus or the window leaving, Android's back gesture and a sheet's swipe can close it. Triggers, Close parts and the controller always can. Pass `false` while it holds unsaved work, and ask in `dismissattempt`.
- `dismissattempt event`: Runs when `dismissible` refused a dismissal made on purpose: Escape, an outside press, back or a swipe. Focus or the window leaving is refused without it. Ask "Discard changes?" here.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### PopoverTrigger

A trigger outside the popover names it with `for="popover-id"`, and takes `payload` as a property.

- `disabled?` (`boolean`): Stops the trigger from opening the popover. A native button can't be focused or pressed, unless `focusableWhenDisabled` is set.
- `focusableWhenDisabled?` (`boolean`): Keeps a disabled trigger in the tab order with `aria-disabled` instead of the native attribute, so it can host a tooltip that says why. Presses still do nothing.
- `payload?` (`unknown`): Data for the content to render when this trigger opens the popover, like the row it belongs to.
- `shortcut?` (`string`): A keyboard shortcut that presses the trigger, like `"mod+i"`. `mod` is Command on Apple platforms and Control elsewhere. Sets `aria-keyshortcuts`.
- `controller?` (`PopupController<any, PopoverOpenChangeReason, {}, string, PopoverPayloadChangeReason>`): Connects a trigger outside the popover, like one per table row, to the popover with this controller.

### PopoverContent

- `side?` (`Side`): Which side of the anchor the popup opens on. Flips to the other side when there isn't room. Which side of the trigger the popover opens on.
- `align?` (`Align`): How the popup lines up with the anchor along that side. `start` and `end` follow the reading direction. How the popover lines up with the trigger along that side.
- `sideOffset?` (`number`): Gap between the anchor and the popup, in pixels. Gap between the trigger and the popover, in pixels.
- `alignOffset?` (`number`): Shift along the anchor, in pixels. Shift along the trigger, in pixels.
- `collisionPadding?` (`number`): Space to keep from the viewport edges, in pixels.
- `arrowPadding?` (`number`): Space to keep between the arrow and the popup's corners, in pixels.
- `anchor?` (`string | Anchor | null`): Positions the popup against this instead of its trigger: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. It's read on every check, so it can move. A controller's `open({ anchor })` wins for that open.
- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `initialFocus?` (`PopoverInitialFocus`): Where focus goes when the popover opens. Opening on hover never moves focus, and opening with touch focuses the popover itself so no on-screen keyboard appears.
- `finalFocus?` (`PopupFocusTarget`): Where focus goes when the popover closes while focus is inside it.
- `keepMounted?` (`boolean`): Whether the popover stays in the page, hidden, while closed. For animation libraries that drive the exit from state.

### PopoverArrow

Points at the trigger from the side the popover landed on.

### PopoverTitle

Names the popover. With `as-child`, it uses the heading inside it.

### PopoverDescription

Describes the popover while it's rendered.

### PopoverClose

Closes the popover. Wraps your own `button` or link.

### PopoverShortcut

- `shortcut?` (`string`): The keys to show. Inside a trigger, its `shortcut`.

### State

The same state shows as data attributes on each element.

`PopoverTrigger`:

- `open` (`boolean`): Whether the popover is open from this trigger.
- `disabled` (`boolean`): Set by the trigger's `disabled` prop, which stops it opening the popover.

`PopoverContent`:

- `open` (`boolean`): Whether the popover is open. False while it animates out.
- `modal` (`boolean | "trap-focus"`): The `modal` setting.
- `presentation` (`"popover" | "sheet"`): How it presents this time it's open.
- `payload` (`Payload | undefined`): The payload of the last open, from the trigger that opened it or a controller, typed as the controller's `Payload`.

`PopoverArrow`:

- `open` (`boolean`): Whether the popover is open. False as soon as it starts closing, while it still animates out.

`PopoverShortcut`:

- `text` (`string`): The shortcut formatted for this platform: `⌘I` on Apple platforms and `Ctrl+I` elsewhere. Empty without one.

### Reasons

`event.detail.reason` says why the popover opened or closed.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `trigger-hover` (`PointerEvent`): The pointer rested on a trigger, or left it, with hover opening.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `focus-out` (`KeyboardEvent | FocusEvent`): Focus left the layer, or Tab moved it out.
- `window-blur` (`FocusEvent`): The window lost focus.
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

For a payload change, it says what opened the popover or took it over.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `trigger-hover` (`PointerEvent`): The pointer rested on a trigger, or left it, with hover opening.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

With `dismissible` false, the refused dismissals `dismissattempt` reports:

- `outside-press` (`MouseEvent`): A press outside the layer.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.

### Controller

The element's `api` property has the same methods. The `open` property reads and sets whether the popover
is open.

Every write method takes an optional `{ reason, event }`, passed to `openchange`.

- `isOpen()` (`() => boolean`): Whether it's open. False as soon as it starts closing, while it still animates out.
- `setOpen(open, options?)` (`(open: boolean, options?: PopupChangeOptions<PopoverOpenChangeReason> | undefined) => boolean`): Opens or closes it. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (PopupChangeOptions<PopoverPayloadChangeReason> & { payload?: Payload | undefined; anchor?: Anchor | undefined; signal?: AbortSignal | undefined; }) | undefined) => Promise<...>`): Opens it, and resolves once it closes, with why, how and any return value. Resolves exactly once and never rejects: on the next close from any source, when `signal` aborts, or with reason `"unmount"` when the component leaves the page.
- `close(options?)` (`(options?: (PopupChangeOptions<PopoverOpenChangeReason> & { returnValue?: Result | undefined; }) | undefined) => boolean`): Closes it. `returnValue` is passed to the promise `open()` returned. Returns false when the close was canceled or it was already closed.
- `toggle(options?)` (`(options?: PopupChangeOptions<PopoverOpenChangeReason> | undefined) => boolean`): Opens it when it's closed, and closes it when it's open. Returns false when the change was canceled.
- `getPayload()` (`() => Payload | undefined`): The payload of the last open, from a controller or the trigger that opened it.
- `focus()` (`() => void`): Moves focus to the trigger that opened it last, or the first trigger.

### Events

Events fire on their own element and don't bubble, with the new state in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` on `openchange` cancels the change.

| Member                     | On                   | Description                                                                             |
| -------------------------- | -------------------- | --------------------------------------------------------------------------------------- |
| `open` property, attribute | `ui-popover`         | Whether the popover is open. The attribute sets where it starts, and is live            |
| `api` property             | `ui-popover`         | The [controller](#controller)                                                           |
| `openchange` event         | `ui-popover`         | `detail: { value: open, reason, event, source }`                                        |
| `openchangecomplete` event | `ui-popover`         | `detail: { value: open }`, after the animation                                          |
| `payloadchange` event      | `ui-popover`         | `detail: { value: payload, reason, event, source }`, when the content's payload changes |
| `dismissattempt` event     | `ui-popover`         | `detail: { reason, event }`, when a dismissal was refused                               |
| `payload` property         | `ui-popover-trigger` | Data for the content, read when the trigger connects                                    |
| `for` attribute            | `ui-popover-trigger` | The `id` of a popover the trigger opens from outside it                                 |

## Accessibility

The trigger is a button that opens a dialog, and focus inside follows the [WAI-ARIA dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

### Tested Behavior

Every line below is an automated test.

**Trigger**

- Reflects the open state.
- Click opens the popover.
- Click on the open trigger closes the popover.
- Enter opens the popover.
- Space opens the popover.
- Points to the popover it controls while open.

**Focus**

- Opening moves focus to the first focusable element.
- Each time focus moves in, the popover is named by its title and described by its description.
- Tab moves through the popover in order.
- Shift+Tab from the first element returns focus to the trigger.
- Tab from the last element moves focus to the element after the trigger.
- Focus leaving the popover closes it.
- Escape closes the popover and returns focus to the trigger.
- Escape after a click returns focus to the trigger.
- The close button closes the popover and returns focus to the trigger.
- With initial focus none, opening leaves focus on the trigger.
- A virtual click from a screen reader moves focus into the popover.
- A touch press focuses the popover itself, so no on-screen keyboard appears.
- Closing after the trigger is gone moves focus to the element after where it was.
- Pressing a button inside keeps the popover open.

**Dismissal**

- Clicking outside closes the popover.
- Clicking inside the popover keeps it open.
- An outside press reaches what it hits.
- A press on empty space returns focus to the trigger.
- Escape while an input method is composing text leaves the popover open.
- Pressing a scrollbar outside the popover leaves it open.
- Pressing a button in a shadow root inside keeps the popover open.
- Tab into a button in a shadow root inside keeps the popover open.
- Escape on a button in a shadow root inside returns focus to the trigger.
- Switching windows leaves the popover open.

**Modal**

- With modal true, Tab stays inside the popover.
- With modal trap-focus, Tab stays inside the popover.
- With modal true, an outside press only closes the popover.
- With modal true, the page doesn't scroll while open.

**Hover**

- Resting the pointer on the trigger opens the popover.
- Moving the pointer into the popover keeps it open.
- Moving the pointer away closes the popover.
- Opening on hover leaves focus where it was.
- Keyboard focus on the trigger doesn't open the popover.
- Escape on a popover opened by hover leaves focus where it was.
- Pressing the trigger still opens the popover.

**Nested popovers**

- Using a nested popover keeps both open.
- Escape closes only the nested popover and returns focus to its trigger.
- Clicking outside closes every popover.

Runs in React, Vue and web components.

Additional behaviors:

**Enhancements**

- The popup writes --arrow-offset, where the trigger's center falls along its edge.
- Without a title, the trigger names the popover.
- Tab from the trigger of a popover opened by hover moves into it.
- A controller opens the popover from anywhere and moves focus in.
- A popover open from the start leaves focus alone.
- Modal popovers make the rest of the page inert and restore it exactly.
- Live regions keep announcing while a modal popover makes the page inert.
- Clicking into an iframe closes the popover.
- An infinite exit animation still unmounts.

**Shortcuts**

- A trigger's shortcut opens and closes the popover.
- The trigger advertises its shortcut, and its Shortcut part shows the keys to sighted users only.
- A Shortcut part shows its own keys.
- A trigger connected through a controller shows and binds its own shortcut.

**Web components**

- A title added after the popover connects names it. Web components only.
- Changing an attribute updates the part. Web components only.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while using the popover with a keyboard.

Runs in React, Vue and web components.
