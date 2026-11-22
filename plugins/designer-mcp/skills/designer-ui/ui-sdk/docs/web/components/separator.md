# Separator

Divide groups of content with a horizontal or vertical line.

Use a separator between groups of content that a reader should take as separate, like a profile's header and its bio.

```ts title="basic.ts"
import "@ui-sdk/web/separator"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <div data-slot="stack">
        <h3>Hollis Grant</h3>
        <p data-slot="hint">hollis@example.com</p>
      </div>
      <ui-separator></ui-separator>
      <p>Designs the billing and onboarding flows, and reviews every new pricing page.</p>
    </div>
  `
}

export { mount }
```

Read the profile with a screen reader. It announces a separator between Hollis Grant's name and email and the bio below.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Importing the component defines its element. On the server the import does nothing.

```ts
import "@ui-sdk/web/separator"
```

## Usage

Import the separator and put it between two groups of content:

```html
<script type="module">
  import "@ui-sdk/web/separator"
</script>

<section>
  <h2>Hollis Grant</h2>
  <ui-separator></ui-separator>
  <p>Designs the billing and onboarding flows.</p>
</section>
```

## Build Your Own

`@ui-sdk/web/separator` comes with a ready-made `ui-separator` element. If you'd like to build your own, with your own element name, start from the `separator` primitive in `@ui-sdk/core`:

```ts title="divider-element.ts"
import { separator } from "@ui-sdk/core/separator"
import { createParts } from "@ui-sdk/web"

createParts(separator, {
  root: { tag: "app-divider", display: "block" },
})
```

```html
<app-divider orientation="vertical"></app-divider>
```

`app-divider` keeps the behavior, state and data attributes of the ready-made `ui-separator`: the `separator` role, `aria-orientation` and `data-orientation`. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Vertical

Set `orientation="vertical"` for a line between items in a row. It takes the row's height.

```ts title="vertical.ts"
import "@ui-sdk/web/separator"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <nav aria-label="Legal" data-slot="row">
      <a href="#">Privacy</a>
      <ui-separator orientation="vertical"></ui-separator>
      <a href="#">Terms</a>
      <ui-separator orientation="vertical"></ui-separator>
      <a href="#">Cookies</a>
    </nav>
  `
}

export { mount }
```

Read across Privacy, Terms and Cookies. A screen reader announces a vertical separator between each link.

## Stacked Content

A vertical separator stretches to the tallest item in its row, so it spans a number and its label.

```ts title="menu.ts"
import "@ui-sdk/web/separator"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="row">
      <div data-slot="stack">
        <span>24</span>
        <span data-slot="hint">Projects</span>
      </div>
      <ui-separator orientation="vertical"></ui-separator>
      <div data-slot="stack">
        <span>1,280</span>
        <span data-slot="hint">Followers</span>
      </div>
      <ui-separator orientation="vertical"></ui-separator>
      <div data-slot="stack">
        <span>312</span>
        <span data-slot="hint">Following</span>
      </div>
    </div>
  `
}

export { mount }
```

Compare the lines with the stats. Each one runs the full height of Projects, Followers and Following.

## Rows

Put a separator between each pair of rows to divide a list of details.

```ts title="list.ts"
import "@ui-sdk/web/separator"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <dl>
        <dt>Plan</dt>
        <dd>Pro</dd>
      </dl>
      <ui-separator></ui-separator>
      <dl>
        <dt>Seats</dt>
        <dd>8 of 10</dd>
      </dl>
      <ui-separator></ui-separator>
      <dl>
        <dt>Renews</dt>
        <dd>December 1, 2026</dd>
      </dl>
    </div>
  `
}

export { mount }
```

Read the plan details with a screen reader. It announces a separator between Plan, Seats and Renews.

## Decorative

Set `decorative` when the line adds no information. Here, the word “or” already says the two ways to sign in are separate, so a screen reader skips the lines.

```ts title="decorative.ts"
import "@ui-sdk/web/separator"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div data-slot="stack">
      <button type="button" data-variant="solid">Sign In with Passkey</button>
      <div data-slot="row">
        <ui-separator decorative></ui-separator>
        <span>or</span>
        <ui-separator decorative></ui-separator>
      </div>
      <button type="button">Email Me a Link</button>
    </div>
  `
}

export { mount }
```

Read from Sign In with Passkey to Email Me a Link with a screen reader. It reads “or” and skips the lines.

A decorative separator gets `role="none"` and no `aria-orientation`. It keeps `data-orientation` for styling.

## Custom Rendering

Set `as-child` to bind the separator to its first child, such as `<ui-separator as-child><hr /></ui-separator>`. See [Parts and Composition](../parts-and-composition.md) for choosing the element a part binds.

## Styling

The separator is unstyled. Give it a background, a height when it's horizontal and a width when it's vertical, and use `data-orientation` to tell them apart. A vertical line takes its row's height with `align-self: stretch`.

The separator has a `data-slot` of `separator`, and its `data-orientation` is listed under [Data Attributes](#data-attributes).

## Data Attributes

### `<ui-separator>`
`[data-slot="separator"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the line runs.

## API Reference

Props are attributes, like `orientation="vertical"` and `decorative`. The separator has no events and no `api`.

### Separator

- `orientation?` (`SeparatorOrientation`): Which way the line runs. A vertical separator divides items in a row.
- `decorative?` (`boolean`): Hides the separator from assistive technology with `role="none"`, for a line that's only visual. Leave it off when the separator divides content a screen reader should hear as separate, like groups of menu items.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

The same state shows as data attributes on the element.

- `orientation` (`SeparatorOrientation`): Which way the line runs.

## Accessibility

The component follows the [WAI-ARIA separator role](https://www.w3.org/TR/wai-aria-1.2/#separator). A separator divides content a screen reader should hear as separate, and it's announced with `role="separator"` and its `aria-orientation`. A decorative separator is only visual: it gets `role="none"`, so screen readers skip it. Use `decorative` only when the surrounding content already conveys the division. Either way, a separator never takes focus, so Tab moves past it.

### Tested Behavior

Every line below is an automated test.

- A separator is announced with its orientation.
- A separator can't be focused.
- A separator carries its orientation for styling.

Runs in React, Vue and web components.
