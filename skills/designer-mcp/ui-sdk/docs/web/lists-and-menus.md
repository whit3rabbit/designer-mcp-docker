# Lists and Menus

Supply options as data, load them from a server, and define menu actions.

Select, Combobox, Autocomplete, and Listbox accept items as a property. Use this when your choices already come from an array. You can also write their item parts in HTML.

## Start with Strings

```html
<ui-select>
  <ui-select-trigger
    ><button aria-label="Fruit">
      <ui-select-value placeholder="Choose a fruit"></ui-select-value></button
  ></ui-select-trigger>
  <ui-select-content>
    <ui-select-list></ui-select-list>
  </ui-select-content>
</ui-select>
```

```ts
import "@ui-sdk/web/select"

const select = document.querySelector("ui-select")!
select.items = ["Apple", "Banana", "Pear"]
```

Each string is both its value and its label. For different values and labels, use `{ value: "apple", label: "Apple" }`. Items can also have `disabled` and `keywords`.

Group choices with `{ type: "group", label, items }`, or separate them with `{ type: "separator" }`. Annotate the array with `ListData` and your editor checks every entry where you write it:

```ts
import type { ListData } from "@ui-sdk/core/select"

const plans: ListData = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { type: "separator" },
  {
    type: "group",
    label: "Contact sales",
    items: [{ value: "enterprise", label: "Enterprise" }],
  },
]
```

For object values, set the `itemToValue` and `itemToLabel` properties, and write the type as `ListData<Plan>`. [Select](./components/select.md) has complete examples.

Trigger Menu uses a `triggers` property for its trigger definitions; see [Trigger Menu](./components/trigger-menu.md).

## Search and Load Items

The `filter` attribute chooses a matching mode, such as `filter="startsWith"`. Assign a function to the `filter` property for your own matching. [Async Options](./utilities/async-options.md) covers loading from a server.

Data lists can virtualize large collections.

## Define a Menu

```html
<ui-menu>
  <ui-menu-trigger><button>File</button></ui-menu-trigger>
</ui-menu>
```

```ts
import "@ui-sdk/web/menu"
import type { MenuData } from "@ui-sdk/web"

const fileMenu: MenuData = [
  { value: "open", label: "Open", shortcut: "mod+o" },
  { type: "separator" },
  {
    type: "submenu",
    label: "Share",
    items: [{ value: "email", label: "Email" }],
  },
]

const menu = document.querySelector("ui-menu")!
menu.items = fileMenu
menu.addEventListener("action", (event) => console.log(event.detail.value))
```

A plain string is an action whose value and label are the string. [Menu](./components/menu.md) covers checkbox items and radio groups. Commands use `CommandData` and trigger menus `TriggerMenuData`, the same entries with fields of their own, and trees `TreeItemData[]`.

## Style Parts from Data

Parts rendered from data start out bare, with no classes. To style them, put a `<template>` inside the element and write each part there once, the way you want it to look. Every part the element renders is a copy of the part with the same tag in its template, classes and content included.

```html
<ui-select default-value="pro">
  <ui-select-trigger>
    <button><ui-select-value></ui-select-value></button>
  </ui-select-trigger>
  <template>
    <ui-select-content class="rounded-2xl bg-white p-1 shadow-lg">
      <ui-select-group>
        <ui-select-group-label
          class="px-2 py-1 text-xs text-neutral-500"
        ></ui-select-group-label>
        <ui-select-item
          class="relative flex items-center rounded-xl py-1.5 ps-2 pe-8 data-highlighted:bg-neutral-100"
        >
          <ui-select-item-indicator class="absolute end-2"
            >✓</ui-select-item-indicator
          >
        </ui-select-item>
      </ui-select-group>
      <ui-select-separator
        class="-mx-1 my-1 h-px bg-neutral-200"
      ></ui-select-separator>
    </ui-select-content>
  </template>
</ui-select>
```

```ts
const select = document.querySelector("ui-select")!
select.items = plans
```

The element looks up each part by its tag, so the template only needs one of each, nested however reads best. Parts you leave out of it render bare.

- **Containers copy only themselves.** The content, the list, a group or a submenu's content takes the template's classes, and the data fills it.
- **Items copy everything inside them.** An indicator, an icon or a shortcut you put in the template's item shows in every item.
- **The label goes in the text part.** When the template's item has one, like `<ui-select-item-text>`, the label goes there, so you can style what a search matched with classes like `[&_mark]:font-semibold`. Without one, the label comes first in the item.

Select, Combobox, Autocomplete, Command, Listbox and Trigger Menu copy their content, list, groups, group labels, items and separators. A combobox with chips copies its chip too, with the remove button you write inside it:

```html
<template>
  <ui-combobox-chip
    class="flex items-center gap-1 rounded-2xl bg-neutral-200 ps-1.5 pe-0.5 text-xs"
  >
    <ui-combobox-chip-remove>
      <button type="button" class="opacity-50 hover:opacity-100">×</button>
    </ui-combobox-chip-remove>
  </ui-combobox-chip>
</template>
```

A menu copies its content, items, checkbox items, radio items, groups, group labels, separators, submenu triggers and submenu content. Put the check in the template's checkbox item and the chevron in its submenu trigger.

A tree copies its items, indicators, checkboxes, labels and groups. A branch gets the indicator, and every item gets the checkbox when the tree is `checkable`. A link item's label becomes an `<a>` that takes the label's classes.

```html
<ui-tree aria-label="Groceries">
  <template>
    <ui-tree-item class="flex flex-wrap items-center">
      <ui-tree-item-indicator
        class="size-4 before:content-['›'] data-expanded:rotate-90"
      ></ui-tree-item-indicator>
      <ui-tree-item-label
        class="flex-1 rounded-xl px-2 data-selected:bg-neutral-100"
      ></ui-tree-item-label>
      <ui-tree-group class="basis-full ps-4"></ui-tree-group>
    </ui-tree-item>
  </template>
</ui-tree>
```

## Keys and Shortcuts

`loop` controls whether arrow keys wrap around a list. Components that support `orientation` use it to choose the navigation axis.

A trigger's `shortcut="mod+k"` opens it from elsewhere on the page. Data menus run item shortcuts while closed; a menu item written in HTML only displays its shortcut. [Shortcuts](./utilities/shortcuts.md) covers registering your own.
