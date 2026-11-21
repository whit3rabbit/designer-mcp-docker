# The vendored template anatomy

A vendored design-system template is a folder under
`data/design-systems/<slug>/` plus one entry in
`data/design-systems/manifest.json`. Everything is static: the gallery serves
it verbatim, the frontend build stages the starters for live previews, and
the MCP tools read generated records. Reference implementations: `modernist`
(web-first) and `loam` (slide-first, 21-slide deck starter).

## The folder

| File | Required | Role |
|---|---|---|
| `theme.json` | yes | Generation knobs: `name`, `palette` (`hue`, `band`, `scheme`, `sat`, `bg`, `surface`, `text`, `accent`, `accent2`), `fonts` (heading/body with `family`, `class`, `weights`), `density`, `radius`, `layoutStyle`, `dividers`, `buttonAlign`, `imageTreatment`, `photo`. Free extra keys are recorded verbatim (loam adds `motifs` and `canvas`). |
| `styles.css` | yes | The token sheet: one `:root` block with the color roles, three 100–900 tonal ramps (neutral, accent, accent-2), font and weight tokens, `--space-*`, `--radius-*`, `--shadow-*`, then a plain-CSS component layer. No webfont import needed (a system stack needs none, and the frontend build rewrites Google Fonts imports to local fonts). |
| `readme.md` | yes | The written guide. First `# ` line is the title, text before the first `## ` is the intro, and these H2s are parsed: **How to use this**, **Direction**, **Color**, **Type**, **Icons**, **Interaction states**, **Components**, **Do**, **Don't**, **Files**. The Components section must hold a `| Class | What it is | Shown in |` table. |
| `_ds_manifest.json` | yes | The registry: `namespace`, `hasThumbnailHtml`, `globalCssPaths: ["styles.css"]`, `cards[]` (`path`, `group`, `name`, `subtitle`, `viewport`), `templates[]` (`name`, `folder`, `entryPath`, `description`), `tokens[]` (every token with `value`, `kind`, `definedIn`), `brandFonts[]`, `source: "spa"`. The record's `tokens[]` come from here, not from parsing styles.css. |
| `_adherence.oxlintrc.json` | yes | Lint contract for generated code: warn on raw hex, raw px, and fonts outside the system; `x-omelette.tokens` lists every token with `tokenKinds`. |
| `_ds_bundle.js` | yes | One-line `@ds-bundle` header with the namespace (`<Name>_<word>`) plus an IIFE creating `window.<Namespace>` with `__errors: []`. |
| `theme.html` | yes | A `@dsCard` page rendering the parameters as a `dl` with `data-theme-ground/scheme/hue` attributes. |
| `thumbnail.html` | yes | The 1280×854 cover. Render to `thumbnail.webp` (headless Chrome screenshot) and commit the webp: it seeds the gallery card and stays **out of `files[]`**. |
| `thumbnail.webp` | yes | The rendered cover (a few KB). |
| `foundations/*.html` | yes | Five `@dsCard` pages: color, type, image, layout, icons. Each links `../styles.css`, opens with the `@dsCard` comment directive, and demos tokens via `var(--color-*)`. |
| `components/*.html` | yes | Six `@dsCard` pages demoing the component layer (buttons, cards, stats, grids, navigation, table are the house set). |
| `templates/deck/Deck.dc.html` | deck | The `<x-dc>` deck starter: `<helmet>` links `../../styles.css` plus `./ds-base.js` and `./image-slot.js`, an inline `<style>` holds the deck CSS, and an `<x-import component-from-global-scope="deck-stage" from="./deck-stage.js" width="1920" height="1080">` mounts plain `<section class="slide variant" data-label>` children. Six to eight layouts minimum. |
| `templates/deck/deck-stage.js`, `support.js`, `image-slot.js`, `ds-base.js` | deck | The vendored runtime, copied verbatim from any existing system (modernist, loam). `support.js` carries unpkg URLs with SRI hashes that the frontend build rewrites to local vendor copies. Never edit these files. |
| `templates/landing/index.html` | landing | The page starter with `./ds-base.js` + `./image-slot.js` and the landing laws in its style header. |
| `assets/photo.jpg` | yes | One reference photograph (free license, 1280px class) treated by the image foundation and both starters. |

## The manifest entry

`data/design-systems/manifest.json` holds one entry per system: `slug`, `name`,
`description`, `path` (`<slug>/`), `ground`, `text`, `accent`, `headingFont`,
`thumbnail` (`<slug>/thumbnail.html`), `thumbnailImage` (`<slug>/thumbnail.webp`),
`readme`, `theme`, and `files[]` listing **every file in the folder** with
`binary: true` on non-text assets. `thumbnail.webp` is deliberately excluded.
The `$comment` names the system count, so bump it when it changes.

## The pipeline contract

- `npm run templates` → `installDesignSystems` copies the folder into
  `<cache>/design-systems/` and writes `<cache>/design-systems/<slug>.json`
  records plus the index. Called again by `npm run bake` for the image.
- `buildSystemRecord` parses `theme.json` (verbatim into `theme`), the
  registry (`tokens`, `cards`, `templates`, `namespace`, `brandFonts`), and
  the readme (title, intro, Direction, Do, Don't, How to use this, Interaction
  states, Color, Type, Icons, Components table).
- `frontend/templates.mjs` `stageTemplates` validates each starter
  `entryPath`, sets CSP `kind: "deck"` by path, writes `image-slots.state.json`
  sidecars, rewrites Google Fonts imports to local fonts, and rewrites
  `support.js`'s unpkg URLs to local vendor copies (the runtime files must
  carry exactly those URLs and hashes, so copy them verbatim).
- `scripts/selftest.mjs` asserts the system count and 48+ tokens per record.
- The gallery serves `/templates` and `/template/:slug` (detail page, thumb
  route), `build-static` emits the pages, and the MCP `design_template_*`
  tools read the generated records. None of this needs changes for a new
  system: only the folder, the manifest entry, and the selftest count.

## Rules the parser and build enforce

- `@dsCard` comment on line 1 of every demo page.
- Registry tokens must match `styles.css` tokens exactly.
- Starter entry paths must exist, and deck entry paths must contain `/deck/`
  to get the deck CSP.
- No external stylesheet imports beyond a Google Fonts URL in `styles.css`.
- No remote URLs anywhere in authored files (offline rule).
- Keep the source design's name out of every authored file when cloning.
