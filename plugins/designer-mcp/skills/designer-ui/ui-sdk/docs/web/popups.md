# Popups

Place popup content, control dismissal, and choose its container.

Popovers, menus, selects, and dialogs use the browser's top layer. They render in place, above the page, so you don't need a portal or Positioner part. Their events bubble through the elements around them like any other child's, so a click handler or a link wrapped around a popup also gets the clicks inside it. Keep popups outside clickable cards and links.

## Place the Content

```ts
import "@ui-sdk/web/popover"
```

```html
<ui-popover id="details">
  <ui-popover-trigger><button>Details</button></ui-popover-trigger>
  <ui-popover-content side="bottom" align="start" side-offset="8">
    <ui-popover-title>Project Details</ui-popover-title>
    <p>Last updated today.</p>
    <ui-popover-close><button>Done</button></ui-popover-close>
  </ui-popover-content>
</ui-popover>
```

The popup flips or shifts when there isn't enough room.

| Attribute           | What It Does                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| `side`              | Chooses `top`, `bottom`, `left`, `right`, `start`, or `end`. Start and end follow reading direction. |
| `align`             | Aligns to the start, center, or end of that side.                                                    |
| `side-offset`       | Sets the gap from the anchor, in pixels.                                                             |
| `align-offset`      | Shifts it along its side.                                                                            |
| `collision-padding` | Leaves space from the window's edges.                                                                |

`anchor` accepts a selector for another element. For a point or rectangle, pass an anchor to the controller's `open()` method.

## Control Dismissal

Set `dismissible="false"` on the root to stop Escape, outside presses, focus leaving, Back, and sheet swipes from closing it. The trigger, Close part, and controller can still close it.

The `dismissattempt` event reports refused dismissals through `event.detail.reason`. [State and Events](./state-and-events.md) shows how to cancel just one reason.

## Modals and Sheets

`modal="true"` makes the rest of the page inert and locks scrolling. Each component documents its default.

Menu, Select, Combobox, Autocomplete, Popover, and Dialog support `presentation="auto"` to become a sheet on small touch screens. Use `presentation="sheet"` to always show a sheet.

## Focus

Dialogs, alert dialogs, drawers, and popovers move focus into their content when they open. Where it lands depends on how they opened:

| Opened With                                  | Focus Goes To                                                |
| -------------------------------------------- | ------------------------------------------------------------ |
| Keyboard, screen reader, mouse, pen, or code | The element `initial-focus` picks.                           |
| Touch                                        | The content itself, so no on-screen keyboard appears.        |
| Hover                                        | Nowhere. Focus stays where it is.                            |
| Rendered open                                | Nowhere, except in a dialog, which takes focus as it mounts. |

`initial-focus` defaults to `auto`: the first focusable element, or the content when it has none. A dialog tries an element with `autofocus` first, and an alert dialog tries its first Close part. Set it to `content` to focus the content itself, `none` to leave focus alone, or a CSS selector.

`modal` decides whether Tab can leave. With `modal="true"` or `modal="trap-focus"`, Tab and Shift+Tab wrap inside the content. With `modal="false"`, Tab moves from the trigger into a popover and on to the page after it, and focus leaving closes the popover. A non-modal dialog stays open.

When a popup closes while focus is inside it, focus returns to the trigger. If the trigger is gone or can't take focus, focus goes to the element focused before the popup opened, then where the popup it was opened from would return focus, then to the nearest focusable element after where the trigger was. A popup a controller opened returns to the element focused before it first. Set `final-focus` to `none` to leave focus alone, or to a selector to send it somewhere else. Closing because focus moved away never moves it back, and neither does pressing something focusable outside a non-modal popup.

Menus, selects, and comboboxes handle focus within their own lists, and tooltips never move it. Each component's page covers its own.

## Hidden Content and Containers

Closed content stays in your markup, hidden. The `openchangecomplete` event fires after opening or closing finishes, including animations. `keep-mounted` is available for animation libraries that need the closed element rendered.

`container` takes a selector for the element to render into, looked up in the popup's own tree, so a popup in a shadow root finds it in that shadow root. Inside an iframe, a popup handles focus, Escape, and scroll locking in the iframe's own document. Keep a dialog containing a form outside a surrounding form, or move its content with `container`, to avoid nested forms.

[Styling and Animation](./styling-and-animation.md) covers transitions.

## Toasts and Confirms

Place `<ui-overlay-host>` near your app's root, then call `toast()` from an event handler:

```html
<ui-overlay-host></ui-overlay-host> <button id="save">Save</button>
```

```ts
import "@ui-sdk/web/overlays"
import { toast } from "@ui-sdk/web"

document
  .querySelector("#save")!
  .addEventListener("click", () => toast.success("Saved"))
```

See [Toast](./components/toast.md) and [Alert Dialog](./components/alert-dialog.md) for complete examples.
