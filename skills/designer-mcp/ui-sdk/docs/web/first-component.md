# First Component

Add a component to your page and style its state.

Let's add a Bookmark toggle. Press it once to turn it on, then again to turn it off.

If you haven't installed the packages yet, start with [Installation](./installation.md).

This example uses a bundler that resolves package imports and compiles TypeScript, such as Vite. Keep `index.html` and `bookmark-button.ts` in the same folder.

## Register the Component

Create `bookmark-button.ts` and import the toggle entry:

```ts title="bookmark-button.ts"
import "@ui-sdk/web/toggle"
```

Importing the toggle entry registers `<ui-toggle>`. The custom element manages the wrapped button's pressed state and sets `aria-pressed` for screen readers. The native button handles Enter and Space.

## Use It on Your Page

Add this markup to `index.html`:

```html title="index.html"
<ui-toggle id="bookmark">
  <button type="button">Bookmark</button>
</ui-toggle>

<script type="module" src="./bookmark-button.ts"></script>
```

Open your page. You should see a button labeled Bookmark. Next, add styles so you can tell when it is pressed.

## Add Styles

When the toggle is pressed, its button has a `data-pressed` attribute. Style the button inside `<ui-toggle>`.

With Tailwind CSS configured in your app, add utility classes to the button. The `data-pressed:` variant applies while the toggle is pressed:

```html title="index.html"
<ui-toggle id="bookmark">
  <button
    type="button"
    class="inline-flex h-8 items-center rounded-md border border-neutral-300 px-3 text-sm font-medium hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 data-pressed:bg-neutral-900 data-pressed:text-white"
  >
    Bookmark
  </button>
</ui-toggle>

<script type="module" src="./bookmark-button.ts"></script>
```

Keep the component import in `bookmark-button.ts`:

```ts title="bookmark-button.ts"
import "@ui-sdk/web/toggle"
```

Try the styled toggle:

```ts title="first-component.ts"
import "@ui-sdk/web/toggle"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-toggle>
      <button type="button" data-variant="outline">
        Bookmark
      </button>
    </ui-toggle>
  `
}

export { mount }
```

Click Bookmark to turn it on or off. A filled background means it is on. You can also focus the button with Tab and press Enter or Space.

Keep the label the same in both states. `aria-pressed` tells a screen reader whether the toggle is on.

## Keep Going

- [Toggle](./components/toggle.md) covers disabled states, controlled state, and groups of toggles.
- [Components](./README.md) lists the other components you can add with the same install.
- [Parts and Composition](./parts-and-composition.md) shows how to put a component with several parts together.
- [State and Events](./state-and-events.md) shows how to read changes and control state from your app.
- [Styling and Animation](./styling-and-animation.md) covers state attributes, CSS variables, and transitions.
