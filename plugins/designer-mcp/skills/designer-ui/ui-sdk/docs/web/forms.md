# Forms

Submit custom element values, label controls, and show validation errors.

Give a control a `name` to include its value in a form. Once their modules load, controls such as Checkbox and Select participate in submission, validation, and reset through the browser’s form-associated custom element APIs.

## Submit a Value

```ts
import "@ui-sdk/web/checkbox"
```

```html
<form action="/preferences" method="post">
  <label
    ><ui-checkbox name="updates" value="yes" default-checked></ui-checkbox>
    Email me updates</label
  >
  <button type="submit">Save</button>
  <button type="reset">Reset</button>
</form>
```

The checkbox submits `updates=yes` when checked. Reset restores its default value.

On controls that support them, `required`, `disabled`, `read-only`, and `form` follow native conventions. The elements expose `validity`, `checkValidity()`, and `setCustomValidity()`.

## Respond to a Reset

A reset also fires `checkedchange` when it requests a different value. You can use the same listener for clicks and resets:

```html
<form>
  <label>
    <ui-checkbox name="updates" value="yes" default-checked></ui-checkbox>
    Email me updates
  </label>
  <button type="reset">Reset</button>
  <output id="reason">No change yet</output>
</form>
```

```ts
import "@ui-sdk/web/checkbox"

const checkbox = document.querySelector("ui-checkbox")!
const reason = document.querySelector("#reason")!

checkbox.addEventListener("checkedchange", (event) => {
  reason.textContent = event.detail.reason
})
```

Run the script after the markup exists. Uncheck the box, then press Reset: `default-checked` restores `true`, and the output reads `reset`. If the checkbox is already at its default, no change event is needed.

The element owns its live state. If your application mirrors `checked` elsewhere, update that state from `checkedchange` too.

## Label and Validate a Field

`ui-field` finds the control inside it and connects the label, description, and error:

```ts
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
```

```html
<ui-field name="email">
  <ui-field-label>Email</ui-field-label>
  <ui-input>
    <input type="email" required />
  </ui-input>
  <ui-field-description>We'll only use it for receipts.</ui-field-description>
  <ui-field-error></ui-field-error>
</ui-field>
```

The control is one of ours, such as `ui-input`, `ui-textarea`, `ui-checkbox` or `ui-select`. [Field](./components/field.md) shows the supported controls.

## Handle a Submission

On a normal submit, the browser checks constraints such as `required` and `type="email"` before running your listener.

Your server may still reject a valid-looking value. Set the field’s `invalid` property to `true` and show the server’s message. When the user edits the field, clear the message and set `invalid` back to `undefined` so the field uses native validation again. This example expects a `/api/preferences` endpoint:

```html
<form>
  <ui-field name="email">
    <ui-field-label>Email</ui-field-label>
    <ui-input>
      <input type="email" required />
    </ui-input>
    <ui-field-error></ui-field-error>
  </ui-field>
  <button type="submit">Save</button>
</form>
```

```ts
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"

const form = document.querySelector("form")!
const field = form.querySelector("ui-field")!
const error = form.querySelector("ui-field-error")!

form.addEventListener("submit", async (event) => {
  event.preventDefault()
  const response = await fetch("/api/preferences", {
    method: "POST",
    body: new FormData(form),
  })
  field.invalid = response.ok ? undefined : true
  error.textContent = response.ok ? "" : "That email is already taken."
})

form.addEventListener("input", () => {
  field.invalid = undefined
  error.textContent = ""
})
```

An empty `<ui-field-error>` shows the browser's own message, so clearing the text brings it back. Without a listener, the native form submits normally.

For a form that must work before component scripts load, see [Server Rendering](./server-rendering.md#before-upgrade).
