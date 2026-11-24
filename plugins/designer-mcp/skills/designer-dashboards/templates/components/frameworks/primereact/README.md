# PrimeReact Framework Adapter for Designer Dashboards

Production-grade PrimeReact (`primereact` v10 + `primeicons` v7) integration bridged to **OpenDesign** CSS custom properties (`--color-*`, `--font-*`, `--radius-md`, `--chart-1..10`).

## Architecture

- **`PrimeThemeProvider`** (`theme/PrimeThemeProvider.tsx`): Wraps `PrimeReactProvider` (`primereact/api`) and synchronizes OpenDesign tokens to PrimeReact CSS variables (`--primary-color`, `--surface-ground`, `--surface-card`, `--text-color`, `--surface-border`, etc.), plus `light`/`dark` (`data-theme` + `.dark`) and `ltr`/`rtl` (`dir`) state.
- **Enterprise UI Wrappers** (`ui/`): Typed, accessible (WCAG 2.1 AA) wrappers around PrimeReact primitives (`Button`, `Card`, `Tag`, `Message`, `InputText`, `Dropdown`, `Dialog`, `TabView`, `DataTable` + `Column`) alongside enterprise dashboard widgets (`KpiCard`, `ChartCard`).
- **Tailwind Optional**: Works out of the box with pure OpenDesign CSS variables and inline/CSS-variable styles. If you enable Tailwind CSS v4, configure `@layer primereact` or PrimeReact PassThrough (`pt`) props as needed.

## Peer Dependencies & Setup

```bash
npm install primereact primeicons apexcharts react-apexcharts lucide-react clsx
```

Ensure `src/index.css` imports PrimeReact base CSS, PrimeIcons, and OpenDesign `design-system/styles.css` in order:

```css
@import "primereact/resources/themes/lara-light-indigo/theme.css";
@import "primereact/resources/primereact.min.css";
@import "primeicons/primeicons.css";
@import "../design-system/styles.css";
```

## License Notes

- `primereact` and `primeicons` are MIT-licensed.
- `apexcharts` and `react-apexcharts` are MIT-licensed.
- `lucide-react` is ISC-licensed.
