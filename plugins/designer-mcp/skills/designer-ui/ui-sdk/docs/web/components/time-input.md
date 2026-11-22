# Time Input

Type a time one part at a time, on the clock your user's language uses.

Use a Time Input for a time of day, like a meeting or an opening hour. It works like [Date Input](./date-input.md), with segments for the hour, the minute and, on a 12-hour clock, AM or PM.

```ts title="time.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/time-input"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Meeting time</ui-field-label>
      <ui-time-input default-value="09:30"></ui-time-input>
    </ui-field>
  `
}

export { mount }
```

Click the hour and type 230, then P. Press ArrowUp or ArrowDown on a part to step it.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. Import the field too if you use it. On the server the import does nothing.

```ts
import "@ui-sdk/web/time-input"
import "@ui-sdk/web/field"
```

## Composition

Use the following composition to build a `ui-time-input`:

```text
ui-time-input
├── ui-time-input-segment
│   └── input
└── ui-time-input-segment
```

`<ui-time-input>` renders a group with one `<ui-time-input-segment>` for each part of the time, and the text between them.

## Usage

Put the input in a [Field](./field.md) and give it a label:

```html
<script type="module">
  import "@ui-sdk/web/time-input"
  import "@ui-sdk/web/field"
</script>

<ui-field>
  <ui-field-label>Meeting time</ui-field-label>
  <ui-time-input default-value="09:30"></ui-time-input>
</ui-field>
```

The value is a 24-hour time like `"14:30"`, the same as a native time input's, whatever clock the input shows. Typing, stepping and pasting work as they do in [Date Input](./date-input.md#usage).

## Clock and Seconds

The input shows the locale's clock. Set `hour-cycle` to `12` or `24` to choose one, and `granularity` to `"second"` to add seconds, or `"hour"` to show the hour alone.

```ts title="hour-cycle.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/time-input"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-field>
        <ui-field-label>12-hour clock</ui-field-label>
        <ui-time-input hour-cycle="12" default-value="18:45"></ui-time-input>
      </ui-field>
      <ui-field>
        <ui-field-label>24-hour clock</ui-field-label>
        <ui-time-input hour-cycle="24" default-value="18:45"></ui-time-input>
      </ui-field>
      <ui-field>
        <ui-field-label>With seconds</ui-field-label>
        <ui-time-input granularity="second" hour-cycle="24" default-value="18:45:30"></ui-time-input>
      </ui-field>
    </div>
  `
}

export { mount }
```

The same evening time on a 12-hour clock, a 24-hour clock and with seconds. All three submit 24-hour values.

## Min and Max

`min` and `max` take times like `"09:00"`. A time outside them is invalid: the input sets `data-invalid`, and its form won't submit.

## Form

The element is form-associated and submits the time under `name`, with no hidden input. Set `required` to need a time before the form submits, and `form` to the id of a form elsewhere in the page to submit with it. The [Date Input form example](./date-input.md#form) has a time in it.

## Controlled and Controller

Listen for `valuechange` and set the `value` property, or drive the input with its `api`, as in [Date Input](./date-input.md#controlled).

## Styling

Style it like [Date Input](./date-input.md#styling). The AM/PM segment sets `data-type="dayPeriod"`.

Each part has a `data-slot`, such as `time-input-segment`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### `<ui-time-input>`
`[data-slot="time-input"]`

- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-invalid`: Present while the time is before `min` or after `max`.
- `data-empty`: Present while every segment is empty.

### `<ui-time-input-segment>`
`[data-slot="time-input-segment"]`

- `data-type` (`hour`, `minute`, `second`, `dayPeriod`, `literal`): The segment's unit, or `literal` for the text between segments.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-invalid`: Present while the time is before `min` or after `max`.
- `data-empty`: Present while the segment is empty. It shows its placeholder.

## API Reference

Props are attributes in kebab case, like `default-value`, `hour-cycle` and `read-only`. `value` is also a property, and `controller` is a property. Callbacks are DOM events.

### TimeInput

- `value?` (`string | null`): The value: a time like `"14:30"`, or `"14:30:15"` with seconds, or `null`. Pass it to control the input.
- `defaultValue?` (`string | null`): The value it starts with, when uncontrolled, and goes back to when its form resets.
- `valuechange event`: Runs when the value wants to change: once every segment holds something, and again with `null` when one is emptied. `details.cancel()` keeps the value.
- `granularity?` (`TimeInputGranularity`): The smallest unit it shows.
- `hourCycle?` (`HourCycle`): A 12 or 24 hour clock. Defaults to the locale's.
- `min?` (`string`): The earliest time, like `"09:00"`. A time before it is invalid.
- `max?` (`string`): The latest time, like `"17:30"`. A time after it is invalid.
- `locale?` (`string`): The language whose separators and clock it shows. Defaults to the page's.
- `disabled?` (`boolean`): Whether it can't be used.
- `readOnly?` (`boolean`): Whether the value can be seen but not changed.
- `required?` (`boolean`): Whether a time must be entered before its form submits.
- `name?` (`string`): The name the value submits under.
- `form?` (`string`): The id of the form it belongs to, when it isn't inside it.
- `controller?` (`object`): Drives it from anywhere. Create one with `createTimeInputController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

- `value` (`string | null`): The value, or `null` while empty or partly filled.
- `segments` (`DateInputSegmentData[]`): The segments in the order the locale shows them, with the text between them. Render one part for each.
- `disabled` (`boolean`): Whether it can't be used, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the value can be seen but not changed.
- `invalid` (`boolean`): Whether the value is before `min`, after `max` or an unavailable date.

### Reasons

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `step-key` (`KeyboardEvent`): Arrow, Page Up, Page Down, Home or End stepped a slider or a number input.
- `paste` (`ClipboardEvent`): Files were pasted, like a screenshot, or text and tokens into a token input.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

- `getValue()` (`() => string | null`): The value, or `null` while empty or partly filled.
- `setValue(value, options?)` (`(value: string | null, options?: DateInputChangeOptions | undefined) => boolean`): Sets the value. Returns false when it isn't a value the input can show, or when canceled.
- `clear(options?)` (`(options?: DateInputChangeOptions | undefined) => boolean`): Empties every segment.
- `focus(segment?)` (`(segment?: string | undefined) => void`): Focuses a segment, like `"month"`, or the first one.

### Events

Events fire on their own element and don't bubble, with the value in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` on `valuechange` cancels the change.

| Member              | On                | Description                                                             |
| ------------------- | ----------------- | ----------------------------------------------------------------------- |
| `value` property    | `<ui-time-input>` | The time, or null while empty or partly typed                           |
| `api` property      | `<ui-time-input>` | The [controller](#controller)                                           |
| `valuechange` event | `<ui-time-input>` | `detail: { value, reason, event }`, as a whole value forms or is erased |

## Accessibility

The root is a group, named by its Field's label or by your `aria-label`. Each segment is a spinbutton named by its unit, like "hour" or "AM/PM", with its value, range and text. The keys are the same as in [Date Input](./date-input.md#keyboard).

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
