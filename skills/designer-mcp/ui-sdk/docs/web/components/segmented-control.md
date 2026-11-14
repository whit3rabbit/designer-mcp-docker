# Segmented Control

Pick one of a few options from a row of buttons, with an indicator that slides to the choice.

Use a segmented control to switch between a few views or settings, like List and Grid. It works like a radio group, with one value and a single tab stop, and its indicator slides to the checked item.

```ts title="basic.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/segmented-control"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>View</ui-field-label>
      <ui-segmented-control default-value="list">
        <ui-segmented-control-indicator></ui-segmented-control-indicator>
        <ui-segmented-control-item value="list">List</ui-segmented-control-item>
        <ui-segmented-control-item value="grid">Grid</ui-segmented-control-item>
        <ui-segmented-control-item value="board">Board</ui-segmented-control-item>
      </ui-segmented-control>
    </ui-field>
  `
}

export { mount }
```

Choose Grid, then use the arrow keys to move between views. The label above names the control, as in any field.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the component, and the field if you use it, to register their elements. The import is safe on the server.

```ts
import "@ui-sdk/web/segmented-control"
import "@ui-sdk/web/field"
```

## Composition

Use the following composition to build a `ui-segmented-control`:

```text
ui-segmented-control
├── ui-segmented-control-indicator
├── ui-segmented-control-item
└── ui-segmented-control-item
```

Give each item a `value`. The control's value is the checked item's value, and the indicator sits behind that item.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/segmented-control"
</script>

<ui-segmented-control aria-label="View" default-value="list">
  <ui-segmented-control-indicator></ui-segmented-control-indicator>
  <ui-segmented-control-item value="list">List</ui-segmented-control-item>
  <ui-segmented-control-item value="grid">Grid</ui-segmented-control-item>
</ui-segmented-control>
```

Name the control with `aria-label`, or put it in a [Field](./field.md) whose label names it. Without `default-value`, nothing starts checked and Tab enters on the first enabled item.

## Indicator

`ui-segmented-control-indicator` measures the checked item. Position it inside the control and use its [CSS variables](#styling-indicator) to draw the background that slides to the choice. It measures again when an item or the control changes size, and has no box while nothing is checked.

```css
[data-slot="segmented-control"] {
  position: relative;
  display: inline-flex;
  isolation: isolate;
}

[data-slot="segmented-control-indicator"] {
  position: absolute;
  z-index: -1;
  top: var(--segmented-control-indicator-top);
  left: var(--segmented-control-indicator-left);
  width: var(--segmented-control-indicator-width);
  height: var(--segmented-control-indicator-height);
  transition-property: top, left, width, height;
  transition-duration: 200ms;
}
```

## Vertical

Set `orientation="vertical"` to stack the items. Arrow keys on both axes still move between them, as in any radio group, and `data-orientation` on every part lets one stylesheet lay out both directions.

```ts title="vertical.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/segmented-control"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Vertical alignment</ui-field-label>
      <ui-segmented-control orientation="vertical" default-value="middle">
        <ui-segmented-control-indicator></ui-segmented-control-indicator>
        <ui-segmented-control-item value="top">Top</ui-segmented-control-item>
        <ui-segmented-control-item value="middle">Middle</ui-segmented-control-item>
        <ui-segmented-control-item value="bottom">Bottom</ui-segmented-control-item>
      </ui-segmented-control>
    </ui-field>
  `
}

export { mount }
```

Choose Bottom, then press the Up arrow. The indicator follows down the column.

## Disabled

Set `disabled` on the control or on one item. Disabled items can't be focused or checked, and arrow keys skip them. A disabled control submits nothing.

```ts title="disabled.ts"
import "@ui-sdk/web/segmented-control"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-segmented-control aria-label="Theme" default-value="system" disabled>
        <ui-segmented-control-indicator></ui-segmented-control-indicator>
        <ui-segmented-control-item value="light">Light</ui-segmented-control-item>
        <ui-segmented-control-item value="dark">Dark</ui-segmented-control-item>
        <ui-segmented-control-item value="system">System</ui-segmented-control-item>
      </ui-segmented-control>
      <ui-segmented-control aria-label="Billing period" default-value="monthly">
        <ui-segmented-control-indicator></ui-segmented-control-indicator>
        <ui-segmented-control-item value="monthly">Monthly</ui-segmented-control-item>
        <ui-segmented-control-item value="yearly">Yearly</ui-segmented-control-item>
        <ui-segmented-control-item value="lifetime" disabled>Lifetime</ui-segmented-control-item>
      </ui-segmented-control>
    </div>
  `
}

export { mount }
```

The Theme control is disabled. In Billing period, Lifetime is disabled, so the arrow keys move between Monthly and Yearly.

## Controlled

Listen to `valuechange` for each change and its reason. Call `event.preventDefault()` to keep the current value. The element's `api` property has the same methods, like `api.setValue("month")` for the Show Month button below.

```ts title="controlled.ts"
import "@ui-sdk/web/segmented-control"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div>
      <div data-slot="controls">
        <button type="button">Show Month</button>
      </div>
      <ui-segmented-control aria-label="Range" default-value="week">
        <ui-segmented-control-indicator></ui-segmented-control-indicator>
        <ui-segmented-control-item value="day">Day</ui-segmented-control-item>
        <ui-segmented-control-item value="week">Week</ui-segmented-control-item>
        <ui-segmented-control-item value="month">Month</ui-segmented-control-item>
      </ui-segmented-control>
    </div>
  `
  const range = root.querySelector("ui-segmented-control")!
  range.addEventListener("valuechange", (event) => {
    const { value, reason } = event.detail
    log(root, `value: ${value} (${reason})`)
  })
  root
    .querySelector('[data-slot="controls"] button')!
    .addEventListener("click", () => range.api.setValue("month"))
}

export { mount }
```

Choose Day, then press Show Month. The console logs each change and its reason.

See [State and Events](../state-and-events.md) for controlled state, cancellation and debugging.

## Form

The control takes part in forms through `ElementInternals`. Set `name` to submit the checked value; nothing submits without a name or a checked item. `required` blocks submission until there's a choice, `form` joins a form by its id from elsewhere on the page, and a reset returns to `default-value`.

```ts title="form.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/segmented-control"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form data-slot="stack">
      <ui-field>
        <ui-field-label>Theme</ui-field-label>
        <ui-segmented-control name="theme" required default-value="system">
          <ui-segmented-control-indicator></ui-segmented-control-indicator>
          <ui-segmented-control-item value="light">Light</ui-segmented-control-item>
          <ui-segmented-control-item value="dark">Dark</ui-segmented-control-item>
          <ui-segmented-control-item value="system">System</ui-segmented-control-item>
        </ui-segmented-control>
        <ui-field-description>System follows your device's setting.</ui-field-description>
      </ui-field>
      <ui-field>
        <ui-field-label>Density</ui-field-label>
        <ui-segmented-control name="density" default-value="comfortable">
          <ui-segmented-control-indicator></ui-segmented-control-indicator>
          <ui-segmented-control-item value="compact">Compact</ui-segmented-control-item>
          <ui-segmented-control-item value="comfortable">Comfortable</ui-segmented-control-item>
        </ui-segmented-control>
      </ui-field>
      <div data-slot="row">
        <button type="submit" data-variant="solid">Save</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const data = new FormData(form)
    log(
      root,
      `Saved theme=${data.get("theme")}, density=${data.get("density")}`
    )
  })
}

export { mount }
```

Choose Dark and Compact, then press Save. The console logs both values, and Reset returns each control to its default.

## Read-Only

Set `read-only` to keep the value while still letting people focus the items. Arrow keys move focus without checking anything, and the value still submits with a form.

## Loop

Arrow keys wrap from the last item to the first. Set `loop` to `false` to stop at the ends.

```html
<ui-segmented-control aria-label="View" default-value="list" loop="false">
  ...
</ui-segmented-control>
```

## Styling

Parts are unstyled. Use `data-checked` and `data-unchecked` for the checked item, and `data-disabled`, `data-readonly` and `data-required` for the rest. `data-orientation` is on the control and the indicator.

Each part has a `data-slot`, such as `segmented-control-item`, and its state attributes are listed under [Data Attributes](#data-attributes).

### ui-segmented-control-indicator
- `--segmented-control-indicator-left`: Distance from the control's left edge to the checked item.
- `--segmented-control-indicator-right`: Distance from the control's right edge to the checked item.
- `--segmented-control-indicator-top`: Distance from the control's top edge to the checked item.
- `--segmented-control-indicator-bottom`: Distance from the control's bottom edge to the checked item.
- `--segmented-control-indicator-width`: Width of the checked item.
- `--segmented-control-indicator-height`: Height of the checked item.

## Data Attributes

### ui-segmented-control
`[data-slot="segmented-control"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the items run.
- `data-readonly`: Present when the control is read-only.
- `data-required`: Present when the control is required.
- `data-disabled`: Present when disabled, by its own prop, the control or a `<fieldset>`.

### ui-segmented-control-item
`[data-slot="segmented-control-item"]`

- `data-checked`: Present on the checked item.
- `data-readonly`: Present when the control is read-only.
- `data-required`: Present when the control is required.
- `data-unchecked`: Present on items that aren't checked.
- `data-disabled`: Present when disabled, by its own prop, the control or a `<fieldset>`.

### ui-segmented-control-indicator
`[data-slot="segmented-control-indicator"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the items run.

## API Reference

Props are attributes in kebab case, like `default-value` and `read-only`: `"false"` is
false, so `loop="false"` turns looping off. `value` is a live property and attribute. Callbacks are DOM events.

### ui-segmented-control

- `value?` (`T | null`): The checked item's value. Pass it to control the segmented control. `null` checks nothing.
- `defaultValue?` (`T | null`): The item checked at first, when uncontrolled. A form reset returns to it.
- `valuechange event`: Runs when a user or a form reset wants to change the value. `details.reason` says why, and `details.cancel()` stops it.
- `disabled?` (`boolean`): Disables every item: they can't be focused or changed, and the value isn't submitted.
- `readOnly?` (`boolean`): Keeps the items focusable and the value submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission until an item is checked, with the browser's own message.
- `name?` (`string`): The name the value submits under. Without one, the segmented control submits nothing.
- `form?` (`string`): The id of a form to belong to, when the segmented control isn't inside that form.
- `loop?` (`boolean`): Whether arrow keys wrap from the last item to the first.
- `orientation?` (`SegmentedControlOrientation`): Which way the items run, for styling and for screen readers. Arrow keys on both axes move between items either way, as in any radio group.
- `controller?` (`{ getValue: () => T | null; setValue: (value: T | null, details?: SegmentedControlChangeOptions) => boolean; focus: () => void; }`): Checks items from anywhere. Create one with `createSegmentedControlController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### ui-segmented-control-item

- `value` (`string`): What the value becomes when this item is checked.
- `disabled?` (`boolean`): Skips the item, like a disabled native radio: arrow keys pass it and it can't be focused or checked.

### State

The same state shows as data attributes on each element.

- `value` (`string | null`): The checked item's value.
- `disabled` (`boolean`): Whether the segmented control is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: arrow keys still move focus, but nothing changes the checked item.
- `required` (`boolean`): Whether a form won't submit until an item is checked.
- `orientation` (`SegmentedControlOrientation`): Which way the items run.

- `checked` (`boolean`): Whether this item is the control's value, which the indicator sits behind.
- `disabled` (`boolean`): Whether this item is disabled, by itself, the segmented control or a `<fieldset>`.
- `readOnly` (`boolean`): Whether the control is read-only, so pressing this item changes nothing.
- `required` (`boolean`): Whether a form won't submit until an item is checked.

- `value` (`string | null`): The checked item's value, which the indicator sits behind.
- `orientation` (`SegmentedControlOrientation`): Which way the items run.

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

- `getValue()` (`() => T | null`): The checked item's value.
- `setValue(value, details?)` (`(value: T | null, details?: SegmentedControlChangeOptions | undefined) => boolean`): Checks an item, as a user would. Disabled items and read-only controls ignore it.
- `focus()` (`() => void`): Moves focus to the checked item, or the first one.

### Events

Events fire on their own element and don't bubble, with the new value in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` cancels the change.

| Member                      | On                     | Description                                                        |
| --------------------------- | ---------------------- | ------------------------------------------------------------------ |
| `value` property, attribute | `ui-segmented-control` | The checked value. The attribute sets where it starts, and is live |
| `api` property              | `ui-segmented-control` | The [controller](#controller)                                      |
| `valuechange` event         | `ui-segmented-control` | `detail: { value, reason, event, source }`                         |

## Accessibility

A segmented control is a radio group, so it follows the [WAI-ARIA radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) and behaves like native radios that share a name. `ui-segmented-control-item` is the control itself, with the `radio` role, and the segmented control takes part in forms through `ElementInternals`, without hidden inputs. The indicator is presentational, so screen readers skip it.

### Keyboard

| Key        | Does                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| Tab        | Moves into the control, onto the checked item or the first enabled one |
| Arrow keys | Move to the next or previous item and check it, skipping disabled ones |
| Space      | Checks the focused item                                                |
| Enter      | Submits its form                                                       |

### Tested Behavior

Every line below is an automated test.

**Selection**

- The default item is checked, and only that one.
- Clicking an item checks it and says why.
- Clicking a disabled item does nothing.
- A change can be cancelled.
- A controller checks an item.

**Keyboard**

- Tab lands on the checked item, and the next Tab leaves.
- Arrow keys on both axes check the next item, skip disabled ones and wrap.

**Orientation**

- A segmented control is horizontal unless it says otherwise.
- A vertical segmented control reports it.

**Indicator**

- The indicator covers the checked item.
- The indicator follows the checked item.
- The indicator covers the checked item in a vertical control.
- The indicator matches items with fractional widths exactly.
- A scaled ancestor doesn't move the indicator off fractional items.
- With nothing checked, the indicator has no box.

**Forms**

- The checked value submits under the control's name.
- A form reset checks the default item again.
- A disabled control submits nothing, and its items can't be focused or checked.

Runs in React, Vue and web components.
