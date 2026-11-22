# Introduction

Use unstyled custom elements with keyboard, focus, and screen reader support built in.

These docs cover ui-sdk in Web Components. Using another framework? See React, Vue, Svelte or Solid. To build your own components from behaviors, see [Core](./core.md).

`@ui-sdk/web` gives you components such as Select, Dialog, and Tabs as custom elements, built on ui-sdk's behaviors. They handle interactions, focus, and ARIA attributes. You write the HTML and styles.

Import the components you need to register their tags, add them to your page, and style them with your own CSS.

## Quick Start

Copy this prompt into your agent:

```text prompt
Set up ui-sdk in this Web Components project. Each component registers its tags when you import its entry, like @ui-sdk/web/dialog.

1. Install @ui-sdk/web and @ui-sdk/core with the project's package manager.
2. Add a note to AGENTS.md, creating it if needed: before using ui-sdk, follow the ui-sdk skill if it's installed, and read node_modules/@ui-sdk/web/docs/llms.txt. To build a new component, also search node_modules/@ui-sdk/web/docs/core.md by heading, and read rendering.md next to it.
3. If you support skills, run: npx skills add vercel-labs/ui --skill ui-sdk
```

It installs ui-sdk and points your `AGENTS.md` at the docs that ship with the packages.

## Set It Up Yourself

- [Installation](./installation.md): Install the packages and register their custom elements.
- [First Component](./first-component.md): Add and style your first component.

## Explore the Components

The [Using Components guides](./parts-and-composition.md) cover patterns the components share, such as composing parts, handling state, and styling.
