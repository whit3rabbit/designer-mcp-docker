<!-- ui-sdk Agents docs, as one file. -->

# Built for Agents

ui-sdk gives agents the building blocks to create components and the tools to use them.

## Agents Build Components

You can ask an agent to build a component for your app, from a toggle button to an emoji picker or a kanban board.

`@ui-sdk/core` gives it **behaviors**: tested building blocks for focus, keyboard navigation, selection, popups, drag and drop, and more. The agent combines them to handle the interactions your component needs.

A **primitive** brings a component's state, actions and parts together. Here's a small one: a mute button.

```ts
import { definePrimitive } from "@ui-sdk/core"

const muteButton = definePrimitive({
  name: "mute-button",
  state: () => ({ muted: false }),
  api: (context) => ({
    toggle: () => context.store.set({ muted: !context.store.get().muted }),
  }),
  slots: (slot) => ({
    root: slot({
      attrs: (state) => ({
        type: "button",
        "aria-pressed": String(state.muted),
      }),
      press: ({ api }) => api.toggle(),
    }),
  }),
})

export { muteButton }
```

Pressing the button changes `muted`, and `aria-pressed` follows it. The same primitive can render in React, Vue, Svelte, Solid and Web Components. [Build a Component](./core.md#build-a-component) walks through connecting it to your framework and adding styles.

The [component skill](./agents.md#skills) gives the agent a workflow to follow. Each package includes Markdown docs for the installed version, and the [testing kit](./core.md#testing) helps it check keyboard behavior, focus and ARIA in the finished component.

## Agents Use Your Components

Connect an agent to a UI built with ui-sdk and it can read component state and call component actions directly. For example, it can rename a project by calling the input's `setValue` action.

Create the bridge before the page renders. Import it from the same package as your components; this example uses React:

```ts
import { createAgent } from "@ui-sdk/react/agent"

const agent = createAgent()
```

Once the page has rendered, `agent.snapshot()` lists its components, their state and their available actions. For a project-name input, it includes:

```json
{
  "ref": "c1",
  "component": "input",
  "label": "Project name",
  "value": "Apollo",
  "actions": ["setValue", "clear"]
}
```

The agent can use that label to change the value:

```ts
await agent.act({
  steps: [{ ref: "Project name", action: "setValue", args: ["Atlas"] }],
})
```

The change goes through the input's API and change callback. Your app can provide an `allow` callback to approve or refuse requested actions. Change callbacks receive `source: "agent"` and can cancel a change too.

You can give these tools to your own agent, or register them with a supported browser through [WebMCP](./agents.md#webmcp).

## Benchmark

In a project-settings benchmark, agents renamed a project, updated members and notification settings, then saved. One used browser tools on a page built with another component library; the other used the agent bridge on the same screen built with ui-sdk.

|            | Browser tools | ui-sdk + agent bridge | Delta |
| ---------- | ------------- | --------------------- | ----- |
| Tool calls | 16            | **5**          | −69%  |
| Text read  | 39.8k         | **6.8k**       | −83%  |
| Time       | 41 s          | **16 s**       | −61%  |
| Cost       | $0.073        | **$0.032**     | −56%  |

These are medians from three runs per approach. Both agents used Sonnet through Claude Code with the same task and system prompt, plus instructions for their available tools. Every run completed the task. Text read counts characters returned by the tools. Time and cost are what Claude Code reported for those runs.

## Where to Start

- **[Build with an Agent](./agents.md#build-with-an-agent):** give it the docs, describe the component, and check its work.
- **[Connect an Agent](./agents.md#get-started):** set up the bridge, read your components, and call their actions.


# Build with an Agent

Give an agent the right context, build a small version, and check how it behaves.

Tell the agent what you're building, which framework you use, and how the component should behave. It can use ui-sdk's components and behaviors to put it together.

## Give It the Docs

Each package includes Markdown docs that match the version you installed. Choose your framework in the page header, then start with:

**React**

```text
This project uses React and ui-sdk. Read
node_modules/@ui-sdk/react/docs/llms.txt to see what's available.

For a custom component, read the relevant sections of docs/core.md
and docs/rendering.md in the same package.
```

**Vue**

```text
This project uses Vue and ui-sdk. Read
node_modules/@ui-sdk/vue/docs/llms.txt to see what's available.

For a custom component, read the relevant sections of docs/core.md
and docs/rendering.md in the same package.
```

**Svelte**

```text
This project uses Svelte and ui-sdk. Read
node_modules/@ui-sdk/svelte/docs/llms.txt to see what's available.

For a custom component, read the relevant sections of docs/core.md
and docs/rendering.md in the same package.
```

**Solid**

```text
This project uses Solid and ui-sdk. Read
node_modules/@ui-sdk/solid/docs/llms.txt to see what's available.

For a custom component, read the relevant sections of docs/core.md
and docs/rendering.md in the same package.
```

**Web Components**

```text
This project uses Web Components and ui-sdk. Read
node_modules/@ui-sdk/web/docs/llms.txt to see what's available.

For a custom component, read the relevant sections of docs/core.md
and docs/rendering.md in the same package.
```

For a page with no build step, like an Artifact, point it at web.md instead. It's the same docs in one file, for a page that loads `web.js` and `web.css`:

```text
This page loads ui-sdk with web.js and web.css. Read
https://ui-sdk.dev/web.md to see what's available.
```

`llms.txt` covers your framework's APIs. `core.md` covers the behaviors, and `rendering.md` explains how to render a primitive in your framework.

The [Core guides](./core.md#build-a-component) walk through the code. [All Behaviors](./core.md#all-behaviors) helps the agent find a building block for each interaction.

## Add the Skill

If your agent supports skills, install `ui-sdk`:

```bash
npx skills add vercel-labs/ui --skill ui-sdk
```

It gives the agent a workflow for choosing behaviors, defining a primitive, rendering it and testing it. The same skill ships with `@ui-sdk/core` in `node_modules/@ui-sdk/core/skills/`, so an agent without skills can read it there. [Skills](./agents.md#skills) shows how to use it. You can also work directly from the docs.

## Describe the Interaction

Give the agent a concrete example of what someone should be able to do. For an emoji picker:

**React**

```text
Build an emoji picker in React using ui-sdk.

Add a search input and a grid of emoji. Down from the search input
should move focus to the first result. Arrow keys move through the
grid, and Enter selects an emoji. Announce the selection to screen readers.

Use our existing styles.
```

**Vue**

```text
Build an emoji picker in Vue using ui-sdk.

Add a search input and a grid of emoji. Down from the search input
should move focus to the first result. Arrow keys move through the
grid, and Enter selects an emoji. Announce the selection to screen readers.

Use our existing styles.
```

**Svelte**

```text
Build an emoji picker in Svelte using ui-sdk.

Add a search input and a grid of emoji. Down from the search input
should move focus to the first result. Arrow keys move through the
grid, and Enter selects an emoji. Announce the selection to screen readers.

Use our existing styles.
```

**Solid**

```text
Build an emoji picker in Solid using ui-sdk.

Add a search input and a grid of emoji. Down from the search input
should move focus to the first result. Arrow keys move through the
grid, and Enter selects an emoji. Announce the selection to screen readers.

Use our existing styles.
```

**Web Components**

```text
Build an emoji picker as a web component using ui-sdk.

Add a search input and a grid of emoji. Down from the search input
should move focus to the first result. Arrow keys move through the
grid, and Enter selects an emoji. Announce the selection to screen readers.

Use our existing styles.
```

Include details that matter to your app, such as whether the picker opens in a popup or whether a parent component owns the selected value. The agent can choose the behaviors from those requirements.

## Start Small

Ask for one working example first:

```text
Start with a small, fixed list of emoji and one example page.
Reuse public ui-sdk components and behaviors where they fit.
```

Try that version, then ask for a specific change:

```text
When a search has no results, show "No emoji found" and keep focus
in the search input. Keep the input in the same position as results change.
```

This gives you something to review as the component takes shape.

## Check the Result

Ask the agent to test the interactions you described:

```text
Test moving from search into the grid, navigating with arrow keys,
and selecting with Enter. Check the empty search state and the
selection announcement too.

Run the project's typecheck and relevant tests. Tell me what passed
and anything you couldn't check.
```

The [testing guide](./core.md#testing) shows how to check a primitive with `@ui-sdk/core/testing`.

Try the example yourself too: Tab into the search input, search for an emoji, press Down, move with the arrows, and select with Enter. Then try a search with no results. These are the same interactions the agent's tests should cover.


# Skills

Help your agent build custom components with @ui-sdk/core.

`ui-sdk` helps your agent build a component ui-sdk doesn't ship, such as a rating, a stepper, or an emoji picker.

## Install the Skill

If your agent supports skills, install it with:

```bash
npx skills add vercel-labs/ui --skill ui-sdk
```

The skill also ships inside `@ui-sdk/core`, at `node_modules/@ui-sdk/core/skills/ui-sdk/SKILL.md`. That copy always matches the version you installed. If your agent doesn't support skills, point it there instead.

## Use the Skill

Mention the skill, your framework, and the interaction you want:

```text
Use ui-sdk to build a five-star rating in React.
Arrow keys should move between stars and choose a rating.
Use our existing styles and test the keyboard behavior.
```

The skill guides the agent through reading the installed docs, choosing behaviors, defining a primitive, rendering it in your framework, and testing the result. It supports React, Vue, Svelte, Solid, and Web Components.

[Build with an Agent](./agents.md#build-with-an-agent) shows how to give the agent context, refine the component, and check its work. The [Core guides](./core.md#build-a-component) explain the code it builds.


# Get Started

Let an agent read your components and call their actions.

`createAgent` connects an agent to the ui-sdk components in your app. It can read their state, find the actions they support, and call those actions through the component's API.

In this example, an agent reads a text field labeled "Project name" and changes it from "Apollo" to "Atlas".

For a complete app you can run, follow the [Guide](./agents.md#guide). It takes you from a Vite project to using a Select through the console and ChatGPT.

## Create the Bridge

Create the bridge once. These examples use React:

```ts title="agent.ts"
import { createAgent } from "@ui-sdk/react/agent"

const agent = createAgent()

export { agent }
```

The bridge finds the components already on the page when you create it, and registers new ones as they're created, so you can create it at startup or later, when an assistant opens.

Use the agent entry from the same package as your components:

| Framework      | Import From            |
| -------------- | ---------------------- |
| React          | `@ui-sdk/react/agent`  |
| Vue            | `@ui-sdk/vue/agent`    |
| Svelte         | `@ui-sdk/svelte/agent` |
| Solid          | `@ui-sdk/solid/agent`  |
| Web Components | `@ui-sdk/web/agent`    |

## Add a Component

Render a ui-sdk input with an accessible name:

```tsx
import { Input } from "@ui-sdk/react/input"
import "./agent"

function ProjectName() {
  return <Input aria-label="Project name" defaultValue="Apollo" />
}

export { ProjectName }
```

The name helps both people using a screen reader and agents identify the input. A [Field label](./components/field.md) works too.

## Read the Page

After the component renders, call `snapshot`:

```ts
import { agent } from "./agent"

const components = agent.snapshot()
```

For this page, it returns:

```json
[
  {
    "ref": "c1",
    "component": "input",
    "label": "Project name",
    "value": "Apollo",
    "actions": ["setValue", "clear"]
  }
]
```

`ref` identifies this component. `actions` lists what the agent can ask it to do now.

The snapshot includes ui-sdk components. It can also include components that left the page, such as a field in a closed tab, marked with `offPage: true`. A page with more than 100 components lists the first 100 and ends with an entry that says how many more there are; use `query` to find the rest.

## Change a Value

Use `act` to call one of the input's actions:

```ts
const result = await agent.act({
  steps: [{ ref: "Project name", action: "setValue", args: ["Atlas"] }],
})
```

The input now reads **Atlas**. Its `onValueChange` callback runs with `details.source === "agent"`, so your app can respond to the change or cancel it. [Permissions](./agents.md#permissions) covers those checks.

You can use the label or the `ref` from the snapshot. A label matches whole words regardless of case and accents, so `"project name"` works too. If a label is ambiguous, the bridge returns an error with the matches. Use a specific `ref` to choose one.

`result.steps` reports what each step changed, and `result.values` contains the current field values. A callback can cancel a change, so check those values when you need to know what took effect.

Put several steps in one call to run them in order. If a step fails, `result.ok` is `false` and `result.error` tells you which step failed and why. Earlier steps stay applied.

## Find List Items

For components with choices, such as a Select or Combobox, `query` with `within` lists the available values. For a Select labeled **Region**:

```ts
const [region] = await agent.query({ within: "Region", text: "Europe" })
```

`region.items` holds up to 50 matching choices, each with a `value` and `label`, and `region.more` says how many matched beyond that. Leave out `text` to list the first 50. Depending on how the component supplies its items, the bridge may briefly open it to read them.

`query` also finds components without listing the page. `agent.query({ text: "Europe" })` returns the components whose label or row text has that word, and lists whose choices match, with those choices under them. `kind` keeps one kind, such as `"select"`.

## Connect the Tools

`agentTools` describes `snapshot`, `act`, and `query` with names, descriptions, and JSON Schemas:

```ts
import { agentTools } from "@ui-sdk/react/agent"
```

Use these definitions when setting up your agent's tools. Route each tool call to the matching method on `agent` and return its result to the model. Your model SDK determines how you register and handle those calls.

What the tools return comes from the page, so it can include text your users wrote, like a name in a table row. Their descriptions tell the model to treat it as data. Before an agent changes something that matters, have a person confirm it with [Permissions](./agents.md#permissions).

For a browser that supports WebMCP, [register the tools with the browser](./agents.md#webmcp).

## Your Own Components

A component built with [`definePrimitive`](./core.md#define-a-primitive) joins the bridge too. Its `agent` key lists the API methods an agent can call, like `agent: { actions: ["setValue"] }`. Without one, methods named like changes, such as `setValue` or `toggle`, become its actions, and event handlers such as `keydown` stay internal.

The snapshot reads the primitive's `controlled` state keys. If none are declared, it reads `open`, `value`, and `checked` when present. [Your Own Components](./agents.md#your-own-components) shows how to add the key and what each part of it does.

## Next Steps

- [Permissions](./agents.md#permissions): approve, refuse, or cancel an agent's changes.
- [Observe Changes](./agents.md#observe-changes): keep the agent up to date with what the person changed.
- [History and Undo](./agents.md#history-and-undo): record changes, undo them, and preview suggestions.
- [WebMCP](./agents.md#webmcp): make the tools available to a browser agent.
- [Reference](./agents.md#reference): look up options, methods, and return values.


# Guide

Build a Vite app, try the agent bridge in the console, and let ChatGPT use it through WebMCP.

We'll build a Select for choosing a region. First, you'll read and change it from the browser console. Then you'll give ChatGPT the same tools and ask it to choose a region for you.

## Create a Vite App

Start with Vite's React and TypeScript template:

```bash
npm create vite@latest agent-demo -- --template react-ts
cd agent-demo
npm install
npm install @ui-sdk/react @ui-sdk/core
```

You'll need a Node.js version supported by [Vite](https://vite.dev/guide/). If the scaffolder offers to start the app, finish the files below first.

## Add a Select

Replace `src/App.tsx` with:

```tsx title="src/App.tsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"

const regions = [
  { value: "europe", label: "Europe" },
  { value: "north-america", label: "North America" },
  { value: "asia-pacific", label: "Asia Pacific" },
]

function App() {
  return (
    <main>
      <h1>Project Settings</h1>
      <Select defaultValue="europe" items={regions}>
        <SelectLabel className="select-label">Region</SelectLabel>
        <SelectTrigger className="select-trigger">
          <SelectValue />
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </SelectTrigger>
        <SelectContent className="select-content">
          {regions.map((region) => (
            <SelectItem
              key={region.value}
              value={region.value}
              className="select-item"
            >
              {region.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </main>
  )
}

export { App }
```

`SelectLabel` names the component **Region**. We'll use that name in the console and in our prompts. Passing `items` tells the Select every choice before its list renders, so the trigger shows **Europe** right away and the bridge can read the choices while the popup is closed.

Replace `src/index.css` with a few neutral styles:

```css title="src/index.css"
body {
  margin: 0;
  background: #fff;
  color: #171717;
  font:
    14px/1.5 system-ui,
    sans-serif;
}

main {
  max-width: 320px;
  margin: 80px auto;
  padding: 0 24px;
}

h1 {
  margin: 0 0 24px;
  font-size: 20px;
}

.select-label {
  display: block;
  margin-bottom: 8px;
}

.select-trigger {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #d4d4d4;
  border-radius: 8px;
  background: #fff;
  color: inherit;
  font: inherit;
}

.select-content {
  min-width: var(--anchor-width);
  max-height: var(--available-height);
  overflow-y: auto;
  padding: 4px;
  border: 1px solid #d4d4d4;
  border-radius: 8px;
  background: #fff;
}

.select-item {
  padding: 8px;
  border-radius: 4px;
  cursor: default;
}

.select-item[data-highlighted] {
  background: #f5f5f5;
}

.select-trigger:focus-visible,
.select-item:focus-visible {
  outline: 2px solid #171717;
  outline-offset: 2px;
}
```

## Initialize the Agent

Create `src/agent.ts`:

```ts title="src/agent.ts"
import { createAgent } from "@ui-sdk/react/agent"

const agent = createAgent()

Object.assign(window, { agent })

export { agent }
```

`Object.assign` makes the bridge available as `window.agent` in the console. It doesn't require a TypeScript declaration on `Window`.

Now replace `src/main.tsx`. Import `agent.ts` before rendering the app so the bridge sees the Select as it's created:

```tsx title="src/main.tsx"
import "./agent"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

Start the app on port 5173:

```bash
npm run dev -- --port 5173 --strictPort
```

Open [localhost:5173](http://localhost:5173). **Europe** should be selected. Open the Select and choose another region, or focus it and use the arrow keys to try it yourself.

## Read It from the Console

Open your browser's developer tools and select **Console**. Run:

```js
window.agent.snapshot()
```

You'll see a component with `component: "select"`, `label: "Region"`, its current `value`, and its available `actions`. Its `ref` is an identifier assigned by the bridge; we'll use the label **Region** in this guide.

List its choices:

```js
await window.agent.query({ within: "Region" })
```

This returns the Region Select with its three regions under `items`, each with a `value` and `label`. To filter the list, add some text:

```js
await window.agent.query({ within: "Region", text: "Asia" })
```

## Change the Selection

Run this in the same console:

```js
await window.agent.act({
  steps: [{ ref: "Region", action: "setValue", args: ["north-america"] }],
})
```

The Select should now show **North America**. The result includes `ok`, the changes made by each step, and the current field values.

You can also pass an item's label:

```js
await window.agent.act({
  steps: [{ ref: "Region", action: "setValue", args: ["Asia Pacific"] }],
})
```

Choose **Europe** yourself, then run `window.agent.snapshot()` again. The bridge reads the same selection you see on the page.

## Register the WebMCP Tools

Replace `src/agent.ts` with this version:

```ts title="src/agent.ts"
import { createAgent, registerTools } from "@ui-sdk/react/agent"

const agent = createAgent()

Object.assign(window, { agent })

const unregister = registerTools(agent, {
  allow: (step) => step.action !== "press" || confirm(`Press ${step.args[0]}?`),
})

if (import.meta.hot) {
  import.meta.hot.dispose(unregister)
}

export { agent }
```

`registerTools` publishes `snapshot`, `query`, and `act` through WebMCP when the browser supports it. Its `allow` asks you before the browser's agent presses a button. The cleanup removes the old registration when Vite replaces the module during development.

Reload the page after saving. `window.agent` is for the console exercise; WebMCP calls the bridge directly.

## Open the App in ChatGPT

Keep Vite running. In the **ChatGPT desktop app** on the same computer:

1. Start a Work conversation with a model that supports site tools.
2. Open the built-in browser and visit `http://localhost:5173`.
3. Select **Site tools** in the address bar, then **Available site tools**. Look for `snapshot`, `query`, and `act`.

ChatGPT discovers tools from the page open in that browser. Model and workspace availability are listed in [ChatGPT's site tools guide](https://learn.chatgpt.com/docs/webmcp).

Start with a prompt that only reads the page:

```text
Find the WebMCP tools available on this page. Use snapshot to tell me
which component is on the page and which region is selected.
```

Then ask it to read the choices:

```text
Use the page's query tool to list the choices for Region.
```

Finally, ask it to change the selection:

```text
Use the page's act tool to change Region to North America. Tell me
the selected value returned by the tool.
```

Review any access prompt from ChatGPT, then watch the Select update. In **Site tools**, use **Recently used** to check the calls it made.

You can also give it the whole task at once:

```text
Find this page's WebMCP tools, check the available regions, and select
Asia Pacific. Use the tool result to confirm the selected value.
```

## If the Tools Don't Appear

Check that you're viewing the Vite app in ChatGPT's built-in browser and that **Enable site tools** is on under **Settings → Browser → Permissions**. Open the app as the page itself; ChatGPT doesn't discover tools inside an iframe. See the [current requirements](https://learn.chatgpt.com/docs/webmcp) for supported models and workspaces.

In a browser's console, you can check whether the registration API exists:

```js
typeof document.modelContext?.registerTool
```

It should return `"function"` in a browser that supports registration. If it returns `"undefined"`, the console examples still work, but that browser won't receive WebMCP tools from `registerTools`.

## Keep Going

[Permissions](./agents.md#permissions) shows how to limit the actions an agent can run. [Observe Changes](./agents.md#observe-changes) keeps it informed when you change the UI. Use the [Reference](./agents.md#reference) to look up the bridge's options and results.


# Your Own Components

Let an agent use the components you build with definePrimitive, wherever they're rendered.

A component you build with [`definePrimitive`](./core.md#define-a-primitive) shows up in the agent's snapshot next to every Select and Dialog on the page. Add an `agent` key to say which of its methods an agent can call.

You write the key once, in the component. Anyone who renders the component gets it: an app that installs your rating from npm [creates the bridge](./agents.md#create-the-bridge), renders `<Rating>`, and its agent can rate, with no tool or schema to write.

## Try It

This rating has `agent: { actions: ["rate"] }`. Press **Read the page** to see what an agent sees, then **Ask for 4 stars** to send the step an agent would send.

## Add the Agent Key

Here's the rating's primitive. Its API has one method, `rate`:

```ts title="rating.ts"
const rating = definePrimitive({
  name: "rating",
  state: (options: { defaultValue?: number }) => ({
    value: options.defaultValue ?? 0,
  }),
  api: (context) => {
    const change = createChange(context)
    return {
      rate: (value: number, event?: Event) =>
        change("value", value, { reason: "item-press", event }),
    }
  },
  slots: (slot) => ({
    root: slot({ attrs: () => ({ role: "group" }) }),
  }),
  agent: { actions: ["rate"] },
})
```

`actions` lists the API methods an agent can call. Put `agent` last, after `slots`, so TypeScript has read your API by then.

With the key, the snapshot lists `rate`:

```json
[
  {
    "ref": "c1",
    "component": "rating",
    "actions": ["rate"],
    "label": "Your rating",
    "value": 0
  }
]
```

And an agent can call it with the arguments the method takes:

```ts
await agent.act({ steps: [{ ref: "Your rating", action: "rate", args: [4] }] })
// { ok: true, steps: [{ ref: "c1", changes: [{ key: "value", value: 4, ... }] }], ... }
```

The change goes through `createChange`, so the app's `onValueChange` sees `details.source === "agent"` and can cancel it, like any other change. [Permissions](./agents.md#permissions) covers that.

## Choose What an Agent Calls

Only the methods in `actions` are offered. The rest of your API, like a `keydown` handler or a roving focus helper, stays private to your component, and a step that names one is refused.

If `actions` names a method your API doesn't have, development builds warn, so a typo shows up right away.

Without an `agent` key, the bridge guesses from method names: `set` followed by a capital letter, like `setValue`, and verbs like `open`, `toggle` or `clear`. It can't guess `rate`, so the rating would show `"actions": []`, and a step that asks for `rate` would get:

```txt
rating c1 takes no rate now. It takes: nothing.
```

Listing your actions makes the component say exactly what it does, whatever its methods are called.

## Lists

When your component's value is always one of its items, like a size picker, add `closed: true`:

```ts
agent: { actions: ["setValue"], closed: true },
```

The agent can name an item by its label or its value. If it names something that isn't there, the step is refused with the real items, so it can try again:

```txt
No item "XL" in Size (c1). Its items: Small, Medium, Large.
```

The bridge reads the items from your state's `items`. If they live somewhere else, return them from `items`:

```ts
agent: { actions: ["setValue"], items: (api) => api.allItems() },
```

The snapshot shows the items with the component when there are 10 or fewer and none are on the page. That works for any action, not only `setValue`, so a stepper's `goTo` shows its steps. Longer lists come back from `query({ within })`.

## Content Behind Items

Tabs and accordions hide other components behind their closed items. Add `reveals: true` and, when an agent looks for something it can't find, the error lists the closed items it might be behind, so the agent can open one first:

```ts
agent: { actions: ["setValue"], closed: true, reveals: true },
```

## Show It When It Matters

`shown` decides whether an agent sees the component right now. A field wrapper, for example, only needs to show while it has errors, since its input already carries the label:

```ts
agent: { shown: (state) => state.errors.length > 0 },
```

## Secret Values

For a value an agent should never read, like a PIN, add `secret: true`. The agent can still fill it in, and the snapshot shows `"[redacted]"` instead of the value:

```ts
agent: { actions: ["setValue", "clear"], secret: true },
```

To hide one particular field instead, the app can mark it with `data-agent-secret`. See [Permissions](./agents.md#permissions).

## API Reference

| Key       | Type                 | Description                                                                                            |
| --------- | -------------------- | ------------------------------------------------------------------------------------------------------ |
| `actions` | `string[]`           | The API methods an agent can call. Without it, methods named like changes, such as `setValue`.         |
| `closed`  | `boolean`            | The value is always one of the items, so a step that names another item is refused.                    |
| `items`   | `(api) => unknown`   | The items as data, when they aren't the state's `items`.                                               |
| `reveals` | `boolean`            | Closed items hide other components. A component the agent can't find is reported as maybe behind them. |
| `shown`   | `(state) => boolean` | Whether an agent sees the component right now.                                                         |
| `secret`  | `boolean`            | The value is always redacted, in the snapshot, in step results and in `observe`.                       |

The `agent` key is experimental.


# Permissions

Choose what an agent can change, what it can see, and when to ask the person.

Use `allow` to choose which actions an agent can run. Use a component's change callback to reject a value before it's applied. These checks also apply when the agent uses [WebMCP](./agents.md#webmcp).

The examples below use the **Region** Select from the [Guide](./agents.md#guide).

## Choose the Actions

Without an `allow` callback, the bridge accepts supported actions. Add one to the `createAgent` call in `src/agent.ts` to let the agent change only Region:

```ts
import { createAgent } from "@ui-sdk/react/agent"

const agent = createAgent({
  allow: ({ component, label, action }) =>
    component === "select" && label === "Region" && action === "setValue",
})
```

Return `true` to let an action run or `false` to refuse it. On a refusal, `act` returns `ok: false` and stops. Any earlier steps stay applied.

The callback also receives `ref` and `args`. If the agent asks for an item by label, the bridge resolves it to a value first. For example, `"North America"` becomes `"north-america"`. A list whose items show only while it's open has to open to resolve a label, so the callback is asked first with the label, before it opens, and then with the value.

The callback runs before the step changes anything. A `press` that opens a closed menu or dialog to find its button asks before it opens, and closes it again when the answer is no.

## Ask First

To ask the person before changing Region, return their answer from `allow`:

```ts
import { createAgent } from "@ui-sdk/react/agent"

const agent = createAgent({
  allow: ({ component, label, action, args }) => {
    if (component !== "select" || label !== "Region" || action !== "setValue") {
      return false
    }

    return window.confirm(`Change Region to ${args[0]}?`)
  },
})
```

Try changing Region through the console or ChatGPT again. **OK** allows the change; **Cancel** refuses it.

For your own confirmation UI, return a `Promise<boolean>` that resolves with the person's answer. The bridge waits before running the action. Later `act` and `query` calls on the same bridge wait too. If nobody answers within 5 minutes, the step fails and the `signal` passed to `allow` aborts, so you can close your prompt. Set `timeout` on `createAgent` to change the wait.

## Mark What Needs a Person

Some controls should always wait for the person, whatever your `allow` rules say. Add `data-agent-confirm` with a sentence that says what the control does:

```tsx
<Button
  data-agent-confirm="Charges $20 to your card for 1,000 credits"
  onClick={buyCredits}
>
  Buy credits
</Button>
```

The snapshot lists the button with `confirm: "Charges $20 to your card for 1,000 credits"`, so the agent knows before it tries. Without an `allow` callback, pressing it fails with:

```text
Needs a person: "Charges $20 to your card for 1,000 credits". Ask them to press "Buy credits" themselves.
```

With `allow`, the step waits for your callback, and `step.confirm` carries the sentence. Show it to the person and return their answer:

```ts
const agent = createAgent({
  allow: (step, { signal }) =>
    step.confirm ? showConfirm(step.confirm, { signal }) : true,
})
```

If the person says no, the step fails with `The person said no to "…"`.

The mark covers its element and everything inside it, for any action. Put it on a form or section to cover every control in it, or on a dialog's content to cover the buttons inside, wherever the dialog renders.

## Keep Parts of the Page from the Agent

Two more marks change what the agent sees:

| Attribute           | What the Agent Gets                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `data-agent-hidden` | Nothing. Components inside are left out of `snapshot` and `query`, and a step that names one is told to ask the person. |
| `data-agent-secret` | The component, with its value shown as `"[redacted]"` once it's filled. The agent can still type into it.               |

```tsx
<section data-agent-hidden>
  <RecoveryCodes />
</section>

<Field data-agent-secret>
  <FieldLabel>Tax ID</FieldLabel>
  <Input />
</Field>
```

Changes inside `data-agent-hidden` still reach [Observe](./agents.md#observe-changes), so your own logs see them, while `agent.subscribe` stays quiet. A secret value stays out of `snapshot`, `act` results and change events, and the field's error text reads `"[redacted]"` too. Password, card and one-time-code fields are treated as secret without a mark.

In development, a misspelled mark such as `data-agent-confim` logs a warning with the name it meant.

## Cancel a Value Change

An agent's changes reach the same callbacks as a person's changes. Check `details.source` to tell them apart, and call `details.cancel()` to keep the current value.

For example, add this prop to the Select in `src/App.tsx` to refuse an agent's request to choose Asia Pacific:

```tsx
onValueChange={(value, details) => {
  if (details.source === "agent" && value === "asia-pacific") {
    details.cancel()
  }
}}
```

You can still choose Asia Pacific yourself. To apply the rule to every change, remove the `details.source === "agent"` check.

Canceling a value change can leave `act` with `ok: true` and no change for that step. Check each step's `changes` and the returned `values` to confirm what happened.

Put value checks in these change callbacks. Actions such as `setValue` call the component's API directly, so checks in keyboard or pointer handlers won't run.

## What `allow` Covers

`allow` checks actions. Components and their actions remain visible in `snapshot()`, and the agent can still read choices with `query()`. Use `data-agent-hidden` to keep a region out of view.

Finding a component or its choices can open a section or popup before the requested action is checked. `query()` may also briefly open a popup to read its choices. Use the component's `onOpenChange` or equivalent callback if you need to reject those changes too.

The [Reference](./agents.md#reference) lists the fields passed to `allow` and the results returned by `act`.


# Observe Changes

Keep an agent informed when someone changes the UI.

`agent.subscribe` reports changes to ui-sdk components. Collect them between turns so the agent knows what changed since it last read the page.

Reuse the bridge from the [Guide](./agents.md#guide). The examples below go in a module that runs when your app starts.

## Collect Changes

This subscription collects changes made outside the bridge. That includes a person's interactions and changes made by your application:

```ts
import type { ObservedChange } from "@ui-sdk/react/observe"
import { agent } from "./agent"

const changes: ObservedChange[] = []

const stop = agent.subscribe((change) => {
  if (change.source !== "agent") {
    changes.push(change)
  }
})
```

Before the agent's next turn, take the queued changes:

```ts
const recentChanges = changes.splice(0)
```

Include `recentChanges` in the context you send to your model. `splice(0)` returns the collected changes and empties the queue. Leave out the source check above if you want to collect the agent's changes too.

A change a Button's handler makes after an `await` reports `"programmatic"`, even when the agent pressed the button, unless the handler passes the press's source on with `withSource`. [Observe](./core.md#keep-the-source-after-an-await) shows how.

## Read a Change

Choosing **North America** in the Guide's Select produces a change that includes:

```json
{
  "label": "Region",
  "key": "value",
  "previous": "europe",
  "value": "north-america",
  "reason": "item-press",
  "source": "mouse"
}
```

This describes clicking the option while Europe was selected. Its `ref` identifies the component in a snapshot and can be used in an `act` step. The [Reference](./agents.md#subscribelistener) lists all the fields.

Changes canceled with `details.cancel()` aren't reported. For a controlled component, the notification reports the requested change before the owner passes the value back. It isn't confirmation that the owner accepted it.

Password, card and one-time-code fields report `"[redacted]"` for both `value` and `previous`.

## When Changes Arrive

A slider drag reports one change when it finishes, with `previous` set to the value before the drag. State that doesn't commit, such as a text field's input, reports each change. Changes made by the agent or application arrive immediately.

The subscription gives you one stream of changes. It doesn't emit a separate commit notification. For intermediate steps or a subscription limited to part of the page, use [Observe](./core.md#observe).

## Stop Listening

When you no longer need the subscription, call the function it returned:

```ts
stop()
```

To record changes you can step back through, see [History and Undo](./agents.md#history-and-undo).


# History and Undo

Record component values, step through changes and try suggestions you can revert.

`createHistory` records changes to component values. `stageChanges` applies a set of values and gives you a way to restore the previous ones. Both use the agent bridge to change the controls.

For undo inside one component, like a drawing or a board, record its value with [`createUndoStack`](./core.md#undo) instead.

These helpers are experimental. The examples reuse the bridge from the [Guide](./agents.md#guide), including its permission policy. Import the helpers from your framework's `history` entry or `@ui-sdk/core/history`.

## Start Recording

Start recording before the changes you want to keep:

```ts
import { createHistory } from "@ui-sdk/react/history"
import { agent } from "./agent"

const history = createHistory(agent)
```

By default, the history records `value`, `checked` and `pressed` changes across the page, from people, agents, and your app. Use `within` to limit it to one element, such as the Guide's `<main>`:

```ts
const history = createHistory(agent, {
  within: () => document.querySelector("main"),
  keys: ["value", "checked"],
})
```

`within` accepts an element or a function that returns one. `keys` replaces the list of state keys to record. Restoring a key uses its `set<Key>` action, such as `setValue` or `setChecked`, so choose keys the component can set through the bridge.

Keep password, card and one-time-code fields outside the recorded panel. Their values are redacted, so the history can't restore the originals: their entries carry `redacted: true`, and seeking or undoing leaves those fields as they are and reports them among the changes it couldn't put back.

## Read the History

`history.entries()` returns entries from oldest to newest. Each has an `id`, component `ref`, `label`, state `key`, `value`, `previous`, `source` and `reason`.

Use `describeEntry` when you want a short sentence for each entry:

```ts
import { describeEntry } from "@ui-sdk/react/history"

const labels = history.entries().map(describeEntry)
```

For example: "Agent set Project name to Atlas". `history.position()` tells you how far you are through the entries. It starts at `0`; the end is `history.entries().length`.

`history.subscribe(listener)` calls a listener when the entries or position change. Read them inside the listener to update your history UI. It returns a function that unsubscribes.

## Step Back and Forward

Pass an entry count to `seek`. These calls return to the start of the recorded history, then apply it again:

```ts
await history.seek(0)
await history.seek(history.entries().length)
```

`seek` clamps the position to the available history. If someone makes a new recorded change after seeking back, the history drops the entries after that position, like undo in an editor.

The history restores recorded component values. It doesn't undo a network request, recreate a removed component or reverse an action such as saving a form. Restoration goes through `agent.act`, one control at a time, so current permissions, disabled state and change callbacks still apply, and a control that's refused or has left the page doesn't stop the others.

`seek` resolves with the changes it couldn't put back, each as `{ ref, key, value }`, and with an empty array when everything went back. If nothing went back, the position stays where it was.

The history doesn't record its own restoring, but it records every other change made meanwhile. When someone changes a control the history hasn't restored yet, their change stays, and the control is in the result.

## Undo the Agent's Changes

Use `undoSource` to remove the effect of one source from the applied history:

```ts
await history.undoSource("agent")
```

It restores each affected key to its latest value from the other sources, or to its starting value if there isn't one. For example, if a person changes the project name after the agent does, that person's value stays.

The entries it put back remain in the history with `reverted: true`, and seeking through the history continues to skip them. Like `seek`, `undoSource` resolves with the changes it couldn't put back, and their entries stay applied. The same method accepts other source names, such as `"keyboard"` or `"programmatic"`.

A Button whose handler awaits needs one more step. A change the handler makes after the `await` happens once the press is over, so it's recorded as `"programmatic"` and `undoSource("agent")` leaves it. Wrap it in `withSource` with the source the handler receives:

```tsx
import { Button } from "@ui-sdk/react/button"
import { withSource } from "@ui-sdk/react/observe"

function SaveButton() {
  return (
    <Button
      onClick={async (event, { source }) => {
        await save()
        withSource(source, () => status.setValue("Saved"))
      }}
    >
      Save
    </Button>
  )
}
```

Here `status` is an Input's controller. When the agent presses Save, the new status is recorded as the agent's. See [Observe](./core.md#keep-the-source-after-an-await) for how sources work.

## Keep Interactions Together

A drag that commits arrives as one entry. The history also combines consecutive changes with the same component, key, source and reason, except for `item-press` and `imperative` changes.

To record every intermediate step instead, turn coalescing off:

```ts
const history = createHistory(agent, { coalesce: false })
```

Call `history.clear()` to forget every entry and keep the controls as they are. Call `history.destroy()` when you're done to stop recording and remove its listeners.

## Try a Suggestion

`stageChanges` puts suggested values on the real controls. Try a different region in the Guide's Select:

```ts
import { stageChanges } from "@ui-sdk/react/history"

const staged = await stageChanges(agent, [
  { ref: "Region", value: "north-america" },
])
```

Each change is `{ ref, key?, value }`. `key` defaults to `"value"`; use `"checked"` for a checkbox. The component must be mounted, expose that key in its snapshot, and advertise the matching `set<Key>` action.

Staging accepts a ref or an exact label. It uses the first component with a matching label, so use a ref from `snapshot()` when labels repeat.

Missing components, unavailable setters and refused actions are skipped, and the remaining suggestions are still attempted. `staged.applied` lists successful calls as `{ ref, key, before, value }`. As with `act`, a successful call doesn't prove a controlled owner accepted the value or that a change callback didn't cancel it; read the component state when you need to confirm.

If the person rejects the suggestion, restore the captured values:

```ts
await staged.revert()
```

`revert` runs once, in reverse order, through the same action policy and callbacks. It attempts to restore the captured values even if the person has edited those controls since the preview, and resolves with the entries of `staged.applied` it couldn't put back. A filled password, card or one-time-code field's `before` reads `"[redacted]"`, so `revert` leaves that field as staged and includes it in the result. If the person accepts the suggestion, leave the values in place.

To point at a suggested control, use `elementOf(ref)` from [Observe](./core.md#observe) with one of the refs in `staged.applied`.


# WebMCP

Let the agent built into a browser read and use your components.

`registerTools` exposes `snapshot`, `act`, and `query` through the browser's `document.modelContext` API. It uses the bridge you created in [Get Started](./agents.md#get-started), so you register the tools once for your app.

For a complete example with ChatGPT prompts, follow the [Guide](./agents.md#guide).

## Register the Tools

Import `registerTools` from the same package as your bridge:

```ts
import { registerTools } from "@ui-sdk/react/agent"
import { agent } from "./agent"

const unregister = registerTools(agent, {
  allow: (step) => step.action !== "press" || confirm(`Press ${step.args[0]}?`),
})
```

The browser's agent can now read components and call their actions. You didn't write that agent, so `registerTools` asks for an `allow` of its own. It runs for every step the browser's agent asks for, after your bridge's [permissions](./agents.md#permissions), and works the same way: return `false` to refuse a step. Here it asks you before every press. To let every step run, pass `allow: () => true`. Your change callbacks still apply.

Registration requires a browser that provides `document.modelContext.registerTool`. In a browser without it, `registerTools` does nothing.

## Remove the Tools

Call the returned function when your integration is no longer needed:

```ts
unregister()
```

This removes the browser tools. You can still call methods on `agent` directly.

## Tool Annotations

`snapshot` and `query` have `readOnlyHint: true`. All three tools have `untrustedContentHint: true` because their results include page content, such as labels and text people entered.

These are hints for the tool consumer. `snapshot` and `query` never open a component. Use [Permissions](./agents.md#permissions) to decide which requested actions your app accepts.


# Reference

The bridge's methods, tool definitions, and the data they return.

Import these APIs from your framework's agent entry, such as `@ui-sdk/react/agent`. Vue, Svelte, Solid, and Web Components use `@ui-sdk/vue/agent`, `@ui-sdk/svelte/agent`, `@ui-sdk/solid/agent`, and `@ui-sdk/web/agent`.

Start with [Get Started](./agents.md#get-started) for the basic calls, or follow the [Guide](./agents.md#guide) to try them in a Vite app and ChatGPT.

## createAgent(options?)

Creates a bridge with `snapshot`, `act`, `query`, and `subscribe`:

```ts
import { createAgent } from "@ui-sdk/react/agent"

const agent = createAgent()
```

Create it once, in the browser, at startup or later. It finds the components already on the page and registers new ones as they're created; importing the entry alone doesn't start registration. Use the same package as your components so they share one copy of the core.

| Option    | Type                                                                                   | What It Does                                                                                                       |
| --------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `allow`   | `(step: AgentAction, context: { signal: AbortSignal }) => boolean \| Promise<boolean>` | Decides whether a resolved action may run. Returning `false` refuses it.                                           |
| `timeout` | `number`                                                                               | How long a step waits for `allow`, in milliseconds. 5 minutes by default. Then the step fails and `signal` aborts. |

`AgentAction` has `ref`, `component`, optional `label`, `action`, `args`, and `confirm`, the text of a `data-agent-confirm` mark on the target. The arguments may already be resolved, such as an item's label becoming its value. Without `allow`, a step with `confirm` fails with "Needs a person". See [Permissions](./agents.md#mark-what-needs-a-person).

Finding a target or its choices may open UI before the final action is checked. See [Permissions](./agents.md#permissions) for the scope of `allow` and change cancellation.

The bridge has no `destroy` method. Stop subscriptions with their returned cleanup functions, and remove WebMCP tools with the cleanup from `registerTools`.

## snapshot()

Returns an `AgentComponent[]` synchronously. Call it after the components have mounted:

```ts
const components = agent.snapshot()
```

Each entry describes one registered component with bound elements, or a remembered component that left the page. Components inside `data-agent-hidden` are left out. Past 100 entries, the snapshot keeps open popups, fills up to 100, and ends with `{ ref: "more", component: "more", more, use: "query", actions: [] }`, where `more` is how many it left out.

| Field                                                                          | What It Contains                                                                                                |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `ref`                                                                          | The component's identifier, such as `"c1"`. Use it in `act` and `query`.                                        |
| `component`                                                                    | Its kind, such as `"input"`, `"select"`, or a custom primitive's name.                                          |
| `label`                                                                        | Its accessible name, when available.                                                                            |
| `row`                                                                          | Nearby row text that helps identify it, such as the person beside a menu.                                       |
| State keys                                                                     | Its exposed state, commonly `value`, `checked`, or `open`. See [Custom Primitives](#custom-primitives).         |
| `min`, `max`, `step`, `placeholder`, `query`, `multiple`, `required`, `errors` | Additional state when present and meaningful.                                                                   |
| `items`                                                                        | Included choices as `{ value, label }[]`. Use `query()` when the snapshot doesn't include the choices you need. |
| `text`                                                                         | Text from its title, description, and error parts.                                                              |
| `buttons`                                                                      | Button text inside an open component.                                                                           |
| `pending`, `error`                                                             | Whether a component action is still running, or its error as text.                                              |
| `disabled`                                                                     | `true` when the bridge considers the component unavailable. Its `actions` are then empty.                       |
| `offPage`                                                                      | `true` for a remembered component that left the page. Its `actions` are empty.                                  |
| `confirm`                                                                      | The text of a `data-agent-confirm` mark. A step on it needs the person.                                         |
| `source`                                                                       | Where the app writes it, such as `"components/header.tsx:24"`. Development builds only; see below.              |
| `actions`                                                                      | Action names available to request, such as `setValue`, `setChecked`, or `press`.                                |

A password, card, or one-time-code field's value, or one inside `data-agent-secret`, shows as `"[redacted]"` once it's filled, here, in `act`'s values and changes, and in `subscribe`. Password Input and OTP Input stay redacted while their text is shown.

In development, `source` comes from a `data-review-loc="file:line"` attribute on the component's element or the nearest element around it, or from Svelte's own element locations. Add the attribute at build time to let an agent go from a component to the code that renders it. Production builds leave `source` out.

Remembered entries keep their last exposed state. The bridge retains up to 50 of them; password, card, one-time-code, and `data-agent-secret` fields aren't kept after they leave. An off-page entry can't be acted on until its component is available again.

## act(\{ steps \})

Runs actions in order and returns a promise of the result:

```ts
const result = await agent.act({
  steps: [
    { ref: "Project name", action: "setValue", args: ["Atlas"] },
    { ref: "Save", action: "press" },
  ],
})
```

### Steps

Each step is an `AgentStep`:

| Field    | Type        | What It Does                                                        |
| -------- | ----------- | ------------------------------------------------------------------- |
| `ref`    | `string`    | Identifies a component by its ref, label, nearby row text, or kind. |
| `action` | `string`    | Names an action, usually taken from a snapshot entry’s `actions`.   |
| `args`   | `unknown[]` | Supplies the action's arguments. Defaults to an empty array.        |

Use a specific ref when a name is ambiguous. A step can reach a component revealed by an earlier step. The bridge can also look for a target inside closed accordion sections.

For choices, an argument can be the item's value or its label. Labels match regardless of case and accents, like component names; values match exactly. Ambiguous item labels are refused. When a list's items show only while it's open, `setValue` with a label asks `allow` with the label before it opens the list to read them, then again with the item's value. Numeric `setValue` actions also accept text that starts with a number, such as `"90 days"`.

A `set` action's first argument is checked against the kind of the option it sets in the primitive's schema, like `setChecked` against `checked`. A `"boolean"` option takes only `true` or `false`, a `"number"` option takes a number or text that is one, like `"3"`, and an option read by an attribute parser takes what that parser reads, so a resizable group takes `"30,70"` as its layout but a checkbox refuses `"yes"`. A value the kind doesn't take fails the step, with the type it expects, and changes nothing.

`press` without arguments clicks the component's own button. `press` with a button's text finds and clicks that button inside the component, opening a closed menu or dialog if needed. `allow` decides the press before anything opens; if the button it finds carries a `data-agent-confirm` mark, `allow` is asked again with `confirm`, and a refusal closes what the press opened. The text matches a button's whole text, or whole words in it; when two buttons match, the step fails. It waits up to 15 seconds for a ui-sdk Button's action, and any other action waits the same way for its component's work. An action error fails the step; an action still running after that limit is reported as pending in the step's result.

Other actions call the component's API directly. They don't simulate pointer or keyboard input. Text inputs can still emit an `input` event, and the bridge triggers blur validation on a containing Field. A method returning a promise is reported as `"pending"`; the bridge doesn't wait for arbitrary API promises to resolve. A promise that rejects before the step ends fails the step with its message.

### How a Step Finds Its Component

Every component in a snapshot has a ref, such as `c3`, that stays the same while it's on the page. A step can use that ref, or name the component in the words of the task:

```ts
const step = { ref: "Region", action: "setValue", args: ["North America"] }
```

The bridge tries these in order and uses the first that fits:

1. A ref, such as `"c3"`.
2. A label, or whole words in a label or row text, such as `"Region"`. `"Name"` finds "Display name", not "Username".
3. An item the component offers, such as an accordion's "Email" section.
4. The component's kind, such as `"slider"`.

Names match regardless of case and accents, so `"Region"` finds "Région" and `"strasse"` finds "Straße".

When a name fits more than one component, the step fails and lists each one's ref, label and row text, such as `"Jane Doe" names 2 components: c1 Admin (Jane Doe), c4 Jane Doe. Use a ref.` Retry the step with one of those refs. That holds even when one label matches exactly, since labels and rows are page text anyone can write, like a person's display name. If exactly one of them takes the step's action, like a Textarea and the Trigger Menu on the same field for `setValue`, the step uses that one. Otherwise, if exactly one of them is an open popup, the step uses that one.

A returning component can reuse a remembered ref when its kind, label, and row text match. The bridge remembers refs for the last 500 that left. Identical components receive remembered refs in the order they return. Read a fresh snapshot after reordering or renaming components instead of assuming each ref still names the same control.

Each entry in the result's `steps` names the ref it acted on, so you can see which component changed.

### Result

| Field      | What It Contains                                                                                                                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ok`       | Whether every step ran without a bridge error.                                                                                                                                                                                                                                                                                 |
| `error`    | When a step fails: `{ step, message }`. The step index starts at zero.                                                                                                                                                                                                                                                         |
| `steps`    | Completed steps as `{ step, ref, result?, changes?, gone? }`.                                                                                                                                                                                                                                                                  |
| `open`     | Components acted on that remain open, when any do.                                                                                                                                                                                                                                                                             |
| `appeared` | Components that appeared during the call and remain on the page.                                                                                                                                                                                                                                                               |
| `values`   | A record of exposed `value` and `checked` fields, keyed by ref and label, such as `"c1 Project name"`. Includes remembered fields; currently open components are omitted. On a page with more than 100 fields, it keeps the ones the steps acted on or changed, then others up to 100, and `more` says how many were left out. |

Each change is `{ component, label?, key, value }`. `gone` lists components that left the page, using their refs with labels when available.

A failed step stops the call. Earlier steps stay applied; there is no rollback. A callback can also cancel a change without making the step fail, so `ok: true` doesn't mean every requested value was accepted. Inspect each step's `changes` and the returned `values` to see what took effect.

`act` and `query` calls on the same bridge are queued in the order they're called.

## query(\{ text?, within?, kind? \})

Finds components and their choices without listing the page, and returns a promise:

```ts
const [region] = await agent.query({ within: "Region", text: "Europe" })
```

| Input    | What It Does                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `text`   | Matches a component's label or row text by whole words, regardless of case and accents. A list whose choices match comes back with only those choices. |
| `within` | Names one list by its ref or label, and returns it with its choices, matching `text` when given.                                                       |
| `kind`   | Keeps one kind of component, such as `"select"`.                                                                                                       |

Pass at least one. Returns an `AgentComponent[]` of up to 100 entries, ending with a `more` entry like the snapshot's when there were more. A list's `items` hold up to 50 matching choices as `{ value, label }`, with `more` set to how many matched beyond that. A choice matches `text` by a case- and accent-insensitive substring of its label or value. An unknown or ambiguous `within`, or a call with no input, returns `{ error: string }`. Components that left the page are included with `offPage: true`.

With `within`, the bridge reads item data or rendered parts, and never opens the component. If neither supplies choices, `items` is empty and `note` says that `act`'s `setValue` takes an item's label and opens the list to find it. Tree data includes closed branches. This method doesn't search inside closed accordion sections for the component itself.

## subscribe(listener)

Calls the listener when a component reports a settled change and returns an unsubscribe function:

```ts
const unsubscribe = agent.subscribe((change) => {
  console.log(change.label, change.key, change.value)
})
```

The listener receives an `ObservedChange`:

| Fields                     | What They Identify                                                      |
| -------------------------- | ----------------------------------------------------------------------- |
| `ref`, `id`, `component`   | The bridge ref, primitive instance id, and component kind.              |
| `label`, `row`             | Optional accessible name and nearby row text.                           |
| `key`, `value`, `previous` | The state key, requested value, and previous value.                     |
| `reason`, `source`         | Why the change happened and which input caused it, including `"agent"`. |

Both people's and agents' changes are reported. A committed interaction, such as a slider drag, arrives once at the end. A controlled component's parent may not accept the requested value. Sensitive field values are reported as `"[redacted]"`.

Call `unsubscribe()` when you're done. See [Observe Changes](./agents.md#observe-changes) for keeping an agent up to date, or [History and Undo](./agents.md#history-and-undo) for recording and reverting changes.

## agentTools

The definitions of the three tools: `snapshot`, `act`, and `query`.

```ts
import { agentTools } from "@ui-sdk/react/agent"
```

Each definition is `{ name, description, inputSchema }`. Adapt it to your model SDK's tool format, route calls to the matching bridge method in the page, and return the result to the model. These definitions don't create a model connection or run a tool loop for you.

## registerTools(agent, \{ allow \})

Registers the three tools with `document.modelContext.registerTool` when the browser provides it:

```ts
import { registerTools } from "@ui-sdk/react/agent"

const unregister = registerTools(agent, {
  allow: (step) => step.action !== "press" || confirm(`Press ${step.args[0]}?`),
})
```

`allow` is required. It decides each step the browser's agent asks for, after the bridge's own `allow`, and works the same way: return `false` to refuse the step, or `true` to let every step run. It returns a cleanup function. In a browser without WebMCP, registration does nothing. See [WebMCP](./agents.md#webmcp) for registration, cleanup, and tool annotations.

## Custom Primitives

A primitive created with `definePrimitive` can join the bridge without a separate tool definition. Give it an accessible name, and list what an agent can do in its `agent` key:

```ts
const sizePicker = definePrimitive({
  name: "size-picker",
  // state, api and slots
  agent: { actions: ["setValue", "clear"], closed: true },
})
```

| Key       | Description                                                                                                           |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| `actions` | The api methods an agent can call. Development builds warn about a name the api doesn't have.                         |
| `closed`  | Its value is always one of its items, so the bridge refuses text that names none of them.                             |
| `items`   | A function from the api to its items, when they aren't in the state's `items`.                                        |
| `reveals` | Its closed items hide other components, like tabs. When a step names a component it can't find, the error lists them. |
| `shown`   | A function from the state that says whether the agent sees it now, like a field only while it has errors.             |
| `secret`  | Its value is always redacted, like a password's.                                                                      |

[Your Own Components](./agents.md#your-own-components) walks through each key with examples.

Without `actions`, the bridge picks methods by name: `set` followed by a capital letter, such as `setValue`, and these verbs alone or followed by a capital letter:

`open`, `close`, `toggle`, `select`, `clear`, `next`, `previous`, `first`, `last`, `play`, `pause`, `show`, `hide`, `expand`, `collapse`, `increment`, `decrement`, `reset`, `submit`, `add`, `remove`, `insert`.

Methods such as `keydown`, `focus`, and `moveBy` aren't picked. Some aliases, such as `open` when `setOpen` is an action, are left out of `actions` but remain callable.

An action receives the supplied `args` as its method arguments. Only a `set` action's first argument whose option has a `"boolean"` or `"number"` kind or an attribute parser is checked; the rest, and every argument of an action with no option of its name, like `rate`, arrive unchecked, so check them in the method. Make optional details usable without a DOM event, and route user-facing changes through `createChange` so callbacks can report their source and cancel them.

The snapshot exposes the state keys named in `controlled`. Without that declaration, it includes `open`, `value`, and `checked` when present, along with the status fields listed above. Declare custom keys such as `muted` in `controlled` when they belong in the snapshot. This is separate from whether a parent is currently controlling the value.
