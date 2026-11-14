# Carousel

Page through slides with native scrolling, keyboard controls, and optional rotation.

Use a Carousel to show a set of slides one view at a time, like product photos or featured stories. It scrolls natively, so swipes and trackpads work, and Previous and Next buttons page through the slides.

```ts title="basic.ts"
import "@ui-sdk/web/carousel"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

const slides = [1, 2, 3, 4, 5]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-carousel aria-label="Featured">
      <div data-slot="row">
        <ui-carousel-previous>
          <button aria-label="Previous slide">${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-previous>
        <ui-carousel-viewport>
          <ui-carousel-content>
            ${slides.map((slide) => `<ui-carousel-item><div data-slot="tile">${slide}</div></ui-carousel-item>`).join("")}
          </ui-carousel-content>
        </ui-carousel-viewport>
        <ui-carousel-next>
          <button aria-label="Next slide">${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-next>
      </div>
    </ui-carousel>
  `
}

export { mount }
```

Use Previous and Next, swipe the slides, or focus the viewport and use the arrow keys.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. On the server the import does nothing.

```ts
import "@ui-sdk/web/carousel"
```

## Composition

Use the following composition to build a `ui-carousel`:

```text
ui-carousel
├── ui-carousel-viewport
│   └── ui-carousel-content
│       ├── ui-carousel-item
│       └── ui-carousel-item
├── ui-carousel-previous
│   └── button
└── ui-carousel-next
    └── button
```

Put the slides inside a viewport, then add the controls you need.

The viewport is the scrolling window, and the content is the row of slides inside it, a flex row (a column when vertical). Name the carousel with `aria-label`, like "Featured products". Previous, Next, the indicators and the play toggle wrap your own `<button>`: give it text, or an `aria-label` when it holds an icon.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/carousel"
</script>

<ui-carousel aria-label="Featured">
  <ui-carousel-viewport>
    <ui-carousel-content>
      <ui-carousel-item>First slide</ui-carousel-item>
      <ui-carousel-item>Second slide</ui-carousel-item>
    </ui-carousel-content>
  </ui-carousel-viewport>
  <ui-carousel-previous><button>Previous</button></ui-carousel-previous>
  <ui-carousel-next><button>Next</button></ui-carousel-next>
</ui-carousel>
```

## Vertical

`orientation="vertical"` scrolls up and down. Give the viewport a height. Up and down arrows page it, not left and right.

```ts title="vertical.ts"
import "@ui-sdk/web/carousel"
import { ChevronDown, ChevronUp, createElement } from "lucide"

const slides = [1, 2, 3, 4, 5]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-carousel aria-label="Featured" orientation="vertical">
      <ui-carousel-viewport>
        <ui-carousel-content>
          ${slides.map((slide) => `<ui-carousel-item><div data-slot="tile">${slide}</div></ui-carousel-item>`).join("")}
        </ui-carousel-content>
      </ui-carousel-viewport>
      <div data-slot="row">
        <ui-carousel-previous>
          <button aria-label="Previous slide">${createElement(ChevronUp, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-previous>
        <ui-carousel-next>
          <button aria-label="Next slide">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-next>
      </div>
    </ui-carousel>
  `
}

export { mount }
```

Scroll vertically, or use the up and down controls.

## Loop

`loop` makes the slides go round. Next on the last page goes to the first, which comes in after the last, and a swipe, a drag or a wheel back from the first page reaches the last, with native scrolling all the way. Rotation always wraps.

The slides take turns at the ends of the content with CSS `order` while the carousel rests, so the current page always has slides on both sides. They keep their place in the document, so screen readers and Tab follow the slides' own order. The content needs to lay its slides out in a row with even gaps, as flex and grid do, and hold a page of slides to either side of the current one. With fewer, like two slides one to a view, Next on the last page scrolls back to the first instead.

```ts title="loop.ts"
import "@ui-sdk/web/carousel"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

const slides = [1, 2, 3, 4, 5]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-carousel aria-label="Featured" loop>
      <div data-slot="row">
        <ui-carousel-previous>
          <button aria-label="Previous slide">${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-previous>
        <ui-carousel-viewport>
          <ui-carousel-content>
            ${slides.map((slide) => `<ui-carousel-item><div data-slot="tile">${slide}</div></ui-carousel-item>`).join("")}
          </ui-carousel-content>
        </ui-carousel-viewport>
        <ui-carousel-next>
          <button aria-label="Next slide">${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-next>
      </div>
    </ui-carousel>
  `
}

export { mount }
```

Keep moving forward or backward to wrap around the slides.

## Align

`align` lines pages up at the viewport's `start` (the default), `center` or `end`. Centered slides narrower than the viewport let their neighbors peek in. The first and last pages stay at the ends of the content, so there's no empty space before the first slide.

```ts title="align.ts"
import "@ui-sdk/web/carousel"
import "@ui-sdk/web/select"
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  createElement,
} from "lucide"

const photos = [
  { name: "Dunes" },
  { name: "Forest" },
  { name: "Glacier" },
  { name: "Canyon" },
  { name: "Meadow" },
  { name: "Harbor" },
]
const alignments = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <ui-select default-value="center">
          <ui-select-label>Align</ui-select-label>
          <ui-select-trigger>
            <button>
              <ui-select-value></ui-select-value>
              ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-select-trigger>
          <ui-select-content hidden>
            ${alignments
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
      <ui-carousel aria-label="Photos" align="center" default-page="2">
        <div data-slot="row">
          <ui-carousel-previous>
            <button aria-label="Previous slide">${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-carousel-previous>
          <ui-carousel-viewport>
            <ui-carousel-content>
              ${photos.map((photo) => `<ui-carousel-item><div data-slot="tile">${photo.name}</div></ui-carousel-item>`).join("")}
            </ui-carousel-content>
          </ui-carousel-viewport>
          <ui-carousel-next>
            <button aria-label="Next slide">${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-carousel-next>
        </div>
      </ui-carousel>
    </div>
  `
  const carousel = root.querySelector("ui-carousel")!
  root.querySelector("ui-select")!.addEventListener("valuechange", (event) => {
    if (event.detail.value) {
      carousel.setAttribute("align", String(event.detail.value))
    }
  })
}

export { mount }
```

Choose Start, Center or End, then page through the slides. Centered slides let their neighbors peek in on both sides.

## Default Page

`default-page` is the page it starts on, when uncontrolled. It's 1 by default.

```ts title="default-page.ts"
import "@ui-sdk/web/carousel"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

const slides = [1, 2, 3, 4, 5]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-carousel aria-label="Featured" default-page="3">
      <div data-slot="row">
        <ui-carousel-previous>
          <button aria-label="Previous slide">${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-previous>
        <ui-carousel-viewport>
          <ui-carousel-content>
            ${slides.map((slide) => `<ui-carousel-item><div data-slot="tile">${slide}</div></ui-carousel-item>`).join("")}
          </ui-carousel-content>
        </ui-carousel-viewport>
        <ui-carousel-next>
          <button aria-label="Next slide">${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-next>
      </div>
    </ui-carousel>
  `
}

export { mount }
```

Start on the chosen page, then move forward or backward.

## Indicators

Indicators are a tablist: one Tab stop on the current page, arrows to move between them and show their page, Home and End for the ends. Each controls the slides of its page.

Write one per slide. Those past the page count hide themselves, so the same markup works however many slides
fit. An indicator's `page` is inferred from their order; pass it to render the selected one on the server.

```ts title="indicators.ts"
import "@ui-sdk/web/carousel"

const photos = [
  { name: "Dunes" },
  { name: "Forest" },
  { name: "Glacier" },
  { name: "Canyon" },
  { name: "Meadow" },
  { name: "Harbor" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-carousel aria-label="Photos">
      <ui-carousel-viewport>
        <ui-carousel-content>
          ${photos.map((photo) => `<ui-carousel-item><div data-slot="tile">${photo.name}</div></ui-carousel-item>`).join("")}
        </ui-carousel-content>
      </ui-carousel-viewport>
      <ui-carousel-indicator-group aria-label="Choose a photo">
        ${photos.map((photo) => `<ui-carousel-indicator><button aria-label="${photo.name}"></button></ui-carousel-indicator>`).join("")}
      </ui-carousel-indicator-group>
    </ui-carousel>
  `
}

export { mount }
```

Choose a named indicator, then use arrows, Home, and End to move between them.

## Pages

`slides-per-page` is how many slides a page holds: Next moves that many, and each indicator stands for that
many. `"auto"` fits as many as show. Pages that can't reach the start, like the last few slides, merge into
the last page. With three slides in view, five slides make three pages at one slide per page, or two pages at three per page.

```ts title="pages.ts"
import "@ui-sdk/web/carousel"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

const products = [1, 2, 3, 4, 5, 6, 7, 8]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-carousel aria-label="Products" slides-per-page="3">
      <div data-slot="row">
        <ui-carousel-previous>
          <button aria-label="Previous page">${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-previous>
        <ui-carousel-viewport>
          <ui-carousel-content>
            ${products.map((product) => `<ui-carousel-item><div data-slot="tile">${product}</div></ui-carousel-item>`).join("")}
          </ui-carousel-content>
        </ui-carousel-viewport>
        <ui-carousel-next>
          <button aria-label="Next page">${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-next>
      </div>
      <div data-slot="row">
        <ui-carousel-indicator-group aria-label="Choose a page">
          ${products.map((product) => `<ui-carousel-indicator><button aria-label="Page ${product}"></button></ui-carousel-indicator>`).join("")}
        </ui-carousel-indicator-group>
      </div>
    </ui-carousel>
  `
}

export { mount }
```

Move through groups of slides using the page controls.

## Thumbnails

A gallery and a strip of thumbnails share the selected page. The thumbnail carousel scrolls freely with `drag-free` and fits as many as show. Pressing a thumbnail selects its slide.

```ts title="thumbnails.ts"
import "@ui-sdk/web/carousel"

const photos = [
  { name: "Dunes" },
  { name: "Forest" },
  { name: "Glacier" },
  { name: "Canyon" },
  { name: "Meadow" },
  { name: "Harbor" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ui-carousel aria-label="Photos">
        <ui-carousel-viewport>
          <ui-carousel-content>
            ${photos.map((photo) => `<ui-carousel-item><div data-slot="tile">${photo.name}</div></ui-carousel-item>`).join("")}
          </ui-carousel-content>
        </ui-carousel-viewport>
      </ui-carousel>
      <ui-carousel aria-label="Thumbnails" drag-free slides-per-page="auto">
        <ui-carousel-viewport>
          <ui-carousel-content>
            ${photos.map((photo, index) => `<ui-carousel-item aria-label="${photo.name}"><button type="button" data-page="${index + 1}" aria-pressed="${index === 0}">${photo.name}</button></ui-carousel-item>`).join("")}
          </ui-carousel-content>
        </ui-carousel-viewport>
      </ui-carousel>
    </div>
  `
  const gallery = root.querySelector("ui-carousel")!
  const thumbnails = [
    ...root.querySelectorAll<HTMLButtonElement>("button[data-page]"),
  ]
  const show = (page: number) => {
    for (const thumbnail of thumbnails) {
      thumbnail.setAttribute(
        "aria-pressed",
        String(thumbnail.dataset.page === String(page))
      )
    }
    thumbnails[page - 1]?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    })
  }
  for (const thumbnail of thumbnails) {
    thumbnail.addEventListener(
      "click",
      () => (gallery.page = Number(thumbnail.dataset.page))
    )
  }
  gallery.addEventListener("pagechange", (event) => show(event.detail.value))
}

export { mount }
```

Choose a thumbnail to change the gallery, or scroll either strip.

## Autoplay

`default-playing` starts rotating, every `interval` milliseconds (5000 by default). `ui-carousel-play-toggle`
starts and stops it. Its button has `data-playing` while it rotates, so its label can switch with CSS.

As the carousel pattern asks, rotation stops when keyboard focus moves in and doesn't restart until the user asks, and pauses while the mouse is over it. It also pauses while the tab is hidden, while the carousel is scrolled out of view and while a finger is down. Changing slides yourself stops it. The slides are a polite live region only while it isn't rotating, so screen readers aren't interrupted every few seconds. It doesn't start on its own when the user prefers reduced motion.

`--carousel-interval` on the root is the interval, and `data-paused` is there while it's paused, so a progress bar can time itself with CSS.

```ts title="autoplay.ts"
import "@ui-sdk/web/carousel"
import { ChevronLeft, ChevronRight, createElement } from "lucide"
import { log } from "./log"

const photos = [
  { name: "Dunes" },
  { name: "Forest" },
  { name: "Glacier" },
  { name: "Canyon" },
  { name: "Meadow" },
  { name: "Harbor" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-carousel aria-label="Photos" default-playing interval="4000">
      <div data-slot="controls">
        <ui-carousel-play-toggle>
          <button><span data-show="playing">Pause</span><span data-show="stopped">Play</span></button>
        </ui-carousel-play-toggle>
      </div>
      <div data-slot="row">
        <ui-carousel-previous>
          <button aria-label="Previous slide">${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-previous>
        <ui-carousel-viewport>
          <ui-carousel-content>
            ${photos.map((photo) => `<ui-carousel-item><div data-slot="tile">${photo.name}</div></ui-carousel-item>`).join("")}
          </ui-carousel-content>
        </ui-carousel-viewport>
        <ui-carousel-next>
          <button aria-label="Next slide">${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-next>
      </div>
    </ui-carousel>
  `
  root
    .querySelector("ui-carousel")!
    .addEventListener("playingchange", (event) => {
      log(
        root,
        `${event.detail.value ? "Playing" : "Stopped"} (${event.detail.reason})`
      )
    })
}

export { mount }
```

Start or stop rotation. Hover to pause it, or move keyboard focus inside to stop it. The console logs each change and why.

## Progress

`--carousel-progress` on the root says how far the slides have scrolled, from 0 at the first page to 1 at the last, on every frame of a scroll or a spring, with no re-renders, so a progress bar can follow it in CSS. With `loop`, it goes round from 0 to 1 and back to 0. The controller's `getProgress()` reads the same number.

`pagechangecomplete` fires once the slides come to rest on a page, after a spring, a drag or a scroll, with
the page in `event.detail.value`. Start work there that would stutter the motion, like loading the next slides' images.

```ts title="progress.ts"
import "@ui-sdk/web/carousel"
import { ChevronLeft, ChevronRight, createElement } from "lucide"
import { log } from "./log"

const slides = [1, 2, 3, 4, 5]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-carousel aria-label="Featured">
      <div data-slot="row">
        <ui-carousel-previous>
          <button aria-label="Previous slide">${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-previous>
        <ui-carousel-viewport>
          <ui-carousel-content>
            ${slides.map((slide) => `<ui-carousel-item><div data-slot="tile">${slide}</div></ui-carousel-item>`).join("")}
          </ui-carousel-content>
        </ui-carousel-viewport>
        <ui-carousel-next>
          <button aria-label="Next slide">${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-next>
      </div>
      <div data-slot="row">
        <div data-slot="bar">
          <div></div>
        </div>
      </div>
    </ui-carousel>
  `
  root
    .querySelector("ui-carousel")!
    .addEventListener("pagechangecomplete", (event) => {
      log(root, `Rested on slide ${event.detail.value}`)
    })
}

export { mount }
```

Move through the slides. The progress bar follows the scroll position, and the console logs the slide it rests on.

## Controlled

The element owns its page, from 1. The `page` property reads it, and setting it goes there. Listen for
`pagechange`, with the new page in `event.detail.value`. `api.getPageCount()` is null until the slides are measured.

Every change carries a [reason](#reasons): `next-press` and `previous-press` for the parts, `item-press` for an indicator, `list-navigation` for arrow keys, `swipe` for a finger or a mouse drag, `scroll` for a wheel or trackpad, `timeout` for rotation and `imperative` from a [controller](#controller). Call `event.preventDefault()` to stay on the page: a swipe or drag springs back.

```ts title="controlled.ts"
import "@ui-sdk/web/carousel"
import { ChevronLeft, ChevronRight, createElement } from "lucide"
import { log } from "./log"

const slides = [1, 2, 3, 4, 5]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-carousel aria-label="Featured">
      <div data-slot="row">
        <ui-carousel-previous>
          <button aria-label="Previous slide">${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-previous>
        <ui-carousel-viewport>
          <ui-carousel-content>
            ${slides.map((slide) => `<ui-carousel-item><div data-slot="tile">${slide}</div></ui-carousel-item>`).join("")}
          </ui-carousel-content>
        </ui-carousel-viewport>
        <ui-carousel-next>
          <button aria-label="Next slide">${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-next>
      </div>
    </ui-carousel>
  `
  root.querySelector("ui-carousel")!.addEventListener("pagechange", (event) => {
    log(root, `Page ${event.detail.value} (${event.detail.reason})`)
  })
}

export { mount }
```

Change the page. The console logs each page and the reason for the change.

## Paging from Anywhere

The element's `api` property is its [controller](#controller). Previous, Next, the indicator group and the
play toggle work anywhere on the page with `for="<carousel id>"`, like in a section header.

`drag="false"` turns off swiping and dragging, so only the parts, keys and controllers move it.

```ts title="controller.ts"
import "@ui-sdk/web/carousel"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

const slides = [1, 2, 3, 4, 5]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <ui-carousel-previous for="featured-carousel">
          <button aria-label="Previous slide">${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-previous>
        <ui-carousel-next for="featured-carousel">
          <button aria-label="Next slide">${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-next>
        <button type="button" data-show-last>Show the Last Slide</button>
      </div>
      <ui-carousel id="featured-carousel" aria-label="Featured" drag="false">
        <ui-carousel-viewport>
          <ui-carousel-content>
            ${slides.map((slide) => `<ui-carousel-item><div data-slot="tile">${slide}</div></ui-carousel-item>`).join("")}
          </ui-carousel-content>
        </ui-carousel-viewport>
      </ui-carousel>
    </div>
  `
  const carousel = root.querySelector("ui-carousel")!
  root
    .querySelector("[data-show-last]")!
    .addEventListener("click", () => carousel.api.setPage(5))
}

export { mount }
```

Use the controls outside the carousel to change its page.

## Swipes and Drags

Touch, trackpads and wheels scroll the viewport natively, with CSS scroll snap doing the paging. Native scrolling and snapping also work before JavaScript loads. A mouse or pen drags the slides too: they follow the pointer, stretch past the ends, and spring from the release velocity to the page a fling would reach. A drag that moved never clicks the link it started on, and fields inside slides keep their pointer.

Without `skip-snaps`, one swipe moves at most one page. `drag-free` lets swipes coast to wherever they stop,
and the nearest page becomes the current one.

Buttons, keys, indicators, rotation, and controllers animate the scroll position. A second press updates the destination while it is moving. Reduced motion makes those changes immediate.

## Custom Rendering

Elements have no render functions. Style them from their attributes, and watch those attributes to change
what's inside them: a slide's `data-active` and `data-in-view`, a step's `data-disabled`, an indicator's
`data-selected`, the play toggle's `data-playing` and `data-paused`. Here each slide says when it's showing,
and a gallery link takes Next's place once Next's button has `data-disabled`.

```ts title="render.ts"
import "@ui-sdk/web/carousel"
import { ChevronLeft, ChevronRight, createElement } from "lucide"

const photos = [
  { name: "Dunes" },
  { name: "Forest" },
  { name: "Glacier" },
  { name: "Canyon" },
  { name: "Meadow" },
  { name: "Harbor" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-carousel aria-label="Photos">
      <ui-carousel-viewport>
        <ui-carousel-content>
          ${photos.map((photo, index) => `<ui-carousel-item><div data-slot="tile">${photo.name}<span data-slot="hint">${index + 1} / ${photos.length}<span hidden> · showing</span></span></div></ui-carousel-item>`).join("")}
        </ui-carousel-content>
      </ui-carousel-viewport>
      <div data-slot="row">
        <ui-carousel-previous>
          <button>${createElement(ChevronLeft, { "aria-hidden": "true" }).outerHTML} Previous</button>
        </ui-carousel-previous>
        <ui-carousel-next>
          <button>Next ${createElement(ChevronRight, { "aria-hidden": "true" }).outerHTML}</button>
        </ui-carousel-next>
        <a href="https://example.com/gallery" hidden>See all photos</a>
      </div>
    </ui-carousel>
  `
  const carousel = root.querySelector("ui-carousel")!
  const next = root.querySelector<HTMLElement>("ui-carousel-next button")!
  const link = root.querySelector("a")!
  const update = () => {
    for (const item of carousel.querySelectorAll("ui-carousel-item")) {
      item.querySelector<HTMLElement>("[data-slot='hint'] > span")!.hidden =
        !item.hasAttribute("data-active")
    }
    const end = next.hasAttribute("data-disabled")
    const focused = document.activeElement === next
    link.hidden = !end
    if (end && focused) {
      link.focus()
    }
    next.hidden = end
  }
  new MutationObserver(update).observe(carousel, {
    subtree: true,
    attributeFilter: ["data-active", "data-disabled"],
  })
  update()
}

export { mount }
```

Change slides to see each slide and control describe its current state.

## Styling

Use `data-disabled` on the Previous and Next buttons at their end, `data-selected` on the current indicator's button, `data-active` on the current page's slides, `data-in-view` on slides in view, and `data-playing` and `data-paused` on the root.

Slides size themselves: give them a `flex-basis` of 100% for one to a view or a third for three, and put the gap on the content, taking it out of each basis. The viewport writes the few styles scrolling needs inline: its overflow, `scroll-snap-type` and `overscroll-behavior`. Slides get `flex-shrink: 0` and their snap alignment. Hide the scrollbar with `scrollbar-width: none` if you like.

Each element has a `data-slot`, such as `carousel-item`, and its state attributes are listed under [Data Attributes](#data-attributes).

### `<ui-carousel>`
- `--carousel-interval`: How long each page shows while rotating, like `500ms`. Time a progress bar's animation with it.
- `--carousel-progress`: How far the slides have scrolled, from 0 at the first page to 1 at the last, or round the loop. It follows every frame of a scroll or spring.

## Data Attributes

### `<ui-carousel>`
`[data-slot="carousel"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the slides scroll, and which arrow keys page.
- `data-playing`: Present while it rotates on its own.
- `data-paused`: Present while rotation is paused for now: hovered, the tab hidden, scrolled out of view or held. Pause a progress animation with it.

### `<ui-carousel-viewport>`
`[data-slot="carousel-viewport"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the slides scroll, and which arrow keys page.
- `data-dragging`: Present while a mouse or pen drags the slides.

### `<ui-carousel-content>`
`[data-slot="carousel-content"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the slides scroll, and which arrow keys page.

### `<ui-carousel-item>`
`[data-slot="carousel-item"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the slides scroll, and which arrow keys page.
- `data-active`: Present on the slides of the current page.
- `data-in-view`: Present on slides at least half in view. Slides without it are inert and hidden from screen readers.

### `<ui-carousel-previous>`
`[data-slot="carousel-previous"]`

- `data-disabled`: Present on Previous or Next when there's no page that way, beside `aria-disabled`. It stays focusable and does nothing.

### `<ui-carousel-indicator>`
`[data-slot="carousel-indicator"]`

- `data-selected`: Present on the current page's indicator, beside `aria-selected`.

### `<ui-carousel-play-toggle>`
`[data-slot="carousel-play-toggle"]`

- `data-playing`: Present while it rotates on its own.
- `data-paused`: Present while rotation is paused for now: hovered, the tab hidden, scrolled out of view or held. Pause a progress animation with it.

## API Reference

Props are attributes in kebab case, like `default-page`, `slides-per-page` and `default-playing`, and
numbers are numbers. `controller` is a property. `page` and `playing` are live properties. Callbacks are DOM events.

### Carousel

- `page?` (`number`): The current page, from 1. Pass it to control the carousel.
- `defaultPage?` (`number`): The page it starts on, from 1, when uncontrolled.
- `pagechange event`: Runs when the page wants to change. `details.reason` says why, and `details.cancel()` stays on the page.
- `pagechangecomplete event`: Runs once the slides come to rest on a page, after a spring, a drag or a scroll, with that page. Start work there that would stutter the motion.
- `playing?` (`boolean`): Whether it rotates through the pages on its own. Pass it to control rotation.
- `defaultPlaying?` (`boolean`): Whether it starts rotating, when uncontrolled. It doesn't when the user prefers reduced motion; the play toggle still starts it.
- `playingchange event`: Runs when rotation wants to start or stop. Keyboard focus moving in and the user paging stop it, as the carousel pattern asks.
- `interval?` (`number`): How long each page shows while rotating, in ms. Hovering, a hidden tab and scrolling the carousel out of view pause it.
- `orientation?` (`CarouselOrientation`): Which way the slides scroll, and which arrow keys page.
- `align?` (`CarouselAlign`): Where a page lines up in the viewport.
- `slidesPerPage?` (`CarouselSlidesPerPage`): How many slides one page holds: Next moves this many, and each indicator stands for this many. `"auto"` fits as many as the viewport shows.
- `loop?` (`boolean`): Whether the slides go round: Next on the last page goes to the first, which comes in after the last, and a swipe back from the first page reaches the last. With fewer than a page of slides to either side, Next on the last page scrolls back to the first instead.
- `skipSnaps?` (`boolean`): Whether a fast swipe can pass over pages. Without it, one swipe moves one page.
- `dragFree?` (`boolean`): Whether swipes and drags coast to wherever they stop instead of a page. The nearest page becomes the current one.
- `drag?` (`boolean`): Whether swiping, dragging and scrolling move the slides. Without it, only the parts, keys and controllers do.
- `controller?` (`object`): Pages the carousel from anywhere. Create one with `createCarouselController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### CarouselViewport

The scrolling area. `<ui-carousel-viewport>` scrolls and snaps natively, and takes focus for the arrow keys.

### CarouselContent

Holds the slides. `<ui-carousel-content>` announces slides coming into view, except while rotating.

### CarouselItem

One slide. `<ui-carousel-item>` has the group role, named by its position, like "2 of 5".

### CarouselPrevious

- `controller?` (`object`): The carousel this part drives when it isn't inside one, like buttons in a page header.

### CarouselNext

Shows the next page. `<ui-carousel-next>` takes the same attributes as `<ui-carousel-previous>`.

### CarouselIndicatorGroup

Groups the indicators. `<ui-carousel-indicator-group>` has the tablist role, and takes the same attributes as `<ui-carousel-previous>`.

### CarouselIndicator

- `page?` (`number`): The page it shows and selects, from 1. Inferred from the indicators' order when left out.

### CarouselPlayToggle

Starts and stops rotation. `<ui-carousel-play-toggle>` wraps a `button`, and takes the same attributes as `<ui-carousel-previous>`.

### State

The same state shows as attributes on each part.

`Carousel`:

- `page` (`number`): The current page, from 1.
- `pageCount` (`number | null`): How many pages there are, or null before the slides are measured, like on the server.
- `playing` (`boolean`): Whether it rotates on its own.
- `orientation` (`CarouselOrientation`): Which way the slides scroll.

`CarouselViewport`:

- `orientation` (`CarouselOrientation`): Which way the slides scroll.
- `dragging` (`boolean`): Whether a mouse or pen is dragging the slides.

`CarouselContent`:

- `orientation` (`CarouselOrientation`): Which way the slides scroll.

`CarouselItem`:

- `index` (`number`): The slide's position among the slides, from 0. -1 until it's measured.
- `active` (`boolean`): Whether the slide belongs to the current page.
- `inView` (`boolean`): Whether at least half of the slide shows. Slides out of view are inert.

`CarouselPrevious` and `CarouselNext`:

- `disabled` (`boolean`): Whether there's no page that way, so pressing does nothing. It stays focusable.

`CarouselIndicatorGroup`:

- `page` (`number`): The current page, from 1.
- `pageCount` (`number | null`): How many pages there are, or null before the slides are measured.

`CarouselIndicator`:

- `page` (`number`): The page it stands for, from 1, or 0 before it's known.
- `selected` (`boolean`): Whether its page is the current one.

`CarouselPlayToggle`:

- `playing` (`boolean`): Whether it rotates on its own.
- `paused` (`boolean`): Whether rotation is paused for now: hovered, the tab hidden, scrolled out of view or held.

### Reasons

`event.detail.reason` says why the page changed.

- `previous-press` (`MouseEvent | KeyboardEvent`): A pagination's or a carousel's Previous part was pressed.
- `next-press` (`MouseEvent | KeyboardEvent`): A pagination's or a carousel's Next part was pressed.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.
- `scroll` (`Event | undefined`): The user scrolled a carousel some other way: a wheel, a trackpad, a scrollbar, or the browser bringing focus or a find in page into view.
- `timeout` (`none`): A duration ran out, like a toast's, or a rotating carousel's interval.
- `content-resize` (`none`): The content or the screen changed size, and the drawer's snap point or the carousel's page went away, so it moved to the nearest one.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

And why rotation started or stopped.

- `previous-press` (`MouseEvent | KeyboardEvent`): A pagination's or a carousel's Previous part was pressed.
- `next-press` (`MouseEvent | KeyboardEvent`): A pagination's or a carousel's Next part was pressed.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.
- `scroll` (`Event | undefined`): The user scrolled a carousel some other way: a wheel, a trackpad, a scrollbar, or the browser bringing focus or a find in page into view.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `toggle-press` (`MouseEvent | KeyboardEvent`): A toggle was pressed: a password input's, which shows or hides the password, or a carousel's, which starts or stops rotation.
- `focus-in` (`FocusEvent`): Keyboard focus moved into the component, which stops a rotating carousel, as the carousel pattern asks, or onto a canvas item, which brought it into view, or onto a calendar's day another way, like a screen reader's.

### Controller

The element's `api` property has the same methods.

Every write method takes an optional `{ reason, event }`, which the change event carries, and returns `false` when the change is canceled or there's nowhere to go.

- `getPage()` (`() => number`): The current page, from 1.
- `getPageCount()` (`() => number | null`): How many pages there are, or null before the carousel has measured its slides.
- `setPage(page, options?)` (`(page: number, options?: CarouselPageOptions | undefined) => boolean`): Goes to a page, from 1, clamped to the pages there are. Returns false when canceled or already there.
- `next(options?)` (`(options?: CarouselPageOptions | undefined) => boolean`): Goes to the next page, or the first one after the last with `loop`. Returns false at the end.
- `previous(options?)` (`(options?: CarouselPageOptions | undefined) => boolean`): Goes to the previous page, or the last one before the first with `loop`. Returns false at the start.
- `canNext()` (`() => boolean`): Whether there's a next page, always with `loop`.
- `canPrevious()` (`() => boolean`): Whether there's a previous page, always with `loop`.
- `getProgress()` (`() => number`): How far the slides have scrolled, from 0 at the first page to 1 at the last, or round the loop. Also `--carousel-progress` on the root.
- `isPlaying()` (`() => boolean`): Whether it rotates on its own.
- `setPlaying(playing, options?)` (`(playing: boolean, options?: CarouselPlayingOptions | undefined) => boolean`): Starts or stops rotation. Returns false when canceled or unchanged.
- `play(options?)` (`(options?: CarouselPlayingOptions | undefined) => boolean`): Starts rotation.
- `pause(options?)` (`(options?: CarouselPlayingOptions | undefined) => boolean`): Stops rotation.

### Events

Events fire on their own element and don't bubble, with the new value in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` cancels the change. Type the element as `UiCarouselElement` for typed listeners.

| Member                     | On            | Description                                             |
| -------------------------- | ------------- | ------------------------------------------------------- |
| `page` property            | `ui-carousel` | The current page. Setting it goes there                 |
| `playing` property         | `ui-carousel` | Whether it rotates                                      |
| `api` property             | `ui-carousel` | The [controller](#controller)                           |
| `controller` property      | `ui-carousel` | A controller from `createCarouselController()`          |
| `pagechange` event         | `ui-carousel` | `detail: { value: page, reason, event, source }`        |
| `pagechangecomplete` event | `ui-carousel` | `detail: { value: page }`, once the slides come to rest |
| `playingchange` event      | `ui-carousel` | `detail: { value: playing, reason, event, source }`     |

## Accessibility

It follows the [WAI-ARIA carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/): a region described as a carousel, slides as groups described as slides and labelled by position, Previous and Next that control the slides, a rotation control, and indicators as a tablist. Every line below is an automated test.

Each slide is labelled by its position, like "1 of 5", unless it has an `aria-label` of its own, which is also how you translate it. Slides less than half in view are `inert` and hidden from screen readers, so Tab and the virtual cursor only reach what shows.

### Keyboard

Arrow keys follow the orientation, and swap left and right in right-to-left text.

| Key                                       | Does                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Tab                                       | Reaches the play toggle, links and controls in slides in view, Previous, Next and the current indicator |
| ArrowRight, ArrowLeft                     | In the viewport, the next and previous page. ArrowDown and ArrowUp when vertical                        |
| Home, End                                 | In the viewport or the indicators, the first and last page                                              |
| ArrowRight, ArrowLeft, ArrowDown, ArrowUp | In the indicators, the next and previous indicator, which shows its page                                |
| Enter, Space                              | Presses Previous, Next, an indicator or the play toggle                                                 |

Fields and widgets inside slides keep their arrow keys: a text field's caret moves, and the carousel stays put. When arrow keys page away from a slide that has focus, focus moves to the slide that comes in, so it never stays on something out of view. Previous and Next stay focusable at the ends, with `aria-disabled`, so focus never drops to the page when Next reaches the last slide.

### Tested Behavior

**Structure**

- The carousel is a named region described as a carousel.
- Each slide is a group described as a slide.
- The first slide shows first.

**Previous and next**

- Next shows the next slide.
- Previous shows the previous slide.
- Previous is disabled on the first slide and Next on the last.
- Next on the last slide does nothing.
- Next and Previous are buttons that don't submit a form.

**Keyboard**

- ArrowRight in a slide shows the next slide, and ArrowLeft the previous.
- ArrowLeft on the first slide stays there.

**Pages**

- With three slides to a view, Next moves one slide, and the last page shows the last three.
- Three slides to a page move three at a time.
- Auto pages fit as many slides as show.
- It can start on another page.
- A controller pages it from outside.

**Rest**

- It reports the page once the slides come to rest.

**Loop**

- Next on the last slide shows the first.
- Previous on the first slide shows the last.
- Previous and Next are never disabled.
- Next on the last slide carries on the same way to the first.
- Pressing Next quickly keeps going forward, round past the last slide.
- A mouse drag back from the first slide shows the last.
- With three slides to a view, the last slide shows before the first.
- A vertical carousel drags down from the first slide to the last.

**Dragging**

- Dragging the slides with a mouse shows the next one.
- A short, slow drag settles back on the same slide.
- Dragging back shows the previous slide.
- A drag that starts on a link doesn't follow it.
- Without dragging, a drag moves nothing.

**More**

- A vertical carousel drags up and down.
- Pressing keys with no waits lands on the right slide.
- A fast flick moves one page, not more.
- The current slide stays in view when the slides change size.

Runs in React, Vue and web components.

Beyond the baseline:

**Focus**

- Next keeps focus when it reaches the last slide.
- Tab reaches only the slides in view.
- Slides out of view are hidden from assistive technology.
- Arrow keys bring the next slide in and move focus to it.
- A text field in a slide keeps its arrow keys.
- Home and End go to the first and last slide.

**Orientation**

- A vertical carousel pages with ArrowDown and ArrowUp.

**Indicators**

- Indicators are a tablist with the current page selected.
- Pressing an indicator shows its page.
- Arrow keys move between indicators and show their page.
- The indicators are one tab stop, on the current page.
- An indicator controls the slides of its page.
- Indicators past the page count hide themselves.

**Changes**

- A change can be canceled.
- A canceled drag springs back.
- Every change says why.
- A horizontal wheel scrolls to the next slide.
- With loop, a wheel back from the first slide scrolls natively to the last.
- --carousel-progress on the root follows the slides, for progress bars in CSS.
- With loop, --carousel-progress goes round, whatever the track's rotation.
- Next outside the carousel works through its controller.

**Rotation**

- It rotates on its own, past the last slide to the first.
- The play toggle stops and starts rotation, and its name says which.
- Keyboard focus moving in stops rotation, as the pattern asks.
- Hovering pauses rotation, and leaving resumes it.
- Pressing Next stops rotation.
- The slides are a live region only while not rotating.
- It doesn't start rotating when the user prefers reduced motion.
- Reduced motion pages without animating.

**Pages**

- Indicators follow a change in size.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while using the carousel with a keyboard.

Runs in React, Vue and web components.
