# Accordion

Show and hide sections of content from their headings.

Use an Accordion for content people can explore one section at a time, such as answers, settings, or a course outline. Each heading is a button that opens its panel.

```ts title="basic.ts"
import "@ui-sdk/web/accordion"
import { ChevronDown, createElement } from "lucide"

const items = [
  {
    value: "shipping",
    label: "What are your shipping options?",
    content: [
      "We offer standard (5 to 7 days), express (2 to 3 days) and overnight shipping.",
      "Every order ships with tracking, and orders over $50 ship free.",
    ],
  },
  {
    value: "returns",
    label: "What is your return policy?",
    content: [
      "Return any unused item in its original packaging within 30 days. Refunds arrive within 5 to 7 business days.",
    ],
  },
  {
    value: "support",
    label: "How can I reach support?",
    content: [
      "Write to us by email or chat, or call us. We answer within 24 hours on business days.",
    ],
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-accordion default-value="shipping">
      ${items
        .map(
          (item) => `
            <ui-accordion-item value="${item.value}">
              <ui-accordion-header>
                <h3>
                  <ui-accordion-trigger>
                    <button type="button" aria-expanded="${item.value === "shipping"}">
                      ${item.label}
                      ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
                    </button>
                  </ui-accordion-trigger>
                </h3>
              </ui-accordion-header>
              <ui-accordion-panel${item.value === "shipping" ? "" : " hidden"}>
                ${item.content.map((paragraph) => `<p>${paragraph}</p>`).join("")}
              </ui-accordion-panel>
            </ui-accordion-item>`
        )
        .join("")}
    </ui-accordion>
  `
}

export { mount }
```

Press “What is your return policy?”. Its answer opens and the shipping answer closes. Press the same heading again to close it.

## Installation

```bash
npm install @ui-sdk/web @ui-sdk/core
```

Import the component to register its elements. The import is safe on the server.

```ts
import "@ui-sdk/web/accordion"
```

## Composition

Use the following composition to build a `ui-accordion`:

```text
ui-accordion
├── ui-accordion-item
│   ├── ui-accordion-header
│   │   └── h3
│   │       └── ui-accordion-trigger
│   │           └── button
│   └── ui-accordion-panel
└── ui-accordion-item
    ├── ui-accordion-header
    │   └── h3
    │       └── ui-accordion-trigger
    │           └── button
    └── ui-accordion-panel
```

Give every item a unique `value`. Put its trigger inside a heading, then add the panel it opens. The accordion's value is always an array of open item values, even when only one can be open.

The header wraps your heading and the trigger wraps your button. Use a heading level that fits the surrounding document. Tab moves between triggers; Enter or Space opens and closes their panels. Arrow keys, Home and End do nothing here: the APG removed them from the pattern, and a screen reader’s heading navigation already reaches each trigger.

## Usage

Import the parts and put them together:

```html
<script type="module">
  import "@ui-sdk/web/accordion"
</script>

<ui-accordion>
  <ui-accordion-item value="shipping">
    <ui-accordion-header>
      <h3>
        <ui-accordion-trigger><button>Shipping</button></ui-accordion-trigger>
      </h3>
    </ui-accordion-header>
    <ui-accordion-panel hidden
      >Orders arrive in five to seven days.</ui-accordion-panel
    >
  </ui-accordion-item>
</ui-accordion>
```

## Build Your Own

`@ui-sdk/web/accordion` comes with ready-made `ui-accordion` elements. If you'd like to build your own, with your own names, start from the `accordion` primitive in `@ui-sdk/core`:

```ts title="faq-elements.ts"
import { accordion } from "@ui-sdk/core/accordion"
import { createParts, wrappedButton } from "@ui-sdk/web"

createParts(accordion, {
  root: "faq-list",
  item: "faq-item",
  header: {
    tag: "faq-heading",
    target: (el) => el.querySelector<HTMLElement>("h3") ?? el,
  },
  trigger: { tag: "faq-question", target: wrappedButton, display: "contents" },
  panel: "faq-answer",
})
```

```html
<faq-list>
  <faq-item value="shipping">
    <faq-heading>
      <h3>
        <faq-question
          ><button>What are your shipping options?</button></faq-question
        >
      </h3>
    </faq-heading>
    <faq-answer>Standard, express and overnight.</faq-answer>
  </faq-item>
</faq-list>
```

Each part keeps the behavior, state and data attributes of its ready-made counterpart. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Multiple

Add `multiple` to let several items stay open. Opening one then leaves the others as they are.

```ts title="multiple.ts"
import "@ui-sdk/web/accordion"
import { ChevronDown, createElement } from "lucide"

const items = [
  {
    value: "notifications",
    label: "Notification settings",
    content: "Choose what we email you about, and how often.",
  },
  {
    value: "privacy",
    label: "Privacy and security",
    content: "Turn on two-factor authentication and review signed-in devices.",
  },
  {
    value: "billing",
    label: "Billing and subscription",
    content: "Update your payment method and download past invoices.",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-accordion multiple default-value="notifications">
      ${items
        .map(
          (item) => `
            <ui-accordion-item value="${item.value}">
              <ui-accordion-header>
                <h3>
                  <ui-accordion-trigger>
                    <button type="button" aria-expanded="${item.value === "notifications"}">
                      ${item.label}
                      ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
                    </button>
                  </ui-accordion-trigger>
                </h3>
              </ui-accordion-header>
              <ui-accordion-panel${item.value === "notifications" ? "" : " hidden"}>
                ${item.content}
              </ui-accordion-panel>
            </ui-accordion-item>`
        )
        .join("")}
    </ui-accordion>
  `
}

export { mount }
```

Open Privacy and security. Notification settings stays open; close either section independently.

## Disabled

Set `disabled` on an item or on a single trigger to prevent changes, or on the accordion to disable every item. Disabled triggers stay in the tab order so people can still discover them. A disabled `<fieldset>` around the accordion disables it too.

```ts title="disabled.ts"
import "@ui-sdk/web/accordion"
import { ChevronDown, createElement } from "lucide"

const items: {
  value: string
  label: string
  content: string
  disabled?: boolean
}[] = [
  {
    value: "access",
    label: "Can I access my account history?",
    content:
      "Yes. Every order and payment from the last five years is in your account.",
  },
  {
    value: "premium",
    label: "Premium feature information",
    content:
      "Premium includes priority support and early access to new features.",
    disabled: true,
  },
  {
    value: "email",
    label: "How do I update my email address?",
    content:
      "Open Settings, then Account, and change it there. We'll send a confirmation link.",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-accordion>
      ${items
        .map(
          (item) => `
            <ui-accordion-item value="${item.value}"${item.disabled ? " disabled" : ""}>
              <ui-accordion-header>
                <h3>
                  <ui-accordion-trigger>
                    <button type="button" aria-expanded="false">
                      ${item.label}
                      ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
                    </button>
                  </ui-accordion-trigger>
                </h3>
              </ui-accordion-header>
              <ui-accordion-panel hidden>
                ${item.content}
              </ui-accordion-panel>
            </ui-accordion-item>`
        )
        .join("")}
    </ui-accordion>
  `
}

export { mount }
```

Tab to Premium feature information. It stays focusable, and pressing it leaves its panel closed. Try “How do I update my email address?” instead.

<span id="behavior-and-options" />

## Collapsible

Set `collapsible="false"` when the open item should stay open until another item replaces it. Pair it with `default-value="overview"` so a panel starts open.

The open trigger reports `aria-disabled="true"` because pressing it leaves its panel open.

```html
<ui-accordion collapsible="false" default-value="overview"></ui-accordion>
```

```ts title="collapsible.ts"
import "@ui-sdk/web/accordion"
import { ChevronDown, createElement } from "lucide"

const items = [
  {
    value: "overview",
    label: "Overview",
    content: "A summary of the project, its goals and its owners.",
  },
  {
    value: "timeline",
    label: "Timeline",
    content: "Kickoff in March, beta in June and launch in September.",
  },
  {
    value: "budget",
    label: "Budget",
    content: "Approved for two engineers and one designer for six months.",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-accordion collapsible="false" default-value="overview">
      ${items
        .map(
          (item) => `
            <ui-accordion-item value="${item.value}">
              <ui-accordion-header>
                <h3>
                  <ui-accordion-trigger>
                    <button type="button" aria-expanded="${item.value === "overview"}">
                      ${item.label}
                      ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
                    </button>
                  </ui-accordion-trigger>
                </h3>
              </ui-accordion-header>
              <ui-accordion-panel${item.value === "overview" ? "" : " hidden"}>
                ${item.content}
              </ui-accordion-panel>
            </ui-accordion-item>`
        )
        .join("")}
    </ui-accordion>
  `
}

export { mount }
```

Open Timeline, then press it again. It stays open until you choose another heading.

## Controlled

Read or set the element’s `value` property to choose the open items. Setting it commits the change without firing `valuechange` or `openchange`, like a native input’s `value`; `api.setValue()` fires them like a press. Listen to `valuechange` to follow the changes people make. [State and Events](../state-and-events.md) covers the shared pattern.

An item can refuse a change: call `event.preventDefault()` in its `openchange` listener. Item `openchange` events fire before the accordion's `valuechange`, including the item that would close when another opens. Canceling any one of them cancels the whole change. `valuechange` also carries the [reason](#reasons) for the change.

```ts title="controlled.ts"
import "@ui-sdk/web/accordion"
import { ChevronDown, createElement } from "lucide"

const items = [
  {
    value: "account",
    label: "Account",
    content: "Your name, email address and profile photo.",
  },
  {
    value: "security",
    label: "Security",
    content: "Your password, passkeys and two-factor authentication.",
  },
  {
    value: "sessions",
    label: "Sessions",
    content: "Devices signed in to your account in the last 30 days.",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div>
      <div data-slot="controls">
        <button type="button">Review security</button>
      </div>
      <ui-accordion multiple default-value="account">
        ${items
          .map(
            (item) => `
              <ui-accordion-item value="${item.value}">
                <ui-accordion-header>
                  <h3>
                    <ui-accordion-trigger>
                      <button type="button" aria-expanded="${item.value === "account"}">
                        ${item.label}
                        ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
                      </button>
                    </ui-accordion-trigger>
                  </h3>
                </ui-accordion-header>
                <ui-accordion-panel${item.value === "account" ? "" : " hidden"}>
                  ${item.content}
                </ui-accordion-panel>
              </ui-accordion-item>`
          )
          .join("")}
      </ui-accordion>
    </div>
  `
  const accordion = root.querySelector("ui-accordion")!
  root
    .querySelector("[data-slot=controls] button")!
    .addEventListener("click", () => accordion.api.open("security"))
  accordion.addEventListener(
    "openchange",
    (event) => {
      const open = (event as CustomEvent<{ value: boolean }>).detail.value
      const item = (event.target as HTMLElement).getAttribute("value")
      if (
        !open &&
        item === "security" &&
        !window.confirm("Close the security settings?")
      ) {
        event.preventDefault()
      }
    },
    { capture: true }
  )
}

export { mount }
```

Press Security to open it, then press it again. Cancel the confirmation and Security stays open; accept it and the section closes.

## Keep Mounted

A closed panel normally unmounts. Add `keep-mounted` to one panel or the whole accordion to keep its content hidden in the page. This preserves local state, such as a draft in a field.

```ts title="keep-mounted.ts"
import "@ui-sdk/web/accordion"
import "@ui-sdk/web/field"
import "@ui-sdk/web/textarea"
import { ChevronDown, createElement } from "lucide"

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-accordion default-value="reply">
      <ui-accordion-item value="reply">
        <ui-accordion-header>
          <h3>
            <ui-accordion-trigger>
              <button type="button" aria-expanded="true">
                Reply to this thread
                ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
              </button>
            </ui-accordion-trigger>
          </h3>
        </ui-accordion-header>
        <ui-accordion-panel keep-mounted>
          <ui-field>
            <ui-field-label>Message</ui-field-label>
            <ui-textarea>
              <textarea rows="3" placeholder="Write a reply…"></textarea>
            </ui-textarea>
          </ui-field>
        </ui-accordion-panel>
      </ui-accordion-item>
      <ui-accordion-item value="formatting">
        <ui-accordion-header>
          <h3>
            <ui-accordion-trigger>
              <button type="button" aria-expanded="false">
                Formatting
                ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
              </button>
            </ui-accordion-trigger>
          </h3>
        </ui-accordion-header>
        <ui-accordion-panel hidden>
          <p>Use **bold**, _italics_ and \`code\`. Links paste as previews.</p>
        </ui-accordion-panel>
      </ui-accordion-item>
    </ui-accordion>
  `
}

export { mount }
```

Write a message, switch to Formatting, then return to Reply to this thread. Your draft is still there.

## Find in Page

Add `hidden-until-found` to keep closed panels available to the browser's Find command. A match opens the item immediately, without an animation, with the [reason](#reasons) `find-in-page`.

```ts title="find-in-page.ts"
import "@ui-sdk/web/accordion"
import { ChevronDown, createElement } from "lucide"

const items = [
  {
    value: "fruit",
    label: "Which fruit do you stock?",
    content: "Apples, pears, mangoes and, in summer, pineapple.",
  },
  {
    value: "organic",
    label: "Is it organic?",
    content: "Everything we stock is certified organic.",
  },
  {
    value: "delivery",
    label: "When do you deliver?",
    content: "Every weekday morning before 10.",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-accordion hidden-until-found>
      ${items
        .map(
          (item) => `
            <ui-accordion-item value="${item.value}">
              <ui-accordion-header>
                <h3>
                  <ui-accordion-trigger>
                    <button type="button" aria-expanded="false">
                      ${item.label}
                      ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
                    </button>
                  </ui-accordion-trigger>
                </h3>
              </ui-accordion-header>
              <ui-accordion-panel hidden="until-found">
                ${item.content}
              </ui-accordion-panel>
            </ui-accordion-item>`
        )
        .join("")}
    </ui-accordion>
  `
}

export { mount }
```

Use your browser’s Find command to search for “pineapple”. The closed “Which fruit do you stock?” panel opens to reveal the match.

<span id="deep-links" />

A link to an element inside a closed panel can reveal it too. Give the target an `id` and link to it with a hash, such as `href="#refund-timeline"`.

```ts title="deep-link.ts"
import "@ui-sdk/web/accordion"
import { ChevronDown, createElement } from "lucide"

const items = [
  {
    value: "returns",
    label: "Returns",
    content: `
      <p>Return any unused item in its original packaging within 30 days.</p>
      <p id="return-label">To print a return label, open the order and choose Return. The label is free.</p>`,
  },
  {
    value: "refunds",
    label: "Refunds",
    content: `
      <p>Refunds go back to the card you paid with.</p>
      <p id="refund-timeline">Timeline: we inspect the item within 2 days of receiving it, and your bank shows the refund 5 to 7 business days later.</p>`,
  },
  {
    value: "exchanges",
    label: "Exchanges",
    content: `
      <p>Start a return, choose Exchange and pick the new size. Shipping both ways is free.</p>`,
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div>
      <nav data-slot="controls" aria-label="Jump to">
        <a href="#refund-timeline">Jump to the refund timeline</a>
        <a href="#return-label">Print a return label</a>
      </nav>
      <ui-accordion hidden-until-found>
        ${items
          .map(
            (item) => `
              <ui-accordion-item value="${item.value}">
                <ui-accordion-header>
                  <h3>
                    <ui-accordion-trigger>
                      <button type="button" aria-expanded="false">
                        ${item.label}
                        ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
                      </button>
                    </ui-accordion-trigger>
                  </h3>
                </ui-accordion-header>
                <ui-accordion-panel hidden="until-found">
                  <div data-slot="stack">${item.content}</div>
                </ui-accordion-panel>
              </ui-accordion-item>`
          )
          .join("")}
      </ui-accordion>
    </div>
  `
}

export { mount }
```

Press Jump to the refund timeline. The closed Refunds panel opens and the browser moves to the linked paragraph.

With `hidden-until-found`, write `hidden="until-found"` on each closed `ui-accordion-panel` so it is findable before the elements upgrade. For an initial URL hash, [open the item explicitly](#url-hash).

## Animation

Each part has a `data-slot`, such as `accordion-panel`. The panel exposes its measured height as `--accordion-panel-height`. Animate that height to or from zero with `data-starting-style` and `data-ending-style`:

```css
[data-slot="accordion-panel"] {
  height: var(--accordion-panel-height);
  overflow: hidden;
  transition: height 0.15s;

  &:is([data-starting-style], [data-ending-style]) {
    height: 0;
  }
}
```

The panel stays mounted until its exit animation finishes. An item's `openchangecomplete` fires afterward with the open state. A panel that starts open appears right away, with no animation and no completion callback.

```ts title="animation.ts"
import "@ui-sdk/web/accordion"
import { ChevronDown, createElement } from "lucide"

const items = [
  {
    value: "one",
    label: "Why animate the height?",
    content: "So the content below slides instead of jumping.",
  },
  {
    value: "two",
    label: "Where does the height come from?",
    content:
      "The panel measures itself and writes the result to a CSS variable while it animates.",
  },
  {
    value: "three",
    label: "Does it animate on first paint?",
    content: "No. Panels open on the server or on mount show at once.",
  },
]

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-accordion default-value="one">
      ${items
        .map(
          (item) => `
            <ui-accordion-item value="${item.value}">
              <ui-accordion-header>
                <h3>
                  <ui-accordion-trigger>
                    <button type="button" aria-expanded="${item.value === "one"}">
                      ${item.label}
                      ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
                    </button>
                  </ui-accordion-trigger>
                </h3>
              </ui-accordion-header>
              <ui-accordion-panel${item.value === "one" ? "" : " hidden"}>
                ${item.content}
              </ui-accordion-panel>
            </ui-accordion-item>`
        )
        .join("")}
    </ui-accordion>
  `
}

export { mount }
```

Open or close an item. Its panel animates its height.

## Expand All

With `multiple`, the element's `api.openAll()` opens every enabled item. `closeAll()` closes every item that may close. The element's `api` property is its controller; [Controllers](../controllers.md#use-the-elements-controller) shows how to use it.

```ts title="expand-all.ts"
import type { AccordionController } from "@ui-sdk/core/accordion"
import "@ui-sdk/web/accordion"
import { ChevronDown, createElement } from "lucide"

const weeks = [
  {
    value: "week-1",
    label: "Week 1: Foundations",
    content:
      "Set up your editor, meet the command line and write your first script.",
  },
  {
    value: "week-2",
    label: "Week 2: Data and types",
    content:
      "Strings, numbers, lists and objects, and how to tell them apart when a program runs.",
  },
  {
    value: "week-3",
    label: "Week 3: Control flow",
    content:
      "Conditions, loops and functions. The project this week is a small text adventure.",
  },
  {
    value: "week-4",
    label: "Week 4: Working with files",
    content:
      "Read and write files, parse CSV and JSON, and handle the errors that come with them.",
  },
  {
    value: "week-5",
    label: "Week 5: Final project",
    content:
      "Build a tool you'll use yourself, then present it to the group in a five-minute demo.",
  },
]

type OpenChange = CustomEvent<{ value: boolean; reason: string }>

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div>
      <div data-slot="controls">
        <button type="button" data-action="expand">Expand all</button>
        <button type="button" data-action="collapse">Collapse all</button>
      </div>
      <div data-slot="scroll">
        <ui-accordion multiple>
          ${weeks
            .map(
              (week) => `
                <ui-accordion-item value="${week.value}">
                  <ui-accordion-header>
                    <h3>
                      <ui-accordion-trigger>
                        <button type="button" aria-expanded="false">
                          ${week.label}
                          ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
                        </button>
                      </ui-accordion-trigger>
                    </h3>
                  </ui-accordion-header>
                  <ui-accordion-panel hidden>
                    ${week.content}
                  </ui-accordion-panel>
                </ui-accordion-item>`
            )
            .join("")}
        </ui-accordion>
      </div>
    </div>
  `
  const syllabus = root.querySelector("ui-accordion") as HTMLElement & {
    api: AccordionController
  }
  root
    .querySelector("[data-action=expand]")!
    .addEventListener("click", () => syllabus.api.openAll())
  root
    .querySelector("[data-action=collapse]")!
    .addEventListener("click", () => syllabus.api.closeAll())

  let pressed: EventTarget | null = null
  syllabus.addEventListener(
    "openchange",
    (event) => {
      const { value: open, reason } = (event as OpenChange).detail
      if (open && reason === "trigger-press") {
        pressed = event.target
      } else if (pressed === event.target) {
        pressed = null
      }
    },
    { capture: true }
  )
  syllabus.addEventListener(
    "openchangecomplete",
    (event) => {
      const { value: open } = (event as OpenChange).detail
      const week = event.target as HTMLElement
      if (!open || pressed !== week) {
        return
      }
      pressed = null
      week.scrollIntoView({ block: "nearest", behavior: "smooth" })
    },
    { capture: true }
  )
}

export { mount }
```

Press Expand all or Collapse all. Open an individual week near the bottom to scroll it into view after its panel opens.

## Nested

Put another accordion inside a panel when a section has its own expandable sections. Each accordion tracks its own items. Give the inner headings a lower level than the outer headings.

```ts title="nested.ts"
import "@ui-sdk/web/accordion"
import { ChevronDown, createElement } from "lucide"

const sections: {
  value: string
  label: string
  content?: string
  topics?: { value: string; label: string; content: string }[]
}[] = [
  {
    value: "profile",
    label: "Profile",
    content: "Your name, photo and the email address people see.",
  },
  {
    value: "notifications",
    label: "Notifications",
    topics: [
      {
        value: "email",
        label: "Email",
        content: "A weekly digest, and mentions as they happen.",
      },
      {
        value: "push",
        label: "Push",
        content: "Direct messages and replies to your comments.",
      },
    ],
  },
  {
    value: "billing",
    label: "Billing",
    topics: [
      {
        value: "payment",
        label: "Payment methods",
        content: "A Visa card ending in 4242, used for every renewal.",
      },
      {
        value: "invoices",
        label: "Invoices",
        content: "Download a PDF of any invoice from the last two years.",
      },
    ],
  },
]

const topics = (list: { value: string; label: string; content: string }[]) => `
  <ui-accordion multiple>
    ${list
      .map(
        (topic) => `
          <ui-accordion-item value="${topic.value}">
            <ui-accordion-header>
              <h4>
                <ui-accordion-trigger>
                  <button type="button" aria-expanded="false">
                    ${topic.label}
                    ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
                  </button>
                </ui-accordion-trigger>
              </h4>
            </ui-accordion-header>
            <ui-accordion-panel hidden>
              ${topic.content}
            </ui-accordion-panel>
          </ui-accordion-item>`
      )
      .join("")}
  </ui-accordion>`

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-accordion default-value="notifications">
      ${sections
        .map(
          (section) => `
            <ui-accordion-item value="${section.value}">
              <ui-accordion-header>
                <h3>
                  <ui-accordion-trigger>
                    <button type="button" aria-expanded="${section.value === "notifications"}">
                      ${section.label}
                      ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
                    </button>
                  </ui-accordion-trigger>
                </h3>
              </ui-accordion-header>
              <ui-accordion-panel${section.value === "notifications" ? "" : " hidden"}>
                ${section.topics ? topics(section.topics) : `<div>${section.content}</div>`}
              </ui-accordion-panel>
            </ui-accordion-item>`
        )
        .join("")}
    </ui-accordion>
  `
}

export { mount }
```

Open Billing, then Invoices inside it. The inner accordion changes without closing Billing.

## FAQ Search

<span id="faq-with-search" />

Combine a search field with a controlled accordion: filter the questions and set `value` to the matching items. The example also highlights matches and leaves the triggers usable while the search is active.

```ts title="search.ts"
import "@ui-sdk/web/accordion"
import { ChevronDown, createElement } from "lucide"

const faq = [
  {
    value: "returns",
    question: "What is your return policy?",
    answer:
      "Return any unused item within 30 days. Once it reaches us, your refund is on its way.",
  },
  {
    value: "refunds",
    question: "How long do refunds take?",
    answer:
      "Refunds reach your card within 5 to 7 business days after we receive the item.",
  },
  {
    value: "shipping",
    question: "Do you ship internationally?",
    answer:
      "We ship to 40 countries. Duties are included in the price at checkout.",
  },
  {
    value: "tracking",
    question: "How do I track my order?",
    answer:
      "Every shipping email has a tracking link. You'll also find it under Orders.",
  },
  {
    value: "exchange",
    question: "Can I exchange an item for another size?",
    answer:
      "Yes. Start a return, choose Exchange and pick the new size. Shipping is free.",
  },
  {
    value: "gift",
    question: "Can I send an order as a gift?",
    answer:
      "Add a gift note at checkout and we'll leave the prices off the packing slip.",
  },
]

function matches(question: (typeof faq)[number], query: string) {
  const search = query.trim().toLowerCase()
  return (
    !search ||
    question.question.toLowerCase().includes(search) ||
    question.answer.toLowerCase().includes(search)
  )
}

function highlight(text: string, query: string) {
  const search = query.trim().toLowerCase()
  if (!search) {
    return [{ text, match: false }]
  }
  const parts: { text: string; match: boolean }[] = []
  let start = 0
  for (let index = text.toLowerCase().indexOf(search); index !== -1;) {
    if (index > start) {
      parts.push({ text: text.slice(start, index), match: false })
    }
    parts.push({ text: text.slice(index, index + search.length), match: true })
    start = index + search.length
    index = text.toLowerCase().indexOf(search, start)
  }
  if (start < text.length) {
    parts.push({ text: text.slice(start), match: false })
  }
  return parts
}

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

const highlighted = (text: string, query: string) =>
  highlight(text, query)
    .map((part) =>
      part.match ? `<mark>${escape(part.text)}</mark>` : escape(part.text)
    )
    .join("")

function mount(root: HTMLElement) {
  root.innerHTML = `
    <div>
      <div data-slot="controls">
        <input type="search" aria-label="Search questions" placeholder="Search questions…" />
      </div>
      <ui-accordion multiple>
        ${faq
          .map(
            (question) => `
              <ui-accordion-item value="${question.value}">
                <ui-accordion-header>
                  <h3>
                    <ui-accordion-trigger>
                      <button type="button" aria-expanded="false">
                        <span>${question.question}</span>
                        ${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}
                      </button>
                    </ui-accordion-trigger>
                  </h3>
                </ui-accordion-header>
                <ui-accordion-panel hidden>
                  ${question.answer}
                </ui-accordion-panel>
              </ui-accordion-item>`
          )
          .join("")}
      </ui-accordion>
      <p data-slot="hint" role="status"></p>
    </div>
  `
  const accordion = root.querySelector("ui-accordion")!
  const status = root.querySelector("[role=status]")!
  root.querySelector("input")!.addEventListener("input", (event) => {
    const query = (event.target as HTMLInputElement).value
    const results = faq.filter((question) => matches(question, query))
    for (const question of faq) {
      const element = accordion.querySelector<HTMLElement>(
        `ui-accordion-item[value="${question.value}"]`
      )!
      element.hidden = !results.includes(question)
      element.querySelector("button > span")!.innerHTML = highlighted(
        question.question,
        query
      )
      element.querySelector("ui-accordion-panel")!.innerHTML = highlighted(
        question.answer,
        query
      )
    }
    accordion.value = query.trim()
      ? results.map((question) => question.value)
      : []
    status.textContent = results.length ? "" : `No questions match “${query}”.`
  })
}

export { mount }
```

Search for “refund” to show and open matching answers. Try “zzz” for the empty result, then clear the search to restore all questions.

## URL Hash

<span id="open-the-item-in-the-url-hash" />

A hash can name an item's `value` instead of an element inside its panel. Read it after mount and on `hashchange`, then open and focus the matching item through your controller:

```ts
const value = decodeURIComponent(location.hash.slice(1))
if (items.some((item) => item.value === value)) {
  accordion.api.open(value)
  accordion.api.focus(value)
}
```

Check the value against your items first. A controller can hold a value even when no item renders it. Remove the `hashchange` listener when the component unmounts.

## Query String

<span id="keep-open-items-in-the-query-string" />

Use `open` query parameters when several items should be shareable. Read the initial values from your router on the server, then write accepted changes back to the URL:

```ts
function saveOpenItems(value: string[]) {
  const url = new URL(location.href)
  url.searchParams.delete("open")
  for (const item of value) url.searchParams.append("open", item)
  history.replaceState(null, "", url)
}
```

Call this with `event.detail.value` from a `valuechange` listener. If your app already has a router, use its navigation API instead.

## Scroll into View

<span id="scroll-an-item-into-view" />

Scroll after `openchangecomplete`, when the panel has its full height. Scrolling in `openchange` would measure it before it opens. The [Expand All example](#expand-all) shows the full setup and scrolls only when someone opens a single item.

## Custom Rendering

<span id="render-functions" />

Write the heading level you need inside `ui-accordion-header`. Other parts can bind your element with `as-child`. [Parts and Composition](../parts-and-composition.md#choose-the-element) covers custom elements and part state. Accordion's states are listed under [State](#state).

```ts title="render.ts"
import "@ui-sdk/web/accordion"

const steps = [
  {
    value: "install",
    label: "Install the package",
    content: "Add it with your package manager. It has no dependencies.",
  },
  {
    value: "import",
    label: "Import the parts",
    content: "Import the accordion parts you need from the package.",
  },
  {
    value: "style",
    label: "Style it",
    content: "Every part renders its state as data attributes you can style.",
  },
]

export function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-accordion multiple default-value="install">
      ${steps
        .map(
          (step, index) => `
            <ui-accordion-item value="${step.value}">
              <ui-accordion-header>
                <h4>
                  <ui-accordion-trigger>
                    <button type="button" aria-expanded="${step.value === "install"}">
                      <span data-slot="hint" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
                      <span>${step.label}</span>
                      <span data-slot="hint" aria-hidden="true" data-show="closed">Show</span>
                      <span data-slot="hint" aria-hidden="true" data-show="open">Hide</span>
                    </button>
                  </ui-accordion-trigger>
                </h4>
              </ui-accordion-header>
              <ui-accordion-panel${step.value === "install" ? "" : " hidden"}>
                ${step.content}
              </ui-accordion-panel>
            </ui-accordion-item>`
        )
        .join("")}
    </ui-accordion>
  `
}
```

Each step is an h4 with its number and a Show or Hide hint that follows its open state. Open Import the parts to see it update.

## Styling

Style the parts with the attributes below. This turns the chevron as its panel opens, mirrors it in right to left with `:dir(rtl)`, and dims disabled triggers:

```css
[data-slot="accordion-trigger"] {
  & > svg {
    rotate: -90deg;

    &:dir(rtl) {
      rotate: 90deg;
    }
  }

  &[data-open] > svg {
    rotate: 0deg;
  }

  &[data-disabled] {
    color: gray;
  }
}
```

### `<ui-accordion-panel>`
- `--accordion-panel-height`: The panel's content height in pixels while it animates, auto once open and 0px while closed.
- `--accordion-panel-width`: The panel's content width, the same way. For accordions that open sideways.

## Data Attributes

### `<ui-accordion>`
`[data-slot="accordion"]`

- `data-disabled`: Present when the whole accordion is disabled.

### `<ui-accordion-item>`
`[data-slot="accordion-item"]`

- `data-open`: Present while the item is open.
- `data-closed`: Present while the item is closed, including while its panel animates out.
- `data-disabled`: Present when the item can't open or close.

### `<ui-accordion-header>`
`[data-slot="accordion-header"]`

- `data-open`: Present while the item is open.
- `data-closed`: Present while the item is closed, including while its panel animates out.
- `data-disabled`: Present when the item can't open or close.

### `<ui-accordion-trigger>`
`[data-slot="accordion-trigger"]`

- `data-open`: Present while the item is open.
- `data-closed`: Present while the item is closed, including while its panel animates out.
- `data-disabled`: Present when the item can't open or close.

### `<ui-accordion-panel>`
`[data-slot="accordion-panel"]`

- `data-open`: Present while the item is open.
- `data-closed`: Present while the item is closed, including while its panel animates out.
- `data-disabled`: Present when the item can't open or close.
- `data-starting-style`: Present for a panel's first frame. Style the state you animate from.
- `data-ending-style`: Present while a panel animates closed. Style the state you animate to.

## API Reference

Props are attributes in kebab case, like `default-value` (open values separated by commas) and
`hidden-until-found`. Attributes can change at any time. Callbacks are events.

### Accordion

- `value?` (`T[]`): The open items' values. Pass it to control the accordion.
- `defaultValue?` (`T[]`): The items open at first, when uncontrolled.
- `valuechange event`: Runs when items want to open or close. `details.reason` says why, and `details.cancel()` stops it.
- `multiple?` (`boolean`): Whether several items can be open at once. Otherwise opening one closes the others.
- `collapsible?` (`boolean`): Whether the open item can close when only one may be open. With `false`, one item always stays open and its trigger reports it can't be pressed.
- `disabled?` (`boolean`): Stops every item from opening or closing. Triggers stay focusable.
- `keepMounted?` (`boolean`): Whether closed panels stay in the page, hidden.
- `hiddenUntilFound?` (`boolean`): Keeps closed panels in the page as `hidden="until-found"`, so the browser's find in page can match their text and open them.
- `controller?` (`object`): Opens and closes items from anywhere. Create one with `createAccordionController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### AccordionItem

- `disabled?` (`boolean`): Stops the item from opening or closing. Its trigger stays focusable.
- `openchange event`: Runs before the item opens or closes, before the accordion's `valuechange`. `details.cancel()` stops it.
- `openchangecomplete event`: Runs once the item's panel has finished opening or closing, after any animation.
- `value?` (`T`): Identifies the item. The accordion's value lists the open items' values. Defaults to a generated id.

### AccordionHeader

The header takes no options of its own, only the props of the element it renders.

### AccordionTrigger

- `disabled?` (`boolean`): Stops this trigger from opening or closing the item. It stays focusable.

### AccordionPanel

- `keepMounted?` (`boolean`): Whether the panel stays in the page, hidden, while closed. Overrides the accordion's.
- `hiddenUntilFound?` (`boolean`): Whether the panel stays findable with `hidden="until-found"` while closed. Overrides the accordion's.
### State

Read the full state from the element's `api`. Part of it also shows as data attributes: the item, header, trigger and panel write `data-open` or `data-closed` and `data-disabled`, the item adds `data-index`, and the root writes only `data-disabled`. [Styling](#styling) lists every attribute.

`Accordion`:

- `value` (`T[]`): The open items' values.
- `disabled` (`boolean`): Whether the whole accordion is disabled, by its `disabled` option or a disabled fieldset around it.
- `multiple` (`boolean`): Whether several items can be open at once.

`AccordionItem`, `AccordionHeader`, `AccordionTrigger` and `AccordionPanel`:

- `open` (`boolean`): Whether the accordion's `value` holds this item's value.
- `disabled` (`boolean`): Whether the item can't open or close.
- `index` (`number`): The item's position among the accordion's items, from 0. -1 until it's in the page.

### Reasons

`event.detail.reason` says why items opened or closed, for `valuechange` and every item's `openchange`.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `find-in-page` (`Event`): The browser's find in page matched hidden content.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

The element's `api` property has the same methods.

Every write method takes an optional `{ reason, event }`, fires the item and accordion events like a press, and returns `false` when the change is canceled or does nothing.

- `getValue()` (`() => T[]`): The open items' values.
- `setValue(value, options?)` (`(value: T[], options?: AccordionChangeOptions | undefined) => boolean`): Sets the open items. Only the first counts unless `multiple` is set. Returns false when canceled.
- `isOpen(value)` (`(value: T) => boolean`): Whether an item is open.
- `open(value, options?)` (`(value: T, options?: AccordionChangeOptions | undefined) => boolean`): Opens an item. With one item open at a time, closes the others.
- `close(value, options?)` (`(value: T, options?: AccordionChangeOptions | undefined) => boolean`): Closes an item, unless it's the one item that must stay open.
- `toggle(value, options?)` (`(value: T, options?: AccordionChangeOptions | undefined) => boolean`): Opens a closed item, or closes an open one.
- `openAll(options?)` (`(options?: AccordionChangeOptions | undefined) => boolean`): Opens every enabled item. Only when `multiple` is set.
- `closeAll(options?)` (`(options?: AccordionChangeOptions | undefined) => boolean`): Closes every item that may close.
- `focus(value?)` (`(value?: T | undefined) => void`): Moves focus to an item's trigger, or the first trigger.

### Events

Events fire on their own element and don't bubble, with the new state in `event.detail.value` and the details beside it. Calling `preventDefault()` on `valuechange` or `openchange` cancels the change.

| Member                     | On                  | Description                                                                                  |
| -------------------------- | ------------------- | -------------------------------------------------------------------------------------------- |
| `value` property           | `ui-accordion`      | The open items, as an array. Setting it, or the `value` attribute, opens them without events |
| `api` property             | `ui-accordion`      | The [controller](#controller)                                                                |
| `valuechange` event        | `ui-accordion`      | `detail: { value, reason, event, source }`                                                   |
| `openchange` event         | `ui-accordion-item` | `detail: { value: open, reason, event, source }`, before `valuechange`                       |
| `openchangecomplete` event | `ui-accordion-item` | `detail: { value: open }`, after the panel's animation                                       |

## Accessibility

The accordion follows the [WAI-ARIA accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/). Every line below is an automated test.

**Expanding and collapsing**

- The default item is expanded and shows its panel.
- Clicking a collapsed trigger expands it and collapses the open one.
- Clicking an expanded trigger collapses it.
- Clicking a disabled trigger does nothing.
- A change can be canceled.
- Without a default value, every item starts collapsed.
- A default value can expand several items.

**Multiple**

- Items expand and collapse independently.
- Every item can be expanded at once.

**Disabled**

- A disabled item's trigger is marked disabled and stays focusable.
- A disabled accordion disables every trigger.

**Keyboard**

- Tab moves through every trigger in order, disabled ones included.
- Enter toggles the focused trigger's panel.
- Space toggles the focused trigger's panel.
- Enter on a disabled trigger does nothing.
- Tab moves from an expanded trigger into its panel.
- Keys pressed in quick succession are never lost.
- Arrow keys leave focus where it is.

**Structure**

- Each trigger sits in a heading.
- The trigger controls its panel, and the panel is labelled by its trigger.

**Mounting**

- Collapsed panels leave the page by default.
- With keepMounted, collapsed panels stay in the page, hidden.
- With keepMounted, a class that sets display doesn't show collapsed panels.
- With hiddenUntilFound, collapsed panels stay findable.
- Finding text in a collapsed panel expands it.
- Following a link into a collapsed panel expands it.
- The browser's own find expands a collapsed panel.

Runs in React, Vue and web components.

Beyond the pattern's baseline:

**Enhancements**

- With collapsible off, the open trigger is marked disabled and stays open.
- Closing a panel that holds focus moves focus to its trigger.
- A canceled find in page keeps the panel hidden until found.
- An infinite exit animation still unmounts the panel.
- A controller expands and collapses items from anywhere.
- An item's onOpenChangeComplete runs once its panel has finished animating.
- Find in page opens a panel at once, without an animation.

Runs in React, Vue and web components.

Every panel is a region labelled by its trigger, so screen readers can list open panels as landmarks. With many panels open at once, such as `multiple` with Expand all, keep the number of items modest so that list stays short.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while using the accordion with a keyboard.

Runs in React, Vue and web components.
