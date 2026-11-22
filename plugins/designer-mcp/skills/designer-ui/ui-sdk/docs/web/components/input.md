# Input

Enter text, add a clear button, and connect the value to your form or state.

An input is a native text field for short values like a name, an email address or a search. It works inside a field and a form, and adds a clear button, text around the input, and change reasons.

```ts title="basic.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import { X, createElement } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field name="website">
      <ui-field-label>Website</ui-field-label>
      <ui-input-group>
        <span>https://</span>
        <ui-input>
          <input placeholder="example.com" value="hollisgrant.com" />
        </ui-input>
        <ui-input-clear>
          <button type="button" aria-label="Clear website">
            ${createElement(X, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-input-clear>
      </ui-input-group>
      <ui-field-description>Shown on your public profile.</ui-field-description>
    </ui-field>
  `
  root.querySelector("ui-input")!.addEventListener("valuechange", (event) => {
    const { value, reason } = event.detail
    log(root, `${value ? `“${value}”` : "Empty"} (${reason})`)
  })
}

export { mount }
```

Edit the website, then press Clear website. The text clears, focus returns to the input and the console logs the reason. Pressing https:// focuses the input too.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. On the server the import does nothing.

```ts
import "@ui-sdk/web/input"
```

## Composition

Use the following composition to build a `ui-input` or a `ui-input-group`:

```text
ui-input
└── input

ui-input-group
├── ui-input
│   └── input
└── ui-input-clear
    └── button
```

`<ui-input>` wraps your own `<input>`, so put its type, placeholder, autocomplete and other native attributes on the input. `<ui-input-group>` holds text or buttons around it, and `<ui-input-clear>` wraps a button that empties it.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/input"
</script>

<ui-input-group>
  <ui-input><input type="search" aria-label="Search" /></ui-input>
  <ui-input-clear
    ><button type="button" aria-label="Clear search"></button
  ></ui-input-clear>
</ui-input-group>
```

## Fields

Wrap the input in a [Field](./field.md) to give it a visible label, a description and errors. The field also supplies its `name` when the input has none.

```html
<ui-field name="username">
  <ui-field-label>Username</ui-field-label>
  <ui-input><input autocomplete="username" /></ui-input>
  <ui-field-description
    >Choose a unique username for your account.</ui-field-description
  >
</ui-field>
```

## Disabled and Read Only

Set `disabled` on the input or its field to prevent editing and leave it out of the tab order and the submitted values. A `readonly` input can still be focused, selected and submitted.

```html
<ui-field disabled>
  <ui-field-label>Email</ui-field-label>
  <ui-input><input type="email" value="hollis@example.com" /></ui-input>
</ui-field>

<ui-field>
  <ui-field-label>Profile URL</ui-field-label>
  <ui-input><input readonly value="example.com/hollis" /></ui-input>
</ui-field>
```

## Validation

Use native constraints such as `required`, `type="email"` and `pattern`. The field shows its error after a submit attempt and updates it as the value changes. Set the field's `invalid` property for an error your app decides; the input gets `aria-invalid`. [Field](./field.md#validation) covers the error parts and their matches.

```html
<ui-field name="email">
  <ui-field-label>Email</ui-field-label>
  <ui-input><input type="email" required /></ui-input>
  <ui-field-error match="valueMissing"
    >Enter your email address.</ui-field-error
  >
  <ui-field-error match="true">That email is already in use.</ui-field-error>
</ui-field>
```

```ts
document.querySelector("ui-field")!.invalid = emailTaken ? true : undefined
```

## Input Group

Place text or buttons around an input with `<ui-input-group>`. Pressing the group's text focuses the input. The text is display content, not part of the submitted value.

```html
<ui-input-group>
  <span>https://</span>
  <ui-input><input aria-label="Website" placeholder="example" /></ui-input>
  <span>.com</span>
</ui-input-group>
```

## Clear Button

`<ui-input-clear>` shows while the input has text it can clear. Pressing its button empties the value, reports `clear-press` and returns focus to the input. `valuechange` and native `input` listeners receive the change too.

```html
<ui-input-group>
  <ui-input><input type="search" aria-label="Search people" /></ui-input>
  <ui-input-clear>
    <button type="button" aria-label="Clear search">
      <svg aria-hidden="true">…</svg>
    </button>
  </ui-input-clear>
</ui-input-group>
```

## Controlled

Set the element's `value` property and listen for `valuechange` to keep the text in your own state. Native `input` events still work.

```ts
const input = document.querySelector("ui-input")!
input.value = "Hollis Grant"
input.addEventListener("valuechange", (event) => setName(event.detail.value))
```

See [State and Events](../state-and-events.md) for the shared controlled-state conventions. Input's [reasons](#reasons) tell typing, clearing, resetting and controller changes apart.

## Filtering What's Typed

Call `event.preventDefault()` in the `valuechange` listener to reject a change. The previous text and caret position are restored.

```html
<ui-input><input inputmode="numeric" maxlength="6" /></ui-input>
```

```ts
input.addEventListener("valuechange", (event) => {
  if (!/^\d*$/.test(event.detail.value)) event.preventDefault()
})
```

## Controller

Use the element's `api` for actions outside the input. Its methods update the input through the same `valuechange` events as typing.

```html
<ui-input><input aria-label="Message" /></ui-input>
<button type="button" data-action="reply">Quick Reply</button>
<button type="button" data-action="clear">Clear</button>
<button type="button" data-action="focus">Focus</button>
```

```ts
const message = document.querySelector("ui-input")!.api
document
  .querySelector('[data-action="reply"]')!
  .addEventListener("click", () => message.setValue("On my way!"))
document
  .querySelector('[data-action="clear"]')!
  .addEventListener("click", () => message.clear())
document
  .querySelector('[data-action="focus"]')!
  .addEventListener("click", () => message.focus())
```

[Controllers](../controllers.md) covers an element's `api`.

## Passwords and Files

Use [Password Input](./password-input.md) to show and hide a password. A native file input works with `type="file"`; use [File Input](./file-input.md) for dropping, previews and validation.

## Styling

Each part has a `data-slot`, such as `input-group`, and shows its state through the attributes listed under [Data Attributes](#data-attributes). Use `data-filled`, `data-disabled`, `data-readonly` and `data-required` on the input, and the field's validation and focus attributes inside a field. For a group's focus ring, style `:has(input:focus-visible)`, so a focused button inside it keeps its own ring.

## Data Attributes

### `<ui-input>`
`[data-slot="input"]`

- `data-filled`: Present while the field holds any text.
- `data-disabled`: Present when the field is disabled, by its own prop or its Field.
- `data-readonly`: Present when the field is read-only.
- `data-required`: Present when the field is required.

### `<ui-input-group>`
`[data-slot="input-group"]`

- `data-filled`: Present while the field in the group holds any text.
- `data-disabled`: Present while the field in the group is disabled, by itself or a `<fieldset>`.
- `data-readonly`: Present while the field in the group is read-only.

### `<ui-input-clear>`
`[data-slot="input-clear"]`

- `data-filled`: Present while the field in the group holds any text.
- `data-disabled`: Present while the field in the group is disabled, by itself or a `<fieldset>`.
- `data-readonly`: Present while the field in the group is read-only.

## API Reference

Put native attributes on the `<input>`, where `value` is the default. The `<ui-input>` element's `value` property reads and writes the text, and its `api` has the controller's methods. `onValueChange` is the `valuechange` event, which doesn't bubble: `event.detail` has the `value` and the `reason`, and `preventDefault()` cancels the change.

### Input

- `value?` (`string`): The value, for a controlled field.
- `defaultValue?` (`string`): The value it starts with. A form reset returns here.
- `valuechange event`: Called when the user changes the value: typing (`"input-change"`), a Clear part (`"clear-press"`), a form reset (`"reset"`) or a controller (`"imperative"`). `details.cancel()` keeps the value as it was.
- `controller?` (`object`): Reads and writes the field from anywhere. Create one with `createInputController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

- `disabled?` (`boolean`): Disables the field.
- `readOnly?` (`boolean`): Makes the field read-only.
- `required?` (`boolean`): Makes the field required.

### InputGroup

- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### InputClear

Wraps a `<button>` that empties the input in its group and focuses it. It shows only while there's text to clear.

### State

- `filled` (`boolean`): Whether the field holds any text.
- `disabled` (`boolean`): Whether the field is disabled.
- `readOnly` (`boolean`): Whether the field is read-only.
- `required` (`boolean`): Whether the field is required.

`<ui-input-group>` and `<ui-input-clear>` receive the state of the input inside the group.

- `filled` (`boolean`): Whether the field in the group holds any text.
- `disabled` (`boolean`): Whether the field in the group is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the field in the group is read-only.

### Reasons

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `clear-press` (`MouseEvent | KeyboardEvent`): A Clear part was pressed, like on an input, a select or a combobox.
- `reset` (`none`): A form reset.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The `<ui-input>` element's `api` property has these methods.

- `getValue()` (`() => string`): The current value.
- `setValue(value, options?)` (`(value: string, options?: ChangeOptions<InputValueChangeReason> | undefined) => boolean`): Sets the value as if the user typed it, so `input` fires. Returns false when the change was canceled or nothing changed.
- `clear(options?)` (`(options?: ChangeOptions<InputValueChangeReason> | undefined) => boolean`): Empties the field, as if the user deleted the text, so `input` fires. Returns false when the change was canceled or nothing changed.
- `focus()` (`() => void`): Moves focus to the field.

## Accessibility

Give the input a visible field label or an `aria-label`, and give the clear button an accessible name. The native input keeps standard text editing, selection, autocomplete and form behavior.

- The label names the input and the description describes it.
- Clicking the label focuses the input.
- An invalid input is marked once the form tries to submit.
- Data-filled follows the text.
- An input group's clear button shows only while there's text.
- <ui-input>'s value property writes the field quietly, and its api reports. Web components only.

**Enhancements**

- Changes report their reason: typing, then a reset.
- A canceled change keeps the text as it was.
- A canceled change keeps a controlled input's text as it was.
- A canceled change waits for an IME to finish before the text goes back.
- A controlled input keeps every keystroke.
- A required input marks its label required.

**Input group**

- The clear button empties the field, reports why, and returns focus.
- Pressing the group's text focuses its field.
- The clear button hides while its field is disabled.

Runs in React, Vue and web components.
