# Rendering Primitives

Turn a Core primitive into custom elements with createParts.

This page renders the rating from [Compose Behaviors](./core.md#compose-behaviors). Start with that guide's [complete `rating.ts`](./core.md#complete-primitive): it already handles selection, arrow keys, and focus. Here we'll connect its `root` and `star` slots to custom elements.

## Define the Elements

`createParts` registers one custom element for each slot you map. Save this beside `rating.ts`:

```ts title="rating-web.ts"
import { createParts, wrappedButton } from "@ui-sdk/web"
import { rating } from "./rating"

createParts(rating, {
  root: "my-rating",
  star: { tag: "my-rating-star", target: wrappedButton, display: "contents" },
})
```

The root creates the primitive instance. Each star finds that instance through the root above it. `wrappedButton` puts the star's behavior and attributes on a native button inside the custom element.

`createParts` also returns the element classes, named like the parts in other frameworks: `Root` and `Star`. Keep them with `const parts = createParts(rating, { ... })` to check an element, like `element instanceof parts.Star`. On the server nothing is registered, so they're `undefined`.

## Render the Rating

Load `rating-web.ts` from your app's module entry, then use the registered tags:

```html
<my-rating default-value="4" aria-label="Rating">
  <my-rating-star value="1"
    ><button aria-label="1 star">★</button></my-rating-star
  >
  <my-rating-star value="2"
    ><button aria-label="2 stars">★</button></my-rating-star
  >
  <my-rating-star value="3"
    ><button aria-label="3 stars">★</button></my-rating-star
  >
  <my-rating-star value="4"
    ><button aria-label="4 stars">★</button></my-rating-star
  >
  <my-rating-star value="5"
    ><button aria-label="5 stars">★</button></my-rating-star
  >
</my-rating>
```

The primitive's schema parses `default-value` as a number and each star's `value` as a string. Put the star's accessible label and styles on its button. The button receives `data-filled` when it contributes to the rating.

[Styling and Animation](./styling-and-animation.md) covers styling those attributes. The native buttons remain in the HTML before the elements upgrade; their rating behavior starts when the module loads.

## Listen to Changes

The primitive's `onValueChange` callback becomes a `valuechange` event on the root:

```ts
import "./rating-web"

const element = document.querySelector("my-rating")!
element.addEventListener("valuechange", (event) => {
  const { value } = (event as CustomEvent<{ value: number }>).detail
  console.log(`Rating: ${value}`)
})
```

Call `event.preventDefault()` to cancel a change. These events don't bubble, so listen on the root itself. [State and Events](./state-and-events.md) explains the details and controlled values.

## Add Logic to a Part

[Custom Parts](./custom-parts.md) builds on these same elements: choose a part's binding target, and expose API methods or live properties.
