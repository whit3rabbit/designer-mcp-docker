# Pagination

Navigate pages with buttons, links, or your router.

```ts title="basic.ts"
import "@ui-sdk/web/pagination"
import { ChevronLeft, ChevronRight, createElement, Ellipsis } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-pagination aria-label="Pagination" page-count="10">
      <ui-pagination-list>
        <ui-pagination-item>
          <ui-pagination-previous>
            <button data-variant="ghost">
              ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
              <span data-slot="visually-hidden">Previous</span>
            </button>
          </ui-pagination-previous>
        </ui-pagination-item>
        <template>
          <ui-pagination-item>
            <ui-pagination-link>
              <button data-variant="ghost"></button>
            </ui-pagination-link>
          </ui-pagination-item>
        </template>
        <template data-ellipsis>
          <ui-pagination-item>
            <ui-pagination-ellipsis>${createElement(Ellipsis, { "aria-hidden": "true" }).outerHTML}</ui-pagination-ellipsis>
          </ui-pagination-item>
        </template>
        <ui-pagination-item>
          <ui-pagination-next>
            <button data-variant="ghost">
              <span data-slot="visually-hidden">Next</span>
              ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-pagination-next>
        </ui-pagination-item>
      </ui-pagination-list>
    </ui-pagination>
  `
  root
    .querySelector("ui-pagination")!
    .addEventListener("pagechange", (event) => {
      const { value, reason } = event.detail
      log(root, `Page ${value} (${reason})`)
    })
}

export { mount }
```

Choose a page, or use Previous and Next. The console logs each page and its reason, and the step at either end stays focusable as a button.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. On the server the import does nothing.

```ts
import "@ui-sdk/web/pagination"
```

## Composition

Use the following composition to build a `ui-pagination`:

```text
ui-pagination
└── ui-pagination-list
    ├── ui-pagination-item
    │   └── ui-pagination-previous
    │       └── button
    ├── template
    │   └── ui-pagination-item
    │       └── ui-pagination-link
    │           └── button
    ├── template
    │   └── ui-pagination-item
    │       └── ui-pagination-ellipsis
    └── ui-pagination-item
        └── ui-pagination-next
            └── button
```

Name the navigation with `aria-label`, then put the page links and steps in a list.

A list with a `<template>` renders the range from it: one copy for each page, with the page number in an empty button, and the `<template data-ellipsis>` for each gap. Without the ellipsis template, gaps get a plain `<ui-pagination-ellipsis>`. Links and steps wrap your own `<button>`, or an `<a>` with [`getHref`](#links), so style those. Links you write yourself, like a server's, take a `page` attribute.

The template keeps page entries keyed as the range moves. The current page's wrapped button gets `aria-current="page"` and `data-current`; an ellipsis shows “…” and is hidden from screen readers.

Give each step text or an `aria-label` on its wrapped button. At an end, the button gets `aria-disabled="true"` and `data-disabled` and stops changing the page. As a button, it stays in the tab order.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/pagination"
</script>

<ui-pagination aria-label="Pagination" page-count="10">
  <ui-pagination-list>
    <ui-pagination-item>
      <ui-pagination-previous><button>Previous</button></ui-pagination-previous>
    </ui-pagination-item>
    <template>
      <ui-pagination-item>
        <ui-pagination-link><button></button></ui-pagination-link>
      </ui-pagination-item>
    </template>
    <ui-pagination-item>
      <ui-pagination-next><button>Next</button></ui-pagination-next>
    </ui-pagination-item>
  </ui-pagination-list>
</ui-pagination>
```

## Total and Page Size

Instead of `page-count`, pass `total`, how many items there are, and `page-size`, how many fit on a page (10 by default). Pagination calculates the page count, with a minimum of one. This example resets to page 1 when the page size changes.

A page past the end, like after the count shrinks, reads as the last page.

```ts title="total.ts"
import "@ui-sdk/web/pagination"
import { ChevronLeft, ChevronRight, createElement, Ellipsis } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="row">
        <p>Showing 21–40 of 95</p>
        <label data-slot="label">
          Rows per page
          <select>
            <option value="10">10</option>
            <option value="20" selected>20</option>
            <option value="50">50</option>
          </select>
        </label>
      </div>
      <ui-pagination aria-label="Pagination" total="95" page-size="20" default-page="2">
        <ui-pagination-list>
          <ui-pagination-item>
            <ui-pagination-previous>
              <button data-variant="ghost">
                ${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}
                <span data-slot="visually-hidden">Previous</span>
              </button>
            </ui-pagination-previous>
          </ui-pagination-item>
          <template>
            <ui-pagination-item>
              <ui-pagination-link>
                <button data-variant="ghost"></button>
              </ui-pagination-link>
            </ui-pagination-item>
          </template>
          <template data-ellipsis>
            <ui-pagination-item>
              <ui-pagination-ellipsis>${createElement(Ellipsis, { "aria-hidden": "true" }).outerHTML}</ui-pagination-ellipsis>
            </ui-pagination-item>
          </template>
          <ui-pagination-item>
            <ui-pagination-next>
              <button data-variant="ghost">
                <span data-slot="visually-hidden">Next</span>
                ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}
              </button>
            </ui-pagination-next>
          </ui-pagination-item>
        </ui-pagination-list>
      </ui-pagination>
    </div>
  `
  const pagination = root.querySelector("ui-pagination")!
  const select = root.querySelector("select")!
  const showing = (page: number) => {
    const size = Number(select.value)
    root.querySelector("p")!.textContent =
      `Showing ${(page - 1) * size + 1}–${Math.min(page * size, 95)} of 95`
  }
  pagination.addEventListener("pagechange", (event) => {
    showing(event.detail.value)
    if (event.detail.reason !== "imperative") {
      log(root, `Page ${event.detail.value}`)
    }
  })
  select.addEventListener("change", () => {
    pagination.setAttribute("page-size", select.value)
    pagination.page = 1
    showing(1)
    log(root, `${select.value} rows per page`)
  })
}

export { mount }
```

Choose a page, then change Rows per page. The console logs each change, and a new size starts again at page 1.

## Simple

With only a few pages, the range has no gaps, so you can write the links out and leave the steps off. Links you write yourself take a `page` attribute and need their own number.

```html
<ui-pagination aria-label="Pagination" page-count="5">
  <ui-pagination-list>
    <ui-pagination-item
      ><ui-pagination-link page="1"
        ><button>1</button></ui-pagination-link
      ></ui-pagination-item
    >
    <ui-pagination-item
      ><ui-pagination-link page="2"
        ><button>2</button></ui-pagination-link
      ></ui-pagination-item
    >
    <ui-pagination-item
      ><ui-pagination-link page="3"
        ><button>3</button></ui-pagination-link
      ></ui-pagination-item
    >
    <ui-pagination-item
      ><ui-pagination-link page="4"
        ><button>4</button></ui-pagination-link
      ></ui-pagination-item
    >
    <ui-pagination-item
      ><ui-pagination-link page="5"
        ><button>5</button></ui-pagination-link
      ></ui-pagination-item
    >
  </ui-pagination-list>
</ui-pagination>
```

## Links

Set the `getHref` property to map each page to a URL, and wrap `<a>` elements instead of buttons.

```html
<ui-pagination aria-label="Pagination" page-count="10">
  <ui-pagination-list>
    <ui-pagination-item>
      <ui-pagination-previous><a>Previous</a></ui-pagination-previous>
    </ui-pagination-item>
    <template>
      <ui-pagination-item>
        <ui-pagination-link><a></a></ui-pagination-link>
      </ui-pagination-item>
    </template>
    <ui-pagination-item>
      <ui-pagination-next><a>Next</a></ui-pagination-next>
    </ui-pagination-item>
  </ui-pagination-list>
</ui-pagination>
```

```ts
document.querySelector("ui-pagination")!.getHref = (page) =>
  `/posts?page=${page}`
```

Server-rendered anchors work before JavaScript loads. A normal click changes the page and follows the URL. Modifier clicks and middle clicks leave pagination state alone so the browser can open the link elsewhere.

A step at its end loses its `href` and leaves the tab order, but keeps focus if it already had it. During navigation, its original `href` stays in place so Next cannot accidentally follow the next page's URL.

## Router Links

Render your router's link to page on the client. Parts bind whatever `<a>` they wrap, so a router that listens for clicks on links keeps working. The pagination's click handler runs first: when a change is canceled or a step is at its end, it calls `preventDefault()`. Check `event.defaultPrevented` before navigating.

Read the page from the URL, like your router's search params, and set the [`page` property](#controlled) from it.

```ts
const pagination = document.querySelector("ui-pagination")!
pagination.getHref = (page) => `?page=${page}`
pagination.page = Number(new URL(location.href).searchParams.get("page") ?? 1)
```

## Controlled

The element owns its page. Listen for `pagechange`, and call `preventDefault()` on it to keep the current page. The `page` property reads the page, and setting it goes there.

```ts
const pagination = document.querySelector("ui-pagination")!
pagination.addEventListener("pagechange", (event) =>
  console.log(event.detail.value, event.detail.reason)
)
pagination.page = 1
```

Every change carries a [reason](#reasons): `item-press` for a page, `previous-press`, `next-press`, `first-press` or `last-press` for a step, and `imperative` from a [controller](#controller). Call `event.preventDefault()` to keep the page, like while a form has unsaved changes. A canceled change also stops a link from navigating.

## Default Page

`default-page` is the page it starts on, when uncontrolled. It's 1 by default.

```html
<ui-pagination aria-label="Pagination" page-count="10" default-page="5">
  ...
</ui-pagination>
```

## Siblings

`siblings` is how many pages show on each side of the current one, 1 by default. Near an end, the window slides over instead of shrinking, keeping the range length stable. A gap of one page shows that page instead of an ellipsis.

```html
<ui-pagination
  aria-label="Pagination"
  page-count="20"
  default-page="10"
  siblings="2"
>
  ...
</ui-pagination>
```

## Boundaries

`boundaries` is how many pages always show at each end, 1 by default.

```html
<ui-pagination
  aria-label="Pagination"
  page-count="20"
  default-page="10"
  boundaries="2"
>
  ...
</ui-pagination>
```

## Paging from Anywhere

The element's `api` property is its [controller](#controller): it pages the pagination from anywhere, like buttons elsewhere on the page or a keyboard shortcut. Or create one with `createPaginationController()` and set the `controller` property.

```html
<button type="button" data-action="next">Next Page</button>
<ui-pagination aria-label="Pagination" page-count="10"> ... </ui-pagination>
```

```ts
const pagination = document.querySelector("ui-pagination")!.api
document
  .querySelector('[data-action="next"]')!
  .addEventListener("click", () => pagination.next())
```

## Your Own Markup

`paginationRange({ page, pageCount, siblings, boundaries })` is the range the parts use, as a pure function. It runs anywhere, like on the server, in an email or for a UI that isn't a list of pages. Import it from `@ui-sdk/core/pagination`. Here it keeps a strip of slide dots the same length however many slides there are.

```html
<div role="group" aria-label="Slides"></div>
```

```ts
import { paginationRange } from "@ui-sdk/core/pagination"

function renderDots(group: HTMLElement, slide: number) {
  const items = paginationRange({
    page: slide,
    pageCount: 20,
    siblings: 2,
    boundaries: 1,
  })
  group.replaceChildren(
    ...items.map((item) => {
      if (typeof item !== "number") {
        const gap = document.createElement("span")
        gap.setAttribute("aria-hidden", "true")
        return gap
      }
      const dot = document.createElement("button")
      dot.setAttribute("aria-label", `Slide ${item}`)
      if (item === slide) dot.setAttribute("aria-current", "true")
      dot.addEventListener("click", () => renderDots(group, item))
      return dot
    })
  )
}
```

## Custom Rendering

Elements have no render functions. Links and steps wrap your own elements, so change them directly, and read state from their attributes, the `page` property or the `pagechange` event: whether a link is current, and for a step, the page it goes to and whether it's disabled. Here a `pagechange` listener writes Page 3 into the current link, and gives each arrow the page it goes to and a title.

```ts title="render.ts"
import "@ui-sdk/web/pagination"
import { ArrowLeft, ArrowRight, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-pagination aria-label="Pagination" page-count="10">
      <ui-pagination-list>
        <ui-pagination-item>
          <ui-pagination-previous>
            <button aria-label="Previous page">
              ${createElement(ArrowLeft, { "aria-hidden": "true" }).outerHTML}
              <span aria-hidden="true"></span>
            </button>
          </ui-pagination-previous>
        </ui-pagination-item>
        <template>
          <ui-pagination-item>
            <ui-pagination-link>
              <button></button>
            </ui-pagination-link>
          </ui-pagination-item>
        </template>
        <ui-pagination-item>
          <ui-pagination-next>
            <button aria-label="Next page">
              <span aria-hidden="true"></span>
              ${createElement(ArrowRight, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-pagination-next>
        </ui-pagination-item>
      </ui-pagination-list>
    </ui-pagination>
  `
  const pagination = root.querySelector("ui-pagination")!

  function step(selector: string, page: number) {
    const button = root.querySelector<HTMLButtonElement>(`${selector} button`)!
    const disabled = page < 1 || page > pagination.api.getPageCount()
    button.querySelector("span")!.hidden = disabled
    button.querySelector("span")!.textContent = String(page)
    if (disabled) {
      button.removeAttribute("title")
    } else {
      button.title = `Go to page ${page}`
    }
  }

  function update() {
    const page = pagination.page
    step("ui-pagination-previous", page - 1)
    step("ui-pagination-next", page + 1)
    for (const link of root.querySelectorAll("ui-pagination-link[page]")) {
      const n = Number(link.getAttribute("page"))
      link.querySelector("button")!.textContent =
        n === page ? `Page ${n}` : String(n)
    }
  }

  queueMicrotask(update)
  pagination.addEventListener("pagechange", () => queueMicrotask(update))
}

export { mount }
```

Choose a page. The current page widens to say Page 3, and each arrow shows the page it goes to.

## Styling

Parts are unstyled. Style them through the attributes they render, which are the same in every framework: `aria-current="page"` or `data-current` on the current page's link, and `aria-disabled` or `data-disabled` on a step at its end.

Each part has a `data-slot`, such as `pagination-link`, and its state attributes are listed under [Data Attributes](#data-attributes). The root, list, items and ellipsis have none.

The list and its items are `<ui-pagination-list>` and `<ui-pagination-item>`, which display as blocks. Give the list `flex` to lay the pages out in a row.

## Data Attributes

### `<ui-pagination-link>`
`[data-slot="pagination-link"]`

- `data-current`: Present on the current page's link, beside `aria-current="page"`.

### `<ui-pagination-previous>`
`[data-slot="pagination-previous"]`

- `data-disabled`: Present on a step at the end it goes to, beside `aria-disabled`. It stays focusable and does nothing.

### `<ui-pagination-next>`
`[data-slot="pagination-next"]`

- `data-disabled`: Present on a step at the end it goes to, beside `aria-disabled`. It stays focusable and does nothing.

### `<ui-pagination-first>`
`[data-slot="pagination-first"]`

- `data-disabled`: Present on a step at the end it goes to, beside `aria-disabled`. It stays focusable and does nothing.

### `<ui-pagination-last>`
`[data-slot="pagination-last"]`

- `data-disabled`: Present on a step at the end it goes to, beside `aria-disabled`. It stays focusable and does nothing.

## API Reference

Props are attributes in kebab case, like `page-count`, `default-page` and `page-size`, and numbers are
numbers. `getHref` and `controller` are properties. `page` is a live property. Callbacks are DOM events.

### Pagination

- `page?` (`number`): The current page, from 1. Pass it to control the pagination.
- `defaultPage?` (`number`): The page it starts on, when uncontrolled.
- `pagechange event`: Runs when the page wants to change: a page link (`"item-press"`), the Previous, Next, First or Last part, or a controller (`"imperative"`). `details.cancel()` keeps the page, and stops a link from navigating.
- `pageCount?` (`number`): How many pages there are. Or pass `total` and `pageSize`.
- `total?` (`number`): How many items there are, for `pageCount` from `pageSize`.
- `pageSize?` (`number`): How many items fit on a page, with `total`.
- `siblings?` (`number`): How many pages show on each side of the current one.
- `boundaries?` (`number`): How many pages always show at each end.
- `getHref?` (`((page: number) => string)`): The URL of a page. With it, parts are links: they navigate, open in a new tab with a modifier key, and work before JavaScript loads. Without it, they're buttons.
- `controller?` (`object`): Pages it from anywhere. Create one with `createPaginationController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### PaginationLink

- `page` (`number`): The page the link goes to, from 1.

`PaginationList`, `PaginationItem`, `PaginationPrevious`, `PaginationNext`, `PaginationFirst`, `PaginationLast` and `PaginationEllipsis` take no props of their own.

### State

The same state shows as attributes on each link and step.

`Pagination` and `PaginationList`:

- `page` (`number`): The current page, from 1.
- `pageCount` (`number`): How many pages there are.
- `items` (`PaginationRangeItem[]`): The pages to show, with an ellipsis for each gap. Render a PaginationLink or a PaginationEllipsis for each.

`PaginationLink`:

- `page` (`number`): The page it goes to, from its `page` prop.
- `current` (`boolean`): Whether it's the current page.

`PaginationPrevious`, `PaginationNext`, `PaginationFirst` and `PaginationLast`:

- `page` (`number`): The page it goes to.
- `disabled` (`boolean`): Whether it's at the end it goes to, so it does nothing.

### Reasons

`event.detail.reason` says why the page changed.

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `previous-press` (`MouseEvent | KeyboardEvent`): A pagination's or a carousel's Previous part was pressed.
- `next-press` (`MouseEvent | KeyboardEvent`): A pagination's or a carousel's Next part was pressed.
- `first-press` (`MouseEvent | KeyboardEvent`): A pagination's First part was pressed.
- `last-press` (`MouseEvent | KeyboardEvent`): A pagination's Last part was pressed.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods.

Every write method takes an optional `{ reason, event }`, passed to `pagechange`, and returns `false` when the change is canceled or there's nowhere to go.

- `getPage()` (`() => number`): The current page, from 1.
- `getPageCount()` (`() => number`): How many pages there are.
- `setPage(page, options?)` (`(page: number, options?: PaginationChangeOptions | undefined) => boolean`): Goes to a page, clamped to the range. Returns false when canceled or already there.
- `next(options?)` (`(options?: PaginationChangeOptions | undefined) => boolean`): Goes to the next page. Returns false on the last page.
- `previous(options?)` (`(options?: PaginationChangeOptions | undefined) => boolean`): Goes to the previous page. Returns false on the first page.
- `first(options?)` (`(options?: PaginationChangeOptions | undefined) => boolean`): Goes to the first page.
- `last(options?)` (`(options?: PaginationChangeOptions | undefined) => boolean`): Goes to the last page.

### Events

Events fire on their own element and don't bubble, with the new page in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` cancels the change. Type the element as `UiPaginationElement` for typed listeners.

| Member                | On              | Description                                          |
| --------------------- | --------------- | ---------------------------------------------------- |
| `page` property       | `ui-pagination` | The current page. Setting it goes there              |
| `api` property        | `ui-pagination` | The [controller](#controller)                        |
| `getHref` property    | `ui-pagination` | A page's URL. With it, wrap links instead of buttons |
| `controller` property | `ui-pagination` | A controller from `createPaginationController()`     |
| `pagechange` event    | `ui-pagination` | `detail: { value: page, reason, event, source }`     |

## Accessibility

There's no WAI-ARIA pattern for pagination. It follows the common practice: a `navigation` landmark named with `aria-label`, a list of links or buttons, and `aria-current="page"` on the current one. The list keeps the `list` role even when styled without bullets, which Safari would otherwise drop.

### Focus

Steps rendered as buttons stay focusable at the ends. A clicked page link keeps focus as the range moves; the primitive also tries to restore focus to that page or step if rendering replaces its element. Key range entries by their value rather than their index.

### Tested Behavior

Every line below is an automated test.

- The pagination is a named navigation landmark with a list of pages.
- The first page is current to start with, or the default page.
- Pressing a page goes there.
- Enter on a focused page goes there.
- Space on a focused page goes there.
- Next and Previous step one page.
- First and Last go to the ends.
- First and Previous say they're disabled on the first page, and do nothing.
- Next and Last say they're disabled on the last page, and do nothing.
- A single page has nothing to step to.
- Siblings and boundaries widen the range.
- Ellipses are hidden from screen readers.
- With getHref, pages and steps are links to their pages.
- A link at an end has no href and says it's disabled.
- Pressing a link goes to its page and follows it.
- A change can be canceled.
- A canceled change stops a link from navigating.
- The controller pages it from outside.
- A controlled pagination follows its owner. React and Vue only.

Runs in React, Vue and web components.

Beyond the baseline:

- Pressing Next onto the last page keeps focus on Next.
- Pressing Previous onto the first page keeps focus on Previous.
- Paging through every page with the keyboard never loses focus.
- Pressing a page keeps focus on it while the range moves around it.
- Focus comes back to the same part when the list renders again from scratch. React and Vue only.
- The list has the same number of entries on every page, so nothing shifts under the pointer.
- A gap of one page shows that page instead of an ellipsis.
- A link pressed with a modifier opens elsewhere and leaves the page as it is.
- The list keeps its list role when styled without bullets.
- Steps at the ends stay in the tab order and say they're disabled.
- A Next link goes to the next page, not past it, even after the page renders again.
- A Next link onto the last page still goes there, though it ends there.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while paging with a keyboard.

Runs in React, Vue and web components.
