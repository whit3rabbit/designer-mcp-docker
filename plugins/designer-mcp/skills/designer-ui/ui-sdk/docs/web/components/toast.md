# Toast

Show notifications with actions, timed dismissal, and screen reader announcements.

A toast tells someone that something happened, like a saved change or a sent message, and goes away on its own. It can offer an action such as Undo, stacks with the toasts before it, and is announced to screen readers without taking focus.

```ts title="demo.ts"
import "@ui-sdk/web/toast"
import { createToaster } from "@ui-sdk/web"
import { log } from "./log"

function mount(root: HTMLElement) {
  const toast = createToaster()
  root.innerHTML = `
    <button>Create Event</button>
    <ui-toast-region>
      <template>
        <ui-toast>
          <div data-slot="stack">
            <ui-toast-title></ui-toast-title>
            <ui-toast-description></ui-toast-description>
          </div>
          <ui-toast-action><button data-variant="solid"></button></ui-toast-action>
        </ui-toast>
      </template>
    </ui-toast-region>
  `
  root.querySelector("ui-toast-region")!.toaster = toast
  root.querySelector("button")!.addEventListener("click", () =>
    toast("Event created", {
      description: "Friday, June 12 at 10:00 AM",
      action: { label: "Undo", onAction: () => log(root, "Event removed") },
    })
  )
  return () => {
    toast.dismiss()
  }
}

export { mount }
```

Press Create Event. Choose Undo, swipe the toast away, or wait for it to close. Undo logs Event removed.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the component to register its elements. The import is safe on the server.

```ts
import "@ui-sdk/web/toast"
```

## Composition

Use the following composition to build a `ui-toast-region`:

```text
ui-toast-region
└── template
    └── ui-toast
        ├── ui-toast-title
        ├── ui-toast-description
        ├── ui-toast-action
        │   └── button
        └── ui-toast-close
            └── button
```

The region clones the `ui-toast` in its `template` for each toast in its queue, newest first. A toast is named by its title and described by its description. Empty title, description and action parts show the text from the toast's data, so a region's template is usually the same few parts. An empty `ui-toast-close` shows the toast's cancel and runs its `onCancel`, and hides when the toast has none.

## Usage

Import the parts and put them together, then call `toast()` when an action finishes:

```html
<script type="module">
  import "@ui-sdk/web/toast"
  import { toast } from "@ui-sdk/web"

  document
    .querySelector("#create-event")
    .addEventListener("click", () =>
      toast("Event created", { description: "Friday at 10:00 AM" })
    )
</script>

<button id="create-event" type="button">Create Event</button>
<ui-toast-region>
  <template>
    <ui-toast>
      <ui-toast-title></ui-toast-title>
      <ui-toast-description></ui-toast-description>
    </ui-toast>
  </template>
</ui-toast-region>
```

`toast()` works from anywhere, not only from event listeners, and returns the toast's id. Place the region once, near your app's root. Without a template, it renders each toast's title, description, action and cancel button with unstyled parts.

The examples below each call `createToaster()` for a queue of their own and set it on their region's `toaster` property, so their toasts don't mix.

## Types

`toast.success`, `.info`, `.warning`, `.error` and `.loading` set the toast's type, which the toast exposes as `data-type` for an icon or a color. Errors are announced right away and other types wait for a pause; set `priority` to change that. A loading toast stays until it's updated or dismissed.

```ts title="types.ts"
import "@ui-sdk/web/toast"
import { createToaster } from "@ui-sdk/web"
import {
  CircleCheck,
  createElement,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide"

const upload = () => new Promise((resolve) => setTimeout(resolve, 2000))

function mount(root: HTMLElement) {
  const toast = createToaster()
  root.innerHTML = `
    <div data-slot="row">
      <button>Default</button>
      <button>Success</button>
      <button>Info</button>
      <button>Warning</button>
      <button>Error</button>
      <button>Loading</button>
    </div>
    <ui-toast-region>
      <template>
        <ui-toast>
          ${createElement(CircleCheck, { "data-show": "success", "aria-hidden": "true" }).outerHTML}
          ${createElement(Info, { "data-show": "info", "aria-hidden": "true" }).outerHTML}
          ${createElement(TriangleAlert, { "data-show": "warning", "aria-hidden": "true" }).outerHTML}
          ${createElement(OctagonX, { "data-show": "error", "aria-hidden": "true" }).outerHTML}
          ${createElement(LoaderCircle, { "data-show": "loading", "aria-hidden": "true" }).outerHTML}
          <ui-toast-title></ui-toast-title>
        </ui-toast>
      </template>
    </ui-toast-region>
  `
  root.querySelector("ui-toast-region")!.toaster = toast
  const [plain, success, info, warning, error, loading] =
    root.querySelectorAll("button")
  plain.addEventListener("click", () => toast("Event created"))
  success.addEventListener("click", () => toast.success("Changes saved"))
  info.addEventListener("click", () => toast.info("A new version is available"))
  warning.addEventListener("click", () =>
    toast.warning("Storage is almost full")
  )
  error.addEventListener("click", () => toast.error("Couldn't save changes"))
  loading.addEventListener("click", () =>
    toast.promise(upload, {
      loading: "Uploading photos…",
      success: "Photos uploaded",
      error: "Upload failed",
    })
  )
  return () => {
    toast.dismiss()
  }
}

export { mount }
```

Choose a type. Each toast shows its type's icon, and Loading turns into Photos uploaded when it finishes.

## Position

Set the region's `side` to `top` or `bottom`, and `align` to `start`, `center` or `end`. Start and end follow the writing direction. A toast can be swiped toward the side and, unless it's centered, toward the end it's aligned to.

```ts title="position.ts"
import "@ui-sdk/web/select"
import "@ui-sdk/web/toast"
import { createToaster } from "@ui-sdk/web"
import { Check, ChevronDown, createElement } from "lucide"

const sides = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
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
  const toast = createToaster()
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        ${select("side", "Side", "bottom", sides)}
        ${select("align", "Align", "end", aligns)}
      </div>
      <button>Create Event</button>
      <ui-toast-region side="bottom" align="end">
        <template>
          <ui-toast>
            <div data-slot="stack">
              <ui-toast-title></ui-toast-title>
              <ui-toast-description></ui-toast-description>
            </div>
          </ui-toast>
        </template>
      </ui-toast-region>
    </div>
  `
  const region = root.querySelector("ui-toast-region")!
  region.toaster = toast
  for (const control of root.querySelectorAll("ui-select")) {
    control.addEventListener("valuechange", (event) => {
      const value = event.detail.value
      if (typeof value === "string") {
        region.setAttribute(control.dataset.attribute!, value)
      }
    })
  }
  root
    .querySelector("[data-slot='controls'] + button")!
    .addEventListener("click", () =>
      toast("Event created", { description: "Friday, June 12 at 10:00 AM" })
    )
  return () => {
    toast.dismiss()
  }
}

export { mount }
```

Choose a side and an alignment, then press Create Event and look for the toast at that edge of the page.

## Action and Cancel

Add an `action`, like Undo, and a `cancel` button that dismisses the toast. Their callbacks can update your app. `onDismiss` tells you why the toast is closing, and `details.cancel()` keeps it open; a canceled timeout starts the countdown again.

```ts title="action.ts"
import "@ui-sdk/web/toast"
import { createToaster } from "@ui-sdk/web"
import { log } from "./log"

function mount(root: HTMLElement) {
  const toast = createToaster()
  root.innerHTML = `
    <button>Archive Message</button>
    <ui-toast-region>
      <template>
        <ui-toast>
          <ui-toast-title></ui-toast-title>
          <ui-toast-close><button></button></ui-toast-close>
          <ui-toast-action><button data-variant="solid"></button></ui-toast-action>
        </ui-toast>
      </template>
    </ui-toast-region>
  `
  root.querySelector("ui-toast-region")!.toaster = toast
  root.querySelector("button")!.addEventListener("click", () =>
    toast("Message archived", {
      action: { label: "Undo", onAction: () => log(root, "Message restored") },
      cancel: { label: "Dismiss", onCancel: () => log(root, "Kept archived") },
      onDismiss: ({ reason }) => log(root, `Closed (${reason})`),
    })
  )
  return () => {
    toast.dismiss()
  }
}

export { mount }
```

Press Archive Message, then choose Undo or Dismiss, swipe the toast away, or let it time out. The console logs why it closed.

## Link

Give an action an `href`, and write an `<a>` in `ui-toast-action` instead of a `<button>` to render it as a link; the region's `renderToast` sets the link's `href` from the toast. It keeps normal link behavior, including opening in a new tab.

```ts title="link.ts"
import "@ui-sdk/web/toast"
import { createToaster } from "@ui-sdk/web"

function mount(root: HTMLElement) {
  const toast = createToaster()
  root.innerHTML = `
    <button>Send Invoice</button>
    <ui-toast-region>
      <template>
        <ui-toast>
          <div data-slot="stack">
            <ui-toast-title></ui-toast-title>
            <ui-toast-description></ui-toast-description>
          </div>
          <ui-toast-action><a data-variant="solid"></a></ui-toast-action>
        </ui-toast>
      </template>
    </ui-toast-region>
  `
  const region = root.querySelector("ui-toast-region")!
  region.toaster = toast
  region.renderToast = (item, el) => {
    if (item.action?.href) {
      el.querySelector("a")!.href = item.action.href
    }
  }
  root.querySelector("button")!.addEventListener("click", () =>
    toast("Invoice sent", {
      description: "Hollis Grant · $240.00",
      action: { label: "View", href: "#" },
    })
  )
  return () => {
    toast.dismiss()
  }
}

export { mount }
```

Press Send Invoice, then follow View in the toast.

## Promise

`toast.promise()` shows a loading toast, then updates the same toast when the promise resolves or rejects. Each message can be a string, options with a description or an action, or a function of the result. A toast dismissed while loading stays closed.

```ts title="promise.ts"
import "@ui-sdk/web/toast"
import { createToaster } from "@ui-sdk/web"

function mount(root: HTMLElement) {
  const toast = createToaster()
  let attempts = 0

  function save() {
    const succeeds = ++attempts % 2 === 1
    return new Promise<void>((resolve, reject) =>
      setTimeout(
        () => (succeeds ? resolve() : reject(new Error("Network error"))),
        1500
      )
    )
  }

  function saveChanges() {
    toast.promise(save, {
      loading: "Saving changes…",
      success: "Changes saved",
      error: {
        title: "Couldn't save changes",
        description: "Check your connection and try again.",
        action: { label: "Retry", onAction: saveChanges },
      },
    })
  }

  root.innerHTML = `
    <button>Save Changes</button>
    <ui-toast-region>
      <template>
        <ui-toast>
          <div data-slot="stack">
            <ui-toast-title></ui-toast-title>
            <ui-toast-description></ui-toast-description>
          </div>
          <ui-toast-action><button data-variant="solid"></button></ui-toast-action>
        </ui-toast>
      </template>
    </ui-toast-region>
  `
  root.querySelector("ui-toast-region")!.toaster = toast
  root.querySelector("button")!.addEventListener("click", saveChanges)
  return () => {
    toast.dismiss()
  }
}

export { mount }
```

Press Save Changes to see Saving changes become Changes saved. Press it again for the error, then choose Retry.

## Stacking

`max-visible` limits how many toasts show at once, three by default; the rest wait in the queue, and their timers start when they show. The stack expands while the pointer or focus is in it. Set `expanded` to keep it open. [Styling](#styling) shows the CSS that lays out the stack.

```ts title="stacking.ts"
import "@ui-sdk/web/checkbox"
import "@ui-sdk/web/toast"
import { createToaster } from "@ui-sdk/web"
import { Check, createElement } from "lucide"

const notifications = [
  { title: "Event created", description: "Friday, June 12 at 10:00 AM" },
  { title: "Message sent" },
  {
    title: "Hollis Grant joined",
    description: "They can now edit the Launch plan and see its comments.",
  },
  { title: "Changes saved" },
  { title: "Invoice sent", description: "Inès Moreau · $240.00" },
  { title: "Photos uploaded", description: "12 photos added to Summer trip" },
]

function mount(root: HTMLElement) {
  const toast = createToaster()
  let count = 0
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <ui-checkbox>
            <ui-checkbox-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-checkbox-indicator>
          </ui-checkbox>
          Always expanded
        </label>
      </div>
      <button>Add Toast</button>
      <ui-toast-region max-visible="4">
        <template>
          <ui-toast>
            <div data-slot="stack">
              <ui-toast-title></ui-toast-title>
              <ui-toast-description></ui-toast-description>
            </div>
          </ui-toast>
        </template>
      </ui-toast-region>
    </div>
  `
  const region = root.querySelector("ui-toast-region")!
  region.toaster = toast
  root
    .querySelector("ui-checkbox")!
    .addEventListener("checkedchange", (event) => {
      region.expanded = event.detail.value === true
    })
  root
    .querySelector("button")!
    .addEventListener("click", () =>
      toast(notifications[count++ % notifications.length])
    )
  return () => {
    toast.dismiss()
  }
}

export { mount }
```

Press Add Toast a few times, then hover the stack to expand it. Past four toasts, the rest wait their turn. Check Always expanded to keep it open.

## Duration

Set `duration` in milliseconds, on the toaster or on one toast, or `Infinity` for a toast that stays until it's dismissed. The default is five seconds. Timers pause while the pointer or focus is in the region, and while the page is hidden or its window is inactive.

```ts title="duration.ts"
import "@ui-sdk/web/toast"
import { createToaster } from "@ui-sdk/web"

function mount(root: HTMLElement) {
  const toast = createToaster()
  root.innerHTML = `
    <div data-slot="row">
      <button>1 Second</button>
      <button>5 Seconds</button>
      <button>Until Dismissed</button>
    </div>
    <ui-toast-region>
      <template>
        <ui-toast>
          <ui-toast-title></ui-toast-title>
          <ui-toast-close><button data-variant="solid"></button></ui-toast-close>
        </ui-toast>
      </template>
    </ui-toast-region>
  `
  root.querySelector("ui-toast-region")!.toaster = toast
  const [second, seconds, untilDismissed] = root.querySelectorAll("button")
  second.addEventListener("click", () =>
    toast("Link copied", { duration: 1000 })
  )
  seconds.addEventListener("click", () => toast("Changes saved"))
  untilDismissed.addEventListener("click", () =>
    toast("Your session expires in 5 minutes", {
      duration: Infinity,
      dismissible: false,
      cancel: { label: "Got It" },
    })
  )
  return () => {
    toast.dismiss()
  }
}

export { mount }
```

Press each button. Hover a toast to pause its timer. The session toast stays until you press Got It.

## Update and Dismiss

Keep the id `toast()` returns to update or dismiss that toast, or pass your own `id`. `toast.update()` returns whether the toast was still there, and `toast.dismiss()` without an id closes every toast.

```ts title="update.ts"
import "@ui-sdk/web/toast"
import { createToaster } from "@ui-sdk/web"
import { CircleCheck, createElement, LoaderCircle } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  const toast = createToaster()
  let timer: ReturnType<typeof setInterval> | undefined

  function upload() {
    clearInterval(timer)
    const id = toast.loading("Uploading report.pdf… 0%", { id: "upload" })
    let progress = 0
    timer = setInterval(() => {
      progress += 20
      const done = progress >= 100
      const open = toast.update(
        id,
        done
          ? { title: "Report uploaded", type: "success" }
          : { title: `Uploading report.pdf… ${progress}%` }
      )
      if (!open) {
        log(root, "Upload canceled")
      }
      if (done || !open) {
        clearInterval(timer)
      }
    }, 700)
  }

  root.innerHTML = `
    <div data-slot="row">
      <button>Upload Report</button>
      <button>Cancel Upload</button>
      <button>Dismiss All</button>
    </div>
    <ui-toast-region>
      <template>
        <ui-toast>
          ${createElement(CircleCheck, { "data-show": "success", "aria-hidden": "true" }).outerHTML}
          ${createElement(LoaderCircle, { "data-show": "loading", "aria-hidden": "true" }).outerHTML}
          <ui-toast-title></ui-toast-title>
        </ui-toast>
      </template>
    </ui-toast-region>
  `
  root.querySelector("ui-toast-region")!.toaster = toast
  const [start, cancel, dismissAll] = root.querySelectorAll("button")
  start.addEventListener("click", upload)
  cancel.addEventListener("click", () => toast.dismiss("upload"))
  dismissAll.addEventListener("click", () => toast.dismiss())
  return () => {
    clearInterval(timer)
    toast.dismiss()
  }
}

export { mount }
```

Press Upload Report and watch one toast count up to Report uploaded. Cancel Upload closes it early, and Dismiss All clears every toast.

## Async Action

Return a promise from an action to keep the toast open while it runs. Its button gets `data-pending` while it runs and ignores presses until it settles, and the action can change the button's text to say Restoring…, or offer a retry if it fails. See [Button](./button.md#changes-after-an-await) for changes made after an `await`.

```ts title="async-action.ts"
import "@ui-sdk/web/toast"
import { createToaster } from "@ui-sdk/web"
import { log } from "./log"

const restore = () => new Promise((resolve) => setTimeout(resolve, 1500))

function mount(root: HTMLElement) {
  const toast = createToaster({ duration: 6000 })
  root.innerHTML = `
    <button>Delete File</button>
    <ui-toast-region>
      <template>
        <ui-toast>
          <div data-slot="stack">
            <ui-toast-title></ui-toast-title>
            <ui-toast-description></ui-toast-description>
          </div>
          <ui-toast-action><button data-variant="solid"></button></ui-toast-action>
        </ui-toast>
      </template>
    </ui-toast-region>
  `
  root.querySelector("ui-toast-region")!.toaster = toast
  root.querySelector("button")!.addEventListener("click", () =>
    toast("File deleted", {
      description: "Q3 report.pdf",
      action: {
        label: "Undo",
        onAction: async (event) => {
          const button = (event?.target as Element | undefined)?.closest(
            "button"
          )
          if (button) {
            button.textContent = "Restoring…"
          }
          try {
            await restore()
          } catch (error) {
            if (button) {
              button.textContent = "Retry"
            }
            throw error
          }
          log(root, "Q3 report.pdf restored")
        },
      },
    })
  )
  return () => {
    toast.dismiss()
  }
}

export { mount }
```

Press Delete File, then Undo. The button shows Restoring… until the restore finishes, then the toast closes.

## Keyboard Shortcut

F6 moves focus to the newest toast and back. Set the region's `shortcut` to use another key, or `none` to turn it off. The region advertises it through `aria-keyshortcuts`.

```ts title="shortcut.ts"
import "@ui-sdk/web/toast"
import { createToaster } from "@ui-sdk/web"
import { log } from "./log"

function mount(root: HTMLElement) {
  const toast = createToaster({ duration: 10000 })
  root.innerHTML = `
    <button>Send Message</button>
    <ui-toast-region shortcut="alt+t" aria-label="Alerts">
      <template>
        <ui-toast>
          <ui-toast-title></ui-toast-title>
          <ui-toast-action><button data-variant="solid"></button></ui-toast-action>
        </ui-toast>
      </template>
    </ui-toast-region>
  `
  root.querySelector("ui-toast-region")!.toaster = toast
  root.querySelector("button")!.addEventListener("click", () =>
    toast("Message sent", {
      action: { label: "Undo", onAction: () => log(root, "Message unsent") },
    })
  )
  return () => {
    toast.dismiss()
  }
}

export { mount }
```

Press Send Message, then Alt+T (Option+T on a Mac) to focus the toast. Press Escape to dismiss it, or Alt+T again to go back.

## Overlay Host and Confirm

Instead of placing a region, add one `ui-overlay-host` near your app's root. It renders the toaster's region and `confirm()` questions as alert dialogs. Set its `toast` property before it connects: `attributes` go on the region, and `template` holds the `ui-toast` each toast copies. A region you place yourself takes over from the host for its toaster.

To style the question, render a `ui-alert-dialog` with the confirm controller and read the question from its `payloadchange` event. [Alert Dialog](./alert-dialog.md) covers `createConfirm()` in more detail.

```ts title="overlay-host.ts"
import "@ui-sdk/web/alert-dialog"
import "@ui-sdk/web/overlays"
import {
  createConfirm,
  createOverlays,
  createToaster,
  type ConfirmOptions,
  type UiAlertDialogElement,
} from "@ui-sdk/web"
import { CircleCheck, createElement } from "lucide"

const names = ["Acme", "Globex", "Initech"]

function mount(root: HTMLElement) {
  const overlays = createOverlays()
  const toast = createToaster({ overlays })
  const confirm = createConfirm({ overlays })
  let projects = names
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Reset Projects</button>
      </div>
      <ul data-slot="list" aria-label="Projects"></ul>
      <ui-alert-dialog>
        <ui-alert-dialog-backdrop hidden></ui-alert-dialog-backdrop>
        <ui-alert-dialog-content hidden>
          <div data-slot="stack">
            <ui-alert-dialog-title></ui-alert-dialog-title>
            <ui-alert-dialog-description></ui-alert-dialog-description>
          </div>
          <div data-slot="row">
            <ui-alert-dialog-close><button></button></ui-alert-dialog-close>
            <ui-alert-dialog-close value="confirm"><button data-variant="solid"></button></ui-alert-dialog-close>
          </div>
        </ui-alert-dialog-content>
      </ui-alert-dialog>
    </div>
  `
  const reset = root.querySelector("button")!
  const list = root.querySelector("ul")!

  function render() {
    list.innerHTML = projects.length
      ? projects
          .map(
            (name) =>
              `<li data-slot="row">${name}<button type="button" data-size="sm" aria-label="Delete ${name}">Delete</button></li>`
          )
          .join("")
      : `<li data-slot="row">All projects deleted.</li>`
    list.querySelectorAll("button").forEach((button, index) => {
      const name = projects[index]
      button.addEventListener("click", () => remove(name, index))
    })
  }

  async function remove(name: string, index: number) {
    const confirmed = await confirm({
      title: `Delete ${name}?`,
      description:
        "The project and its files will be deleted for everyone on your team.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    })
    if (!confirmed) {
      return
    }
    projects = projects.filter((project) => project !== name)
    render()
    ;(
      list.querySelectorAll("button")[Math.min(index, projects.length - 1)] ??
      reset
    ).focus()
    toast.success(`${name} deleted`, { priority: "assertive" })
  }

  reset.addEventListener("click", () => {
    projects = names
    render()
  })
  render()

  const dialog =
    root.querySelector<UiAlertDialogElement<ConfirmOptions>>("ui-alert-dialog")!
  const [cancel, agree] = dialog.querySelectorAll("button")
  dialog.controller = confirm.controller
  dialog.addEventListener("payloadchange", (event) => {
    const question = event.detail.value
    dialog.querySelector("ui-alert-dialog-title")!.textContent =
      question?.title ?? ""
    dialog.querySelector("ui-alert-dialog-description")!.textContent =
      question?.description ?? ""
    cancel.textContent = question?.cancelLabel ?? ""
    agree.textContent = question?.confirmLabel ?? ""
  })

  const template = document.createElement("template")
  template.innerHTML = `
    <ui-toast>
      ${createElement(CircleCheck, { "data-show": "success", "aria-hidden": "true" }).outerHTML}
      <ui-toast-title></ui-toast-title>
    </ui-toast>
  `
  dialog.before(
    Object.assign(document.createElement("ui-overlay-host"), {
      overlays,
      toast: { template },
    })
  )
  return () => {
    toast.dismiss()
  }
}

export { mount }
```

Press Delete on a project and confirm. The row goes away and a toast says so. Reset Projects brings them back.

## Custom Rendering

Pass anything else your toast needs in `data`, and read it in the region's `renderToast(toast, el)`, which runs for each toast element when it shows and after every update.

```ts title="custom.ts"
import "@ui-sdk/web/toast"
import { createToaster } from "@ui-sdk/web"
import { createElement, X } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  const toast = createToaster()
  root.innerHTML = `
    <button>New Message</button>
    <ui-toast-region aria-label="Messages">
      <template>
        <ui-toast>
          <span data-slot="media"></span>
          <div data-slot="stack">
            <ui-toast-title></ui-toast-title>
            <ui-toast-description></ui-toast-description>
          </div>
          <ui-toast-action><button data-variant="solid"></button></ui-toast-action>
          <ui-toast-close>
            <button aria-label="Close">${createElement(X, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-toast-close>
        </ui-toast>
      </template>
    </ui-toast-region>
  `
  const region = root.querySelector("ui-toast-region")!
  region.toaster = toast
  region.renderToast = (item, el) => {
    el.querySelector("[data-slot='media']")!.textContent = (
      item.data as { initials: string }
    ).initials
  }
  root.querySelector("button")!.addEventListener("click", () =>
    toast({
      title: "Hollis Grant",
      description: "Can you review the draft?",
      data: { initials: "HG" },
      action: {
        label: "Reply",
        onAction: () => log(root, "Replying to Hollis Grant"),
      },
    })
  )
  return () => {
    toast.dismiss()
  }
}

export { mount }
```

Press New Message to show a toast with Hollis Grant's initials. Choose Reply or close it.

## Styling

Toasts are unstyled, and the region and its toasts carry what you need to animate a stack:

- **The stack.** The region sets `--toast-front-height`, the newest toast's height, and `--toast-stack-height`, all of them added up. Each toast gets `--toast-index`, 0 for the newest, `--toast-offset`, the height of the toasts in front of it, and `--toast-height`, its own height. Position the toasts absolutely in the region and set `height: var(--toast-height)` so changes in height animate.
- **Collapsed and expanded.** `data-front` marks the newest toast. While the stack is collapsed, clip the toasts behind it to `--toast-front-height` and peek them out by their index. While it's expanded, the region and its toasts get `data-expanded`; move each toast by its `--toast-offset`.
- **Swiping.** While a toast is swiped it gets `data-swiping`, and `--toast-swipe-x` and `--toast-swipe-y` hold how far it moved. Translate it by them and turn off transitions. When a swipe dismisses it, `data-swipe-direction` says which way, so it can leave in that direction. A mouse drag that starts on selectable text selects it, so set `user-select: none` on toasts to swipe them from anywhere.
- **Entering and leaving.** A toast has `data-starting-style` for its first frame and `data-ending-style` while it leaves, and stays mounted until its transitions finish.

A stack at the bottom of the page, in plain CSS:

```css
[data-slot="toast-region"] {
  width: 356px;
  height: var(--toast-front-height);
}

[data-slot="toast-region"][data-expanded] {
  height: calc(var(--toast-stack-height) + (var(--toast-count) - 1) * 12px);
}

[data-slot="toast"] {
  --y: calc(var(--toast-index) * -12px);
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  z-index: calc(100 - var(--toast-index));
  overflow: hidden;
  height: var(--toast-height);
  translate: var(--toast-swipe-x, 0px)
    calc(var(--y) + var(--toast-swipe-y, 0px));
  scale: calc(1 - var(--toast-index) * 0.05);
  transition-property: translate, scale, opacity, height;
  transition-duration: 400ms;
  user-select: none;
}

[data-slot="toast"]:not([data-front], [data-expanded]) {
  height: var(--toast-front-height);
}

[data-slot="toast"][data-expanded] {
  --y: calc(-1 * (var(--toast-offset) + var(--toast-index) * 12px));
  scale: 1;
}

[data-slot="toast"][data-starting-style] {
  transition: none;
}

[data-slot="toast"][data-starting-style][data-front] {
  --y: 100%;
}

[data-slot="toast"]:is(
  [data-starting-style]:not([data-front]),
  [data-ending-style]
) {
  opacity: 0;
}

[data-slot="toast"][data-swiping] {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  [data-slot="toast"] {
    transition-property: opacity;
  }
}
```

Each part has a `data-slot`, such as `toast`, and its state attributes are listed under [Data Attributes](#data-attributes). An action's or close's attributes land on its button.

### `<ui-toast-region>`
- `--toast-front-height`: The newest toast's height. Clip the toasts behind it to it in a collapsed stack.
- `--toast-stack-height`: The toasts' heights added up, for the height of an expanded stack.
- `--toast-count`: How many toasts show.
- `--keyboard-inset`: How many pixels of the page the on-screen keyboard covers, 0 without one.
- `--visual-viewport-width`: The width of the part of the page you can see.
- `--visual-viewport-height`: The height of the part of the page you can see, above the keyboard.
- `--visual-viewport-top`: How far the part of the page you can see is scrolled from the top of the layout, as when the keyboard pushes it up.

### `<ui-toast>`
- `--toast-index`: The toast's place in the stack, 0 for the newest. A closing toast keeps its place.
- `--toast-offset`: The height of the toasts in front of this one, in pixels. Add gaps with `--toast-index` to place an expanded stack.
- `--toast-height`: The toast's own height with its content laid out freely, whatever height it's given. Set it as the height to animate the stack.
- `--toast-swipe-x`: How far a swipe moved the toast sideways, in pixels. Translate the toast by it.
- `--toast-swipe-y`: How far a swipe moved the toast up or down, in pixels.

## Data Attributes

`ui-toast-title` and `ui-toast-description` have no state attributes. The button in `ui-toast-close` gets `data-pending`, like the one in `ui-toast-action`, while a Promise from its action runs.

### `<ui-toast-region>`
`[data-slot="toast-region"]`

- `data-side` (`top`, `bottom`): The edge of the viewport the region sits on.
- `data-align` (`start`, `center`, `end`): Where along that edge.
- `data-expanded`: Present while the stack is expanded: hovered, focused, or always with `expanded`.
- `data-keyboard`: Present on the region while the on-screen keyboard covers part of the page.

### `<ui-toast>`
`[data-slot="toast"]`

- `data-type` (`default`, `success`, `error`, `info`, `warning`, `loading`): What the toast is about.
- `data-front`: Present on the newest toast, in front of a collapsed stack. A closing toast keeps it while it animates out.
- `data-expanded`: Present while the stack is expanded: hovered, focused, or always with `expanded`.
- `data-starting-style`: Present for a toast's first frame. Style the state you animate from.
- `data-ending-style`: Present while a toast animates out. Style the state you animate to.

### `<ui-toast-action>`
`[data-slot="toast-action"]`

- `data-pending`: Present on an action or close button while its handler's Promise runs.

## API Reference

### Toast

- `id?` (`string`): Reuses a toast: a toast with this id that's still showing is updated instead of added again.
- `title?` (`Content`): The main message.
- `description?` (`Content`): More detail, under the title.
- `type?` (`ToastType`): What it's about, for styling through `data-type`, and for how it's announced.
- `duration?` (`number`): How long it shows, in ms, while nothing pauses it. `Infinity` keeps it until dismissed.
- `priority?` (`"assertive" | "polite"`): How screen readers announce it: `"polite"` waits for a pause, `"assertive"` interrupts.
- `action?` (`ToastAction<Content>`): A button that does something, like Undo.
- `cancel?` (`ToastCancel<Content>`): A button that dismisses it, like Cancel.
- `dismissible?` (`boolean`): Whether the user can dismiss it: swiping, Escape and Close parts. Timers and `dismiss()` still close it.
- `data?` (`unknown`): Anything else, for your own rendering, like an avatar.
- `onDismiss?` (`((details: ToastDismissDetails) => void)`): Runs when it closes, with why. Calling `details.cancel()` keeps it.

`toast(message, options)` and `toast(options)` return the toast's id. `toast.success`, `.info`, `.warning`, `.error` and `.loading` set the type. `toast.promise(promise, { loading, success, error })` returns the id too, and `toast.update(id, options)` returns whether the toast was still there. `toast.dismiss(id)` closes one, and `toast.dismiss()` every one.

### Actions

- `label` (`Content`): The button's text.
- `onAction?` (`((event: Event | undefined, details: ToastActionDetails) => unknown)`): Runs when it's pressed. A returned Promise marks the action pending, then dismisses the toast once it resolves. A rejection keeps the toast. `details.source` says how it was pressed, for changes made after an `await`.
- `href?` (`string`): Makes the action a link.
- `dismiss?` (`boolean`): Whether pressing it dismisses the toast.

- `label` (`Content`): The button's text.
- `onCancel?` (`((event: Event | undefined, details: ToastActionDetails) => void)`): Runs when it's pressed, before the toast closes. `details.source` says how it was pressed.

### ToastRegion

- `toaster?` (`Toaster<any>`): The queue it shows. A second toaster, from `createToaster()`, gives a second region its own toasts.
- `side?` (`"bottom" | "top"`): The edge of the viewport it sits on. Swiping toward it dismisses a toast.
- `align?` (`"center" | "end" | "start"`): Where along that edge. `"start"` and `"end"` follow the writing direction, and swiping toward them dismisses too.
- `maxVisible?` (`number`): How many toasts show at once. Older ones wait, with their timers stopped, until there's room.
- `expanded?` (`boolean`): Whether the stack is always expanded. Otherwise it expands while the pointer or focus is in it.
- `shortcut?` (`string | null`): The key that moves focus into the region and back, like `"F6"` or `"alt+t"`. `null` turns it off.
- `pendingAnnouncement?` (`string`): What screen readers hear once a toast's action or close button has been pending for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### ToastAction

- `action event`: Runs when it's pressed, instead of the toast's own `action.onAction`. A returned Promise marks it pending. `details.source` says how it was pressed, for changes made after an `await`.
- `dismiss?` (`boolean`): Whether pressing it dismisses the toast.

### ToastClose

- `action?` (`((event: Event | undefined, details: ToastActionDetails) => unknown)`): Runs before the toast closes. A returned Promise keeps it open and the button pending until it settles. `details.source` says how it was pressed, for changes made after an `await`.

### Confirm

- `title` (`string`): The question, like "Delete this project?".
- `description?` (`string`): What agreeing does.
- `confirmLabel?` (`string`): The agreeing button's text.
- `cancelLabel?` (`string`): The other button's text.

### State

`ui-toast-region`:

- `side` (`"top" | "bottom"`): The edge it sits on.
- `align` (`"start" | "center" | "end"`): Where along that edge.
- `expanded` (`boolean`): Whether the stack is expanded.
- `toasts` (`readonly ToastItem<unknown>[]`): The toasts to render, newest first, including ones animating out.

`ui-toast`:

- `type` (`ToastType`): What it's about.
- `index` (`number`): Its place in the stack, 0 for the newest.
- `front` (`boolean`): Whether it's the newest, on top of a collapsed stack. A closing toast keeps it.
- `expanded` (`boolean`): Whether the stack is expanded.
- `leaving` (`boolean`): Whether it's animating out.

`ui-toast-action` and `ui-toast-close`:

- `pending` (`boolean`): Whether a Promise its handler returned is still running.
- `error` (`unknown`): Why its handler failed, until it's pressed again.

### Reasons

- `timeout` (`none`): A duration ran out, like a toast's, or a rotating carousel's interval.
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `action` (`MouseEvent | KeyboardEvent`): A Close part's `action` finished.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

## Accessibility

Toasts are announced through shared [live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions), once each, without making the visible region live: politely by default and assertively for errors. While it has toasts, the region is a landmark named Notifications; set `aria-label` to name it in the page's language. Keep messages short, and use `duration: Infinity` for one that has to stay available.

### Keyboard

F6, or the region's `shortcut`, moves focus to the newest toast, and pressing it again returns focus to where it came from. Tab moves through the toasts and their buttons, and Tab past the last one goes back too. Escape dismisses the focused toast; focus then moves to the next toast, or back where it came from after the last one. The region stays reachable while a modal dialog is open, and its timers pause while focus is inside.

### Tested Behavior

Every line below is an automated test.

**Showing**

- A toast shows its title, description and action in the Notifications region.
- Newer toasts come first.
- The newest toast is marked as the front one.
- Each toast says what it's about through data-type.
- The region sits on its side and alignment.
- It shows above everything, in the top layer.
- A promise toast loads, then shows the result.
- A toast with an id that's showing is updated in place.

**Closing**

- A toast closes after its duration.
- Infinity keeps it until it's dismissed.
- The Dismiss button closes it.
- The action runs and closes it.
- Escape on a focused toast closes it.
- A closing toast stays while it animates out.
- A toast that can't be dismissed ignores Escape.

**Timers**

- Hovering the region pauses its timers, and leaving resumes them.
- Focus in the region pauses its timers.

**Keyboard**

- F6 moves focus to the newest toast, and again back where it was.
- The shortcut is configurable.
- The region names its shortcut.
- When the focused toast closes, focus goes to the next one, then back where it was.

**Stacking**

- Only maxVisible toasts show; the rest wait for room.
- The stack expands while hovered or focused.
- Expanded keeps the stack expanded.
- Toasts measure their heights and offsets for the stack.
- A toast measures its content's height, whatever height it's given.
- A toast given its measured height animates to a new one when its content changes.
- A toast measures again when a child, its class or its padding changes.
- A toast closing from the front stays in front while it animates out.

**Swiping**

- Swiping toward the region's side dismisses.
- Swiping toward the aligned edge dismisses too.
- A short swipe snaps back.
- Swiping away from the side never dismisses.
- A toast that can't be dismissed doesn't swipe.

**Over a modal dialog**

- A toast shown from a modal dialog is visible, usable and above it.

**Updates after closing**

- A promise toast dismissed while loading stays closed.
- An update after a toast closed never brings it back.

**More pausing and keys**

- The window losing focus pauses timers, and getting it back resumes them.
- F6 does nothing while there are no toasts, so the browser keeps it.
- A toast on the top edge swipes up, and a swipe down snaps back.

Runs in React, Vue and web components.

Also tested:

**Enhancements**

- Update() says whether the toast was still there.
- A toast beyond maxVisible never expires unseen.
- There's no empty Notifications landmark.
- Focus never falls to the page when a toast focused by the mouse closes.
- A pending action shows it and holds the toast open until it settles.

**Pausing**

- A hidden page pauses timers.
- Pause reasons hold separately: getting the window back doesn't resume while focus is in the region.

**Announcements**

- The live regions exist before the first toast.
- A toast is announced politely, with its title and description.
- An error is announced assertively.
- Toasts that arrive together are announced together.
- The visible region isn't a live region, so nothing is read twice.

**The shortcut**

- F6 works from a text field and types nothing.
- A shortcut of null turns it off.
- Tab past the last toast goes back where F6 came from.

**Over modal dialogs**

- F6 reaches the toasts from inside a modal dialog, and goes back into it.
- Escape on a toast closes the toast, not the dialog beneath.
- A dialog opened after a toast doesn't cover it, and pressing it doesn't close the dialog.

**Swiping**

- Dragging across a toast's text with a mouse selects it instead of dismissing.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while reaching a toast with F6 and leaving it.

Runs in React, Vue and web components.
