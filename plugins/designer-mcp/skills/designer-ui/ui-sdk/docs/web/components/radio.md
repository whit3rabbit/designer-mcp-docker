# Radio

Choose one option, move the selection with arrow keys, and submit it with a form.

Use radios for a short list of choices where only one can be picked, like a shipping speed or a plan. The group keeps one value and gives the whole list a single tab stop.

```ts title="basic.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/radio"

const speeds = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
  { value: "overnight", label: "Overnight" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Shipping speed</ui-field-label>
      <ui-radio-group default-value="standard">
        ${speeds
          .map(
            (speed) => `
              <label data-slot="label">
                <ui-radio value="${speed.value}">
                  <ui-radio-indicator></ui-radio-indicator>
                </ui-radio>
                ${speed.label}
              </label>
            `
          )
          .join("")}
      </ui-radio-group>
    </ui-field>
  `
}

export { mount }
```

Choose Express, then use the arrow keys to move the selection between speeds.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the component, and the field if you use it, to register their elements. The import is safe on the server.

```ts
import "@ui-sdk/web/radio"
import "@ui-sdk/web/field"
```

## Composition

Use the following composition to build a `ui-radio-group`:

```text
ui-radio-group
├── ui-radio
│   └── ui-radio-indicator
└── ui-radio
    └── ui-radio-indicator
```

Give each radio a `value` and wrap it with its text in a label. The group's value is the checked radio's value, and the indicator shows while its radio is checked.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/field"
  import "@ui-sdk/web/radio"
</script>

<ui-field>
  <ui-field-label>Shipping speed</ui-field-label>
  <ui-radio-group default-value="standard">
    <label>
      <ui-radio value="standard">
        <ui-radio-indicator></ui-radio-indicator>
      </ui-radio>
      Standard
    </label>
    <label>
      <ui-radio value="express">
        <ui-radio-indicator></ui-radio-indicator>
      </ui-radio>
      Express
    </label>
  </ui-radio-group>
</ui-field>
```

The field's label names the group. Without a field, name it with `aria-label` or `aria-labelledby`. Without `default-value`, nothing starts checked and Tab enters on the first enabled radio.

## Description

Put each radio in its own `ui-field` with a `ui-field-label` and `ui-field-description` when an option needs more explanation. That field connects both to its radio, while the outer field still names the group.

```ts title="description.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/radio"

const frequencies = [
  { value: "instant", label: "Instantly", description: "An email right away." },
  {
    value: "daily",
    label: "Daily digest",
    description: "One email each morning.",
  },
  {
    value: "weekly",
    label: "Weekly digest",
    description: "A summary every Monday.",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Email notifications</ui-field-label>
      <ui-radio-group default-value="daily">
        ${frequencies
          .map(
            (frequency) => `
              <ui-field>
                <ui-radio value="${frequency.value}">
                  <ui-radio-indicator></ui-radio-indicator>
                </ui-radio>
                <div data-slot="stack">
                  <ui-field-label>${frequency.label}</ui-field-label>
                  <ui-field-description>${frequency.description}</ui-field-description>
                </div>
              </ui-field>
            `
          )
          .join("")}
      </ui-radio-group>
    </ui-field>
  `
}

export { mount }
```

Choose Weekly digest by its label. Each radio is also described by the line under it.

## Choice Card

Wrap an option's content in its label to make the whole card clickable. `:has([data-checked])` lets the card reflect the radio inside it.

```ts title="choice-card.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/radio"

const plans = [
  {
    value: "hobby",
    label: "Hobby",
    description: "Free for personal projects.",
  },
  {
    value: "pro",
    label: "Pro",
    description: "$20 per month for growing teams.",
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Custom pricing and support.",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Plan</ui-field-label>
      <ui-radio-group default-value="hobby">
        ${plans
          .map(
            (plan) => `
              <label data-slot="card">
                <span data-slot="stack">
                  <span>${plan.label}</span>
                  <span data-slot="hint">${plan.description}</span>
                </span>
                <ui-radio value="${plan.value}">
                  <ui-radio-indicator></ui-radio-indicator>
                </ui-radio>
              </label>
            `
          )
          .join("")}
      </ui-radio-group>
    </ui-field>
  `
}

export { mount }
```

Click anywhere on the Pro card to choose it. Arrow keys move the selection between cards too.

## Fieldset and Legend

Use `ui-field-set` around a native `fieldset` and `legend` to describe a set of choices together. Connect the group to the legend with `aria-labelledby`, and to the description with `aria-describedby`.

```ts title="legend.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/radio"

const periods = [
  { value: "monthly", label: "Monthly", price: "$12 per month" },
  { value: "yearly", label: "Yearly", price: "$120 per year" },
]

function mount(root: HTMLElement) {
  const id = crypto.randomUUID()
  root.innerHTML = `
    <ui-field-set>
      <fieldset>
        <legend id="${id}-legend">Billing period</legend>
        <ui-field-description id="${id}-description">Yearly billing gets you two months free.</ui-field-description>
        <ui-radio-group default-value="monthly" aria-labelledby="${id}-legend" aria-describedby="${id}-description">
          ${periods
            .map(
              (period) => `
                <label data-slot="label">
                  <ui-radio value="${period.value}">
                    <ui-radio-indicator></ui-radio-indicator>
                  </ui-radio>
                  ${period.label}
                  <span data-slot="hint">(${period.price})</span>
                </label>
              `
            )
            .join("")}
        </ui-radio-group>
      </fieldset>
    </ui-field-set>
  `
}

export { mount }
```

Choose Yearly. The legend and the line under it describe both billing periods.

## Disabled

Set `disabled` on the group or on one radio. Disabled radios can't be focused or checked, and arrow keys skip them. A disabled fieldset disables the group too, and a disabled group submits nothing.

```ts title="disabled.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/radio"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

const backups = [
  { value: "hourly", label: "Hourly", disabled: true },
  { value: "daily", label: "Daily", disabled: false },
  { value: "weekly", label: "Weekly", disabled: false },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-field>
        <ui-field-label>Theme</ui-field-label>
        <ui-field-description>Set by your organization.</ui-field-description>
        <ui-radio-group default-value="light" disabled>
          ${themes
            .map(
              (theme) => `
                <label data-slot="label">
                  <ui-radio value="${theme.value}">
                    <ui-radio-indicator></ui-radio-indicator>
                  </ui-radio>
                  ${theme.label}
                </label>
              `
            )
            .join("")}
        </ui-radio-group>
      </ui-field>
      <ui-field>
        <ui-field-label>Backups</ui-field-label>
        <ui-field-description>Hourly backups need the Pro plan.</ui-field-description>
        <ui-radio-group default-value="daily">
          ${backups
            .map(
              (backup) => `
                <label data-slot="label">
                  <ui-radio value="${backup.value}"${backup.disabled ? " disabled" : ""}>
                    <ui-radio-indicator></ui-radio-indicator>
                  </ui-radio>
                  ${backup.label}
                </label>
              `
            )
            .join("")}
        </ui-radio-group>
      </ui-field>
    </div>
  `
}

export { mount }
```

The Theme group is disabled. In Backups, Hourly is disabled, so the arrow keys move between Daily and Weekly.

## Read-Only

Set `read-only` on the group to keep its value while still letting people focus and read the options. Arrow keys move focus without checking anything, and the value still submits with a form.

```ts title="read-only.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/radio"

const plans = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Your plan</ui-field-label>
      <ui-field-description>Ask an admin to change plans.</ui-field-description>
      <ui-radio-group default-value="pro" read-only>
        ${plans
          .map(
            (plan) => `
              <label data-slot="label">
                <ui-radio value="${plan.value}">
                  <ui-radio-indicator></ui-radio-indicator>
                </ui-radio>
                ${plan.label}
              </label>
            `
          )
          .join("")}
      </ui-radio-group>
    </ui-field>
  `
}

export { mount }
```

Click Team, or focus Pro and press the Down arrow. Pro stays checked.

## Controlled

Read or set the group element's `value` property and listen for `valuechange`. Call `event.preventDefault()` in the listener to keep the current value. Its `api` property is a [controller](#controller) that checks a radio from anywhere, like the Choose Team button below.

```ts title="controlled.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/radio"
import { log } from "./log"

const plans = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Choose Team</button>
      </div>
      <ui-field>
        <ui-field-label>Plan</ui-field-label>
        <ui-radio-group default-value="pro">
          ${plans
            .map(
              (plan) => `
                <label data-slot="label">
                  <ui-radio value="${plan.value}">
                    <ui-radio-indicator></ui-radio-indicator>
                  </ui-radio>
                  ${plan.label}
                </label>
              `
            )
            .join("")}
        </ui-radio-group>
      </ui-field>
    </div>
  `
  const group = root.querySelector("ui-radio-group")!
  root
    .querySelector("[data-slot=controls] button")!
    .addEventListener("click", () => group.api.setValue("team"))
  group.addEventListener("valuechange", (event) => {
    const { value, reason } = event.detail
    log(
      root,
      `${plans.find((plan) => plan.value === value)?.label ?? "None"} (${reason})`
    )
  })
}

export { mount }
```

Choose Starter, then press Choose Team. The console logs each change and its reason.

See [State and Events](../state-and-events.md) for controlled state, cancellation and debugging.

## Form

`ui-radio-group` is form-associated, so the group takes part in forms without hidden inputs. Set `name` to submit the checked value; the group submits nothing without a name or a checked radio. `required` blocks submission until there's a choice, and a reset returns to `default-value`.

Set `form` to a form's id to join it from elsewhere on the page, as this group does.

```ts title="form.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/radio"
import { log } from "./log"

const speeds = [
  { value: "standard", label: "Standard", detail: "Free, 5 to 7 days" },
  { value: "express", label: "Express", detail: "$9, 2 days" },
  { value: "overnight", label: "Overnight", detail: "$24, next day" },
]

function mount(root: HTMLElement) {
  const id = crypto.randomUUID()
  root.innerHTML = `
    <div data-slot="stack">
      <ui-field>
        <ui-field-label>Shipping speed</ui-field-label>
        <ui-radio-group name="shipping" form="${id}-checkout" required default-value="standard">
          ${speeds
            .map(
              (speed) => `
                <label data-slot="label">
                  <ui-radio value="${speed.value}">
                    <ui-radio-indicator></ui-radio-indicator>
                  </ui-radio>
                  ${speed.label}
                  <span data-slot="hint">(${speed.detail})</span>
                </label>
              `
            )
            .join("")}
        </ui-radio-group>
      </ui-field>
      <form data-slot="row" id="${id}-checkout">
        <button type="submit" data-variant="solid">Continue</button>
        <button type="reset">Reset</button>
      </form>
    </div>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    log(root, `Submitted shipping=${new FormData(form).get("shipping")}`)
  })
}

export { mount }
```

Choose Express and press Continue. The console logs the submitted value, and Reset returns the choice to Standard.

## Validation

Put a required group in a [Field](./field.md) with a `ui-field-error`. Submitting without a choice shows the error under the group and moves focus to it. The [Forms guide](../forms.md) covers the shared field behavior.

```ts title="invalid.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/radio"
import { log } from "./log"

const channels = [
  { value: "email", label: "Email only" },
  { value: "sms", label: "SMS only" },
  { value: "both", label: "Email and SMS" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form data-slot="stack">
      <ui-field>
        <ui-field-label>Order updates</ui-field-label>
        <ui-field-description>Choose how we tell you about your orders.</ui-field-description>
        <ui-radio-group name="updates" required>
          ${channels
            .map(
              (channel) => `
                <label data-slot="label">
                  <ui-radio value="${channel.value}">
                    <ui-radio-indicator></ui-radio-indicator>
                  </ui-radio>
                  ${channel.label}
                </label>
              `
            )
            .join("")}
        </ui-radio-group>
        <ui-field-error>Choose how to get order updates.</ui-field-error>
      </ui-field>
      <div data-slot="row">
        <button type="submit" data-variant="solid">Save</button>
      </div>
    </form>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    log(root, `Saved updates=${new FormData(form).get("updates")}`)
  })
}

export { mount }
```

Press Save without a choice to see the error. Choose SMS only and save again; the console logs the saved value.

## Animation

The indicator has `data-starting-style` as it appears and `data-ending-style` while it leaves, and stays mounted until its exit finishes. Transition from those states:

```css
[data-slot="radio-indicator"] {
  transition:
    opacity 0.15s,
    scale 0.15s;

  &:is([data-starting-style], [data-ending-style]) {
    opacity: 0;
    scale: 0.5;
  }
}
```

`keep-mounted` keeps the indicator in the page while unchecked, with `data-unchecked`. Here it lets a hovered option preview its dot.

```ts title="indicator.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/radio"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Theme</ui-field-label>
      <ui-radio-group default-value="system">
        ${themes
          .map(
            (theme) => `
              <label data-slot="label">
                <ui-radio value="${theme.value}">
                  <ui-radio-indicator keep-mounted></ui-radio-indicator>
                </ui-radio>
                ${theme.label}
              </label>
            `
          )
          .join("")}
      </ui-radio-group>
    </ui-field>
  `
}

export { mount }
```

Hover Light to preview its dot, then choose it. The dot scales in on Light and out of System.

## Loop

Arrow keys wrap from the last radio to the first. Set `loop="false"` to stop at the ends.

```html
<ui-radio-group default-value="low" loop="false"> ... </ui-radio-group>
```

## Custom Rendering

Elements have no render functions. `ui-radio` is the interactive element itself, so put your content inside it, where its role, label and keyboard behavior stay connected. Style it from its attributes, and watch them to change what's inside: here each radio marks its check when `data-checked` changes. See [Parts and Composition](../parts-and-composition.md) for the rendering contract.

```ts title="render.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/radio"
import { Check, createElement } from "lucide"

const options = [
  {
    value: "all",
    label: "Everything",
    description: "Every message and update.",
  },
  {
    value: "mentions",
    label: "Mentions",
    description: "Only when someone mentions you.",
  },
  { value: "none", label: "Nothing", description: "Turn notifications off." },
]

function mount(root: HTMLElement) {
  const id = crypto.randomUUID()
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Notify me about</ui-field-label>
      <ui-radio-group default-value="mentions">
        ${options
          .map(
            (option) => `
              <ui-radio
                value="${option.value}"
                aria-labelledby="${id}-${option.value}-label"
                aria-describedby="${id}-${option.value}-description"
              >
                <span data-slot="stack">
                  <span id="${id}-${option.value}-label">${option.label}</span>
                  <span data-slot="hint" id="${id}-${option.value}-description">${option.description}</span>
                </span>
                ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
              </ui-radio>
            `
          )
          .join("")}
      </ui-radio-group>
    </ui-field>
  `
  const update = (radio: Element) => {
    radio
      .querySelector("svg")!
      .toggleAttribute("data-checked", radio.hasAttribute("data-checked"))
  }
  const radios = root.querySelectorAll("ui-radio")
  radios.forEach((radio) => {
    new MutationObserver(() => update(radio)).observe(radio, {
      attributeFilter: ["data-checked"],
    })
    update(radio)
  })
}

export { mount }
```

Choose Nothing. Each radio renders a full-width button that shows a check from its state.

## Styling

Use `data-checked` and `data-unchecked` for the checked state, and `data-disabled`, `data-readonly` and `data-required` for the rest. The indicator gets the same state attributes as its radio, and the group gets `data-disabled`, `data-readonly` and `data-required`.

Each part has a `data-slot`, such as `radio`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### `<ui-radio-group>`
`[data-slot="radio-group"]`

- `data-readonly`: Present when the group is read-only.
- `data-required`: Present when the group is required.
- `data-disabled`: Present when disabled, by its own prop, the group or a `<fieldset>`.

### `<ui-radio>`
`[data-slot="radio"]`

- `data-checked`: Present on the checked radio.
- `data-readonly`: Present when the group is read-only.
- `data-required`: Present when the group is required.
- `data-unchecked`: Present on radios that aren't checked.
- `data-disabled`: Present when disabled, by its own prop, the group or a `<fieldset>`.

### `<ui-radio-indicator>`
`[data-slot="radio-indicator"]`

- `data-checked`: Present on the checked radio.
- `data-readonly`: Present when the group is read-only.
- `data-required`: Present when the group is required.
- `data-unchecked`: Present on radios that aren't checked.
- `data-disabled`: Present when disabled, by its own prop, the group or a `<fieldset>`.
- `data-starting-style`: Present for the indicator's first frame. Style the state you animate from.
- `data-ending-style`: Present while the indicator animates out. Style the state you animate to.

## API Reference

Props are attributes in kebab case, like `default-value`, `read-only` and `keep-mounted`: `"false"` is
false, so `loop="false"` turns looping off. `value` is a live property and attribute. Callbacks are DOM events.

### RadioGroup

- `value?` (`T | null`): The checked radio's value. Pass it to control the group. `null` checks nothing.
- `defaultValue?` (`T | null`): The radio checked at first, when uncontrolled. A form reset returns to it.
- `valuechange event`: Runs when a user or a form reset wants to change the value. `details.reason` says why, and `details.cancel()` stops it.
- `disabled?` (`boolean`): Disables every radio like native ones: they can't be focused or changed, and the value isn't submitted.
- `readOnly?` (`boolean`): Keeps the items focusable and the value submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission until an item is checked, with the browser's own message.
- `name?` (`string`): The name the value submits under. Without one, the group submits nothing.
- `form?` (`string`): The id of a form to belong to, when the group isn't inside that form.
- `loop?` (`boolean`): Whether arrow keys wrap from the last item to the first.
- `controller?` (`{ getValue: () => T | null; setValue: (value: T | null, details?: Details) => boolean; focus: () => void; }`): Checks radios from anywhere. Create one with `createRadioGroupController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### Radio

- `value` (`string`): What the group's value becomes when this item is checked.
- `disabled?` (`boolean`): Skips the item, like a disabled native radio: arrow keys pass it and it can't be focused or checked.

### RadioIndicator

- `keepMounted?` (`boolean`): Whether the indicator stays in the page while its item is unchecked.

### State

The same state shows as data attributes on each element.

- `value` (`string | null`): The checked item's value.
- `disabled` (`boolean`): Whether the group is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the group is read-only: arrow keys still move focus, but nothing changes the checked item.
- `required` (`boolean`): Whether a form won't submit until an item is checked.

- `checked` (`boolean`): Whether this item is checked.
- `disabled` (`boolean`): Whether this item is disabled, by itself, its group or a `<fieldset>`.
- `readOnly` (`boolean`): Whether the group is read-only.
- `required` (`boolean`): Whether the group is required.

- `checked` (`boolean`): Whether this item is checked.
- `disabled` (`boolean`): Whether this item is disabled, by itself, its group or a `<fieldset>`.
- `readOnly` (`boolean`): Whether the group is read-only.
- `required` (`boolean`): Whether the group is required.

### Reasons

`event.detail.reason` says why the checked value changed.

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods. The `value` property reads and sets the checked value.

Every write method takes an optional `{ reason, event }`, fires the change event like a press, and returns `false` when the change is canceled.

- `getValue()` (`() => T | null`): The checked radio's value.
- `setValue(value, details?)` (`(value: T | null, details?: RadioGroupChangeOptions | undefined) => boolean`): Checks a radio, as a user would. Disabled radios and read-only groups ignore it.
- `focus()` (`() => void`): Moves focus to the checked radio, or the first one.

### Events

Events fire on their own element and don't bubble, with the new value in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` cancels the change.

| Member                      | On               | Description                                                        |
| --------------------------- | ---------------- | ------------------------------------------------------------------ |
| `value` property, attribute | `ui-radio-group` | The checked value. The attribute sets where it starts, and is live |
| `api` property              | `ui-radio-group` | The [controller](#controller)                                      |
| `valuechange` event         | `ui-radio-group` | `detail: { value, reason, event, source }`                         |

## Accessibility

Radio groups follow the [WAI-ARIA radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), and behave like native radios that share a name. `ui-radio` is the control itself, with the `radio` role, and the group takes part in forms through `ElementInternals`, without hidden inputs.

### Keyboard

| Key        | Does                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Tab        | Moves into the group, onto the checked radio or the first enabled one   |
| Arrow keys | Move to the next or previous radio and check it, skipping disabled ones |
| Space      | Checks the focused radio                                                |
| Enter      | Submits its form                                                        |

### Tested Behavior

Every line below is an automated test.

**Selection**

- Nothing is checked at first without a default value.
- Clicking an item checks it and unchecks the others.
- Clicking an item's label checks it.
- Clicking a disabled item does nothing.
- A change can be cancelled.

**Keyboard**

- Tab lands on the first item when nothing is checked.
- Tab lands on the checked item.
- Tab leaves the group after one stop.
- Space checks the focused item.
- ArrowDown and ArrowRight move to the next item and check it.
- ArrowUp and ArrowLeft move to the previous item and check it.
- Arrow keys skip disabled items.
- Arrow keys wrap at both ends.
- Enter never checks an item.
- Keys pressed in quick succession are never lost.
- Enter on an item submits the form.

**Read-only and disabled**

- A read-only group moves focus with arrow keys but checks nothing.
- A disabled group can't be focused or changed.
- Clicking a radio in a disabled group doesn't focus it.
- Clicking the label of a radio in a disabled group neither focuses nor checks it.

**Animation**

- The indicator animates in from its starting style.

Runs in React, Vue and web components.

In a field:

**With every radio enabled**

- Each radio is named by the label of its own field.
- The field around the group still names the group.
- Clicking a radio's label checks it and unchecks the others.
- The group keeps one tab stop.
- Arrow keys move between the radios and check them.

**A disabled radio**

- A disabled field around the first radio moves the tab stop to the next.
- Disabling the first radio after it renders moves the tab stop to the next.
- Enabling the first radio again gives it back the tab stop.

Runs in React, Vue and web components.

In right-to-left pages:

- ArrowLeft moves to the next radio and ArrowRight to the previous one.
- ArrowDown and ArrowUp keep their direction.

Runs in React, Vue and web components.
