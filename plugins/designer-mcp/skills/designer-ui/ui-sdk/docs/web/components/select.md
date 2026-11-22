# Select

Choose one value or several from a popup list.

Use a Select when someone needs to choose from a set of options. It handles opening the list, keyboard navigation, selection, and the value submitted with a form. You provide the parts and styles.

<ComponentExample
  name="select/demo"
  inspect
  caption="Open Role and choose Editor. The list closes and the trigger shows your choice."
/>

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing Select registers its custom elements in the browser. The import is safe on the server.

```ts
import "@ui-sdk/web/select"
```

## Composition

Use the following composition to build a `ui-select`:

```text
ui-select
├── ui-select-label
├── ui-select-trigger
│   └── button
│       └── ui-select-value
└── ui-select-content
    ├── ui-select-item
    └── ui-select-item
```

Start with a label, a trigger, and a list of items. `ui-select-value` shows the selected item's label inside the trigger. `ui-select-label` names the trigger; inside a [Field](./field.md), use its `ui-field-label` instead, as the examples do.

## Usage

Import the elements and put them together:

```html
<script type="module">
  import "@ui-sdk/web/select"
</script>

<ui-select placeholder="Select a role">
  <ui-select-label>Role</ui-select-label>
  <ui-select-trigger>
    <button>
      <ui-select-value></ui-select-value>
    </button>
  </ui-select-trigger>
  <ui-select-content>
    <ui-select-item value="viewer">Viewer</ui-select-item>
    <ui-select-item value="editor">Editor</ui-select-item>
  </ui-select-content>
</ui-select>
```

## Items as Data

Pass an array to `items` when your options come from data. A string is both the value and the label. Use an object when they differ:

```ts
const select = document.querySelector("ui-select")!

select.items = ["Free", "Pro"]
select.items = [{ value: "pro", label: "Pro plan" }]
```

These are option examples; add the label and trigger shown above. `items` can also include groups and separators, checked with `ListData`:

```ts
import type { ListData } from "@ui-sdk/web/select"

const plans: ListData = [
  { value: "free", label: "Free" },
  { type: "separator" },
  { type: "group", label: "Contact sales", items: ["Enterprise"] },
]
```

The select can render bare items from this data. To style them, set `items` on `ui-select` and write `ui-select-item` elements inside `ui-select-content`, as the example does. Set properties such as `items` from JavaScript; attributes only hold text. Keeping the data on the root also makes labels available before the list opens, and written-out items render on the server.

```ts title="data.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import type { ListData } from "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const plans = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
]

const sales = [
  { value: "enterprise", label: "Enterprise" },
  { value: "education", label: "Education", disabled: true },
]

const items: ListData = [
  ...plans,
  { type: "separator" },
  { type: "group", label: "Contact sales", items: sales },
]

const item = (plan: { value: string; label: string; disabled?: boolean }) => `
  <ui-select-item value="${plan.value}"${plan.disabled ? " disabled" : ""}>
    ${plan.label}
    <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
  </ui-select-item>
`

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Plan</ui-field-label>
      <ui-select default-value="pro">
        <ui-select-trigger>
          <button>
            <ui-select-value></ui-select-value>
            ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-select-trigger>
        <ui-select-content>
          ${plans.map(item).join("")}
          <ui-select-separator></ui-select-separator>
          <ui-select-group>
            <ui-select-group-label>Contact sales</ui-select-group-label>
            ${sales.map(item).join("")}
          </ui-select-group>
        </ui-select-content>
      </ui-select>
    </ui-field>
  `
  root.querySelector("ui-select")!.items = items
}

export { mount }
```

Open Plan to see the options, separator, and Contact sales group. Education is disabled; choose Enterprise to update the value.

Items can change while the list is open. Navigation follows the new order, and selection and highlight stay with their values while those items remain. Removing the highlighted item clears the highlight. [Lists and Menus](../lists-and-menus.md) covers shared data shapes.

## Groups

Put related items inside `ui-select-group` and name each group with `ui-select-group-label`. `ui-select-separator` adds a visual break without becoming an option.

```ts title="groups.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const fonts = [
  {
    label: "Sans serif",
    items: [
      { value: "inter", label: "Inter" },
      { value: "geist", label: "Geist" },
    ],
  },
  {
    label: "Serif",
    items: [
      { value: "source-serif", label: "Source Serif" },
      { value: "lora", label: "Lora" },
    ],
  },
  {
    label: "Monospace",
    items: [
      { value: "geist-mono", label: "Geist Mono" },
      { value: "jetbrains-mono", label: "JetBrains Mono" },
    ],
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Font</ui-field-label>
      <ui-select placeholder="Select a font">
        <ui-select-trigger>
          <button>
            <ui-select-value></ui-select-value>
            ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-select-trigger>
        <ui-select-content>
          ${fonts
            .map(
              (group, index) => `
                ${index > 0 ? "<ui-select-separator></ui-select-separator>" : ""}
                <ui-select-group>
                  <ui-select-group-label>${group.label}</ui-select-group-label>
                  ${group.items
                    .map(
                      (item) => `
                        <ui-select-item value="${item.value}">
                          ${item.label}
                          <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
                        </ui-select-item>
                      `
                    )
                    .join("")}
                </ui-select-group>
              `
            )
            .join("")}
        </ui-select-content>
      </ui-select>
    </ui-field>
  `
}

export { mount }
```

Open Font and choose from Sans serif, Serif or Monospace. Each group has a label that screen readers announce.

## Icons

`ui-select-item-icon` keeps an icon separate from the item's text, so it doesn't affect its accessible name, typeahead, or search. Add `ui-select-value-icon` to the trigger to show the selected item's icon there too.

```html
<ui-select-trigger>
  <button>
    <ui-select-value-icon></ui-select-value-icon>
    <ui-select-value></ui-select-value>
  </button>
</ui-select-trigger>
```

The full example marks directional icons with `mirror`, so they flip in right-to-left layouts. Items containing only an icon still need an `aria-label`.

```ts title="icons.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import {
  Check,
  ChevronDown,
  createElement,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignStart,
} from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Text alignment</ui-field-label>
      <ui-select default-value="start">
        <ui-select-trigger>
          <button>
            <ui-select-value-icon></ui-select-value-icon>
            <ui-select-value></ui-select-value>
            ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-select-trigger>
        <ui-select-content>
          <ui-select-item value="start">
            <ui-select-item-icon mirror>${createElement(TextAlignStart, { "aria-hidden": "true" }).outerHTML}</ui-select-item-icon>
            Start
            <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
          </ui-select-item>
          <ui-select-item value="center">
            <ui-select-item-icon>${createElement(TextAlignCenter, { "aria-hidden": "true" }).outerHTML}</ui-select-item-icon>
            Center
            <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
          </ui-select-item>
          <ui-select-item value="end">
            <ui-select-item-icon mirror>${createElement(TextAlignEnd, { "aria-hidden": "true" }).outerHTML}</ui-select-item-icon>
            End
            <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
          </ui-select-item>
        </ui-select-content>
      </ui-select>
    </ui-field>
  `
}

export { mount }
```

Choose Center or End. Both the label and the icon in the trigger update to match the selected item.

## Typeahead

With the trigger focused and closed, typing selects the next matching option without opening the list. With the list open, typing moves the highlight; Enter chooses the highlighted item.

Set an item's `label` when its content includes extra text that shouldn't be matched. Here, country names match typing; calling codes don't.

```ts title="typeahead.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const countries = [
  { value: "ar", label: "Argentina", code: "+54" },
  { value: "au", label: "Australia", code: "+61" },
  { value: "at", label: "Austria", code: "+43" },
  { value: "be", label: "Belgium", code: "+32" },
  { value: "br", label: "Brazil", code: "+55" },
  { value: "ca", label: "Canada", code: "+1" },
  { value: "dk", label: "Denmark", code: "+45" },
  { value: "fr", label: "France", code: "+33" },
  { value: "de", label: "Germany", code: "+49" },
  { value: "gr", label: "Greece", code: "+30" },
  { value: "ie", label: "Ireland", code: "+353" },
  { value: "jp", label: "Japan", code: "+81" },
  { value: "es", label: "Spain", code: "+34" },
  { value: "se", label: "Sweden", code: "+46" },
  { value: "ch", label: "Switzerland", code: "+41" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Country</ui-field-label>
      <ui-select default-value="fr">
        <ui-select-trigger>
          <button>
            <ui-select-value></ui-select-value>
            ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-select-trigger>
        <ui-select-content>
          ${countries
            .map(
              (country) => `
                <ui-select-item value="${country.value}" label="${country.label}">
                  ${country.label}
                  <span data-slot="hint">${country.code}</span>
                  <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
                </ui-select-item>
              `
            )
            .join("")}
        </ui-select-content>
      </ui-select>
    </ui-field>
  `
}

export { mount }
```

Focus Country and type “sw” to select Sweden without opening the list. Open it and type “g” to highlight Germany, then press Enter.

## Disabled

A disabled select can't be focused or changed and doesn't submit a value. A read-only select stays focusable and submits its value, but can't change. Keyboard navigation skips disabled items, and they can't be chosen.

```ts title="disabled.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const countries = [
  { value: "ca", label: "Canada" },
  { value: "dk", label: "Denmark" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "jp", label: "Japan" },
  { value: "es", label: "Spain" },
]

const fields = [
  { label: "Billing country", disabled: true },
  { label: "Shipping from", readOnly: true },
  { label: "Shipping to" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      ${fields
        .map(
          (field) => `
            <ui-field>
              <ui-field-label>${field.label}</ui-field-label>
              <ui-select
                ${field.disabled || field.readOnly ? 'default-value="fr"' : ""}
                placeholder="Select a country"
                ${field.disabled ? "disabled" : ""}
                ${field.readOnly ? "read-only" : ""}
              >
                <ui-select-trigger>
                  <button>
                    <ui-select-value></ui-select-value>
                    ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
                  </button>
                </ui-select-trigger>
                <ui-select-content>
                  ${countries
                    .map(
                      (country) => `
                        <ui-select-item value="${country.value}"${country.value === "dk" ? " disabled" : ""}>
                          ${country.label}
                          <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
                        </ui-select-item>
                      `
                    )
                    .join("")}
                </ui-select-content>
              </ui-select>
            </ui-field>
          `
        )
        .join("")}
    </div>
  `
}

export { mount }
```

Billing country is disabled and Shipping from is read-only. Open Shipping to and press the arrow keys: the highlight skips Denmark, which can't be chosen.

## Clear Button

`placeholder` appears while nothing is selected. Add `ui-select-clear` to return to that state. Clearing sets a single value to `null`, or multiple values to an empty array, and returns focus to the trigger.

Keep the clear button beside the trigger: a button can't contain another button. `keep-mounted` lets it stay in the DOM when there is nothing to clear.

```ts title="clearable.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement, X } from "lucide"
import { log } from "./log"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Assignee</ui-field-label>
      <ui-select default-value="ines" placeholder="Unassigned">
        <div data-slot="row">
          <ui-select-trigger>
            <button>
              <ui-select-value></ui-select-value>
              ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-select-trigger>
          <ui-select-clear>
            <button aria-label="Clear assignee">${createElement(X, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-select-clear>
        </div>
        <ui-select-content>
          ${people
            .map(
              (person) => `
                <ui-select-item value="${person.value}">
                  ${person.label}
                  <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
                </ui-select-item>
              `
            )
            .join("")}
        </ui-select-content>
      </ui-select>
    </ui-field>
  `
  root.querySelector("ui-select")!.addEventListener("valuechange", (event) => {
    log(
      root,
      `value: ${JSON.stringify(event.detail.value)} (${event.detail.reason})`
    )
  })
}

export { mount }
```

Press the clear button. The trigger shows Unassigned, focus returns to it, and the console logs null. Choose someone to bring the button back.

## Multiple

Set `multiple` to select more than one value. The value becomes an array, and choosing an item toggles it while keeping the list open.

```html
<ui-select multiple default-value="en, ja"></ui-select>
```

Listen for `valuechange` and update a child of `ui-select-value` to summarize a long selection, as this example does.

```ts title="multiple.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"
import { log } from "./log"

const languages = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "pt", label: "Portuguese" },
  { value: "es", label: "Spanish" },
]

function summary(value: string[]) {
  const labels = value.map(
    (key) => languages.find((language) => language.value === key)?.label ?? key
  )
  return labels.length === 0
    ? "Select languages"
    : labels.length > 2
      ? `${labels[0]} and ${labels.length - 1} more`
      : labels.join(", ")
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Languages</ui-field-label>
      <ui-select multiple default-value="en, ja" placeholder="Select languages">
        <ui-select-trigger>
          <button>
            <ui-select-value>${summary(["en", "ja"])}</ui-select-value>
            ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-select-trigger>
        <ui-select-content>
          ${languages
            .map(
              (language) => `
                <ui-select-item value="${language.value}">
                  ${language.label}
                  <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
                </ui-select-item>
              `
            )
            .join("")}
        </ui-select-content>
      </ui-select>
    </ui-field>
  `
  const text = root.querySelector("ui-select-value")!
  root.querySelector("ui-select")!.addEventListener("valuechange", (event) => {
    const value = event.detail.value as string[]
    text.textContent = summary(value)
    log(root, `value: ${JSON.stringify(value)}`)
  })
}

export { mount }
```

Choose several languages, then choose one again to remove it. The list stays open, and the console logs the array.

## Select All

Add `ui-select-select-all` to select or clear every enabled item. It shows a mixed state when only some are selected. Inside a `ui-select-group`, it applies to that group.

`<ui-select-value max-labels="2">` shows up to two labels and summarizes the remaining values. `getMoreLabel` lets you write that summary.

```ts title="select-all.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement, Minus } from "lucide"

const regions = [
  { value: "us-east", label: "US East" },
  { value: "us-west", label: "US West" },
  { value: "europe", label: "Europe" },
  { value: "asia-pacific", label: "Asia Pacific" },
  { value: "south-america", label: "South America" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Regions</ui-field-label>
      <ui-select multiple default-value="us-east, europe, asia-pacific" placeholder="Select regions">
        <ui-select-trigger>
          <button>
            <ui-select-value max-labels="2"></ui-select-value>
            ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-select-trigger>
        <ui-select-content>
          <ui-select-select-all>
            Select all
            ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
            ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
          </ui-select-select-all>
          <ui-select-separator></ui-select-separator>
          ${regions
            .map(
              (region) => `
                <ui-select-item value="${region.value}">
                  ${region.label}
                  <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
                </ui-select-item>
              `
            )
            .join("")}
        </ui-select-content>
      </ui-select>
    </ui-field>
  `
  root.querySelector("ui-select-value")!.getMoreLabel = (count) =>
    `${count} more`
}

export { mount }
```

Open Regions and press Select all. Press it again to clear the selection, then choose one region to see the mixed state.

## Search with Groups

Add `ui-select-input` inside `ui-select-content` to filter the options. Put the items in `ui-select-list`, so the search field stays outside the scrollable list. `ui-select-empty` shows when nothing matches.

```html
<ui-select-content>
  <ui-select-input><input aria-label="Search countries" /></ui-select-input>
  <ui-select-empty>No countries found.</ui-select-empty>
  <ui-select-list><!-- Items go here. --></ui-select-list>
</ui-select-content>
```

Groups with no matching items hide automatically. `ui-select-item-text` can highlight the matching text; this example styles the `<mark>` elements it creates to bold the matches. Closing the popup clears the search.

```ts title="search-groups.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const regions = [
  {
    label: "Americas",
    items: [
      { value: "br", label: "Brazil" },
      { value: "ca", label: "Canada" },
      { value: "mx", label: "Mexico" },
    ],
  },
  {
    label: "Europe",
    items: [
      { value: "fr", label: "France" },
      { value: "de", label: "Germany" },
      { value: "es", label: "Spain" },
    ],
  },
  {
    label: "Asia Pacific",
    items: [
      { value: "au", label: "Australia" },
      { value: "jp", label: "Japan" },
      { value: "sg", label: "Singapore" },
    ],
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Country</ui-field-label>
      <ui-select placeholder="Select a country">
        <ui-select-trigger>
          <button>
            <ui-select-value></ui-select-value>
            ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-select-trigger>
        <ui-select-content>
          <ui-select-input>
            <input aria-label="Search countries" placeholder="Search countries…" />
          </ui-select-input>
          <ui-select-empty>No countries found.</ui-select-empty>
          <ui-select-list>
            ${regions
              .map(
                (group) => `
                  <ui-select-group>
                    <ui-select-group-label>${group.label}</ui-select-group-label>
                    ${group.items
                      .map(
                        (item) => `
                          <ui-select-item value="${item.value}" label="${item.label}">
                            <ui-select-item-text>${item.label}</ui-select-item-text>
                            <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
                          </ui-select-item>
                        `
                      )
                      .join("")}
                  </ui-select-group>
                `
              )
              .join("")}
          </ui-select-list>
        </ui-select-content>
      </ui-select>
    </ui-field>
  `
}

export { mount }
```

Open Country and type “ja”. Only Asia Pacific and Japan remain. Try “zz” to see the empty message, then clear the search to show every country.

Arrow keys move the highlight while focus stays in the search field. On a touch screen reader, focus moves into the items instead. To show recent choices before a search, pass `emptyItems` alongside `items`. [Lists and Menus](../lists-and-menus.md#search-and-load-items) covers filtering options.

## Async Search

Use `filter="false"` when the server already filters your options. Listen for `querychange` to update your loader, and set the select's `items` and `status` properties.

This example uses [Async Options](../utilities/async-options.md) to replace stale requests and load another page through `loadmore`. `ui-select-status` shows loading and result counts. Without a status part, Select announces result counts through the page's live region.

```ts title="async-search.ts"
import { createAsyncOptions } from "@ui-sdk/core/async-options"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const countryList = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "cn", label: "China" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "in", label: "India" },
  { value: "ie", label: "Ireland" },
  { value: "it", label: "Italy" },
  { value: "jp", label: "Japan" },
  { value: "mx", label: "Mexico" },
  { value: "nl", label: "Netherlands" },
  { value: "no", label: "Norway" },
  { value: "pt", label: "Portugal" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

function searchCountries(
  query: string,
  { signal, page }: { signal: AbortSignal; page: number }
) {
  return new Promise<{ items: typeof countryList; hasMore: boolean }>(
    (resolve, reject) => {
      const timer = setTimeout(() => {
        const needle = query.trim().toLowerCase()
        const found = countryList.filter((country) =>
          country.label.toLowerCase().includes(needle)
        )
        resolve({
          items: found.slice(page * 6, page * 6 + 6),
          hasMore: found.length > page * 6 + 6,
        })
      }, 400)
      signal.addEventListener("abort", () => {
        clearTimeout(timer)
        reject(signal.reason)
      })
    }
  )
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Country</ui-field-label>
      <ui-select filter="false" placeholder="Select a country">
        <ui-select-trigger>
          <button>
            <ui-select-value></ui-select-value>
            ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-select-trigger>
        <ui-select-content>
          <ui-select-input>
            <input aria-label="Search countries" placeholder="Search countries…" />
          </ui-select-input>
          <ui-select-empty></ui-select-empty>
          <ui-select-list></ui-select-list>
          <ui-select-status></ui-select-status>
        </ui-select-content>
        <template>
          <ui-select-item>
            <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
          </ui-select-item>
        </template>
      </ui-select>
    </ui-field>
  `
  const select = root.querySelector("ui-select")!
  const empty = root.querySelector("ui-select-empty")!
  const status = root.querySelector("ui-select-status")!
  const results = createAsyncOptions(searchCountries, { immediate: true })
  let query = ""
  const update = () => {
    const { items, status: loading } = results.getState()
    select.items = items
    select.setAttribute("status", loading)
    empty.textContent =
      loading === "loading" ? "" : `No countries match “${query}”.`
    status.textContent =
      loading === "loading"
        ? "Loading…"
        : loading === "error"
          ? "Couldn't load countries."
          : `${items.length} shown`
  }
  results.subscribe(update)
  update()
  select.addEventListener("querychange", (event) => {
    query = event.detail.value
    results.setQuery(query)
    update()
  })
  select.addEventListener("loadmore", () => results.loadMore())
}

export { mount }
```

Open Country and type “an”. Results arrive after a short delay. Clear the search and move or scroll to the last result to load another page.

## Object Values

A value can be an object. Set it as a `ui-select-item`'s `value` property, since attributes only hold text, and tell the select how to identify it, display it, and compare it with another copy:

| Property             | What It Does                                                          |
| -------------------- | --------------------------------------------------------------------- |
| `itemToValue`        | Returns the string used to identify and submit the value.             |
| `itemToLabel`        | Returns the text shown in the trigger.                                |
| `isItemEqualToValue` | Matches an item with a selected value that may be a different object. |

```ts title="object-values.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"
import { log } from "./log"

type Member = { id: number; name: string; email: string }

const members: Member[] = [
  { id: 1, name: "Hollis Grant", email: "hollis@example.com" },
  { id: 2, name: "Inès Moreau", email: "ines@example.com" },
  { id: 3, name: "Kofi Mensah", email: "kofi@example.com" },
  { id: 4, name: "Wren Takahashi", email: "wren@example.com" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Assignee</ui-field-label>
      <ui-select name="assignee" placeholder="Unassigned">
        <ui-select-trigger>
          <button>
            <ui-select-value></ui-select-value>
            ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-select-trigger>
        <ui-select-content>
          ${members
            .map(
              (member) => `
                <ui-select-item>
                  <span data-slot="stack">
                    ${member.name}
                    <span data-slot="hint">${member.email}</span>
                  </span>
                  <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
                </ui-select-item>
              `
            )
            .join("")}
        </ui-select-content>
      </ui-select>
    </ui-field>
  `
  const select = root.querySelector("ui-select")!
  select.itemToValue = (member) => String((member as Member).id)
  select.itemToLabel = (member) => (member as Member).name
  select.isItemEqualToValue = (item, value) =>
    (item as Member).id === (value as Member).id
  root
    .querySelectorAll("ui-select-item")
    .forEach((item, index) => (item.value = members[index]))
  select.value = { ...members[1] }
  select.addEventListener("valuechange", (event) => {
    const member = event.detail.value as Member | null
    log(root, `Submits assignee=${member ? member.id : ""}`)
  })
}

export { mount }
```

Inès starts selected even though the initial value is a copy of her item. Choose another assignee; the console logs the ID the form submits.

## Virtualized

For a large list, pass every option through `items` and render only the visible rows. The `highlight` event tells your virtualizer which row to bring into view. Give each rendered item its full-list `index` so the accessibility attributes describe its position correctly.

The example includes its own small row-windowing helpers. You can use the same props with a virtualizer of your choice.

```ts title="virtualized.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import { ChevronDown, createElement } from "lucide"

const manyItems = Array.from({ length: 10_000 }, (_, index) => ({
  value: `item-${index + 1}`,
  label: `Item ${index + 1}`,
}))

function visibleRows(
  scrollTop: number,
  height: number,
  count: number,
  row: number
) {
  const start = Math.max(0, Math.floor(scrollTop / row) - 4)
  const end = Math.min(count, Math.ceil((scrollTop + height) / row) + 4)
  return { start, end }
}

function scrollForRow(
  index: number,
  scrollTop: number,
  height: number,
  row: number
) {
  const top = index * row
  if (top < scrollTop) {
    return top
  }
  if (top + row > scrollTop + height) {
    return top + row - height
  }
  return scrollTop
}

const row = 32
const height = 288

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Item</ui-field-label>
      <ui-select placeholder="Select an item">
        <ui-select-trigger>
          <button>
            <ui-select-value></ui-select-value>
            ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-select-trigger>
        <ui-select-content>
          <div style="height: ${height}px">
            <ui-select-list>
              <div style="height: ${manyItems.length * row}px"></div>
            </ui-select-list>
          </div>
        </ui-select-content>
      </ui-select>
    </ui-field>
  `
  const select = root.querySelector("ui-select")!
  const scroller = root.querySelector<HTMLElement>("ui-select-content > div")!
  const rows = root.querySelector<HTMLElement>("ui-select-list > div")!

  const rendered = new Map<number, Element>()
  const render = () => {
    const { start, end } = visibleRows(
      scroller.scrollTop,
      height,
      manyItems.length,
      row
    )
    for (const [index, el] of rendered) {
      if (index >= start && index < end) {
        continue
      }
      el.remove()
      rendered.delete(index)
    }
    for (let index = start; index < end; index++) {
      if (rendered.has(index)) {
        continue
      }
      const item = manyItems[index]
      rows.insertAdjacentHTML(
        "beforeend",
        `<ui-select-item value="${item.value}" label="${item.label}" index="${index}" style="top: ${index * row}px; height: ${row}px">${item.label}</ui-select-item>`
      )
      rendered.set(index, rows.lastElementChild!)
    }
  }
  render()
  select.items = manyItems
  scroller.addEventListener("scroll", render)
  select.addEventListener("highlight", (event) => {
    const { index } = event.detail
    if (index < 0) {
      return
    }
    scroller.scrollTop = scrollForRow(
      index,
      scroller.scrollTop,
      scroller.clientHeight,
      row
    )
    render()
  })
}

export { mount }
```

Open Item and press End to reach Item 10000, then Home to return to the beginning. Scroll through the list; only nearby rows render.

## Align Item with Trigger

Set `align-item-with-trigger` on `ui-select-content` to place the selected item over the trigger. It falls back to normal popup placement when opened by touch or when there isn't enough room.

```ts title="align-item.ts"
import "@ui-sdk/web/checkbox"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const priorities = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "none", label: "No priority" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <ui-checkbox default-checked>
            <ui-checkbox-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-checkbox-indicator>
          </ui-checkbox>
          Align item with trigger
        </label>
      </div>
      <ui-field>
        <ui-field-label>Priority</ui-field-label>
        <ui-select default-value="medium">
          <ui-select-trigger>
            <button>
              <ui-select-value></ui-select-value>
              ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-select-trigger>
          <ui-select-content align-item-with-trigger>
            ${priorities
              .map(
                (priority) => `
                  <ui-select-item value="${priority.value}">
                    ${priority.label}
                    <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
                  </ui-select-item>
                `
              )
              .join("")}
          </ui-select-content>
        </ui-select>
      </ui-field>
    </div>
  `
  const content = root.querySelector("ui-select-content")!
  root
    .querySelector("ui-checkbox")!
    .addEventListener("checkedchange", (event) => {
      content.toggleAttribute(
        "align-item-with-trigger",
        event.detail.value === true
      )
    })
}

export { mount }
```

Open Priority: Medium sits over the trigger. Close it, uncheck Align item with trigger, and open it again to compare placement.

## Scrollable

Limit the content's height and allow vertical scrolling. `--available-height` tells you how much room the popup has; the highlighted item scrolls into view as you move with the keyboard.

```ts title="scrollable.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const timezones = [
  {
    label: "North America",
    items: [
      { value: "est", label: "Eastern Standard Time" },
      { value: "cst", label: "Central Standard Time" },
      { value: "mst", label: "Mountain Standard Time" },
      { value: "pst", label: "Pacific Standard Time" },
      { value: "akst", label: "Alaska Standard Time" },
      { value: "hst", label: "Hawaii Standard Time" },
    ],
  },
  {
    label: "Europe & Africa",
    items: [
      { value: "gmt", label: "Greenwich Mean Time" },
      { value: "cet", label: "Central European Time" },
      { value: "eet", label: "Eastern European Time" },
      { value: "west", label: "Western European Summer Time" },
      { value: "cat", label: "Central Africa Time" },
      { value: "eat", label: "East Africa Time" },
    ],
  },
  {
    label: "Asia",
    items: [
      { value: "msk", label: "Moscow Time" },
      { value: "ist", label: "India Standard Time" },
      { value: "cst-china", label: "China Standard Time" },
      { value: "jst", label: "Japan Standard Time" },
      { value: "kst", label: "Korea Standard Time" },
      { value: "ist-indonesia", label: "Indonesia Central Standard Time" },
    ],
  },
  {
    label: "Australia & Pacific",
    items: [
      { value: "awst", label: "Australian Western Standard Time" },
      { value: "acst", label: "Australian Central Standard Time" },
      { value: "aest", label: "Australian Eastern Standard Time" },
      { value: "nzst", label: "New Zealand Standard Time" },
      { value: "fjt", label: "Fiji Time" },
    ],
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Time zone</ui-field-label>
      <ui-select placeholder="Select a time zone">
        <ui-select-trigger>
          <button>
            <ui-select-value></ui-select-value>
            ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-select-trigger>
        <ui-select-content>
          ${timezones
            .map(
              (group) => `
                <ui-select-group>
                  <ui-select-group-label>${group.label}</ui-select-group-label>
                  ${group.items
                    .map(
                      (item) => `
                        <ui-select-item value="${item.value}">
                          ${item.label}
                          <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
                        </ui-select-item>
                      `
                    )
                    .join("")}
                </ui-select-group>
              `
            )
            .join("")}
        </ui-select-content>
      </ui-select>
    </ui-field>
  `
}

export { mount }
```

Open Time zone and move down with the arrow keys. The list scrolls to keep the highlighted option visible.

## Invalid

Inside a [Field](./field.md), the field's label names the trigger, and its description and errors describe it. Set `name` on `ui-select` itself for submission. After invalid submission, the trigger gets `aria-invalid` and `data-invalid`.

```ts title="invalid.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"
import { log } from "./log"

const methods = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
  { value: "overnight", label: "Overnight" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form data-slot="stack">
      <ui-field name="shipping">
        <ui-field-label>Shipping method</ui-field-label>
        <ui-select required placeholder="Select a shipping method">
          <ui-select-trigger>
            <button>
              <ui-select-value></ui-select-value>
              ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-select-trigger>
          <ui-select-content>
            ${methods
              .map(
                (method) => `
                  <ui-select-item value="${method.value}">
                    ${method.label}
                    <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
                  </ui-select-item>
                `
              )
              .join("")}
          </ui-select-content>
        </ui-select>
        <ui-field-description>Express arrives in two business days.</ui-field-description>
        <ui-field-error match="valueMissing">Choose a shipping method.</ui-field-error>
      </ui-field>
      <button type="submit" data-variant="solid">Continue</button>
    </form>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    log(root, `Submitted shipping=${new FormData(form).get("shipping")}`)
  })
}

export { mount }
```

Press Continue without choosing a shipping method to show the error. Choose one and continue; the console logs the submitted value.

## Forms

Set `name` to include a select in form submission. `required` blocks submission until something is selected; resetting the form restores `default-value`. Multiple values submit as separate entries under the same name.

The example also uses `auto-complete="country"` for autofill and `form="select-newsletter"` to associate the Frequency select with a form it sits outside.

```ts title="form.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"
import { log } from "./log"

const countries = [
  { value: "au", label: "Australia" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "jp", label: "Japan" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
]

const topics = ["Design", "Engineering", "Marketing", "Research", "Sales"]

const frequencies = ["Daily", "Weekly", "Monthly"]

const item = (value: string, label: string) => `
  <ui-select-item value="${value}">
    ${label}
    <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
  </ui-select-item>
`

const trigger = `
  <ui-select-trigger>
    <button>
      <ui-select-value></ui-select-value>
      ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
    </button>
  </ui-select-trigger>
`

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <form id="select-newsletter" data-slot="stack">
        <ui-field>
          <ui-field-label>Country</ui-field-label>
          <ui-select name="country" auto-complete="country" required placeholder="Select a country">
            ${trigger}
            <ui-select-content>
              ${countries.map((country) => item(country.value, country.label)).join("")}
            </ui-select-content>
          </ui-select>
        </ui-field>
        <ui-field>
          <ui-field-label>Topics</ui-field-label>
          <ui-select name="topics" multiple default-value="Design">
            ${trigger}
            <ui-select-content>
              ${topics.map((topic) => item(topic, topic)).join("")}
            </ui-select-content>
          </ui-select>
        </ui-field>
      </form>
      <ui-field>
        <ui-field-label>Frequency</ui-field-label>
        <ui-select name="frequency" form="select-newsletter" default-value="Weekly">
          ${trigger}
          <ui-select-content>
            ${frequencies.map((frequency) => item(frequency, frequency)).join("")}
          </ui-select-content>
        </ui-select>
      </ui-field>
      <div data-slot="row">
        <button type="submit" form="select-newsletter" data-variant="solid">Save</button>
        <button type="reset" form="select-newsletter">Reset</button>
      </div>
    </div>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const entries = [...new FormData(form)].map(
      ([name, value]) => `${name}=${value}`
    )
    log(root, `Submitted ${entries.join("&")}`)
  })
}

export { mount }
```

Choose a country and some topics, change Frequency, then press Save; the console logs all three fields. Reset restores the initial choices.

## Presentation

Use `presentation="sheet"` to open the options in a bottom sheet, or `"auto"` to use a sheet on small touch screens. Choosing an item still selects it and closes the single-select list.

The content gets `data-presentation`. Use it to give sheet items more space. Keep the sheet's `translate` property free for its drag behavior, and include safe-area padding at the bottom.

```ts title="presentation.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const statuses = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in-progress", label: "In Progress" },
  { value: "in-review", label: "In Review" },
  { value: "done", label: "Done" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Status</ui-field-label>
      <ui-select default-value="todo" presentation="sheet">
        <ui-select-trigger>
          <button>
            <ui-select-value></ui-select-value>
            ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-select-trigger>
        <ui-select-content>
          ${statuses
            .map(
              (status) => `
                <ui-select-item value="${status.value}">
                  ${status.label}
                  <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
                </ui-select-item>
              `
            )
            .join("")}
        </ui-select-content>
      </ui-select>
    </ui-field>
  `
}

export { mount }
```

Open Status to show the bottom sheet. Choose an option to close it, or drag down to dismiss it without changing the value.

A sheet makes the page behind it inert and locks scrolling unless `modal="false"`. [Popups](../popups.md#modals-and-sheets) explains the shared presentation options.

## Controlled

Read or set the element's `value` and `open` properties. A single value is `T | null`; with `multiple`, it is `T[]`. Listen for `valuechange` and `openchange` on the select itself. The requested value is in `event.detail.value`; call `event.preventDefault()` to refuse the change.

[State and Events](../state-and-events.md) explains this pattern. The [reason tables](#reasons) list Select's reasons, including `item-press`, `list-navigation`, and `clear-press`.

## Controller

The element's `api` property can open, read, or change the select. A trigger outside it connects with `for="select-id"`. See [Controllers](../controllers.md) for setup and waiting for a popup to close, and the [Select controller reference](#controller-1) for its methods.

## Positioning

Use `side`, `align`, and offsets to place the popup. `ui-select-arrow` follows the side it lands on. [Popups](../popups.md#place-the-content) covers anchoring and collisions.

## Modal

By default, pressing outside closes the list without activating the element behind it. `modal="true"` also locks scrolling and makes the page inert. `modal="false"` allows outside presses through. See [Control Dismissal](../popups.md#control-dismissal).

## Container

The popup uses the top layer without a portal. Use `container` when it must render in another DOM container. [Hidden Content and Containers](../popups.md#hidden-content-and-containers) covers the shared setup.

## Animation

Select keeps closing content mounted until its exit animation finishes. `openchangecomplete` runs afterward. Use `keep-mounted` when your animation library needs the closed content to remain in the DOM. [Styling and Animation](../styling-and-animation.md) covers the lifecycle attributes.

## Custom Rendering

The trigger and clear parts wrap your own `<button>`; the input part wraps your own `<input>`. Other parts can use `as-child` to bind your element. [Parts and Composition](../parts-and-composition.md#choose-the-element) explains the markup. Select's part states show as the attributes under [Data Attributes](#data-attributes).

## Styling

Use `data-highlighted` for the active item, `data-selected` for chosen items, and `data-placeholder` on the trigger and value while nothing is selected. `data-modality="keyboard"` on the content tells a keyboard highlight from a pointer one.

`--anchor-width` matches the trigger's width, and `--available-height` says how much room the popup has. Use them to size the content.

Each part has a `data-slot`, such as `select-trigger`, and its state attributes are listed under [Data Attributes](#data-attributes).

### `<ui-select-content>`
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

### `<ui-select-viewport>`
- `--keyboard-inset`: While it presents as a sheet: how many pixels of the page the on-screen keyboard covers, 0 without one.
- `--visual-viewport-width`: While it presents as a sheet: the width of the part of the page you can see.
- `--visual-viewport-height`: While it presents as a sheet: the height of the part of the page you can see, above the keyboard.
- `--visual-viewport-top`: While it presents as a sheet: how far the part of the page you can see is scrolled from the top of the layout, as when the keyboard pushes it up.

## Data Attributes

`<ui-select-list>`, `<ui-select-input>`, `<ui-select-group>`, `<ui-select-group-label>`, `<ui-select-separator>` and `<ui-select-value-icon>` have no state attributes.

### `<ui-select-label>`
`[data-slot="select-label"]`

- `data-disabled`: Present when the select is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the select is read-only.
- `data-required`: Present when the select is required.

### `<ui-select-trigger>`
`[data-slot="select-trigger"]`

- `data-closed`: Present while the list is closed, including while it animates out.
- `data-disabled`: Present when the select or the trigger is disabled.
- `data-open`: Present while the list is open.
- `data-placeholder`: Present while nothing is selected, so the placeholder shows.
- `data-readonly`: Present when the select is read-only.
- `data-required`: Present when the select is required.

### `<ui-select-value>`
`[data-slot="select-value"]`

- `data-placeholder`: Present while nothing is selected, so the placeholder shows.

### `<ui-select-clear>`
`[data-slot="select-clear"]`

- `data-disabled`: Present when the select is disabled or read-only.

### `<ui-select-content>`
`[data-slot="select-content"]`

- `data-closed`: Present while the list is closed, including while it animates out.
- `data-presentation` (`popover`, `sheet`): How the list presents this time it's open.
- `data-open`: Present while the list is open.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the list animates out. Style the state you animate to.
- `data-modality` (`keyboard`, `pointer`): Whether the keyboard or a pointer is in use, for focus styles.
- `data-has-icons`: Present while any item inside holds an icon part, so items without one can line up.

### `<ui-select-item>`
`[data-slot="select-item"]`

- `data-selected`: Present on selected items, and on the check inside them.
- `data-disabled`: Present when the item can't be chosen.
- `data-highlighted`: Present on the item with keyboard focus or under the pointer, or highlighted while focus stays in the search field.
- `data-has-icon`: Present on an item while it holds an icon part.

### `<ui-select-item-text>`
`[data-slot="select-item-text"]`

- `data-matched`: Present on an item's text while the search matched part of it, which is marked.

### `<ui-select-item-indicator>`
`[data-slot="select-item-indicator"]`

- `data-selected`: Present on selected items, and on the check inside them.

### `<ui-select-select-all>`
`[data-slot="select-select-all"]`

- `data-disabled`: Present when nothing the select-all option covers can be chosen.
- `data-unchecked`: Present on a select-all option while none of its items is selected.
- `data-highlighted`: Present on the item with keyboard focus or under the pointer, or highlighted while focus stays in the search field.

### `<ui-select-empty>`
`[data-slot="select-empty"]`

- `data-loading`: Present while results load, with `status="loading"`.
- `data-empty`: Present while no item matches the search.

### `<ui-select-status>`
`[data-slot="select-status"]`

- `data-loading`: Present while results load, with `status="loading"`.

### `<ui-select-arrow>`
`[data-slot="select-arrow"]`

- `data-closed`: Present while the list is closed, including while it animates out.
- `data-open`: Present while the list is open.

### `<ui-select-item-icon>`
`[data-slot="select-item-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

## API Reference

Props are attributes in kebab case, like `default-value` and `align-item-with-trigger`: `"false"` is false, and numbers are numbers. `items`, `itemToValue`, `itemToLabel` and `isItemEqualToValue` are properties. `container` and `anchor` take CSS selectors. Callbacks are DOM events.

### Select

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `open?` (`boolean`): Whether the list is open. Pass it to control it.
- `defaultOpen?` (`boolean`): Whether the list starts open, when uncontrolled.
- `openchange event`: Runs when the list wants to open or close. `details.reason` says why, and `details.cancel()` stops it.
- `openchangecomplete event`: Runs once the list has finished opening or closing, after any animation.
- `items?` (`ListData<T>`): The items as data. Renders the list for you, and lets the trigger show labels and find items by typing before the list has ever opened.
- `emptyItems?` (`ListData<T>`): Items shown instead of `items` while the search field is empty, like recent choices. Groups work, like `{ type: "group", label: "Recent", items }`. Needs `items` and a `SelectInput`.
- `query?` (`string`): The text in the search field, which filters the list. Pass it to control it. Closing the list empties it.
- `defaultQuery?` (`string`): The search field's text at first, when uncontrolled.
- `querychange event`: Runs when the search field's text wants to change: typing, or closing the list, which empties it.
- `filter?` (`ListFilter<T>`): How a `SelectInput` narrows the list: `"contains"`, `"startsWith"`, a function of the item and the text, whose numeric result also sorts data items, or `false` to keep every item, for results a server already filtered.
- `status?` (`AsyncOptionsStatus`): Whether results are loading or failed, for the status and empty parts. Sets `aria-busy` on the list while loading.
- `loadmore event`: Runs when the highlight or scrolling reaches the last item, so the next page can load, like `createAsyncOptions`'s `loadMore`. Not again for the same items, unless the last load failed.
- `announcement?` (`((change: ListAnnouncement) => string | null | undefined)`): What screen readers hear after typing pauses in the search field, when no `SelectStatus` is rendered. Return null for nothing.
- `placeholder?` (`string`): What the value shows while nothing is selected.
- `itemToValue?` (`((value: T) => string)`): The string an item's value submits as and is identified by, for object values. Strings pass through, and objects use their `value` or `id`.
- `itemToLabel?` (`((value: T) => string)`): The text a value shows in the trigger, for values whose item isn't rendered, like async results.
- `isItemEqualToValue?` (`((itemValue: T, value: T) => boolean)`): Whether an item's value is the selected value, for object values that aren't the same object.
- `highlight event`: Runs when the highlight moves, with the item's index among the visible items, so a virtualized list can scroll to it.
- `loop?` (`boolean`): Whether arrow keys wrap from the last item to the first.
- `modal?` (`"pointer" | boolean`): `"pointer"`: an outside press only closes the list. `true`: also locks scroll and makes the rest of the page inert. `false`: outside presses reach what they hit.
- `presentation?` (`PresentationSetting<"popover">`): How the list presents. `"sheet"` slides it up from the bottom of the screen, where it can be swiped away, and `"auto"` does that on small touch screens. Decided each time it opens; the server renders `"popover"` for `"auto"`.
- `disabled?` (`boolean`): Disables the select like a native one: it can't be focused or changed, and the value isn't submitted.
- `readOnly?` (`boolean`): Keeps the select focusable and its value submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission until a value is selected, with the browser's own message.
- `name?` (`string`): The name the value submits under. Without one, the select submits nothing.
- `form?` (`string`): The id of a form to belong to, when the select isn't inside that form.
- `autoComplete?` (`string`): A hint for the browser's autofill, like `"country"`.
- `controller?` (`object`): Opens, closes, reads and sets the select from anywhere. Create one with `createSelectController()`.
- `dismissible?` (`boolean`): Whether Escape, an outside press, focus or the window leaving, Android's back gesture and a sheet's swipe can close it. Triggers, Close parts and the controller always can. Pass `false` while it holds unsaved work, and ask in `dismissattempt`.
- `dismissattempt event`: Runs when `dismissible` refused a dismissal made on purpose: Escape, an outside press, back or a swipe. Focus or the window leaving is refused without it. Ask "Discard changes?" here.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.
- `multiple?` (`boolean`): Whether several items can be selected. The value is then a list, and the list stays open as items toggle. Whether several items can be selected.
- `value?` (`T | T[] | null`): The selected value. Pass it to control the select. `null` selects nothing. The selected values. Pass it to control the select. The selected value, or values with `multiple`. Pass it to control the select.
- `defaultValue?` (`T | T[] | null`): The value selected at first, when uncontrolled. A form reset returns to it. The values selected at first, when uncontrolled. A form reset returns to them. The value or values selected at first, when uncontrolled. A form reset returns to it.
- `valuechange event`: Runs when a user, a form reset or a controller wants to change the value. `details.reason` says why, and `details.cancel()` stops it.

### SelectTrigger

A trigger outside the select names it with `for="select-id"`.

- `disabled?` (`boolean`): Stops the trigger from opening the list. A native button can't be focused or pressed.
- `controller?` (`object`): Connects a trigger outside the select to the select with this controller.

### SelectValue

- `placeholder?` (`string`): What shows while nothing is selected. Overrides the select's `placeholder`.
- `maxLabels?` (`number`): With `multiple`, how many labels show before the rest are counted, as in "Apple, Banana and 2 more", joined the way the page's language joins lists.
- `getMoreLabel?` (`((count: number) => string)`): The words for the labels past `maxLabels`.

### SelectContent

- `side?` (`Side`): Which side of the anchor the popup opens on. Flips to the other side when there isn't room. Which side of the trigger the list opens on.
- `align?` (`Align`): How the popup lines up with the anchor along that side. `start` and `end` follow the reading direction. How the list lines up with the trigger along that side.
- `sideOffset?` (`number`): Gap between the anchor and the popup, in pixels. Gap between the trigger and the list, in pixels.
- `alignOffset?` (`number`): Shift along the anchor, in pixels. Shift along the trigger, in pixels.
- `collisionPadding?` (`number`): Space to keep from the viewport edges, in pixels.
- `arrowPadding?` (`number`): Space to keep between the arrow and the popup's corners, in pixels.
- `anchor?` (`string | Anchor | null`): Positions the popup against this instead of its trigger: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. It's read on every check, so it can move. A controller's `open({ anchor })` wins for that open.
- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `alignItemWithTrigger?` (`boolean`): Whether the list overlaps the trigger so the selected item sits on it, like a native select on macOS. Falls back to opening below when there isn't room, and for touch.
- `keepMounted?` (`boolean`): Whether the list stays in the page, hidden, while closed. For animation libraries that drive the exit from state.

### SelectItem

- `label?` (`string`): The text the trigger shows and typing finds, when the content isn't plain text. Not the accessible name: use `aria-label` for that.
- `disabled?` (`boolean`): Keeps the item from being chosen. The keyboard and the pointer skip it. Sets `data-disabled` and `aria-disabled`.
- `index?` (`number`): The item's position among all items, for virtualized lists that render only some. Sets `aria-posinset` and `aria-setsize`.
- `value` (`T`): What the value becomes when the item is chosen. A string, or any value with `itemToValue`.

### SelectItemIndicator

- `keepMounted?` (`boolean`): Whether the indicator stays in the page while its item isn't selected, so it can be styled or animated in both states.

### SelectItemIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

`ui-select-value-icon` takes no props of its own, and no children.

### SelectClear

- `keepMounted?` (`boolean`): Whether the clear button stays in the page while nothing is selected.

### SelectInput, SelectEmpty, SelectStatus, SelectItemText and SelectSelectAll

They take no props of their own. A `ui-select-input` turns searching on, `ui-select-item-text` marks what the search matched in its item's text, and `ui-select-select-all` covers its group's items, or every item outside a group. Without a `ui-select-status`, result counts go to screen readers through the page's shared live region once typing pauses. `announcement` receives `{ type: "results", count, query, loading }` and returns the words, or `null` for silence. The default is English: "3 results", "No results" or "Loading".

### Items as Data

Each item in `items`. Groups are `{ type: "group", label, items }` and separators `{ type: "separator" }`.

- `value` (`T`): Identifies the item, and is what choosing it reports. A string, or any value with `itemToValue`.
- `label` (`string`): The text shown and matched by typeahead and filtering. A select's trigger shows it once chosen.
- `keywords?` (`string[]`): More words filtering matches, like `["team"]` for a plan called Pro.
- `disabled?` (`boolean`): Keeps the item from being chosen. The keyboard skips it, like in a native select.

The whole array is a `ListData`, or `ListData<Plan>` when values are objects.

### State

The same state shows as data attributes on each element.

`ui-select-trigger`:

- `open` (`boolean`): Whether the list is open.
- `disabled` (`boolean`): Whether the select is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the select keeps its value but refuses changes, from its `readOnly` option. Sets `aria-readonly`.
- `required` (`boolean`): Whether a value must be selected before the form submits, from its `required` option. Sets `aria-required`.
- `placeholder` (`boolean`): Whether nothing is selected, so the placeholder shows.

`ui-select-value`:

- `value` (`unknown`): The selected value: one, `null`, or a list with `multiple`.
- `label` (`string`): The selected item's label, the labels joined with commas for several, or with `maxLabels`, as a list in the page's language, like "Apple, Banana and 2 more". An empty string for none.
- `labels` (`string[]`): Each selected item's label, in the order they were selected.
- `placeholder` (`boolean`): Whether nothing is selected, so the placeholder shows.

`ui-select-content` and `ui-select-list`:

- `open` (`boolean`): Whether the list is open. False while it animates out.
- `presentation` (`"popover" | "sheet"`): How it presents this time it's open.
- `multiple` (`boolean | undefined`): Whether several items can be selected.
- `items` (`ListData<unknown>`): The data items that match the search, for rendering a virtualized list yourself.
- `status` (`AsyncOptionsStatus`): Whether results are loading or failed.

`ui-select-item`:

- `highlighted` (`boolean`): Whether the item has keyboard focus or is under the pointer.
- `selected` (`boolean`): Whether its value is in the select's value, compared with `isItemEqualToValue` when you pass one.
- `disabled` (`boolean`): Whether the item's own `disabled` prop is set. It can't be highlighted or chosen.

`ui-select-item-indicator`:

- `selected` (`boolean`): Whether its item is selected. While false, the indicator isn't shown unless `keepMounted` is set.

`ui-select-item-icon`:

- `mirror` (`boolean`): Whether it flips in right-to-left text.

`ui-select-clear`:

- `disabled` (`boolean`): Whether the select is disabled or read-only, so there's nothing it can clear.

`ui-select-arrow`:

- `open` (`boolean`): Whether the list is open.

`ui-select-input`:

- `open` (`boolean`): Whether the list is open.
- `disabled` (`boolean`): Whether the select is disabled, by itself or by a `<fieldset>`. A read-only select's search field stays enabled.

`ui-select-item-text`:

- `segments` (`MatchSegment[]`): The text in pieces, each marked when it matched. Joined, they're the whole text.
- `matched` (`boolean`): Whether any piece matched.

`ui-select-select-all`:

- `checked` (`boolean`): Whether every item it covers is selected.
- `indeterminate` (`boolean`): Whether some of its items are selected, but not all.
- `highlighted` (`boolean`): Whether it's highlighted, by the keyboard or the pointer.
- `disabled` (`boolean`): Whether it can't be used: nothing it covers can be chosen, or choosing them all would pass `maxSelected`.

`ui-select-empty`:

- `loading` (`boolean`): Whether results are loading.
- `empty` (`boolean`): Whether no item matches.
- `query` (`string`): The text the list is filtered by.

`ui-select-status`:

- `status` (`"idle" | "loading" | "error"`): Whether results are loading or failed.
- `loading` (`boolean`): Whether results are loading.
- `count` (`number`): How many items are visible.

### Reasons

`event.detail.reason` says why the value changed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `clear-press` (`MouseEvent | KeyboardEvent`): A Clear part was pressed, like on an input, a select or a combobox.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

And why the list opened or closed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `focus-out` (`KeyboardEvent | FocusEvent`): Focus left the layer, or Tab moved it out.
- `window-blur` (`FocusEvent`): The window lost focus.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.

With `dismissible` false, the refused dismissals `dismissattempt` reports:

- `outside-press` (`MouseEvent`): A press outside the layer.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.

And why the search text changed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `focus-out` (`KeyboardEvent | FocusEvent`): Focus left the layer, or Tab moved it out.
- `window-blur` (`FocusEvent`): The window lost focus.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.
- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.

### Controller

The element's `api` property has the same methods.

Every write method takes an optional `{ reason, event }`, which the change event carries.

- `isOpen()` (`() => boolean`): Whether the list is open.
- `setOpen(open, options?)` (`(open: boolean, options?: SelectChangeOptions<SelectOpenChangeReason> | undefined) => boolean`): Opens or closes the list. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (SelectChangeOptions<SelectOpenChangeReason> & { signal?: AbortSignal | undefined; }) | undefined) => Promise<...>`): Opens the list, and resolves once it closes, with why and how. Resolves exactly once and never rejects: on the next close from any source, when `signal` aborts, or with reason `"unmount"` when the select leaves the page.
- `close(options?)` (`(options?: SelectChangeOptions<SelectOpenChangeReason> | undefined) => boolean`): Closes the list. Returns false when the close was canceled or it was already closed.
- `toggle(options?)` (`(options?: SelectChangeOptions<SelectOpenChangeReason> | undefined) => boolean`): Opens the list when it's closed, and closes it when it's open. Returns false when the change was canceled.
- `getValue()` (`() => SelectValue<T, Multiple>`): The selected value.
- `setValue(value, options?)` (`(value: SelectValue<T, Multiple>, options?: SelectChangeOptions<SelectValueChangeReason> | undefined) => boolean`): Selects a value, as a user would. A disabled or read-only select ignores it. Returns false when the change was canceled, ignored or the value was already selected.
- `clear(options?)` (`(options?: SelectChangeOptions<SelectValueChangeReason> | undefined) => boolean`): Selects nothing: `null`, or an empty list with `multiple`. Returns false when nothing changed.
- `getQuery()` (`() => string`): The text in the search field.
- `setQuery(query, options?)` (`(query: string, options?: SelectChangeOptions<SelectQueryChangeReason> | undefined) => boolean`): Changes the text in the search field, which filters the list. Returns false when nothing changed.
- `focus()` (`() => void`): Moves focus to the trigger.

### Events

Events fire on their own element and don't bubble, with the new state in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` on a change event cancels it.

| Member                     | On                  | Description                                                   |
| -------------------------- | ------------------- | ------------------------------------------------------------- |
| `value` property           | `ui-select`         | The selected value. Setting it selects, as a controller would |
| `open` property, attribute | `ui-select`         | Whether the list is open. The attribute sets where it starts  |
| `api` property             | `ui-select`         | The [controller](#controller-1)                               |
| `valuechange` event        | `ui-select`         | `detail: { value, reason, event, source }`                    |
| `openchange` event         | `ui-select`         | `detail: { value: open, reason, event, source }`              |
| `openchangecomplete` event | `ui-select`         | `detail: { value: open }`, after the animation                |
| `highlight` event          | `ui-select`         | `detail: { value, index, event }`                             |
| `query` property           | `ui-select`         | The search text                                               |
| `querychange` event        | `ui-select`         | `detail: { value: query, reason, event, source }`             |
| `loadmore` event           | `ui-select`         | When the last item is reached                                 |
| `dismissattempt` event     | `ui-select`         | `detail: { reason, event }`, when a dismissal was refused     |
| `for` attribute            | `ui-select-trigger` | The `id` of a select the trigger opens from outside it        |

## Accessibility

The select follows the [WAI-ARIA select-only combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/). The trigger has the `combobox` role and the popup is a `listbox`. If you don't need a visible label, give its button an `aria-label` instead.

### Keyboard

Arrow keys move through the open list; Home and End reach its first and last items. Set `loop="false"` to stop arrow keys at either end. The popup follows the trigger's inherited text direction; use logical CSS properties for spacing in right-to-left layouts.

### Tested Behavior

Every line below is an automated test.

- With alignItemWithTrigger, the selected item sits over the trigger.
- A controller opens the list.

**Trigger**

- Is a combobox named by its label that shows the placeholder.
- Click opens the list.
- Enter opens the list and focuses the first item.
- Space opens the list and focuses the first item.
- ArrowDown opens the list and focuses the first item.
- Points to the list it controls while open.
- A click on the open trigger closes the list.
- A click on a trigger in a shadow root opens the list, and it stays open. Vue and web components only.

**Keyboard in the list**

- Arrow keys move focus through the items.
- Home and End move to the first and last items.
- Arrow keys skip disabled items.
- Typing focuses the next item that starts with the text.
- Enter chooses the focused item, closes and returns focus to the trigger.
- Space chooses the focused item.
- Escape closes without choosing and returns focus to the trigger.
- The chosen item is selected when the list opens again, and takes focus.

**Typing on the closed trigger**

- Selects the next item that starts with the text, like a native select.
- Skips disabled items.

**Pointer**

- Clicking an item chooses it and closes the list.
- Clicking a disabled item does nothing.
- Moving over a disabled item leaves the highlight where it was.
- Clicking outside closes without choosing.
- Pressing, dragging to an item and releasing chooses it.
- Enter opens the list after a drag chose an item.
- Enter opens the list after pressing the open trigger and releasing elsewhere.

**Value**

- A disabled value stays in the trigger, and the list opens on the first enabled item.
- A default value shows its label and is selected.
- Opening with a selected item focuses it.
- Canceling the change keeps the value.

**Multiple**

- The list allows several selections.
- Choosing toggles items and keeps the list open.

**Groups**

- Items sit in groups named by their labels.
- Arrow keys move across groups.

**Forms**

- The form submits the value under the select's name.
- A required select blocks submission until a value is chosen.
- A disabled select can't be opened.
- A read-only select doesn't change its value.
- A disabled fieldset disables the select and leaves it out of the form.

**Positioning**

- The list opens below the trigger, at least as wide.

Runs in React, Vue and web components.

Also tested:

**Enhancements**

- A data select whose content part is wrapped in a component renders one list.
- The list is named by the select's label.
- A clear button selects nothing and keeps focus on the select.
- Alt+ArrowUp chooses the focused item and closes, as the APG asks.
- The content says whether the keyboard or a pointer is in use, for styling the highlight.
- A form reset returns the select to its default value.
- Typing on the closed trigger selects items before the list has ever been in the page.

Runs in React, Vue and web components.

Searching, with a search field in the list:

**Searchable select**

- Opening focuses the search field and highlights the selected item.
- The search field is a combobox that controls the listbox in the list.
- Typing filters the list and highlights the first match.
- Typing never jumps by first letter: the characters go into the field.
- Arrow keys move the highlight while focus stays in the field.
- Home and End are the field's, so the highlight stays.
- Enter chooses the highlighted item, closes, and focus returns to the trigger.
- A click on an item chooses it.
- Escape closes the list and focus returns to the trigger.
- The search empties once the list closes.
- An empty message shows when nothing matches.
- Matches ignore case and accents.
- Labels mark what the search matched.
- With multiple, choosing keeps the list open and focus in the field.
- Tab closes the list and moves on from the trigger.
- No axe violations while searching.
- Typing on the closed trigger still selects by first letter.

**Items shown while the search is empty**

- Recent items show until the user types, then the results.
- A recent item is chosen like any other, and its label shows in the trigger.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while choosing with a keyboard.

Runs in React, Vue and web components.
