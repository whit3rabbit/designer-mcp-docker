# Waterfall

Show a trace or a page's requests as bars on a shared time axis, with spans that expand to show what they started.

Use a Waterfall for anything with a start and a duration that nests: a browser's network requests, an OpenTelemetry trace, the steps of a build. Each span is a row with its own bar, placed on one time axis, and screen reader and keyboard users get a treegrid they can walk span by span.

```ts title="network.ts"
import type { WaterfallData } from "@ui-sdk/core/waterfall"
import "@ui-sdk/web/waterfall"

const requests: WaterfallData = [
  { value: "document", label: "/", start: 0, duration: 182 },
  { value: "styles", label: "app.css", start: 190, duration: 96 },
  { value: "script", label: "app.js", start: 192, duration: 410 },
  { value: "font", label: "inter.woff2", start: 300, duration: 220 },
  { value: "user", label: "api/user", start: 610, duration: 240 },
  { value: "avatar", label: "avatar.png", start: 860, duration: 150 },
]

const sizes: Record<string, string> = {
  document: "14 kB",
  styles: "8 kB",
  script: "212 kB",
  font: "48 kB",
  user: "1 kB",
  avatar: "36 kB",
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-waterfall aria-label="Network requests">
      <ui-waterfall-header-row>
        <ui-waterfall-column-header>Name</ui-waterfall-column-header>
        <ui-waterfall-column-header>Size</ui-waterfall-column-header>
        <ui-waterfall-column-header aria-label="Timeline">
          <ui-waterfall-axis max-ticks="5"></ui-waterfall-axis>
          <ui-waterfall-mark time="620">DOMContentLoaded</ui-waterfall-mark>
        </ui-waterfall-column-header>
      </ui-waterfall-header-row>
      ${requests
        .map(
          (request) => `
            <ui-waterfall-row value="${request.value}">
              <ui-waterfall-row-header>${request.label}</ui-waterfall-row-header>
              <ui-waterfall-cell>${sizes[request.value]}</ui-waterfall-cell>
              <ui-waterfall-bar></ui-waterfall-bar>
            </ui-waterfall-row>`
        )
        .join("")}
    </ui-waterfall>
  `
  const waterfall = root.querySelector("ui-waterfall")!
  waterfall.getBarLabel = (request, { start, duration }) =>
    `${sizes[request.value]}, starts at ${start}, takes ${duration}`
  waterfall.items = requests
}

export { mount }
```

Use the arrow keys to move between requests. Press Right to move into a row's cells, where each bar reads out when its request starts and how long it takes.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. On the server the import does nothing.

```ts
import "@ui-sdk/web/waterfall"
```

## Composition

Use the following composition to build a `ui-waterfall`:

```text
ui-waterfall
├── ui-waterfall-header-row
│   ├── ui-waterfall-column-header
│   └── ui-waterfall-column-header
│       ├── ui-waterfall-axis
│       │   └── ui-waterfall-tick
│       └── ui-waterfall-mark
├── ui-waterfall-row
│   ├── ui-waterfall-row-header
│   │   └── ui-waterfall-indicator
│   ├── ui-waterfall-cell
│   └── ui-waterfall-bar
└── ui-waterfall-row
    ├── ui-waterfall-row-header
    └── ui-waterfall-bar
```

Pass every span as `items` and write a `ui-waterfall-row` for each with the span's `value`. The rows are flat siblings: the waterfall reads each one's level, place among its siblings and children from `items`. Give the waterfall an accessible name.

`ui-waterfall-row-header` names the span, and holds the `ui-waterfall-indicator` of a span with children. `ui-waterfall-bar` is the cell on the time axis. `ui-waterfall-cell` is any other column, like a status or a size. The header row, the axis and marks are optional.

## Usage

Each span has a `value`, a `label`, a `start` and a `duration` in milliseconds, and the spans it started as `children`. Set them as the `items` property:

```html
<ui-waterfall aria-label="Network requests">
  <ui-waterfall-row value="document">
    <ui-waterfall-row-header>/</ui-waterfall-row-header>
    <ui-waterfall-bar></ui-waterfall-bar>
  </ui-waterfall-row>
  <ui-waterfall-row value="script">
    <ui-waterfall-row-header>app.js</ui-waterfall-row-header>
    <ui-waterfall-bar></ui-waterfall-bar>
  </ui-waterfall-row>
</ui-waterfall>

<script type="module">
  import "@ui-sdk/web/waterfall"

  document.querySelector("ui-waterfall").items = [
    { value: "document", label: "/", start: 0, duration: 182 },
    { value: "script", label: "app.js", start: 192, duration: 410 },
  ]
</script>
```

Every row sets `--waterfall-start` and `--waterfall-size`, where its span begins and how much of the axis it covers, as percentages. Place the bar with them in plain CSS, with no layout in JavaScript:

```css
[data-slot="waterfall-bar"] {
  position: relative;
}

[data-slot="waterfall-bar"]::before {
  content: "";
  position: absolute;
  inset-block: 6px;
  inset-inline-start: var(--waterfall-start);
  width: var(--waterfall-size);
  background: steelblue;
}
```

With no `ui-waterfall-row` elements of its own, the waterfall renders a row for every span, with its header and bar, from a `<template>` inside it when it has one.

## Network Requests

The first example adds a header row. `ui-waterfall-axis` renders a `ui-waterfall-tick` at round times, at most `max-ticks` of them, while it's left empty, and `ui-waterfall-mark` draws a moment across every row, like DOMContentLoaded, placed by `--waterfall-mark`. The axis is hidden from screen readers, who hear each bar's own times instead. The `getBarLabel` property changes what a bar says; this one adds the request's size.

## Nested Spans

Spans with `children` expand and collapse. Click a span's indicator, or press Right and Left on its row. This example writes every row, and the waterfall hides the ones inside a collapsed span: rows it hides get `hidden`.

Clicking a row, or pressing Enter or Space on it, selects it. The `value` property and the `valuechange` event hold the selected span, like the one a details panel shows. The `format` property changes how times read, here as narrow milliseconds.

```ts title="trace.ts"
import type { WaterfallData, WaterfallDataItem } from "@ui-sdk/core/waterfall"
import "@ui-sdk/web/waterfall"
import { ChevronRight, createElement } from "lucide"
import { log } from "./log"

const trace: WaterfallData = [
  {
    value: "checkout",
    label: "POST /checkout",
    start: 0,
    duration: 920,
    children: [
      { value: "auth", label: "auth.verify", start: 12, duration: 64 },
      {
        value: "cart",
        label: "cart.load",
        start: 80,
        duration: 310,
        children: [
          {
            value: "cart-db",
            label: "db.query carts",
            start: 96,
            duration: 140,
          },
          {
            value: "prices",
            label: "pricing.quote",
            start: 240,
            duration: 136,
          },
        ],
      },
      {
        value: "payment",
        label: "payments.charge",
        start: 400,
        duration: 470,
        children: [
          { value: "fraud", label: "fraud.score", start: 410, duration: 120 },
          {
            value: "gateway",
            label: "gateway.capture",
            start: 540,
            duration: 310,
          },
        ],
      },
      { value: "email", label: "email.enqueue", start: 880, duration: 30 },
    ],
  },
]

function rows(items: WaterfallDataItem[]): string {
  return items
    .map(
      (item) => `
        <ui-waterfall-row value="${item.value}">
          <ui-waterfall-row-header>
            ${
              item.children
                ? `<ui-waterfall-indicator>${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</ui-waterfall-indicator>`
                : ""
            }
            ${item.label}
          </ui-waterfall-row-header>
          <ui-waterfall-bar></ui-waterfall-bar>
        </ui-waterfall-row>
        ${rows(item.children ?? [])}`
    )
    .join("")
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Expand All</button>
        <button type="button">Collapse All</button>
      </div>
      <ui-waterfall aria-label="Checkout trace" default-expanded="checkout">
        <ui-waterfall-header-row>
          <ui-waterfall-column-header>Span</ui-waterfall-column-header>
          <ui-waterfall-column-header aria-label="Timeline">
            <ui-waterfall-axis></ui-waterfall-axis>
          </ui-waterfall-column-header>
        </ui-waterfall-header-row>
        ${rows(trace)}
      </ui-waterfall>
    </div>
  `
  const waterfall = root.querySelector("ui-waterfall")!
  const [expand, collapse] = root.querySelectorAll("button")
  waterfall.format = {
    style: "unit",
    unit: "millisecond",
    unitDisplay: "narrow",
  }
  waterfall.items = trace
  expand.addEventListener("click", () => waterfall.api.expandAll())
  collapse.addEventListener("click", () => waterfall.api.collapseAll())
  waterfall.addEventListener("valuechange", (event) =>
    log(root, `Selected ${event.detail.value}`)
  )
}

export { mount }
```

Expand payments.charge with Right, then press Enter on gateway.capture. The console logs the selected span. Collapse All closes every span.

To write only the rows that show, pass the `expanded` property to `visibleWaterfallRows(items, expanded)` on each `expandedchange`, which flattens the open spans in order. The Large Traces example does.

## Zoom

The `range` property sets the stretch of time the axis shows, as `[start, end]`. Change it to zoom or pan: the bars and ticks follow, and a bar outside the range shrinks to its edge. Without it, the axis runs from the earliest start to the latest end.

Write `ui-waterfall-tick` elements in the axis for ticks of your own: an empty one shows its time.

```ts title="zoom.ts"
import type { WaterfallData } from "@ui-sdk/core/waterfall"
import "@ui-sdk/web/waterfall"
import { ChevronRight, createElement } from "lucide"

const trace: WaterfallData = [
  {
    value: "render",
    label: "render /dashboard",
    start: 0,
    duration: 1200,
    children: [
      { value: "session", label: "session", start: 20, duration: 80 },
      { value: "metrics", label: "metrics", start: 110, duration: 640 },
      { value: "alerts", label: "alerts", start: 110, duration: 260 },
      { value: "html", label: "stream html", start: 760, duration: 420 },
    ],
  },
]

const spans = [trace[0], ...trace[0].children!]
const full: [number, number] = [0, 1200]

function zoomed([start, end]: [number, number], factor: number) {
  const center = (start + end) / 2
  const half = Math.min(((end - start) * factor) / 2, full[1] / 2)
  const from = Math.min(Math.max(full[0], center - half), full[1] - half * 2)
  return [from, from + half * 2] as [number, number]
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Zoom In</button>
        <button type="button">Zoom Out</button>
        <button type="button">Reset</button>
      </div>
      <ui-waterfall aria-label="Dashboard render" default-expanded="render" default-value="metrics">
        <ui-waterfall-header-row>
          <ui-waterfall-column-header>Span</ui-waterfall-column-header>
          <ui-waterfall-column-header aria-label="Timeline">
            <ui-waterfall-axis></ui-waterfall-axis>
          </ui-waterfall-column-header>
        </ui-waterfall-header-row>
        ${spans
          .map(
            (span) => `
              <ui-waterfall-row value="${span.value}">
                <ui-waterfall-row-header>
                  ${
                    span.children
                      ? `<ui-waterfall-indicator>${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</ui-waterfall-indicator>`
                      : ""
                  }
                  ${span.label}
                </ui-waterfall-row-header>
                <ui-waterfall-bar></ui-waterfall-bar>
              </ui-waterfall-row>`
          )
          .join("")}
      </ui-waterfall>
    </div>
  `
  const waterfall = root.querySelector("ui-waterfall")!
  const [zoomIn, zoomOut, reset] = root.querySelectorAll("button")
  let range = full
  const show = (next: [number, number]) => {
    range = next
    waterfall.range = range
  }
  waterfall.items = trace
  show(full)
  zoomIn.addEventListener("click", () => show(zoomed(range, 0.5)))
  zoomOut.addEventListener("click", () => show(zoomed(range, 2)))
  reset.addEventListener("click", () => show(full))
}

export { mount }
```

Press Zoom In twice. The axis shows smaller steps, and the metrics span stretches past the edges.

## Large Traces

A trace can have thousands of spans. Render only the rows in view: flatten the open spans with `visibleWaterfallRows`, and render the nearby rows at their offsets. The waterfall still reports every row's level and place among its siblings, so screen readers hear the whole hierarchy. Give the waterfall `aria-rowcount` with the number of rows that show, and each row `aria-rowindex` with its index plus one, so a screen reader counts rows in the whole trace, not just the ones in the page.

The `highlight` event reports the index of the row the keyboard moves to. Scroll it into view there, so a row that isn't rendered yet takes focus once it is. An arrow key changes only the two rows it moves between, however long the trace is.

```ts title="virtualized.ts"
import {
  visibleWaterfallRows,
  type WaterfallData,
} from "@ui-sdk/core/waterfall"
import "@ui-sdk/web/waterfall"
import { ChevronRight, createElement } from "lucide"

const trace: WaterfallData = Array.from({ length: 2000 }, (_, job) => ({
  value: `job-${job + 1}`,
  label: `job ${job + 1}`,
  start: job * 4,
  duration: 60,
  children: Array.from({ length: 4 }, (_, step) => ({
    value: `job-${job + 1}/step-${step + 1}`,
    label: `step ${step + 1}`,
    start: job * 4 + step * 15,
    duration: 15,
  })),
}))

const row = 32
const height = 288

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="scroll">
      <ui-waterfall aria-label="Build trace" default-expanded="job-1"></ui-waterfall>
    </div>
  `
  const scroller = root.querySelector("div")!
  const waterfall = root.querySelector("ui-waterfall")!

  let rows = visibleWaterfallRows(trace, ["job-1"])

  const rendered = new Map<string, HTMLElement>()
  const render = () => {
    waterfall.style.height = `${rows.length * row}px`
    waterfall.setAttribute("aria-rowcount", String(rows.length))
    const start = Math.max(0, Math.floor(scroller.scrollTop / row) - 4)
    const end = Math.min(
      rows.length,
      Math.ceil((scroller.scrollTop + height) / row) + 4
    )
    const visible = new Map(
      rows.slice(start, end).map((entry) => [entry.item.value, entry])
    )
    for (const [value, el] of rendered) {
      if (visible.has(value)) {
        continue
      }
      el.remove()
      rendered.delete(value)
    }
    for (const [value, { item, index }] of visible) {
      let el = rendered.get(value)
      if (!el) {
        waterfall.insertAdjacentHTML(
          "beforeend",
          `<ui-waterfall-row value="${item.value}">
            <ui-waterfall-row-header>
              ${
                item.children
                  ? `<ui-waterfall-indicator>${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</ui-waterfall-indicator>`
                  : ""
              }
              ${item.label}
            </ui-waterfall-row-header>
            <ui-waterfall-bar></ui-waterfall-bar>
          </ui-waterfall-row>`
        )
        el = waterfall.lastElementChild as HTMLElement
        rendered.set(value, el)
      }
      el.style.top = `${index * row}px`
      el.setAttribute("aria-rowindex", String(index + 1))
    }
  }
  render()
  waterfall.range = [0, 400]
  waterfall.items = trace
  scroller.addEventListener("scroll", render)
  waterfall.addEventListener("expandedchange", (event) => {
    rows = visibleWaterfallRows(trace, event.detail.value)
    render()
  })
  waterfall.addEventListener("highlight", (event) => {
    const { index } = event.detail
    const top = index * row
    if (top < scroller.scrollTop) {
      scroller.scrollTop = top
    } else if (top + row > scroller.scrollTop + scroller.clientHeight) {
      scroller.scrollTop = top + row - scroller.clientHeight
    }
    render()
  })
}

export { mount }
```

Press End to focus job 2000, or Page Down to move a page at a time. The trace has 10,000 spans, but only nearby rows render.

## Controlled

Selection and expanded spans are independent:

| Value      | Shape                    | Change Notification |
| ---------- | ------------------------ | ------------------- |
| `value`    | A string or `null`.      | `valuechange`       |
| `expanded` | An array of span values. | `expandedchange`    |

Read or set these properties on the element, and listen to their change events, or use `default-value` and `default-expanded` for starting state. Call `event.preventDefault()` in a change event to reject a change. [State and Events](../state-and-events.md) covers the shared binding pattern.

## Controller

The element's `api` can expand or collapse spans, change the selection, or focus a row. `reveal(value)` opens a span's ancestors and focuses its row. The Nested Spans example calls `api.expandAll()` and `api.collapseAll()` for Expand All and Collapse All. See [Controllers](../controllers.md) for setup and lifecycle.

## Custom Rendering

Elements have no render functions. Bind a part to an element of your own with `as-child`, or put anything inside it and show it from the part's data attributes. See [Parts and Composition](../parts-and-composition.md) for binding your own element.

## Styling

Style a row's state from its `data-selected`, `data-expanded`, `data-branch` and `data-level`, which its header, indicator, cells and bar carry too. Focus moves between rows and cells, so style a focused one with `:focus-visible`. Indent a row's header with `--waterfall-level`, and place its bar with `--waterfall-start` and `--waterfall-size`.

Each part has a `data-slot`, such as `waterfall-row`, and its state attributes are listed under [Data Attributes](#data-attributes).

### `<ui-waterfall-tick>`
- `--waterfall-tick`: Where the tick's time sits on the axis, as a percentage. Use it for `inset-inline-start`.

### `<ui-waterfall-mark>`
- `--waterfall-mark`: Where the mark's time sits on the axis, as a percentage. Use it for `inset-inline-start`.

### `<ui-waterfall-row>`
- `--waterfall-level`: The span's depth, from 1 at the top level. Use it to indent the row's header.
- `--waterfall-start`: Where the span starts on the axis, as a percentage, clamped to the range. Use it for the bar's `inset-inline-start`.
- `--waterfall-size`: How much of the axis the span covers, as a percentage. Use it for the bar's width. Zero for a span outside the range.

## Data Attributes

### `<ui-waterfall-mark>`
`[data-slot="waterfall-mark"]`

- `data-outside`: Present while the mark's time is outside the range, so it doesn't show on the axis.

### `<ui-waterfall-row>`
`[data-slot="waterfall-row"]`

- `data-level` (`1`, `2`): The span's depth, from 1 at the top level. Also in the `--waterfall-level` variable.
- `data-branch`: Present on a span with children.
- `data-expanded`: Present while a span with children is expanded.
- `data-selected`: Present on the selected span's row and its parts.

### `<ui-waterfall-row-header>`
`[data-slot="waterfall-row-header"]`

- `data-level` (`1`, `2`): The span's depth, from 1 at the top level. Also in the `--waterfall-level` variable.
- `data-branch`: Present on a span with children.
- `data-expanded`: Present while a span with children is expanded.
- `data-selected`: Present on the selected span's row and its parts.

### `<ui-waterfall-indicator>`
`[data-slot="waterfall-indicator"]`

- `data-level` (`1`): The span's depth, from 1 at the top level. Also in the `--waterfall-level` variable.
- `data-branch`: Present on a span with children.
- `data-expanded`: Present while a span with children is expanded.

### `<ui-waterfall-cell>`
`[data-slot="waterfall-cell"]`

- `data-level` (`1`, `2`): The span's depth, from 1 at the top level. Also in the `--waterfall-level` variable.
- `data-branch`: Present on a span with children.
- `data-expanded`: Present while a span with children is expanded.
- `data-selected`: Present on the selected span's row and its parts.

### `<ui-waterfall-bar>`
`[data-slot="waterfall-bar"]`

- `data-level` (`1`, `2`): The span's depth, from 1 at the top level. Also in the `--waterfall-level` variable.
- `data-branch`: Present on a span with children.
- `data-expanded`: Present while a span with children is expanded.
- `data-selected`: Present on the selected span's row and its parts.

## API Reference

Props are attributes in kebab case, like `default-value` and `max-ticks`. Lists, like `expanded`, are values separated by commas. `items`, `range`, `format`, `getBarLabel` and `controller` are properties. Callbacks are DOM events on `<ui-waterfall>` that don't bubble, with the new state in `event.detail.value` and the `reason` and `event` beside it.

### Waterfall

- `items` (`WaterfallData`): The spans, each with a `value`, a `label`, a `start`, a `duration` and the spans it started as `children`.
- `range?` (`[number, number]`): The stretch of time the axis shows, as `[start, end]` in milliseconds. Bars outside it shrink to its edges. Change it to zoom or pan.
- `value?` (`string | null`): The selected span's value. Pass it to control the selection. `null` selects nothing.
- `defaultValue?` (`string | null`): The span selected at first, when uncontrolled.
- `valuechange event`: Runs when the selection wants to change. `details.reason` says why, and `details.cancel()` stops it.
- `expanded?` (`string[]`): The expanded spans' values. Pass it to control which spans show their children.
- `defaultExpanded?` (`string[]`): The spans expanded at first, when uncontrolled.
- `expandedchange event`: Runs when spans want to expand or collapse. `details.reason` says why, and `details.cancel()` stops it.
- `highlight event`: Runs when the keyboard moves focus to a row, with its place among the rows that show, from 0. A waterfall that renders only the rows in view scrolls that row into view here, so it can take focus once it renders.
- `format?` (`NumberFormat`): How times read on the axis and to screen readers: `Intl.NumberFormat` options for a number of milliseconds, or a function of it.
- `locale?` (`string`): The locale times are formatted in. Defaults to the page's `lang`, or the browser's language without one, once the page is interactive. Server markup uses English until then, so it never disagrees with the client.
- `getBarLabel?` (`((item: WaterfallDataItem, details: WaterfallBarLabelDetails) => string)`): What screen readers hear for a span's bar. Set it in the page's language.
- `controller?` (`object`): Drives the waterfall from anywhere. Create one with `createWaterfallController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### WaterfallAxis

- `maxTicks?` (`number`): The most ticks the axis shows. Ticks fall on round times, so it may show fewer.

### WaterfallTick and WaterfallMark

- `time` (`number`): The moment it marks, in milliseconds.

### WaterfallRow

- `value` (`string`): The value of the span the row shows.

### Items as Data

Each span in `items`:

- `value` (`string`): Identifies the span. Unique in the waterfall.
- `label` (`string`): What its row shows, and what typeahead matches.
- `start` (`number`): When it starts, in milliseconds, on the same clock as every other span.
- `duration` (`number`): How long it lasts, in milliseconds.
- `children?` (`WaterfallDataItem[]`): The spans it started. Leave it out for a span with none.

Each row `visibleWaterfallRows(items, expanded)` returns:

- `item` (`WaterfallDataItem`): The span this row shows, the same object you passed in.
- `parent` (`string | null`): The value of the span it's nested in, or `null` at the top level.
- `level` (`number`): Its depth, 1 at the top level.
- `index` (`number`): Its place among the rows that show, from 0.

### State

The same state shows as data attributes on each element.

`Waterfall`:

- `range` (`[number, number]`): The stretch of time the axis shows, as `[start, end]` in milliseconds.

`ui-waterfall-axis`:

- `ticks` (`WaterfallTickData[]`): The ticks it shows, at round times inside the range.

`ui-waterfall-tick` and `ui-waterfall-mark`:

- `time` (`number`): The moment it marks, in milliseconds.
- `label` (`string`): The time as `format` and the locale show it.
- `position` (`number`): Where it sits between the range's start and end, from 0 to 100.
- `outside` (`boolean`): Whether its time is outside the range, so it doesn't show on the axis.

`ui-waterfall-row`, and its `ui-waterfall-row-header`, `ui-waterfall-indicator`, `ui-waterfall-cell` and `ui-waterfall-bar`:

- `expanded` (`boolean`): Whether it's a span with children that's expanded.
- `selected` (`boolean`): Whether it's the selected span.
- `branch` (`boolean`): Whether its span has children.
- `level` (`number`): Its depth, 1 at the top level.

### Reasons

Why spans expanded or collapsed:

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

Why the selection changed:

- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.

### Controller

The element's `api` property has the same methods.

- `getValue()` (`() => string | null`): The selected span's value, or `null`.
- `setValue(value, options?)` (`(value: string | null, options?: WaterfallChangeOptions<WaterfallValueChangeReason> | undefined) => boolean`): Selects a span, or nothing with `null`. Returns false when canceled.
- `getExpanded()` (`() => string[]`): The values of the expanded spans.
- `setExpanded(expanded, options?)` (`(expanded: string[], options?: WaterfallChangeOptions<WaterfallExpandedChangeReason> | undefined) => boolean`): Expands exactly these spans. Returns false when canceled.
- `isExpanded(value)` (`(value: string) => boolean`): Whether a span is expanded.
- `expand(value, options?)` (`(value: string, options?: WaterfallChangeOptions<WaterfallExpandedChangeReason> | undefined) => boolean`): Expands a span.
- `collapse(value, options?)` (`(value: string, options?: WaterfallChangeOptions<WaterfallExpandedChangeReason> | undefined) => boolean`): Collapses a span. Focus inside it moves to its row.
- `toggle(value, options?)` (`(value: string, options?: WaterfallChangeOptions<WaterfallExpandedChangeReason> | undefined) => boolean`): Expands a collapsed span, or collapses an expanded one.
- `expandAll(options?)` (`(options?: WaterfallChangeOptions<WaterfallExpandedChangeReason> | undefined) => boolean`): Expands every span with children.
- `collapseAll(options?)` (`(options?: WaterfallChangeOptions<WaterfallExpandedChangeReason> | undefined) => boolean`): Collapses every span.
- `reveal(value)` (`(value: string) => void`): Expands a span's ancestors and focuses its row, through `onHighlight` when it isn't rendered.
- `focus(value?)` (`(value?: string | undefined) => void`): Focuses a span's row, or the row with the tab stop.

## Accessibility

The waterfall follows the [WAI-ARIA treegrid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/). Rows have the `row` role with `aria-level`, `aria-posinset`, `aria-setsize`, `aria-selected="true"` on the selected row, and `aria-expanded` on spans with children. `ui-waterfall-row-header` is a `rowheader`, so screen readers repeat the span's name as focus moves down a column, and each `ui-waterfall-bar` is a `gridcell` labeled with when its span starts and how long it lasts, like "Starts at 120 ms, lasts 340 ms". Times are formatted with `Intl` in the page's language.

### Keyboard

The waterfall has one tab stop. Tab enters at the selected row, or the first row, then returns to the row or cell focused last.

| Key                  | Action                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------- |
| Down / Up Arrow      | Focus the next or previous row. In a cell, keep the column.                             |
| Right Arrow          | On a row, expand it, or move into its first cell. In a cell, move right.                |
| Left Arrow           | In a cell, move left, then back to the row. On a row, collapse it, or focus its parent. |
| Home / End           | Focus the first or last row. In a cell, the row's first or last cell.                   |
| Ctrl+Home / Ctrl+End | Focus the first or last row, keeping the column.                                        |
| Page Up / Page Down  | Move a page of rows.                                                                    |
| Enter / Space        | Select the row.                                                                         |
| Typing               | Focus the next row whose label starts with that text.                                   |

Command replaces Ctrl on a Mac. In right-to-left text, Left and Right swap.

### Tested Behavior

Every line below is an automated test.

**Rows**

- Spans start collapsed, and only top-level rows show.
- Clicking the indicator expands a span without selecting it.
- Clicking a row's cell selects the row and focuses the cell.
- A change can be canceled.
- A controller expands and collapses everything, and reveals a span.
- Collapsing a span from its indicator moves focus out of it.

**Keyboard**

- The waterfall is one tab stop.
- Down and Up move between rows, Home and End to the first and last.
- Right expands a collapsed row, then moves into its cells.
- Left moves back through the cells to the row, collapses it, then moves to the parent.
- Down and Up in a cell keep its column.
- Home and End in a cell go to the row's ends, and with Control to the column's.
- A focused cell keeps the tab stop.
- A cell hidden by a collapse gives up the tab stop.
- Enter and Space select the focused row.
- Typing moves to the next row whose name starts with it.

**Time axis**

- Each row places its bar as a share of the range.
- Each bar tells screen readers when its span starts and how long it lasts.
- The axis shows round times, hidden from screen readers.

Runs in React, Vue and web components.
