# Loam design system

Loam is a fresh, earthy system set entirely in Avenir Next: grass green on white, one dark slate panel per page, hairline rules, diamond bullet marks and moody photography in pill and arch masks. The deck is the flagship surface, a twenty-slide starter on a 1920×1080 stage built for quiet confidence. Green is spent as a fill and a mark, and each light page earns one dark panel.

## How to use this

- Link the one stylesheet from every page, `<link rel="stylesheet" href="styles.css">` (adjust the relative path), and take every color, font, spacing, radius and shadow from its variables (`var(--color-*)`, `var(--font-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--shadow-*)`). Never hard-code a hex, a font name or a px value the tokens already carry.
- Build with the classes below rather than inventing parallel ones. The component pages are plain HTML, so view source and copy the markup.
- `templates/` holds starting points a consuming project can copy whole. The deck starter (`templates/deck/Deck.dc.html`) is the layout contract for generated slide decks: copy its slide patterns when producing a .pptx or a new HTML deck, and keep the wordmark, diamond chips, ring arcs and pill and arch masks intact.
- The whole system was derived from `theme.json`. To change the look, edit the tokens at the top of `styles.css`. Every page, the thumbnail and this guide read from them, so keep `theme.json` and the written guidance in step with what the CSS actually does.

## Direction

Band layouts: content in horizontal bands, one band per message, generous white space, hairline rules between sections. Each light page carries at most one dark slate panel (`--color-neutral-900`). Green appears as fills, marks and small emphasis, never as body ink.

Bullet lists use the diamond chip (`.chip`), not round dots. Photographs are moody and natural (no filters): low-key portraits, look-up architecture, elevated city scenes, cut straight or masked with `.pill` and `.arch`. The wordmark is lowercase with an accent period and, at most once per page, a thin slash at its shoulder.

## Color

A white ground (`--color-bg` #ffffff) with `--color-text` #212730 and a single green accent #4cb45f. This is a mono scheme: the `--color-accent-2-*` variables carry a deeper moss stand-in kept only so both sets resolve, so treat them as one voice.

Each role carries a 100–900 tonal ramp (`--color-neutral-100` through `--color-accent-2-900`) on a shared perceptual lightness scale, so the same step of any ramp has the same visual weight. Use the light steps (100–300) for tinted fills, hovers and subtle borders, 500 as the role's base, and the dark steps (700–900) for text on tinted fills and for pressed states. Prefer ramp steps over ad-hoc `color-mix()`.

Ghost rings draw in `--color-ring-ghost`. Hairlines draw in `--color-divider`. For elevation use `--shadow-sm/md/lg` rather than ad-hoc box-shadows, and only on floating chrome.

## Type

Avenir Next for headings over Avenir Next for body text, loaded as `--font-heading` / `--font-body` (system-installed on macOS with no webfont import, falling to Segoe UI and Helvetica Neue elsewhere). Headings are bold and tight. The wordmark, stat numbers and button labels carry the bold weight. Density 1.00× and radius 2px are already baked into the `--space-*` / `--radius-*` scales, so use the variables, not raw numbers.

## Icons

Use Lucide icons (https://lucide.dev) throughout.

## Interaction states

Interactive states are themed, never browser defaults. Give every interactive element a `:hover` tint from the accent ramp, one step past the base (`--color-accent-600` on a light ground), or a `color-mix()` tint for outlined and ghost variants. Style keyboard focus with `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }` and never leave the default blue focus ring.

## Components

| Class | What it is | Shown in |
| --- | --- | --- |
| `.btn` with `.btn-primary`, `.btn-dark`, `.btn-ghost` | Actions: the pair is dark and green, and the ghost lives on photo or accent grounds | components/buttons.html |
| `.tag` with `.tag-accent`, `.tag-accent-2`, `.tag-neutral`, `.tag-outline` | Small labels tinted from the ramps | components/buttons.html |
| `.card` with `.card-kicker`, `.card-title`, `.card-body`, `.card-meta`, plus `.panel-ink` and `.panel-accent` | Surface cards and the dark slate and green panel variants | components/cards.html |
| `.stat-num` (`.ink`), `.stat-label`, `.bar-track`, `.bar-fill` | Stat callouts and progress bars | components/stats.html |
| `.chip`, `.pill`, `.arch`, `.frame` | The diamond bullet chip and the photo masks | components/grids.html |
| `.wordmark` (with an `i` slash, `.on-dark`) | The lowercase lockup with the accent period | components/navigation.html |
| `.nav` + `.nav-brand` | The header bar | components/navigation.html |
| `.table` | Data tables with hairline row rules | components/table.html |
| `.hr` | The 1px hairline rule | foundations/layout.html |
| `image-slot` | The drag-and-drop photo placeholder the deck and landing use | foundations/image.html |

States are built in. Hovers come from the accent ramp. Keyboard focus is the 2px accent `:focus-visible` ring. `::selection` is an accent tint. Disabled controls drop to 45% opacity, and you never restyle them per page.

The accent-to-ground pair is tuned for fills, marks and large text, not body copy. For paragraph-size text in the green use a deep ramp step (`--color-accent-700`) rather than the accent itself.

## Do

- Keep one green voice: fills, marks, small emphasis. Never a second hue.
- Give each light page one dark slate panel and let it carry the weight.
- Use the diamond chip for bullets and the hairline for every rule.
- Cut photography straight or through the `.pill` and `.arch` masks, in natural color.

## Don't

- Do not center body copy. Center only the wordmark, dividers and stat tiles.
- Do not add shadows to cards or panels, the system is flat.
- Do not outline photographs or tint them.
- Do not reuse the wordmark slash more than once on a page.
- Do not soften the dark panel toward gray or the green toward pastel fills beyond the 100–300 ramp steps.

## Files

- `styles.css`: the only stylesheet, the token sheet (`:root` variables, ramps, base type) plus the component layer. Link it from every page.
- `readme.md`: this guide.
- `theme.json`: the parameters these files were derived from (a machine-readable record of the theme, including the motif list and deck canvas).
- `thumbnail.html`: the project cover (wordmark plus ramp strip).
- `foundations/type.html`: the type scale and the heading/body pairing at real sizes.
- `foundations/color.html`: color roles and the 100-900 tonal ramps, with usage notes.
- `foundations/layout.html`: the spacing scale, band structure and how edges are drawn.
- `foundations/icons.html`: the icon set at interface sizes, inline and in buttons.
- `foundations/image.html`: how photographs and figures are treated, with the masks.
- `components/buttons.html`: the dark/green/ghost button pair and tags in every variant and state.
- `components/cards.html`: surface, dark slate and green panel cards.
- `components/stats.html`: stat callouts and progress bars.
- `components/grids.html`: the diamond chip and the pill, arch and framed photo masks.
- `components/navigation.html`: the header bar with the wordmark lockup.
- `components/table.html`: a data table with hairline rules.
- `theme.html`: the theme's parameters rendered as a reference sheet.
- `templates/deck/`: the twenty-slide presentation starter (`Deck.dc.html`, its `ds-base.js` loader, the dc runtime `support.js`, the `deck-stage.js` player and the vendored `image-slot.js`). This starter is the layout contract for generated decks.
- `templates/landing/`: a starter page consuming the system the intended way (`index.html`, its `ds-base.js` loader, and the vendored `image-slot.js` its photograph mounts).
- `assets/photo.jpg`: the reference photograph the imagery page treats (Unsplash, free to swap).
