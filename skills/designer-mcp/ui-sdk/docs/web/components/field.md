# Field

Connect a form control to its label, description, and validation errors.

A field connects a form control to its label, its description and the errors it shows, and wires up `id`, `for` and `aria-describedby` for you.

```ts title="input.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-field>
        <ui-field-label>Username</ui-field-label>
        <ui-input>
          <input name="username" placeholder="hollis" autocomplete="username" />
        </ui-input>
        <ui-field-description>Choose a unique username for your account.</ui-field-description>
      </ui-field>
    </div>
  `
}

export { mount }
```

Press Username to focus the input, then type a name.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines every field part, [field sets](#field-sets) included. Import the controls you put inside too. On the server the import does nothing.

```ts
import "@ui-sdk/web/field"
```

## Composition

Use the following composition to build a `ui-field`:

```text
ui-field
├── ui-field-label
├── ui-input
├── ui-field-description
└── ui-field-error
```

## Usage

```html
<script type="module">
  import "@ui-sdk/web/field"
  import "@ui-sdk/web/input"
</script>

<ui-field name="username">
  <ui-field-label>Username</ui-field-label>
  <ui-input>
    <input autocomplete="username" required />
  </ui-input>
  <ui-field-description>This is your public name.</ui-field-description>
  <ui-field-error></ui-field-error>
</ui-field>
```

The control is one of ours, like `<ui-input>`, `<ui-textarea>` or `<ui-checkbox>`. The field finds the first one inside it and writes its `id`, `aria-labelledby`, `aria-describedby` and `aria-invalid`.

The label names the control, and the description and any error that shows describe it.

Group related fields in a [field set](#field-sets):

```html
<ui-field-set>
  <fieldset>
    <legend></legend>
    <ui-field-description></ui-field-description>
    <ui-field-group>
      <ui-field></ui-field>
      <ui-field></ui-field>
    </ui-field-group>
  </fieldset>
</ui-field-set>
```

## Controls

Use `<ui-input>` for a line of text and `<ui-textarea>` for more, each around its native element:

```html
<ui-field>
  <ui-field-label>Feedback</ui-field-label>
  <ui-textarea>
    <textarea name="feedback"></textarea>
  </ui-textarea>
</ui-field>
```

For a control we don't ship, like a native `<select>`, put the element straight in the field, and it connects the same way. An [agent](../agents.md) sees only our components, so it can't fill a bare element: use ours where there is one.

```html
<ui-field>
  <ui-field-label>Department</ui-field-label>
  <select name="department">
    <option value="design">Design</option>
    <option value="engineering">Engineering</option>
  </select>
</ui-field>
```

A [Checkbox](./checkbox.md), [Switch](./switch.md) or [Radio Group](./radio.md) inside a field uses the field's label and description. Pressing the label toggles a checkbox or switch. A radio group takes the field's label as its name, and each radio keeps a label of its own:

```html
<ui-field>
  <ui-switch name="mfa"></ui-switch>
  <ui-field-label>Two-factor authentication</ui-field-label>
  <ui-field-description>Ask for a code when you sign in.</ui-field-description>
</ui-field>

<ui-field>
  <ui-field-label>Plan</ui-field-label>
  <ui-radio-group name="plan" default-value="monthly">
    <label>
      <ui-radio value="monthly"></ui-radio>
      Monthly
    </label>
    <label>
      <ui-radio value="yearly"></ui-radio>
      Yearly
    </label>
  </ui-radio-group>
</ui-field>
```

## Validation

Use native constraints such as `required`, `type="email"`, and `pattern`. Errors appear after a submit attempt and update as the value changes. The first invalid control takes focus.

Leave an error empty to show the browser's message, or use `match="valueMissing"` and `match="typeMismatch"` for your own messages. Adding an error part replaces the browser's validation bubble with that message in the page.

```ts title="validation.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form data-slot="stack">
      <ui-field name="email">
        <ui-field-label>Email</ui-field-label>
        <ui-input>
          <input type="email" required placeholder="hollis@example.com" />
        </ui-input>
        <ui-field-description>
          <span data-hide="valid">We'll send you a confirmation link.</span>
          <span data-show="valid">Looks good.</span>
        </ui-field-description>
        <ui-field-error match="valueMissing">Enter your email address.</ui-field-error>
        <ui-field-error match="typeMismatch">Enter an email address like hollis@example.com.</ui-field-error>
      </ui-field>
      <ui-field name="website">
        <ui-field-label>Website</ui-field-label>
        <ui-input>
          <input type="url" required placeholder="https://example.com" />
        </ui-input>
        <ui-field-error></ui-field-error>
      </ui-field>
      <button type="submit" data-variant="solid">Subscribe</button>
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

Press Subscribe with an empty or invalid email, then correct it to clear the error.

## Errors from Your Code

Pass `invalid` when your server or form library supplies an error. `true` shows it immediately. Clear the value to return to the browser's validation.

Give this error its own text and set `match` to `true`. Named matches such as `valueMissing` still refer to native validation. `invalid="false"` hides the field's invalid state, but does not make an invalid native control pass validation.

```html
<ui-field name="email">
  <ui-field-label>Email</ui-field-label>
  <ui-input>
    <input type="email" required />
  </ui-input>
  <ui-field-error match="valueMissing"
    >Enter your email address.</ui-field-error
  >
</ui-field>

<script type="module">
  const field = document.querySelector("ui-field")
  const serverError = document.createElement("ui-field-error")
  serverError.setAttribute("match", "true")

  function showServerError(message) {
    serverError.textContent = message
    field.append(serverError)
    field.invalid = true
  }

  field.querySelector("input").addEventListener("input", () => {
    serverError.remove()
    field.invalid = undefined
  })
</script>
```

## Required and Disabled

A required control marks every part with `data-required`, and the parts' state has `required`, so a label can show a mark with CSS alone.

A disabled field disables its control and marks every part with `data-disabled`, the way a [disabled field set](#disabled-field-sets) does for every field inside it.

## Character Count

Listen for `input` on the control and show its length in the description. Set `maxlength` on the control to enforce the limit.

```html
<ui-field>
  <ui-field-label>Bio</ui-field-label>
  <ui-textarea>
    <textarea maxlength="280"></textarea>
  </ui-textarea>
  <ui-field-description>0 / 280</ui-field-description>
</ui-field>

<script type="module">
  const bio = document.querySelector("textarea")
  const count = document.querySelector("ui-field-description")
  bio.addEventListener("input", () => {
    count.textContent = `${bio.value.length} / 280`
  })
</script>
```

## Forms

The control submits its value under its own `name`, or the field's name if it has none. Reset restores the control's default and hides validation errors. Disabled controls are left out of the submitted values. See [Forms](../forms.md) for the shared form behavior.

## Field Sets

A field set groups related fields under a legend, and disables them together.

```ts title="field-set.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field-set>
      <fieldset>
        <legend>Address</legend>
        <ui-field-description>We need your address to deliver your order.</ui-field-description>
        <ui-field-group>
          <ui-field name="street">
            <ui-field-label>Street address</ui-field-label>
            <ui-input><input autocomplete="street-address" /></ui-input>
          </ui-field>
          <div data-slot="grid">
            <ui-field name="city">
              <ui-field-label>City</ui-field-label>
              <ui-input><input autocomplete="address-level2" /></ui-input>
            </ui-field>
            <ui-field name="postal-code">
              <ui-field-label>Postal code</ui-field-label>
              <ui-input><input autocomplete="postal-code" /></ui-input>
            </ui-field>
          </div>
        </ui-field-group>
      </fieldset>
    </ui-field-set>
  `
}

export { mount }
```

Move through the address fields. Their legend and description name the group.

`<ui-field-set>` wraps a native `<fieldset>` and its `<legend>`, and displays as contents, so the set is named, and disabled, before scripts run. Keep the legend the first child. For a legend that isn't a native `<legend>`, use `<ui-field-legend>`: it still names the set through `aria-labelledby`.

A `<ui-field-description>` right inside the set, outside any `<ui-field>`, describes the set, so screen readers read it as focus enters. `<ui-field-group>` stacks the fields, with no role and no state: the field set is what names and disables a group.

## Disabled Field Sets

Disabling the set disables its controls and nested field sets. The form leaves their values out of submissions.

```html
<ui-field-set disabled>
  <fieldset>
    <legend>Billing address</legend>
    <ui-field name="billing-street">
      <ui-field-label>Street address</ui-field-label>
      <ui-input>
        <input autocomplete="billing street-address" />
      </ui-input>
    </ui-field>
  </fieldset>
</ui-field-set>
```

## Groups in a Field Set

The legend names a [checkbox group](./checkbox.md#group) or a [radio group](./radio.md) inside the set, so the group needs no label of its own.

```html
<ui-field-set>
  <fieldset>
    <legend>Notifications</legend>
    <ui-checkbox-group name="notify" default-value="mentions">
      <label>
        <ui-checkbox value="mentions"></ui-checkbox>
        Mentions
      </label>
      <label>
        <ui-checkbox value="follows"></ui-checkbox>
        New followers
      </label>
    </ui-checkbox-group>
  </fieldset>
</ui-field-set>
```

## Custom Rendering

The control is your own element, so render whatever you like. Parts have no render functions: show and hide content from the parts' data attributes, like `in-data-invalid:inline` in Tailwind. An empty `<ui-field-error>` fills itself with the message for the current problem.

## Custom Controls

Web components have no hook: the field finds its control itself. It takes the first native `<input>`, `<select>` or `<textarea>` inside it, or the first element with a control role, like `role="checkbox"`, `"switch"`, `"radiogroup"`, `"combobox"`, `"slider"`, `"spinbutton"`, `"textbox"` or `"listbox"`. It writes that element's `id`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `disabled` and data attributes, and the field's `name` when it has none.

So a custom element of your own joins a field when it has one of those roles. The field reads validity only from native inputs, selects and textareas and from our own elements, so yours submits and validates through a native input inside it, with its own `name`.

To build a control from scratch on the primitives ours use, see [Primitives](../core.md#define-a-primitive).

## Styling

Use `data-invalid` and `data-valid` for validation, and `data-focused`, `data-required` and `data-disabled` for the rest. Every part of a field gets the same attributes, so a label can turn red with its control.

Each part has a `data-slot`, such as `field-label`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### `<ui-field>`
`[data-slot="field"]`

- `data-disabled`: Present when the field is disabled.
- `data-invalid`: Present while the field shows as invalid: with `invalid`, or once a submit finds the control invalid.

### `<ui-field-label>`
`[data-slot="field-label"]`

- `data-disabled`: Present when the field is disabled.
- `data-invalid`: Present while the field shows as invalid: with `invalid`, or once a submit finds the control invalid.

### `<input>`
`[data-slot="field-control"]`

- `data-disabled`: Present when the field is disabled.
- `data-invalid`: Present while the field shows as invalid: with `invalid`, or once a submit finds the control invalid.

### `<ui-field-description>`
`[data-slot="field-description"]`

- `data-disabled`: Present when the field is disabled.
- `data-invalid`: Present while the field shows as invalid: with `invalid`, or once a submit finds the control invalid.

### `<ui-field-error>`
`[data-slot="field-error"]`

- `data-disabled`: Present when the field is disabled.
- `data-invalid`: Present while the field shows as invalid: with `invalid`, or once a submit finds the control invalid.

### `<fieldset>`
`<ui-field-group>` has `data-slot="field-group"` and no state attributes.

`[data-slot="field-set"]`

- `data-disabled`: Present when the field set is disabled, by its own prop or a `<fieldset>` around it.

### `<legend>`
`[data-slot="field-legend"]`

- `data-disabled`: Present when the field set is disabled, by its own prop or a `<fieldset>` around it.

### `<ui-field-description>` in a `<ui-field-set>`
`[data-slot="field-description"]`

- `data-disabled`: Present when the field set is disabled, by its own prop or a `<fieldset>` around it.

## API Reference

Props are attributes in kebab case. `invalid` without a value is `true`, and `invalid="false"` is `false`. `invalid` is also a property, where `undefined` leaves it to the attribute, or to the browser without one.

A field has no change events. Read its state from the parts' data attributes. Add the `debug` attribute to log every state change and its reason.

### Field

- `name?` (`string`): The name the control submits under, when the control doesn't set its own.
- `disabled?` (`boolean`): Disables the control, and marks every part.
- `invalid?` (`boolean`): Whether the field shows as invalid, when your code decides, like a form library or an error from the server. `true` shows its errors now, `false` shows none whatever the browser thinks. Leave it out to show the browser's own validation once a submit finds the field invalid.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### FieldError

- `match?` (`boolean | ValidityKey`): When this error shows. `true` shows it always and `false` never. A validity flag, like `"valueMissing"`, shows it only for that problem of the browser's own validation. Without it, any problem shows it.

### FieldSet

- `disabled?` (`boolean`): Disables every control inside it, except those in its legend, and leaves them out of the form.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

- `disabled` (`boolean`): Whether the field is disabled, by itself or by a `<fieldset>`.
- `required` (`boolean`): Whether the control is required, read from its `required` or `aria-required`.
- `focused` (`boolean`): Whether focus is inside the control.
- `invalid` (`boolean`): Whether the field shows as invalid: `invalid` when you pass it, else the browser's validation once shown.
- `valid` (`boolean`): Whether the browser's validation passes, once shown. Always false while you pass `invalid`.

- `disabled` (`boolean`): Whether the field is disabled, by itself or by a `<fieldset>`.
- `required` (`boolean`): Whether the control is required, read from its `required` or `aria-required`.
- `focused` (`boolean`): Whether focus is inside the control.
- `invalid` (`boolean`): Whether the field shows as invalid: `invalid` when you pass it, else the browser's validation once shown.
- `valid` (`boolean`): Whether the browser's validation passes, once shown. Always false while you pass `invalid`.
- `message` (`string`): The browser's message for the current problem. Children you pass show instead.

A `<ui-field-description>` receives the field's state, or only `disabled` when it describes a field set.

- `disabled` (`boolean`): Whether the field set is disabled, by itself or by a field set around it. Whether the field is disabled, by itself or by a `<fieldset>`.
- `required` (`boolean | undefined`): Whether the control is required, read from its `required` or `aria-required`.
- `focused` (`boolean | undefined`): Whether focus is inside the control.
- `invalid` (`boolean | undefined`): Whether the field shows as invalid: `invalid` when you pass it, else the browser's validation once shown.
- `valid` (`boolean | undefined`): Whether the browser's validation passes, once shown. Always false while you pass `invalid`.

Every part of a field set receives the same state.

- `disabled` (`boolean`): Whether the field set is disabled, by itself or by a field set around it.

## Accessibility

The label names the control with `aria-labelledby`, beside a native `<label for>` where the control can take one. The description and any error that shows describe it with `aria-describedby`, and an invalid control has `aria-invalid`. The tests below cover these connections and keyboard behavior.

**Labelling**

- The label names the control.
- The description describes the control.
- Clicking the label of a text field focuses it.

**A label wrapping a field**

- Names the control inside it.
- Checks its control when clicked anywhere.
- Keeps the field's description on its control.
- Names a control that renders after it.
- Keeps the part's data-slot.
- Warns in development only when a label outside a field labels nothing.
- A description and an error outside a field keep their data-slot. Web components only.
- A hidden error outside a field stays hidden whatever display its class gives. Web components only.
- An error outside a field follows its match. Web components only.
- An error outside a field shows a child that arrives after it. Web components only.

**Errors**

- Stay hidden until the form tries to submit.
- Show the browser's message when they have no text of their own.
- Count another library's form-associated element inside the field.
- Describe the control while they show.
- Update as the value changes once shown.
- Update as state set from script changes the value once shown. Web components only.
- A field marked invalid shows its error right away.
- A field marked valid never shows the browser's errors.
- A form reset hides them again.
- Errors in the page replace the browser's message, and the first invalid control takes focus.

Runs in React, Vue and web components.

In a field set:

- The legend names the group.
- A disabled field set disables the controls inside and leaves them out of the form.
- Enabling it again restores the controls.
- A field set disabled from the start disables its required fields.
- Fields in a disabled field set mark their parts disabled.

**Enhancements**

- The description describes the group.

Runs in React, Vue and web components.

In a form:

- The form submits every checked control's name and value.
- Unchecked controls submit nothing.
- A checkbox outside the form joins it with the form attribute.
- Required controls block submission.
- A form reset returns every control to its default.
- A reset returns to the default value, not to nothing.
- A disabled fieldset disables the controls inside it.
- A read-only control still submits.
- A user's change fires native input and change events on the form.

Runs in React, Vue and web components.
