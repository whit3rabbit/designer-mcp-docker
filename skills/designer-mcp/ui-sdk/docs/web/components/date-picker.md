# Date Picker

Type a date or choose one from a calendar, with support for ranges and forms.

Date Picker combines a text field with [Calendar](./calendar.md). People can type a date in their language or choose it from the popup. Your application receives an ISO date string either way.

```ts title="basic.ts"
import "@ui-sdk/web/date-picker"
import { Calendar, ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-date-picker default-value="2026-10-16">
      <div data-slot="row">
        <ui-date-picker-input><input aria-label="Due date" /></ui-date-picker-input>
        <ui-date-picker-trigger>
          <button data-variant="ghost">
            ${createElement(Calendar, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-date-picker-trigger>
      </div>
      <ui-date-picker-hint></ui-date-picker-hint>
      <ui-date-picker-content hidden>
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
      </ui-date-picker-content>
    </ui-date-picker>
  `
}

export { mount }
```

Type a date and press Enter, or open the calendar and choose a day. The field formats the date when you commit it.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the component to register its elements, the Calendar elements included. The import is safe on the server.

```ts
import "@ui-sdk/web/date-picker"
```

## Composition

Use the following composition to build a `ui-date-picker`:

```text
ui-date-picker
├── ui-date-picker-input
│   └── input
├── ui-date-picker-trigger
│   └── button
├── ui-date-picker-hint
└── ui-date-picker-content
```

The input accepts a date, the trigger opens the calendar, and the hint describes the expected format. An empty content part renders a calendar for you.

Every [Calendar part](./calendar.md#composition) also works inside `ui-date-picker-content` and is defined by the Date Picker import. Write those parts out when you need to add styles, change the layout, or include custom day content.

An empty `ui-date-picker` renders the input, trigger, and calendar too. In range mode, it renders an input for each end. An input element wraps your native `<input>` or creates one. The trigger, Clear, and presets wrap a `<button>` or create one around their content.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/date-picker"
</script>

<ui-date-picker default-value="2026-10-16">
  <ui-date-picker-input><input aria-label="Due date" /></ui-date-picker-input>
  <ui-date-picker-trigger><button>Choose date</button></ui-date-picker-trigger>
  <ui-date-picker-hint></ui-date-picker-hint>
  <ui-date-picker-content hidden></ui-date-picker-content>
</ui-date-picker>
```

## Values

Dates are strings such as `"2026-10-16"`, with no time or time zone attached. No date library is needed.

| Mode                 | Value                                                 |
| -------------------- | ----------------------------------------------------- |
| `"single"` (default) | A date string or `null`.                              |
| `"range"`            | `[start, end]` or `null`, with an input for each end. |

## Typing a Date

The input parses text when you press Enter or leave the field. It uses the locale’s date order, such as `10/16/2026` in American English or `16.10.2026` in German. It also accepts ISO dates, digits without separators, two-digit years, and month names in the locale or English. Dates without a year use the current year.

The field formats a valid date after it is committed, leaving your typing alone until then. Invalid text stays visible and sets `aria-invalid` and `data-invalid`; the previous value stays unchanged. Until the text is a date again, or empty, the input reports "Enter a valid date." as its validation message, so its form won't submit. The hint’s state includes an example date you can show alongside the field.

```ts title="invalid.ts"
import { pageLocale } from "@ui-sdk/core"
import { datePattern } from "@ui-sdk/core/date"
import "@ui-sdk/web/date-picker"
import { Calendar, ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  const { example } = datePattern(pageLocale(root) ?? "en-US")
  root.innerHTML = `
    <ui-date-picker default-value="2026-10-16">
      <div data-slot="row">
        <ui-date-picker-input><input aria-label="Due date" /></ui-date-picker-input>
        <ui-date-picker-trigger>
          <button data-variant="ghost">
            ${createElement(Calendar, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-date-picker-trigger>
      </div>
      <ui-date-picker-content hidden>
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
      </ui-date-picker-content>
      <ui-date-picker-hint>Like ${example}</ui-date-picker-hint>
    </ui-date-picker>
  `
}

export { mount }
```

Type not a date and press Enter to mark the field invalid. Replace it with 10/18/2026 to clear the invalid state.

## Range

`mode="range"` uses one input for the start and another with `end` for the end. The calendar stays open after the start is picked and closes once both dates are chosen. A typed end before the start is invalid.

The range is `null` until both ends are valid. Clearing either input clears the complete value while leaving the other input’s date visible.

For two months side by side, set `months="2"` and add a second `ui-calendar-grid` with `offset="1"`. `page-by="page"` moves both months together.

```ts title="range.ts"
import "@ui-sdk/web/date-picker"
import { Calendar, ChevronLeft, ChevronRight, createElement } from "lucide"

let count = 0

function mount(root: HTMLElement) {
  const id = `date-picker-range-${++count}`
  root.innerHTML = `
    <ui-date-picker mode="range" months="2" month-format="short" default-value="2026-10-12,2026-10-16">
      <div data-slot="row" id="${id}-field">
        <ui-date-picker-input><input aria-label="Check in" placeholder="Check in" /></ui-date-picker-input>
        <span data-slot="hint">–</span>
        <ui-date-picker-input end><input aria-label="Check out" placeholder="Check out" /></ui-date-picker-input>
        <ui-date-picker-trigger>
          <button data-variant="ghost">
            ${createElement(Calendar, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-date-picker-trigger>
      </div>
      <ui-date-picker-content hidden anchor="#${id}-field" align="center">
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
          <ui-calendar-grid>
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
      </ui-date-picker-content>
    </ui-date-picker>
  `
}

export { mount }
```

Choose October 20, then October 23. The calendar stays open after the first date and closes after the second.

## Presets

`ui-date-picker-preset` chooses its `value` and closes the popup. It exposes `aria-pressed` and `data-selected` when that value matches the selection. Your application calculates relative dates, such as the last seven days. In markup, a range preset holds two comma-separated ISO dates.

```ts title="presets.ts"
import "@ui-sdk/web/date-picker"
import { Calendar, ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-date-picker mode="range" today="2026-10-16">
      <div data-slot="row">
        <ui-date-picker-input><input aria-label="Check in" placeholder="Check in" /></ui-date-picker-input>
        <span data-slot="hint">–</span>
        <ui-date-picker-input end><input aria-label="Check out" placeholder="Check out" /></ui-date-picker-input>
        <ui-date-picker-trigger>
          <button data-variant="ghost">
            ${createElement(Calendar, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-date-picker-trigger>
      </div>
      <ui-date-picker-content hidden>
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
        <div data-slot="row">
          <ui-date-picker-preset value="2026-10-10,2026-10-16"><button data-variant="ghost">Last 7 Days</button></ui-date-picker-preset>
          <ui-date-picker-preset value="2026-09-17,2026-10-16"><button data-variant="ghost">Last 30 Days</button></ui-date-picker-preset>
          <ui-date-picker-preset value="2026-10-01,2026-10-31"><button data-variant="ghost">This Month</button></ui-date-picker-preset>
        </div>
      </ui-date-picker-content>
    </ui-date-picker>
  `
}

export { mount }
```

Open the calendar and choose Last 7 Days. Reopen it to see the selected preset.

## Min, Max and Unavailable Dates

`min`, `max`, and `unavailable` apply to typing, calendar selection, presets, and the controller. A date outside those rules is invalid when typed, a preset that holds one is disabled, and the controller refuses it. The controller also refuses a value while the picker is disabled or read-only. [Calendar](./calendar.md#unavailable-dates) explains the available matchers and how unavailable dates differ from the bounds.

For ranges, `min-days` and `max-days` count both endpoints. `allow-unavailable` permits unavailable dates between them, but never as an endpoint. See [Range Limits](./calendar.md#range-limits).

```ts title="min-max.ts"
import "@ui-sdk/web/date-picker"
import { Calendar, ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-date-picker min="2026-10-05" max="2026-11-20" default-value="2026-10-16">
      <div data-slot="row">
        <ui-date-picker-input><input aria-label="Delivery date" /></ui-date-picker-input>
        <ui-date-picker-trigger>
          <button data-variant="ghost">
            ${createElement(Calendar, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-date-picker-trigger>
      </div>
      <ui-date-picker-hint></ui-date-picker-hint>
      <ui-date-picker-content hidden>
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
      </ui-date-picker-content>
    </ui-date-picker>
  `
  root.querySelector("ui-date-picker")!.unavailable = [{ weekday: [0, 6] }]
}

export { mount }
```

Try typing 11/21/2026, past the last allowed date, then 10/17/2026, a Saturday. Both are invalid and can't be picked; 10/19/2026 is accepted.

## Language

`locale` sets the input’s format, hint, month names, and date labels. If you omit it, Date Picker reads the surrounding page’s `lang` after it mounts, with the browser’s language as a fallback. The initial server and client render use English, so they always match. Date strings remain Gregorian ISO dates.

The trigger, popup, and calendar navigation have English accessible labels by default. Pass `aria-label` to translate those controls too.

Calendar’s `week-starts-on`, `weekday-format`, `fixed-weeks`, `show-outside-days`, and `time-zone` options apply here too. [Calendar](./calendar.md#language) shows these options without the popup.

```ts title="locale.ts"
import "@ui-sdk/web/date-picker"
import { Calendar, ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div lang="de">
      <ui-date-picker default-value="2026-10-16">
        <div data-slot="row">
          <ui-date-picker-input><input aria-label="Fälligkeitsdatum" /></ui-date-picker-input>
          <ui-date-picker-trigger>
            <button data-variant="ghost">
              ${createElement(Calendar, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-date-picker-trigger>
        </div>
        <ui-date-picker-hint></ui-date-picker-hint>
        <ui-date-picker-content hidden>
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
        </ui-date-picker-content>
      </ui-date-picker>
    </div>
  `
}

export { mount }
```

Enter 3.12.2026 and press Enter. The field, format hint, and calendar use German dates.

## Clear

`ui-date-picker-clear` clears the value and focuses the input. It gets `data-empty` when there is nothing to clear. Emptying a single-date input clears its value too.

```ts title="clear.ts"
import "@ui-sdk/web/date-picker"
import { Calendar, ChevronLeft, ChevronRight, createElement, X } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-date-picker default-value="2026-10-16">
      <div data-slot="row">
        <ui-date-picker-input><input aria-label="Due date" /></ui-date-picker-input>
        <ui-date-picker-clear>
          <button data-variant="ghost" aria-label="Clear date">
            ${createElement(X, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-date-picker-clear>
        <ui-date-picker-trigger>
          <button data-variant="ghost">
            ${createElement(Calendar, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-date-picker-trigger>
      </div>
      <ui-date-picker-hint></ui-date-picker-hint>
      <ui-date-picker-content hidden>
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
      </ui-date-picker-content>
    </ui-date-picker>
  `
}

export { mount }
```

Press Clear to empty the value and focus the input. The Clear button disappears until there is a value again.

## Disabled and Read Only

`disabled` prevents typing, opening, and selection. `read-only` lets people open the calendar and inspect its dates without changing the value.

```html
<ui-date-picker disabled default-value="2026-10-16"></ui-date-picker>
<ui-date-picker read-only default-value="2026-10-16"></ui-date-picker>
```

## Staying Open

Set `close-on-select` to `false` to keep the calendar open after choosing a date, completing a range, or pressing a preset.

```html
<ui-date-picker close-on-select="false"></ui-date-picker>
```

## Keep It Open Until Both Dates Are Picked

Set `dismissible` to `false` while a choice is incomplete. Escape, an outside press, or the system back gesture then leave the popup open. `dismissattempt` reports intentional attempts, so you can explain what is missing. Focus leaving is refused quietly. The trigger and imperative controls can still close it.

```ts title="dismissible.ts"
import "@ui-sdk/web/date-picker"
import { Calendar, ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-date-picker mode="range" default-month="2026-10" dismissible="false">
      <div data-slot="row">
        <ui-date-picker-input><input aria-label="Check in" placeholder="Check in" /></ui-date-picker-input>
        <span data-slot="hint">–</span>
        <ui-date-picker-input end><input aria-label="Check out" placeholder="Check out" /></ui-date-picker-input>
        <ui-date-picker-trigger>
          <button data-variant="ghost">
            ${createElement(Calendar, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-date-picker-trigger>
      </div>
      <ui-date-picker-content hidden>
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
        <p data-slot="hint" role="alert" hidden>Pick a check-out date to finish your stay.</p>
      </ui-date-picker-content>
    </ui-date-picker>
  `
  const picker = root.querySelector("ui-date-picker")!
  const alert = root.querySelector<HTMLElement>('[role="alert"]')!
  picker.addEventListener("valuechange", (event) => {
    alert.hidden = true
    if (event.detail.value === null) {
      picker.setAttribute("dismissible", "false")
    } else {
      picker.removeAttribute("dismissible")
    }
  })
  picker.addEventListener("dismissattempt", () => (alert.hidden = false))
  picker.addEventListener("openchange", (event) => {
    if (event.detail.value) {
      alert.hidden = true
    }
  })
}

export { mount }
```

Choose a check-in date, then press outside the calendar. The message asks for a check-out date before the popup can be dismissed.

## Popup and Presentation

`ui-date-picker-content` opens below the input by default. Position it with `side`, `align`, and offsets, or provide a custom `anchor`. `container` changes where it renders; `keep-mounted` retains it while closed, and `final-focus` controls focus after it closes. [Popups](../popups.md) covers these shared options.

`presentation="auto"` uses a sheet on small touch screens and a popover elsewhere. `presentation="sheet"` always uses a sheet. Style the two layouts using `data-presentation`.

```ts title="popup.ts"
import "@ui-sdk/web/date-picker"
import { Calendar, ChevronLeft, ChevronRight, createElement } from "lucide"
import { log } from "./log"

let count = 0

function mount(root: HTMLElement) {
  const id = `date-picker-popup-${++count}`
  root.innerHTML = `
    <div data-slot="stack">
      <ui-date-picker default-open="false" presentation="auto" container="#${id}-container">
        <div data-slot="row" id="${id}-anchor">
          <ui-date-picker-input><input aria-label="Due date" /></ui-date-picker-input>
          <ui-date-picker-trigger>
            <button data-variant="ghost">
              ${createElement(Calendar, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-date-picker-trigger>
        </div>
        <ui-date-picker-hint></ui-date-picker-hint>
        <ui-date-picker-content hidden anchor="#${id}-anchor" side-offset="6" collision-padding="16" keep-mounted>
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
        </ui-date-picker-content>
      </ui-date-picker>
      <div id="${id}-container"></div>
    </div>
  `
  const picker = root.querySelector("ui-date-picker")!
  picker.addEventListener("openchange", (event) => {
    log(
      root,
      `${event.detail.value ? "Opened" : "Closed"} (${event.detail.reason})`
    )
  })
  picker.addEventListener("openchangecomplete", (event) => {
    if (!event.detail.value) {
      log(root, "Finished closing")
    }
  })
  picker.addEventListener("monthchange", (event) => {
    log(root, `Showing ${event.detail.value} (${event.detail.reason})`)
  })
}

export { mount }
```

Open the calendar. On a small touch screen it opens as a sheet, and the console logs each open, close and month change.

## Forms

`name` submits an ISO date. In range mode, use `start-name` and `end-name` for separate fields, or `name` to submit both ends under the same name. `required` blocks an empty submission, text that isn't a date blocks one too, a form reset restores `default-value`, and a disabled `fieldset` disables the picker. Form participation begins once the custom elements are defined.

In a [Field](./field.md), the field connects the label, description, and errors to the input, and shows an error for an empty required date or text that isn't a date. Its `name` is used when the picker has none, and a disabled field disables the picker.

```ts title="form.ts"
import "@ui-sdk/web/date-picker"
import "@ui-sdk/web/field"
import { Calendar, ChevronLeft, ChevronRight, createElement } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form data-slot="stack">
      <ui-field name="due">
        <ui-field-label>Due date</ui-field-label>
        <ui-date-picker required>
          <div data-slot="row">
            <ui-date-picker-input><input /></ui-date-picker-input>
            <ui-date-picker-trigger>
              <button data-variant="ghost">
                ${createElement(Calendar, { "aria-hidden": "true" }).outerHTML}
              </button>
            </ui-date-picker-trigger>
          </div>
          <ui-date-picker-content hidden>
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
          </ui-date-picker-content>
        </ui-date-picker>
        <ui-field-description>When the invoice is due.</ui-field-description>
        <div>
          <ui-field-error match="valueMissing">Choose a due date.</ui-field-error>
        </div>
      </ui-field>
      <button type="submit">Submit</button>
    </form>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    log(root, `Submitted due=${new FormData(form).get("due")}`)
  })
}

export { mount }
```

Press Submit with an empty field to see the inline error, then choose a date and submit. The console logs the ISO date.

## Controlled

The selected value, displayed month, and open state are separate. `value` uses the shape for the chosen mode; `month` is the first displayed month, such as `"2026-10"`; `open` is a boolean.

Read and write the element’s `value`, `month`, and `open` properties. Listen for `valuechange`, `monthchange`, and `openchange`, and call `event.preventDefault()` to reject a change. Use `default-value`, `default-month`, and `default-open` for initial state. [State and Events](../state-and-events.md) covers the binding pattern, and the [reason tables](#reasons) list Date Picker’s reasons.

```ts title="controlled.ts"
import "@ui-sdk/web/date-picker"
import { Calendar, ChevronLeft, ChevronRight, createElement } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-date-picker default-value="2026-10-16">
      <div data-slot="row">
        <ui-date-picker-input><input aria-label="Due date" /></ui-date-picker-input>
        <ui-date-picker-trigger>
          <button data-variant="ghost">
            ${createElement(Calendar, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-date-picker-trigger>
      </div>
      <ui-date-picker-hint></ui-date-picker-hint>
      <ui-date-picker-content hidden>
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
      </ui-date-picker-content>
    </ui-date-picker>
  `
  root
    .querySelector("ui-date-picker")!
    .addEventListener("valuechange", (event) => {
      log(root, `${event.detail.value ?? "No date"} (${event.detail.reason})`)
    })
}

export { mount }
```

Type or choose a date. The console logs each value and the reason for the change.

## Driving It from Anywhere

A `createDatePickerController()` instance, set as the element's `controller` property, can set the value, show a month, open or close the popup, and focus a date in the open calendar. The element's `api` has the same methods. [Controllers](../controllers.md) covers setup and lifecycle; the [controller reference](#controller) lists the methods.

```ts title="controller.ts"
import { createDatePickerController } from "@ui-sdk/web/date-picker"
import { Calendar, ChevronLeft, ChevronRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-action="christmas">Choose Christmas</button>
        <button type="button" data-action="open">Open</button>
      </div>
      <ui-date-picker default-value="2026-10-16">
        <div data-slot="row">
          <ui-date-picker-input><input aria-label="Due date" /></ui-date-picker-input>
          <ui-date-picker-trigger>
            <button data-variant="ghost">
              ${createElement(Calendar, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-date-picker-trigger>
        </div>
        <ui-date-picker-hint></ui-date-picker-hint>
        <ui-date-picker-content hidden>
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
        </ui-date-picker-content>
      </ui-date-picker>
    </div>
  `
  const controller = createDatePickerController()
  root.querySelector("ui-date-picker")!.controller = controller
  root
    .querySelector('[data-action="christmas"]')!
    .addEventListener("click", () => controller.setValue("2026-12-25"))
  root
    .querySelector('[data-action="open"]')!
    .addEventListener("click", () => controller.open())
}

export { mount }
```

Press Choose Christmas to set the date from outside, or Open to open the calendar.

## Styling

The root, inputs, and trigger expose `data-disabled`. Invalid input sets `data-invalid` on that input and the root. The root and trigger expose `data-open`; presets expose `data-selected`, and Clear exposes `data-empty`. Calendar days carry [Calendar’s state attributes](./calendar.md#styling).

Each part has a `data-slot`, such as `date-picker-input`, and its state attributes are listed under [Data Attributes](#data-attributes).

### `<ui-date-picker-content>`
- `--anchor-width`: Width of the anchor, usually the trigger. Use it to match widths.
- `--anchor-height`: Height of the anchor.
- `--available-width`: Space beside the popup, up to the viewport edge. Not inherited either.
- `--available-height`: Space between the anchor and the viewport edge. Use it for max-height. Not inherited, so a child that needs it copies it on the popup, like `[--list-height:var(--available-height)]`, and reads `max-h-(--list-height)`. The first popup registers both names for the whole page with `CSS.registerProperty`, so they don't inherit anywhere. A page that needs them to inherit calls it first, with `inherits: true`. An `@property` rule can't, since a registration in script wins.
- `--transform-origin`: The point on the anchor the popup opens from. Use it to scale from the right place.
- `--arrow-offset`: Where the anchor's center falls along the popup's edge, kept `arrowPadding` from the corners. Position a ::before arrow with it.
- `--drawer-progress`: While it presents as a sheet: how far open the sheet is, from 0 closed to 1 at its largest snap point. Never past 1.
- `--drawer-dim`: While it presents as a sheet: how dim the page behind is, from 0 to 1. The backdrop's opacity follows it.
- `--drawer-expand`: While it presents as a sheet: 0 at the second-largest snap point and below, 1 at the largest. With one snap point, the whole travel.
- `--drawer-stack`: While it presents as a sheet: how many sheets opened from inside this one are open above it, rising smoothly as each one opens. Push it back with it.
- `--sheet-backdrop`: Set it yourself: the color the page dims to while it presents as a sheet. Black at 0.2 by default.

### `<ui-date-picker-viewport>`
- `--keyboard-inset`: While it presents as a sheet: how many pixels of the page the on-screen keyboard covers, 0 without one.
- `--visual-viewport-width`: While it presents as a sheet: the width of the part of the page you can see.
- `--visual-viewport-height`: While it presents as a sheet: the height of the part of the page you can see, above the keyboard.
- `--visual-viewport-top`: While it presents as a sheet: how far the part of the page you can see is scrolled from the top of the layout, as when the keyboard pushes it up.

## Data Attributes

### `<ui-date-picker>`
`[data-slot="date-picker"]`

- `data-mode` (`single`, `range`): How the date picker selects.
- `data-open`: Present while the popup is open.
- `data-closed`: Present while the popup is closed, including while it animates out.
- `data-readonly`: Present when the date can be seen but not changed.
- `data-disabled`: Present when the date picker is disabled.
- `data-invalid`: Present when an input holds text that isn't a date, or a date that can't be picked.

### `<ui-date-picker-input>`
`[data-slot="date-picker-input"]`

- `data-disabled`: Present when the date picker is disabled.
- `data-invalid`: Present when an input holds text that isn't a date, or a date that can't be picked.

### `<ui-date-picker-trigger>`
`[data-slot="date-picker-trigger"]`

- `data-open`: Present while the popup is open.
- `data-closed`: Present while the popup is closed, including while it animates out.
- `data-disabled`: Present when the date picker is disabled.

### `<ui-date-picker-content>`
`[data-slot="date-picker-content"]`

- `data-open`: Present while the popup is open.
- `data-presentation` (`popover`, `sheet`): How the popup presents this time it's open.
- `data-closed`: Present while the popup is closed, including while it animates out.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the popup animates out. Style the state you animate to.

### `<ui-date-picker-clear>`
`[data-slot="date-picker-clear"]`

- `data-empty`: Present when there's no date to clear.

### `<ui-date-picker-preset>`
`[data-slot="date-picker-preset"]`

- `data-selected`: Present while the preset's value is the one selected.

## API Reference

Props are attributes in kebab case, like `default-value`, `close-on-select` and `start-name`: `"false"` is false, and numbers are numbers. `value`, `default-value` and `unavailable` take comma-separated dates, and the `unavailable` property takes any matcher, like `{ weekday: [0, 6] }`. `container` and `anchor` take CSS selectors, and `controller` is a property. Callbacks are DOM events. The element is form-associated, so it submits with no hidden input.

### DatePicker

- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.
- `month?` (`string`): The first month shown, like `"2026-10"`. Pass it to control the calendar.
- `defaultMonth?` (`string`): The first month it shows, when uncontrolled. Defaults to the selected date's month, else today's.
- `min?` (`string`): The earliest date that can be picked. Keys stop there, and Previous stops at its month.
- `max?` (`string`): The latest date that can be picked.
- `unavailable?` (`DateMatchers`): Dates that can't be picked, like booked days, as data: ISO dates, `{ from, to }`, `{ weekday: [0, 6] }` for weekends, `{ before }`, `{ after }`, or a function. They stay focusable, so keyboard users hear them.
- `disabled?` (`boolean`): Whether nothing can be picked or focused.
- `readOnly?` (`boolean`): Whether dates can be focused but not picked.
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
- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `mode?` (`DatePickerMode`): How many dates it selects: one, or a range from a start to an end, with an input for each.
- `value?` (`DatePickerValue`): The selected value: an ISO date, `[start, end]` in range mode, or `null`. Pass it to control the date picker.
- `defaultValue?` (`DatePickerValue`): The value it starts with, when uncontrolled, and goes back to when its form resets.
- `valuechange event`: Runs when a date is picked in the calendar (`"item-press"`), a typed date is committed on Enter or blur (`"input-commit"`), a preset or Clear is pressed, the form resets, or a controller sets it. A range changes once both ends are set. `details.cancel()` keeps the value.
- `monthchange event`: Runs when the months the calendar shows want to change, as in Calendar, or a typed date or a preset turns them.
- `open?` (`boolean`): Whether the popup is open. Pass it to control the popup.
- `defaultOpen?` (`boolean`): Whether the popup starts open, when uncontrolled.
- `openchange event`: Runs when the popup wants to open or close. `details.reason` says why, and `details.cancel()` stops it.
- `openchangecomplete event`: Runs once the popup has finished opening or closing, after any animation.
- `closeOnSelect?` (`boolean`): Whether picking a date, or a range's end, or pressing a preset closes the popup.
- `presentation?` (`PresentationSetting<"popover">`): How the popup presents. `"sheet"` slides it up from the bottom of the screen, and `"auto"` does that on small touch screens.
- `name?` (`string`): The name the date submits under, as an ISO date. In range mode, both ends submit under it unless `startName` and `endName` are set.
- `startName?` (`string`): The name a range's start submits under.
- `endName?` (`string`): The name a range's end submits under.
- `form?` (`string`): The id of the form it belongs to, when it isn't inside it.
- `required?` (`boolean`): Whether a date must be entered before its form submits.
- `controller?` (`object`): Drives it from anywhere. Create one with `createDatePickerController()`.
- `dismissible?` (`boolean`): Whether Escape, an outside press, focus or the window leaving, Android's back gesture and a sheet's swipe can close it. Triggers, Close parts and the controller always can. Pass `false` while it holds unsaved work, and ask in `dismissattempt`.
- `dismissattempt event`: Runs when `dismissible` refused a dismissal made on purpose: Escape, an outside press, back or a swipe. Focus or the window leaving is refused without it. Ask "Discard changes?" here.

### DatePickerInput

- `end?` (`boolean`): Whether it's a range's end. The input without it holds the start, or the date.

### DatePickerTrigger

Opens and closes the calendar. `<ui-date-picker-trigger>` wraps a native `button` with `aria-haspopup="dialog"`, named by the chosen date, and makes one if you write none.

### DatePickerHint

Describes the expected format, and its state includes an example date. `<ui-date-picker-hint>` describes the input, and shows the format when left empty.

### DatePickerClear

Clears the value and focuses the input. `<ui-date-picker-clear>` wraps a native `button`, and makes one if you write none.

### DatePickerContent

- `side?` (`Side`): Which side of the anchor the popup opens on. Flips to the other side when there isn't room. Which side of the input the popup opens on.
- `align?` (`Align`): How the popup lines up with the anchor along that side. `start` and `end` follow the reading direction. How the popup lines up with the input along that side.
- `sideOffset?` (`number`): Gap between the anchor and the popup, in pixels. Gap between the input and the popup, in pixels.
- `alignOffset?` (`number`): Shift along the anchor, in pixels. Shift along the input, in pixels.
- `collisionPadding?` (`number`): Space to keep from the viewport edges, in pixels.
- `arrowPadding?` (`number`): Space to keep between the arrow and the popup's corners, in pixels.
- `anchor?` (`string | Anchor | null`): Positions the popup against this instead of its trigger: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. It's read on every check, so it can move. A controller's `open({ anchor })` wins for that open.
- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `finalFocus?` (`PopupFocusTarget`): Where focus goes when the popup closes while focus is inside it.
- `keepMounted?` (`boolean`): Whether the popup stays in the page, hidden, while closed. For animation libraries that drive the exit from state.
### DatePickerPreset

- `value` (`DatePickerValue`): The value it selects: an ISO date, or `[start, end]` in range mode.

`DatePickerTrigger`, `DatePickerHint` and `DatePickerClear` take no props of their own.

### State

What render functions, state-based class names and children functions receive, per part.

`DatePicker`:

- `value` (`DatePickerValue`): The selected value.
- `mode` (`DatePickerMode`): How it selects.
- `open` (`boolean`): Whether the popup is open.
- `disabled` (`boolean`): Whether it can't be used.
- `readOnly` (`boolean`): Whether dates can be seen but not changed.
- `invalid` (`boolean`): Whether an input holds text that isn't a date that can be picked.

`DatePickerInput`:

- `invalid` (`boolean`): Whether its text isn't a date that can be picked, after Enter or blur.
- `disabled` (`boolean`): Whether it can't be used.
- `readOnly` (`boolean`): Whether its text can't be changed.

`DatePickerTrigger`:

- `open` (`boolean`): Whether the popup is open.
- `disabled` (`boolean`): Whether it can't be pressed.

`DatePickerContent`:

- `open` (`boolean`): Whether the popup is open. False while it animates out.
- `presentation` (`"popover" | "sheet"`): How it presents this time it's open.

`DatePickerHint`:

- `placeholder` (`string`): The format, with a letter for each digit, like "MM/DD/YYYY", "TT.MM.JJJJ" in German.
- `example` (`string`): December 31 of this year in the format, like "12/31/2026".

`DatePickerPreset`:

- `selected` (`boolean`): Whether its value is the one selected.
- `disabled` (`boolean`): Whether it can't be pressed.

`DatePickerClear`:

- `empty` (`boolean`): Whether there's nothing to clear.
- `disabled` (`boolean`): Whether it can't be pressed.

### Reasons

`event.detail.reason` says why the value changed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `input-commit` (`KeyboardEvent | FocusEvent`): Enter, or leaving a number input, committed what was typed: a number input parses, clamps and snaps it to the step, and an autocomplete closes its suggestions on it.
- `preset-press`
- `clear-press` (`MouseEvent | KeyboardEvent`): A Clear part was pressed, like on an input, a select or a combobox.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

Why the popup opened or closed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `preset-press`
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `focus-out` (`KeyboardEvent | FocusEvent`): Focus left the layer, or Tab moved it out.
- `window-blur` (`FocusEvent`): The window lost focus.
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.

With `dismissible` false, the refused dismissals `dismissattempt` reports:

- `outside-press` (`MouseEvent`): A press outside the layer.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.

### Controller

Create one with `createDatePickerController()` and pass it as `controller`.

- `getValue()` (`() => DatePickerValue`): The selected value: an ISO date, a `[start, end]` range, or `null`.
- `setValue(value, options?)` (`(value: DatePickerValue, options?: DatePickerChangeOptions<DatePickerValueChangeReason> | undefined) => boolean`): Selects a value. Returns false when canceled, unchanged, disabled, read-only, or holding a date people can't pick, like one past `max`.
- `clear(options?)` (`(options?: DatePickerChangeOptions<DatePickerValueChangeReason> | undefined) => boolean`): Selects nothing, as the Clear part does. Returns false when canceled or unchanged.
- `getMonth()` (`() => string`): The first month the calendar shows, like `"2026-10"`.
- `setMonth(month, options?)` (`(month: string, options?: DatePickerChangeOptions<DatePickerMonthChangeReason> | undefined) => boolean`): Shows a month first. Returns false when canceled or unchanged.
- `previous(options?)` (`(options?: DatePickerChangeOptions<DatePickerMonthChangeReason> | undefined) => boolean`): Shows the months before, as the Previous part does.
- `next(options?)` (`(options?: DatePickerChangeOptions<DatePickerMonthChangeReason> | undefined) => boolean`): Shows the months after, as the Next part does.
- `focus(date?)` (`(date?: string | undefined) => void`): Focuses a date in the open calendar, turning the months to show it, or the date with the tab stop.
- `isOpen()` (`() => boolean`): Whether the popup is open.
- `setOpen(open, options?)` (`(open: boolean, options?: DatePickerChangeOptions<DatePickerOpenChangeReason> | undefined) => boolean`): Opens or closes the popup. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (DatePickerChangeOptions<DatePickerOpenChangeReason> & { signal?: AbortSignal | undefined; }) | undefined) => Promise<...>`): Opens the popup, and resolves once it closes, with why and how. Resolves exactly once and never rejects: on the next close from any source, when `signal` aborts, or with reason `"unmount"` when the date picker leaves the page.
- `close(options?)` (`(options?: DatePickerChangeOptions<DatePickerOpenChangeReason> | undefined) => boolean`): Closes the popup. Returns false when the close was canceled or it was already closed.
- `toggle(options?)` (`(options?: DatePickerChangeOptions<DatePickerOpenChangeReason> | undefined) => boolean`): Opens the popup if it's closed, and closes it if it's open. Returns false when the change was canceled.

### Events

Events fire on their own element and don't bubble, with the new value in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` cancels the change. Type the element as `UiDatePickerElement` for typed listeners.

| Member                     | On               | Description                                               |
| -------------------------- | ---------------- | --------------------------------------------------------- |
| `value` property           | `ui-date-picker` | The selected value. Setting it selects it                 |
| `open` property            | `ui-date-picker` | Whether the popup is open. Setting it opens or closes it  |
| `month` property           | `ui-date-picker` | The calendar's first month. Setting it turns there        |
| `api` property             | `ui-date-picker` | The [controller](#controller)                             |
| `controller` property      | `ui-date-picker` | A controller from `createDatePickerController()`          |
| `valuechange` event        | `ui-date-picker` | `detail: { value, reason, event, source }`                |
| `openchange` event         | `ui-date-picker` | `detail: { value: open, reason, event, source }`          |
| `openchangecomplete` event | `ui-date-picker` | `detail: { value: open }`, once any animation finished    |
| `monthchange` event        | `ui-date-picker` | `detail: { value: month, reason, event, source }`         |
| `dismissattempt` event     | `ui-date-picker` | `detail: { reason, event }`, when a dismissal was refused |

## Accessibility

It follows the [WAI-ARIA date picker dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/): a plain text input that every screen reader handles, a button with `aria-haspopup="dialog"` and `aria-expanded` named by the date chosen, and a dialog holding the calendar's grid. Focus moves into the grid when the dialog opens and back to the button when a date is picked or Escape closes it. Every line below is an automated test.

### Keyboard

| Key             | Where   | Action                                                                        |
| --------------- | ------- | ----------------------------------------------------------------------------- |
| Enter           | Input   | Commit the typed date.                                                        |
| Alt+Down Arrow  | Input   | Open the calendar.                                                            |
| Enter / Space   | Trigger | Open or close the calendar.                                                   |
| Escape          | Popup   | Cancel an unfinished range first; otherwise close the popup.                  |
| Tab / Shift+Tab | Popup   | Move through controls. Leaving the popup closes it when dismissal is allowed. |

Opening focuses the selected date, otherwise today, otherwise the first focusable date. The calendar’s [arrow keys and month navigation](./calendar.md#keyboard) work here too. An ancestor’s `dir="rtl"` reverses Left and Right Arrow to follow the visual order.

### Tested Behavior

- A typed date in the page's format becomes the value on Enter, and the form submits it as ISO.
- Text that isn't a date stays as typed and marks the input invalid.
- Text that isn't a date blocks the form's submit until it's fixed.
- Clearing text that isn't a date lets the form submit.
- A message the app set on the input comes back once the text is a date.
- The date picker element reports text that isn't a date as its own bad input. Web components only.
- The format hint describes the input.
- The trigger opens a dialog with focus on the selected date, and Escape closes it back to the trigger.
- With nothing selected, focus goes to today.
- Picking a day fills the input, closes the dialog and returns focus to the trigger.
- With closeOnSelect off, the dialog stays open after a pick.
- Alt+ArrowDown in the input opens the calendar.
- A typed date opens the calendar on its month.
- A press outside closes the dialog.
- A preset selects its value and closes the dialog.
- Clear empties the value and focuses the input.
- A form reset puts the default value back.
- A required date picker blocks an empty submit.
- Days past min and max can't be typed or picked.
- German reads and writes dates day first.

**Range**

- Picking a start and an end fills both inputs and closes after the end.
- Each end can be typed, and the value changes once both are set.
- An end before the start is invalid.
- An end that isn't a date blocks the form's submit until it's fixed.

Runs in React, Vue and web components.
