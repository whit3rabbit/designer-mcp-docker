---
name: design-template-authoring
description: "Use this skill when creating, cloning, or registering a vendored design-system template in designer-mcp-docker: turning any reference design (slide decks, websites, brand boards, DESIGN.md files) into the structured template format (theme.json, styles.css token sheet, foundations and components demo pages, deck and landing starters), filling the scaffolded skeleton, tweaking it per the user's request, registering it so the gallery and design_template_* tools serve it, and generating deliverables from it. Also use when the user asks to clone or copy an existing design into a reusable design system."
license: Apache-2.0. LICENSE.txt has complete terms.
---

# Design template authoring

Turn any reference design into a **vendored design-system template**: the
structured, offline format the gallery's `/templates` layer and the
`design_template_*` tools serve. The output is a folder under
`data/design-systems/<slug>/` that an agent (or a human) can copy, restyle,
and generate decks or pages from.

The format's anatomy and parser contract live in
[reference/anatomy.md](reference/anatomy.md). Read it before your first
authoring run, skim it after.

The pipeline: **capture** the reference, **scaffold** the skeleton, **fill**
it to match the reference, **verify**, **register**, then **generate**
deliverables from the template. Tweaking per the user's request happens at the
fill step and again at the generate step. Retune tokens. Never introduce hues
outside the ramps.

## Contents

- [1. Capture the reference](#1-capture-the-reference)
- [2. Scaffold the skeleton](#2-scaffold-the-skeleton)
- [3. Fill the skeleton to match the reference](#3-fill-the-skeleton-to-match-the-reference)
- [4. Verify](#4-verify)
- [5. Register and prove it](#5-register-and-prove-it)
- [6. Tweak and generate](#6-tweak-and-generate)
- [Rules](#rules)

## 1. Capture the reference

A user-selected source is sufficient grounding. Route by medium:

- **Website**: open it in a browser you control and capture screenshots of the
  representative pages, then run the parent skill's style sampler
  (`../scripts/sample-web-styles.mjs`, against a Playwright or Puppeteer
  page) to pull computed styles: font families and weights, color values,
  spacing rhythm, radii.
- **Slide decks or PDFs**: `../scripts/sample-document-styles.py` discovers
  design evidence from the file (fonts, fills, type scale).
- **Images or a brand board**: view them, sample the palette programmatically
  (Pillow pixel medians beat eyeballing), and name the motifs.
- **DESIGN.md**: `design_markdown_parse` and `design_manifest_from` (parent
  skill tools) seed the token set and roles.

Lock the reference before building. Name the source and list the traits that
must survive: palette roles, type voice, layout grammar, motifs, imagery
treatment. Reject defaults that would soften them. Follow the parent skill's
research workflow when the direction needs research beyond one source.

If the user asks to **clone a named design**, honor its identity but do not
copy its name, logo, or copyrighted photography into the template. Pick an
original name (earth, material, or texture words work well for fresh
palettes), source a copyright-free replacement for any media instead (see
Assets in the fill step), and scrub the source's name from every authored
file before registering.

## 2. Scaffold the skeleton

```bash
node <this-skill>/scripts/scaffold.mjs <target-dir> \
  --slug loam --name "Loam" \
  --description "Fresh grass green on white: Avenir Next, hairline bands, one dark panel per page." \
  --bg "#ffffff" --surface "#f3f3f3" --text "#212730" \
  --accent "#4cb45f" --accent2 "#2f9c4d" \
  --font-heading "Avenir Next" --heading-weight 700
```

The scaffold copies `template/`, fills the markers, and generates the
mechanical files so you never hand-count tokens:

- `styles.css`: a full 56-token `:root` sheet with 100–900 tonal ramps for
  neutral, accent and accent-2, computed in OKLCH from your four colors on one
  shared lightness scale, plus a working component layer (buttons, cards,
  tags, chips, wordmark, stats, bars, photo masks).
- `_ds_manifest.json`: the registry with every token, demo-card entries, and
  the Deck and Landing starter registrations.
- `_adherence.oxlintrc.json`: the lint contract (no raw hex, no raw px, no
  font outside the system).
- `_ds_bundle.js`: the namespace bundle.
- `theme.json`, `theme.html`, `thumbnail.html`, and skeleton pages for
  foundations, components, and both starters, each with `TODO` markers where
  authored content belongs.

Rerun with `--force` any time. It regenerates the mechanical files without
touching the files you have authored: the receipt in `.scaffold.json` tracks
what it owns.

## 3. Fill the skeleton to match the reference

Work in this order. Each step is a visible check against the reference.

1. **`styles.css`**: retune any generated ramp step that drifts from the
   reference, then adapt the component layer. The scaffolded classes are a
   working default. Replace or extend them where the reference has a stronger
   idea (a different button grammar, panels, table treatment).
2. **`readme.md`**: fill every `TODO`. The H2 headings are required by the
   parser (How to use this, Direction, Color, Type, Icons, Interaction states,
   Components, Do, Don't, Files): the gallery record parses them, and the
   Components table (`| Class | What it is | Shown in |`) feeds the manifest.
3. **`foundations/` and `components/`**: the scaffolded demo pages render the
   tokens and classes. Adjust each to demonstrate what makes this system
   itself, and keep the `@dsCard` directive on line 1 of every page.
4. **`templates/deck/`**: copy the four runtime files verbatim from an
   existing vendored system (`deck-stage.js`, `support.js`, `image-slot.js`,
   `ds-base.js`) and never edit them. Then author `Deck.dc.html`: keep the
   `<x-dc>` / `<helmet>` / `<x-import>` boilerplate from the skeleton and
   write one `<section class="slide ...">` per layout the reference shows,
   each with a `data-label`. Six to eight layouts make a usable starter.
   Match the reference's slide inventory when it has one. For a slide-first
   system this step is the whole point: the deck starter is the layout
   contract every generated deck will follow.
5. **`templates/landing/`**: author `index.html` against the landing laws
   documented in the skeleton (display headers break per sentence, an
   invented product played straight, cluster-scoped spacing, no hero eyebrow).
6. **`theme.html` and `thumbnail.html`**: fill the parameters list, then
   render the thumbnail:

   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --headless --disable-gpu --screenshot=thumb.png \
     --window-size=1280,854 --hide-scrollbars "file://$PWD/thumbnail.html"
   python3 -c "from PIL import Image; Image.open('thumb.png').convert('RGB').save('thumbnail.webp', quality=90)"
   rm thumb.png
   ```

   `thumbnail.webp` is committed but stays out of `files[]` (see anatomy).

**Assets: images and fonts.** Both ship inside the template folder, so
license and size are part of authoring, not cleanup.

- **Images are copyright-free**: pull the reference photograph and any
  other media from Unsplash or another free-license stock service,
  generate them with a text-to-image tool when one is available, or use
  files the user supplies. Never copy the cloned design's photography
  (see the capture step).
- **Images arrive compressed**: downscale before committing (Pillow or
  sharp, the way the pptx skill preps deck photos). The reference
  photograph lands at the 1280px class, and the thumbnail renders at
  WebP quality 90 per step 6. A starter that shows the photo records
  `credit` and `credit-href`, and the readme's Files section names the
  source and license.
- **Fonts are free-license**: system stacks are the default and need no
  import. When the reference demands a distinctive face, pick a Google
  Fonts or SIL OFL family. Import it with a Google Fonts URL in
  styles.css, which the frontend build rewrites to local fonts.

## 4. Verify

```bash
node <this-skill>/scripts/verify.mjs <target-dir> --forbid "<reference name>"
```

Checks: every required file present, 48+ tokens, the readme heading set,
registry tokens identical to `styles.css` tokens, every card and starter path
on disk, deck runtime files present, `thumbnail.webp` rendered, no `TODO` or
unfilled markers, and (with `--forbid`) no occurrence of the reference's name.
`--manifest` also checks the registered entry's `files[]` against the folder.
Fix everything it flags. Do not register a failing template.

## 5. Register and prove it

Paths in this section are rooted at the designer-mcp-docker checkout, not this skill directory.

1. Append the system entry to `data/design-systems/manifest.json`: copy the
   sibling entry shape, list **every file in the folder** with `binary: true`
   on non-text assets, and keep `thumbnail.webp` out of `files[]`. Bump the
   `$comment` system count if it names one.
2. Bump the template count in `scripts/selftest.mjs` (`ds.total === N`) and
   its message.
3. `npm run templates` (stage into a live cache), `npm run bake`, then
   `npm test`. The selftest asserts every record carries the manifest schema
   and 48+ tokens.
4. `npm run frontend:build` stages the starters for the gallery's live
   previews. `npm run preview` then serves `/templates` and
   `/template/<slug>`. Open the Deck preview and step through every slide
   before calling it done.
5. `node scripts/build-static.mjs --out dist/static-test` for the static
   surface.

## 6. Tweak and generate

Per-request tweaks are token edits: retune `--color-*` and `--font-*` in
`styles.css`, keep the ramps on their lightness scale, keep the motifs. Then
generate deliverables from the template. Decks via
[../references/catalog-tools.md](../references/catalog-tools.md)
("Generate a slide deck from a template") and the bundled `pptx/SKILL.md`.
Web pages by copying the landing starter. The template is the contract, the
deliverable is a build artifact, and build artifacts stay out of `data/`.

## Rules

- The gallery must stay offline: no CDN links, no remote URLs in any authored
  file. System font stacks need no import, and the frontend build rewrites a
  Google Fonts import in styles.css to local fonts.
- Bundle copyright-free media only: free-license stock, generated imagery,
  or user-supplied files. Note the source in the readme's Files section.
- Bundled images arrive compressed: downscaled to serving size before
  commit, never pasted at camera resolution.
- Keep the deliberate extremes that make a system itself (zero radius, mono
  scheme, one dark panel per page). Do not soften them toward generic.
- Runtime JS is vendored, never edited. Registry tokens come from
  `_ds_manifest.json`, so keep it identical to `styles.css`.
- Never register a template whose authored files still name the reference it
  was cloned from.
