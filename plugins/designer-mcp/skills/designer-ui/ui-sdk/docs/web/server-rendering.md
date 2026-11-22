# Server Rendering

Send HTML from the server and upgrade custom elements in the browser.

Write custom elements in your server-rendered HTML. Import their modules in the browser to upgrade them and connect their behavior.

## Send the Markup

```html
<ui-toggle default-pressed>
  <button type="button" aria-pressed="true">Bold</button>
</ui-toggle>
<script type="module" src="/src/components.ts"></script>
```

```ts title="components.ts"
import "@ui-sdk/web/toggle"
```

Your bundler resolves the package import. The browser upgrades `<ui-toggle>` when that module runs. Plain server-rendered HTML does not calculate the primitive’s ARIA state. Here, `aria-pressed="true"` describes the initial button before upgrade and matches `default-pressed`. After upgrade, ui-sdk keeps it in sync as the button toggles.

## Before Upgrade

The Bold button is visible before the script loads, but it cannot toggle yet. Native behavior still works: a submit button can submit a form, and a native input can accept text. Keyboard navigation and state changes managed by ui-sdk need the component’s script.

Design the initial HTML accordingly. For a control that must submit before upgrade, include a native input or select using the fallback markup shown on its component page.

## Wait for an Element

Run code that uses component properties after the markup exists and the element is defined:

```ts
import "@ui-sdk/web/toggle"

await customElements.whenDefined("ui-toggle")
const toggle = document.querySelector("ui-toggle")!
console.log(toggle.pressed)
```

Run this after the markup exists. `whenDefined` waits for the tag's registration; it doesn't wait for an element to be inserted into the document.

## Saved Preferences and Storage

Preferences like a color scheme or an emoji skin tone are saved in the browser, so your server can't render them. [Preferences](./core.md#preferences) covers the preferences themselves; this is how they fit server-rendered HTML.

### Show Them Before the Scripts Load

Write `preferencesScript([...])` from `@ui-sdk/core` into your HTML as `<ui-preferences>`'s first child. It runs as the browser parses the page, before any module, and puts every saved value on its `data-*` attribute, so CSS that selects those attributes is right from the first paint. Give the element its preferences once its module loads:

```ts title="server.ts"
import { preferencesScript } from "@ui-sdk/core"
import { colorScheme, skinTone } from "./preferences"

const page = `<body>
  <ui-preferences>
    <script>${preferencesScript([colorScheme, skinTone])}</script>
    …
  </ui-preferences>
  <script type="module" src="/src/page.ts"></script>
</body>`
```

```ts title="page.ts"
import "@ui-sdk/web/preferences"
import { colorScheme, skinTone } from "./preferences"

document.querySelector("ui-preferences")!.preferences = [colorScheme, skinTone]
```

The script writes preferences made with `global: true` on `<html>`, and the others on `<ui-preferences>`. Once the element has its preferences, it keeps the attributes in step with every change. Add a `nonce` attribute to the script if your Content Security Policy needs one.

### Read a Cookie on the Server

A preference kept in a cookie can render on your server too, content included. Pass the request's `Cookie` header to `createCookieStorage` while rendering that request, and read the value to write it into the HTML:

```ts
const skinTone = createPreference({
  values: ["default", "light", "medium", "dark"],
  defaultValue: "default",
  attribute: "data-skin-tone",
  storage: createCookieStorage("skin-tone", {
    cookie: request.headers.get("cookie"),
  }),
})

const page = `<ui-preferences data-skin-tone="${skinTone.get().value}">…</ui-preferences>`
```

In the browser the same storage reads `document.cookie`.

### Render the Storage Script Yourself

For one element that keeps its own value, like a toolbar's density, a storage's `script` returns the same kind of inline script for a single element. Write it right after the element, since it sets the element right before it:

```ts title="server.ts"
import { createLocalStorage } from "@ui-sdk/core"

const density = createLocalStorage("density")
const script = density.script({
  attribute: "data-density",
  values: ["comfortable", "compact"],
})

const toolbar = `<div class="toolbar" data-density="comfortable">…</div>
<script>${script}</script>`
```

- **Shared by ID.** Every script with the same storage kind and ID reads the storage once, however many elements it follows, and the scripts are identical, so compression shrinks the repeats.
- **Only safe values.** Any script on your site can write the saved value, so `script` only sets attributes that start with `data-`, and only to one of `values`.
- **Not for cookies.** A cookie storage's `script` returns undefined, since your server reads the cookie and can write the value itself.

To run before the page's content at all, write `preferencesScript([...])` into `<head>`. Only global preferences make sense there, since the others go on the script's parent element.

## Importing on the Server

Component modules skip registration when `customElements` is unavailable. Importing one on the server doesn't upgrade markup. Load it again in the browser.

Popups render in place, so your server template doesn't need a portal root. [Popups](./popups.md) covers placement, and [Forms](./forms.md) covers submission.
