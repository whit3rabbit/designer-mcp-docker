# Dialog

Open a focused task over the page.

A dialog gives a task its own space: share a link, edit a record, or collect a few details. It manages focus, Escape, outside presses, and returning to where you started.

```ts title="basic.ts"
import "@ui-sdk/web/dialog"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import { createElement, X } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-dialog>
      <ui-dialog-trigger>
        <button>Share</button>
      </ui-dialog-trigger>
      <ui-dialog-backdrop hidden></ui-dialog-backdrop>
      <ui-dialog-content hidden>
        <div data-slot="stack">
          <ui-dialog-title>Share link</ui-dialog-title>
          <ui-dialog-description>Anyone who has this link will be able to view this.</ui-dialog-description>
        </div>
        <ui-field>
          <ui-field-label>Link</ui-field-label>
          <ui-input>
            <input value="https://example.com/project" readonly />
          </ui-input>
        </ui-field>
        <div data-slot="row">
          <ui-dialog-close>
            <button data-variant="solid">Done</button>
          </ui-dialog-close>
        </div>
        <ui-dialog-close>
          <button aria-label="Close">${createElement(X, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-dialog-close>
      </ui-dialog-content>
    </ui-dialog>
  `
}

export { mount }
```

Open Share, then close it with either Close button, Escape, or a press outside. Focus returns to Share.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the component to register its elements. The import is safe on the server.

```ts
import "@ui-sdk/web/dialog"
```

## Composition

Use the following composition to build a `ui-dialog`:

```text
ui-dialog
├── ui-dialog-trigger
│   └── button
├── ui-dialog-backdrop
└── ui-dialog-content
    ├── ui-dialog-title
    ├── ui-dialog-description
    └── ui-dialog-close
        └── button
```

The title names the dialog; the description gives it context. A dialog can have several Close parts, each wrapping its own native button. Give an icon-only close button an accessible name, as the first example does. Give the content and backdrop `hidden` to keep them hidden before the elements upgrade.

The backdrop is optional. Without one, style the content’s `::backdrop`. For a question that requires an explicit answer, use [Alert Dialog](./alert-dialog.md).

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/dialog"
</script>

<ui-dialog>
  <ui-dialog-trigger><button>Open</button></ui-dialog-trigger>
  <ui-dialog-backdrop hidden></ui-dialog-backdrop>
  <ui-dialog-content hidden>
    <ui-dialog-title>Project details</ui-dialog-title>
    <ui-dialog-description
      >Review the details before continuing.</ui-dialog-description
    >
    <ui-dialog-close><button>Close</button></ui-dialog-close>
  </ui-dialog-content>
</ui-dialog>
```

## Build Your Own

`@ui-sdk/web/dialog` comes with ready-made `ui-dialog` elements. If you'd like to build your own, with your own element names, start from the `dialog` primitive in `@ui-sdk/core`:

```ts title="share-elements.ts"
import { dialog } from "@ui-sdk/core/dialog"
import { createParts, wrappedButton } from "@ui-sdk/web"

createParts(dialog, {
  root: "share-dialog",
  trigger: { tag: "share-trigger", target: wrappedButton, display: "contents" },
  backdrop: "share-backdrop",
  content: "share-panel",
  title: "share-title",
  description: "share-description",
  close: { tag: "share-close", target: wrappedButton, display: "contents" },
})
```

```html
<share-dialog>
  <share-trigger><button>Share</button></share-trigger>
  <share-backdrop hidden></share-backdrop>
  <share-panel hidden>
    <share-title>Share this page</share-title>
    <share-description>Anyone with the link can view it.</share-description>
    <share-close><button>Done</button></share-close>
  </share-panel>
</share-dialog>
```

Each element keeps the behavior, state and data attributes of its ready-made counterpart: the content opens in the top layer, traps focus and makes the page inert. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Scrollable Content

Keep the header and actions outside the scrolling area. A viewport height limit, a shrinking middle grid row, and `overflow-y: auto` keep long content usable. `initial-focus="content"` focuses the dialog itself so reading starts at the top.

```ts title="scrollable.ts"
import "@ui-sdk/web/dialog"

const paragraphs = [
  "These terms govern your use of the service. By creating an account, you agree to them and to the privacy policy that explains how we handle your data.",
  "You're responsible for the content you upload and for keeping your password safe. Tell us right away if you think someone else has used your account.",
  "We may change the service, and these terms, as the product grows. When a change affects you, we'll let you know by email at least 30 days before it takes effect.",
  "You can stop using the service at any time. We'll keep your data for 30 days after you close your account, so you can export it, and then delete it.",
  "The service is provided as is. To the extent the law allows, we aren't liable for indirect damages, lost profits or lost data.",
  "If you have questions about these terms, write to us. We read every message and reply within two working days.",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-dialog>
      <ui-dialog-trigger>
        <button>Scrollable Content</button>
      </ui-dialog-trigger>
      <ui-dialog-backdrop hidden></ui-dialog-backdrop>
      <ui-dialog-content initial-focus="content" hidden>
        <div data-slot="stack">
          <ui-dialog-title>Terms of service</ui-dialog-title>
          <ui-dialog-description>Please read before you continue.</ui-dialog-description>
        </div>
        <div data-slot="scroll">
          ${paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
        </div>
        <div data-slot="row">
          <ui-dialog-close>
            <button>Decline</button>
          </ui-dialog-close>
          <ui-dialog-close value="accept">
            <button data-variant="solid">Accept</button>
          </ui-dialog-close>
        </div>
      </ui-dialog-content>
    </ui-dialog>
  `
}

export { mount }
```

Open Scrollable Content in a short window. Scroll the terms while the title and Decline/Accept buttons stay in view.

## Forms

A form with `method="dialog"` closes the dialog on a valid submission. The submit button’s `value` becomes the `returnValue`, just like a Close part’s `value`. An ordinary form stays open until you close the dialog yourself.

```ts title="form.ts"
import "@ui-sdk/web/dialog"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-dialog>
      <ui-dialog-trigger>
        <button>New Article</button>
      </ui-dialog-trigger>
      <ui-dialog-backdrop hidden></ui-dialog-backdrop>
      <ui-dialog-content hidden>
        <div data-slot="stack">
          <ui-dialog-title>New article</ui-dialog-title>
          <ui-dialog-description>Save it as a draft or publish it now.</ui-dialog-description>
        </div>
        <form data-slot="stack" method="dialog">
          <ui-field>
            <ui-field-label>Title</ui-field-label>
            <ui-input>
              <input required value="Shipping updates for spring" />
            </ui-input>
          </ui-field>
          <div data-slot="row">
            <button type="submit" value="draft">Save Draft</button>
            <button data-variant="solid" type="submit" value="published">Publish</button>
          </div>
        </form>
      </ui-dialog-content>
    </ui-dialog>
  `
  root.querySelector("ui-dialog")!.addEventListener("openchange", (event) => {
    const { value, reason, returnValue } = event.detail
    if (!value) {
      log(root, returnValue ? `Saved as ${returnValue}` : `Closed (${reason})`)
    }
  })
}

export { mount }
```

Open New Article and choose Save Draft or Publish. The console logs the submitted button's value. An empty title prevents submission.

## Focus

Use `initial-focus` to pick where focus starts, and `final-focus` to choose where it goes after closing. Each takes a selector. The default returns to the trigger, or to the element focused before a controller opened the dialog. See [popup focus](../popups.md#focus) for the shared focus rules.

```html
<ui-dialog-content
  initial-focus="#invite-email"
  final-focus="#next-step"
  hidden
></ui-dialog-content>
```

## Controlled

Set the element’s `open` property and listen for `openchange` to keep another control in sync. Cancel a proposed change with `event.preventDefault()`. `openchangecomplete` reports when opening or closing has finished; see [state and events](../state-and-events.md) for the common change contract.

```ts title="controlled.ts"
import "@ui-sdk/web/checkbox"
import "@ui-sdk/web/dialog"
import { Check, createElement } from "lucide"
import { log } from "./log"

const topics = [
  { label: "Product updates", checked: true },
  { label: "Security alerts", checked: true },
  { label: "Weekly digest", checked: false },
]

const check = createElement(Check, { "aria-hidden": "true" }).outerHTML

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <ui-checkbox>
            <ui-checkbox-indicator>${check}</ui-checkbox-indicator>
          </ui-checkbox>
          Open
        </label>
      </div>
      <ui-dialog>
        <ui-dialog-trigger>
          <button>Notification Settings</button>
        </ui-dialog-trigger>
        <ui-dialog-backdrop hidden></ui-dialog-backdrop>
        <ui-dialog-content hidden>
          <div data-slot="stack">
            <ui-dialog-title>Notification settings</ui-dialog-title>
            <ui-dialog-description>Choose what we email you about.</ui-dialog-description>
          </div>
          <div data-slot="stack">
            ${topics
              .map(
                (topic) => `
                  <label data-slot="label">
                    <ui-checkbox${topic.checked ? " default-checked" : ""}>
                      <ui-checkbox-indicator>${check}</ui-checkbox-indicator>
                    </ui-checkbox>
                    ${topic.label}
                  </label>
                `
              )
              .join("")}
          </div>
          <div data-slot="row">
            <ui-dialog-close>
              <button data-variant="solid">Done</button>
            </ui-dialog-close>
          </div>
        </ui-dialog-content>
      </ui-dialog>
    </div>
  `
  const toggle = root.querySelector("ui-checkbox")!
  const dialog = root.querySelector("ui-dialog")!
  toggle.addEventListener("checkedchange", (event) => {
    dialog.open = event.detail.value === true
  })
  dialog.addEventListener("openchange", (event) => {
    const { value, reason } = event.detail
    toggle.checked = value
    log(root, `${value ? "Opened" : "Closed"} (${reason})`)
  })
  dialog.addEventListener("openchangecomplete", (event) => {
    log(root, event.detail.value ? "Finished opening" : "Finished closing")
  })
}

export { mount }
```

Check Open or press Notification Settings, then close the dialog. The console logs each change, its reason and when it finishes.

## Keyboard Shortcut

A trigger’s `shortcut` opens it from the keyboard. `mod+j` means Command+J on Apple platforms and Control+J elsewhere. A `ui-dialog-shortcut` inside the trigger's button displays the right keys and the trigger exposes `aria-keyshortcuts`.

```ts title="shortcut.ts"
import "@ui-sdk/web/dialog"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import { createElement, Plus } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-dialog>
      <ui-dialog-trigger shortcut="mod+j">
        <button>
          ${createElement(Plus, { "aria-hidden": "true" }).outerHTML}
          New Contact
          <ui-dialog-shortcut></ui-dialog-shortcut>
        </button>
      </ui-dialog-trigger>
      <ui-dialog-backdrop hidden></ui-dialog-backdrop>
      <ui-dialog-content hidden>
        <div data-slot="stack">
          <ui-dialog-title>New contact</ui-dialog-title>
          <ui-dialog-description>Add someone to your address book.</ui-dialog-description>
        </div>
        <form data-slot="stack" method="dialog">
          <ui-field>
            <ui-field-label>Name</ui-field-label>
            <ui-input>
              <input name="name" required placeholder="Kofi Mensah" />
            </ui-input>
          </ui-field>
          <ui-field>
            <ui-field-label>Email</ui-field-label>
            <ui-input>
              <input name="email" type="email" required placeholder="kofi@example.com" />
            </ui-input>
          </ui-field>
          <div data-slot="row">
            <ui-dialog-close>
              <button type="button">Cancel</button>
            </ui-dialog-close>
            <button data-variant="solid" type="submit" value="save">Save Contact</button>
          </div>
        </form>
      </ui-dialog-content>
    </ui-dialog>
  `
}

export { mount }
```

Press Command+J or Control+J to open New contact. The button shows the keys, and Escape returns focus to it.

## Animation

The content and backdrop have `data-starting-style` while they open and `data-ending-style` while they close. Transition from those states, and the dialog stays mounted until the exit finishes. `openchangecomplete` fires after the transition, and `keep-mounted` keeps the content in the page while closed.

```css
[data-slot="dialog-content"] {
  transition:
    opacity 0.2s,
    translate 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    scale 0.25s cubic-bezier(0.22, 1, 0.36, 1);

  &:is([data-starting-style], [data-ending-style]) {
    opacity: 0;
    translate: 0 16px;
    scale: 0.96;
  }

  &[data-ending-style] {
    transition-duration: 0.15s;
  }
}
```

```ts title="animation.ts"
import "@ui-sdk/web/dialog"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-dialog>
      <ui-dialog-trigger>
        <button>Slide In</button>
      </ui-dialog-trigger>
      <ui-dialog-backdrop hidden></ui-dialog-backdrop>
      <ui-dialog-content keep-mounted hidden>
        <div data-slot="stack">
          <ui-dialog-title>Slide and fade</ui-dialog-title>
          <ui-dialog-description>300ms in and out. Focus returns as soon as it starts closing.</ui-dialog-description>
        </div>
        <div data-slot="row">
          <ui-dialog-close>
            <button data-variant="solid">Close</button>
          </ui-dialog-close>
        </div>
      </ui-dialog-content>
    </ui-dialog>
  `
  root
    .querySelector("ui-dialog")!
    .addEventListener("openchangecomplete", (event) => {
      log(root, event.detail.value ? "Finished opening" : "Finished closing")
    })
}

export { mount }
```

Open the dialog and close it. The console logs when each animation finishes; focus returns as closing starts.

## Modal

`modal` controls how the dialog shares the page:

- `true`, the default, makes the page inert, locks scrolling, and keeps Tab inside.
- `"trap-focus"` keeps Tab inside while the page can still scroll and receive clicks. A click on the page also closes the dialog, unless `close-on-outside-press` is false.
- `false` puts the dialog beside the page and lets focus leave it. Escape closes it while focus is inside; outside presses close it only when `close-on-outside-press` is enabled.

To keep a small part of the page usable while a modal dialog is open, like a chat launcher, list it in `persistent-elements`: a comma-separated list of selectors. Assign the `persistentElements` property an array of elements, or a function returning elements when the dialog opens. Persistent elements don't change stacking on their own.

Dialogs render where you put them and use the browser's top layer. Set `container` to a selector when their DOM needs to live elsewhere, like a shadow root. The [popup guide](../popups.md#hidden-content-and-containers) covers containers and iframes.

```ts title="modal.ts"
import "@ui-sdk/web/checkbox"
import "@ui-sdk/web/dialog"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const modes = [
  { value: "true", label: "Modal" },
  { value: "trap-focus", label: "Trap focus" },
  { value: "false", label: "Non-modal" },
]

type Mode = "true" | "trap-focus" | "false"

const notes = {
  true: "The rest of the page is inert and doesn't scroll.",
  "trap-focus":
    "Tab stays inside, and the page still scrolls and takes clicks.",
  false:
    "The page stays usable. Tab leaves the notes, and Escape closes them while focus is inside.",
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
        <label data-slot="label">
          <ui-checkbox>
            <ui-checkbox-indicator>${check}</ui-checkbox-indicator>
          </ui-checkbox>
          Close on outside press
        </label>
      </div>
      <ui-dialog modal="false">
        <ui-dialog-trigger>
          <button>Open Notes</button>
        </ui-dialog-trigger>
        <ui-dialog-content hidden>
          <div data-slot="stack">
            <ui-dialog-title>Notes</ui-dialog-title>
            <ui-dialog-description>${notes.false}</ui-dialog-description>
          </div>
          <textarea aria-label="Notes">Call the printer about the proofs.</textarea>
          <div data-slot="row">
            <ui-dialog-close>
              <button data-variant="solid">Done</button>
            </ui-dialog-close>
          </div>
        </ui-dialog-content>
      </ui-dialog>
    </div>
  `
  const dialog = root.querySelector("ui-dialog")!
  const trigger = root.querySelector("ui-dialog-trigger")!
  const description = root.querySelector("ui-dialog-description")!
  const backdrop = document.createElement("ui-dialog-backdrop")
  root.querySelector("ui-select")!.addEventListener("valuechange", (event) => {
    const mode = event.detail.value as Mode | null
    if (!mode) {
      return
    }
    dialog.setAttribute("modal", mode)
    if (mode === "true") {
      trigger.after(backdrop)
    } else {
      backdrop.remove()
    }
    description.textContent = notes[mode]
  })
  root
    .querySelector("ui-checkbox")!
    .addEventListener("checkedchange", (event) => {
      dialog.setAttribute(
        "close-on-outside-press",
        String(event.detail.value === true)
      )
    })
}

export { mount }
```

Choose a mode, open Notes, and try Tab or clicking the page. Check Close on outside press to compare dismissal.

## Warn Before Closing a Dirty Form

Set `dismissible` to `"false"` while there are unsaved changes. Escape, an outside press, or a back gesture then keeps the dialog open and fires `dismissattempt`. Explicit Close parts and controller calls still work, so you can offer a deliberate way out.

```ts title="dirty-form.ts"
import "@ui-sdk/web/dialog"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-dialog>
      <ui-dialog-trigger>
        <button>Write a Post</button>
      </ui-dialog-trigger>
      <ui-dialog-backdrop hidden></ui-dialog-backdrop>
      <ui-dialog-content hidden>
        <div data-slot="stack">
          <ui-dialog-title>New post</ui-dialog-title>
          <ui-dialog-description>Share an update with your team.</ui-dialog-description>
        </div>
        <ui-field>
          <ui-field-label>Post</ui-field-label>
          <textarea placeholder="What's new?"></textarea>
        </ui-field>
        <div data-slot="row" role="alert" hidden>
          Discard your changes?
          <div data-slot="row">
            <button type="button">Keep Editing</button>
            <button data-variant="solid" type="button">Discard</button>
          </div>
        </div>
        <div data-slot="row">
          <ui-dialog-close value="post">
            <button data-variant="solid">Post</button>
          </ui-dialog-close>
        </div>
      </ui-dialog-content>
    </ui-dialog>
  `
  const dialog = root.querySelector("ui-dialog")!
  const post = root.querySelector("textarea")!
  const alert = root.querySelector<HTMLElement>('[role="alert"]')!
  const actions = root.querySelector<HTMLElement>(
    'ui-dialog-content > [data-slot="row"]:not([role])'
  )!
  const [keep, discard] = alert.querySelectorAll("button")
  const ask = (asking: boolean) => {
    alert.hidden = !asking
    actions.hidden = asking
  }
  post.addEventListener("input", () => {
    if (post.value) {
      dialog.setAttribute("dismissible", "false")
    } else {
      dialog.removeAttribute("dismissible")
    }
  })
  dialog.addEventListener("dismissattempt", () => ask(true))
  keep.addEventListener("click", () => {
    ask(false)
    post.focus()
  })
  discard.addEventListener("click", () => (dialog.open = false))
  dialog.addEventListener("openchange", (event) => {
    if (event.detail.value) {
      return
    }
    ask(false)
    post.value = ""
    dialog.removeAttribute("dismissible")
  })
}

export { mount }
```

Type a post, then press Escape or click outside. Keep editing returns to the field; Discard closes the dialog and clears the draft.

## Nested Dialogs

A dialog opened inside another joins its stack. Escape closes the topmost dialog and returns focus to its trigger. Closing the parent also closes its children. `data-nested-open` and `--dialog-stack` let you show which layer is active.

```ts title="nested.ts"
import "@ui-sdk/web/dialog"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-dialog>
      <ui-dialog-trigger>
        <button>Account</button>
      </ui-dialog-trigger>
      <ui-dialog-backdrop hidden></ui-dialog-backdrop>
      <ui-dialog-content hidden>
        <div data-slot="stack">
          <ui-dialog-title>Account</ui-dialog-title>
          <ui-dialog-description>Manage how you sign in.</ui-dialog-description>
        </div>
        <div data-slot="card">
          <div data-slot="stack">
            <span>Password</span>
            <span data-slot="hint">Last changed 3 months ago</span>
          </div>
          <ui-dialog>
            <ui-dialog-trigger>
              <button>Change Password</button>
            </ui-dialog-trigger>
            <ui-dialog-backdrop hidden></ui-dialog-backdrop>
            <ui-dialog-content hidden>
              <div data-slot="stack">
                <ui-dialog-title>Change password</ui-dialog-title>
                <ui-dialog-description>Use at least 12 characters.</ui-dialog-description>
              </div>
              <ui-field>
                <ui-field-label>New password</ui-field-label>
                <ui-input>
                  <input type="password" />
                </ui-input>
              </ui-field>
              <div data-slot="row">
                <ui-dialog-close>
                  <button>Cancel</button>
                </ui-dialog-close>
                <ui-dialog-close>
                  <button data-variant="solid">Update</button>
                </ui-dialog-close>
              </div>
            </ui-dialog-content>
          </ui-dialog>
        </div>
        <div data-slot="row">
          <ui-dialog-close>
            <button data-variant="solid">Done</button>
          </ui-dialog-close>
        </div>
      </ui-dialog-content>
    </ui-dialog>
  `
}

export { mount }
```

Open Account, then Change Password. Press Escape once to return to Account, and again to close it.

## Opening from a Menu Item

Render the dialog outside the menu and open it with its `api.open()`. When the item disappears, the menu’s trigger becomes the place to return focus.

```ts title="from-menu.ts"
import "@ui-sdk/web/dialog"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import "@ui-sdk/web/menu"
import { Copy, createElement, Ellipsis, Pencil } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-menu>
      <ui-menu-trigger>
        <button aria-label="File actions">${createElement(Ellipsis, { "aria-hidden": "true" }).outerHTML}</button>
      </ui-menu-trigger>
      <ui-menu-content hidden>
        <ui-menu-item value="rename">
          ${createElement(Pencil, { "aria-hidden": "true" }).outerHTML}
          Rename…
        </ui-menu-item>
        <ui-menu-item value="duplicate">
          ${createElement(Copy, { "aria-hidden": "true" }).outerHTML}
          Duplicate
        </ui-menu-item>
      </ui-menu-content>
    </ui-menu>
    <ui-dialog>
      <ui-dialog-backdrop hidden></ui-dialog-backdrop>
      <ui-dialog-content hidden>
        <div data-slot="stack">
          <ui-dialog-title>Rename file</ui-dialog-title>
          <ui-dialog-description>Names must be unique in a folder.</ui-dialog-description>
        </div>
        <ui-field>
          <ui-field-label>Name</ui-field-label>
          <ui-input>
            <input value="report.pdf" />
          </ui-input>
        </ui-field>
        <div data-slot="row">
          <ui-dialog-close>
            <button>Cancel</button>
          </ui-dialog-close>
          <ui-dialog-close value="rename">
            <button data-variant="solid">Rename</button>
          </ui-dialog-close>
        </div>
      </ui-dialog-content>
    </ui-dialog>
  `
  const dialog = root.querySelector("ui-dialog")!
  root.querySelector("ui-menu")!.addEventListener("action", (event) => {
    if (event.detail.value === "rename") {
      dialog.api.open()
    }
  })
}

export { mount }
```

Open File Actions and choose Rename. Close the dialog to return focus to the File Actions button.

## Opening from Anywhere

Connect triggers outside the dialog with `for="dialog-id"`, and give each one a `payload` property. The dialog's `payloadchange` event carries it in `event.detail.value`. The dialog's `api.open({ payload })` opens it from code and returns a promise that resolves when it closes, with the reason and any `returnValue`. Each trigger remains the return-focus target for the dialog it opened. See [controllers](../controllers.md) for the shared controller pattern.

```ts title="payload.ts"
import "@ui-sdk/web/dialog"
import type { UiDialogElement } from "@ui-sdk/web/dialog"
import { log } from "./log"

type Invoice = {
  id: string
  customer: string
  amount: string
  status: "Paid" | "Due"
}

const invoices: Invoice[] = [
  { id: "INV-001", customer: "Acme", amount: "$250.00", status: "Paid" },
  { id: "INV-002", customer: "Globex", amount: "$150.00", status: "Due" },
  { id: "INV-003", customer: "Initech", amount: "$350.00", status: "Due" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Open from Code</button>
      </div>
      <ul data-slot="list"></ul>
      <ui-dialog id="invoice-reminder">
        <ui-dialog-backdrop hidden></ui-dialog-backdrop>
        <ui-dialog-content hidden>
          <div data-slot="stack">
            <ui-dialog-title></ui-dialog-title>
            <ui-dialog-description></ui-dialog-description>
          </div>
          <div data-slot="row">
            <ui-dialog-close>
              <button>Cancel</button>
            </ui-dialog-close>
            <ui-dialog-close value="send">
              <button data-variant="solid">Send reminder</button>
            </ui-dialog-close>
          </div>
        </ui-dialog-content>
      </ui-dialog>
    </div>
  `
  const list = root.querySelector("ul")!
  const dialog = root.querySelector<UiDialogElement<Invoice>>("ui-dialog")!
  for (const invoice of invoices) {
    const row = document.createElement("li")
    row.dataset.slot = "row"
    row.innerHTML = `${invoice.customer}<span data-slot="hint">${invoice.amount} · ${invoice.status}</span>`
    const trigger = Object.assign(document.createElement("ui-dialog-trigger"), {
      payload: invoice,
    })
    trigger.setAttribute("for", "invoice-reminder")
    if (invoice.status === "Paid") {
      trigger.setAttribute("disabled", "")
    }
    trigger.innerHTML = `<button aria-label="Remind ${invoice.customer}">Remind</button>`
    row.append(trigger)
    list.append(row)
  }
  dialog.addEventListener("payloadchange", (event) => {
    const invoice = event.detail.value
    root.querySelector("ui-dialog-title")!.textContent =
      `Remind ${invoice?.customer}`
    root.querySelector("ui-dialog-description")!.textContent =
      `${invoice?.id} for ${invoice?.amount} is due. We'll email the billing contact.`
  })
  dialog.addEventListener("openchange", (event) => {
    if (!event.detail.value && event.detail.returnValue === "send") {
      log(root, "Reminder sent")
    }
  })
  root
    .querySelector("[data-slot=controls] button")!
    .addEventListener("click", async () => {
      const { reason, returnValue } = await dialog.api.open({
        payload: invoices[2],
      })
      log(
        root,
        returnValue === "send"
          ? "Reminder sent from code"
          : `Closed (${reason})`
      )
    })
}

export { mount }
```

Open a reminder from either unpaid invoice, or press Open from Code. The same dialog shows that invoice, and the console logs how it closed.

## Presentation

`presentation="sheet"` presents the same task as a sheet. Use `"auto"` to choose a sheet on small touch screens and a centered dialog elsewhere, decided each time it opens. A swipe down closes a dismissible sheet; a protected one springs back and reports a dismissal attempt.

Style `data-presentation` to support both layouts. The sheet manages its own position and movement, so do not apply the centered dialog’s translation to it. `--sheet-backdrop` styles the dimmed page when no Backdrop part is present.

```ts title="presentation.ts"
import "@ui-sdk/web/dialog"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-dialog presentation="sheet">
      <ui-dialog-trigger>
        <button>Edit Profile</button>
      </ui-dialog-trigger>
      <ui-dialog-content hidden>
        <div data-slot="stack">
          <ui-dialog-title>Edit profile</ui-dialog-title>
          <ui-dialog-description>Make changes to your profile here. Save when you're done.</ui-dialog-description>
        </div>
        <ui-field>
          <ui-field-label>Name</ui-field-label>
          <ui-input>
            <input value="Hollis Grant" />
          </ui-input>
        </ui-field>
        <ui-field>
          <ui-field-label>Username</ui-field-label>
          <ui-input>
            <input value="@hollis" />
          </ui-input>
        </ui-field>
        <div data-slot="row">
          <ui-dialog-close>
            <button>Cancel</button>
          </ui-dialog-close>
          <ui-dialog-close value="save">
            <button data-variant="solid">Save Changes</button>
          </ui-dialog-close>
        </div>
      </ui-dialog-content>
    </ui-dialog>
  `
}

export { mount }
```

Open Edit Profile as a sheet. On a touch screen, drag it down to dismiss it, or use Cancel or Save Changes.

## Custom Rendering

Elements have no render functions. Add `as-child` to the title to bind your own heading, and put a link inside a Close part to close from it. Watch the dialog's `openchange` event and the content's data attributes, like `data-nested`, to change what's inside: here the trigger's label and the description follow them.

```ts title="custom-rendering.ts"
import "@ui-sdk/web/dialog"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-dialog>
      <ui-dialog-trigger shortcut="mod+i">
        <button><span>View Details</span><ui-dialog-shortcut></ui-dialog-shortcut></button>
      </ui-dialog-trigger>
      <ui-dialog-backdrop hidden></ui-dialog-backdrop>
      <ui-dialog-content hidden>
        <div data-slot="stack">
          <ui-dialog-title as-child><h3>Details</h3></ui-dialog-title>
          <ui-dialog-description>Quarterly report, updated today.</ui-dialog-description>
        </div>
        <div data-slot="row">
          <ui-dialog-close>
            <button>Close</button>
          </ui-dialog-close>
          <ui-dialog-close>
            <a data-variant="solid" href="https://example.com/details">Open the Full Page</a>
          </ui-dialog-close>
        </div>
      </ui-dialog-content>
    </ui-dialog>
  `
  const label = root.querySelector("ui-dialog-trigger span")!
  const content = root.querySelector("ui-dialog-content")!
  const description = root.querySelector("ui-dialog-description")!
  root.querySelector("ui-dialog")!.addEventListener("openchange", (event) => {
    label.textContent = event.detail.value ? "Viewing" : "View Details"
    description.textContent = content.hasAttribute("data-nested")
      ? "Opened from another dialog."
      : "Quarterly report, updated today."
  })
}

export { mount }
```

Open View Details. The trigger's label and the description come from their state, and Close renders as a link.

## Styling

Each element has a `data-slot`, such as `dialog-content`, and shows its state through the attributes listed under [Data Attributes](#data-attributes). Use `data-open` and `data-closed` for each state, and `data-starting-style` and `data-ending-style` for transitions.

### `<ui-dialog-content>`
- `--dialog-stack`: How many dialogs are open above this one, nested inside it. 0 for the topmost.
- `--keyboard-inset`: Unless it presents as a sheet: how many pixels of the page the on-screen keyboard covers, 0 without one.
- `--visual-viewport-width`: Unless it presents as a sheet: the width of the part of the page you can see.
- `--visual-viewport-height`: Unless it presents as a sheet: the height of the part of the page you can see, above the keyboard.
- `--visual-viewport-top`: Unless it presents as a sheet: how far the part of the page you can see is scrolled from the top of the layout, as when the keyboard pushes it up.
- `--drawer-progress`: While it presents as a sheet: how far open the sheet is, from 0 closed to 1 at its largest snap point. Never past 1.
- `--drawer-dim`: While it presents as a sheet: how dim the page behind is, from 0 to 1. The backdrop's opacity follows it.
- `--drawer-expand`: While it presents as a sheet: 0 at the second-largest snap point and below, 1 at the largest. With one snap point, the whole travel.
- `--drawer-stack`: While it presents as a sheet: how many sheets opened from inside this one are open above it, rising smoothly as each one opens. Push it back with it.
- `--sheet-backdrop`: Set it yourself: the color the page dims to while it presents as a sheet. Black at 0.2 by default.

### `<ui-dialog-viewport>`
- `--keyboard-inset`: While it presents as a sheet: how many pixels of the page the on-screen keyboard covers, 0 without one.
- `--visual-viewport-width`: While it presents as a sheet: the width of the part of the page you can see.
- `--visual-viewport-height`: While it presents as a sheet: the height of the part of the page you can see, above the keyboard.
- `--visual-viewport-top`: While it presents as a sheet: how far the part of the page you can see is scrolled from the top of the layout, as when the keyboard pushes it up.

## Data Attributes

### `<ui-dialog-trigger>`
`[data-slot="dialog-trigger"]`

- `data-closed`: Present while the dialog is closed, including while it animates out.
- `data-disabled`: Present when the trigger is disabled.
- `data-open`: Present while the dialog is open. On a trigger, while it's open from that trigger.

### `<ui-dialog-backdrop>`
`[data-slot="dialog-backdrop"]`

- `data-closed`: Present while the dialog is closed, including while it animates out.
- `data-open`: Present while the dialog is open. On a trigger, while it's open from that trigger.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the dialog animates out. Style the state you animate to.

### `<ui-dialog-content>`
`[data-slot="dialog-content"]`

- `data-closed`: Present while the dialog is closed, including while it animates out.
- `data-presentation` (`dialog`, `sheet`): How the dialog presents this time it's open.
- `data-open`: Present while the dialog is open. On a trigger, while it's open from that trigger.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the dialog animates out. Style the state you animate to.
- `data-keyboard`: Present while the on-screen keyboard covers part of the page.

### `<ui-dialog-close>`
`[data-slot="dialog-close"]`

- `data-pending`: Present on a Close part while its action runs.

## API Reference

Props are attributes in kebab case, like `close-on-outside-press`: `"false"` is false. `container` takes a
CSS selector, and `persistent-elements` a comma-separated list of selectors. Callbacks are DOM events.

### Dialog

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `open?` (`boolean`): Whether the dialog is open. Pass it to control the dialog.
- `defaultOpen?` (`boolean`): Whether the dialog starts open, when uncontrolled. Focus moves into it once it's on the page.
- `openchangecomplete event`: Runs once the dialog has finished opening or closing, after any animation.
- `dismissible?` (`boolean`): Whether Escape, an outside press and Android's back gesture can close the dialog. Close parts, triggers and the controller always can. Pass `false` while a form has unsaved changes, and ask in `dismissattempt`.
- `dismissattempt event`: Runs when a dismissal was refused, because `dismissible` is false, an outside press doesn't close it, or a Close part's action is running. Ask "Discard changes?" here.
- `persistentElements?` (`(string | Element)[] | (() => Element[])`): Elements that stay usable while the dialog makes the page inert, like a chat launcher or a password manager's button. Elements, CSS selectors, or a function that returns elements, read when the dialog opens. Presses on them never close it.
- `pendingAnnouncement?` (`string`): What screen readers hear once a Close part's action has been running for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.
- `openchange event`: Runs when the dialog wants to open or close. `details.reason` says why, `details.cancel()` stops it, and `details.returnValue` carries what closed it.
- `payloadchange event`: Runs when the payload the content shows changes: a trigger with another payload opens the dialog, or takes a non-modal dialog over while it's open, which fires no `openchange`, and so does a controller's `open({ payload })` on the open dialog. `details.cancel()` keeps the previous payload.
- `modal?` (`"trap-focus" | boolean`): `true`: the rest of the page is inert and doesn't scroll, focus is trapped, and an outside press only closes the dialog. `"trap-focus"`: traps focus, and leaves the page scrollable and clickable. `false`: a dialog beside the page, which Tab can leave and outside presses don't close.
- `closeOnOutsidePress?` (`boolean`): Whether pressing outside the dialog, like on its backdrop, closes it. The press counts once it's released outside too, so dragging a text selection out of a field doesn't close it.
- `presentation?` (`PresentationSetting<"dialog">`): How the dialog presents. `"sheet"` slides it up from the bottom of the screen, where it can be swiped away, and `"auto"` does that on small touch screens. Decided each time it opens; the server renders `"dialog"` for `"auto"`.
- `controller?` (`PopupController<any, DialogOpenChangeReason, {}, any, DialogPayloadChangeReason>`): Opens, closes and inspects the dialog from anywhere, and connects triggers outside it. Create one with `createDialogController()`.

### DialogTrigger

A trigger outside the dialog names it with `for="dialog-id"`, and takes `payload` as a property.

- `disabled?` (`boolean`): Stops the trigger from opening the dialog. A native button can't be focused or pressed, unless `focusableWhenDisabled` is set.
- `focusableWhenDisabled?` (`boolean`): Keeps a disabled trigger in the tab order with `aria-disabled` instead of the native attribute, so it can host a tooltip that says why. Presses still do nothing.
- `payload?` (`unknown`): Data for the content to render when this trigger opens the dialog, like the row it belongs to.
- `shortcut?` (`string`): A keyboard shortcut that presses the trigger, like `"mod+k"`. `mod` is Command on Apple platforms and Control elsewhere. Sets `aria-keyshortcuts`, and a Shortcut part inside shows it. A modal dialog pauses the page's shortcuts while it's open.
- `controller?` (`PopupController<any, DialogOpenChangeReason, {}, any, DialogPayloadChangeReason>`): Connects a trigger outside the dialog, like one per table row, to the dialog with this controller.

### DialogBackdrop

Dims the page behind a modal dialog. `<ui-dialog-backdrop>` takes no attributes of its own.

### DialogContent

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `initialFocus?` (`DialogInitialFocus`): Where focus goes when the dialog opens. Opening with touch focuses the dialog itself, so no on-screen keyboard appears.
- `finalFocus?` (`PopupFocusTarget`): Where focus goes when the dialog closes while focus is inside it.
- `keepMounted?` (`boolean`): Whether the dialog stays in the page, hidden, while closed. For animation libraries that drive the exit from state.

### DialogTitle

Names the dialog. `<ui-dialog-title>` renders a level 2 heading.

### DialogDescription

Describes the dialog while it's rendered. `<ui-dialog-description>` is a paragraph.

### DialogClose

With the `action` attribute, its `action` event's `detail.source` says how the part was pressed, as [Button](./button.md#changes-after-an-await) describes.

- `value?` (`string`): Reported as `returnValue` in `openchange` and by the controller's `open()`. `createConfirm()` resolves `true` for `"confirm"`.
- `action?` (`((event: Event | undefined, details: ActionDetails) => unknown)`): Runs when the part is pressed, before the dialog closes. A returned Promise keeps the dialog open while it runs: the part gets `data-pending`, `aria-busy` and `aria-disabled`, screen readers hear the dialog's `pendingAnnouncement` after a second, and nothing but the controller closes the dialog. It closes with reason `"action"` once the Promise resolves. A rejection keeps it open and puts the reason in the part's `error` state until the next press, or until the dialog opens again. `details.source` says how the part was pressed, for changes made after an `await`.

### DialogShortcut

- `shortcut?` (`string`): The keys to show. Inside a trigger, its `shortcut`.

### State

The same state shows as data attributes on each element.

`DialogTrigger`:

- `open` (`boolean`): Whether the dialog is open from this trigger.
- `disabled` (`boolean`): Set by the trigger's `disabled` prop, which stops it opening the dialog.

`DialogBackdrop`:

- `open` (`boolean`): Whether the dialog is open. False while it animates out.
- `nested` (`boolean`): Whether the dialog was opened from inside another dialog.
- `nestedOpen` (`boolean`): Whether a dialog opened from inside this one is open.

`DialogContent`:

- `open` (`boolean`): Whether the dialog is open. False while it animates out.
- `modal` (`boolean | "trap-focus"`): The `modal` setting. Always true for an alert dialog.
- `nested` (`boolean`): Whether the dialog was opened from inside another dialog.
- `nestedOpen` (`boolean`): Whether a dialog opened from inside this one is open.
- `stack` (`number`): How many dialogs are open above this one, nested inside it.
- `payload` (`Payload | undefined`): The payload of the last open, from the trigger that opened it or a controller, typed as the controller's `Payload`.
- `pending` (`boolean`): Whether a Close part's action is running.
- `presentation` (`"dialog" | "sheet"`): How it presents this time it's open.

`DialogClose`:

- `pending` (`boolean`): Whether this part's action is running.
- `error` (`unknown`): Why this part's last action failed, until it's pressed again or the dialog opens again.

`DialogShortcut`:

- `text` (`string`): The shortcut formatted for this platform: `⌘K` on Apple platforms and `Ctrl+K` elsewhere. Empty without one.

### Reasons

`event.detail.reason` says why the dialog opened or closed.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `parent-close` (`none`): The parent layer closed.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `action` (`MouseEvent | KeyboardEvent`): A Close part's `action` finished.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

For a payload change, it says what opened the dialog or took it over.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

The dismissals `dismissible` can refuse:

- `outside-press` (`MouseEvent`): A press outside the layer.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.

### Controller

Create one with `createDialogController<Payload, Result>()` from `@ui-sdk/web/dialog` and assign it to the root
element's `controller` property. The root element's `api` property has the same methods, and its `open` property reads
and sets whether the dialog is open.

Every write method takes an optional `{ reason, event }`, passed to `openchange`. Closing with a controller always works, even when the dialog isn't dismissible or an action is running.

- `isOpen()` (`() => boolean`): Whether it's open. False as soon as it starts closing, while it still animates out.
- `setOpen(open, options?)` (`(open: boolean, options?: PopupChangeOptions<DialogOpenChangeReason> | undefined) => boolean`): Opens or closes it. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (PopupChangeOptions<DialogPayloadChangeReason> & { payload?: Payload | undefined; anchor?: Anchor | undefined; signal?: AbortSignal | undefined; }) | undefined) => Promise<...>`): Opens it, and resolves once it closes, with why, how and any return value. Resolves exactly once and never rejects: on the next close from any source, when `signal` aborts, or with reason `"unmount"` when the component leaves the page.
- `close(options?)` (`(options?: (PopupChangeOptions<DialogOpenChangeReason> & { returnValue?: Result | undefined; }) | undefined) => boolean`): Closes it. `returnValue` is passed to the promise `open()` returned. Returns false when the close was canceled or it was already closed.
- `toggle(options?)` (`(options?: PopupChangeOptions<DialogOpenChangeReason> | undefined) => boolean`): Opens it when it's closed, and closes it when it's open. Returns false when the change was canceled.
- `getPayload()` (`() => Payload | undefined`): The payload of the last open, from a controller or the trigger that opened it.
- `focus()` (`() => void`): Moves focus to the trigger that opened it last, or the first trigger.

### Events

Events fire on their own element and don't bubble. Calling `preventDefault()` on `openchange` cancels the change.

| Member                     | On                  | Description                                                                             |
| -------------------------- | ------------------- | --------------------------------------------------------------------------------------- |
| `open` property, attribute | `ui-dialog`         | Whether the dialog is open. The attribute sets where it starts, and is live             |
| `api` property             | `ui-dialog`         | The [controller](#controller)                                                           |
| `controller` property      | `ui-dialog`         | A controller from `createDialogController()`, to drive it from code                     |
| `openchange` event         | `ui-dialog`         | `detail: { value: open, reason, event, returnValue }`                                   |
| `openchangecomplete` event | `ui-dialog`         | `detail: { value: open }`, after the animation                                          |
| `payloadchange` event      | `ui-dialog`         | `detail: { value: payload, reason, event, source }`, when the content's payload changes |
| `dismissattempt` event     | `ui-dialog`         | `detail: { reason, event }`, when a dismissal was refused                               |
| `payload` property         | `ui-dialog-trigger` | Data for the content, read when the trigger connects                                    |
| `for` attribute            | `ui-dialog-trigger` | The `id` of a dialog the trigger opens from outside it                                  |

## Accessibility

The trigger is a button that opens a dialog, and the dialog follows the [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): `aria-modal` while it's modal, labelled by its title, described by its description only while one is rendered. Every line below is an automated test.

### Keyboard

| Key                  | Does                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| Enter, Space         | On the trigger, opens the dialog                                     |
| Tab, Shift+Tab       | Moves through the dialog's controls, staying inside while it's modal |
| Escape               | Closes the topmost dialog and returns focus to its trigger           |
| A trigger's shortcut | Opens its dialog from anywhere on the page                           |

### Tested Behavior

**Trigger**

- Advertises a dialog.
- Click opens the dialog.
- Enter opens the dialog.
- Space opens the dialog.

**Focus**

- Opening moves focus to the first focusable element.
- Each time focus moves in, the dialog is named by its title and described by its description.
- Tab moves through the dialog in order.
- Tab from the last element wraps to the first.
- Shift+Tab from the first element wraps to the last.
- Shift+Tab from the first element wraps to the checked radio of a group outside a form.
- Tab reaches radios whose group's checked radio is behind the dialog.
- Tab visits a positive tabindex first, like the browser.
- A positive tabindex keeps Tab inside a dialog that leaves the page usable.
- A positive tabindex slotted into a custom element keeps its host's place.
- With a positive tabindex in the dialog, Tab still moves through a shadow root and slots.
- With a positive tabindex in the dialog, Tab from a focused element outside the tab order goes to the next stop.
- Tab from a custom element with a positive tabindex enters its shadow root.
- Opening focuses the first field even when a later one has a positive tabindex.
- Escape closes the dialog and returns focus to the trigger.
- Escape after a click returns focus to the trigger.
- The close button closes the dialog and returns focus to the trigger.
- A virtual click from a screen reader moves focus into the dialog.
- A touch press focuses the dialog itself, so no on-screen keyboard appears.
- Pressing a button inside keeps the dialog open.

**Dismissal**

- Pressing the backdrop closes the dialog.
- Pressing the backdrop returns focus to the trigger.
- Clicking inside the dialog keeps it open.
- An outside press doesn't reach the page.

**Presses**

- Selecting text in a field and releasing over the backdrop keeps the dialog open.
- Pressing the backdrop and releasing inside the dialog keeps it open.
- A right click on the backdrop keeps the dialog open.
- A dialog styled only with ::backdrop closes when the backdrop is pressed.
- With closeOnOutsidePress false, pressing the backdrop keeps the dialog open.
- Pressing a nested dialog's backdrop closes only the nested dialog.
- While the dialog animates out, a press on its backdrop doesn't reach the page.
- Escape right after opening a nested dialog closes only the nested one.

**Modal**

- Tab never leaves the dialog.
- The page doesn't scroll while the dialog is open.
- The rest of the page is hidden from assistive technology.
- With modal false, the page stays usable.

**Nested dialogs**

- Escape closes only the nested dialog and returns focus to its trigger.
- The nested dialog's close button closes only it.
- The outer dialog's open change hears only the outer dialog.
- Tab stays inside the nested dialog.
- A second Escape closes the outer dialog.

Runs in React, Vue and web components.

Additional behaviors:

**Escape that closes exactly one thing**

- Escape while an input method is composing text keeps the dialog open.
- Escape closes a non-modal dialog only while focus is inside it.

**Focus that always lands somewhere useful**

- Closing returns focus to the trigger before the exit animation finishes.
- Closing after the trigger is gone moves focus to the element after where it was.
- Closing after the trigger is gone skips past a later positive tabindex.
- A dialog open from the start moves focus inside.
- With initial focus on the content, the dialog itself takes focus.

**The outside is inert, except what must stay live**

- The page outside is inert while open and restored exactly after.
- A live region outside the dialog keeps announcing while it's open.

**Non-modal dialogs that behave like the APG**

- Tab leaves a non-modal dialog and the dialog stays open.
- A non-modal dialog stays open when the page is clicked.

**Nested and stacked**

- A dialog opened inside a dialog marks both, for styling.
- Closing the parent closes the nested dialog with reason parent-close.

**Opening from anywhere**

- A controller opens the dialog, moves focus in, and resolves with how it closed.
- Aborting the signal closes the dialog, and the promise resolves once.
- A pending open() resolves with reason unmount when the dialog leaves the page. Web components only.
- A form with method dialog closes the dialog and reports the submitter's value.
- A confirm helper resolves true for the action and false otherwise.
- Closing reports why, for every way a dialog closes.

**Shortcuts**

- A trigger connected through a controller shows its shortcut in a Shortcut part, and binds it.

**Web components**

- The open property and attribute open and close the dialog. Web components only.

Runs in React, Vue and web components.

**Opening a dialog from a menu item**

- Choosing the item closes the menu and moves focus into the dialog.
- Choosing the item with the keyboard moves focus into the dialog.

**The page and focus around a dialog opened from a menu item**

- The page around the dialog is inert, the menu's trigger included.
- Closing the dialog returns focus to the menu's trigger.
- A dialog the item opens through its open prop returns focus to the menu's trigger. React and Vue only.

**Shortcuts**

- A trigger's shortcut opens the dialog.
- The trigger advertises its shortcut, and shows it to sighted users only.
- A modal dialog pauses the page's shortcuts and keeps its own.
- A dialog's own shortcut doesn't run while the dialog is closed.
- Menu and popover triggers take shortcuts too.
- Plain keys typed in a text field are text, and modifier shortcuts still run.
- A plain-key shortcut runs outside text fields.

**A dirty form**

- Refuses Escape and outside presses, and reports each attempt.
- A clean form closes on Escape.

**Persistent elements**

- Stay usable while a modal dialog is open, and pressing them keeps it open.

**Async actions**

- Keep the alert dialog open and pending, then close with reason action.
- A failed action keeps the alert dialog open and stops pending.

**Popups inside a portaled popover**

- A menu and a dialog inside it render into the popover's container.

**Android's back gesture**

- Closes the topmost dialog with reason back.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while using the dialog with a keyboard.
- Announcements while using the alert dialog with a keyboard.

Runs in React, Vue and web components.
