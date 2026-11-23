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
| `/components` and `/component/:slug` | 109 AI components with full TSX source, plus the vendored Slopstrap entry (HTML examples with self-contained native previews and a thumbnail) |
| `/reui` and `/reui/:category` | 1,264 ReUI components in 87 categories: live previews, Radix + Base UI TSX |
| `/dashboards` and `/dashboard/:slug` | 2 dashboard starters with offline zips and bundled fonts |
| `/heroui` and `/heroui/component/:slug`, `/heroui/guide/:slug` | 73 HeroUI v3 components (baked @heroui/react docs), 16 guides, oklch theme variables, per-component @heroui/styles CSS; `/api/heroui*` serves the same catalog as JSON |
| `/mantine` and `/mantine/category/:slug`, `/mantine/component/:slug` | 123 ui.mantine.dev ready-made components: full TSX + CSS module source, category illustrations, demo images; `/mantine/preview/:slug` frames the live offline preview rendered from the vendored @mantine packages; `/api/mantine*` serves the same catalog as JSON |
| `/baseui` and `/baseui/doc/:section/:slug` | 37 Base UI (`@base-ui/react`) headless component docs and 42 guides (overview, handbook, utilities), baked from the first-party llms.txt docs; docs-only, cross-linked to the ReUI gallery's Base UI variants; `/api/baseui*` serves the same catalog as JSON |
| `/daisyui` and `/daisyui/component/:slug` | 68 daisyUI 5 components with the upstream agent docs, class tables and copyable example HTML; `/daisyui/preview/:slug` (+`?theme=`) frames the native offline preview rendered by the vendored compiled css (all 35 themes); `/api/daisyui*` serves the same catalog as JSON |
| `/presets` and `/presets/:kind` | gradients, patterns, glass effects with real CSS |
| `/templates` and `/template/:slug` | 7 vendored design-system templates: tokens, theme knobs, manifest, files (loam ships the slide-first deck starter) |
| `/slopstrap` | the vendored Slopstrap joke framework rendered live: zip download, attribution for Mike Lacher (MIT), slop-level switcher |
| `/api/designs`, `/api/search?q=`, `/api/facets` | JSON for programmatic picking |
| `/api/libraries` and `/api/library/:id` | install manifests for the common frontend stack: react, tailwind, shadcn, fonts, icons (JSON only, no HTML page) |
| `/assets` | built frontend assets as a local CDN: offline starter (zip + page), browser modules, tailwind examples, template files, thumbnails, import map |
| `/assets/importmap.json` | the offline import map: bare specifiers (react, motion, radix-ui, shadcn/*) resolved to content-addressed module URLs on this origin |
| `/thumb/:id` | local WebP thumbnail bytes (jpg/png also accepted) |
| `/skill` and `/skill/marketplace.zip` | the plugin skills zip for offline download (four skills), and the same plugin as a local marketplace for offline `claude plugin marketplace add` |

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
- The HeroUI layer is gallery **and** MCP covered: the `/heroui` routes above
  plus eight `design_heroui_*` tools, over the same baked cache
  (`data/heroui/pin.json` pins the versions; `npm run heroui` refetches).
- The Mantine layer is gallery **and** MCP covered: the `/mantine` routes
  above plus three `design_mantine_*` tools, over the same baked cache. The
  live previews esbuild-bundle the vendored npm tarballs in
  `mantine/vendor/` (`data/mantine/pin.json` pins them; `npm run mantine`
  refetches). A demo that fails to bundle ships source-only — never claim a
  preview that does not exist.
- The daisyUI layer is gallery **and** MCP covered: the `/daisyui` routes
  above plus three `design_daisyui_*` tools, over the same baked cache. The
  vendored compiled css carries every component class and theme, so the
  native previews are plain HTML documents — no React, no Tailwind install
  (`data/daisyui/pin.json` pins the versions; `npm run daisyui` refetches).
  Component groups and the rendered examples are authored by this repo
  (upstream ships no machine-readable grouping); provenance records that.
- The Base UI layer is gallery **and** MCP covered: the `/baseui` routes
  above plus four `design_baseui_*` tools, over the same baked cache. Base UI
  is headless, so the layer is docs-only: there are no previews to build, and
  the gallery cross-links ReUI for the rendered version
  (`data/baseui/pin.json` pins the licence ref; `npm run baseui` refetches).
- Every `design_*` reply lands in a model's context. Keep replies inside the
  byte budgets `selftest.mjs` asserts (section 6), and keep `tools/list`
  inside its budget too. Rows are summaries with `detail: "full"` as the
  opt-in. A tool that returns a document pages it with `pageText`
  (`offset`, `maxBytes`, `nextOffset`). The server refuses any reply over
  `DESIGN_MCP_MAX_RESPONSE_BYTES` (default 120000) with a hint; it never
  truncates. A new tool with a large reply needs a narrowing argument and an
  entry in `NARROWING_HINT`.
- The SDK's low-level `Server` does not validate arguments against
  `inputSchema`. Handlers validate by hand (`asString`, `asEnum`, `asLimit`),
  so a schema `enum` without a matching `asEnum` is advisory only. Keep
  `inputSchema` a plain object schema: no top-level `oneOf`/`anyOf`/`allOf`,
  which strict clients reject (the selftest asserts this).
- The generic server starts without a catalog and never serves an empty one
  as data: catalog tools fail with the reason and re-check on the next call
  (`ensureCatalog`). Do not reintroduce a startup `process.exit` for missing
  data; it surfaces in clients as "Connection closed" and takes down the
  layers that need no catalog. `scripts/mcp-entry.mjs` still exits when the
  cache is missing, because the upstream server cannot explain itself.
  Inside the image the catalog is baked, so that exit almost always means a
  volume mounted over `/cache` hid it. The message leads with that, not
  with the fetcher, which needs network.
- Remote mode (`DESIGN_REMOTE_URL` / `--url`) reads through `remoteJson` and
  `remoteText` in `scripts/lib/cache.mjs`, never a raw `fetch`. They carry
  the Rule 1 behavior: they do not throw, an unreachable host falls back to
  disk, the server adds `remoteNote` to the reply, and a path that would
  leave the host's `api/` tree (dot segments, `%2e`, `?`, `#`) is never sent.
  A new remote reader gets all of that by using them.
- The upstream package is vendored **unmodified**. Never patch
  `node_modules/fidgetcoding-refero-mcp`. Adapt in `scripts/` so upstream
  updates drop in cleanly.
- The plugin (`plugins/designer-mcp/`) ships inside the image, is zipped at
  build time (`scripts/package-skill.mjs`, four skills under its `skills/`
  with the bundled sub-skills inside them, manifests at the zip root) and
  served at `/skill`. The Dockerfile runs the packager itself, so the zip
  always matches the tagged checkout.
- The packager also builds `designer-mcp-marketplace.zip`, served at
  `/skill/marketplace.zip` (and `skill/designer-mcp-marketplace.zip` on
  Pages): the three root marketplace manifests plus `plugins/designer-mcp/`
  with every harness manifest and `.mcp.json`. It is the offline install
  path (`claude plugin marketplace add <unzipped dir>`), since the GitHub
  marketplace needs network. The Dockerfile copies the root manifests into
  `/app` for it. The packager excludes `plugins/designer-mcp/*.zip` because
  the image keeps the built zips in the plugin root.
- The skill zip keeps its `skills/` prefix. Unzipping it straight into a
  skills root lands every skill one level too deep (`~/.claude/skills/skills/`),
  where no agent finds it. Install docs extract aside and copy `skills/.`;
  `selftest.mjs` section 13 pins that layout and the marketplace zip.
- Air-gapped installs: `.mcp.json` pins the image tag, and Docker cannot
  pull offline, so that exact tag must be `docker load`ed on the host. Say
  so wherever an offline install is documented.
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
  tag. The image tag in `plugins/designer-mcp/.mcp.json` and its mirror
  `.agents/plugins/designer-mcp/mcp_config.json` is pinned to the same
  version and bumps with them, so a plugin install runs the server its
  skills describe. The paste-once install snippets keep `:latest`.
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
- `build-static.mjs` copies the image's zips (skill and marketplace) into
  the Pages output and never packages one.
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
  `ui-sdk/`, and the four `heroui/` sub-skills).
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
| `data/slopstrap/` | vendored Slopstrap framework (upstream zip verbatim, css/js, examples, catalog record, no fetcher), copied into `bake/slopstrap/` by `npm run bake` and staged into a live cache by `npm run slopstrap` |
| `dist/` | built skill zip |

- Changing cache format or fetchers: run `npm run bake`, then `npm test`
  (self-test across cache, renderer, preview, and MCP). Keep it green.
- `selftest.mjs` hard-asserts the template count (`7`) and 48+ tokens per
  record: bump both when adding an eighth design-system template. It also
  hard-asserts the library catalog (`9+` entries with install steps and
  non-empty setup files): bump when growing the library set deliberately.
- `selftest.mjs` section 12 covers degraded mode: no catalog, an unreachable
  remote host, traversal arguments against a recording loopback host, a
  non-http remote URL, a malformed input line, the upstream wrapper with
  `DESIGN_CACHE_DIR` alone, and the layer 404 rule (a host 404 for a HeroUI
  doc that exists on disk returns nothing; a dead host returns disk plus
  `remoteNote`).
- `selftest.mjs` section 11 is the docs drift check: every registered tool
  must appear in `mcp-tools.md`, every `design_*` name in the skills and
  docs must be a real tool or a prefix, stated tool counts must match, and
  the pinned image tag must match `package.json`. A new or renamed tool
  fails `npm test` until the docs follow.
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

## Working notes for agents

Lessons from past work on this repo. Each one cost a wrong turn at least
once. Read them before touching the MCP server, the lib readers, or the
selftest.

### Finding and running things

- `bake/`, `cache/`, `dist/` and `node_modules/` are gitignored, so search
  tools that honor `.gitignore` (ripgrep and its wrappers) return nothing
  for them, with no error. An empty result there is not evidence of absence.
  Use `grep`, `find`, or a short `node -e` script for those paths.
- The root `.gitignore` rule `dist/` matches any `dist/` folder, vendored
  ones included. `data/slopstrap/dist/` was once never committed, so local
  tests passed and CI failed on the missing css. A vendored `dist/` needs a
  `!path/dist/` negation; check with `git check-ignore -v <file>`.
- The Dockerfile `frontend-build` stage copies `scripts/lib/*` modules by
  name. A new `scripts/lib` import in `frontend/*.mjs` fails only in
  `docker build`, never in `npm test`. Add it to that COPY line.
- You do not need Docker to verify the MCP server. It is a stdio process:
  newline-delimited JSON-RPC in, the same out, logs on stderr.

  ```bash
  printf '%s\n' \
    '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"probe","version":"0"}}}' \
    '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"design_facets","arguments":{}}}' \
    | DESIGN_CACHE_DIR="$PWD/bake" node scripts/mcp-server.mjs 2>/dev/null
  ```

  For more than two calls, spawn it from a small Node script and keep stdin
  open. Measure replies in bytes of the `text` field; tokens are roughly
  bytes / 3.6.
- "Connection closed" in a client means the process exited or never
  started. Check that the Docker daemon is running and read stderr before
  suspecting the server code.
- `npm test` picks `bake/` on its own when `bake/catalog.json` exists. It
  spawns the gallery and several MCP servers, so let it finish rather than
  running pieces by hand.

### Data shapes that are not what they look like

- `catalog.json` is `{ updatedAt, styles }`, with a `source` tag on each
  OpenDesign row. There is no top-level `designs` key in the bake. Tell the
  sources apart by the per-row tag, never by the file's shape. The upstream
  `refero_refresh` tool rewrites the file with Refero rows only, which is
  what the half-catalog `warning` detects.
- A catalog slug is not a file name. HeroUI lists `text-field` but files the
  source under `textfield`; its guide slug `theming-with-agents` lives at
  `guides/theming-for-agents.md`; Base UI release notes sit three path
  segments deep. Resolve a name through the catalog entry's `path`, and do
  not rebuild a path from the caller's string.
- A design's `colors` array lists neutrals first. The brand color is often
  seventh or later, so a "first N" cut drops it. `rowColors` sorts accents
  ahead of neutrals before cutting.
- Most data is long-tailed. The median Base UI doc is 52 KB and the largest
  is 342 KB; the median component record was 24 KB and the largest 194 KB.
  A sample of three tells you nothing about the worst case.

### Changing the MCP server

- The lib readers in `scripts/lib/` are shared with the gallery
  (`preview.mjs`) and the static build (`build-static.mjs`). Shaping a reply
  for a model (dropping fields, paging, filtering files) belongs in the
  handler in `mcp-server.mjs`. Changing a reader's default changes the
  gallery and the published static JSON too. `readHeroUiSource` keeps
  Storybook files by default for that reason, and only the MCP handler opts
  out.
- A limit can make a tool useless. The reply-size guard once blocked
  `design_template_file` for the 135 KB deck stage script, a file the skills
  tell agents to copy. Before adding or lowering a limit, sweep every
  record the tool can return (all designs, all component variants, all
  template files), not a few, and give the tool an argument that gets under
  the limit.
- Every word in a tool or parameter description is paid for in every
  session. `tools/list` has a byte budget in the selftest. When adding a
  parameter, reuse the shared `PAGE_PROPERTIES` and `DETAIL_PROPERTY`
  fragments and keep the description to one short sentence.
- An empty result reads as "nothing exists". If the real cause is a bad
  argument, a missing layer, or a guess, say so: throw for a bad argument,
  return `available: false` with the command to run for a missing layer,
  and add `matchedBy` when an identifier was resolved by a guess.
- Never truncate a reply to make it fit. Cut JSON does not parse, and a
  shortened document that does not say so reads as complete. Page it and
  return `nextOffset`, or refuse with the argument that narrows it.
- Paging is in UTF-8 bytes and pages end on a line break. Keep it that way:
  the parts must concatenate to the exact file, because agents write
  template files to disk from them.

### Writing selftest checks

- A tool error is plain text (`Error: ...`), not JSON. Parse replies with
  `toolJson` and test failure with `toolFailed`. A bare `JSON.parse` on an
  error throws, and each section is one `try` block, so one throw skips
  every check after it.
- Test every catalog entry, not one. The `Button` check passed while
  `TextField` could not be read at all. The sweeps over all guides, all
  components and all template files are fast and are what catch slug and
  path bugs.
- After writing an assertion, break the code on purpose and watch it fail,
  then restore. An assertion that cannot fail is worse than none. The first
  version of the remote traversal check passed with the protection removed,
  because HTTP clients resolve `../` before sending: the escape arrived as a
  clean `/site/api/secret.md` with no dots in it.
- Do not hard-code a count in prose you cannot keep true. The tool count
  was stale in four files at once (20, 26 and 40 for a real 44). Either
  leave the number out, or write it in a form section 11 checks in
  `README.md`, `docs/ARCHITECTURE.md` and the install README: a number
  followed by `` `design_*` tools `` or by `tools in total`.
- Tests may open loopback sockets (the gallery, a recording host for remote
  mode). They must not reach any other host.

### Remote paths and URLs

- Validate a path before it becomes a URL, not after. The URL parser treats
  `..`, `%2e%2e` and `.%2e` alike as "go up", and `?` or `#` rewrite the
  request. `isSafeRemotePath` in `scripts/lib/cache.mjs` is the one place
  this is checked, which is why remote reads go through `remoteJson` and
  `remoteText`.
- A 404 from the remote host is an answer. Only a host that did not answer
  falls back to disk and sets `remoteNote`. This holds for layer items
  (docs, source, css, themes), not just catalogs: a 404 that read disk
  instead made a layer the host lists as empty still return items, and
  paired a remote catalog with a different local bake, silently (a 404 does
  not count as a failure, so no `remoteNote`). Layer readers use
  `remoteOr(kind, rel, local)` from `scripts/lib/cache.mjs`, which encodes
  the rule once. A new layer reader uses it too.

### Skills, docs and versions

- The skills are a contract with the server. Renaming a tool, a parameter
  or a response field means editing `mcp-tools.md` in the same change;
  section 11 fails `npm test` for a tool the docs do not name, or a name
  the server does not have.
- Skills install from `main`, the image from a tag, and Docker never
  re-pulls a tag it has. Do not assume the user's server matches the skill
  text in front of you. A tool the skill names but the client lacks means an
  old image, not a bug in the skill.
- A `SKILL.md` `description` is always in context for every session of
  every user. Keep each to about one line. Routing detail goes in the body
  or in `skill-directory.md`.
- Scratch goes in `skills/tmp/` or `plugins/designer-mcp/skills/tmp/`, both
  ignored by git and Docker. The working tree usually holds uncommitted
  release work: stage files by name, never with `git add -A`.

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
     manifests, bump the pinned image tag in `plugins/designer-mcp/.mcp.json`
     and `.agents/plugins/designer-mcp/mcp_config.json`, and record the
     release in `CHANGELOG.md`.
  2. Run `npm test`, `npm run package:skill`, `claude plugin validate .`,
     `claude plugin validate plugins/designer-mcp`, and
     `npx --yes skills add . --list`.
  3. Commit and push `main`, push the `vX.Y.Z` tag, wait for `publish.yml`
     green, then confirm `pages.yml` re-ran green, then verify the live site
     serves the release.
- The pinned image tag points at an image that does not exist until
  `publish.yml` finishes. Between the push of `main` and that run going
  green, a fresh plugin install cannot start the `designer` server. Push the
  tag in the same step as `main` to keep that window to one publish run, and
  do not announce the release before the image is up.
- Verification checks `api/templates.json` for the expected systems and
  `/skill/designer-mcp-skill.zip` for the current generation (look for
  `skills/design-system/` and `skills/designer-mcp/` inside), and
  `/skill/designer-mcp-marketplace.zip` for `.claude-plugin/marketplace.json`
  and `plugins/designer-mcp/.mcp.json` at the current pinned tag.
- A tag can be re-pointed only before its image exists (the first v1.6.0
  run died before "Build and push" and its tag was moved). Never move a
  tag whose image already shipped. Publish a new version instead.
