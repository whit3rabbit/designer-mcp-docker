# Custom Parts

Choose a binding target and expose the state of a custom element.

Start with the rating elements from [Rendering Primitives](./rendering.md). Add configuration to `createParts` when you need a different target or a public API.

## Choose the Target

By default, a part binds to its custom element. `target` chooses a child instead. `wrappedButton` finds a button or link; `wrappedChild("input")` finds an input.

Bind to the native element that should own focus and keyboard behavior. Put its label and classes on that element too.

## Expose API Methods

The rating primitive has a `rate` method. Add it to the root's `api` list to let application code call it:

```ts title="rating-web.ts"
import { createParts, wrappedButton } from "@ui-sdk/web"
import { rating } from "./rating"

createParts(rating, {
  root: { tag: "my-rating", api: ["rate"] },
  star: { tag: "my-rating-star", target: wrappedButton, display: "contents" },
})
```

Use this definition instead of the earlier one. Once the root is connected, `element.api.rate(3)` asks the primitive to change its value. Its callback and cancellation still apply. The element exposes only the methods you list.

## Expose a Live Property

A `state` mapping exposes a live getter and setter. Both call the primitive's API, so the primitive needs methods for reading and writing that value. The rating above only has `rate`; the built-in toggle has both `isPressed` and `setPressed`:

```ts
import { toggle } from "@ui-sdk/core/toggle"
import { createParts, wrappedButton } from "@ui-sdk/web"

createParts(toggle, {
  root: {
    tag: "my-toggle",
    target: wrappedButton,
    display: "contents",
    state: {
      pressed: {
        get: (api) => api.isPressed(),
        set: (api, value: boolean) => api.setPressed(value),
      },
    },
    api: ["isPressed", "setPressed", "toggle"],
  },
})
```

```html
<my-toggle><button>Bold</button></my-toggle>
```

The setter calls the primitive's API, so change callbacks and cancellation still apply. The `api` list exposes those methods on the element's controller.

## Attributes and Properties

The primitive's schema supplies the default conversion:

| Kind                          | How It Reaches the Primitive                                   |
| ----------------------------- | -------------------------------------------------------------- |
| `string`, `number`, `boolean` | Parsed from an attribute.                                      |
| `list`                        | A comma-separated attribute.                                   |
| `value`                       | A JavaScript property, for objects and other rich values.      |
| `callback`                    | A DOM event.                                                   |
| `action`                      | A DOM event with `detail.waitUntil(promise)` for pending work. |

A boolean attribute is on when present, unless its value is `"false"`. Defaults determine the value when the attribute is absent. `disabled` and `required` follow native controls, which treat them as on whenever present.

Each attribute gets a property that reflects it. Name the booleans that are on by default in `defaults`, so their properties read `true` without the attribute and `false` writes `"false"`:

```ts
import { tabs } from "@ui-sdk/core/tabs"
import { createParts, wrappedButton } from "@ui-sdk/web"

createParts(tabs, {
  root: { tag: "my-tabs", defaults: { loop: true } },
  list: "my-tabs-list",
  tab: { tag: "my-tabs-tab", target: wrappedButton },
  panel: "my-tabs-panel",
})
```

Use `kinds` to override a schema kind for an element and `properties` to add properties absent from the schema. `context(el)` on a child part can supply slot props from surrounding markup; explicit attributes and properties take precedence.

## Compose a Popup

A custom root can contain `ui-popover` or `ui-dialog`. Keep its `open` property in sync with your primitive and listen for `openchange`. That event doesn't bubble, so a listener on your root hears only the change you forward. [Compose Ours](./core.md#compose-ours) shows the pattern.
