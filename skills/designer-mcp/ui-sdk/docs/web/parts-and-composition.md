# Parts and Composition

Put a component's parts together and choose the elements they bind.

A component is a set of custom elements. A Popover has a root to hold its state, a trigger to open it, and content to show.

## Put Parts Together

Import the component, then nest its parts as shown in its Composition:

```ts
import "@ui-sdk/web/popover"
```

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

Triggers and Close parts wrap your own `<button>`. These wrappers use `display: contents`, so the button participates in layout directly.

Parts find their root by looking up the DOM. You can put your own layout elements between them. An external part can name its root with `for="id"`; [Controllers](./controllers.md) shows an example.

## Choose the Element

Use `as-child` when the part should bind to its first child. For example, render a menu item as a link:

```ts
import "@ui-sdk/web/menu"
```

```html
<ui-menu>
  <ui-menu-trigger><button>Account</button></ui-menu-trigger>
  <ui-menu-content>
    <ui-menu-item as-child><a href="/settings">Settings</a></ui-menu-item>
  </ui-menu-content>
</ui-menu>
```

The link receives the part's role, attributes, and keyboard behavior. Triggers and Close parts already use their first button or link, so they don't need `as-child`.

## Name the Control

Use a label or title part, such as `<ui-field-label>` or `<ui-dialog-title>`. For an icon button, put `aria-label` on the native button inside its wrapper.

Parts write the attributes they manage, including roles, IDs, and ARIA state. Other attributes and your own listeners remain. So does a name or typing hint you write on the element: `aria-label`, `aria-labelledby`, `aria-description`, `title`, `autocomplete`, `autocapitalize`, `autocorrect`, `inputmode` and `spellcheck`. Keep those managed attributes intact when changing the markup.

## Respond to State

Use data attributes for styling and DOM events for changes to content. [State and Events](./state-and-events.md) shows how to listen and cancel a change.
