# Rating

Pick a score from a row of stars, whole or half, with a preview as the pointer moves over them.

Use a rating to collect a score, like how a stay went, or to show one, like an average. Each star is a radio, so it works like a radio group, with one value and a single tab stop.

```ts title="basic.ts"
import "@ui-sdk/web/rating"
import { createElement, Star } from "lucide"

const star = createElement(Star, { "aria-hidden": "true" }).outerHTML

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-rating aria-label="Rating" default-value="3">
      <template><ui-rating-item>${star}</ui-rating-item></template>
    </ui-rating>
  `
}

export { mount }
```

Choose a star, then use the arrow keys to change the score.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the component, and the field if you use it, to register their elements. The import is safe on the server.

```ts
import "@ui-sdk/web/rating"
import "@ui-sdk/web/field"
```

## Composition

Use the following composition to build a `ui-rating`:

```text
ui-rating
└── template
    └── ui-rating-item
```

`ui-rating` renders a `ui-rating-item` per star, copied from the one in its `<template>`, and the radios inside each. Without a template, the items are empty.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/rating"
</script>

<ui-rating aria-label="Rating" default-value="3">
  <template>
    <ui-rating-item>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path
          d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
        />
      </svg>
    </ui-rating-item>
  </template>
</ui-rating>
```

Name the rating with `aria-label`, or put it in a [Field](./field.md) whose label names it. Without `default-value`, nothing starts checked and Tab enters on the first star.

## Stars

Put your icon in `ui-rating-item`. Each item says how much of its star the shown score covers: `--rating-fill` goes from 0 to 1, `data-filled` marks a whole star and `data-partial` the star a score ends partway through. The radios that pick the score sit over the icon, so it needs no events of its own.

```css
[data-slot="rating-item"] {
  color: lightgray;
}

[data-slot="rating-item"][data-filled] {
  color: gold;
}
```

For half stars and averages, paint the icon up to `calc(var(--rating-fill) * 100%)`, like with a gradient behind a star-shaped mask.

## Half Stars

Set `step="0.5"` to split each star in two. Each half is its own radio, named like "2.5 stars", and a press on the first half of a star picks the half score.

```ts title="half-stars.ts"
import "@ui-sdk/web/rating"
import { createElement, Star } from "lucide"

const star = createElement(Star, { "aria-hidden": "true" }).outerHTML

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-rating aria-label="Rating" step="0.5" default-value="3.5">
      <template><ui-rating-item>${star}</ui-rating-item></template>
    </ui-rating>
  `
}

export { mount }
```

Choose the first half of a star. Its star fills halfway.

## Preview

While a pointer moves over the stars, they show the score under it: `--rating-fill` follows the pointer, and `data-highlighted` marks the stars up to it. Leaving the stars shows the score again. Touch has no preview, since a tap picks the score at once.

## Deselectable

Set `deselectable` to let people clear their score: a press on the checked star, or Space on it, sets the score back to `null`.

```ts title="deselectable.ts"
import "@ui-sdk/web/rating"
import { createElement, Star } from "lucide"

const star = createElement(Star, { "aria-hidden": "true" }).outerHTML

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-rating aria-label="Rating" default-value="4" deselectable>
      <template><ui-rating-item>${star}</ui-rating-item></template>
    </ui-rating>
  `
}

export { mount }
```

Press the fourth star. The score clears.

## Read-Only

Set `read-only` to show a score that can't change, like an average. Any score shows, like 4.2, which fills a fifth of the last star. The rating becomes one image for screen readers, and its radios are hidden from them.

Name a read-only rating with the `getValueLabel` property, so its name includes the score. An `aria-label` would replace it.

```ts title="read-only.ts"
import type { UiRatingElement } from "@ui-sdk/web"
import "@ui-sdk/web/rating"
import { createElement, Star } from "lucide"

const star = createElement(Star, { "aria-hidden": "true" }).outerHTML

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-rating value="4.2" read-only>
      <template><ui-rating-item>${star}</ui-rating-item></template>
    </ui-rating>
  `
  const rating = root.querySelector("ui-rating") as UiRatingElement
  rating.getValueLabel = (value, max) => `Rated ${value} out of ${max}`
}

export { mount }
```

An average of 4.2, named Rated 4.2 out of 5.

## Disabled

Set `disabled` to stop every star from being focused or changed. A disabled rating submits nothing.

```ts title="disabled.ts"
import "@ui-sdk/web/rating"
import { createElement, Star } from "lucide"

const star = createElement(Star, { "aria-hidden": "true" }).outerHTML

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-rating aria-label="Rating" default-value="2" disabled>
      <template><ui-rating-item>${star}</ui-rating-item></template>
    </ui-rating>
  `
}

export { mount }
```

The rating is disabled, so the stars can't be focused or pressed.

## Controlled

Listen to `valuechange` for each change and its reason. Call `event.preventDefault()` to keep the current score. The element's `api` property has the same methods, like `api.setValue(null)` for the Clear Rating button below.

```ts title="controlled.ts"
import "@ui-sdk/web/rating"
import { createElement, Star } from "lucide"
import { log } from "./log"

const star = createElement(Star, { "aria-hidden": "true" }).outerHTML

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div>
      <div data-slot="controls">
        <button type="button">Clear Rating</button>
      </div>
      <ui-rating aria-label="Rating" default-value="4">
        <template><ui-rating-item>${star}</ui-rating-item></template>
      </ui-rating>
    </div>
  `
  const rating = root.querySelector("ui-rating")!
  rating.addEventListener("valuechange", (event) => {
    const { value, reason } = event.detail
    log(root, `value: ${value} (${reason})`)
  })
  root
    .querySelector('[data-slot="controls"] button')!
    .addEventListener("click", () => rating.api.setValue(null))
}

export { mount }
```

Choose a star, then press Clear Rating. The console logs each change and its reason.

See [State and Events](../state-and-events.md) for controlled state, cancellation and debugging.

## Form

The rating takes part in forms through `ElementInternals`. Set `name` to submit the score; nothing submits without a name or a score. `required` blocks submission until there's a score, and a reset returns to `default-value`.

```ts title="form.ts"
import "@ui-sdk/web/field"
import "@ui-sdk/web/rating"
import { createElement, Star } from "lucide"
import { log } from "./log"

const star = createElement(Star, { "aria-hidden": "true" }).outerHTML

function mount(root: HTMLElement) {
  root.innerHTML = `
    <form data-slot="stack">
      <ui-field>
        <ui-field-label>Rate your stay</ui-field-label>
        <ui-rating name="stay" required>
          <template><ui-rating-item>${star}</ui-rating-item></template>
        </ui-rating>
      </ui-field>
      <div data-slot="row">
        <button type="submit" data-variant="solid">Send Review</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  `
  const form = root.querySelector("form")!
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    log(root, `Submitted stay=${new FormData(form).get("stay")}`)
  })
}

export { mount }
```

Press Send Review without a score to see the browser's message. Choose a star and send it again.

## Stars and Labels

Set `max` for the number of stars, and `loop` to let the arrow keys wrap from the last star to the first. Each radio is named by the `getValueLabel` property, which gets the score and `max` and says "1 star" or "3 stars" by default.

```html
<ui-rating aria-label="Difficulty" max="10" loop></ui-rating>
<script type="module">
  document.querySelector("ui-rating").getValueLabel = (value, max) =>
    `${value} of ${max}`
</script>
```

## Styling

Parts are unstyled. Use `data-filled`, `data-partial`, `data-checked` and `data-highlighted` on each star, and `--rating-fill` for how full it is. `data-disabled`, `data-readonly` and `data-required` are on the rating and its stars.

Each part has a `data-slot`, such as `rating-item`, and its state attributes are listed under [Data Attributes](#data-attributes).

### ui-rating-item
- `--rating-fill`: How much of the star the shown score covers, from 0 to 1.

## Data Attributes

### ui-rating
`[data-slot="rating"]`

- `data-required`: Present when the rating is required.
- `data-readonly`: Present when the rating only shows its score.
- `data-disabled`: Present when the rating is disabled, by its own prop or a `<fieldset>`.

### ui-rating-item
`[data-slot="rating-item"]`

- `data-filled`: Present on stars the shown score covers whole.
- `data-partial`: Present on the star the shown score covers part of, like the last of 2.5.
- `data-checked`: Present on the star the score ends in.
- `data-disabled`: Present when the rating is disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when the rating only shows its score.
- `data-highlighted`: Present on the stars up to the score a pointer previews.

## API Reference

Props are attributes in kebab case, like `default-value` and `read-only`. `getValueLabel` and `controller` are properties. `value` is a live property and attribute. Callbacks are DOM events.

### ui-rating

- `value?` (`number | null`): The score. Pass it to control the rating. `null` means no score yet.
- `defaultValue?` (`number | null`): The score at first, when uncontrolled. A form reset returns to it.
- `valuechange event`: Runs when a user or a form reset wants to change the score. `details.reason` says why, and `details.cancel()` stops it.
- `max?` (`number`): How many stars there are.
- `step?` (`number`): The smallest change, as a fraction of a star: `0.5` makes half stars, each half its own radio.
- `deselectable?` (`boolean`): Lets a press on the checked star clear the score.
- `disabled?` (`boolean`): Disables every star: they can't be focused or changed, and the score isn't submitted.
- `readOnly?` (`boolean`): Shows the score as an image, named by `getValueLabel`, that can't be changed. Any score shows, like an average of 4.2.
- `required?` (`boolean`): Blocks form submission until there's a score, with the browser's own message.
- `name?` (`string`): The name the score submits under. Without one, the rating submits nothing.
- `form?` (`string`): The id of a form to belong to, when the rating isn't inside that form.
- `loop?` (`boolean`): Whether arrow keys wrap from the last star to the first.
- `getValueLabel?` (`((value: number, max: number) => string)`): Names a score, for each star's radio and for a read-only rating.
- `controller?` (`{ getValue: () => number | null; setValue: (value: number | null, details?: RatingChangeOptions) => boolean; focus: () => void; }`): Sets the score from anywhere. Create one with `createRatingController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

The same state shows as data attributes on each element.

- `value` (`number | null`): The score, or `null` before anyone rates.
- `highlighted` (`number | null`): The score a pointer previews over the stars, or `null` while none does.
- `disabled` (`boolean`): Whether the rating is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the rating only shows its score.
- `required` (`boolean`): Whether a form won't submit until there's a score.

- `index` (`number`): Which star this is, from 1.
- `fill` (`number`): How much of this star the shown score covers, from 0 to 1. Also `--rating-fill`.
- `checked` (`boolean`): Whether the score ends in this star.
- `highlighted` (`boolean`): Whether a pointer previews a score that reaches this star.
- `disabled` (`boolean`): Whether the rating is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the rating only shows its score.

### Reasons

`event.detail.reason` says why the score changed.

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods. The `value` property reads and sets the score.

Every write method takes an optional `{ reason, event }`, fires the change event like a press, and returns `false` when the change is canceled.

- `getValue()` (`() => number | null`): The score, or `null` before anyone rates.
- `setValue(value, details?)` (`(value: number | null, details?: RatingChangeOptions | undefined) => boolean`): Sets the score, as a user would. Disabled and read-only ratings ignore it.
- `focus()` (`() => void`): Moves focus to the checked star, or the first one.

### Events

Events fire on their own element and don't bubble, with the new score in `event.detail.value` and the `reason` and `event` beside it. Calling `preventDefault()` cancels the change.

| Member                      | On          | Description                                                           |
| --------------------------- | ----------- | --------------------------------------------------------------------- |
| `value` property, attribute | `ui-rating` | The score, or `null`. The attribute sets where it starts, and is live |
| `api` property              | `ui-rating` | The [controller](#controller)                                         |
| `valuechange` event         | `ui-rating` | `detail: { value, reason, event, source }`                            |

## Accessibility

A rating is a radio group, so it follows the [WAI-ARIA radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) and behaves like native radios that share a name. Each star holds a `ui-rating-radio` per score it can pick, with the `radio` role, and the rating takes part in forms through `ElementInternals`, without hidden inputs. Icons inside the stars should be hidden from screen readers with `aria-hidden`, since each radio is already named. A read-only rating has the `img` role instead, named by the `getValueLabel` property.

### Keyboard

| Key        | Does                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| Tab        | Moves into the rating, onto the checked star or the first one                              |
| Arrow keys | Move to the next or previous score and check it, stopping at the ends unless `loop` is set |
| Space      | Checks the focused star, or clears it when it's checked and `deselectable`                 |
| Enter      | Submits its form                                                                           |

### Tested Behavior

Every line below is an automated test.

**Selection**

- The default score is checked, and the stars up to it are full.
- Clicking a star checks it and says why.
- A half star fills half of its star.
- Clicking the checked star clears a deselectable rating, and only that one.
- A change can be cancelled.
- A controller sets the score.

**Preview**

- A pointer over a star previews its score, and leaving shows the score again.

**Keyboard**

- Tab lands on the checked star, and the next Tab leaves.
- Arrow keys change the score by a step, and stop at the ends.
- Space on the checked star clears a deselectable rating.

**Read-only**

- A read-only rating is one image, named by its label, that shows any score.

**Forms**

- Each score submits under its rating's name.
- A form reset returns to the default score.
- A disabled rating submits nothing, and its stars can't be focused or checked.

Runs in React, Vue and web components.
