# Number Input

Enter numbers, step through values, and format them for a locale.

Use a Number Input for quantities, prices and measurements. It keeps a numeric value while showing formatted text, and steps it with the keyboard, the step buttons, or a drag on its label.

```ts title="basic.ts"
import "@ui-sdk/web/number-input"
import "@ui-sdk/web/field"
import { createElement, Minus, MoveHorizontal, Plus } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-number-input default-value="1" min="1">
        <ui-number-input-scrub-area pixels-per-step="4">
          <ui-field-label>Quantity</ui-field-label>
          <ui-number-input-scrub-area-cursor>
            ${createElement(MoveHorizontal, { "aria-hidden": "true" }).outerHTML}
          </ui-number-input-scrub-area-cursor>
        </ui-number-input-scrub-area>
        <ui-number-input-group>
          <ui-number-input-decrement>
            <button aria-label="Decrease">
              ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-number-input-decrement>
          <ui-number-input-control>
            <input />
          </ui-number-input-control>
          <ui-number-input-increment>
            <button aria-label="Increase">
              ${createElement(Plus, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-number-input-increment>
        </ui-number-input-group>
      </ui-number-input>
    </ui-field>
  `
  root
    .querySelector("ui-number-input")!
    .addEventListener("valuecommit", (event) => {
      log(root, `Quantity ${event.detail.value ?? "empty"}`)
    })
}

export { mount }
```

Drag the Quantity label sideways to scrub the value, or click it to focus the input. Type a number, press ArrowUp or ArrowDown, or hold a step button. The console logs the value once each change is committed.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. Import the field too if you use it. On the server the import does nothing.

```ts
import "@ui-sdk/web/number-input"
import "@ui-sdk/web/field"
```

## Composition

Use the following composition to build a `ui-number-input`:

```text
ui-number-input
├── ui-number-input-scrub-area
│   └── ui-number-input-scrub-area-cursor
└── ui-number-input-group
    ├── ui-number-input-decrement
    │   └── button
    ├── ui-number-input-control
    │   └── input
    └── ui-number-input-increment
        └── button
```

`ui-number-input` holds the numeric value. `ui-number-input-group` wraps the text input and the optional step buttons. `ui-number-input-control` wraps your own `<input>`, and `ui-number-input-decrement` and `ui-number-input-increment` wrap your own `<button>`s, which change the value and repeat while held. Put input styles and accessible names on those native elements. `ui-number-input-scrub-area` is optional and changes the value as you drag it.

Typing updates the value when the text is valid and within bounds. Enter or blur commits it: the text is parsed, clamped, snapped to the step, and formatted. An empty input has the value `null`.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/number-input"
</script>

<ui-number-input default-value="1" min="0">
  <ui-number-input-group>
    <ui-number-input-decrement
      ><button aria-label="Decrease">−</button></ui-number-input-decrement
    >
    <ui-number-input-control
      ><input aria-label="Quantity"
    /></ui-number-input-control>
    <ui-number-input-increment
      ><button aria-label="Increase">+</button></ui-number-input-increment
    >
  </ui-number-input-group>
</ui-number-input>
```

## Field

Wrap the number input in [Field](./field.md) to give it a visible label and a description.

```ts title="field.ts"
import "@ui-sdk/web/number-input"
import "@ui-sdk/web/field"
import { createElement, Minus, Plus } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Tickets</ui-field-label>
      <ui-number-input default-value="2" min="1">
        <ui-number-input-group>
          <ui-number-input-decrement>
            <button aria-label="Decrease">
              ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-number-input-decrement>
          <ui-number-input-control>
            <input />
          </ui-number-input-control>
          <ui-number-input-increment>
            <button aria-label="Increase">
              ${createElement(Plus, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-number-input-increment>
        </ui-number-input-group>
      </ui-number-input>
      <ui-field-description>Each ticket admits one person to the workshop.</ui-field-description>
    </ui-field>
  `
}

export { mount }
```

Click Tickets to focus the input, then type or step its value. Screen readers read the description with the field.

## Min and Max

Use `min` and `max` to set bounds. A step button disables at its bound. Typed values outside the bounds are clamped when committed.

```ts title="min-max.ts"
import "@ui-sdk/web/number-input"
import "@ui-sdk/web/field"
import { createElement, Minus, Plus } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Guests</ui-field-label>
      <ui-number-input default-value="2" min="1" max="8">
        <ui-number-input-group>
          <ui-number-input-decrement>
            <button aria-label="Decrease">
              ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-number-input-decrement>
          <ui-number-input-control>
            <input />
          </ui-number-input-control>
          <ui-number-input-increment>
            <button aria-label="Increase">
              ${createElement(Plus, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-number-input-increment>
        </ui-number-input-group>
      </ui-number-input>
      <ui-field-description>Tables seat between 1 and 8 guests.</ui-field-description>
    </ui-field>
  `
}

export { mount }
```

Change Guests between 1 and 8. Type 20 and press Enter to clamp it to 8. At either bound, that direction's step button is disabled.

## Step and Large Step

`step` sets the usual increment, and defaults to 1. Steps are measured from `min`, or from zero when no minimum is set. When they don't land on `max`, End and the increment button stop at the highest step below it, so stepping keeps the value on the step grid, as [Slider](./slider.md#step-and-bounds) does. Shift, Page Up and Page Down use `large-step`, ten steps by default, and Alt (Option) with an arrow key uses `small-step`, a tenth of a step. [Keyboard](#keyboard) lists every key.

```ts title="step.ts"
import "@ui-sdk/web/number-input"
import "@ui-sdk/web/field"
import { createElement, Minus, Plus } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Hours</ui-field-label>
      <ui-number-input default-value="1.5" min="0" max="24" step="0.25" large-step="1" small-step="0.05">
        <ui-number-input-group>
          <ui-number-input-decrement>
            <button aria-label="Decrease">
              ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-number-input-decrement>
          <ui-number-input-control>
            <input />
          </ui-number-input-control>
          <ui-number-input-increment>
            <button aria-label="Increase">
              ${createElement(Plus, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-number-input-increment>
        </ui-number-input-group>
      </ui-number-input>
      <ui-field-description>Logged in quarter hours.</ui-field-description>
    </ui-field>
  `
}

export { mount }
```

Step Hours by 0.25. Hold Shift to move by 1, or hold Alt (Option) with an arrow key to move by 0.05. Home and End go to 0 and 24.

## Format

Pass `Intl.NumberFormat` options through `format`. The input displays and parses that format while keeping a numeric value. For percentages, `0.15` is displayed as `15%`, and `step` defaults to the smallest percent the format shows: `0.01` for whole percents, `0.0001` with two fraction digits. Set `format` as a property on the element; it is an object.

```ts title="format.ts"
import "@ui-sdk/web/number-input"
import "@ui-sdk/web/field"
import { createElement, Minus, Plus } from "lucide"

const fields = [
  {
    label: "Price",
    defaultValue: 19.99,
    step: 0.01,
    format: { style: "currency", currency: "USD" },
  },
  {
    label: "Discount",
    defaultValue: 0.15,
    step: 0.01,
    format: { style: "percent" },
  },
  {
    label: "Weight",
    defaultValue: 2.5,
    step: 0.1,
    format: { style: "unit", unit: "kilogram" },
  },
] satisfies {
  label: string
  defaultValue: number
  step: number
  format: Intl.NumberFormatOptions
}[]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      ${fields
        .map(
          (field) => `
            <ui-field>
              <ui-field-label>${field.label}</ui-field-label>
              <ui-number-input default-value="${field.defaultValue}" step="${field.step}" min="0">
                <ui-number-input-group>
                  <ui-number-input-decrement>
                    <button aria-label="Decrease">
                      ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
                    </button>
                  </ui-number-input-decrement>
                  <ui-number-input-control>
                    <input />
                  </ui-number-input-control>
                  <ui-number-input-increment>
                    <button aria-label="Increase">
                      ${createElement(Plus, { "aria-hidden": "true" }).outerHTML}
                    </button>
                  </ui-number-input-increment>
                </ui-number-input-group>
              </ui-number-input>
            </ui-field>`
        )
        .join("")}
    </div>
  `
  root
    .querySelectorAll<HTMLElement & { format: Intl.NumberFormatOptions }>(
      "ui-number-input"
    )
    .forEach((el, index) => {
      el.format = fields[index].format
    })
}

export { mount }
```

Edit Price, Discount, or Weight and leave the field to format it. Try entering 5 in Price or 25% in Discount, then use the step buttons.

## Locale

Set `locale` to choose separators, currency symbols, and grouping. Without it, the input follows the page's language or the browser's language after mounting. Server markup uses English when no locale is provided; set a locale explicitly when that first render matters.

```ts title="locale.ts"
import "@ui-sdk/web/number-input"
import "@ui-sdk/web/field"
import { createElement, Minus, Plus } from "lucide"

const fields = [
  {
    label: "Preis",
    locale: "de-DE",
    defaultValue: 1234.5,
    step: 0.01,
    format: { style: "currency", currency: "EUR" },
  },
  {
    label: "Budget",
    locale: "en-IN",
    defaultValue: 1234567,
    step: 1000,
    format: { style: "currency", currency: "INR", maximumFractionDigits: 0 },
  },
] satisfies {
  label: string
  locale: string
  defaultValue: number
  step: number
  format: Intl.NumberFormatOptions
}[]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      ${fields
        .map(
          (field) => `
            <ui-field>
              <ui-field-label>${field.label}</ui-field-label>
              <ui-number-input default-value="${field.defaultValue}" step="${field.step}" locale="${field.locale}" min="0">
                <ui-number-input-group>
                  <ui-number-input-decrement>
                    <button aria-label="Decrease">
                      ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
                    </button>
                  </ui-number-input-decrement>
                  <ui-number-input-control>
                    <input />
                  </ui-number-input-control>
                  <ui-number-input-increment>
                    <button aria-label="Increase">
                      ${createElement(Plus, { "aria-hidden": "true" }).outerHTML}
                    </button>
                  </ui-number-input-increment>
                </ui-number-input-group>
              </ui-number-input>
              <ui-field-description>Formatted for ${field.locale}.</ui-field-description>
            </ui-field>`
        )
        .join("")}
    </div>
  `
  root
    .querySelectorAll<HTMLElement & { format: Intl.NumberFormatOptions }>(
      "ui-number-input"
    )
    .forEach((el, index) => {
      el.format = fields[index].format
    })
}

export { mount }
```

Edit Preis using a comma for decimals, or step Budget to see Indian digit grouping. The displayed and accepted formats follow each field's locale.

## Mouse Wheel

Set `wheel` to step with the mouse wheel while the input is focused. It is off by default.

```ts title="wheel.ts"
import "@ui-sdk/web/number-input"
import "@ui-sdk/web/field"
import { createElement, Minus, Plus } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Font size</ui-field-label>
      <ui-number-input default-value="16" min="8" max="72" wheel>
        <ui-number-input-group>
          <ui-number-input-decrement>
            <button aria-label="Decrease">
              ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-number-input-decrement>
          <ui-number-input-control>
            <input />
          </ui-number-input-control>
          <ui-number-input-increment>
            <button aria-label="Increase">
              ${createElement(Plus, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-number-input-increment>
        </ui-number-input-group>
      </ui-number-input>
      <ui-field-description>Focus the input, then scroll over it.</ui-field-description>
    </ui-field>
  `
}

export { mount }
```

Focus Font size and scroll over it to change the value. Move focus away and scroll again; the value stays unchanged.

## Scrub Area

`ui-number-input-scrub-area` changes the value while you drag it. The handle can be any element inside the number input: the label, as in the first example, or a letter or icon inside the group, as in a design tool. Right and up increase the value. `orientation` chooses an axis, and `pixels-per-step` controls how far the pointer moves per step. Shift and Alt (Option) use the large and small increments.

```ts title="scrub.ts"
import "@ui-sdk/web/number-input"
import { createElement, MoveHorizontal } from "lucide"
import { log } from "./log"

const fields = [
  { label: "X position", handle: "X", defaultValue: 120 },
  { label: "Y position", handle: "Y", defaultValue: 48 },
  { label: "Width", handle: "W", defaultValue: 320, min: 0 },
  { label: "Height", handle: "H", defaultValue: 240, min: 0 },
]

function mount(root: HTMLElement) {
  const title = `frame-${crypto.randomUUID()}`
  root.innerHTML = `
    <div data-slot="card" role="group" aria-labelledby="${title}">
      <h3 id="${title}">Frame</h3>
      <div data-slot="grid">
        ${fields
          .map(
            ({ label, handle, defaultValue, min }) => `
              <ui-number-input default-value="${defaultValue}"${min === undefined ? "" : ` min="${min}"`}>
                <ui-number-input-group>
                  <ui-number-input-scrub-area pixels-per-step="1">
                    <span aria-hidden="true">${handle}</span>
                    <ui-number-input-scrub-area-cursor>
                      ${createElement(MoveHorizontal, { "aria-hidden": "true" }).outerHTML}
                    </ui-number-input-scrub-area-cursor>
                  </ui-number-input-scrub-area>
                  <ui-number-input-control>
                    <input aria-label="${label}" />
                  </ui-number-input-control>
                </ui-number-input-group>
              </ui-number-input>
            `
          )
          .join("")}
      </div>
    </div>
  `
  root.querySelectorAll("ui-number-input").forEach((field, index) => {
    field.addEventListener("valuecommit", (event) => {
      log(root, `${fields[index].label} ${event.detail.value ?? "empty"}`)
    })
  })
}

export { mount }
```

Drag the X, Y, W or H letter sideways to change that value. Hold Shift for larger steps or Alt (Option) for smaller ones. The console logs each value when the drag ends.

Where pointer lock is available, the drag can continue past the edge of the screen. `ui-number-input-scrub-area-cursor` draws a replacement cursor while it is locked. The cursor is placed in the document body with an inline translation; center your icon with negative margins.

To place a scrub area outside its number input, such as on an icon in a toolbar, set the scrub area's `for` attribute to the number input's `id`. More than one scrub area can control the same field.

## Disabled

Set `disabled` on the component or its enclosing fieldset to prevent focus, changes, and form submission.

```html
<ui-field>
  <ui-field-label>Quantity</ui-field-label>
  <ui-number-input default-value="3" disabled>
    <ui-number-input-group>
      <ui-number-input-decrement
        ><button aria-label="Decrease">−</button></ui-number-input-decrement
      >
      <ui-number-input-control><input /></ui-number-input-control>
      <ui-number-input-increment
        ><button aria-label="Increase">+</button></ui-number-input-increment
      >
    </ui-number-input-group>
  </ui-number-input>
  <ui-field-description
    >Sold out. You can't change the quantity.</ui-field-description
  >
</ui-field>
```

Set `disabled` on one step button, on its element like `<ui-number-input-increment disabled>` or on the `<button>` inside it, to turn off only that direction. The other button still steps.

## Read-Only

Set `read-only` to keep the value focusable and included in form data while preventing edits and steps.

```html
<ui-field>
  <ui-field-label>Seats included</ui-field-label>
  <ui-number-input default-value="5" read-only>
    <ui-number-input-group>
      <ui-number-input-decrement
        ><button aria-label="Decrease">−</button></ui-number-input-decrement
      >
      <ui-number-input-control><input /></ui-number-input-control>
      <ui-number-input-increment
        ><button aria-label="Increase">+</button></ui-number-input-increment
      >
    </ui-number-input-group>
  </ui-number-input>
  <ui-field-description>Set by your plan.</ui-field-description>
</ui-field>
```

## Validation

Use `required` to block an empty value. Field associates its error with the input and marks it invalid after an unsuccessful submit. Here, choosing **Continue** while Age is empty shows "Enter your age."

```html
<form>
  <ui-field>
    <ui-field-label>Age</ui-field-label>
    <ui-number-input name="age" required min="18" max="120">
      <ui-number-input-group>
        <ui-number-input-decrement
          ><button aria-label="Decrease">−</button></ui-number-input-decrement
        >
        <ui-number-input-control><input /></ui-number-input-control>
        <ui-number-input-increment
          ><button aria-label="Increase">+</button></ui-number-input-increment
        >
      </ui-number-input-group>
    </ui-number-input>
    <ui-field-error match="valueMissing">Enter your age.</ui-field-error>
  </ui-field>
  <button type="submit">Continue</button>
</form>
```

## Controlled

Set the element's `value` property, and listen for `valuechange`. `valuechange` reports valid changes while an interaction is in progress. `valuecommit` fires when typing is committed, a step key or button is released, or a scrub ends. Use the commit event for work that should happen after the interaction.

```ts title="controlled.ts"
import "@ui-sdk/web/number-input"
import "@ui-sdk/web/field"
import { createElement, Minus, Plus } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-value="4">Reset to 4</button>
        <button type="button" data-value="">Clear</button>
      </div>
      <ui-field>
        <ui-field-label>Servings</ui-field-label>
        <ui-number-input default-value="4" min="1" max="12">
          <ui-number-input-group>
            <ui-number-input-decrement>
              <button aria-label="Decrease">
                ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
              </button>
            </ui-number-input-decrement>
            <ui-number-input-control>
              <input />
            </ui-number-input-control>
            <ui-number-input-increment>
              <button aria-label="Increase">
                ${createElement(Plus, { "aria-hidden": "true" }).outerHTML}
              </button>
            </ui-number-input-increment>
          </ui-number-input-group>
        </ui-number-input>
      </ui-field>
    </div>
  `
  const field = root.querySelector("ui-number-input")!
  field.addEventListener("valuechange", (event) => {
    log(root, `Value ${event.detail.value ?? "empty"} (${event.detail.reason})`)
  })
  field.addEventListener("valuecommit", (event) => {
    log(
      root,
      `Committed ${event.detail.value ?? "empty"} (${event.detail.reason})`
    )
  })
  root.querySelectorAll<HTMLButtonElement>("[data-value]").forEach((button) => {
    button.addEventListener("click", () => {
      field.value = button.dataset.value ? Number(button.dataset.value) : null
    })
  })
}

export { mount }
```

Hold a Servings step button. The console logs each value as it changes, then one Committed line when you let go. Clear sets the value to null, and Reset to 4 restores it.

See [State and Events](../state-and-events.md) for the shared state conventions and [Reasons](#reasons) for the events specific to Number Input.

## Controller

Use the element's `api` property to change or focus the input from other controls. `increment()` and `decrement()` step the value; pass `{ large: true }` for a large step. `setValue()`, `getValue()`, and `focus()` cover direct updates and inspection.

```ts title="controller.ts"
import "@ui-sdk/web/number-input"
import "@ui-sdk/web/field"
import { createElement, Minus, Plus } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-action="out">Zoom Out</button>
        <button type="button" data-action="in">Zoom In</button>
        <button type="button" data-action="reset">Actual Size</button>
        <button type="button" data-action="read">Read</button>
        <button type="button" data-action="focus">Focus</button>
      </div>
      <ui-field>
        <ui-field-label>Zoom</ui-field-label>
        <ui-number-input default-value="100" min="10" max="400" step="10">
          <ui-number-input-group>
            <ui-number-input-decrement>
              <button aria-label="Decrease">
                ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
              </button>
            </ui-number-input-decrement>
            <ui-number-input-control>
              <input />
            </ui-number-input-control>
            <ui-number-input-increment>
              <button aria-label="Increase">
                ${createElement(Plus, { "aria-hidden": "true" }).outerHTML}
              </button>
            </ui-number-input-increment>
          </ui-number-input-group>
        </ui-number-input>
      </ui-field>
    </div>
  `
  const field = root.querySelector("ui-number-input")!
  field.format = { style: "unit", unit: "percent" }
  field.addEventListener("valuechange", (event) => {
    log(root, `Zoom ${event.detail.value ?? "empty"}% (${event.detail.reason})`)
  })
  const zoom = field.api
  const actions: Record<string, () => void> = {
    out: () => zoom.decrement({ large: true }),
    in: () => zoom.increment({ large: true }),
    reset: () => zoom.setValue(100),
    read: () => log(root, `Zoom is ${zoom.getValue()}%`),
    focus: () => zoom.focus(),
  }
  root
    .querySelectorAll<HTMLButtonElement>("[data-action]")
    .forEach((button) => {
      button.addEventListener("click", () => actions[button.dataset.action!]())
    })
}

export { mount }
```

Press Zoom In and Zoom Out to move by 100%, then Actual Size to restore 100%. Read logs the current value, and Focus moves into the field.

[Controllers](../controllers.md) covers creating and sharing a controller.

## Form

The element is form-associated and submits the plain numeric value under `name`. Formatting does not change form data: a displayed amount of $4.50 still submits `4.5`. Empty values submit an empty string.

```ts title="form.ts"
import "@ui-sdk/web/number-input"
import "@ui-sdk/web/field"
import { createElement, Minus, Plus } from "lucide"
import { log } from "./log"

let count = 0

function mount(root: HTMLElement) {
  const formId = `order-${++count}`
  root.innerHTML = `
    <div data-slot="stack">
      <form data-slot="stack" id="${formId}">
        <ui-field>
          <ui-field-label>Quantity</ui-field-label>
          <ui-number-input name="quantity" default-value="2" min="1">
            <ui-number-input-group>
              <ui-number-input-decrement>
                <button aria-label="Decrease">
                  ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
                </button>
              </ui-number-input-decrement>
              <ui-number-input-control>
                <input />
              </ui-number-input-control>
              <ui-number-input-increment>
                <button aria-label="Increase">
                  ${createElement(Plus, { "aria-hidden": "true" }).outerHTML}
                </button>
              </ui-number-input-increment>
            </ui-number-input-group>
          </ui-number-input>
        </ui-field>
        <ui-field>
          <ui-field-label>Tip</ui-field-label>
          <ui-number-input name="tip" default-value="4.5" min="0" step="0.5">
            <ui-number-input-group>
              <ui-number-input-decrement>
                <button aria-label="Decrease">
                  ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
                </button>
              </ui-number-input-decrement>
              <ui-number-input-control>
                <input />
              </ui-number-input-control>
              <ui-number-input-increment>
                <button aria-label="Increase">
                  ${createElement(Plus, { "aria-hidden": "true" }).outerHTML}
                </button>
              </ui-number-input-increment>
            </ui-number-input-group>
          </ui-number-input>
        </ui-field>
      </form>
      <ui-field>
        <ui-field-label>Gift cards</ui-field-label>
        <ui-number-input name="gift-cards" form="${formId}" default-value="0" min="0">
          <ui-number-input-group>
            <ui-number-input-decrement>
              <button aria-label="Decrease">
                ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
              </button>
            </ui-number-input-decrement>
            <ui-number-input-control>
              <input />
            </ui-number-input-control>
            <ui-number-input-increment>
              <button aria-label="Increase">
                ${createElement(Plus, { "aria-hidden": "true" }).outerHTML}
              </button>
            </ui-number-input-increment>
          </ui-number-input-group>
        </ui-number-input>
      </ui-field>
      <div data-slot="row">
        <button type="reset" form="${formId}">Reset</button>
        <button type="submit" form="${formId}" data-variant="solid">Save</button>
      </div>
    </div>
  `
  const [, tip] = root.querySelectorAll("ui-number-input")
  tip.format = { style: "currency", currency: "USD" }
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

Change Quantity or Tip and press Save: the console logs the plain numeric values. Gift cards belongs to the same form through its form ID. Reset restores the defaults.

Set `form` to associate the input with a form elsewhere in the page. A form reset restores the default value and reports the `reset` reason.

## Custom Rendering

Elements have no render functions. The input and step buttons are your own elements, so change them directly, and read state from their data attributes or the `valuechange` event. Here a `valuechange` listener gives the decrement button a tooltip, and shows Max on the increment button once the value reaches its bound.

```ts title="render.ts"
import "@ui-sdk/web/number-input"
import "@ui-sdk/web/field"
import { createElement, Minus, Plus } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Temperature</ui-field-label>
      <ui-number-input default-value="-2" min="-20" max="40">
        <ui-number-input-group>
          <ui-number-input-decrement>
            <button aria-label="Colder">
              ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-number-input-decrement>
          <ui-number-input-control>
            <input />
          </ui-number-input-control>
          <ui-number-input-increment>
            <button aria-label="Warmer"></button>
          </ui-number-input-increment>
        </ui-number-input-group>
      </ui-number-input>
    </ui-field>
  `
  const field = root.querySelector("ui-number-input")!
  field.format = { style: "unit", unit: "celsius" }
  const colder = root.querySelector<HTMLButtonElement>('[aria-label="Colder"]')!
  const warmer = root.querySelector<HTMLButtonElement>('[aria-label="Warmer"]')!
  const plus = createElement(Plus, { "aria-hidden": "true" }).outerHTML
  const show = (value: number | null) => {
    colder.title = value === -20 ? "As cold as it goes" : "Colder"
    warmer.innerHTML = value === 40 ? "<span>Max</span>" : plus
  }
  field.addEventListener("valuechange", (event) => show(event.detail.value))
  show(field.value)
}

export { mount }
```

Press End in Temperature to jump to 40°C. The increment button reads Max; hover the decrement button to see its tooltip.

Each part's state is listed under [State](#state).

## Styling

Style the group as the field's box, and the input and step buttons inside it. `data-disabled` on a step button also means it has reached its bound, and `data-scrubbing` marks every part while a drag changes the value. Inside Field, the native input receives validation attributes such as `data-invalid`. Use logical spacing so the layout follows the surrounding direction.

Each part has a `data-slot`, such as `number-input-group`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### `<ui-number-input>`
`[data-slot="number-input"]`

- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-scrubbing`: Present while a drag on the scrub area changes the value.

### `<ui-number-input-scrub-area>`
`[data-slot="number-input-scrub-area"]`

- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-orientation` (`horizontal`, `vertical`): Which way to drag.
- `data-scrubbing`: Present while a drag on the scrub area changes the value.

### `<ui-number-input-scrub-area-cursor>`
`[data-slot="number-input-scrub-area-cursor"]`

- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-scrubbing`: Present while a drag on the scrub area changes the value.

### `<ui-number-input-group>`
`[data-slot="number-input-group"]`

- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-scrubbing`: Present while a drag on the scrub area changes the value.

### `<ui-number-input-decrement>`
`[data-slot="number-input-decrement"]`

- `data-disabled`: Present when the button can't step: it or the field is disabled, the field is read-only, or the value is at `min`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-at-bound`
- `data-scrubbing`: Present while a drag on the scrub area changes the value.

### `<ui-number-input-control>`
`[data-slot="number-input-control"]`

- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-scrubbing`: Present while a drag on the scrub area changes the value.

### `<ui-number-input-increment>`
`[data-slot="number-input-increment"]`

- `data-disabled`: Present when the button can't step: it or the field is disabled, the field is read-only, or the value is at `max`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-scrubbing`: Present while a drag on the scrub area changes the value.

## API Reference

Props are attributes in kebab case, like `default-value`, `large-step` and `read-only`. `format` and `controller` are properties. Callbacks are DOM events.

### NumberInput

- `value?` (`number | null`): The value, or null for an empty field. Pass it to control the field.
- `defaultValue?` (`number | null`): The value at first, when uncontrolled. A form reset returns to it.
- `valuechange event`: Runs when the value changes: as a typed number becomes valid, and on every step. `details.cancel()` stops it.
- `valuecommit event`: Runs once an interaction that changed the value ends: typing is committed, a key or a button is released, or a scrub ends. For saving.
- `min?` (`number`): The lowest value. Typed values below it are raised to it when committed.
- `max?` (`number`): The highest value. Typed values above it are lowered to it when committed.
- `step?` (`number`): How far one step moves. Committed values snap to steps from `min`, or from 0 without one.
- `largeStep?` (`number`): How far Page Up, Page Down, and Shift with an arrow key, a button, the wheel or a scrub move.
- `smallStep?` (`number`): How far Alt (Option on a Mac) with an arrow key, the wheel or a scrub moves, for fine changes. Values it reaches snap to it rather than to `step`.
- `format?` (`Intl.NumberFormatOptions`): How the value shows: `Intl.NumberFormat` options, like `{ style: "currency", currency: "USD" }`. Typing accepts the same format in the locale, and percents are fractions: 50% is 0.5.
- `locale?` (`string`): The locale for formatting and reading typed numbers. Defaults to the page's `lang`, or the browser's language without one, once the page is interactive. Server markup uses English until then, so it never disagrees with the client.
- `wheel?` (`boolean`): Lets the mouse wheel step the value while the input has focus.
- `disabled?` (`boolean`): Disables it like a native control: it can't be focused or changed, and isn't submitted.
- `readOnly?` (`boolean`): Keeps it focusable and submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission while it's empty, with the browser's own message.
- `name?` (`string`): The name it submits under. The number is submitted as is, like `1234.5`, never formatted.
- `form?` (`string`): The id of a form to belong to, when it isn't inside that form.
- `controller?` (`object`): Steps it from anywhere. Create one with `createNumberInputController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### NumberInputScrubArea

- `orientation?` (`"horizontal" | "vertical"`): Which way to drag: right and up increase.
- `pixelsPerStep?` (`number`): How far the pointer moves for one step, in CSS pixels.
- `controller?` (`object`): Connects a scrub area outside the number input, like an icon in a toolbar, to the number input with this controller. Inside it, it connects on its own. Web components use `for="<number input id>"` instead.

### NumberInputIncrement and NumberInputDecrement

- `disabled?` (`boolean`): Turns off this button alone. Pressing, clicking or holding it doesn't step.

### State

The same state shows as data attributes on each element.

- `value` (`number | null`): The value, or null when empty.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: it stays focusable and submitted, but typing, steps and scrubs don't change it.
- `required` (`boolean`): Whether a form won't submit while it's empty.
- `scrubbing` (`boolean`): Whether a scrub is moving the value.

The buttons' state, `NumberInputButtonState`, says whether that button can step, and whether the value is at its bound, apart from a disabled field:

- `value` (`number | null`): The value, or null when empty.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`. Whether the button can't step, because it or the field is disabled, the field is read-only, or the value is at its bound.
- `readOnly` (`boolean`): Whether it's read-only: it stays focusable and submitted, but typing, steps and scrubs don't change it.
- `required` (`boolean`): Whether a form won't submit while it's empty.
- `scrubbing` (`boolean`): Whether a scrub is moving the value.
- `atBound` (`boolean`): Whether the value is at the bound this button steps toward, like the maximum for the increment.

### Reasons

`event.detail.reason` says why the value changed.

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `input-commit` (`KeyboardEvent | FocusEvent`): Enter, or leaving a number input, committed what was typed: a number input parses, clamps and snaps it to the step, and an autocomplete closes its suggestions on it.
- `step-key` (`KeyboardEvent`): Arrow, Page Up, Page Down, Home or End stepped a slider or a number input.
- `increment-press` (`MouseEvent | PointerEvent`): A number input's increment button was pressed, or held.
- `decrement-press` (`MouseEvent | PointerEvent`): A number input's decrement button was pressed, or held.
- `wheel` (`WheelEvent`): The mouse wheel stepped a focused number input.
- `scrub` (`PointerEvent`): A drag on a number input's scrub area.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods. The `value` property reads and sets the value.

Every write method takes an optional `{ reason, event }`, fires the change event like a press, and returns `false` when the change is canceled.

- `getValue()` (`() => number | null`): The value, or null when the field is empty.
- `setValue(value, options?)` (`(value: number | null, options?: NumberInputChangeOptions | undefined) => boolean`): Sets the value, as a user would. It's clamped and snapped to the step.
- `increment(options?)` (`(options?: (NumberInputChangeOptions & { large?: boolean | undefined; }) | undefined) => boolean`): Steps the value up, by `largeStep` with `{ large: true }`.
- `decrement(options?)` (`(options?: (NumberInputChangeOptions & { large?: boolean | undefined; }) | undefined) => boolean`): Steps the value down, by `largeStep` with `{ large: true }`.
- `focus()` (`() => void`): Moves focus to the input.

### Events

Events fire on their own element and don't bubble, with the value in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` on `valuechange` cancels the change.

| Member                      | On                | Description                                                           |
| --------------------------- | ----------------- | --------------------------------------------------------------------- |
| `value` property, attribute | `ui-number-input` | The value, or null when empty. An empty attribute is empty            |
| `format` property           | `ui-number-input` | `Intl.NumberFormat` options                                           |
| `api` property              | `ui-number-input` | The [controller](#controller)                                         |
| `valuechange` event         | `ui-number-input` | `detail: { value, reason, event, source }`, as the value changes      |
| `valuecommit` event         | `ui-number-input` | `detail: { value, reason, event, source }`, once the interaction ends |

## Accessibility

Follows the keyboard model of the [WAI-ARIA spinbutton pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/) on a native text input, so ordinary text editing works too. Give the input a FieldLabel or `aria-label`, and name both step buttons. Each button points to the input with `aria-controls`.

### Keyboard

| Input                                               | Increment                                          |
| --------------------------------------------------- | -------------------------------------------------- |
| ArrowUp, ArrowDown, or a step button                | `step`, which defaults to 1.                       |
| Shift with an arrow or button; Page Up or Page Down | `large-step`, which defaults to ten steps.         |
| Alt (Option) with an arrow key                      | `small-step`, which defaults to a tenth of a step. |
| Home or End                                         | The minimum or maximum, when set.                  |

Enter commits typed text. The step buttons stay out of the Tab order, because the focused input gives the same steps through its arrow keys.

### Tested Behavior

Every line below is an automated test.

**Keyboard**

- Starts with its default value, formatted.
- ArrowUp and ArrowDown step the value.
- Shift with an arrow key steps by the large step.
- Home and End go to the minimum and the maximum.
- Stepping stops at the bounds.
- Steps keep cents exact.
- The buttons aren't in the tab order.

**Typing**

- Typing a number changes the value.
- A typed value above the maximum is lowered when focus leaves.
- Typed text in the format is read and formatted when focus leaves.
- Typing sends change only once the text is committed.
- Letters can't be typed.
- Arrow keys step from what's typed.
- Text that isn't a number goes back to the value when focus leaves.
- The value commits when focus leaves.

**Buttons**

- The increment and decrement buttons step the value.
- A button at its bound is disabled and marked data-at-bound.
- Holding a button repeats the step.
- A press commits when the button is released.
- A disabled button is marked disabled.
- A disabled button doesn't step when clicked or held, and the other still does.
- <button disabled> inside a step button element stays disabled past a bound. Web components only.
- A button disabled while it's held stops repeating.

**State and forms**

- Submits the number as is, not formatted.
- A disabled field can't be focused or changed.
- A read-only field can be focused, but not changed.
- A required empty field blocks the form.
- The mouse wheel does nothing unless turned on.
- The mouse wheel steps a focused field when turned on.
- A canceled change keeps the value.
- A controlled field follows its value.
- Reads and writes the locale's format.

Runs in React, Vue and web components.

Beyond the pattern:

- Page Up and Page Down step by the large step.
- A form reset returns every field to its default.
- A typed value snaps to the step when focus leaves.
- Enter commits and formats what's typed.
- Holding an arrow key commits once, when the key comes up.
- A field with cents asks for a decimal keypad.
- A scrub steps by distance, whatever the speed.
- A scrub that doesn't move commits nothing.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while moving to a number input with a keyboard.

Runs in React, Vue and web components.
