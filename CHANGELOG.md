# Changelog

## v1.8.0 (2026-11-22)

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.8.0`

- Plugin: the repo is now its own marketplace. `plugins/designer-mcp/` holds
  four sibling skills, and `.claude-plugin/marketplace.json` at the repo
  root lists the plugin for both ZCode and Claude Code. The plugin manifests
  (`.zcode-plugin/`, `.claude-plugin/`) declare the skills and register the
  Docker `design_*` server through `.mcp.json` on install.
- Split: the merged parent skill became four skills. `design-system` carries
  the research-first methodology, the DESIGN.md capture workflow, the craft
  references, the capture scripts, and the evals, and bundles the
  `design-template-authoring` sub-skill. `designer-mcp` carries catalog tool
  routing, MCP setup, the 24-harness install snippets (zcode.md is new), and
  the tool evals. `designer-documents` bundles the document toolchains (docx,
  pptx, xlsx, pdf, pdf-reading), and `designer-ui` bundles the craft and SDK
  layers (frontend-design, ui-sdk).
- Skill: the designer-mcp skill now doubles as the plugin's skill
  concierge. `references/skill-directory.md` catalogs the four skills and
  their eight bundled sub-skills with trigger phrases, an installed-check
  (path test relative to the skill directory), and offer-to-install
  commands (marketplace, skills CLI with `--skill`, checkout, zip). It
  routes and recommends by name without bundling the others, and it refuses
  to invent skills outside the plugin.
- Audit: rabbit-plugin-audit ends a full PASS with zero findings on the
  plugin and a clean marketplace report. Descriptions are tightened to
  about 148 always-on tokens for the whole plugin, both manifests declare
  the MIT license, and a plugin-root `evals/` suite joins the per-skill
  evals: four cross-skill routing cases (design capture, document
  deliverable, concierge install offer, library lookup), each with a
  prompt and a grader rubric, shipped in the zip beside the skills.
- Zip: `designer-mcp-skill.zip` now contains `skills/<four skills with their
  bundled sub-skills>` plus the dependency manifests at the archive root, so
  one unzip into a skills directory lands everything. `package-skill.mjs`
  starts from a clean archive so stale entries from a previous layout cannot
  survive, and its required-entry checks cover all four skills and every
  licensed sub-skill.
- Paths: the Dockerfile copies `plugins/designer-mcp/` instead of `skills/`,
  and preview.mjs, build-static.mjs, and `scripts/lib/ui-sdk-docs.mjs`
  resolve the skills root from `SKILLS_ROOT` (the legacy `SKILL_DIR` is
  still honored). `/skill/SKILL.md` serves the design-system skill.
- Docs: README, AGENTS.md, and the plugin README describe the marketplace
  install paths (ZCode Plugin Marketplace, `claude plugin marketplace add`,
  skills CLI, manual zip) and the new layout.

## v1.7.0 (2026-11-22)

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.7.0`
- Library catalog: `data/libraries/` holds nine hand-authored install
  manifests (react, tailwind, shadcn, radix-ui, lucide, heroicons, motion,
  and the google-fonts and fontsource font sources). No fetcher and no
  network: the entries are stable public facts. `design_library_search` and
  `design_library_get` serve them (24 `design_*` tools), the gallery and
  the static build expose `/api/libraries` and `/api/library/:id` as
  JSON-only routes, and `references/library-setup.md` carries the workflow.
- Asset CDN: `/assets` serves the built frontend as an offline module CDN.
  The new import map resolves 26 bare specifiers (react, motion, gsap,
  lucide, phosphor, radix-ui, and the shadcn components) to
  content-addressed module URLs on the gallery origin, so a prototype can
  import with zero external requests. `design_asset_list` and
  `design_asset_importmap` join the tool set (26 tools), and
  revalidation answers 304 from the manifest hash before touching disk.
- Skill: `design-template-authoring/` states the asset policy for authored
  templates (copyright-free media, compressed before commit, free-license
  fonts, credit recorded in the readme).
- Skill: audit fixes across the bundle. The xlsx dependencies gain `lxml`,
  pdf and pdf-reading gain the family Dependencies section with real links
  to REFERENCE.md and FORMS.md, frontend-design gains concrete trigger
  keywords and an explicit critique loop, and the design-template-authoring
  register step names the repo checkout as the root for its paths.
- Build: `scripts/lib/cache-env.mjs` fixes build-static silently reading
  the wrong cache directory locally when `DESIGN_CACHE_DIR` was set after
  the cache module had already evaluated.

## v1.6.0 (2026-11-21)

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.6.0`
- Templates: loam joins `data/design-systems/` as the seventh vendored
  system, slide-first, with its deck starter as the layout contract for
  generated decks. No pptx ships in git.
- Skill: `design-template-authoring/` ships as the eighth bundled sub-skill
  (scaffold and verify scripts, template skeleton, anatomy reference) under
  its own Apache-2.0 LICENSE.txt.
- Skill: `install/` carries MCP registration snippets for 23 agent
  harnesses, each with a Docker and a local-checkout variant, linked from
  SKILL.md, `references/mcp-tools.md`, and the README.
- Skill: three cross-model eval runs (ZCode harness, GLM-5.3-Flash) are
  recorded in `evals/evals.json` beside the two Codex runs, closing EV-02.
- Offline: `scripts/mcp-entry.mjs` defaults `REFERO_CACHE_TTL_MS` to the
  image's ten-year value, so a bare-host run no longer tries the live API
  when the cache mirror ages past the vendored 24-hour default.
- Docs: the README is restructured install-first (skills-CLI one-liner, a
  tell-the-skill step, manual blocks for Claude Code, Codex, and GitHub
  Copilot under collapsible details, Docker after, Sources collapsed), with
  local badge SVGs in `assets/badges/` and the MIT LICENSE at the repo
  root. The skills audit report file is removed with every finding closed.

## v1.5.4 (2026-11-16)

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.5.4`
- Docs: the README Quick start now leads with the published image (`docker
  pull` plus the gallery run) instead of a checkout path and a source-build
  pipeline, and registers the MCP server for Claude Code, Codex, OpenCode,
  Pi, and Hermes, all Docker-based with no build step and no volume. The
  skill section downloads the published zip from Pages and lists the skills
  directory per agent. Stale audit facts and two leftover local paths are
  corrected. No runtime code changes since v1.5.3.

## v1.5.3 (2026-11-16)

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.5.3`
- ReUI previews are sized to their content: each preview document reports its
  rendered height from inside the bundled demo modules and its iframe sizes
  itself (clamped 48 to 720 px). A single button no longer gets a 300 px box.
- ReUI previews render with their component styles: the fetcher caches
  `style-nova.css` (the style reui.io ships as default), the preview CSS
  build imports it with the sidebar palette tokens it needs, and preview
  documents carry the scoping class. Previously the `cn-*` classes were
  never cached and buttons rendered as bare text.
- Verified: `frontend:test` passes with zero off-origin requests across all
  250 component demos, selftest green, offline image verification green.

## v1.5.2 (2026-11-16)

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.5.2`
- Fixed component card thumbnails in the static site: the builder rewrote
  card image sources to a per-variant path the frontend build never writes,
  so every card on the Pages components index fell back to a placeholder.
  The rewrite now emits the slug-level screenshot. README links the live
  Pages gallery at the top.

## v1.5.1 (2026-11-15)

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.5.1`
- Skills: fixed every finding from the 2026-11-15 skills audit (SKILL.md
  restructured under the 500-line limit, a Contents section for the one
  reference missing it, dependency lines completed in docx and xlsx, a
  third-person description for pdf-reading, ui-sdk naming and link fixes,
  ui-sdk routed in the parent tables). Audit ends PASS WITH WARNINGS with
  one accepted vendor constraint.
- CI: fixed the Pages EBUSY failure (the static builder cleared the output
  mount root, which Linux refuses), Pages now builds with the checked-out
  scripts against the published image, and all workflow actions moved to
  their Node 24 majors.

## v1.4.0 — 2026-11-12

- **A third source: the Open Design Agent Kit.** `npm run agentkit` imports
  [feimacode/open-design-agent-kit](https://github.com/feimacode/open-design-agent-kit)
  (MIT), which re-packages OpenDesign's content for agents. It contributes
  **46 design systems that do not exist upstream** — 30 iOS systems adapted
  from `Meliwat/awesome-ios-design-md` and 16 aesthetic concepts re-authored
  from `bergside/awesome-design-skills` — taking the catalog from 1,494 to
  **1,540** (1,342 Refero styles + 198 design systems).
- **Corrections for 57 upstream systems** whose prose disagreed with their
  tokens. agentic's DESIGN.md said "Playfair Display" and `#FF5701` while its
  CSS said "Inter" and `#60a5fa`. The kit's overlay tree resolves each
  conflict, keeping the value that renders, so a system's prose, tokens and
  rendered preview now agree. The corrected files are restored from the kit's
  pristine tree before the overlay is applied, so re-running the fetcher
  never stacks a second override.
- **A Claude Design package for every system** — the same files Claude's own
  Design System format uses (`tokens.json`, `design-system.json`, `README.md`,
  `components/Cover/preview.html`). The new `design_claude_package` MCP tool
  reads them, so a system can be handed to Claude directly rather than
  re-described. The generic server now exposes **20 `design_*` tools**.
- **A rendered preview and cover for every system.** The gallery shows each
  system two ways, as an Open Design preview and as a Claude Design view, at
  `/preview/:id/open-design` and `/preview/:id/claude`. The artifacts are
  published by the kit as static files and cached locally, so the gallery
  still makes **no outbound calls**.
- **Curated mood/industry/surface descriptors** — what the tokens cannot say,
  and what the gallery filters on. `design_get` returns them under
  `package.descriptor`.
- **A redesigned gallery index.** Tag chips instead of dropdowns, and the
  descriptor tags on every card.
- **The `opendesign` importer is now shared.** The parsing moved to
  `scripts/lib/opendesign-import.mjs`, which the Agent Kit fetcher uses, so a
  package is read the same way whichever tree it came from.
- **The publish workflow now runs the Agent Kit fetcher** and fails if the
  baked catalog comes out without the kit layer. Before this, a CI-built
  image would have silently shipped 1,494 designs and answered every Claude
  Design request with an error. The published image is also verified to serve
  the kit routes with `--network none`.
- `agents-license.txt` records the new upstream sources and what was taken
  from each.

## v1.3.0 — 2026-11-10

- **The image now ships the catalog.** Previously every deployment had to
  populate a mounted cache before `docker run` showed anything — the
  gallery was empty and the MCP servers exited with "no catalog". The
  catalog is now baked into the image, so a bare `docker run` works with
  1,494 designs, 109 AI components and 159 presets already present, and
  makes **no outbound calls** (verified with `--network none`).
- **`scripts/bake-cache.mjs` assembles the baked catalog** (`npm run bake`).
  It also shrinks the catalog sharply: the live `catalog.json` wrote the
  same array under both `styles` and `designs`, and inlined Refero's
  `fullResult` (41 MB) that is already on disk in `styles/<id>.json`.
  Dropping both takes **84.4 MB → 4.1 MB** with no loss of function.
- **The upstream package's 24-hour TTL is disabled in the image.** It
  refetches the catalog over the network when the cache goes stale, which
  would have silently broken the offline guarantee. `REFERO_CACHE_TTL_MS`
  is now ~10 years; `refero_refresh` still refreshes on demand.
- **The AI component library** — 109 components, 250 variants, fetched
  from GradientDeck's public shadcn registry exports. Each variant's
  source is complete, typed TSX with `motion/react` and `lucide-react`,
  not a screenshot or a description of one. The variant count matches
  GradientDeck's own "109 components" claim.
- **The preset catalogs** — 139 background gradients and patterns plus 20
  liquid-glass effects, each with real CSS and a React template.
- **The gallery has a top bar** switching between three tabs: Designs,
  Components, and Gradients & Patterns. New routes: `/components`,
  `/component/:slug`, `/presets`, `/presets/:kind`, plus JSON APIs under
  `/api/components` and `/api/presets`.
- **Five new MCP tools** on the generic server, taking it from 5 to 10:
  `design_component_search`, `design_component_get`,
  `design_component_code`, `design_preset_search`, `design_preset_get`.
- **New `components` and `presets` compose services** to refresh those
  catalogs, and `npm run components` / `npm run presets` on the host.
- **Compose now uses a named volume** rather than binding `./cache`, so
  Docker seeds it from the baked image on first run. Bind-mounting a
  cache path still shadows the baked catalog, which is how you point at a
  newer cache without rebuilding.
- `update.mjs` now runs fetch → components → presets → bake → build, so a
  published image can never ship an empty gallery.

## v1.2.0 — 2026-11-10

- **Thumbnail compression.** The cached screenshots are 1440×900 JPEGs —
  150.6 MB for the catalog, more than the JSON catalog itself — but the
  gallery only ever renders them at 349 CSS px (grid) and 716 CSS px
  (detail). `scripts/compress-thumbs.mjs` re-encodes them to WebP at
  1000px: **150.6 MB → 55.9 MB (37%)**, mean PSNR 42.5 dB / SSIM 0.990
  against a Lanczos reference. A gallery page load drops from 25.3 MB to
  9.3 MB.
- `fetch-thumbs.mjs --compress` re-encodes before the bytes touch the
  disk, so a fresh install never stores the full-size JPEGs at all.
  The `thumbs` compose service uses it by default.
- New `compress` compose service re-encodes an existing cache:
  `docker compose run --rm compress --replace`.
- The resize uses sharp's **Lanczos3** kernel, not the encoder's own
  scaler. `cwebp -resize` uses a fast box filter and costs ~3.8 dB of
  PSNR on a 1440→1000 downscale, which is visible on text-heavy
  screenshots.
- `sharp` is an optional dependency — the plain fetch path does not need
  it, and it ships prebuilt binaries for linux-x64, linux-arm64 and
  darwin, so the same script runs on the host and in the multi-arch image.
- The preview server now prefers `.webp` over `.jpg` when both are
  present, so a cache can be compressed in place without a restart.

## v1.1.1 — 2026-11-10

- **Compose services accept trailing arguments.** `docker compose run --rm
  thumbs --limit 5 --force` used to fail with `node: bad option: --limit`,
  because compose's `command:` key REPLACES the container command rather
  than appending to it. The fetch services now use `entrypoint:` instead,
  so trailing args append as expected. Verified for all three: `fetch`,
  `opendesign`, `thumbs`.
- **Argument parsing takes the last occurrence.** The `--limit 0` default
  baked into the compose `command:` would have overridden a user's
  `--limit 20`. `argVal` now returns the last match, so a trailing
  argument always wins.
- **`fetch` defaults to the whole catalog.** With the `--limit 0` default
  moved out of the compose file, the script's own default changed from 40
  to 0 (all). A partial fetch from the `fetch` service would otherwise
  have silently produced an incomplete cache.
- **The cache directory default is now consistent.** `refero-public-fetch.js`
  defaulted to `~/.refero-cache` while every other script used
  `~/.design-cache`. It now uses `DESIGN_CACHE_DIR`, falls back to the
  legacy `REFERO_CACHE_DIR`, and only then to `~/.design-cache`.
- The compose image is overridable with `DESIGNER_MCP_IMAGE`, so a local
  build can be tested through the same compose services without retagging.

## v1.1.0 — 2026-11-10

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.1.0`
- **Offline thumbnails.** `/thumb/:id` no longer 302-redirects to the CDN.
  `scripts/fetch-thumbs.mjs` caches all 1,342 screenshots locally
  (~150 MB) and the gallery serves the bytes. The gallery now makes zero
  outbound requests. Verified against a container run with `--network none`.
- **OpenDesign as a second source.** 152 curated design-system packages from
  [nexu-io/open-design](https://github.com/nexu-io/open-design) (Apache-2.0)
  are imported by `scripts/fetch-opendesign.mjs` into the same catalog, with
  a `source` tag on every entry. Imported via sparse clone of the
  `design-systems/` subtree — 38 MB, not the 3.6 GB full repo.
- **Generic MCP server.** `scripts/mcp-server.mjs` exposes five source-neutral
  tools — `design_search`, `design_get`, `design_list`, `design_facets`,
  `design_markdown` — across both sources, with no network calls. The
  upstream package stays unmodified with its seven `refero_*` tools.
- **Generic naming.** The cache dir is `DESIGN_CACHE_DIR` (default
  `~/.design-cache`); `REFERO_CACHE_DIR` is still honoured. Routes are
  `/api/designs` and `/design/:id`, with `/api/styles` and `/style/:id`
  kept as aliases. `catalog.json` carries both `styles` and `designs` keys
  pointing at the same array.
- OpenDesign entries render their original hand-written DESIGN.md (~22 KB)
  rather than a synthesised one; Refero entries keep the upstream renderer,
  so their output stays byte-identical.

## v1.0.4 — 2026-11-10

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.0.4`
- The gallery now waits for `catalog.json` instead of dying at startup.
  Previously, starting the gallery while a fetch was still running produced
  an endless restart loop until the fetch finished. The preview server polls
  for up to `REFERO_CATALOG_WAIT_MS` (default 5 minutes), logs why it is
  waiting, and starts serving as soon as the catalog lands — no restart.

## v1.0.3 — 2026-11-10

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.0.3`
- The missing-cache error message no longer hardcodes a version string — the
  reference baked into v1.0.2 pointed at `v1.0.1` and would go stale on every
  release. It now says `<this-image>`.

## v1.0.2 — 2026-11-10

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.0.2`
- Fixed the compose file so a fresh clone works with no local build:
  - `image:` now points at the published tag, so `docker compose pull`
    succeeds (it referenced a local-only tag and failed with "pull access
    denied").
  - Removed the hardcoded `container_name`, so two checkouts no longer
    collide.
  - The host port is now `${GALLERY_PORT:-8787}`, so a second instance can
    run alongside the first.
- Added a `fetch` compose service. The image ships the fetcher, so
  `docker compose run --rm fetch` populates the cache with no repo checkout
  and no host-side node.
- Verified end to end from a clean clone against the published image:
  fetch (1,342 styles, 0 failures) → serve → query over MCP.

## v1.0.1 — 2026-11-10

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.0.1`
- Security: overrode `zod` to `^4.6.6`, clearing GHSA-mrhx-c7xc-m3w5
  (high — memory exhaustion while validating oversized constrained
  collections). zod is a transitive dependency of the upstream MCP SDK, which
  accepts `^3.25 || ^4.0`, so the bump applies without patching upstream.
- Verified: `npm audit` 0 vulnerabilities, selftest 17/17, all 7 MCP tools
  respond, zod validation still rejects bad arguments, server stays up after a
  rejected call.

## v1.0.0 — 2026-11-10

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.0.0`
- First published release. Multi-arch (`linux/amd64`, `linux/arm64`).
- MCP server with 7 tools over a 1,342-style local cache.
- HTTP preview gallery with live thumbnails, colour swatches, and type scales.
- Agent skill (`skills/designer-mcp`) bundled in the image and served at
  `/skill`. Passes the `rabbit-skills-audit` linter: 0 errors, 0 warnings.