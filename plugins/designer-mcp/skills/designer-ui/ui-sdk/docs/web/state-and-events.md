# State and Events

Set initial state, change properties, and respond to DOM events.

Set the starting state in HTML. Read and change it through the element's properties once it has upgraded.

## Set the Starting Value

```ts
import "@ui-sdk/web/toggle"
```

```html
<ui-toggle default-pressed><button type="button">Bold</button></ui-toggle>
```

The attribute depends on the component: `default-pressed`, `default-checked`, `default-open`, or `default-value`. Leave a boolean attribute out to turn its option off. An option that's on by default, like `loop`, turns off with `"false"`. `disabled` and `required` work like they do on native controls: written at all, even as `"false"`, they're on.

## Change a Value from Script

On a page with the toggle above, read or set its live `pressed` property:

```ts
import "@ui-sdk/web/toggle"

await customElements.whenDefined("ui-toggle")
const toggle = document.querySelector("ui-toggle")!
toggle.pressed = true
console.log(toggle.pressed)
```

Other elements expose `open`, `checked`, or `value`. These are live properties, not React-style controlled props. Changing an attribute such as `pressed` also updates state.

Setting a property or attribute fires no event, like setting a native input's `value`. So a page that renders the state back into the element never hears its own write. Changes from the person using it, from the element's `api`, or from an agent fire events.

## Change an Option from Script

Options have properties too. On the same toggle, changing `disabled` also updates its attribute:

```ts
import "@ui-sdk/web/toggle"

const toggle = document.querySelector("ui-toggle")!
toggle.disabled = true
```

The button is now disabled, and `<ui-toggle>` has a `disabled` attribute. Set the property to `false` to remove it.

Other option types follow the same pattern:

| Option Type             | Property and Attribute                                   |
| ----------------------- | -------------------------------------------------------- |
| Boolean, off by default | `disabled = true` adds `disabled`; `false` removes it.   |
| Boolean, on by default  | `loop = false` writes `loop="false"`.                    |
| Text or number          | Reads back as the same type, or `undefined` when absent. |
| List                    | Reads as an array; the attribute is comma-separated.     |

Options an attribute cannot hold, such as a data menu’s `items`, are properties only.

## Respond to a Change

Callbacks become lowercase DOM events, such as `pressedchange` and `openchange`. Each one fires on the element whose state changed and doesn't bubble, like `toggle` on `<details>`. Its `detail` holds the requested value and the change details:

| Detail   | What It Tells You                                                           |
| -------- | --------------------------------------------------------------------------- |
| `value`  | The requested value.                                                        |
| `reason` | What requested the change, such as `press` or `outside-press`.              |
| `event`  | The DOM event behind the change, when there is one.                         |
| `source` | `keyboard`, `mouse`, `touch`, `pen`, `virtual`, `programmatic`, or `agent`. |

Call `event.preventDefault()` to cancel the change. This example keeps the popover open when someone clicks outside:

```html
<ui-popover id="details">
  <ui-popover-trigger><button>Details</button></ui-popover-trigger>
  <ui-popover-content>
    <ui-popover-title>Project Details</ui-popover-title>
    <p>Last updated today.</p>
    <ui-popover-close><button>Done</button></ui-popover-close>
  </ui-popover-content>
</ui-popover>
```

```ts
import "@ui-sdk/web/popover"

const popover = document.querySelector("ui-popover")!
popover.addEventListener("openchange", (event) => {
  if (!event.detail.value && event.detail.reason === "outside-press") {
    event.preventDefault()
  }
})
```

The Done button still closes it.

### Listen to Many Elements at Once

Since events don't bubble, a dialog only hears its own `openchange`, never the one from an alert dialog inside it. To hear every element inside a container with one listener, listen in the capture phase. `event.target` is the element that changed:

```html
<div id="formatting">
  <ui-toggle><button type="button">Bold</button></ui-toggle>
  <ui-toggle><button type="button">Italic</button></ui-toggle>
</div>
<output id="last-change"></output>
```

```ts
import "@ui-sdk/web/toggle"

const toolbar = document.querySelector("#formatting")!
const output = document.querySelector("#last-change")!

toolbar.addEventListener(
  "pressedchange",
  (event) => {
    if (event instanceof CustomEvent && event.target instanceof HTMLElement) {
      output.textContent = `${event.target.textContent}: ${event.detail.value}`
    }
  },
  { capture: true }
)
```

## Empty and Multiple Values

Select, Tabs, and Radio Group report `null` when nothing is selected. A multiple Select or Combobox uses an array. Accordion and Toggle Group always use arrays. In attributes, lists are comma-separated, such as `default-value="bold,italic"`.

Add `debug` to a root to log changes while you work. [Controllers](./controllers.md) covers changing state from elsewhere.

## Move an Element

An element keeps its state when you move it, like a native `<details>` keeps `open`. Take it off the page and put it back later, like a view your router keeps, and it picks up where it was: the same tab selected, the same value.
