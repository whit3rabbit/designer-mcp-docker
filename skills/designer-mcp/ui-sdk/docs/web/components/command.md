# Command

Search commands, run actions, and open pages of more choices.

Command puts a search field over a list of actions. The list stays open while someone searches. You can use it on its own, or put it in a dialog to build a command palette.

```ts title="demo.ts"
import "@ui-sdk/web/command"
import {
  Calculator,
  Calendar,
  createElement,
  CreditCard,
  Search,
  Settings,
  Smile,
  User,
} from "lucide"

const suggestions = [
  { value: "calendar", label: "Calendar", icon: Calendar },
  { value: "emoji", label: "Search Emoji", icon: Smile },
  {
    value: "calculator",
    label: "Calculator",
    icon: Calculator,
    disabled: true,
  },
]

const settings = [
  { value: "profile", label: "Profile", icon: User, shortcut: "mod+p" },
  { value: "billing", label: "Billing", icon: CreditCard, shortcut: "mod+b" },
  { value: "settings", label: "Settings", icon: Settings, shortcut: "mod+s" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-command>
      <div data-slot="row">
          ${createElement(Search, { "aria-hidden": "true" }).outerHTML}
          <ui-command-input>
            <input aria-label="Search commands" placeholder="Type a command or search…" />
          </ui-command-input>
      </div>
      <ui-command-empty>No results found.</ui-command-empty>
      <ui-command-list>
        <ui-command-group>
          <ui-command-group-label>Suggestions</ui-command-group-label>
          ${suggestions
            .map(
              (item) => `
                <ui-command-item value="${item.value}" ${item.disabled ? "disabled" : ""}>
                  <ui-command-item-icon>${createElement(item.icon, { "aria-hidden": "true" }).outerHTML}</ui-command-item-icon>
                  <span>${item.label}</span>
                </ui-command-item>
              `
            )
            .join("")}
        </ui-command-group>
        <ui-command-separator></ui-command-separator>
        <ui-command-group>
          <ui-command-group-label>Settings</ui-command-group-label>
          ${settings
            .map(
              (item) => `
                <ui-command-item value="${item.value}" shortcut="${item.shortcut}">
                  <ui-command-item-icon>${createElement(item.icon, { "aria-hidden": "true" }).outerHTML}</ui-command-item-icon>
                  <span>${item.label}</span>
                  <ui-command-shortcut></ui-command-shortcut>
                </ui-command-item>
              `
            )
            .join("")}
        </ui-command-group>
      </ui-command-list>
    </ui-command>
  `
}

export { mount }
```

Type “bil” to find Billing. Arrow keys move the highlight; Escape clears the search.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the element definitions once in your application:

```ts
import "@ui-sdk/web/command"
```

## Composition

Use the following composition to build a `ui-command`:

```text
ui-command
├── ui-command-input
│   └── input
├── ui-command-empty
└── ui-command-list
    ├── ui-command-item
    └── ui-command-item
```

Give the input an accessible name and each command a unique value. `ui-command-input` wraps a native input. Keep empty and status messages outside the list, which holds commands and groups. The `action` event reports the value of the command that ran in `event.detail.value`; use it to perform the action.

Use `ui-command-group` and `ui-command-group-label` to name related commands, with a `ui-command-separator` between groups. Groups and separators disappear when filtering leaves them empty.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/command"
</script>

<ui-command>
  <ui-command-input><input aria-label="Search commands" /></ui-command-input>
  <ui-command-empty>No commands found.</ui-command-empty>
  <ui-command-list>
    <ui-command-item value="new-file">New file</ui-command-item>
    <ui-command-item value="new-folder">New folder</ui-command-item>
  </ui-command-list>
</ui-command>
```

## Build Your Own

`@ui-sdk/web/command` comes with ready-made `ui-command` elements. If you'd like to build your own, with your own element names, start from the `command` primitive in `@ui-sdk/core`:

```ts title="palette-elements.ts"
import { command } from "@ui-sdk/core/command"
import { createParts, wrappedChild } from "@ui-sdk/web"

createParts(command, {
  root: "command-palette",
  input: {
    tag: "palette-search",
    target: wrappedChild("input"),
    display: "contents",
  },
  empty: "palette-empty",
  list: "palette-list",
  item: "palette-action",
})
```

```html
<command-palette>
  <palette-search><input aria-label="Search actions" /></palette-search>
  <palette-empty>No actions found.</palette-empty>
  <palette-list>
    <palette-action value="new-file">New file</palette-action>
    <palette-action value="new-folder">New folder</palette-action>
  </palette-list>
</command-palette>
```

Each element keeps the behavior, state and data attributes of its ready-made counterpart: typing filters the commands, arrow keys move the highlight and Enter runs it. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Dialog

Put Command inside a [Dialog](./dialog.md) for a command palette. Give the dialog a title, put `shortcut="mod+k"` on its trigger, and close it when a command runs. The dialog handles dismissal and returns focus to the trigger.

```ts title="dialog.ts"
import "@ui-sdk/web/command"
import "@ui-sdk/web/dialog"
import {
  Calculator,
  Calendar,
  createElement,
  CreditCard,
  Search,
  Settings,
  Smile,
  User,
} from "lucide"
import { log } from "./log"

const commands = [
  { value: "calendar", label: "Calendar", icon: Calendar },
  { value: "emoji", label: "Search Emoji", icon: Smile },
  {
    value: "calculator",
    label: "Calculator",
    icon: Calculator,
    disabled: true,
  },
  { value: "profile", label: "Profile", icon: User },
  { value: "billing", label: "Billing", icon: CreditCard },
  { value: "settings", label: "Settings", icon: Settings },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-dialog>
        <ui-dialog-trigger shortcut="mod+k">
          <button>
            Search…
            <ui-dialog-shortcut></ui-dialog-shortcut>
          </button>
        </ui-dialog-trigger>
        <ui-dialog-backdrop hidden></ui-dialog-backdrop>
        <ui-dialog-content hidden>
          <ui-dialog-title>Command palette</ui-dialog-title>
          <ui-command>
            <div data-slot="row">
              ${createElement(Search, { "aria-hidden": "true" }).outerHTML}
              <ui-command-input>
                <input aria-label="Search commands" placeholder="Type a command or search…" />
              </ui-command-input>
            </div>
            <ui-command-empty>No results found.</ui-command-empty>
            <ui-command-list>
              <ui-command-group>
                <ui-command-group-label>Suggestions</ui-command-group-label>
                ${commands
                  .map(
                    (item) => `
                      <ui-command-item value="${item.value}" ${item.disabled ? "disabled" : ""}>
                        <ui-command-item-icon>${createElement(item.icon, { "aria-hidden": "true" }).outerHTML}</ui-command-item-icon>
                        ${item.label}
                      </ui-command-item>
                    `
                  )
                  .join("")}
              </ui-command-group>
            </ui-command-list>
          </ui-command>
        </ui-dialog-content>
      </ui-dialog>
    </div>
  `
  const dialog = root.querySelector("ui-dialog")!
  root.querySelector("ui-command")!.addEventListener("action", (event) => {
    log(root, `Ran ${event.detail.value}`)
    dialog.open = false
  })
}

export { mount }
```

Press Search or use Cmd+K / Ctrl+K. Choose a command to run it and close the palette; the console logs what ran.

## Shortcuts

An item’s `shortcut` can run it while the command list is mounted, even when the search or current page hides it. `ui-command-shortcut` displays the keys for the current platform, and the item gets `aria-keyshortcuts`. Shortcuts inside a dialog run while it is open.

```ts title="shortcuts.ts"
import "@ui-sdk/web/command"
import { createElement, CreditCard, Settings, User } from "lucide"
import { log } from "./log"

const settings = [
  { value: "profile", label: "Profile", icon: User, shortcut: "mod+p" },
  { value: "billing", label: "Billing", icon: CreditCard, shortcut: "mod+b" },
  { value: "settings", label: "Settings", icon: Settings, shortcut: "mod+s" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-command>
        <ui-command-input>
          <input aria-label="Search settings" placeholder="Search settings…" />
        </ui-command-input>
        <ui-command-list>
          <ui-command-group>
            <ui-command-group-label>Settings</ui-command-group-label>
            ${settings
              .map(
                (item) => `
                  <ui-command-item value="${item.value}" shortcut="${item.shortcut}">
                    <ui-command-item-icon>${createElement(item.icon, { "aria-hidden": "true" }).outerHTML}</ui-command-item-icon>
                    <span>${item.label}</span>
                    <ui-command-shortcut></ui-command-shortcut>
                  </ui-command-item>
                `
              )
              .join("")}
          </ui-command-group>
        </ui-command-list>
      </ui-command>
    </div>
  `
  root
    .querySelector("ui-command")!
    .addEventListener("action", (event) =>
      log(root, `Ran ${event.detail.value}`)
    )
}

export { mount }
```

Press Cmd+P / Ctrl+P to run Profile, even when the search hides it. The console logs each command that runs.

## Highlight Matches

`ui-command-item-text` marks the matched text. The default fuzzy filter can match letters that are apart, so one command may have several marked segments.

```ts title="highlight.ts"
import "@ui-sdk/web/command"
import {
  Calculator,
  Calendar,
  createElement,
  CreditCard,
  Search,
  Settings,
  Smile,
  User,
} from "lucide"

const commands = [
  { value: "calendar", label: "Calendar", icon: Calendar },
  { value: "emoji", label: "Search Emoji", icon: Smile },
  {
    value: "calculator",
    label: "Calculator",
    icon: Calculator,
    disabled: true,
  },
  { value: "profile", label: "Profile", icon: User },
  { value: "billing", label: "Billing", icon: CreditCard },
  { value: "settings", label: "Settings", icon: Settings },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-command>
      <div data-slot="row">
          ${createElement(Search, { "aria-hidden": "true" }).outerHTML}
          <ui-command-input>
            <input aria-label="Search commands" placeholder="Try “prf” or “emo”…" />
          </ui-command-input>
      </div>
      <ui-command-empty>No results found.</ui-command-empty>
      <ui-command-list>
        ${commands
          .map(
            (item) => `
              <ui-command-item value="${item.value}" ${item.disabled ? "disabled" : ""}>
                <ui-command-item-icon>${createElement(item.icon, { "aria-hidden": "true" }).outerHTML}</ui-command-item-icon>
                <ui-command-item-text>${item.label}</ui-command-item-text>
              </ui-command-item>
            `
          )
          .join("")}
      </ui-command-list>
    </ui-command>
  `
}

export { mount }
```

Type “prf” to find Profile. Matching letters are marked even when they are not next to each other.

## Filter and Keywords

`"fuzzy"` is the default: `nf` matches New file. `"contains"` and `"startsWith"` match the text itself. A custom function returns a boolean or a score; zero hides a command and higher scores rank first. Assign a function to the `filter` property.

Data commands are sorted by score. Commands written directly in markup keep their order, even though the best match can be highlighted.

`keywords` adds search terms without changing the command's label. Use it for synonyms or names someone might type instead.

```ts title="filter.ts"
import "@ui-sdk/web/command"
import "@ui-sdk/web/select"
import { Check, ChevronDown, createElement } from "lucide"

const commands = [
  { label: "Home" },
  { label: "Inbox", keywords: ["mail", "messages"] },
  { label: "Documents" },
  { label: "Downloads" },
  { label: "New file" },
  { label: "New folder" },
  { label: "Copy" },
  { label: "Paste" },
  { label: "Delete", keywords: ["remove", "trash"] },
  { label: "Zoom in" },
  { label: "Zoom out" },
  { label: "Search emoji", keywords: ["smiley", "face"] },
  { label: "Keyboard shortcuts", keywords: ["hotkeys"] },
  { label: "Settings", keywords: ["preferences"] },
]

const modes = [
  { value: "fuzzy", label: "Fuzzy" },
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts with" },
  { value: "words", label: "Words" },
]
type Mode = "fuzzy" | "contains" | "startsWith" | "words"

function words(item: { label: string }, query: string) {
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) =>
      item.label
        .toLowerCase()
        .split(" ")
        .some((part) => part.startsWith(word))
    )
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <ui-select default-value="fuzzy">
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
      <ui-command>
        <ui-command-input>
          <input aria-label="Search commands" placeholder="Try “nf”, “zo in” or “smiley”" />
        </ui-command-input>
        <ui-command-empty>No results found.</ui-command-empty>
        <ui-command-list>
          ${commands
            .map(
              (command) =>
                `<ui-command-item value="${command.label}"${command.keywords ? ` keywords="${command.keywords.join(",")}"` : ""}>${command.label}</ui-command-item>`
            )
            .join("")}
        </ui-command-list>
      </ui-command>
    </div>
  `
  const command = root.querySelector("ui-command")!
  root.querySelector("ui-select")!.addEventListener("valuechange", (event) => {
    const mode = event.detail.value as Mode | null
    if (mode) {
      command.filter = mode === "words" ? words : mode
    }
  })
}

export { mount }
```

Type “nf” with Fuzzy to find New file. Choose Words and type “zo in” for Zoom in, or type “smiley” to find Search emoji through a keyword.

## Pages

Set an item’s `page` to the value of a `ui-command-page` to open it. An unnamed page holds the first set of commands. The `pages` property records the stack of pages that have been opened.

Backspace in an empty search goes back and restores the previous page’s query. Escape clears the query first, then goes back. A Go back command can call `pop()` on the element’s `api`.

```ts title="pages.ts"
import "@ui-sdk/web/command"
import { ArrowLeft, createElement, Moon, Users } from "lucide"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

const teams = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "marketing", label: "Marketing" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-command>
      <div data-slot="row"></div>
      <ui-command-input>
        <input aria-label="Search commands" placeholder="What do you need?" />
      </ui-command-input>
      <ui-command-empty>No results found.</ui-command-empty>
      <ui-command-list>
        <ui-command-page>
          <ui-command-group>
            <ui-command-group-label>Workspace</ui-command-group-label>
            <ui-command-item value="theme" page="theme">
              <ui-command-item-icon>${createElement(Moon, { "aria-hidden": "true" }).outerHTML}</ui-command-item-icon>
              Change theme…
            </ui-command-item>
            <ui-command-item value="teams" page="teams">
              <ui-command-item-icon>${createElement(Users, { "aria-hidden": "true" }).outerHTML}</ui-command-item-icon>
              Switch team…
            </ui-command-item>
          </ui-command-group>
        </ui-command-page>
        <ui-command-page value="theme">
          ${themes
            .map(
              (theme) =>
                `<ui-command-item value="${theme.value}">${theme.label}</ui-command-item>`
            )
            .join("")}
        </ui-command-page>
        <ui-command-page value="teams">
          ${teams
            .map(
              (team) =>
                `<ui-command-item value="${team.value}">${team.label}</ui-command-item>`
            )
            .join("")}
        </ui-command-page>
      </ui-command-list>
    </ui-command>
  `
  const command = root.querySelector("ui-command") as HTMLElement & {
    api: { pop: () => void }
  }
  const breadcrumb = command.querySelector("div")!
  const input = command.querySelector("input")!
  const list = command.querySelector("ui-command-list")!
  const back = document.createElement("ui-command-item")
  back.setAttribute("value", "back")
  back.innerHTML = `<ui-command-item-icon mirror>${createElement(ArrowLeft, { "aria-hidden": "true" }).outerHTML}</ui-command-item-icon>Go back`
  command.addEventListener("action", (event) => {
    if ((event as CustomEvent<{ value: string }>).detail.value === "back") {
      command.api.pop()
    }
  })
  command.addEventListener("pageschange", (event) => {
    const pages = (event as CustomEvent<{ value: string[] }>).detail.value
    breadcrumb.innerHTML = pages
      .map((page) => `<span data-slot="badge">${page}</span>`)
      .join("")
    input.placeholder = pages.length
      ? "Search… (Backspace to go back)"
      : "What do you need?"
    if (!pages.length) {
      back.remove()
    } else if (!back.isConnected) {
      list.append(back)
    }
  })
}

export { mount }
```

Choose Change theme or Switch team. Use Go back, or press Backspace in an empty search field, to return.

## Items as Data

Assign `items` as a property to provide commands, groups, separators, and pages as `CommandData`. A data command with its own `items` opens a page. Its shortcut still works when another page or filter hides it.

The element renders bare parts for you, following the current page and ranked results. For styled commands, a `<template>` inside it supplies the markup for the generated parts. The example handles groups and separators as well as commands. [Lists and Menus](../lists-and-menus.md) covers the shared data format.

Assign `emptyItems` alongside `items` to show suggested or recent commands while the first page's search is empty. Once someone types, the full collection is searched.

```ts
const command = document.querySelector("ui-command")!
command.items = commands
command.emptyItems = [{ type: "group", label: "Suggested", items: recent }]
```

```ts title="data.ts"
import type { CommandData } from "@ui-sdk/core/command"
import "@ui-sdk/web/command"
import { log } from "./log"

const commands: CommandData = [
  {
    type: "group",
    label: "Navigation",
    items: [
      { value: "home", label: "Go home", keywords: ["start"] },
      { value: "inbox", label: "Open inbox", shortcut: "mod+i" },
    ],
  },
  { type: "separator" },
  {
    type: "group",
    label: "Preferences",
    items: [
      {
        value: "theme",
        label: "Change theme…",
        items: [
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "System" },
        ],
      },
      {
        value: "language",
        label: "Change language…",
        items: ["English", "Français", "Deutsch", "日本語"],
      },
      { value: "sign-out", label: "Sign out", shortcut: "mod+shift+q" },
    ],
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-command>
        <ui-command-input>
          <input aria-label="Search commands" placeholder="Type a command…" />
        </ui-command-input>
        <ui-command-empty>No results found.</ui-command-empty>
        <template>
          <ui-command-list>
            <ui-command-group>
              <ui-command-group-label></ui-command-group-label>
              <ui-command-item>
                <ui-command-shortcut></ui-command-shortcut>
              </ui-command-item>
            </ui-command-group>
            <ui-command-separator></ui-command-separator>
          </ui-command-list>
        </template>
      </ui-command>
    </div>
  `
  const command = root.querySelector("ui-command")!
  command.items = commands
  command.addEventListener("action", (event) =>
    log(root, `Ran ${event.detail.value}`)
  )
}

export { mount }
```

Choose Change theme to open its commands. Press Cmd+I / Ctrl+I to run Open inbox from any page; the console logs what ran.

## Async Results

Use [async options](../utilities/async-options.md) to wait for typing to pause and discard stale results. Send query changes to `setQuery()`, assign the returned items to `items`, and set the `status` attribute. Set `filter="false"` to keep the server’s order.

`ui-command-status` describes loading and failures, and the list gets `aria-busy` while loading. The `loadmore` event can request another page when scrolling or highlighting reaches the last command. Without a status part, `announcement` controls the result-count message after typing pauses.

```ts title="async.ts"
import { createAsyncOptions } from "@ui-sdk/core/async-options"
import "@ui-sdk/web/command"

function searchIssues(query: string, { signal }: { signal: AbortSignal }) {
  const issues = [
    "Fix login redirect",
    "Dark mode flicker",
    "Add billing page",
    "Search is slow",
    "Update dependencies",
    "Crash on upload",
    "Export to CSV",
    "Keyboard shortcuts help",
  ]
  return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      resolve(
        issues
          .filter((issue) => issue.toLowerCase().includes(needle))
          .map((issue) => ({
            value: issue.toLowerCase().replaceAll(" ", "-"),
            label: issue,
          }))
      )
    }, 400)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-command filter="false">
      <ui-command-input>
        <input aria-label="Search issues" placeholder="Search issues…" />
      </ui-command-input>
      <ui-command-status></ui-command-status>
      <ui-command-empty>No issues match “<span></span>”.</ui-command-empty>
      <ui-command-list></ui-command-list>
      <template>
        <ui-command-item>
        </ui-command-item>
      </template>
    </ui-command>
  `
  const command = root.querySelector("ui-command")!
  const status = root.querySelector("ui-command-status")!
  const query = root.querySelector("ui-command-empty span")!
  const issues = createAsyncOptions(searchIssues, {
    debounce: 250,
    immediate: true,
  })
  const update = () => {
    const { items, status: loading } = issues.getState()
    command.items = items
    command.setAttribute("status", loading)
    status.textContent =
      loading === "loading"
        ? "Searching…"
        : `${items.length} ${items.length === 1 ? "issue" : "issues"}`
  }
  issues.subscribe(update)
  update()
  command.addEventListener("querychange", (event) => {
    query.textContent = event.detail.value
    issues.setQuery(event.detail.value)
  })
  command.addEventListener("loadmore", () => issues.loadMore())
}

export { mount }
```

Type “login” and wait for matching issues. Replace the text to start a new search; only the latest results appear.

## Pending Actions

Pass a promise to `event.detail.waitUntil()` in an `action` listener. The command gets `data-pending`, `aria-busy` and `aria-disabled` until it settles; further presses do not start another run. A rejection becomes the command’s `error` state, which clears when it runs again.

An item’s `select` event fires before `action`. Call `preventDefault()` on it to stop the action.

```ts title="pending.ts"
import "@ui-sdk/web/command"
import { createElement, LoaderCircle } from "lucide"
import { log } from "./log"

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

function mount(root: HTMLElement) {
  const spinner = createElement(LoaderCircle, {
    "data-slot": "spinner",
    "aria-hidden": "true",
  }).outerHTML
  root.innerHTML = `
    <div data-slot="stack">
      <ui-command>
        <ui-command-input>
          <input aria-label="Search actions" placeholder="Search actions…" />
        </ui-command-input>
        <ui-command-list>
          <ui-command-item value="deploy" label="Deploy to production">
            Deploy to production
            ${spinner}
          </ui-command-item>
          <ui-command-item value="sync" label="Sync with server">
            Sync with server
            ${spinner}
            <span data-slot="hint" data-error hidden>Failed, try again</span>
          </ui-command-item>
        </ui-command-list>
      </ui-command>
    </div>
  `
  const error = root.querySelector<HTMLElement>("[data-error]")!
  root.querySelector("ui-command")!.addEventListener("action", (event) => {
    const { value, waitUntil } = event.detail
    if (value === "deploy") {
      waitUntil(wait(1200).then(() => log(root, "Deployed to production")))
    }
    if (value === "sync") {
      error.hidden = true
      const sync = wait(600).then(() => {
        log(root, "Couldn't sync: offline")
        throw new Error("Offline")
      })
      waitUntil(sync)
      sync.catch(() => (error.hidden = false))
    }
  })
}

export { mount }
```

Run Deploy to production and try it again while it's pending. Sync with server fails and can be retried; the console logs each outcome.

## Virtualized

Assign the full `items` collection so filtering and keyboard navigation include commands that are not mounted. Render only visible rows, giving each its `index` in the current results. The `valuechange` event includes that index so you can scroll a newly highlighted row into view.

```ts title="virtualized.ts"
import { fuzzyScore } from "@ui-sdk/core/text-match"
import "@ui-sdk/web/command"

const commands = Array.from({ length: 10_000 }, (_, index) => ({
  value: `command-${index + 1}`,
  label: `Command ${index + 1}`,
}))

const row = 32

function rank(query: string) {
  if (!query.trim()) {
    return commands
  }
  return commands
    .map((item) => ({ item, score: fuzzyScore(item.label, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item)
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-command>
      <ui-command-input>
        <input aria-label="Search 10,000 commands" placeholder="Search 10,000 commands…" />
      </ui-command-input>
      <ui-command-list>
        <div aria-hidden="true"></div>
      </ui-command-list>
    </ui-command>
  `
  const command = root.querySelector("ui-command") as HTMLElement & {
    items: typeof commands
  }
  const list = root.querySelector<HTMLElement>("ui-command-list")!
  const spacer = list.querySelector<HTMLElement>("div")!

  let matches = commands

  const rendered = new Map<string, HTMLElement>()
  const render = () => {
    spacer.style.height = `${matches.length * row}px`
    const start = Math.max(0, Math.floor(list.scrollTop / row) - 4)
    const end = Math.min(
      matches.length,
      Math.ceil((list.scrollTop + list.clientHeight) / row) + 4
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
        `<ui-command-item value="${item.value}" label="${item.label}" index="${index}" style="top: ${index * row}px">${item.label}</ui-command-item>`
      )
      rendered.set(value, list.lastElementChild as HTMLElement)
    }
  }
  render()
  command.items = commands
  list.addEventListener("scroll", render)
  command.addEventListener("querychange", (event) => {
    matches = rank((event as CustomEvent<{ value: string }>).detail.value)
    render()
  })
  command.addEventListener("valuechange", (event) => {
    const { index } = (
      event as CustomEvent<{ value: string | null; index: number }>
    ).detail
    if (index < 0) {
      return
    }
    const top = index * row
    if (top < list.scrollTop) {
      list.scrollTop = top
    } else if (top + row > list.scrollTop + list.clientHeight) {
      list.scrollTop = top + row - list.clientHeight
    }
    render()
  })
}

export { mount }
```

Search 10,000 commands or move through them with the arrow keys. Only the rows near the viewport render.

## Controlled

The highlighted command, search text, and page stack are separate:

| Value   | Shape                               | Change Notification |
| ------- | ----------------------------------- | ------------------- |
| `value` | A command’s string value or `null`. | `valuechange`       |
| `query` | The search text.                    | `querychange`       |
| `pages` | An array of page values.            | `pageschange`       |

Read or write these properties on the element, and use `default-value`, `default-query`, and `default-pages` for starting state. Change events carry the new value in `event.detail.value` and the reason beside it; call `event.preventDefault()` to reject a change. `value` is the highlighted command, not a chosen one, and it changes as the highlight moves. `action` reports activation, so moving the highlight alone does not run a command. [State and Events](../state-and-events.md) covers the shared binding pattern.

```ts title="controlled.ts"
import "@ui-sdk/web/command"
import { log } from "./log"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-command default-value="dark" default-pages="theme">
      <ui-command-input>
        <input aria-label="Search themes" placeholder="Search themes…" />
      </ui-command-input>
      <ui-command-list>
        <ui-command-page>
          <ui-command-item value="theme" page="theme">Change theme…</ui-command-item>
        </ui-command-page>
        <ui-command-page value="theme">
          ${themes
            .map(
              (theme) =>
                `<ui-command-item value="${theme.value}">${theme.label}</ui-command-item>`
            )
            .join("")}
        </ui-command-page>
      </ui-command-list>
    </ui-command>
  `
  const command = root.querySelector("ui-command")!
  command.addEventListener("valuechange", (event) =>
    log(
      root,
      `Highlighted ${event.detail.value ?? "nothing"} (${event.detail.reason})`
    )
  )
  command.addEventListener("querychange", (event) =>
    log(root, `Query “${event.detail.value}” (${event.detail.reason})`)
  )
  command.addEventListener("pageschange", (event) =>
    log(
      root,
      `Pages [${event.detail.value.join(", ")}] (${event.detail.reason})`
    )
  )
  command.addEventListener("action", (event) =>
    log(root, `Ran ${event.detail.value}`)
  )
}

export { mount }
```

Open Change theme, search and move the highlight. The console logs each highlight, query and page change with its reason.

## Controller

Use the element’s `api` property. It can read and set the highlight, query, and page stack. Use `push()` and `pop()` to navigate pages, `run()` to run the highlighted command or a named one, and `focus()` to focus the search. See [Controllers](../controllers.md) for setup and lifecycle.

```ts title="controller.ts"
import "@ui-sdk/web/command"
import { log } from "./log"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-action="push">Open Themes</button>
        <button type="button" data-action="pop">Back</button>
        <button type="button" data-action="highlight">Highlight Dark</button>
        <button type="button" data-action="search">Search “li”</button>
        <button type="button" data-action="run">Run Highlighted</button>
        <button type="button" data-action="focus">Focus</button>
      </div>
      <ui-command>
        <ui-command-input>
          <input aria-label="Search commands" />
        </ui-command-input>
        <ui-command-list>
          <ui-command-page>
            <ui-command-item value="theme" page="theme">Change theme…</ui-command-item>
          </ui-command-page>
          <ui-command-page value="theme">
            ${themes
              .map(
                (theme) =>
                  `<ui-command-item value="${theme.value}">${theme.label}</ui-command-item>`
              )
              .join("")}
          </ui-command-page>
        </ui-command-list>
      </ui-command>
    </div>
  `
  const command = root.querySelector("ui-command")!
  const palette = command.api
  const actions: Record<string, () => void> = {
    push: () => palette.push("theme"),
    pop: () => palette.pop(),
    highlight: () => palette.setValue("dark"),
    search: () => palette.setQuery("li"),
    run: () => palette.run(),
    focus: () => palette.focus(),
  }
  for (const button of root.querySelectorAll<HTMLElement>("[data-action]")) {
    button.addEventListener("click", () => actions[button.dataset.action!]())
  }
  command.addEventListener("action", (event) =>
    log(root, `Ran ${event.detail.value}`)
  )
}

export { mount }
```

Use the buttons to open pages, search, move the highlight and run it from outside. The console logs each command that runs.

## Custom Rendering

Put an anchor inside a command and add `as-child` when it should navigate: the command binds the anchor. Enter follows the highlighted link; modified clicks keep their usual browser behavior.

```ts title="custom-rendering.ts"
import "@ui-sdk/web/command"
import { CornerDownLeft, createElement } from "lucide"

const pages = ["Composition", "Installation", "Styling"]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-command>
      <ui-command-input>
        <input aria-label="Search docs" placeholder="Search docs…" />
      </ui-command-input>
      <ui-command-list>
        ${pages
          .map(
            (page) => `
              <ui-command-item value="${page}" label="${page}" as-child>
                <a href="#${page.toLowerCase()}">
                  <ui-command-item-text>${page}</ui-command-item-text>
                  ${createElement(CornerDownLeft, { "aria-hidden": "true" }).outerHTML}
                </a>
              </ui-command-item>
            `
          )
          .join("")}
      </ui-command-list>
    </ui-command>
  `
}

export { mount }
```

Search for Installation and press Enter. The command follows the link to that section on this page.

## Styling

Each element has a `data-slot`, such as `command-item`, and shows its state through the attributes listed under [Data Attributes](#data-attributes).

Use `data-highlighted` for the active command and `data-pending` for an action in progress. Give the list a height limit and `overflow-y: auto` for long lists; keyboard navigation scrolls the highlighted command into view. When mixing commands with and without icons, `data-has-icons` on the list and `data-has-icon` on each item let you reserve matching space with logical padding.

## Data Attributes

### `<ui-command>`
`[data-slot="command"]`

- `data-loading`: Present while results load, with `status="loading"`.

### `<ui-command-input>`
### `<ui-command-list>`
`[data-slot="command-list"]`

- `data-has-icons`: Present while any command inside holds an icon part, so items without one can line up.

### `<ui-command-item>`
`[data-slot="command-item"]`

- `data-disabled`: Present when the command can't run. Arrow keys skip it.
- `data-highlighted`: Present on the highlighted command, which Enter runs. Focus stays in the field.
- `data-pending`: Present while the Promise the command's `onSelect` or `onAction` returned is running.
- `data-has-icon`: Present on a command while it holds an icon part.

### `<ui-command-item-text>`
`[data-slot="command-item-text"]`

- `data-matched`: Present on a command's text while the search matched part of it, which is marked.

### `<ui-command-item-icon>`
`[data-slot="command-item-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

### `<ui-command-empty>`
`[data-slot="command-empty"]`

- `data-loading`: Present while results load, with `status="loading"`.
- `data-empty`: Present while no command matches.

### `<ui-command-status>`
`[data-slot="command-status"]`

- `data-loading`: Present while results load, with `status="loading"`.

## API Reference

Props are attributes in kebab case, like `default-pages` and `auto-highlight`: `"false"` is false. `filter` takes `fuzzy`, `contains`, `startsWith` or `false`. `items`, `emptyItems`, `announcement` and a `filter` function are properties. Callbacks are DOM events.

### Command

- `value?` (`string | null`): The highlighted command's value. Pass it to control the highlight. `null` highlights nothing.
- `defaultValue?` (`string | null`): The command highlighted at first, when uncontrolled. Without it, the first command is, with `autoHighlight`.
- `valuechange event`: Runs when the highlight moves: arrow keys, the pointer, typing, a page change or a controller. `details.index` says where the command is, for virtualized lists.
- `query?` (`string`): The search text, which filters the commands. Pass it to control it.
- `defaultQuery?` (`string`): The search text at first, when uncontrolled.
- `querychange event`: Runs when the search text wants to change: typing, opening a page, going back, or a controller.
- `pages?` (`string[]`): The stack of open pages, from the first page opened to the current one. Pass it to control it.
- `defaultPages?` (`string[]`): The pages open at first, when uncontrolled.
- `pageschange event`: Runs when a page opens or Backspace or Escape goes back.
- `action event`: Runs when a command runs, with its value: Enter, a click, or its shortcut. Return a Promise to mark the command pending until it settles: it gets `data-pending`, `aria-busy` and `aria-disabled`, and running it again waits. A rejection puts the reason in its `error` state until the next run.
- `pendingAnnouncement?` (`string`): What screen readers hear once a command has been pending for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `items?` (`CommandData`): The commands as data. Renders them for you, ranked as the user types, with pages for commands that have `items`.
- `emptyItems?` (`CommandData`): Commands shown instead of `items` on the first page while the search is empty, like recent or suggested ones. Groups work, like `{ type: "group", label: "Suggestions", items }`. Needs `items`.
- `filter?` (`SearchFilter<string>`): How typing narrows the list: `"fuzzy"` keeps commands with the text's letters in order, best matches first; `"contains"` and `"startsWith"` match the text itself. A function returns a score (0 hides) or a boolean. `false` keeps every command, for results a server already filtered. Composed commands keep their order, and data commands are ranked by score.
- `autoHighlight?` (`boolean`): Whether the first command is highlighted while nothing else is, and the best match as the user types, so Enter runs it.
- `loop?` (`boolean`): Whether arrow keys wrap from the last command to the first.
- `status?` (`AsyncOptionsStatus`): Whether results are loading or failed, for the empty and status parts. Sets `aria-busy` on the list while loading.
- `loadmore event`: Runs when the highlight or scrolling reaches the last command, so the next page can load, like `createAsyncOptions`'s `loadMore`. Not again for the same commands, unless the last load failed.
- `announcement?` (`((change: ListAnnouncement) => string | null | undefined)`): What screen readers hear after typing pauses, when no `CommandStatus` is rendered. Return null for nothing.
- `controller?` (`object`): Reads and drives the list from anywhere. Create one with `createCommandController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### CommandInput

The search field. `<ui-command-input>` wraps a native `input`, which gets the combobox role.

### CommandStatus

Describes loading and failures. `<ui-command-status>` has the status role.

### CommandEmpty

Shows while no command matches. `<ui-command-empty>` stays hidden while there are matches.

### CommandList

Holds the commands. `<ui-command-list>` has the listbox role and is always shown.

### CommandPage

- `value?` (`string`): The page's name, which a command's `page` opens. Leave it out for the first page.

### CommandGroup

Groups commands under a label. `<ui-command-group>` has the group role.

### CommandGroupLabel

Names its group. `<ui-command-group-label>` labels the group.

### CommandItem

- `value?` (`string`): Passed to `action` and `valuechange`, and identifies the command. Without it, one is generated.
- `label?` (`string`): The text the search matches, when the content isn't plain text. Not the accessible name: use `aria-label` for that.
- `keywords?` (`string[]`): More words the search matches.
- `disabled?` (`boolean`): Keeps the command from running. Arrow keys and the pointer skip it. Sets `data-disabled` and `aria-disabled`.
- `shortcut?` (`string`): A keyboard shortcut that runs the command while it's in the page, like `"mod+p"`. Sets `aria-keyshortcuts`, and a `CommandShortcut` inside shows it.
- `page?` (`string`): The page choosing this command opens, by the `value` of a `CommandPage`.
- `index?` (`number`): The command's position among all visible commands, for virtualized lists that render only some. Sets `aria-posinset` and `aria-setsize`.
- `select event`: Runs when the command runs, before `action`, with the click or key press that ran it, or a new `select` Event for a shortcut or a controller's `run()`. Call `event.preventDefault()` to skip `action` and the page. Return a Promise to mark the command pending until it settles, like `action`.

### CommandItemIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

### CommandItemText

Shows its command's label, and marks what matched the search in `<mark>`. `<ui-command-item-text>` holds text only.

### CommandShortcut

- `shortcut?` (`string`): The keys to show, like `"mod+p"`. Inside a command, its `shortcut`.

### CommandSeparator

Separates commands or groups. `<ui-command-separator>` has the separator role.

### Items as Data

Each command in `items`. Groups are `{ type: "group", label, items }` and separators `{ type: "separator" }`.

- `value` (`string`): Identifies the item, and is what choosing it reports. A string, or any value with `itemToValue`.
- `label` (`string`): The text shown and matched by typeahead and filtering. A select's trigger shows it once chosen.
- `keywords?` (`string[]`): More words filtering matches, like `["team"]` for a plan called Pro.
- `disabled?` (`boolean`): Keeps the item from being chosen. The keyboard skips it, like in a native select.
- `shortcut?` (`string`): A keyboard shortcut that runs the command, like `"mod+p"`, while the list is in the page, whatever page it's on. Shows `⌘P` on Apple platforms and `Ctrl+P` elsewhere.
- `items?` (`CommandData`): Commands on a page of their own. Choosing this command opens the page, and Backspace in the empty field goes back.

### State

The same state shows as data attributes on each element.

`Command`:

- `page` (`string | null`): The current page, or `null` on the first page.
- `loading` (`boolean`): Whether results are loading.

`CommandInput`:

- `page` (`string | null`): The current page, or `null` on the first page.

`CommandList`:

- `status` (`AsyncOptionsStatus`): Whether results are loading or failed.
- `items` (`CommandData`): The visible data commands, ranked, for rendering a virtualized list yourself.

`CommandItem`:

- `highlighted` (`boolean`): Whether the command is highlighted, by the keyboard, the pointer or typing.
- `disabled` (`boolean`): Whether the command can't run.
- `pending` (`boolean`): Whether its action's Promise is running.
- `error` (`unknown`): Why its last action failed, until it runs again.

`CommandEmpty`:

- `loading` (`boolean`): Whether results are loading.
- `empty` (`boolean`): Whether no item matches.
- `query` (`string`): The text the list is filtered by.

`CommandStatus`:

- `status` (`"idle" | "loading" | "error"`): Whether results are loading or failed.
- `loading` (`boolean`): Whether results are loading.
- `count` (`number`): How many items are visible.

`CommandShortcut`:

- `text` (`string`): The shortcut formatted for this platform: `⌘P` on Apple platforms and `Ctrl+P` elsewhere. Empty without one.

`CommandItemText`, which takes no props of its own:

- `segments` (`MatchSegment[]`): The text in pieces, each marked when it matched. Joined, they're the whole text.
- `matched` (`boolean`): Whether any piece matched.

`CommandItemIcon`:

- `mirror` (`boolean`): Whether it flips in right-to-left text.

### Reasons

`event.detail.reason` says why the highlighted command changed:

- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `item-hover` (`PointerEvent`): The pointer moved onto an item, which highlighted it, like in a command list.
- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `item-removed` (`none`): The selected item left the page, and another was picked.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

Why the search text changed:

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

And why the stack of pages changed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods.

- `getValue()` (`() => string | null`): The highlighted command's value, or `null`.
- `setValue(value, options?)` (`(value: string | null, options?: CommandChangeOptions<CommandValueChangeReason> | undefined) => boolean`): Highlights a command, and scrolls it into view. Returns false when the change was canceled or nothing changed.
- `getQuery()` (`() => string`): The search text.
- `setQuery(query, options?)` (`(query: string, options?: CommandChangeOptions<CommandQueryChangeReason> | undefined) => boolean`): Changes the search text, which filters the commands. Returns false when the change was canceled or nothing changed.
- `getPages()` (`() => string[]`): The stack of open pages, from the first page opened to the current one. Empty on the first page.
- `setPages(pages, options?)` (`(pages: string[], options?: CommandChangeOptions<CommandPagesChangeReason> | undefined) => boolean`): Replaces the stack of pages. Returns false when the change was canceled or nothing changed.
- `push(page, options?)` (`(page: string, options?: CommandChangeOptions<CommandPagesChangeReason> | undefined) => boolean`): Opens a page on top of the current one, by the `value` of a `CommandPage` or a data command. Returns false when the change was canceled or nothing changed.
- `pop(options?)` (`(options?: CommandChangeOptions<CommandPagesChangeReason> | undefined) => boolean`): Goes back to the previous page, and puts back the search text typed there. Returns false when the change was canceled or nothing changed.
- `run(value?)` (`(value?: string | undefined) => void`): Runs a command, as Enter would: the highlighted one, or the one with this value.
- `focus()` (`() => void`): Moves focus to the search field.

### Events

Events fire on their own element and don't bubble, with the new state in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` on a change event cancels it.

| Member              | On                | Description                                                           |
| ------------------- | ----------------- | --------------------------------------------------------------------- |
| `value` property    | `ui-command`      | The highlighted command. Setting it highlights, as a controller would |
| `query` property    | `ui-command`      | The search text                                                       |
| `pages` property    | `ui-command`      | The stack of pages                                                    |
| `api` property      | `ui-command`      | The [controller](#controller-1)                                       |
| `valuechange` event | `ui-command`      | `detail: { value, reason, event, source, index }`                     |
| `querychange` event | `ui-command`      | `detail: { value: query, reason, event, source }`                     |
| `pageschange` event | `ui-command`      | `detail: { value: pages, reason, event, source }`                     |
| `action` event      | `ui-command`      | `detail: { value, waitUntil(promise) }`, when a command runs          |
| `loadmore` event    | `ui-command`      | When the last command is reached                                      |
| `select` event      | `ui-command-item` | Before `action`. `preventDefault()` skips the `action` event          |

## Accessibility

The command list follows the [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) with a listbox that's always shown. Focus stays in the input, which points to the highlighted command with `aria-activedescendant`. Every line below is an automated test.

### Keyboard

| Key                | Does                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| Typing             | Filters the commands and highlights the best match                    |
| ArrowDown, ArrowUp | Moves the highlight. Wraps unless `loop="false"`                      |
| Enter              | Runs the highlighted command, or follows it when it renders as a link |
| Escape             | Clears the search, then goes back a page                              |
| Backspace          | In an empty search, goes back a page and restores its query           |
| An item's shortcut | Runs it while the list is mounted, even when hidden by the search     |

The first available command is highlighted by default. Set `auto-highlight="false"` to wait for an arrow key or pointer movement.

### Tested Behavior

**Field**

- Is a combobox that controls an always-expanded listbox.
- The first command is highlighted from the start.

**Filtering**

- Typing keeps the commands that match, ignoring case and accents.
- Groups without a match hide, and the rest keep their labels.
- The first match is highlighted as the text changes, so Enter runs it.
- Deleting text brings back the commands the shorter text matches.
- Commands without a value that mount while the field has text show when they match.
- Going back a page reports the new highlight as back, not as a removal.
- Nothing matching shows the empty message.

**Keyboard**

- Arrow keys move the highlight while focus stays in the field.
- Home and End stay in the field for the caret.
- The highlighted option has the id aria-activedescendant names.
- Enter runs the highlighted command.

**Pointer**

- Clicking a command runs it.
- A disabled command doesn't run.

**AutoHighlight**

- Without autoHighlight, nothing is highlighted until an arrow key.

Runs in React, Vue and web components.

Long lists stay fast and announce their size:

**Virtualized**

- Renders only the rows in view, each with its place in the whole list.
- Arrow keys reach commands that weren't rendered, and the active descendant follows.
- Typing ranks every command, rendered or not, best match first.

Runs in React.

Also tested:

**Enhancements**

- The highlighted command is the selected option, as the APG's list autocomplete marks it.
- Keywords match as well as labels.
- Fuzzy matching finds the letters in order, across words.
- Arrow keys skip disabled commands.
- A command's shortcut runs it and sets aria-keyshortcuts.
- A shortcut runs its command while the search hides it.
- A command is pending while its action's Promise runs, and runs only once.
- A command opens its page, and Backspace in the empty field goes back with the text.
- Escape clears the text, then goes back a page.
- Results that still hold the highlighted command keep the highlight.
- The list is busy while results load.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while searching with a keyboard.

Runs in React, Vue and web components.
