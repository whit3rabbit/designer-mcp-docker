# Switch

Turn a setting on or off.

Use a switch for a setting that takes effect as soon as it changes, like Airplane mode or a notification preference. Keep its label the same in both states: the label says what the setting is, and the switch shows whether it's on.

```ts title="basic.ts"
import "@ui-sdk/web/switch"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <label data-slot="label">
      Airplane mode
      <ui-switch>
        <ui-switch-thumb></ui-switch-thumb>
      </ui-switch>
    </label>
  `
}

export { mount }
```

Click Airplane mode, or focus the switch and press Space, to turn it on and off.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. Import the field too if you use it. On the server the import does nothing.

```ts
import "@ui-sdk/web/switch"
import "@ui-sdk/web/field"
```

## Composition

Use the following composition to build a `ui-switch`:

```text
ui-switch
└── ui-switch-thumb
```

Wrap the switch and its text in a label. The thumb stays mounted and gets the switch's state, so CSS can slide it from one end to the other.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/switch"
</script>

<label>
  Airplane mode
  <ui-switch>
    <ui-switch-thumb></ui-switch-thumb>
  </ui-switch>
</label>
```

## Description

Use `ui-field-label` and `ui-field-description` inside a `ui-field` when a setting needs more explanation. The field connects both to the switch.

```ts title="description.ts"
import "@ui-sdk/web/switch"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <div data-slot="stack">
        <ui-field-label>Weekly digest</ui-field-label>
        <ui-field-description>A summary of your week, every Monday.</ui-field-description>
      </div>
      <ui-switch>
        <ui-switch-thumb></ui-switch-thumb>
      </ui-switch>
    </ui-field>
  `
}

export { mount }
```

Click Weekly digest. The field connects the label and description to the switch.

## Choice Card

A setting can fill a whole card. Here the label's `::after` covers the card, so a click anywhere on it toggles the switch, and `:has([data-checked])` marks the cards that are on.

```ts title="choice-card.ts"
import "@ui-sdk/web/switch"
import "@ui-sdk/web/field"

const settings = [
  {
    label: "Public profile",
    description: "Anyone can see your name and photo.",
    defaultChecked: false,
  },
  {
    label: "Show activity status",
    description: "Teammates can see when you're online.",
    defaultChecked: true,
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      ${settings
        .map(
          (setting) => `
            <ui-field data-variant="card">
              <div data-slot="stack">
                <ui-field-label>${setting.label}</ui-field-label>
                <ui-field-description>${setting.description}</ui-field-description>
              </div>
              <ui-switch${setting.defaultChecked ? " default-checked" : ""}>
                <ui-switch-thumb></ui-switch-thumb>
              </ui-switch>
            </ui-field>
          `
        )
        .join("")}
    </div>
  `
}

export { mount }
```

Click anywhere on the Public profile card to turn it on. Each card's switch keeps its own value.

## Disabled

`disabled` prevents focus and changes, and leaves the switch out of form submissions. A disabled `fieldset` does the same.

```ts title="disabled.ts"
import "@ui-sdk/web/switch"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <label data-slot="label">
        Product updates
        <ui-switch>
          <ui-switch-thumb></ui-switch-thumb>
        </ui-switch>
      </label>
      <label data-slot="label">
        Security alerts
        <ui-switch default-checked disabled>
          <ui-switch-thumb></ui-switch-thumb>
        </ui-switch>
      </label>
    </div>
  `
}

export { mount }
```

Security alerts are always on, so that switch is disabled. Clicking it leaves it on, and Tab skips it.

## Read-Only

`read-only` keeps the switch focusable and included in form submissions, while preventing the user from changing it. Use it for a setting managed somewhere else.

```ts title="read-only.ts"
import "@ui-sdk/web/switch"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <div data-slot="stack">
        <ui-field-label>Encrypt backups</ui-field-label>
        <ui-field-description>Your organization manages this setting.</ui-field-description>
      </div>
      <ui-switch name="encrypt" default-checked read-only>
        <ui-switch-thumb></ui-switch-thumb>
      </ui-switch>
    </ui-field>
  `
}

export { mount }
```

Tab to Encrypt backups. Space and clicks leave it on.

## Controlled

Listen for `checkedchange` to follow the value, and set the element's `checked` property to change it. The element's [`api`](#controller) changes it from anywhere, like the Toggle button below. See [State and Events](../state-and-events.md) for the shared change callback.

```ts title="controlled.ts"
import "@ui-sdk/web/switch"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Toggle</button>
      </div>
      <label data-slot="label">
        Wi-Fi
        <ui-switch default-checked>
          <ui-switch-thumb></ui-switch-thumb>
        </ui-switch>
      </label>
    </div>
  `
  const wifi = root.querySelector("ui-switch")!
  root
    .querySelector("button")!
    .addEventListener("click", () => wifi.api.toggle())
  wifi.addEventListener("checkedchange", (event) => {
    const { value, reason } = event.detail
    log(root, `${value ? "On" : "Off"} (${reason})`)
  })
}

export { mount }
```

Turn Wi-Fi off, or press Toggle. The console logs each change and its reason.

## Form

Set `name` to include the switch in a native form. A switch that's on submits its `value`, which defaults to `"on"`; a switch that's off submits nothing. Reset returns it to `default-checked`. Set `form` to a form's id to join it from elsewhere on the page.

```ts title="form.ts"
import "@ui-sdk/web/switch"
import "@ui-sdk/web/field"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form data-slot="stack">
      <ui-field-set>
        <fieldset>
          <legend>Email notifications</legend>
          <label data-slot="label">
            Product updates
            <ui-switch name="updates">
              <ui-switch-thumb></ui-switch-thumb>
            </ui-switch>
          </label>
          <label data-slot="label">
            Security alerts
            <ui-switch name="security" default-checked>
              <ui-switch-thumb></ui-switch-thumb>
            </ui-switch>
          </label>
          <label data-slot="label">
            Weekly digest
            <ui-switch name="digest" value="weekly" default-checked>
              <ui-switch-thumb></ui-switch-thumb>
            </ui-switch>
          </label>
        </fieldset>
      </ui-field-set>
      <div data-slot="row">
        <button type="submit" data-variant="solid">Save</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const entries = [...new FormData(form)].map(
      ([name, value]) => `${name}=${value}`
    )
    log(
      root,
      entries.length ? `Submitted ${entries.join("&")}` : "Submitted nothing"
    )
  })
}

export { mount }
```

Turn on Product updates and press Save. The console logs the submitted values, and Reset restores the defaults.

## Validation

`required` blocks submission until the switch is on. In a [Field](./field.md), `ui-field-error` shows the message under the switch and connects it to the switch. [Forms and Validation](../forms.md) covers the shared field behavior.

```ts title="invalid.ts"
import "@ui-sdk/web/switch"
import "@ui-sdk/web/field"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form data-slot="stack">
      <ui-field>
        <div data-slot="row">
          <div data-slot="stack">
            <ui-field-label>Two-factor authentication</ui-field-label>
            <ui-field-description>Required for admins of this workspace.</ui-field-description>
          </div>
          <ui-switch name="two-factor" required>
            <ui-switch-thumb></ui-switch-thumb>
          </ui-switch>
        </div>
        <ui-field-error match="valueMissing">Turn this on to continue.</ui-field-error>
      </ui-field>
      <div data-slot="row">
        <button type="submit" data-variant="solid">Continue</button>
      </div>
    </form>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    log(root, `Submitted two-factor=${new FormData(form).get("two-factor")}`)
  })
}

export { mount }
```

Press Continue with the switch off to see the error. Turn on Two-factor authentication and continue; the console logs the submitted value.

## Saving on Toggle

To save a change before it shows, call `event.preventDefault()` in `checkedchange` to keep the current value while the save runs. When it finishes, call `api.setChecked(next, { reason: "imperative" })`, and let that reason through in the listener so the saved value commits.

The example ignores presses while a save is running, and shows a spinner in the thumb. `aria-busy` tells assistive technology the switch is busy; the listener is what blocks another change.

```ts title="async.ts"
import "@ui-sdk/web/switch"
import { createElement, LoaderCircle } from "lucide"
import { log } from "./log"

const save = (_checked: boolean) =>
  new Promise((resolve) => setTimeout(resolve, 800))

function mount(root: HTMLElement) {
  root.innerHTML = `
    <label data-slot="label">
      Automatic backups
      <ui-switch aria-busy="false">
        <ui-switch-thumb></ui-switch-thumb>
      </ui-switch>
    </label>
  `
  const backups = root.querySelector("ui-switch")!
  const thumb = root.querySelector("ui-switch-thumb")!
  let saving = false

  backups.addEventListener("checkedchange", (event) => {
    const { value, reason } = event.detail
    if (reason === "imperative") {
      return
    }
    event.preventDefault()
    if (saving) {
      return
    }
    saving = true
    backups.setAttribute("aria-busy", "true")
    thumb.replaceChildren(
      createElement(LoaderCircle, {
        "data-slot": "spinner",
        "aria-hidden": "true",
      })
    )
    log(root, "Saving…")
    save(value).then(() => {
      saving = false
      backups.api.setChecked(value, { reason: "imperative" })
      backups.setAttribute("aria-busy", "false")
      thumb.replaceChildren()
      log(root, `Saved: ${value ? "on" : "off"}`)
    })
  })
}

export { mount }
```

Turn on Automatic backups. The thumb shows a spinner while it saves, then the switch turns on.

## Custom Rendering

Elements have no render functions. `ui-switch` is the focusable control and `ui-switch-thumb` holds whatever you put inside it. Here a `checkedchange` listener puts a sun or a moon in the thumb, and the stylesheet can read `data-checked` on either part. See [Parts and Composition](../parts-and-composition.md) for the rendering contract.

```ts title="render.ts"
import "@ui-sdk/web/switch"
import { createElement, Moon, Sun } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <label data-slot="label">
      Dark mode
      <ui-switch>
        <ui-switch-thumb></ui-switch-thumb>
      </ui-switch>
    </label>
  `
  const darkMode = root.querySelector("ui-switch")!
  const thumb = root.querySelector("ui-switch-thumb")!
  const render = (checked: boolean) =>
    thumb.replaceChildren(
      createElement(checked ? Moon : Sun, { "aria-hidden": "true" })
    )
  render(darkMode.checked)
  darkMode.addEventListener("checkedchange", (event) =>
    render(event.detail.value)
  )
}

export { mount }
```

Turn on Dark mode. The thumb renders a sun or a moon from its state.

## Styling

Style the switch and its thumb with `data-checked` and `data-unchecked`, and use `data-disabled`, `data-readonly` and `data-required` for the rest. In an invalid field, the switch also gets `data-invalid` and `aria-invalid`; the thumb doesn't. Slide the thumb with `translate` on `data-checked`, and reverse it under `dir="rtl"`.

Each part has a `data-slot`, such as `switch`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### `<ui-switch>`
`[data-slot="switch"]`

- `data-checked`: Present while on.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-unchecked`: Present while off.
- `data-invalid`: Present while a `Field` around it shows as invalid. The thumb doesn't get it.

### `<ui-switch-thumb>`
`[data-slot="switch-thumb"]`

- `data-checked`: Present while on.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-unchecked`: Present while off.

## API Reference

Props are attributes in kebab case, like `default-checked` and `read-only`: `"false"` is false. `checked` is a live property and attribute. Callbacks are DOM events.

### Switch

- `checked?` (`boolean`): Whether it's checked. Pass it to control the checkbox.
- `defaultChecked?` (`boolean`): Whether it's checked at first, when uncontrolled. A form reset returns to it.
- `checkedchange event`: Runs when a user or a form reset wants to change it. `details.reason` says why, and `details.cancel()` stops it.
- `disabled?` (`boolean`): Disables it like a native control: it can't be focused or changed, and isn't submitted.
- `readOnly?` (`boolean`): Keeps it focusable and submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission until it's checked, with the browser's own message.
- `name?` (`string`): The name it submits under. Without one, it submits nothing.
- `value?` (`string`): What it submits while checked.
- `form?` (`string`): The id of a form to belong to, when it isn't inside that form.
- `controller?` (`{ toggle: (details?: Details) => boolean; getChecked: () => boolean; setChecked: (checked: boolean, details?: Details) => boolean; focus: () => void; }`): Toggles it from anywhere. Create one with `createSwitchController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

The same state shows as data attributes on each element.

- `checked` (`boolean`): Whether it's checked. False while indeterminate.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: it stays focusable and submitted, but presses don't change it.
- `required` (`boolean`): Whether a form won't submit until it's checked. Indeterminate doesn't count.

### Reasons

`event.detail.reason` says why the switch turned on or off.

- `press` (`MouseEvent | KeyboardEvent`): A single-element control was pressed: a checkbox, a switch or a toggle.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods. The `checked` property reads and sets the state.

Every write method takes an optional `{ reason, event }`, fires the change event like a press, and returns `false` when the change is canceled.

- `toggle(details?)` (`(details?: CheckboxChangeOptions | undefined) => boolean`): Turns it on, or off.
- `getChecked()` (`() => boolean`): Whether it's on.
- `setChecked(checked, details?)` (`(checked: boolean, details?: CheckboxChangeOptions | undefined) => boolean`): Turns it on or off, as a user would.
- `focus()` (`() => void`): Moves focus to it.

### Events

Events fire on their own element and don't bubble, with the new state in `event.detail.value` and the `reason`, `event` and `source` beside it. Calling `preventDefault()` cancels the change.

| Member                        | On          | Description                                                               |
| ----------------------------- | ----------- | ------------------------------------------------------------------------- |
| `checked` property, attribute | `ui-switch` | Whether the switch is on. The attribute sets where it starts, and is live |
| `api` property                | `ui-switch` | The [controller](#controller)                                             |
| `checkedchange` event         | `ui-switch` | `detail: { value: checked, reason, event, source }`                       |

## Accessibility

The switch follows the [WAI-ARIA switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/). `ui-switch` takes the `switch` role itself and takes part in forms through `ElementInternals`, with no hidden input.

### Keyboard

| Key   | Does                                   |
| ----- | -------------------------------------- |
| Tab   | Moves to the next switch               |
| Space | Turns it on or off                     |
| Enter | Submits its form, and never toggles it |

### Tested Behavior

Every line below is an automated test.

- Starts in its default state.
- Clicking toggles it.
- Clicking its label toggles it.
- Space toggles it.
- Enter submits the form and never toggles it.
- The thumb follows the state.

**The first input on a page**

- The first Space reports keyboard.

**On a touch screen**

- The first tap reports touch.

Runs in React, Vue and web components.

In forms:

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

Beyond the pattern's baseline:

**Enhancements**

- The first invalid control takes focus in document order.
- A later required field without an error part doesn't take focus from the first.

**Form-associated custom elements**

- Take part in the form with no hidden input. Web components only.
- Report validity like native controls. Web components only.
- Have live checked and value properties. Web components only.
- Are named by their labels. Web components only.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while checking boxes with a keyboard.
- Announcements while choosing a radio with a keyboard.

Runs in React, Vue and web components.
