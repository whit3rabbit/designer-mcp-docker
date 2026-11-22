# Progress

Show a task’s progress, or an indeterminate state while its progress is unknown.

```ts title="basic.ts"
import "@ui-sdk/web/progress"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-progress value="60">
      <ui-progress-label>Exporting video</ui-progress-label>
      <ui-progress-value></ui-progress-value>
      <ui-progress-track>
        <ui-progress-indicator></ui-progress-indicator>
      </ui-progress-track>
    </ui-progress>
  `
}

export { mount }
```

Read the export bar. Its label and 60% value are available both visually and to a screen reader.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. On the server the import does nothing.

```ts
import "@ui-sdk/web/progress"
```

## Composition

Use the following composition to build a `ui-progress`:

```text
ui-progress
├── ui-progress-label
├── ui-progress-value
└── ui-progress-track
    └── ui-progress-indicator
```

- `ui-progress` holds the value and range.
- `ui-progress-label` gives it a visible name. You can use `aria-label` on the root instead.
- `ui-progress-value` displays the formatted value.
- `ui-progress-track` gives the bar its size, and `ui-progress-indicator` fills it.

The value is already part of the root's accessible description. The visible value is hidden from screen readers to avoid reading it twice.

## Usage

Import the parts and put them together:

```html
<ui-progress value="40">
  <ui-progress-label></ui-progress-label>
  <ui-progress-value></ui-progress-value>
  <ui-progress-track>
    <ui-progress-indicator></ui-progress-indicator>
  </ui-progress-track>
</ui-progress>
```

## Build Your Own

`@ui-sdk/web/progress` comes with ready-made `ui-progress` elements. If you'd like to build your own, with your own element names, start from the `progress` primitive in `@ui-sdk/core`:

```ts title="upload-elements.ts"
import { progress } from "@ui-sdk/core/progress"
import { createParts } from "@ui-sdk/web"

createParts(progress, {
  root: { tag: "upload-progress", display: "block" },
  label: "upload-label",
  value: "upload-value",
  track: { tag: "upload-track", display: "block" },
  indicator: { tag: "upload-bar", display: "block" },
})
```

```html
<upload-progress value="40">
  <upload-label>Uploading photos</upload-label>
  <upload-value>40%</upload-value>
  <upload-track>
    <upload-bar></upload-bar>
  </upload-track>
</upload-progress>
```

`ui-progress-value` fills in the formatted value for you. An element from `createParts` shows only what you put in it, so write the text yourself when you set the value, like `40%` here.

Each element keeps the behavior, state and data attributes of its ready-made counterpart: the root is the `progressbar`, and the indicator sets its width from the value. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Indeterminate

Leave out `value` when you do not know how much work is complete. Every part gets `data-indeterminate`, and the root has no `aria-valuenow`.

The indicator has no inline width in this state. This example sweeps a short highlight across the track, and shows a still, full-width fill when reduced motion is on.

```ts title="indeterminate.ts"
import "@ui-sdk/web/progress"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-progress>
      <ui-progress-label>Connecting to server</ui-progress-label>
      <ui-progress-track>
        <ui-progress-indicator></ui-progress-indicator>
      </ui-progress-track>
    </ui-progress>
  `
}

export { mount }
```

Read the Connecting to server bar. It shows an ongoing task without announcing a percentage.

## Changing the Value

Pass the latest `value` as your task progresses. The parts get `data-progressing` while the value is below `max`, and `data-complete` when it reaches the end.

```ts title="controlled.ts"
import "@ui-sdk/web/progress"
import { log } from "./log"

const total = 5

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Upload Next</button>
        <button type="button">Reset</button>
      </div>
      <ui-progress>
        <ui-progress-label>Uploading photos</ui-progress-label>
        <ui-progress-value></ui-progress-value>
        <ui-progress-track>
          <ui-progress-indicator></ui-progress-indicator>
        </ui-progress-track>
      </ui-progress>
    </div>
  `
  const progress = root.querySelector("ui-progress")!
  const [next, reset] = root.querySelectorAll("button")
  let uploaded = 1
  const show = () => {
    progress.setAttribute("value", String((uploaded / total) * 100))
    next.setAttribute("aria-disabled", String(uploaded >= total))
  }
  next.addEventListener("click", () => {
    if (uploaded >= total) {
      return
    }
    uploaded++
    show()
    log(root, `Uploaded ${uploaded} of ${total} photos`)
  })
  reset.addEventListener("click", () => {
    uploaded = 0
    show()
    log(root, "Reset to 0 photos")
  })
  show()
}

export { mount }
```

Click Upload Next to add one photo, or 20%, and watch the console count them. At 100%, the button stops advancing the bar. Click Reset to start at 0%.

Progress displays your state; it fires no `valuechange` event.

## Bounds

`min` and `max` default to 0 and 100. A value outside that range is clamped for the fill, the percentage and `aria-valuenow`, but the state's `value` and a format other than percent keep it as you passed it. A value of 3 between 1 and 5 fills half the track.

```ts title="min-max.ts"
import "@ui-sdk/web/progress"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-progress value="3" min="1" max="5">
      <ui-progress-label>Account setup, step 3 of 5</ui-progress-label>
      <ui-progress-value></ui-progress-value>
      <ui-progress-track>
        <ui-progress-indicator></ui-progress-indicator>
      </ui-progress-track>
    </ui-progress>
  `
}

export { mount }
```

Compare step 3 of 5 with the fill. Because the range starts at 1, the value is halfway through the range.

## Format and Locale

Pass `Intl.NumberFormat` options to `format` for units or decimal places. A function can return custom text, such as the time remaining.

```ts title="format.ts"
import "@ui-sdk/web/progress"

const bars = [
  {
    label: "Download",
    value: 120,
    max: 250,
    format: { style: "unit", unit: "gigabyte" },
  },
  {
    label: "Video render",
    value: 87.25,
    format: { style: "percent", maximumFractionDigits: 1 },
  },
  {
    label: "Backup",
    value: 45,
    max: 60,
    format: (minutes: number) => `${60 - minutes} min left`,
  },
  { label: "Synchronisierung", value: 40, locale: "de-DE" },
] satisfies {
  label: string
  value: number
  max?: number
  format?: Intl.NumberFormatOptions | ((value: number) => string)
  locale?: string
}[]

function mount(root: HTMLElement) {
  const items = bars.map(
    (bar) => `
      <ui-progress value="${bar.value}" ${"max" in bar ? `max="${bar.max}"` : ""} ${"locale" in bar ? `locale="${bar.locale}"` : ""}>
        <ui-progress-label>${bar.label}</ui-progress-label>
        <ui-progress-value></ui-progress-value>
        <ui-progress-track>
          <ui-progress-indicator></ui-progress-indicator>
        </ui-progress-track>
      </ui-progress>`
  )
  root.innerHTML = `<div data-slot="stack">${items.join("")}</div>`
  root
    .querySelectorAll<HTMLElement & { format?: unknown }>("ui-progress")
    .forEach((progress, index) => {
      const bar = bars[index]
      if ("format" in bar) {
        progress.format = bar.format
      }
    })
}

export { mount }
```

Compare the progress readings. They show downloaded data, a precise percentage, time remaining, and a localized percentage.

A percent format reports the value's position between `min` and `max`. Other formats use the value itself.

`locale` controls digits and separators. If you omit it, the component reads the page's language after it mounts, with the browser's language as a fallback. The initial server and client render use English.

Set `dir="rtl"` on the surrounding content to fill the track from the right.

Set `format` and `getValueLabel` as element properties because they accept objects or functions. `locale` is an attribute.

## Value Label

Use `getValueLabel` to give screen readers more context than the visible number. Its details include `formatted`, `percent`, `min`, and `max`. Handle a `null` value when the task can be indeterminate; `percent` is also `null` and `formatted` is empty then.

```ts title="value-label.ts"
import type { GaugeLabelDetails } from "@ui-sdk/core/progress"
import "@ui-sdk/web/progress"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-progress value="3" max="12">
      <ui-progress-label>Copying files</ui-progress-label>
      <ui-progress-value>3 of 12</ui-progress-value>
      <ui-progress-track>
        <ui-progress-indicator></ui-progress-indicator>
      </ui-progress-track>
    </ui-progress>
  `
  const progress = root.querySelector("ui-progress") as HTMLElement & {
    getValueLabel: (value: number | null, details: GaugeLabelDetails) => string
  }
  progress.getValueLabel = (value, details) =>
    `${value} of ${details.max} files, ${details.formatted}`
}

export { mount }
```

Read Copying files with a screen reader. It announces 3 of 12 files and 25%, while the visible value stays compact.

Use [Meter](./meter.md) for a reading such as storage used, rather than a task that will finish.

## Custom Rendering

See [Parts and Composition](../parts-and-composition.md) for choosing the elements parts bind. Use `format` for text that should be shared by the visible value and screen readers.

## Styling

Give the track a height, background, and width. The indicator sets its width as an inline percentage of the track. Style `data-indeterminate` for a task whose progress is unknown, since the indicator has no width then, and `data-complete` once the task finishes. Both styling options are shown in each example's Code tab.

Each part has a `data-slot`, such as `progress-indicator`, and its state attributes are listed under [Data Attributes](#data-attributes).

### `<ui-progress>`
The root exposes a CSS variable for positioning other content alongside the reading.

- `--progress-value`: Where the value sits between `min` and `max`, as a percentage, like 40%. Unset while indeterminate.

## Data Attributes

### `<ui-progress>`
`[data-slot="progress"]`

- `data-indeterminate`: Present while the value is null: the task is under way, but how far is unknown.
- `data-progressing`: Present while the value is below `max`.
- `data-complete`: Present once the value reaches `max`.

### `<ui-progress-label>`
`[data-slot="progress-label"]`

- `data-indeterminate`: Present while the value is null: the task is under way, but how far is unknown.
- `data-progressing`: Present while the value is below `max`.
- `data-complete`: Present once the value reaches `max`.

### `<ui-progress-value>`
`[data-slot="progress-value"]`

- `data-indeterminate`: Present while the value is null: the task is under way, but how far is unknown.
- `data-progressing`: Present while the value is below `max`.
- `data-complete`: Present once the value reaches `max`.

### `<ui-progress-track>`
`[data-slot="progress-track"]`

- `data-indeterminate`: Present while the value is null: the task is under way, but how far is unknown.
- `data-progressing`: Present while the value is below `max`.
- `data-complete`: Present once the value reaches `max`.

### `<ui-progress-indicator>`
`[data-slot="progress-indicator"]`

- `data-indeterminate`: Present while the value is null: the task is under way, but how far is unknown.
- `data-progressing`: Present while the value is below `max`.
- `data-complete`: Present once the value reaches `max`.

## API Reference

Props are attributes, like `value`, `min`, `max` and `locale`. `format` and `getValueLabel` are properties.

### Progress

- `min?` (`number`): The lowest value.
- `max?` (`number`): The highest value.
- `format?` (`NumberFormat`): How the value reads, for screen readers and the Value part: `Intl.NumberFormat` options, or a function of the value. A percent style shows where the value sits between `min` and `max`; any other style shows the value itself, like `{ style: "unit", unit: "gigabyte" }`.
- `locale?` (`string`): The locale the value is formatted in. Defaults to the page's `lang`, or the browser's language without one, once the page is interactive. Server markup uses English until then, so it never disagrees with the client.
- `getValueLabel?` (`((value: number | null, details: GaugeLabelDetails<number | null>) => string)`): The text screen readers announce for the value, when the formatted value says too little, like "3 of 12 files". It receives the value, null while a progress bar is indeterminate, and details: the `formatted` value, its `percent`, `min` and `max`.
- `value?` (`number | null`): How far the task has come, between `min` and `max`. Null means it's under way but how far is unknown, and the bar is indeterminate.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

The same state shows as data attributes on each element.

- `value` (`number | null`): The value, or null while indeterminate.
- `percent` (`number | null`): Where the value sits between `min` and `max`, from 0 to 100, or null while indeterminate.
- `status` (`ProgressStatus`): Whether the progress is unknown, under way, or done.

`ui-progress-value` adds the formatted text:

- `value` (`number | null`): The value, or null while indeterminate.
- `percent` (`number | null`): Where the value sits between `min` and `max`, from 0 to 100, or null while indeterminate.
- `status` (`ProgressStatus`): Whether the progress is unknown, under way, or done.
- `text` (`string`): The formatted value, like "40%". Empty while indeterminate.

## Accessibility

Name the component with `ui-progress-label` or `aria-label`. It exposes the range and formatted value through the `progressbar` role. Use `getValueLabel` when that value needs more explanation.

### Tested Behavior

Every line below is an automated test.

- A progress bar is named by its label and reads its value.
- The value part shows the formatted value.
- The indicator is as wide as the value.
- A new value updates the bar.
- Every part says whether the task is under way, done, or unknown.
- An indeterminate bar has no value.
- A unit format reads the value itself.
- A value label replaces the formatted value for screen readers.
- A value above the maximum reads as the maximum.

Runs in React, Vue and web components.
