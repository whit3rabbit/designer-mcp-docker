# Label

Name any control with a label, and let a press on the label reach it.

A plain `<label>` only reaches inputs, buttons and selects. `ui-label` names any control by its `for`, including a radio group or a slider, and a press on the label moves focus into it.

```ts title="basic.ts"
import "@ui-sdk/web/label"
import "@ui-sdk/web/radio"

const speeds = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
  { value: "overnight", label: "Overnight" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-label for="shipping-speed">Shipping speed</ui-label>
      <ui-radio-group id="shipping-speed" default-value="standard">
        ${speeds
          .map(
            (speed) => `
              <ui-label>
                <ui-radio value="${speed.value}">
                  <ui-radio-indicator></ui-radio-indicator>
                </ui-radio>
                ${speed.label}
              </ui-label>
            `
          )
          .join("")}
      </ui-radio-group>
    </div>
  `
}

export { mount }
```

Press Shipping speed. Focus moves to the checked option, and a screen reader names the group Shipping speed.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its element. On the server the import does nothing.

```ts
import "@ui-sdk/web/label"
```

## Usage

Import the label and point its `for` at the control's `id`:

```html
<script type="module">
  import "@ui-sdk/web/label"
  import "@ui-sdk/web/radio"
</script>

<ui-label for="plan">Plan</ui-label>
<ui-radio-group id="plan" default-value="pro">
  <ui-radio value="free">Free</ui-radio>
  <ui-radio value="pro">Pro</ui-radio>
</ui-radio-group>
```

The control takes `ui-label` as its name, and a press on the label focuses it, checks it or clicks it, as a native label would.

Inside a [Field](./field.md), use `ui-field-label`, which also ties the field's description and errors to the control.

## Build Your Own

`@ui-sdk/web/label` comes with a ready-made `ui-label` element. If you'd like to build your own, with your own element name, start from the `label` primitive in `@ui-sdk/core`:

```ts title="caption-element.ts"
import { label } from "@ui-sdk/core/label"
import { createParts } from "@ui-sdk/web"

createParts(label, {
  root: { tag: "app-caption" },
})
```

```html
<app-caption for="plan">Plan</app-caption>
```

`app-caption` keeps the behavior of the ready-made `ui-label`: it names the control and reaches it on a press. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Slider

A label for a slider names its thumb, so the thumb reads as **Volume**, and a press on the label focuses it.

```ts title="slider.ts"
import "@ui-sdk/web/label"
import "@ui-sdk/web/slider"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-slider id="volume" default-value="75">
      <div data-slot="row">
        <ui-label for="volume">Volume</ui-label>
        <ui-slider-value></ui-slider-value>
      </div>
      <ui-slider-control>
        <ui-slider-track>
          <ui-slider-indicator></ui-slider-indicator>
          <ui-slider-thumb></ui-slider-thumb>
        </ui-slider-track>
      </ui-slider-control>
    </ui-slider>
  `
}

export { mount }
```

Press Volume, then use the arrow keys. The thumb moves, and a screen reader reads it as Volume.

## Switch

Point the label at a switch beside it. A press on the label turns the switch on and off.

```ts title="switch.ts"
import "@ui-sdk/web/label"
import "@ui-sdk/web/switch"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="row">
      <ui-switch id="updates">
        <ui-switch-thumb></ui-switch-thumb>
      </ui-switch>
      <ui-label for="updates">Email me product updates</ui-label>
    </div>
  `
}

export { mount }
```

Press Email me product updates. The switch turns on.

## Wrapping a Control

Put the control inside the label instead of pointing at it, and you need no `id`.

```ts title="wrap.ts"
import "@ui-sdk/web/checkbox"
import "@ui-sdk/web/label"
import { Check, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-label>
      <ui-checkbox>
        <ui-checkbox-indicator>
          ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
        </ui-checkbox-indicator>
      </ui-checkbox>
      Accept terms and conditions
    </ui-label>
  `
}

export { mount }
```

Press Accept terms and conditions. The checkbox checks, and a double click doesn't select the text.

## Styling

The label is unstyled. It has a `data-slot` of `label`.

A double click on the label doesn't select its text, so you don't need `user-select: none` for that.

## API Reference

Attributes are the same as below, along with `for`, which names the control's `id`.

### Label

- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

## Accessibility

`ui-label` names its control through `aria-labelledby`, unless the control has an `aria-label` or an `aria-labelledby` of its own, which win. Its press does what a native label's does: it checks a checkbox, a switch or a radio, focuses a group's checked radio, and focuses anything else. A press on a disabled control does nothing.

### Tested Behavior

Every line below is an automated test.

- A label names a native input, and a press focuses it.
- A label names a radio group, and a press focuses its checked radio.
- A label for a slider names its thumb, and a press focuses it.
- A label around a checkbox names it, and a press toggles it.
- A press on the label of a disabled group moves no focus.
- A control its author names keeps that name.
- A label names a control that renders after it.
- A double click on a label doesn't select its text.

Runs in React, Vue and web components.
