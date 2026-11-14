# Autocomplete

Suggest text while someone types, without limiting what they can enter.

Use Autocomplete for a text field with helpful suggestions. Choosing one fills in the field, but any text is a valid value. Use [Combobox](./combobox.md) when the value should be a selected option instead.

```ts title="demo.ts"
import "@ui-sdk/web/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-autocomplete>
      <div data-slot="stack">
        <ui-autocomplete-label>Favorite fruit</ui-autocomplete-label>
        <ui-autocomplete-input>
          <input placeholder="e.g. Mango" />
        </ui-autocomplete-input>
      </div>
      <ui-autocomplete-content hidden>
        <ui-autocomplete-empty>No fruits found.</ui-autocomplete-empty>
        <ui-autocomplete-list>
          ${fruits
            .map(
              (fruit) => `
                <ui-autocomplete-item value="${fruit}">${fruit}</ui-autocomplete-item>
              `
            )
            .join("")}
        </ui-autocomplete-list>
      </ui-autocomplete-content>
    </ui-autocomplete>
  `
}

export { mount }
```

Type “man”, press Down Arrow, then Enter to fill in Mango. You can also leave text that is not in the list.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the element definitions once in your application:

```ts
import "@ui-sdk/web/autocomplete"
```

## Composition

Use the following composition to build a `ui-autocomplete`:

```text
ui-autocomplete
├── ui-autocomplete-label
├── ui-autocomplete-input
│   └── input
└── ui-autocomplete-content
    ├── ui-autocomplete-empty
    └── ui-autocomplete-list
        ├── ui-autocomplete-item
        └── ui-autocomplete-item
```

Name the input, then put suggestions in a list inside the popup. `ui-autocomplete-input` wraps a native input. Each suggestion needs a unique value.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/autocomplete"
</script>

<ui-autocomplete>
  <ui-autocomplete-label>Fruit</ui-autocomplete-label>
  <ui-autocomplete-input
    ><input placeholder="Type a fruit…"
  /></ui-autocomplete-input>
  <ui-autocomplete-content hidden>
    <ui-autocomplete-list>
      <ui-autocomplete-item value="Apple">Apple</ui-autocomplete-item>
      <ui-autocomplete-item value="Banana">Banana</ui-autocomplete-item>
    </ui-autocomplete-list>
  </ui-autocomplete-content>
</ui-autocomplete>
```

## Autocomplete vs Combobox

Both filter a list as you type. They differ in what the value is.

- **Autocomplete**: the value is the text. Suggestions help fill it in, and anything typed is valid. Use it for a search box, an address or a free-form field.
- **[Combobox](./combobox.md)**: the value is an option from the list, or several with `multiple`. The text is only a query; closing without choosing restores the selected label, and a form submits the value, not the text. Use it for a country, an assignee or a set of labels.

## Build Your Own

`@ui-sdk/web/autocomplete` comes with ready-made `ui-autocomplete` elements. If you'd like to build your own, with your own element names, start from the `autocomplete` primitive in `@ui-sdk/core`:

```ts title="fruit-search-elements.ts"
import { autocomplete } from "@ui-sdk/core/autocomplete"
import { createParts, wrappedChild } from "@ui-sdk/web"

createParts(autocomplete, {
  root: "fruit-search",
  label: "fruit-label",
  input: {
    tag: "fruit-input",
    target: wrappedChild("input"),
    display: "contents",
  },
  content: "fruit-popup",
  list: "fruit-list",
  item: "fruit-option",
  empty: "fruit-empty",
})
```

```html
<fruit-search>
  <fruit-label>Fruit</fruit-label>
  <fruit-input><input /></fruit-input>
  <fruit-popup hidden>
    <fruit-empty>No fruits found.</fruit-empty>
    <fruit-list>
      <fruit-option value="Apple">Apple</fruit-option>
      <fruit-option value="Mango">Mango</fruit-option>
    </fruit-list>
  </fruit-popup>
</fruit-search>
```

Each element keeps the behavior, state and data attributes of its ready-made counterpart: typing filters the options, arrow keys move the highlight and the popup opens in the top layer. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Disabled

A disabled field cannot be focused or changed and submits nothing. A read-only field stays focusable and submits its value, but does not open or accept changes. Disabled suggestions are skipped by keyboard navigation and cannot fill in the field.

```ts title="disabled.ts"
import "@ui-sdk/web/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-autocomplete disabled default-value="Banana">
        <div data-slot="stack">
          <ui-autocomplete-label>Disabled</ui-autocomplete-label>
          <ui-autocomplete-input>
            <input />
          </ui-autocomplete-input>
        </div>
      </ui-autocomplete>
      <ui-autocomplete read-only default-value="Cherry">
        <div data-slot="stack">
          <ui-autocomplete-label>Read-only</ui-autocomplete-label>
          <ui-autocomplete-input>
            <input />
          </ui-autocomplete-input>
        </div>
      </ui-autocomplete>
      <ui-autocomplete>
        <div data-slot="stack">
          <ui-autocomplete-label>Some suggestions disabled</ui-autocomplete-label>
          <ui-autocomplete-input>
            <input placeholder="Type “b”" />
          </ui-autocomplete-input>
        </div>
        <ui-autocomplete-content hidden>
          <ui-autocomplete-list>
            ${fruits
              .map(
                (fruit, index) =>
                  `<ui-autocomplete-item value="${fruit}" ${index % 3 === 0 ? "disabled" : ""}>${fruit}</ui-autocomplete-item>`
              )
              .join("")}
          </ui-autocomplete-list>
        </ui-autocomplete-content>
      </ui-autocomplete>
    </div>
  `
}

export { mount }
```

Try the Disabled and Read-only fields. In Disabled suggestion, type “b”: arrow keys skip Banana and a press cannot choose it.

## Clear and Trigger

`ui-autocomplete-clear` empties the field and returns focus to it. `ui-autocomplete-trigger` lets someone open the suggestions without typing. Give the trigger a label that describes what it opens.

```ts title="clear.ts"
import "@ui-sdk/web/autocomplete"
import { ChevronDown, createElement, X } from "lucide"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-autocomplete default-value="Mango">
      <div data-slot="stack">
        <ui-autocomplete-label>Fruit</ui-autocomplete-label>
        <div data-slot="row">
          <ui-autocomplete-input>
            <input />
          </ui-autocomplete-input>
          <ui-autocomplete-clear>
            <button aria-label="Clear">${createElement(X, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-autocomplete-clear>
          <ui-autocomplete-trigger>
            <button aria-label="Show fruits">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-autocomplete-trigger>
        </div>
      </div>
      <ui-autocomplete-content hidden>
        <ui-autocomplete-empty>No fruits found.</ui-autocomplete-empty>
        <ui-autocomplete-list>
          ${fruits.map((fruit) => `<ui-autocomplete-item value="${fruit}">${fruit}</ui-autocomplete-item>`).join("")}
        </ui-autocomplete-list>
      </ui-autocomplete-content>
    </ui-autocomplete>
  `
}

export { mount }
```

Clear Mango, then press Show fruits to open the suggestions. The clear button disappears while the field is empty.

## Open on Focus

Add `open-on-focus` to offer suggestions as soon as the input receives focus. This works well when there are useful choices before someone types.

```ts title="open-on-focus.ts"
import "@ui-sdk/web/autocomplete"

const recent = ["react hooks", "tailwind grid", "web components", "vue v-model"]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-autocomplete open-on-focus>
      <ui-autocomplete-input>
        <input aria-label="Search" placeholder="Search…" />
      </ui-autocomplete-input>
      <ui-autocomplete-content hidden>
        <ui-autocomplete-empty>No results.</ui-autocomplete-empty>
        <ui-autocomplete-list>
          <ui-autocomplete-group>
            <ui-autocomplete-group-label>Recent searches</ui-autocomplete-group-label>
            ${recent.map((search) => `<ui-autocomplete-item value="${search}">${search}</ui-autocomplete-item>`).join("")}
          </ui-autocomplete-group>
        </ui-autocomplete-list>
      </ui-autocomplete-content>
    </ui-autocomplete>
  `
}

export { mount }
```

Focus Search docs to see recent searches before typing. Escape closes them; pressing the field opens them again.

## Auto Highlight

`auto-highlight` highlights the first match while typing, so Enter can choose it immediately. Set `loop` to `false` to stop arrow keys at either end of the list.

```ts title="auto-highlight.ts"
import "@ui-sdk/web/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-autocomplete auto-highlight loop="false">
      <div data-slot="stack">
        <ui-autocomplete-label>Fruit</ui-autocomplete-label>
        <ui-autocomplete-input>
          <input placeholder="Type, then Enter" />
        </ui-autocomplete-input>
      </div>
      <ui-autocomplete-content hidden>
        <ui-autocomplete-empty>No fruits found.</ui-autocomplete-empty>
        <ui-autocomplete-list>
          ${fruits.map((fruit) => `<ui-autocomplete-item value="${fruit}">${fruit}</ui-autocomplete-item>`).join("")}
        </ui-autocomplete-list>
      </ui-autocomplete-content>
    </ui-autocomplete>
  `
}

export { mount }
```

Type “pe” and press Enter to choose the first match. Arrow keys stop at the ends because this example disables looping.

## Inline Completion

`inline-complete` fills in the rest of the first suggestion that starts with the typed text, with the added text selected. Arrow keys fill in the suggestion they highlight. End or Right Arrow accepts the completion; Backspace or Escape takes it back out.

```ts title="inline.ts"
import "@ui-sdk/web/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-autocomplete inline-complete>
      <div data-slot="stack">
        <ui-autocomplete-label>Fruit</ui-autocomplete-label>
        <ui-autocomplete-input>
          <input placeholder="Type “bl”" />
        </ui-autocomplete-input>
      </div>
      <ui-autocomplete-content hidden>
        <ui-autocomplete-empty>No fruits found.</ui-autocomplete-empty>
        <ui-autocomplete-list>
          ${fruits.map((fruit) => `<ui-autocomplete-item value="${fruit}">${fruit}</ui-autocomplete-item>`).join("")}
        </ui-autocomplete-list>
      </ui-autocomplete-content>
    </ui-autocomplete>
  `
}

export { mount }
```

Type “bl” to complete blackberry inline. Backspace removes the completion; Down Arrow fills in Blueberry. Press End to accept the text.

## Highlight Matches

`ui-autocomplete-item-text` marks the matching text, ignoring case and accents using the current locale. Each match is a `<mark>` you can style.

```ts title="highlight.ts"
import "@ui-sdk/web/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-autocomplete>
      <div data-slot="stack">
        <ui-autocomplete-label>Favorite fruit</ui-autocomplete-label>
        <ui-autocomplete-input>
          <input placeholder="e.g. berry" />
        </ui-autocomplete-input>
      </div>
      <ui-autocomplete-content hidden>
        <ui-autocomplete-empty>No fruits found.</ui-autocomplete-empty>
        <ui-autocomplete-list>
          ${fruits
            .map(
              (fruit) => `
                <ui-autocomplete-item value="${fruit}">
                  <ui-autocomplete-item-text>${fruit}</ui-autocomplete-item-text>
                </ui-autocomplete-item>
              `
            )
            .join("")}
        </ui-autocomplete-list>
      </ui-autocomplete-content>
    </ui-autocomplete>
  `
}

export { mount }
```

Type “berry”. The matching letters are bold while each suggestion keeps its original spelling.

## Filter and Keywords

The default filter matches text anywhere in a suggestion. Use `"startsWith"` or `"fuzzy"` for a different match, a function for your own filter, or `false` for results already filtered by a server. `keywords` adds searchable text without changing what goes in the field.

```ts title="filter.ts"
import "@ui-sdk/web/autocomplete"

const tags = [
  { value: "feature", label: "feature", keywords: ["enhancement", "request"] },
  { value: "fix", label: "fix", keywords: ["bug", "patch"] },
  { value: "docs", label: "docs", keywords: ["documentation", "readme"] },
  { value: "performance", label: "performance", keywords: ["speed", "slow"] },
  { value: "security", label: "security", keywords: ["vulnerability"] },
  { value: "refactor", label: "refactor", keywords: ["cleanup"] },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-autocomplete filter="startsWith">
      <div data-slot="stack">
        <ui-autocomplete-label>Tag</ui-autocomplete-label>
        <ui-autocomplete-input>
          <input placeholder="Try “bug”" />
        </ui-autocomplete-input>
      </div>
      <ui-autocomplete-content hidden>
        <ui-autocomplete-empty>No tags found.</ui-autocomplete-empty>
        <ui-autocomplete-list>
          ${tags
            .map(
              (tag) => `
                <ui-autocomplete-item value="${tag.value}" label="${tag.label}" keywords="${tag.keywords.join(",")}">
                  ${tag.label}
                  <span data-slot="hint">${tag.keywords[0]}</span>
                </ui-autocomplete-item>
              `
            )
            .join("")}
        </ui-autocomplete-list>
      </ui-autocomplete-content>
    </ui-autocomplete>
  `
}

export { mount }
```

Type “bug” to find fix through its keywords. Type “re” to find labels or keywords that start with those letters.

## Groups

Use `ui-autocomplete-group` and `ui-autocomplete-group-label` to name related suggestions. Filtering hides empty groups and separators.

```ts title="groups.ts"
import "@ui-sdk/web/autocomplete"

const fruitGroups = [
  {
    label: "Tree fruits",
    items: ["Apple", "Apricot", "Cherry", "Lemon", "Peach", "Pear"],
  },
  {
    label: "Berries",
    items: ["Blackberry", "Blueberry", "Grape", "Strawberry"],
  },
  { label: "Tropical", items: ["Avocado", "Banana", "Mango", "Pineapple"] },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-autocomplete>
      <div data-slot="stack">
        <ui-autocomplete-label>Fruit</ui-autocomplete-label>
        <ui-autocomplete-input>
          <input placeholder="e.g. Pear" />
        </ui-autocomplete-input>
      </div>
      <ui-autocomplete-content hidden>
        <ui-autocomplete-empty>No fruits found.</ui-autocomplete-empty>
        <ui-autocomplete-list>
          ${fruitGroups
            .map(
              (group, index) => `
                ${index > 0 ? `<ui-autocomplete-separator></ui-autocomplete-separator>` : ""}
                <ui-autocomplete-group>
                  <ui-autocomplete-group-label>${group.label}</ui-autocomplete-group-label>
                  ${group.items.map((fruit) => `<ui-autocomplete-item value="${fruit}">${fruit}</ui-autocomplete-item>`).join("")}
                </ui-autocomplete-group>
              `
            )
            .join("")}
        </ui-autocomplete-list>
      </ui-autocomplete-content>
    </ui-autocomplete>
  `
}

export { mount }
```

Type “an”. Banana and Mango remain in Tropical; groups with no matches disappear.

## Icons

`ui-autocomplete-item-icon` keeps decorative icons out of accessible names, filtering, and the text put in the field. Add `mirror` for directional icons. An icon-only suggestion still needs an `aria-label`.

```ts title="icons.ts"
import "@ui-sdk/web/autocomplete"
import {
  Archive,
  Clock,
  createElement,
  File,
  Pencil,
  Reply,
  Star,
} from "lucide"

const mailSearches = [
  { value: "Starred", icon: Star },
  { value: "Drafts", icon: Pencil },
  { value: "Replies", icon: Reply, mirror: true },
  { value: "Attachments", icon: File },
  { value: "Archived", icon: Archive },
  { value: "Scheduled", icon: Clock },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-autocomplete>
      <ui-autocomplete-input>
        <input type="search" aria-label="Search mail" placeholder="Search mail…" />
      </ui-autocomplete-input>
      <ui-autocomplete-content hidden>
        <ui-autocomplete-empty>No searches found.</ui-autocomplete-empty>
        <ui-autocomplete-list>
          ${mailSearches
            .map(
              (search) => `
                <ui-autocomplete-item value="${search.value}"><ui-autocomplete-item-icon ${search.mirror ? "mirror" : ""}>${createElement(search.icon, { "aria-hidden": "true" }).outerHTML}</ui-autocomplete-item-icon>${search.value}</ui-autocomplete-item>
              `
            )
            .join("")}
        </ui-autocomplete-list>
      </ui-autocomplete-content>
    </ui-autocomplete>
  `
}

export { mount }
```

Type “rep” and choose Replies. The icon stays out of the text put in the field.

## Items as Data

Map an array into parts when you want to write the markup yourself. This example maps fruit groups and adds a separator between them.

```ts title="data.ts"
import "@ui-sdk/web/autocomplete"

const fruitGroups = [
  {
    label: "Tree fruits",
    fruits: ["Apple", "Apricot", "Cherry", "Lemon", "Peach", "Pear"],
  },
  {
    label: "Berries",
    fruits: ["Blackberry", "Blueberry", "Grape", "Strawberry"],
  },
  { label: "Tropical", fruits: ["Avocado", "Banana", "Mango", "Pineapple"] },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-autocomplete>
      <div data-slot="stack">
        <ui-autocomplete-label>Fruit</ui-autocomplete-label>
        <ui-autocomplete-input>
          <input placeholder="e.g. Peach" />
        </ui-autocomplete-input>
      </div>
      <ui-autocomplete-content hidden>
        <ui-autocomplete-empty>No fruits found.</ui-autocomplete-empty>
        <ui-autocomplete-list>
          ${fruitGroups
            .map(
              (group, index) => `
                ${index > 0 ? `<ui-autocomplete-separator></ui-autocomplete-separator>` : ""}
                <ui-autocomplete-group>
                  <ui-autocomplete-group-label>${group.label}</ui-autocomplete-group-label>
                  ${group.fruits.map((fruit) => `<ui-autocomplete-item value="${fruit}">${fruit}</ui-autocomplete-item>`).join("")}
                </ui-autocomplete-group>
              `
            )
            .join("")}
        </ui-autocomplete-list>
      </ui-autocomplete-content>
    </ui-autocomplete>
  `
}

export { mount }
```

Open the list to see three fruit groups. Type “an” to narrow them to Banana and Mango.

Pass `items` when the autocomplete needs the whole collection, such as server results or recent searches. Assign it as a property and use a `<template>` to style the generated parts. [Lists and Menus](../lists-and-menus.md) covers the `ListData` format.

Suggestions can change while the list is open. The highlight stays with its suggestion, and the typed text stays unchanged. Removing the highlighted suggestion clears the highlight.

## Controlled

The value is always a string. Set its initial text with `default-value`, then read or write the element’s `value` property. The popup has a separate `open` property. Listen for `valuechange` and `openchange`; the requested value is in `event.detail.value`. Call `event.preventDefault()` to reject a change. [State and Events](../state-and-events.md) covers controlled state and cancellation.

```ts title="controlled.ts"
import "@ui-sdk/web/autocomplete"
import { log } from "./log"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-autocomplete debug>
        <ui-autocomplete-label>Fruit (12 characters at most)</ui-autocomplete-label>
        <ui-autocomplete-input>
          <input />
        </ui-autocomplete-input>
        <ui-autocomplete-content hidden>
          <ui-autocomplete-empty>No fruits found.</ui-autocomplete-empty>
          <ui-autocomplete-list>
            ${fruits.map((fruit) => `<ui-autocomplete-item value="${fruit}">${fruit}</ui-autocomplete-item>`).join("")}
          </ui-autocomplete-list>
        </ui-autocomplete-content>
      </ui-autocomplete>
    </div>
  `
  const autocomplete = root.querySelector("ui-autocomplete")!
  autocomplete.addEventListener("valuechange", (event) => {
    if (event.detail.value.length > 12) {
      return event.preventDefault()
    }
    log(root, `text: ${event.detail.reason}`)
  })
  autocomplete.addEventListener("openchange", (event) => {
    log(
      root,
      `${event.detail.value ? "opened" : "closed"}: ${event.detail.reason}`
    )
  })
  autocomplete.addEventListener("openchangecomplete", (event) => {
    log(root, `${event.detail.value ? "opened" : "closed"} and settled`)
  })
  autocomplete.addEventListener("highlight", (event) => {
    if (event.detail.value) {
      log(root, `highlighted ${event.detail.value}`)
    }
  })
}

export { mount }
```

Type more than 12 characters and the extra text is refused. The console shows each change and its reason.

## Controller

Use the element’s `api` property. It can `setValue()`, `clear()`, `focus()`, `setOpen()`, or read `getValue()` and `isOpen()`. `open()` returns a promise that resolves when the popup closes, including abort and unmount; `close()` closes it. See [Controllers](../controllers.md) for lifecycle and change options.

```ts title="controller.ts"
import "@ui-sdk/web/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-action="open" data-size="sm">Open</button>
        <button type="button" data-action="type" data-size="sm">Type “Pea”</button>
        <button type="button" data-action="clear" data-size="sm">Clear</button>
        <button type="button" data-action="focus" data-size="sm">Focus</button>
      </div>
      <ui-autocomplete>
        <ui-autocomplete-label>Fruit</ui-autocomplete-label>
        <ui-autocomplete-input>
          <input />
        </ui-autocomplete-input>
        <ui-autocomplete-content hidden>
          <ui-autocomplete-empty>No fruits found.</ui-autocomplete-empty>
          <ui-autocomplete-list>
            ${fruits.map((item) => `<ui-autocomplete-item value="${item}">${item}</ui-autocomplete-item>`).join("")}
          </ui-autocomplete-list>
        </ui-autocomplete-content>
      </ui-autocomplete>
    </div>
  `
  const fruit = root.querySelector("ui-autocomplete")!.api
  const actions: Record<string, () => void> = {
    open: () => fruit.open(),
    type: () => fruit.setValue("Pea"),
    clear: () => fruit.clear(),
    focus: () => fruit.focus(),
  }
  for (const button of root.querySelectorAll<HTMLElement>("[data-action]")) {
    button.addEventListener("click", () => actions[button.dataset.action!]())
  }
}

export { mount }
```

Use the buttons to open the suggestions, type Pea, clear the field or focus it from outside.

## Positioning

Use `side`, `align`, offsets, or a custom `anchor` to position the suggestions. `container` chooses where they render, and `keep-mounted` keeps closed content in the DOM. [Popups](../popups.md) covers positioning, portals, animation, and modal behavior.

```ts title="positioning.ts"
import "@ui-sdk/web/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div id="autocomplete-positioning-box" data-slot="card">
      <ui-autocomplete modal="pointer" container="#autocomplete-positioning-box">
        <div data-slot="stack">
          <ui-autocomplete-label>Fruit</ui-autocomplete-label>
          <ui-autocomplete-input>
            <input />
          </ui-autocomplete-input>
        </div>
        <ui-autocomplete-content side="top" align="end" side-offset="10" align-offset="-4" collision-padding="8" anchor="#autocomplete-positioning-box" keep-mounted hidden>
          <ui-autocomplete-empty>No fruits found.</ui-autocomplete-empty>
          <ui-autocomplete-list>
            ${fruits.map((fruit) => `<ui-autocomplete-item value="${fruit}">${fruit}</ui-autocomplete-item>`).join("")}
          </ui-autocomplete-list>
        </ui-autocomplete-content>
      </ui-autocomplete>
    </div>
  `
}

export { mount }
```

Open the suggestions. They appear above the card, aligned to its end.

## Animation

The content has `data-starting-style` while it opens and `data-ending-style` while it closes. Transition from those states, and the popup stays mounted until the exit finishes:

```css
[data-slot="autocomplete-content"] {
  transition:
    opacity 0.15s,
    translate 0.2s cubic-bezier(0.22, 1, 0.36, 1);

  &:is([data-starting-style], [data-ending-style]) {
    opacity: 0;
    translate: 0 -6px;
  }
}
```

```ts title="animation.ts"
import "@ui-sdk/web/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-autocomplete>
      <div data-slot="stack">
        <ui-autocomplete-label>Favorite fruit</ui-autocomplete-label>
        <ui-autocomplete-input>
          <input placeholder="e.g. Mango" />
        </ui-autocomplete-input>
      </div>
      <ui-autocomplete-content hidden>
        <ui-autocomplete-empty>No fruits found.</ui-autocomplete-empty>
        <ui-autocomplete-list>
          ${fruits
            .map(
              (fruit) => `
                <ui-autocomplete-item value="${fruit}">${fruit}</ui-autocomplete-item>
              `
            )
            .join("")}
        </ui-autocomplete-list>
      </ui-autocomplete-content>
    </ui-autocomplete>
  `
}

export { mount }
```

Type to open the suggestions. They slide and fade in, and fade out before they unmount.

## Presentation

`presentation="sheet"` opens suggestions in a sheet. `"auto"` chooses a sheet on small touch screens and a popover elsewhere, each time the list opens. The server starts with the popover.

The same input moves into the sheet’s header. Opening by touch leaves the keyboard closed; tapping the input opens it and expands the sheet. Choosing a suggestion or swiping down closes it. Keyboard and mouse opening preserve input focus.

A sheet is modal unless `modal` is `false`. Give it a height, keep suggestions inside `ui-autocomplete-list`, and leave the content’s `translate` alone so dragging can move it. Use `data-presentation` to style both presentations and `--sheet-backdrop` to set the dimmed background.

```ts title="presentation.ts"
import "@ui-sdk/web/autocomplete"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-autocomplete presentation="sheet">
      <div data-slot="stack">
        <ui-autocomplete-label>Favorite fruit</ui-autocomplete-label>
        <ui-autocomplete-input>
          <input placeholder="e.g. Mango" />
        </ui-autocomplete-input>
      </div>
      <ui-autocomplete-content hidden>
        <ui-autocomplete-empty>No fruits found.</ui-autocomplete-empty>
        <ui-autocomplete-list>
          ${fruits.map((fruit) => `<ui-autocomplete-item value="${fruit}">${fruit}</ui-autocomplete-item>`).join("")}
        </ui-autocomplete-list>
      </ui-autocomplete-content>
    </ui-autocomplete>
  `
}

export { mount }
```

Open the field to see a sheet. On touch, tap the field in its header to show the keyboard, or swipe down to close it.

## Forms

The native input is the form control: `name` gives its submitted key, `required` rejects empty text, and reset restores `default-value`. Text does not have to match a suggestion. Use `form` to associate the field with a form elsewhere in the page.

```ts title="form.ts"
import "@ui-sdk/web/autocomplete"
import "@ui-sdk/web/field"
import { log } from "./log"

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Pineapple",
  "Strawberry",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form id="order" data-slot="stack">
      <ui-field>
        <ui-field-label>Fruit</ui-field-label>
        <ui-autocomplete name="fruit" form="order" required default-value="Apple">
          <ui-autocomplete-input>
            <input />
          </ui-autocomplete-input>
          <ui-autocomplete-content hidden>
            <ui-autocomplete-empty>No fruits found.</ui-autocomplete-empty>
            <ui-autocomplete-list>
              ${fruits.map((fruit) => `<ui-autocomplete-item value="${fruit}">${fruit}</ui-autocomplete-item>`).join("")}
            </ui-autocomplete-list>
          </ui-autocomplete-content>
        </ui-autocomplete>
        <ui-field-description>Any fruit, listed or not.</ui-field-description>
        <div><ui-field-error></ui-field-error></div>
      </ui-field>
      <div data-slot="row">
        <button type="submit" data-variant="solid">Submit</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const data = [...new FormData(form)].map(
      ([name, value]) => `${name}=${value}`
    )
    log(root, `Submitted ${data.join("&")}`)
  })
}

export { mount }
```

Submit Apple, then choose Mango. Choosing it fills the field without submitting. Reset restores Apple.

## Search

Enter with no suggestion highlighted fires a `submit` event with the text, then allows the surrounding form to submit. Call `preventDefault()` on the `submit` event if your handler already performs the search.

Choosing a suggestion normally only fills in the field. Add `submit-on-select` to search as soon as someone chooses one.

```ts title="search.ts"
import "@ui-sdk/web/autocomplete"
import { log } from "./log"

const recent = ["react hooks", "tailwind grid", "web components", "vue v-model"]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form role="search" data-slot="stack">
      <ui-autocomplete submit-on-select name="q">
        <ui-autocomplete-input>
          <input type="search" aria-label="Search" placeholder="Search…" />
        </ui-autocomplete-input>
        <ui-autocomplete-content hidden>
          <ui-autocomplete-empty>No results.</ui-autocomplete-empty>
          <ui-autocomplete-list>
            ${recent.map((search) => `<ui-autocomplete-item value="${search}">${search}</ui-autocomplete-item>`).join("")}
          </ui-autocomplete-list>
        </ui-autocomplete-content>
      </ui-autocomplete>
    </form>
  `
  root
    .querySelector("form")!
    .addEventListener("submit", (event) => event.preventDefault())
  root.querySelector("ui-autocomplete")!.addEventListener("submit", (event) => {
    log(root, `Searched “${event.detail.value}”`)
  })
}

export { mount }
```

Type “kotlin” and press Enter to search. Choose a suggestion to search for that text instead.

## Recent Searches

Pair `emptyItems` with `items` to show one collection while the field is empty and search the full collection once someone types. Add `open-on-focus` to show the recent searches on focus.

```ts title="recent.ts"
import "@ui-sdk/web/autocomplete"

const recent = ["react hooks", "tailwind grid", "web components", "vue v-model"]
const topics = [
  ...recent,
  "react server components",
  "tailwind colors",
  "vue router",
]
const recentSearches = [
  { type: "group" as const, label: "Recent searches", items: recent },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-autocomplete open-on-focus>
      <ui-autocomplete-input>
        <input type="search" aria-label="Search docs" placeholder="Search docs…" />
      </ui-autocomplete-input>
      <ui-autocomplete-content hidden>
        <ui-autocomplete-empty>No topics found.</ui-autocomplete-empty>
        <ui-autocomplete-list></ui-autocomplete-list>
      </ui-autocomplete-content>
      <template>
        <ui-autocomplete-group>
          <ui-autocomplete-group-label></ui-autocomplete-group-label>
          <ui-autocomplete-item>
            <ui-autocomplete-item-text></ui-autocomplete-item-text>
          </ui-autocomplete-item>
        </ui-autocomplete-group>
      </template>
    </ui-autocomplete>
  `
  const autocomplete = root.querySelector("ui-autocomplete")!
  autocomplete.announcement = (change) =>
    change.type === "results"
      ? `${change.count} ${change.count === 1 ? "topic" : "topics"}`
      : null
  autocomplete.emptyItems = recentSearches
  autocomplete.items = topics
}

export { mount }
```

Focus the empty field to see Recent searches. Type “react” to search all topics, then clear the text to return to recent searches.

## Async Suggestions

Use [async options](../utilities/async-options.md) to wait for typing to pause and discard stale results. Pass its `items` and `status`, set `filter` to `false`, and send text changes to its `setQuery()` method.

`ui-autocomplete-status` and `ui-autocomplete-empty` provide loading, error, and empty messages. Without a status part, `announcement` controls what screen readers hear when typing pauses. The `loadmore` event can request another page when scrolling or highlighting reaches the last suggestion.

```ts title="async.ts"
import { createAsyncOptions } from "@ui-sdk/core/async-options"
import "@ui-sdk/web/autocomplete"

function searchCities(query: string, { signal }: { signal: AbortSignal }) {
  const cities = [
    "Amsterdam",
    "Athens",
    "Barcelona",
    "Berlin",
    "Boston",
    "Brussels",
    "Buenos Aires",
    "Cairo",
    "Chicago",
    "Copenhagen",
    "Dublin",
    "Lisbon",
    "London",
    "Los Angeles",
    "Madrid",
    "Paris",
    "Prague",
    "Rome",
    "Seoul",
    "Tokyo",
  ]
  return new Promise<string[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      resolve(cities.filter((city) => city.toLowerCase().startsWith(needle)))
    }, 300)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-autocomplete filter="false">
      <div data-slot="stack">
        <ui-autocomplete-label>City</ui-autocomplete-label>
        <ui-autocomplete-input>
          <input placeholder="e.g. Paris" />
        </ui-autocomplete-input>
      </div>
      <ui-autocomplete-content hidden>
        <ui-autocomplete-status></ui-autocomplete-status>
        <ui-autocomplete-empty>No cities start with “<span></span>”.</ui-autocomplete-empty>
        <ui-autocomplete-list></ui-autocomplete-list>
      </ui-autocomplete-content>
      <template>
        <ui-autocomplete-item>
        </ui-autocomplete-item>
      </template>
    </ui-autocomplete>
  `
  const autocomplete = root.querySelector("ui-autocomplete")!
  const status = root.querySelector("ui-autocomplete-status")!
  const query = root.querySelector("ui-autocomplete-empty span")!
  const results = createAsyncOptions(searchCities, { debounce: 200 })
  const update = () => {
    const { items, status: loading } = results.getState()
    autocomplete.items = items
    autocomplete.setAttribute("status", loading)
    status.textContent =
      loading === "loading"
        ? "Searching…"
        : items.length
          ? `${items.length} ${items.length === 1 ? "city" : "cities"}`
          : ""
  }
  results.subscribe(update)
  update()
  autocomplete.addEventListener("valuechange", (event) => {
    query.textContent = event.detail.value
    results.setQuery(event.detail.value)
  })
  autocomplete.addEventListener("loadmore", () => results.loadMore())
}

export { mount }
```

Type “b” and wait for the city suggestions. Keep typing to replace the search; the status describes the latest results.

## Custom Rendering

Add `as-child` to give a suggestion a different element: the suggestion binds the element inside it. Here each suggestion is a link, so the autocomplete works as a jump-to menu: Enter or a click follows the highlighted link, and the text after the title is a hint that doesn't affect filtering. [Parts and Composition](../parts-and-composition.md) covers the element wrapping API.

```ts title="custom-rendering.ts"
import "@ui-sdk/web/autocomplete"

const pages = [
  { title: "Installation", section: "Get Started", href: "#installation" },
  { title: "Composition", section: "Concepts", href: "#composition" },
  { title: "Build Your Own", section: "Concepts", href: "#build-your-own" },
  { title: "Styling", section: "Guides", href: "#styling" },
  { title: "API Reference", section: "Reference", href: "#api-reference" },
  { title: "Accessibility", section: "Reference", href: "#accessibility" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-autocomplete>
      <div data-slot="stack">
        <ui-autocomplete-label>Jump to</ui-autocomplete-label>
        <ui-autocomplete-input>
          <input placeholder="e.g. Styling" />
        </ui-autocomplete-input>
      </div>
      <ui-autocomplete-content hidden>
        <ui-autocomplete-empty>No sections found.</ui-autocomplete-empty>
        <ui-autocomplete-list>
          ${pages
            .map(
              (page) => `
                <ui-autocomplete-item value="${page.title}" label="${page.title}" as-child>
                  <a href="${page.href}">${page.title}<span data-slot="hint">${page.section}</span></a>
                </ui-autocomplete-item>
              `
            )
            .join("")}
        </ui-autocomplete-list>
      </ui-autocomplete-content>
    </ui-autocomplete>
  `
}

export { mount }
```

Type “sty” and press Enter to jump to the Styling section of this page.

## Styling

Each element has a `data-slot`, such as `autocomplete-content`, and shows its state through the attributes listed under [Data Attributes](#data-attributes).

The popup exposes sizing and animation variables. `--anchor-width` is the input’s width; use `--available-height` on the content to keep a long list in the viewport.

While focus stays in the input, use the content’s `data-modality="keyboard"` with an item’s `data-highlighted` to show a keyboard focus indicator on the highlighted suggestion.

### `<ui-autocomplete-content>`
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

### `<ui-autocomplete-viewport>`
- `--keyboard-inset`: While it presents as a sheet: how many pixels of the page the on-screen keyboard covers, 0 without one.
- `--visual-viewport-width`: While it presents as a sheet: the width of the part of the page you can see.
- `--visual-viewport-height`: While it presents as a sheet: the height of the part of the page you can see, above the keyboard.
- `--visual-viewport-top`: While it presents as a sheet: how far the part of the page you can see is scrolled from the top of the layout, as when the keyboard pushes it up.

## Data Attributes

### `<ui-autocomplete-label>`
`[data-slot="autocomplete-label"]`

- `data-disabled`: Present when the field is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the field is read-only.
- `data-required`: Present when the field is required.

### `<ui-autocomplete-input>`
`[data-slot="autocomplete-input"]`

- `data-closed`: Present while the suggestions are closed, including while they animate out.
- `data-open`: Present while the suggestions are open.
- `data-disabled`: Present when the field is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the field is read-only.
- `data-required`: Present when the field is required.

### `<ui-autocomplete-trigger>`
`[data-slot="autocomplete-trigger"]`

- `data-closed`: Present while the suggestions are closed, including while they animate out.
- `data-open`: Present while the suggestions are open.
- `data-disabled`: Present when the field is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the field is read-only.
- `data-required`: Present when the field is required.

### `<ui-autocomplete-clear>`
`[data-slot="autocomplete-clear"]`

- `data-disabled`: Present when the field is disabled or read-only.

### `<ui-autocomplete-content>`
`[data-slot="autocomplete-content"]`

- `data-closed`: Present while the suggestions are closed, including while they animate out.
- `data-presentation` (`popover`, `sheet`): How the suggestions present this time they're open.
- `data-open`: Present while the suggestions are open.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the list animates out. Style the state you animate to.
- `data-modality` (`keyboard`, `pointer`): Whether the keyboard or a pointer moves the highlight. Style a focus ring for the keyboard only.
- `data-has-icons`: Present while any suggestion inside holds an icon part, so items without one can line up.

### `<ui-autocomplete-item>`
`[data-slot="autocomplete-item"]`

- `data-disabled`: Present when the suggestion can't be chosen. Arrow keys skip it.
- `data-highlighted`: Present on the highlighted suggestion, which Enter fills in. Focus stays in the field.
- `data-has-icon`: Present on a suggestion while it holds an icon part.

### `<ui-autocomplete-item-text>`
`[data-slot="autocomplete-item-text"]`

- `data-matched`: Present on a suggestion's text while the field's text matched part of it, which is marked.

### `<ui-autocomplete-empty>`
`[data-slot="autocomplete-empty"]`

- `data-loading`: Present while results load, with `status="loading"`.
- `data-empty`: Present while no suggestion matches.

### `<ui-autocomplete-status>`
`[data-slot="autocomplete-status"]`

- `data-loading`: Present while results load, with `status="loading"`.

### `<ui-autocomplete-arrow>`
`[data-slot="autocomplete-arrow"]`

- `data-closed`: Present while the suggestions are closed, including while they animate out.
- `data-open`: Present while the suggestions are open.

### `<ui-autocomplete-item-icon>`
`[data-slot="autocomplete-item-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

## API Reference

Props are attributes in kebab case, like `default-value`, `inline-complete` and `open-on-focus`. `filter`
takes `contains`, `startsWith`, `fuzzy` or `false`. `items` and a `filter` function are
properties. `container` and `anchor` take CSS selectors. Callbacks are DOM events.

### Autocomplete

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `value?` (`string`): The text. Pass it to control it.
- `defaultValue?` (`string`): The text at first, when uncontrolled. A form reset returns to it.
- `valuechange event`: Runs when the text wants to change: typing, choosing a suggestion, a Clear part, a form reset or a controller. `details.cancel()` keeps it as it was.
- `open?` (`boolean`): Whether the suggestions are open. Pass it to control them.
- `defaultOpen?` (`boolean`): Whether the suggestions start open, when uncontrolled.
- `openchange event`: Runs when the suggestions want to open or close. `details.reason` says why, and `details.cancel()` stops it.
- `openchangecomplete event`: Runs once the suggestions have finished opening or closing, after any animation.
- `submit event`: Runs with the text when Enter is pressed with no suggestion highlighted, or after choosing one with `submitOnSelect`. The surrounding form submits next, unless the event's `preventDefault()` is called.
- `items?` (`ListData<string>`): The suggestions as data. Renders them for you, and filters them without rendering every one.
- `emptyItems?` (`ListData<string>`): Suggestions shown instead of `items` while the field is empty, like recent searches, with `openOnFocus`. Groups work, like `{ type: "group", label: "Recent", items }`. Needs `items`.
- `filter?` (`SearchFilter<string>`): How typing narrows the suggestions: `"contains"`, `"startsWith"`, `"fuzzy"`, a function of the item and the text, or `false` to keep every one, for results a server already filtered.
- `inlineComplete?` (`boolean`): Whether typing completes the text with the first suggestion that starts with it, with the rest selected after the caret: ArrowRight or End accepts it, Backspace and Escape take it back out, and arrow keys fill in the suggestion they highlight.
- `autoHighlight?` (`boolean`): Whether the first suggestion is highlighted while typing, so Enter chooses it.
- `openOnFocus?` (`boolean`): Whether the suggestions open when the field gets focus, like recent searches, even before anything is typed.
- `submitOnSelect?` (`boolean`): Whether choosing a suggestion submits, like a search box: `submit` runs, then the form submits.
- `status?` (`AsyncOptionsStatus`): Whether results are loading or failed, for the empty and status parts. Sets `aria-busy` on the list while loading.
- `highlight event`: Runs when the highlight moves, with the suggestion's index among the visible ones, so a virtualized list can scroll to it.
- `loadmore event`: Runs when the highlight or scrolling reaches the last suggestion, so the next page can load, like `createAsyncOptions`'s `loadMore`. Not again for the same suggestions, unless the last load failed.
- `announcement?` (`((change: ListAnnouncement) => string | null | undefined)`): What screen readers hear after typing pauses, when no `AutocompleteStatus` is rendered. Return null for nothing.
- `loop?` (`boolean`): Whether arrow keys wrap from the last suggestion to the first.
- `modal?` (`"pointer" | boolean`): `false`: the page stays usable while the suggestions are open. `"pointer"`: an outside press only closes them. `true`: also locks scroll and makes the rest of the page inert.
- `presentation?` (`PresentationSetting<"popover">`): How the suggestions present. `"sheet"` slides them up from the bottom of the screen with the field in its header, where they can be swiped away, and `"auto"` does that on small touch screens. A tap that opens a sheet leaves the keyboard closed until the field in the header is tapped. Decided each time they open; the server renders `"popover"` for `"auto"`.
- `disabled?` (`boolean`): Disables the field like a native input: it can't be focused or changed, and its text isn't submitted.
- `readOnly?` (`boolean`): Keeps the field focusable and its text submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission while the field is empty, with the browser's own message.
- `name?` (`string`): The name the text submits under.
- `form?` (`string`): The id of a form to belong to, when the field isn't inside that form.
- `controller?` (`object`): Opens, closes, reads and sets the autocomplete from anywhere. Create one with `createAutocompleteController()`.
- `dismissible?` (`boolean`): Whether Escape, an outside press, focus or the window leaving, Android's back gesture and a sheet's swipe can close it. Triggers, Close parts and the controller always can. Pass `false` while it holds unsaved work, and ask in `dismissattempt`.
- `dismissattempt event`: Runs when `dismissible` refused a dismissal made on purpose: Escape, an outside press, back or a swipe. Focus or the window leaving is refused without it. Ask "Discard changes?" here.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### AutocompleteLabel

Names the input. `<ui-autocomplete-label>` labels the input, so you don't need a `ui-field`.

### AutocompleteInput

The text field. `<ui-autocomplete-input>` wraps a native `input` and gives it the combobox role.

### AutocompleteTrigger

An optional button that opens and closes the suggestions. `<ui-autocomplete-trigger>` wraps a native `button`.

### AutocompleteClear

- `keepMounted?` (`boolean`): Whether the clear button stays in the page while the field is empty.

### AutocompleteContent

- `side?` (`Side`): Which side of the anchor the popup opens on. Flips to the other side when there isn't room. Which side of the field the suggestions open on.
- `align?` (`Align`): How the popup lines up with the anchor along that side. `start` and `end` follow the reading direction. How the suggestions line up with the field along that side.
- `sideOffset?` (`number`): Gap between the anchor and the popup, in pixels. Gap between the field and the suggestions, in pixels.
- `alignOffset?` (`number`): Shift along the anchor, in pixels. Shift along the field, in pixels.
- `collisionPadding?` (`number`): Space to keep from the viewport edges, in pixels.
- `arrowPadding?` (`number`): Space to keep between the arrow and the popup's corners, in pixels.
- `anchor?` (`string | Anchor | null`): Positions the popup against this instead of its trigger: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. It's read on every check, so it can move. A controller's `open({ anchor })` wins for that open.
- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `keepMounted?` (`boolean`): Whether the suggestions stay in the page, hidden, while closed.

### AutocompleteArrow

An optional arrow pointing at the input. `<ui-autocomplete-arrow>` is positioned on the content's edge.

### AutocompleteStatus

Announces loading and result counts to screen readers. `<ui-autocomplete-status>` announces the text you put in it.

### AutocompleteEmpty

Shows when no suggestion matches. `<ui-autocomplete-empty>` stays hidden while there are matches.

### AutocompleteList

Holds the suggestions. `<ui-autocomplete-list>` is the listbox, and renders `items` when you set them.

### AutocompleteGroup

Groups related suggestions. `<ui-autocomplete-group>` has the group role.

### AutocompleteGroupLabel

Names its group. `<ui-autocomplete-group-label>` labels the group.

### AutocompleteItem

- `value` (`string`): Identifies the suggestion. Choosing it fills the field with its `label`, or with this when there's none.
- `label?` (`string`): The text the field gets and filtering matches, when the content isn't plain text. Not the accessible name: use `aria-label` for that.
- `keywords?` (`string[]`): More words filtering matches.
- `disabled?` (`boolean`): Keeps the suggestion from being chosen. Sets `data-disabled` and `aria-disabled`.
- `index?` (`number`): The suggestion's position among all visible ones, for virtualized lists that render only some. Sets `aria-posinset` and `aria-setsize`.

### AutocompleteItemIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

### AutocompleteItemText

The suggestion's text, with the matched part in `<mark>`. `<ui-autocomplete-item-text>` holds text only.

### AutocompleteSeparator

A divider between suggestions or groups. `<ui-autocomplete-separator>` has the separator role.

### Items as Data

Each suggestion in `items`, or a plain string. Groups are `{ type: "group", label, items }` and separators `{ type: "separator" }`.

- `value` (`T`): Identifies the item, and is what choosing it reports. A string, or any value with `itemToValue`.
- `label` (`string`): The text shown and matched by typeahead and filtering. A select's trigger shows it once chosen.
- `keywords?` (`string[]`): More words filtering matches, like `["team"]` for a plan called Pro.
- `disabled?` (`boolean`): Keeps the item from being chosen. The keyboard skips it, like in a native select.

The whole array is a `ListData`.

### State

The same state shows as data attributes on each element.

`AutocompleteInput` and `AutocompleteTrigger`:

- `open` (`boolean`): Whether the suggestions are open.
- `disabled` (`boolean`): Whether the field is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the field is read-only.
- `required` (`boolean`): Whether the field is required.

`AutocompleteContent` and `AutocompleteList`:

- `open` (`boolean`): Whether the suggestions are open. False while they animate out.
- `presentation` (`"popover" | "sheet"`): How they present this time they're open.
- `status` (`AsyncOptionsStatus`): Whether results are loading or failed.
- `items` (`ListData<string>`): The visible suggestions, for rendering a virtualized list yourself.

`AutocompleteItem`:

- `highlighted` (`boolean`): Whether the suggestion is highlighted, by the keyboard or the pointer.
- `disabled` (`boolean`): Whether the suggestion can't be chosen.

`AutocompleteEmpty`:

- `loading` (`boolean`): Whether results are loading.
- `empty` (`boolean`): Whether no item matches.
- `query` (`string`): The text the list is filtered by.

`AutocompleteStatus`:

- `status` (`"idle" | "loading" | "error"`): Whether results are loading or failed.
- `loading` (`boolean`): Whether results are loading.
- `count` (`number`): How many items are visible.

`AutocompleteClear`:

- `disabled` (`boolean`): Whether the field is disabled or read-only.

`AutocompleteArrow`:

- `open` (`boolean`): Whether the suggestions are open.

`AutocompleteItemText`, which takes no props of its own:

- `segments` (`MatchSegment[]`): The text in pieces, each marked when it matched. Joined, they're the whole text.
- `matched` (`boolean`): Whether any piece matched.

`AutocompleteItemIcon`:

- `mirror` (`boolean`): Whether it flips in right-to-left text.

### Reasons

Why the text changed:

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `clear-press` (`MouseEvent | KeyboardEvent`): A Clear part was pressed, like on an input, a select or a combobox.
- `reset` (`none`): A form reset.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

And why the suggestions opened or closed:

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `trigger-focus` (`FocusEvent`): Keyboard focus reached a trigger that opens on focus, like a tooltip's.
- `input-commit` (`KeyboardEvent | FocusEvent`): Enter, or leaving a number input, committed what was typed: a number input parses, clamps and snaps it to the step, and an autocomplete closes its suggestions on it.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `focus-out` (`KeyboardEvent | FocusEvent`): Focus left the layer, or Tab moved it out.
- `window-blur` (`FocusEvent`): The window lost focus.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.

With `dismissible` false, the refused dismissals `dismissattempt` reports:

- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `outside-press` (`MouseEvent`): A press outside the layer.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.

### Controller

The element's `api` property has the same methods.

- `isOpen()` (`() => boolean`): Whether the suggestions are open.
- `setOpen(open, options?)` (`(open: boolean, options?: AutocompleteChangeOptions<AutocompleteOpenChangeReason> | undefined) => boolean`): Opens or closes the suggestions. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (AutocompleteChangeOptions<AutocompleteOpenChangeReason> & { signal?: AbortSignal | undefined; }) | undefined) => Promise<...>`): Opens the suggestions, and resolves once they close, with why and how. Resolves exactly once and never rejects: on the next close, when `signal` aborts, or with reason `"unmount"`.
- `close(options?)` (`(options?: AutocompleteChangeOptions<AutocompleteOpenChangeReason> | undefined) => boolean`): Closes the suggestions. Returns false when the close was canceled or it was already closed.
- `toggle(options?)` (`(options?: AutocompleteChangeOptions<AutocompleteOpenChangeReason> | undefined) => boolean`): Opens the suggestions when they're closed, and closes them when they're open. Returns false when the change was canceled.
- `getValue()` (`() => string`): The text.
- `setValue(value, options?)` (`(value: string, options?: AutocompleteChangeOptions<AutocompleteValueChangeReason> | undefined) => boolean`): Changes the text, which filters the suggestions. Returns false when the change was canceled or nothing changed.
- `clear(options?)` (`(options?: AutocompleteChangeOptions<AutocompleteValueChangeReason> | undefined) => boolean`): Empties the field. Returns false when the change was canceled or nothing changed.
- `focus()` (`() => void`): Moves focus to the field.

### Events

Events fire on `<ui-autocomplete>` and don't bubble, with the new state in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` on `valuechange` or `openchange` cancels the change.

| Member                     | On                | Description                                                     |
| -------------------------- | ----------------- | --------------------------------------------------------------- |
| `value` property           | `ui-autocomplete` | The text. Setting it changes the text, as a controller would    |
| `open` property, attribute | `ui-autocomplete` | Whether the suggestions are open                                |
| `api` property             | `ui-autocomplete` | The [controller](#controller-1)                                 |
| `valuechange` event        | `ui-autocomplete` | `detail: { value, reason, event, source }`                      |
| `openchange` event         | `ui-autocomplete` | `detail: { value: open, reason, event, source }`                |
| `openchangecomplete` event | `ui-autocomplete` | `detail: { value: open }`, after the animation                  |
| `highlight` event          | `ui-autocomplete` | `detail: { value, index, event }`                               |
| `loadmore` event           | `ui-autocomplete` | When the last suggestion is reached                             |
| `submit` event             | `ui-autocomplete` | `detail: { value }`. Cancel it to keep the form from submitting |
| `dismissattempt` event     | `ui-autocomplete` | `detail: { reason, event }`, when a dismissal was refused       |

## Accessibility

The autocomplete follows the [WAI-ARIA combobox pattern with list autocomplete](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/), and [list and inline](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-both/) with `inline-complete`.

Typing filters the suggestions. Arrow keys move the highlight; Enter fills in the highlighted text and Escape closes the list. Focus usually stays in the input while `aria-activedescendant` identifies the highlighted suggestion. A touch screen-reader trigger can move focus into the list, and a sheet has its own [focus behavior](#presentation).

Every line below is an automated test.

**Field**

- Is a combobox named by its label, with list autocomplete.
- Typing opens the suggestions that match, and the text stays what was typed.
- Text that matches nothing stays, with the empty message.
- Typing in the middle of the text keeps the caret where it was.

**Choosing**

- Arrow keys move the highlight while focus stays in the field.
- Enter fills in the highlighted suggestion and closes, without submitting.
- Clicking a suggestion fills it in and keeps focus in the field.
- A disabled suggestion can't be chosen.
- Escape takes an inline completion back out.
- Escape closes the suggestions and keeps the text.

**Forms**

- Enter with nothing highlighted submits the text as typed.
- The field submits a chosen suggestion's text under its name.
- Required blocks submitting an empty field.
- A disabled field can't be focused or changed.

**Clear**

- The clear button empties the field and keeps focus in it.

Runs in React, Vue and web components.

Also tested:

**Enhancements**

- Inline completion fills in the first match with the rest selected after the caret.
- Backspace takes an inline completion out and doesn't complete again.
- ArrowRight accepts an inline completion.
- With inline completion, arrow keys fill in the suggestion they highlight.
- The suggestions open when the field gets focus.
- Enter with nothing highlighted runs onSubmit with the text.
- Filtering matches a suggestion's keywords.
- A form reset puts the default text back.
- The list is named by the field's label.
- An immediate search runs once when the autocomplete mounts.
- A newer search aborts the older one, and only its results land.
- Arrow keys keep the highlighted item in view when the … scrolls.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while typing and choosing with a keyboard.

Runs in React, Vue and web components.
