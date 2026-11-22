# Checkbox

Choose one or more options, individually or as a group.

Use a checkbox for a choice someone can check or uncheck. Use a group when several choices belong to one value.

```ts title="basic.ts"
import "@ui-sdk/web/checkbox"
import { Check, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <label data-slot="label">
      <ui-checkbox>
        <ui-checkbox-indicator>
          ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
        </ui-checkbox-indicator>
      </ui-checkbox>
      Accept terms and conditions
    </label>
  `
}

export { mount }
```

Click the checkbox or its label, or focus it and press Space, to accept the terms.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the component to register its elements. The import is safe on the server.

```ts
import "@ui-sdk/web/checkbox"
```

## Composition

Use the following composition to build a `ui-checkbox`:

```text
ui-checkbox
└── ui-checkbox-indicator
```

Wrap the checkbox and its text in a label. The indicator shows while the checkbox is checked or mixed.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/checkbox"
</script>

<label>
  <ui-checkbox>
    <ui-checkbox-indicator aria-hidden="true">✓</ui-checkbox-indicator>
  </ui-checkbox>
  Accept terms and conditions
</label>
```

## Description

Use `ui-field-label` and `ui-field-description` when a choice needs more explanation. The field connects both to the checkbox.

```ts title="description.ts"
import "@ui-sdk/web/checkbox"
import "@ui-sdk/web/field"
import { Check, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-checkbox>
        <ui-checkbox-indicator>
          ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
        </ui-checkbox-indicator>
      </ui-checkbox>
      <div data-slot="stack">
        <ui-field-label>Accept terms and conditions</ui-field-label>
        <ui-field-description>
          By clicking this checkbox, you agree to the terms and conditions.
        </ui-field-description>
      </div>
    </ui-field>
  `
}

export { mount }
```

Click Accept terms and conditions. The field connects the label and description to the checkbox.

## Disabled

`disabled` prevents focus and changes, and leaves the checkbox out of form submissions. A disabled `fieldset` does the same.

```ts title="disabled.ts"
import "@ui-sdk/web/checkbox"
import { Check, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <label data-slot="label">
        <ui-checkbox default-checked>
          <ui-checkbox-indicator>
            ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
          </ui-checkbox-indicator>
        </ui-checkbox>
        Product updates
      </label>
      <label data-slot="label">
        <ui-checkbox default-checked disabled>
          <ui-checkbox-indicator>
            ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
          </ui-checkbox-indicator>
        </ui-checkbox>
        Security alerts
      </label>
    </div>
  `
}

export { mount }
```

Security alerts are always on, so that checkbox is disabled. Clicking its label leaves it checked.

## Read-Only

`read-only` keeps the checkbox focusable and included in form submissions, while preventing the user from changing it.

```ts title="read-only.ts"
import "@ui-sdk/web/checkbox"
import "@ui-sdk/web/field"
import { Check, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-checkbox name="two-factor" default-checked read-only>
        <ui-checkbox-indicator>
          ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
        </ui-checkbox-indicator>
      </ui-checkbox>
      <div data-slot="stack">
        <ui-field-label>Require two-factor authentication</ui-field-label>
        <ui-field-description>
          Your organization requires this setting.
        </ui-field-description>
      </div>
    </ui-field>
  `
}

export { mount }
```

Tab to the checked checkbox. Space and clicks leave the setting unchanged.

## Indeterminate

An indeterminate checkbox represents a partly checked set. It has `aria-checked="mixed"` and `data-indeterminate`. A press checks it; only your code puts it back into the mixed state.

Start with `default-checked="indeterminate"`, or pass `"indeterminate"` as the controlled value. The indicator's `data-indeterminate` tells it which icon to show. A [parent checkbox](#parent-checkbox) derives this state from a group for you.

```html
<ui-checkbox default-checked="indeterminate">
  <ui-checkbox-indicator aria-hidden="true">–</ui-checkbox-indicator>
</ui-checkbox>

<script type="module">
  import "@ui-sdk/web/checkbox"

  const indicator = document.querySelector("ui-checkbox-indicator")
  new MutationObserver(() => {
    indicator.textContent = indicator.hasAttribute("data-indeterminate")
      ? "–"
      : "✓"
  }).observe(indicator, { attributeFilter: ["data-indeterminate"] })
</script>
```

## Controlled

Read or set the element's `checked` property and listen for `checkedchange`. Its `api` property is a [controller](#checkbox-controller) that changes it from anywhere, like the Toggle button below.

```ts title="controlled.ts"
import "@ui-sdk/web/checkbox"
import { Check, createElement } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Toggle</button>
      </div>
      <label data-slot="label">
        <ui-checkbox>
          <ui-checkbox-indicator>
            ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
          </ui-checkbox-indicator>
        </ui-checkbox>
        Email me about product updates
      </label>
    </div>
  `
  const updates = root.querySelector("ui-checkbox")!
  root
    .querySelector("[data-slot=controls] button")!
    .addEventListener("click", () => updates.api.toggle())
  updates.addEventListener("checkedchange", (event) => {
    const { value, reason } = event.detail
    log(
      root,
      `${value === "indeterminate" ? "Mixed" : value ? "Checked" : "Unchecked"} (${reason})`
    )
  })
}

export { mount }
```

Change the checkbox, or press Toggle. The console logs each change and its reason.

## Forms

Set `name` and `value` to include a checked checkbox in a native form. Unchecked and mixed checkboxes submit nothing. The default value is `"on"`. Independent checkboxes can share a name to submit several values; use a [group](#group) when your app also needs one list of checked values.

`required` blocks submission until the checkbox is checked. Reset returns it to `default-checked`. Set `form` to a form's id to join it from elsewhere on the page.

```ts title="form.ts"
import "@ui-sdk/web/checkbox"
import "@ui-sdk/web/field"
import { Check, createElement } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form data-slot="stack">
      <ui-field>
        <ui-checkbox name="terms" value="yes" required>
          <ui-checkbox-indicator>
            ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
          </ui-checkbox-indicator>
        </ui-checkbox>
        <div data-slot="stack">
          <ui-field-label>Accept terms and conditions</ui-field-label>
          <ui-field-description>You agree to our Terms of Service and Privacy Policy.</ui-field-description>
        </div>
      </ui-field>
      <ui-field>
        <ui-checkbox name="newsletter" value="weekly" default-checked>
          <ui-checkbox-indicator>
            ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
          </ui-checkbox-indicator>
        </ui-checkbox>
        <div data-slot="stack">
          <ui-field-label>Send me the weekly newsletter</ui-field-label>
          <ui-field-description>Product news and tips, once a week. Unsubscribe anytime.</ui-field-description>
        </div>
      </ui-field>
      <div data-slot="row">
        <button type="submit">Create Account</button>
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

Create the account with the terms unchecked to see native validation, then accept them and try again. The console logs what was submitted, and Reset restores the defaults.

## Group

`ui-checkbox-group` keeps one list of checked values. Each checkbox supplies its `value`; the group returns selected values in the order the checkboxes appear. Name the group with `aria-label`, `aria-labelledby`, or a [field](#group-in-a-form).

```ts title="group.ts"
import "@ui-sdk/web/checkbox"
import { Check, createElement } from "lucide"

const toppings = [
  { value: "cheese", label: "Cheese" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
  { value: "peppers", label: "Peppers" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <h3 id="basic-toppings">Toppings</h3>
      <ui-checkbox-group aria-labelledby="basic-toppings" default-value="cheese">
        ${toppings
          .map(
            (topping) => `
              <label data-slot="label">
                <ui-checkbox value="${topping.value}">
                  <ui-checkbox-indicator>
                    ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
                  </ui-checkbox-indicator>
                </ui-checkbox>
                ${topping.label}
              </label>
            `
          )
          .join("")}
      </ui-checkbox-group>
    </div>
  `
}

export { mount }
```

Choose several toppings. The group keeps one list of checked values.

## Parent Checkbox

Add a checkbox with `parent` to check or uncheck the group. It is checked when every value is selected, unchecked when none are, and mixed in between. It points to its children with `aria-controls` and submits nothing itself.

Pass `all-values` to the group so the parent has the right state on the first render, including on the server. Otherwise it discovers the values after the checkboxes mount.

```ts title="group-parent.ts"
import "@ui-sdk/web/checkbox"
import { Check, createElement, Minus } from "lucide"

const toppings = [
  { value: "cheese", label: "Cheese" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
  { value: "peppers", label: "Peppers" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <h3 id="parent-toppings">Toppings</h3>
      <ui-checkbox-group
        aria-labelledby="parent-toppings"
        default-value="cheese,olives"
        all-values="${toppings.map((topping) => topping.value).join(",")}"
      >
        <label data-slot="label">
          <ui-checkbox parent>
            <ui-checkbox-indicator>
              ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
              ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
            </ui-checkbox-indicator>
          </ui-checkbox>
          Select all
        </label>
        <div data-slot="stack">
          ${toppings
            .map(
              (topping) => `
                <label data-slot="label">
                  <ui-checkbox value="${topping.value}">
                    <ui-checkbox-indicator>
                      ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
                    </ui-checkbox-indicator>
                  </ui-checkbox>
                  ${topping.label}
                </label>
              `
            )
            .join("")}
        </div>
      </ui-checkbox-group>
    </div>
  `
}

export { mount }
```

Select all checks every topping. Uncheck one topping to put Select all into its mixed state.

## Disabled Group

Disable the group to lock every checkbox, or disable one child to keep just that value fixed. A parent changes only enabled children.

```ts title="group-disabled.ts"
import "@ui-sdk/web/checkbox"
import { Check, createElement, Minus } from "lucide"

const backups = [
  { value: "photos", label: "Photos" },
  { value: "documents", label: "Documents" },
  { value: "messages", label: "Messages" },
]

const folders = [
  { value: "desktop", label: "Desktop", disabled: true },
  { value: "projects", label: "Projects", disabled: false },
  { value: "downloads", label: "Downloads", disabled: false },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="stack">
        <h3 id="disabled-backups">Backups</h3>
        <p data-slot="hint">Managed by your organization.</p>
        <ui-checkbox-group aria-labelledby="disabled-backups" default-value="photos,documents" disabled>
          ${backups
            .map(
              (item) => `
                <label data-slot="label">
                  <ui-checkbox value="${item.value}">
                    <ui-checkbox-indicator>
                      ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
                    </ui-checkbox-indicator>
                  </ui-checkbox>
                  ${item.label}
                </label>
              `
            )
            .join("")}
        </ui-checkbox-group>
      </div>
      <div data-slot="stack">
        <h3 id="disabled-folders">Sync folders</h3>
        <ui-checkbox-group
          aria-labelledby="disabled-folders"
          default-value="desktop"
          all-values="${folders.map((item) => item.value).join(",")}"
        >
          <label data-slot="label">
            <ui-checkbox parent>
              <ui-checkbox-indicator>
                ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
                ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
              </ui-checkbox-indicator>
            </ui-checkbox>
            Select all
          </label>
          <div data-slot="stack">
            ${folders
              .map(
                (item) => `
                  <label data-slot="label">
                    <ui-checkbox value="${item.value}"${item.disabled ? " disabled" : ""}>
                      <ui-checkbox-indicator>
                        ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
                      </ui-checkbox-indicator>
                    </ui-checkbox>
                    ${item.label}
                  </label>
                `
              )
              .join("")}
          </div>
        </ui-checkbox-group>
      </div>
    </div>
  `
}

export { mount }
```

The Backups group is disabled. In Sync folders, Select all changes the enabled folders while Desktop stays checked.

## Controlled Group

Read or set the group element's `value` property and listen for `valuechange`. Its `api` property is a [controller](#checkboxgroup-controller) that can replace that list, as Select Weekdays and Clear do below.

```ts title="group-controlled.ts"
import "@ui-sdk/web/checkbox"
import { Check, createElement } from "lucide"
import { log } from "./log"

const days = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
]

const weekdays = ["mon", "tue", "wed", "thu", "fri"]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-action="weekdays">Select Weekdays</button>
        <button type="button" data-action="clear">Clear</button>
      </div>
      <h3 id="controlled-days">Working days</h3>
      <ui-checkbox-group aria-labelledby="controlled-days" default-value="mon,tue">
        ${days
          .map(
            (day) => `
              <label data-slot="label">
                <ui-checkbox value="${day.value}">
                  <ui-checkbox-indicator>
                    ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
                  </ui-checkbox-indicator>
                </ui-checkbox>
                ${day.label}
              </label>
            `
          )
          .join("")}
      </ui-checkbox-group>
    </div>
  `
  const schedule = root.querySelector("ui-checkbox-group")!
  root
    .querySelector('[data-action="weekdays"]')!
    .addEventListener("click", () => schedule.api.setValue(weekdays))
  root
    .querySelector('[data-action="clear"]')!
    .addEventListener("click", () => schedule.api.setValue([]))
  schedule.addEventListener("valuechange", (event) => {
    const { value, reason } = event.detail
    const names = days
      .filter((day) => value.includes(day.value))
      .map((day) => day.label)
    log(root, `${names.join(", ") || "No days"} (${reason})`)
  })
}

export { mount }
```

Choose working days, or press Select Weekdays or Clear. The console logs the group's value and the reason it changed.

## Group in a Form

Set `name` on the group to submit every checked value under that name. `required` requires at least one selection, and Reset restores `default-value`. The same `disabled` and `form` options apply as on a single checkbox.

In a field, the field supplies the group's label and description, and `ui-field-error` shows the validation message inline until a selection makes the group valid. [Forms and Validation](../forms.md) covers the shared field behavior.

```ts title="group-field.ts"
import "@ui-sdk/web/checkbox"
import "@ui-sdk/web/field"
import { Check, createElement } from "lucide"
import { log } from "./log"

const channels = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push notifications" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form data-slot="stack">
      <ui-field>
        <ui-field-label>Notifications</ui-field-label>
        <ui-field-description>Choose how we tell you about your orders.</ui-field-description>
        <ui-checkbox-group name="notifications" required>
          ${channels
            .map(
              (channel) => `
                <label data-slot="label">
                  <ui-checkbox value="${channel.value}">
                    <ui-checkbox-indicator>
                      ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
                    </ui-checkbox-indicator>
                  </ui-checkbox>
                  ${channel.label}
                </label>
              `
            )
            .join("")}
        </ui-checkbox-group>
        <div>
          <ui-field-error>Choose at least one way to be notified.</ui-field-error>
        </div>
      </ui-field>
      <button type="submit">Save</button>
    </form>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const entries = [...new FormData(form)].map(
      ([name, value]) => `${name}=${value}`
    )
    log(root, `Saved ${entries.join("&")}`)
  })
}

export { mount }
```

Save with nothing checked to see the inline error. Choose a notification method and save; the console logs the submitted values.

## Table

The same parent checkbox can select rows from a table header. Each row supplies its value and accessible name.

```ts title="table.ts"
import "@ui-sdk/web/checkbox"
import { Check, createElement, Minus } from "lucide"
import { log } from "./log"

const people = [
  {
    id: "hollis",
    name: "Hollis Grant",
    email: "hollis@example.com",
    role: "Owner",
  },
  {
    id: "ines",
    name: "Inès Moreau",
    email: "ines@example.com",
    role: "Editor",
  },
  {
    id: "kofi",
    name: "Kofi Mensah",
    email: "kofi@example.com",
    role: "Viewer",
  },
  {
    id: "wren",
    name: "Wren Takahashi",
    email: "wren@example.com",
    role: "Editor",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-checkbox-group aria-label="Team members" default-value="hollis" all-values="${people.map((person) => person.id).join(",")}">
      <table>
        <caption data-slot="visually-hidden">Team members</caption>
        <thead>
          <tr>
            <th>
              <ui-checkbox aria-label="Select all" parent>
                <ui-checkbox-indicator>
                  ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
                  ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
                </ui-checkbox-indicator>
              </ui-checkbox>
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          ${people
            .map(
              (person) => `
                <tr>
                  <td>
                    <ui-checkbox value="${person.id}" aria-label="Select ${person.name}">
                      <ui-checkbox-indicator>
                        ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
                      </ui-checkbox-indicator>
                    </ui-checkbox>
                  </td>
                  <td>${person.name}</td>
                  <td>${person.email}</td>
                  <td>${person.role}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </ui-checkbox-group>
  `
  root
    .querySelector("ui-checkbox-group")!
    .addEventListener("valuechange", (event) => {
      log(root, `${event.detail.value.length} of ${people.length} selected`)
    })
}

export { mount }
```

Select rows individually, or use Select all in the header. The console logs how many are selected.

## Animation

The indicator has `data-starting-style` as it appears and `data-ending-style` while it leaves, and stays mounted until its exit finishes. Transition from those states:

```css
[data-slot="checkbox-indicator"] {
  transition:
    opacity 0.15s,
    scale 0.15s;

  &:is([data-starting-style], [data-ending-style]) {
    opacity: 0;
    scale: 0.5;
  }
}
```

`keep-mounted` keeps the indicator in the page while unchecked, with `data-unchecked`, for styles that show both states.

```ts title="indicator.ts"
import "@ui-sdk/web/checkbox"
import { Check, createElement } from "lucide"

const tasks = [
  { label: "Write the release notes", done: false },
  { label: "Update the changelog", done: true },
  { label: "Tag the release", done: false },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      ${tasks
        .map(
          (task) => `
            <label data-slot="label">
              <ui-checkbox${task.done ? " default-checked" : ""}>
                <ui-checkbox-indicator>
                  ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
                </ui-checkbox-indicator>
              </ui-checkbox>
              ${task.label}
            </label>
          `
        )
        .join("")}
    </div>
  `
}

export { mount }
```

Check and uncheck a task. The check scales and fades in, and out before it unmounts.

## Custom Rendering

Elements have no render functions. `ui-checkbox` is the interactive element itself, so put your content inside it, where its role, label, and keyboard behavior stay connected. Style it from its attributes, and watch them to change what's inside: here each checkbox swaps its icon when `data-checked` changes.

```ts title="render.ts"
import "@ui-sdk/web/checkbox"
import { Check, createElement, Plus } from "lucide"

const topics = [
  { value: "design", label: "Design", checked: true },
  { value: "engineering", label: "Engineering", checked: false },
  { value: "marketing", label: "Marketing", checked: false },
  { value: "sales", label: "Sales", checked: false },
]

const icon = (checked: boolean) =>
  createElement(checked ? Check : Plus, { "aria-hidden": "true" }).outerHTML

function mount(root: HTMLElement) {
  root.innerHTML = `
    <fieldset>
      <legend>Topics you follow</legend>
      <div data-slot="row">
        ${topics
          .map(
            (topic) =>
              `<ui-checkbox name="topics" value="${topic.value}"${topic.checked ? " default-checked" : ""}>${icon(topic.checked)}${topic.label}</ui-checkbox>`
          )
          .join("")}
      </div>
    </fieldset>
  `
  const update = (checkbox: Element) => {
    checkbox.querySelector("svg")!.outerHTML = icon(
      checkbox.hasAttribute("data-checked")
    )
  }
  new MutationObserver((records) =>
    records.forEach((record) => update(record.target as Element))
  ).observe(root, { subtree: true, attributeFilter: ["data-checked"] })
  root.querySelectorAll("ui-checkbox").forEach(update)
}

export { mount }
```

Choose topics. Each checkbox shows a check or a plus from its state.

## Styling

Use `data-checked`, `data-unchecked` and `data-indeterminate` for the checked state, and `data-disabled`, `data-readonly` and `data-required` for the rest. The indicator gets the same state attributes as its checkbox.

Each part has a `data-slot`, such as `checkbox`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### `<ui-checkbox>`
`[data-slot="checkbox"]`

- `data-checked`: Present while checked.
- `data-disabled`: Present when disabled, by its own prop, a group or a `<fieldset>`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-unchecked`: Present while unchecked.
- `data-indeterminate`: Present while indeterminate.

### `<ui-checkbox-indicator>`
`[data-slot="checkbox-indicator"]`

- `data-checked`: Present while checked.
- `data-disabled`: Present when disabled, by its own prop, a group or a `<fieldset>`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-unchecked`: Present while unchecked.
- `data-indeterminate`: Present while indeterminate.
- `data-starting-style`: Present for the indicator's first frame. Style the state you animate from.
- `data-ending-style`: Present while the indicator animates out. Style the state you animate to.

### `<ui-checkbox-group>`
`[data-slot="checkbox-group"]`

- `data-disabled`: Present when the group is disabled, by its own prop or a `<fieldset>`.
- `data-required`: Present when at least one checkbox must be checked.

## API Reference

Props are attributes in kebab case, like `default-checked`, `read-only` and `all-values`: `"false"` is
false, and a group's `value`, `default-value` and `all-values` take comma-separated values. `checked` and
`value` are live properties and attributes. Callbacks are DOM events.

### Checkbox

- `checked?` (`CheckedState`): Whether it's checked. Pass it to control the checkbox.
- `defaultChecked?` (`CheckedState`): Whether it's checked at first, when uncontrolled. A form reset returns to it.
- `checkedchange event`: Runs when a user or a form reset wants to change it. `details.reason` says why, and `details.cancel()` stops it.
- `disabled?` (`boolean`): Disables it like a native control: it can't be focused or changed, and isn't submitted.
- `readOnly?` (`boolean`): Keeps it focusable and submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission until it's checked, with the browser's own message.
- `name?` (`string`): The name it submits under. Without one, it submits nothing.
- `value?` (`string`): What it submits while checked.
- `form?` (`string`): The id of a form to belong to, when it isn't inside that form.
- `controller?` (`{ toggle: (details?: Details) => boolean; getChecked: () => CheckedState; setChecked: (checked: CheckedState, details?: Details) => boolean; focus: () => void; }`): Toggles it from anywhere. Create one with `createCheckboxController()`.
- `parent?` (`boolean`): Makes it the parent of its group: it checks or unchecks every checkbox in the group, and shows checked, unchecked or indeterminate from them.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### CheckboxIndicator

- `keepMounted?` (`boolean`): Whether the indicator stays in the page while unchecked, so it can be styled or animated in both states.

### CheckboxGroup

- `value?` (`T[]`): The checked checkboxes' values. Pass it to control the group.
- `defaultValue?` (`T[]`): The values checked at first, when uncontrolled. A form reset returns to them.
- `valuechange event`: Runs when a user or a form reset wants to change the value. `details.reason` says why, and `details.cancel()` stops it.
- `allValues?` (`T[]`): Every value a parent checkbox checks. Without it, the parent checks the checkboxes in the group. Pass it to render the parent right on the server.
- `disabled?` (`boolean`): Disables every checkbox in the group, and leaves them out of the form.
- `readOnly?` (`boolean`): Makes every checkbox in the group read-only: focusable and submitted, but presses don't change it.
- `required?` (`boolean`): Blocks form submission until at least one checkbox is checked, with the browser's own message.
- `name?` (`string`): The name every checkbox in the group submits under.
- `form?` (`string`): The id of a form to belong to, when the group isn't inside that form.
- `controller?` (`{ getValue: () => T[]; setValue: (value: T[], details?: Details) => boolean; focus: () => void; }`): Checks values from anywhere. Create one with `createCheckboxGroupController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

The same state shows as data attributes on each element.

- `checked` (`boolean`): Whether it's checked. False while indeterminate.
- `indeterminate` (`boolean`): Whether it's `"indeterminate"`, for a partly checked group. A press makes it checked.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: it stays focusable and submitted, but presses don't change it.
- `required` (`boolean`): Whether a form won't submit until it's checked. Indeterminate doesn't count.

The indicator receives the same state.

- `checked` (`boolean`): Whether it's checked. False while indeterminate.
- `indeterminate` (`boolean`): Whether it's `"indeterminate"`, for a partly checked group. A press makes it checked.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: it stays focusable and submitted, but presses don't change it.
- `required` (`boolean`): Whether a form won't submit until it's checked. Indeterminate doesn't count.

The group:

- `value` (`string[]`): The checked values.
- `disabled` (`boolean`): Whether the group is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the group is read-only: its checkboxes stay focusable and submitted, but presses don't change them.
- `required` (`boolean`): Whether a form won't submit until at least one of its checkboxes is checked.

### Reasons

`event.detail.reason` says why the checked state changed.

- `press` (`MouseEvent | KeyboardEvent`): A single-element control was pressed: a checkbox, a switch or a toggle.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

For a group, it says why the checked values changed.

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Checkbox Controller

The element's `api` property has the same methods. The `checked` property reads and sets the state.

Every write method takes an optional `{ reason, event }`, fires the change event like a press, and returns `false` when the change is canceled.

- `toggle(details?)` (`(details?: CheckboxChangeOptions | undefined) => boolean`): Checks it, or unchecks it. An indeterminate checkbox becomes checked.
- `getChecked()` (`() => CheckedState`): Whether it's checked: `true`, `false` or `"indeterminate"`.
- `setChecked(checked, details?)` (`(checked: CheckedState, details?: CheckboxChangeOptions | undefined) => boolean`): Sets whether it's checked, as a user would.
- `focus()` (`() => void`): Moves focus to it.

### CheckboxGroup Controller

The element's `api` property has the same methods. The `value` property reads and sets the checked values.

Its write methods work like the checkbox controller's.

- `getValue()` (`() => T[]`): The checked values.
- `setValue(value, details?)` (`(value: T[], details?: CheckboxGroupChangeOptions | undefined) => boolean`): Sets the checked values, as a user would. A disabled group ignores it.
- `focus()` (`() => void`): Moves focus to the first enabled checkbox.

### Events

Events fire on their own element and don't bubble, with the new state or value in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` cancels the change.

| Member                        | On                  | Description                                                                             |
| ----------------------------- | ------------------- | --------------------------------------------------------------------------------------- |
| `checked` property, attribute | `ui-checkbox`       | The checked state. The attribute sets where it starts, and is live                      |
| `api` property                | `ui-checkbox`       | The [controller](#checkbox-controller)                                                  |
| `checkedchange` event         | `ui-checkbox`       | `detail: { value: checked, reason, event, source }`                                     |
| `value` property, attribute   | `ui-checkbox-group` | The checked values. The attribute is comma-separated, sets where it starts, and is live |
| `api` property                | `ui-checkbox-group` | The [controller](#checkboxgroup-controller)                                             |
| `valuechange` event           | `ui-checkbox-group` | `detail: { value, reason, event, source }`                                              |

## Accessibility

The checkbox follows the [WAI-ARIA checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/), and a group's parent checkbox follows its [mixed checkbox example](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/). `ui-checkbox` is the control itself, with the `checkbox` role, and takes part in forms through `ElementInternals`, without a hidden input. Every line below is an automated test.

### Keyboard

| Key   | Does                                         |
| ----- | -------------------------------------------- |
| Tab   | Moves to the next checkbox                   |
| Space | Checks or unchecks it, or checks a mixed one |
| Enter | Submits its form                             |

### Tested Behavior

**Checkbox**

- Clicking toggles it.
- Clicking its label toggles it.
- Clicking a label around it toggles it once.
- Space toggles it.
- Enter submits the form and never toggles it.
- Tab moves through checkboxes in order.
- The indicator shows only while checked.
- A change can be cancelled.
- A controlled checkbox follows its value.
- A read-only checkbox can be focused but not changed.
- Exit keyframes keyed on data-unchecked play before the indicator unmounts.
- An infinite exit animation still unmounts the indicator.

Runs in React, Vue and web components.

Groups and parent checkboxes:

- The group is named by its label.
- Starts on its default value.
- Checking a checkbox adds its value to the group.
- Every checked value submits under the group's name, in order.
- A reset returns to the default value.
- A required group blocks submission until one is checked.

**Parent checkbox**

- Is mixed while some checkboxes are checked.
- Checks every checkbox from mixed, then unchecks them all.
- Is checked once every checkbox is.
- Submits nothing itself.

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
