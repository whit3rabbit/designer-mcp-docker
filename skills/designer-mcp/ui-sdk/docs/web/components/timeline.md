# Timeline

Show dated events in order, like an activity feed, a changelog or an order's progress, with arrow keys between them.

Use a Timeline for a list of things that happened, or will: a project's activity, an order's status history, a release's milestones. It's a list for screen readers, with one tab stop for keyboards, and the arrow keys move between events.

```ts title="demo.ts"
import "@ui-sdk/web/timeline"

const events = [
  {
    title: "Deployed to production",
    dateTime: "2026-11-10T14:32",
    time: "Today, 2:32 PM",
    description: "Version 2.4.1 is live in every region.",
  },
  {
    title: "Checks passed",
    dateTime: "2026-11-10T14:20",
    time: "Today, 2:20 PM",
    description: "312 tests and the bundle size budget.",
  },
  {
    title: "Pull request merged",
    dateTime: "2026-11-10T13:58",
    time: "Today, 1:58 PM",
    description: "Ada merged Cache search results into main.",
  },
  {
    title: "Review requested",
    dateTime: "2026-11-09T17:05",
    time: "Yesterday, 5:05 PM",
    description: "Grace and Linus were asked to review.",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-timeline aria-label="Activity">
      ${events
        .map(
          (event) => `
            <ui-timeline-item>
              <ui-timeline-marker></ui-timeline-marker>
              <ui-timeline-connector></ui-timeline-connector>
              <ui-timeline-title>${event.title}</ui-timeline-title>
              <ui-timeline-time><time datetime="${event.dateTime}">${event.time}</time></ui-timeline-time>
              <ui-timeline-description>${event.description}</ui-timeline-description>
            </ui-timeline-item>`
        )
        .join("")}
    </ui-timeline>
  `
}

export { mount }
```

Tab into the activity, then use Up and Down to move between events. Home and End jump to the first and last.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. On the server the import does nothing.

```ts
import "@ui-sdk/web/timeline"
```

## Composition

Use the following composition to build a `ui-timeline`:

```text
ui-timeline
├── ui-timeline-item
│   ├── ui-timeline-marker
│   ├── ui-timeline-connector
│   ├── ui-timeline-title
│   ├── ui-timeline-time
│   │   └── time
│   └── ui-timeline-description
└── ui-timeline-item
```

Every part inside an item is optional. `ui-timeline-marker` is the dot or icon on the line, and `ui-timeline-connector` the line to the next event. Both are hidden from screen readers, so they're only for looks.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/timeline"
</script>

<ui-timeline aria-label="Activity">
  <ui-timeline-item>
    <ui-timeline-marker></ui-timeline-marker>
    <ui-timeline-connector></ui-timeline-connector>
    <ui-timeline-title>Deployed to production</ui-timeline-title>
    <ui-timeline-time>
      <time datetime="2026-11-10T14:32">2:32 PM</time>
    </ui-timeline-time>
    <ui-timeline-description>Version 2.4.1 is live.</ui-timeline-description>
  </ui-timeline-item>
</ui-timeline>
```

`ui-timeline` has the `list` role and each item the `listitem` role. With `feed`, the same markup becomes a feed of articles. Put a `<time>` with `datetime` inside `ui-timeline-time`, so the date is machine readable while the text stays friendly. The part binds to that `<time>`.

When focus lands on an event, screen readers read its title as its name, then its time and description. Links and buttons inside an event stay in the tab order: Tab moves from the event to them, and arrow keys pressed on them stay with them.

## Horizontal

Set `orientation="horizontal"` for a row, like a roadmap. Left and Right move between events instead of Up and Down, and they swap in right-to-left text. Set `loop="false"` to stop at either end.

```ts title="horizontal.ts"
import "@ui-sdk/web/timeline"

const milestones = [
  { title: "Kickoff", dateTime: "2026-01", time: "January" },
  { title: "Design review", dateTime: "2026-03", time: "March" },
  { title: "Beta", dateTime: "2026-06", time: "June" },
  { title: "Launch", dateTime: "2026-09", time: "September" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-timeline orientation="horizontal" loop="false" aria-label="Roadmap">
      ${milestones
        .map(
          (milestone) => `
            <ui-timeline-item>
              <ui-timeline-marker></ui-timeline-marker>
              <ui-timeline-connector></ui-timeline-connector>
              <ui-timeline-title>${milestone.title}</ui-timeline-title>
              <ui-timeline-time><time datetime="${milestone.dateTime}">${milestone.time}</time></ui-timeline-time>
            </ui-timeline-item>`
        )
        .join("")}
    </ui-timeline>
  `
}

export { mount }
```

Tab into the roadmap and press Right to reach Launch. Right again stays there.

## Status

Give each item a `status` attribute of `complete`, `current` or `upcoming` for a process, like an order's progress. The current event gets `aria-current="step"`, and Tab lands on it first. Every part of an event shows its status with `data-complete`, `data-current` or `data-upcoming`.

The timeline element's `api` property has the controller's methods. Call its `focus()` with an item's `value` to move focus to it from anywhere.

```ts title="status.ts"
import "@ui-sdk/web/timeline"
import { Check, createElement } from "lucide"

const steps = [
  {
    value: "placed",
    title: "Order placed",
    dateTime: "2026-11-01",
    time: "Nov 1",
    description: "We received your order.",
    status: "complete",
  },
  {
    value: "packed",
    title: "Packed",
    dateTime: "2026-11-02",
    time: "Nov 2",
    description: "Your items left the shelf.",
    status: "complete",
  },
  {
    value: "shipped",
    title: "Shipped",
    dateTime: "2026-11-03",
    time: "Nov 3",
    description: "On its way with the carrier.",
    status: "current",
  },
  {
    value: "delivered",
    title: "Delivered",
    dateTime: "2026-11-05",
    time: "Nov 5",
    description: "Expected by Thursday.",
    status: "upcoming",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Go to Current Step</button>
      </div>
      <ui-timeline aria-label="Order status">
        ${steps
          .map(
            (step) => `
              <ui-timeline-item value="${step.value}" status="${step.status}">
                <ui-timeline-marker>${step.status === "complete" ? createElement(Check, { "aria-hidden": "true" }).outerHTML : ""}</ui-timeline-marker>
                <ui-timeline-connector></ui-timeline-connector>
                <ui-timeline-title>${step.title}</ui-timeline-title>
                <ui-timeline-time><time datetime="${step.dateTime}">${step.time}</time></ui-timeline-time>
                <ui-timeline-description>${step.description}</ui-timeline-description>
              </ui-timeline-item>`
          )
          .join("")}
      </ui-timeline>
    </div>
  `
  const timeline = root.querySelector("ui-timeline")!
  root
    .querySelector('[data-slot="controls"] button')!
    .addEventListener("click", () => timeline.api.focus("shipped"))
}

export { mount }
```

Tab into the order status. Focus starts on Shipped, the current step. Move away, then choose Go to Current Step.

A marker shows status only to sighted people. When the status matters, say it in the title or description too, like "Shipped, in progress".

## Details

Put a [Collapsible](./collapsible.md) inside an item for details that can open. Its trigger is a button inside the event, so Tab reaches it after the event, and arrow keys still move between events.

```ts title="details.ts"
import "@ui-sdk/web/timeline"
import "@ui-sdk/web/collapsible"
import { ChevronDown, createElement } from "lucide"

const releases = [
  {
    title: "Version 2.4",
    dateTime: "2026-10-28",
    time: "October 28",
    description: "Faster search and resumable uploads.",
    changes: [
      "Search now matches file contents, not only names.",
      "Uploads resume after the connection drops.",
    ],
  },
  {
    title: "Version 2.3",
    dateTime: "2026-09-30",
    time: "September 30",
    description: "Shared links and a new sidebar.",
    changes: [
      "Shared links remember the folder they were opened from.",
      "The sidebar collapses to icons on narrow screens.",
    ],
  },
  {
    title: "Version 2.2",
    dateTime: "2026-08-26",
    time: "August 26",
    description: "Dark mode follows your system.",
    changes: ["Dark mode follows the system setting.", "Avatars are sharper."],
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-timeline aria-label="Changelog">
      ${releases
        .map(
          (release) => `
            <ui-timeline-item>
              <ui-timeline-marker></ui-timeline-marker>
              <ui-timeline-connector></ui-timeline-connector>
              <ui-timeline-title>${release.title}</ui-timeline-title>
              <ui-timeline-time><time datetime="${release.dateTime}">${release.time}</time></ui-timeline-time>
              <ui-timeline-description>${release.description}</ui-timeline-description>
              <ui-collapsible>
                <ui-collapsible-trigger>
                  <button type="button" aria-expanded="false">
                    What Changed
                    ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
                  </button>
                </ui-collapsible-trigger>
                <ui-collapsible-panel hidden>
                  <ul>
                    ${release.changes.map((change) => `<li>${change}</li>`).join("")}
                  </ul>
                </ui-collapsible-panel>
              </ui-collapsible>
            </ui-timeline-item>`
        )
        .join("")}
    </ui-timeline>
  `
}

export { mount }
```

Tab to What Changed under Version 2.4 and press Enter. Shift+Tab back to the event, then press Down for Version 2.3.

## Feed

Set `feed` for a timeline that loads more as people scroll, like a social feed. It follows the [WAI-ARIA feed pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/): the root becomes a `feed` and each item an `article` with its position and the count, and Page Down and Page Up move between articles from anywhere inside one.

Set the `busy` property, or attribute, while you load or change articles. It sets `aria-busy`, so screen readers wait for the new articles before reading on.

```ts title="feed.ts"
import "@ui-sdk/web/timeline"
import { log } from "./log"

const updates = [
  {
    author: "Ada",
    date: "2026-11-10",
    time: "Nov 10",
    text: "Shipped the new onboarding flow.",
  },
  {
    author: "Grace",
    date: "2026-11-10",
    time: "Nov 10",
    text: "Fixed the flaky upload test.",
  },
  {
    author: "Linus",
    date: "2026-11-09",
    time: "Nov 9",
    text: "Moved the docs to the new theme.",
  },
  {
    author: "Margaret",
    date: "2026-11-09",
    time: "Nov 9",
    text: "Wrote the launch checklist.",
  },
  {
    author: "Ada",
    date: "2026-11-08",
    time: "Nov 8",
    text: "Cut search latency in half.",
  },
  {
    author: "Grace",
    date: "2026-11-07",
    time: "Nov 7",
    text: "Added keyboard shortcuts to the editor.",
  },
  {
    author: "Linus",
    date: "2026-11-06",
    time: "Nov 6",
    text: "Cleaned up the old billing code.",
  },
  {
    author: "Margaret",
    date: "2026-11-05",
    time: "Nov 5",
    text: "Ran the accessibility review.",
  },
  {
    author: "Ada",
    date: "2026-11-04",
    time: "Nov 4",
    text: "Started the mobile layout.",
  },
]

const pageSize = 3

const article = (update: (typeof updates)[number]) => `
  <ui-timeline-item>
    <ui-timeline-marker></ui-timeline-marker>
    <ui-timeline-connector></ui-timeline-connector>
    <ui-timeline-title>${update.author}</ui-timeline-title>
    <ui-timeline-time><time datetime="${update.date}">${update.time}</time></ui-timeline-time>
    <ui-timeline-description>${update.text}</ui-timeline-description>
  </ui-timeline-item>`

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Load More</button>
      </div>
      <ui-timeline feed aria-label="Team updates">
        ${updates.slice(0, pageSize).map(article).join("")}
      </ui-timeline>
    </div>
  `
  const timeline = root.querySelector("ui-timeline")!
  const button = root.querySelector("button")!
  let count = pageSize
  let timer: ReturnType<typeof setTimeout> | undefined
  button.addEventListener("click", () => {
    timeline.busy = true
    button.disabled = true
    button.textContent = "Loading…"
    timer = setTimeout(() => {
      timeline.insertAdjacentHTML(
        "beforeend",
        updates
          .slice(count, count + pageSize)
          .map(article)
          .join("")
      )
      count += pageSize
      timeline.busy = false
      button.disabled = count >= updates.length
      button.textContent = "Load More"
      log(root, `Loaded ${pageSize} more updates`)
    }, 600)
  })
  return () => clearTimeout(timer)
}

export { mount }
```

Tab into the updates and press Page Down. Choose Load More: the feed is busy until three more updates arrive. The console logs each load.

Use a list for most timelines. A feed is for long lists that grow, where a screen reader's reading mode should flow from one article to the next.

## Custom Rendering

Put a heading inside `ui-timeline-title` so people can move between events by heading, or add `as-child` to make the heading itself the part:

```html
<ui-timeline-title as-child><h3>Deployed to production</h3></ui-timeline-title>
```

[Parts and Composition](../parts-and-composition.md) explains the rendering contract.

## Styling

The parts have no styles. Lay an item out as a grid, with the marker in its own column and the connector positioned along it. `data-orientation` on every part says which way the events run.

Use `data-first` and `data-last` on items to hide the connector after the last event. They're written once the elements are defined; before that, `:last-child` does the same.

Each part has a `data-slot`, such as `timeline-marker`, and its state attributes are listed under [Data Attributes](#data-attributes). The time's attributes land on the `<time>` inside it.

`<ui-timeline>` writes `--timeline-count`, how many events it holds, and each `<ui-timeline-item>` writes `--timeline-index`, its place from 0. Use them for a horizontal row's grid columns, or to stagger an animation.

### `<ui-timeline>`
- `--timeline-count`: How many events are in the page. Size a horizontal grid's columns with it.

### `<ui-timeline-item>`
- `--timeline-index`: The event's place among the events in the page, 0 for the first. It follows them as they move.

## Data Attributes

### `<ui-timeline>`
`[data-slot="timeline"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the events run.
- `data-busy`: Present while a feed is loading or changing events, with `busy`.

### `<ui-timeline-item>`
`[data-slot="timeline-item"]`

- `data-complete`: Present when the event's status is `complete`.
- `data-orientation` (`horizontal`, `vertical`): Which way the events run.
- `data-current`: Present when the event's status is `current`.
- `data-upcoming`: Present when the event's status is `upcoming`.
- `data-first`: Present on the first event. Written once it's in the page.
- `data-last`: Present on the last event. Written once it's in the page.

### `<ui-timeline-marker>`
`[data-slot="timeline-marker"]`

- `data-complete`: Present when the event's status is `complete`.
- `data-orientation` (`horizontal`, `vertical`): Which way the events run.
- `data-current`: Present when the event's status is `current`.
- `data-upcoming`: Present when the event's status is `upcoming`.

### `<ui-timeline-connector>`
`[data-slot="timeline-connector"]`

- `data-complete`: Present when the event's status is `complete`.
- `data-orientation` (`horizontal`, `vertical`): Which way the events run.
- `data-current`: Present when the event's status is `current`.
- `data-upcoming`: Present when the event's status is `upcoming`.

### `<ui-timeline-time>`
`[data-slot="timeline-time"]`

- `data-complete`: Present when the event's status is `complete`.
- `data-orientation` (`horizontal`, `vertical`): Which way the events run.
- `data-current`: Present when the event's status is `current`.
- `data-upcoming`: Present when the event's status is `upcoming`.

### `<ui-timeline-title>`
`[data-slot="timeline-title"]`

- `data-complete`: Present when the event's status is `complete`.
- `data-orientation` (`horizontal`, `vertical`): Which way the events run.
- `data-current`: Present when the event's status is `current`.
- `data-upcoming`: Present when the event's status is `upcoming`.

### `<ui-timeline-description>`
`[data-slot="timeline-description"]`

- `data-complete`: Present when the event's status is `complete`.
- `data-orientation` (`horizontal`, `vertical`): Which way the events run.
- `data-current`: Present when the event's status is `current`.
- `data-upcoming`: Present when the event's status is `upcoming`.

## API Reference

Props are attributes in kebab case: `"false"` is false, as in `loop="false"`.

### Timeline

- `orientation?` (`TimelineOrientation`): Which arrow keys move between events: up and down, or left and right.
- `loop?` (`boolean`): Whether arrow keys wrap from the last event to the first.
- `feed?` (`boolean`): Whether the events are a feed that loads more as people scroll, rather than a list. Each event becomes an article with its position, and Page Down and Page Up move between them from anywhere inside one.
- `busy?` (`boolean`): Whether a feed is loading or changing events, which sets `aria-busy` so screen readers wait until it's done. Only a feed reads it.
- `controller?` (`{ focus: (value?: string) => void; }`): Focuses an event from anywhere. Create one with `createTimelineController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### TimelineItem

- `value?` (`string`): Names the event for the controller's `focus()`. Generated when left out.
- `status?` (`TimelineStatus`): Where the event stands in a process. The `"current"` one sets `aria-current="step"` and takes the tab stop first.

`ui-timeline-marker`, `ui-timeline-connector`, `ui-timeline-time`, `ui-timeline-title` and `ui-timeline-description` take no props of their own.

### State

The same state shows as data attributes on each part. On `ui-timeline`:

- `orientation` (`TimelineOrientation`): Which way the events run.
- `feed` (`boolean`): Whether the events are a feed rather than a list.
- `busy` (`boolean`): Whether a feed is loading or changing events.

On `ui-timeline-item` and every part inside it:

- `status` (`TimelineStatus | undefined`): Where the event stands in a process, or `undefined` when it has no status.
- `orientation` (`TimelineOrientation`): Which way the events run.

### Controller

The element's `api` property has the same methods.

- `focus(value?)` (`(value?: string | undefined) => void`): Moves focus to an event by its `value`, or to the event that holds the tab stop.

## Accessibility

A timeline is a `list` of `listitem`s, named with `aria-label`. With `feed`, it follows the [WAI-ARIA feed pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/): a `feed` of `article`s, each with `aria-posinset` and `aria-setsize`, and `aria-busy` while it loads. Each event is named by its title through `aria-labelledby` and described by its time and description through `aria-describedby`. The current event has `aria-current="step"`.

### Keyboard

The events have one tab stop, a roving focus. Tab enters on the current event, else the first, then returns to the event focused last.

| Key                        | Action                                                     |
| -------------------------- | ---------------------------------------------------------- |
| `ArrowDown` / `ArrowUp`    | Move focus between events in a vertical timeline           |
| `ArrowRight` / `ArrowLeft` | Move focus between events in a horizontal timeline         |
| `Home` / `End`             | Focus the first or last event                              |
| `PageDown` / `PageUp`      | In a feed, focus the next or previous article, from inside |
| `Tab`                      | Move from an event to the links and buttons inside it      |

Arrow keys move only from an event itself, so controls inside keep them. In right-to-left text, Left and Right swap.

### Tested Behavior

Every line below is an automated test.

- A busy feed sets aria-busy.

**A list of events**

- The events are a named list of list items.
- Each event is named by its title and described by its time and description.
- Tab lands on the current event, then on the links inside it, then leaves.
- The current event says it's the current step.
- Each event and its parts show its status.
- ArrowDown and ArrowUp move between events.
- ArrowLeft and ArrowRight do nothing in a vertical list.
- Home and End move to the first and last events.
- Arrow keys wrap from the last event to the first.
- Arrow keys on a link inside an event leave focus on the link.
- Page Down does nothing in a list.
- Tab comes back to the event focused last.
- Only the event with the tab stop is in the tab order.
- The first and last events are marked.
- An event added at the top becomes the first.
- Events that change places move the first and last marks.
- Each event carries its place and the list how many there are.
- The tab stop follows the current step when it moves before focus enters.
- The controller moves focus to an event.
- Markers and connectors are hidden from assistive technology.

**A list that doesn't loop**

- Arrow keys stop at either end.

**A horizontal list**

- ArrowRight and ArrowLeft move between events.
- ArrowDown and ArrowUp do nothing.

**A feed**

- The events are a named feed of articles.
- Each article says where it sits and how many there are.
- An article added at the top moves every position.
- Articles moved inside a wrapper take their new places.
- Page Down and Page Up move between articles.
- Page Down from a link inside an article moves to the next article.
- Page Down on the last article stays there.
- The feed isn't busy until it's told.

Runs in React, Vue and web components.
