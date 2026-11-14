# Slider

Adjust a number or a range with draggable thumbs and keyboard controls.

Use a slider to pick a number or a range along a scale, like a volume or a price range, by dragging a thumb or with the arrow keys.

<ComponentExample
  name="slider/basic"
  inspect
  caption="Drag the thumb, or focus it and use the arrow keys, to adjust Volume."
/>

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. Import the field too if you use it. On the server the import does nothing.

```ts
import "@ui-sdk/web/slider"
import "@ui-sdk/web/field"
```

## Composition

Use the following composition to build a `ui-slider`:

```text
ui-slider
├── ui-slider-value
└── ui-slider-control
    └── ui-slider-track
        ├── ui-slider-indicator
        └── ui-slider-thumb
```

A control handles presses around the track. Put a thumb on that track for each value.

- **ui-slider** holds the value and is a group around the thumbs.
- **ui-slider-control** is where presses land. Pressing it moves the nearest thumb and starts a drag. Give it some height around a thin track.
- **ui-slider-track** is the rail the thumbs move along. Thumbs and the indicator are placed in percentages of it with inline styles, so give it a size. It's the positioned box.
- **ui-slider-indicator** fills the track up to a single thumb, or between the first and last thumb of a range.
- **ui-slider-thumb** is what you drag. Give each one a size.
- **ui-slider-value** shows the formatted value, and a range joined with an en dash. It's optional.

Each thumb renders a visually hidden `<input type="range">` inside itself. That input is what takes focus, so
screen readers on phones adjust it with their own gestures. Style focus on the thumb with `:has(:focus-visible)`.
`<ui-slider>` is form-associated, so it is what the form sees. An empty `<ui-slider-value>` shows the
formatted value.

A single thumb is named by a `ui-field-label` in a `ui-field`, or by `aria-label` on the thumb. In a range, give
each thumb its own `aria-label`, like "Minimum price", and name the group with a `ui-field-label` or
`aria-label` on the slider.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/slider"
</script>

<ui-slider default-value="50">
  <ui-slider-value></ui-slider-value>
  <ui-slider-control>
    <ui-slider-track>
      <ui-slider-indicator></ui-slider-indicator>
      <ui-slider-thumb aria-label="Volume"></ui-slider-thumb>
    </ui-slider-track>
  </ui-slider-control>
</ui-slider>
```

## Range

Write a range as numbers joined with a slash, like `default-value="25/50"`, then render one thumb per number. Thumbs take their index from their order, so give each its own name, like "Minimum price". The indicator fills the space between the first and the last thumb, and the `ui-field-label` names the group.

```ts title="range.ts"
import "@ui-sdk/web/slider"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-slider default-value="25/50" step="5">
        <div data-slot="row">
          <ui-field-label>Price</ui-field-label>
          <ui-slider-value></ui-slider-value>
        </div>
        <ui-slider-control>
          <ui-slider-track>
            <ui-slider-indicator></ui-slider-indicator>
            <ui-slider-thumb aria-label="Minimum price"></ui-slider-thumb>
            <ui-slider-thumb aria-label="Maximum price"></ui-slider-thumb>
          </ui-slider-track>
        </ui-slider-control>
      </ui-slider>
    </ui-field>
  `
  const slider = root.querySelector("ui-slider")!
  slider.format = {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }
}

export { mount }
```

Move either end of Price. The thumbs stay in order.

## Multiple Thumbs

Any number of thumbs works the same way. They never pass each other, and a press on the track moves the nearest one.

```ts title="multiple.ts"
import "@ui-sdk/web/slider"
import "@ui-sdk/web/field"

const thumbs = ["Low", "Medium", "High"]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-slider default-value="10/20/70" step="10">
        <div data-slot="row">
          <ui-field-label>Alert thresholds</ui-field-label>
          <ui-slider-value></ui-slider-value>
        </div>
        <ui-slider-control>
          <ui-slider-track>
            <ui-slider-indicator></ui-slider-indicator>
            ${thumbs.map((label) => `<ui-slider-thumb aria-label="${label}"></ui-slider-thumb>`).join("")}
          </ui-slider-track>
        </ui-slider-control>
      </ui-slider>
    </ui-field>
  `
  root.querySelector("ui-slider")!.format = { style: "unit", unit: "percent" }
}

export { mount }
```

Adjust Low, Medium and High independently, without moving one past another.

## Vertical

Set `orientation="vertical"` and give the slider a height. The bottom is the minimum, ArrowUp increases the value, and every part gets `data-orientation`, so `[data-orientation="vertical"]` styles the vertical axis.

```ts title="vertical.ts"
import "@ui-sdk/web/slider"
import "@ui-sdk/web/field"

const channels = [
  { label: "Bass", value: 50 },
  { label: "Treble", value: 25 },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="row">
      ${channels
        .map(
          (channel) => `
            <ui-field>
              <ui-slider orientation="vertical" default-value="${channel.value}">
                <ui-slider-control>
                  <ui-slider-track>
                    <ui-slider-indicator></ui-slider-indicator>
                    <ui-slider-thumb></ui-slider-thumb>
                  </ui-slider-track>
                </ui-slider-control>
              </ui-slider>
              <ui-field-label>${channel.label}</ui-field-label>
            </ui-field>
          `
        )
        .join("")}
    </div>
  `
}

export { mount }
```

Drag up or down, or use the arrow keys, to adjust Bass and Treble.

## Field

Put the slider in a `ui-field`. The label names the thumb, the description describes it, and `ui-slider-value` shows the value beside the label. Screen readers don't announce `ui-slider-value` as it changes, since the thumb already says its value.

```ts title="field.ts"
import "@ui-sdk/web/slider"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-slider default-value="0.3" min="0" max="1" step="0.01">
        <div data-slot="row">
          <ui-field-label>Volume</ui-field-label>
          <ui-slider-value></ui-slider-value>
        </div>
        <ui-slider-control>
          <ui-slider-track>
            <ui-slider-indicator></ui-slider-indicator>
            <ui-slider-thumb></ui-slider-thumb>
          </ui-slider-track>
        </ui-slider-control>
      </ui-slider>
      <ui-field-description>How loud notifications play.</ui-field-description>
    </ui-field>
  `
  const slider = root.querySelector("ui-slider")!
  slider.format = { style: "percent" }
}

export { mount }
```

Click the Volume label to focus the thumb, then use the arrow keys to change the value.

## Disabled

Set `disabled`. A disabled slider can't be focused or moved, and isn't submitted. A disabled `<fieldset>` around it disables it too.

```ts title="disabled.ts"
import "@ui-sdk/web/slider"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-slider default-value="50" disabled>
        <div data-slot="row">
          <ui-field-label>Brightness</ui-field-label>
          <ui-slider-value></ui-slider-value>
        </div>
        <ui-slider-control>
          <ui-slider-track>
            <ui-slider-indicator></ui-slider-indicator>
            <ui-slider-thumb></ui-slider-thumb>
          </ui-slider-track>
        </ui-slider-control>
      </ui-slider>
      <ui-field-description>Managed by your organization.</ui-field-description>
    </ui-field>
  `
}

export { mount }
```

Brightness keeps its value, but can't be focused or dragged.

## Controlled

Listen for `valuechange`, and set the element's `value` property to change it from your app. The value keeps its shape: a number stays a number and an array stays an array. Every change carries a [reason](#reasons), like `drag`, `track-press` or `step-key`, and `event.detail.thumb` says which thumb moved. Call `event.preventDefault()` to keep the current value. Setting `value` fires `valuechange` too, with the `imperative` reason, so Reset logs a line as well.

```ts title="controlled.ts"
import "@ui-sdk/web/slider"
import "@ui-sdk/web/field"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Reset</button>
      </div>
      <ui-field>
        <ui-slider default-value="0.3/0.7" min="0" max="1" step="0.1">
          <div data-slot="row">
            <ui-field-label>Temperature</ui-field-label>
            <ui-slider-value></ui-slider-value>
          </div>
          <ui-slider-control>
            <ui-slider-track>
              <ui-slider-indicator></ui-slider-indicator>
              <ui-slider-thumb aria-label="Minimum temperature"></ui-slider-thumb>
              <ui-slider-thumb aria-label="Maximum temperature"></ui-slider-thumb>
            </ui-slider-track>
          </ui-slider-control>
        </ui-slider>
      </ui-field>
    </div>
  `
  const slider = root.querySelector("ui-slider")!
  slider.addEventListener("valuechange", (event) => {
    const { value, reason } = event.detail
    log(root, `${[value].flat().join(" – ")} (${reason})`)
  })
  root
    .querySelector("button")!
    .addEventListener("click", () => (slider.value = [0.3, 0.7]))
}

export { mount }
```

Drag either Temperature thumb to log the range and its reason. Reset sets the value from outside.

## Step and Bounds

`min` and `max` set the bounds, 0 and 100 by default, and `step` sets how far one step moves, counted from `min`. Decimal steps avoid floating-point drift, so a 0.1 step can reach 0.3 cleanly. When the steps from `min` don't land on `max`, the highest step below it is the end.

```ts title="step.ts"
import "@ui-sdk/web/slider"
import "@ui-sdk/web/field"

const ticks = (count: number) =>
  `<div data-slot="ticks" aria-hidden="true">${"<span></span>".repeat(count)}</div>`

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-field>
        <ui-slider default-value="2010" min="1990" max="2030" step="5">
          <div data-slot="row">
            <ui-field-label>Year</ui-field-label>
            <ui-slider-value></ui-slider-value>
          </div>
          <ui-slider-control>
            <ui-slider-track>
              <ui-slider-indicator></ui-slider-indicator>
              <ui-slider-thumb></ui-slider-thumb>
            </ui-slider-track>
          </ui-slider-control>
          ${ticks(9)}
        </ui-slider>
      </ui-field>
      <ui-field>
        <ui-slider default-value="0.5" min="0" max="1" step="0.05">
          <div data-slot="row">
            <ui-field-label>Opacity</ui-field-label>
            <ui-slider-value></ui-slider-value>
          </div>
          <ui-slider-control>
            <ui-slider-track>
              <ui-slider-indicator></ui-slider-indicator>
              <ui-slider-thumb></ui-slider-thumb>
            </ui-slider-track>
          </ui-slider-control>
          ${ticks(21)}
        </ui-slider>
      </ui-field>
    </div>
  `
  root.querySelector("ui-slider")!.format = { useGrouping: false }
}

export { mount }
```

Move Year in steps of five, and Opacity in steps of 0.05.

## Large Step

Arrow keys move one step. Page Up, Page Down and Shift with an arrow key move by `large-step`, which is ten steps unless you set it. Home and End go to the bounds.

```ts title="large-step.ts"
import "@ui-sdk/web/slider"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-slider default-value="100" min="25" max="400" large-step="25">
        <div data-slot="row">
          <ui-field-label>Zoom</ui-field-label>
          <ui-slider-value></ui-slider-value>
        </div>
        <ui-slider-control>
          <ui-slider-track>
            <ui-slider-indicator></ui-slider-indicator>
            <ui-slider-thumb></ui-slider-thumb>
          </ui-slider-track>
        </ui-slider-control>
      </ui-slider>
    </ui-field>
  `
  const slider = root.querySelector("ui-slider")!
  slider.format = { style: "unit", unit: "percent" }
}

export { mount }
```

Focus Zoom and press an arrow key to move 1%, then Page Up, Page Down or Shift with an arrow key to move 25%.

## Distance Between Thumbs

Set `min-steps-between-thumbs` to keep neighbouring thumbs that many steps apart. A thumb stops at its neighbour, and Home and End move it only as far as its neighbour allows.

```ts title="min-steps.ts"
import "@ui-sdk/web/slider"
import "@ui-sdk/web/field"

const time = (minutes: number) =>
  `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-slider default-value="540/1020" min="0" max="1440" step="15" min-steps-between-thumbs="16">
        <div data-slot="row">
          <ui-field-label>Opening hours</ui-field-label>
          <ui-slider-value></ui-slider-value>
        </div>
        <ui-slider-control>
          <ui-slider-track>
            <ui-slider-indicator></ui-slider-indicator>
            <ui-slider-thumb aria-label="Opens"></ui-slider-thumb>
            <ui-slider-thumb aria-label="Closes"></ui-slider-thumb>
          </ui-slider-track>
        </ui-slider-control>
      </ui-slider>
    </ui-field>
  `
  const slider = root.querySelector("ui-slider")!
  slider.format = time
}

export { mount }
```

Move either end of Opening hours. The thumbs stay at least four hours apart.

## Format and Locale

`format` takes `Intl.NumberFormat` options, like `{ style: "currency", currency: "USD" }` or `{ style: "percent" }`, or a function of the value. It sets what `ui-slider-value` shows and what screen readers announce for each thumb, while the value stays a plain number. `locale` sets separators, digits and symbol placement. Without it, the slider uses the page's `lang`, or the browser's language, once the page is interactive. Server markup uses English until then, so it never disagrees with the client.

`format` is an object or a function, so set it as a property. `locale` is an attribute.

```ts title="format.ts"
import "@ui-sdk/web/slider"
import "@ui-sdk/web/field"

const sliders = [
  {
    label: "Budget",
    defaultValue: 40,
    max: 100,
    step: 1,
    format: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
  },
  {
    label: "Opacity",
    defaultValue: 0.6,
    max: 1,
    step: 0.01,
    format: { style: "percent" },
  },
  {
    label: "Weight",
    defaultValue: 20,
    max: 50,
    step: 0.5,
    format: { style: "unit", unit: "kilogram" },
  },
  {
    label: "Duration",
    defaultValue: 90,
    max: 600,
    step: 15,
    format: (seconds: number) =>
      `${Math.floor(seconds / 60)} min ${seconds % 60} s`,
  },
  {
    label: "Preis",
    defaultValue: 40,
    max: 100,
    step: 1,
    format: { style: "currency", currency: "EUR" },
    locale: "de-DE",
  },
] satisfies {
  label: string
  defaultValue: number
  max: number
  step: number
  format: Intl.NumberFormatOptions | ((value: number) => string)
  locale?: string
}[]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      ${sliders
        .map(
          (slider) => `
            <ui-field>
              <ui-slider
                default-value="${slider.defaultValue}"
                max="${slider.max}"
                step="${slider.step}"${"locale" in slider ? ` locale="${slider.locale}"` : ""}
              >
                <div data-slot="row">
                  <ui-field-label>${slider.label}</ui-field-label>
                  <ui-slider-value></ui-slider-value>
                </div>
                <ui-slider-control>
                  <ui-slider-track>
                    <ui-slider-indicator></ui-slider-indicator>
                    <ui-slider-thumb></ui-slider-thumb>
                  </ui-slider-track>
                </ui-slider-control>
              </ui-slider>
            </ui-field>
          `
        )
        .join("")}
    </div>
  `
  root.querySelectorAll("ui-slider").forEach((slider, index) => {
    slider.format = sliders[index].format
  })
}

export { mount }
```

Adjust Budget, Opacity, Weight, Duration and Preis to compare currency, a percentage, a unit, a custom function and German formatting.

## Saving on Commit

`valuechange` runs on every step of a drag. `valuecommit` runs once, when the interaction that changed the value ends: the pointer lifts, the key comes up, or a screen reader adjusts it. Use the commit event to save once per interaction. A press that doesn't change the value commits nothing.

```ts title="commit.ts"
import "@ui-sdk/web/slider"
import "@ui-sdk/web/field"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-slider default-value="50">
        <div data-slot="row">
          <ui-field-label>Brightness</ui-field-label>
          <ui-slider-value></ui-slider-value>
        </div>
        <ui-slider-control>
          <ui-slider-track>
            <ui-slider-indicator></ui-slider-indicator>
            <ui-slider-thumb></ui-slider-thumb>
          </ui-slider-track>
        </ui-slider-control>
      </ui-slider>
    </ui-field>
  `
  root.querySelector("ui-slider")!.addEventListener("valuecommit", (event) => {
    const { value, reason } = event.detail
    log(root, `Saved ${value} (${reason})`)
  })
}

export { mount }
```

Drag Brightness and release it, or press an arrow key. The console logs the value once, when you let go.

## Controller

The element's `api` moves the slider from anywhere with `setValue()`, reads it with `getValue()` and focuses a thumb with `focus()`. Values set through it are clamped, snapped to the step and sorted, and reported with the `imperative` reason.

```ts title="controller.ts"
import "@ui-sdk/web/slider"
import "@ui-sdk/web/field"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-action="mute">Mute</button>
        <button type="button" data-action="louder">Louder</button>
        <button type="button" data-action="read">Read</button>
        <button type="button" data-action="focus">Focus</button>
      </div>
      <ui-field>
        <ui-slider default-value="40">
          <div data-slot="row">
            <ui-field-label>Volume</ui-field-label>
            <ui-slider-value></ui-slider-value>
          </div>
          <ui-slider-control>
            <ui-slider-track>
              <ui-slider-indicator></ui-slider-indicator>
              <ui-slider-thumb></ui-slider-thumb>
            </ui-slider-track>
          </ui-slider-control>
        </ui-slider>
      </ui-field>
    </div>
  `
  const slider = root.querySelector("ui-slider")!
  const volume = slider.api
  const actions: Record<string, () => void> = {
    mute: () => volume.setValue(0),
    louder: () => volume.setValue(Number(volume.getValue()) + 10),
    read: () => log(root, `Volume is ${volume.getValue()}`),
    focus: () => volume.focus(),
  }
  root
    .querySelectorAll<HTMLButtonElement>("[data-action]")
    .forEach((button) => {
      button.addEventListener("click", () => actions[button.dataset.action!]())
    })
  slider.addEventListener("valuechange", (event) => {
    const { value, reason } = event.detail
    log(root, `Volume ${value} (${reason})`)
  })
}

export { mount }
```

Use Mute, Louder and Focus to operate Volume from outside the slider. The console logs each change with the imperative reason, and Read logs the value.

## Form

`<ui-slider>` is form-associated, so it is what the form sees. It takes its own `name`, `form` and `disabled`, so `FormData`, `form.reset()`, a disabled `<fieldset>` and the browser's restore all work.

- **Submit:** a single thumb submits its number under `name`, like `40`. A range submits `"start/end"`, like `200/800`. Without a name, it submits nothing.
- **Reset:** a form reset returns it to `default-value`, with the `reset` reason.
- **Join a form from elsewhere:** set `form` to the id of a form.

`required` adds `data-required`. A slider always has a value, so it never blocks a form.

```ts title="form.ts"
import "@ui-sdk/web/slider"
import "@ui-sdk/web/field"
import type { UiSliderElement } from "@ui-sdk/web/slider"
import { log } from "./log"

function mount(root: HTMLElement) {
  const form = crypto.randomUUID()
  root.innerHTML = `
    <div data-slot="stack">
      <form id="${form}" data-slot="stack">
        <ui-field>
          <ui-slider name="price" default-value="200/800" max="1000" step="10">
            <div data-slot="row">
              <ui-field-label>Price</ui-field-label>
              <ui-slider-value></ui-slider-value>
            </div>
            <ui-slider-control>
              <ui-slider-track>
                <ui-slider-indicator></ui-slider-indicator>
                <ui-slider-thumb aria-label="Minimum price"></ui-slider-thumb>
                <ui-slider-thumb aria-label="Maximum price"></ui-slider-thumb>
              </ui-slider-track>
            </ui-slider-control>
          </ui-slider>
        </ui-field>
        <ui-field>
          <ui-slider name="rating" default-value="3" min="1" max="5">
            <div data-slot="row">
              <ui-field-label>Minimum rating</ui-field-label>
              <ui-slider-value></ui-slider-value>
            </div>
            <ui-slider-control>
              <ui-slider-track>
                <ui-slider-indicator></ui-slider-indicator>
                <ui-slider-thumb></ui-slider-thumb>
              </ui-slider-track>
            </ui-slider-control>
          </ui-slider>
        </ui-field>
      </form>
      <ui-field>
        <ui-slider name="distance" form="${form}" default-value="25" max="100" step="5">
          <div data-slot="row">
            <ui-field-label>Distance</ui-field-label>
            <ui-slider-value></ui-slider-value>
          </div>
          <ui-slider-control>
            <ui-slider-track>
              <ui-slider-indicator></ui-slider-indicator>
              <ui-slider-thumb></ui-slider-thumb>
            </ui-slider-track>
          </ui-slider-control>
        </ui-slider>
      </ui-field>
      <div data-slot="row">
        <button type="submit" form="${form}" data-variant="solid">Save</button>
        <button type="reset" form="${form}">Reset</button>
      </div>
    </div>
  `
  root.querySelector<UiSliderElement>('ui-slider[name="distance"]')!.format = {
    style: "unit",
    unit: "kilometer",
  }
  root.querySelector("form")!.addEventListener("submit", (event) => {
    event.preventDefault()
    const data = [...new FormData(event.currentTarget as HTMLFormElement)].map(
      ([name, value]) => `${name}=${value}`
    )
    log(root, `Submitted ${data.join(", ")}`)
  })
}

export { mount }
```

Adjust the filters and press Save to log the submitted values. Distance sits outside the form and joins it by id. Reset restores the defaults.

## Read-Only

Set `read-only` to keep the slider focusable and submitted, while drags, keys and screen reader adjustments leave its value alone.

```html
<ui-field>
  <ui-field-label>Storage</ui-field-label>
  <ui-slider name="storage" default-value="50" read-only>
    <ui-slider-control>
      <ui-slider-track>
        <ui-slider-indicator></ui-slider-indicator>
        <ui-slider-thumb></ui-slider-thumb>
      </ui-slider-track>
    </ui-slider-control>
  </ui-slider>
  <ui-field-description>Set by your plan.</ui-field-description>
</ui-field>
```

## Custom Rendering

Elements have no render functions. Put anything inside a part, and style it from its data attributes and CSS variables, like `data-dragging` on a thumb. A `<ui-slider-value>` you write text into keeps it. Here a `valuechange` listener writes the thumb's value into a bubble inside the thumb, and the value with a percent sign into `<ui-slider-value>`.

```ts title="render.ts"
import "@ui-sdk/web/slider"
import "@ui-sdk/web/field"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-slider default-value="60">
        <div data-slot="row">
          <ui-field-label>Brightness</ui-field-label>
          <ui-slider-value>60%</ui-slider-value>
        </div>
        <ui-slider-control>
          <ui-slider-track>
            <ui-slider-indicator></ui-slider-indicator>
            <ui-slider-thumb><span data-slot="output">60</span></ui-slider-thumb>
          </ui-slider-track>
        </ui-slider-control>
      </ui-slider>
    </ui-field>
  `
  const slider = root.querySelector("ui-slider")!
  const text = root.querySelector("ui-slider-value")!
  const output = root.querySelector('[data-slot="output"]')!
  slider.addEventListener("valuechange", (event) => {
    text.textContent = `${event.detail.value}%`
    output.textContent = String(event.detail.value)
  })
}

export { mount }
```

Focus or drag the Brightness thumb to show its value above it.

See [Parts and Composition](../parts-and-composition.md) for the rendering contract and [State](#state) for each part's fields.

## Styling

Parts are unstyled, apart from the positions they need: thumbs and the indicator get `position: absolute` and their place along the track in percent, as inline styles. Give the control some height around a thin track, the track a size and a background, and each thumb a size. The thumb's range input is what takes focus, so draw the focus ring on the thumb with `:has(:focus-visible)`, and style a drag with `data-dragging`.

Each part has a `data-slot`, such as `slider-thumb`, and its state attributes are listed under [Data Attributes](#data-attributes).

The indicator and thumbs also write CSS variables, for anything else that should follow them, like a label above a thumb.

### `<ui-slider-indicator>`
- `--slider-indicator-start`: Where the indicator starts along the track, as a percentage. 0% for a single thumb.
- `--slider-indicator-size`: How much of the track the indicator covers, as a percentage.

### `<ui-slider-thumb>`
- `--slider-thumb-position`: Where the thumb sits along the track, as a percentage from the start. Use it for a label that follows the thumb.

## Data Attributes

### `<ui-slider>`
`[data-slot="slider"]`

- `data-orientation` (`horizontal`, `vertical`): The slider's axis.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-dragging`: Present while a thumb is being dragged.

### `<ui-slider-value>`
`[data-slot="slider-value"]`

- `data-orientation` (`horizontal`, `vertical`): The slider's axis.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-dragging`: Present while a thumb is being dragged.

### `<ui-slider-control>`
`[data-slot="slider-control"]`

- `data-orientation` (`horizontal`, `vertical`): The slider's axis.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-dragging`: Present while a thumb is being dragged.

### `<ui-slider-track>`
`[data-slot="slider-track"]`

- `data-orientation` (`horizontal`, `vertical`): The slider's axis.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-dragging`: Present while a thumb is being dragged.

### `<ui-slider-indicator>`
`[data-slot="slider-indicator"]`

- `data-orientation` (`horizontal`, `vertical`): The slider's axis.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-dragging`: Present while a thumb is being dragged.

### `<ui-slider-thumb>`
`[data-slot="slider-thumb"]`

- `data-orientation` (`horizontal`, `vertical`): The slider's axis.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-index` (`0`, `1`): Which value the thumb shows, from 0.
- `data-dragging`: Present while this thumb is being dragged.

## API Reference

Props are attributes in kebab case, like `default-value` and `min-steps-between-thumbs`. A range is written as `"20/80"`. `format` and `controller` are properties. Callbacks are DOM events.

### Slider

- `value?` (`Value`): The value: a number for one thumb, or an array with one number per thumb, like `[20, 80]` for a range. Pass it to control the slider.
- `defaultValue?` (`Value`): The value at first, when uncontrolled. A form reset returns to it.
- `valuechange event`: Runs while the value changes: on every step of a drag or a key. `details.thumb` says which thumb moved, and `details.cancel()` stops it.
- `valuecommit event`: Runs once an interaction that changed the value ends: the pointer lifts, the key comes up, or a screen reader adjusts it. For saving.
- `min?` (`number`): The lowest value.
- `max?` (`number`): The highest value. When the steps from `min` don't land on it, the highest step below it is the end.
- `step?` (`number`): How far one step moves, from `min`.
- `largeStep?` (`number`): How far Page Up, Page Down and Shift with an arrow key move.
- `minStepsBetweenThumbs?` (`number`): How many steps apart neighbouring thumbs stay. Thumbs never pass each other.
- `orientation?` (`"horizontal" | "vertical"`): The slider's axis. Vertical sliders grow upward.
- `disabled?` (`boolean`): Disables it like a native control: thumbs can't be focused or moved, and nothing is submitted.
- `readOnly?` (`boolean`): Keeps it focusable and submitted, but stops drags, keys and screen reader adjustments from changing it.
- `required?` (`boolean`): Marks it required, with `data-required`. A slider always has a value, so it never blocks a form.
- `name?` (`string`): The name it submits under: the number, or a range as `"start/end"`. Without one, it submits nothing.
- `form?` (`string`): The id of a form to belong to, when it isn't inside that form.
- `format?` (`NumberFormat`): How values read, for screen readers and `SliderValue`: `Intl.NumberFormat` options, like `{ style: "currency", currency: "EUR" }`, or a function of the value.
- `locale?` (`string`): The locale values are formatted in. Defaults to the page's `lang`, or the browser's language without one, once the page is interactive. Server markup uses English until then, so it never disagrees with the client.
- `controller?` (`{ getValue: () => Value; setValue(value: Value, options?: SliderChangeOptions): boolean; focus: (thumb?: number) => void; }`): Moves the slider from anywhere. Create one with `createSliderController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### SliderThumb

- `index?` (`number`): Which value the thumb shows, from 0. Give each thumb of a range its own.

### State

The same state shows as data attributes on each element. Every part gets the slider's state.

- `value` (`number | number[]`): The value: a number, or one number per thumb.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: it stays focusable and submitted, but drags and keys don't change it.
- `required` (`boolean`): Whether it's marked required.
- `dragging` (`boolean`): Whether a thumb is being dragged.
- `orientation` (`"horizontal" | "vertical"`): The slider's axis.

Thumbs add their own fields, and have their own value, `thumbValue`, in place of the whole `value`:

- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: it stays focusable and submitted, but drags and keys don't change it.
- `required` (`boolean`): Whether it's marked required.
- `dragging` (`boolean`): Whether a thumb is being dragged.
- `orientation` (`"horizontal" | "vertical"`): The slider's axis.
- `index` (`number`): Which value the thumb shows.
- `thumbValue` (`number`): The thumb's own value.
- `percent` (`number`): Where the thumb sits, from 0 to 100.

`ui-slider-value` adds the formatted text:

- `value` (`number | number[]`): The value: a number, or one number per thumb.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: it stays focusable and submitted, but drags and keys don't change it.
- `required` (`boolean`): Whether it's marked required.
- `dragging` (`boolean`): Whether a thumb is being dragged.
- `orientation` (`"horizontal" | "vertical"`): The slider's axis.
- `text` (`string`): The formatted value, a range joined with an en dash.

### Reasons

`event.detail.reason` says why the value changed.

- `track-press` (`PointerEvent`): A press on a slider's track or an area's surface moved the nearest thumb there.
- `drag` (`PointerEvent`): A slider thumb or a resize handle was dragged, or an item was dragged to a new place in a list.
- `step-key` (`KeyboardEvent`): Arrow, Page Up, Page Down, Home or End stepped a slider or a number input.
- `accessibility-adjust` (`Event`): A screen reader's adjust gesture, like a swipe up or down on a slider.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods. The `value` property reads and sets the value.

`setValue()` takes an optional `{ reason, event }`, fires the change event like a drag, and returns `false` when the change is canceled.

- `getValue()` (`() => Value`): The value: a number, or one number per thumb.
- `setValue(value, options?)` (`(value: Value, options?: SliderChangeOptions | undefined) => boolean`): Sets the value, as a user would. It's clamped, snapped to the step and sorted.
- `focus(thumb?)` (`(thumb?: number | undefined) => void`): Moves focus to a thumb, the first by default.

### Events

Events fire on their own element and don't bubble, with the value in `event.detail.value` and the `reason`, `thumb` and `event` beside it. Calling `preventDefault()` on `valuechange` cancels the change.

| Member                      | On          | Description                                                                  |
| --------------------------- | ----------- | ---------------------------------------------------------------------------- |
| `value` property, attribute | `ui-slider` | The value. The attribute sets it as text, like `"40"` or `"20/80"`           |
| `format` property           | `ui-slider` | `Intl.NumberFormat` options or a function, for the value's text              |
| `api` property              | `ui-slider` | The [controller](#controller)                                                |
| `valuechange` event         | `ui-slider` | `detail: { value, reason, thumb, event, source }`, on every step             |
| `valuecommit` event         | `ui-slider` | `detail: { value, reason, thumb, event, source }`, once the interaction ends |

## Accessibility

The slider follows the [WAI-ARIA slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/), and the [multi-thumb slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/) for ranges. Each thumb is a native range input, named by a `ui-field-label` or its own `aria-label`, and the slider is a group around them.

### Keyboard

Focus a thumb to use these keys. Tab moves through the thumbs in order.

| Key                                        | Moves the thumb                                                       |
| ------------------------------------------ | --------------------------------------------------------------------- |
| ArrowRight or ArrowUp                      | One `step` up. In right to left, ArrowRight moves down.               |
| ArrowLeft or ArrowDown                     | One `step` down. In right to left, ArrowLeft moves up.                |
| Page Up, Page Down, or Shift with an arrow | By `large-step`, ten steps by default.                                |
| Home or End                                | To the minimum or maximum, or as far as a neighbouring thumb lets it. |

### Tested Behavior

Every line below is an automated test.

**Keyboard**

- Starts at its default value.
- ArrowRight and ArrowUp increase it by one step.
- ArrowLeft and ArrowDown decrease it by one step.
- Page Up and Page Down move by the large step.
- Shift with an arrow key moves by the large step.
- Home and End go to the minimum and the maximum.
- A value never goes past the bounds.
- Tab moves through the thumbs in order.
- Home and End move a range thumb as far as its neighbour.
- A range thumb stops at its neighbour.
- A canceled change keeps the value.
- A controlled slider follows its value.

**Pointer**

- Pressing the track moves the thumb there.
- Pressing the track focuses the thumb.
- Pressing a range's track moves the nearest thumb.
- Dragging a thumb follows the pointer.
- Grabbing a thumb off center doesn't move it.
- Dragging past the end stops at the bound.
- Dragging continues outside the slider.
- Dragging right from stacked thumbs moves the upper one.
- The value commits once, when the pointer lifts.
- A screen reader's adjustment reaches the form as one input and one change.
- A drag sends input as it moves, and change once when the pointer lifts.
- Pressing a thumb without moving commits nothing.
- A press on the track commits.
- The thumb sits at its value along the track.

**Vertical**

- It says it's vertical.
- ArrowUp increases it and ArrowDown decreases it.
- The bottom is the minimum.
- Dragging up increases it.

**Value and state**

- The value part shows the value, and a range joined with a dash.
- The value reads in the format and the locale.
- A disabled slider can't be focused or changed.
- Its parts say when it's dragged.
- A single slider submits its value under its name.

Runs in React, Vue and web components.

Beyond the pattern:

- A dragged range thumb stops at its neighbour, as the APG's multi-thumb slider says.
- Each range thumb's own range ends at its neighbour.
- A form reset returns every slider to its default.
- Holding an arrow key commits once, when the key comes up.
- Dragging left from stacked thumbs moves the lower one.
- Pressing the track beside stacked thumbs moves the one on that side.
- A key moves a thumb as close to its neighbour as the minimum distance allows.
- Touch drags on the control never scroll the page.
- A range submits one start/end value.
- Clicking a range's label focuses its first thumb.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while moving to a slider with a keyboard.
- A range thumb announces how far it can go and its formatted value.

Runs in React, Vue and web components.
