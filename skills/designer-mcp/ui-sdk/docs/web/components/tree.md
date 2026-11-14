# Tree

Browse a hierarchy of files, pages, or choices with expandable branches.

Use a Tree when items have children, like files in folders or pages in a docs sidebar. Start with nested parts, then add selection, checkboxes, or children loaded from a server as you need them.

```ts title="demo.ts"
import "@ui-sdk/web/tree"
import {
  ChevronRight,
  createElement,
  File,
  Folder,
  FolderOpen,
  type IconNode,
} from "lucide"

type Node = { value: string; label: string; children?: Node[] }

const files: Node[] = [
  {
    value: "app",
    label: "app",
    children: [
      { value: "app/layout.tsx", label: "layout.tsx" },
      { value: "app/page.tsx", label: "page.tsx" },
      {
        value: "app/settings",
        label: "settings",
        children: [{ value: "app/settings/page.tsx", label: "page.tsx" }],
      },
    ],
  },
  {
    value: "components",
    label: "components",
    children: [
      { value: "components/button.tsx", label: "button.tsx" },
      { value: "components/card.tsx", label: "card.tsx" },
    ],
  },
  { value: "components.json", label: "components.json" },
  { value: "package.json", label: "package.json" },
  { value: "README.md", label: "README.md" },
]

const icon = (node: IconNode) =>
  createElement(node, { "aria-hidden": "true" }).outerHTML

function markup(items: Node[]) {
  let html = ""
  for (const item of items) {
    html += `
      <ui-tree-item value="${item.value}">
        <ui-tree-item-label>
          ${
            item.children
              ? `<ui-tree-item-indicator>${icon(ChevronRight)}</ui-tree-item-indicator>
                ${icon(Folder)}
                ${icon(FolderOpen)}`
              : icon(File)
          }
          <span>${item.label}</span>
        </ui-tree-item-label>
        ${item.children ? `<ui-tree-group>${markup(item.children)}</ui-tree-group>` : ""}
      </ui-tree-item>`
  }
  return html
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tree aria-label="Files" default-expanded="app" default-value="app/page.tsx">
      ${markup(files)}
    </ui-tree>
  `
}

export { mount }
```

Expand components to see its files. Use the arrow keys to move between rows and open or close branches.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. On the server the import does nothing.

```ts
import "@ui-sdk/web/tree"
```

## Composition

Use the following composition to build a `ui-tree`:

```text
ui-tree
├── ui-tree-item
│   ├── ui-tree-item-label
│   │   └── ui-tree-item-indicator
│   └── ui-tree-group
│       └── ui-tree-item
│           └── ui-tree-item-label
└── ui-tree-item
    └── ui-tree-item-label
```

Give the tree an accessible name and every item a unique `value`. An item with a `ui-tree-group` inside it is a branch. The group holds its children; the label names the item. The indicator and checkbox are optional, and they belong to the item around them, so put them inside its label to make them part of the row.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/tree"
</script>

<ui-tree aria-label="Project files">
  <ui-tree-item value="src">
    <ui-tree-item-label>
      <ui-tree-item-indicator>›</ui-tree-item-indicator>
      src
    </ui-tree-item-label>
    <ui-tree-group>
      <ui-tree-item value="src/index.ts">
        <ui-tree-item-label>index.ts</ui-tree-item-label>
      </ui-tree-item>
    </ui-tree-group>
  </ui-tree-item>
  <ui-tree-item value="package.json">
    <ui-tree-item-label>package.json</ui-tree-item-label>
  </ui-tree-item>
</ui-tree>
```

## Items as Data

Pass `items` to give the tree its full hierarchy, including collapsed branches. Each `TreeItemData` has a `value`, a `label`, and optional `children`. With no `ui-tree-item` elements of its own, the tree renders bare parts from the data:

```ts
const items: TreeItemData[] = [
  {
    value: "fruit",
    label: "Fruit",
    children: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
    ],
  },
  { value: "bread", label: "Bread" },
]

const tree = document.querySelector('ui-tree[aria-label="Groceries"]')!
tree.items = items
```

To render the rows yourself, keep `items` on the tree and write them with a recursive function, so keyboard navigation, item counts, and the element's `api` still know the whole hierarchy:

```ts
function markup(items: TreeItemData[]) {
  let html = ""
  for (const item of items)
    html += `
      <ui-tree-item value="${item.value}">
        <ui-tree-item-label>${item.label}</ui-tree-item-label>
        ${item.children ? `<ui-tree-group>${markup(item.children)}</ui-tree-group>` : ""}
      </ui-tree-item>`
  return html
}

const tree = document.querySelector('ui-tree[aria-label="Groceries"]')!
tree.innerHTML = markup(items)
tree.items = items
```

## File Paths

Pass `paths` for a file explorer. Folders become branches and sort before files; a path ending in `/` represents an empty folder. `treeFromPaths()` returns the same data when you want to render the rows yourself.

Selection and activation are separate. This example uses `activation="automatic"` so arrow keys select a file, then the `action` event opens it. Pass a promise to the event's `detail.waitUntil()` to show a pending state while it opens.

```ts title="paths.ts"
import { treeFromPaths, type TreeItemData } from "@ui-sdk/core/tree"
import "@ui-sdk/web/tree"
import { ChevronRight, createElement, LoaderCircle } from "lucide"
import { log } from "./log"

const paths = [
  "src/index.ts",
  "src/lib/format.ts",
  "src/lib/parse.ts",
  "src/routes/home.tsx",
  "src/routes/about.tsx",
  "tests/",
  "package.json",
  "tsconfig.json",
]

const items = treeFromPaths(paths)
const files = new Set(paths.filter((path) => !path.endsWith("/")))

function markup(items: TreeItemData[]) {
  let html = ""
  for (const item of items) {
    html += `
      <ui-tree-item value="${item.value}">
        <ui-tree-item-label>
          ${
            item.children
              ? `<ui-tree-item-indicator>${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</ui-tree-item-indicator>`
              : ""
          }
          <span>${item.label}</span>
          ${createElement(LoaderCircle, { "aria-hidden": "true", "data-show": "pending" }).outerHTML}
        </ui-tree-item-label>
        ${item.children ? `<ui-tree-group>${markup(item.children)}</ui-tree-group>` : ""}
      </ui-tree-item>`
  }
  return html
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tree aria-label="Project" default-expanded="src" default-value="src/index.ts" activation="automatic">
      ${markup(items)}
    </ui-tree>
  `
  const tree = root.querySelector("ui-tree")!
  tree.paths = paths
  tree.addEventListener("action", (event) => {
    const { value, waitUntil } = event.detail
    if (!files.has(value)) {
      return
    }
    waitUntil(
      new Promise((resolve) => setTimeout(resolve, 600)).then(() =>
        log(root, `Opened ${value}`)
      )
    )
  })
}

export { mount }
```

Arrow down to package.json, then press Enter. It shows a spinner while it opens, then the console logs Opened package.json.

## Selection

The default `mode="single"` uses one string value or `null`. Use `"multiple"` for an array, or `"none"` when items should only navigate or perform actions.

`activation="automatic"` selects while arrow keys move in single selection mode. Pressing a branch also expands or collapses it; set `expand-on-press` to `false` to leave expansion to the indicator and arrow keys.

## Multiple Selection

`mode="multiple"` makes the value an array. Cmd-click or Ctrl-click toggles one item, Shift extends a range, and Cmd+A or Ctrl+A selects the visible items. This example sets `expand-on-press` to `false`, so clicking Inbox or Projects selects the folder without closing it.

```ts title="multiple.ts"
import type { TreeItemData } from "@ui-sdk/core/tree"
import "@ui-sdk/web/tree"
import { ChevronRight, createElement } from "lucide"
import { log } from "./log"

const items: TreeItemData[] = [
  {
    value: "inbox",
    label: "Inbox",
    children: [
      { value: "updates", label: "Updates" },
      { value: "forums", label: "Forums" },
      { value: "promotions", label: "Promotions" },
    ],
  },
  {
    value: "projects",
    label: "Projects",
    children: [
      { value: "website", label: "Website" },
      { value: "mobile", label: "Mobile app" },
    ],
  },
  { value: "archive", label: "Archive" },
  { value: "trash", label: "Trash" },
]

function markup(items: TreeItemData[]) {
  let html = ""
  for (const item of items) {
    html += `
      <ui-tree-item value="${item.value}">
        <ui-tree-item-label>
          ${
            item.children
              ? `<ui-tree-item-indicator>${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</ui-tree-item-indicator>`
              : ""
          }
          ${item.label}
        </ui-tree-item-label>
        ${item.children ? `<ui-tree-group>${markup(item.children)}</ui-tree-group>` : ""}
      </ui-tree-item>`
  }
  return html
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tree aria-label="Folders" mode="multiple" default-value="updates,website" expand-on-press="false" default-expanded="inbox,projects">
      ${markup(items)}
    </ui-tree>
  `
  const tree = root.querySelector("ui-tree")!
  tree.items = items
  tree.addEventListener("valuechange", (event) => {
    const value = event.detail.value as string[]
    log(root, `${value.length} selected: ${value.join(", ")}`)
  })
}

export { mount }
```

Cmd-click or Ctrl-click Archive to add it to the selection. Shift-click or Shift+Arrow extends a range, and the console logs what's selected.

## Checkboxes

Add `checkable` and `ui-tree-item-checkbox` for a checked state separate from selection. Space checks the focused item. Checking a branch checks its descendants, and a partly checked branch reports a mixed state.

`check-strategy` chooses what the `checked` array reports:

| Strategy        | Reported Values                          |
| --------------- | ---------------------------------------- |
| `"leaf"`        | Checked leaves. This is the default.     |
| `"trunk"`       | The outermost fully checked items.       |
| `"branch"`      | Every fully checked item.                |
| `"independent"` | Each item on its own, without cascading. |

```ts title="checkboxes.ts"
import type { TreeItemData } from "@ui-sdk/core/tree"
import "@ui-sdk/web/tree"
import { ChevronRight, createElement } from "lucide"
import { log } from "./log"

const items: TreeItemData[] = [
  {
    value: "frontend",
    label: "Frontend",
    children: [
      { value: "react", label: "React" },
      { value: "vue", label: "Vue" },
      { value: "svelte", label: "Svelte" },
    ],
  },
  {
    value: "backend",
    label: "Backend",
    children: [
      { value: "node", label: "Node" },
      {
        value: "databases",
        label: "Databases",
        children: [
          { value: "postgres", label: "Postgres" },
          { value: "sqlite", label: "SQLite" },
        ],
      },
    ],
  },
]

function markup(items: TreeItemData[]) {
  let html = ""
  for (const item of items) {
    html += `
      <ui-tree-item value="${item.value}">
        <ui-tree-item-label>
          ${
            item.children
              ? `<ui-tree-item-indicator>${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</ui-tree-item-indicator>`
              : ""
          }
          <ui-tree-item-checkbox></ui-tree-item-checkbox>
          ${item.label}
        </ui-tree-item-label>
        ${item.children ? `<ui-tree-group>${markup(item.children)}</ui-tree-group>` : ""}
      </ui-tree-item>`
  }
  return html
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tree aria-label="Stack" checkable mode="none" check-strategy="trunk" default-checked="react,postgres" default-expanded="frontend,backend,databases">
      ${markup(items)}
    </ui-tree>
  `
  const tree = root.querySelector("ui-tree")!
  tree.items = items
  tree.addEventListener("checkedchange", (event) => {
    log(root, `Checked ${event.detail.value.join(", ") || "nothing"}`)
  })
}

export { mount }
```

Press Space on Vue, then on Frontend. Frontend is mixed while only some of its items are checked, and the console logs the trunk strategy's values.

## Links

Set `mode="none"` for a navigation tree, then bind each label to a link with `as-child`. `current` identifies the current page with `aria-current="page"`, expands its ancestors, and gives it the initial Tab stop. Update it when your route changes.

```ts title="links.ts"
import type { TreeItemData } from "@ui-sdk/core/tree"
import "@ui-sdk/web/tree"
import { ChevronRight, createElement } from "lucide"

const pages: TreeItemData[] = [
  {
    value: "getting-started",
    label: "Getting started",
    children: [
      { value: "introduction", label: "Introduction", href: "#introduction" },
      { value: "installation", label: "Installation", href: "#installation" },
    ],
  },
  {
    value: "components",
    label: "Components",
    children: [
      { value: "accordion", label: "Accordion", href: "#accordion" },
      { value: "dialog", label: "Dialog", href: "#dialog" },
      { value: "tree", label: "Tree", href: "#tree" },
    ],
  },
  { value: "changelog", label: "Changelog", href: "#changelog" },
]

const links = new Set(
  pages
    .flatMap((page) => [page, ...(page.children ?? [])])
    .filter((page) => page.href)
    .map((page) => page.value)
)

function markup(items: TreeItemData[]) {
  let html = ""
  for (const item of items) {
    const content = `
      ${
        item.children
          ? `<ui-tree-item-indicator>${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</ui-tree-item-indicator>`
          : ""
      }
      ${item.label}`
    html += `
      <ui-tree-item value="${item.value}">
        ${
          item.href
            ? `<ui-tree-item-label as-child><a href="${item.href}">${content}</a></ui-tree-item-label>`
            : `<ui-tree-item-label>${content}</ui-tree-item-label>`
        }
        ${item.children ? `<ui-tree-group>${markup(item.children)}</ui-tree-group>` : ""}
      </ui-tree-item>`
  }
  return html
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tree aria-label="Docs" mode="none" current="tree">
      ${markup(pages)}
    </ui-tree>
  `
  const tree = root.querySelector("ui-tree")!
  tree.items = pages
  tree.addEventListener("action", (event) => {
    const { value, event: trigger } = event.detail
    if (!links.has(value)) {
      return
    }
    trigger?.preventDefault()
    tree.setAttribute("current", value)
  })
}

export { mount }
```

Choose Dialog. The current-page marker moves to it, and you stay on this docs page.

## Disabled

Disabled items can't be selected, checked, expanded, or run. They stay focusable so screen readers can find them. Set `focusable-when-disabled` to `false` to skip them, or `disabled` on the root to disable the whole tree. A disabled `<fieldset>` around the tree disables it too.

```ts title="disabled.ts"
import type { TreeItemData } from "@ui-sdk/core/tree"
import "@ui-sdk/web/switch"
import "@ui-sdk/web/tree"
import { ChevronRight, createElement } from "lucide"

const items: TreeItemData[] = [
  {
    value: "plans",
    label: "Plans",
    children: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
      { value: "enterprise", label: "Enterprise", disabled: true },
    ],
  },
  {
    value: "legacy",
    label: "Legacy plans",
    disabled: true,
    children: [{ value: "starter", label: "Starter" }],
  },
  { value: "custom", label: "Custom" },
]

function markup(items: TreeItemData[]) {
  let html = ""
  for (const item of items) {
    html += `
      <ui-tree-item value="${item.value}"${item.disabled ? " disabled" : ""}>
        <ui-tree-item-label>
          ${
            item.children
              ? `<ui-tree-item-indicator>${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</ui-tree-item-indicator>`
              : ""
          }
          ${item.label}
        </ui-tree-item-label>
        ${item.children ? `<ui-tree-group>${markup(item.children)}</ui-tree-group>` : ""}
      </ui-tree-item>`
  }
  return html
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <ui-switch default-checked>
            <ui-switch-thumb></ui-switch-thumb>
          </ui-switch>
          Focusable when disabled
        </label>
      </div>
      <ui-tree aria-label="Plans" default-expanded="plans">
        ${markup(items)}
      </ui-tree>
    </div>
  `
  const tree = root.querySelector("ui-tree")!
  tree.items = items
  root
    .querySelector("ui-switch")!
    .addEventListener("checkedchange", (event) => {
      tree.setAttribute("focusable-when-disabled", String(event.detail.value))
    })
}

export { mount }
```

Arrow through Enterprise while Focusable when disabled is on. Turn it off and the same arrow keys skip disabled items.

## Loading Children

Mark an item as a `branch` before its children exist. `loadChildren` runs the first time that branch expands while empty. Load and render its children, then let the promise resolve; the tree expands the branch once they are ready.

Use the supplied `signal` to cancel a request. Trying to expand the branch again while it loads aborts it. A rejection sets `data-failed`, and the next attempt retries. `announcement` lets you customize loading and failure messages.

```ts title="lazy.ts"
import "@ui-sdk/web/tree"
import {
  ChevronRight,
  createElement,
  LoaderCircle,
  RotateCw,
  type IconNode,
} from "lucide"

type Node = { value: string; label: string; branch?: boolean }

const top: Node[] = [
  { value: "users", label: "users", branch: true },
  { value: "orders", label: "orders", branch: true },
  { value: "archive", label: "archive", branch: true },
]

let archiveAsked = false
async function fetchChildren(value: string, signal: AbortSignal) {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 800)
    signal.addEventListener(
      "abort",
      () => (clearTimeout(timer), reject(signal.reason))
    )
  })
  if (value === "archive" && !archiveAsked) {
    archiveAsked = true
    throw new Error("Network error")
  }
  return Array.from({ length: 3 }, (_, index) => ({
    value: `${value}/${index + 1}`,
    label: `${value.slice(0, -1)}_${index + 1}.json`,
  }))
}

const icon = (node: IconNode, show: string) =>
  createElement(node, { "aria-hidden": "true", "data-show": show }).outerHTML

const markup = (items: Node[]) =>
  items
    .map(
      (item) => `
        <ui-tree-item value="${item.value}"${item.branch ? " branch" : ""}>
          <ui-tree-item-label>
            ${
              item.branch
                ? `<ui-tree-item-indicator>
                    ${icon(LoaderCircle, "loading")}
                    ${icon(RotateCw, "failed")}
                    ${icon(ChevronRight, "idle")}
                  </ui-tree-item-indicator>`
                : ""
            }
            ${item.label}
          </ui-tree-item-label>
        </ui-tree-item>`
    )
    .join("")

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tree aria-label="Database">
      ${markup(top)}
    </ui-tree>
  `
  const tree = root.querySelector("ui-tree")!
  tree.loadChildren = async (value, { signal }) => {
    const children = await fetchChildren(value, signal)
    tree
      .querySelector(`ui-tree-item[value="${value}"]`)!
      .insertAdjacentHTML(
        "beforeend",
        `<ui-tree-group>${markup(children)}</ui-tree-group>`
      )
  }
  tree.announcement = ({ type, label }) =>
    ({
      expanded: "Expanded",
      collapsed: "Collapsed",
      loading: `Loading ${label}`,
      "load-failed": `${label} didn't load. Try again.`,
    })[type]
}

export { mount }
```

Expand users to load its files. Archive fails on its first attempt and shows a retry icon; expand it again to load it.

## Virtualized

Pass the full `items` hierarchy and use `visibleTreeRows(items, expanded)` to flatten the open branches. Render the nearby rows with their position; the tree supplies the correct ARIA hierarchy even though the DOM is flat.

The `highlight` event reports the focused item's index among visible rows. Use it to scroll before mounting a row that is outside the rendered range. Every item sets `--tree-level`, so the stylesheet indents the flat rows by their level.

```ts title="virtualized.ts"
import { visibleTreeRows, type TreeItemData } from "@ui-sdk/core/tree"
import "@ui-sdk/web/tree"
import { ChevronRight, createElement } from "lucide"

const items: TreeItemData[] = Array.from({ length: 100 }, (_, folder) => ({
  value: `folder-${folder + 1}`,
  label: `Folder ${folder + 1}`,
  children: Array.from({ length: 100 }, (_, file) => ({
    value: `folder-${folder + 1}/file-${file + 1}`,
    label: `File ${file + 1}.txt`,
  })),
}))

const row = 32
const height = 288

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="scroll">
      <ui-tree aria-label="Archive" default-expanded="folder-1"></ui-tree>
    </div>
  `
  const scroller = root.querySelector("div")!
  const tree = root.querySelector("ui-tree")!

  let rows = visibleTreeRows(items, ["folder-1"])

  const rendered = new Map<string, HTMLElement>()
  const render = () => {
    tree.style.height = `${rows.length * row}px`
    const start = Math.max(0, Math.floor(scroller.scrollTop / row) - 4)
    const end = Math.min(
      rows.length,
      Math.ceil((scroller.scrollTop + height) / row) + 4
    )
    const visible = new Map(
      rows.slice(start, end).map((entry) => [entry.item.value, entry])
    )
    for (const [value, el] of rendered) {
      if (visible.has(value)) {
        continue
      }
      el.remove()
      rendered.delete(value)
    }
    for (const [value, { item, index }] of visible) {
      let el = rendered.get(value)
      if (!el) {
        tree.insertAdjacentHTML(
          "beforeend",
          `<ui-tree-item value="${item.value}">
            <ui-tree-item-label>
              ${
                item.children
                  ? `<ui-tree-item-indicator>${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</ui-tree-item-indicator>`
                  : ""
              }
              ${item.label}
            </ui-tree-item-label>
          </ui-tree-item>`
        )
        el = tree.lastElementChild as HTMLElement
        rendered.set(value, el)
      }
      el.style.top = `${index * row}px`
    }
  }
  render()
  tree.items = items
  scroller.addEventListener("scroll", render)
  tree.addEventListener("expandedchange", (event) => {
    rows = visibleTreeRows(items, event.detail.value)
    render()
  })
  tree.addEventListener("highlight", (event) => {
    const { index } = event.detail
    const top = index * row
    if (top < scroller.scrollTop) {
      scroller.scrollTop = top
    } else if (top + row > scroller.scrollTop + scroller.clientHeight - 10) {
      scroller.scrollTop = top + row - scroller.clientHeight + 10
    }
    render()
  })
}

export { mount }
```

Expand folders or press End to focus Folder 100. The tree has 10,100 items, but only nearby rows render.

## Find in Page

`hidden-until-found` keeps collapsed groups in the DOM with `hidden="until-found"`. In browsers that support it, Find in Page can match a hidden item and open its ancestors. Use `keep-mounted` when you only need collapsed content to stay mounted, without browser search.

```ts title="find-in-page.ts"
import type { TreeItemData } from "@ui-sdk/core/tree"
import "@ui-sdk/web/tree"
import { ChevronRight, createElement } from "lucide"

const items: TreeItemData[] = [
  {
    value: "planets",
    label: "Planets",
    children: [
      { value: "mercury", label: "Mercury" },
      { value: "venus", label: "Venus" },
      {
        value: "earth",
        label: "Earth",
        children: [{ value: "moon", label: "The Moon" }],
      },
      {
        value: "mars",
        label: "Mars",
        children: [
          { value: "phobos", label: "Phobos" },
          { value: "deimos", label: "Deimos" },
        ],
      },
    ],
  },
  {
    value: "dwarf-planets",
    label: "Dwarf planets",
    children: [
      { value: "ceres", label: "Ceres" },
      {
        value: "pluto",
        label: "Pluto",
        children: [{ value: "charon", label: "Charon" }],
      },
    ],
  },
]

function markup(items: TreeItemData[]) {
  let html = ""
  for (const item of items) {
    html += `
      <ui-tree-item value="${item.value}">
        <ui-tree-item-label>
          ${
            item.children
              ? `<ui-tree-item-indicator>${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</ui-tree-item-indicator>`
              : ""
          }
          ${item.label}
        </ui-tree-item-label>
        ${item.children ? `<ui-tree-group>${markup(item.children)}</ui-tree-group>` : ""}
      </ui-tree-item>`
  }
  return html
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tree aria-label="Solar system" hidden-until-found>
      ${markup(items)}
    </ui-tree>
  `
  root.querySelector("ui-tree")!.items = items
}

export { mount }
```

Use your browser's Find command to look for Phobos, a moon of Mars. The matching branches open to reveal it.

## Animation

A group exposes its measured height as `--tree-group-height`. Transition between that height and zero from `data-starting-style` and `data-ending-style`:

```css
[data-slot="tree-group"] {
  height: var(--tree-group-height);
  overflow: hidden;
  transition: height 150ms ease-out;

  &:is([data-starting-style], [data-ending-style]) {
    height: 0;
  }
}
```

The group stays mounted until its closing animation ends. Groups open on the first render, or revealed by Find in Page, don't animate.

## Controlled

Selection, expanded branches, and checkboxes are independent:

| Value      | Shape                                          | Change Notification |
| ---------- | ---------------------------------------------- | ------------------- |
| `value`    | A string or `null`; an array in multiple mode. | `valuechange`       |
| `expanded` | An array of branch values.                     | `expandedchange`    |
| `checked`  | An array shaped by the check strategy.         | `checkedchange`     |

Read or set these properties on the element, and listen to their change events, or use `default-value`, `default-expanded`, and `default-checked` for starting state. Call `event.preventDefault()` in a change event to reject a change. [State and Events](../state-and-events.md) covers the shared binding pattern.

## Controller

The element's `api` can expand or collapse branches, change selection and checkboxes, or focus an item. `reveal(value)` opens an item's ancestors, scrolls it into view, and focuses it. Supply the hierarchy through `items`, as this example does, or keep collapsed groups mounted so their descendants are known. See [Controllers](../controllers.md) for setup and lifecycle.

```ts title="controller.ts"
import type { TreeItemData } from "@ui-sdk/core/tree"
import "@ui-sdk/web/tree"
import { ChevronRight, createElement } from "lucide"

const sections: TreeItemData[] = [
  {
    value: "account",
    label: "Account",
    children: [
      { value: "profile", label: "Profile" },
      {
        value: "security",
        label: "Security",
        children: [
          { value: "password", label: "Password" },
          { value: "two-factor", label: "Two-factor authentication" },
        ],
      },
    ],
  },
  {
    value: "workspace",
    label: "Workspace",
    children: [
      { value: "members", label: "Members" },
      { value: "billing", label: "Billing" },
    ],
  },
]

function markup(items: TreeItemData[]) {
  let html = ""
  for (const item of items) {
    html += `
      <ui-tree-item value="${item.value}">
        <ui-tree-item-label>
          ${
            item.children
              ? `<ui-tree-item-indicator>${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</ui-tree-item-indicator>`
              : ""
          }
          ${item.label}
        </ui-tree-item-label>
        ${item.children ? `<ui-tree-group>${markup(item.children)}</ui-tree-group>` : ""}
      </ui-tree-item>`
  }
  return html
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Expand All</button>
        <button type="button">Collapse All</button>
        <button type="button">Find Two-Factor</button>
      </div>
      <ui-tree aria-label="Settings">
        ${markup(sections)}
      </ui-tree>
    </div>
  `
  const tree = root.querySelector("ui-tree")!
  const [expand, collapse, find] = root.querySelectorAll("button")
  tree.items = sections
  expand.addEventListener("click", () => tree.api.expandAll())
  collapse.addEventListener("click", () => tree.api.collapseAll())
  find.addEventListener("click", () => {
    tree.api.setValue("two-factor")
    tree.api.reveal("two-factor")
  })
}

export { mount }
```

Press Find Two-Factor to open Account and Security, then select and focus Two-factor authentication. Collapse All closes every branch.

## Custom Rendering

Elements have no render functions. The Links example binds `ui-tree-item-label` to an `a` with `as-child`; a link in a label leaves the tab order to its item. Put anything inside a part and show it from the part's data attributes, as the File Paths and Loading Children examples do for their spinners with `data-pending` and `data-loading`. See [Parts and Composition](../parts-and-composition.md) for binding your own element.

## Styling

Style each row through `ui-tree-item-label`, which carries its item's `data-selected`, `data-expanded`, `data-branch`, `data-current`, `data-disabled`, `data-loading`, `data-failed` and `data-pending`. An item's own background would also cover its children. Focus stays on the item, so style a focused row as a label inside an item with `:focus-visible`. Turn the indicator with its `data-expanded`, and indent rows with `--tree-level` or padding on each group.

Each part has a `data-slot`, such as `tree-label`, and its state attributes are listed under [Data Attributes](#data-attributes).

### `<ui-tree-item>`
- `--tree-level`: The item's depth, 1 for a top-level item. Indent a flat tree with it.

### `<ui-tree-group>`
- `--tree-group-height`: The group's content height in pixels while it animates, auto once expanded and 0px while collapsed.

## Data Attributes

### `<ui-tree-item>`
`[data-slot="tree-item"]`

- `data-level` (`1`, `2`): The item's depth, from 1 at the top level. Also in the `--tree-level` variable.
- `data-branch`: Present on a branch: an item with children, or with `branch` set.
- `data-expanded`: Present while a branch is expanded.
- `data-indeterminate`: Present while only some of a branch is checked, with `checkable`.
- `data-selected`: Present while the item is selected.
- `data-current`: Present on the item for the current page, from `current`.
- `data-checked`: Present while the item's checkbox is checked, with `checkable`.
- `data-disabled`: Present when the item, or the whole tree, is disabled.
- `data-unchecked`: Present while the item's checkbox is unchecked, with `checkable`.
- `data-loading`: Present while `loadChildren` loads the branch's children.
- `data-failed`: Present after the branch's children failed to load, until it loads again.
- `data-pending`: Present while the item's `onAction` Promise hasn't settled.

### `<ui-tree-item-label>`
`[data-slot="tree-label"]`

- `data-level` (`1`, `2`): The item's depth, from 1 at the top level. Also in the `--tree-level` variable.
- `data-branch`: Present on a branch: an item with children, or with `branch` set.
- `data-expanded`: Present while a branch is expanded.
- `data-selected`: Present while the item is selected.
- `data-current`: Present on the item for the current page, from `current`.
- `data-disabled`: Present when the item, or the whole tree, is disabled.
- `data-loading`: Present while `loadChildren` loads the branch's children.
- `data-failed`: Present after the branch's children failed to load, until it loads again.
- `data-pending`: Present while the item's `onAction` Promise hasn't settled.

### `<ui-tree-item-indicator>`
`[data-slot="tree-indicator"]`

- `data-level` (`1`): The item's depth, from 1 at the top level. Also in the `--tree-level` variable.
- `data-branch`: Present on a branch: an item with children, or with `branch` set.
- `data-expanded`: Present while a branch is expanded.
- `data-loading`: Present while `loadChildren` loads the branch's children.
- `data-failed`: Present after the branch's children failed to load, until it loads again.
- `data-pending`: Present while the item's `onAction` Promise hasn't settled.

### `<ui-tree-item-checkbox>`
`[data-slot="tree-checkbox"]`

- `data-indeterminate`: Present while only some of a branch is checked, with `checkable`.
- `data-checked`: Present while the item's checkbox is checked, with `checkable`.
- `data-unchecked`: Present while the item's checkbox is unchecked, with `checkable`.

### `<ui-tree-group>`
`[data-slot="tree-group"]`

- `data-open`: Present while the group's branch is expanded.
- `data-closed`: Present while the group's branch is collapsed, including while it animates out.

## API Reference

Props are attributes in kebab case, like `mode` and `default-expanded`. Lists, like `expanded`, are values separated by commas. `items`, `paths`, `loadChildren`, `announcement` and `controller` are properties. Callbacks are DOM events on `<ui-tree>` that don't bubble, with the new state in `event.detail.value` and the `reason` and `event` beside it.

### Tree

- `items?` (`TreeItemData[]`): The items as data: each a `value`, a `label` and, for a branch, `children`. Renders them for you, and gives the tree its whole shape even where rows aren't rendered.
- `paths?` (`readonly string[]`): Items from file paths, like `["src/index.ts", "README.md"]`: each folder becomes a branch, folders first. A path ending in `/` is an empty folder.
- `mode?` (`Mode`): How many items can be selected.
- `value?` (`TreeValue<Mode>`): The selected value. Pass it to control the selection. `null` selects nothing, and with `mode: "multiple"` it's a list.
- `defaultValue?` (`TreeValue<Mode>`): The value selected at first, when uncontrolled.
- `valuechange event`: Runs when the selection wants to change. `details.reason` says why, and `details.cancel()` stops it.
- `activation?` (`"automatic" | "manual"`): Whether moving focus with the keyboard selects, with one item selectable: `"automatic"` selects the focused item, `"manual"` waits for Enter, Space or a press.
- `expanded?` (`string[]`): The expanded branches' values. Pass it to control which branches are open.
- `defaultExpanded?` (`string[]`): The branches expanded at first, when uncontrolled. The ancestors of `current` are added.
- `expandedchange event`: Runs when branches want to expand or collapse. `details.reason` says why, and `details.cancel()` stops it.
- `expandOnPress?` (`boolean`): Whether pressing a branch's row expands or collapses it. Its indicator always does.
- `checkable?` (`boolean`): Gives every item a tri-state checkbox, kept apart from the selection. Checking a branch checks everything in it, and a branch shows mixed while only some of it is checked. Space checks the focused item.
- `checked?` (`string[]`): The checked items' values, as `checkStrategy` reports them. Pass it to control the checkboxes.
- `defaultChecked?` (`string[]`): The items checked at first, when uncontrolled. A branch stands for everything in it.
- `checkedchange event`: Runs when checkboxes want to change. `details.reason` says why, and `details.cancel()` stops it.
- `checkStrategy?` (`TreeCheckStrategy`): Which items the checked value lists: `"leaf"` the checked leaves, `"trunk"` the outermost fully checked items, `"branch"` every fully checked item, and `"independent"` each item on its own, with no cascading.
- `action event`: Runs when an item is pressed or Enter is pressed on it, apart from selecting it, like opening a file. Return a Promise to mark the item pending until it settles.
- `pendingAnnouncement?` (`string`): What screen readers hear once an item's action has been pending for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `loadChildren?` (`((value: string, details: { signal: AbortSignal; }) => void | Promise<unknown>)`): Loads a branch's children the first time it expands while it has none. The branch shows `data-loading` and expands once the Promise resolves; a rejection marks it `data-failed` and the next expand tries again. Expanding it again while loading cancels through `signal`.
- `current?` (`string | null`): The value of the item for the current page. It gets `aria-current="page"`, takes the tab stop first, and its ancestors expand, at first and whenever it changes.
- `highlight event`: Runs when the keyboard moves focus to an item, with its row among the items that show, from 0. A virtualized list scrolls that row into view here, so an item it hasn't rendered can take focus once it does.
- `disabled?` (`boolean`): Disables every item. Items stay focusable unless `focusableWhenDisabled` is false.
- `focusableWhenDisabled?` (`boolean`): Whether disabled items take focus, so a screen reader still finds them.
- `keepMounted?` (`boolean`): Whether collapsed branches keep their groups in the page, hidden.
- `hiddenUntilFound?` (`boolean`): Keeps collapsed groups in the page as `hidden="until-found"`, so the browser's find in page can match their text and expand them.
- `announcement?` (`((change: TreeAnnouncement) => string | null | undefined)`): What screen readers hear when a branch expands, collapses, starts loading or fails to load. Return null for nothing. Expanding and collapsing are announced on Apple platforms only, where VoiceOver doesn't read the change.
- `controller?` (`object`): Drives the tree from anywhere. Create one with `createTreeController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### TreeItem

- `value` (`string`): Identifies the item, unique in the tree. Passed to `action`, and listed by the value, `expanded` and `checked`.
- `branch?` (`boolean`): Whether it's a branch. Adapters set it when it has a group; set it yourself for a branch whose children load later.
- `disabled?` (`boolean`): Stops it from being selected, checked, expanded or run. It stays focusable unless `focusableWhenDisabled` is false.
- `label?` (`string`): The text typeahead matches, when its label isn't plain text.

### TreeGroup

- `keepMounted?` (`boolean`): Whether the group stays in the page, hidden, while collapsed. Overrides the tree's.
- `hiddenUntilFound?` (`boolean`): Whether the group stays findable with `hidden="until-found"` while collapsed. Overrides the tree's.

### Items as Data

Each item in `items`:

- `value` (`string`): Identifies the item. Unique in the tree.
- `label` (`string`): What it shows, and what typeahead matches.
- `children?` (`TreeItemData[]`): Its children. Leave it out for a leaf. An empty array is a branch with no children, or one whose children load when it opens.
- `disabled?` (`boolean`): Whether it can't be selected, checked or activated. It can still take focus.
- `href?` (`string`): Makes the item a link to this address.

Each row `visibleTreeRows(items, expanded)` returns, for a flat list:

- `item` (`TreeItemData`): The object from your data this row shows, the same one you passed in, children included.
- `parent` (`string | null`): The value of the item it's nested in, or `null` at the top level.
- `level` (`number`): Its depth, 1 at the top level.
- `index` (`number`): Its place among the rows that show, from 0, for a virtualized list.

### State

The same state shows as data attributes on each element.

`Tree`:

- `mode` (`TreeMode`): How many items can be selected.
- `checkable` (`boolean`): Whether items have checkboxes.
- `disabled` (`boolean`): Whether the whole tree is disabled, by its `disabled` option or a disabled fieldset around it.

`TreeItem`, and its `TreeItemLabel`, `TreeItemIndicator` and `TreeItemCheckbox`:

- `expanded` (`boolean`): Whether it's a branch that's expanded.
- `selected` (`boolean`): Whether its value is in the tree's value. Separate from `checked`, which its checkbox sets.
- `checked` (`TreeCheckedState`): Its checkbox: checked, unchecked or `"indeterminate"`. False without `checkable`.
- `disabled` (`boolean`): Whether it can't be selected, checked, expanded or run.
- `branch` (`boolean`): Whether it has children, or can load them.
- `level` (`number`): Its depth, 1 at the top level.
- `current` (`boolean`): Whether it's the current page's item.
- `loading` (`boolean`): Whether its children are loading.
- `failed` (`boolean`): Whether loading its children failed.
- `pending` (`boolean`): Whether its `onAction` is still running.

`TreeGroup`:

- `expanded` (`boolean`): Whether its branch is expanded.
- `level` (`number`): The depth of the items in it.

### Reasons

Why branches expanded or collapsed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `find-in-page` (`Event`): The browser's find in page matched hidden content.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

Why the selection changed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

And why the checkboxes changed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods.

- `getExpanded()` (`() => string[]`): The values of the expanded branches.
- `setExpanded(expanded, options?)` (`(expanded: string[], options?: TreeChangeOptions<TreeExpandedChangeReason> | undefined) => boolean`): Expands exactly these branches. Returns false when canceled.
- `isExpanded(value)` (`(value: string) => boolean`): Whether a branch is expanded.
- `expand(value, options?)` (`(value: string, options?: TreeChangeOptions<TreeExpandedChangeReason> | undefined) => boolean`): Expands a branch, loading its children first with `loadChildren` when it has none.
- `collapse(value, options?)` (`(value: string, options?: TreeChangeOptions<TreeExpandedChangeReason> | undefined) => boolean`): Collapses a branch. Focus inside it moves to the branch.
- `toggle(value, options?)` (`(value: string, options?: TreeChangeOptions<TreeExpandedChangeReason> | undefined) => boolean`): Expands a collapsed branch, or collapses an expanded one.
- `expandAll(options?)` (`(options?: TreeChangeOptions<TreeExpandedChangeReason> | undefined) => boolean`): Expands every branch, and every branch that renders inside one later.
- `collapseAll(options?)` (`(options?: TreeChangeOptions<TreeExpandedChangeReason> | undefined) => boolean`): Collapses every branch.
- `getValue()` (`() => string | string[] | null`): The selected value: a value or `null`, or a list with `mode: "multiple"`.
- `setValue(value, options?)` (`(value: string | string[] | null, options?: TreeChangeOptions<TreeValueChangeReason> | undefined) => boolean`): Selects these items.
- `getChecked()` (`() => string[]`): The checked value, as `checkStrategy` reports it.
- `setChecked(checked, options?)` (`(checked: string[], options?: TreeChangeOptions<TreeCheckedChangeReason> | undefined) => boolean`): Sets the checked value.
- `checkedState(value)` (`(value: string) => TreeCheckedState`): Whether an item's checkbox is checked, unchecked or `"indeterminate"`.
- `reveal(value)` (`(value: string) => void`): Expands an item's ancestors, scrolls it into view and focuses it.
- `focus(value?)` (`(value?: string | undefined) => void`): Focuses an item, or the item with the tab stop.

## Accessibility

The tree follows the [WAI-ARIA tree view pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/). Items have the `treeitem` role with `aria-level`, `aria-expanded` on branches, and `aria-checked` when the tree is checkable.

### Keyboard

The tree has one tab stop. Tab enters at the current page, the selected item, or the first item, then returns to the item focused last.

| Key                         | Action                                                 |
| --------------------------- | ------------------------------------------------------ |
| Down / Up Arrow             | Focus the next or previous visible item.               |
| Right Arrow                 | Expand a branch, or enter its first child.             |
| Left Arrow                  | Collapse a branch, or focus its parent.                |
| Home / End                  | Focus the first or last visible item.                  |
| Alt+Right / Alt+Left Arrow  | Expand or collapse a branch and its descendants.       |
| `*`                         | Expand sibling branches.                               |
| Enter                       | Select and run the item's action, or follow its link.  |
| Space                       | Check the item when checkable, otherwise select it.    |
| Shift+Down / Shift+Up Arrow | Extend a multiple selection.                           |
| Cmd+A / Ctrl+A              | Select visible items in multiple selection mode.       |
| Typing                      | Focus the next item whose label starts with that text. |

Option is Alt on a Mac. In right-to-left text, Left and Right swap.

### Tested Behavior

Every line below is an automated test.

**Expanding and collapsing**

- Branches start collapsed, and only top-level items show.
- Clicking a branch expands it and shows its children.
- Clicking the indicator expands without selecting.
- A change can be canceled.
- A default can expand nested branches.
- A controller expands and collapses everything.
- Reveal expands an item's ancestors and focuses it.

**Keyboard**

- Tab reaches the tree once, on the first item.
- Down and Up move between the items that show.
- Right expands a branch, then moves to its first child.
- Right on a leaf does nothing.
- Left collapses a branch, then moves to its parent.
- Home and End move to the first and last items that show.
- * expands every branch beside the focused item.
- Alt+Right expands a branch and everything in it.
- Typing moves to the next item that starts with the text.
- Enter selects the item and runs its action.
- A key on a nested item acts on that item only.

**Selection**

- Clicking an item selects it alone.
- The selected item takes the tab stop.
- Disabled items take focus but can't be selected.
- With multiple selection, Shift+Down extends and Ctrl+A selects everything.
- With automatic activation, moving focus selects.
- Without selection, items have no aria-selected.

**Checkboxes**

- Checking a branch checks everything in it.
- Space checks the focused item, and a disabled item keeps its check.
- Checking a leaf leaves the selection and the branch alone.

**Positions**

- Every item says its level and place among its siblings.
- The current page's item is marked.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while using the tree with a keyboard.
- Expanding the focused item is announced on Apple platforms.
- Nothing is announced elsewhere, where screen readers read the change.

Runs in React, Vue and web components.
