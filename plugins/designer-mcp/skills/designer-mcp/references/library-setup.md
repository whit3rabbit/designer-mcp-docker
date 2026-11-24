# Installing Libraries, Fonts, and CDNs

How to answer "install X" asks: the user says shadcn, tailwind, react, or a
font, and you need to know which files their project needs. Tool parameters
and return shapes live in [mcp-tools.md](mcp-tools.md).

## Contents

- [What the catalog is](#what-the-catalog-is)
- [The workflow](#the-workflow)
- [Where CDNs are allowed](#where-cdns-are-allowed)
- [Worked examples](#worked-examples)
- [When a library is not in the catalog](#when-a-library-is-not-in-the-catalog)

## What the catalog is

The library layer is a small, hand-curated catalog of common frontend
libraries and font sources. Each entry is an install manifest: what the
library is, what it depends on, the exact install steps (npm packages, CLI
commands, CDN snippets), and the setup files with their full contents.

It answers the question "the user wants shadcn: what files would they need?"
with real files, not from memory. `design_library` (without `id`) searches/lists what is
cached, and `design_library` (with `id`) returns one entry in full.

The starter set covers the stack the rest of the catalog assumes: react,
tailwind, shadcn, radix-ui, lucide, heroicons, motion, google-fonts, and
fontsource. Categories: framework, css, components, primitives, icons,
animation, fonts.

## The workflow

When the user asks to install, set up, or wire in a library or font:

1. `design_library` with `query` (skip to step 2 when you already know the `id`).
2. `design_library` with `id` for the entry. Read `requires` first: pull those
   entries too, they install first.
3. Write the entry's `files` into the user's project at the given paths,
   then run the ordered `install.steps`. The file contents are complete,
   so write them as-is unless the project disagrees with them.
4. Chain into the component layer for the actual UI: `design_kit_search`
   for shadcn-style components (`kit: "gradientdeck"`), `design_kit_code` for the variant
   source. The entry's `related` field names the tools that pair with it.
5. Say what you installed and what each file is for. The user should be able
   to check every change.

Respect what the user already has. If their project runs Tailwind v3, do not
upgrade it to v4 unprompted: give the v3 shape and say the catalog teaches
v4. If they installed clsx and tailwind-merge already, keep their helper and
skip the dependency.

## Where CDNs are allowed

Two different rules, and the distinction matters:

- **This repo's surfaces** (gallery pages, vendored templates, authored
  design-system files) never reference a CDN. No remote fonts, scripts, or
  images. The design-template-authoring skill bans it and the frontend build
  rewrites such imports to local copies.
- **The user's project** is the user's. When they ask for Google Fonts, a
  Tailwind browser build, or React over esm.sh, that is correct wiring, and
  the catalog entry carries it in `install.cdn`.

The `cdn` array marks which entries offer that path. It is a legitimate
choice for prototypes and no-build pages, and the entries say so where it
applies. Prefer the npm path for anything meant to last, and say why when
you recommend one over the other.

A third option lives in the gallery itself. The built browser modules
(react, motion, gsap, lucide, phosphor, radix-ui, cn, and the shadcn
components) are served as a local CDN: `design_assets` returns the
import map, embed it in the page, and those bare imports load from the
running gallery with zero outbound network. Mention it when the user already
runs the gallery, or when a prototype must make no external request at all.

## Worked examples

### shadcn

The ask: "set up shadcn". Two prerequisites, then the CLI:

1. `design_library` for `tailwind` and `react` first, shadcn requires
   both. Install and wire them if the project lacks them.
2. `design_library` for `shadcn`. The entry carries `components.json`,
   `lib/utils.ts` (the `cn` helper), and `src/app.css` with the full neutral
   theme for Tailwind v4.
3. Run the steps. `npx shadcn@latest init` works when the CLI is available
   (it writes those files itself and installs the dependencies). Otherwise
   write the files from the entry and install the npm list yourself.
4. For real components, use the component layer rather than inventing them:
   `design_kit_search` for the 109 shadcn-style components with full
   TSX, and the gallery's `/reui` pages (1,264 components, gallery-only) when
   the user wants more than those.

The entry's notes describe the vendored radix-vega flavor and its slightly
different dependency set (the `cn` package instead of clsx plus
tailwind-merge). Match the dependency list to whichever helper you ship.

### tailwind

The ask: "add tailwind". The tailwind entry carries three shapes:

- v4 with a build step: `npm install tailwindcss @tailwindcss/postcss`, one
  `postcss.config.mjs`, and `@import "tailwindcss"` in the CSS entry. This
  is the default recommendation, no config file needed.
- no-build prototype: a single script tag from `install.cdn`, compiles in
  the browser. Prototypes only.
- v3 projects: config file plus content globs. Give this only when the
  project is already v3.

### react

The ask: "start a react project". The react entry carries the Vite scaffold
path and a single-file CDN page using esm.sh ESM imports (React 19 dropped
UMD builds, so that is the CDN path that works). Use the CDN page only for
throwaway prototypes the user opens directly.

### fonts

The ask: "use Inter" or "add a font". Two entries, one decision:

- `google-fonts`: two `preconnect` hints, then the css2 link with
  `display=swap`. The entry lists popular families with ready URLs and the
  Tailwind v4 `@theme` block that points `--font-sans` at the family.
- `fontsource`: the same families as npm packages, imported once, shipped
  from the user's own origin. Prefer it when the user wants offline builds,
  version-pinned fonts, or no request to Google at runtime.

Pair either with the typography craft reference when the ask is really
"typeface direction": choose the family from the design's tokens first.

## When a library is not in the catalog

Say so plainly: "X is not in the catalog". Then answer from knowledge, with
the same shape: what it requires, which files to write, the install steps.
Never invent a catalog entry or pretend a tool returned something. If the
user keeps asking for the same missing library, note that it is a candidate
to vendor, but the decision is theirs.

Unknown npm names are the failure mode to guard: do not recommend a package
name you are not sure exists. When unsure, say so and let the user verify,
or fall back to the libraries the catalog does cover.
