# Shortcuts

Register keyboard shortcuts and show the right keys for the user's platform.

`registerShortcut` connects keys to an action. For an element that already accepts `shortcut`, such as a dialog trigger, use that attribute directly.

```ts title="basic.ts"
import { ariaKeyshortcuts, formatShortcut, registerShortcut } from "@ui-sdk/web"

export function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="row">
        <button type="button" data-action="new" aria-keyshortcuts="N">New note <kbd aria-hidden="true" data-slot="kbd">N</kbd></button>
        <button type="button" data-action="save" aria-keyshortcuts="${ariaKeyshortcuts("mod+s")}">Save <kbd aria-hidden="true" data-slot="kbd">${formatShortcut("mod+s")}</kbd></button>
      </div>
      <output data-slot="output">Press N or the keys to save.</output>
    </div>
  `
  const output = root.querySelector("output")!
  const actions = {
    new: () => (output.textContent = "Note created"),
    save: () => (output.textContent = "Saved"),
  }
  root
    .querySelector('[data-action="new"]')!
    .addEventListener("click", actions.new)
  root
    .querySelector('[data-action="save"]')!
    .addEventListener("click", actions.save)

  const offs = [
    registerShortcut("n", actions.new, { description: "New note" }),
    registerShortcut("mod+s", actions.save, { description: "Save" }),
  ]
  return () => offs.forEach((off) => off())
}
```

Press N to create a note. Press Command+S on Mac or Control+S elsewhere to save. The buttons run the same actions.

## Register a Shortcut

Keys are joined with `+`. `mod` means Command on Apple platforms and Control elsewhere:

```html
<button id="new-note">New note <kbd aria-hidden="true"></kbd></button>
<p id="count" aria-live="polite">0 notes</p>
```

```ts
import { ariaKeyshortcuts, formatShortcut, registerShortcut } from "@ui-sdk/web"

const button = document.querySelector<HTMLButtonElement>("#new-note")!
const count = document.querySelector("#count")!
let total = 0
function addNote() {
  total++
  count.textContent = `${total} notes`
}

const unregister = registerShortcut("mod+enter", addNote, {
  description: "New note",
})
button.addEventListener("click", addNote)
button.setAttribute("aria-keyshortcuts", ariaKeyshortcuts("mod+enter"))
button.querySelector("kbd")!.textContent = formatShortcut("mod+enter")

function disconnect() {
  unregister()
  button.removeEventListener("click", addNote)
}
```

Call `disconnect()` when removing this view. `registerShortcut` returns the function that unregisters it.

## Show the Keys

`formatShortcut` produces display text for the current platform. `ariaKeyshortcuts` produces the matching `aria-keyshortcuts` value. The example hides the visual hint from screen readers because the button already exposes the shortcut.

Format browser-specific hints after the page loads. Compare the original keys, not the formatted display text.

## While Someone Is Typing

Shortcuts with Command, Control, or Option can run in text fields. Plain letters and other keys stay available for typing. Set `allowInInput: true` when a shortcut should work there too, such as Escape to clear a search.

## Limit a Shortcut to an Area

A named `scope` runs only while it is enabled. This connection turns it on when the textarea has focus and clears it on cleanup:

```html
<textarea id="note" aria-label="Note"></textarea>
```

```ts
import { registerShortcut, shortcuts } from "@ui-sdk/web"

function connectNote(note: HTMLTextAreaElement) {
  const unregister = registerShortcut(
    "escape",
    () => {
      note.value = ""
    },
    {
      scope: "note",
      allowInInput: true,
    }
  )
  const events = new AbortController()
  note.addEventListener("focus", () => shortcuts.setScope("note", true), {
    signal: events.signal,
  })
  note.addEventListener("blur", () => shortcuts.setScope("note", false), {
    signal: events.signal,
  })
  shortcuts.setScope("note", document.activeElement === note)

  return () => {
    events.abort()
    shortcuts.setScope("note", false)
    unregister()
  }
}

const disconnect = connectNote(
  document.querySelector<HTMLTextAreaElement>("#note")!
)
```

Call `disconnect()` when removing the note. Scope names are shared, so choose one for each area you want to enable together. A `when` function can add a condition checked on each key press.

```ts title="scope.ts"
import { registerShortcut, shortcuts } from "@ui-sdk/web"

export function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <textarea aria-label="Note" placeholder="Write a note…"></textarea>
      <output data-slot="output">Focus the note to turn on its shortcuts.</output>
    </div>
  `
  const textarea = root.querySelector("textarea")!
  const output = root.querySelector("output")!
  textarea.addEventListener("focus", () => shortcuts.setScope("note", true))
  textarea.addEventListener("blur", () => shortcuts.setScope("note", false))

  const offs = [
    registerShortcut(
      "mod+enter",
      () =>
        (output.textContent = `Characters saved: ${textarea.value.trim().length}`),
      {
        scope: "note",
        when: () => textarea.value.trim() !== "",
        description: "Save the note",
      }
    ),
    registerShortcut(
      "escape",
      () => {
        textarea.value = ""
        output.textContent = "Cleared"
      },
      { scope: "note", allowInInput: true, description: "Clear the note" }
    ),
  ]
  return () => {
    offs.forEach((off) => off())
    shortcuts.setScope("note", false)
  }
}
```

Focus the note and type some text. Press Command+Enter on Mac or Control+Enter elsewhere to save, or Escape to clear it. Move focus outside the note to turn off its shortcuts.

## Inside a Popup

Page shortcuts pause while a modal is open. Pass `layer`, an element inside a popup or a function that returns one, to make a shortcut belong to that popup. It runs only while the popup is open, even though its closed content stays in the DOM.

When shortcuts share the same keys, the topmost open layer wins, then the most recently registered shortcut.

## List Available Shortcuts

Call `shortcuts.list()` when a help screen opens. It returns the shortcuts that can run now, including their `keys`, formatted `hint`, and `description`. Add descriptions when registering shortcuts so the help screen can explain each action.
