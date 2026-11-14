# Calendar

Choose one date, several dates, or a range from a month grid.

Calendar shows dates directly on the page. Use it for a booking flow, a schedule, or any place where the dates should stay visible. For a text field that opens a calendar, use [Date Picker](./date-picker.md).

```ts title="basic.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-calendar default-value="2026-10-16">
      <div data-slot="row">
        <ui-calendar-previous>
          <button data-variant="ghost">
            ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-previous>
        <ui-calendar-heading></ui-calendar-heading>
        <ui-calendar-next>
          <button data-variant="ghost">
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-next>
      </div>
      <ui-calendar-grid>
        <ui-calendar-weekdays>
          <template><ui-calendar-weekday></ui-calendar-weekday></template>
        </ui-calendar-weekdays>
        <ui-calendar-weeks>
          <template><ui-calendar-day></ui-calendar-day></template>
        </ui-calendar-weeks>
      </ui-calendar-grid>
    </ui-calendar>
  `
}

export { mount }
```

Choose a date, then use Previous or Next to change the month. Arrow keys move through the days.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the component to register its elements. The import is safe on the server.

```ts
import "@ui-sdk/web/calendar"
```

## Composition

Use the following composition to build a `ui-calendar`:

```text
ui-calendar
├── ui-calendar-previous
│   └── button
├── ui-calendar-heading
├── ui-calendar-next
│   └── button
└── ui-calendar-grid
    ├── ui-calendar-weekdays
    │   └── template
    │       └── ui-calendar-weekday
    └── ui-calendar-weeks
        └── template
            └── ui-calendar-day
```

The heading names the displayed month. Previous and Next change it, and a grid holds its weekday headers and dates. Templates inside the weekdays and weeks are copied for each header and date.

An empty `ui-calendar` renders the default structure, and an empty `ui-calendar-grid` renders its headers and weeks. Write the parts out to add your classes and content. Each grid is named by its month and has the `grid` role.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/calendar"
</script>

<ui-calendar default-value="2026-10-16">
  <ui-calendar-previous><button>‹</button></ui-calendar-previous>
  <ui-calendar-heading></ui-calendar-heading>
  <ui-calendar-next><button>›</button></ui-calendar-next>
  <ui-calendar-grid>
    <ui-calendar-weekdays>
      <template><ui-calendar-weekday></ui-calendar-weekday></template>
    </ui-calendar-weekdays>
    <ui-calendar-weeks>
      <template><ui-calendar-day></ui-calendar-day></template>
    </ui-calendar-weeks>
  </ui-calendar-grid>
</ui-calendar>
```

## Values

Dates are ISO strings such as `"2026-10-16"`, with no time or time zone attached. No date library is needed. The [date helpers](../core.md#dates) handle arithmetic; `Intl` formats names and labels.

| Mode                 | Value                           |
| -------------------- | ------------------------------- |
| `"single"` (default) | A date string or `null`.        |
| `"multiple"`         | A sorted array of date strings. |
| `"range"`            | `[start, end]` or `null`.       |

A value with the wrong shape for its mode is treated as no selection.

## Range

`mode="range"` chooses a start and then an end. Moving the pointer or focus previews the range; the value changes once both ends are chosen. A date before the start ends it too, and becomes the start. Escape cancels an unfinished range.

```ts title="range.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-calendar mode="range" months="2" month-format="short" default-value="2026-10-12,2026-10-16">
      <div data-slot="row">
        <ui-calendar-previous>
          <button data-variant="ghost">
            ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-previous>
        <ui-calendar-heading></ui-calendar-heading>
        <ui-calendar-next>
          <button data-variant="ghost">
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-next>
      </div>
      <div data-slot="row">
        <ui-calendar-grid offset="0">
          <ui-calendar-weekdays>
            <template><ui-calendar-weekday></ui-calendar-weekday></template>
          </ui-calendar-weekdays>
          <ui-calendar-weeks>
            <template><ui-calendar-day></ui-calendar-day></template>
          </ui-calendar-weeks>
        </ui-calendar-grid>
        <ui-calendar-grid offset="1">
          <ui-calendar-weekdays>
            <template><ui-calendar-weekday></ui-calendar-weekday></template>
          </ui-calendar-weekdays>
          <ui-calendar-weeks>
            <template><ui-calendar-day></ui-calendar-day></template>
          </ui-calendar-weeks>
        </ui-calendar-grid>
      </div>
    </ui-calendar>
  `
}

export { mount }
```

Choose a start date, then move to an end date to preview the range. Choose the end to finish, or press Escape to cancel the unfinished range.

## Multiple

`mode="multiple"` toggles each date independently. Its value is a sorted array, even when dates were chosen in another order.

```ts title="multiple.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div>
      <ui-calendar mode="multiple" default-value="2026-10-07,2026-10-16,2026-10-26">
        <div data-slot="row">
          <ui-calendar-previous>
            <button data-variant="ghost">
              ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-calendar-previous>
          <ui-calendar-heading></ui-calendar-heading>
          <ui-calendar-next>
            <button data-variant="ghost">
              ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-calendar-next>
        </div>
        <ui-calendar-grid>
          <ui-calendar-weekdays>
            <template><ui-calendar-weekday></ui-calendar-weekday></template>
          </ui-calendar-weekdays>
          <ui-calendar-weeks>
            <template><ui-calendar-day></ui-calendar-day></template>
          </ui-calendar-weeks>
        </ui-calendar-grid>
      </ui-calendar>
    </div>
  `
}

export { mount }
```

Choose another date to add it, or choose a selected date to remove it.

## Unavailable Dates

The `unavailable` property accepts a date, `{ from, to }`, `{ weekday: [0, 6] }` for weekends, `{ before }`, `{ after }`, a predicate, or an array of these matchers. Weekday zero is Sunday. The attribute takes comma-separated dates.

Unavailable dates cannot be selected, but stay focusable so keyboard and screen reader users can discover them. They expose `aria-disabled` and `data-unavailable`.

```ts title="unavailable.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

const unavailable = [
  "2026-10-08",
  { from: "2026-10-20", to: "2026-10-23" },
  { weekday: [0, 6] },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-calendar>
      <div data-slot="row">
        <ui-calendar-previous>
          <button data-variant="ghost">
            ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-previous>
        <ui-calendar-heading></ui-calendar-heading>
        <ui-calendar-next>
          <button data-variant="ghost">
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-next>
      </div>
      <ui-calendar-grid>
        <ui-calendar-weekdays>
          <template><ui-calendar-weekday></ui-calendar-weekday></template>
        </ui-calendar-weekdays>
        <ui-calendar-weeks>
          <template><ui-calendar-day></ui-calendar-day></template>
        </ui-calendar-weeks>
      </ui-calendar-grid>
    </ui-calendar>
  `
  root.querySelector("ui-calendar")!.unavailable = unavailable
}

export { mount }
```

Try an unavailable date, then choose an available one. Unavailable days remain focusable so their state can be heard.

## Deselect

`deselectable` lets a second press on the selected date clear it, in single mode. Without it, a second press keeps the date selected.

## Min and Max

`min` and `max` set the earliest and latest selectable dates. Dates outside those bounds cannot receive focus. Arrow keys stop at the bounds, and Previous and Next stop at their months.

```ts title="min-max.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-calendar default-value="2026-10-16" min="2026-10-05" max="2026-11-20">
      <div data-slot="row">
        <ui-calendar-previous>
          <button data-variant="ghost">
            ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-previous>
        <ui-calendar-heading></ui-calendar-heading>
        <ui-calendar-next>
          <button data-variant="ghost">
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-next>
      </div>
      <ui-calendar-grid>
        <ui-calendar-weekdays>
          <template><ui-calendar-weekday></ui-calendar-weekday></template>
        </ui-calendar-weekdays>
        <ui-calendar-weeks>
          <template><ui-calendar-day></ui-calendar-day></template>
        </ui-calendar-weeks>
      </ui-calendar-grid>
    </ui-calendar>
  `
}

export { mount }
```

Move toward either end of the allowed dates. Keyboard navigation and month buttons stop at the limits.

## Disabled and Read Only

`disabled` prevents focus, selection, and month navigation. `read-only` allows navigation so dates can be inspected, but keeps the selected value unchanged.

```ts title="disabled.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-calendar disabled default-value="2026-10-16">
      <div data-slot="row">
        <ui-calendar-previous>
          <button data-variant="ghost">
            ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-previous>
        <ui-calendar-heading></ui-calendar-heading>
        <ui-calendar-next>
          <button data-variant="ghost">
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-next>
      </div>
      <ui-calendar-grid>
        <ui-calendar-weekdays>
          <template><ui-calendar-weekday></ui-calendar-weekday></template>
        </ui-calendar-weekdays>
        <ui-calendar-weeks>
          <template><ui-calendar-day></ui-calendar-day></template>
        </ui-calendar-weeks>
      </ui-calendar-grid>
    </ui-calendar>
  `
}

export { mount }
```

Try choosing a date or changing months. A disabled calendar has no available controls.

```ts title="read-only.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-calendar read-only default-value="2026-10-16">
      <div data-slot="row">
        <ui-calendar-previous>
          <button data-variant="ghost">
            ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-previous>
        <ui-calendar-heading></ui-calendar-heading>
        <ui-calendar-next>
          <button data-variant="ghost">
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-next>
      </div>
      <ui-calendar-grid>
        <ui-calendar-weekdays>
          <template><ui-calendar-weekday></ui-calendar-weekday></template>
        </ui-calendar-weekdays>
        <ui-calendar-weeks>
          <template><ui-calendar-day></ui-calendar-day></template>
        </ui-calendar-weeks>
      </ui-calendar-grid>
    </ui-calendar>
  `
}

export { mount }
```

Move through dates and months. The selected value stays unchanged.

## Two Months

Set `months` to `2` and render grids with offsets `0` and `1`. Arrow keys move between the grids without turning the page. Dates that another visible month already shows leave an empty cell, so each date appears once.

`page-by="page"` makes Previous, Next, and navigation beyond the visible grids move by the full number of months.

```ts title="two-months.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-calendar months="2" page-by="page" month-format="short" default-value="2026-10-16">
      <div data-slot="row">
        <ui-calendar-previous>
          <button data-variant="ghost">
            ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-previous>
        <ui-calendar-heading></ui-calendar-heading>
        <ui-calendar-next>
          <button data-variant="ghost">
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-next>
      </div>
      <div data-slot="row">
        <ui-calendar-grid offset="0">
          <ui-calendar-weekdays>
            <template><ui-calendar-weekday></ui-calendar-weekday></template>
          </ui-calendar-weekdays>
          <ui-calendar-weeks>
            <template><ui-calendar-day></ui-calendar-day></template>
          </ui-calendar-weeks>
        </ui-calendar-grid>
        <ui-calendar-grid offset="1">
          <ui-calendar-weekdays>
            <template><ui-calendar-weekday></ui-calendar-weekday></template>
          </ui-calendar-weekdays>
          <ui-calendar-weeks>
            <template><ui-calendar-day></ui-calendar-day></template>
          </ui-calendar-weeks>
        </ui-calendar-grid>
      </div>
    </ui-calendar>
  `
}

export { mount }
```

Move between October and November with arrow keys. Next advances both visible months to December and January.

## Fixed Weeks

`fixed-weeks` renders six week rows in every month. Set `show-outside-days` to `false` to leave dates from neighboring months blank.

```ts title="fixed-weeks.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-calendar fixed-weeks show-outside-days="false" default-month="2026-02">
      <div data-slot="row">
        <ui-calendar-previous>
          <button data-variant="ghost">
            ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-previous>
        <ui-calendar-heading></ui-calendar-heading>
        <ui-calendar-next>
          <button data-variant="ghost">
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-next>
      </div>
      <ui-calendar-grid>
        <ui-calendar-weekdays>
          <template><ui-calendar-weekday></ui-calendar-weekday></template>
        </ui-calendar-weekdays>
        <ui-calendar-weeks>
          <template><ui-calendar-day></ui-calendar-day></template>
        </ui-calendar-weeks>
      </ui-calendar-grid>
    </ui-calendar>
  `
}

export { mount }
```

Move from February to March. Both grids keep six week rows, and dates outside each month are hidden.

## Month and Year Selects

`ui-calendar-month-select` and `ui-calendar-year-select` are native selects for jumping directly to a date, such as a birthday. The year options run from `min` to `max`, or ten years either side of the current year shown when bounds are missing. Months outside the bounds are disabled.

They update the first displayed month with the `select-change` reason. Their state exposes the options if you want to render a different select.

```ts title="month-year-select.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-calendar default-month="1990-06" min="1920-01-01" max="2026-10-16">
      <div data-slot="row">
        <ui-calendar-previous>
          <button data-variant="ghost">
            ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-previous>
        <ui-calendar-heading></ui-calendar-heading>
        <div data-slot="row">
          <ui-calendar-month-select>
            <select></select>
          </ui-calendar-month-select>
          <ui-calendar-year-select>
            <select></select>
          </ui-calendar-year-select>
        </div>
        <ui-calendar-next>
          <button data-variant="ghost">
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-next>
      </div>
      <ui-calendar-grid>
        <ui-calendar-weekdays>
          <template><ui-calendar-weekday></ui-calendar-weekday></template>
        </ui-calendar-weekdays>
        <ui-calendar-weeks>
          <template><ui-calendar-day></ui-calendar-day></template>
        </ui-calendar-weeks>
      </ui-calendar-grid>
    </ui-calendar>
  `
}

export { mount }
```

Choose a year and month to jump directly to a birthday, then choose the day.

## Custom Month and Year Selects

The month and year selects are native `select` elements. To use your own select, set the calendar's `month` property from your select's value, and update your select on `monthchange`, as with the [Select](./select.md) component here. Keep a `ui-calendar-heading` in the calendar, visually hidden if you like, so the grid stays named.

```ts title="custom-select.ts"
import "@ui-sdk/web/calendar"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((label, index) => ({ value: String(index + 1).padStart(2, "0"), label }))
const years = ["2024", "2025", "2026", "2027", "2028"].map((year) => ({
  value: year,
  label: year,
}))

const items = (options: { value: string; label: string }[]) =>
  options
    .map(
      (option) => `
        <ui-select-item value="${option.value}">
          ${option.label}
          <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
        </ui-select-item>
      `
    )
    .join("")

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-calendar default-month="2026-10" default-value="2026-10-16" min="2024-01-01" max="2028-12-31">
      <div data-slot="row">
        <ui-calendar-heading></ui-calendar-heading>
        <ui-select default-value="10">
          <ui-select-trigger>
            <button aria-label="Month">
              <ui-select-value></ui-select-value>
              ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-select-trigger>
          <ui-select-content hidden>${items(months)}</ui-select-content>
        </ui-select>
        <ui-select default-value="2026">
          <ui-select-trigger>
            <button aria-label="Year">
              <ui-select-value></ui-select-value>
              ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-select-trigger>
          <ui-select-content hidden>${items(years)}</ui-select-content>
        </ui-select>
      </div>
      <ui-calendar-grid>
        <ui-calendar-weekdays>
          <template><ui-calendar-weekday></ui-calendar-weekday></template>
        </ui-calendar-weekdays>
        <ui-calendar-weeks>
          <template><ui-calendar-day></ui-calendar-day></template>
        </ui-calendar-weeks>
      </ui-calendar-grid>
    </ui-calendar>
  `
  const calendar = root.querySelector("ui-calendar")!
  const [monthSelect, yearSelect] = root.querySelectorAll("ui-select")
  calendar.addEventListener("monthchange", (event) => {
    const [year, monthOfYear] = event.detail.value.split("-")
    yearSelect.value = year
    monthSelect.value = monthOfYear
  })
  monthSelect.addEventListener("valuechange", (event) => {
    if (event.detail.value) {
      calendar.month = `${calendar.month.split("-")[0]}-${event.detail.value}`
    }
  })
  yearSelect.addEventListener("valuechange", (event) => {
    if (event.detail.value) {
      calendar.month = `${event.detail.value}-${calendar.month.split("-")[1]}`
    }
  })
}

export { mount }
```

Choose a month or a year from the selects. The calendar follows, and the arrow keys still move between days.

## Language

`locale` controls month names, weekday headers, and full date labels. If you omit it, Calendar reads the surrounding page’s `lang` after it mounts, with the browser’s language as a fallback. The initial server and client render use English, so they always match. The first weekday follows the locale, and so changes after mount too, unless `week-starts-on` sets it. `weekday-format` accepts `"narrow"`, `"short"`, or `"long"`.

Previous and Next are named "Previous month" and "Next month". Write `aria-label` on their buttons to name them in another language. Dates remain Gregorian. Localized year systems, such as Buddhist or Japanese era years, can still appear in the labels.

```ts title="locale.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-calendar locale="de-DE" week-starts-on="1" weekday-format="narrow" default-value="2026-10-16">
      <div data-slot="row">
        <ui-calendar-previous>
          <button data-variant="ghost">
            ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-previous>
        <ui-calendar-heading></ui-calendar-heading>
        <ui-calendar-next>
          <button data-variant="ghost">
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-next>
      </div>
      <ui-calendar-grid>
        <ui-calendar-weekdays>
          <template><ui-calendar-weekday></ui-calendar-weekday></template>
        </ui-calendar-weekdays>
        <ui-calendar-weeks>
          <template><ui-calendar-day></ui-calendar-day></template>
        </ui-calendar-weeks>
      </ui-calendar-grid>
    </ui-calendar>
  `
}

export { mount }
```

Move through the calendar. Month names, weekday headers, and full date labels are in German, with Monday first.

## Name Formats

Set `weekday-format` for the weekday headers and `month-format` for the heading and the month select. Both take `"narrow"`, `"short"` or `"long"`, and follow the calendar's locale. Screen readers still hear full names: the grid and each day keep their long labels.

```ts title="formats.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-calendar months="2" page-by="page" default-value="2026-10-16" weekday-format="narrow" month-format="short">
      <div data-slot="row">
        <ui-calendar-previous>
          <button data-variant="ghost">
            ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-previous>
        <ui-calendar-heading></ui-calendar-heading>
        <ui-calendar-next>
          <button data-variant="ghost">
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-next>
      </div>
      <div data-slot="row">
        <ui-calendar-grid offset="0">
          <ui-calendar-weekdays>
            <template><ui-calendar-weekday></ui-calendar-weekday></template>
          </ui-calendar-weekdays>
          <ui-calendar-weeks>
            <template><ui-calendar-day></ui-calendar-day></template>
          </ui-calendar-weeks>
        </ui-calendar-grid>
        <ui-calendar-grid offset="1">
          <ui-calendar-weekdays>
            <template><ui-calendar-weekday></ui-calendar-weekday></template>
          </ui-calendar-weekdays>
          <ui-calendar-weeks>
            <template><ui-calendar-day></ui-calendar-day></template>
          </ui-calendar-weeks>
        </ui-calendar-grid>
      </div>
    </ui-calendar>
  `
}

export { mount }
```

The weekday headers are narrow and the heading uses short month names: Oct – Nov 2026.

## Custom Days

Put your own content in the day template and update it from each day’s date and state attributes. This example adds a price below each day. Weekday headers can have custom content too.

```ts title="custom-day.ts"
import { weekday } from "@ui-sdk/core/date"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

const priceOf = (date: string) => 80 + ((Number(date.slice(8)) * 7) % 5) * 10

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-calendar today="2026-10-16" default-value="2026-10-16">
      <div data-slot="row">
        <ui-calendar-previous>
          <button data-variant="ghost">
            ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-previous>
        <ui-calendar-heading></ui-calendar-heading>
        <ui-calendar-next>
          <button data-variant="ghost">
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-next>
      </div>
      <ui-calendar-grid>
        <ui-calendar-weekdays>
          <template><ui-calendar-weekday></ui-calendar-weekday></template>
        </ui-calendar-weekdays>
        <ui-calendar-weeks>
          <template>
            <ui-calendar-day>
              <span data-slot="stack">
                <span data-label></span>
                <span data-slot="hint" data-price></span>
              </span>
            </ui-calendar-day>
          </template>
        </ui-calendar-weeks>
      </ui-calendar-grid>
    </ui-calendar>
  `
  const calendar = root.querySelector("ui-calendar")!
  const decorate = () => {
    for (const day of calendar.querySelectorAll("ui-calendar-day")) {
      const label = day.querySelector("[data-label]")!
      if (label.textContent) {
        continue
      }
      const date = day.getAttribute("value")!
      label.textContent = String(Number(date.slice(8)))
      day.querySelector("[data-price]")!.textContent = `$${priceOf(date)}`
    }
    const firstWeek = calendar.querySelector("ui-calendar-week")
    calendar
      .querySelectorAll("ui-calendar-weekday")
      .forEach((header, index) => {
        const name = header.getAttribute("aria-label")
        const date = firstWeek?.children[index]?.getAttribute("value")
        if (!name || !date || header.firstElementChild) {
          return
        }
        const abbr = document.createElement("abbr")
        abbr.title = name
        abbr.toggleAttribute(
          "data-weekend",
          weekday(date) === 0 || weekday(date) === 6
        )
        abbr.append(...header.childNodes)
        header.append(abbr)
      })
  }
  const observer = new MutationObserver(decorate)
  observer.observe(calendar, {
    childList: true,
    subtree: true,
    attributeFilter: ["aria-label"],
  })
  decorate()
  return () => observer.disconnect()
}

export { mount }
```

Choose a date to see its price selected with it. Dates outside the current month have no price.

## Range Limits

`min-days` and `max-days` count both ends. A three-day range includes its start, the day between, and its end. A press that would break a limit keeps the start, so another end can be chosen. Until then, the dates that can't end the range are disabled.

A range cannot include an unavailable date unless `allow-unavailable` is set. That allows unavailable dates between the ends; they still cannot be chosen as an endpoint.

```ts title="range-limits.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-calendar mode="range" min-days="3" max-days="8" unavailable="2026-10-17,2026-10-18" allow-unavailable>
      <div data-slot="row">
        <ui-calendar-previous>
          <button data-variant="ghost">
            ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-previous>
        <ui-calendar-heading></ui-calendar-heading>
        <ui-calendar-next>
          <button data-variant="ghost">
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-next>
      </div>
      <ui-calendar-grid>
        <ui-calendar-weekdays>
          <template><ui-calendar-weekday></ui-calendar-weekday></template>
        </ui-calendar-weekdays>
        <ui-calendar-weeks>
          <template><ui-calendar-day></ui-calendar-day></template>
        </ui-calendar-weeks>
      </ui-calendar-grid>
    </ui-calendar>
  `
}

export { mount }
```

In October 2026, choose October 15 then October 20. This example accepts 3–8 days and allows the range to span the unavailable weekend.

## Range in Progress

The root's state has `anchor`, the start while an end is being picked, and `focused`, the date with the Tab stop. `anchorchange` and `focusedchange` events report them before they change, to show the range being picked outside the calendar, and canceling either keeps things as they were. A day that takes focus because the months turned reports nothing.

```ts title="range-progress.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div>
      <ui-calendar mode="range">
        <div data-slot="row">
          <ui-calendar-previous>
            <button data-variant="ghost">
              ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-calendar-previous>
          <ui-calendar-heading></ui-calendar-heading>
          <ui-calendar-next>
            <button data-variant="ghost">
              ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-calendar-next>
        </div>
        <ui-calendar-grid>
          <ui-calendar-weekdays>
            <template><ui-calendar-weekday></ui-calendar-weekday></template>
          </ui-calendar-weekdays>
          <ui-calendar-weeks>
            <template><ui-calendar-day></ui-calendar-day></template>
          </ui-calendar-weeks>
        </ui-calendar-grid>
      </ui-calendar>
    </div>
  `
  const calendar = root.querySelector("ui-calendar")!
  calendar.addEventListener("anchorchange", (event) => {
    log(
      root,
      event.detail.value ? `Started on ${event.detail.value}` : "Range finished"
    )
  })
  calendar.addEventListener("focusedchange", (event) =>
    log(root, `Focus on ${event.detail.value}`)
  )
}

export { mount }
```

Choose a start date, then move with the arrow keys. The console logs the start and each focused date until Enter picks the end.

## Controlled

The selection and displayed month are separate. `value` uses the shape for the chosen mode; `month` names the first displayed month, such as `"2026-10"`.

Read and write the element’s `value` and `month` properties. Listen for `valuechange` and `monthchange`, and call `event.preventDefault()` to reject a change. Use `default-value` and `default-month` for initial state. [State and Events](../state-and-events.md) covers the binding pattern, and the [reason tables](#reasons) list Calendar’s reasons.

```ts title="controlled.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div>
      <ui-calendar default-value="2026-10-16" default-month="2026-10">
        <div data-slot="row">
          <ui-calendar-previous>
            <button data-variant="ghost">
              ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-calendar-previous>
          <ui-calendar-heading></ui-calendar-heading>
          <ui-calendar-next>
            <button data-variant="ghost">
              ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-calendar-next>
        </div>
        <ui-calendar-grid>
          <ui-calendar-weekdays>
            <template><ui-calendar-weekday></ui-calendar-weekday></template>
          </ui-calendar-weekdays>
          <ui-calendar-weeks>
            <template><ui-calendar-day></ui-calendar-day></template>
          </ui-calendar-weeks>
        </ui-calendar-grid>
      </ui-calendar>
    </div>
  `
  const calendar = root.querySelector("ui-calendar")!
  calendar.addEventListener("valuechange", (event) => {
    log(root, `Selected ${String(event.detail.value)} (${event.detail.reason})`)
  })
  calendar.addEventListener("monthchange", (event) => {
    log(root, `Showing ${event.detail.value} (${event.detail.reason})`)
  })
}

export { mount }
```

Choose a date or change the month. The console logs each change and its reason.

## Today

Today gets `aria-current="date"` and `data-today`. When there is no selection or starting month, the calendar opens on today’s month. It reads today on the client; set `today` to pin a date explicitly.

`time-zone` determines which date is today. It does not convert the selected date into another time zone.

```ts title="time-zone.ts"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div>
      <ui-calendar time-zone="Pacific/Kiritimati">
        <div data-slot="row">
          <ui-calendar-previous>
            <button data-variant="ghost">
              ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-calendar-previous>
          <ui-calendar-heading></ui-calendar-heading>
          <ui-calendar-next>
            <button data-variant="ghost">
              ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-calendar-next>
        </div>
        <ui-calendar-grid>
          <ui-calendar-weekdays>
            <template><ui-calendar-weekday></ui-calendar-weekday></template>
          </ui-calendar-weekdays>
          <ui-calendar-weeks>
            <template><ui-calendar-day></ui-calendar-day></template>
          </ui-calendar-weeks>
        </ui-calendar-grid>
      </ui-calendar>
      <p data-slot="hint">
        Today is marked as it is in Kiritimati, the first place to see each new day.
      </p>
    </div>
  `
}

export { mount }
```

Find the marked date for today in Pacific/Kiritimati, which may differ from today in your time zone.

## Driving It from Anywhere

A `createCalendarController()` instance, set as the element's `controller` property, can set the value, change months, and focus a date. The element's `api` has the same methods. Focusing a date in another month shows that month first. [Controllers](../controllers.md) covers setup and lifecycle.

```ts title="controller.ts"
import { todayDate } from "@ui-sdk/core/date"
import { createCalendarController } from "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-action="christmas">Go to Christmas</button>
        <button type="button" data-action="today">Today</button>
      </div>
      <ui-calendar default-value="2026-10-16" default-month="2026-10">
        <div data-slot="row">
          <ui-calendar-previous>
            <button data-variant="ghost">
              ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-calendar-previous>
          <ui-calendar-heading></ui-calendar-heading>
          <ui-calendar-next>
            <button data-variant="ghost">
              ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-calendar-next>
        </div>
        <ui-calendar-grid>
          <ui-calendar-weekdays>
            <template><ui-calendar-weekday></ui-calendar-weekday></template>
          </ui-calendar-weekdays>
          <ui-calendar-weeks>
            <template><ui-calendar-day></ui-calendar-day></template>
          </ui-calendar-weeks>
        </ui-calendar-grid>
      </ui-calendar>
    </div>
  `
  const calendar = createCalendarController()
  root.querySelector("ui-calendar")!.controller = calendar
  const select = (date: string) => {
    calendar.setValue(date)
    calendar.focus(date)
  }
  root
    .querySelector('[data-action="christmas"]')!
    .addEventListener("click", () => select("2026-12-25"))
  root
    .querySelector('[data-action="today"]')!
    .addEventListener("click", () => select(todayDate()))
}

export { mount }
```

Press Go to Christmas to select December 25 and move focus there, or Today to jump back to today and select it.

## Presets

Drive a range calendar from buttons for the ranges people pick most. Each preset sets the value through the [controller](#driving-it-from-anywhere) and moves focus to its first day, using the [date helpers](../core.md#dates) for the arithmetic.

```ts title="presets.ts"
import { addDays, endOfMonth, startOfMonth } from "@ui-sdk/core/date"
import { createCalendarController } from "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

const today = "2026-10-16"
const presets = [
  { label: "Last 7 Days", range: [addDays(today, -6), today] },
  { label: "This Month", range: [startOfMonth(today), endOfMonth(today)] },
  { label: "Next 30 Days", range: [today, addDays(today, 29)] },
] as const

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        ${presets
          .map(
            (preset, index) =>
              `<button type="button" data-size="sm" data-preset="${index}">${preset.label}</button>`
          )
          .join("")}
      </div>
      <ui-calendar mode="range" today="${today}" default-month="2026-10">
        <div data-slot="row">
          <ui-calendar-previous>
            <button data-variant="ghost">
              ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-calendar-previous>
          <ui-calendar-heading></ui-calendar-heading>
          <ui-calendar-next>
            <button data-variant="ghost">
              ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-calendar-next>
        </div>
        <ui-calendar-grid>
          <ui-calendar-weekdays>
            <template><ui-calendar-weekday></ui-calendar-weekday></template>
          </ui-calendar-weekdays>
          <ui-calendar-weeks>
            <template><ui-calendar-day></ui-calendar-day></template>
          </ui-calendar-weeks>
        </ui-calendar-grid>
      </ui-calendar>
    </div>
  `
  const calendar = createCalendarController()
  root.querySelector("ui-calendar")!.controller = calendar
  for (const button of root.querySelectorAll<HTMLElement>("[data-preset]")) {
    const { range } = presets[Number(button.dataset.preset)]!
    button.addEventListener("click", () => {
      calendar.setValue([...range])
      calendar.focus(range[0])
    })
  }
}

export { mount }
```

Choose Last 7 Days, This Month or Next 30 Days. The range is selected and the calendar shows its start.

## Custom Rendering

Write the header row inside `ui-calendar-weekdays` yourself to add columns of your own, and add cells to the week rows the calendar renders. Custom elements can't build a `<table>`, so the parts carry the table's roles; give your own cells the `columnheader` or `rowheader` role. [Parts and Composition](../parts-and-composition.md) covers changing a part’s element without losing its behavior.

```ts title="custom-grid.ts"
import { addMonths } from "@ui-sdk/core/date"
import "@ui-sdk/web/calendar"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

function isoWeek(date: string) {
  const day = new Date(`${date}T00:00:00Z`)
  day.setUTCDate(day.getUTCDate() + 3 - ((day.getUTCDay() + 6) % 7))
  const firstThursday = new Date(Date.UTC(day.getUTCFullYear(), 0, 4))
  const days = (day.getTime() - firstThursday.getTime()) / 86400000
  return 1 + Math.round((days - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7)
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-calendar default-value="2026-10-16" week-starts-on="1">
      <div data-slot="row">
        <ui-calendar-previous>
          <button data-variant="ghost">
            ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-previous>
        <ui-calendar-heading></ui-calendar-heading>
        <ui-calendar-next>
          <button data-variant="ghost">
            ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-calendar-next>
      </div>
      <ui-calendar-grid>
        <ui-calendar-weekdays>
          <div>
            <span role="columnheader"><abbr title="Week">Wk</abbr></span>
            ${Array.from({ length: 7 }, (_, index) => `<ui-calendar-weekday index="${index}"></ui-calendar-weekday>`).join("")}
          </div>
        </ui-calendar-weekdays>
        <ui-calendar-weeks>
          <template><ui-calendar-day></ui-calendar-day></template>
        </ui-calendar-weeks>
      </ui-calendar-grid>
    </ui-calendar>
  `
  const calendar = root.querySelector("ui-calendar")!
  const previous = root.querySelector("ui-calendar-previous button")!
  const weeks = root.querySelector("ui-calendar-weeks")!
  const showPrevious = (month: string) => {
    previous.setAttribute(
      "title",
      `Show ${addMonths(`${month}-01`, -1).slice(0, 7)}`
    )
  }
  const numberWeeks = () => {
    for (const week of weeks.querySelectorAll("ui-calendar-week")) {
      const date = week
        .querySelector("ui-calendar-day[value]")
        ?.getAttribute("value")
      if (!date) {
        continue
      }
      let header = week.querySelector<HTMLElement>(
        ':scope > [role="rowheader"]'
      )
      if (!header) {
        header = document.createElement("span")
        header.setAttribute("role", "rowheader")
        header.dataset.slot = "hint"
      }
      if (week.firstElementChild !== header) {
        week.prepend(header)
      }
      const number = String(isoWeek(date))
      if (header.textContent !== number) {
        header.textContent = number
      }
    }
  }
  const observer = new MutationObserver(numberWeeks)
  observer.observe(weeks, { childList: true, subtree: true })
  numberWeeks()
  showPrevious(calendar.month)
  calendar.addEventListener("monthchange", (event) =>
    showPrevious(event.detail.value)
  )
  return () => observer.disconnect()
}

export { mount }
```

The table is your own markup, built from the grid's state. Navigate and select as usual.

## Styling

Use `data-selected`, `data-today`, `data-outside`, `data-unavailable`, and `data-disabled` to style dates. A range also exposes its start, middle, end, and unfinished preview. Navigation buttons also get `data-disabled` when they reach the bounds.

Each part has a `data-slot`, such as `calendar-day`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### `<ui-calendar>`
`[data-slot="calendar"]`

- `data-mode` (`single`, `multiple`, `range`): How the calendar selects.
- `data-readonly`: Present when dates can be focused but not picked.
- `data-disabled`: Present on the root, grids and selects when the calendar is disabled, on a day that can't be picked, and on Previous or Next at `min` or `max`.

### `<ui-calendar-previous>`
`[data-slot="calendar-previous"]`

- `data-disabled`: Present on the root, grids and selects when the calendar is disabled, on a day that can't be picked, and on Previous or Next at `min` or `max`.

### `<ui-calendar-next>`
`[data-slot="calendar-next"]`

- `data-disabled`: Present on the root, grids and selects when the calendar is disabled, on a day that can't be picked, and on Previous or Next at `min` or `max`.

### `<ui-calendar-month-select>`
`[data-slot="calendar-month-select"]`

- `data-disabled`: Present on the root, grids and selects when the calendar is disabled, on a day that can't be picked, and on Previous or Next at `min` or `max`.

### `<ui-calendar-year-select>`
`[data-slot="calendar-year-select"]`

- `data-disabled`: Present on the root, grids and selects when the calendar is disabled, on a day that can't be picked, and on Previous or Next at `min` or `max`.

### `<ui-calendar-grid>`
`[data-slot="calendar-grid"]`

- `data-disabled`: Present on the root, grids and selects when the calendar is disabled, on a day that can't be picked, and on Previous or Next at `min` or `max`.

### `<ui-calendar-day>`
`[data-slot="calendar-day"]`

- `data-value` (`2026-10-01`, `2026-10-14`, `2026-10-16`, `2026-10-18`, `2026-10-24`, `2026-09-30`): A day's ISO date.
- `data-selected`: Present on selected days. In a range, every day from start to end.
- `data-today`: Present on today, beside `aria-current="date"`.
- `data-disabled`: Present on the root, grids and selects when the calendar is disabled, on a day that can't be picked, and on Previous or Next at `min` or `max`.
- `data-unavailable`: Present on a day `unavailable` names. It stays focusable.
- `data-outside`: Present on a day of the month before or after its grid's.
- `data-range-start`: Present on the day a range starts, including one being picked.
- `data-range-middle`: Present on the days inside a range, between its ends.
- `data-range-end`: Present on the day a range ends, including one being picked.
- `data-preview`: Present on the days of a range being picked, from its start to the day under the pointer or focus.

## API Reference

Props are attributes in kebab case, like `default-value`, `week-starts-on` and `show-outside-days`, and
numbers are numbers. `value`, `default-value` and `unavailable` take comma-separated dates, and the
`unavailable` property takes any matcher, like `{ weekday: [0, 6] }`. `controller` is a property. Callbacks are DOM events.

### Calendar

- `mode?` (`CalendarMode`): How many dates it selects: one, any number, or a range from a start to an end.
- `value?` (`CalendarValue`): The selected value: an ISO date for `"single"`, a list for `"multiple"`, `[start, end]` for `"range"`, or `null`. Pass it to control the calendar.
- `defaultValue?` (`CalendarValue`): The value it starts with, when uncontrolled.
- `valuechange event`: Runs when a date is pressed (`"item-press"`), with Enter or Space too, or a controller sets the value (`"imperative"`). A range changes once both ends are picked. `details.cancel()` keeps the value.
- `month?` (`string`): The first month shown, like `"2026-10"`. Pass it to control the calendar.
- `defaultMonth?` (`string`): The first month it shows, when uncontrolled. Defaults to the selected date's month, else today's.
- `monthchange event`: Runs when the months shown want to change: Previous or Next, a key moving focus to another month, a press on a day of another month, or a controller.
- `min?` (`string`): The earliest date that can be picked. Keys stop there, and Previous stops at its month.
- `max?` (`string`): The latest date that can be picked.
- `unavailable?` (`DateMatchers`): Dates that can't be picked, like booked days, as data: ISO dates, `{ from, to }`, `{ weekday: [0, 6] }` for weekends, `{ before }`, `{ after }`, or a function. They stay focusable, so keyboard users hear them.
- `disabled?` (`boolean`): Whether nothing can be picked or focused.
- `readOnly?` (`boolean`): Whether dates can be focused but not picked.
- `deselectable?` (`boolean`): Whether pressing the selected date again clears it, in `"single"` mode.
- `focusedchange event`: Runs before keys, a press or `focus()` move focus to another day. Canceling keeps focus where it was.
- `anchorchange event`: Runs before a press starts a range, or ends it or Escape drops it, with `null`. Canceling keeps the start as it was.
- `months?` (`number`): How many months show side by side, each in its own grid.
- `pageBy?` (`"month" | "page"`): Whether Previous, Next and keys turn one month, or all the months shown.
- `locale?` (`string`): The language of the names and labels. Defaults to the page's `lang`, then the browser's.
- `weekStartsOn?` (`number`): The first day of the week, 0 for Sunday. Defaults to the locale's.
- `weekdayFormat?` (`"long" | "narrow" | "short"`): How weekday headers are written.
- `monthFormat?` (`"long" | "narrow" | "short"`): How month names are written, in the heading and the month select.
- `fixedWeeks?` (`boolean`): Whether every month shows six weeks, so the calendar doesn't change height.
- `showOutsideDays?` (`boolean`): Whether the days of the months before and after show at the edges.
- `today?` (`string`): Today's date, for `aria-current` and the starting month. Defaults to today in `timeZone`, read on the client.
- `timeZone?` (`string`): The time zone that says what day today is, like `"America/New_York"`. Defaults to the browser's.
- `minDays?` (`number`): The fewest days a range can span, counting both ends.
- `maxDays?` (`number`): The most days a range can span, counting both ends.
- `allowUnavailable?` (`boolean`): Whether a range may hold unavailable dates, like a stay over a booked night.
- `controller?` (`object`): Drives it from anywhere. Create one with `createCalendarController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### CalendarPrevious

Shows the previous month. `<ui-calendar-previous>` wraps a `button`, which is disabled at `min`, and makes one if you write none.

### CalendarHeading

Names the months shown, like "October 2026". `<ui-calendar-heading>` is a level 2 heading the grid is labelled by, and screen readers hear it change.

### CalendarNext

Shows the next month. `<ui-calendar-next>` wraps a `button`, which is disabled at `max`, and makes one if you write none.

### CalendarMonthSelect

`<ui-calendar-month-select>` wraps a native `select` of the months, in the locale, that changes the first month shown. It fills a `select` that has no options.

### CalendarYearSelect

`<ui-calendar-year-select>` wraps a native `select` of the years from `min` to `max`, or 10 either side of the year shown. It fills a `select` that has no options.

### CalendarGrid

- `offset?` (`number`): Which of the months shown it is, from 0.

### CalendarWeekdays

`<ui-calendar-weekdays>` renders the header row. A `<template>` inside it holds the `<ui-calendar-weekday>` each column copies.

### CalendarWeekday

- `index` (`number`): The column, from 0.

### CalendarWeeks

`<ui-calendar-weeks>` renders the week rows. A `<template>` inside it holds the `<ui-calendar-day>` each date copies.

### CalendarDay

- `value` (`string`): Its ISO date.
- `offset?` (`number`): The offset of the grid it's in.

### State

The same state shows as data attributes on each element.

`Calendar`:

- `value` (`CalendarValue`): The selected value.
- `month` (`string`): The first month shown.
- `mode` (`CalendarMode`): How it selects.
- `disabled` (`boolean`): Whether nothing can be picked or focused.
- `readOnly` (`boolean`): Whether dates can be focused but not picked.
- `focused` (`string | null`): The date with the tab stop, `null` until days render in the browser.
- `anchor` (`string | null`): A range's start while its end is being picked, else `null`.

`CalendarHeading`:

- `month` (`string`): The first month shown, to format the heading yourself.
- `label` (`string`): The months shown in `monthFormat`, like "October 2026", or "October – November 2026".

`CalendarMonthSelect` and `CalendarYearSelect`:

- `value` (`number`): The first month shown's month, 1 to 12, or its year.
- `options` (`CalendarSelectOption[]`): Every month, or the years from `min` to `max` (10 either side of the year shown without them).
- `disabled` (`boolean`): Whether the calendar's `disabled` option is on. Inside a Date Picker, a disabled `<fieldset>` around the picker counts too.

`CalendarPrevious` and `CalendarNext`:

- `month` (`string`): The first month it shows.
- `disabled` (`boolean`): Whether it can't go further, past `min` or `max`.

`CalendarGrid`:

- `month` (`string`): The month it shows: the first month shown, plus its `offset`.
- `label` (`string`): The month's name and year in `monthFormat`, like "October 2026".
- `weekdays` (`number[]`): The weekday of each column, 0 for Sunday, in the order they show.
- `weeks` (`CalendarGridCell[][]`): The weeks, each seven cells. Render a day for each cell that isn't hidden.

`CalendarWeekday`:

- `weekday` (`number`): The weekday, 0 for Sunday.
- `label` (`string`): Its name, in `weekdayFormat`.
- `name` (`string`): Its full name, which screen readers hear.

`CalendarDay`:

- `date` (`string`): Its ISO date.
- `label` (`string`): The day of the month in the locale's digits, like "16".
- `selected` (`boolean`): Whether it's selected. In a range, every date from start to end is.
- `today` (`boolean`): Whether it's the `today` option's date, or else today in `timeZone`, read once the calendar runs in the browser.
- `outside` (`boolean`): Whether it belongs to the month before or after its grid's.
- `disabled` (`boolean`): Whether it can't be picked: outside `min` and `max`, unavailable, unable to end the range being picked, or the calendar is disabled.
- `unavailable` (`boolean`): Whether `unavailable` names it.
- `rangeStart` (`boolean`): Whether a range starts here, including one being picked.
- `rangeEnd` (`boolean`): Whether a range ends here, including one being picked.
- `inRange` (`boolean`): Whether it's inside a range, ends included, including one being picked.

### Reasons

`event.detail.reason` says why the value changed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

And why the month changed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `previous-press` (`MouseEvent | KeyboardEvent`): A pagination's or a carousel's Previous part was pressed.
- `next-press` (`MouseEvent | KeyboardEvent`): A pagination's or a carousel's Next part was pressed.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `select-change`

Why focus moves to another day:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `focus-in` (`FocusEvent`): Keyboard focus moved into the component, which stops a rotating carousel, as the carousel pattern asks, or onto a canvas item, which brought it into view, or onto a calendar's day another way, like a screen reader's.

And why a range's start changed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).

### Controller

Create one with `createCalendarController()` and pass it as `controller`. Every write method takes an optional `{ reason, event }` and returns `false` when the change is canceled, there's nowhere to go, or the calendar is disabled or read-only.

- `getValue()` (`() => CalendarValue`): The selected value: an ISO date, a list of them, or a `[start, end]` range.
- `setValue(value, options?)` (`(value: CalendarValue, options?: CalendarChangeOptions<CalendarValueChangeReason> | undefined) => boolean`): Selects a value. Returns false when canceled, unchanged, disabled, read-only, or holding a date people can't pick, like one past `max`.
- `getMonth()` (`() => string`): The first month shown, like `"2026-10"`.
- `setMonth(month, options?)` (`(month: string, options?: CalendarChangeOptions<CalendarMonthChangeReason> | undefined) => boolean`): Shows a month first. Returns false when canceled or unchanged.
- `previous(options?)` (`(options?: CalendarChangeOptions<CalendarMonthChangeReason> | undefined) => boolean`): Shows the months before, as the Previous part does.
- `next(options?)` (`(options?: CalendarChangeOptions<CalendarMonthChangeReason> | undefined) => boolean`): Shows the months after, as the Next part does.
- `focus(date?)` (`(date?: string | undefined) => void`): Focuses a date, turning the months to show it, or the date with the tab stop.

### Events

Events fire on their own element and don't bubble, with the new value in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` cancels the change. Type the element as `UiCalendarElement` for typed listeners.

| Member                | On            | Description                                                                         |
| --------------------- | ------------- | ----------------------------------------------------------------------------------- |
| `value` property      | `ui-calendar` | The selected value. Setting it selects it                                           |
| `month` property      | `ui-calendar` | The first month shown. Setting it turns there                                       |
| `api` property        | `ui-calendar` | The [controller](#controller)                                                       |
| `controller` property | `ui-calendar` | A controller from `createCalendarController()`                                      |
| `valuechange` event   | `ui-calendar` | `detail: { value, reason, event, source }`                                          |
| `monthchange` event   | `ui-calendar` | `detail: { value: month, reason, event, source }`                                   |
| `focusedchange` event | `ui-calendar` | `detail: { value: date, reason, event, source }`, before focus moves to another day |
| `anchorchange` event  | `ui-calendar` | `detail: { value: start, reason, event, source }`, `null` once the range ends       |

## Accessibility

It follows the grid of the [WAI-ARIA date picker dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/): each month is a `grid` named by its month, weekday headers are `columnheader`s named by their full names, and each day is a focusable `gridcell` named by its full date, like "Friday, October 16, 2026", with `aria-selected`, `aria-disabled` and `aria-current="date"`. A grid that selects several dates or a range is `aria-multiselectable`. Every line below is an automated test.

### Keyboard

The grid has one Tab stop: the selected date when visible, otherwise today, otherwise the first available date. Moving into another month shows it and then focuses the date.

| Key                             | Action                                          |
| ------------------------------- | ----------------------------------------------- |
| Left / Right Arrow              | Move one day, following the page’s direction.   |
| Up / Down Arrow                 | Move one week.                                  |
| Home / End                      | Move to the first or last day of the week.      |
| Page Up / Page Down             | Move one month, keeping the day where possible. |
| Shift+Page Up / Shift+Page Down | Move one year.                                  |
| Enter / Space                   | Select the focused date.                        |
| Escape                          | Cancel an unfinished range.                     |

### Tested Behavior

- The calendar shows a month as a grid of days under weekday headers.
- The selected date holds the tab stop, else today.
- Tab leaves the grid after one stop.
- Arrow keys move focus by day and week.
- Moving past the month's edge shows the next month and focuses the day there.
- Page Up and Page Down move by month, and with Shift by year.
- The day of the month stays the same, or the month's last, when moving by month.
- Home and End go to the first and last day of the week.
- The week starts on the locale's first day.
- Pressing a day selects it.
- Enter on a focused day selects it.
- Space on a focused day selects it.
- Previous and Next show the month before and after, and the heading announces it.
- Min and max stop keys there, and Previous and Next at their months.
- Unavailable dates can be focused but not selected.
- In multiple mode, presses toggle dates.
- In range mode, two presses pick a range, previewed in between.
- In range mode, keys preview the end and Escape drops the start.
- A range keeps to its fewest and most days, and keeps its start.
- Two months show side by side, and focus moves between them without turning.
- Pressing a day of the next month selects it and shows its month.
- Pressing another month's day before min keeps the month shown.
- Pressing another month's day before min leaves focus on the day that had it.
- A controlled calendar shows what the app passes.
- A controller turns to a date and focuses it.
- A disabled calendar has no tab stop and selects nothing.
- A read-only calendar moves focus but selects nothing.

**Month and year selects**

- They show the first month shown and turn the calendar, with the select-change reason.
- Years run from min to max, and months past them are disabled.
- They follow the page's language.

Runs in React, Vue and web components.

Beyond the baseline:

- Keys pressed without waiting still land on the right day.
- A day of next month takes focus even when its month renders after the key.

Runs in React, Vue and web components.
