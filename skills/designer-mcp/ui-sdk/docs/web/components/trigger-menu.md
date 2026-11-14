# Trigger Menu

"Opens suggestions at the caret when you type a trigger such as @, /, or #."

A trigger menu suggests what to insert when someone types a trigger character, like `@` for people or `/` for commands. It opens at the caret, narrows as they type, and inserts the choice into the text.

```ts title="demo.ts"
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-trigger-menu>
      <ui-field>
        <ui-field-label>Message</ui-field-label>
        <ui-trigger-menu-input>
          <textarea placeholder="Type @ to mention someone…"></textarea>
        </ui-trigger-menu-input>
      </ui-field>
      <div data-slot="visually-hidden">
        <ui-trigger-menu-status></ui-trigger-menu-status>
      </div>
      <ui-trigger-menu-content>
        <ui-trigger-menu-empty>No one found</ui-trigger-menu-empty>
        <ui-trigger-menu-list></ui-trigger-menu-list>
      </ui-trigger-menu-content>
    </ui-trigger-menu>
  `
  root.querySelector("ui-trigger-menu")!.triggers = [
    { char: "@", type: "mention", items: people },
  ]
}

export { mount }
```

Type @, narrow the list with a name, and press Enter to insert the highlighted person.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. Import the field too if you use it. On the server the import does nothing.

```ts
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"
```

## Composition

Use the following composition to build a `ui-trigger-menu`:

```text
ui-trigger-menu
├── ui-trigger-menu-input
│   └── textarea
├── ui-trigger-menu-status
└── ui-trigger-menu-content
    ├── ui-trigger-menu-empty
    └── ui-trigger-menu-list
        ├── ui-trigger-menu-item
        └── ui-trigger-menu-item
```

`ui-trigger-menu` holds the triggers and what each one lists, set as its `triggers` property. `ui-trigger-menu-input` wraps the `<textarea>` or `<input>` people type in, and `ui-trigger-menu-content` is the popup with the suggestions. Without a `ui-trigger-menu-content` among its direct children, the menu renders the current trigger's items for you, and so does a list without items of its own. Inside a [Token Input](./token-input.md), leave out `ui-trigger-menu-input`: the menu suggests into the token input.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/trigger-menu"

  document.querySelector("ui-trigger-menu").triggers = [{ char: "@" }]
</script>

<ui-trigger-menu>
  <ui-trigger-menu-input>
    <textarea
      aria-label="Message"
      placeholder="Type @ to mention someone…"
    ></textarea>
  </ui-trigger-menu-input>
  <ui-trigger-menu-content>
    <ui-trigger-menu-list>
      <ui-trigger-menu-item value="hollis" label="Hollis Grant"
        >Hollis Grant</ui-trigger-menu-item
      >
      <ui-trigger-menu-item value="ines" label="Inès Moreau"
        >Inès Moreau</ui-trigger-menu-item
      >
    </ui-trigger-menu-list>
  </ui-trigger-menu-content>
</ui-trigger-menu>
```

`label` is the text an item is matched by and inserts. Choosing Hollis Grant replaces `@` and what was typed after it with `@Hollis Grant `.

## Trigger Menu or Token Input

Trigger Menu suggests what to insert: it matches the trigger, filters, moves the highlight, loads items and asks for a command's arguments. [Token Input](./token-input.md) holds a value that mixes text and tokens.

Use Trigger Menu with a textarea or an input to insert text. Put it inside a Token Input to insert tokens instead. Another editor connects through an [adapter](#any-editor).

## Triggers as Data

Give each trigger a `char` and its `items`. Items can be strings, objects, groups or a loader, and they render themselves when you leave out `ui-trigger-menu-content`. The same field can offer people after `@`, commands after `/` and channels after `#`.

```ts title="data.ts"
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"
import type { TriggerDefinition } from "@ui-sdk/web/trigger-menu"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

const commands = ["away", "remind", "search", "status"]

const channels = [
  "announcements",
  "design",
  "design-reviews",
  "engineering",
  "general",
  "launches",
  "support",
]

function searchChannels(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<string[]>((resolve, reject) => {
    const timer = setTimeout(
      () =>
        resolve(
          channels.filter((channel) => channel.includes(query.toLowerCase()))
        ),
      400
    )
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

const triggers: TriggerDefinition<string>[] = [
  { char: "@", items: people },
  { char: "/", boundary: "start", items: commands },
  { char: "#", items: searchChannels },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-trigger-menu>
      <ui-field>
        <ui-field-label>Message</ui-field-label>
        <ui-trigger-menu-input>
          <textarea placeholder="Type @, / or #…"></textarea>
        </ui-trigger-menu-input>
      </ui-field>
    </ui-trigger-menu>
  `
  root.querySelector("ui-trigger-menu")!.triggers = triggers
}

export { mount }
```

Type @ for people, / at the start for commands, or # to load channels.

## Commands with Arguments

A trigger with `boundary: "start"` matches only at the start of the text, so a leading space escapes it. An item with `arguments` asks for each one in order: `ui-trigger-menu-hint` shows what's left at the caret, Tab accepts the highlighted suggestion and moves to the next argument, Enter finishes once only optional arguments remain, and Backspace past an argument's start goes back. An argument without `items` is free text. `after: "submit"` sends the form once the item is inserted.

```ts title="commands.ts"
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"
import { log } from "./log"

const commands = [
  {
    value: "status",
    label: "status",
    arguments: [
      {
        name: "status",
        hint: "<status>",
        required: true,
        items: ["available", "busy", "away"],
      },
      {
        name: "until",
        hint: "[until]",
        items: ["30m", "1h", "4h", "today"],
        allowCustomValue: false,
      },
    ],
  },
  {
    value: "search",
    label: "search",
    arguments: [{ name: "query", hint: "<query>", required: true }],
  },
  { value: "away", label: "away", after: "submit" as const },
  { value: "clear", label: "clear" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form data-slot="stack">
      <ui-trigger-menu>
        <ui-field name="message">
          <ui-field-label>Message</ui-field-label>
          <ui-trigger-menu-input>
            <textarea placeholder="Type / for commands…"></textarea>
          </ui-trigger-menu-input>
        </ui-field>
        <ui-trigger-menu-hint></ui-trigger-menu-hint>
      </ui-trigger-menu>
    </form>
  `
  const form = root.querySelector("form")!
  const menu = root.querySelector("ui-trigger-menu")!
  menu.triggers = [
    { char: "/", boundary: "start", type: "command", items: commands },
  ]
  menu.addEventListener("itemselect", (event) => {
    log(
      root,
      [
        "Chose",
        `/${event.detail.value}`,
        ...Object.values(event.detail.arguments),
      ].join(" ")
    )
  })
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    log(root, `Sent ${new FormData(form).get("message")}`)
  })
}

export { mount }
```

Type /status, then press Tab to choose a status and an optional time, and Enter to finish. Choose /away to send it at once. The console logs each command.

## Icons

Put an item's icon in a `ui-trigger-menu-item-icon`, before its text. Screen readers skip it, and filtering and the text a choice inserts ignore it, so an SVG's `<title>`, an icon font's glyph or an emoji never joins the item's name or the field. Items as data have no icon, so compose the items that show one.

- **Icons that point a way**, like arrows and reply, flip in right-to-left text with `mirror`.
- **Items with only an icon** need an `aria-label`, which filtering matches too. In development, one with no name warns.
- **Lining up items.** Items with an icon get `data-has-icon`, and the list gets `data-has-icons` while any item has one, so items without an icon can keep its space with padding.

```ts title="icons.ts"
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"
import { Clock, createElement, Reply, Search, Share, Trash } from "lucide"

const commands = [
  { value: "reply", icon: Reply, mirror: true },
  { value: "remind", icon: Clock },
  { value: "search", icon: Search },
  { value: "share", icon: Share },
  { value: "clear", icon: Trash },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-trigger-menu>
      <ui-field>
        <ui-field-label>Message</ui-field-label>
        <ui-trigger-menu-input>
          <textarea placeholder="Type / for commands…"></textarea>
        </ui-trigger-menu-input>
      </ui-field>
      <ui-trigger-menu-content>
        <ui-trigger-menu-list>
          ${commands
            .map(
              (command) => `
                <ui-trigger-menu-item value="${command.value}">
                  <ui-trigger-menu-item-icon${command.mirror ? " mirror" : ""}>
                    ${createElement(command.icon, { "aria-hidden": "true" }).outerHTML}
                  </ui-trigger-menu-item-icon>
                  ${command.value}
                </ui-trigger-menu-item>`
            )
            .join("")}
        </ui-trigger-menu-list>
      </ui-trigger-menu-content>
    </ui-trigger-menu>
  `
  root.querySelector("ui-trigger-menu")!.triggers = [
    { char: "/", boundary: "start", type: "command" },
  ]
}

export { mount }
```

Type / to open the commands, then type re to narrow them. Each icon sits before its name, and filtering ignores it.

## Loading Items

A trigger's `items` can be a loader, called with the query and an `AbortSignal` once typing pauses. A newer query aborts the older load, so only its results land, and the last results stay while the next ones load. `ui-trigger-menu-empty` waits until loading ends and gets `data-loading` meanwhile, and while a load runs, `aria-busy` marks the list, so you can fade the results that are about to change. This example writes its status itself, from `openchange`, `querychange` and the loader's results.

```ts title="async.ts"
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"

const channels = [
  "announcements",
  "design",
  "design-reviews",
  "engineering",
  "general",
  "launches",
  "support",
]

function searchChannels(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
    const timer = setTimeout(
      () =>
        resolve(
          channels
            .filter((channel) => channel.includes(query.toLowerCase()))
            .map((channel) => ({ value: channel, label: channel }))
        ),
      600
    )
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-trigger-menu>
      <ui-field>
        <ui-field-label>Message</ui-field-label>
        <ui-trigger-menu-input>
          <textarea placeholder="Type # to link a channel…"></textarea>
        </ui-trigger-menu-input>
      </ui-field>
      <ui-trigger-menu-content>
        <ui-trigger-menu-status>Loading channels…</ui-trigger-menu-status>
        <ui-trigger-menu-empty>No channels match “<span></span>”</ui-trigger-menu-empty>
        <ui-trigger-menu-list></ui-trigger-menu-list>
      </ui-trigger-menu-content>
    </ui-trigger-menu>
  `
  const menu = root.querySelector("ui-trigger-menu")!
  const status = root.querySelector("ui-trigger-menu-status")!
  const query = root.querySelector("ui-trigger-menu-empty span")!
  const loading = () => {
    status.textContent = "Loading channels…"
  }
  menu.triggers = [
    {
      char: "#",
      type: "channel",
      items: async (text, context) => {
        const items = await searchChannels(text, context)
        status.textContent = items.length
          ? `${items.length} ${items.length === 1 ? "channel" : "channels"}`
          : ""
        return items
      },
    },
  ]
  menu.addEventListener("openchange", (event) => {
    if (event.detail.value) {
      loading()
    }
  })
  menu.addEventListener("querychange", (event) => {
    query.textContent = event.detail.value
    loading()
  })
}

export { mount }
```

Type # and a channel name. The list says it's loading, and older results fade while newer ones load.

## Custom Items

Compose `ui-trigger-menu-item`s with any content, in groups. `label` is what's matched and inserted, `keywords` adds words to match, and `disabled` keeps an item in the list without letting it be chosen. A trigger's `spaces`, `pattern` and `maxLength` decide what its query may hold, `filter` how it narrows the items, and `insert` what replaces the trigger and query. The menu's `itemselect` event names the chosen item first and can insert something else with `event.detail.insert()`.

```ts title="custom-items.ts"
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"
import { createElement, Users } from "lucide"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik", disabled: true },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-trigger-menu>
      <ui-field>
        <ui-field-label>Message</ui-field-label>
        <ui-trigger-menu-input>
          <textarea placeholder="Type @ and a first name…"></textarea>
        </ui-trigger-menu-input>
      </ui-field>
      <ui-trigger-menu-content>
        <ui-trigger-menu-list>
          <ui-trigger-menu-group>
            <ui-trigger-menu-group-label>People</ui-trigger-menu-group-label>
            ${people
              .map(
                (person) => `
                  <ui-trigger-menu-item value="${person.value}" label="${person.label}"${person.disabled ? " disabled" : ""}>
                    ${person.label}
                    <span data-slot="hint">${person.disabled ? "Deactivated" : `@${person.value}`}</span>
                  </ui-trigger-menu-item>`
              )
              .join("")}
          </ui-trigger-menu-group>
          <ui-trigger-menu-separator></ui-trigger-menu-separator>
          <ui-trigger-menu-item value="here" label="here" keywords="everyone,channel">
            <ui-trigger-menu-item-icon>
              ${createElement(Users, { "aria-hidden": "true" }).outerHTML}
            </ui-trigger-menu-item-icon>
            Notify everyone here
          </ui-trigger-menu-item>
        </ui-trigger-menu-list>
      </ui-trigger-menu-content>
    </ui-trigger-menu>
  `
  const menu = root.querySelector("ui-trigger-menu")!
  menu.triggers = [
    {
      char: "@",
      spaces: 2,
      maxLength: 30,
      pattern: /[\p{L}.'-]/u,
      filter: "startsWith",
      insert: (item) => `@${item.label.split(" ")[0]} `,
    },
  ]
  menu.addEventListener("itemselect", (event) => {
    if (event.detail.value === "here") {
      event.detail.insert("@here ")
    }
  })
}

export { mount }
```

Type @ and the start of a first name to insert it, or choose Notify everyone here to insert @here. Deactivated people can't be chosen.

## Input

Put an `<input>` in the input part for a single line. It's a combobox with `aria-expanded`. In a single line, Enter often submits a form, so this example sets `auto-highlight="false"`: Enter chooses only once an arrow key has highlighted a person, and `loop="false"` stops the arrows at either end of the list.

```ts title="input.ts"
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-trigger-menu auto-highlight="false" loop="false">
      <ui-field>
        <ui-field-label>Task</ui-field-label>
        <ui-trigger-menu-input>
          <input placeholder="Type @ to assign someone…" />
        </ui-trigger-menu-input>
      </ui-field>
      <ui-trigger-menu-content>
        <ui-trigger-menu-list></ui-trigger-menu-list>
      </ui-trigger-menu-content>
    </ui-trigger-menu>
  `
  root.querySelector("ui-trigger-menu")!.triggers = [
    { char: "@", items: people },
  ]
}

export { mount }
```

Type @ in the empty task. Nothing is highlighted until you press ArrowDown, then Enter assigns the person.

## Positioning

By default, the list opens below the trigger at the caret and flips to stay on screen. `side`, `align` and the offsets place it, and `anchor` positions it against another element, named by a CSS selector. This example opens the list above the whole field and lines its items up with the label.

```ts title="positioning.ts"
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function mount(root: HTMLElement) {
  const id = `comment-${crypto.randomUUID()}`
  root.innerHTML = `
    <ui-trigger-menu>
      <ui-field id="${id}">
        <ui-field-label>Comment</ui-field-label>
        <ui-trigger-menu-input>
          <textarea placeholder="Type @ to mention someone…"></textarea>
        </ui-trigger-menu-input>
      </ui-field>
      <ui-trigger-menu-content
        side="top"
        align="start"
        side-offset="8"
        align-offset="-5"
        collision-padding="16"
        anchor="#${id}"
        container="#${id}"
        keep-mounted
      >
        <ui-trigger-menu-list></ui-trigger-menu-list>
      </ui-trigger-menu-content>
    </ui-trigger-menu>
  `
  root.querySelector("ui-trigger-menu")!.triggers = [
    { char: "@", items: people },
  ]
}

export { mount }
```

Type @ in the comment. The list opens above the field, lined up with its label.

## Controlled

Set the `open` property and listen for `openchange` to own the popup state. The detail says why it changed. `querychange` reports the text after the trigger and the argument being typed, and `openchangecomplete` fires once the menu has finished opening or closing. Escape dismisses a match, and `shortcut` reopens it, Control+Space by default.

```ts title="controlled.ts"
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"
import { log } from "./log"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

const commands = [
  {
    value: "status",
    label: "status",
    arguments: [
      {
        name: "status",
        hint: "<status>",
        required: true,
        items: ["available", "busy", "away"],
      },
    ],
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-trigger-menu shortcut="ctrl+j">
      <ui-field>
        <ui-field-label>Message</ui-field-label>
        <ui-trigger-menu-input>
          <textarea placeholder="Type @ or /…"></textarea>
        </ui-trigger-menu-input>
      </ui-field>
    </ui-trigger-menu>
  `
  const menu = root.querySelector("ui-trigger-menu")!
  menu.triggers = [
    { char: "@", items: people },
    { char: "/", boundary: "start", items: commands },
  ]
  menu.addEventListener("openchange", (event) => {
    const { value, reason } = event.detail
    log(root, `${value ? "Opening" : "Closing"} (${reason})`)
  })
  menu.addEventListener("openchangecomplete", (event) =>
    log(root, event.detail.value ? "Open" : "Closed")
  )
  menu.addEventListener("querychange", (event) => {
    const { value, argument } = event.detail
    log(root, `Query “${value}”${argument ? ` for ${argument}` : ""}`)
  })
}

export { mount }
```

Type @ and a name, press Escape, then Control+J to reopen the list. The console logs each callback with its reason.

## Controller

Use the element's `api` to open suggestions, insert text at the caret, or read the current match. `open()` types the trigger at the caret and returns a Promise that resolves when the menu closes.

```ts title="controller.ts"
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"
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
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button">Mention</button>
        <button type="button">Insert Date</button>
      </div>
      <ui-trigger-menu>
        <ui-field>
          <ui-field-label>Message</ui-field-label>
          <ui-trigger-menu-input>
            <textarea placeholder="Write a message…"></textarea>
          </ui-trigger-menu-input>
        </ui-field>
        <ui-trigger-menu-content>
          <ui-trigger-menu-list></ui-trigger-menu-list>
        </ui-trigger-menu-content>
      </ui-trigger-menu>
    </div>
  `
  const element = root.querySelector("ui-trigger-menu")!
  const menu = element.api
  element.triggers = [{ char: "@", items: people }]
  const [mention, date] = root.querySelectorAll("button")
  root
    .querySelector("[data-slot=controls]")!
    .addEventListener("mousedown", (event) => event.preventDefault())
  mention.addEventListener("click", async () => {
    const closed = await menu.open({ trigger: "@" })
    log(root, `Closed (${closed.reason})`)
  })
  date.addEventListener("click", () =>
    menu.insert(
      new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })
    )
  )
}

export { mount }
```

Press Mention and choose a person. The console logs why the list closed. Insert Date adds today's date at the caret.

## Any Editor

Set the `editor` property to connect the menu to a field you render yourself, or to another editor. `textFieldAdapter()` makes one for a textarea or an input.

```ts title="editor.ts"
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"
import { textFieldAdapter } from "@ui-sdk/web/trigger-menu"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-trigger-menu>
      <ui-field>
        <ui-field-label>Notes</ui-field-label>
        <textarea placeholder="Type @ to mention someone…"></textarea>
      </ui-field>
      <ui-trigger-menu-content>
        <ui-trigger-menu-list></ui-trigger-menu-list>
      </ui-trigger-menu-content>
    </ui-trigger-menu>
  `
  const menu = root.querySelector("ui-trigger-menu")!
  menu.editor = textFieldAdapter(root.querySelector("textarea")!)
  menu.triggers = [{ char: "@", items: people }]
}

export { mount }
```

Type @ in the notes, a textarea connected through an editor adapter, and choose a person.

An adapter for another editor reads its text and selection, measures a rectangle at an offset, replaces a range as one undo step, and reports changes. Report changes that weren't the user's with `user: false`, like a collaborator's, and the menu never opens for them.

- `element` (`HTMLElement`): The focused element that gets keys and the menu's ARIA. Undefined until it's in the page.
- `textBefore` (`(length: number) => { text: string; offset: number; } | null`): Up to `length` characters before the caret, and the offset they start at. A token reads as U+FFFC.
- `selection` (`() => TextRange | null`): The selection as text offsets, or null while unfocused.
- `rectAt` (`(offset: number) => TextRect | null`): The rectangle at a text offset, for anchoring.
- `replace` (`(range: TextRange, content: string | TokenInsert, options?: EditorReplaceOptions) => void`): Replaces a range with text or a token as one undoable step, and puts the caret after it.
- `subscribe` (`(listener: (change: EditorChange) => void) => () => void`): Calls `listener` for text edits, caret moves and composition. Returns a cleanup.
- `composing` (`() => boolean`): Whether an input method is composing.
- `tokens?` (`boolean`): Whether `replace` accepts tokens.
- `submit?` (`((event?: Event) => void)`): Sends what's typed, like a form submit, for items that end with `after: "submit"`.

## Undo

Choosing an item keeps the native text field's undo history. Press Command+Z or Control+Z to bring back the query. Safari may combine the insertion with the typing before it in one undo step.

A custom editor adapter must make each replacement one undo step. [Token Input](./token-input.md) handles its own token history.

## Custom Rendering

Elements have no render functions. `ui-trigger-menu-input` wraps your own `<textarea>`, or an `<input>` as the input example does, and every example here puts it in a `ui-field` to join a [Field](./field.md). Put your own markup inside the other parts, like the hint after each person in the custom items example. [Parts and Composition](../parts-and-composition.md) covers the rendering contract, and each part's state is listed under [State](#state).

## Styling

Style the field, the popup and its items. The content shows `data-trigger`, so each trigger's list can look different, like commands in a monospace font. Items show `data-highlighted` and `data-disabled`, and `data-has-icon` when they hold a `ui-trigger-menu-item-icon`; the list shows `data-has-icons` while any item has one. Fade a loading list with `aria-busy`, and style the hint as ghost text: it's positioned at the caret for you.

Each part has a `data-slot`, such as `trigger-menu-item`, and shows its state through the attributes listed under [Data Attributes](#data-attributes).

### `<ui-trigger-menu-content>`
- `--anchor-width`: Width of the anchor, usually the trigger. Use it to match widths.
- `--anchor-height`: Height of the anchor.
- `--available-width`: Space beside the popup, up to the viewport edge. Not inherited either.
- `--available-height`: Space between the anchor and the viewport edge. Use it for max-height. Not inherited, so a child that needs it copies it on the popup, like `[--list-height:var(--available-height)]`, and reads `max-h-(--list-height)`. The first popup registers both names for the whole page with `CSS.registerProperty`, so they don't inherit anywhere. A page that needs them to inherit calls it first, with `inherits: true`. An `@property` rule can't, since a registration in script wins.
- `--transform-origin`: The point on the anchor the popup opens from. Use it to scale from the right place.
- `--arrow-offset`: Where the anchor's center falls along the popup's edge, kept `arrowPadding` from the corners. Position a ::before arrow with it.

## Data Attributes

### `<ui-trigger-menu-input>`
`[data-slot="trigger-menu-input"]`

- `data-closed`: Present while the list is closed, including while it animates out.
- `data-open`: Present while the list is open.
- `data-trigger`: The trigger of the current match, like `@`, while there is one.

### `<ui-trigger-menu-content>`
`[data-slot="trigger-menu-content"]`

- `data-closed`: Present while the list is closed, including while it animates out.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the list animates out. Style the state you animate to.
- `data-open`: Present while the list is open.
- `data-trigger`: The trigger of the current match, like `@`, while there is one.
- `data-has-icons`: Present while any item inside holds an icon part, so items without one can line up.

### `<ui-trigger-menu-item>`
`[data-slot="trigger-menu-item"]`

- `data-disabled`: Present when the item can't be chosen.
- `data-highlighted`: Present on the highlighted item. Focus stays in the field.
- `data-has-icon`: Present on an item while it holds an icon part.

### `<ui-trigger-menu-empty>`
`[data-slot="trigger-menu-empty"]`

- `data-empty`: Present while no item matches.
- `data-loading`: Present while items load.

### `<ui-trigger-menu-item-icon>`
`[data-slot="trigger-menu-item-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

## API Reference

Props are attributes in kebab case, like `auto-highlight` and `side-offset`. `triggers`, `editor` and `controller` are properties, and `anchor` takes a CSS selector. Callbacks are DOM events.

### TriggerMenu

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `triggers` (`TriggerDefinition<T>[]`): The texts that open the menu, and what each one lists.
- `editor?` (`TextEditorAdapter`): The editor the menu reads and writes, for editors without a part of their own, like Tiptap. TriggerMenuInput and a surrounding TokenInput set it for you.
- `open?` (`boolean`): Whether the menu is open. Pass it to control it; it shows only while there's a match.
- `openchange event`: Runs when the menu wants to open or close. `details.reason` says why, `details.trigger` which trigger, and `details.cancel()` stops it.
- `openchangecomplete event`: Runs once the menu has finished opening or closing, after any animation.
- `querychange event`: Runs when the text after the trigger changes. Read-only: it's the editor's text. `details.argument` names the argument being typed.
- `select event`: Runs when an item, with every required argument, is chosen. The default insertion follows unless `details.preventDefault()`. Return a Promise and a token is inserted at once as pending, updated with what it resolves to and removed if it rejects; the menu closes either way.
- `pendingAnnouncement?` (`string`): What screen readers hear once an `select` Promise has been pending for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `status?` (`AsyncOptionsStatus`): Whether items that come from outside are loading or failed, for the status and empty parts. Loaders report their own.
- `autoHighlight?` (`boolean`): Whether the first match is highlighted so Enter and Tab choose it. Visual only: screen readers hear about it once an arrow key moves the highlight, so typed characters keep being echoed.
- `loop?` (`boolean`): Whether arrow keys wrap from the last item to the first.
- `shortcut?` (`string`): Reopens a match dismissed with Escape, with the caret in it.
- `controller?` (`object`): Opens, closes and inserts from anywhere. Create one with `createTriggerMenuController()`.
- `dismissible?` (`boolean`): Whether Escape, an outside press, focus or the window leaving, Android's back gesture and a sheet's swipe can close it. Triggers, Close parts and the controller always can. Pass `false` while it holds unsaved work, and ask in `dismissattempt`.
- `dismissattempt event`: Runs when `dismissible` refused a dismissal made on purpose: Escape, an outside press, back or a swipe. Focus or the window leaving is refused without it. Ask "Discard changes?" here.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### Triggers

- `char` (`string`): The text that starts a match: `"@"`, `"/"`, `"#"`, or several characters like `"[["`.
- `boundary?` (`TriggerBoundary`): Where a match may start.
- `spaces?` (`number | boolean`): Whether the query may contain spaces, or up to how many words, like `@next Wednesday`.
- `pattern?` (`RegExp`): Characters a query may contain, tested one at a time.
- `maxLength?` (`number`): The longest query before the match ends.
- `type?` (`string`): The kind of token choosing an item inserts, where the editor takes tokens.
- `items?` (`TriggerItemsLoader<T> | TriggerMenuData<T>`): Suggestions as data, or a loader given the query and an AbortSignal. Without them, the composed items show.
- `filter?` (`ListFilter<T>`): How typing narrows data items. Loaded items aren't filtered.
- `insert?` (`((item: TriggerMenuDataItem<T>, details: { match: TriggerMatch; arguments: Record<string, string>; }) => string | TokenInsert)`): What replaces the trigger and query. Defaults to a token where the editor takes tokens, else the trigger, the label and a space.

### Items as Data

- `value` (`T`): Identifies the item, and is what choosing it reports. A string, or any value with `itemToValue`.
- `label` (`string`): The text shown and matched by typeahead and filtering. A select's trigger shows it once chosen.
- `keywords?` (`string[]`): More words filtering matches, like `["team"]` for a plan called Pro.
- `disabled?` (`boolean`): Keeps the item from being chosen. The keyboard skips it, like in a native select.
- `after?` (`TriggerAfter`): After choosing it: `"compose"` closes the menu, `"continue"` keeps it open and lists the same trigger's items for the text typed after it, and `"submit"` asks the editor to send. Tab never submits.
- `arguments?` (`TriggerArgument[]`): Typed arguments asked for in order once it's chosen, like `/model <name>`.

### Arguments

- `name` (`string`): The name it's reported under in `details.arguments`.
- `hint?` (`string`): Ghost text shown at the caret until it's typed. Defaults to `<name>`.
- `required?` (`boolean`): Whether Enter can finish the command without it.
- `items?` (`TriggerItemsLoader<string> | TriggerMenuData<string>`): Suggestions for it, as data or a loader. Without them, it's free text and no list shows.
- `allowCustomValue?` (`boolean`): Whether text that matches no suggestion is accepted, like a combobox's custom value.

### TriggerMenuInput

Wraps the field the menu suggests into: a `<textarea>`, or an `<input>`.

### TriggerMenuStatus

A polite status that says the count and the keys once typing pauses. Give it content of its own to say something else, and write that text as the menu changes.

### TriggerMenuContent

- `side?` (`Side`): Which side of the anchor the popup opens on. Flips to the other side when there isn't room. Which side of the trigger the list opens on.
- `align?` (`Align`): How the popup lines up with the anchor along that side. `start` and `end` follow the reading direction. How the list lines up with the trigger along that side.
- `sideOffset?` (`number`): Gap between the anchor and the popup, in pixels. Gap between the line of text and the list, in pixels.
- `alignOffset?` (`number`): Shift along the anchor, in pixels. Shift along the text, in pixels.
- `collisionPadding?` (`number`): Space to keep from the viewport edges, in pixels.
- `arrowPadding?` (`number`): Space to keep between the arrow and the popup's corners, in pixels.
- `anchor?` (`string | Anchor | null`): Positions the popup against this instead of its trigger: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. It's read on every check, so it can move. A controller's `open({ anchor })` wins for that open.
- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `keepMounted?` (`boolean`): Whether the list stays in the page, hidden, while closed.

### TriggerMenuEmpty

Shown while no item matches. Rendering it keeps the menu open with no matches; without it, the menu closes until something matches.

### TriggerMenuList

The listbox. Without items of its own, it renders the current trigger's items.

### TriggerMenuItem

- `value` (`T`): What `select` receives when the item is chosen.
- `label?` (`string`): The text inserted and matched, when the content isn't plain text.
- `keywords?` (`string[]`): More words filtering matches.
- `disabled?` (`boolean`): Keeps the item from being chosen. It can still be highlighted, as the listbox pattern asks.
- `select event`: Runs before the menu's `select`. `details.preventDefault()` skips the default insertion.

### TriggerMenuItemIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

### TriggerMenuGroup and TriggerMenuGroupLabel

A group of items, named by its label.

### TriggerMenuSeparator

A line between items or groups, hidden from screen readers.

### TriggerMenuHint

Ghost text at the caret for the arguments still to type, like `<status>`, hidden from screen readers.

### State

What each part's state holds. Elements have no render functions, so parts show their state through the attributes listed under [Data Attributes](#data-attributes).

`TriggerMenuInput`:

- `open` (`boolean`): Whether the menu is open. It opens on a typed trigger, and closes when nothing matches unless it's loading or renders an empty part.
- `trigger` (`string | null`): The trigger of the current match, like `"@"`, or null.

`TriggerMenuContent` and `TriggerMenuList`:

- `open` (`boolean`): Whether the menu is open. False while it animates out.
- `trigger` (`string | null`): The trigger of the current match, like `"@"`, or null.
- `query` (`string`): The text after the trigger, or after the current argument's start.
- `argument` (`string | null`): The argument being typed, by name, or null at the first level.
- `status` (`AsyncOptionsStatus`): Whether items are loading or failed.
- `items` (`TriggerMenuData<unknown>`): The visible data items, for rendering them yourself.

`TriggerMenuItem`:

- `highlighted` (`boolean`): Whether the item is highlighted, by the keyboard or the pointer.
- `disabled` (`boolean`): Whether the item can't be chosen.

`TriggerMenuItemIcon`:

- `mirror` (`boolean`): Whether it flips in right-to-left text.

`TriggerMenuEmpty`:

- `loading` (`boolean`): Whether items are loading.
- `empty` (`boolean`): Whether no item matches.
- `query` (`string`): The text after the trigger.

`TriggerMenuStatus`:

- `open` (`boolean`): Whether the menu is open. It opens on a typed trigger, and closes when nothing matches unless it's loading or renders an empty part.
- `status` (`AsyncOptionsStatus`): Whether items are loading or failed.
- `loading` (`boolean`): Whether items are loading.
- `count` (`number`): How many items match.
- `argument` (`string | null`): The argument being typed, by name, or null.

`TriggerMenuHint`:

- `argument` (`string | null`): The argument being typed, by name, or null.
- `hint` (`string`): The ghost text: the hints of the arguments still to type.

### Reasons

`event.detail.reason` says why the menu opened or closed.

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `caret-move` (`Event | KeyboardEvent | PointerEvent`): The caret left a trigger menu's match: an arrow key, Home or End, a click, or a selection change.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `focus-out` (`KeyboardEvent | FocusEvent`): Focus left the layer, or Tab moved it out.
- `window-blur` (`FocusEvent`): The window lost focus.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.

With `dismissible` false, the refused dismissals `dismissattempt` reports:

- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `outside-press` (`MouseEvent`): A press outside the layer.

Why the query changed:

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods. Or create one with `createTriggerMenuController()` and set it as the `controller` property.

- `isOpen()` (`() => boolean`): Whether the menu is open.
- `setOpen(open, options?)` (`(open: boolean, options?: TriggerMenuChangeOptions<TriggerMenuOpenChangeReason> | undefined) => boolean`): Opens or closes the menu. Opening needs a match; see `open()` for one that types the trigger. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (TriggerMenuChangeOptions<TriggerMenuOpenChangeReason> & { trigger?: string | undefined; signal?: AbortSignal | undefined; }) | undefined) => Promise<...>`): Opens the menu for `trigger`, typing it at the caret first unless a match for it is already there, and resolves once it closes. Resolves exactly once and never rejects.
- `close(options?)` (`(options?: TriggerMenuChangeOptions<TriggerMenuOpenChangeReason> | undefined) => boolean`): Closes the menu. The match isn't dismissed, so typing in it opens it again. Returns false when the close was canceled or it was already closed.
- `getQuery()` (`() => string`): The text after the trigger, or after the current argument's start. Empty while closed.
- `getMatch()` (`() => TriggerMatch | null`): The current match, or null.
- `insert(content)` (`(content: string | Token) => void`): Replaces the current match with text or a token, or inserts at the caret without one.
- `focus()` (`() => void`): Moves focus to the editor.

### Events

Events fire on `<ui-trigger-menu>` and don't bubble, with the new state in `event.detail.value` and the details beside it. Choosing an item fires `itemselect` on the menu, not `select`, which the field fires for selected text.

| Member                     | On                | Description                                                                                          |
| -------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------- |
| `triggers` property        | `ui-trigger-menu` | The triggers and what each one lists                                                                 |
| `editor` property          | `ui-trigger-menu` | An editor adapter, for a field without an input part                                                 |
| `open` property            | `ui-trigger-menu` | Whether the menu is open                                                                             |
| `api` property             | `ui-trigger-menu` | The [controller](#controller-1)                                                                      |
| `openchange` event         | `ui-trigger-menu` | `detail: { value: open, reason, trigger }`: the new state, the [reason](#reasons) and the `trigger`  |
| `openchangecomplete` event | `ui-trigger-menu` | `detail: { value: open }`, after the animation                                                       |
| `querychange` event        | `ui-trigger-menu` | `detail: { value: query, reason, trigger, argument }`: the text after the trigger, and the argument  |
| `dismissattempt` event     | `ui-trigger-menu` | `detail: { reason, event }`, when a dismissal was refused                                            |
| `itemselect` event         | `ui-trigger-menu` | `detail: { value, arguments, insert(), waitUntil(promise) }`. `preventDefault()` skips the insertion |

When an `itemselect` listener passes a Promise to `event.detail.waitUntil()` and the editor takes tokens, the token is inserted at once with `data-pending`, updated with what the Promise resolves to, and removed if it rejects. The menu closes either way, so people keep typing.

## Accessibility

Focus stays in the field while the arrow keys move the highlight. A `<textarea>` stays a textbox, the only role ARIA allows it, and points at the list with `aria-controls` and, after an arrow key, `aria-activedescendant`. An `<input>` is a combobox with `aria-expanded`. Counts and loading are said through `ui-trigger-menu-status`, a polite status, never through the field, so render one: visually hidden, as in the demo, or at the top of the list, as in [Loading Items](#loading-items). Give the field a visible label through a [Field](./field.md), or an `aria-label`.

### Keyboard

| Key                  | Does                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| ArrowDown, ArrowUp   | Moves the highlight while the list is open; the caret stays in the field                          |
| Enter                | Chooses the highlighted item. In a command's arguments, finishes once only optional ones are left |
| Tab                  | Chooses the highlighted item, or accepts an argument and moves to the next                        |
| Escape               | Closes the list and dismisses the match, so typing on doesn't reopen it                           |
| Control+Space        | Reopens a dismissed match with the caret in it; `shortcut` changes the key                        |
| Backspace            | Past an argument's start, goes back to the previous argument                                      |
| Command+Z, Control+Z | Undoes the insertion and brings back the query                                                    |

### Tested Behavior

Every line below is an automated test.

**Opening**

- Typing a trigger opens the list with every item.
- Typing after the trigger filters the list.
- Queries match Unicode letters and ignore accents.
- A trigger mid-word doesn't open.
- A trigger followed by a space doesn't open.
- A command trigger opens only at the start, so a leading space escapes it.
- The list opens at the trigger and stays there as the query grows.
- Pasting a trigger opens the list.
- Focusing a field that already has a match doesn't open the list.
- Moving the caret into a match doesn't open the list.
- A query that matches nothing closes the list, and Backspace that matches again opens it.
- With an empty part, a query that matches nothing keeps the list open with the message.

**Choosing**

- The first match is highlighted, and Enter inserts it with a space.
- Tab accepts the highlighted suggestion and focus stays in the field.
- Arrow keys move the highlight, and wrap.
- A disabled item can be highlighted but not chosen.
- Clicking an item inserts it and keeps focus and the caret in the field.
- Text after the caret stays where it was.

**Dismissing**

- Escape closes the list, keeps the text and focus.
- A dismissed match stays closed through caret moves, typing in it and clicks.
- A new trigger after a dismissed one opens.
- Deleting and retyping the trigger opens it again.
- Ctrl+Space reopens a dismissed match.
- Moving the caret out of the match closes the list.
- Pressing outside closes the list.

**Arguments**

- A command with arguments asks for each one, and Enter finishes with them.
- Enter finishes once only optional arguments are left.
- A free-text argument shows no list, and Enter takes the typed text.
- Backspace past an argument's start goes back a level.
- Escape in an argument keeps the inserted text.
- An item that submits sends the form once inserted.

**Loading**

- Items load for the query.
- A newer query aborts the older load, and only its results land.

**Undo**

- Undo after choosing brings the query back, never a dead undo.

**Input**

- The SDK's Textarea works as the field, and undo still works.
- An <input> field works the same.

Runs in React, Vue and web components.

- No axe violations while closed.
- No axe violations while open with an item highlighted.
- No axe violations while open on an input.
- No axe violations with nothing found.
- A textarea stays a textbox, without aria-expanded, and controls the list while open.
- An input is a combobox that says whether it's expanded.
- Aria-activedescendant waits for an arrow key and clears on the next edit.
- Two menus on a page have their own ids, and the role never changes.
- Options are named by their text.
- The status says the count and the keys once typing pauses, then that nothing matches.
- The hint is hidden from assistive technology, and the status names the argument.
- Accessibility tree.

Runs in React, Vue and web components.
