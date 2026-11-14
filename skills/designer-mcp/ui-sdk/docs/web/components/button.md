# Button

Run an action, show that it's working, and keep it reachable when disabled.

Button wraps a native `button` and adds what it doesn't do on its own: it stays pending while an async action runs, so a form can't submit twice, announces slow actions to screen readers, can stay focusable while disabled, and keeps the same behavior when it wraps a link. For a plain click handler, a native `button` is enough.

```ts title="basic.ts"
import "@ui-sdk/web/button"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `<ui-button><button>Button</button></ui-button>`
  root
    .querySelector("ui-button")!
    .addEventListener("action", () => log(root, "Pressed"))
}

export { mount }
```

Click Button, or focus it and press Enter or Space. The console logs each press.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component registers `<ui-button>` in the browser. On the server the import does nothing.

```ts
import "@ui-sdk/web/button"
```

## Usage

Wrap a native `<button>` in `<ui-button>`, then listen for its `action` event to run an action. A button without a type gets `type="button"`.

```html
<ui-button><button>Save</button></ui-button>
```

```ts
import "@ui-sdk/web/button"

document.querySelector("ui-button")!.addEventListener("action", () => save())
```

The wrapper displays as `contents`. Put classes and native attributes on the inner button; put options such as `disabled` on `<ui-button>`.

## Pending

Pass a Promise to `event.detail.waitUntil()` to keep the button pending until it settles. The button keeps focus and ignores further presses while it waits. Call `waitUntil()` during the event listener, before an `await`.

```ts
button.addEventListener("action", (event) => {
  event.detail.waitUntil(new Promise((resolve) => setTimeout(resolve, 1500)))
})
```

After one second, it announces "Loading" to screen readers. Set `pending-announcement="Saving"` on `<ui-button>` to change that message, or use an empty string to silence it.

```ts title="pending.ts"
import "@ui-sdk/web/button"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function mount(root: HTMLElement) {
  root.innerHTML = `<ui-button pending-announcement="Saving"><button>Save</button></ui-button>`
  root
    .querySelector("ui-button")!
    .addEventListener("action", (event) => event.detail.waitUntil(wait(1500)))
}

export { mount }
```

Press Save, then press it again while it saves. Nothing happens until the first action finishes.

## Pending Content

To change what the button shows while it waits, mark content with `data-show="idle"` or `data-show="pending"` and hide it in the other state with one CSS rule each, or use Tailwind's `in-data-pending` variant:

```css
[data-slot="button"]:not([data-pending]) [data-show="pending"],
[data-slot="button"][data-pending] [data-show="idle"] {
  display: none;
}
```

```ts title="pending-content.ts"
import "@ui-sdk/web/button"
import { ArrowDownToLine, createElement, LoaderCircle } from "lucide"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-button pending-announcement="Saving">
      <button>
        ${createElement(ArrowDownToLine, { "data-show": "idle", "aria-hidden": "true" }).outerHTML}
        ${createElement(LoaderCircle, { "data-show": "pending", "data-slot": "spinner", "aria-hidden": "true" }).outerHTML}
        Save
      </button>
    </ui-button>
  `
  root
    .querySelector("ui-button")!
    .addEventListener("action", (event) => event.detail.waitUntil(wait(1500)))
}

export { mount }
```

Press Save. Its arrow turns into a spinner while it saves.

Keep the label and change only the visual, as above. If the text has to change too, swap it the same way, without an `aria-label`. [Pending Buttons](#pending-buttons) explains why:

```html
<ui-button>
  <button>
    <span data-show="idle">Save</span>
    <span data-show="pending">Saving…</span>
  </button>
</ui-button>
```

## Handling Errors

If the Promise rejects, Button clears its pending state and accepts another press. Handle the rejection to show a message or a retry label.

Web components have no render function: the demo passes the original Promise to `waitUntil()` and handles its rejection separately to change the label, so Button still receives the rejection.

```ts title="render.ts"
import "@ui-sdk/web/button"
import { log } from "./log"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-button><button>Save Changes</button></ui-button>
    </div>
  `
  const save = root.querySelector("ui-button")!
  const button = save.querySelector("button")!
  save.addEventListener("action", (event) => {
    button.textContent = "Saving…"
    const saving = wait(1000).then(() => {
      log(root, "Couldn't save. Check your connection and try again.")
      throw new Error("Couldn't save")
    })
    event.detail.waitUntil(saving)
    saving.catch(() => {
      button.textContent = "Try Again"
    })
  })
}

export { mount }
```

Choose Save Changes. Saving always fails here: the console shows the error and the label changes to Try Again.

## Changes After an Await

The `action` event's `detail.source` says how the button was pressed. If the listener changes another ui-sdk component after an `await`, wrap that change in `withSource` to keep the original source. Otherwise, the later change is reported as `"programmatic"`.

Here `save()` is your request, `saveButton` is a `<ui-button>`, and `status` is a `<ui-input>` whose `api` is its [controller](../controllers.md):

```ts
import "@ui-sdk/web/button"
import { withSource } from "@ui-sdk/web/observe"

saveButton.addEventListener("action", (event) => {
  const { source, waitUntil } = event.detail
  waitUntil(
    save().then(() => withSource(source, () => status.api.setValue("Saved")))
  )
})
```

[Observe](../core.md#keep-the-source-after-an-await) explains source tracking. Preserving `"agent"` lets [`undoSource("agent")`](../agents.md#undo-the-agents-changes) include that later change.

## Disabled

Set `disabled` on `<ui-button>` to prevent presses and remove its button from the tab order. A disabled `<fieldset>` around the button disables it too.

```html
<ui-button disabled><button>Disabled</button></ui-button>
```

```ts title="disabled.ts"
import "@ui-sdk/web/button"

function mount(root: HTMLElement) {
  root.innerHTML = `<ui-button disabled><button>Disabled</button></ui-button>`
}

export { mount }
```

Try clicking the button. It does nothing, and Tab skips it.

## Focusable When Disabled

Add `focusable-when-disabled` when people should still be able to focus a disabled button. The inner button uses `aria-disabled` instead of the native `disabled` attribute. Presses still do nothing.

Use `aria-describedby` on the inner button to explain why the action is unavailable:

```html
<ui-button disabled focusable-when-disabled>
  <button aria-describedby="publish-hint">Publish</button>
</ui-button>
<p id="publish-hint">Add a title to publish.</p>
```

```ts title="focusable-when-disabled.ts"
import "@ui-sdk/web/button"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import { log } from "./log"

function mount(root: HTMLElement) {
  const hintId = `publish-hint-${crypto.randomUUID()}`
  root.innerHTML = `
    <div data-slot="stack">
      <ui-field>
        <ui-field-label>Title</ui-field-label>
        <ui-input>
          <input />
        </ui-input>
      </ui-field>
      <div data-slot="row">
        <ui-button disabled focusable-when-disabled>
          <button aria-describedby="${hintId}">Publish</button>
        </ui-button>
        <p id="${hintId}" data-slot="hint">Add a title to publish.</p>
      </div>
    </div>
  `
  const title = root.querySelector("input")!
  const publish = root.querySelector("ui-button")!
  const hint = root.querySelector("p")!
  title.addEventListener("input", () => {
    const ready = title.value.trim() !== ""
    publish.disabled = !ready
    hint.textContent = ready ? "Ready to publish." : "Add a title to publish."
  })
  publish.addEventListener("action", () =>
    log(root, `Published “${title.value}”`)
  )
}

export { mount }
```

Focus Title, then press Tab to reach Publish while it is disabled. Enter a title to enable it, then choose Publish. The console logs what was published.

## Links

Wrap an `<a>` to make a link. It keeps its `href` and link semantics, including opening in a new tab. A disabled link cannot navigate and leaves the tab order.

```html
<ui-button><a href="/docs/web-components">Get started</a></ui-button>
```

```ts title="link.ts"
import "@ui-sdk/web/button"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="row">
      <ui-button><a href="#installation">Get Started</a></ui-button>
      <ui-button disabled><a href="#changelog">Changelog</a></ui-button>
    </div>
  `
}

export { mount }
```

Choose Get Started to jump to Installation on this page. Changelog is disabled and does not navigate.

For your own elements, see [Parts and Composition](../parts-and-composition.md).

## Forms

Set `type="submit"` on the inner button to submit a form or `type="reset"` to restore its default values. The default, `type="button"`, does neither.

```html
<ui-button><button type="submit">Subscribe</button></ui-button>
<ui-button><button type="reset">Reset</button></ui-button>
```

```ts title="form.ts"
import "@ui-sdk/web/button"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form data-slot="stack">
      <ui-field>
        <ui-field-label>Email</ui-field-label>
        <ui-input>
          <input name="email" type="email" value="ada@example.com" />
        </ui-input>
      </ui-field>
      <div data-slot="row">
        <ui-button><button type="submit">Subscribe</button></ui-button>
        <ui-button><button type="reset">Reset</button></ui-button>
      </div>
    </form>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    log(root, `Subscribed ${new FormData(form).get("email")}`)
  })
}

export { mount }
```

Edit the email and choose Subscribe, or press Enter in the field. The console logs each submission, and Reset restores the original email.

Button tracks Promises passed to its own `action` event's `waitUntil()`, not the form’s `submit` handler. For an async submit handler, set `disabled` on `<ui-button>` while it runs, with [`focusable-when-disabled`](#focusable-when-disabled) so the button keeps focus while it waits.

## Styling

State attributes go on the inner element: use `data-pending` to show a spinner or waiting cursor, and `data-disabled` to style an unavailable action. The inner element's `data-slot` is `button`, and its attributes are listed under [Data Attributes](#data-attributes).

[Styling and Animation](../styling-and-animation.md) covers the styling patterns shared by all components.

## Data Attributes

### `<ui-button>`
`[data-slot="button"]`

- `data-pending`: Present while the Promise its press handler returned is running.
- `data-disabled`: Present when disabled.

## API Reference

Set options as kebab-case attributes or camelCase properties on `<ui-button>`, such as `focusable-when-disabled` or `focusableWhenDisabled`. `type` comes from the inner button. `<ui-button>` binds to its first child button or link, or otherwise its first element, which gets the `button` role, a tab stop, and Enter and Space to press it. See [Parts and Composition](../parts-and-composition.md).

### Button

- `disabled?` (`boolean`): Stops presses. The button is natively disabled, so it leaves the tab order and its form doesn't submit through it, unless `focusableWhenDisabled` is set.
- `focusableWhenDisabled?` (`boolean`): Keeps a disabled button in the tab order with `aria-disabled` instead of the native attribute, so it can hold focus while it becomes disabled and host a tooltip that says why. Presses still do nothing.
- `type?` (`"button" | "reset" | "submit"`): What a native button does in a form: `"submit"` submits it and `"reset"` resets it. Ignored when the button renders as something else.
- `pendingAnnouncement?` (`string`): What screen readers hear once the button has been pending for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

Web components have no render function. Style the inner element's state attributes and handle your action's Promise to display errors.

- `disabled` (`boolean`): Whether it's disabled, by the `disabled` option or a disabled fieldset around it. A running press shows in `pending` instead.
- `pending` (`boolean`): Whether the Promise the last press returned is still running. Presses do nothing meanwhile.
- `error` (`unknown`): Why the last press failed: what its handler threw, or its Promise rejected with. Cleared by the next press.

### Events

Listen on `<ui-button>` itself. The `action` event is cancelable and composed, but does not bubble. A disabled or pending button does not fire it.

| Event    | Receives                                                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `action` | `detail: { source, waitUntil(promise) }`. Pass a Promise to `waitUntil()` during dispatch to keep the button pending until it settles. |

## Accessibility

Give the button a clear text label. If it contains only an icon, add an `aria-label` to the inner button. Native buttons respond to Enter and Space; links respond to Enter.

### Pending Buttons

While its action runs, the button tells assistive technology it's busy, so you don't need to add anything:

- It sets `aria-busy="true"` and `aria-disabled="true"` on the inner button, and ignores presses until the action settles. It keeps focus the whole time.
- After a second, it announces `pending-announcement` ("Loading" by default) through a polite live region. Quick actions stay silent. This is a status message: people hear it without focus moving.

To show progress, keep the label and change only the visual, like a spinner. Changing the text renames the button while it has focus: screen readers don't reliably announce a new name on the focused element, so the change mostly helps sighted users, and the button's width shifts as the text changes length. The announcement already tells everyone it's working.

```html title="Do"
<ui-button pending-announcement="Saving">
  <button>
    <svg data-show="idle" aria-hidden="true">…</svg>
    <svg data-show="pending" aria-hidden="true">…</svg>
    Save
  </button>
</ui-button>
```

```html title="Don't"
<ui-button>
  <button aria-label="Save">
    Saving…
    <span aria-live="polite">Saving</span>
  </button>
</ui-button>
```

The second button swaps its own text while it saves, shows text its accessible name doesn't contain, and announces the same state twice. If the text has to change anyway, swap it with `data-show` and leave out `aria-label`, so the button's name always contains the text on screen. See [Pending Content](#pending-content) for the markup.

References:

- [WCAG 2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)
- [WCAG 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WAI-ARIA `aria-busy`](https://www.w3.org/TR/wai-aria-1.2/#aria-busy) and [`aria-disabled`](https://www.w3.org/TR/wai-aria-1.2/#aria-disabled)

### Tested Behavior

The following behaviors are covered by automated tests:

- Clicking a button runs its handler.
- Space presses a focused button.
- Enter presses a focused button.
- A submit button submits its form.
- A reset button resets its form.
- A disabled button can't be focused or pressed.
- A button rendered as a link stays a link.

**Focusable when disabled**

- It stays focusable and says it's disabled.
- Tab reaches it.
- Clicking it runs nothing and submits nothing.
- Space on it runs nothing and submits nothing.
- Enter on it runs nothing and submits nothing.

**Pending**

- A returned Promise makes it busy, and it keeps focus until the Promise settles.
- While pending, it says it's unavailable with aria-disabled and keeps focus.
- Still pending after a second, it tells screen readers it's loading.
- A rejected Promise ends the pending state.

Runs in React, Vue and web components.
