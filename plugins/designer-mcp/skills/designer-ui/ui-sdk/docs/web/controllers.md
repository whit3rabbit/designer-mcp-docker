# Controllers

Read and change a component from outside its parts.

An upgraded element exposes its controller as `api`. Use it when an action that changes the component lives somewhere else.

## Use the Element's Controller

```html
<button id="toggle-bold">Toggle Bold</button>
<ui-toggle id="bold"><button>Bold</button></ui-toggle>
```

```ts
import "@ui-sdk/web/toggle"

await customElements.whenDefined("ui-toggle")
const toggle = document.querySelector("ui-toggle")!
document
  .querySelector("#toggle-bold")!
  .addEventListener("click", () => toggle.api.toggle())
```

Controller methods run the same change events as user input, including cancellation. Each component lists its methods, such as `open()`, `close()`, `setValue()`, or `focus()`.

You can also create a controller with the component's entry, such as `createPopoverController()` from `@ui-sdk/web/popover`, and assign it to a root's `controller` property. Before the element connects, its methods do nothing and return `undefined`. Once it's in the page, they run right away.

## Share a Popup

An external trigger names its root with `for`. Several triggers can open the same popup:

```ts
import "@ui-sdk/web/popover"
```

```html
<ui-popover-trigger for="editor"
  ><button>Edit Notes</button></ui-popover-trigger
>
<ui-popover-trigger for="editor"
  ><button>Edit Tasks</button></ui-popover-trigger
>
<ui-popover id="editor">
  <ui-popover-content>
    <ui-popover-title>Edit Item</ui-popover-title>
    <ui-popover-close><button>Done</button></ui-popover-close>
  </ui-popover-content>
</ui-popover>
```

To distinguish the item, assign a trigger's `payload` property before inserting it into the page. The root emits `payloadchange` with that payload in `event.detail.value`.

## Wait for a Popup to Close

`open()` returns a promise that settles when the popup closes:

```ts
import "@ui-sdk/web/popover"

await customElements.whenDefined("ui-popover")
const editor = document.querySelector("ui-popover")!
const result = await editor.api.open({ payload: "Notes" })
console.log(result.reason, result.returnValue)
```

For confirmations, [Alert Dialog](./components/alert-dialog.md) provides `createConfirm()`, which gives you a function you can await.
