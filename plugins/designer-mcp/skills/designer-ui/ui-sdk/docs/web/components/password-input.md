# Password Input

Enter a password, show or hide it, and use it in a native form.

A Password Input is a native password field with a button that shows and hides what's typed. It keeps the caret in place, offers the right password to password managers, and hides the password again when its form submits.

```ts title="basic.ts"
import "@ui-sdk/web/password-input"
import "@ui-sdk/web/field"
import { createElement, Eye, EyeOff } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Password</ui-field-label>
      <ui-password-input name="password">
        <input />
        <ui-password-input-toggle>
          <button aria-label="Show password">
            ${createElement(Eye, { "aria-hidden": "true" }).outerHTML}
            ${createElement(EyeOff, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-password-input-toggle>
      </ui-password-input>
      <ui-field-description>Use at least 8 characters.</ui-field-description>
    </ui-field>
  `
}

export { mount }
```

Type a password, then choose Show password to reveal or hide it. Clicking the toggle keeps the caret in the field. With a keyboard, Tab to the toggle and press Space or Enter.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. Import the field too if you use it. On the server the import does nothing.

```ts
import "@ui-sdk/web/password-input"
import "@ui-sdk/web/field"
```

## Composition

Use the following composition to build a `ui-password-input`:

```text
ui-password-input
├── input
└── ui-password-input-toggle
    └── button
```

`ui-password-input` holds the value and visibility state. It connects to your native input and to the button inside `ui-password-input-toggle`. The toggle switches the input between `password` and `text`, and its button is a `type="button"`, so pressing Enter in the input still submits the form.

Put form options such as `name`, `form`, `required`, `disabled`, and `read-only` on `ui-password-input`. Put other native input attributes, such as `autocomplete`, `placeholder` or `id`, on the `<input>`.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/password-input"
</script>

<ui-password-input name="password">
  <input aria-label="Password" />
  <ui-password-input-toggle>
    <button aria-label="Show password">Show</button>
  </ui-password-input-toggle>
</ui-password-input>
```

## New Password

Use `autocomplete="new-password"` on the native input when creating or changing a password. It tells the browser and password manager which kind of password to offer. The default is `current-password` for signing in.

The example derives a checklist from the current value. Those rules belong to the example; the component does not impose a password policy.

```ts title="new-password.ts"
import "@ui-sdk/web/password-input"
import "@ui-sdk/web/field"
import { Check, createElement, Eye, EyeOff, X } from "lucide"

const rules = [
  {
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  { label: "A number", test: (password: string) => /\d/.test(password) },
  {
    label: "An uppercase and a lowercase letter",
    test: (password: string) =>
      /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Create a password</ui-field-label>
      <ui-password-input name="new-password">
        <input autocomplete="new-password" />
        <ui-password-input-toggle>
          <button aria-label="Show password">
            ${createElement(Eye, { "aria-hidden": "true" }).outerHTML}
            ${createElement(EyeOff, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-password-input-toggle>
      </ui-password-input>
      <ul data-slot="stack" aria-label="Password requirements">
        ${rules
          .map(
            (rule) => `
              <li data-slot="row">
                ${createElement(X, { "aria-hidden": "true" }).outerHTML}
                ${createElement(Check, { "aria-hidden": "true" }).outerHTML}
                <span data-slot="visually-hidden" data-rule-status>To do:</span>
                ${rule.label}
              </li>
            `
          )
          .join("")}
      </ul>
    </ui-field>
  `
  const items = root.querySelectorAll("li")
  root
    .querySelector("ui-password-input")!
    .addEventListener("valuechange", (event) => {
      rules.forEach((rule, index) => {
        const met = rule.test(event.detail.value)
        items[index].toggleAttribute("data-met", met)
        items[index].querySelector("[data-rule-status]")!.textContent = met
          ? "Done:"
          : "To do:"
      })
    })
}

export { mount }
```

Type a password and watch the checklist update. Try adding digits and both uppercase and lowercase letters, then toggle its visibility.

## Shown at First

Set `default-visible` to start with the text visible, and `default-value` for its initial value. This can be useful for a Wi-Fi password someone needs to read or copy.

```ts title="default-visible.ts"
import "@ui-sdk/web/password-input"
import "@ui-sdk/web/field"
import { createElement, Eye, EyeOff } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Wi-Fi password</ui-field-label>
      <ui-password-input name="wifi-password" default-visible default-value="maple-orbit-42">
        <input autocomplete="new-password" />
        <ui-password-input-toggle>
          <button aria-label="Show password">
            ${createElement(Eye, { "aria-hidden": "true" }).outerHTML}
            ${createElement(EyeOff, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-password-input-toggle>
      </ui-password-input>
      <ui-field-description>Guests read it from here, so it starts shown.</ui-field-description>
    </ui-field>
  `
}

export { mount }
```

Read the Wi-Fi password, then choose Show password to hide it. Choose it again to reveal the value.

## Caps Lock

Use `data-capslock` for a warning. It updates from key events while the input is focused. The example reserves space for the icon and warning.

```ts title="caps-lock.ts"
import "@ui-sdk/web/password-input"
import "@ui-sdk/web/field"
import { createElement, Eye, EyeOff, Lock } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Password</ui-field-label>
      <ui-password-input name="password">
        <input />
        ${createElement(Lock, { "aria-hidden": "true" }).outerHTML}
        <ui-password-input-toggle>
          <button aria-label="Show password">
            ${createElement(Eye, { "aria-hidden": "true" }).outerHTML}
            ${createElement(EyeOff, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-password-input-toggle>
      </ui-password-input>
      <p data-slot="caps-lock">Caps Lock is on.</p>
    </ui-field>
  `
}

export { mount }
```

Focus Password and press Caps Lock. The warning appears while Caps Lock is on. Turn it off or leave the field to hide the warning.

## Disabled

Set `disabled` on the root, its Field, or an enclosing fieldset to disable both the input and the toggle. The value is omitted from form submission.

```ts title="disabled.ts"
import "@ui-sdk/web/password-input"
import "@ui-sdk/web/field"
import { createElement, Eye, EyeOff } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field disabled>
      <ui-field-label>Password</ui-field-label>
      <ui-password-input name="password" default-value="hunter22">
        <input />
        <ui-password-input-toggle>
          <button aria-label="Show password">
            ${createElement(Eye, { "aria-hidden": "true" }).outerHTML}
            ${createElement(EyeOff, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-password-input-toggle>
      </ui-password-input>
      <ui-field-description>Your administrator manages this password.</ui-field-description>
    </ui-field>
  `
}

export { mount }
```

Try to edit Password or press its toggle. Both controls are disabled and are skipped by Tab.

## Read-Only

Set `read-only` when the value can be read but not edited. The input stays focusable, the toggle still works, and the value still participates in form submission.

```ts title="read-only.ts"
import "@ui-sdk/web/password-input"
import "@ui-sdk/web/field"
import { createElement, Eye, EyeOff } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Recovery key</ui-field-label>
      <ui-password-input name="recovery-key" read-only default-value="7Hq2-vX9p-Lm4c">
        <input autocomplete="off" />
        <ui-password-input-toggle>
          <button aria-label="Show recovery key">
            ${createElement(Eye, { "aria-hidden": "true" }).outerHTML}
            ${createElement(EyeOff, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-password-input-toggle>
      </ui-password-input>
      <ui-field-description>Keep it somewhere safe. You can show it, but not change it.</ui-field-description>
    </ui-field>
  `
}

export { mount }
```

Choose Show recovery key to read it. Try to type in the input; its value stays unchanged.

## Controlled Visibility

Listen for `visiblechange`, and set the element’s `visible` property when the app needs to change it. The [reason](#reasons) distinguishes a toggle press, form submission, reset, page hide, or a controller action.

```ts title="controlled.ts"
import "@ui-sdk/web/password-input"
import "@ui-sdk/web/field"
import { createElement, Eye, EyeOff } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-field>
      <ui-field-label>Password</ui-field-label>
      <ui-password-input name="password">
        <input />
        <ui-password-input-toggle>
          <button aria-label="Show password">
            ${createElement(Eye, { "aria-hidden": "true" }).outerHTML}
            ${createElement(EyeOff, { "aria-hidden": "true" }).outerHTML}
          </button>
        </ui-password-input-toggle>
      </ui-password-input>
    </ui-field>
  `
  root
    .querySelector("ui-password-input")!
    .addEventListener("visiblechange", (event) => {
      const { value, reason } = event.detail
      log(root, `${value ? "Shown" : "Hidden"} (${reason})`)
    })
}

export { mount }
```

Toggle Show password. The console logs each change and its reason.

Call `event.preventDefault()` in the change listener to reject a visibility change. During form submission, the native input is temporarily a password field even if the listener rejects hiding it.

## Controller

Use the element’s `api` for actions outside the input. You can also pass a controller created with `createPasswordInputController()`. Read or change the value, toggle visibility, or focus the input. Writes use the `imperative` reason.

```ts title="controller.ts"
import "@ui-sdk/web/password-input"
import "@ui-sdk/web/field"
import { createElement, Eye, EyeOff } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" data-action="suggest">Suggest</button>
        <button type="button" data-action="toggle">Toggle</button>
        <button type="button" data-action="clear">Clear</button>
        <button type="button" data-action="read">Read</button>
        <button type="button" data-action="focus">Focus</button>
      </div>
      <ui-field>
        <ui-field-label>New password</ui-field-label>
        <ui-password-input name="new-password">
          <input autocomplete="new-password" />
          <ui-password-input-toggle>
            <button aria-label="Show password">
              ${createElement(Eye, { "aria-hidden": "true" }).outerHTML}
              ${createElement(EyeOff, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-password-input-toggle>
        </ui-password-input>
      </ui-field>
    </div>
  `
  const password = root.querySelector("ui-password-input")!.api
  const actions: Record<string, () => void> = {
    suggest: () => {
      password.setValue("plum-kettle-orbit-42")
      password.setVisible(true)
    },
    toggle: () => password.toggleVisible(),
    clear: () => password.clear(),
    read: () =>
      log(
        root,
        `${password.getValue().length} characters, ${password.isVisible() ? "shown" : "hidden"}`
      ),
    focus: () => password.focus(),
  }
  root
    .querySelectorAll<HTMLButtonElement>("[data-action]")
    .forEach((button) => {
      button.addEventListener("click", () => actions[button.dataset.action!]())
    })
}

export { mount }
```

Choose Suggest to fill and reveal a sample value. Try Toggle, Read, Clear, and Focus to call each action from outside the field.

[Controllers](../controllers.md) covers how to create and share a controller.

## Forms

The native input participates in `FormData`, validation, and reset. Use `form` to associate it with a form elsewhere in the page, as this example does.

```ts title="form.ts"
import "@ui-sdk/web/password-input"
import "@ui-sdk/web/field"
import "@ui-sdk/web/input"
import { createElement, Eye, EyeOff } from "lucide"
import { log } from "./log"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <form data-slot="stack" id="sign-in">
        <ui-field name="email">
          <ui-field-label>Email</ui-field-label>
          <ui-input><input type="email" required autocomplete="username" /></ui-input>
        </ui-field>
      </form>
      <ui-field>
        <ui-field-label>Password</ui-field-label>
        <ui-password-input name="password" form="sign-in" required>
          <input />
          <ui-password-input-toggle>
            <button aria-label="Show password">
              ${createElement(Eye, { "aria-hidden": "true" }).outerHTML}
              ${createElement(EyeOff, { "aria-hidden": "true" }).outerHTML}
            </button>
          </ui-password-input-toggle>
        </ui-password-input>
      </ui-field>
      <div data-slot="row">
        <button type="submit" form="sign-in" data-variant="solid">Sign In</button>
        <button type="reset" form="sign-in">Reset</button>
      </div>
    </div>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const data = new FormData(form)
    const length = String(data.get("password")).length
    log(
      root,
      `Signed in as ${data.get("email")}, with a password of ${length} characters`
    )
  })
}

export { mount }
```

Enter an email and password, reveal the password, then press Enter in the field. Submission hides it again, and the console logs its length. Reset clears the form. Empty required fields block submission.

Submission, reset, and page hiding request that the password be hidden again. A reset also restores its default value. Spellcheck, autocorrection, and automatic capitalization stay disabled when the password is visible.

## Controlled Value

Listen for `valuechange` to read typed changes, and set the element’s `value` property to update it from your app. The [New Password example](#new-password) derives its checklist this way. [State and Events](../state-and-events.md) covers the shared state conventions.

```ts
const password = document.querySelector("ui-password-input")!
password.addEventListener("valuechange", (event) =>
  console.log(event.detail.value, event.detail.reason)
)
password.value = ""
```

## Custom Rendering

Elements have no render functions. The toggle wraps your own `<button>`, so put anything inside it, and read state from the data attributes every part sets: whether the password is shown (`data-visible`), whether Caps Lock is on (`data-capslock`), and whether the field is filled (`data-filled`). Here the button holds both icons, and the stylesheet shows the second one while `data-visible` is set.

```html
<ui-password-input-toggle>
  <button aria-label="Show password">
    <svg aria-hidden="true"><!-- eye --></svg>
    <svg aria-hidden="true"><!-- eye off --></svg>
  </button>
</ui-password-input-toggle>
```

## Styling

Style the root as the field's box, with the native input and the toggle inside it. `data-visible` marks every part while the password is shown, and the toggle also sets `aria-pressed`. Use `data-capslock` for a Caps Lock warning, and `data-filled`, `data-disabled` and `data-readonly` for the field's other states. Inside Field, the native input also receives validation attributes such as `data-invalid`. Use logical spacing so the field and toggle follow the surrounding direction.

Each part has a `data-slot`, such as `password-input-toggle`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### `<ui-password-input>`
`[data-slot="password-input"]`

- `data-visible`: Present while the password is shown, so the field is a text field.
- `data-filled`: Present while the field holds any text.
- `data-disabled`: Present when disabled, by its own prop, a Field or a `<fieldset>`.
- `data-readonly`: Present when the field is read-only.
- `data-required`: Present when a password is required.
- `data-capslock`: Present while Caps Lock is on and the field has focus.

### `<input>`
`[data-slot="password-input-control"]`

- `data-visible`: Present while the password is shown, so the field is a text field.
- `data-filled`: Present while the field holds any text.
- `data-disabled`: Present when disabled, by its own prop, a Field or a `<fieldset>`.
- `data-readonly`: Present when the field is read-only.
- `data-required`: Present when a password is required.
- `data-capslock`: Present while Caps Lock is on and the field has focus.

### `<ui-password-input-toggle>`
`[data-slot="password-input-toggle"]`

- `data-visible`: Present while the password is shown, so the field is a text field.
- `data-filled`: Present while the field holds any text.
- `data-disabled`: Present when disabled, by its own prop, a Field or a `<fieldset>`.
- `data-readonly`: Present when the field is read-only.
- `data-required`: Present when a password is required.
- `data-capslock`: Present while Caps Lock is on and the field has focus.

## API Reference

Props are attributes in kebab case, like `default-value`, `default-visible` and `read-only`. `autocomplete` and `id` are read from the `<input>`. `controller` is a property. Callbacks are DOM events.

### PasswordInput

- `value?` (`string`): The value, for a controlled field.
- `defaultValue?` (`string`): The value it starts with. A form reset returns here.
- `valuechange event`: Called when the user changes the value: typing (`"input-change"`), a Clear part (`"clear-press"`), a form reset (`"reset"`) or a controller (`"imperative"`). `details.cancel()` keeps the value as it was.
- `visible?` (`boolean`): Whether the password is shown. Pass it to control it.
- `defaultVisible?` (`boolean`): Whether the password is shown at first, when uncontrolled.
- `visiblechange event`: Runs when the password wants to be shown or hidden: the toggle (`"toggle-press"`), submitting or resetting its form (`"form-submit"`, `"reset"`), the page being hidden (`"page-hide"`) or a controller (`"imperative"`). `details.cancel()` keeps it as it was; the field is a password field while the browser reads a submitted form either way.
- `autoComplete?` (`"current-password" | "new-password" | "off" | (string & {})`): What the browser and password managers fill in: `"current-password"` for signing in, `"new-password"` for signing up or changing it.
- `name?` (`string`): The name the password submits under. Inside a Field, the Field's name.
- `form?` (`string`): The id of the form the field belongs to, when it isn't inside it.
- `required?` (`boolean`): Whether a password is required to submit the form.
- `disabled?` (`boolean`): Disables the field and the toggle. Inside a Field or a disabled `<fieldset>`, they follow it.
- `readOnly?` (`boolean`): Makes the field read-only. The toggle still shows and hides it.
- `controller?` (`object`): Reads, writes, shows and hides it from anywhere. Create one with `createPasswordInputController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

The same state shows as data attributes on each element.

- `visible` (`boolean`): Whether the password is shown.
- `capsLock` (`boolean`): Whether Caps Lock is on while the field has focus.
- `filled` (`boolean`): Whether the field holds any text.
- `disabled` (`boolean`): Whether the field is disabled, by itself, its Field or a `<fieldset>`.
- `readOnly` (`boolean`): Whether the field is read-only.
- `required` (`boolean`): Whether a form won't submit while the field is empty.

### Reasons

`event.detail.reason` says why the value changed. Autofill and a password manager's fill are `input-change`.

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `clear-press` (`MouseEvent | KeyboardEvent`): A Clear part was pressed, like on an input, a select or a combobox.
- `reset` (`none`): A form reset.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

And why the password was shown or hidden:

- `toggle-press` (`MouseEvent | KeyboardEvent`): A toggle was pressed: a password input's, which shows or hides the password, or a carousel's, which starts or stops rotation.
- `form-submit` (`SubmitEvent`): The form was submitted, which hides a shown password so the browser offers to save it.
- `reset` (`none`): A form reset.
- `page-hide` (`PageTransitionEvent`): The page was hidden, like when navigating away, which hides a shown password before the browser keeps the page.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods. The `value` and `visible` properties read and set the password and whether it's shown.

Every write method takes an optional `{ reason, event }`, and fires the change event like typing or a press. `setVisible()` and `toggleVisible()` return `false` when the change is canceled.

- `getValue()` (`() => string`): The current value.
- `setValue(value, options?)` (`(value: string, options?: ChangeOptions<InputValueChangeReason> | undefined) => boolean`): Sets the value as if the user typed it, so `input` fires. Returns false when the change was canceled or nothing changed.
- `clear(options?)` (`(options?: ChangeOptions<InputValueChangeReason> | undefined) => boolean`): Empties the field, as if the user deleted the text, so `input` fires. Returns false when the change was canceled or nothing changed.
- `isVisible()` (`() => boolean`): Whether the password is shown.
- `setVisible(visible, options?)` (`(visible: boolean, options?: ChangeOptions<PasswordInputVisibleChangeReason> | undefined) => boolean`): Shows or hides the password. Returns false when canceled.
- `toggleVisible(options?)` (`(options?: ChangeOptions<PasswordInputVisibleChangeReason> | undefined) => boolean`): Shows the password if it's hidden, and hides it if it's shown. Returns false when canceled.
- `focus()` (`() => void`): Moves focus to the field.

### Events

Events fire on their own element and don't bubble, with the new value in `event.detail.value` and the `reason`, `event` and `source` beside it. Calling `preventDefault()` cancels the change.

| Member                | On                  | Description                                                        |
| --------------------- | ------------------- | ------------------------------------------------------------------ |
| `value` property      | `ui-password-input` | The password                                                       |
| `visible` property    | `ui-password-input` | Whether the password is shown                                      |
| `api` property        | `ui-password-input` | The [controller](#controller)                                      |
| `controller` property | `ui-password-input` | A controller from `createPasswordInputController()`, to drive it   |
| `valuechange` event   | `ui-password-input` | `detail: { value, reason, event, source }`, on every change        |
| `visiblechange` event | `ui-password-input` | `detail: { value, reason, event, source }`, when it shows or hides |

## Accessibility

There's no WAI-ARIA pattern for a password field. The input stays a native password field named by its Field label or an `aria-label`, and the toggle follows the [WAI-ARIA button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) as a toggle button. Name the toggle's button by what it does, such as “Show password”, and keep that name the same: its `aria-pressed` state tells screen readers whether the password is shown, and `aria-controls` points to the input.

### Keyboard

Tab moves from the input to the toggle, and Space or Enter on the toggle shows or hides the password. Enter in the input submits its form; it never presses the toggle.

### Focus

A pointer press on the toggle keeps focus in the input, with the caret and selection where they were. A press from elsewhere brings focus back to the input. A keyboard press keeps focus on the toggle.

### Tested Behavior

Every line below is an automated test.

- The field is a password field named by its label and described by its description.
- The toggle is a button that says what it does, and isn't pressed.
- Pressing the toggle shows the password, and pressing it again hides it.
- Space on the focused toggle shows the password and keeps focus on the toggle.
- Enter on the focused toggle shows the password and keeps focus on the toggle.
- The toggle keeps its name when the password shows.
- Enter in the field submits the form, and never presses the toggle.
- The password submits under its name.
- The password can start shown.
- A change can be canceled.
- A disabled password input disables the field and the toggle.
- A read-only field can still be shown.
- The controller shows and hides the password.
- A controlled password input follows its owner. React and Vue only.
- A click with no pointer behind it, like a screen reader's, shows the password.

Runs in React, Vue and web components.

Beyond the pattern:

- Showing the password keeps focus in the field, with the caret where it was.
- Showing and hiding the password keeps the selection.
- A click on the toggle while typing never blurs the field.
- A click on the toggle from elsewhere brings focus back to the field.
- Submitting hides a shown password before the page's own submit handler runs.
- Submitting hides the password even when the change is canceled, while the browser reads the form.
- Resetting the form hides the password.
- Hiding the page hides the password, so the browser never keeps it as text.
- A shown password is never spellchecked, autocorrected or capitalized.
- The field asks password managers for the current password, or a new one.
- Caps Lock marks the input while the field has focus.
- A click into the field with Caps Lock on shows the warning before any key.
- A web field keeps an autocomplete changed after it connects. Web components only.
- The toggle has its own id and controls the field.
- A disabled fieldset disables the toggle too.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while showing and hiding a password with a keyboard.

Runs in React, Vue and web components.

Also tested:

- No axe violations at rest.
- No axe violations with the password shown.
- No axe violations while disabled.
- No axe violations while read-only.
- The field is named by its label, and the toggle by its aria-label.
- Accessibility tree.

Runs in React, Vue and web components.
