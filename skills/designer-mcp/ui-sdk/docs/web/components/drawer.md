# Drawer

A sheet you can open, drag, and resize from an edge of the screen.

A drawer gives a task its own sheet without leaving the page. It shares [Dialog’s](./dialog.md) focus and dismissal behavior, then adds dragging, snap points, and a handle you can use with the keyboard.

```ts title="basic.ts"
import "@ui-sdk/web/drawer"
import { createElement, Minus, Plus } from "lucide"
const goal = { initial: 350, min: 200, max: 400, step: 10 }

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-drawer>
      <ui-drawer-trigger><button>Open Drawer</button></ui-drawer-trigger>
      <ui-drawer-backdrop hidden></ui-drawer-backdrop>
      <ui-drawer-content hidden>
        <div data-slot="grip" aria-hidden="true"></div>

        <div data-slot="stack">
          <ui-drawer-title>Move goal</ui-drawer-title>
          <ui-drawer-description>Set your daily activity goal.</ui-drawer-description>
        </div>

        <div data-slot="row">
          <button type="button" aria-label="Decrease">${createElement(Minus, { "aria-hidden": "true" }).outerHTML}</button>
          <div data-slot="stack">
            <div aria-live="polite"></div>
            <div data-slot="hint">Calories/day</div>
          </div>
          <button type="button" aria-label="Increase">${createElement(Plus, { "aria-hidden": "true" }).outerHTML}</button>
        </div>

        <div data-slot="stack">
          <ui-drawer-close value="submit"><button data-variant="solid">Submit</button></ui-drawer-close>
          <ui-drawer-close><button>Cancel</button></ui-drawer-close>
        </div>
      </ui-drawer-content>
    </ui-drawer>
  `
  const value = root.querySelector("[aria-live]")!
  const decrease = root.querySelector<HTMLButtonElement>(
    '[aria-label="Decrease"]'
  )!
  const increase = root.querySelector<HTMLButtonElement>(
    '[aria-label="Increase"]'
  )!
  let calories = goal.initial
  const show = () => {
    value.textContent = String(calories)
    decrease.disabled = calories <= goal.min
    increase.disabled = calories >= goal.max
  }
  decrease.addEventListener("click", () => {
    calories -= goal.step
    show()
  })
  increase.addEventListener("click", () => {
    calories += goal.step
    show()
  })
  show()
}

export { mount }
```

Open the drawer, adjust the daily goal, then Submit or Cancel. You can also press Escape, press outside, or drag the sheet toward its edge to close it.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the component to register its elements. The import is safe on the server.

```ts
import "@ui-sdk/web/drawer"
```

## Composition

Use the following composition to build a `ui-drawer`:

```text
ui-drawer
├── ui-drawer-trigger
│   └── button
├── ui-drawer-backdrop
└── ui-drawer-content
    ├── ui-drawer-title
    ├── ui-drawer-description
    └── ui-drawer-close
        └── button
```

The content is the sheet. The drawer positions it inside a full-screen viewport and moves it with `translate`. Give it a size, a surface, and corners; leave positioning and translation to the drawer. Give the backdrop a color, such as `bg-black/30`; the drawer manages its opacity. Give the content and backdrop `hidden` to keep them hidden before the elements upgrade.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/drawer"
</script>

<ui-drawer>
  <ui-drawer-trigger><button>Filters</button></ui-drawer-trigger>
  <ui-drawer-backdrop hidden></ui-drawer-backdrop>
  <ui-drawer-content hidden>
    <ui-drawer-title>Filters</ui-drawer-title>
    <ui-drawer-description>Narrow down the results.</ui-drawer-description>
    <ui-drawer-close><button>Done</button></ui-drawer-close>
  </ui-drawer-content>
</ui-drawer>
```

## Scrollable Content

Put long content in an inner `min-h-0 flex-1 overflow-y-auto` area. A downward drag scrolls that area first; when it reaches the top, the same gesture can move the drawer. `initial-focus="content"` starts focus on the sheet itself.

```ts title="scrollable.ts"
import "@ui-sdk/web/drawer"

const paragraphs = [
  "The drawer rises from any edge, rests on snap points and follows your finger with the same spring as a system sheet.",
  "Snap points take fractions of the screen, pixels, rem, percentages or the content's own size. Points that land within a pixel of each other merge into one.",
  "Dragging a list scrolls it until it reaches the top, and then the same gesture moves the drawer, so closing a long sheet never needs two tries.",
  "The handle steps through the snap points with a press, the arrow keys, Home and End. Screen readers on phones adjust it like a slider.",
  "Below a snap point you choose, the page behind stays usable and undimmed, like a map with a sheet of results.",
  "Drawers opened from inside each other stack, and the one beneath steps back while the new one rises.",
  "The on-screen keyboard pushes the drawer up, and the focused field scrolls into view inside it, never the page.",
  "With reduced motion, drawers fade in and out instead of sliding.",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-drawer>
      <ui-drawer-trigger><button>Scrollable Content</button></ui-drawer-trigger>
      <ui-drawer-backdrop hidden></ui-drawer-backdrop>
      <ui-drawer-content initial-focus="content" hidden>
        <div data-slot="grip" aria-hidden="true"></div>
        <div data-slot="stack">
          <ui-drawer-title>Release notes</ui-drawer-title>
          <ui-drawer-description>Everything new in the drawer.</ui-drawer-description>
        </div>
        <div data-slot="scroll">
          ${[...paragraphs, ...paragraphs].map((paragraph) => `<p data-slot="hint">${paragraph}</p>`).join("")}
        </div>
        <div data-slot="stack">
          <ui-drawer-close><button data-variant="solid">Got It</button></ui-drawer-close>
        </div>
      </ui-drawer-content>
    </ui-drawer>
  `
}

export { mount }
```

Open the long sheet and scroll its text. At the top, drag downward to move the sheet; on a keyboard, Tab reaches the controls and Escape closes it.

## Sides

`side` chooses bottom, top, left, or right. Logical `start` and `end` follow text direction. The content’s `data-side` tells you which physical edge to style.

Side drawers can opt into `prevent-edge-swipe` to keep an edge gesture from starting iOS Safari’s back or forward navigation. It also prevents clicks right at those edges, so use it only when you need that tradeoff.

```ts title="sides.ts"
import "@ui-sdk/web/drawer"

const sides = [
  {
    side: "top",
    label: "Top",
    title: "Notifications",
    description: "You're all caught up.",
  },
  {
    side: "right",
    label: "Right",
    title: "Cart",
    description: "2 items, $84.00.",
  },
  {
    side: "bottom",
    label: "Bottom",
    title: "Share",
    description: "Send this page to your team.",
  },
  {
    side: "left",
    label: "Left",
    title: "Menu",
    description: "Jump to a section of the docs.",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="row">
      ${sides
        .map(
          ({
            side,
            label,
            title,
            description,
          }) => `<ui-drawer side="${side}" ${side === "left" || side === "right" ? "prevent-edge-swipe" : ""}>
            <ui-drawer-trigger><button>${label}</button></ui-drawer-trigger>
            <ui-drawer-backdrop hidden></ui-drawer-backdrop>
            <ui-drawer-content hidden>
              <div data-slot="stack">
                <ui-drawer-title>${title}</ui-drawer-title>
                <ui-drawer-description>${description}</ui-drawer-description>
              </div>
              <ui-drawer-close><button data-variant="solid">Close</button></ui-drawer-close>
            </ui-drawer-content>
          </ui-drawer>`
        )
        .join("")}
    </div>
  `
}

export { mount }
```

Open a sheet from each edge. Drag it back toward that edge, press outside, or press Escape to close it.

## Snap Points

`snap-points` are the places the drawer can rest, as a comma-separated list. It opens at the first, or at `default-snap-point`, and settles at another after a drag. A fast fling can skip intermediate points.

| Value              | Size                                       |
| ------------------ | ------------------------------------------ |
| `0.5`              | Half the viewport along the drawer’s axis. |
| `320` or `"320px"` | Pixels; numbers above 1 are pixel values.  |
| `"20rem"`          | A multiple of the root font size.          |
| `"50%"`            | A percentage of the viewport.              |
| `"content"`        | The sheet’s own size, the default.         |

The sheet’s CSS size is the limit: `1` cannot make a short sheet fill the screen. Use a height such as `h-[calc(100dvh-3rem)]` when the largest point should nearly fill it. The drawer measures again when content or available space changes; a moved resting point reports `content-resize`.

A Handle wraps a button with an accessible name. Pressing it moves to the next larger snap point, then wraps to the smallest. Arrow keys along the drawer’s axis move one point without wrapping; Home and End move to the ends. `canExpand` and `canCollapse` let the example show which moves remain.

For a sheet with one snap point, use a decorative bar instead of an inactive button.

```ts title="snap-points.ts"
import "@ui-sdk/web/drawer"

const places = [
  { name: "Blue Bottle Coffee", detail: "Coffee · 0.2 mi" },
  { name: "Tartine Bakery", detail: "Bakery · 0.4 mi" },
  { name: "Dolores Park", detail: "Park · 0.5 mi" },
  { name: "Mission Dolores", detail: "Landmark · 0.6 mi" },
  { name: "Ritual Coffee Roasters", detail: "Coffee · 0.7 mi" },
  { name: "Bi-Rite Creamery", detail: "Ice cream · 0.7 mi" },
  { name: "Alamo Square", detail: "Park · 1.1 mi" },
  { name: "The Castro Theatre", detail: "Cinema · 1.2 mi" },
  { name: "Ferry Building", detail: "Market · 2.3 mi" },
  { name: "Coit Tower", detail: "Landmark · 2.9 mi" },
  { name: "Golden Gate Park", detail: "Park · 3.0 mi" },
  { name: "Lands End", detail: "Trail · 5.4 mi" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-drawer snap-points="0.25,0.5,1" default-snap-point="0.5" expand-on-scroll>
      <ui-drawer-trigger><button>Find a Place</button></ui-drawer-trigger>
      <ui-drawer-backdrop hidden></ui-drawer-backdrop>
      <ui-drawer-content hidden>
        <ui-drawer-handle><button aria-label="Resize"></button></ui-drawer-handle>
        <div data-slot="stack">
          <ui-drawer-title>Places nearby</ui-drawer-title>
          <ui-drawer-description>Drag the drawer, or press the handle, to see more.</ui-drawer-description>
        </div>
        <div data-slot="scroll">
          <ul data-slot="list">
            ${places
              .map(
                (place) => `<li>
                  <div>${place.name}</div>
                  <div data-slot="hint">${place.detail}</div>
                </li>`
              )
              .join("")}
          </ul>
        </div>
      </ui-drawer-content>
    </ui-drawer>
  `
}

export { mount }
```

Open the sheet at its middle snap point. Drag it, press the handle, or Tab to the handle and use Up, Down, Home and End to try the other resting points.

## Controlled

Set the element’s `open` and `snapPoint` properties, and listen for `openchange` and `snappointchange`; the attributes set where it starts. You can control opening and snap points independently. Cancel a proposed change with `event.preventDefault()`; a canceled swipe springs back. `openchangecomplete` fires after the sheet settles.

```html
<ui-drawer snap-points="0.25,0.5,1" snap-point="0.5"></ui-drawer>

<script type="module">
  const drawer = document.querySelector("ui-drawer")
  drawer.addEventListener(
    "openchange",
    (event) => (open.checked = event.detail.value)
  )
  drawer.addEventListener(
    "snappointchange",
    (event) => (size.value = String(event.detail.value))
  )
  drawer.open = true
  drawer.snapPoint = 1
</script>
```

## Not Dismissible

With `dismissible="false"`, Escape, outside presses, back gestures, and swipes leave the drawer open. `dismissattempt` tells you what was tried, so you can offer a way to discard unsaved work. Close parts, triggers, and controllers can still close it deliberately.

```html
<ui-drawer dismissible="false">
  <ui-drawer-trigger><button>Write a Post</button></ui-drawer-trigger>
  <ui-drawer-backdrop hidden></ui-drawer-backdrop>
  <ui-drawer-content hidden>
    <ui-drawer-close id="discard" hidden
      ><button>Discard</button></ui-drawer-close
    >
    <ui-drawer-close value="post"><button>Post</button></ui-drawer-close>
  </ui-drawer-content>
</ui-drawer>

<script type="module">
  const drawer = document.querySelector("ui-drawer")
  drawer.addEventListener("dismissattempt", () => (discard.hidden = false))
</script>
```

## Modal

Set `modal-above` when the page should stay usable beside a small sheet. At or below that point there is no dim, inert page, scroll lock, or `aria-modal`. Above it, `modal` applies. The switch happens when the drawer settles and does not move focus; `data-interactive` exposes the usable-page state.

`modal` has the same choices as [Dialog](./dialog.md#modal): `true` blocks the page, `"trap-focus"` keeps Tab inside while leaving the page usable, and `false` allows focus to leave. A click on the page also closes a `"trap-focus"` drawer, while a non-modal drawer closes on an outside press only when `close-on-outside-press` is enabled.

```ts title="non-modal.ts"
import "@ui-sdk/web/drawer"

const places = [
  { name: "Blue Bottle Coffee", detail: "Coffee · 0.2 mi" },
  { name: "Tartine Bakery", detail: "Bakery · 0.4 mi" },
  { name: "Dolores Park", detail: "Park · 0.5 mi" },
  { name: "Mission Dolores", detail: "Landmark · 0.6 mi" },
  { name: "Ritual Coffee Roasters", detail: "Coffee · 0.7 mi" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <ul data-slot="list" aria-label="Places">
        ${places
          .map(
            (place) => `<li>
              <button type="button" data-place="${place.name}">${place.name}<span data-slot="hint">${place.detail}</span></button>
            </li>`
          )
          .join("")}
      </ul>
      <ui-drawer snap-points="0.2,0.6" modal-above="0.2">
        <ui-drawer-trigger><button>Get Directions</button></ui-drawer-trigger>
        <ui-drawer-backdrop hidden></ui-drawer-backdrop>
        <ui-drawer-content hidden>
          <ui-drawer-handle><button aria-label="Resize"></button></ui-drawer-handle>
          <div data-slot="row">
            <div data-slot="stack">
              <ui-drawer-title></ui-drawer-title>
              <ui-drawer-description></ui-drawer-description>
            </div>
            <ui-drawer-close><button>Done</button></ui-drawer-close>
          </div>
          <ol data-slot="stack">
            <li>Head north on Valencia St.</li>
            <li>Turn left onto 18th St.</li>
            <li></li>
          </ol>
        </ui-drawer-content>
      </ui-drawer>
    </div>
  `
  const content = root.querySelector("ui-drawer-content")!
  const title = root.querySelector("ui-drawer-title")!
  const description = root.querySelector("ui-drawer-description")!
  const arrival = root.querySelector("ol li:last-child")!
  const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-place]")]
  const select = (destination: string) => {
    for (const button of buttons) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.place === destination)
      )
    }
    title.textContent = `To ${destination}`
    arrival.textContent = `Arrive at ${destination}.`
  }
  const describe = () => {
    description.textContent = content.hasAttribute("data-interactive")
      ? "12 min walk. Pick another place behind the sheet."
      : "12 min walk. Drag the sheet down to see the places."
  }
  for (const button of buttons) {
    button.addEventListener("click", () => select(button.dataset.place!))
  }
  new MutationObserver(describe).observe(content, {
    attributes: true,
    attributeFilter: ["data-interactive"],
  })
  select(places[0].name)
  describe()
}

export { mount }
```

Open directions at the small snap point and choose another place behind the sheet. Expand it to make the sheet modal, then collapse it to use the page again.

## Nested Drawers

A drawer opened inside another joins its stack. Escape and outside presses affect the topmost one; closing a parent closes its children. `--drawer-stack` follows the sheets above it as they open and drag, so a parent can scale back with `[scale:calc(1-var(--drawer-stack)*0.04)]`.

```ts title="nested.ts"
import "@ui-sdk/web/drawer"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-drawer>
      <ui-drawer-trigger><button>Account</button></ui-drawer-trigger>
      <ui-drawer-backdrop hidden></ui-drawer-backdrop>
      <ui-drawer-content hidden>
        <div data-slot="grip" aria-hidden="true"></div>
        <div data-slot="stack">
          <ui-drawer-title>Account</ui-drawer-title>
          <ui-drawer-description>Manage how you sign in.</ui-drawer-description>
        </div>
        <dl>
          <div data-slot="row">
            <dt>Email</dt>
            <dd>hollis@example.com</dd>
          </div>
          <div data-slot="row">
            <dt>Password</dt>
            <dd>Changed 3 months ago</dd>
          </div>
          <div data-slot="row">
            <dt>Two-factor</dt>
            <dd>On</dd>
          </div>
        </dl>
        <div data-slot="stack">
          <ui-drawer>
            <ui-drawer-trigger><button>Change Password</button></ui-drawer-trigger>
            <ui-drawer-backdrop hidden></ui-drawer-backdrop>
            <ui-drawer-content hidden>
              <div data-slot="grip" aria-hidden="true"></div>
              <div data-slot="stack">
                <ui-drawer-title>Change password</ui-drawer-title>
                <ui-drawer-description>Use at least 12 characters.</ui-drawer-description>
              </div>
              <ui-field>
                <ui-field-label>New password</ui-field-label>
                <ui-input>
                  <input type="password" />
                </ui-input>
              </ui-field>
              <div data-slot="stack">
                <ui-drawer-close><button data-variant="solid">Update</button></ui-drawer-close>
              </div>
            </ui-drawer-content>
          </ui-drawer>
          <ui-drawer-close><button data-variant="solid">Done</button></ui-drawer-close>
        </div>
      </ui-drawer-content>
    </ui-drawer>
  `
}

export { mount }
```

Open Account, then Change Password. The parent steps back as the child opens; Escape closes one sheet at a time.

## Forms

A Close part with the `action` attribute fires an `action` event; pass a Promise to `event.detail.waitUntil()`. The sheet stays open while it runs, including through Escape or a swipe. A rejection leaves the action’s error state available for a retry. See [Alert Dialog’s async action](./alert-dialog.md#async-action) for the shared pending and error contract.

`keep-mounted` preserves unfinished fields, and `final-focus` returns focus to the updated profile.

```html
<ui-drawer-content keep-mounted final-focus="#profile-summary" hidden>
  <form><!-- fields --></form>
  <ui-drawer-close action><button>Save Changes</button></ui-drawer-close>
</ui-drawer-content>

<script type="module">
  const close = document.querySelector("ui-drawer-close[action]")
  const button = close.querySelector("button")
  close.addEventListener("action", (event) => {
    button.textContent = "Saving…"
    const saving = save()
    event.detail.waitUntil(saving)
    saving.then(
      () => (button.textContent = "Save Changes"),
      () => (button.textContent = "Try Again")
    )
  })
</script>
```

## Outlets

An Outlet makes another element follow the sheet’s progress. Its `keyframes` property runs from collapsed to fully expanded; this example scales and rounds the inbox behind a compose sheet. An outlet outside the drawer connects with `for="drawer-id"`.

```ts title="outlet.ts"
import "@ui-sdk/web/drawer"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import "@ui-sdk/web/textarea"

const messages = [
  { from: "Inès", text: "The proofs are back from the printer." },
  { from: "Kofi", text: "Lunch on Thursday?" },
  { from: "Wren", text: "Pushed the fix for the release build." },
  { from: "Tomasz", text: "Can you review the launch checklist?" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-drawer>
      <div>
        <ui-drawer-outlet>
          <div data-slot="row">
            <span>Inbox</span>
            <ui-drawer-trigger><button data-variant="solid">Compose</button></ui-drawer-trigger>
          </div>
          <ul data-slot="list">
            ${messages
              .map(
                (message) => `<li>
                  <div>${message.from}</div>
                  <div data-slot="hint">${message.text}</div>
                </li>`
              )
              .join("")}
          </ul>
        </ui-drawer-outlet>
      </div>
      <ui-drawer-backdrop hidden></ui-drawer-backdrop>
      <ui-drawer-content hidden>
        <div data-slot="grip" aria-hidden="true"></div>
        <div data-slot="stack">
          <ui-drawer-title>New message</ui-drawer-title>
          <ui-drawer-description>Write a quick note to the team.</ui-drawer-description>
        </div>
        <ui-field>
          <ui-field-label>To</ui-field-label>
          <ui-input>
            <input value="Design team" />
          </ui-input>
        </ui-field>
        <ui-field>
          <ui-field-label>Message</ui-field-label>
          <ui-textarea>
            <textarea placeholder="What's new?"></textarea>
          </ui-textarea>
        </ui-field>
        <div data-slot="stack">
          <ui-drawer-close value="send"><button data-variant="solid">Send</button></ui-drawer-close>
        </div>
      </ui-drawer-content>
    </ui-drawer>
  `
  root.querySelector("ui-drawer-outlet")!.keyframes = {
    scale: [1, 0.94],
    borderRadius: ["0px", "24px"],
  }
}

export { mount }
```

Open Compose, then drag the sheet slowly. The inbox behind it scales and rounds with the sheet’s progress.

## Opening from Anywhere

Give the drawer an `id`, connect external triggers with `for`, and assign each trigger’s `payload` property. The drawer’s `payloadchange` event carries it in `event.detail.value`. This lets one sheet serve every row, including disabled triggers for unavailable actions.

Calling `open({ payload })` on the drawer’s `api` returns a Promise with the closing `reason` and `returnValue`. `getSnapPoint()` and `setSnapPoint()` also let code read or move the sheet. The [controller guide](../controllers.md) covers the shared result and payload flow.

```html
<ui-drawer-trigger for="share" disabled
  ><button>Share</button></ui-drawer-trigger
>

<ui-drawer id="share">
  <ui-drawer-backdrop hidden></ui-drawer-backdrop>
  <ui-drawer-content hidden>
    <ui-drawer-title></ui-drawer-title>
  </ui-drawer-content>
</ui-drawer>

<script type="module">
  const drawer = document.querySelector("#share")
  document.querySelector("ui-drawer-trigger").payload = file
  drawer.addEventListener("payloadchange", (event) => {
    drawer.querySelector("ui-drawer-title").textContent =
      `Share ${event.detail.value?.name}`
  })

  const { reason, returnValue } = await drawer.api.open({ payload: roadmap })
</script>
```

## Action Sheet

A sheet can offer choices instead of a form. Give each Close part a `value`; the open Promise returns the chosen action. Escape, an outside press, or a swipe returns no value, which this example treats as Cancel.

Put the least risky action first because a keyboard or code open starts there. Use an [Alert Dialog](./alert-dialog.md) when a choice needs confirmation.

```ts title="action-sheet.ts"
import "@ui-sdk/web/drawer"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="row">
      <button type="button">Photo Options</button>
      <ui-drawer>
        <ui-drawer-backdrop hidden></ui-drawer-backdrop>
        <ui-drawer-content hidden>
          <div data-slot="stack">
            <ui-drawer-title>Beach.jpg</ui-drawer-title>
            <ui-drawer-description>Taken today at 9:41.</ui-drawer-description>
          </div>
          <div data-slot="stack">
            <ui-drawer-close value="share"><button>Share</button></ui-drawer-close>
            <ui-drawer-close value="duplicate"><button>Duplicate</button></ui-drawer-close>
            <ui-drawer-close value="delete"><button>Delete</button></ui-drawer-close>
            <ui-drawer-close value="cancel"><button>Cancel</button></ui-drawer-close>
          </div>
        </ui-drawer-content>
      </ui-drawer>
    </div>
  `
  const drawer = root.querySelector("ui-drawer")!
  root.querySelector("button")!.addEventListener("click", async () => {
    const { returnValue = "cancel" } = await drawer.api.open()
    log(root, returnValue === "cancel" ? "Canceled" : `Chose ${returnValue}`)
  })
}

export { mount }
```

Open Photo Options and choose an action. The console logs the returned value; dismissing the sheet counts as Cancel.

## Responsive

This recipe uses a media query to choose a drawer on a narrow screen and a dialog on a wide screen. It replaces the markup at the breakpoint, so an open sheet closes and field edits reset. Keep the open state and field values outside that markup if they must survive the switch.

```html
<div id="profile"></div>

<script type="module">
  import "@ui-sdk/web/dialog"
  import "@ui-sdk/web/drawer"

  const isDesktop = matchMedia("(min-width: 768px)")
  const render = () => {
    const name = isDesktop.matches ? "dialog" : "drawer"
    document.querySelector("#profile").innerHTML = `
      <ui-${name}>
        <ui-${name}-trigger><button>Edit Profile</button></ui-${name}-trigger>
        <ui-${name}-backdrop hidden></ui-${name}-backdrop>
        <ui-${name}-content hidden>${profileForm}</ui-${name}-content>
      </ui-${name}>
    `
  }
  isDesktop.addEventListener("change", render)
  render()
</script>
```

## Driver and Physics

`driver` picks how the sheet moves. `"scroll-snap"` uses native scrolling and CSS snap points for a bottom sheet; `"pointer"` uses pointer dragging and spring motion on every side. The default `"auto"` chooses native scrolling for a bottom sheet on a touch screen, and pointer dragging for mouse and pen, other sides, `modal-above`, or `expand-on-scroll="false"`. `data-driver` reports the active choice.

Override part of `sheetPhysics.ios` with the `physics` property to tune the pointer driver: `response` changes spring timing, `dampingRatio` changes settling, `momentumDampingRatio` affects flings, and `rubberBand` changes resistance past the largest point.

```html
<ui-drawer driver="pointer"></ui-drawer>

<script type="module">
  document.querySelector("ui-drawer").physics = {
    response: 0.3,
    dampingRatio: 0.9,
  }
</script>
```

## Page Integration

`theme-color` dims an existing `<meta name="theme-color">` with the backdrop, so the browser's toolbars can follow it; pages without that tag are left alone. `persistent-elements` keeps selected elements usable while the drawer is modal: a comma-separated list of selectors, or assign the `persistentElements` property an array of elements or a function returning elements. Something that must stay above the backdrop also needs its own top-layer surface.

Drawers render in place and use the top layer. `container` takes a selector and moves the backdrop and viewport there, for example into a shadow root or out of a surrounding form. See the shared [popup guide](../popups.md#hidden-content-and-containers).

```html
<ui-drawer
  theme-color
  persistent-elements="#chat-launcher"
  container="#drawer-host"
></ui-drawer>
```

## Custom Rendering

Elements have no render functions. Trigger, Close, and Handle parts wrap your native button or link, and `as-child` on the title binds your own heading. Content adds a full-screen `ui-drawer-viewport` around itself when the markup has none. Watch the drawer's `openchange` event and the content's data attributes, like `data-expanded`, to change what's inside.

```html
<ui-drawer>
  <ui-drawer-trigger shortcut="mod+j"
    ><button>View Details</button></ui-drawer-trigger
  >
  <ui-drawer-content hidden>
    <ui-drawer-title as-child><h3>Quarterly report</h3></ui-drawer-title>
    <ui-drawer-description>Drag up to see more.</ui-drawer-description>
    <ui-drawer-close
      ><a href="/reports/q3">Open the Full Page</a></ui-drawer-close
    >
  </ui-drawer-content>
</ui-drawer>

<script type="module">
  const drawer = document.querySelector("ui-drawer")
  const content = drawer.querySelector("ui-drawer-content")
  drawer.addEventListener("openchange", (event) => {
    drawer.querySelector("ui-drawer-trigger button").textContent = event.detail
      .value
      ? "Viewing"
      : "View Details"
  })
  new MutationObserver(() => {
    content.querySelector("ui-drawer-description").textContent =
      content.hasAttribute("data-expanded")
        ? "Showing all of it."
        : "Drag up to see more."
  }).observe(content, { attributeFilter: ["data-expanded"] })
</script>
```

## Styling

Each element has a `data-slot`, such as `drawer-content`, and shows its state through the attributes listed under [Data Attributes](#data-attributes).

Leave the content's `translate` and the backdrop's opacity to the drawer. You can style scale, corners, colors, and the inner scroll area. A bottom sheet can use an `after` element below its edge to cover the gap during overscroll, as the examples do. The drawer respects reduced motion, fading instead of sliding.

### `<ui-drawer-content>`
- `--drawer-progress`: How far open the sheet is, from 0 closed to 1 at its largest snap point. Never past 1.
- `--drawer-dim`: How dim the page behind is, from 0 to 1. The backdrop's opacity follows it.
- `--drawer-expand`: 0 at the second-largest snap point and below, 1 at the largest. With one snap point, the whole travel.
- `--drawer-stack`: How many sheets opened from inside this one are open above it, rising smoothly as each one opens. Push it back with it.

### `<ui-drawer-viewport>`
- `--keyboard-inset`: How many pixels of the page the on-screen keyboard covers, 0 without one.
- `--visual-viewport-width`: The width of the part of the page you can see.
- `--visual-viewport-height`: The height of the part of the page you can see, above the keyboard.
- `--visual-viewport-top`: How far the part of the page you can see is scrolled from the top of the layout, as when the keyboard pushes it up.

### `<ui-drawer-outlet>`
- `--drawer-progress`: How far open the sheet is, from 0 closed to 1 at its largest snap point. Never past 1.
- `--drawer-dim`: How dim the page behind is, from 0 to 1. The backdrop's opacity follows it.
- `--drawer-expand`: 0 at the second-largest snap point and below, 1 at the largest. With one snap point, the whole travel.

## Data Attributes

### `<ui-drawer-trigger>`
`[data-slot="drawer-trigger"]`

- `data-closed`: Present while the drawer is closed, including while it animates out.
- `data-disabled`: Present when the trigger is disabled.
- `data-open`: Present while the drawer is open. On a trigger, while it's open from that trigger.

### `<ui-drawer-backdrop>`
`[data-slot="drawer-backdrop"]`

- `data-closed`: Present while the drawer is closed, including while it animates out.
- `data-open`: Present while the drawer is open. On a trigger, while it's open from that trigger.
- `data-interactive`: Present while it rests at or below `modalAbove`, so the page behind is usable. The backdrop lets presses through.
- `data-starting-style`: Present for the first frame. The drawer slides itself, so leave the content's translate and the backdrop's opacity alone.
- `data-ending-style`: Present while the drawer animates out.
- `data-dragging`: Present while a finger, mouse or pen drags it.

### `<ui-drawer-viewport>`
`[data-slot="drawer-viewport"]`

- `data-side` (`top`, `right`, `bottom`, `left`): The edge it comes from, with `start` and `end` resolved for the writing direction.
- `data-closed`: Present while the drawer is closed, including while it animates out.
- `data-open`: Present while the drawer is open. On a trigger, while it's open from that trigger.
- `data-keyboard`: Present on the viewport while the on-screen keyboard covers part of the page.

### `<ui-drawer-content>`
`[data-slot="drawer-content"]`

- `data-closed`: Present while the drawer is closed, including while it animates out.
- `data-side` (`top`, `right`, `bottom`, `left`): The edge it comes from, with `start` and `end` resolved for the writing direction.
- `data-open`: Present while the drawer is open. On a trigger, while it's open from that trigger.
- `data-snap-point` (`content`, `0.2`): The snap point it rests on or is moving to, as written, like `0.5` or `content`.
- `data-interactive`: Present while it rests at or below `modalAbove`, so the page behind is usable. The backdrop lets presses through.
- `data-starting-style`: Present for the first frame. The drawer slides itself, so leave the content's translate and the backdrop's opacity alone.
- `data-ending-style`: Present while the drawer animates out.
- `data-driver` (`pointer`, `scroll-snap`): What moves it.
- `data-expanded`: Present while it rests at its largest snap point.
- `data-dragging`: Present while a finger, mouse or pen drags it.

### `<ui-drawer-handle>`
`[data-slot="drawer-handle"]`

- `data-snap-point` (`content`, `0.2`): The snap point it rests on or is moving to, as written, like `0.5` or `content`.
- `data-expanded`: Present while it rests at its largest snap point.

### `<ui-drawer-close>`
`[data-slot="drawer-close"]`

- `data-pending`: Present on a Close part while its action runs.

### `<ui-drawer-outlet>`
`[data-slot="drawer-outlet"]`

- `data-closed`: Present while the drawer is closed, including while it animates out.
- `data-open`: Present while the drawer is open. On a trigger, while it's open from that trigger.

## API Reference

Props are attributes in kebab case, like `modal-above`: `"false"` is false. `snap-points` takes a
comma-separated list, like `"0.5,1"` or `"240px,content"`. `container` takes a CSS selector, and
`persistent-elements` a comma-separated list of selectors. `physics` and `controller` are properties.
Callbacks are DOM events.

### Drawer

- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.
- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `open?` (`boolean`): Whether the dialog is open. Pass it to control the dialog.
- `defaultOpen?` (`boolean`): Whether the dialog starts open, when uncontrolled. Focus moves into it once it's on the page.
- `openchangecomplete event`: Runs once the dialog has finished opening or closing, after any animation.
- `dismissible?` (`boolean`): Whether Escape, an outside press and Android's back gesture can close the dialog. Close parts, triggers and the controller always can. Pass `false` while a form has unsaved changes, and ask in `dismissattempt`.
- `persistentElements?` (`(string | Element)[] | (() => Element[])`): Elements that stay usable while the dialog makes the page inert, like a chat launcher or a password manager's button. Elements, CSS selectors, or a function that returns elements, read when the dialog opens. Presses on them never close it.
- `pendingAnnouncement?` (`string`): What screen readers hear once a Close part's action has been running for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `openchange event`: Runs when the drawer wants to open or close. `details.reason` says why, `"swipe"` included, `details.cancel()` stops it, and `details.returnValue` carries what closed it.
- `payloadchange event`: Runs when the payload the content shows changes: a trigger with another payload opens the drawer, or takes a non-modal drawer over while it's open, which fires no `openchange`, and so does a controller's `open({ payload })` on the open drawer. `details.cancel()` keeps the previous payload.
- `dismissattempt event`: Runs when a dismissal was refused because `dismissible` is false, including a swipe. The drawer resists and springs back. Ask "Discard changes?" here.
- `modal?` (`"trap-focus" | boolean`): `true`: the rest of the page is inert and doesn't scroll, focus is trapped, and an outside press only closes the drawer. `"trap-focus"`: traps focus and leaves the page usable. `false`: a drawer beside the page. See `modalAbove` to make it modal only above a snap point.
- `closeOnOutsidePress?` (`boolean`): Whether pressing outside the drawer, like on its backdrop, closes it.
- `controller?` (`DrawerController<any, any>`): Opens, closes and moves the drawer from anywhere, and connects triggers and outlets outside it. Create one with `createDrawerController()`.
- `snapPoints?` (`SnapPoint[]`): Where the drawer can rest, from the edge it comes from: a fraction of the screen up to 1, pixels above 1, `"…px"`, `"…rem"`, `"…%"`, or `"content"` for its own size. None can be larger than the drawer, which you size with CSS.
- `snapPoint?` (`SnapPoint | null`): The snap point it rests on. Pass it to control it.
- `defaultSnapPoint?` (`SnapPoint`): The snap point it opens at, when uncontrolled. It opens there again each time.
- `snappointchange event`: Runs when the drawer moves to another snap point. `details.reason` says why: a swipe, the handle, the keyboard, a resize or the controller.
- `side?` (`Side`): The edge it comes from. `"start"` and `"end"` follow the writing direction.
- `modalAbove?` (`SnapPoint`): At or below this snap point the page stays usable and undimmed, like Maps: no inert page, no scroll lock, no `aria-modal`, and presses beside the drawer reach the page. Above it, `modal` applies. Changes once the drawer comes to rest.
- `driver?` (`SheetDriverName`): How it moves. `"pointer"` follows touch, mouse and pen with a spring fitted to iOS. `"scroll-snap"` uses the browser's own scrolling for bottom drawers. `"auto"` picks scroll snap for a bottom drawer on a touch screen, unless `modalAbove` is set or `expandOnScroll` is false, and the pointer driver otherwise.
- `expandOnScroll?` (`boolean`): Whether dragging toward a larger snap point on scrollable content moves the drawer first, until it's at its largest.
- `physics?` (`Partial<SheetPhysics>`): Overrides the motion: spring, projection, rubber band and dim. Starts from `sheetPhysics.ios`.
- `themeColor?` (`boolean`): Whether `<meta name="theme-color">` dims with the backdrop, so Safari's toolbars darken too. Written where motion starts and ends, never per frame.
- `preventEdgeSwipe?` (`boolean`): Whether presses on the drawer near the screen's left and right edges are kept from starting iOS Safari's back and forward swipe. Taps right at those edges then don't click. Read when the content mounts.

### DrawerTrigger

A trigger outside the drawer names it with `for="drawer-id"`, and takes `payload` as a property.

- `disabled?` (`boolean`): Stops the trigger from opening the dialog. A native button can't be focused or pressed, unless `focusableWhenDisabled` is set.
- `focusableWhenDisabled?` (`boolean`): Keeps a disabled trigger in the tab order with `aria-disabled` instead of the native attribute, so it can host a tooltip that says why. Presses still do nothing.
- `payload?` (`unknown`): Data for the content to render when this trigger opens the dialog, like the row it belongs to.
- `shortcut?` (`string`): A keyboard shortcut that presses the trigger, like `"mod+k"`. `mod` is Command on Apple platforms and Control elsewhere. Sets `aria-keyshortcuts`, and a Shortcut part inside shows it. A modal dialog pauses the page's shortcuts while it's open.
- `controller?` (`PopupController<any, DialogOpenChangeReason, {}, any, DialogPayloadChangeReason>`): Connects a trigger outside the dialog, like one per table row, to the dialog with this controller.

### DrawerBackdrop

Dims the page behind a modal drawer, which manages its opacity. `<ui-drawer-backdrop>` takes no attributes of its own.

### DrawerContent

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `initialFocus?` (`DialogInitialFocus`): Where focus goes when the dialog opens. Opening with touch focuses the dialog itself, so no on-screen keyboard appears.
- `finalFocus?` (`PopupFocusTarget`): Where focus goes when the dialog closes while focus is inside it.
- `keepMounted?` (`boolean`): Whether the dialog stays in the page, hidden, while closed. For animation libraries that drive the exit from state.

### DrawerHandle

Resizes the sheet: a press moves to the next snap point, and arrow keys, Home and End choose one. `<ui-drawer-handle>` wraps your native button.

### DrawerTitle

Names the drawer. `<ui-drawer-title>` renders a level 2 heading.

### DrawerDescription

Describes the drawer while it's rendered. `<ui-drawer-description>` is a paragraph.

### DrawerClose

- `value?` (`string`): Reported as `returnValue` in `openchange` and by the controller's `open()`. `createConfirm()` resolves `true` for `"confirm"`.
- `action?` (`((event: Event | undefined, details: ActionDetails) => unknown)`): Runs when the part is pressed, before the dialog closes. A returned Promise keeps the dialog open while it runs: the part gets `data-pending`, `aria-busy` and `aria-disabled`, screen readers hear the dialog's `pendingAnnouncement` after a second, and nothing but the controller closes the dialog. It closes with reason `"action"` once the Promise resolves. A rejection keeps it open and puts the reason in the part's `error` state until the next press, or until the dialog opens again. `details.source` says how the part was pressed, for changes made after an `await`.

### DrawerShortcut

- `shortcut?` (`string`): The keys to show. Inside a trigger, its `shortcut`.

### DrawerOutlet

An outlet outside the drawer names it with `for="drawer-id"`.

- `keyframes?` (`SheetKeyframes`): Keyframes it plays as the drawer expands, like `{ scale: [1, 0.94] }`: the first while collapsed, the last at the largest snap point. They run on the compositor when they're transforms or opacity.
- `controller?` (`DrawerController<any, any>`): Connects an outlet outside the drawer, like the app's shell, to the drawer with this controller.

### State

The same state shows as data attributes on each element.

`DrawerTrigger`:

- `open` (`boolean`): Whether the dialog is open from this trigger.
- `disabled` (`boolean`): Set by the trigger's `disabled` prop, which stops it opening the dialog.

`DrawerBackdrop`:

- `open` (`boolean`): Whether the dialog is open. False while it animates out.
- `nested` (`boolean`): Whether the dialog was opened from inside another dialog.
- `nestedOpen` (`boolean`): Whether a dialog opened from inside this one is open.
- `interactive` (`boolean`): Whether the page behind is usable, so the backdrop lets presses through.

`DrawerContent`:

- `open` (`boolean`): Whether the dialog is open. False while it animates out.
- `modal` (`boolean | "trap-focus"`): The `modal` setting. Always true for an alert dialog.
- `nested` (`boolean`): Whether the dialog was opened from inside another dialog.
- `nestedOpen` (`boolean`): Whether a dialog opened from inside this one is open.
- `stack` (`number`): How many dialogs are open above this one, nested inside it.
- `payload` (`Payload | undefined`): The payload of the last open, from the trigger that opened it or a controller, typed as the controller's `Payload`.
- `pending` (`boolean`): Whether a Close part's action is running.
- `snapPoint` (`SnapPoint | null`): The snap point it rests on or is moving to.
- `expanded` (`boolean`): Whether it's at its largest snap point.
- `dragging` (`boolean`): Whether a finger, mouse or pen is dragging it.
- `side` (`PhysicalSide`): The edge it comes from, with `start` and `end` resolved.
- `interactive` (`boolean`): Whether the page behind is usable, because it rests at or below `modalAbove`.

`DrawerHandle`:

- `snapPoint` (`SnapPoint | null`): The snap point it rests on.
- `canExpand` (`boolean`): Whether there's a larger snap point to move to.
- `canCollapse` (`boolean`): Whether there's a smaller snap point to move to.

`DrawerClose`:

- `pending` (`boolean`): Whether this part's action is running.
- `error` (`unknown`): Why this part's last action failed, until it's pressed again or the dialog opens again.

`DrawerOutlet`:

- `open` (`boolean`): Whether the drawer is open. False as soon as it starts closing, while it still animates out.

### Reasons

`event.detail.reason` says why the drawer opened or closed.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `parent-close` (`none`): The parent layer closed.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `action` (`MouseEvent | KeyboardEvent`): A Close part's `action` finished.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

For a payload change, it says what opened the drawer or took it over.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

Why it moved to another snap point:

- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `handle-press` (`MouseEvent | KeyboardEvent`): A drawer's handle was pressed, which moved it to its next snap point.
- `handle-key` (`KeyboardEvent`): Arrow keys, Home or End on a drawer's handle moved it between snap points.
- `content-resize` (`none`): The content or the screen changed size, and the drawer's snap point or the carousel's page went away, so it moved to the nearest one.

The dismissals `dismissible` can refuse:

- `outside-press` (`MouseEvent`): A press outside the layer.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.

### Controller

Create one with `createDrawerController<Payload, Result>()` from `@ui-sdk/web/drawer` and assign it to the root
element's `controller` property. The root element's `api` property has the same methods, and its `open` and
`snapPoint` properties read and set whether it's open and where it rests.

Every write method takes an optional `{ reason, event }`, which the events carry. Closing with a controller always works, even when the drawer isn't dismissible or an action is running.

- `isOpen()` (`() => boolean`): Whether it's open. False as soon as it starts closing, while it still animates out.
- `setOpen(open, options?)` (`(open: boolean, options?: PopupChangeOptions<DrawerOpenChangeReason> | undefined) => boolean`): Opens or closes it. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (PopupChangeOptions<DialogPayloadChangeReason> & { payload?: Payload | undefined; anchor?: Anchor | undefined; signal?: AbortSignal | undefined; }) | undefined) => Promise<...>`): Opens it, and resolves once it closes, with why, how and any return value. Resolves exactly once and never rejects: on the next close from any source, when `signal` aborts, or with reason `"unmount"` when the component leaves the page.
- `close(options?)` (`(options?: (PopupChangeOptions<DrawerOpenChangeReason> & { returnValue?: Result | undefined; }) | undefined) => boolean`): Closes it. `returnValue` is passed to the promise `open()` returned. Returns false when the close was canceled or it was already closed.
- `toggle(options?)` (`(options?: PopupChangeOptions<DrawerOpenChangeReason> | undefined) => boolean`): Opens it when it's closed, and closes it when it's open. Returns false when the change was canceled.
- `getPayload()` (`() => Payload | undefined`): The payload of the last open, from a controller or the trigger that opened it.
- `focus()` (`() => void`): Moves focus to the trigger that opened it last, or the first trigger.
- `getSnapPoint()` (`() => SnapPoint | null`): The snap point it rests on, or null before it first opens.
- `setSnapPoint(snapPoint, options?)` (`(snapPoint: SnapPoint, options?: ChangeOptions<DrawerSnapPointChangeReason> | undefined) => boolean`): Moves it to a snap point. While closed, it opens there next. Returns false when the change was canceled or it was already there.

### Events

Events fire on their own element and don't bubble. Calling `preventDefault()` on `openchange` or `snappointchange` cancels the change.

| Member                          | On                  | Description                                                                             |
| ------------------------------- | ------------------- | --------------------------------------------------------------------------------------- |
| `open` property, attribute      | `ui-drawer`         | Whether the drawer is open. The attribute sets where it starts, and is live             |
| `snapPoint` property, attribute | `ui-drawer`         | The snap point it rests on. The `snap-point` attribute sets where it starts             |
| `api` property                  | `ui-drawer`         | The [controller](#controller)                                                           |
| `controller` property           | `ui-drawer`         | A controller from `createDrawerController()`, to drive it from code                     |
| `physics` property              | `ui-drawer`         | Overrides for `sheetPhysics.ios`                                                        |
| `openchange` event              | `ui-drawer`         | `detail: { value: open, reason, event, returnValue }`                                   |
| `openchangecomplete` event      | `ui-drawer`         | `detail: { value: open }`, once it has settled                                          |
| `payloadchange` event           | `ui-drawer`         | `detail: { value: payload, reason, event, source }`, when the content's payload changes |
| `snappointchange` event         | `ui-drawer`         | `detail: { value: snapPoint, reason, event }`                                           |
| `dismissattempt` event          | `ui-drawer`         | `detail: { reason, event }`, when a dismissal was refused                               |
| `payload` property              | `ui-drawer-trigger` | Data for the content, read when the trigger connects                                    |
| `for` attribute                 | `ui-drawer-trigger` | The `id` of a drawer the trigger opens from outside it                                  |
| `for` attribute                 | `ui-drawer-outlet`  | The `id` of a drawer the outlet follows from outside it                                 |
| `keyframes` property            | `ui-drawer-outlet`  | The keyframes it plays as the drawer expands                                            |

## Accessibility

The trigger is a button that opens a dialog, and the drawer follows the [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) while it's modal: `aria-modal`, focus trapped inside, the page inert, labelled by its title and described by its description. Escape closes it. The handle is a button that controls the drawer: a press moves to the next snap point, arrow keys along the drawer's axis step, and Home and End go to the ends. Every line below is an automated test.

### Keyboard

| Key                       | Does                                                                          |
| ------------------------- | ----------------------------------------------------------------------------- |
| Enter, Space              | On the trigger, opens the drawer; on the handle, moves to the next snap point |
| Arrow keys along the axis | On the handle, moves one snap point without wrapping                          |
| Home, End                 | On the handle, moves to the smallest or largest snap point                    |
| Tab, Shift+Tab            | Moves through the sheet's controls, staying inside while it's modal           |
| Escape                    | Closes the topmost drawer when it's dismissible                               |

It shares [Dialog’s focus behavior](./dialog.md#focus): focus moves inside on open and returns when it closes. A touch open focuses the content so a field does not summon the keyboard immediately. When the on-screen keyboard opens, the viewport shrinks and the focused field can scroll into view inside the sheet.

### Tested Behavior

**Dialog**

- The trigger advertises a dialog.
- The trigger opens a modal dialog named by its title and described by its description.
- Opening moves focus into the drawer and closing returns it to the trigger.
- Tab stays inside the drawer.
- Escape closes it with the escape-key reason.
- Pressing the backdrop closes it.
- A Close part closes it.
- Buttons inside it work without closing it.
- The page behind is hidden from assistive technology while it's open.
- Opening and closing never scroll or restyle the page.
- A controller opens it from outside.

**Sheet**

- It rises from the bottom and rests against it at its own size.
- It opens at the first snap point, a fraction of the screen.
- A slow drag settles on the nearest snap point and reports the swipe.
- A drag down past the smallest snap point closes it with the swipe reason.
- A short fast flick down closes it, though it moved less than half its height.
- The same distance, slowly, settles back.
- A fling up from the smallest snap point can pass the middle one.
- A press while it rises catches it and holds it under the finger.
- A short drag back up keeps it open.
- A click on a button inside it isn't a drag.
- With side="…" it rests against the … edge.
- With side="left" a drag toward the left closes it.

**Touch**

- A touch drag down closes it.

**Handle**

- Pressing it moves to the next snap point and wraps.
- Arrow keys step without wrapping, and Home and End go to the ends.
- Moving it moves the drawer to the snap point's extent.
- A snap point a controller sets while it animates closed is where it opens next.
- A controller moves it with the imperative reason.

**Not dismissible**

- Escape reports an attempt and keeps it open.
- A press on the backdrop reports an attempt and keeps it open.
- A swipe down resists, springs back and reports an attempt.

**Modal above a snap point**

- At that snap point the page stays usable and the drawer isn't modal.
- Above it the drawer becomes modal, and back down the page is usable again.
- The switch doesn't move focus.

**Nested**

- Escape closes only the drawer on top.

Runs in React, Vue and web components.

Screen readers and layouts the drawer is tested against:

- No axe violations while closed.
- No axe violations while open.
- No axe violations while a nested drawer is open.
- No axe violations while it rests where the page stays usable.
- The drawer's accessibility tree is a dialog with its handle, title and actions.
- The handle is a button that controls the drawer.

Runs in React, Vue and web components.

- Side="start" comes from the right in a right-to-left layout.
- Side="end" comes from the left in a right-to-left layout.
- A drag toward the start edge closes it in a right-to-left layout.

Runs in React, Vue and web components.

Also tested:

- Without a touch screen `auto` picks the pointer driver.

**Dialog**

- An open modal drawer is marked aria-modal.
- A keyboard open focuses its first control, and Tab cycles through the controls in order.
- A controller's open() resolves with how it closed.

**Shortcuts**

- A trigger connected through a controller shows its shortcut in a Shortcut part, and binds it.

**State attributes**

- The content names its side, its snap point and whether it's at the largest.
- A drawer resting at its own size reports the content snap point and is expanded.
- Data-dragging is set while a drag moves it.
- A drawer opened from inside another marks both, and the one beneath reads its depth from --drawer-stack.

**Physics**

- Past the largest snap point it stretches less than 24px and springs back.

**Touch**

- Pulling down on scrolled content scrolls it to the top, then moves the drawer in the same gesture.
- Pushing up on content below the largest snap point grows the drawer before the content scrolls.

**Compositor**

- A settle runs as a spring sampled into linear(), on translate and the backdrop's opacity.
- While a finger drives it, the drawer writes no attributes, only styles.
- Its variables are registered and don't inherit, so moving it restyles only the drawer.
- With reduced motion it fades in and out instead of sliding.

**Page**

- An outlet outside the drawer follows it, and goes back when it closes.
- The theme color dims while it's open and comes back when it closes.
- Content that grows moves its content snap point, and the drawer follows.
- Escape on a drawer that can't be dismissed nudges it toward closing.

**Scroll-snap driver**

- On a touch screen it's the driver `auto` picks.
- On a touch screen `auto` keeps the pointer driver with …=….
- It opens at its first snap point with the browser's scrolling.
- A swipe up snaps to the next snap point and reports the swipe.
- It comes to rest when the scroll ends before the page hears the finger lift.
- The handle moves it with a spring, like the pointer driver.

Runs in React, Vue and web components.
