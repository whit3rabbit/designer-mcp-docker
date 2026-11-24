---
name: heroui-native
description: "HeroUI Native component library for React Native (Tailwind v4 via Uniwind) mobile applications."
metadata:
  author: heroui
  version: "2.0.1"
---

# HeroUI Native Development Guide

HeroUI Native is a component library built on **Uniwind (Tailwind CSS for React Native)** and **React Native**, providing accessible, customizable UI components for mobile applications.

Adapted from HeroUI's official agent skills (Apache-2.0) for fully offline use inside the designer-mcp plugin. Native docs are not baked into the designer-mcp layer: they come from the project's own `heroui-native` install, whose docs ship inside the npm package.

---

## Offline Sources

The scripts read `node_modules/heroui-native/docs` (resolved upward from the working directory, so workspace hoisting is found), or `$HEROUI_NATIVE_DOCS_DIR`. Run them from the React Native project that depends on `heroui-native`. When nothing is installed the scripts print an offline note instead of reaching the network.

---

## CRITICAL: Native Only - Do Not Use Web Patterns

**This guide is for HeroUI Native ONLY.** Do NOT apply HeroUI React (web) patterns: the package, styling engine, and color format all differ:

| Feature      | React (Web)          | Native (Mobile)                     |
| ------------ | -------------------- | ----------------------------------- |
| **Styling**  | Tailwind CSS v4      | Uniwind (Tailwind for React Native) |
| **Colors**   | oklch format         | HSL format                          |
| **Package**  | `@heroui/react` 	  | `heroui-native`                     |
| **Platform** | Web browsers         | iOS & Android                       |

```tsx
// CORRECT: Native pattern
import { Button } from "heroui-native";

<Button variant="primary" onPress={() => console.log("Pressed!")}>
	Click me
</Button>;
```

**Always read the Native docs before implementing.**

---

## Core Principles

- Semantic variants (`primary`, `secondary`, `tertiary`) over visual descriptions
- Composition over configuration (compound components)
- Theme variables with HSL color format
- React Native StyleSheet patterns with Uniwind utilities

---

## Accessing Documentation & Component Information

**For component details, examples, props, and implementation patterns, always read the docs from the offline sources:**

### Using Scripts

```bash
# List all available components
node scripts/list_components.mjs

# Get component documentation (MDX)
node scripts/get_component_docs.mjs Button
node scripts/get_component_docs.mjs Button Card TextField

# Get theme guidance
node scripts/get_theme.mjs

# Get non-component docs (guides)
node scripts/get_docs.mjs theming
```

**Important:** Always read component docs before implementing. They include complete examples, props, anatomy, and API references.

---

## Installation Essentials

### Quick Install

```bash
npm i heroui-native react-native-reanimated react-native-gesture-handler react-native-safe-area-context @gorhom/bottom-sheet react-native-svg react-native-worklets tailwind-merge tailwind-variants
```

### Framework Setup (Expo - Recommended)

1. **Install dependencies:**

```bash
npx create-expo-app MyApp
cd MyApp
npm i heroui-native uniwind tailwindcss
npm i react-native-reanimated react-native-gesture-handler react-native-safe-area-context @gorhom/bottom-sheet react-native-svg react-native-worklets tailwind-merge tailwind-variants
```

2. **Create `global.css`:**

```css
@import "tailwindcss";
@import "uniwind";
@import "heroui-native/styles";

@source "./node_modules/heroui-native/lib";
```

3. **Wrap app with providers:**

```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HeroUINativeProvider } from "heroui-native";
import "./global.css";

export default function Layout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<HeroUINativeProvider>
				<App />
			</HeroUINativeProvider>
		</GestureHandlerRootView>
	);
}
```

### Critical Setup Requirements

1. **Uniwind is Required** - HeroUI Native uses Uniwind (Tailwind CSS for React Native)
2. **HeroUINativeProvider Required** - Wrap your app with `HeroUINativeProvider`
3. **GestureHandlerRootView Required** - Wrap with `GestureHandlerRootView` from react-native-gesture-handler
4. **Use Compound Components** - Components use compound structure (e.g., `Card.Header`, `Card.Body`)
5. **Use onPress, not onClick** - React Native uses `onPress` event handlers
6. **Platform-Specific Code** - Use `Platform.OS` for iOS/Android differences

---

## Component Patterns

HeroUI Native uses **compound component patterns**. Each component has subcomponents accessed via dot notation.

**Example - Card:**

```tsx
<Card>
	<Card.Header>{/* Icons, badges */}</Card.Header>
	<Card.Body>
		<Card.Title>Title</Card.Title>
		<Card.Description>Description</Card.Description>
	</Card.Body>
	<Card.Footer>{/* Actions */}</Card.Footer>
</Card>
```

**Key Points:**

- Always use compound structure, don't flatten to props
- Subcomponents are accessed via dot notation (e.g., `Card.Header`)
- Native Card uses `Card.Body` (not `Card.Content`), so Title and Description go inside Body
- **Read component docs for complete anatomy and examples**

---

## Semantic Variants

HeroUI uses semantic naming to communicate functional intent:

| Variant       | Purpose                           | Usage          |
| ------------- | --------------------------------- | -------------- |
| `primary`     | Main action to move forward       | 1 per context  |
| `secondary`   | Alternative actions               | Multiple       |
| `tertiary`    | Dismissive actions (cancel, skip) | Sparingly      |
| `danger`      | Destructive actions               | When needed    |
| `danger-soft` | Soft destructive actions          | Less prominent |
| `ghost`       | Low-emphasis actions              | Minimal weight |
| `outline`     | Secondary actions                 | Bordered style |

**Don't use raw colors** - semantic variants adapt to themes and accessibility.

---

## Theming

HeroUI Native uses CSS variables via Tailwind/Uniwind for theming. Theme colors are defined in `global.css`:

```css
@theme {
	--color-accent: hsl(260, 100%, 70%);
	--color-accent-foreground: hsl(0, 0%, 100%);
}
```

**Get current theme variables:**

```bash
node scripts/get_theme.mjs
```

**Access theme colors programmatically:**

```tsx
import { useThemeColor } from "heroui-native";

const accentColor = useThemeColor("accent");
```

**Theme switching (Light/Dark Mode):**

```tsx
import { Uniwind, useUniwind } from "uniwind";

const { theme } = useUniwind();
Uniwind.setTheme(theme === "light" ? "dark" : "light");
```

For detailed theming, read the offline docs: `node scripts/get_theme.mjs` or `node scripts/get_docs.mjs theming`.
