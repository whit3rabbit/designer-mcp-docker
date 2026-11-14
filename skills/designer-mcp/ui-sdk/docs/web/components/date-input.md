# Date Input

Type a date one part at a time, in the order your user's language writes it.

Use a Date Input for dates people know by heart, like a birthday or a booking date. Each part of the date is its own small input, ordered the way the locale writes it.

```ts title="basic.ts"
import "@ui-sdk/web/date-input"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Start date</ui-field-label>
      <ui-date-input></ui-date-input>
    </ui-field>
  `
}

export { mount }
```

Click the month and type 11042026. Each part moves to the next as it fills. Press ArrowUp or ArrowDown on a part to step it.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. Import the field too if you use it. On the server the import does nothing.

```ts
import "@ui-sdk/web/date-input"
import "@ui-sdk/web/field"
```

## Composition

Use the following composition to build a `ui-date-input`:

```text
ui-date-input
├── ui-date-input-segment
│   └── input
└── ui-date-input-segment
```

`<ui-date-input>` renders a group with one `<ui-date-input-segment>` for each part of the date: month, day and year in English, day, month and year in German. Each segment you type in holds an `<input>`. The slashes or dots between them are segments too, as plain text. The input renders its segments for you; give it a `<template>` only to change them, as in [Custom Rendering](#custom-rendering).

## Usage

Put the input in a [Field](./field.md) and give it a label:

```html
<script type="module">
  import "@ui-sdk/web/date-input"
  import "@ui-sdk/web/field"
</script>

<ui-field>
  <ui-field-label>Start date</ui-field-label>
  <ui-date-input default-value="2026-11-02"></ui-date-input>
</ui-field>
```

The value is an ISO date string like `"2026-11-02"`, the same as a native date input's. It stays `null` until every segment holds something, so your app only sees whole dates.

Type digits and each segment fills, then moves on. A month that can't take another digit, like 4, moves on at once. Typing a separator, like `/` or `.`, moves on too. The day is kept within its month: moving from January 31 to February shows the 28th. Paste a whole date into any segment, as `2026-11-02` or written the way the locale writes it.

## Field

The Field's label names the group, and clicking it focuses the first segment. Its description is read with the input.

```ts title="field.ts"
import "@ui-sdk/web/date-input"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Birthday</ui-field-label>
      <ui-date-input name="birthday"></ui-date-input>
      <ui-field-description>We send a card on the day.</ui-field-description>
    </ui-field>
  `
}

export { mount }
```

Click Birthday to focus the month, then type a date. Screen readers read the description with the input.

## Date and Time

Set `granularity` to `"hour"`, `"minute"` or `"second"` to add the time. The value becomes a local date and time like `"2026-11-02T14:30"`. For a time alone, use [Time Input](./time-input.md).

```ts title="date-time.ts"
import "@ui-sdk/web/date-input"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Departure</ui-field-label>
      <ui-date-input granularity="minute" default-value="2026-11-02T14:30"></ui-date-input>
    </ui-field>
  `
}

export { mount }
```

Tab through the date and time. Type a P or an A in the last segment to switch between AM and PM.

## Min and Max

`min` and `max` take ISO dates. A date outside them is invalid: the input sets `data-invalid`, and its form won't submit.

```ts title="min-max.ts"
import "@ui-sdk/web/date-input"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Check-in</ui-field-label>
      <ui-date-input min="2026-01-01" max="2026-12-31" default-value="2026-06-15"></ui-date-input>
      <ui-field-description>Any day in 2026.</ui-field-description>
      <ui-field-error></ui-field-error>
    </ui-field>
  `
}

export { mount }
```

Change the year of Check-in to 2027 to see it turn invalid, then back to 2026.

## Unavailable Dates

The `unavailable` property takes the same matchers as [Calendar](./calendar.md#unavailable-dates): ISO dates, `{ from, to }` ranges, weekdays like `{ weekday: [0, 6] }`, or a function. An unavailable date is invalid with the message "This date isn't available."

```ts title="unavailable.ts"
import "@ui-sdk/web/date-input"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Delivery date</ui-field-label>
      <ui-date-input default-value="2026-11-02"></ui-date-input>
      <ui-field-description>We deliver Monday to Friday.</ui-field-description>
      <ui-field-error></ui-field-error>
    </ui-field>
  `
  root.querySelector("ui-date-input")!.unavailable = { weekday: [0, 6] }
}

export { mount }
```

Step the day of Delivery date back from Monday the 2nd to Sunday the 1st. The input turns invalid until you pick a weekday again.

## Locale

The input reads its order, separators and clock from `locale`, or from the page's language when you leave it out. The digits are always 0 to 9, and the calendar is always the Gregorian one, so the value means the same date everywhere. On the server, the input renders in English until it reads the page's language; set `locale` when that first render matters.

```ts title="locale.ts"
import "@ui-sdk/web/date-input"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-field>
        <ui-field-label>Date (en-GB)</ui-field-label>
        <ui-date-input locale="en-GB" default-value="2026-11-02"></ui-date-input>
      </ui-field>
      <ui-field>
        <ui-field-label>Datum (de-DE)</ui-field-label>
        <ui-date-input locale="de-DE" default-value="2026-11-02"></ui-date-input>
      </ui-field>
      <ui-field>
        <ui-field-label>日付 (ja-JP)</ui-field-label>
        <ui-date-input locale="ja-JP" default-value="2026-11-02"></ui-date-input>
      </ui-field>
    </div>
  `
}

export { mount }
```

The same date in British English, German and Japanese. Each orders its parts its own way.

## Disabled

Set `disabled` on the input, or on its Field or fieldset, to keep it from focus and from its form.

```ts title="disabled.ts"
import "@ui-sdk/web/date-input"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Start date</ui-field-label>
      <ui-date-input default-value="2026-11-02" disabled></ui-date-input>
    </ui-field>
  `
}

export { mount }
```

Click Start date or press Tab to reach it. Focus skips it, and the date stays November 2, 2026.

## Read-Only

Set `read-only` for a date people can focus, read and submit as it is.

```ts title="read-only.ts"
import "@ui-sdk/web/date-input"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Signed on</ui-field-label>
      <ui-date-input default-value="2026-11-02" read-only></ui-date-input>
    </ui-field>
  `
}

export { mount }
```

Focus Signed on and press ArrowUp or type a digit. The date stays the same.

## Form

The element is form-associated and submits the ISO date under `name`, with no hidden input. An empty or partly typed date submits an empty string. Set `required` to need a date before the form submits. Enter in a segment submits the form with what was typed.

```ts title="form.ts"
import "@ui-sdk/web/date-input"
import "@ui-sdk/web/field"
import "@ui-sdk/web/time-input"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form data-slot="stack">
      <ui-field>
        <ui-field-label>Date</ui-field-label>
        <ui-date-input name="date" default-value="2026-11-02" required></ui-date-input>
        <ui-field-error></ui-field-error>
      </ui-field>
      <ui-field>
        <ui-field-label>Time</ui-field-label>
        <ui-time-input name="time" default-value="09:30" required></ui-time-input>
        <ui-field-error></ui-field-error>
      </ui-field>
      <div data-slot="row">
        <button type="reset">Reset</button>
        <button type="submit" data-variant="solid">Book</button>
      </div>
    </form>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const data = [...new FormData(form)].map(
      ([name, value]) => `${name}=${value}`
    )
    log(root, `Submitted ${data.join(", ")}`)
  })
}

export { mount }
```

Clear the day of Date with Backspace and choose Book to see the form stop. Fill it in and choose Book: the console logs the values. Reset brings back the defaults.

A partly typed date stops the form too, with "Enter a valid date." Set `form` to the id of a form elsewhere in the page to submit and validate with it. A form reset restores `default-value` and reports the `reset` reason.

## Controlled

Listen for `valuechange` to read changes, and set the element's `value` property to update it from your app. The event fires with each whole date, and with `null` once any part of it is erased. A half-typed date already reads `null`, so setting the value to `null` leaves it as typed. Call `clear()` on the element's [`api`](#controller) to empty every segment.

```ts title="controlled.ts"
import "@ui-sdk/web/date-input"
import "@ui-sdk/web/field"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Clear</button>
      </div>
      <ui-field>
        <ui-field-label>Due date</ui-field-label>
        <ui-date-input default-value="2026-11-02"></ui-date-input>
      </ui-field>
    </div>
  `
  const input = root.querySelector("ui-date-input")!
  input.addEventListener("valuechange", (event) => {
    log(root, `Due date ${event.detail.value ?? "empty"}`)
  })
  root.querySelector("button")!.addEventListener("click", () => {
    input.value = null
  })
}

export { mount }
```

Change Due date: the console logs each whole date. Clear sets the value to null.

See [State and Events](../state-and-events.md) for the shared conventions and [Reasons](#reasons) for why each change happened.

## Controller

Use the element's `api` to set, clear or focus the input from elsewhere. It also accepts a controller created with `createDateInputController()` as its `controller` property. `focus("year")` focuses a segment by its unit.

```ts title="controller.ts"
import "@ui-sdk/web/date-input"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-action="christmas">Christmas</button>
        <button type="button" data-action="year">Edit Year</button>
        <button type="button" data-action="clear">Clear</button>
      </div>
      <ui-field>
        <ui-field-label>Publish on</ui-field-label>
        <ui-date-input></ui-date-input>
      </ui-field>
    </div>
  `
  const publish = root.querySelector("ui-date-input")!.api
  const actions: Record<string, () => void> = {
    christmas: () => publish.setValue("2026-12-25"),
    year: () => publish.focus("year"),
    clear: () => publish.clear(),
  }
  root
    .querySelectorAll<HTMLButtonElement>("[data-action]")
    .forEach((button) => {
      button.addEventListener("click", () => actions[button.dataset.action!]())
    })
}

export { mount }
```

Choose Christmas to set the date through `api`, Edit Year to focus the year, or Clear to empty it.

[Controllers](../controllers.md) covers creating and sharing a controller.

## Custom Rendering

Put a `<template>` inside the input with the `<ui-date-input-segment>` every segment copies. The input renders a copy for each segment, in the locale's order. Segments you type in get the `<input>` from your copy, or a new one; the text between segments replaces the copy's content.

```ts title="segments.ts"
import "@ui-sdk/web/date-input"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Start date</ui-field-label>
      <ui-date-input default-value="2026-11-02">
        <template>
          <ui-date-input-segment><input /></ui-date-input-segment>
        </template>
      </ui-date-input>
    </ui-field>
  `
}

export { mount }
```

Each segment here is a copy of the template's segment, in the locale's order.

Each part's state is listed under [State](#state).

## Styling

Style the root as the field's box, and its segments inside it. Every segment sets `data-type` to its unit, so you can make the year wider or mute the text between segments, which has `data-type="literal"`. An empty segment sets `data-empty` and shows its placeholder. The root sets `data-invalid` while the date is out of range or unavailable.

Each part has a `data-slot`, such as `date-input-segment`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### `<ui-date-input>`
`[data-slot="date-input"]`

- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-invalid`: Present while the date is before `min`, after `max` or unavailable.
- `data-empty`: Present while every segment is empty.

### `<ui-date-input-segment>`
`[data-slot="date-input-segment"]`

- `data-type` (`year`, `month`, `day`, `hour`, `minute`, `second`, `dayPeriod`, `literal`): The segment's unit, or `literal` for the text between segments.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-invalid`: Present while the date is before `min`, after `max` or unavailable.
- `data-empty`: Present while the segment is empty. It shows its placeholder.

## API Reference

Props are attributes in kebab case, like `default-value`, `hour-cycle` and `read-only`. `value` is also a property, and `unavailable` and `controller` are properties. Callbacks are DOM events.

### DateInput

- `value?` (`string | null`): The value: an ISO date like `"2026-11-02"`, with a time granularity a date and time like `"2026-11-02T14:30"`, or `null`. Pass it to control the input.
- `defaultValue?` (`string | null`): The value it starts with, when uncontrolled, and goes back to when its form resets.
- `valuechange event`: Runs when the value wants to change: once every segment holds something, and again with `null` when one is emptied. `details.cancel()` keeps the value.
- `granularity?` (`DateInputGranularity`): The smallest unit it shows. `"day"` shows a date, and `"hour"`, `"minute"` or `"second"` add the time down to it.
- `hourCycle?` (`HourCycle`): A 12 or 24 hour clock for the time. Defaults to the locale's.
- `min?` (`string`): The earliest value, as an ISO date or date and time. A value before it is invalid.
- `max?` (`string`): The latest value. A date alone takes any time that day. A value after it is invalid.
- `unavailable?` (`DateMatchers`): Dates that can't be chosen, as in Calendar: ISO dates, `{ from, to }` ranges, weekdays or a function. A value on one is invalid.
- `locale?` (`string`): The language whose order, separators and clock it shows. Defaults to the page's.
- `disabled?` (`boolean`): Whether it can't be used.
- `readOnly?` (`boolean`): Whether the value can be seen but not changed.
- `required?` (`boolean`): Whether a value must be entered before its form submits.
- `name?` (`string`): The name the value submits under.
- `form?` (`string`): The id of the form it belongs to, when it isn't inside it.
- `controller?` (`object`): Drives it from anywhere. Create one with `createDateInputController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### DateInputSegment

- `segment` (`DateInputSegmentData`): The segment it shows, from the root's `segments`.

### State

What the `api` reads and parts reflect as attributes.

- `value` (`string | null`): The value, or `null` while empty or partly filled.
- `segments` (`DateInputSegmentData[]`): The segments in the order the locale shows them, with the text between them. Render one part for each.
- `disabled` (`boolean`): Whether it can't be used, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the value can be seen but not changed.
- `invalid` (`boolean`): Whether the value is before `min`, after `max` or an unavailable date.

Each segment's state, `DateInputSegmentState`, is the segment with the input's state beside it, reflected on `<ui-date-input-segment>`:

- `key` (`string`): Tells segments apart: the type, or `"literal-<n>"` for the text between them.
- `type` (`DateInputSegmentType`)
- `text` (`string`): What it shows: the number, padded, or AM and PM in the locale. Empty while it holds nothing.
- `value` (`number | null`): The number it holds, or `null` while empty. AM is 0 and PM is 1.
- `min` (`number`): The smallest number it takes.
- `max` (`number`): The largest number it takes, like the days in the month.
- `empty` (`boolean`): Whether it holds nothing yet.
- `editable` (`boolean`): Whether it's a segment you type in, rather than the text between segments.
- `label` (`string`): Its name in the locale, like "month", which names it to assistive technology.
- `disabled` (`boolean`): Whether it can't be used.
- `readOnly` (`boolean`): Whether its value can't be changed.
- `invalid` (`boolean`): Whether the value is before `min`, after `max` or an unavailable date.

### Reasons

`details.reason` says why the value changed.

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `step-key` (`KeyboardEvent`): Arrow, Page Up, Page Down, Home or End stepped a slider or a number input.
- `paste` (`ClipboardEvent`): Files were pasted, like a screenshot, or text and tokens into a token input.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createDateInputController()` and pass it as `controller`.

Every write method takes an optional `{ reason, event }`, runs the change callback like typing, and returns `false` when the change is canceled.

- `getValue()` (`() => string | null`): The value, or `null` while empty or partly filled.
- `setValue(value, options?)` (`(value: string | null, options?: DateInputChangeOptions | undefined) => boolean`): Sets the value. Returns false when it isn't a value the input can show, or when canceled.
- `clear(options?)` (`(options?: DateInputChangeOptions | undefined) => boolean`): Empties every segment.
- `focus(segment?)` (`(segment?: string | undefined) => void`): Focuses a segment, like `"month"`, or the first one.

### Events

Events fire on their own element and don't bubble, with the value in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` on `valuechange` cancels the change.

| Member              | On                | Description                                                             |
| ------------------- | ----------------- | ----------------------------------------------------------------------- |
| `value` property    | `<ui-date-input>` | The ISO date, or null while empty or partly typed                       |
| `api` property      | `<ui-date-input>` | The [controller](#controller)                                           |
| `valuechange` event | `<ui-date-input>` | `detail: { value, reason, event }`, as a whole value forms or is erased |

## Accessibility

The root is a group, named by its Field's label or by your `aria-label`. Each segment is a [spinbutton](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/) named by its unit, like "month", with its value, range and text. An empty segment reads as "Empty". The text between segments is hidden from screen readers, which read each segment's name instead.

Segments are real inputs, so phones show a number pad. They appear once the element is defined.

### Keyboard

| Key                    | Action                                                                      |
| ---------------------- | --------------------------------------------------------------------------- |
| 0 to 9                 | Fill the segment, then move to the next one.                                |
| ArrowUp / ArrowDown    | Step the segment by one, wrapping around. An empty segment starts at today. |
| PageUp / PageDown      | Step by more: a year by 5, a month by 3, a day by 7, minutes by 15.         |
| Home / End             | Go to the segment's first or last value.                                    |
| ArrowLeft / ArrowRight | Move to the segment before or after.                                        |
| Backspace              | Remove the last digit, then empty the segment, then move back.              |
| Delete                 | Empty the segment.                                                          |
| A / P                  | Choose AM or PM, in a time with a 12-hour clock.                            |
| Enter                  | Submit the form with what was typed.                                        |
| Tab / Shift+Tab        | Move through the segments, then out of the input.                           |

In a right-to-left page, the segments keep the locale's order, and ArrowLeft and ArrowRight follow the order on screen.

### Tested Behavior

Every line below is an automated test.

- Each unit is a spinbutton in the locale's order.
- Another locale orders the segments its own way.
- Typing fills each segment, moves on and reports the date once.
- A press on the box or between segments focuses the nearest segment.
- A digit that can't start a longer number moves on at once.
- A separator moves to the next segment.
- Typing with separators over a filled date or time keeps every segment.
- ArrowUp and ArrowDown step a segment and wrap around.
- PageUp and PageDown take bigger steps.
- Home and End go to a segment's first and last values.
- ArrowLeft and ArrowRight move between segments.
- Tab moves through the segments, then out.
- Backspace empties a segment, then moves back.
- A day past the end of a new month is moved back to its last day.
- Pasting a date fills every segment.
- A time takes hours, minutes and AM or PM.
- A 24-hour clock has no AM or PM.
- A date with a time shows its hour and minute too.
- A controller sets and clears the date.
- A canceled change keeps the date.
- The form submits the ISO date and time under their names.
- Enter submits the form with what was typed.
- Resetting the form brings back the default date.
- A partly filled date can't be submitted.
- A required empty date can't be submitted.
- A date after max is invalid.
- An unavailable date is invalid.
- The field's label focuses the first segment.
- A read-only date takes focus but doesn't change.
- A disabled date can't be focused.

Runs in React, Vue and web components.
