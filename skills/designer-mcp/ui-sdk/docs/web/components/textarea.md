# Textarea

Enter multiple lines of text, grow the field as you type, and connect it to a form.

A textarea is a native multi-line text field for messages, notes and descriptions. It works inside a field and a form, can grow with its text, and reports the same change reasons as Input.

```ts title="basic.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/textarea"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field name="message">
      <ui-field-label>Message</ui-field-label>
      <ui-textarea>
        <textarea placeholder="Type your message here…"></textarea>
      </ui-textarea>
    </ui-field>
  `
}

export { mount }
```

Click Message to focus the textarea, then type. Press Enter to start a new line.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its element. Import the field too if you use it. On the server the import does nothing.

```ts
import "@ui-sdk/web/textarea"
import "@ui-sdk/web/field"
```

## Usage

`ui-textarea` wraps your own `<textarea>`. Put `rows`, `placeholder`, `maxlength` and other native attributes on the `<textarea>`.

```html
<script type="module">
  import "@ui-sdk/web/textarea"
</script>

<ui-textarea>
  <textarea
    aria-label="Message"
    placeholder="Type your message here…"
  ></textarea>
</ui-textarea>
```

## Field

Wrap the textarea in a [Field](./field.md) to give it a visible label and a description. The field also supplies its `name` when the textarea has none.

```ts title="field.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/textarea"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field name="feedback">
      <ui-field-label>Feedback</ui-field-label>
      <ui-textarea>
        <textarea placeholder="What could we do better?"></textarea>
      </ui-textarea>
      <ui-field-description>Only the product team can see this.</ui-field-description>
    </ui-field>
  `
}

export { mount }
```

Click Feedback to focus the textarea. A screen reader reads the description with the field.

## Auto Resize

Set `auto-resize` to grow and shrink the textarea with its text. CSS `min-height` and `max-height` set its limits; past the maximum, the text scrolls inside it.

```ts title="auto-resize.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/textarea"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field name="notes">
      <ui-field-label>Notes</ui-field-label>
      <ui-textarea auto-resize>
        <textarea placeholder="Add notes for the delivery driver…"></textarea>
      </ui-textarea>
      <ui-field-description>Your driver sees these notes.</ui-field-description>
    </ui-field>
  `
}

export { mount }
```

Type several lines in Notes. The textarea grows with each line until it reaches its maximum height, then scrolls. Delete the lines and it shrinks back.

Browsers that support `field-sizing: content` size it natively. Elsewhere, the component measures it when the value changes, the form resets or its width changes.

## Controlled

Listen for `valuechange` to read the value, and set the element's `value` property to change it from your app. Here the character count is derived from that value, and the native `maxlength` caps the text.

```ts title="controlled.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/textarea"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field name="bio">
      <ui-field-label>Bio</ui-field-label>
      <ui-textarea>
        <textarea maxlength="160">Product designer in Lisbon. I write about type and interfaces.</textarea>
      </ui-textarea>
      <ui-field-description>62 / 160 characters</ui-field-description>
    </ui-field>
  `
  const count = root.querySelector("ui-field-description")!
  root
    .querySelector("ui-textarea")!
    .addEventListener("valuechange", (event) => {
      count.textContent = `${event.detail.value.length} / 160 characters`
    })
}

export { mount }
```

Edit Bio and watch the character count under it. The textarea stops accepting text at 160 characters.

Textarea shares Input's [change reasons](#reasons) and cancellation behavior. See [State and Events](../state-and-events.md) for the shared conventions.

## Form

A textarea submits its value through a native form under its field's `name`. Use the element's `api` to change it from outside, here to empty it after sending. The native `required` constraint blocks an empty message.

```ts title="button.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/textarea"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form data-slot="stack">
      <ui-field name="message">
        <ui-field-label>Message</ui-field-label>
        <ui-textarea>
          <textarea required placeholder="Write a reply to Hollis Grant…"></textarea>
        </ui-textarea>
      </ui-field>
      <div data-slot="row">
        <button type="submit" data-variant="solid">Send Message</button>
      </div>
    </form>
  `
  const form = root.querySelector("form")!
  const message = root.querySelector("ui-textarea")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    log(root, `Sent “${new FormData(form).get("message")}”`)
    message.api.clear()
  })
}

export { mount }
```

Type a message and press Send Message. The console logs it and the textarea clears. Pressing Send Message while it's empty is blocked.

[Controllers](../controllers.md) covers creating and sharing a controller.

## Disabled

Set `disabled` on the native textarea or its field to prevent editing and leave it out of the tab order and the submitted values.

```ts title="disabled.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/textarea"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field disabled>
      <ui-field-label>Reply</ui-field-label>
      <ui-textarea>
        <textarea>Replies are closed for this thread.</textarea>
      </ui-textarea>
    </ui-field>
  `
}

export { mount }
```

Try to edit Reply or reach it with Tab. The disabled textarea keeps its value but can't be changed.

## Invalid

Set `invalid` on the field for an error your app decides. The field shows its error, associates it with the textarea and sets `aria-invalid`. [Field](./field.md#validation) covers native constraints and error matches.

```ts title="invalid.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/textarea"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field invalid>
      <ui-field-label>Review</ui-field-label>
      <ui-textarea>
        <textarea>Great.</textarea>
      </ui-textarea>
      <ui-field-error match>Write at least 20 characters.</ui-field-error>
    </ui-field>
  `
}

export { mount }
```

Focus Review. The textarea is marked invalid, and the error below says how long the review should be.

## Submit Shortcut

Set `submit-shortcut` to submit the textarea's form from the keyboard. With `"mod+enter"`, Enter still starts a new line and Command or Control+Enter submits. With `"enter"`, Enter submits and Shift+Enter starts a new line. Without it, Enter always starts a new line, and neither submits while an input method is composing.

```html
<script type="module">
  import "@ui-sdk/web/textarea"
</script>

<form action="/messages" method="post">
  <ui-textarea submit-shortcut="mod+enter">
    <textarea name="message" aria-label="Message" required></textarea>
  </ui-textarea>
  <button type="submit">Send</button>
</form>
```

The shortcut submits the form like the Send button, so `required` and the form's `submit` event still apply.

## Styling

Style the native textarea directly, with `data-filled`, `data-disabled`, `data-readonly` and `data-required` for its states. Inside a field it also receives the field's validation attributes, such as `data-invalid`. For `auto-resize`, set `min-height` and `max-height` to bound its growth. Use logical spacing so the text follows the surrounding direction.

The textarea has a `data-slot` of `textarea`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### `<ui-textarea>`
`[data-slot="textarea"]`

- `data-filled`: Present while the field holds any text.
- `data-disabled`: Present when the field is disabled, by its own prop or its Field.
- `data-readonly`: Present when the field is read-only.
- `data-required`: Present when the field is required.

## API Reference

Props are attributes in kebab case, like `auto-resize` and `default-value`. `disabled`, `readonly`, `required` and other native attributes are read from the `<textarea>`. Callbacks are DOM events: `valuechange` fires on `ui-textarea` with `{ value, reason, event, source }` in `event.detail`.

### Textarea

- `value?` (`string`): The value, for a controlled field.
- `defaultValue?` (`string`): The value it starts with. A form reset returns here.
- `valuechange event`: Called when the user changes the value: typing (`"input-change"`), a Clear part (`"clear-press"`), a form reset (`"reset"`) or a controller (`"imperative"`). `details.cancel()` keeps the value as it was.
- `controller?` (`object`): Reads and writes the field from anywhere. Create one with `createInputController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.
- `autoResize?` (`boolean`): Grows and shrinks with the text. Bound it with CSS `min-height` and `max-height`; past the maximum, it scrolls.
- `submit event`: Runs on the submit shortcut, unless an input method is composing. Without it, the shortcut submits the form the textarea is in. With neither, the key is left alone, so Enter adds a line.
- `submitShortcut?` (`"enter" | "mod+enter"`): Which keys submit: `"enter"`, with Shift+Enter for a new line, or `"mod+enter"`, with Enter for a new line. Without it, Enter always starts a new line.

- `disabled?` (`boolean`): Disables the field.
- `readOnly?` (`boolean`): Makes the field read-only.
- `required?` (`boolean`): Makes the field required.

### State

- `filled` (`boolean`): Whether the field holds any text.
- `disabled` (`boolean`): Whether the field is disabled.
- `readOnly` (`boolean`): Whether the field is read-only.
- `required` (`boolean`): Whether the field is required.

### Reasons

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `clear-press` (`MouseEvent | KeyboardEvent`): A Clear part was pressed, like on an input, a select or a combobox.
- `reset` (`none`): A form reset.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has these methods, and its `value` property reads and sets the text. Writes fire `valuechange` like typing.

- `getValue()` (`() => string`): The current value.
- `setValue(value, options?)` (`(value: string, options?: ChangeOptions<InputValueChangeReason> | undefined) => boolean`): Sets the value as if the user typed it, so `input` fires. Returns false when the change was canceled or nothing changed.
- `clear(options?)` (`(options?: ChangeOptions<InputValueChangeReason> | undefined) => boolean`): Empties the field, as if the user deleted the text, so `input` fires. Returns false when the change was canceled or nothing changed.
- `focus()` (`() => void`): Moves focus to the field.

## Accessibility

There's no WAI-ARIA pattern for a multi-line text field. The textarea stays a native `<textarea>`, with standard text editing, selection, spell checking and form behavior. Give it a visible field label or an `aria-label`, and keep descriptions and errors in their field parts so they're associated with it.

### Tested Behavior

Every line below is an automated test.

- The label names the textarea and the description describes it.

**Auto resize**

- Grows with its text and shrinks back.
- Stops at its max height and scrolls.
- Shrinks back when a reset empties it.
- Follows text written from code.

**Submit shortcut**

- Without a submit shortcut, Enter starts a new line and doesn't submit.
- With enter, Enter submits the form and Shift+Enter starts a new line.
- With mod+enter, Enter starts a new line and Cmd or Ctrl+Enter submits.
- Enter while an input method composes doesn't submit.

Runs in React, Vue and web components.
