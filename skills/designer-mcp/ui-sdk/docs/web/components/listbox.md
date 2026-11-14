# Listbox

Choose one or several options from an always-visible list.

Use a Listbox when the choices should stay in view. It works like a native select with several visible rows, with keyboard navigation, typeahead, and optional range selection.

```ts title="basic.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/listbox"
import { Check, createElement } from "lucide"

const topics = [
  { value: "comments", label: "Comments" },
  { value: "mentions", label: "Mentions" },
  { value: "reactions", label: "Reactions" },
  { value: "sign-ins", label: "New sign-ins" },
  { value: "billing", label: "Billing" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Email me about</ui-field-label>
      <ui-listbox multiple activation="automatic" default-value="mentions">
        ${topics
          .map(
            (topic) => `
              <ui-listbox-item value="${topic.value}">
                ${topic.label}
                <ui-listbox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-listbox-item-indicator>
              </ui-listbox-item>`
          )
          .join("")}
      </ui-listbox>
      <ui-field-description>Hold Shift to select a range, or Ctrl or ⌘ to add one.</ui-field-description>
    </ui-field>
  `
}

export { mount }
```

Choose Comments, then hold Shift and choose New sign-ins to select the range. A click replaces the selection; Ctrl or ⌘ adds one option.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

## Composition

Use the following composition to build a `ui-listbox`:

```text
ui-listbox
├── ui-listbox-item
│   └── ui-listbox-item-indicator
└── ui-listbox-item
    └── ui-listbox-item-indicator
```

Give the list an accessible name and each option a unique value. `ui-listbox-item-indicator` shows its content when that option is selected.

You can also name the list with a [Field label](./field.md) or `aria-labelledby`. Keep buttons, search fields, and empty messages outside the list: its contents should be options, groups, and separators.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/listbox"
</script>

<ui-listbox aria-label="Toppings" default-value="basil">
  <ui-listbox-item value="basil">
    Basil
    <ui-listbox-item-indicator>✓</ui-listbox-item-indicator>
  </ui-listbox-item>
  <ui-listbox-item value="olive">
    Olive
    <ui-listbox-item-indicator>✓</ui-listbox-item-indicator>
  </ui-listbox-item>
</ui-listbox>
```

## Multiple

Add `multiple` to select several options. The value becomes an array; a single list uses one value or `null`. By default, arrow keys move focus without changing a multiple selection.

| Action                             | Result                                                 |
| ---------------------------------- | ------------------------------------------------------ |
| Press an option or Space           | Toggle that option.                                    |
| Shift + press, arrow key, or Space | Select a range from the last chosen option.            |
| Ctrl/Cmd + Shift + Home or End     | Extend the range to the first or last option.          |
| Ctrl/Cmd + A                       | Select every enabled option, then clear the selection. |

Changing a Shift range preserves the options selected before that range began.

```ts title="multiple.ts"
import "@ui-sdk/web/listbox"
import { Check, createElement } from "lucide"
import { log } from "./log"

const toppings = [
  { value: "basil", label: "Basil" },
  { value: "cheese", label: "Extra cheese" },
  { value: "mushroom", label: "Mushroom" },
  { value: "olive", label: "Olive" },
  { value: "onion", label: "Onion" },
  { value: "pepper", label: "Pepper" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-listbox multiple default-value="cheese,onion" aria-label="Toppings">
      ${toppings
        .map(
          (topping) => `
            <ui-listbox-item value="${topping.value}">
              ${topping.label}
              <ui-listbox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-listbox-item-indicator>
            </ui-listbox-item>`
        )
        .join("")}
    </ui-listbox>
  `
  root.querySelector("ui-listbox")!.addEventListener("valuechange", (event) => {
    log(
      root,
      `${(event.detail.value as string[]).join(", ") || "Nothing"} (${event.detail.reason})`
    )
  })
}

export { mount }
```

Choose Basil, then hold Shift and choose Pepper to select a range. Use Ctrl+A or ⌘A to select every option, then again to clear. The console logs each change.

## Selection That Follows Focus

A single list selects as arrow keys, Home, End, or typing move focus. A multiple list can do the same with `activation="automatic"`, like a file list: a press or arrow replaces the selection, Ctrl or Cmd adds to it, and Ctrl or Cmd with an arrow moves focus without selecting.

Taps and screen-reader presses toggle an option instead, since they do not have modifier keys.

```html
<ui-listbox multiple activation="automatic" aria-label="Files"></ui-listbox>
```

```ts title="activation.ts"
import "@ui-sdk/web/listbox"
import { createElement, File } from "lucide"
import { log } from "./log"

const files = [
  { value: "readme", label: "README.md" },
  { value: "package", label: "package.json" },
  { value: "tsconfig", label: "tsconfig.json" },
  { value: "index", label: "index.ts" },
  { value: "styles", label: "styles.css" },
  { value: "logo", label: "logo.svg" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-listbox multiple activation="automatic" default-value="readme" aria-label="Files">
      ${files
        .map(
          (file) => `
            <ui-listbox-item value="${file.value}">
              <ui-listbox-item-icon>${createElement(File, { "aria-hidden": "true" }).outerHTML}</ui-listbox-item-icon>
              ${file.label}
            </ui-listbox-item>`
        )
        .join("")}
    </ui-listbox>
  `
  root.querySelector("ui-listbox")!.addEventListener("valuechange", (event) => {
    log(
      root,
      `${(event.detail.value as string[]).length} selected (${event.detail.reason})`
    )
  })
}

export { mount }
```

Choose index.ts to replace the selection. Hold Ctrl or Cmd while choosing another file to add it; Shift selects a range.

## Manual Activation

Set `activation="manual"` on a single list to browse without selecting. Space, Enter, or a press chooses the focused option.

```ts title="manual.ts"
import "@ui-sdk/web/listbox"
import { Check, createElement } from "lucide"
import { log } from "./log"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-listbox activation="manual" aria-label="Framework">
      ${frameworks
        .map(
          (framework) => `
            <ui-listbox-item value="${framework.value}">
              ${framework.label}
              <ui-listbox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-listbox-item-indicator>
            </ui-listbox-item>`
        )
        .join("")}
    </ui-listbox>
  `
  root.querySelector("ui-listbox")!.addEventListener("valuechange", (event) => {
    log(root, `${event.detail.value ?? "Nothing"} (${event.detail.reason})`)
  })
}

export { mount }
```

Move through the options with the arrow keys. Nothing is selected until you press Space or Enter, and the console logs the choice.

## Deselectable

Add `deselectable` to let pressing the selected option clear a single selection. Without it, the selection stays as it is.

```ts title="deselectable.ts"
import "@ui-sdk/web/listbox"
import { Check, createElement } from "lucide"
import { log } from "./log"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-listbox deselectable default-value="astro" aria-label="Framework">
      ${frameworks
        .map(
          (framework) => `
            <ui-listbox-item value="${framework.value}">
              ${framework.label}
              <ui-listbox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-listbox-item-indicator>
            </ui-listbox-item>`
        )
        .join("")}
    </ui-listbox>
  `
  root.querySelector("ui-listbox")!.addEventListener("valuechange", (event) => {
    log(root, `${event.detail.value ?? "Nothing"} (${event.detail.reason})`)
  })
}

export { mount }
```

Press Astro again to clear the selection, or choose another framework. The console logs each change.

## Groups

Use `ui-listbox-group` and `ui-listbox-group-label` to name a group. Arrow keys and ranges continue across groups. Separators stay out of the accessibility tree.

```ts title="groups.ts"
import "@ui-sdk/web/listbox"
import { Check, createElement } from "lucide"

const produce = [
  {
    label: "Fruits",
    items: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
      { value: "orange", label: "Orange" },
    ],
  },
  {
    label: "Vegetables",
    items: [
      { value: "carrot", label: "Carrot" },
      { value: "broccoli", label: "Broccoli" },
      { value: "spinach", label: "Spinach" },
    ],
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-listbox multiple default-value="banana" aria-label="Produce">
      ${produce
        .map(
          (group, index) => `
            ${index > 0 ? `<ui-listbox-separator></ui-listbox-separator>` : ""}
            <ui-listbox-group>
              <ui-listbox-group-label>${group.label}</ui-listbox-group-label>
              ${group.items
                .map(
                  (item) => `
                    <ui-listbox-item value="${item.value}">
                      ${item.label}
                      <ui-listbox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-listbox-item-indicator>
                    </ui-listbox-item>`
                )
                .join("")}
            </ui-listbox-group>`
        )
        .join("")}
    </ui-listbox>
  `
}

export { mount }
```

Move from Apple through the list with Down Arrow. Navigation continues into the Vegetables group.

## Icons

Wrap an icon in `ui-listbox-item-icon` so screen readers and typeahead skip it. Add `mirror` to a directional icon to flip it in right-to-left text.

```ts title="icons.ts"
import "@ui-sdk/web/listbox"
import { Archive, ArrowRight, createElement, Mail, Pencil, Star } from "lucide"

const views = [
  { value: "inbox", label: "Inbox", icon: Mail },
  { value: "starred", label: "Starred", icon: Star },
  { value: "drafts", label: "Drafts", icon: Pencil },
  { value: "archive", label: "Archive", icon: Archive },
  { value: "next", label: "Next page", icon: ArrowRight },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-listbox default-value="inbox" aria-label="Mailbox">
      ${views
        .map(
          (view) => `
            <ui-listbox-item value="${view.value}">
              <ui-listbox-item-icon${view.icon === ArrowRight ? " mirror" : ""}>${createElement(view.icon, { "aria-hidden": "true" }).outerHTML}</ui-listbox-item-icon>
              ${view.label}
            </ui-listbox-item>`
        )
        .join("")}
    </ui-listbox>
  `
}

export { mount }
```

Choose Drafts. The icon stays out of the option’s accessible name and the text used for typeahead.

## Horizontal

Set `orientation="horizontal"` to move with Left and Right Arrow. Arrow keys normally wrap; set `loop="false"` to stop at the ends, as this example does. Shift ranges never wrap.

The list reads `dir="rtl"` from the page or an ancestor, so Left Arrow moves to the next option in right-to-left text.

```ts title="horizontal.ts"
import "@ui-sdk/web/listbox"

const sizes = [
  { value: "xs", label: "XS" },
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL", disabled: true },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-listbox orientation="horizontal" loop="false" default-value="m" aria-label="Size">
      ${sizes
        .map(
          (size) => `
            <ui-listbox-item value="${size.value}"${size.disabled ? " disabled" : ""}>${size.label}</ui-listbox-item>`
        )
        .join("")}
    </ui-listbox>
  `
}

export { mount }
```

Focus M, then use Left and Right Arrow to choose a size. The list stops at its ends; XL cannot be selected.

## Disabled

A disabled option cannot be selected. Arrow keys, typeahead and ranges skip it. Disabling the whole list removes its tab stop, prevents changes, and excludes its value from the form.

```ts title="disabled.ts"
import "@ui-sdk/web/listbox"
import { Check, createElement } from "lucide"

const toppings = [
  { value: "basil", label: "Basil" },
  { value: "cheese", label: "Extra cheese" },
  { value: "mushroom", label: "Mushroom" },
  { value: "olive", label: "Olive" },
  { value: "onion", label: "Onion" },
  { value: "pepper", label: "Pepper" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Disable the List</button>
      </div>
      <ui-listbox multiple default-value="basil" aria-label="Toppings">
        ${toppings
          .map(
            (topping) => `
              <ui-listbox-item value="${topping.value}"${topping.value === "olive" ? " disabled" : ""}>
                ${topping.label}
                <ui-listbox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-listbox-item-indicator>
              </ui-listbox-item>`
          )
          .join("")}
      </ui-listbox>
    </div>
  `
  const listbox = root.querySelector("ui-listbox")!
  const button = root.querySelector("button")!
  button.addEventListener("click", () => {
    const disabled = listbox.toggleAttribute("disabled")
    button.textContent = disabled ? "Enable the List" : "Disable the List"
  })
}

export { mount }
```

Try choosing Olive. Then press Disable the List to make every option unavailable until you enable it again.

## Read-Only

Use `read-only` when people should be able to browse the list without changing its value. The list remains focusable and its value still submits.

```ts title="read-only.ts"
import "@ui-sdk/web/listbox"
import { Check, createElement } from "lucide"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-listbox read-only default-value="nuxt" aria-label="Framework">
      ${frameworks
        .map(
          (framework) => `
            <ui-listbox-item value="${framework.value}">
              ${framework.label}
              <ui-listbox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-listbox-item-indicator>
            </ui-listbox-item>`
        )
        .join("")}
    </ui-listbox>
  `
}

export { mount }
```

Move focus through the frameworks. Nuxt stays selected because the list is read-only.

## Form

Add `name` to submit the selection. Multiple selections submit one entry per value. Reset restores `default-value`, and `required` prevents submission when nothing is selected.

The custom element participates in forms once its definition is loaded, without a hidden input.

The list can live outside its form: set `form` to the form’s ID, as this example does. A disabled fieldset also disables the list. [Forms](../forms.md) covers the shared integration.

```ts title="form.ts"
import "@ui-sdk/web/listbox"
import { Check, createElement } from "lucide"
import { log } from "./log"

const toppings = [
  { value: "basil", label: "Basil" },
  { value: "cheese", label: "Extra cheese" },
  { value: "mushroom", label: "Mushroom" },
  { value: "olive", label: "Olive" },
  { value: "onion", label: "Onion" },
  { value: "pepper", label: "Pepper" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-listbox multiple name="toppings" form="pizza-order" required default-value="cheese" aria-label="Toppings">
        ${toppings
          .map(
            (topping) => `
              <ui-listbox-item value="${topping.value}">
                ${topping.label}
                <ui-listbox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-listbox-item-indicator>
              </ui-listbox-item>`
          )
          .join("")}
      </ui-listbox>
      <form id="pizza-order" data-slot="row">
        <button type="reset">Reset</button>
        <button data-variant="solid">Order</button>
      </form>
    </div>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    log(root, `Ordered ${new FormData(form).getAll("toppings").join(", ")}`)
  })
}

export { mount }
```

Choose Basil and press Order: the console logs both toppings. Reset restores Extra cheese; clearing every option makes the required list block the order.

## Object Values

Pass objects as item values when the selection should carry more than an ID. `itemToValue` provides the string used for identity and form submission; `isItemEqualToValue` matches objects that represent the same option but are different instances.

```ts title="data.ts"
import type { ListData } from "@ui-sdk/core/listbox"
import "@ui-sdk/web/listbox"
import { Check, createElement } from "lucide"
import { log } from "./log"

const plans: ListData<{ id: string; price: number }> = [
  { value: { id: "hobby", price: 0 }, label: "Hobby" },
  { value: { id: "pro", price: 20 }, label: "Pro" },
  { value: { id: "team", price: 50 }, label: "Team" },
  {
    value: { id: "enterprise", price: 200 },
    label: "Enterprise",
    disabled: true,
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-listbox default-value="pro" aria-label="Plan">
      <template>
        <ui-listbox-item>
          <ui-listbox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-listbox-item-indicator>
        </ui-listbox-item>
      </template>
    </ui-listbox>
  `
  const listbox = root.querySelector("ui-listbox")!
  listbox.itemToValue = (plan) => (plan as { id: string }).id
  listbox.isItemEqualToValue = (plan, selected) =>
    (plan as { id: string }).id === (selected as { id: string }).id
  listbox.items = plans
  listbox.addEventListener("valuechange", (event) => {
    const plan = event.detail.value as { id: string; price: number } | null
    log(root, plan ? `${plan.id}, $${plan.price} a month` : "No plan")
  })
}

export { mount }
```

Choose Team. The console logs the price from the selected object, not from its string ID.

`items` supplies the collection as a property and can render the options for you. Add a `<template>` to style the generated parts, as the example does. Use `ListData<T>` to type object-valued data. [Lists and Menus](../lists-and-menus.md) covers the shared data format.

## Controller

A controller can select all options, clear the selection, or focus the list from another control. Use the element’s `api` property. [Controllers](../controllers.md) covers setup and lifetime.

```ts title="controller.ts"
import "@ui-sdk/web/listbox"
import { Check, createElement } from "lucide"
import { log } from "./log"

const toppings = [
  { value: "basil", label: "Basil" },
  { value: "cheese", label: "Extra cheese" },
  { value: "mushroom", label: "Mushroom" },
  { value: "olive", label: "Olive" },
  { value: "onion", label: "Onion" },
  { value: "pepper", label: "Pepper" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-run="selectAll">Select All</button>
        <button type="button" data-run="clear">Clear</button>
        <button type="button" data-run="focus">Focus</button>
      </div>
      <ui-listbox multiple aria-label="Toppings">
        ${toppings
          .map(
            (topping) => `
              <ui-listbox-item value="${topping.value}">
                ${topping.label}
                <ui-listbox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-listbox-item-indicator>
              </ui-listbox-item>`
          )
          .join("")}
      </ui-listbox>
    </div>
  `
  const listbox = root.querySelector("ui-listbox")!
  for (const button of root.querySelectorAll<HTMLButtonElement>("[data-run]")) {
    button.addEventListener("click", () =>
      listbox.api[button.dataset.run as "selectAll" | "clear" | "focus"]()
    )
  }
  listbox.addEventListener("valuechange", (event) => {
    log(
      root,
      `${(event.detail.value as string[]).length} selected (${event.detail.reason})`
    )
  })
}

export { mount }
```

Press Select All, Clear and Focus. Each button drives the same list through its controller, and the console logs the change.

## Scrollable

Give a long list a maximum height and `overflow-y: auto`. It starts scrolled to the selected option without taking focus. Keyboard navigation reveals the focused option without scrolling the page.

```ts title="scrollable.ts"
import "@ui-sdk/web/listbox"
import { Check, createElement } from "lucide"
import { log } from "./log"

const timezones = Array.from({ length: 27 }, (_, index) => {
  const offset = index - 12
  const label = `UTC${offset < 0 ? "−" : "+"}${String(Math.abs(offset)).padStart(2, "0")}:00`
  return { value: `utc${offset}`, label }
})

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-listbox default-value="utc9" aria-label="Time zone">
      ${timezones
        .map(
          (zone, index) => `
            <ui-listbox-item value="${zone.value}" index="${index}">
              ${zone.label}
              <ui-listbox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-listbox-item-indicator>
            </ui-listbox-item>`
        )
        .join("")}
    </ui-listbox>
  `
  root.querySelector("ui-listbox")!.addEventListener("highlight", (event) => {
    const { value, index } = event.detail
    if (value) {
      log(
        root,
        `Focused ${timezones[index].label} (${index + 1} of ${timezones.length})`
      )
    }
  })
}

export { mount }
```

Focus the list and use the arrow keys. Options scroll into view, and the console logs the focused time zone.

For a virtualized list, supply `items` so typeahead knows about unmounted options. The `highlight` event reports the focused value and index; each rendered item’s `index` places it in the full collection for screen readers. The [Select virtualization example](./select.md#virtualized) shows the same data and scrolling approach.

Set `keep-in-view="false"` when something else scrolls the list, like a wheel that picks the option at its center with [`bindScrollPicker`](../core.md#wheels-you-scroll-to-pick-from). The list then leaves its scroll position alone as keys move focus.

## Custom Rendering

Render an option as a link when choosing it should navigate. A press or Enter follows the link and selects the option. This example uses manual activation so arrow keys only browse.

```html
<ui-listbox-item value="remix" as-child>
  <a href="#remix">Remix</a>
</ui-listbox-item>
```

```ts title="render.ts"
import "@ui-sdk/web/listbox"
import { createElement, ExternalLink } from "lucide"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-listbox default-value="next" activation="manual" aria-label="Framework docs">
      ${frameworks
        .map(
          (framework) => `
            <ui-listbox-item value="${framework.value}" label="${framework.label}" as-child>
              <a href="#${framework.value}">
                <span>${framework.label}</span>
              </a>
            </ui-listbox-item>`
        )
        .join("")}
    </ui-listbox>
  `
  const listbox = root.querySelector("ui-listbox")!
  const icon = createElement(ExternalLink, { "aria-hidden": "true" })
  function update() {
    const link = root.querySelector(`a[href="#${listbox.value}"]`)
    if (link) {
      link.append(icon)
    } else {
      icon.remove()
    }
  }
  update()
  listbox.addEventListener("valuechange", update)
}

export { mount }
```

Focus Remix and press Enter, or choose it with the pointer. The option is selected and its link updates the URL hash.

[Parts and Composition](../parts-and-composition.md) covers the shared rendering API. Each part’s state is listed [below](#state).

## Styling

Use `data-selected` for the selection and `data-highlighted` for focus. They can describe different options when selection does not follow focus. Disabled and read-only states have their own attributes.

Each part has a `data-slot`, such as `listbox-item`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

`<ui-listbox-group>`, `<ui-listbox-group-label>` and `<ui-listbox-separator>` have no state attributes.

### `<ui-listbox>`
`[data-slot="listbox"]`

- `data-orientation` (`vertical`, `horizontal`): Which arrow keys move between items.
- `data-disabled`: Present when the listbox is disabled, by its own prop, a Field or a `<fieldset>`.
- `data-readonly`: Present when the listbox is read-only.
- `data-required`: Present when the listbox is required.
- `data-has-icons`: Present while any item inside holds an icon part, so items without one can line up.

### `<ui-listbox-item>`
`[data-slot="listbox-item"]`

- `data-selected`: Present on selected items, and on the check inside them.
- `data-disabled`: Present when the item can't be chosen. It can still be focused.
- `data-highlighted`: Present on the item that has focus.
- `data-has-icon`: Present on an item while it holds an icon part.

### `<ui-listbox-item-indicator>`
`[data-slot="listbox-item-indicator"]`

- `data-selected`: Present on selected items, and on the check inside them.

### `<ui-listbox-item-icon>`
`[data-slot="listbox-item-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

## API Reference

Props are attributes in kebab case, like `default-value` and `read-only`. A `default-value` names items by their keys, comma-separated with `multiple`. `items`, `itemToValue`, `isItemEqualToValue` and `controller` are properties, and `value` is a live property. Callbacks are DOM events.

### Listbox

- `activation?` (`"automatic" | "manual"`): Whether the selection follows focus. `"automatic"`: arrow keys, Home, End and typing select the option they move to, and with `multiple` a press replaces the selection while Ctrl or ⌘ adds to it, like a native multiple select. `"manual"`: keys only move focus, and Space, Enter or a press selects, or toggles with `multiple`.
- `deselectable?` (`boolean`): Whether pressing the selected item of a single listbox unselects it, so nothing is selected.
- `orientation?` (`"horizontal" | "vertical"`): Which arrow keys move between items. Horizontal lists use Left and Right, swapped in right-to-left text.
- `loop?` (`boolean`): Whether arrow keys wrap from the last item to the first. Shift with an arrow never wraps.
- `keepInView?` (`boolean`): Whether the list scrolls the option keys move to into view, and the selected option when it first shows. Turn it off when something else scrolls the list, like `bindScrollPicker`.
- `items?` (`ListData<T>`): The items as data. Renders them for you, and lets typing find items a virtualized list hasn't rendered.
- `itemToValue?` (`((value: T) => string)`): The string an item's value submits as and is identified by, for object values. Strings pass through, and objects use their `value` or `id`.
- `isItemEqualToValue?` (`((itemValue: T, value: T) => boolean)`): Whether an item's value is the selected value, for object values that aren't the same object.
- `highlight event`: Runs when focus moves to another item, with its index among the items, so a virtualized list can scroll to it.
- `disabled?` (`boolean`): Disables the listbox like a native control: its items can't be focused or chosen, and the value isn't submitted.
- `readOnly?` (`boolean`): Keeps the listbox focusable and its value submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission until a value is selected, with the browser's own message.
- `name?` (`string`): The name the value submits under. Without one, the listbox submits nothing.
- `form?` (`string`): The id of a form to belong to, when the listbox isn't inside that form.
- `controller?` (`object`): Reads and sets the listbox from anywhere. Create one with `createListboxController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.
- `multiple?` (`boolean`): Whether several items can be selected. The value is then a list, Shift selects ranges, and Ctrl or ⌘ with A selects every item. Whether several items can be selected.
- `value?` (`T | T[] | null`): The selected value. Pass it to control the listbox. `null` selects nothing. The selected values. Pass it to control the listbox. The selected value, or values with `multiple`. Pass it to control the listbox.
- `defaultValue?` (`T | T[] | null`): The value selected at first, when uncontrolled. A form reset returns to it. The values selected at first, when uncontrolled. A form reset returns to them. The value or values selected at first, when uncontrolled. A form reset returns to it.
- `valuechange event`: Runs when a user, a form reset or a controller wants to change the value. `details.reason` says why, and `details.cancel()` stops it.

### ListboxItem

- `value` (`T`): What the value becomes when the item is chosen. A string, or any value with `itemToValue`.
- `label?` (`string`): The text typing finds, when the content isn't plain text. Not the accessible name: use `aria-label` for that.
- `disabled?` (`boolean`): Keeps the item from being chosen. Arrow keys, typing and ranges skip it. Sets `data-disabled` and `aria-disabled`.
- `index?` (`number`): The item's position among all items, for virtualized lists that render only some. Sets `aria-posinset` and `aria-setsize`.

### ListboxItemIndicator

- `keepMounted?` (`boolean`): Whether the indicator stays in the page while its item isn't selected, so it can be styled or animated in both states.

### ListboxItemIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

`ListboxGroup`, `ListboxGroupLabel` and `ListboxSeparator` take no props of their own.

### State

The same state shows as data attributes on each element.

`Listbox`:

- `multiple` (`boolean | undefined`): Whether several items can be selected.
- `orientation` (`"horizontal" | "vertical"`): Which arrow keys move between items.
- `disabled` (`boolean`): Whether the listbox is disabled, by itself, a Field or a `<fieldset>`.
- `readOnly` (`boolean`): Whether the listbox keeps its value but refuses changes, from its `readOnly` option. A form reset still restores it.
- `required` (`boolean`): Whether a value is required.
- `items` (`ListData<unknown>`): The data items, for rendering a virtualized list yourself. Empty without `items`.

`ListboxItem`:

- `highlighted` (`boolean`): Whether the item has focus.
- `selected` (`boolean`): Whether its value is in the listbox's value, compared with `isItemEqualToValue` when you pass one.
- `disabled` (`boolean`): Whether the item can't be chosen, by itself or a disabled listbox.

`ListboxItemIndicator`:

- `selected` (`boolean`): Whether its item is selected. While false, the indicator isn't shown unless `keepMounted` is set.

### Reasons

`event.detail.reason` says why the value changed: `item-press` for a press, Space or Enter, `list-navigation` for keys that select as they move, Shift ranges with arrows and Ctrl or ⌘ with A, `reset` and `restore` from the form, and `imperative` from a controller.

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods.

Every write method takes an optional `{ reason, event }`, passed to `valuechange`.

- `getValue()` (`() => ListboxValue<T, Multiple>`): The selected value.
- `setValue(value, options?)` (`(value: ListboxValue<T, Multiple>, options?: ListboxChangeOptions | undefined) => boolean`): Selects a value, as a user would. A disabled or read-only listbox ignores it. Returns false when the change was canceled or nothing changed.
- `clear(options?)` (`(options?: ListboxChangeOptions | undefined) => boolean`): Selects nothing: `null`, or an empty list with `multiple`. Returns false when the change was canceled or nothing changed.
- `selectAll(options?)` (`(options?: ListboxChangeOptions | undefined) => boolean`): Selects every enabled item, with `multiple`. Returns false when the change was canceled or nothing changed.
- `focus()` (`() => void`): Moves focus into the list, onto the option that holds its tab stop.

### Events

Events fire on their own element and don't bubble, with the new value in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` cancels the change. Type the element as `UiListboxElement` for typed listeners.

| Member              | On           | Description                                                      |
| ------------------- | ------------ | ---------------------------------------------------------------- |
| `value` property    | `ui-listbox` | The selected value. A string names items by key, comma-separated |
| `api` property      | `ui-listbox` | The [controller](#controller)                                    |
| `items` property    | `ui-listbox` | The items as data                                                |
| `valuechange` event | `ui-listbox` | `detail: { value, reason, event, source }`                       |
| `highlight` event   | `ui-listbox` | `detail: { value, index, event }`: the option that has focus     |

## Accessibility

Follows the [WAI-ARIA listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/), with both of its keyboard models for several options. Options take real focus with one roving tab stop. Every option says whether it's selected.

### Focus

The list is one tab stop. Tab returns to the last focused option, then falls back to the first selected or enabled option. Options receive real DOM focus, so `focus-visible` works directly.

The root forwards focus into the options, including when you press a Field label or the list’s padding. Escape stays available to an enclosing dialog.

### Tested Behavior

Every line below is an automated test.

**Focus**

- Tab lands on the first option when nothing is selected.
- Tab lands on the selected option.
- Tab lands on the first selected option with multiple.
- The list is one tab stop: Tab leaves it from any option.
- Shift+Tab back into the list returns to the option focused last.
- A press focuses the option.
- Arrow keys skip disabled options.
- A disabled option can't be chosen.
- Arrow keys from a pressed disabled option move to the enabled ones around it.
- Tab lands on the first enabled option when the selected one is disabled.

**Single selection**

- Arrow keys move focus and the selection follows.
- Home and End move to the first and last option.
- Arrow keys wrap from the last option to the first.
- With loop off, arrow keys stop at the ends.
- A press selects the option.
- Pressing the selected option keeps it selected.
- With deselectable, pressing the selected option unselects it.
- With manual activation, arrows only move focus and Space selects.
- Typing moves focus to the next option that starts with it, and selects it.
- Typing several letters finds the option that starts with them.
- Escape leaves the selection alone.

**Multiple selection**

- Presses and Space toggle options.
- Arrow keys move focus without changing the selection.
- Shift with a press selects the range from the last option chosen.
- Shift with an arrow passes over a disabled option.
- A range skips disabled options.
- A second Shift press changes the range, keeping what was selected before it.
- Shift with an arrow key moves focus and extends the selection.
- Shift with Space selects from the last option chosen to the focused one.
- Ctrl+Shift+End selects from the focused option to the last.
- Ctrl+Shift+Home selects from the focused option to the first.
- Ctrl+A selects every enabled option, and again unselects them.
- Ctrl+A does nothing in a single listbox.
- Typing moves focus without selecting.

**Multiple selection with automatic activation**

- A press replaces the selection.
- Ctrl or Cmd with a press adds an option, and removes it again.
- Shift with a press replaces the selection with a range.
- Arrow keys select the option they move to.
- Ctrl or Cmd with an arrow moves focus only, and with Space toggles.
- Shift with an arrow key extends the selection.

**Horizontal**

- Left and Right move between options, and Up and Down don't.

**Groups**

- Arrow keys move across groups, skipping their labels.
- A range crosses groups.

**Form**

- Submits the selected value under its name.
- Submits each value with multiple.
- A reset returns to the default value.
- Required blocks submission until a value is selected.
- A disabled listbox can't be focused or changed, and submits nothing.
- A disabled fieldset disables the listbox.
- A read-only listbox can be browsed but not changed, and submits.

**Changes**

- A canceled change keeps the selection.
- A controlled listbox shows the value it's given.
- The controller clears and selects everything.

Runs in React, Vue and web components.

Beyond the pattern:

- Keys pressed with no waits between them all land.
- Escape leaves the selection alone and reaches a dialog around the list.
- A Shift press after the selection was cleared starts a new range there.
- Shift with an arrow never wraps past the end.
- A Shift press doesn't select the page's text.
- The selected option scrolls into view without taking focus.
- Arrow keys keep the focused option clear of the list's scroll padding at both ends.
- The selected option scrolls into view clear of the list's scroll padding.
- A focused option that leaves the list hands focus back to it, so keys keep working.
- Options that all leave take the tab stop with them, and options that come back hold it again.
- Options the app reorders keep their place in the keys.
- A press on the list's padding gives focus to the option that holds the tab stop.

**Touch**

- Taps toggle where clicks replace, since touch has no modifier keys.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while choosing one option with a keyboard.
- Announcements while choosing several options with a keyboard.

Runs in React, Vue and web components.
