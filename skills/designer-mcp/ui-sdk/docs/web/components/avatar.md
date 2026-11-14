# Avatar

Show an image with a fallback while it loads or if it fails.

Use an Avatar for a person or a team, like in a comment, a member list or an account menu. It shows initials or an icon until the image loads, and keeps showing them if the image fails.

```ts title="basic.ts"
import "@ui-sdk/web/avatar"

const person = {
  name: "shadcn",
  src: "https://github.com/shadcn.png",
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="row">
      <ui-avatar>
        <img src="${person.src}" alt="${person.name}" />
        <ui-avatar-fallback><span aria-hidden="true">CN</span><span data-slot="visually-hidden">shadcn</span></ui-avatar-fallback>
      </ui-avatar>
    </div>
  `
}

export { mount }
```

The image replaces the initials once it loads. A screen reader can read the person's name in either state.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its elements. On the server the import does nothing.

```ts
import "@ui-sdk/web/avatar"
```

## Composition

Use the following composition to build a `ui-avatar`:

```text
ui-avatar
├── img
└── ui-avatar-fallback
```

- `ui-avatar` shares the image's loading state with its parts.
- A direct-child `img` supplies the image. There is no image custom element.
- `ui-avatar-fallback` shows when no image is loaded.

The image is a real `img`, including in server markup. The browser can start fetching it before the elements upgrade. The fallback stays visible until the image loads; if loading fails, the fallback remains.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/avatar"
</script>

<ui-avatar>
  <img src="/ada.png" alt="Ada Lovelace" />
  <ui-avatar-fallback>AL</ui-avatar-fallback>
</ui-avatar>
```

## Build Your Own

`@ui-sdk/web/avatar` comes with ready-made `ui-avatar` elements. If you'd like to build your own, with your own element names, start from the `avatar` primitive in `@ui-sdk/core`:

```ts title="user-photo-elements.ts"
import { avatar } from "@ui-sdk/core/avatar"
import { createParts } from "@ui-sdk/web"

createParts(avatar, {
  root: {
    tag: "user-photo",
    children: { image: (el) => el.querySelector(":scope > img") },
    optionalChildren: ["image"],
  },
  fallback: "user-photo-initials",
})
```

```html
<user-photo>
  <img src="https://github.com/shadcn.png" alt="shadcn" />
  <user-photo-initials>CN</user-photo-initials>
</user-photo>
```

These are the same parts the ready-made elements are made of, with your names. See [Rendering](../rendering.md) and [Custom Rendering](#custom-rendering) for more.

## Fallback Delay

<span id="behavior-and-options" />

Set `delay` on the fallback to wait before showing it. This avoids flashing initials when an image loads quickly. Without a delay, the fallback appears immediately, including on the server.

```html
<ui-avatar>
  <img src="https://github.com/shadcn.png" alt="shadcn" />
  <ui-avatar-fallback delay="600">CN</ui-avatar-fallback>
</ui-avatar>
```

## Image Attributes

Pass image attributes such as `srcset`, `crossorigin`, and `referrerpolicy` to the image. They work on the same `img` the browser loads. For avatars farther down a page, use `loading="lazy"`.

```html
<ui-avatar>
  <img
    src="https://github.com/shadcn.png"
    srcset="
      https://github.com/shadcn.png?size=80  1x,
      https://github.com/shadcn.png?size=160 2x
    "
    alt="shadcn"
    crossorigin="anonymous"
    referrerpolicy="no-referrer"
    loading="lazy"
  />
  <ui-avatar-fallback>CN</ui-avatar-fallback>
</ui-avatar>
```

<span id="render-functions" />

## Interactive Avatar

Use a button when clicking an avatar performs an action. Give it an accessible name that stays available while the image loads.

```html
<button type="button" aria-label="shadcn">
  <ui-avatar>
    <img src="https://github.com/shadcn.png" alt="" />
    <ui-avatar-fallback aria-hidden="true">CN</ui-avatar-fallback>
  </ui-avatar>
</button>
```

The `img` has to stay a direct child of `ui-avatar`, so put the avatar inside the button instead of binding the button with `as-child`.

## Loading Status

Listen for `loadingstatuschange` on `ui-avatar`. The event detail contains the new status in `value` and the change details beside it. The possible statuses are `loading`, `loaded`, `error`, and `idle`.

```ts
const avatar = document.querySelector("ui-avatar")!

avatar.addEventListener("loadingstatuschange", (event) => {
  if (event.detail.value === "error") reportBrokenImage(event.detail.reason)
})
```

When you replace a loaded image, the browser keeps it visible while the next source loads. A failed replacement shows the fallback. The change details explain why the status changed; see [Reasons](#reasons).

## Custom Rendering

Use [Parts and Composition](../parts-and-composition.md) to choose the elements parts bind. Every part shows the loading status, and `ui-avatar` reports each change, so the fallback can say something different when the image fails:

```ts
const avatar = document.querySelector("ui-avatar")!
const fallback = avatar.querySelector("ui-avatar-fallback")!

avatar.addEventListener("loadingstatuschange", (event) => {
  fallback.textContent = event.detail.value === "error" ? "?" : user.initials
})
```

## Styling

Set the root's size and let the image and fallback fill it. The image manages its own hidden styles until it loads; keep those styles intact when changing its element.

Each part has a `data-slot`, such as `avatar-fallback`, and shows the loading status through the attributes listed under [Data Attributes](#data-attributes).

## Data Attributes

### `<ui-avatar>`
`[data-slot="avatar"]`

- `data-loading-status` (`idle`, `loading`, `loaded`, `error`): Where the image is: no image yet, loading, loaded, or failed.

### `<img>`
`[data-slot="avatar-image"]`

- `data-loading-status` (`idle`, `loading`, `loaded`, `error`): Where the image is: no image yet, loading, loaded, or failed.

### `<ui-avatar-fallback>`
`[data-slot="avatar-fallback"]`

- `data-loading-status` (`idle`, `loading`, `loaded`, `error`): Where the image is: no image yet, loading, loaded, or failed.

## API Reference

Props are attributes in kebab case, like `delay` on `<ui-avatar-fallback>`. Callbacks are DOM events.

### Avatar

- `loadingstatuschange event`: Runs when the image's loading status changes: `"loading"` when it gets a source, `"loaded"`, `"error"`, and `"idle"` when it leaves the page. `details.reason` says why, and `details.event` is the image's `load` or `error` event, or undefined when the status was known at once, like for a cached image.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### AvatarImage

The image. A real `img`, a direct child of `ui-avatar`, so the browser can fetch it before the elements upgrade, with its own attributes, such as `srcset`, `crossorigin` and `referrerpolicy`.

### AvatarFallback

- `delay?` (`number`): How long to wait, in milliseconds, before showing the fallback, so a fast image appears without the fallback flashing first. Without one, the fallback shows at once, server markup included.

### State

The same state shows as data attributes on each element.

- `loadingStatus` (`AvatarLoadingStatus`): Where the image is: `"idle"`, `"loading"`, `"loaded"` or `"error"`.

### Reasons

`event.detail.reason` says why the status changed.

- `image-load` (`Event | undefined`): An image loaded. No event when it was already in the browser's cache.
- `image-error` (`Event | undefined`): An image failed to load, or has no source. No event when that was known at once.
- `src-change` (`none`): An image got a new source, or left the page, so its status starts over.

### Events

Events fire on their own element and don't bubble, with the status in `event.detail.value` and the `reason` and `event` beside it.

| Member                      | On                   | Description                                                   |
| --------------------------- | -------------------- | ------------------------------------------------------------- |
| `loadingstatuschange` event | `ui-avatar`          | `detail: { value, reason, event }`, when the status changes   |
| `delay` attribute           | `ui-avatar-fallback` | How long to wait before showing the fallback, in milliseconds |
| `debug` attribute           | `ui-avatar`          | Logs every status change with its reason                      |

## Accessibility

Give the image meaningful `alt` text. Include the person's name in the fallback too, using visually hidden text if you only want to show initials.

When a visible name beside the avatar already identifies the person, use an empty `alt` and hide decorative fallback content from screen readers.

- An image that loads replaces the fallback.
- An image that fails keeps the fallback.
- An avatar without an image shows its fallback.
- A fallback with a delay waits before showing.
- The image's loading status is reported.
- Removing the image brings the fallback back.
- A new source shows its image once it loads.
- The image is fetched with its own referrer policy.
- A cached image doesn't flash the fallback when the avatar mounts again.
- A new source keeps showing the previous image until it loads.
- The image is fetched once, even when it can't be cached.

Runs in React, Vue and web components.
