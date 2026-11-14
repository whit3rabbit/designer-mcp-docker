# Toggle

Keep a button pressed, or group toggles with a shared value and arrow-key navigation.

Use a toggle for a button that stays on until you press it again, like starring a document or turning on Bold. Put several in a toggle group to share one value, as a text editor's formatting buttons or a view switcher do.

```ts title="basic.ts"
import "@ui-sdk/web/toggle"
import { createElement, Star } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="card">
      <div data-slot="stack">
        <h3>Q3 Roadmap</h3>
        <p data-slot="hint">Edited by Hollis Grant</p>
      </div>
      <ui-toggle>
        <button aria-label="Star">
          <ui-toggle-icon data-variant="fill">${createElement(Star, { "aria-hidden": "true" }).outerHTML}</ui-toggle-icon>
        </button>
      </ui-toggle>
    </div>
  `
}

export { mount }
```

Press the star beside Q3 Roadmap, or focus it and press Enter or Space. It fills in while pressed, and its accessible name stays Star.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. On the server the import does nothing.

```ts
import "@ui-sdk/web/toggle"
```

## Composition

Use the following composition to build a `ui-toggle`:

```text
ui-toggle
└── button
    └── ui-toggle-icon
```

And a `ui-toggle-group`:

```text
ui-toggle-group
├── ui-toggle
│   └── button
│       └── ui-toggle-icon
└── ui-toggle
    └── button
        └── ui-toggle-icon
```

`ui-toggle` wraps a native button, which reports its state with `aria-pressed`. `ui-toggle-icon` is optional: it holds an icon and hides it from screen readers. In a group, give each toggle a `value`; the group's value lists the pressed ones.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/toggle"
</script>

<ui-toggle>
  <button aria-label="Star">
    <ui-toggle-icon><svg aria-hidden="true">…</svg></ui-toggle-icon>
  </button>
</ui-toggle>
```

Keep the label the same in both states: screen readers announce whether the button is pressed. An icon-only toggle needs an `aria-label`, as above. Set `default-pressed` to start pressed. The toggle always uses `type="button"`, so pressing it never submits a form.

## Group

Put toggles in a `ui-toggle-group`, from the same `@ui-sdk/web/toggle` entry, to share a value and arrow-key navigation. Give the group an accessible name and each toggle a `value`. Set `multiple` to let several toggles stay pressed.

```ts title="group.ts"
import "@ui-sdk/web/toggle"
import { Bold, createElement, Italic, Underline } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-toggle-group multiple aria-label="Text formatting">
      <ui-toggle value="bold">
        <button aria-label="Bold">
          <ui-toggle-icon>${createElement(Bold, { "aria-hidden": "true" }).outerHTML}</ui-toggle-icon>
        </button>
      </ui-toggle>
      <ui-toggle value="italic">
        <button aria-label="Italic">
          <ui-toggle-icon>${createElement(Italic, { "aria-hidden": "true" }).outerHTML}</ui-toggle-icon>
        </button>
      </ui-toggle>
      <ui-toggle value="underline">
        <button aria-label="Underline">
          <ui-toggle-icon>${createElement(Underline, { "aria-hidden": "true" }).outerHTML}</ui-toggle-icon>
        </button>
      </ui-toggle>
    </ui-toggle-group>
  `
}

export { mount }
```

Press Bold and Italic to keep both pressed. Left and Right move focus without changing either.

The group owns which toggles are pressed, so a toggle's own `pressed` and `default-pressed` don't apply inside it. Its value is always an array, in the toggles' document order.

## Single Selection

Without `multiple`, pressing a toggle unpresses the others. Pressing the pressed toggle again clears the selection, unless you set `deselectable="false"`, as this alignment group does. `deselectable` doesn't choose an initial value for you, so pair it with `default-value`.

```ts title="group-single.ts"
import "@ui-sdk/web/toggle"
import {
  createElement,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignStart,
} from "lucide"

const alignments = [
  { value: "start", label: "Align start", icon: TextAlignStart, mirror: true },
  {
    value: "center",
    label: "Align center",
    icon: TextAlignCenter,
    mirror: false,
  },
  { value: "end", label: "Align end", icon: TextAlignEnd, mirror: true },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-toggle-group default-value="start" deselectable="false" aria-label="Text alignment">
      ${alignments
        .map(
          (item) => `
            <ui-toggle value="${item.value}">
              <button aria-label="${item.label}">
                <ui-toggle-icon${item.mirror ? " mirror" : ""}>${createElement(item.icon, { "aria-hidden": "true" }).outerHTML}</ui-toggle-icon>
              </button>
            </ui-toggle>
          `
        )
        .join("")}
    </ui-toggle-group>
  `
}

export { mount }
```

Press Align center to replace Align start, then press Align center again. One alignment always stays pressed.

`mirror` on Align start and Align end flips their icons in right-to-left text. Use [Radio](./radio.md) instead when the arrow keys should select an option as they move; a toggle group moves focus first and waits for a press.

## Icon and Label

Put an icon beside the label with `ui-toggle-icon`. The icon is hidden from screen readers, so the text alone names the button.

```html
<ui-toggle>
  <button>
    <ui-toggle-icon><svg aria-hidden="true">…</svg></ui-toggle-icon>
    Pin
  </button>
</ui-toggle>
```

## Disabled

Set `disabled` on a toggle or a group to prevent presses. A disabled toggle can still start pressed, and a disabled `<fieldset>` around it disables it too.

```html
<ui-toggle disabled default-pressed>
  <button>Pin</button>
</ui-toggle>
```

A disabled toggle on its own leaves the tab order. In a group, disabled toggles stay reachable with the arrow keys and report `aria-disabled`, but ignore presses.

```html
<ui-toggle-group multiple aria-label="Text formatting">
  <ui-toggle value="bold"><button>Bold</button></ui-toggle>
  <ui-toggle value="italic"><button>Italic</button></ui-toggle>
  <ui-toggle value="underline" disabled><button>Underline</button></ui-toggle>
</ui-toggle-group>
```

## Focusable When Disabled

Set `focusable-when-disabled` to keep a disabled toggle focusable. It uses `aria-disabled` and still ignores presses. Use `aria-describedby` to explain why it's unavailable:

```html
<ui-toggle disabled focusable-when-disabled>
  <button aria-describedby="pin-hint">Pin</button>
</ui-toggle>
<p id="pin-hint">Only owners can pin messages.</p>
```

## Controlled

Read or set the element's `pressed` property, and listen for `pressedchange`. Setting the property commits quietly, like a native input's `value`. Call `event.preventDefault()` in the listener to keep the current state. The element's [`api`](#toggle-controller) presses the toggle from anywhere, such as a keyboard shortcut.

```html
<ui-toggle>
  <button aria-label="Star">
    <ui-toggle-icon><svg aria-hidden="true">…</svg></ui-toggle-icon>
  </button>
</ui-toggle>
<button type="button" id="toggle-star">Toggle Star</button>

<script type="module">
  import "@ui-sdk/web/toggle"

  let starred = false
  const star = document.querySelector("ui-toggle")
  star.pressed = starred
  star.addEventListener(
    "pressedchange",
    (event) => (starred = event.detail.value)
  )
  document
    .querySelector("#toggle-star")
    .addEventListener("click", () => star.api.toggle())
</script>
```

`event.detail` has the new state as `value`, and a `reason` of `"press"` or `"imperative"`.

## Controlled Group

Read or set the group element's `value` property, and listen for `valuechange`, to own the group's value or to show it somewhere else. A toggle's `pressedchange` fires before the group's `valuechange`, and calling `event.preventDefault()` on either cancels the change. The element's [`api`](#togglegroup-controller) changes the value from anywhere: `api.setValue([])` clears it.

```html
<ui-toggle-group multiple aria-label="Text formatting">
  <ui-toggle value="bold"><button>Bold</button></ui-toggle>
  <ui-toggle value="italic"><button>Italic</button></ui-toggle>
</ui-toggle-group>
<button type="button" id="clear-formatting">Clear Formatting</button>

<script type="module">
  import "@ui-sdk/web/toggle"

  let formats = ["bold"]
  const editor = document.querySelector("ui-toggle-group")
  editor.value = formats
  editor.addEventListener(
    "valuechange",
    (event) => (formats = event.detail.value)
  )
  document
    .querySelector("#clear-formatting")
    .addEventListener("click", () => editor.api.setValue([]))
</script>
```

See [State and Events](../state-and-events.md) for controlled state, cancellation and debugging.

## Vertical

Set `orientation="vertical"` to move with Up and Down instead of Left and Right. The group and its toggles get `data-orientation`.

```html
<ui-toggle-group orientation="vertical" aria-label="Tool">
  ...
</ui-toggle-group>
```

## Loop

Arrow keys wrap from the last toggle to the first. Set `loop="false"` to stop at the ends.

```html
<ui-toggle-group multiple loop="false" aria-label="Text formatting">
  ...
</ui-toggle-group>
```

## Forms

Toggles don't submit values. Use [Checkbox](./checkbox.md) for several form choices or [Radio](./radio.md) for one. If you keep a toggle group in a form, copy its value into hidden inputs yourself.

## Custom Rendering

Elements have no render functions. `ui-toggle` wraps your own `<button>`, so put anything inside it, and read state from the element: a toggle's `pressed` property, or a group's `value`, its pressed values. Keep the button inside `ui-toggle`, so its `aria-pressed` and keyboard behavior stay connected. Here a `pressedchange` listener sets the heart's `fill`. See [Parts and Composition](../parts-and-composition.md) for the rendering contract.

```ts title="render.ts"
import "@ui-sdk/web/toggle"
import { createElement, Heart } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-toggle>
      <button aria-label="Favorite">
        <ui-toggle-icon>${createElement(Heart, { "aria-hidden": "true" }).outerHTML}</ui-toggle-icon>
      </button>
    </ui-toggle>
  `
  const favorite = root.querySelector("ui-toggle")!
  const heart = root.querySelector("svg")!
  const render = (pressed: boolean) =>
    heart.setAttribute("fill", pressed ? "currentColor" : "none")
  render(favorite.pressed)
  favorite.addEventListener("pressedchange", (event) =>
    render(event.detail.value)
  )
}

export { mount }
```

Press Favorite. The heart renders filled or empty from the toggle's pressed state.

## Styling

Style the pressed state with `data-pressed`, and use `data-disabled` for unavailable toggles. A toggle with a `ui-toggle-icon` gets `data-has-icon`, and its group gets `data-has-icons` while any toggle has one, which helps align icon and text content. `data-orientation` tells a group's toggles which way it runs.

Each part has a `data-slot`, such as `toggle`, and its state attributes are listed under [Data Attributes](#data-attributes). A toggle's attributes land on its button.

## Data Attributes

### `<ui-toggle>`
`[data-slot="toggle"]`

- `data-pressed`: Present while pressed.
- `data-disabled`: Present when disabled, by its own prop or its group.
- `data-orientation` (`horizontal`, `vertical`): Inside a group, the group's orientation.
- `data-has-icon`: Present while the toggle holds an icon part.

### `<ui-toggle-icon>`
`[data-slot="toggle-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

### `<ui-toggle-group>`
`[data-slot="toggle-group"]`

- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between toggles.
- `data-disabled`: Present when the whole group is disabled.
- `data-has-icons`: Present while any toggle inside holds an icon part, so toggles without one can line up.

## API Reference

Props are attributes in kebab case, like `default-pressed` and `focusable-when-disabled`: `"false"` is false, as in `deselectable="false"` and `loop="false"`. A group's `value` and `default-value` take comma-separated values, like `default-value="bold,italic"`. `pressed` is a live property and attribute. Callbacks are DOM events. Elements have no `controller` attribute: their `api` property is one.

### Toggle

- `pressed?` (`boolean`): Whether it's pressed. Pass it to control the toggle. Inside a group, the group's value decides.
- `defaultPressed?` (`boolean`): Whether it's pressed at first, when uncontrolled.
- `pressedchange event`: Runs when a press wants to change it. `details.reason` says why, and `details.cancel()` stops it. Inside a group, it runs before the group's `valuechange`, and canceling it cancels the group's change too.
- `value?` (`string`): Identifies the toggle inside a group, whose value lists the pressed toggles' values. Defaults to a generated id.
- `disabled?` (`boolean`): Stops presses. Alone, the toggle is natively disabled, unless `focusableWhenDisabled` is set. Inside a group or a toolbar, it stays focusable with `aria-disabled`, so arrow keys still reach it.
- `focusableWhenDisabled?` (`boolean`): Keeps a disabled toggle in the tab order with `aria-disabled` instead of the native attribute. Toggles in a group or a toolbar always are.
- `controller?` (`{ isPressed: () => boolean; setPressed: (pressed: boolean, options?: ToggleChangeOptions) => boolean; toggle: (options?: ToggleChangeOptions) => boolean; focus: () => void; }`): Presses it from anywhere. Create one with `createToggleController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### ToggleIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

### ToggleGroup

- `value?` (`T[]`): The pressed toggles' values. Pass it to control the group.
- `defaultValue?` (`T[]`): The toggles pressed at first, when uncontrolled.
- `valuechange event`: Runs when a toggle wants to be pressed or unpressed. `details.reason` says why, and `details.cancel()` stops it.
- `multiple?` (`boolean`): Whether several toggles can be pressed at once. Otherwise pressing one unpresses the others.
- `deselectable?` (`boolean`): Whether the pressed toggle can be unpressed when only one may be pressed. With `false`, one toggle stays pressed once any is. Ignored with `multiple`.
- `disabled?` (`boolean`): Stops every toggle from being pressed. They stay focusable with `aria-disabled`, so the group keeps its tab stop and stays discoverable.
- `orientation?` (`ToggleGroupOrientation`): Which arrow keys move between toggles: left and right, or up and down.
- `loop?` (`boolean`): Whether arrow keys wrap from the last toggle to the first.
- `controller?` (`object`): Presses toggles from anywhere. Create one with `createToggleGroupController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

The same state shows as data attributes on each button and on the group.

- `pressed` (`boolean`): Whether it's pressed. Inside a group, it follows the group's value.
- `disabled` (`boolean`): Whether it's disabled, by itself, its group or a fieldset around it.

In a group, a toggle's `disabled` includes the group's. The group:

- `value` (`T[]`): The pressed toggles' values.
- `multiple` (`boolean`): Whether several toggles can be pressed at once.
- `disabled` (`boolean`): Whether the whole group is disabled, by its `disabled` option or a disabled fieldset around it.
- `orientation` (`ToggleGroupOrientation`): The group's `orientation` option, or `"horizontal"` when it's unset or invalid.

`ui-toggle-icon`:

- `mirror` (`boolean`): Whether it flips in right-to-left text.

### Reasons

`event.detail.reason` says why the toggle was pressed or unpressed.

- `press` (`MouseEvent | KeyboardEvent`): A single-element control was pressed: a checkbox, a switch or a toggle.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

For a group, it says why the pressed toggles changed.

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Toggle Controller

The element's `api` property has the same methods. The `pressed` property reads and sets the state.

Every write method takes an optional `{ reason, event }`, fires the change event like a press, and returns `false` when the change is canceled.

- `isPressed()` (`() => boolean`): Whether it's pressed. Inside a group, it follows the group's value.
- `setPressed(pressed, options?)` (`(pressed: boolean, options?: ToggleChangeOptions | undefined) => boolean`): Presses or unpresses it, as a user would. A disabled toggle ignores it. Returns false when canceled.
- `toggle(options?)` (`(options?: ToggleChangeOptions | undefined) => boolean`): Presses it, or unpresses it.
- `focus()` (`() => void`): Moves focus to it.

### ToggleGroup Controller

The element's `api` property has the same methods. The `value` property reads and sets the pressed toggles.

Every write method takes an optional `{ reason, event }`, fires `valuechange` like a press, and returns `false` when the change is canceled.

- `getValue()` (`() => T[]`): The pressed toggles' values, in the order they appear.
- `setValue(value, options?)` (`(value: T[], options?: ToggleGroupChangeOptions | undefined) => boolean`): Sets the pressed toggles. Only the first counts unless `multiple` is set. Returns false when canceled.
- `isPressed(value)` (`(value: T) => boolean`): Whether a toggle is pressed.
- `toggle(value, options?)` (`(value: T, options?: ToggleGroupChangeOptions | undefined) => boolean`): Presses a toggle, or unpresses a pressed one, as a user would. Disabled toggles and `deselectable={false}` refuse it.
- `focus(value?)` (`(value?: T | undefined) => void`): Moves focus to a toggle, or to the one that holds the group's tab stop.

### Events

Events fire on their own element and don't bubble, with the new state or value in `event.detail.value` and the `reason`, `event` and `source` beside it. Calling `preventDefault()` cancels the change. `valuechange` never fires on connect.

| Member                        | On                | Description                                                                                                                   |
| ----------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `pressed` property, attribute | `ui-toggle`       | Whether the toggle is pressed. The attribute sets where it starts, and is live                                                |
| `api` property                | `ui-toggle`       | The [controller](#toggle-controller)                                                                                          |
| `pressedchange` event         | `ui-toggle`       | `detail: { value: pressed, reason, event, source }`. In a group, it fires before the group's `valuechange`, and can cancel it |
| `value` property              | `ui-toggle-group` | The pressed toggles' values. Setting it presses toggles                                                                       |
| `api` property                | `ui-toggle-group` | The [controller](#togglegroup-controller)                                                                                     |
| `valuechange` event           | `ui-toggle-group` | `detail: { value, reason, event, source }`                                                                                    |

## Accessibility

A toggle follows the toggle button in the [WAI-ARIA button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/): a native button with `aria-pressed`. A group follows the keyboard of the [WAI-ARIA toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/), with one tab stop and arrow keys between toggles. It has the `group` role, not `toolbar`, so it can sit inside a [Toolbar](./toolbar.md), and not `radiogroup`, since its toggles are buttons.

### Keyboard

A group is one tab stop. Tab first enters on its first enabled pressed toggle, or its first enabled toggle, and later returns to the last focused one.

| Key          | Does                                                    |
| ------------ | ------------------------------------------------------- |
| Enter, Space | Presses or unpresses the focused toggle                 |
| Tab          | Moves into or out of a group                            |
| Left, Right  | Move focus in a horizontal group, swapped right to left |
| Up, Down     | Move focus in a vertical group                          |
| Home, End    | Move focus to the first or last toggle                  |

### Tested Behavior

Every line below is an automated test.

- A toggle starts unpressed.
- Clicking a toggle presses it, and clicking again unpresses it.
- Space presses a focused toggle.
- Enter presses a focused toggle.
- A toggle can start pressed.
- A change can be cancelled.
- A toggle keeps its name when it's pressed.

Runs in React, Vue and web components.

In a group:

**One pressed at a time**

- The group is named and its default toggle is pressed.
- Pressing a toggle unpresses the others.
- Pressing the pressed toggle unpresses it.
- A change can be cancelled.

**Several pressed at once**

- Pressing toggles adds them to the value.
- A disabled toggle can't be pressed.
- A disabled group presses nothing.

**Keyboard**

- Tab moves into the group once, and out of it.
- Only one toggle in a group is a tab stop.
- ArrowRight and ArrowLeft move focus without pressing.
- Focus wraps at both ends.
- Home and End move to the first and last toggles.
- ArrowUp and ArrowDown do nothing in a horizontal group.
- Space presses the focused toggle.
- Enter presses the focused toggle.
- Tab returns to the toggle focused last.
- The group itself is never a tab stop.
- Keys pressed without waiting still land.
- Arrow keys with a modifier are left to the browser.

**Options**

- With loop off, arrows stop at the ends.
- A vertical group moves with ArrowDown and ArrowUp.
- The group carries its orientation.

Runs in React, Vue and web components.
