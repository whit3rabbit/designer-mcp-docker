# Meter

Show a measurement within a known range, such as storage used or an account quota.

Use a Meter for a value within a known range, such as storage used, a battery level or an account quota. It fills a track to show the value, and screen readers announce the same value.

```ts title="basic.ts"
import "@ui-sdk/web/meter"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-meter value="68">
      <ui-meter-label>Storage used</ui-meter-label>
      <ui-meter-value></ui-meter-value>
      <ui-meter-track>
        <ui-meter-indicator></ui-meter-indicator>
      </ui-meter-track>
    </ui-meter>
  `
}

export { mount }
```

Read the storage meter. The label names it, and both the visible value and screen reader value report 68%.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. On the server the import does nothing.

```ts
import "@ui-sdk/web/meter"
```

## Composition

Use the following composition to build a `ui-meter`:

```text
ui-meter
├── ui-meter-label
├── ui-meter-value
└── ui-meter-track
    └── ui-meter-indicator
```

- `ui-meter` holds the value and range.
- `ui-meter-label` gives it a visible name. You can use `aria-label` on the root instead.
- `ui-meter-value` displays the formatted value.
- `ui-meter-track` gives the bar its size, and `ui-meter-indicator` fills it.

The value is already part of the root's accessible description. The visible value is hidden from screen readers to avoid reading it twice.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/meter"
</script>

<ui-meter value="40">
  <ui-meter-label></ui-meter-label>
  <ui-meter-value></ui-meter-value>
  <ui-meter-track>
    <ui-meter-indicator></ui-meter-indicator>
  </ui-meter-track>
</ui-meter>
```

## Build Your Own

`@ui-sdk/web/meter` comes with ready-made `ui-meter` elements. If you'd like to build your own, with your own element names, start from the `meter` primitive in `@ui-sdk/core`:

```ts title="quota-elements.ts"
import { meter } from "@ui-sdk/core/meter"
import { createParts } from "@ui-sdk/web"

createParts(meter, {
  root: { tag: "quota-meter", display: "block" },
  label: "quota-label",
  value: "quota-value",
  track: { tag: "quota-track", display: "block" },
  indicator: { tag: "quota-fill", display: "block" },
})
```

```html
<quota-meter value="68">
  <quota-label>Storage</quota-label>
  <quota-value>68%</quota-value>
  <quota-track>
    <quota-fill></quota-fill>
  </quota-track>
</quota-meter>
```

`ui-meter-value` fills in the formatted value for you. An element from `createParts` shows only what you put in it, so write the text yourself when you set the value, like `68%` here.

Each element keeps the behavior, state and data attributes of its ready-made counterpart: the root is the `meter`, and the indicator sets its width from the value. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Bounds

`min` and `max` set the range. They default to 0 and 100. A value outside the range is clamped for the fill, the percentage and `aria-valuenow`, but the state's `value` and a format other than percent keep it as you passed it. Here, 720 sits about 76% of the way from 300 to 850. Decimal formatting keeps the visible value as 720.

```ts title="min-max.ts"
import type { UiMeterElement } from "@ui-sdk/web"
import "@ui-sdk/web/meter"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-meter value="720" min="300" max="850">
      <ui-meter-label>Credit score</ui-meter-label>
      <ui-meter-value></ui-meter-value>
      <ui-meter-track>
        <ui-meter-indicator></ui-meter-indicator>
      </ui-meter-track>
    </ui-meter>
  `
  const meter = root.querySelector("ui-meter") as UiMeterElement
  meter.format = { style: "decimal" }
}

export { mount }
```

Compare the score with the filled track. The number shows 720; the fill shows its position between 300 and 850.

## Format and Locale

Pass `Intl.NumberFormat` options to `format` for units, currency, or decimal places. A function can return custom text, such as the number of occupied seats.

```ts title="format.ts"
import type { UiMeterElement } from "@ui-sdk/web"
import "@ui-sdk/web/meter"

const meters = [
  {
    label: "Storage",
    value: 120,
    max: 250,
    format: { style: "unit", unit: "gigabyte" },
  },
  {
    label: "Budget",
    value: 1840,
    max: 2500,
    format: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
  },
  {
    label: "Seats",
    value: 18,
    max: 25,
    format: (seats: number) => `${seats} of 25 seats`,
  },
  { label: "Auslastung", value: 40, locale: "de-DE" },
] satisfies {
  label: string
  value: number
  max?: number
  format?: Intl.NumberFormatOptions | ((value: number) => string)
  locale?: string
}[]

function mount(root: HTMLElement) {
  const items = meters.map(
    (meter) => `
      <ui-meter value="${meter.value}" ${"max" in meter ? `max="${meter.max}"` : ""} ${"locale" in meter ? `locale="${meter.locale}"` : ""}>
        <ui-meter-label>${meter.label}</ui-meter-label>
        <ui-meter-value></ui-meter-value>
        <ui-meter-track>
          <ui-meter-indicator></ui-meter-indicator>
        </ui-meter-track>
      </ui-meter>`
  )
  root.innerHTML = `<div data-slot="stack">${items.join("")}</div>`
  root
    .querySelectorAll<UiMeterElement>("ui-meter")
    .forEach((element, index) => {
      const meter = meters[index]
      if ("format" in meter) {
        element.format = meter.format
      }
    })
}

export { mount }
```

Compare the readings. Each meter formats its own value as a unit, currency, custom text, or localized percentage.

A percent format reports the value's position between `min` and `max`. Other formats use the value itself.

`locale` controls digits and separators. If you omit it, the component reads the page's language after it mounts, with the browser's language as a fallback. The initial server and client render use English.

Set `dir="rtl"` on the surrounding content to fill the track from the right.

Set `format` and `getValueLabel` as element properties because they accept objects or functions. `locale` is an attribute.

## Value Label

Use `getValueLabel` when a screen reader needs more context than the visible number. It receives the value and details containing `formatted`, `percent`, `min`, and `max`.

```ts title="value-label.ts"
import type { UiMeterElement } from "@ui-sdk/web"
import "@ui-sdk/web/meter"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-meter value="750" max="1000">
      <ui-meter-label>API requests</ui-meter-label>
      <ui-meter-value>750 / 1,000</ui-meter-value>
      <ui-meter-track>
        <ui-meter-indicator></ui-meter-indicator>
      </ui-meter-track>
    </ui-meter>
  `
  const meter = root.querySelector("ui-meter") as UiMeterElement
  meter.getValueLabel = (value, details) =>
    `${value} of ${details.max} requests, ${details.formatted}`
}

export { mount }
```

Read API requests with a screen reader. It announces 750 of 1000 requests and 75%, while the visible value stays compact.

## Changing the Value

Pass a new `value` when your reading changes. Meter follows your state and has no `valuechange` event.

Use [Progress](./progress.md) for a task that is working toward completion, such as an upload.

## Custom Rendering

See [Parts and Composition](../parts-and-composition.md) for choosing the elements parts bind. Use `format` for text that should be shared by the visible value and screen readers.

## Styling

Give the track a height, background, and width. The indicator sets its width as an inline percentage of the track. Both styling options are shown in each example's Code tab.

Each part has a `data-slot`, such as `meter-indicator`, and no state attributes: the reading is in `--meter-value` and the indicator's width.

### `<ui-meter>`
The root exposes a CSS variable for positioning other content alongside the reading.

- `--meter-value`: Where the value sits between `min` and `max`, as a percentage, like 40%.

## API Reference

Props are attributes, like `value`, `min`, `max` and `locale`. `format` and `getValueLabel` are properties.

### Meter

- `min?` (`number`): The lowest value.
- `max?` (`number`): The highest value.
- `format?` (`NumberFormat`): How the value reads, for screen readers and the Value part: `Intl.NumberFormat` options, or a function of the value. A percent style shows where the value sits between `min` and `max`; any other style shows the value itself, like `{ style: "unit", unit: "gigabyte" }`.
- `locale?` (`string`): The locale the value is formatted in. Defaults to the page's `lang`, or the browser's language without one, once the page is interactive. Server markup uses English until then, so it never disagrees with the client.
- `getValueLabel?` (`((value: number, details: GaugeLabelDetails<number>) => string)`): The text screen readers announce for the value, when the formatted value says too little, like "3 of 12 files". It receives the value, null while a progress bar is indeterminate, and details: the `formatted` value, its `percent`, `min` and `max`.
- `value` (`number`): The reading, between `min` and `max`. Outside them, the fill, the percentage and `aria-valuenow` are clamped, while the state keeps the value as given. A meter always has a value, since there's no busy state.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

The root shows the value in `aria-valuenow` and the `--meter-value` variable.

- `value` (`number`): The value, as given.
- `percent` (`number`): Where the value sits between `min` and `max`, from 0 to 100.

`ui-meter-value` adds the formatted text:

- `value` (`number`): The value, as given.
- `percent` (`number`): Where the value sits between `min` and `max`, from 0 to 100.
- `text` (`string`): The formatted value, like "40%".

## Accessibility

Name the component with `ui-meter-label` or `aria-label`. It exposes the range and formatted value through the `meter` role. Use `getValueLabel` when that value needs more explanation.

### Tested Behavior

Every line below is an automated test.

- A meter is named by its label and reads its value.
- The value part shows the formatted value.
- The indicator is as wide as the value.
- A new value updates the meter.
- Min and max set where the value sits.
- A unit format reads the value itself.
- A value label replaces the formatted value for screen readers.
- A value above the maximum reads as the maximum and fills the track.

Runs in React, Vue and web components.
