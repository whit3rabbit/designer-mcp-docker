# Designer Dashboards — Ant Design (`antd`) Integration

Production-grade Ant Design v5 component wrappers and theme bridge for **data-heavy admin applications** in Designer Dashboards (zero Tailwind dependency).

## Architecture

### 1. Theme Bridge (`theme/AntdThemeProvider.tsx`)
`AntdThemeProvider` wraps your application in Ant Design's `ConfigProvider` with:
- **`theme.algorithm`**: Automatically switches between `theme.defaultAlgorithm` and `theme.darkAlgorithm` by observing `data-theme="dark"` / `.dark` on `document.documentElement`.
- **`cssVar: true`**: Enables Ant Design CSS variable mode (`--ant-*` tokens) for low-overhead runtime theme switching.
- **OpenDesign Token Resolution**: Resolves OpenDesign OKLCH CSS custom properties (`--color-primary`, `--color-canvas`, `--color-surface`, `--color-surface-elevated`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-success`, `--color-warning`, `--color-error`, `--color-info`, `--font-sans`, `--font-mono`, `--radius-md`) into Ant Design `SeedToken` and component tokens so all 21 OpenDesign presets work seamlessly.
- **RTL Support**: Observes `dir="rtl"` / `dir="ltr"` on `document.documentElement` and passes `direction` to `ConfigProvider`.

### 2. UI Wrappers (`ui/`)
All wrappers expose Designer Dashboards semantic props (`tone`, `variant`, `size`, etc.) while delegating rendering, keyboard interaction, and ARIA semantics to Ant Design:

| Component | Underlying Tech | Notes |
| --- | --- | --- |
| `Button` | `antd` `Button` | Semantic `variant` (`solid`, `outline`, `tonal`, `ghost`, `link`), `tone`, `iconOnly` with required `aria-label` ergonomics |
| `Card` | `antd` `Card` | Supports `elevated`, `bordered`, `subtle`, `interactive` variants bridged to `--color-surface*` |
| `Badge` | `antd` `Tag` / `Badge` | Semantic `tone`, `variant` (`solid`, `tonal`, `outline`, `dot`), `size` |
| `Alert` | `antd` `Alert` | Semantic `tone`, `variant` (`tonal`, `solid`, `outline`), `dismissible` |
| `Input` | `antd` `Input` / `Input.Password` | Accessible label, `helperText`, `error`, `prefixIcon`, `suffixIcon` |
| `Select` | `antd` `Select` | Typed options, searchable, accessible label + error state |
| `Dialog` | `antd` `Modal` | Accessible title/description, `size` presets, `footer` slot |
| `Tabs` | `antd` `Tabs` / `Segmented` | `underline`, `pills`, and `segmented` variants |
| `KpiCard` | `antd` `Card` + `Statistic` | Formatted numbers/currency/percent, trend delta badge, optional inline SVG sparkline |
| `DataTable` | `@tanstack/react-table` + `antd` `Table` | Headless sorting, global/column filtering, row selection, and pagination rendered with Ant Design `Table` |
| `ChartCard` | `react-apexcharts` + `antd` `Card` | Reads `--chart-1..10` and theme mode dynamically for ApexCharts |

## Dependencies & Notes
- **Peer / Runtime Deps**: `antd` (`^5.24.0`), `react` (`^19.3.1`), `react-dom` (`^19.3.1`), `lucide-react`, `@tanstack/react-table`, `apexcharts`, `react-apexcharts`, `dayjs`.
- **React 19 Compatibility**: Ant Design v5.24+ supports React 19; if using an older v5 release, ensure `@ant-design/v5-patch-for-react-19` is installed if needed.
- **License**: Ant Design is MIT-licensed.
- **No Tailwind**: All layout and spacing use Ant Design `Flex` / `Row` / `Col` / `Space` and CSS custom properties.
