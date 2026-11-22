# Tabs

Switch between related panels with one tab selected at a time.

Use Tabs when several views share the same space, such as settings sections or a preview and its source. Each tab opens the panel with the same value.

<ComponentExample
  name="tabs/basic"
  inspect
  caption="Choose Password to show its panel. Use the left and right arrow keys to move between the tabs."
/>

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. On the server the import does nothing.

```ts
import "@ui-sdk/web/tabs"
```

## Composition

Use the following composition to build a `ui-tabs`:

```text
ui-tabs
├── ui-tabs-list
│   ├── ui-tabs-tab
│   │   └── button
│   └── ui-tabs-tab
│       └── button
├── ui-tabs-panel
└── ui-tabs-panel
```

Give each tab and its panel the same unique `value`. Give the list an accessible name. Put a native button inside each `ui-tabs-tab`. Set `default-value` to choose the initial tab; otherwise, the first enabled tab is selected.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/tabs"
</script>

<ui-tabs default-value="account">
  <ui-tabs-list aria-label="Settings">
    <ui-tabs-tab value="account"
      ><button type="button">Account</button></ui-tabs-tab
    >
    <ui-tabs-tab value="password"
      ><button type="button">Password</button></ui-tabs-tab
    >
  </ui-tabs-list>
  <ui-tabs-panel value="account">Manage your profile.</ui-tabs-panel>
  <ui-tabs-panel value="password">Choose a new password.</ui-tabs-panel>
</ui-tabs>
```

## Build Your Own

`@ui-sdk/web/tabs` comes with ready-made `ui-tabs` elements. If you'd like to build your own, with your own element names, start from the `tabs` primitive in `@ui-sdk/core`:

```ts title="segments.ts"
import { tabs } from "@ui-sdk/core/tabs"
import { createParts, wrappedButton } from "@ui-sdk/web"

createParts(tabs, {
  root: { tag: "segment-group", display: "block" },
  list: { tag: "segment-list", display: "block" },
  tab: { tag: "segment-tab", target: wrappedButton, display: "contents" },
  panel: { tag: "segment-panel", display: "block" },
})
```

```html
<segment-group default-value="day">
  <segment-list aria-label="Range">
    <segment-tab value="day"><button type="button">Day</button></segment-tab>
    <segment-tab value="week"><button type="button">Week</button></segment-tab>
  </segment-list>
  <segment-panel value="day">128 visitors today.</segment-panel>
  <segment-panel value="week">1,024 visitors this week.</segment-panel>
</segment-group>
```

`wrappedButton` puts each tab's behavior and attributes on the button inside it. Add `"tab-icon"` and `indicator` elements to get those parts too. Each element keeps the behavior, state and data attributes of its ready-made counterpart. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Vertical

Set `orientation="vertical"` to use Up and Down Arrow instead. Style the list as a column beside the panels to match.

```ts title="vertical.ts"
import "@ui-sdk/web/tabs"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tabs default-value="general" orientation="vertical">
      <ui-tabs-list aria-label="Preferences">
        <ui-tabs-tab value="general">
          <button type="button">General</button>
        </ui-tabs-tab>
        <ui-tabs-tab value="security">
          <button type="button">Security</button>
        </ui-tabs-tab>
        <ui-tabs-tab value="integrations">
          <button type="button">Integrations</button>
        </ui-tabs-tab>
      </ui-tabs-list>
      <ui-tabs-panel value="general">Choose your language, time zone and the page you start on.</ui-tabs-panel>
      <ui-tabs-panel value="security">Manage passkeys, signed-in sessions and recovery codes.</ui-tabs-panel>
      <ui-tabs-panel value="integrations">Connect your calendar and chat apps to get reminders.</ui-tabs-panel>
    </ui-tabs>
  `
}

export { mount }
```

Focus General, then press Down Arrow to choose Security. Up Arrow moves back through the vertical list.

## Disabled

Add `disabled` to a tab to prevent selection. Arrow keys can still focus it so people can discover it.

```ts title="disabled.ts"
import "@ui-sdk/web/tabs"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tabs default-value="overview">
      <ui-tabs-list aria-label="Dashboard">
        <ui-tabs-tab value="overview">
          <button type="button">Overview</button>
        </ui-tabs-tab>
        <ui-tabs-tab value="analytics">
          <button type="button">Analytics</button>
        </ui-tabs-tab>
        <ui-tabs-tab value="reports" disabled>
          <button type="button">Reports</button>
        </ui-tabs-tab>
      </ui-tabs-list>
      <ui-tabs-panel value="overview">Revenue, visitors and sign-ups for the last 30 days.</ui-tabs-panel>
      <ui-tabs-panel value="analytics">Where your visitors come from and the pages they read most.</ui-tabs-panel>
      <ui-tabs-panel value="reports">Monthly reports are available on the Pro plan.</ui-tabs-panel>
    </ui-tabs>
  `
}

export { mount }
```

Use the arrow keys to reach Reports. It can receive focus, but pressing it leaves the current panel selected.

## Icons

Put decorative icons in `ui-tabs-tab-icon` so they stay out of the tab’s accessible name. Add `mirror` to directional icons, such as Reply, to flip them in right-to-left text. An icon-only tab still needs an `aria-label`.

```ts title="icons.ts"
import "@ui-sdk/web/tabs"
import { Archive, createElement, Mail, Reply } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tabs default-value="inbox">
      <ui-tabs-list aria-label="Mail">
        <ui-tabs-tab value="inbox">
          <button type="button">
            <ui-tabs-tab-icon>${createElement(Mail, { "aria-hidden": "true" }).outerHTML}</ui-tabs-tab-icon>
            Inbox
          </button>
        </ui-tabs-tab>
        <ui-tabs-tab value="replies">
          <button type="button">
            <ui-tabs-tab-icon mirror>${createElement(Reply, { "aria-hidden": "true" }).outerHTML}</ui-tabs-tab-icon>
            Replies
          </button>
        </ui-tabs-tab>
        <ui-tabs-tab value="archive">
          <button type="button">
            <ui-tabs-tab-icon>${createElement(Archive, { "aria-hidden": "true" }).outerHTML}</ui-tabs-tab-icon>
            Archive
          </button>
        </ui-tabs-tab>
      </ui-tabs-list>
      <ui-tabs-panel value="inbox">3 new messages from Inès Moreau and Kofi Mensah.</ui-tabs-panel>
      <ui-tabs-panel value="replies">Wren Takahashi replied to your message about the launch.</ui-tabs-panel>
      <ui-tabs-panel value="archive">Messages you archived stay here and in search.</ui-tabs-panel>
    </ui-tabs>
  `
}

export { mount }
```

Choose Replies. Its directional icon mirrors when the surrounding page uses right-to-left text.

## Manual Activation

Set `activation="manual"` when opening a panel takes time, such as a view that fetches data. Arrow keys move focus; Enter or Space selects the focused tab.

```html
<ui-tabs activation="manual"></ui-tabs>
```

A panel becomes a tab stop only when it has no focusable content. A panel with a field lets Tab go straight to the field.

```ts title="manual.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import "@ui-sdk/web/tabs"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tabs default-value="preview" activation="manual">
      <ui-tabs-list aria-label="Snippet">
        <ui-tabs-tab value="preview">
          <button type="button">Preview</button>
        </ui-tabs-tab>
        <ui-tabs-tab value="code">
          <button type="button">Code</button>
        </ui-tabs-tab>
      </ui-tabs-list>
      <ui-tabs-panel value="preview">Welcome back, Hollis. You have 3 unread messages.</ui-tabs-panel>
      <ui-tabs-panel value="code">
        <ui-field>
          <ui-field-label>Source</ui-field-label>
          <ui-input>
            <input value='&lt;Welcome name="Hollis" unread={3} /&gt;' />
          </ui-input>
        </ui-field>
      </ui-tabs-panel>
    </ui-tabs>
  `
}

export { mount }
```

Focus Preview, then press Right Arrow. Code receives focus; press Enter or Space to show its panel. Tab then moves into the Source field.

## Loop

Arrow keys normally wrap around at either end. Set `loop="false"` to stop there instead.

```ts title="loop.ts"
import "@ui-sdk/web/tabs"

const ranges = [
  {
    value: "day",
    label: "Day",
    content: "128 visitors today, up 12% from yesterday.",
  },
  {
    value: "week",
    label: "Week",
    content: "1,024 visitors this week, up 8% from last week.",
  },
  {
    value: "month",
    label: "Month",
    content: "4,210 visitors this month, down 3% from last month.",
  },
  {
    value: "year",
    label: "Year",
    content: "48,930 visitors this year, up 21% from last year.",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tabs default-value="day" loop="false">
      <ui-tabs-list aria-label="Range">
        ${ranges
          .map(
            (range) => `
              <ui-tabs-tab value="${range.value}">
                <button type="button">${range.label}</button>
              </ui-tabs-tab>`
          )
          .join("")}
      </ui-tabs-list>
      ${ranges.map((range) => `<ui-tabs-panel value="${range.value}">${range.content}</ui-tabs-panel>`).join("")}
    </ui-tabs>
  `
}

export { mount }
```

Focus Year and press Right Arrow. Focus stays at the end because looping is off.

## Indicator

`ui-tabs-indicator` measures the selected tab. Position it inside a relative tab list and use its [CSS variables](#styling-tabsindicator) to make a marker that follows the selection. It measures again when a tab or the list changes size.

```css
[data-slot="tabs-list"] {
  position: relative;
}

[data-slot="tabs-indicator"] {
  position: absolute;
  top: var(--active-tab-top);
  left: var(--active-tab-left);
  width: var(--active-tab-width);
  height: var(--active-tab-height);
  transition-property: top, left, width, height;
  transition-duration: 200ms;

  &[data-activation-direction="none"] {
    transition: none;
  }
}
```

Add transitions for the properties you animate. Skip them while `data-activation-direction="none"` to avoid animating the first placement.

```ts title="indicator.ts"
import "@ui-sdk/web/tabs"

const orientations = [
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div>
      <div data-slot="controls" role="group" aria-label="Orientation">
        ${orientations
          .map(
            (option) => `
              <button type="button" data-size="sm" value="${option.value}" aria-pressed="${option.value === "horizontal"}">
                ${option.label}
              </button>`
          )
          .join("")}
      </div>
      <ui-tabs default-value="music" orientation="horizontal">
        <ui-tabs-list aria-label="Library">
          <ui-tabs-tab value="music">
            <button type="button">Music</button>
          </ui-tabs-tab>
          <ui-tabs-tab value="podcasts">
            <button type="button">Podcasts</button>
          </ui-tabs-tab>
          <ui-tabs-tab value="audiobooks">
            <button type="button">Audiobooks</button>
          </ui-tabs-tab>
          <ui-tabs-indicator></ui-tabs-indicator>
        </ui-tabs-list>
        <ui-tabs-panel value="music">312 songs in 24 albums, synced to this device.</ui-tabs-panel>
        <ui-tabs-panel value="podcasts">8 shows you follow, with 3 new episodes.</ui-tabs-panel>
        <ui-tabs-panel value="audiobooks">2 books in progress, 6 hours left in total.</ui-tabs-panel>
      </ui-tabs>
    </div>
  `
  const tabs = root.querySelector("ui-tabs")!
  const buttons = root.querySelectorAll<HTMLButtonElement>(
    '[data-slot="controls"] button'
  )
  for (const button of buttons) {
    button.addEventListener("click", () => {
      tabs.setAttribute("orientation", button.value)
      for (const other of buttons) {
        other.setAttribute("aria-pressed", String(other === button))
      }
    })
  }
}

export { mount }
```

Choose Podcasts, then choose Vertical. The same indicator measures and follows the selected tab in either layout.

## Keep Mounted

Web components keep the supplied markup when a panel closes. Add `keep-mounted` to keep the hidden panel’s role and its `aria-controls` relationship too.

```ts title="keep-mounted.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/textarea"
import "@ui-sdk/web/tabs"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tabs default-value="reply">
      <ui-tabs-list aria-label="Comment">
        <ui-tabs-tab value="reply">
          <button type="button">Reply</button>
        </ui-tabs-tab>
        <ui-tabs-tab value="formatting">
          <button type="button">Formatting</button>
        </ui-tabs-tab>
        <ui-tabs-indicator></ui-tabs-indicator>
      </ui-tabs-list>
      <ui-tabs-panel value="reply" keep-mounted>
        <ui-field>
          <ui-field-label>Message</ui-field-label>
          <ui-textarea>
            <textarea rows="3" placeholder="Write a reply…"></textarea>
          </ui-textarea>
        </ui-field>
      </ui-tabs-panel>
      <ui-tabs-panel value="formatting">
        <p>Use **bold**, _italics_ and \`code\` to format your reply.</p>
        <p>Paste a link on its own line to show a preview.</p>
      </ui-tabs-panel>
    </ui-tabs>
  `
}

export { mount }
```

Write a message, switch to Formatting, then return to Reply. Your draft is still there.

## Find in Page

Add `hidden-until-found` to the tabs or a panel to keep closed content available to the browser’s Find command. A match selects its tab with the reason `find-in-page`. This also keeps the panel mounted.

Write `hidden="until-found"` on the initially hidden panels too if they should be findable before the elements are defined.

```ts title="find-in-page.ts"
import "@ui-sdk/web/tabs"

const policies = [
  {
    value: "shipping",
    label: "Shipping",
    text: "Orders leave our warehouse within two working days. Express delivery arrives the next morning.",
  },
  {
    value: "returns",
    label: "Returns",
    text: "Send anything back within 30 days. Opened electronics carry a restocking fee of 10 percent.",
  },
  {
    value: "warranty",
    label: "Warranty",
    text: "Every product has a two-year warranty. Batteries are covered for one year from delivery.",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tabs default-value="shipping" hidden-until-found>
      <ui-tabs-list aria-label="Policies">
        ${policies
          .map(
            (policy) => `
              <ui-tabs-tab value="${policy.value}">
                <button type="button">${policy.label}</button>
              </ui-tabs-tab>`
          )
          .join("")}
      </ui-tabs-list>
      ${policies
        .map(
          (policy, index) =>
            `<ui-tabs-panel value="${policy.value}"${index > 0 ? ' hidden="until-found"' : ""}>${policy.text}</ui-tabs-panel>`
        )
        .join("")}
    </ui-tabs>
  `
}

export { mount }
```

Use your browser’s Find command to search for “restocking fee”. Returns opens to reveal the match.

## Animation

Panels expose `data-starting-style` as they enter and `data-ending-style` as they leave. The previous panel stays mounted through its exit animation, then unmounts or hides if it is kept mounted.

Use `data-activation-direction` to choose a slide direction. Put the panels in the same grid cell so they overlap during the transition, as this example does.

```ts title="animation.ts"
import "@ui-sdk/web/tabs"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tabs default-value="overview">
      <ui-tabs-list aria-label="Project">
        <ui-tabs-tab value="overview">
          <button type="button">Overview</button>
        </ui-tabs-tab>
        <ui-tabs-tab value="activity">
          <button type="button">Activity</button>
        </ui-tabs-tab>
        <ui-tabs-tab value="settings">
          <button type="button">Settings</button>
        </ui-tabs-tab>
        <ui-tabs-indicator></ui-tabs-indicator>
      </ui-tabs-list>
      <div data-slot="stack">
        <ui-tabs-panel value="overview">The launch is on track for Friday, with 4 of 6 tasks done.</ui-tabs-panel>
        <ui-tabs-panel value="activity">Inès Moreau deployed to production and Kofi Mensah left a review.</ui-tabs-panel>
        <ui-tabs-panel value="settings">Rename the project, transfer it to another team or archive it.</ui-tabs-panel>
      </div>
    </ui-tabs>
  `
}

export { mount }
```

Move between Overview, Activity and Settings. The panels slide in the direction you moved.

## Controlled

Read and set the element’s `value` property, or call its `api.select(value)` method. Either one selects a tab and fires `valuechange`, like choosing a tab does. [State and Events](../state-and-events.md) covers the shared pattern. Call `event.preventDefault()` on `valuechange` to reject a change.

`valuechange` receives the new value and a [reason](#reasons), such as `item-press`, `list-navigation`, or `imperative`, in `event.detail`. It does not fire for the initial selection. The element’s [`api`](#controller) lets another control select a tab too.

```ts title="controlled.ts"
import "@ui-sdk/web/tabs"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div>
      <div data-slot="controls">
        <button type="button">Show Sent Mail</button>
      </div>
      <ui-tabs default-value="inbox">
        <ui-tabs-list aria-label="Mail">
          <ui-tabs-tab value="inbox">
            <button type="button">Inbox</button>
          </ui-tabs-tab>
          <ui-tabs-tab value="drafts">
            <button type="button">Drafts</button>
          </ui-tabs-tab>
          <ui-tabs-tab value="sent">
            <button type="button">Sent</button>
          </ui-tabs-tab>
          <ui-tabs-indicator></ui-tabs-indicator>
        </ui-tabs-list>
        <ui-tabs-panel value="inbox">3 unread messages from Hollis Grant and Inès Moreau.</ui-tabs-panel>
        <ui-tabs-panel value="drafts">2 drafts, the last one edited yesterday at 4:12 PM.</ui-tabs-panel>
        <ui-tabs-panel value="sent">12 messages sent this week, all delivered.</ui-tabs-panel>
      </ui-tabs>
    </div>
  `
  const tabs = root.querySelector("ui-tabs")!
  tabs.addEventListener("valuechange", (event) => {
    const { value, reason } = event.detail
    log(root, `value: ${value} (${reason})`)
  })
  root
    .querySelector('[data-slot="controls"] button')!
    .addEventListener("click", () => tabs.api.select("sent"))
}

export { mount }
```

Choose Drafts, then press Show Sent Mail. The console logs each new value with its reason.

## Links

Render a tab as a link when selection should navigate. It keeps its tab role; arrow keys follow the link when they select it. Modified clicks, such as Cmd-click, keep their normal browser behavior without selecting the tab.

```html
<ui-tabs-tab value="activity">
  <a href="#activity">Activity</a>
</ui-tabs-tab>
```

```ts title="links.ts"
import "@ui-sdk/web/tabs"

const pages = [
  {
    value: "overview",
    href: "#project-overview",
    label: "Overview",
    content:
      "Hollis Grant started this project in March. It has 14 open issues.",
  },
  {
    value: "activity",
    href: "#project-activity",
    label: "Activity",
    content:
      "Wren Takahashi merged 3 pull requests and closed 5 issues this week.",
  },
  {
    value: "members",
    href: "#project-members",
    label: "Members",
    content:
      "Hollis Grant owns the project. Wren Takahashi and 3 others can edit it.",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tabs default-value="overview">
      <ui-tabs-list aria-label="Project">
        ${pages
          .map(
            (page) => `
              <ui-tabs-tab value="${page.value}">
                <a href="${page.href}">${page.label}</a>
              </ui-tabs-tab>`
          )
          .join("")}
        <ui-tabs-indicator></ui-tabs-indicator>
      </ui-tabs-list>
      ${pages.map((page) => `<ui-tabs-panel value="${page.value}">${page.content}</ui-tabs-panel>`).join("")}
    </ui-tabs>
  `
}

export { mount }
```

Choose Activity. Its panel opens and the URL hash changes. Modified clicks keep the link’s usual browser behavior.

## Query String

Use the URL as the source of the selected value, and validate it against your tab values. Read the parameter on the server when possible, then write it as the `value` attribute. Write changes through your router so browser navigation and the rendered page stay in sync. For a plain client page, keep the rest of the URL when updating it:

```ts
function saveSelectedTab(value: string | null) {
  const url = new URL(location.href)
  if (value === null) {
    url.searchParams.delete("tab")
  } else {
    url.searchParams.set("tab", value)
  }
  history.replaceState(null, "", url)
}
```

Call this from `valuechange` after accepting the value. Read it again on `popstate` if your page uses browser history directly; remove that listener when the view unmounts.

## URL Hash

A hash such as `#activity` works on a client-rendered page. Read it after mount and on `hashchange`, then select the matching tab. Setting `location.hash` adds a history entry. The server cannot read the hash, so give the page an initial tab while it loads.

## Route Tabs

When each tab is a route, render [links](#links) and set the element’s `value` from the current path. Let navigation update the value. You do not also need a change handler that navigates to the same route. If the server renders the markup, set the initial `value` and hide the other panels there too.

## Scroll into View

If the list scrolls, selecting a tab through the `api`, the `value` or the URL scrolls it into view inside that list. Pointer and arrow-key selection focus the tab, so the browser reveals it as part of focusing it.

## Custom Rendering

Put a native button or link inside `ui-tabs-tab`, as in the [links](#links) example; it receives the tab behavior, and anything else inside it is yours. [Parts and Composition](../parts-and-composition.md) covers the shared rendering API. Each part’s state is listed under [State](#state).

```ts title="render.ts"
import "@ui-sdk/web/tabs"

const folders = [
  {
    value: "inbox",
    label: "Inbox",
    count: 12,
    content: "12 conversations, 3 of them unread.",
  },
  {
    value: "unread",
    label: "Unread",
    count: 3,
    content: "Hollis Grant, Inès Moreau and Kofi Mensah wrote to you.",
  },
  {
    value: "archived",
    label: "Archived",
    count: 0,
    content: "Nothing archived yet. Archived mail stays searchable.",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-tabs default-value="inbox">
      <ui-tabs-list aria-label="Mail">
        ${folders
          .map(
            (folder) => `
              <ui-tabs-tab value="${folder.value}">
                <button type="button">
                  ${folder.label}
                  ${folder.count > 0 ? `<span data-slot="badge">${folder.count}</span>` : ""}
                </button>
              </ui-tabs-tab>`
          )
          .join("")}
      </ui-tabs-list>
      ${folders.map((folder) => `<ui-tabs-panel value="${folder.value}">${folder.content}</ui-tabs-panel>`).join("")}
    </ui-tabs>
  `
}

export { mount }
```

Each tab renders its own button with an unread count after the label. Choose Unread to see who wrote to you.

## Styling

Parts are unstyled. Use `data-selected` and `data-disabled` to style a tab, and `data-selected` on a panel that shows. `data-orientation` on every part lets one stylesheet lay out horizontal and vertical tabs. Icon parts also set `data-has-icon` on the tab and `data-has-icons` on the list, which can help align mixed text and icon tabs.

The indicator’s position and size are measured from the tab list into the variables below. Use them for an underline, a background, or a marker beside a vertical list.

Each part has a `data-slot`, such as `tabs-tab`, and its state attributes are listed under [Data Attributes](#data-attributes). A tab's attributes land on its button.

### `<ui-tabs-indicator>`
- `--active-tab-left`: Distance from the tab list's left edge to the selected tab.
- `--active-tab-right`: Distance from the tab list's right edge to the selected tab.
- `--active-tab-top`: Distance from the tab list's top edge to the selected tab.
- `--active-tab-bottom`: Distance from the tab list's bottom edge to the selected tab.
- `--active-tab-width`: Width of the selected tab.
- `--active-tab-height`: Height of the selected tab.

## Data Attributes

### `<ui-tabs>`
`[data-slot="tabs"]`

- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between tabs.
- `data-activation-direction` (`none`, `left`, `right`, `up`, `down`): Which way the last selection moved on screen. Use it to slide panels in from the right side.

### `<ui-tabs-list>`
`[data-slot="tabs-list"]`

- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between tabs.
- `data-activation-direction` (`none`, `left`, `right`, `up`, `down`): Which way the last selection moved on screen. Use it to slide panels in from the right side.
- `data-has-icons`: Present while any tab inside holds an icon part, so items without one can line up.

### `<ui-tabs-tab>`
`[data-slot="tabs-tab"]`

- `data-selected`: Present on the selected tab and its panel.
- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between tabs.
- `data-activation-direction` (`none`, `left`, `right`, `up`, `down`): Which way the last selection moved on screen. Use it to slide panels in from the right side.
- `data-disabled`: Present when the tab can't be selected.
- `data-has-icon`: Present on a tab while it holds an icon part.

### `<ui-tabs-tab-icon>`
`[data-slot="tabs-tab-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

### `<ui-tabs-indicator>`
`[data-slot="tabs-indicator"]`

- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between tabs.
- `data-activation-direction` (`none`, `left`, `right`, `up`, `down`): Which way the last selection moved on screen. Use it to slide panels in from the right side.

### `<ui-tabs-panel>`
`[data-slot="tabs-panel"]`

- `data-selected`: Present on the selected tab and its panel.
- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between tabs.
- `data-activation-direction` (`none`, `left`, `right`, `up`, `down`): Which way the last selection moved on screen. Use it to slide panels in from the right side.
- `data-starting-style`: Present for a panel's first frame. Style the state you animate from.
- `data-ending-style`: Present while the previous panel animates out. Style the state you animate to.

## API Reference

Props are attributes in kebab case, like `default-value`, `keep-mounted` and `hidden-until-found`: `"false"` is false. Callbacks are DOM events.

### Tabs

- `value?` (`T | null`): The selected tab's value. Pass it to control the tabs. `null` selects nothing.
- `defaultValue?` (`T | null`): The tab selected at first, when uncontrolled. Defaults to the first enabled tab, which never calls `valuechange`.
- `valuechange event`: Runs when the selection wants to change. `details.reason` says why, and `details.cancel()` stops it.
- `orientation?` (`TabsOrientation`): Which arrow keys move between tabs: left and right, or up and down.
- `activation?` (`"automatic" | "manual"`): `"automatic"` selects a tab as soon as arrow keys focus it. `"manual"` waits for Enter or Space.
- `loop?` (`boolean`): Whether arrow keys wrap from the last tab to the first.
- `hiddenUntilFound?` (`boolean`): Keeps hidden panels in the page as `hidden="until-found"`, so the browser's find in page can match their text and select their tab. Implies `keepMounted`.
- `controller?` (`{ getValue: () => T | null; setValue: (value: T | null, options?: TabsChangeOptions) => boolean; select: (value: T, options?: TabsChangeOptions) => boolean; focus: () => void; }`): Selects tabs from anywhere. Create one with `createTabsController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### TabsList

The list takes no options of its own, only the attributes you give it.

### TabsTab

- `value` (`string`): Identifies the tab and pairs it with the panel of the same value.
- `disabled?` (`boolean`): Keeps the tab focusable but stops it from being selected, as the tabs pattern asks.

### TabsTabIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

### TabsIndicator

The indicator takes no props of its own. Its [CSS variables](#styling-tabsindicator) hold the selected tab's box.

### TabsPanel

- `value` (`string`): The value of the tab this panel belongs to.
- `keepMounted?` (`boolean`): Whether the panel stays in the page, hidden, while its tab isn't selected.
- `hiddenUntilFound?` (`boolean`): Whether the panel stays findable with `hidden="until-found"` while its tab isn't selected. Overrides the tabs'.

### State

The same state shows as data attributes on each element.

`ui-tabs`:

- `value` (`T | null`): The selected tab's value.
- `orientation` (`TabsOrientation`): The tabs' `orientation` option, or `"horizontal"` when it's unset or invalid.
- `direction` (`Direction`): Which way the last selection moved.

`ui-tabs-list`:

- `orientation` (`TabsOrientation`): The tabs' `orientation` option, or `"horizontal"` when it's unset or invalid.

`ui-tabs-tab`:

- `selected` (`boolean`): Whether this tab's value is the tabs' `value`.
- `disabled` (`boolean`): Whether this tab can't be selected.

`ui-tabs-tab-icon`:

- `mirror` (`boolean`): Whether it flips in right-to-left text.

`ui-tabs-panel`:

- `selected` (`boolean`): Whether this panel's tab is selected. False while it animates out.

`ui-tabs-indicator`:

- `orientation` (`TabsOrientation`): The tabs' `orientation` option, or `"horizontal"` when it's unset or invalid.
- `direction` (`Direction`): Which way the last selection moved.

### Reasons

`event.detail.reason` says why the selection changed.

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `find-in-page` (`Event`): The browser's find in page matched hidden content.
- `item-removed` (`none`): The selected item left the page, and another was picked.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods. The `value` property reads and sets the selection.

Every write method takes an optional `{ reason, event }`, fires `valuechange` like a press, and returns `false` when the change is canceled.

- `getValue()` (`() => T | null`): The selected tab's value, or null when nothing is selected.
- `setValue(value, options?)` (`(value: T | null, options?: TabsChangeOptions | undefined) => boolean`): Selects a tab, or nothing with `null`. Disabled tabs never select. Returns false when canceled.
- `select(value, options?)` (`(value: T, options?: TabsChangeOptions | undefined) => boolean`): Selects a tab, the same as `setValue`.
- `focus()` (`() => void`): Moves focus to the selected tab, or the tab that holds the tab stop.

### Events

Events fire on their own element and don't bubble, with the new value in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` on `valuechange` keeps the current tab. `valuechange` never fires on connect.

| Member                      | On        | Description                                    |
| --------------------------- | --------- | ---------------------------------------------- |
| `value` property, attribute | `ui-tabs` | The selected tab. Setting either selects a tab |
| `api` property              | `ui-tabs` | The [controller](#controller)                  |
| `valuechange` event         | `ui-tabs` | `detail: { value, reason, event, source }`     |

## Accessibility

Tabs follow the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). The list is a `tablist`, each tab's button controls its panel, and each panel is labelled by its tab.

### Keyboard

Tab enters the list at the selected tab and leaves it on the next Tab. Left and Right Arrow move between tabs and select them, or only move focus with `activation="manual"`, where Enter or Space selects. Up and Down Arrow do the same in a vertical list. Home and End move to the first and last tabs. The list reads `dir="rtl"` from the page or any ancestor, and Left and Right follow the reading direction, with no provider.

### Tested Behavior

Every line below is an automated test.

**Selection**

- The default tab is selected and shows its panel.
- Clicking a tab selects it and shows its panel.
- Clicking a disabled tab does nothing.
- Clicking the selected tab keeps it selected.
- A change can be cancelled.
- Without a default value, the first enabled tab is selected.
- Without a default value, the first render already selects the first enabled tab.

**Keyboard navigation**

- Tab moves focus to the selected tab.
- ArrowRight and ArrowLeft move focus and select the tab.
- Disabled tabs are focusable but never selected.
- Focus wraps at both ends.
- Home and End move to the first and last tabs.
- ArrowUp and ArrowDown do nothing in a horizontal tab list.
- Arrow keys with a modifier are left to the browser.
- Keys pressed in quick succession are never lost.
- Tab moves focus from the tab list into the selected panel.
- Shift+Tab from the panel returns to the selected tab.

**Manual activation**

- Arrow keys move focus without selecting.
- Enter selects the focused tab.
- Space selects the focused tab.
- Enter on a disabled tab does nothing.

**Vertical**

- The tab list reports its orientation.
- ArrowDown and ArrowUp move between tabs.
- ArrowLeft and ArrowRight do nothing in a vertical tab list.

**Panels**

- The selected tab controls its panel, and the panel is labelled by its tab.
- With keepMounted, hidden panels stay in the page.
- With keepMounted, a class that sets display doesn't show hidden panels.

Runs in React, Vue and web components.

Beyond the pattern's baseline:

**Enhancements**

- In manual mode, re-entering the tab list focuses the selected tab.
- A panel that holds a field is not a tab stop of its own.
- A controller selects a tab from anywhere.
- An infinite exit animation still unmounts the panel.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while using the tabs with a keyboard.

Runs in React, Vue and web components.
