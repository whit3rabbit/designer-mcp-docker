# AGENTS.md: rules for agents working in this repo

One Node image, three surfaces over one on-disk cache:

- **Gallery** (`scripts/preview.mjs`), the HTTP server on `:8787` where a human
  browses and picks assets (design systems, components, ReUI components,
  dashboard starters, gradients/presets).
- **Static Site Builder** (`scripts/build-static.mjs`, `scripts/static-serve.mjs`).
  Emits a self-contained static site: relative URLs, `api/*.json` endpoints,
  `dist/static/` or `public/` for Pages. `.github/workflows/pages.yml`
  publishes the GitHub Pages copy: gallery preview, no MCP.
- **Generic MCP** (`scripts/mcp-server.mjs`): stdio JSON-RPC, `design_*` tools
  across every source. The recommended integration path. Supports optional
  `DESIGN_REMOTE_URL` / `--url` to read from a hosted static site (GitLab or
  GitHub Pages). Defaults to 100% offline local disk.
- **Upstream MCP** (`scripts/mcp-entry.mjs`): stdio, `refero_*` tools from the
  vendored `fidgetcoding-refero-mcp` package.

## Rule 1: the image runs fully offline

This is the core invariant. Every change is measured against it.

- The runtime surfaces (`scripts/preview.mjs`, `scripts/mcp-server.mjs`,
  `scripts/mcp-entry.mjs`) make **zero outbound network requests**. Every byte
  they serve comes from the cache directory (`/cache` in the image).
- All assets are **baked into the image**: catalog, thumbnails, components,
  presets, and the skill zip (`COPY bake/ /cache/`,
  `COPY plugins/designer-mcp/ ./plugins/designer-mcp/`).
  A plain `docker run` with no volume and no network serves the complete
  catalog. Verify exactly that way:

  ```bash
  docker run --rm --network none -p 127.0.0.1:8787:8787 \
    ghcr.io/whit3rabbit/designer-mcp:latest
  curl http://127.0.0.1:8787/healthz
  ```

- Network access is allowed **only** at image build time and in the fetchers
  (`scripts/fetch-*.mjs`, `scripts/refero-public-fetch.js`,
  `scripts/compress-thumbs.mjs`). A runtime network feature must degrade
  gracefully to cached data and say so in its response.
- Never introduce remote URLs into gallery HTML: no CDN fonts, scripts,
  images, or analytics. Thumbnails, styles, and references all resolve
  locally.

## Rule 2: the gallery is the pick-and-choose webserver

`scripts/preview.mjs` is the only webserver. A user picks assets from it at
these routes, all served from the local cache:

| Route | What a user picks from |
|---|---|
| `/` and `/design/:id` | 1,540 design systems: screenshot, tokens, type scale, DESIGN.md |
| `/components` and `/component/:slug` | 109 AI components with full TSX source |
| `/reui` and `/reui/:category` | 1,264 ReUI components in 87 categories: live previews, Radix + Base UI TSX |
| `/dashboards` and `/dashboard/:slug` | 2 dashboard starters with offline zips and bundled fonts |
| `/presets` and `/presets/:kind` | gradients, patterns, glass effects with real CSS |
| `/templates` and `/template/:slug` | 7 vendored design-system templates: tokens, theme knobs, manifest, files (loam ships the slide-first deck starter) |
| `/api/designs`, `/api/search?q=`, `/api/facets` | JSON for programmatic picking |
| `/api/libraries` and `/api/library/:id` | install manifests for the common frontend stack: react, tailwind, shadcn, fonts, icons (JSON only, no HTML page) |
| `/assets` | built frontend assets as a local CDN: offline starter (zip + page), browser modules, tailwind examples, template files, thumbnails, import map |
| `/assets/importmap.json` | the offline import map: bare specifiers (react, motion, radix-ui, shadcn/*) resolved to content-addressed module URLs on this origin |
| `/thumb/:id` | local WebP thumbnail bytes (jpg/png also accepted) |
| `/skill` | the plugin skills zip for offline download (four skills) |

- New pages/routes must be answerable from the cache alone (Rule 1).
- Keep the DESIGN.md output byte-identical to what `refero_design_md` returns.
  Both must call the upstream package's own `renderDesignMd`.

## Rule 3: MCP and skill integration

- Both MCP servers read the same cache and speak stdio JSON-RPC. Neither
  listens on a port. Register with an agent via a `docker run -i` command.
- Prefer the `design_*` server for new work: it covers both sources plus the
  component, preset, library, and asset layers and works fully offline. Two
  upstream tools need network and are the documented exceptions:
  `refero_similar`, `refero_refresh`.
- The `design_asset_*` tools read the built frontend (`DESIGN_FRONTEND_DIR`,
  `/app/frontend-cache` in the image), not `/cache`. A checkout without
  `npm run frontend:build` degrades to a graceful note, not an error.
- The ReUI and dashboard layers are gallery-only: no MCP tools cover them.
  Route those asks to the gallery routes or the static `api/reui.json` /
  `api/dashboards.json` endpoints.
- The upstream package is vendored **unmodified**. Never patch
  `node_modules/fidgetcoding-refero-mcp`. Adapt in `scripts/` so upstream
  updates drop in cleanly.
- The plugin (`plugins/designer-mcp/`) ships inside the image, is zipped at
  build time (`scripts/package-skill.mjs`, four skills under its `skills/`
  with the bundled sub-skills inside them, manifests at the zip root) and
  served at `/skill`. The Dockerfile runs the packager itself, so the zip
  always matches the tagged checkout.
- The repo root carries the marketplace manifests for each harness:
  `.claude-plugin/marketplace.json` (Claude Code and ZCode),
  `.agents/plugins/marketplace.json` (Codex), and
  `.cursor-plugin/marketplace.json` (Cursor), while `.agents/skills.json`
  and `.agents/plugins/designer-mcp/` provide Antigravity workspace
  discovery. Inside `plugins/designer-mcp/`, each harness has its manifest
  (`.claude-plugin/plugin.json`, `.zcode-plugin/plugin.json`,
  `.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json`) plus `.mcp.json`.
  Bump the version in `package.json`, all plugin manifests, and the
  `.claude-plugin/marketplace.json` entry together, aligned with the release
  tag.
- Gotchas for the plugin/skill layout:
  - Keep `metadata.category` out of `.claude-plugin/marketplace.json` (Claude
    Code only accepts `category` on each `plugins[]` entry; `claude plugin
    validate .` warns otherwise).
  - The `@ui-sdk/*` offline docs live under
    `plugins/designer-mcp/skills/designer-ui/ui-sdk/` (not `designer-mcp/`).
    `scripts/lib/ui-sdk-docs.mjs` and `scripts/build-static.mjs` must point
    there, and `selftest.mjs` verifies `design_docs_search` / `design_docs_get`.
  - Relative links inside `plugins/designer-mcp/skills/designer-mcp/references/skill-directory.md`
    resolve from `references/`, so sibling skills need `../../<skill>/SKILL.md`
    (whereas the shell `test -f ../design-system/SKILL.md` check resolves
    from the skill root `designer-mcp/`).
  - In local dev, `scripts/preview.mjs`'s `/skill` route checks
    `SKILLS_ROOT`, `dirname(SKILLS_ROOT)`, and `dist/designer-mcp-skill.zip`
    before falling back to a tarball.
- `build-static.mjs` copies the image's zip into the Pages output and
  never packages one.
- The skills install remotely with the skills CLI
  (`npx skills add whit3rabbit/designer-mcp-docker`). Discovery offers
  four skills: a shallower `SKILL.md` shadows any nested one, so the
  bundled sub-skills ride along inside their parents.
- Do not publish deeper `SKILL.md` files expecting separate listings.
- Remote installs serve the last-pushed commit on main. A skill change is
  not live for installers until it lands there.
- `plugins/designer-mcp/skills/designer-mcp/install/` holds MCP registration
  snippets for 24 coding agents, each with a Docker and a local-checkout
  variant. Route "install the MCP server" asks to `<harness>.md` in that
  folder. The files are plain Markdown: edit by hand.
- The snippets are adapted from the whit3rabbit/agent-config repo's
  harness docs (`docs/agents/` there, not in this repo). Keep paths in
  sync when those docs change.
- Keep the skills' tool names (`design_*`, `refero_*`) in sync with the
  actual servers and their scope honest: no screens/flows layer exists. Route
  those asks to the craft references. Never invent precedent.
- The designer-mcp skill carries the plugin's skill directory
  (`skills/designer-mcp/references/skill-directory.md`): the four skills,
  their bundled sub-skills, trigger phrases, an installed-check, and the
  offer-to-install commands. Keep it in sync when skills move or change
  names. It routes and recommends, and never bundles the other skills.
- Four skills carry the surface: `design-system` (methodology, capture,
  craft references, and the bundled `design-template-authoring/`),
  `designer-mcp` (catalog tools, MCP setup, install snippets),
  `designer-documents` (bundled `docx/`, `pptx/`, `xlsx/`, `pdf/`,
  `pdf-reading/`), and `designer-ui` (bundled `frontend-design/`,
  `ui-sdk/`).
- Dependency manifests live at the plugin root
  (`plugins/designer-mcp/requirements.txt`, `package.json` there), not per
  skill. They cover the sub-skills' core Node and Python needs, and the
  zip carries them at the archive root.
- Each bundled sub-skill carries an Apache-2.0 `LICENSE.txt`. The five
  adapted from upstream (`anthropics/skills`) have it copied verbatim,
  `pdf-reading/` reuses that text, and `ui-sdk/` ships the ui-sdk
  package's own bundle. `design-template-authoring/` is original work
  with plain Node scripts.
- The image serves those files but installs none of their dependencies. The
  consuming agent runs the scripts and installs what its task needs
  (check-then-install).
- Anything under `plugins/designer-mcp/` is COPY'd into the image. Treat it
  as distributable: no secrets, no scratch material. Scratch goes in
  `plugins/designer-mcp/skills/tmp/` (or the legacy repo-level
  `skills/tmp/`), which are dockerignored.

## Rule 4: data-source compliance

- Fetchers read only the **public** style pages that robots.txt permits for
  generic agents. `/api/` is never requested. Preserve this in any new
  fetcher. The rationale lives in `docs/DATA-SOURCE.md`.
- Design data belongs to Refero and the depicted sites. This project caches
  publicly available pages locally and does not redistribute them.

## Cache and build workflow

| Path | Role |
|---|---|
| `cache/` | working cache: gitignored, mounted read-only at runtime, **overrides** the baked catalog |
| `bake/` | build output copied into the image: gitignored but kept in the Docker build context |
| `data/design-systems/` | vendored source of the 7 design-system templates, copied into `bake/design-systems/` by `npm run bake` and staged into a live cache by `npm run templates` |
| `data/libraries/` | hand-authored library install manifests (no fetcher, no network), copied into `bake/libraries.json` + `bake/libraries/` by `npm run bake` |
| `dist/` | built skill zip |

- Changing cache format or fetchers: run `npm run bake`, then `npm test`
  (self-test across cache, renderer, preview, and MCP). Keep it green.
- `selftest.mjs` hard-asserts the template count (`7`) and 48+ tokens per
  record: bump both when adding an eighth design-system template. It also
  hard-asserts the library catalog (`9+` entries with install steps and
  non-empty setup files): bump when growing the library set deliberately.
- `npm test` runs `test-design-md.mjs` and `selftest.mjs` only. The
  Playwright browser suite (`npm run frontend:test`) only runs in
  publish.yml's verify step. Run it locally before pushing template,
  preview, or frontend changes.
- Local dev against a live cache: run `npm run templates` once to stage the
  design-system layer (additive, idempotent).
- The cache TTL is deliberately huge (`REFERO_CACHE_TTL_MS=315360000000`):
  refresh by re-running fetchers, never by letting the package hit the live
  API on expiry.
- The wrapper (`scripts/mcp-entry.mjs`) applies this default itself, so a
  bare-host run without env keeps the offline behavior.
- Search without `OPENAI_API_KEY` falls back to a keyword scorer: expected,
  not a bug.

## Release flow

A release pushes main and a tag, and two workflows race for the same image
reference.

- `publish.yml` fires on the tag: fetch, bake, frontend build, the
  Playwright browser check, then push `ghcr.io/whit3rabbit/designer-mcp:<tag>`
  and `:latest`.
- `pages.yml` rebuilds the static site from `:latest`. It fires on pushes
  to main and again after publish completes successfully.
- Pushing main and a tag together once shipped a stale site (previous
  bake, old skill zip), so never treat the first pages run of a release
  as final. Confirm the post-publish rerun instead.
- Order:
  1. Bump `version` in `package.json`, `.claude-plugin/marketplace.json`, and
     all `plugins/designer-mcp/.{claude,zcode,codex,cursor}-plugin/plugin.json`
     manifests, and record the release in `CHANGELOG.md`.
  2. Run `npm test`, `npm run package:skill`, `claude plugin validate .`,
     `claude plugin validate plugins/designer-mcp`, and
     `npx --yes skills add . --list`.
  3. Commit and push `main`, push the `vX.Y.Z` tag, wait for `publish.yml`
     green, then confirm `pages.yml` re-ran green, then verify the live site
     serves the release.
- Verification checks `api/templates.json` for the expected systems and
  `/skill/designer-mcp-skill.zip` for the current generation (look for
  `skills/design-system/` and `skills/designer-mcp/` inside).
- A tag can be re-pointed only before its image exists (the first v1.6.0
  run died before "Build and push" and its tag was moved). Never move a
  tag whose image already shipped. Publish a new version instead.
