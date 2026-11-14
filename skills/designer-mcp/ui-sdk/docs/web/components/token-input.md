# Token Input

Mix editable text with tokens for files, people, tags, and other references.

A token input is a text field that holds tokens alongside the text, like the people mentioned in a message or the files attached to a prompt. Each token moves, deletes and copies as one piece.

```ts title="demo.ts"
import "@ui-sdk/web/token-input"
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"
import { createElement, X } from "lucide"

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
      <ui-field-label>Message</ui-field-label>
      <ui-token-input>
        <ui-token-input-editor placeholder="Type @ to mention someone…"></ui-token-input-editor>
        <template>
          <ui-token-input-token>
            <span data-token-label></span>
            <ui-token-input-token-remove>${createElement(X, { "aria-hidden": "true" }).outerHTML}</ui-token-input-token-remove>
          </ui-token-input-token>
        </template>
        <ui-trigger-menu>
          <ui-trigger-menu-content>
            <ui-trigger-menu-list></ui-trigger-menu-list>
          </ui-trigger-menu-content>
        </ui-trigger-menu>
      </ui-token-input>
    </ui-field>
  `
  root.querySelector("ui-trigger-menu")!.triggers = [
    { char: "@", type: "mention", items: people },
  ]
}

export { mount }
```

Type @ and choose a person with the arrow keys and Enter. Remove a token with Backspace, or press its remove button.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. Import the trigger menu and the field too if you use them. On the server the import does nothing.

```ts
import "@ui-sdk/web/token-input"
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"
```

## Composition

Use the following composition to build a `ui-token-input`:

```text
ui-token-input
├── ui-token-input-editor
└── ui-trigger-menu
```

And for each token, inside a `<template>`:

```text
ui-token-input-token
└── ui-token-input-token-remove
```

`ui-token-input` holds the value, and `ui-token-input-editor` is the text people edit. A [Trigger Menu](./trigger-menu.md) inside it suggests tokens when someone types `@`, `/`, or another trigger. Put a `<template>` inside it, or set its `renderToken` property, to give each token your own markup.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/token-input"
</script>

<ui-token-input value="Explain [@routes.ts](file:src/routes.ts)">
  <ui-token-input-editor aria-label="Prompt"></ui-token-input-editor>
</ui-token-input>
```

A value is an array of text and tokens. Each token has a type, a value for your app, and a label for the reader. The `value` attribute writes it as codec text; set the `defaultValue` property before the element connects to pass an array instead. The editor manages its own content, including tokens, selection, and undo, so let it render that content and use a `<template>` or `renderToken` for custom token markup.

## Token Input or Trigger Menu

Token Input holds the text and tokens. [Trigger Menu](./trigger-menu.md) suggests what to insert when someone types a trigger character.

Use Token Input on its own when your code supplies the tokens. Add a Trigger Menu for suggestions, as in the demo above. Trigger Menu also works with ordinary inputs and textareas.

## Prompt Input

Combine file suggestions, skills, and a send action. This example marks files as pending while they load, then uses `updateToken()` to show a skill running. Enter sends; Shift+Enter adds a line. An open suggestion menu or an active input method takes precedence over sending. Enter submits the form the input is in, so the send button is that form's submit button.

```ts title="prompt-input.ts"
import "@ui-sdk/web/trigger-menu"
import { toText, type Token } from "@ui-sdk/web/token-input"
import { ArrowUp, Check, Clock, Code, createElement, File, X } from "lucide"
import { log } from "./log"

const files = [
  { value: "src/app.tsx", label: "app.tsx", keywords: ["src"] },
  { value: "src/routes.ts", label: "routes.ts", keywords: ["src"] },
  { value: "src/styles.css", label: "styles.css", keywords: ["src"] },
  { value: "README.md", label: "README.md" },
  { value: "package.json", label: "package.json" },
]

const skills = [
  {
    value: "search",
    label: "search",
    arguments: [{ name: "query", hint: "<query>", required: true }],
  },
  { value: "review", label: "review" },
  { value: "summarize", label: "summarize" },
]

const loadFile = () => new Promise<void>((resolve) => setTimeout(resolve, 800))

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form>
      <ui-token-input>
        <div data-slot="card">
          <ui-token-input-editor aria-label="Prompt" placeholder="Ask anything. Type @ or /"></ui-token-input-editor>
          <div data-slot="row">
            <button type="button" data-size="sm">Attach README</button>
            <button type="submit" data-variant="solid" data-size="sm" data-shape="round" aria-label="Send">
              ${createElement(ArrowUp, { "aria-hidden": "true" }).outerHTML}
            </button>
          </div>
        </div>
        <ui-trigger-menu>
          <ui-trigger-menu-hint></ui-trigger-menu-hint>
          <ui-trigger-menu-content>
            <ui-trigger-menu-empty>No matches</ui-trigger-menu-empty>
            <ui-trigger-menu-list></ui-trigger-menu-list>
          </ui-trigger-menu-content>
        </ui-trigger-menu>
      </ui-token-input>
    </form>
  `
  const input = root.querySelector("ui-token-input")!
  const prompt = input.api
  const menu = root.querySelector("ui-trigger-menu")!
  const [attach, send] = root.querySelectorAll("button")
  let running = false
  let sendTimer: ReturnType<typeof setTimeout> | undefined

  input.renderToken = (token, host) => {
    host.innerHTML = `
      <ui-token-input-token>
        ${createElement(token.type === "skill" ? Code : File, { "aria-hidden": "true" }).outerHTML}
        <span></span>
        ${token.data?.run === "running" ? createElement(Clock, { "aria-hidden": "true" }).outerHTML : ""}
        ${token.data?.run === "done" ? createElement(Check, { "aria-hidden": "true" }).outerHTML : ""}
        <ui-token-input-token-remove>${createElement(X, { "aria-hidden": "true" }).outerHTML}</ui-token-input-token-remove>
      </ui-token-input-token>
    `
    host.querySelector("span")!.textContent =
      token.type === "skill" ? `/${token.label}` : token.label
  }
  menu.triggers = [
    { char: "@", type: "file", items: files },
    { char: "/", boundary: "start", type: "skill", items: skills },
  ]
  menu.addEventListener("itemselect", (event) => {
    if (event.detail.trigger === "@") {
      event.detail.waitUntil(loadFile())
    }
  })

  const setRunning = (next: boolean) => {
    running = next
    send.disabled = next
    send.setAttribute("aria-label", next ? "Running" : "Send")
    send.innerHTML = createElement(next ? Clock : ArrowUp, {
      "aria-hidden": "true",
    }).outerHTML
  }

  attach.addEventListener("mousedown", (event) => event.preventDefault())
  attach.addEventListener("click", () =>
    prompt.insert(
      { type: "file", value: "README.md", label: "README.md" },
      { resolve: loadFile() }
    )
  )
  root.querySelector("form")!.addEventListener("submit", (event) => {
    event.preventDefault()
    if (running || !prompt.getLabel().trim()) {
      return
    }
    setRunning(true)
    const skillTokens = prompt
      .getValue()
      .filter(
        (segment): segment is Token =>
          typeof segment !== "string" && segment.type === "skill"
      )
    for (const skill of skillTokens) {
      prompt.updateToken(skill.id!, { data: { ...skill.data, run: "running" } })
    }
    sendTimer = setTimeout(() => {
      for (const skill of skillTokens) {
        prompt.updateToken(skill.id!, { data: { ...skill.data, run: "done" } })
      }
      log(root, `Sent ${toText(prompt.getValue())}`)
      prompt.clear()
      setRunning(false)
    }, 1500)
  })

  return () => clearTimeout(sendTimer)
}

export { mount }
```

Type @ for files or / at the start for skills. For /search, enter a query and press Enter to insert the command. Press Enter again to send, and the console logs the message.

## Deleting Tokens

Choose what Backspace does at a token with `token-deletion`:

- `whole` removes the token in one press.
- `select` selects it first, then removes it on the next press.
- `revert` turns it back into editable text, so the trigger menu opens on it again.

```ts title="deletion.ts"
import "@ui-sdk/web/token-input"
import "@ui-sdk/web/select"
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"
import type { TokenDeletion, TokenInputValue } from "@ui-sdk/web/token-input"
import { Check, ChevronDown, createElement, File } from "lucide"
import { log } from "./log"

const modes = [
  { value: "whole", label: "Whole" },
  { value: "select", label: "Select" },
  { value: "revert", label: "Revert" },
]

const files = [
  { value: "src/app.tsx", label: "app.tsx", keywords: ["src"] },
  { value: "src/routes.ts", label: "routes.ts", keywords: ["src"] },
  { value: "src/styles.css", label: "styles.css", keywords: ["src"] },
  { value: "README.md", label: "README.md" },
  { value: "package.json", label: "package.json" },
]

const draft: TokenInputValue = [
  "Explain ",
  {
    type: "file",
    value: "src/routes.ts",
    label: "routes.ts",
    data: { trigger: "@" },
  },
  " in two sentences.",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <ui-select default-value="whole">
          <ui-select-label>Backspace</ui-select-label>
          <ui-select-trigger>
            <button>
              <ui-select-value></ui-select-value>
              ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-select-trigger>
          <ui-select-content>
            ${modes
              .map(
                (mode) => `
                  <ui-select-item value="${mode.value}">
                    ${mode.label}
                    <ui-select-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-select-item-indicator>
                  </ui-select-item>
                `
              )
              .join("")}
          </ui-select-content>
        </ui-select>
      </div>
      <ui-field>
        <ui-field-label>Prompt</ui-field-label>
      </ui-field>
    </div>
  `
  const prompt = document.createElement("ui-token-input")
  prompt.tokenDeletion = "whole"
  prompt.defaultValue = draft
  prompt.innerHTML = `
    <ui-token-input-editor></ui-token-input-editor>
    <template>
      <ui-token-input-token>
        ${createElement(File, { "aria-hidden": "true" }).outerHTML}
        <span data-token-label></span>
      </ui-token-input-token>
    </template>
    <ui-trigger-menu>
      <ui-trigger-menu-content>
        <ui-trigger-menu-list></ui-trigger-menu-list>
      </ui-trigger-menu-content>
    </ui-trigger-menu>
  `
  root.querySelector("ui-field")!.append(prompt)
  root.querySelector("ui-trigger-menu")!.triggers = [
    { char: "@", type: "file", items: files },
  ]
  root.querySelector("ui-select")!.addEventListener("valuechange", (event) => {
    if (event.detail.value) {
      prompt.tokenDeletion = event.detail.value as TokenDeletion
    }
  })
  prompt.addEventListener("valuechange", (event) => {
    for (const token of event.detail.removed) {
      log(root, `Removed ${token.label} (${prompt.tokenDeletion})`)
    }
  })
}

export { mount }
```

Choose a Backspace behavior, click just after routes.ts, and press Backspace. Undo to try another behavior.

## Codec

A codec converts tokens to text for the clipboard, forms, and saved drafts. The default writes `[@label](type:value)`. Copy that text into another app and paste it back to restore the token.

Use `toText`, `fromText`, and `toLabel` to convert values yourself. Set the `codec` property for another format, as this example does for `<@hollis>`. With `copy="label"`, copying writes what people read, and pasting back into a token input still restores the tokens. The default parser accepts letters, digits, `_`, and `-` in token types; other types need a custom codec. The `value` attribute reads with the default codec, so set `codec` and `defaultValue` before the element connects.

```ts title="codec.ts"
import "@ui-sdk/web/field"
import { fromText, toText, type TokenCodec } from "@ui-sdk/web/token-input"
import { log } from "./log"

const chat: TokenCodec = {
  format: (token) => `<@${token.value}>`,
  parse: (text) =>
    text.split(/(<@[\w.-]+>)/).map((part) => {
      const id = /^<@([\w.-]+)>$/.exec(part)?.[1]
      return id ? { type: "mention", value: id, label: `@${id}` } : part
    }),
}

const draft = fromText("Ping <@hollis> and <@ines> about the launch", chat)

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Message</ui-field-label>
    </ui-field>
  `
  const message = document.createElement("ui-token-input")
  message.codec = chat
  message.setAttribute("copy", "label")
  message.defaultValue = draft
  message.innerHTML = `<ui-token-input-editor></ui-token-input-editor>`
  message.addEventListener("valuechange", (event) =>
    log(root, toText(event.detail.value, chat))
  )
  root.querySelector("ui-field")!.append(message)
}

export { mount }
```

Edit the message. The console logs it in the custom format, with each mention as <@id>.

## Form

Give the input a `name` to submit its serialized text. `required`, `disabled`, and `read-only` control form behavior. The `form` attribute associates it with a form elsewhere on the page, as shown here.

```ts title="form.ts"
import "@ui-sdk/web/checkbox"
import "@ui-sdk/web/field"
import { toText, type TokenInputValue } from "@ui-sdk/web/token-input"
import { Check, createElement } from "lucide"
import { log } from "./log"

const draft: TokenInputValue = [
  "Explain ",
  { type: "file", value: "src/routes.ts", label: "routes.ts" },
  " in two sentences.",
]

function mount(root: HTMLElement) {
  const formId = crypto.randomUUID()
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <ui-checkbox>
            <ui-checkbox-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-checkbox-indicator>
          </ui-checkbox>
          Disabled
        </label>
        <label data-slot="label">
          <ui-checkbox>
            <ui-checkbox-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-checkbox-indicator>
          </ui-checkbox>
          Read-only
        </label>
      </div>
      <div data-slot="stack">
        <ui-field>
          <ui-field-label>Prompt</ui-field-label>
          <ui-token-input form="${formId}" name="prompt" required value="${toText(draft)}">
            <ui-token-input-editor></ui-token-input-editor>
          </ui-token-input>
        </ui-field>
        <form id="${formId}" data-slot="row">
          <button type="submit" data-variant="solid">Submit</button>
          <button type="reset">Reset</button>
        </form>
      </div>
    </div>
  `
  const field = root.querySelector("ui-field")!
  const prompt = root.querySelector("ui-token-input")!
  const [disabled, readOnly] = root.querySelectorAll("ui-checkbox")
  disabled.addEventListener("checkedchange", (event) => {
    field.toggleAttribute("disabled", event.detail.value === true)
  })
  readOnly.addEventListener("checkedchange", (event) => {
    prompt.toggleAttribute("read-only", event.detail.value === true)
  })
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    log(root, `Submitted ${new FormData(form).get("prompt") ?? ""}`)
  })
}

export { mount }
```

Press Submit to log the prompt's serialized value. Try Disabled and Read-only, then Reset.

## Controlled

Set the `value` attribute or property, and listen for `valuechange`. The event's detail includes the reason, input type, and removed tokens. The input still manages its editing history.

```ts title="controlled.ts"
import "@ui-sdk/web/trigger-menu"
import "@ui-sdk/web/field"
import { toText, type TokenInputValue } from "@ui-sdk/web/token-input"
import { log } from "./log"

const files = [
  { value: "src/app.tsx", label: "app.tsx", keywords: ["src"] },
  { value: "src/routes.ts", label: "routes.ts", keywords: ["src"] },
  { value: "src/styles.css", label: "styles.css", keywords: ["src"] },
  { value: "README.md", label: "README.md" },
  { value: "package.json", label: "package.json" },
]

const draft: TokenInputValue = [
  "Explain ",
  { type: "file", value: "src/routes.ts", label: "routes.ts" },
  " in two sentences.",
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Prompt</ui-field-label>
      <ui-token-input value="${toText(draft)}">
        <ui-token-input-editor></ui-token-input-editor>
        <ui-trigger-menu>
          <ui-trigger-menu-content>
            <ui-trigger-menu-list></ui-trigger-menu-list>
          </ui-trigger-menu-content>
        </ui-trigger-menu>
      </ui-token-input>
    </ui-field>
  `
  const prompt = root.querySelector("ui-token-input")!
  prompt.history = { limit: 50, groupDelay: 1000 }
  prompt.getTokenDescription = (token) =>
    token.type === "file" ? "attached file" : token.type
  root.querySelector("ui-trigger-menu")!.triggers = [
    { char: "@", type: "file", items: files },
  ]
  prompt.addEventListener("valuechange", (event) => {
    const { value, reason } = event.detail
    const removed = event.detail.removed.map((token) => token.label).join(", ")
    log(
      root,
      `${toText(value)} (${reason}${removed ? `, removed ${removed}` : ""})`
    )
  })
}

export { mount }
```

Type, add a file with @, or remove a token. The console logs the value and the reason for each change.

## Controller

Use the element's `api` to insert, update, or remove tokens from code. Pass a promise as `resolve` to mark an inserted token as pending until its data is ready. Updating a token doesn't add an undo step.

```ts title="controller.ts"
import "@ui-sdk/web/field"
import {
  toText,
  type Token,
  type TokenInputValue,
} from "@ui-sdk/web/token-input"

const draft: TokenInputValue = [
  "Compare ",
  { type: "file", value: "src/routes.ts", label: "routes.ts" },
  " with ",
]

const loadFile = () => new Promise<void>((resolve) => setTimeout(resolve, 800))

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-action="attach">Attach File</button>
        <button type="button" data-action="path">Show Path</button>
        <button type="button" data-action="remove">Remove First</button>
        <button type="button" data-action="undo">Undo</button>
        <button type="button" data-action="clear">Clear</button>
      </div>
      <ui-field>
        <ui-field-label>Prompt</ui-field-label>
        <ui-token-input value="${toText(draft)}">
          <ui-token-input-editor></ui-token-input-editor>
        </ui-token-input>
      </ui-field>
    </div>
  `
  const prompt = root.querySelector("ui-token-input")!.api
  const firstToken = () =>
    prompt
      .getValue()
      .find((segment): segment is Token => typeof segment !== "string")
  const actions: Record<string, () => void> = {
    attach: () =>
      prompt.insert(
        { type: "file", value: "package.json", label: "package.json" },
        { at: "end", resolve: loadFile() }
      ),
    path: () => {
      const token = firstToken()
      if (token) {
        prompt.updateToken(token.id!, { label: token.value })
      }
    },
    remove: () => {
      const token = firstToken()
      if (token) {
        prompt.removeToken(token.id!)
      }
    },
    undo: () => prompt.undo(),
    clear: () => prompt.clear(),
  }
  root
    .querySelector("[data-slot=controls]")!
    .addEventListener("mousedown", (event) => event.preventDefault())
  root
    .querySelectorAll<HTMLButtonElement>("[data-action]")
    .forEach((button) => {
      button.addEventListener("click", () => actions[button.dataset.action!]())
    })
}

export { mount }
```

Attach a file and watch it load. Show the first token's full path or remove it, then use Undo or Clear.

## Submit Shortcut

Set `submit-shortcut` to `mod+enter` for a multiline message. Enter then inserts a line, and Command or Control+Enter submits the form the input is in.

```ts title="submit-shortcut.ts"
import "@ui-sdk/web/field"
import { toLabel } from "@ui-sdk/web/token-input"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form>
      <ui-field>
        <ui-field-label>Message</ui-field-label>
        <ui-token-input submit-shortcut="mod+enter">
          <ui-token-input-editor placeholder="Write a message…"></ui-token-input-editor>
        </ui-token-input>
      </ui-field>
    </form>
  `
  const message = root.querySelector("ui-token-input")!
  root.querySelector("form")!.addEventListener("submit", (event) => {
    event.preventDefault()
    log(root, `Sent ${toLabel(message.value)}`)
  })
}

export { mount }
```

Write a message. Enter adds a line; Command+Enter on a Mac or Control+Enter elsewhere sends it to the console.

## Custom Rendering

Put a `<template>` inside `ui-token-input` to render each token's content, usually a `ui-token-input-token` with a `ui-token-input-token-remove` inside. An element with `data-token-label` in it gets the token's label. To choose an icon by the token's type or show its `data`, set the `renderToken` property instead: it receives the token and the element that holds it. Without either, each token shows its label.

Elements have no render functions. See [Parts and Composition](../parts-and-composition.md) for the rendering contract and [State](#state) for each part's fields.

## Styling

Style the editor, the tokens and their remove buttons. The editor shows `data-empty` while it holds nothing; show the placeholder with `content: attr(aria-placeholder)` on its `::before`. Tokens show `data-token-type`, `data-pending`, `data-unresolved` and `data-selected`. Without a template or `renderToken`, the element that holds each token, `token-input-host`, carries the same attributes, so you can style tokens without custom markup.

Each part has a `data-slot`, such as `token-input-token`, and shows its state through the attributes listed under [Data Attributes](#data-attributes).

## Data Attributes

### `<ui-token-input-editor>`
`[data-slot="token-input-editor"]`

- `data-empty`: Present while the input holds nothing. Show the placeholder with it.
- `data-disabled`: Present when the input is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the input is read-only.

### `<ui-token-input-token>`
`[data-slot="token-input-token"]`

- `data-token-type` (`file`): The token's type, like `file` or `mention`. Also on its host.
- `data-pending`: Present while the token loads. Also on its host.
- `data-disabled`: Present when the input is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the input is read-only.
- `data-slot`
- `data-selected`: Present while the token is in the selection, or selected for removal. Also on its host.
- `data-unresolved`: Present while the token needs the user, like an ambiguous mention. Also on its host.

### `<ui-token-input-token-remove>`
`[data-slot="token-input-token-remove"]`

- `data-disabled`: Present when the input is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the input is read-only.

## API Reference

Props are attributes in kebab case, like `submit-shortcut` and `token-deletion`. `codec`, `defaultValue`, `getTokenDescription`, `history`, `controller` and `renderToken` are properties. Callbacks are DOM events.

### TokenInput

- `value?` (`TokenInputValue`): The value. Pass it to control the input.
- `defaultValue?` (`TokenInputValue`): The value at first, when uncontrolled. A form reset returns to it.
- `valuechange event`: Runs when typing, pasting, a menu, undo or a controller wants to change the value. `details.reason` says why, `details.removed` lists removed tokens, and `details.cancel()` stops it.
- `submit event`: Runs on the submit shortcut, unless an input method is composing or a trigger menu is open. Without it, the shortcut submits the form the input is in. With neither, the key is left alone, so Enter starts a new line.
- `submitShortcut?` (`"enter" | "mod+enter"`): Which keys submit: `"enter"`, with Shift+Enter for a new line, or `"mod+enter"`, with Enter for a new line, which many Japanese and Chinese writers prefer.
- `tokenDeletion?` (`TokenDeletion`): How Backspace and Delete treat a token next to the caret. `"whole"` removes it in one press, `"select"` selects it first and removes it on the second, and `"revert"` turns it back into its text, so a trigger menu opens on it again.
- `copy?` (`"codec" | "label"`): What copying writes as plain text: `"codec"` keeps tokens through any app that pastes text, `"label"` writes what people read.
- `codec?` (`TokenCodec`): How tokens become text and back, for the clipboard and forms.
- `getTokenDescription?` (`((token: Token) => string)`): What a token says to screen readers besides its label, like its kind and status.
- `history?` (`UndoStackOptions`): Undo history: how many steps it keeps, and how long a typing pause starts a new step.
- `disabled?` (`boolean`): Disables the input: it can't be focused or changed, and isn't submitted.
- `readOnly?` (`boolean`): Keeps the input focusable and submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission while the input is empty.
- `name?` (`string`): The name the codec text submits under. Without one, the input submits nothing.
- `form?` (`string`): The id of a form to belong to, when the input isn't inside it.
- `controller?` (`object`): Reads, edits and focuses the input from anywhere. Create one with `createTokenInputController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

`renderToken(token, host)` renders each token's content into `host`. Without it, a `<template>` inside the element is copied for each token.

### TokenInputEditor

- `placeholder?` (`string`): Text shown while the input is empty, through `aria-placeholder`. Show it with `data-empty:before:content-[attr(aria-placeholder)]`.

### TokenInputToken

A token's content, inside the template or `renderToken`, with its state for styling.

### TokenInputTokenRemove

Removes its token when pressed and keeps focus in the editor. It's hidden from assistive technology, since keyboard users remove tokens with Backspace.

### Token

- `type` (`string`): Kind, like `"mention"`, `"file"` or `"skill"`.
- `value` (`string`): The id it stands for.
- `label` (`string`): The text it shows, reads as and falls back to.
- `id?` (`string`): Stable identity, generated when missing.
- `status?` (`"pending" | "unresolved"`): `"pending"` while it loads, `"unresolved"` when it needs the user, like an ambiguous mention.
- `data?` (`Record<string, unknown>`): What the chip renders from, like an icon or a run state. Never serialized.

### Codec

- `format` (`(token: Token) => string`): The text a token is written as.
- `parse` (`(text: string) => TokenInputValue`): Text back into a value, with tokens wherever their text appears.
- `escape?` (`((text: string, next: Token | undefined) => string)`): How plain text is written so `parse` reads it back as text. `next` is the token that follows it, if any. Defaults to the text as is.

### State

`TokenInputEditor`:

- `empty` (`boolean`): Whether the input holds nothing.
- `disabled` (`boolean`): Whether the input is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the input is read-only: it stays focusable, but typing, pastes and drops don't change it.

`TokenInputToken`:

- `token` (`Token`): The token this part shows: the one the token input renders its content for.
- `selected` (`boolean`): Whether the token is in the selection, or selected for removal.
- `pending` (`boolean`): Whether the token is loading.
- `unresolved` (`boolean`): Whether the token needs the user, like an ambiguous mention.
- `disabled` (`boolean`): Whether the input is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the input is read-only, so the token's remove button does nothing.

### Reasons

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `paste` (`ClipboardEvent`): Files were pasted, like a screenshot, or text and tokens into a token input.
- `drop` (`DragEvent`): Files were dropped on a drop zone, or text and tokens on a token input.
- `cut` (`ClipboardEvent`): A selection was cut from a token input.
- `undo` (`KeyboardEvent | InputEvent`): Undo, from the keyboard, the Edit menu or a controller.
- `redo` (`KeyboardEvent | InputEvent`): Redo, from the keyboard, the Edit menu or a controller.
- `remove-press` (`MouseEvent | KeyboardEvent`): A chip's remove part was pressed, or Backspace or Delete removed a chip or a span.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods. Or create one with `createTokenInputController()` and set it as the `controller` property.

- `getValue()` (`() => TokenInputValue`): The value: text and tokens.
- `setValue(value, options?)` (`(value: TokenInputValue, options?: TokenInputChangeOptions | undefined) => boolean`): Replaces the value as one undoable step. Returns false when the change was canceled or nothing changed.
- `getText(codec?)` (`(codec?: TokenCodec | undefined) => string`): The value as codec text, like `Ask [@Ada](mention:ada)`.
- `getLabel()` (`() => string`): The value as people read it, with each token's label.
- `insert(content, options?)` (`(content: string | Token | TokenInputValue, options?: (TokenInputChangeOptions & { at?: TextRange | "caret" | "end" | undefined; resolve?: PromiseLike<...> | undefined; }) | undefined) => boolean`): Inserts text, a token or a value at the caret, the end or a range, as one undoable step. With `resolve`, a token is pending until it settles: updated with what it resolves to, removed if it rejects. Returns false when the change was canceled.
- `updateToken(id, patch)` (`(id: string, patch: Partial<Omit<Token, "id">>) => boolean`): Changes a token's status, data or label without an undo step or a caret move. Returns false when there's no such token or nothing changed.
- `removeToken(id, options?)` (`(id: string, options?: TokenInputChangeOptions | undefined) => boolean`): Removes a token as one undoable step. Returns false when the change was canceled or nothing changed.
- `undo()` (`() => boolean`): Undoes the last step. Returns false when there was none or the change was canceled.
- `redo()` (`() => boolean`): Redoes the last undone step. Returns false when there was none or the change was canceled.
- `canUndo()` (`() => boolean`): Whether there's a step to undo.
- `canRedo()` (`() => boolean`): Whether there's a step to redo.
- `clear(options?)` (`(options?: TokenInputChangeOptions | undefined) => boolean`): Empties the input as one undoable step. Returns false when the change was canceled or nothing changed.
- `focus(options?)` (`(options?: { at?: "end" | "start" | undefined; } | undefined) => void`): Focuses the editor, with the caret at its start or end.
- `editor` (`TextEditorAdapter`): The editor a TriggerMenu outside the token input reads and writes. A menu inside it finds it on its own.

### Events

Events fire on their own element and don't bubble, with the new state in `event.detail.value`.

| Member                      | On               | Description                                                                 |
| --------------------------- | ---------------- | --------------------------------------------------------------------------- |
| `value` property, attribute | `ui-token-input` | The value. The attribute and a string property are read as codec text       |
| `api` property              | `ui-token-input` | The [controller](#controller-1)                                             |
| `valuechange` event         | `ui-token-input` | `detail: { value, reason, inputType, removed }`: the [reason](#reasons) too |

There's no submit event: the submit shortcut submits the form the input is in, so the form's own `submit` event hears it. Setting the `value` property is one undoable step, like `setValue()`.

## Accessibility

The editor is a multiline text box: it has the `textbox` role with `aria-multiline`, and a Trigger Menu inside it adds `aria-autocomplete` and `aria-haspopup` for its suggestions. Give it a visible label through a [Field](./field.md), or an `aria-label`. Each token reads as its label and its kind, like "routes.ts file", and inserting or removing one is announced. Typing keeps the browser's spelling, autocorrect, and input method support.

### Keyboard

| Key                          | Does                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------- |
| Backspace, Delete            | Removes the token before or after the caret, as `token-deletion` says         |
| ArrowLeft, ArrowRight        | Moves the caret past a token in one press; the caret never stops inside one   |
| Enter                        | Submits. While a trigger menu is open, chooses the highlighted suggestion     |
| Shift+Enter                  | Starts a new line                                                             |
| Command+Enter, Control+Enter | Submits when `submit-shortcut` is `"mod+enter"`; Enter then starts a new line |
| Command+Z, Control+Z         | Undoes the last step. Typing is grouped; pastes and token changes are steps   |
| Shift+Command+Z, Control+Y   | Redoes the last undone step                                                   |

### Tested Behavior

Every line below is an automated test.

**Value**

- Renders text and tokens, each token as one chip.
- Tokens it starts with show their rendered content once, and read as their label and kind.
- Tokens and their remove parts mark a read-only or disabled input.
- Is empty with a placeholder until something is typed.
- Typing after a token goes after it.
- Shift+Enter starts a new line.

**Tokens**

- @ opens the menu inside the input, and choosing inserts a token and a space.
- A controlled input takes tokens from its menu and keeps typing in order.
- Enter in an open menu chooses and doesn't submit.
- One Backspace removes a whole token, and says so.
- Backspace removes tokens one by one, with no keystroke spent on anchors.
- Delete removes the token after the caret.
- The caret crosses a token with one arrow press each way.
- The caret can sit between two adjacent tokens.
- Clicking past a final token and typing lands after it.
- Word deletion stops at a token.
- The remove button removes its token and keeps focus.
- With tokenDeletion select, the first Backspace selects the token and the second removes it.
- With tokenDeletion revert, Backspace turns the token back into text and the menu opens on it.

**History**

- Undo and Redo step through edits, a token insertion on its own.
- Undo brings back a removed token.
- A pending token shows loading, then settles without an undo step.
- A pending token whose load fails is removed.

**Clipboard**

- Copying tokens into plain text and back keeps them.
- Copy writes codec text and HTML with the tokens.
- Pasting codec text makes tokens.
- With copy label, plain text gets what people read.

**Submit**

- Enter submits the codec text.
- With mod+enter, Enter is a new line and Cmd or Ctrl+Enter submits.
- A form submits the codec text under the input's name.
- Enter submits the form the input's form attribute names, not the one it's in.
- Enter while an input method composes doesn't submit.

Runs in React, Vue and web components.
