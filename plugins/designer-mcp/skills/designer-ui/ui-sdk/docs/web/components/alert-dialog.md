# Alert Dialog

Ask someone to confirm an action before you continue.

Use an alert dialog when someone needs to answer a question before an action continues, such as deleting a project.

```ts title="basic.ts"
import "@ui-sdk/web/alert-dialog"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-alert-dialog>
      <ui-alert-dialog-trigger>
        <button>Delete Project</button>
      </ui-alert-dialog-trigger>
      <ui-alert-dialog-backdrop hidden></ui-alert-dialog-backdrop>
      <ui-alert-dialog-content hidden>
        <div data-slot="stack">
          <ui-alert-dialog-title>Delete this project?</ui-alert-dialog-title>
          <ui-alert-dialog-description>
            This permanently deletes the project, its files and its deployment history for everyone on your team.
          </ui-alert-dialog-description>
        </div>
        <div data-slot="row">
          <ui-alert-dialog-close>
            <button>Cancel</button>
          </ui-alert-dialog-close>
          <ui-alert-dialog-close value="confirm">
            <button data-variant="solid">Delete</button>
          </ui-alert-dialog-close>
        </div>
      </ui-alert-dialog-content>
    </ui-alert-dialog>
  `
}

export { mount }
```

Open the dialog with Enter to start on Cancel. Tab stays inside, clicking outside leaves it open, and Escape closes it and returns focus to the trigger.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the component to register its elements. The import is safe on the server.

```ts
import "@ui-sdk/web/alert-dialog"
```

## Composition

Use the following composition to build a `ui-alert-dialog`:

```text
ui-alert-dialog
├── ui-alert-dialog-trigger
│   └── button
├── ui-alert-dialog-backdrop
└── ui-alert-dialog-content
    ├── ui-alert-dialog-title
    ├── ui-alert-dialog-description
    ├── ui-alert-dialog-close
    │   └── button
    └── ui-alert-dialog-close
        └── button
```

Put the question in `ui-alert-dialog-title`, explain what happens in `ui-alert-dialog-description`, and wrap each answer's native button in `ui-alert-dialog-close`. Add `ui-alert-dialog-backdrop` to dim the page. Give the content and backdrop `hidden` to keep them hidden before the elements upgrade.

A Close part reports its `value` when it closes. `value="confirm"` is the agreeing answer that the [confirm helper](#confirm) recognizes.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/alert-dialog"
</script>

<ui-alert-dialog>
  <ui-alert-dialog-trigger
    ><button>Delete Project</button></ui-alert-dialog-trigger
  >
  <ui-alert-dialog-content hidden>
    <ui-alert-dialog-title>Delete this project?</ui-alert-dialog-title>
    <ui-alert-dialog-description
      >The project and its files will be deleted for
      everyone.</ui-alert-dialog-description
    >
    <ui-alert-dialog-close><button>Cancel</button></ui-alert-dialog-close>
    <ui-alert-dialog-close value="confirm"
      ><button>Delete</button></ui-alert-dialog-close
    >
  </ui-alert-dialog-content>
</ui-alert-dialog>
```

## Build Your Own

`@ui-sdk/web/alert-dialog` comes with ready-made `ui-alert-dialog` elements. If you'd like to build your own, with your own element names, start from the `alertDialog` primitive in `@ui-sdk/core`:

```ts title="confirm-elements.ts"
import { alertDialog } from "@ui-sdk/core/alert-dialog"
import { createParts, wrappedButton } from "@ui-sdk/web"

createParts(alertDialog, {
  root: "confirm-dialog",
  trigger: {
    tag: "confirm-trigger",
    target: wrappedButton,
    display: "contents",
  },
  backdrop: "confirm-backdrop",
  content: "confirm-content",
  title: "confirm-title",
  description: "confirm-description",
  close: { tag: "confirm-close", target: wrappedButton, display: "contents" },
})
```

```html
<confirm-dialog>
  <confirm-trigger><button>Delete Project</button></confirm-trigger>
  <confirm-backdrop hidden></confirm-backdrop>
  <confirm-content hidden>
    <confirm-title>Delete this project?</confirm-title>
    <confirm-description
      >This permanently deletes the project.</confirm-description
    >
    <confirm-close><button>Cancel</button></confirm-close>
    <confirm-close value="confirm"><button>Delete</button></confirm-close>
  </confirm-content>
</confirm-dialog>
```

Each element keeps the behavior, state and data attributes of its ready-made counterpart: the content opens in the top layer, traps focus and makes the page inert. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Controlled

Set the element's `open` property to open or close it from your app. Listen for `openchange` to follow changes made by its parts. [State and Events](../state-and-events.md) explains controlled state and canceling a change.

```ts title="controlled.ts"
import "@ui-sdk/web/alert-dialog"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <button type="button" aria-haspopup="dialog">Review Changes</button>
      <ui-alert-dialog>
        <ui-alert-dialog-backdrop hidden></ui-alert-dialog-backdrop>
        <ui-alert-dialog-content hidden>
          <div data-slot="stack">
            <ui-alert-dialog-title>Discard unsaved changes?</ui-alert-dialog-title>
            <ui-alert-dialog-description>
              Your edits will be lost if you leave without saving.
            </ui-alert-dialog-description>
          </div>
          <div data-slot="row">
            <ui-alert-dialog-close>
              <button>Keep Editing</button>
            </ui-alert-dialog-close>
            <ui-alert-dialog-close value="confirm">
              <button data-variant="solid">Discard</button>
            </ui-alert-dialog-close>
          </div>
        </ui-alert-dialog-content>
      </ui-alert-dialog>
    </div>
  `
  const dialog = root.querySelector("ui-alert-dialog")!
  root.querySelector("button")!.addEventListener("click", () => {
    dialog.open = true
  })
}

export { mount }
```

Choose Review Changes, then Keep Editing or Discard.

## Shortcut

Give the trigger a `shortcut` to open the dialog from the keyboard, and put `ui-alert-dialog-shortcut` inside its button to show the keys. [Dialog](./dialog.md#keyboard-shortcut) covers the shortcut syntax.

```ts title="shortcut.ts"
import "@ui-sdk/web/alert-dialog"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-alert-dialog>
      <ui-alert-dialog-trigger shortcut="mod+shift+h">
        <button>
          Clear History
          <ui-alert-dialog-shortcut></ui-alert-dialog-shortcut>
        </button>
      </ui-alert-dialog-trigger>
      <ui-alert-dialog-backdrop hidden></ui-alert-dialog-backdrop>
      <ui-alert-dialog-content hidden>
        <div data-slot="stack">
          <ui-alert-dialog-title>Clear your history?</ui-alert-dialog-title>
          <ui-alert-dialog-description>
            Recent searches and visited pages are removed from this device.
          </ui-alert-dialog-description>
        </div>
        <div data-slot="row">
          <ui-alert-dialog-close>
            <button>Cancel</button>
          </ui-alert-dialog-close>
          <ui-alert-dialog-close value="confirm">
            <button data-variant="solid">Clear</button>
          </ui-alert-dialog-close>
        </div>
      </ui-alert-dialog-content>
    </ui-alert-dialog>
  `
}

export { mount }
```

Press Cmd+Shift+H (Ctrl+Shift+H on Windows and Linux) to open the dialog without clicking.

## Animation

The content has `data-starting-style` while it opens and `data-ending-style` while it closes. Transition from those states, and the dialog stays mounted until the exit finishes:

```css
[data-slot="alert-dialog-content"] {
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
import "@ui-sdk/web/alert-dialog"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-alert-dialog>
      <ui-alert-dialog-trigger>
        <button>Leave Workspace</button>
      </ui-alert-dialog-trigger>
      <ui-alert-dialog-backdrop hidden></ui-alert-dialog-backdrop>
      <ui-alert-dialog-content hidden>
        <div data-slot="stack">
          <ui-alert-dialog-title>Leave this workspace?</ui-alert-dialog-title>
          <ui-alert-dialog-description>
            You'll lose access to its projects until someone invites you again.
          </ui-alert-dialog-description>
        </div>
        <div data-slot="row">
          <ui-alert-dialog-close>
            <button>Cancel</button>
          </ui-alert-dialog-close>
          <ui-alert-dialog-close value="confirm">
            <button data-variant="solid">Leave</button>
          </ui-alert-dialog-close>
        </div>
      </ui-alert-dialog-content>
    </ui-alert-dialog>
  `
}

export { mount }
```

Open and close the dialog. It slides up and fades in, and slides down and fades out before it unmounts.

## Nested

An alert dialog opened inside another joins its stack, such as a second confirmation before something can't be undone. Escape closes the topmost one and returns focus to its trigger. The dialog underneath gets `data-nested-open`, so you can show which layer is active. To close both once the last question is answered, listen for the inner dialog's `openchange` and set the outer one's `open` to `false` when `event.detail.returnValue` is `"confirm"`.

```ts title="nested.ts"
import "@ui-sdk/web/alert-dialog"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-alert-dialog>
      <ui-alert-dialog-trigger>
        <button>Delete Workspace</button>
      </ui-alert-dialog-trigger>
      <ui-alert-dialog-backdrop hidden></ui-alert-dialog-backdrop>
      <ui-alert-dialog-content hidden>
        <div data-slot="stack">
          <ui-alert-dialog-title>Delete this workspace?</ui-alert-dialog-title>
          <ui-alert-dialog-description>
            All 12 projects and their deployments will be deleted for everyone on your team.
          </ui-alert-dialog-description>
        </div>
        <div data-slot="row">
          <ui-alert-dialog-close>
            <button>Cancel</button>
          </ui-alert-dialog-close>
          <ui-alert-dialog>
            <ui-alert-dialog-trigger>
              <button data-variant="solid">Delete</button>
            </ui-alert-dialog-trigger>
            <ui-alert-dialog-backdrop hidden></ui-alert-dialog-backdrop>
            <ui-alert-dialog-content hidden>
              <div data-slot="stack">
                <ui-alert-dialog-title>Are you absolutely sure?</ui-alert-dialog-title>
                <ui-alert-dialog-description>There's no way to get the workspace back.</ui-alert-dialog-description>
              </div>
              <div data-slot="row">
                <ui-alert-dialog-close>
                  <button>Go Back</button>
                </ui-alert-dialog-close>
                <ui-alert-dialog-close value="confirm">
                  <button data-variant="solid">Delete Workspace</button>
                </ui-alert-dialog-close>
              </div>
            </ui-alert-dialog-content>
          </ui-alert-dialog>
        </div>
      </ui-alert-dialog-content>
    </ui-alert-dialog>
  `
  const [outer, inner] = root.querySelectorAll("ui-alert-dialog")
  inner.addEventListener("openchange", (event) => {
    if (!event.detail.value && event.detail.returnValue === "confirm") {
      outer.open = false
    }
  })
}

export { mount }
```

Choose Delete Workspace, then Delete. Press Escape to step back to the first question, or choose Delete Workspace to close both.

## Async Action

Add `action` to a Close part and listen for its `action` event. Pass a Promise to `event.detail.waitUntil()` during that event to keep the dialog open until the work finishes. A resolved Promise closes it with the reason `action`; a rejection keeps it open and puts the error in that part's state.

```ts title="async-action.ts"
import "@ui-sdk/web/alert-dialog"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-alert-dialog pending-announcement="Deleting project">
        <ui-alert-dialog-trigger>
          <button>Delete Project</button>
        </ui-alert-dialog-trigger>
        <ui-alert-dialog-backdrop hidden></ui-alert-dialog-backdrop>
        <ui-alert-dialog-content hidden>
          <div data-slot="stack">
            <ui-alert-dialog-title>Delete project?</ui-alert-dialog-title>
            <ui-alert-dialog-description>
              This permanently deletes the project, its files and its deployment history for everyone on your team.
            </ui-alert-dialog-description>
          </div>
          <div data-slot="stack">
            <p data-slot="hint" role="alert"></p>
            <div data-slot="row">
              <ui-alert-dialog-close>
                <button>Cancel</button>
              </ui-alert-dialog-close>
              <ui-alert-dialog-close action value="confirm">
                <button data-variant="solid">Delete</button>
              </ui-alert-dialog-close>
            </div>
          </div>
        </ui-alert-dialog-content>
      </ui-alert-dialog>
    </div>
  `
  let attempts = 0
  const dialog = root.querySelector("ui-alert-dialog")!
  const close = root.querySelector("ui-alert-dialog-close[action]")!
  const button = close.querySelector("button")!
  const message = root.querySelector("p")!

  async function deleteProject() {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    if (attempts++ === 0) {
      throw new Error("Couldn't delete the project.")
    }
  }

  close.addEventListener("action", (event) => {
    const { waitUntil } = (
      event as CustomEvent<{ waitUntil: (promise: Promise<unknown>) => void }>
    ).detail
    button.textContent = "Deleting…"
    message.textContent = ""
    const deleting = deleteProject()
    waitUntil(deleting)
    deleting.then(
      () => {
        button.textContent = "Delete"
      },
      (error: Error) => {
        button.textContent = "Try Again"
        message.textContent = error.message
      }
    )
  })
  dialog.addEventListener("openchange", (event) => {
    if (!event.detail.value) {
      return
    }
    button.textContent = "Delete"
    message.textContent = ""
  })
}

export { mount }
```

Choose Delete Project, then Delete. The first attempt fails so you can try again. While Deleting… is shown, Cancel and Escape leave the dialog open. A successful retry closes it.

While the action runs, its button stays focusable and gets `data-pending`, `aria-busy`, and `aria-disabled`. Other Close parts and dismissals cannot close the dialog until it settles. `dismissattempt` reports refused dismissals; a controller can still close it.

The root's `pending-announcement` attribute sets what screen readers hear after a second of waiting. The error clears on the next attempt or when the dialog opens again. The action event's `detail.source` describes the input that started it; [Changes After an Await](./button.md#changes-after-an-await) explains when to use it.

## Confirm From Anywhere

The shared `confirm()` asks a question without any dialog markup. Import `@ui-sdk/web/overlays` and put one `ui-overlay-host` near the end of your page, and it shows each question as an alert dialog. `confirm()` resolves `true` when someone agrees. [Confirm Options](#confirm-options) lists what you can pass.

```ts title="confirm-anywhere.ts"
import { confirm } from "@ui-sdk/web/alert-dialog"
import "@ui-sdk/web/overlays"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <button type="button">Archive Project</button>
    <ui-overlay-host></ui-overlay-host>
  `
  root.querySelector("button")!.addEventListener("click", async () => {
    const yes = await confirm({
      title: "Archive this project?",
      description: "It moves to Archived, and you can restore it anytime.",
      confirmLabel: "Archive",
    })
    log(root, yes ? "Archived the project" : "Kept the project")
  })
}

export { mount }
```

Choose Archive Project, then Archive or Cancel. The console shows the answer.

## Confirm

Use `createConfirm<Payload>()` to ask a question from an event handler and await the answer. Import it from `@ui-sdk/web/alert-dialog`, create it once, then assign its `controller` to the root element's `controller` property. The `payloadchange` event provides the current question in `event.detail.value`.

`await confirm({ name })` resolves `true` when the Close part with `value="confirm"` closes the dialog. Cancel, Escape, and other answers resolve `false`. This lets several rows share one dialog:

```ts title="confirm.ts"
import {
  createConfirm,
  type UiAlertDialogElement,
} from "@ui-sdk/web/alert-dialog"

const names = ["Acme", "Globex", "Initech"]

function mount(root: HTMLElement) {
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
            <ui-alert-dialog-description>
              The project and its files will be deleted for everyone on your team.
            </ui-alert-dialog-description>
          </div>
          <div data-slot="row">
            <ui-alert-dialog-close>
              <button>Cancel</button>
            </ui-alert-dialog-close>
            <ui-alert-dialog-close value="confirm">
              <button data-variant="solid">Delete</button>
            </ui-alert-dialog-close>
          </div>
        </ui-alert-dialog-content>
      </ui-alert-dialog>
    </div>
  `
  const confirm = createConfirm<{ name: string }>()
  const dialog =
    root.querySelector<UiAlertDialogElement<{ name: string }>>(
      "ui-alert-dialog"
    )!
  const title = root.querySelector("ui-alert-dialog-title")!
  const list = root.querySelector("ul")!
  const reset = root.querySelector("button")!
  dialog.controller = confirm.controller
  dialog.addEventListener("payloadchange", (event) => {
    title.textContent = `Delete ${event.detail.value?.name}?`
  })

  function resetProjects() {
    list.innerHTML = names
      .map(
        (name) =>
          `<li data-slot="row">${name}<button type="button" data-size="sm" aria-label="Delete ${name}">Delete</button></li>`
      )
      .join("")
    for (const [index, row] of list.querySelectorAll("li").entries()) {
      const name = names[index]
      row.querySelector("button")!.addEventListener("click", async () => {
        if (!(await confirm({ name }))) {
          return
        }
        const next = (
          row.nextElementSibling ?? row.previousElementSibling
        )?.querySelector("button")
        const target = next ?? reset
        target.focus()
        row.remove()
        if (!list.children.length) {
          list.innerHTML = `<li data-slot="row">All projects deleted.</li>`
        }
      })
    }
  }
  reset.addEventListener("click", resetProjects)
  resetProjects()
}

export { mount }
```

Delete a project. Cancel or Escape keeps it; Delete removes it and focuses a neighboring row's button. Reset Projects brings the list back.

When the action removes the button that opened the dialog, choose a useful place for focus to go. This example focuses a neighboring row, or Reset Projects when the list is empty.

## Queued Questions

Calls to the same confirm function wait their turn. You can ask two questions at once; the second appears only after the first has an answer.

```ts title="queue.ts"
import {
  createConfirm,
  type UiAlertDialogElement,
} from "@ui-sdk/web/alert-dialog"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <button type="button">Review Two Projects</button>
      <ui-alert-dialog>
        <ui-alert-dialog-backdrop hidden></ui-alert-dialog-backdrop>
        <ui-alert-dialog-content hidden>
          <div data-slot="stack">
            <ui-alert-dialog-title></ui-alert-dialog-title>
            <ui-alert-dialog-description>
              Archived projects leave the active list. You can restore them later.
            </ui-alert-dialog-description>
          </div>
          <div data-slot="row">
            <ui-alert-dialog-close>
              <button>Cancel</button>
            </ui-alert-dialog-close>
            <ui-alert-dialog-close value="confirm">
              <button data-variant="solid">Archive</button>
            </ui-alert-dialog-close>
          </div>
        </ui-alert-dialog-content>
      </ui-alert-dialog>
    </div>
  `
  const confirm = createConfirm<{ name: string }>()
  const dialog =
    root.querySelector<UiAlertDialogElement<{ name: string }>>(
      "ui-alert-dialog"
    )!
  const title = root.querySelector("ui-alert-dialog-title")!
  dialog.controller = confirm.controller
  dialog.addEventListener("payloadchange", (event) => {
    title.textContent = `Archive ${event.detail.value?.name}?`
  })
  root.querySelector("button")!.addEventListener("click", async () => {
    const acme = confirm({ name: "Acme" })
    const globex = confirm({ name: "Globex" })
    const [first, second] = await Promise.all([acme, globex])
    log(root, `Acme: ${first ? "confirmed" : "canceled"}`)
    log(root, `Globex: ${second ? "confirmed" : "canceled"}`)
  })
}

export { mount }
```

Choose Review Two Projects. Answer the Acme question, then the Globex question. The console shows both answers once the second one is in.

## Styling

Each element has a `data-slot`, such as `alert-dialog-content`, and shows its state through the attributes listed under [Data Attributes](#data-attributes). [Styling and Animation](../styling-and-animation.md) covers state attributes and entry and exit transitions.

### `<ui-alert-dialog-content>`
- `--dialog-stack`: How many dialogs are open above this one, nested inside it. 0 for the topmost.
- `--keyboard-inset`: How many pixels of the page the on-screen keyboard covers, 0 without one.
- `--visual-viewport-width`: The width of the part of the page you can see.
- `--visual-viewport-height`: The height of the part of the page you can see, above the keyboard.
- `--visual-viewport-top`: How far the part of the page you can see is scrolled from the top of the layout, as when the keyboard pushes it up.

## Data Attributes

### `<ui-alert-dialog-trigger>`
`[data-slot="alert-dialog-trigger"]`

- `data-closed`: Present while the dialog is closed, including while it animates out.
- `data-disabled`: Present when the trigger is disabled.
- `data-open`: Present while the dialog is open. On a trigger, while it's open from that trigger.

### `<ui-alert-dialog-backdrop>`
`[data-slot="alert-dialog-backdrop"]`

- `data-closed`: Present while the dialog is closed, including while it animates out.
- `data-open`: Present while the dialog is open. On a trigger, while it's open from that trigger.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the dialog animates out. Style the state you animate to.

### `<ui-alert-dialog-content>`
`[data-slot="alert-dialog-content"]`

- `data-closed`: Present while the dialog is closed, including while it animates out.
- `data-open`: Present while the dialog is open. On a trigger, while it's open from that trigger.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the dialog animates out. Style the state you animate to.
- `data-keyboard`: Present while the on-screen keyboard covers part of the page.

### `<ui-alert-dialog-close>`
`[data-slot="alert-dialog-close"]`

- `data-pending`: Present on a Close part while its action runs.

## API Reference

Alert Dialog shares [Dialog's](./dialog.md) options, except `modal`, `closeOnOutsidePress`, and `presentation`. It is always modal, never closes on an outside press, and does not present as a sheet.

### AlertDialog

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `open?` (`boolean`): Whether the dialog is open. Pass it to control the dialog.
- `defaultOpen?` (`boolean`): Whether the dialog starts open, when uncontrolled. Focus moves into it once it's on the page.
- `openchangecomplete event`: Runs once the dialog has finished opening or closing, after any animation.
- `dismissible?` (`boolean`): Whether Escape, an outside press and Android's back gesture can close the dialog. Close parts, triggers and the controller always can. Pass `false` while a form has unsaved changes, and ask in `dismissattempt`.
- `dismissattempt event`: Runs when a dismissal was refused, because `dismissible` is false, an outside press doesn't close it, or a Close part's action is running. Ask "Discard changes?" here.
- `persistentElements?` (`(string | Element)[] | (() => Element[])`): Elements that stay usable while the dialog makes the page inert, like a chat launcher or a password manager's button. Elements, CSS selectors, or a function that returns elements, read when the dialog opens. Presses on them never close it.
- `pendingAnnouncement?` (`string`): What screen readers hear once a Close part's action has been running for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.
- `openchange event`: Runs when the alert dialog wants to open or close. `details.reason` says why, `details.cancel()` stops it, and `details.returnValue` is the `value` of the Close part that closed it.
- `payloadchange event`: Runs when a trigger or a controller with another payload opens the alert dialog, before `openchange`, or a controller's `open({ payload })` gives the open one another payload. `details.cancel()` keeps the previous payload.
- `controller?` (`PopupController<any, AlertDialogOpenChangeReason, {}, any, DialogPayloadChangeReason>`): Opens, closes and inspects the alert dialog from anywhere. Create one with `createAlertDialogController()` or `createConfirm()`.

### AlertDialogTrigger

- `disabled?` (`boolean`): Stops the trigger from opening the dialog. A native button can't be focused or pressed, unless `focusableWhenDisabled` is set.
- `focusableWhenDisabled?` (`boolean`): Keeps a disabled trigger in the tab order with `aria-disabled` instead of the native attribute, so it can host a tooltip that says why. Presses still do nothing.
- `payload?` (`unknown`): Data for the content to render when this trigger opens the dialog, like the row it belongs to.
- `shortcut?` (`string`): A keyboard shortcut that presses the trigger, like `"mod+k"`. `mod` is Command on Apple platforms and Control elsewhere. Sets `aria-keyshortcuts`, and a Shortcut part inside shows it. A modal dialog pauses the page's shortcuts while it's open.
- `controller?` (`PopupController<any, AlertDialogOpenChangeReason, {}, any, DialogPayloadChangeReason>`): Connects a trigger outside the alert dialog to the alert dialog with this controller.

### AlertDialogBackdrop

Dims the page behind the dialog. `<ui-alert-dialog-backdrop>` takes no attributes of its own.

### AlertDialogContent

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `initialFocus?` (`DialogInitialFocus`): Where focus goes when the dialog opens. Opening with touch focuses the dialog itself, so no on-screen keyboard appears.
- `finalFocus?` (`PopupFocusTarget`): Where focus goes when the dialog closes while focus is inside it.
- `keepMounted?` (`boolean`): Whether the dialog stays in the page, hidden, while closed. For animation libraries that drive the exit from state.

### AlertDialogTitle

The question. `<ui-alert-dialog-title>` renders a level 2 heading, and the content uses it as its accessible name.

### AlertDialogDescription

What happens if you agree. `<ui-alert-dialog-description>` is a paragraph, and the content uses it as its accessible description.

### AlertDialogClose

- `value?` (`string`): Reported as `returnValue` in `openchange` and by the controller's `open()`. `createConfirm()` resolves `true` for `"confirm"`.
- `action?` (`((event: Event | undefined, details: ActionDetails) => unknown)`): Runs when the part is pressed, before the dialog closes. A returned Promise keeps the dialog open while it runs: the part gets `data-pending`, `aria-busy` and `aria-disabled`, screen readers hear the dialog's `pendingAnnouncement` after a second, and nothing but the controller closes the dialog. It closes with reason `"action"` once the Promise resolves. A rejection keeps it open and puts the reason in the part's `error` state until the next press, or until the dialog opens again. `details.source` says how the part was pressed, for changes made after an `await`.

### AlertDialogShortcut

- `shortcut?` (`string`): The keys to show. Inside a trigger, its `shortcut`.

### Confirm Options

The shared `confirm()` function uses these options when a `ui-overlay-host` renders the question. See [Toasts and Confirms](../popups.md#toasts-and-confirms) for the host setup. With your own dialog, `createConfirm<Payload>()` accepts the payload you choose instead.

- `title` (`string`): The question, like "Delete this project?".
- `description?` (`string`): What agreeing does.
- `confirmLabel?` (`string`): The agreeing button's text.
- `cancelLabel?` (`string`): The other button's text.

### State

`AlertDialogContent`:

- `open` (`boolean`): Whether the dialog is open. False while it animates out.
- `modal` (`boolean | "trap-focus"`): The `modal` setting. Always true for an alert dialog.
- `nested` (`boolean`): Whether the dialog was opened from inside another dialog.
- `nestedOpen` (`boolean`): Whether a dialog opened from inside this one is open.
- `stack` (`number`): How many dialogs are open above this one, nested inside it.
- `payload` (`Payload | undefined`): The payload of the last open, from the trigger that opened it or a controller, typed as the controller's `Payload`.
- `pending` (`boolean`): Whether a Close part's action is running.
- `presentation` (`"dialog"`): Always `"dialog"`: an alert dialog never presents as a sheet.

`AlertDialogClose`:

- `pending` (`boolean`): Whether this part's action is running.
- `error` (`unknown`): Why this part's last action failed, until it's pressed again or the dialog opens again.

`AlertDialogShortcut`:

- `text` (`string`): The shortcut formatted for this platform: `⌘K` on Apple platforms and `Ctrl+K` elsewhere. Empty without one.

### Reasons

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `parent-close` (`none`): The parent layer closed.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `action` (`MouseEvent | KeyboardEvent`): A Close part's `action` finished.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

`payloadchange` fires before `openchange` when the dialog opens with another payload. Calling `controller.open({ payload })` on an open dialog updates the payload with the reason `imperative`.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Use `createAlertDialogController<Payload, Result>()` from `@ui-sdk/web/alert-dialog` for direct control. The root element's `api` property has the same methods. `createConfirm<Payload>()` returns a confirm function with its own `controller`.

- `isOpen()` (`() => boolean`): Whether it's open. False as soon as it starts closing, while it still animates out.
- `setOpen(open, options?)` (`(open: boolean, options?: PopupChangeOptions<AlertDialogOpenChangeReason> | undefined) => boolean`): Opens or closes it. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (PopupChangeOptions<DialogPayloadChangeReason> & { payload?: Payload | undefined; anchor?: Anchor | undefined; signal?: AbortSignal | undefined; }) | undefined) => Promise<...>`): Opens it, and resolves once it closes, with why, how and any return value. Resolves exactly once and never rejects: on the next close from any source, when `signal` aborts, or with reason `"unmount"` when the component leaves the page.
- `close(options?)` (`(options?: (PopupChangeOptions<AlertDialogOpenChangeReason> & { returnValue?: Result | undefined; }) | undefined) => boolean`): Closes it. `returnValue` is passed to the promise `open()` returned. Returns false when the close was canceled or it was already closed.
- `toggle(options?)` (`(options?: PopupChangeOptions<AlertDialogOpenChangeReason> | undefined) => boolean`): Opens it when it's closed, and closes it when it's open. Returns false when the change was canceled.
- `getPayload()` (`() => Payload | undefined`): The payload of the last open, from a controller or the trigger that opened it.
- `focus()` (`() => void`): Moves focus to the trigger that opened it last, or the first trigger.

## Accessibility

Give the dialog a title and a description, and put the least destructive answer first. It follows the [WAI-ARIA alert dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/).

The dialog uses the `alertdialog` role and keeps the rest of the page inert while it's open. Screen readers announce its title and description. Opening it focuses the first Close part, so put Cancel first. A touch open focuses the content instead, so no on-screen keyboard appears. Escape closes the dialog, but pressing outside never does. [Dialog](./dialog.md#focus) covers other initial and final focus targets.

These behaviors are covered by automated tests:

**Alert dialog**

- Opens with focus on the least destructive action.
- Is described by its message.
- An outside press keeps it open.
- Escape closes it and returns focus to the trigger.
- Tab cycles between its actions.
- The action reports and closes.

Runs in React, Vue and web components.
