# Tooltip

Name a control or add a short hint on hover and keyboard focus.

A tooltip names a control or adds a short hint when the pointer rests on it or keyboard focus reaches it. Keep it to a few words of plain text.

```ts title="basic.ts"
import "@ui-sdk/web/tooltip"
import { Bookmark, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tooltip default-open>
      <ui-tooltip-trigger>
        <button aria-label="Add to library">${createElement(Bookmark, { "aria-hidden": "true" }).outerHTML}</button>
      </ui-tooltip-trigger>
      <ui-tooltip-content>Add to library</ui-tooltip-content>
    </ui-tooltip>
  `
}

export { mount }
```

The tooltip starts open. Hover the button or reach it with Tab to show it again, and Escape closes it while focus stays on the button.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. On the server the import does nothing.

```ts
import "@ui-sdk/web/tooltip"
```

## Composition

Use the following composition to build a `ui-tooltip`:

```text
ui-tooltip
├── ui-tooltip-trigger
│   └── button
└── ui-tooltip-content
    ├── ui-tooltip-arrow
    └── ui-tooltip-shortcut
```

Wrap the trigger and its hint in a tooltip. The trigger wraps your own `<button>` or link, so it keeps everything a native button does. The arrow and the shortcut are optional.

The content has the `tooltip` role, and it's in the page from the start, hidden, so it names or describes its trigger before focus reaches it. It names a trigger without a name of its own, like a button with only an icon, and describes any other: one with text, an `aria-label` or a `title`. `type="label"` or `type="description"` overrides the guess. Keep it to plain text: a tooltip can't be focused, so links or buttons inside it can't be reached. For anything interactive, use a [Popover](./popover.md) or a [Hover Card](./hover-card.md).

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/tooltip"
</script>

<ui-tooltip>
  <ui-tooltip-trigger><button>Share</button></ui-tooltip-trigger>
  <ui-tooltip-content>Anyone with the link can view</ui-tooltip-content>
</ui-tooltip>
```

## Side

`side` picks where the tooltip opens: `top` by default. It flips to the other side when there isn't room, and shifts along the trigger to stay on screen. `data-side` says where it landed.

```ts title="side.ts"
import "@ui-sdk/web/tooltip"

const sides = [
  { side: "top", label: "Top" },
  { side: "left", label: "Left" },
  { side: "right", label: "Right" },
  { side: "bottom", label: "Bottom" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="grid">
      ${sides
        .map(
          ({ side, label }) => `
            <ui-tooltip>
              <ui-tooltip-trigger><button>${label}</button></ui-tooltip-trigger>
              <ui-tooltip-content side="${side}">Add to library</ui-tooltip-content>
            </ui-tooltip>
          `
        )
        .join("")}
    </div>
  `
}

export { mount }
```

Hover Top, Left, Right and Bottom. Each tooltip opens on that side of its button, or flips into the middle when there isn't room.

Add a `ui-tooltip-arrow` to point at the trigger. It follows the side the tooltip lands on, including after a flip.

```html
<ui-tooltip-content>
  <ui-tooltip-arrow></ui-tooltip-arrow>
  Add to library
</ui-tooltip-content>
```

## Anchor

Position the tooltip against something other than the trigger with `anchor`, a CSS selector for the element to line up with. The [controller's](#controller) `open()` also takes an element, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. Here a small help button inside a field shows its tooltip along the whole field.

```ts title="anchor.ts"
import "@ui-sdk/web/tooltip"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import { createElement, Info } from "lucide"

function mount(root: HTMLElement) {
  const id = `webhook-url-${crypto.randomUUID()}`
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Webhook URL</ui-field-label>
      <div data-slot="row" id="${id}">
        <ui-input>
          <input placeholder="https://" />
        </ui-input>
        <ui-tooltip>
          <ui-tooltip-trigger>
            <button aria-label="About webhooks">${createElement(Info, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-tooltip-trigger>
          <ui-tooltip-content anchor="#${id}" side="bottom" align="start">
            We send a POST request here for every new order.
          </ui-tooltip-content>
        </ui-tooltip>
      </div>
    </ui-field>
  `
}

export { mount }
```

Hover the help button. The tooltip opens below the Webhook URL field and lines up with its start, not with the button.

## Keyboard Shortcut

`shortcut` on the tooltip, like `"mod+s"`, is a hint for what the trigger's action is bound to, where `mod` is Command on Apple platforms and Control elsewhere. An empty `ui-tooltip-shortcut` shows the keys for the platform, `⌘S` or `Ctrl+S`, hidden from screen readers, and the trigger gets `aria-keyshortcuts` so they hear it instead. A `ui-tooltip-shortcut` can show other keys with its own `shortcut`.

The tooltip doesn't bind the keys. Register the shortcut yourself with [`registerShortcut`](../utilities/shortcuts.md), as the example does, or use the `shortcut` of a component that binds keys, like a [Dialog](./dialog.md#keyboard-shortcut) trigger.

```ts title="shortcut.ts"
import "@ui-sdk/web/tooltip"
import { registerShortcut } from "@ui-sdk/web"
import { createElement, Save } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="row">
      <ui-tooltip shortcut="mod+s">
        <ui-tooltip-trigger>
          <button aria-label="Save">${createElement(Save, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-tooltip-trigger>
        <ui-tooltip-content>
          Save
          <ui-tooltip-shortcut></ui-tooltip-shortcut>
        </ui-tooltip-content>
      </ui-tooltip>
      <ui-tooltip shortcut="mod+shift+e">
        <ui-tooltip-trigger><button>Share</button></ui-tooltip-trigger>
        <ui-tooltip-content>
          Share with your team
          <ui-tooltip-shortcut></ui-tooltip-shortcut>
        </ui-tooltip-content>
      </ui-tooltip>
    </div>
  `
  const save = () => log(root, "Saved")
  const share = () => log(root, "Shared")
  const [saveButton, shareButton] = root.querySelectorAll("button")
  saveButton.addEventListener("click", save)
  shareButton.addEventListener("click", share)
  const offSave = registerShortcut("mod+s", save)
  const offShare = registerShortcut("mod+shift+e", share)
  return () => {
    offSave()
    offShare()
  }
}

export { mount }
```

Hover Save or Share to read its shortcut, then press the button or the keys. The console logs Saved or Shared.

## Disabled Buttons

A natively disabled button can't receive focus, and some browsers send it no pointer events, so its tooltip never shows. When the tooltip explains why an action is unavailable, use `aria-disabled="true"` instead and ignore the button's presses yourself. The button stays in the Tab order, screen readers announce it as dimmed, and the tooltip explains what's missing. `disabled` on the tooltip turns the explanation off once the button works.

```ts title="disabled-button.ts"
import "@ui-sdk/web/tooltip"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-field>
        <ui-field-label>Post title</ui-field-label>
        <ui-input>
          <input />
        </ui-input>
      </ui-field>
      <ui-tooltip>
        <ui-tooltip-trigger><button data-variant="solid" aria-disabled="true">Publish</button></ui-tooltip-trigger>
        <ui-tooltip-content side="right">Add a title to publish</ui-tooltip-content>
      </ui-tooltip>
    </div>
  `
  const input = root.querySelector("input")!
  const tooltip = root.querySelector("ui-tooltip")!
  const publish = root.querySelector("button")!
  const title = () => input.value.trim()
  input.addEventListener("input", () => {
    const blocked = !title()
    if (blocked) {
      publish.setAttribute("aria-disabled", "true")
    } else {
      publish.removeAttribute("aria-disabled")
    }
    tooltip.disabled = !blocked
  })
  publish.addEventListener("click", () => {
    if (title()) {
      log(root, `Published “${title()}”`)
    }
  })
}

export { mount }
```

Hover or focus Publish to learn what's missing. Type a title, and Publish works and its tooltip goes away.

## Touch

Touch screens have no hover. A tap on a plain tooltip's trigger only presses it, and the tooltip stays closed, so don't hide anything important in a tooltip.

For an info button whose only job is the tip, add `toggleable`: pressing the trigger opens and closes the tooltip, with a finger, a mouse or the keyboard, and its text is announced when a press opens it. An outside press or Escape closes it too.

```ts title="toggleable.ts"
import "@ui-sdk/web/tooltip"
import { createElement, Info } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="row">
      <span data-slot="label">Storage</span>
      <ui-tooltip toggleable>
        <ui-tooltip-trigger>
          <button aria-label="About storage" data-size="sm">${createElement(Info, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-tooltip-trigger>
        <ui-tooltip-content>Files in the trash still use storage.</ui-tooltip-content>
      </ui-tooltip>
      <span data-slot="hint">12.4 of 15 GB used</span>
    </div>
  `
}

export { mount }
```

Press the info button to open the tip, including on a touch screen. Press it again or anywhere else to close it.

## Keep Open on Press

Pressing the trigger closes the tooltip, so it doesn't cover what the press changed, and it stays closed until the pointer leaves. `close-on-press="false"` keeps it open, like for a copy button whose tooltip turns into "Copied".

```ts title="copy.ts"
import "@ui-sdk/web/tooltip"
import { Check, Copy, createElement } from "lucide"

const command = "npm install @ui-sdk/web"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="row">
      <code>${command}</code>
      <ui-tooltip close-on-press="false">
        <ui-tooltip-trigger><button></button></ui-tooltip-trigger>
        <ui-tooltip-content></ui-tooltip-content>
      </ui-tooltip>
    </div>
  `
  const tooltip = root.querySelector("ui-tooltip")!
  const button = root.querySelector("button")!
  const content = root.querySelector("ui-tooltip-content")!
  const render = (copied: boolean) => {
    const label = copied ? "Copied" : "Copy"
    button.setAttribute("aria-label", label)
    button.replaceChildren(
      createElement(copied ? Check : Copy, { "aria-hidden": "true" })
    )
    content.textContent = label
  }
  render(false)
  button.addEventListener("click", () => {
    navigator.clipboard?.writeText(command).catch(() => {})
    render(true)
  })
  tooltip.addEventListener("openchangecomplete", (event) => {
    if (!event.detail.value) {
      render(false)
    }
  })
}

export { mount }
```

Hover the copy button and press it. The tooltip stays open and changes to Copied.

## Truncated Text

To show a tooltip only when text is cut off, cancel the open with `event.preventDefault()` in `openchange` when the text fits. Compare `scrollWidth` with `clientWidth` in the listener. The tooltip repeats the name, so `type="label"` keeps screen readers from hearing it twice.

```ts title="truncated.ts"
import "@ui-sdk/web/tooltip"
import { createElement, File } from "lucide"

const files = [
  "Quarterly report, final revised version for the board.pdf",
  "Notes.txt",
  "Design review recording, October 2nd.mp4",
  "Budget.xlsx",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ul>
      ${files
        .map(
          (file) => `
      <li>
        <ui-tooltip type="label">
          <ui-tooltip-trigger><button>${createElement(File, { "aria-hidden": "true" }).outerHTML}<span>${file}</span></button></ui-tooltip-trigger>
          <ui-tooltip-content>${file}</ui-tooltip-content>
        </ui-tooltip>
      </li>`
        )
        .join("")}
    </ul>
  `
  for (const tooltip of root.querySelectorAll("ui-tooltip")) {
    tooltip.addEventListener("openchange", (event) => {
      const name = tooltip.querySelector("span")
      if (event.detail.value && name && name.scrollWidth <= name.clientWidth) {
        event.preventDefault()
      }
    })
  }
}

export { mount }
```

Hover or focus each file. Only names that are cut off open a tooltip.

## Controlled

Set the element's `open` property and listen for `openchange`. Every change carries a [reason](#reasons), like `trigger-hover`, `trigger-focus`, `trigger-press`, `escape-key` or `outside-press`. Call `event.preventDefault()` to stop it. To open the tooltip from anywhere, like a step in a guided tour, use its [controller](#controller).

```ts title="controlled.ts"
import "@ui-sdk/web/tooltip"
import "@ui-sdk/web/checkbox"
import { Check, createElement } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <ui-checkbox>
            <ui-checkbox-indicator>
              ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
            </ui-checkbox-indicator>
          </ui-checkbox>
          Open
        </label>
      </div>
      <ui-tooltip>
        <ui-tooltip-trigger><button>Export</button></ui-tooltip-trigger>
        <ui-tooltip-content>Download as CSV</ui-tooltip-content>
      </ui-tooltip>
    </div>
  `
  const controls = root.querySelector('[data-slot="controls"]')!
  const checkbox = root.querySelector("ui-checkbox")!
  const tooltip = root.querySelector("ui-tooltip")!
  checkbox.addEventListener("checkedchange", (event) => {
    tooltip.open = event.detail.value === true
  })
  tooltip.addEventListener("openchange", (event) => {
    const { value, reason, event: cause } = event.detail
    const inControls =
      cause?.target instanceof Node && controls.contains(cause.target)
    if (inControls && reason !== "escape-key") {
      return event.preventDefault()
    }
    checkbox.checked = value
    log(root, `${value ? "Opened" : "Closed"} (${reason})`)
  })
}

export { mount }
```

Check Open, or hover Export. The console logs each change and its reason.

## Shared

A toolbar, a chart or a long list can share one tooltip instead of rendering one per item. Give the tooltip an `id` and point each trigger at it with `for`, and the triggers can sit anywhere on the page. Each trigger takes a `payload` property, here its label, and you fill the content when `payloadchange` fires, with the payload in `event.detail.value`. `UiTooltipElement<string>` types the payload. The content is in the page before the first open, so handle an `undefined` payload.

Only the trigger that opened the tooltip is described by it, so give each trigger a name of its own, like an `aria-label`. The controller's `open()` takes a payload and an `anchor` too, and on an open tooltip, `open({ payload })` replaces the payload, like another trigger taking it over. `payloadchange` reports each change, including the pointer or focus moving on to another trigger, which hands the open tooltip over without an `openchange`.

```ts title="shared.ts"
import "@ui-sdk/web/tooltip"
import type { UiTooltipElement } from "@ui-sdk/web/tooltip"
import { Bold, createElement, Italic, Underline } from "lucide"

const formats = [
  { icon: Bold, label: "Bold" },
  { icon: Italic, label: "Italic" },
  { icon: Underline, label: "Underline" },
]

function mount(root: HTMLElement) {
  const id = `formatting-${crypto.randomUUID()}`
  root.innerHTML = `
    <div data-slot="row" role="group" aria-label="Formatting">
      ${formats
        .map(
          (format) => `
            <ui-tooltip-trigger for="${id}">
              <button aria-label="${format.label}">${createElement(format.icon, { "aria-hidden": "true" }).outerHTML}</button>
            </ui-tooltip-trigger>
          `
        )
        .join("")}
      <ui-tooltip id="${id}">
        <ui-tooltip-content></ui-tooltip-content>
      </ui-tooltip>
    </div>
  `
  root.querySelectorAll("ui-tooltip-trigger").forEach((trigger, index) => {
    trigger.payload = formats[index].label
  })
  const tooltip = root.querySelector<UiTooltipElement<string>>("ui-tooltip")!
  const content = root.querySelector("ui-tooltip-content")!
  tooltip.addEventListener("payloadchange", (event) => {
    content.textContent = event.detail.value ?? ""
  })
}

export { mount }
```

Move along Bold, Italic and Underline. One tooltip follows the pointer and shows each button's label.

## Animation

The content has `data-starting-style` while it opens and `data-ending-style` while it closes. Transition from those states, and the tooltip stays mounted until its exit finishes. Put `transform-origin: var(--transform-origin)` on the content so it grows out of its trigger. A tooltip that opens at once, as the next one in a group does, gets `data-instant`, so skip the transition there.

```css
[data-slot="tooltip-content"] {
  transform-origin: var(--transform-origin);
  transition:
    opacity 150ms ease-out,
    scale 150ms ease-out;

  &:is([data-starting-style], [data-ending-style]) {
    opacity: 0;
    scale: 0.9;
  }

  &[data-instant] {
    transition: none;
  }
}
```

For people who ask for less motion, drop the scale in a `prefers-reduced-motion` query and keep the fade. `openchangecomplete` fires once the tooltip has finished opening or closing, after any animation, with the new open state in `event.detail.value`.

```ts title="animation.ts"
import "@ui-sdk/web/tooltip"
import { Archive, createElement } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tooltip>
      <ui-tooltip-trigger>
        <button aria-label="Archive">${createElement(Archive, { "aria-hidden": "true" }).outerHTML}</button>
      </ui-tooltip-trigger>
      <ui-tooltip-content>Archive</ui-tooltip-content>
    </ui-tooltip>
  `
  const tooltip = root.querySelector("ui-tooltip")!
  tooltip.addEventListener("openchange", (event) =>
    log(root, event.detail.value ? "Opening" : "Closing")
  )
  tooltip.addEventListener("openchangecomplete", (event) =>
    log(root, event.detail.value ? "Open" : "Closed")
  )
}

export { mount }
```

Hover Archive, then move away. The tooltip grows out of the button and fades, and the console logs Opening, Open, Closing and Closed.

## Delay and Grouping

`delay` is how long the pointer rests on the trigger before the tooltip opens, 600 milliseconds by default. `close-delay` is how long it stays once the pointer leaves the trigger and the tooltip, 0 by default. Keyboard focus opens it at once.

Tooltips group without a provider. Once one is open, or was a moment ago, hovering the next opens it at once, and only one is open at a time, so moving along a toolbar reads like one tooltip that follows the pointer. A tooltip that opened at once gets `data-instant`, so it can skip its animation.

`disabled` stops a tooltip from opening, while its trigger keeps working.

```html
<ui-tooltip delay="300" close-delay="150" disabled></ui-tooltip>
```

## Offset

`side-offset` is the gap to the trigger, 4 pixels by default. `align-offset` shifts along it, `align` lines it up with the start, center or end of the trigger, and `collision-padding` is the space kept from the edges of the window.

```html
<ui-tooltip-content
  align="start"
  side-offset="8"
  align-offset="4"
  collision-padding="16"
></ui-tooltip-content>
```

## Container

Tooltips render in place and show in the top layer, so no ancestor clips or covers them. `container`, a CSS selector, renders the tooltip somewhere else, for iframes, shadow roots or a specific stacking context. See the shared [popup guide](../popups.md).

```html
<ui-tooltip-content container="#tooltips"></ui-tooltip-content>
```

## Custom Rendering

Elements have no render functions. The trigger wraps your own element, a button or a link, and that element is the trigger, with your attributes on it. Read state from the data attributes every part sets. See [Parts and Composition](../parts-and-composition.md) for the rendering contract.

```ts title="custom-rendering.ts"
import "@ui-sdk/web/tooltip"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tooltip>
      <ui-tooltip-trigger><a href="https://example.com/changelog" data-variant="link">Changelog</a></ui-tooltip-trigger>
      <ui-tooltip-content>See what's new in 2.0</ui-tooltip-content>
    </ui-tooltip>
  `
}

export { mount }
```

Hover Changelog. The trigger renders as a link, and its tooltip says where it goes.

A button can be a tooltip's trigger and another component's trigger at once. Nest the triggers, and both bind the button deepest in, so it opens the popover and is named by the tooltip:

```html
<ui-popover>
  <ui-tooltip>
    <ui-tooltip-trigger>
      <ui-popover-trigger>
        <button><svg aria-hidden="true">…</svg></button>
      </ui-popover-trigger>
    </ui-tooltip-trigger>
    <ui-tooltip-content>Notifications</ui-tooltip-content>
  </ui-tooltip>
  <ui-popover-content>...</ui-popover-content>
</ui-popover>
```

## Styling

Use `data-side` and `data-align` to style the content and arrow for where they landed, and `data-instant` to skip the animation of a tooltip that opened at once. The trigger gets no state attributes of its own, since it's often another component's trigger too, like a menu's. Put `transform-origin: var(--transform-origin)` on the content so it scales from the trigger.

Each part has a `data-slot`, such as `tooltip-content`, and its state attributes are listed under [Data Attributes](#data-attributes).

### `<ui-tooltip-content>`
- `--anchor-width`: Width of the anchor, usually the trigger. Use it to match widths.
- `--anchor-height`: Height of the anchor.
- `--available-width`: Space beside the popup, up to the viewport edge. Not inherited either.
- `--available-height`: Space between the anchor and the viewport edge. Use it for max-height. Not inherited, so a child that needs it copies it on the popup, like `[--list-height:var(--available-height)]`, and reads `max-h-(--list-height)`. The first popup registers both names for the whole page with `CSS.registerProperty`, so they don't inherit anywhere. A page that needs them to inherit calls it first, with `inherits: true`. An `@property` rule can't, since a registration in script wins.
- `--transform-origin`: The point on the anchor the popup opens from. Use it to scale from the right place.
- `--arrow-offset`: Where the anchor's center falls along the popup's edge, kept `arrowPadding` from the corners. Position a ::before arrow with it.

## Data Attributes

`<ui-tooltip-trigger>` and `<ui-tooltip-shortcut>` have no state attributes.

### `<ui-tooltip-content>`
`[data-slot="tooltip-content"]`

- `data-closed`: Present while the tooltip is closed, including while it animates out.
- `data-open`: Present while the tooltip is open.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the tooltip animates out. Style the state you animate to.

### `<ui-tooltip-arrow>`
`[data-slot="tooltip-arrow"]`

- `data-closed`: Present while the tooltip is closed, including while it animates out.
- `data-open`: Present while the tooltip is open.

## API Reference

Props are attributes in kebab case, like `close-delay` and `side-offset`: `"false"` is false, and numbers are numbers. `anchor` and `container` take CSS selectors. Callbacks are DOM events.

### Tooltip

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `open?` (`boolean`): Whether the tooltip is open. Pass it to control the tooltip.
- `defaultOpen?` (`boolean`): Whether the tooltip starts open, when uncontrolled.
- `openchange event`: Runs when the tooltip wants to open or close. `details.reason` says why, and `details.cancel()` stops it.
- `openchangecomplete event`: Runs once the tooltip has finished opening or closing, after any animation.
- `payloadchange event`: Runs when the payload the content shows changes: a trigger with another payload opens the tooltip, or takes the open tooltip over, which fires no `openchange`, and so does a controller's `open({ payload })` on the open tooltip. `details.cancel()` keeps the previous payload.
- `delay?` (`number`): Milliseconds the pointer rests on the trigger before the tooltip opens. While another tooltip is open, or was a moment ago, the next one opens at once, without a provider.
- `closeDelay?` (`number`): Milliseconds before the tooltip closes once the pointer leaves the trigger and the tooltip.
- `disabled?` (`boolean`): Stops the tooltip from opening. The trigger keeps working.
- `toggleable?` (`boolean`): Whether pressing the trigger opens and closes the tooltip, so touch screens can show it too. For info buttons whose only job is the tip. The text is announced when a press opens it.
- `closeOnPress?` (`boolean`): Whether pressing the trigger closes the tooltip. Set it to `false` to keep it open, like for a copy button whose tooltip turns into "Copied".
- `type?` (`"description" | "label"`): Whether the tooltip names its trigger (`"label"`) or adds a description to it (`"description"`). By default it names a trigger that has no name of its own, like an icon button, and describes any other.
- `shortcut?` (`string`): The keyboard shortcut of what the trigger does, like `"mod+s"`, as a hint. A `TooltipShortcut` shows it, and the trigger gets `aria-keyshortcuts`. It doesn't bind the keys: the trigger's own `shortcut`, or `registerShortcut`, does.
- `controller?` (`PopupController<any, TooltipOpenChangeReason, {}, string, TooltipPayloadChangeReason>`): Opens, closes and inspects the tooltip from anywhere, and connects triggers outside it. Create one with `createTooltipController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### TooltipTrigger

A trigger outside the tooltip names it with `for="tooltip-id"`, and takes `payload` as a property.

- `payload?` (`unknown`): Data for the content to render when this trigger opens the tooltip, like the row it belongs to.
- `controller?` (`PopupController<any, TooltipOpenChangeReason, {}, string, TooltipPayloadChangeReason>`): Connects a trigger outside the tooltip, like one per table row, to the tooltip with this controller.

### TooltipContent

- `side?` (`Side`): Which side of the anchor the popup opens on. Flips to the other side when there isn't room. Which side of the trigger the tooltip opens on.
- `align?` (`Align`): How the popup lines up with the anchor along that side. `start` and `end` follow the reading direction. How the tooltip lines up with the trigger along that side.
- `sideOffset?` (`number`): Gap between the anchor and the popup, in pixels. Gap between the trigger and the tooltip, in pixels.
- `alignOffset?` (`number`): Shift along the anchor, in pixels. Shift along the trigger, in pixels.
- `collisionPadding?` (`number`): Space to keep from the viewport edges, in pixels.
- `arrowPadding?` (`number`): Space to keep between the arrow and the popup's corners, in pixels.
- `anchor?` (`string | Anchor | null`): Positions the popup against this instead of its trigger: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. It's read on every check, so it can move. A controller's `open({ anchor })` wins for that open.
- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.

### TooltipArrow

Points at the trigger from the side the tooltip landed on.

### TooltipShortcut

- `shortcut?` (`string`): The keys to show. By default, the tooltip's `shortcut`.

### State

The same state shows as data attributes on each element.

`TooltipTrigger`:

- `open` (`boolean`): Whether the tooltip is open from this trigger.

`TooltipContent`:

- `open` (`boolean`): Whether the tooltip is open. False while it animates out.
- `instant` (`boolean`): Whether it opened at once, because another tooltip was open a moment ago. Animations can skip.
- `payload` (`Payload | undefined`): The payload of the last open, from the trigger that opened it or a controller, typed as the controller's `Payload`.

`TooltipArrow`:

- `open` (`boolean`): Whether the tooltip is open. False as soon as it starts closing, while it still animates out.

`TooltipShortcut`:

- `text` (`string`): The shortcut formatted for this platform: `⌘S` on Apple platforms and `Ctrl+S` elsewhere. Empty without one.

### Reasons

`event.detail.reason` says why the tooltip opened or closed.

- `trigger-hover` (`PointerEvent`): The pointer rested on a trigger, or left it, with hover opening.
- `trigger-focus` (`FocusEvent`): Keyboard focus reached a trigger that opens on focus, like a tooltip's.
- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `focus-out` (`KeyboardEvent | FocusEvent`): Focus left the layer, or Tab moved it out.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `window-blur` (`FocusEvent`): The window lost focus.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

For a payload change, it says what opened the tooltip or took it over.

- `trigger-hover` (`PointerEvent`): The pointer rested on a trigger, or left it, with hover opening.
- `trigger-focus` (`FocusEvent`): Keyboard focus reached a trigger that opens on focus, like a tooltip's.
- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods. The `open` property reads and sets whether the tooltip
is open.

Every write method takes an optional `{ reason, event }`, passed to `openchange`.

- `isOpen()` (`() => boolean`): Whether it's open. False as soon as it starts closing, while it still animates out.
- `setOpen(open, options?)` (`(open: boolean, options?: PopupChangeOptions<TooltipOpenChangeReason> | undefined) => boolean`): Opens or closes it. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (PopupChangeOptions<TooltipPayloadChangeReason> & { payload?: Payload | undefined; anchor?: Anchor | undefined; signal?: AbortSignal | undefined; }) | undefined) => Promise<...>`): Opens it, and resolves once it closes, with why, how and any return value. Resolves exactly once and never rejects: on the next close from any source, when `signal` aborts, or with reason `"unmount"` when the component leaves the page.
- `close(options?)` (`(options?: (PopupChangeOptions<TooltipOpenChangeReason> & { returnValue?: string | undefined; }) | undefined) => boolean`): Closes it. `returnValue` is passed to the promise `open()` returned. Returns false when the close was canceled or it was already closed.
- `toggle(options?)` (`(options?: PopupChangeOptions<TooltipOpenChangeReason> | undefined) => boolean`): Opens it when it's closed, and closes it when it's open. Returns false when the change was canceled.
- `getPayload()` (`() => Payload | undefined`): The payload of the last open, from a controller or the trigger that opened it.
- `focus()` (`() => void`): Moves focus to the trigger that opened it last, or the first trigger.

### Events

Events fire on their own element and don't bubble, with the new state in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` on `openchange` cancels the change.

| Member                     | On                   | Description                                                                     |
| -------------------------- | -------------------- | ------------------------------------------------------------------------------- |
| `open` property, attribute | `ui-tooltip`         | Whether the tooltip is open. The attribute sets where it starts, and is live    |
| `api` property             | `ui-tooltip`         | The [controller](#controller)                                                   |
| `openchange` event         | `ui-tooltip`         | `detail: { value: open, reason, event }`                                        |
| `openchangecomplete` event | `ui-tooltip`         | `detail: { value: open }`, after the animation                                  |
| `payloadchange` event      | `ui-tooltip`         | `detail: { value: payload, reason, event }`, when the content's payload changes |
| `payload` property         | `ui-tooltip-trigger` | Data for the content                                                            |
| `for` attribute            | `ui-tooltip-trigger` | The `id` of a tooltip the trigger shows from outside it                         |

## Accessibility

The trigger is named or described by the tooltip, following the [WAI-ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/). It opens on hover and on keyboard focus, and stays open while the pointer moves onto it.

### Keyboard

| Key          | Does                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Tab          | Focus on the trigger opens the tooltip at once; focus leaving it closes the tooltip            |
| Escape       | Closes the tooltip and leaves focus on the trigger, without closing a dialog or menu around it |
| Enter, Space | Presses the trigger and closes the tooltip; on a `toggleable` trigger, opens and closes it     |

### Tested Behavior

Every line below is an automated test.

**Pointer**

- Resting the pointer on the trigger opens the tooltip.
- The tooltip waits for its delay before opening.
- Leaving the trigger before the delay keeps the tooltip closed.
- Moving the pointer away closes the tooltip.
- The pointer can move onto the tooltip without closing it.
- Opening on hover leaves focus where it was.
- Pressing the trigger closes the tooltip and runs the button.
- After a press, the tooltip stays closed until the pointer comes back.

**Keyboard**

- Keyboard focus on the trigger opens the tooltip.
- Focus leaving the trigger closes the tooltip.
- Escape closes the tooltip and leaves focus on the trigger.
- Escape closes a tooltip opened by hover.
- Tab through the toolbar shows each tooltip in turn.
- A click that focuses the trigger doesn't open the tooltip from focus.

**Several tooltips**

- Only one tooltip is open at a time.
- Once the pointer has been away a while, the delay applies again.

**Positioning**

- The tooltip opens above the trigger.
- The tooltip flips below the trigger when there is no room above.
- The tooltip opens on the requested side.
- The arrow points at the middle of the trigger.

**A tooltip on a popover trigger**

- Hovering shows the tooltip, and pressing opens the popover instead.
- Escape closes the tooltip and leaves the popover open.

**Disabled buttons**

- Browsers send hover events to a disabled button.
- An aria-disabled trigger shows its tooltip on hover and focus and ignores presses.

**Animation**

- The tooltip animates in from its starting style.
- The tooltip stays in the page while it animates out.

**Hidden while closed**

- A class that sets display on the content doesn't show it while closed.

**Options and dismissal**

- Escape closes only a tooltip that keyboard focus opened inside a popover.
- The pointer can leave the trigger sideways on its way to the tooltip.
- With closeOnPress false, pressing the trigger keeps the tooltip open.
- Disabled tooltips never open.
- A tap on a plain tooltip's trigger only presses it.

Runs in React, Vue and web components.

Also tested:

**Enhancements**

- Focus returning to the trigger after its popover closes doesn't reopen the tooltip.
- Tooltips open at once after another one, without a provider.
- Focus coming back with the window doesn't reopen the tooltip.
- A controller opens the tooltip without moving focus.
- A trigger that's a disabled button warns in development.

**Shortcuts**

- A trigger connected through a controller shows its tooltip's shortcut in a Shortcut part.

**Toggleable**

- Pressing a toggleable trigger opens and closes the tooltip.
- Pressing outside closes a toggleable tooltip.
- Enter toggles the tooltip from the keyboard and keeps focus on the trigger.
- A press announces the tooltip's text to screen readers.
- A tap opens a toggleable tooltip on a touch screen.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while tabbing through triggers with tooltips.

Runs in React, Vue and web components.
