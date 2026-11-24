# Reference 06: Forms, Feedback, Overlays & Page Chrome

Distilled from the 17-template commercial dashboard audit.

## 1. Button Grammar (Standardized Across All 17 Templates)

Encode one unified `<Button>` API:
- **Variants:** `solid` | `outline` | `tonal` (soft tint bg + colored text) | `ghost` | `link`
- **Tones:** `primary` | `secondary` | `success` | `info` | `warning` | `error` | `neutral`
- **Sizes:** `xs` (`28px`) | `sm` (`32px`) | `md` (`38px`) | `lg` (`44px`) | `xl` (`48px`)
- **Modifiers:** `iconOnly` (requires `aria-label`), `loading` (spinner + `aria-busy="true"` + disabled), `fullWidth`, `asChild` / link-button, `ButtonGroup` / split-button, and subtle press feedback (`motion-safe:active:scale-[0.98]` + `--color-<tone>-hover`/`-pressed` tokens).

## 2. Forms & Standard Input Primitives

### Four Proof Pages & Three Layouts
Emit the standard 4-page form proof suite (`inputs`, `layouts`, `validation`, `wizard`) plus tabbed settings with a sticky/bottom save bar, inline table-cell editing, and dialog/drawer CRUD forms (with reset-on-close):
- **Stacked (vertical):** Label above input — dashboard default.
- **Horizontal:** Label beside input — settings pages.
- **Inline:** Compact filter rows auto-generated above tables and charts (`FilterBar`: `date-range` + `select` + `search` + reset).

### Standard Input Primitives (All support `sm/md/lg` sizing & token-bound styling)
1. **Text, InputGroup & Floating Labels:** `Input` (icon adornments), `InputGroup` + `InputGroupAddon` + `InputGroupButton` (shadcn v4 composable prefix/suffix text & action buttons), `CopyInput` (one-click clipboard copy + toast), `FloatingInput` / `FloatingTextarea` (CSS `:placeholder-shown` floating label) · 2. **Password & OTP:** `InputPassword` (visibility toggle + optional `showStrength` 4-segment meter & rule checklist), `OtpInput` (segmented verification boxes with paste & backspace nav) · 3. **Textarea:** `Textarea` (with `maxCount` character counter) · 4. **Selects & Tags:** `Select`, searchable `Combobox`, and `TagInput` (sharing one accessible popover/combobox engine) · 5. **Dates & Calendar:** `DatePicker`, `DateRangePicker` (with `Today`/`7d`/`30d`/`Month` presets), `TimePicker`, `DateTimePicker`, and `InlineCalendar` (month grid) · 6. **Uploads & Media:** `FileUpload` (dropzone + file list), `AvatarUpload` (circular/square preview + size validation + reset), and `ImageUpload` (multi-image thumbnail grid) · 7. **Sliders:** `Slider` (single value) and `RangeSlider` (dual-thumb `[min, max]` with optional synced numeric inputs) · 8. **Choice & Segmented Controls:** `Switch`, `Checkbox`, `RadioGroup`, `ToggleGroup` / `SegmentedControl` (single/multi-select pill/segmented/outline), and `OptionCard` / `OptionCardGroup` (radio/checkbox cards with `icon`, `image`, and `badge`) · 9. **Specialized Inputs:** `NumberInput` (touchspin stepper), `Rating` (interactive star rating), `MaskedInput` (`credit-card` w/ brand badge, `phone`, `date`, `expiry`, `currency`, `postal`, or custom mask), `PhoneInput` (country flag + dial-code selector + local number), `ColorPicker` (token swatches + native color well + copyable hex), `InlineEdit` (click-to-edit Enter/Escape/blur), `FormRepeater` (dynamic field array with add/remove), and `DualListbox` (available/selected transfer list with search & bulk move). Vue 3 (`templates/components/vue/ui/`) and Angular Signals (`templates/components/angular/ui/`) ship matching token-bound counterparts.

### Library Consensus & Modern Patterns
- **Validation & Forms:** `react-hook-form` + `zod` (or `@tanstack/react-form` + `zod` for TanStack-native stacks), VeeValidate/Vuelidate + `zod` (Vue), `@angular/forms` Reactive Forms (Angular) — keep **one** form engine per project; `<FormField>` propagates `aria-invalid` and `aria-describedby` with red helper text and submit-failure toast. Use `useFieldArray` + `<FormRepeater>` for dynamic rows (invoice line items, product variants, team invites).
- **shadcn v4 & Modern Trends:** See `templates/components/react/examples/ShadcnFormExample.tsx` (or emit via `node scripts/generate.mjs form shadcn --out <project-dir>`) for composable `InputGroup`, `ToggleGroup`, `OptionCardGroup`, `MaskedInput`, and `Controller` + `zod` wiring bound strictly to OpenDesign CSS tokens (no raw hex, logical RTL properties).
- **Wizards:** `<Stepper>` header + per-step Zod validation gate + `<OptionCardGroup>` selectors.
- **Dates & Calendar:** Native `Intl.DateTimeFormat` / `Intl.RelativeTimeFormat` for display formatting (`dayjs` for date math & `InlineCalendar` / `DateRangePicker` presets; never `moment`) + `FullCalendar` for calendar apps.
- **Rich Text:** `Tiptap` (headless, MIT, clean token theming).

## 3. Feedback, Badges, Loading & Overlays (Single-Engine Rules)

- **Toasts:** **Sonner** (`sonner` / `vue-sonner`) or framework-native Snackbar (MUI/Vuetify). Never ship 2+ toast libraries. Always `aria-live="polite"`.
- **Alerts & Badges:** `<Alert>` provides inline page feedback with a soft/tonal background from the palette tint ladder (`tonal | solid | outline | borderless`), tone icon, and optional dismiss; `<Badge>` supports 7 tones × 4 appearances (`solid | tonal | outline | dot`) plus `BadgeDot` (status-dot tied to the palette tint ladder) and removable `BadgeButton` chips.
- **Skeletons & Loading UX:** Mandatory skeleton-first loading on all data widgets—KPI cards, charts, and DataGrid cells (`ColumnMeta.skeleton` + patterned skeletons)—plus `<Spinner>`, SSR Suspense/`loading.tsx` boundaries, lazy-route `<RouteFallback>`, and a top route progress bar. Reserve `beforeInteractive` scripts strictly for FOUC-free theme/direction bootstrap (never a blocking full-screen splash in SSR/RSC apps).
- **Empty States:** Dedicated `<EmptyState>` component with multi-scenario SVG illustrations (`no-data`, `not-found`, `access-denied`, `search-empty`, `error`, `launch`), concise title/body, and recovery CTA—default on every data widget.
- **Overlays:** Prefer native HTML `<dialog>.showModal()`, Popover API (`popover="auto"`), CSS Anchor Positioning, and `@starting-style` for zero-dependency Top-Layer overlays, or `shadcn` v4 (`shadcn@4.23.0` + `tw-animate-css` + `@theme inline`—never legacy `tailwindcss-animate`) / a unified headless suite (`radix-ui` / `@base-ui/react` / MUI Dialog/Drawer; never mix jQuery plugins or per-package `@radix-ui/react-*`). Use borderless modals (`--shadow-modal: none`) with `--color-scrim` (`::backdrop`) separation, right-side slide-over panels for detail views, mobile topbar widgets opening as right-side sheets (not dropdowns), `cmdk` / `kbar` / `CommandPalette` (`Cmd+K`), and the explicit `--z-*` ladder for shell chrome and fullscreen widget elevation.
- **Topbar Furniture & Derived Chrome:** Standardize topbar furniture: Command Palette Search (`Cmd+K`), `NotificationsSheet`, App Switcher, Shortcuts chips, Theme Toggle, Language/RTL Switch, and User Menu. Wrap pages in `@container` shells (`@container mx-auto max-w-7xl gap-4 p-6`) with `<PageHeader>` (`ToolbarHeading`, `ToolbarPageTitle`, `ToolbarDescription`, `ToolbarActions`), derived `<Breadcrumb>` + `<title>` via `useMenu()` prefix matching (`isActive`, `getCurrentItem`, `getBreadcrumb`), per-route `meta` chrome overrides, and non-persisted temporary overrides (`updatePageSettings()`).

## 4. Widget / Card Anatomy

Every dashboard widget uses one `<WidgetCard>` primitive:
- **Header:** Title + optional subtitle + action kebab dropdown + optional **Fullscreen**, **Pin**, **Collapse**, and **Refresh** toggles.
- **Body:** Content slot with built-in `loading` (skeleton) and `empty` (`<EmptyState>`) states.
- **Footer:** Optional summary or action link.
- **Derived Page Chrome:** Breadcrumb + Page Title + Document `<title>` auto-derived from `navigation.config.ts`, overridable per route via `meta`.
