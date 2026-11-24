# Creating Presentations with `pptxgenjs`

Write the script and `require('pptxgenjs')` directly. If that require fails, run `npm install pptxgenjs`.

## Gotchas

- **Set `pres.layout` before adding slides.** Default is `LAYOUT_16x9` (**10" × 5.625"**), not 13.3" wide (`LAYOUT_WIDE` is 13.3" × 7.5").
- **Hex colors: never `#`, never 8 digits.** Use `color: "FF0000"`. `"#FF0000"` or `"00000020"` **corrupts the file**. For translucency: `transparency: 0-100` on fills/images, `opacity: 0.0-1.0` on shadows.
- **pptxgenjs mutates option objects in place.** Never share one `shadow`/options object across two `add*` calls — build a fresh object each time.
- **Shadow `offset` must be ≥ 0** — negative offset corrupts the file. Use `angle: 270` with a positive offset for upward shadows.
- **`letterSpacing` is silently ignored** — use `charSpacing`.
- **Lists:** `bullet: true` on each item (never literal `•`), `breakLine: true` on every item except the last, and `paraSpaceAfter` (not `lineSpacing`).
- **One `new pptxgen()` per output file**; **`rectRadius` only works on `ROUNDED_RECTANGLE`**; **gradient fills aren't supported** (use a gradient image).
- **Downscale photos before `addImage`** (~2000px max long edge via Pillow/sharp). Pre-mask rounded/pill/arch photos as alpha PNGs.
- **`arc` shapes take `angleRange`**; combine with `fill: { type: "none" }` for outline-only rings, and `rotate` composes with `sizing: { type: "cover" }`.
- **Template-mimic decks need a rename pass** across slide text, speaker notes, and doc properties.
- **Every `addText` without a `placeholder` needs `isTextBox: true`** for accessibility. Set `margin: 0` when aligning text with shapes/lines/icons.
- **Speaker notes go in `slide.addNotes("...")`**, never on-slide text boxes.
- **Keep charts native (`addChart()`).** Set `showTitle` + `title`, `showValue: true` + `dataLabelPosition`, `chartColors`, and quiet axes/gridlines.
- **On stacked bar/column charts, `dataLabelPosition` must be `ctr`, `inEnd`, or `inBase`** (`outEnd` **corrupts the file**).
- **Combo series with `secondaryValAxis`/`secondaryCatAxis` need both `valAxes` and `catAxes` (2 entries each)** or PowerPoint discards the chart as corrupt.
- **Never reorder children of `<p:presentation>`.**
- **Icons:** `react-icons` → `ReactDOMServer.renderToStaticMarkup` → `sharp` rasterized ≥256px → `addImage({ data: "image/png;base64," + buf.toString("base64") })`.
- **`defineSlideMaster()` creates a slide *layout***; **`pres.company` and `defineSlideMaster().title` are written unescaped** — escape `&` as `&amp;` there.

## Structured Decks

Build every new deck on a theme, layouts, placeholders, and sections unless asked for a quick throwaway:

1. **Theme first:** `const THEME = { name, headFontFace, bodyFontFace, colors: { dk1, lt1, dk2, lt2, accent1 … accent6, hlink, folHlink } }`. `pres.theme` takes the two fonts; on chart text use `"+mn-lt"` (body) or `"+mj-lt"` (heading) for `*FontFace`.
2. **`const C = pres.SchemeColor`** for every color (`C.text1`/`C.text2`, `C.background1`/`C.background2`). Hex-only options (`valGridLine.color`, `catGridLine.color`, `shadow.color`, `invertedColors`, multiple `chartColors`) read from `THEME`.
3. **Sections:** `pres.addSection({ title })` before each section's first slide, then `sectionTitle` on every `addSlide`.
4. **One layout per slide frame** (`defineSlideMaster()`): named placeholders with position, size, weight, and `color` (including chart/image/table placeholders). Put footer text, logo, and `slideNumber` on the layout.
5. **Fill by name:** `addSlide({ masterName, sectionTitle })`, then `addText("…", { placeholder: "title" })`. `addImage({ placeholder })` still needs `w`/`h`; `addTable({ placeholder })` needs `w` plus `x`, `y`, `autoPageSlideStartY` when auto-paging.
6. **Write, then apply theme:** `await pres.writeFile({ fileName: "deck.pptx" })`, then `await applyTheme("deck.pptx", THEME)` (`scripts/apply_theme.js`).

## Slide Design Systems & Visual Craft

- **Brand decks:** Start from a vendored template via `design_template` and `design_file` (`kind: "template"`) for `styles.css` and `templates/deck/Deck.dc.html` (e.g. `loam`).
- **One message per slide; pyramid structure** (main message → executive summary → sections → conclusion/next steps). Size live decks ~1.5–2 min/slide.
- **Color:** 60–70% dominant, 1–2 supporting tones, 1 sharp accent; dark/light contrast. Never use decorative accent stripes, edge bars, or underlines under titles.
- **Typography:** Prefer Office + LibreOffice safe fonts for body text (**Arial, Calibri, Cambria, Times New Roman, Courier New, Bookman Old Style, Century Schoolbook**). Never default to Aptos. Titles 36–44pt bold, section headers 20–24pt, body 14–16pt, captions 10–12pt.
- **Spacing:** ≥0.5" margins, 0.3–0.5" between blocks; every slide needs a visual element (chart, image, icon, comparison, timeline, or stat callout).
