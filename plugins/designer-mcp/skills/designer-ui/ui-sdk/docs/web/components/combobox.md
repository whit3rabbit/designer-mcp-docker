# Combobox

Search a list of options and choose one or several values.

Use a Combobox when people need to find a choice by typing. Start with an input and a list, then add chips, server results, or the option to create something new as you need them.

```ts title="demo.ts"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox>
      <div data-slot="stack">
        <ui-combobox-label>Framework</ui-combobox-label>
        <div data-slot="row">
          <ui-combobox-input>
            <input placeholder="Select a framework" />
          </ui-combobox-input>
          <ui-combobox-trigger>
            <button aria-label="Show frameworks">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No frameworks found.</ui-combobox-empty>
        <ui-combobox-list>
          ${frameworks
            .map(
              (framework) => `
                <ui-combobox-item value="${framework.value}" label="${framework.label}">
                  ${framework.label}
                  <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                </ui-combobox-item>
              `
            )
            .join("")}
        </ui-combobox-list>
      </ui-combobox-content>
    </ui-combobox>
  `
}

export { mount }
```

Type “sv” to find SvelteKit. Press Down Arrow to highlight it, then Enter to choose it.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the element definitions once in your application:

```ts
import "@ui-sdk/web/combobox"
```

## Composition

Use the following composition to build a `ui-combobox`:

```text
ui-combobox
├── ui-combobox-label
├── ui-combobox-input
│   └── input
└── ui-combobox-content
    └── ui-combobox-list
        ├── ui-combobox-item
        └── ui-combobox-item
```

Name the input, give each option a unique value, and put the options in a list inside the popup. `ui-combobox-input` wraps a native input. The label names the input; choosing an option puts its label in the input.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/combobox"
</script>

<ui-combobox>
  <ui-combobox-label>Fruit</ui-combobox-label>
  <ui-combobox-input><input placeholder="Search fruits…" /></ui-combobox-input>
  <ui-combobox-content hidden>
    <ui-combobox-list>
      <ui-combobox-item value="apple">Apple</ui-combobox-item>
      <ui-combobox-item value="banana">Banana</ui-combobox-item>
    </ui-combobox-list>
  </ui-combobox-content>
</ui-combobox>
```

## Autocomplete vs Combobox

Both filter a list as you type. They differ in what the value is.

- **Combobox**: the value is an option from the list, or several with `multiple`. The text is only a query; closing without choosing restores the selected label, and a form submits the value, not the text. Use it for a country, an assignee or a set of labels.
- **[Autocomplete](./autocomplete.md)**: the value is the text. Suggestions help fill it in, and anything typed is valid. Use it for a search box, an address or a free-form field.

`allow-custom-value` lets a combobox accept text that matches no option, like a datalist. Reach for it when choosing from the list is the main path; use an autocomplete when free text is.

## Build Your Own

`@ui-sdk/web/combobox` comes with ready-made `ui-combobox` elements. If you'd like to build your own, with your own element names, start from the `combobox` primitive in `@ui-sdk/core`:

```ts title="country-picker-elements.ts"
import { combobox } from "@ui-sdk/core/combobox"
import { createParts, wrappedChild } from "@ui-sdk/web"

createParts(combobox, {
  root: "country-picker",
  label: "country-label",
  input: {
    tag: "country-input",
    target: wrappedChild("input"),
    display: "contents",
  },
  content: "country-popup",
  list: "country-list",
  item: "country-option",
  empty: "country-empty",
})
```

```html
<country-picker>
  <country-label>Country</country-label>
  <country-input><input /></country-input>
  <country-popup hidden>
    <country-empty>No countries found.</country-empty>
    <country-list>
      <country-option value="fr" label="France">France</country-option>
      <country-option value="jp" label="Japan">Japan</country-option>
    </country-list>
  </country-popup>
</country-picker>
```

Each element keeps the behavior, state and data attributes of its ready-made counterpart: typing filters the options, arrow keys move the highlight and the popup opens in the top layer. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Disabled

A disabled combobox cannot be focused or changed and submits nothing. A read-only one remains focusable and submits its value, but does not open or accept changes. Keyboard navigation skips a disabled option, and it cannot be chosen.

```ts title="disabled.ts"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

const variants = [
  { label: "Billing country", attributes: 'default-value="fr" disabled' },
  { label: "Shipping from", attributes: 'default-value="fr" read-only' },
  { label: "Shipping to", attributes: "" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      ${variants
        .map(
          (variant) => `
            <ui-combobox ${variant.attributes}>
              <div data-slot="stack">
                <ui-combobox-label>${variant.label}</ui-combobox-label>
                <div data-slot="row">
                  <ui-combobox-input>
                    <input placeholder="Search countries…" />
                  </ui-combobox-input>
                  <ui-combobox-trigger>
                    <button aria-label="Show countries">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
                  </ui-combobox-trigger>
                </div>
              </div>
              <ui-combobox-content hidden>
                <ui-combobox-empty>No countries found.</ui-combobox-empty>
                <ui-combobox-list>
                  ${countries
                    .map(
                      (country) => `
                        <ui-combobox-item value="${country.value}" label="${country.label}" ${country.value === "dk" ? "disabled" : ""}>
                          ${country.label}
                          <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                        </ui-combobox-item>
                      `
                    )
                    .join("")}
                </ui-combobox-list>
              </ui-combobox-content>
            </ui-combobox>
          `
        )
        .join("")}
    </div>
  `
  for (const combobox of root.querySelectorAll<
    HTMLElement & { itemToLabel: (value: string) => string }
  >("ui-combobox")) {
    combobox.itemToLabel = countryLabel
  }
}

export { mount }
```

Billing country is disabled and Shipping from is read-only. Open Shipping to: arrow keys skip Denmark, which can't be chosen.

## Clear and Trigger

`ui-combobox-clear` clears both the selection and the query, then keeps focus in the input. It appears while either has a value. When someone deletes all the text, a single selection clears right away instead of when the list closes. Escape brings the selection back while the list is still open; closing it any other way leaves it cleared.

```ts title="clear.ts"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement, X } from "lucide"
import { log } from "./log"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

const frameworkLabel = (value: string) =>
  frameworks.find((framework) => framework.value === value)?.label ?? value

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox default-value="sveltekit">
      <div data-slot="stack">
        <ui-combobox-label>Framework</ui-combobox-label>
        <div data-slot="row">
          <ui-combobox-input>
            <input placeholder="Select a framework" />
          </ui-combobox-input>
          <ui-combobox-clear>
            <button aria-label="Clear framework">${createElement(X, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-clear>
          <ui-combobox-trigger>
            <button aria-label="Show frameworks">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No frameworks found.</ui-combobox-empty>
        <ui-combobox-list>
          ${frameworks
            .map(
              (framework) => `
                <ui-combobox-item value="${framework.value}" label="${framework.label}">
                  ${framework.label}
                  <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                </ui-combobox-item>
              `
            )
            .join("")}
        </ui-combobox-list>
      </ui-combobox-content>
    </ui-combobox>
  `
  const combobox = root.querySelector("ui-combobox")!
  combobox.itemToLabel = (value) => frameworkLabel(value as string)
  combobox.addEventListener("valuechange", (event) => {
    const { value, reason } = event.detail
    log(
      root,
      `${value ? frameworkLabel(value as string) : "Cleared"} (${reason})`
    )
  })
}

export { mount }
```

Choose a framework, then press the clear button. The selection and text clear, focus stays in the input, and the console logs each change.

## Auto Highlight

Add `auto-highlight` to highlight the first match while typing, so Enter can choose it immediately. With `auto-highlight="always"`, opening the list also highlights the selected item, or the first, so the arrow keys move from there. A highlight it placed follows the list as items arrive, and one the user moved stays while its item is there.

```ts title="auto-highlight.ts"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox auto-highlight>
      <div data-slot="stack">
        <ui-combobox-label>Country</ui-combobox-label>
        <div data-slot="row">
          <ui-combobox-input>
            <input placeholder="Type “sw” and press Enter" />
          </ui-combobox-input>
          <ui-combobox-trigger>
            <button aria-label="Show countries">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No countries found.</ui-combobox-empty>
        <ui-combobox-list>
          ${countries
            .map(
              (country) => `
                <ui-combobox-item value="${country.value}" label="${country.label}">
                  ${country.label}
                  <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                </ui-combobox-item>
              `
            )
            .join("")}
        </ui-combobox-list>
      </ui-combobox-content>
    </ui-combobox>
  `
}

export { mount }
```

Type “sw” and press Enter. The first matching country is already highlighted.

## Highlight Matches

`ui-combobox-item-text` marks the matching text. Matching ignores case and accents using the current locale, while the label keeps its original spelling. Each match is a `<mark>` you can style.

```ts title="highlight.ts"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"

const countries = [
  { value: "ar", label: "Argentina", keywords: ["república argentina"] },
  { value: "au", label: "Australia", keywords: ["oz"] },
  { value: "at", label: "Austria", keywords: ["österreich"] },
  { value: "be", label: "Belgium", keywords: ["belgië", "belgique"] },
  { value: "br", label: "Brazil", keywords: ["brasil"] },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark", keywords: ["danmark"] },
  { value: "fi", label: "Finland", keywords: ["suomi"] },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", keywords: ["deutschland"] },
  { value: "gr", label: "Greece", keywords: ["hellas", "ελλάδα"] },
  { value: "jp", label: "Japan", keywords: ["nippon", "日本"] },
  { value: "nl", label: "Netherlands", keywords: ["holland", "nederland"] },
  { value: "es", label: "Spain", keywords: ["españa"] },
  { value: "se", label: "Sweden", keywords: ["sverige"] },
  {
    value: "ch",
    label: "Switzerland",
    keywords: ["schweiz", "suisse", "svizzera"],
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox>
      <div data-slot="stack">
        <ui-combobox-label>Country</ui-combobox-label>
        <div data-slot="row">
          <ui-combobox-input>
            <input placeholder="Search countries…" />
          </ui-combobox-input>
          <ui-combobox-trigger>
            <button aria-label="Show countries">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No countries found.</ui-combobox-empty>
        <ui-combobox-list>
          ${countries
            .map(
              (country) => `
                <ui-combobox-item value="${country.value}" label="${country.label}" ${country.keywords ? `keywords="${country.keywords.join(",")}"` : ""}>
                  <ui-combobox-item-text>${country.label}</ui-combobox-item-text>
                  <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                </ui-combobox-item>
              `
            )
            .join("")}
        </ui-combobox-list>
      </ui-combobox-content>
    </ui-combobox>
  `
}

export { mount }
```

Type “an”. Matching letters are marked while each country keeps its original spelling.

## Filter and Keywords

`filter` accepts `"contains"` (the default), `"startsWith"`, a function of the item and query, or `false` for results already filtered by a server. A function can return a score instead of `true` or `false`, and items you pass as `items` then sort by it, best first. `fuzzyScore` from `@ui-sdk/core/text-match` scores an exact match above a prefix, and a prefix above a match inside the label. Assign a function to the `filter` property.

Use `keywords` for text that should match without appearing in the label, such as a username or a country’s local name.

```ts title="filter.ts"
import "@ui-sdk/web/combobox"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const countries = [
  { value: "ar", label: "Argentina", keywords: ["república argentina"] },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria", keywords: ["österreich"] },
  { value: "be", label: "Belgium", keywords: ["belgië", "belgique"] },
  { value: "br", label: "Brazil", keywords: ["brasil"] },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark", keywords: ["danmark"] },
  { value: "fi", label: "Finland", keywords: ["suomi"] },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", keywords: ["deutschland"] },
  { value: "gr", label: "Greece", keywords: ["hellas", "ελλάδα"] },
  { value: "jp", label: "Japan", keywords: ["nippon", "日本"] },
  { value: "nl", label: "Netherlands", keywords: ["holland", "nederland"] },
  { value: "es", label: "Spain", keywords: ["españa"] },
  { value: "se", label: "Sweden", keywords: ["sverige"] },
  {
    value: "ch",
    label: "Switzerland",
    keywords: ["schweiz", "suisse", "svizzera"],
  },
]

function fuzzy(item: { label: string }, query: string) {
  let at = 0
  for (const char of item.label.toLowerCase()) {
    if (char === query[at]?.toLowerCase()) {
      at++
    }
  }
  return at === query.length
}

const modes = [
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts with" },
  { value: "fuzzy", label: "Fuzzy" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <ui-select default-value="contains">
          <ui-select-label>Filter</ui-select-label>
          <ui-select-trigger>
            <button>
              <ui-select-value></ui-select-value>
              ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-select-trigger>
          <ui-select-content hidden>
            ${modes
              .map(
                (option) => `
                  <ui-select-item value="${option.value}">
                    ${option.label}
                    <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
                  </ui-select-item>
                `
              )
              .join("")}
          </ui-select-content>
        </ui-select>
      </div>
      <ui-combobox filter="contains">
        <div data-slot="stack">
          <ui-combobox-label>Country</ui-combobox-label>
          <div data-slot="row">
            <ui-combobox-input>
              <input placeholder="Try “an”, “swd” or “deutschland”" />
            </ui-combobox-input>
            <ui-combobox-trigger>
              <button aria-label="Show countries">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
            </ui-combobox-trigger>
          </div>
        </div>
        <ui-combobox-content hidden>
          <ui-combobox-empty>No countries found.</ui-combobox-empty>
          <ui-combobox-list>
            ${countries
              .map(
                (country) => `
                  <ui-combobox-item value="${country.value}" label="${country.label}"${country.keywords ? ` keywords="${country.keywords.join(",")}"` : ""}>
                    ${country.label}
                    <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                  </ui-combobox-item>
                `
              )
              .join("")}
          </ui-combobox-list>
        </ui-combobox-content>
      </ui-combobox>
    </div>
  `
  const combobox = root.querySelector("ui-combobox")!
  root.querySelector("ui-select")!.addEventListener("valuechange", (event) => {
    const mode = event.detail.value
    if (!mode) {
      return
    }
    if (mode === "fuzzy") {
      combobox.filter = fuzzy
    } else {
      combobox.filter = undefined
      combobox.setAttribute("filter", String(mode))
    }
  })
}

export { mount }
```

Type “an” and switch Filter between Contains and Starts with. Choose Fuzzy and type “swd” for Sweden, or type “deutschland” to find Germany through a keyword.

## Groups

Use `ui-combobox-group` and `ui-combobox-group-label` to name groups. Filtering hides empty groups and separators as their items disappear.

```ts title="groups.ts"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"

const timezones = [
  {
    label: "Americas",
    items: [
      { value: "America/New_York", label: "New York" },
      { value: "America/Chicago", label: "Chicago" },
      { value: "America/Denver", label: "Denver" },
      { value: "America/Los_Angeles", label: "Los Angeles" },
      { value: "America/Sao_Paulo", label: "São Paulo" },
    ],
  },
  {
    label: "Europe",
    items: [
      { value: "Europe/London", label: "London" },
      { value: "Europe/Paris", label: "Paris" },
      { value: "Europe/Berlin", label: "Berlin" },
      { value: "Europe/Madrid", label: "Madrid" },
    ],
  },
  {
    label: "Asia & Pacific",
    items: [
      { value: "Asia/Tokyo", label: "Tokyo" },
      { value: "Asia/Singapore", label: "Singapore" },
      { value: "Asia/Kolkata", label: "Kolkata" },
      { value: "Australia/Sydney", label: "Sydney" },
    ],
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox>
      <div data-slot="stack">
        <ui-combobox-label>Timezone</ui-combobox-label>
        <div data-slot="row">
          <ui-combobox-input>
            <input placeholder="Search cities…" />
          </ui-combobox-input>
          <ui-combobox-trigger>
            <button aria-label="Show timezones">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No cities found.</ui-combobox-empty>
        <ui-combobox-list>
          ${timezones
            .map(
              (group, index) => `
                ${index > 0 ? `<ui-combobox-separator></ui-combobox-separator>` : ""}
                <ui-combobox-group>
                  <ui-combobox-group-label>${group.label}</ui-combobox-group-label>
                  ${group.items
                    .map(
                      (item) => `
                        <ui-combobox-item value="${item.value}" label="${item.label}">
                          ${item.label}
                          <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                        </ui-combobox-item>
                      `
                    )
                    .join("")}
                </ui-combobox-group>
              `
            )
            .join("")}
        </ui-combobox-list>
      </ui-combobox-content>
    </ui-combobox>
  `
}

export { mount }
```

Type “chic”. Chicago remains in Americas; groups with no matches disappear.

## Icons

`ui-combobox-item-icon` keeps decorative icons out of accessible names, filtering, and match marks. `ui-combobox-value-icon` projects the selected item’s icon next to the input; it takes no children and is only for a single selection.

Wrap the input and icon together, then use that wrapper as the popup’s `anchor`. Add `mirror` for directional icons. An icon-only option still needs an `aria-label`.

```ts title="icons.ts"
import "@ui-sdk/web/combobox"
import {
  ArrowRight,
  Check,
  ChevronDown,
  Circle,
  CircleCheck,
  CircleX,
  createElement,
} from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox>
      <div data-slot="stack">
        <ui-combobox-label>Status</ui-combobox-label>
        <div id="combobox-icons-field" data-slot="row">
          <ui-combobox-value-icon></ui-combobox-value-icon>
          <ui-combobox-input>
            <input placeholder="Select a status" />
          </ui-combobox-input>
          <ui-combobox-trigger>
            <button aria-label="Show statuses">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden anchor="#combobox-icons-field">
        <ui-combobox-empty>No statuses found.</ui-combobox-empty>
        <ui-combobox-list>
          <ui-combobox-item value="backlog" label="Backlog">
            <ui-combobox-item-icon>${createElement(Circle, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-icon>
            <ui-combobox-item-text>Backlog</ui-combobox-item-text>
            <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
          </ui-combobox-item>
          <ui-combobox-item value="in-progress" label="In progress">
            <ui-combobox-item-icon mirror>${createElement(ArrowRight, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-icon>
            <ui-combobox-item-text>In progress</ui-combobox-item-text>
            <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
          </ui-combobox-item>
          <ui-combobox-item value="done" label="Done">
            <ui-combobox-item-icon>${createElement(CircleCheck, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-icon>
            <ui-combobox-item-text>Done</ui-combobox-item-text>
            <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
          </ui-combobox-item>
          <ui-combobox-item value="canceled" label="Canceled">
            <ui-combobox-item-icon>${createElement(CircleX, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-icon>
            <ui-combobox-item-text>Canceled</ui-combobox-item-text>
            <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
          </ui-combobox-item>
        </ui-combobox-list>
      </ui-combobox-content>
    </ui-combobox>
  `
}

export { mount }
```

Choose Done. Its icon appears next to the input as well as in the list.

## Custom Items

Show useful context beside a label, such as a username or role. Set `label` explicitly so filtering and the input use the intended text, and put extra search terms in `keywords`.

```ts title="custom-items.ts"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"

const users = [
  { id: 1, name: "Hollis Grant", username: "hollis", role: "Owner" },
  { id: 2, name: "Inès Moreau", username: "ines", role: "Admin" },
  { id: 3, name: "Kofi Mensah", username: "kofi", role: "Member" },
  { id: 4, name: "Wren Takahashi", username: "wren", role: "Member" },
  { id: 5, name: "Tomasz Wójcik", username: "tomasz", role: "Guest" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox>
      <div data-slot="stack">
        <ui-combobox-label>Owner</ui-combobox-label>
        <div data-slot="row">
          <ui-combobox-input>
            <input placeholder="Search people…" />
          </ui-combobox-input>
          <ui-combobox-trigger>
            <button aria-label="Show people">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No people found.</ui-combobox-empty>
        <ui-combobox-list>
          ${users
            .map(
              (user) => `
                <ui-combobox-item value="${user.username}" label="${user.name}" keywords="${user.username}">
                  <span data-slot="badge">${user.name.slice(0, 1)}</span>
                  <span data-slot="stack">
                    <span>${user.name}</span>
                    <span data-slot="hint">@${user.username}</span>
                  </span>
                  <span data-slot="hint">${user.role}</span>
                  <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                </ui-combobox-item>
              `
            )
            .join("")}
        </ui-combobox-list>
      </ui-combobox-content>
    </ui-combobox>
  `
}

export { mount }
```

Search for a person’s name or username. Choose a result to put that person’s name in the input.

## Items as Data

Pass `items` when the combobox needs the whole collection, such as recent items, server results, or virtualization. Assign it as a property; the element renders bare parts for you, and a `<template>` styles them. Each item's `label` supplies the text for filtering and the input; `keywords` and `disabled` work the same as with items you render yourself. [Lists and Menus](../lists-and-menus.md) covers the `ListData` format.

```ts
const combobox = document.querySelector("ui-combobox")!
combobox.items = [
  { value: "apple", label: "Apple" },
  { value: "cherry", label: "Cherry", keywords: ["red"] },
  {
    type: "group",
    label: "Citrus",
    items: [{ value: "lemon", label: "Lemon" }],
  },
]
```

Items can change while the list is open. Selection and highlight stay on their items; removing the highlighted item clears the highlight.

## Recent Items

`emptyItems` supplies suggestions while the query is empty. Pair it with `items` for the full searchable collection. Assign both as properties; the template renders whichever collection is active.

```ts title="recent.ts"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"

const countries = [
  { value: "ar", label: "Argentina", keywords: ["república argentina"] },
  { value: "au", label: "Australia", keywords: ["oz"] },
  { value: "at", label: "Austria", keywords: ["österreich"] },
  { value: "be", label: "Belgium", keywords: ["belgië", "belgique"] },
  { value: "br", label: "Brazil", keywords: ["brasil"] },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark", keywords: ["danmark"] },
  { value: "fi", label: "Finland", keywords: ["suomi"] },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", keywords: ["deutschland"] },
  { value: "gr", label: "Greece", keywords: ["hellas", "ελλάδα"] },
  { value: "jp", label: "Japan", keywords: ["nippon", "日本"] },
  { value: "nl", label: "Netherlands", keywords: ["holland", "nederland"] },
  { value: "es", label: "Spain", keywords: ["españa"] },
  { value: "se", label: "Sweden", keywords: ["sverige"] },
  {
    value: "ch",
    label: "Switzerland",
    keywords: ["schweiz", "suisse", "svizzera"],
  },
]

const recentCountries = [
  {
    type: "group" as const,
    label: "Recent",
    items: [countries[9], countries[12], countries[15]],
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox>
      <div data-slot="stack">
        <ui-combobox-label>Country</ui-combobox-label>
        <div data-slot="row">
          <ui-combobox-input>
            <input placeholder="Search countries…" />
          </ui-combobox-input>
          <ui-combobox-trigger>
            <button aria-label="Show countries">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No countries found.</ui-combobox-empty>
        <ui-combobox-list></ui-combobox-list>
      </ui-combobox-content>
      <template>
        <ui-combobox-group>
          <ui-combobox-group-label></ui-combobox-group-label>
          <ui-combobox-item>
            <ui-combobox-item-text></ui-combobox-item-text>
            <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
          </ui-combobox-item>
        </ui-combobox-group>
      </template>
    </ui-combobox>
  `
  const combobox = root.querySelector("ui-combobox")!
  combobox.emptyItems = recentCountries
  combobox.announcement = (change) =>
    change.type === "results" ? `${change.count} countries match` : null
  combobox.items = countries
}

export { mount }
```

Open the empty input to see Recent. Start typing to search all countries; clear the text to return to Recent.

## Object Values

Use the `itemToValue` property for an object’s string identity and form value, `itemToLabel` for its displayed text, and `isItemEqualToValue` when two different objects can represent the same option.

```html
<ui-combobox name="reviewer">…</ui-combobox>

<script type="module">
  const reviewer = document.querySelector("ui-combobox[name=reviewer]")
  reviewer.itemToValue = (person) => String(person.id)
  reviewer.itemToLabel = (person) => person.name
  reviewer.isItemEqualToValue = (person, value) => person.id === value.id
</script>
```

## Multiple

Add `multiple` to make the value an array. Choosing an option toggles it, keeps the list open, and clears the query. Put the input inside `ui-combobox-chips`; the element renders each value as a chip with a removal button, copying the `ui-combobox-chip` in a `<template>` when you write one.

Backspace in an empty input removes the last chip in one press. Unlike [Token Input](./token-input.md#deleting-tokens), there is no `token-deletion` option to select it first. Arrow keys move between chips. Set the `itemToLabel` property when starting with values whose labels are not yet known from rendered items.

Add `keep-query` to choose several matches without retyping the query.

```ts title="multiple.ts"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

const frameworkLabel = (value: string) =>
  frameworks.find((framework) => framework.value === value)?.label ?? value

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox multiple default-value="next, astro">
      <div data-slot="stack">
        <ui-combobox-label>Frameworks</ui-combobox-label>
        <div data-slot="row">
          <ui-combobox-chips>
            <ui-combobox-input>
              <input placeholder="Add a framework…" />
            </ui-combobox-input>
          </ui-combobox-chips>
          <ui-combobox-trigger>
            <button aria-label="Show frameworks">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No frameworks found.</ui-combobox-empty>
        <ui-combobox-list>
          ${frameworks
            .map(
              (framework) => `
                <ui-combobox-item value="${framework.value}" label="${framework.label}">
                  ${framework.label}
                  <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                </ui-combobox-item>
              `
            )
            .join("")}
        </ui-combobox-list>
      </ui-combobox-content>
      <template>
        <ui-combobox-chip>
          <ui-combobox-chip-remove><button type="button">×</button></ui-combobox-chip-remove>
        </ui-combobox-chip>
      </template>
    </ui-combobox>
  `
  const combobox = root.querySelector("ui-combobox") as HTMLElement & {
    itemToLabel: (value: string) => string
  }
  combobox.itemToLabel = frameworkLabel
}

export { mount }
```

Choose several frameworks. Remove one with its chip button, or press Backspace in the empty input to remove the last chip.

## Select All

`ui-combobox-select-all` toggles every matching, enabled option. Inside a group, it affects only that group. It joins keyboard navigation and reports a mixed state while some of its options are selected.

```ts title="select-all.ts"
import "@ui-sdk/web/combobox"
import { Check, createElement, Minus } from "lucide"

const timezones = [
  {
    label: "Americas",
    items: [
      { value: "America/New_York", label: "New York" },
      { value: "America/Chicago", label: "Chicago" },
      { value: "America/Denver", label: "Denver" },
      { value: "America/Los_Angeles", label: "Los Angeles" },
      { value: "America/Sao_Paulo", label: "São Paulo" },
    ],
  },
  {
    label: "Europe",
    items: [
      { value: "Europe/London", label: "London" },
      { value: "Europe/Paris", label: "Paris" },
      { value: "Europe/Berlin", label: "Berlin" },
      { value: "Europe/Madrid", label: "Madrid" },
    ],
  },
  {
    label: "Asia & Pacific",
    items: [
      { value: "Asia/Tokyo", label: "Tokyo" },
      { value: "Asia/Singapore", label: "Singapore" },
      { value: "Asia/Kolkata", label: "Kolkata" },
      { value: "Australia/Sydney", label: "Sydney" },
    ],
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox multiple default-value="Europe/Paris">
      <div data-slot="stack">
        <ui-combobox-label>Timezones</ui-combobox-label>
        <ui-combobox-chips>
          <ui-combobox-input>
            <input placeholder="Add timezones…" />
          </ui-combobox-input>
        </ui-combobox-chips>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No timezones found.</ui-combobox-empty>
        <ui-combobox-list>
          <ui-combobox-select-all>
            <span>
              ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
              ${createElement(Minus, { "aria-hidden": "true" }).outerHTML}
            </span>
            Select all
          </ui-combobox-select-all>
          ${timezones
            .map(
              (group) => `
                <ui-combobox-group>
                  <ui-combobox-group-label>${group.label}</ui-combobox-group-label>
                  <ui-combobox-select-all>
                    <span data-hide="checked">Select all in ${group.label}</span>
                    <span data-show="checked">Clear ${group.label}</span>
                  </ui-combobox-select-all>
                  ${group.items
                    .map(
                      (zone) => `
                        <ui-combobox-item value="${zone.value}" label="${zone.label}">
                          <span>
                            <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                          </span>
                          ${zone.label}
                        </ui-combobox-item>
                      `
                    )
                    .join("")}
                </ui-combobox-group>
              `
            )
            .join("")}
        </ui-combobox-list>
      </ui-combobox-content>
      <template>
        <ui-combobox-chip>
          <ui-combobox-chip-remove><button type="button">×</button></ui-combobox-chip-remove>
        </ui-combobox-chip>
      </template>
    </ui-combobox>
  `
}

export { mount }
```

Open the list and choose a group’s select-all option. Type to narrow the matches, then use the main select-all option on those results.

## Chips That Collapse

Add `ui-combobox-chips-overflow` to keep chips on one line. It measures which chips fit, hides the rest, and exposes their count and labels. Separately, the `valuechange` event gives you the selection for a short text summary.

```ts title="chips-overflow.ts"
import "@ui-sdk/web/combobox"
import { Check, createElement } from "lucide"

const countries = [
  { value: "ar", label: "Argentina", keywords: ["república argentina"] },
  { value: "au", label: "Australia", keywords: ["oz"] },
  { value: "at", label: "Austria", keywords: ["österreich"] },
  { value: "be", label: "Belgium", keywords: ["belgië", "belgique"] },
  { value: "br", label: "Brazil", keywords: ["brasil"] },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark", keywords: ["danmark"] },
  { value: "fi", label: "Finland", keywords: ["suomi"] },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", keywords: ["deutschland"] },
  { value: "gr", label: "Greece", keywords: ["hellas", "ελλάδα"] },
  { value: "jp", label: "Japan", keywords: ["nippon", "日本"] },
  { value: "nl", label: "Netherlands", keywords: ["holland", "nederland"] },
  { value: "es", label: "Spain", keywords: ["españa"] },
  { value: "se", label: "Sweden", keywords: ["sverige"] },
  {
    value: "ch",
    label: "Switzerland",
    keywords: ["schweiz", "suisse", "svizzera"],
  },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox multiple default-value="fr, jp, se, de, ch">
      <div data-slot="stack">
        <ui-combobox-label>Countries</ui-combobox-label>
        <ui-combobox-chips>
          <ui-combobox-chips-overflow></ui-combobox-chips-overflow>
          <ui-combobox-input>
            <input placeholder="Add…" />
          </ui-combobox-input>
        </ui-combobox-chips>
        <p data-slot="hint"></p>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No countries found.</ui-combobox-empty>
        <ui-combobox-list>
          ${countries
            .map(
              (country) => `
                <ui-combobox-item value="${country.value}" label="${country.label}">
                  ${country.label}
                  <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                </ui-combobox-item>
              `
            )
            .join("")}
        </ui-combobox-list>
      </ui-combobox-content>
      <template>
        <ui-combobox-chip>
          <ui-combobox-chip-remove><button type="button">×</button></ui-combobox-chip-remove>
        </ui-combobox-chip>
      </template>
    </ui-combobox>
  `
  const combobox = root.querySelector("ui-combobox")!
  combobox.itemToLabel = (value) => countryLabel(value as string)
  const summary = root.querySelector("p")!
  const list = new Intl.ListFormat(document.documentElement.lang || undefined, {
    type: "conjunction",
  })
  const show = (value: string[]) => {
    const labels = value.map(countryLabel)
    summary.textContent = list.format(
      labels.length > 2
        ? [...labels.slice(0, 2), `${labels.length - 2} more`]
        : labels
    )
  }
  show(["fr", "jp", "se", "de", "ch"])
  combobox.addEventListener("valuechange", (event) =>
    show(event.detail.value as string[])
  )
}

export { mount }
```

Add or remove countries. Chips that no longer fit are replaced by an overflow count; the summary below lists the first two.

## Max Selected

`max-selected` limits a multiple selection. Once the limit is reached, other options become disabled; their `maxReached` state explains why.

```ts title="max-selected.ts"
import "@ui-sdk/web/combobox"
import { Check, createElement } from "lucide"

const labels = [
  "Bug",
  "Feature",
  "Documentation",
  "Design",
  "Performance",
  "Security",
  "Testing",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox multiple max-selected="3" default-value="Bug, Design">
      <div data-slot="stack">
        <ui-combobox-label>Labels (up to 3)</ui-combobox-label>
        <ui-combobox-chips>
          <ui-combobox-input>
            <input placeholder="Add labels…" />
          </ui-combobox-input>
        </ui-combobox-chips>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-list>
          ${labels
            .map(
              (label) => `
                <ui-combobox-item value="${label}" label="${label}">
                  ${label}
                  <span data-slot="hint" data-show="disabled">Limit reached</span>
                  <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                </ui-combobox-item>
              `
            )
            .join("")}
        </ui-combobox-list>
      </ui-combobox-content>
      <template>
        <ui-combobox-chip>
          <ui-combobox-chip-remove><button type="button">×</button></ui-combobox-chip-remove>
        </ui-combobox-chip>
      </template>
    </ui-combobox>
  `
  const combobox = root.querySelector("ui-combobox")
}

export { mount }
```

Choose a third label. Other unselected labels become unavailable until you remove one.

## Create Option

`ui-combobox-create` offers the query when no label matches it exactly and it meets `min-length`. Handle its `create` event to save it; pass a promise to `event.detail.waitUntil()` for asynchronous work. Creation does not change the selection itself: add the new item and select it after saving.

While saving, the option reports `data-pending`, `aria-busy` and `aria-disabled`. A rejected promise is available through its error state.

```ts title="create.ts"
import "@ui-sdk/web/combobox"
import { Check, createElement, LoaderCircle, Plus } from "lucide"

const labels = [
  "Bug",
  "Feature",
  "Documentation",
  "Design",
  "Performance",
  "Security",
  "Testing",
]

function saveLabel(name: string) {
  return new Promise<void>((resolve, reject) =>
    setTimeout(
      () =>
        name.length > 20
          ? reject(new Error("Labels are 20 characters at most."))
          : resolve(),
      800
    )
  )
}

const item = (label: string) => `
  <ui-combobox-item value="${label}">
    ${label}
    <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
  </ui-combobox-item>
`

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox multiple default-value="Bug">
      <div data-slot="stack">
        <ui-combobox-label>Labels</ui-combobox-label>
        <ui-combobox-chips>
          <ui-combobox-input>
            <input placeholder="Add or create a label…" />
          </ui-combobox-input>
        </ui-combobox-chips>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-list>
          ${labels.map(item).join("")}
          <ui-combobox-create min-length="2">
            ${createElement(LoaderCircle, { "data-slot": "spinner", "data-show": "pending", "aria-hidden": "true" }).outerHTML}
            <span data-show="pending">Creating “<span data-query></span>”…</span>
            ${createElement(Plus, { "data-hide": "pending", "aria-hidden": "true" }).outerHTML}
            <span data-slot="stack" data-hide="pending">
              <span>Create “<span data-query></span>”</span>
              <span data-error data-slot="hint"></span>
            </span>
          </ui-combobox-create>
        </ui-combobox-list>
      </ui-combobox-content>
      <template>
        <ui-combobox-chip>
          <ui-combobox-chip-remove><button type="button">×</button></ui-combobox-chip-remove>
        </ui-combobox-chip>
      </template>
    </ui-combobox>
  `
  const combobox = root.querySelector("ui-combobox") as HTMLElement & {
    value: string[]
  }
  const error = root.querySelector("[data-error]")!
  combobox.addEventListener("querychange", (event) => {
    const query = (event as CustomEvent<{ value: string }>).detail.value.trim()
    for (const span of root.querySelectorAll("[data-query]")) {
      span.textContent = query
    }
  })
  combobox.addEventListener("create", (event) => {
    const { value, waitUntil } = (
      event as CustomEvent<{
        value: string
        waitUntil: (promise: Promise<unknown>) => void
      }>
    ).detail
    error.textContent = ""
    waitUntil(
      saveLabel(value).then(
        () => {
          root
            .querySelector("ui-combobox-create")!
            .insertAdjacentHTML("beforebegin", item(value))
          combobox.value = [...combobox.value, value]
        },
        (reason: Error) => {
          error.textContent = reason.message
          throw reason
        }
      )
    )
  })
}

export { mount }
```

Type a new label and choose Create. It becomes a selected chip after saving; a label longer than 20 characters shows an error.

## Custom Value

Use `allow-custom-value` when suggestions are optional, like a datalist. Unmatched text becomes the value on Enter with nothing highlighted, or when the list closes. This does not create a new item in the collection.

```ts title="custom-value.ts"
import "@ui-sdk/web/combobox"
import { Check, createElement } from "lucide"
import { log } from "./log"

const titles = [
  "Designer",
  "Engineer",
  "Engineering manager",
  "Product manager",
  "Researcher",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox allow-custom-value>
      <div data-slot="stack">
        <ui-combobox-label>Job title</ui-combobox-label>
        <ui-combobox-input>
          <input placeholder="Type any title…" />
        </ui-combobox-input>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>Press Enter to use “<span></span>”.</ui-combobox-empty>
        <ui-combobox-list>
          ${titles
            .map(
              (title) => `
                <ui-combobox-item value="${title}">
                  ${title}
                  <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                </ui-combobox-item>
              `
            )
            .join("")}
        </ui-combobox-list>
      </ui-combobox-content>
    </ui-combobox>
  `
  const combobox = root.querySelector("ui-combobox")!
  const query = root.querySelector("ui-combobox-empty span")!
  combobox.addEventListener(
    "querychange",
    (event) => (query.textContent = event.detail.value)
  )
  combobox.addEventListener("valuechange", (event) => {
    const { value, reason } = event.detail
    log(root, `${value ? `“${value}”` : "No title"} (${reason})`)
  })
}

export { mount }
```

Type a job title that isn't suggested, then press Enter without a highlighted option or leave the field. The text becomes the value, and the console logs it.

## Input in the Popup

The input can live inside the popup, opened by a button showing the current value. The button then stays in the tab order. Anchor the content to it, clear the query when opening, and return focus to it after closing, as this example does.

```ts title="popup.ts"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement, Search } from "lucide"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox default-value="jp">
      <ui-combobox-trigger>
        <button id="combobox-popup-button" aria-label="Country">
          <span>Japan</span>
          ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
        </button>
      </ui-combobox-trigger>
      <ui-combobox-content hidden anchor="#combobox-popup-button">
        <div data-slot="row">
          ${createElement(Search, { "aria-hidden": "true" }).outerHTML}
          <ui-combobox-input>
            <input autofocus aria-label="Search countries" placeholder="Search…" />
          </ui-combobox-input>
        </div>
        <ui-combobox-empty>No countries found.</ui-combobox-empty>
        <ui-combobox-list>
          ${countries
            .map(
              (country) => `
                <ui-combobox-item value="${country.value}" label="${country.label}">
                  ${country.label}
                  <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                </ui-combobox-item>
              `
            )
            .join("")}
        </ui-combobox-list>
      </ui-combobox-content>
    </ui-combobox>
  `
  const combobox = root.querySelector("ui-combobox") as HTMLElement & {
    query: string
    itemToLabel: (value: string) => string
  }
  const button = root.querySelector<HTMLButtonElement>(
    "#combobox-popup-button"
  )!
  combobox.itemToLabel = countryLabel
  combobox.addEventListener("valuechange", (event) => {
    const { value } = (event as CustomEvent<{ value: string | null }>).detail
    button.querySelector("span")!.textContent = value
      ? countryLabel(value)
      : "Select a country"
  })
  combobox.addEventListener("openchange", (event) => {
    if ((event as CustomEvent<{ value: boolean }>).detail.value) {
      combobox.query = ""
    }
  })
  combobox.addEventListener("openchangecomplete", (event) => {
    if (!(event as CustomEvent<{ value: boolean }>).detail.value) {
      button.focus()
    }
  })
}

export { mount }
```

Press Country to open the search field inside the popup. Choose a country; closing the popup returns focus to the button.

## Async Search

Use [createAsyncOptions](../utilities/async-options.md) to debounce a search and discard stale results. Pass its `items` and `status` to the combobox, set `filter` to `false`, and send query changes to the loader.

`ui-combobox-status` and `ui-combobox-empty` provide loading, error, and empty messages. Without a custom status, the combobox announces the result count once typing pauses.

```ts title="async.ts"
import { createAsyncOptions } from "@ui-sdk/core/async-options"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"

const movieTitles = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "Pulp Fiction",
  "Schindler's List",
  "The Lord of the Rings",
  "Fight Club",
  "Forrest Gump",
  "Inception",
  "The Matrix",
  "Goodfellas",
  "Interstellar",
  "Parasite",
  "Spirited Away",
  "Whiplash",
  "The Prestige",
  "The Departed",
  "Gladiator",
  "Alien",
  "Casablanca",
  "Amélie",
  "Arrival",
]

function searchMovies(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      resolve(
        movieTitles
          .filter((title) => title.toLowerCase().includes(needle))
          .map((title) => ({
            value: title.toLowerCase().replace(/\W+/g, "-"),
            label: title,
          }))
      )
    }, 500)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox filter="false" default-query="the">
      <div data-slot="stack">
        <ui-combobox-label>Movie</ui-combobox-label>
        <div data-slot="row">
          <ui-combobox-input>
            <input placeholder="Search movies…" />
          </ui-combobox-input>
          <ui-combobox-trigger>
            <button aria-label="Show movies">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-status></ui-combobox-status>
        <ui-combobox-empty>No movies match “<span>the</span>”.</ui-combobox-empty>
        <ui-combobox-list></ui-combobox-list>
      </ui-combobox-content>
      <template>
        <ui-combobox-item>
          <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
        </ui-combobox-item>
      </template>
    </ui-combobox>
  `
  const combobox = root.querySelector("ui-combobox")!
  const status = root.querySelector("ui-combobox-status")!
  const query = root.querySelector("ui-combobox-empty span")!
  const movies = createAsyncOptions(searchMovies, {
    debounce: 300,
    query: "the",
    immediate: true,
  })
  const update = () => {
    const { items, status: loading } = movies.getState()
    combobox.items = items
    combobox.setAttribute("status", loading)
    status.textContent =
      loading === "error"
        ? "Couldn't load movies."
        : loading === "loading"
          ? "Searching…"
          : `${items.length} ${items.length === 1 ? "movie" : "movies"}`
  }
  movies.subscribe(update)
  update()
  combobox.addEventListener("querychange", (event) => {
    query.textContent = event.detail.value
    movies.setQuery(event.detail.value)
  })
}

export { mount }
```

Replace “the” with another movie title. The status shows the pending search, then the latest results.

## Load More

The `loadmore` event fires when scrolling or highlighting reaches the last option, once per page and not while a page loads. Connect it to the async loader’s `loadMore()`; return `{ items, hasMore }` from each page.

```ts title="infinite.ts"
import { createAsyncOptions } from "@ui-sdk/core/async-options"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"

const movieTitles = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "Pulp Fiction",
  "Schindler's List",
  "The Lord of the Rings",
  "Fight Club",
  "Forrest Gump",
  "Inception",
  "The Matrix",
  "Goodfellas",
  "Interstellar",
  "Parasite",
  "Spirited Away",
  "Whiplash",
  "The Prestige",
  "The Departed",
  "Gladiator",
  "Alien",
  "Casablanca",
  "Amélie",
  "Arrival",
]

function searchMoviePages(
  query: string,
  { signal, page }: { signal: AbortSignal; page: number }
) {
  return new Promise<{
    items: { value: string; label: string }[]
    hasMore: boolean
  }>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      const found = movieTitles
        .filter((title) => title.toLowerCase().includes(needle))
        .map((title) => ({
          value: title.toLowerCase().replace(/\W+/g, "-"),
          label: title,
        }))
      resolve({
        items: found.slice(page * 5, page * 5 + 5),
        hasMore: found.length > page * 5 + 5,
      })
    }, 500)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox filter="false">
      <div data-slot="stack">
        <ui-combobox-label>Movie</ui-combobox-label>
        <div data-slot="row">
          <ui-combobox-input>
            <input placeholder="Search movies…" />
          </ui-combobox-input>
          <ui-combobox-trigger>
            <button aria-label="Show movies">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No movies found.</ui-combobox-empty>
        <ui-combobox-list></ui-combobox-list>
        <ui-combobox-status></ui-combobox-status>
      </ui-combobox-content>
      <template>
        <ui-combobox-item>
          <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
        </ui-combobox-item>
      </template>
    </ui-combobox>
  `
  const combobox = root.querySelector("ui-combobox")!
  const status = root.querySelector("ui-combobox-status")!
  const movies = createAsyncOptions(searchMoviePages, { immediate: true })
  const update = () => {
    const { items, status: loading, hasMore } = movies.getState()
    combobox.items = items
    combobox.setAttribute("status", loading)
    status.textContent =
      loading === "loading"
        ? "Loading more…"
        : hasMore
          ? `${items.length} loaded`
          : `All ${items.length}`
  }
  movies.subscribe(update)
  update()
  combobox.addEventListener("querychange", (event) =>
    movies.setQuery(event.detail.value)
  )
  combobox.addEventListener("loadmore", () => movies.loadMore())
}

export { mount }
```

Open the movies and scroll or arrow to the last result. Another page loads while the existing results stay available.

## Virtualized

Supply `items` so filtering and keyboard navigation know about every option, even when only a few rows render. The `highlight` event reports the row to reveal, and each rendered item’s `index` gives its position in the full list to screen readers.

This example windows 10,000 items. Keep the actual row height aligned with your virtualizer’s measurement, and use the scroller’s visible height when revealing a row.

```ts title="virtualized.ts"
import "@ui-sdk/web/combobox"
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
    <ui-combobox>
      <div data-slot="stack">
        <ui-combobox-label>Item</ui-combobox-label>
        <div data-slot="row">
          <ui-combobox-input>
            <input placeholder="Search 10,000 items…" />
          </ui-combobox-input>
          <ui-combobox-trigger>
            <button aria-label="Show items">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No items found.</ui-combobox-empty>
        <div>
          <ui-combobox-list></ui-combobox-list>
        </div>
      </ui-combobox-content>
    </ui-combobox>
  `
  const combobox = root.querySelector("ui-combobox") as HTMLElement & {
    items: typeof manyItems
  }
  const scroller = root.querySelector<HTMLElement>("ui-combobox-content > div")!
  const list = root.querySelector<HTMLElement>("ui-combobox-list")!

  let matches = manyItems
  const filter = (text: string) => {
    const needle = text.trim().toLowerCase()
    matches = needle
      ? manyItems.filter((item) => item.label.toLowerCase().includes(needle))
      : manyItems
  }

  const rendered = new Map<string, HTMLElement>()
  const render = () => {
    list.style.height = `${matches.length * row}px`
    const { start, end } = visibleRows(
      scroller.scrollTop,
      height,
      matches.length,
      row
    )
    const visible = new Map(
      matches
        .slice(start, end)
        .map((item, offset) => [item.value, start + offset])
    )
    for (const [value, el] of rendered) {
      if (visible.has(value)) {
        continue
      }
      el.remove()
      rendered.delete(value)
    }
    for (const [value, index] of visible) {
      const existing = rendered.get(value)
      if (existing) {
        existing.setAttribute("index", String(index))
        existing.style.top = `${index * row}px`
        continue
      }
      const item = matches[index]
      list.insertAdjacentHTML(
        "beforeend",
        `<ui-combobox-item value="${item.value}" label="${item.label}" index="${index}" style="top: ${index * row}px; height: ${row}px">${item.label}</ui-combobox-item>`
      )
      rendered.set(value, list.lastElementChild as HTMLElement)
    }
  }
  render()
  combobox.items = manyItems
  scroller.addEventListener("scroll", render)
  combobox.addEventListener("querychange", (event) => {
    const { value, reason } = (
      event as CustomEvent<{ value: string; reason: string }>
    ).detail
    filter(reason === "input-change" ? value : "")
    render()
  })
  combobox.addEventListener("highlight", (event) => {
    const { index } = (
      event as CustomEvent<{ value: string | null; index: number }>
    ).detail
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

Search 10,000 items or move through them with the arrow keys. Only the nearby rows render.

## Controlled

The selection, text, and popup have separate values:

| Value   | Change notification | Meaning                                        |
| ------- | ------------------- | ---------------------------------------------- |
| `value` | `valuechange`       | One value or `null`; an array with `multiple`. |
| `query` | `querychange`       | The input’s text.                              |
| `open`  | `openchange`        | Whether the popup is open.                     |

Read or write the element’s properties and listen for these events. Call `preventDefault()` on a change event to reject it. Choosing an item writes its label into the input, and a canceled choice keeps the current one. Closing without choosing restores the value’s label unless custom values are allowed. [State and Events](../state-and-events.md) covers the binding pattern.

Focus leaving the input closes the popup with the reason `focus-out`, even when code moves it, like a notice that takes focus. To keep the popup open, call `preventDefault()` on that `openchange`.

```ts title="controlled.ts"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"
import { log } from "./log"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-action="value">Choose Japan</button>
        <button type="button" data-action="open">Open</button>
      </div>
      <ui-combobox default-value="fr" debug>
        <div data-slot="stack">
          <ui-combobox-label>Country</ui-combobox-label>
          <div data-slot="row">
            <ui-combobox-input>
              <input placeholder="Search countries…" />
            </ui-combobox-input>
            <ui-combobox-trigger>
              <button aria-label="Show countries">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
            </ui-combobox-trigger>
          </div>
        </div>
        <ui-combobox-content hidden>
          <ui-combobox-empty>No countries found.</ui-combobox-empty>
          <ui-combobox-list>
            ${countries
              .map(
                (country) => `
                  <ui-combobox-item value="${country.value}" label="${country.label}">
                    ${country.label}
                    <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                  </ui-combobox-item>
                `
              )
              .join("")}
          </ui-combobox-list>
        </ui-combobox-content>
      </ui-combobox>
    </div>
  `
  const combobox = root.querySelector("ui-combobox")!
  combobox.itemToLabel = (value) => countryLabel(value as string)
  combobox.addEventListener("valuechange", (event) =>
    log(root, `value: ${event.detail.value} (${event.detail.reason})`)
  )
  combobox.addEventListener("querychange", (event) =>
    log(root, `query: “${event.detail.value}” (${event.detail.reason})`)
  )
  combobox.addEventListener("openchange", (event) =>
    log(root, `open: ${event.detail.value} (${event.detail.reason})`)
  )
  root
    .querySelector("[data-action=value]")!
    .addEventListener("click", () => (combobox.value = "jp"))
  root
    .querySelector("[data-action=open]")!
    .addEventListener("click", () => (combobox.open = true))
}

export { mount }
```

Type, choose, or use the buttons. The console logs each value, query and open change with its reason.

## Controller

Use the element’s `api` property. It can read or set the value and query, open or close the list, and focus the input. `open()` resolves when the list closes with its reason and source, including `unmount`; pass an abort signal to close it on cancellation. [Controllers](../controllers.md) covers lifetime and setup.

```ts title="controller.ts"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"
import { log } from "./log"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-action="open">Open and Wait</button>
        <button type="button" data-action="search">Search “sw”</button>
        <button type="button" data-action="germany">Choose Germany</button>
        <button type="button" data-action="clear">Clear</button>
      </div>
      <ui-combobox>
        <div data-slot="stack">
          <ui-combobox-label>Country</ui-combobox-label>
          <div data-slot="row">
            <ui-combobox-input>
              <input placeholder="Search countries…" />
            </ui-combobox-input>
            <ui-combobox-trigger>
              <button aria-label="Show countries">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
            </ui-combobox-trigger>
          </div>
        </div>
        <ui-combobox-content hidden>
          <ui-combobox-empty>No countries found.</ui-combobox-empty>
          <ui-combobox-list>
            ${countries
              .map(
                (item) => `
                  <ui-combobox-item value="${item.value}" label="${item.label}">
                    ${item.label}
                    <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                  </ui-combobox-item>
                `
              )
              .join("")}
          </ui-combobox-list>
        </ui-combobox-content>
      </ui-combobox>
    </div>
  `
  const combobox = root.querySelector("ui-combobox")!
  combobox.itemToLabel = (value) => countryLabel(value as string)
  const country = combobox.api
  const actions: Record<string, () => void> = {
    open: async () => {
      const { reason } = await country.open()
      log(root, `Closed by ${reason}, with ${country.getValue() ?? "nothing"}`)
    },
    search: () => {
      country.focus()
      country.setQuery("sw")
      country.open()
    },
    germany: () => country.setValue("de"),
    clear: () => country.clear(),
  }
  for (const button of root.querySelectorAll<HTMLElement>("[data-action]")) {
    button.addEventListener("click", () => actions[button.dataset.action!]())
  }
}

export { mount }
```

Use the buttons to drive the combobox from outside. Open and Wait logs how the list closed and what was chosen.

## Positioning

`side` and `align` place the popup around the input or chips. `anchor` can use a different element, and `ui-combobox-arrow` follows the side chosen after collision handling. [Popups](../popups.md#place-the-content) covers offsets and available space.

The page stays usable by default. `modal="pointer"` makes an outside press only dismiss the list; `modal` also locks scrolling and makes the rest of the page inert. The popup uses the top layer and renders in place; use `container` when its DOM belongs elsewhere, such as a shadow root.

```ts title="positioning.ts"
import "@ui-sdk/web/checkbox"
import "@ui-sdk/web/combobox"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

const sides = [
  { value: "top", label: "Top" },
  { value: "right", label: "Right" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
]
const aligns = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
]

const select = (
  name: string,
  label: string,
  options: { value: string; label: string }[],
  value: string
) => `
  <ui-select data-control="${name}" default-value="${value}">
    <ui-select-label>${label}</ui-select-label>
    <ui-select-trigger>
      <button>
        <ui-select-value></ui-select-value>
        ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
      </button>
    </ui-select-trigger>
    <ui-select-content hidden>
      ${options
        .map(
          (option) => `
            <ui-select-item value="${option.value}">
              ${option.label}
              <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
            </ui-select-item>
          `
        )
        .join("")}
    </ui-select-content>
  </ui-select>
`

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        ${select("side", "Side", sides, "bottom")}
        ${select("align", "Align", aligns, "start")}
        <label data-slot="label">
          <ui-checkbox>
            <ui-checkbox-indicator>
              ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
            </ui-checkbox-indicator>
          </ui-checkbox>
          Anchor to the box
        </label>
      </div>
      <div id="combobox-positioning-box" data-slot="card">
        <ui-combobox>
          <ui-combobox-input>
            <input aria-label="Framework" placeholder="Framework" />
          </ui-combobox-input>
          <ui-combobox-content hidden side="bottom" align="start" side-offset="10" align-offset="0" collision-padding="16">
            <ui-combobox-empty>No frameworks found.</ui-combobox-empty>
            <ui-combobox-list>
              ${frameworks
                .map(
                  (framework) => `
                    <ui-combobox-item value="${framework.value}" label="${framework.label}">
                      ${framework.label}
                      <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                    </ui-combobox-item>
                  `
                )
                .join("")}
            </ui-combobox-list>
          </ui-combobox-content>
        </ui-combobox>
      </div>
    </div>
  `
  const content = root.querySelector("ui-combobox-content")!
  for (const control of root.querySelectorAll("ui-select")) {
    control.addEventListener("valuechange", (event) => {
      if (event.detail.value) {
        content.setAttribute(
          control.dataset.control!,
          String(event.detail.value)
        )
      }
    })
  }
  root
    .querySelector("ui-checkbox")!
    .addEventListener("checkedchange", (event) => {
      if (event.detail.value === true) {
        content.setAttribute("anchor", "#combobox-positioning-box")
      } else {
        content.removeAttribute("anchor")
      }
    })
}

export { mount }
```

Pick a side and an alignment, then open the list. Check Anchor to the Box to place it against the box instead of the input.

## Animation

The content has `data-starting-style` while it opens and `data-ending-style` while it closes. Transition from those states, and the popup stays mounted until the exit finishes. The `openchangecomplete` event fires after opening or closing finishes, and `keep-mounted` on an item indicator keeps it in the page for a selection animation.

```css
[data-slot="combobox-content"] {
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
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"
import { log } from "./log"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox>
      <div data-slot="stack">
        <ui-combobox-label>Framework</ui-combobox-label>
        <div data-slot="row">
          <ui-combobox-input>
            <input placeholder="Select a framework" />
          </ui-combobox-input>
          <ui-combobox-trigger>
            <button aria-label="Show frameworks">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No frameworks found.</ui-combobox-empty>
        <ui-combobox-list>
          ${frameworks
            .map(
              (framework) => `
                <ui-combobox-item value="${framework.value}" label="${framework.label}">
                  ${framework.label}
                  <ui-combobox-item-indicator keep-mounted>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                </ui-combobox-item>
              `
            )
            .join("")}
        </ui-combobox-list>
      </ui-combobox-content>
    </ui-combobox>
  `
  root
    .querySelector("ui-combobox")!
    .addEventListener("openchangecomplete", (event) =>
      log(root, event.detail.value ? "Finished opening" : "Finished closing")
    )
}

export { mount }
```

Open and close the list. The console logs when each animation finishes.

## Presentation

Use `presentation="sheet"` for a sheet, or `"auto"` to choose a sheet on small touch screens each time the list opens. The input moves into the sheet’s header; there is still one input and one query.

A touch opening leaves the keyboard closed. Tapping the header input opens the keyboard and grows the sheet; closing the keyboard keeps the query. Choosing an item closes the sheet unless `multiple` is set. Swiping down closes it with the reason `swipe`.

Keep the options inside `ui-combobox-list` so the header stays outside the listbox. Give sheet content a height, style it with `data-presentation`, and leave its `translate` for the sheet behavior. `--sheet-backdrop` controls the backdrop. The sheet is modal unless you set `modal` to false; mouse and keyboard openings keep input focus as it moves.

```ts title="presentation.ts"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox presentation="sheet">
      <div data-slot="stack">
        <ui-combobox-label>Framework</ui-combobox-label>
        <div data-slot="row">
          <ui-combobox-input>
            <input placeholder="Select a framework" />
          </ui-combobox-input>
          <ui-combobox-trigger>
            <button aria-label="Show frameworks">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No frameworks found.</ui-combobox-empty>
        <ui-combobox-list>
          ${frameworks
            .map(
              (framework) => `
                <ui-combobox-item value="${framework.value}" label="${framework.label}">
                  ${framework.label}
                  <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                </ui-combobox-item>
              `
            )
            .join("")}
        </ui-combobox-list>
      </ui-combobox-content>
    </ui-combobox>
  `
}

export { mount }
```

Open the field to see a sheet. On touch, tap the search field in its header to bring up the keyboard, or swipe down to close it.

## Forms

A combobox submits the selected value under `name`, rather than the query text. Multiple values submit as separate entries. `required` prevents empty submissions, reset restores the default selection and its label, and `form` joins a form from elsewhere on the page.

The custom element joins the form once its definition loads. [Forms](../forms.md) covers the shared integration.

In a [`ui-field`](./field.md), the field supplies the input's accessible name, description and error. Submitting a required field without a selection sets `aria-invalid` and `data-invalid`.

```ts title="form.ts"
import "@ui-sdk/web/combobox"
import "@ui-sdk/web/field"
import { Check, ChevronDown, createElement, X } from "lucide"
import { log } from "./log"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

const interests = ["Design", "Engineering", "Marketing", "Research", "Sales"]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form data-slot="stack">
      <ui-field name="country">
        <ui-field-label>Country</ui-field-label>
        <ui-combobox required>
          <div data-slot="row">
            <ui-combobox-input>
              <input placeholder="Search countries…" />
            </ui-combobox-input>
            <ui-combobox-trigger>
              <button aria-label="Show countries">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
            </ui-combobox-trigger>
          </div>
          <ui-combobox-content hidden>
            <ui-combobox-empty>No countries found.</ui-combobox-empty>
            <ui-combobox-list>
              ${countries
                .map(
                  (country) => `
                    <ui-combobox-item value="${country.value}" label="${country.label}">
                      ${country.label}
                      <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                    </ui-combobox-item>
                  `
                )
                .join("")}
            </ui-combobox-list>
          </ui-combobox-content>
        </ui-combobox>
        <ui-field-description>Where we ship your order.</ui-field-description>
        <div>
          <ui-field-error match="valueMissing">Choose a country.</ui-field-error>
        </div>
      </ui-field>
      <ui-field name="interests">
        <ui-field-label>Interests</ui-field-label>
        <ui-combobox multiple default-value="Design">
          <ui-combobox-chips>
            <ui-combobox-input>
              <input placeholder="Add interests…" />
            </ui-combobox-input>
          </ui-combobox-chips>
          <ui-combobox-content hidden>
            <ui-combobox-list>
              ${interests
                .map(
                  (interest) => `
                    <ui-combobox-item value="${interest}">
                      ${interest}
                      <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
                    </ui-combobox-item>
                  `
                )
                .join("")}
            </ui-combobox-list>
          </ui-combobox-content>
          <template>
            <ui-combobox-chip>
              <ui-combobox-chip-remove>
                <button type="button">${createElement(X, { "aria-hidden": "true" }).outerHTML}</button>
              </ui-combobox-chip-remove>
            </ui-combobox-chip>
          </template>
        </ui-combobox>
      </ui-field>
      <div data-slot="row">
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  `
  root.querySelector("ui-combobox")!.itemToLabel = (value) =>
    countryLabel(value as string)
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

Submit without a country to see the inline error. Choose one and submit; the console logs the values, and Reset restores the defaults.

## Custom Rendering

Elements have no render functions. Put your own markup around and inside them, style them from their attributes, and watch those attributes to change what's inside: here the trigger's button swaps its chevron on `data-open`, and each item shows a check or Enter from `data-selected` and `data-highlighted`. Each element's state is listed [below](#state).

```ts title="custom-rendering.ts"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, ChevronUp, createElement, Search } from "lucide"

const users = [
  { id: 1, name: "Hollis Grant", username: "hollis", role: "Owner" },
  { id: 2, name: "Inès Moreau", username: "ines", role: "Admin" },
  { id: 3, name: "Kofi Mensah", username: "kofi", role: "Member" },
  { id: 4, name: "Wren Takahashi", username: "wren", role: "Member" },
  { id: 5, name: "Tomasz Wójcik", username: "tomasz", role: "Guest" },
]

const chevron = (open: boolean) =>
  createElement(open ? ChevronUp : ChevronDown, { "aria-hidden": "true" })
    .outerHTML

const mark = (item: Element) =>
  item.hasAttribute("data-selected")
    ? createElement(Check, { "aria-hidden": "true" }).outerHTML
    : item.hasAttribute("data-highlighted")
      ? `<kbd data-slot="kbd">Enter</kbd>`
      : ""

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox>
      <div data-slot="stack">
        <ui-combobox-label>Assignee</ui-combobox-label>
        <div data-slot="row">
          <div data-slot="row">
            ${createElement(Search, { "aria-hidden": "true" }).outerHTML}
            <ui-combobox-input>
              <input placeholder="Search people…" />
            </ui-combobox-input>
          </div>
          <ui-combobox-trigger>
            <button aria-label="Show people">${chevron(false)}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No one by that name.</ui-combobox-empty>
        <ui-combobox-list>
          ${users
            .map(
              (user) => `
                <ui-combobox-item value="${user.username}" label="${user.name}" keywords="${user.username}">
                  <span data-slot="badge">${user.name.slice(0, 1)}</span>
                  <span data-slot="stack">
                    ${user.name}
                    <span data-slot="hint">@${user.username}</span>
                  </span>
                </ui-combobox-item>
              `
            )
            .join("")}
        </ui-combobox-list>
      </ui-combobox-content>
    </ui-combobox>
  `
  const update = (el: Element) => {
    if (el.localName === "button") {
      el.innerHTML = chevron(el.hasAttribute("data-open"))
    }
    if (el.localName !== "ui-combobox-item") {
      return
    }
    el.querySelector(":scope > svg, :scope > kbd")?.remove()
    el.insertAdjacentHTML("beforeend", mark(el))
  }
  const observer = new MutationObserver((records) =>
    records.forEach((record) => update(record.target as Element))
  )
  observer.observe(root.querySelector("ui-combobox-trigger")!, {
    subtree: true,
    attributeFilter: ["data-open"],
  })
  observer.observe(root.querySelector("ui-combobox-list")!, {
    subtree: true,
    attributeFilter: ["data-selected", "data-highlighted"],
  })
}

export { mount }
```

Open the list and move through it. The chevron flips while it's open, the highlighted person shows Enter, and the chosen one shows a check.

## Styling

Each element has a `data-slot`, such as `combobox-content`, and shows its state through the attributes listed under [Data Attributes](#data-attributes).

Use `data-highlighted` for the active option and `data-selected` for chosen values. Because the keyboard highlight usually moves without focus leaving the input, use the content's `data-modality="keyboard"` to style it. Real focus can move into the list for touch screen readers or into the sheet.

`--anchor-width` follows the input or chips. `--available-height` doesn't inherit: when a nested scroller needs it, copy it to a custom property on the content, such as `--list-height: var(--available-height)`, then use that property on the scroller.

### `<ui-combobox-content>`
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

### `<ui-combobox-viewport>`
- `--keyboard-inset`: While it presents as a sheet: how many pixels of the page the on-screen keyboard covers, 0 without one.
- `--visual-viewport-width`: While it presents as a sheet: the width of the part of the page you can see.
- `--visual-viewport-height`: While it presents as a sheet: the height of the part of the page you can see, above the keyboard.
- `--visual-viewport-top`: While it presents as a sheet: how far the part of the page you can see is scrolled from the top of the layout, as when the keyboard pushes it up.

## Data Attributes

### `<ui-combobox-label>`
`[data-slot="combobox-label"]`

- `data-disabled`: Present when the combobox is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the combobox is read-only.
- `data-required`: Present when the combobox is required.

### `<ui-combobox-input>`
`[data-slot="combobox-input"]`

- `data-closed`: Present while the list is closed, including while it animates out.
- `data-open`: Present while the list is open.
- `data-disabled`: Present when the combobox is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the combobox is read-only.
- `data-required`: Present when the combobox is required.

### `<ui-combobox-trigger>`
`[data-slot="combobox-trigger"]`

- `data-closed`: Present while the list is closed, including while it animates out.
- `data-open`: Present while the list is open.
- `data-disabled`: Present when the combobox is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the combobox is read-only.
- `data-required`: Present when the combobox is required.

### `<ui-combobox-clear>`
`[data-slot="combobox-clear"]`

- `data-disabled`: Present when the combobox is disabled or read-only.

### `<ui-combobox-chips>`
`[data-slot="combobox-chips"]`

- `data-disabled`: Present when the combobox is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the combobox is read-only.
- `data-required`: Present when the combobox is required.

### `<ui-combobox-content>`
`[data-slot="combobox-content"]`

- `data-closed`: Present while the list is closed, including while it animates out.
- `data-presentation` (`popover`, `sheet`): How the list presents this time it's open.
- `data-open`: Present while the list is open.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the list animates out. Style the state you animate to.
- `data-modality` (`keyboard`, `pointer`): Whether the keyboard or a pointer moves the highlight. Style a focus ring for the keyboard only.
- `data-has-icons`: Present while any item inside holds an icon part, so items without one can line up.

### `<ui-combobox-item>`
`[data-slot="combobox-item"]`

- `data-selected`: Present on selected items, and on the check inside them.
- `data-disabled`: Present when the item can't be chosen, or `maxSelected` is reached.
- `data-highlighted`: Present on the highlighted item. Focus stays in the input.
- `data-has-icon`: Present on an item while it holds an icon part.

### `<ui-combobox-item-text>`
`[data-slot="combobox-item-text"]`

- `data-matched`: Present on an item's text while the input's text matched part of it, which is marked.

### `<ui-combobox-item-indicator>`
`[data-slot="combobox-item-indicator"]`

- `data-selected`: Present on selected items, and on the check inside them.

### `<ui-combobox-empty>`
`[data-slot="combobox-empty"]`

- `data-loading`: Present while results load, with `status="loading"`.
- `data-empty`: Present while no item matches.

### `<ui-combobox-status>`
`[data-slot="combobox-status"]`

- `data-loading`: Present while results load, with `status="loading"`.

### `<ui-combobox-arrow>`
`[data-slot="combobox-arrow"]`

- `data-closed`: Present while the list is closed, including while it animates out.
- `data-open`: Present while the list is open.

### `<ui-combobox-item-icon>`
`[data-slot="combobox-item-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

### `<ui-combobox-chip>`
`[data-slot="combobox-chip"]`

- `data-value` (`a`): The chip's value, as the string it submits as.
- `data-disabled`: Present when the combobox is disabled or read-only, so the chip can't be removed.

### `<ui-combobox-chip-remove>`
`[data-slot="combobox-chip-remove"]`

- `data-disabled`: Present when the combobox is disabled or read-only.

### `<ui-combobox-select-all>`
`[data-slot="combobox-select-all"]`

- `data-disabled`: Present when nothing the select-all option covers can be chosen, or choosing them all would pass `maxSelected`.
- `data-unchecked`: Present on a select-all option while none of its items is selected.
- `data-highlighted`: Present on the highlighted item. Focus stays in the input.

### `<ui-combobox-create>`
`[data-slot="combobox-create"]`

- `data-highlighted`: Present while the create option is highlighted.
- `data-pending`: Present while the Promise `onCreate` returned is running.

## API Reference

Props are attributes in kebab case, like `default-value`, `max-selected` and `auto-highlight`: `"false"` is false, and numbers are numbers. `filter` takes `contains`, `startsWith` or `false`. `items`, a `filter` function, `itemToValue`, `itemToLabel` and `isItemEqualToValue` are properties. `container` and `anchor` take CSS selectors. Callbacks are DOM events.

### Combobox

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `query?` (`string`): The input's text, which filters the list. Pass it to control it. Choosing an item sets it to the item's label, or empties it with `multiple`.
- `defaultQuery?` (`string`): The input's text at first, when uncontrolled. Defaults to the selected item's label.
- `querychange event`: Runs when the input's text wants to change: typing, choosing an item, or closing with text that wasn't chosen.
- `open?` (`boolean`): Whether the list is open. Pass it to control it.
- `defaultOpen?` (`boolean`): Whether the list starts open, when uncontrolled.
- `openchange event`: Runs when the list wants to open or close. `details.reason` says why, and `details.cancel()` stops it.
- `openchangecomplete event`: Runs once the list has finished opening or closing, after any animation.
- `maxSelected?` (`number`): With `multiple`, how many items can be selected. Once reached, the other items are disabled.
- `items?` (`ListData<T>`): The items as data. Renders the list for you, and filters it without rendering every item.
- `emptyItems?` (`ListData<T>`): Items shown instead of `items` while the input is empty, like recent choices or suggestions. Groups work, like `{ type: "group", label: "Recent", items }`. Needs `items`.
- `filter?` (`ListFilter<T>`): How typing narrows the list: `"contains"`, `"startsWith"`, a function of the item and the text, whose numeric result also sorts data items, or `false` to keep every item, for results a server already filtered.
- `itemToValue?` (`((value: T) => string)`): The string an item's value submits as and is identified by, for object values. Strings pass through, and objects use their `value` or `id`.
- `itemToLabel?` (`((value: T) => string)`): The text a value shows, for values whose item isn't rendered, like async results.
- `isItemEqualToValue?` (`((itemValue: T, value: T) => boolean)`): Whether an item's value is the selected value, for object values that aren't the same object.
- `autoHighlight?` (`"always" | boolean`): Whether the first matching item is highlighted while typing, so Enter chooses it. `"always"` also highlights the selected item, or the first, when the list opens, so arrows move from there.
- `keepQuery?` (`boolean`): With `multiple`, whether the input keeps its text after an item is chosen.
- `pendingAnnouncement?` (`string`): What screen readers hear once the Create part's `create` has been pending for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `allowCustomValue?` (`boolean`): Whether text that matches no item becomes the value, when Enter is pressed with nothing highlighted, or, without `multiple`, when the list closes. The value is the text itself.
- `status?` (`AsyncOptionsStatus`): Whether results are loading or failed, for the status and empty parts. Sets `aria-busy` on the list while loading.
- `highlight event`: Runs when the highlight moves, with the item's index among the visible items, so a virtualized list can scroll to it.
- `loadmore event`: Runs when the highlight or scrolling reaches the last item, so the next page can load, like `createAsyncOptions`'s `loadMore`. Not again for the same items, unless the last load failed.
- `announcement?` (`((change: ListAnnouncement) => string | null | undefined)`): What screen readers hear after typing pauses, when no `ComboboxStatus` is rendered, and when a chip is removed. Return null for nothing.
- `loop?` (`boolean`): Whether arrow keys wrap from the last item to the first.
- `modal?` (`"pointer" | boolean`): `false`: the page stays usable while the list is open. `"pointer"`: an outside press only closes the list. `true`: also locks scroll and makes the rest of the page inert.
- `presentation?` (`PresentationSetting<"popover">`): How the list presents. `"sheet"` slides it up from the bottom of the screen with the input in its header, where it can be swiped away, and `"auto"` does that on small touch screens. A tap that opens a sheet leaves the keyboard closed until the input in the header is tapped. Decided each time it opens; the server renders `"popover"` for `"auto"`.
- `disabled?` (`boolean`): Disables the combobox like a native input: it can't be focused or changed, and the value isn't submitted.
- `readOnly?` (`boolean`): Keeps the combobox focusable and its value submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission until a value is selected, with the browser's own message.
- `name?` (`string`): The name the value submits under. Without one, the combobox submits nothing.
- `form?` (`string`): The id of a form to belong to, when the combobox isn't inside that form.
- `controller?` (`object`): Opens, closes, reads and sets the combobox from anywhere. Create one with `createComboboxController()`.
- `dismissible?` (`boolean`): Whether Escape, an outside press, focus or the window leaving, Android's back gesture and a sheet's swipe can close it. Triggers, Close parts and the controller always can. Pass `false` while it holds unsaved work, and ask in `dismissattempt`.
- `dismissattempt event`: Runs when `dismissible` refused a dismissal made on purpose: Escape, an outside press, back or a swipe. Focus or the window leaving is refused without it. Ask "Discard changes?" here.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.
- `multiple?` (`boolean`): Whether several items can be selected. The value is then a list, the list stays open as items toggle, and the input empties after each choice. Whether several items can be selected.
- `value?` (`T | T[] | null`): The selected value. Pass it to control the combobox. `null` selects nothing. The selected values. Pass it to control the combobox. The selected value, or values with `multiple`. Pass it to control the combobox.
- `defaultValue?` (`T | T[] | null`): The value selected at first, when uncontrolled. A form reset returns to it. The values selected at first, when uncontrolled. A form reset returns to them. The value or values selected at first, when uncontrolled. A form reset returns to it.
- `valuechange event`: Runs when a user, a form reset or a controller wants to change the value. `details.reason` says why, and `details.cancel()` stops it.

`announcement` receives `{ type: "results", count, query, loading }` or `{ type: "removed", label }` and returns the words, or `null` for silence. The default is English: "3 results", "No results", "Loading" or "France removed".

### ComboboxLabel

The input's visible label. `<ui-combobox-label>` labels the input.

### ComboboxInput

The text field that filters the list and shows the chosen label. `<ui-combobox-input>` wraps a native `input`.

### ComboboxTrigger

Opens and closes the list. `<ui-combobox-trigger>` wraps a native `button`, kept out of the tab order while the input sits beside it.

### ComboboxClear

- `keepMounted?` (`boolean`): Whether the clear button stays in the page while there's nothing to clear.

### ComboboxChips

Holds the chips and the input for a multiple selection. `<ui-combobox-chips>` renders a chip for each value.

### ComboboxValue

There's no `ui-combobox-value` element: `<ui-combobox-chips>` renders the chips, and the `value` property and `valuechange` event give you the selection for a summary.

### ComboboxChip

- `value` (`T`): The selected value this chip shows.

### ComboboxChipRemove

Removes its chip's value. `<ui-combobox-chip-remove>` wraps a native `button`. Takes the same props as `ComboboxChip`.

### ComboboxChipsOverflow

Turns collapsing on for the chips around it, and shows how many are hidden. `<ui-combobox-chips-overflow>` holds the count.

### ComboboxValueIcon

Shows the selected item's icon beside the input. It takes no props of its own, and no children.

### ComboboxContent

- `side?` (`Side`): Which side of the anchor the popup opens on. Flips to the other side when there isn't room. Which side of the input the list opens on.
- `align?` (`Align`): How the popup lines up with the anchor along that side. `start` and `end` follow the reading direction. How the list lines up with the input along that side.
- `sideOffset?` (`number`): Gap between the anchor and the popup, in pixels. Gap between the input and the list, in pixels.
- `alignOffset?` (`number`): Shift along the anchor, in pixels. Shift along the input, in pixels.
- `collisionPadding?` (`number`): Space to keep from the viewport edges, in pixels.
- `arrowPadding?` (`number`): Space to keep between the arrow and the popup's corners, in pixels.
- `anchor?` (`string | Anchor | null`): Positions the popup against this instead of its trigger: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. It's read on every check, so it can move. A controller's `open({ anchor })` wins for that open.
- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `keepMounted?` (`boolean`): Whether the list stays in the page, hidden, while closed.

### ComboboxArrow

Points from the popup to its anchor, following the side chosen after collision handling. `<ui-combobox-arrow>` is positioned on the content's edge.

### ComboboxStatus

Announces loading, errors and result counts. `<ui-combobox-status>` has the status role.

### ComboboxEmpty

Shows while no option matches. `<ui-combobox-empty>` stays hidden while there are matches.

### ComboboxList

Holds the options. `<ui-combobox-list>` has the listbox role.

### ComboboxSelectAll

Toggles every matching, enabled option in its group, or outside a group. `<ui-combobox-select-all>` has the option role.

### ComboboxGroup

Groups options under a label. `<ui-combobox-group>` has the group role.

### ComboboxGroupLabel

Names its group. `<ui-combobox-group-label>` labels the group.

### ComboboxItem

- `label?` (`string`): The text the input shows once chosen, and filtering matches, when the content isn't plain text. Not the accessible name: use `aria-label` for that.
- `keywords?` (`string[]`): More words filtering matches.
- `disabled?` (`boolean`): Keeps the item from being chosen. The keyboard and the pointer skip it. Sets `data-disabled` and `aria-disabled`.
- `index?` (`number`): The item's position among all visible items, for virtualized lists that render only some. Sets `aria-posinset` and `aria-setsize`.
- `value` (`T`): What the value becomes when the item is chosen. A string, or any value with `itemToValue`.

### ComboboxItemIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

### ComboboxItemText

Shows its item's label, and marks what matched the query in `<mark>`. `<ui-combobox-item-text>` holds text only.

### ComboboxItemIndicator

- `keepMounted?` (`boolean`): Whether the indicator stays in the page while its item isn't selected.

### ComboboxSeparator

Separates options or groups. `<ui-combobox-separator>` has the separator role.

### ComboboxCreate

- `create event`: Runs with the input's text when the create option is chosen. It doesn't change the value by itself. Return a Promise to mark the option pending until it settles; the list closes (or the input empties, with `multiple`) once it resolves.
- `minLength?` (`number`): How many characters the text needs before the option shows.

### Items as Data

Each item in `items`. Groups are `{ type: "group", label, items }` and separators `{ type: "separator" }`.

- `value` (`T`): Identifies the item, and is what choosing it reports. A string, or any value with `itemToValue`.
- `label` (`string`): The text shown and matched by typeahead and filtering. A select's trigger shows it once chosen.
- `keywords?` (`string[]`): More words filtering matches, like `["team"]` for a plan called Pro.
- `disabled?` (`boolean`): Keeps the item from being chosen. The keyboard skips it, like in a native select.

The whole array is a `ListData`, or `ListData<Item>` when values are objects.

### Async Options

[Async Options](../utilities/async-options.md) covers loading, paging, and retries.

### State

The same state shows as data attributes on each element.

`ComboboxInput`:

- `open` (`boolean`): Whether the list is open.
- `disabled` (`boolean`): Whether the combobox is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the combobox keeps its value but refuses changes, from its `readOnly` option.
- `required` (`boolean`): Whether a value must be selected before the form submits, from its `required` option.

`ComboboxTrigger`:

- `open` (`boolean`): Whether the list is open.
- `disabled` (`boolean`): Whether the combobox is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the combobox keeps its value but refuses changes, from its `readOnly` option.
- `required` (`boolean`): Whether a value must be selected before the form submits, from its `required` option.

`ComboboxContent` and `ComboboxList`:

- `open` (`boolean`): Whether the list is open. False while it animates out.
- `presentation` (`"popover" | "sheet"`): How it presents this time it's open.
- `multiple` (`boolean | undefined`): Whether several items can be selected.
- `status` (`AsyncOptionsStatus`): Whether results are loading or failed.
- `items` (`ListData<unknown>`): The visible items, for rendering a virtualized list yourself.

`ComboboxItem`:

- `highlighted` (`boolean`): Whether the item is highlighted, by the keyboard or the pointer.
- `selected` (`boolean`): Whether its value is in the combobox's value, compared with `isItemEqualToValue` when you pass one.
- `disabled` (`boolean`): Whether the item can't be chosen, by itself or because `maxSelected` is reached.
- `maxReached` (`boolean`): Whether `maxSelected` is reached and the item isn't selected, which is why it's disabled.

`ComboboxItemIndicator`:

- `selected` (`boolean`): Whether its item is selected. While false, the indicator isn't shown unless `keepMounted` is set.

`ComboboxItemIcon`:

- `mirror` (`boolean`): Whether it flips in right-to-left text.

`ComboboxCreate`:

- `query` (`string`): The text the option would create.
- `highlighted` (`boolean`): Whether the option is highlighted.
- `pending` (`boolean`): Whether `onCreate`'s Promise is running.
- `error` (`unknown`): Why the last `onCreate` failed, until the next try.

`ComboboxEmpty`:

- `loading` (`boolean`): Whether results are loading.
- `empty` (`boolean`): Whether no item matches.
- `query` (`string`): The text the list is filtered by.

`ComboboxStatus`:

- `status` (`"idle" | "loading" | "error"`): Whether results are loading or failed.
- `loading` (`boolean`): Whether results are loading.
- `count` (`number`): How many items are visible.

`ComboboxValue`:

- `value` (`unknown`): The selected value: one, `null`, or a list with `multiple`.
- `labels` (`string[]`): Each selected item's label, in the order they were selected.
- `label` (`string`): The labels joined with commas, or with `maxLabels`, as a list in the page's language, like "France, Chile and 2 more". An empty string for none.

`ComboboxChip`:

- `value` (`unknown`): The selected value the chip stands for, from its `value` prop.
- `label` (`string`): The text for the value: from `itemToLabel`, its item's label, or the value itself.
- `disabled` (`boolean`): Whether the combobox is disabled or read-only, so the chip can't be removed.

`ComboboxClear` and `ComboboxChipRemove`:

- `disabled` (`boolean`): Whether the combobox is disabled or read-only.

`ComboboxArrow`:

- `open` (`boolean`): Whether the list is open.

`ComboboxItemText`:

- `segments` (`MatchSegment[]`): The text in pieces, each marked when it matched. Joined, they're the whole text.
- `matched` (`boolean`): Whether any piece matched.

`ComboboxSelectAll`:

- `checked` (`boolean`): Whether every item it covers is selected.
- `indeterminate` (`boolean`): Whether some of its items are selected, but not all.
- `highlighted` (`boolean`): Whether it's highlighted, by the keyboard or the pointer.
- `disabled` (`boolean`): Whether it can't be used: nothing it covers can be chosen, or choosing them all would pass `maxSelected`.

`ComboboxChipsOverflow`:

- `count` (`number`): How many chips don't fit and are hidden.
- `labels` (`string[]`): The labels of the hidden chips.

### Reasons

`event.detail.reason` says why the value changed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `clear-press` (`MouseEvent | KeyboardEvent`): A Clear part was pressed, like on an input, a select or a combobox.
- `remove-press` (`MouseEvent | KeyboardEvent`): A chip's remove part was pressed, or Backspace or Delete removed a chip or a span.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

Why the text changed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `clear-press` (`MouseEvent | KeyboardEvent`): A Clear part was pressed, like on an input, a select or a combobox.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `reset` (`none`): A form reset.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `focus-out` (`KeyboardEvent | FocusEvent`): Focus left the layer, or Tab moved it out.
- `window-blur` (`FocusEvent`): The window lost focus.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.

And why the list opened or closed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `outside-press` (`MouseEvent`): A press outside the layer.
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

Every write method takes an optional `{ reason, event }`, which the change event carries.

- `isOpen()` (`() => boolean`): Whether the list is open.
- `setOpen(open, options?)` (`(open: boolean, options?: ComboboxChangeOptions<ComboboxOpenChangeReason> | undefined) => boolean`): Opens or closes the list. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (ComboboxChangeOptions<ComboboxOpenChangeReason> & { signal?: AbortSignal | undefined; }) | undefined) => Promise<...>`): Opens the list, and resolves once it closes, with why and how. Resolves exactly once and never rejects: on the next close from any source, when `signal` aborts, or with reason `"unmount"` when the combobox leaves the page.
- `close(options?)` (`(options?: ComboboxChangeOptions<ComboboxOpenChangeReason> | undefined) => boolean`): Closes the list. Returns false when the close was canceled or it was already closed.
- `toggle(options?)` (`(options?: ComboboxChangeOptions<ComboboxOpenChangeReason> | undefined) => boolean`): Opens the list when it's closed, and closes it when it's open. Returns false when the change was canceled.
- `getValue()` (`() => ComboboxValue<T, Multiple>`): The selected value.
- `setValue(value, options?)` (`(value: ComboboxValue<T, Multiple>, options?: ComboboxChangeOptions<ComboboxValueChangeReason> | undefined) => boolean`): Selects a value, as a user would. A disabled or read-only combobox ignores it. Returns false when the change was canceled or nothing changed.
- `clear(options?)` (`(options?: ComboboxChangeOptions<ComboboxValueChangeReason> | undefined) => boolean`): Selects nothing and empties the input. Returns false when the change was canceled or nothing changed.
- `getQuery()` (`() => string`): The input's text.
- `setQuery(query, options?)` (`(query: string, options?: ComboboxChangeOptions<ComboboxQueryChangeReason> | undefined) => boolean`): Changes the input's text, which filters the list. Returns false when the change was canceled or nothing changed.
- `focus()` (`() => void`): Moves focus to the input.

### Events

Events fire on their own element and don't bubble, with the new state in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` on a change event cancels it.

| Member                     | On            | Description                                                          |
| -------------------------- | ------------- | -------------------------------------------------------------------- |
| `value` property           | `ui-combobox` | The selected value. Setting it selects, as a controller would        |
| `query` property           | `ui-combobox` | The input's text                                                     |
| `open` property, attribute | `ui-combobox` | Whether the list is open. The attribute sets where it starts         |
| `api` property             | `ui-combobox` | The [controller](#controller-1)                                      |
| `valuechange` event        | `ui-combobox` | `detail: { value, reason, event, source }`                           |
| `querychange` event        | `ui-combobox` | `detail: { value: query, reason, event, source }`                    |
| `openchange` event         | `ui-combobox` | `detail: { value: open, reason, event, source }`                     |
| `openchangecomplete` event | `ui-combobox` | `detail: { value: open }`, after the animation                       |
| `highlight` event          | `ui-combobox` | `detail: { value, index, event }`                                    |
| `loadmore` event           | `ui-combobox` | When the last item is reached                                        |
| `create` event             | `ui-combobox` | `detail: { value: query, waitUntil(promise) }`, from the create part |
| `dismissattempt` event     | `ui-combobox` | `detail: { reason, event }`, when a dismissal was refused            |

## Accessibility

The combobox follows the [WAI-ARIA combobox pattern with list autocomplete](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/). Focus usually stays in the input while `aria-activedescendant` identifies the highlighted option. A touch screen-reader trigger can move real focus into the list, and a sheet has its own [focus behavior](#presentation). Every line below is an automated test.

### Keyboard

| Key                   | Does                                                                  |
| --------------------- | --------------------------------------------------------------------- |
| Typing                | Filters the options and opens the list                                |
| ArrowDown, ArrowUp    | Opens the list, then moves the highlight. Wraps unless `loop="false"` |
| Enter                 | Chooses the highlighted option                                        |
| Escape                | Closes the list, then restores the selection's label                  |
| Backspace             | In an empty input with chips, removes the last chip                   |
| ArrowLeft, ArrowRight | Moves between chips, reversed in right-to-left text                   |

### Tested Behavior

**Input**

- Is a combobox named by its label, with list autocomplete.
- Typing opens the list with the items that match.
- Matching ignores case and accents.
- ArrowDown opens the list.
- Choosing with the keyboard leaves the caret after the text.
- Points to the list it controls while open.

**Highlight**

- Arrow keys move the highlight while focus stays in the input.
- Arrow keys skip disabled items.
- Moving over a disabled item leaves the highlight where it was.
- The highlighted option has the id aria-activedescendant names.

**AutoHighlight**

- The first match is highlighted from the first keystroke, so Enter chooses it.
- A disabled match is passed over.

**Choosing**

- Enter chooses the highlighted item, puts its label in the input and closes.
- Clicking an item chooses it and keeps focus in the input.
- A disabled item can't be chosen.
- After choosing, opening again shows every item with the chosen one selected.
- A canceled choice closes the list and keeps the value's label in the input.
- Text that matches nothing shows the empty message.

**Closing**

- Escape closes the list and keeps focus in the input.
- Escape after deleting the text brings back the value and its label.
- Leaving after deleting the text keeps the value empty.
- Clicking outside closes the list.
- Tab closes the list and moves on.

**Trigger and clear**

- The trigger button opens and closes the list.
- Clear empties the input and the value.

**Default value**

- Shows its label in the input.

**Multiple**

- Choosing adds a chip and empties the input.
- A canceled choice adds no chip and keeps the text.
- Backspace in an empty input removes the last chip.
- A chip's remove button removes its value.

**Groups**

- Items sit in groups named by their labels, and empty groups hide while filtering.

**Forms**

- The form submits the value under the combobox's name.
- Several values submit under one name.
- A required combobox blocks submission until a value is chosen.
- A disabled combobox can't be focused.
- A disabled fieldset disables the combobox and leaves it out of the form.

**Async**

- Results load for the text, with the list kept while loading.
- The chosen item's label survives results that don't include it.

Runs in React, Vue and web components.

Long lists stay fast and announce their size:

**Virtualized**

- Renders only the rows in view, each with its place in the whole list.
- Arrow keys reach items that weren't rendered, and the active descendant follows.
- Filtering covers every item, rendered or not.

Runs in React.

Also tested:

**Enhancements**

- The list is named by the combobox's label.
- Filtering matches an item's keywords as well as its label.
- A create option offers the text, and hides when an item's label matches it exactly.
- Enter on the create option calls onCreate with the text.
- A create option is pending while onCreate's Promise runs.
- With multiple, the list stays open after choosing.
- MaxSelected disables the other items once reached.
- Arrow keys move between chips, and Backspace on one removes it.
- The chips are a toolbar named by the combobox's label.
- Web chips follow a label that changes after they rendered. Web components only.
- Enter on the trigger opens the list as the keyboard did.
- ArrowDown on the trigger opens the list at its first item.
- The content says whether the keyboard or a pointer is in use, while focus stays in the input.
- A form reset returns the combobox to its default value and label.
- Arrow keys keep the highlighted item in view when the … scrolls.

Runs in React, Vue and web components.

Rows people rebuild, here and in Select:

**Items shown while nothing is typed**

- A combobox shows its recent items, as a group, until the user types.
- An autocomplete shows recent searches while the field is empty.

**Select all**

- Selects every item that can be chosen, then clears them, and says which with aria-checked.
- Is mixed while some are selected.
- Covers only the items the text matches.
- Is reached with the arrow keys and chosen with Enter.
- In a group, it covers that group.
- A select's works the same, with real focus.

**Chips that collapse**

- Chips past the line hide, and a count says how many.
- Removing chips brings the hidden ones back, and the count goes.
- A value text lists two labels and counts the rest, in the page's language. React and Vue only.
- A select's value lists two labels and counts the rest.
- A web select value takes getMoreLabel as a property. Web components only.

**Loading more**

- Reaching the last item with the keyboard loads the next page.
- Scrolling to the end loads the next page, with a status while it does.
- The last page loads no more.

**Rows**

- A recent item is chosen like any other.
- Typing on a select never lands on it.

Runs in React, Vue and web components.

Match highlighting, here and in Autocomplete and Command:

**Combobox**

- Marks the part of each label the text matched.
- Marks keep the label's own case and accents while matching without them.
- An item matched by a keyword has nothing to mark.
- Marks go away when the text is cleared, and the label reads whole.

**Autocomplete**

- Marks the part of each suggestion the text matched.

**Command**

- Marks each letter a fuzzy match found, joining neighbours.
- Marks a whole match at a word start.

**Highlighting**

- The chosen label in the input shows every item unmarked.

Runs in React, Vue and web components.

Touch screen readers and announcements:

**A screen reader's tap moves real focus into the list**

- Autocomplete: tapping the trigger focuses the first suggestion, and Escape returns.
- Searchable select: tapping the trigger focuses the selected item, not the search field.

**Combobox**

- Tapping the trigger focuses the selected item, with no aria-activedescendant.
- Arrow keys move real focus, and choosing returns focus to the input.
- Escape closes the list and focus returns to the input.

**Announcements**

- How many items match is announced once typing pauses.
- Autocomplete and searchable select announce counts too.
- Removing a chip announces which.

**Touch screen readers and announcements**

- A tap on the input is for typing: focus stays there.
- A status part says it instead, so nothing is announced twice.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while filtering and choosing with a keyboard.

Runs in React, Vue and web components.
