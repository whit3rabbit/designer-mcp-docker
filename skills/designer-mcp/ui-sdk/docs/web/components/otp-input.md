# OTP Input

Enter a one-time code with support for pasting, autofill, and native form validation.

Use an OTP Input for a short code sent by text or email, like a sign-in or verification code. Each character gets its own slot, and a pasted or autofilled code fills them all at once.

```ts title="basic.ts"
import "@ui-sdk/web/otp-input"
import "@ui-sdk/web/field"
import { createElement, Minus } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Verification code</ui-field-label>
      <ui-otp-input max-length="6">
        <ui-otp-input-group>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
        </ui-otp-input-group>
        <ui-otp-input-separator>${createElement(Minus, { "aria-hidden": "true" }).outerHTML}</ui-otp-input-separator>
        <ui-otp-input-group>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
        </ui-otp-input-group>
      </ui-otp-input>
    </ui-field>
  `
}

export { mount }
```

Type a six-digit code or paste 123-456. Click a slot to edit it, use the arrow keys to move, and use your usual undo shortcut to undo a change.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. Import the field too if you use it. On the server the import does nothing.

```ts
import "@ui-sdk/web/otp-input"
import "@ui-sdk/web/field"
```

## Composition

Use the following composition to build a `ui-otp-input`:

```text
ui-otp-input
└── ui-otp-input-group
    ├── ui-otp-input-slot
    └── ui-otp-input-slot
```

`ui-otp-input` creates the native input and holds the code. `ui-otp-input-group` lays out a run of slots. Each `ui-otp-input-slot` displays the character at its place among the input's slots, or at its zero-based `index` if you set one. Add `ui-otp-input-separator` between groups when the code is easier to read in sections, like the dash in the example above.

Groups and separators change the presentation of one value. They do not create additional fields or tab stops: the slots display the value of a single native input, which handles selection, paste, undo, form submission, and autofill. It uses `autocomplete="one-time-code"` so supported browsers and password managers can offer a saved or received code.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/otp-input"
</script>

<ui-otp-input max-length="4" aria-label="Verification code">
  <ui-otp-input-group>
    <ui-otp-input-slot></ui-otp-input-slot>
    <ui-otp-input-slot></ui-otp-input-slot>
    <ui-otp-input-slot></ui-otp-input-slot>
    <ui-otp-input-slot></ui-otp-input-slot>
  </ui-otp-input-group>
</ui-otp-input>
```

## Four Digits

Set `max-length` to the code's length and render that many slots. The default length is six.

```ts title="four-digits.ts"
import "@ui-sdk/web/otp-input"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>PIN</ui-field-label>
      <ui-otp-input max-length="4" text-align="center">
        <ui-otp-input-group>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
        </ui-otp-input-group>
      </ui-otp-input>
    </ui-field>
  `
}

export { mount }
```

Enter four digits in PIN. Once it is full, typing another digit replaces the selected slot. Click another slot to edit it.

## Alphanumeric

Set `pattern` to `digits`, `letters`, or `alphanumeric`. The default is `digits`. The pattern filters characters and selects a suitable keyboard on touch devices.

```ts title="alphanumeric.ts"
import "@ui-sdk/web/otp-input"
import "@ui-sdk/web/field"
import { createElement, Minus } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Recovery code</ui-field-label>
      <ui-otp-input max-length="8" pattern="alphanumeric">
        <ui-otp-input-group>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
        </ui-otp-input-group>
        <ui-otp-input-separator>${createElement(Minus, { "aria-hidden": "true" }).outerHTML}</ui-otp-input-separator>
        <ui-otp-input-group>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
        </ui-otp-input-group>
      </ui-otp-input>
    </ui-field>
  `
}

export { mount }
```

Type letters and digits into Recovery code, or paste ab12-cd34. The hyphen is removed and the eight characters fill the slots.

## Custom Pattern

Pass the source of a regular expression, such as `pattern="[0-9A-Fa-f]"` to accept hexadecimal characters. Use `input-mode` to choose the keyboard separately. The example displays letters in uppercase without changing their stored case.

```ts title="pattern.ts"
import "@ui-sdk/web/otp-input"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Device code</ui-field-label>
      <ui-otp-input max-length="6" pattern="[0-9A-Fa-f]" input-mode="text">
        <ui-otp-input-group>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
        </ui-otp-input-group>
      </ui-otp-input>
    </ui-field>
  `
}

export { mount }
```

Try typing 12zzab into Device code. The z characters are rejected; the accepted value is 12ab, displayed as 12AB.

## Validation

Inside a [Field](./field.md), set `invalid` on `ui-field` when your code rejects the value, such as a code the server didn't accept. The field marks the input with `aria-invalid` and connects its `ui-field-error`. Outside a field, pass `aria-invalid` and `aria-describedby` yourself.

```ts title="invalid.ts"
import "@ui-sdk/web/otp-input"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field invalid>
      <ui-field-label>Verification code</ui-field-label>
      <ui-otp-input default-value="482913">
        <ui-otp-input-group>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
        </ui-otp-input-group>
      </ui-otp-input>
      <ui-field-error>That code has expired. Request a new one.</ui-field-error>
    </ui-field>
  `
  const field = root.querySelector("ui-field")!
  root.querySelector("ui-otp-input")!.addEventListener("valuechange", () => {
    field.invalid = false
  })
}

export { mount }
```

Verification code is marked invalid, and the error below explains why. Edit any digit to clear the error.

## Controlled

Listen for `valuechange` to read changes, and set the element's `value` property to update it. Call `event.preventDefault()` in the listener to reject a change. Incoming values are filtered by the pattern and limited to `max-length`, just like typed values.

```ts title="controlled.ts"
import "@ui-sdk/web/otp-input"
import "@ui-sdk/web/field"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>One-time password</ui-field-label>
      <ui-otp-input>
        <ui-otp-input-group>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
        </ui-otp-input-group>
      </ui-otp-input>
    </ui-field>
  `
  root
    .querySelector("ui-otp-input")!
    .addEventListener("valuechange", (event) => {
      const { value, reason } = event.detail
      log(root, `${value || "Empty"} (${reason})`)
    })
}

export { mount }
```

Enter, paste, or delete digits in One-time password. The console logs each new code and its reason.

See [State and Events](../state-and-events.md) for the shared state conventions. The [reason](#reasons) distinguishes typing, pasting, undo, and controller actions.

## On Complete

`valuecommit` fires when a change fills every slot, including typing, paste, autofill, and controller writes. Changing an already-full code fires it again. Form resets and page restoration do not.

```ts title="complete.ts"
import "@ui-sdk/web/otp-input"
import "@ui-sdk/web/field"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Verification code</ui-field-label>
      <ui-otp-input>
        <ui-otp-input-group>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
          <ui-otp-input-slot></ui-otp-input-slot>
        </ui-otp-input-group>
      </ui-otp-input>
    </ui-field>
  `
  root
    .querySelector("ui-otp-input")!
    .addEventListener("valuecommit", (event) => {
      const { value, reason } = event.detail
      log(root, `Checking ${value} (${reason})`)
    })
}

export { mount }
```

Fill all six slots. The console logs the complete code and the change reason. Replace a digit to log it again; deleting one logs nothing.

## Forms

Set `name` to include the code in `FormData`. `required` blocks an empty code, and a partial code fails length validation. Reset restores the default value. Use `form` to associate a control outside the form with its ID.

```ts title="form.ts"
import "@ui-sdk/web/otp-input"
import "@ui-sdk/web/field"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <form id="verify-sign-in">
        <ui-field>
          <ui-field-label>Verification code</ui-field-label>
          <ui-otp-input name="code" required>
            <ui-otp-input-group>
              <ui-otp-input-slot></ui-otp-input-slot>
              <ui-otp-input-slot></ui-otp-input-slot>
              <ui-otp-input-slot></ui-otp-input-slot>
              <ui-otp-input-slot></ui-otp-input-slot>
              <ui-otp-input-slot></ui-otp-input-slot>
              <ui-otp-input-slot></ui-otp-input-slot>
            </ui-otp-input-group>
          </ui-otp-input>
          <ui-field-description>Enter the six-digit code we sent to hollis@example.com.</ui-field-description>
          <ui-field-error></ui-field-error>
        </ui-field>
      </form>
      <ui-field>
        <ui-field-label>Recovery code (optional)</ui-field-label>
        <ui-otp-input name="recovery" form="verify-sign-in" max-length="8" pattern="alphanumeric">
          <ui-otp-input-group>
            <ui-otp-input-slot></ui-otp-input-slot>
            <ui-otp-input-slot></ui-otp-input-slot>
            <ui-otp-input-slot></ui-otp-input-slot>
            <ui-otp-input-slot></ui-otp-input-slot>
            <ui-otp-input-slot></ui-otp-input-slot>
            <ui-otp-input-slot></ui-otp-input-slot>
            <ui-otp-input-slot></ui-otp-input-slot>
            <ui-otp-input-slot></ui-otp-input-slot>
          </ui-otp-input-group>
        </ui-otp-input>
        <ui-field-error></ui-field-error>
      </ui-field>
      <div data-slot="row">
        <button type="reset" form="verify-sign-in">Reset</button>
        <button type="submit" form="verify-sign-in" data-variant="solid">Verify</button>
      </div>
    </div>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const data = [...new FormData(form)].map(
      ([name, value]) => `${name}=${value}`
    )
    log(root, `Submitted ${data.join(", ")}`)
  })
}

export { mount }
```

Choose Verify with an empty or partial code to see validation. Enter all six digits and choose Verify to log the form values. Recovery code sits outside the form but submits with it. Reset clears both fields.

A typed partial code reports `tooShort`. Partial default values and controller writes are checked through the native input's pattern, because browsers do not apply minlength validation to those values.

## Disabled and Read-Only

A disabled input cannot be focused, changed, or submitted. `read-only` prevents changes while keeping the input focusable and included in form data.

```html
<ui-otp-input disabled default-value="123456" aria-label="Disabled code">
  ...
</ui-otp-input>
<ui-otp-input read-only default-value="654321" aria-label="Read-only code">
  ...
</ui-otp-input>
```

## Controller

Use the element's `api` to read, fill, clear, or focus the input from another control. Writes use the `imperative` reason and pass through the same filtering and `valuechange` events as typing.

```html
<button type="button" data-action="fill">Fill</button>
<button type="button" data-action="clear">Clear</button>
<button type="button" data-action="read">Read</button>
<button type="button" data-action="focus">Focus</button>
<ui-otp-input aria-label="Verification code"> ... </ui-otp-input>
```

```ts
const code = document.querySelector("ui-otp-input")!.api
document
  .querySelector('[data-action="fill"]')!
  .addEventListener("click", () => code.setValue("123456"))
document
  .querySelector('[data-action="clear"]')!
  .addEventListener("click", () => code.clear())
document
  .querySelector('[data-action="read"]')!
  .addEventListener("click", () => console.log(code.getValue()))
document
  .querySelector('[data-action="focus"]')!
  .addEventListener("click", () => code.focus())
```

[Controllers](../controllers.md) covers an element's `api`.

## Custom Rendering

Elements have no render functions. Each slot shows its character, and marks `active` and `hasFakeCaret` with `data-active` and `data-fake-caret`. Read the whole code from the `value` property or the `valuechange` event. See [Parts and Composition](../parts-and-composition.md) for choosing the elements parts bind.

## Styling

Draw the active slot and caret with `data-active` and `data-fake-caret`. The examples include the caret animation and disable it for reduced motion. Keep `position: relative` on each slot so its caret stays inside it.

Each part has a `data-slot`, such as `otp-input-slot`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### `<ui-otp-input>`
`[data-slot="otp-input"]`

- `data-complete`: Present while every slot is filled.
- `data-filled`: Present while the code holds any character.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-focused`: Present while the input has focus.

### `<ui-otp-input-group>`
`[data-slot="otp-input-group"]`

- `data-complete`: Present while every slot is filled.
- `data-filled`: Present while the code holds any character.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-focused`: Present while the input has focus.

### `<ui-otp-input-slot>`
`[data-slot="otp-input-slot"]`

- `data-filled`: Present while the slot holds a character.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-active`: Present on the slot typing goes to: the selected character, or the empty slot after the last one. Only while focused.
- `data-fake-caret`: Present on the active slot while it's empty. Draw a blinking caret in it; the input's own caret is hidden.

### `<ui-otp-input-separator>`
`[data-slot="otp-input-separator"]`

- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.

## API Reference

Props are attributes in kebab case, like `max-length`, `default-value` and `read-only`. `pattern` is a
preset name or the source of a regular expression. `controller` is a property. Callbacks are DOM events.

### OTPInput

- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.
- `value?` (`string`): The code, for a controlled input.
- `defaultValue?` (`string`): The code it starts with, when uncontrolled. A form reset returns here.
- `valuechange event`: Runs when the code changes: typing or deleting (`"input-change"`), a paste (`"paste"`), the browser's undo and redo, a form reset, or a controller. Autofill and codes from the keyboard's suggestions are `"input-change"`. `details.cancel()` keeps the code as it was.
- `valuecommit event`: Runs when a change fills every slot, with the whole code, like to verify it. A controller filling it counts, so does a code that changes while full.
- `maxLength?` (`number`): How many characters the code has, one slot each.
- `pattern?` (`OTPInputPattern`): Which characters it accepts: `"digits"`, `"letters"`, `"alphanumeric"`, or a regular expression each character must match, like `/[A-F0-9]/i`. Anything else typed, pasted or dropped is ignored.
- `inputMode?` (`"decimal" | "none" | "numeric" | "tel" | "text"`): The keyboard touch screens show.
- `textAlign?` (`"center" | "end" | "start"`): Where the invisible input keeps its text and caret. It decides where the browser puts its own popups, like the paste menu on phones. `"start"` and `"end"` follow the reading direction.
- `autoComplete?` (`string`): The input's `autocomplete`. `"one-time-code"` lets phones offer a code from a message, and password managers fill it.
- `disabled?` (`boolean`): Disables it like a native input: it can't be focused, and isn't submitted.
- `readOnly?` (`boolean`): Makes it read-only: focusable and submitted, but the code can't change.
- `required?` (`boolean`): Requires a code before the form submits. A partial code is too short either way.
- `name?` (`string`): The name it submits the code under.
- `form?` (`string`): The id of a form to belong to, when it isn't inside that form.
- `controller?` (`{ getValue: () => string; setValue: (value: string, options?: OTPInputChangeOptions) => boolean; clear: (options?: OTPInputChangeOptions) => boolean; focus: () => void; }`): Reads and writes the code from anywhere. Create one with `createOTPInputController()`.

### OTPInputSlot

- `index` (`number`): Which character of the code the slot shows, from 0.

### State

The same state shows as data attributes on each element. The root, groups and separators get the
input's state.

- `value` (`string`): The code.
- `slots` (`OTPInputSlotData[]`): One entry per slot: its character, whether it's active, and whether it draws a caret.
- `focused` (`boolean`): Whether the input has focus.
- `complete` (`boolean`): Whether every slot is filled.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.

Slots get their own:

- `char` (`string | null`): The character in the slot, or null when it's empty.
- `active` (`boolean`): Whether the slot is where typing goes: the selected character, or the empty slot after the last one.
- `hasFakeCaret` (`boolean`): Whether the slot should draw a caret: it's active and empty. The real caret is hidden.
- `index` (`number`): Which character of the code the slot shows.
- `focused` (`boolean`): Whether the input has focus.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.

### Reasons

`event.detail.reason` says why the code changed. Autofill and a code from the keyboard's suggestions are `input-change`.

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `paste` (`ClipboardEvent`): Files were pasted, like a screenshot, or text and tokens into a token input.
- `undo` (`KeyboardEvent | InputEvent`): Undo, from the keyboard, the Edit menu or a controller.
- `redo` (`KeyboardEvent | InputEvent`): Redo, from the keyboard, the Edit menu or a controller.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods. The `value` property reads and sets the code.

`setValue()` and `clear()` take an optional `{ reason, event }`, and fire `valuechange` like typing.

- `getValue()` (`() => string`): The code.
- `setValue(value, options?)` (`(value: string, options?: OTPInputChangeOptions | undefined) => boolean`): Sets the code, as typing it would. Characters that don't fit the pattern are dropped. Returns false when the change was canceled or nothing changed.
- `clear(options?)` (`(options?: OTPInputChangeOptions | undefined) => boolean`): Empties the code. Returns false when the change was canceled or nothing changed.
- `focus()` (`() => void`): Moves focus to the input.

### Events

Events fire on their own element and don't bubble, with the code in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` on `valuechange` cancels the change.

| Member                      | On             | Description                                                |
| --------------------------- | -------------- | ---------------------------------------------------------- |
| `value` property, attribute | `ui-otp-input` | The code                                                   |
| `api` property              | `ui-otp-input` | The [controller](#controller)                              |
| `valuechange` event         | `ui-otp-input` | `detail: { value, reason, event }`, on every change        |
| `valuecommit` event         | `ui-otp-input` | `detail: { value, reason, event }`, when a change fills it |

## Accessibility

Name the input with `ui-field-label`, a native label, `aria-label`, or `aria-labelledby`. Screen readers encounter one input with the whole code; the visual slots, groups, and separators are hidden from them.

### Keyboard

The input keeps its native keys. Arrow keys, Home, and End move the selection between slots, Backspace deletes, and your usual shortcuts undo and redo. Pasting a code such as `123-456` removes the separators.

### Tested Behavior

Every line below is an automated test.

- Typing fills the slots in order.
- Characters the pattern doesn't accept are ignored.
- Filling every slot completes the code.
- Backspace deletes the last character.
- ArrowLeft goes back a slot, and typing replaces its character.
- Pressing a filled slot lets you retype it.
- Pasting a code with a dash fills every slot.
- The form submits the code under its name.
- A partial default code is too short to submit.
- A typed partial code is too short, not the wrong format.
- A canceled change keeps the code.
- A disabled code can't be typed into.
- A code of letters and digits takes both.
- The input asks for a one-time code and a numeric keyboard.
- Typing a whole code with no waits fills it.

Runs in React, Vue and web components.
