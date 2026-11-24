# Designer Dashboards — Chakra UI v3 Integration

Production-grade Chakra UI v3 (`@chakra-ui/react` + `@emotion/react`) component suite built on **Ark UI / Zag.js** primitives and bridged to **OpenDesign OKLCH CSS custom properties** — with **no Tailwind CSS** required.

## Architecture

1. **Styling Engine (`createSystem` + `defaultConfig`)**:
   - `theme/ChakraThemeProvider.tsx` uses `defineConfig` and `createSystem(defaultConfig, ...)` to map Chakra v3 semantic tokens (`bg.canvas`, `bg.surface`, `bg.elevated`, `bg.subtle`, `fg.DEFAULT`, `fg.muted`, `border.DEFAULT`, `accent.*`, `status.*`) directly to OpenDesign CSS variables (`var(--color-*)`, `var(--font-*)`, `var(--radius-md)`).
   - Because OpenDesign variables automatically switch under `.dark` and `[data-theme="dark"]`, all Chakra components inherit light/dark mode and all 21 WCAG AA OpenDesign presets without duplicating color definitions.
2. **Ark UI Foundation**:
   - Compound components (`Dialog.Root`, `Tabs.Root`, `Select.Root` + `createListCollection`, `Field.Root`, `Alert.Root`, `Card.Root`, `Table.Root`) leverage Chakra v3's Ark UI / Zag.js state machines for keyboard navigation, ARIA attributes, focus trapping, and portal rendering.
3. **RTL & Accessibility**:
   - Uses logical spacing/alignment (`ms`, `me`, `ps`, `pe`, `textAlign="start" | "end"`) for `dir="rtl"` support.
   - Enforces `:focus-visible` outlines using `var(--color-primary)` and requires `aria-label` on icon-only buttons.

## Peer Dependencies

- `@chakra-ui/react` (`^3.15.0`)
- `@emotion/react` (`^11.14.0`)
- `lucide-react` (`^1.78.0`)
- `@tanstack/react-table` (`^9.3.1`, for `DataTable.tsx`)
- `apexcharts` & `react-apexcharts` (for `ChartCard.tsx`)

## Usage

```tsx
import { ChakraThemeProvider } from './theme/ChakraThemeProvider';
import { ShowcasePage } from './ShowcasePage';

export function App() {
  return (
    <ChakraThemeProvider>
      <ShowcasePage />
    </ChakraThemeProvider>
  );
}
```
