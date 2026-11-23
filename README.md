# designer-mcp-docker

**1,540 real product design systems, queryable by an agent and browsable by a human.**

**Browse it live: [whit3rabbit.github.io/designer-mcp-docker](https://whit3rabbit.github.io/designer-mcp-docker/)**. The full gallery on GitHub Pages: design systems, AI components with live previews, the ReUI gallery, dashboard starters, HeroUI docs, and presets. No Docker needed to look.

[![image: ghcr.io](assets/badges/image.svg)](https://github.com/whit3rabbit/designer-mcp-docker/pkgs/container/designer-mcp)
[![publish: GitHub Actions](assets/badges/publish.svg)](https://github.com/whit3rabbit/designer-mcp-docker/actions/workflows/publish.yml)
[![license: MIT](assets/badges/license.svg)](LICENSE)

Three surfaces over one cache:

- **MCP server** (stdio): 7 upstream `refero_*` tools for agents
- **Generic MCP server** (stdio): 37 source-neutral `design_*` tools across both sources
- **Live gallery** (HTTP): design systems, AI components, the ReUI gallery, dashboard starters, HeroUI docs, the Mantine UI catalog, and presets

The upstream package [`fidgetcoding-refero-mcp`](https://github.com/fidgetcoding/refero-design-mcp)
is vendored **unmodified** and runs against a prebuilt cache, so upstream
updates drop in cleanly.

**Runs fully offline.** Every thumbnail is cached on disk, so the gallery
makes zero outbound requests. Verified against a container with
`--network none`.

---

## Install

Two ways in, fastest first. The plugin brings all four skills, the
dependency manifests, and the routing eval cases, and it registers the MCP
server for you. The skills CLI brings the skills alone, and step 3
registers the server when you installed that way.

### 1. Install the plugin (Claude Code and ZCode)

This repo is its own marketplace. A plugin install is the complete one: all
four skills, the dependency manifests, the routing eval cases, and the
Docker `design_*` server registered automatically through the plugin's
`.mcp.json`.

On ZCode: open **Plugin Marketplace → Add → Add Plugin Marketplace**, paste
`https://github.com/whit3rabbit/designer-mcp-docker` (or a local clone of
this repo), then install **Designer MCP** from it.

On Claude Code:

```bash
claude plugin marketplace add whit3rabbit/designer-mcp-docker
claude plugin install designer-mcp@designer-mcp-docker
```

The marketplace command also takes a path, so a checkout can install itself
before any release exists: `claude plugin marketplace add /path/to/this-repo`.

### 2. Install the skills alone (Codex and every other harness)

The skills CLI discovers the four skills and asks which to install:

```bash
npx -y skills add whit3rabbit/designer-mcp-docker
```

Run it inside a project for a project-local install, or add `-g` for
user-level. Add `--all` to install the four skills everywhere without
prompts, or `-s <skill>` for one, for example
`-s designer-documents`. The install carries each skill's references,
scripts, and eval suite, and the MCP install snippets step 3 uses. The
plugin-root dependency manifests and routing eval cases stay in the repo:
the sub-skills name every dependency inline with check-then-install
guidance, so nothing is required upfront. Pin a release tag for repeatable
installs (`npx -y skills add whit3rabbit/designer-mcp-docker@v1.8.0`), and
run `skills update` later to move an installed copy to the latest push.

**Upgrading from v1.7.0 or earlier.** The plugin used to be one skill, also
named `designer-mcp`, with `docx/`, `pptx/`, `pdf/` and the rest inside it.
v1.8.0 split it into four skills. Installing the new ones does not remove an
old copy, and the old folder can shadow the new `designer-mcp` skill. If your
installed `designer-mcp` folder has `docx/` at its top level, delete that
folder and install again.

**Skills newer than the server.** Skills install from `main`. A hand-pasted
MCP registration runs `ghcr.io/whit3rabbit/designer-mcp:latest`, and Docker
keeps using a `:latest` it has already pulled. If a skill names a tool your
client does not list, run `docker pull ghcr.io/whit3rabbit/designer-mcp:latest`
and restart the client. The plugin install avoids this: its `.mcp.json` pins
the image tag that matches the plugin version.

### 3. Tell the skill to install the MCP server

Non-plugin installs register the server separately. The designer-mcp skill
bundles copy-paste config snippets for 24 harnesses under `install/`, each
with a Docker and a local-checkout variant. In the same session, say:

> Install the designer MCP server for \<your agent\>

The agent opens the matching `install/<harness>.md`, writes the config, and
tells you where it registered. The blocks below are the manual path for the
most common harnesses.

### Manual setup: Claude Code, Codex, ZCode, GitHub Copilot

<details>
<summary><strong>Claude Code</strong></summary>

`claude mcp add` writes the user-scope config in one line:

```bash
claude mcp add designer -- \
  docker run --rm -i --network none \
  ghcr.io/whit3rabbit/designer-mcp:latest node scripts/mcp-server.mjs
```

Or a version-controlled project `.mcp.json`:

```json
{
  "mcpServers": {
    "designer": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "--network", "none",
        "ghcr.io/whit3rabbit/designer-mcp:latest",
        "node", "scripts/mcp-server.mjs"]
    }
  }
}
```

Keep MCP servers out of `settings.json`. That file is not the MCP surface.

</details>

<details>
<summary><strong>Codex</strong></summary>

Add to `~/.codex/config.toml`. Project scope is `<root>/.codex/config.toml`
and loads only when Codex trusts the project.

```toml
[mcp_servers.designer]
command = "docker"
args = ["run", "--rm", "-i", "--network", "none",
        "ghcr.io/whit3rabbit/designer-mcp:latest",
        "node", "scripts/mcp-server.mjs"]
```

</details>

<details>
<summary><strong>GitHub Copilot</strong></summary>

Add to `~/.copilot/mcp-config.json`. Project scope is `<root>/.mcp.json`.

```json
{
  "mcpServers": {
    "designer": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "--network", "none",
        "ghcr.io/whit3rabbit/designer-mcp:latest",
        "node", "scripts/mcp-server.mjs"]
    }
  }
}
```

</details>

<details>
<summary><strong>ZCode</strong></summary>

Add to `~/.zcode/cli/config.json` under `mcp.servers`:

```json
{
  "mcp": {
    "servers": {
      "designer": {
        "type": "stdio",
        "command": "docker",
        "args": ["run", "--rm", "-i", "--network", "none",
          "ghcr.io/whit3rabbit/designer-mcp:latest",
          "node", "scripts/mcp-server.mjs"]
      }
    }
  }
}
```

Merge the entry into an existing `mcp.servers` object. Do not replace the
whole file, since it also holds skills and plugin state.

</details>

The other 20 harnesses (Cursor, Gemini CLI, Windsurf, OpenCode, Pi, Hermes,
and more) follow the same pattern through the skill.

## Docker

The image is published on GHCR (multi-arch, ~570 MB, catalog baked in).
Nothing to build or clone:

```bash
docker pull ghcr.io/whit3rabbit/designer-mcp:latest

docker run -d --name designer-mcp-gallery \
  -p 127.0.0.1:8787:8787 \
  ghcr.io/whit3rabbit/designer-mcp:latest
# gallery → http://127.0.0.1:8787
```

That one container serves 1,540 designs, 109 AI components, 1,264 ReUI
components, 2 dashboard starters, 73 HeroUI v3 component docs, and 159
presets, and makes **zero outbound calls** (verified with `--network none`).

Want a refreshed cache instead of the baked one? Fill a docker volume
once and mount it read-only into any registration above:

```bash
docker volume create designer-cache
docker run --rm -v designer-cache:/cache \
  ghcr.io/whit3rabbit/designer-mcp:latest \
  node scripts/refero-public-fetch.js --limit 0
# then add -v designer-cache:/cache:ro to the registration
```

### The two MCP servers

`design_*` (generic, recommended), source-neutral, works across both sources:

| Tool | What it does |
|---|---|
| `design_search` | Natural-language search over the whole catalog |
| `design_get` | Resolve an id, name, hostname, or URL to the full record |
| `design_list` | Browse with theme/source/industry filters |
| `design_facets` | Distributions: theme, source, industry, font |
| `design_markdown` | The DESIGN.md for one design |

`refero_*` (upstream), Refero-specific, includes `refero_similar` and
`refero_refresh`, which need network. Swap the command to
`node scripts/mcp-entry.mjs` to use it, and drop `--network none` from
that registration or the two networked tools fail by design.

---

<details>
<summary><strong>Sources</strong></summary>

| Source | Count | What it is |
|---|---|---|
| `refero` | 1,342 | Styles scraped from `styles.refero.design`'s public pages |
| `opendesign` | 198 | Design systems from [nexu-io/open-design](https://github.com/nexu-io/open-design) (Apache-2.0) and [feimacode/open-design-agent-kit](https://github.com/feimacode/open-design-agent-kit) (MIT) |
| `gradientdeck` | 109 components / 250 variants | AI components published as shadcn registry JSON: complete, typed TSX (MIT) |
| `gradientdeck` | 139 patterns + 20 glass effects | Background gradients, patterns and liquid-glass presets with real CSS (MIT) |
| `reui` | 1,264 components in 87 categories | KeenThemes [ReUI](https://github.com/keenthemes/reui): Radix UI and Base UI TSX for every example, with live offline previews (MIT) |
| `dashboards` | 2 starter templates | shadcn-admin (Vite + TanStack Router) and a Next.js 16 App Router starter, fonts bundled and CDN links stripped (MIT) |
| `heroui` | 73 components / 16 guides | HeroUI v3 docs baked from the pinned [@heroui/react](https://github.com/heroui-inc/heroui) npm tarballs and GitHub tag (Apache-2.0/MIT): component docs, per-component CSS, oklch theme variables, TSX source, v2-to-v3 migration guides |
| `mantine` | 123 components in 24 categories | [ui.mantine.dev](https://ui.mantine.dev/) ready-made components (MIT): full TSX + CSS module source, category illustrations, demo images, and live offline previews rendered from the vendored @mantine npm tarballs |
| `baseui` | 37 components / 42 guides | [Base UI](https://base-ui.com) (`@base-ui/react`, MIT): the first-party agent docs (llms.txt index and its markdown pages) for the headless components, handbook, utilities, and release notes; docs-only, cross-linked to the ReUI previews |
| `daisyui` | 68 components / 35 themes | daisyUI 5 (MIT): the official per-component agent docs, class tables and example HTML baked from the pinned npm tarball + GitHub tag; native offline previews rendered by the vendored compiled CSS with every theme |

The Refero and OpenDesign entries land in **one catalog** with a `source` tag
on every entry, so a single query searches both.

ReUI components and dashboard starters are separate layers. They carry their
own cache indexes, gallery tabs, and JSON APIs. The `design_*` MCP tools do
not cover them. HeroUI, Mantine and daisyUI are separate layers too, but all
three **are** MCP covered: the eight `design_heroui_*` tools read the same
baked cache the `/heroui` gallery routes serve, the three `design_mantine_*`
tools read the same baked cache the `/mantine` routes serve, and the three
`design_daisyui_*` tools read the same baked cache the `/daisyui` routes
serve.

OpenDesign is imported with a sparse clone of just the `design-systems/`
subtree: **38 MB**, not the 3.6 GB full repo (that figure is git history,
the working tree is 323 MB).

### The Agent Kit layer

`npm run agentkit` adds a third source,
[feimacode/open-design-agent-kit](https://github.com/feimacode/open-design-agent-kit)
(MIT), which re-packages OpenDesign's content for agents. It contributes:

- **46 design systems that do not exist upstream**: 30 iOS systems adapted
  from `Meliwat/awesome-ios-design-md` and 16 aesthetic concepts re-authored
  from `bergside/awesome-design-skills`.
- **A Claude Design package for all 198**: the same files Claude's own
  Design System format uses, so a system can be handed to Claude directly.
- **A rendered preview and cover for all 198**: the gallery shows each
  system two ways, as an Open Design preview and as a Claude Design view.
- **Curated mood/industry descriptors**: what the tokens cannot say, and
  what the gallery filters on.
- **Corrections for 57 upstream systems** whose prose disagreed with their
  tokens. The result is byte-identical to what the kit's own gallery renders.

The 152 upstream systems keep their upstream originals: the kit's copies are
stripped (no `design-tokens.json`, no `USAGE.md`), so only its *corrections*
are taken from it.

</details>

---

## Why it works this way

The upstream package reads `styles.refero.design/api/styles`, an undocumented
endpoint that is **`Disallow`ed by robots.txt** and answers **HTTP 403** to
every client. The upstream author deliberately stopped routing around it,
because Refero's Terms of Use forbid automated extraction outside documented
features.

So this project never requests `/api/`. It reads the **public** style pages,
which robots.txt permits for generic agents, and pulls the structured payload
out of the Next.js RSC flight stream. The result is written in the upstream
package's own cache format, so the package runs unmodified and offline.

Each public page also ships a **"Download DESIGN.md"** button, so the export is
a first-class product feature, not an extraction loophole.

### Cache layout

The upstream package's own format, plus the extra directories the generic
server and the offline thumbnails need:

```
cache/catalog.json       { updatedAt, styles[], designs[] }   <- merged, both sources
cache/styles/<uuid>.json { updatedAt, style }                 <- Refero detail
cache/systems/<slug>.json{ updatedAt, system }                <- OpenDesign package
cache/thumbs/<id>.webp   compressed screenshot bytes          <- offline gallery
cache/index.json         { updatedAt, total, counts }         <- per-source counts
cache/components.json    { updatedAt, total, components[] }   <- component index
cache/components/<slug>.json  variants + source code          <- one component
cache/presets.json       { updatedAt, total, catalogs[] }     <- preset index
cache/presets/<kind>.json      presets with CSS + templates   <- one catalog
cache/reui/...                 categories, TSX, screenshots   <- ReUI layer
cache/dashboards/<slug>/       source + offline zip + fonts   <- dashboard starters
cache/heroui/...               docs, styles, theme, source, migration <- HeroUI layer
cache/mantine/...              components, images, vendor, provenance  <- Mantine layer
cache/daisyui/...              catalog, components, css, docs, provenance <- daisyUI layer
```

`styles` and `designs` in `catalog.json` point at the same array: the
upstream package reads `styles`, the generic server reads `designs`. Every
entry carries a `source` tag (`refero` or `opendesign`).

Thumbnails are stored as **WebP at 1000px** (see
[Thumbnail compression](#thumbnail-compression)). The preview server accepts
`.jpg`, `.jpeg`, `.png` and `.webp`, preferring `.webp` when several exist,
so an uncompressed cache keeps working unchanged.

The cache dir is `DESIGN_CACHE_DIR` (default `~/.design-cache`).
`REFERO_CACHE_DIR` is still honoured so existing installs keep working.

---

## The cache

| Metric | Value |
|---|---|
| Styles | 1,342 (100% of Refero's style sitemap) |
| Size on disk | ~117MB |
| With empty fonts | 0 |
| With empty colors | 0 |
| Distinct font families | 1,953 |
| Distinct industries | 11 |
| Themes | 916 light / 293 dark / 133 mixed |

Completeness was verified by cross-checking all 52 collection pages against the
sitemap: **0 style ids appear in collections that are missing from the sitemap.**

---

## MCP tools

| Tool | Purpose | Works offline |
|---|---|---|
| `refero_search` | natural-language search over the catalog | yes |
| `refero_get` | full design system for one style | yes |
| `refero_design_md` | render a style as DESIGN.md | yes |
| `refero_list` | browse the catalog | yes |
| `refero_facets` | fonts/colors/themes actually present | yes |
| `refero_similar` | Refero's similar-style ranking | no, needs `/api/` |
| `refero_refresh` | force a re-fetch | no, needs `/api/` |

The generic `design_*` server (`scripts/mcp-server.mjs`) is the recommended
one: it covers every source and works fully offline:

| Tool | What it does |
|---|---|
| `design_search` | natural-language search across all sources |
| `design_get` | full record for one design |
| `design_list` | browse with filters |
| `design_facets` | what's actually in the catalog |
| `design_markdown` | the DESIGN.md brief for one design |
| `design_component_search` | search the AI component library |
| `design_component_get` | one component: variants, FAQ, dependencies |
| `design_component_code` | the source code for one variant |
| `design_preset_search` | search gradients, patterns and glass effects |
| `design_preset_get` | one preset catalog with real CSS |

Plus `design_template_*` (7 vendored design-system templates), `design_library_*` (install manifests), `design_asset_*` (local asset CDN & import map), `design_markdown_*` (DESIGN.md parse/render/validate), `design_docs_*` (offline `@ui-sdk/*` docs), `design_heroui_*` (the offline HeroUI v3 layer: catalog, docs, guides, TSX source, per-component CSS, oklch theme variables, migration guides), `design_mantine_*` (the offline ui.mantine.dev catalog: components with full TSX + CSS module source and vendored package versions), and `design_daisyui_*` (the offline daisyUI 5 catalog: class tables, syntax templates and offline-safe example HTML over the vendored compiled CSS with all 35 themes), and `design_baseui_*` (the offline Base UI docs: headless component docs and the handbook, utilities, and overview guides) — 44 tools in total.

Replies are sized for a model's context. Search and list rows are summaries
(`detail: "full"` restores every swatch), `design_get` leaves out the raw
token dump unless asked, long documents come a page at a time with
`nextOffset`, and the server refuses any reply over 120 KB with a hint
instead of truncating. The full parameter reference is
[mcp-tools.md](plugins/designer-mcp/skills/designer-mcp/references/mcp-tools.md).

---

## Gallery

```
GET /                            design systems gallery
GET /design/:id                  detail page: screenshot, color tokens, type scale
GET /api/designs?limit=          every design in the catalog
GET /api/facets                  theme/industry/font distributions
GET /api/search?q=               ranked search
GET /thumb/:id                   local thumbnail bytes
GET /healthz                     readiness probe

GET /components                  component library: 109 components, 250 variants
GET /component/:slug             one component with live previews and copyable source
GET /tailwind                    HyperUI components grouped by use
GET /tailwind/shadcn              shadcn/ui Radix Vega examples and source
GET /api/components?q=&category= component search
GET /api/component/:slug         one component as JSON

GET /presets                     preset catalogs: gradients, patterns, glass
GET /presets/:kind               one catalog in full
GET /api/presets                 preset catalog index
GET /api/presets/:kind           one catalog as JSON

GET /reui                        ReUI gallery: 1,264 components in 87 categories
GET /reui/:category              one category with live offline previews
GET /reui/preview/:cat/:item     one live component preview
GET /api/reui                    ReUI index as JSON

GET /dashboards                  dashboard starters with offline downloads
GET /dashboard/:slug             one dashboard: file tree, cover, and zips
GET /api/dashboards              dashboard index as JSON

GET /heroui                      HeroUI v3 docs browser: 73 components, 16 guides
GET /heroui/component/:slug      one rendered component doc
GET /heroui/guide/:slug          one rendered guide
GET /api/heroui                  HeroUI catalog as JSON (docs, styles, theme, source, migration under /api/heroui/*)

GET /mantine                     Mantine UI catalog: 123 components in 24 categories
GET /mantine/category/:slug      one category with thumbnails
GET /mantine/component/:slug     one component: live preview + per-file source
GET /mantine/preview/:slug       one live component preview document
GET /api/mantine                 Mantine catalog as JSON (?q= searches; /api/mantine/component/:slug for one)

GET /daisyui                     daisyUI catalog: 68 components, thumbnails and search
GET /daisyui/component/:slug     one component: live preview, classes, copyable example
GET /daisyui/preview/:slug       one native preview document (?theme= picks any of the 35 themes)
GET /api/daisyui                 daisyUI catalog as JSON (?q= searches; /api/daisyui/component/:slug for one)

GET /templates                   seven design-system templates with landing and deck previews
GET /assets                      browser libraries, styles, fonts, and starter downloads
GET /assets/manifest.json        versions, license notices, and SHA-256 checksums
GET /assets/starter.zip           portable starter with a runnable example
```

The gallery's DESIGN.md is **byte-identical** to what `refero_design_md`
returns. Both call the upstream package's own `renderDesignMd`.

Open **Assets** in the gallery to download individual files or the complete
starter. Extract the ZIP and serve the directory with a local HTTP server,
for example `python3 -m http.server 8080`. Open `http://127.0.0.1:8080`
to run the React, Motion, Tailwind, and shadcn example.

The Docker image ships the compiled previews and asset pack. If a mounted
catalog has a newer component variant, its source remains available and its
preview appears after a rebuild with that catalog.

The component grids use baked thumbnails. HyperUI previews use a pinned
snapshot with local fonts, Chart.js, and sample photos. Each example page
also offers the original upstream HTML as text.

For local development, use the baked catalog with the frontend build.

```bash
npm ci --prefix frontend --ignore-scripts
npm ci --prefix frontend/deck --ignore-scripts
./frontend/node_modules/.bin/playwright install chromium
npm run frontend:fetch-tailwind
npm run frontend:build
DESIGN_CACHE_DIR="$PWD/bake" npm run preview
```

`npm run frontend:refresh` updates the frontend pins, lockfile, and shadcn
registry snapshot. Review those changes, reinstall the frontend dependencies,
and run `npm run frontend:build` to regenerate the pack.

---

## Static site: GitHub Pages and GitLab Pages

The entire gallery builds into a 100% self-contained static site with relative
URLs and zero external network requests. One build carries:

- all 1,540 designs: screenshots, Open Design previews, and Claude Design views
- 109 AI components with 250 live demos
- 1,264 ReUI components with live offline previews
- the Dashboards tab: 2 starters with offline zips and bundled fonts
- the HeroUI docs browser: 73 components, 16 guides, theme variables
- the HyperUI & shadcn/ui Tailwind catalogs with client-side variant switching
- presets, 7 templates, assets, the skill archive, and the JSON APIs

```bash
# Build into dist/static/ (or pass --out public for Pages)
npm run build:static
node scripts/build-static.mjs --out public

# Preview the static build locally
npm run preview:static
```

The build reads `bake/` by default (`DESIGN_CACHE_DIR` overrides), so run
`npm run bake` once from a working cache, or pass `--cache` to point at any
populated cache directory.

Or export/serve it directly from the Docker image offline:

```bash
# Export static site to ./public
docker run --rm --network none -v "$PWD/public:/out" designer-mcp:latest \
  node scripts/build-static.mjs --out /out

# Serve the static build from Docker
docker run --rm -p 127.0.0.1:8787:8787 \
  -v "$PWD/dist/static:/static:ro" -e DESIGN_STATIC_DIR=/static \
  designer-mcp:latest node scripts/static-serve.mjs
```

A ready-to-use `.gitlab-ci.yml` is included: it builds `public/` with the
published image and publishes to GitLab Pages with no other setup.

### GitHub Pages

`.github/workflows/pages.yml` does it already: every push to `main` builds
`public/` with the published image and deploys it with the official Pages
actions. Enable it once in the repo settings (Pages, Source: GitHub Actions)
and the site serves at `https://<user>.github.io/<repo>/`.

The Pages site is a preview of the Docker gallery, nothing more. MCP is not
hosted there: both MCP servers are stdio processes that run from the Docker
image on a local machine. An agent can still read the site's `api/*.json`
remotely with `DESIGN_REMOTE_URL` (see below).

All links and assets use relative paths, so the site works both at `/` and at
project subpaths. Both `https://<user>.gitlab.io/<repo>/` and
`https://<user>.github.io/<repo>/` work with no base-path configuration.

### Pointing MCP at a hosted static site

When `DESIGN_REMOTE_URL` (or `--url <url>`) is set, `scripts/mcp-server.mjs`
reads the catalog, designs, packages, components, presets, and templates from
that hosted static site's `api/*.json` files instead of requiring a local
`/cache` directory:

```bash
DESIGN_REMOTE_URL=https://<user>.gitlab.io/<repo> node scripts/mcp-server.mjs
# or via CLI flag:
node scripts/mcp-server.mjs --url https://<user>.gitlab.io/<repo>
```

When `DESIGN_REMOTE_URL` is unset (the default), `mcp-server.mjs` reads
strictly from local disk and makes zero outbound network requests.

Remote mode degrades to the local cache. If the host does not answer, the
server reads the same data from disk and adds a `remoteNote` to the reply
saying so; after a failure it skips the host for 30 seconds, so a dead host
costs one timeout rather than one per file. A 404 from the host is taken as
its answer. A URL that is not `http` or `https` is ignored, with a note in
every reply and on stderr. Tool arguments cannot steer a request outside the
host's `api/` tree.

---

## Two surfaces, one image

The `designer-mcp` image runs both surfaces over the same cache:

| Surface | How to run | What it is |
|---|---|---|
| **Gallery** | `docker compose up -d gallery` | HTTP preview on `127.0.0.1:8787`: thumbnails, colour swatches, type scales, DESIGN.md |
| **MCP** | `docker compose run --rm design` | stdio JSON-RPC server, 44 `design_*` tools over both sources |
| **MCP (upstream)** | `docker compose run --rm mcp` | stdio JSON-RPC server, 7 `refero_*` tools, Refero-only |
| **Fetch** | `docker compose run --rm fetch` | populates the cache from Refero's public pages |
| **OpenDesign** | `docker compose run --rm opendesign` | imports the OpenDesign design-system packages |
| **Agent Kit** | `docker compose run --rm agentkit` | adds the 46 new systems, the Claude Design packages, the rendered previews and the descriptors |
| **Thumbs** | `docker compose run --rm thumbs` | caches every screenshot locally, compressed (~55 MB) |
| **Compress** | `docker compose run --rm compress` | re-encodes an existing thumbnail cache to WebP |

The MCP and fetch services sit behind compose profiles because `up` cannot
supervise them: one speaks JSON-RPC over stdin/stdout, the others are
one-shot jobs.

A full offline cache is four commands:

```bash
docker compose run --rm fetch        # 1,342 Refero styles   (~2.5 min)
docker compose run --rm opendesign   # 152 upstream OpenDesign systems (~30 s)
docker compose run --rm agentkit     #  46 more + the Claude layer
docker compose run --rm thumbs       # 1,342 screenshots     (~55 MB)
```

The ReUI, dashboard, HeroUI, Mantine, daisyUI, and Base UI layers are not
compose services. Stage them with npm:

```bash
npm run reui          # 1,264 components in 87 categories (Radix + Base UI TSX)
npm run dashboards    # 2 starters with offline zips and bundled fonts
npm run heroui        # 73 HeroUI v3 component docs, styles, theme, source
npm run mantine       # 123 ui.mantine.dev components + vendored @mantine packages
npm run daisyui       # 68 daisyUI 5 components + the compiled css with all 35 themes
npm run baseui        # 37 Base UI component docs + 42 guides
```

All six are baked into the published image.

Each accepts trailing arguments, which append to the script's defaults:

```bash
docker compose run --rm fetch --limit 20              # just 20 styles
docker compose run --rm opendesign --slug linear-app  # one design system
docker compose run --rm thumbs --limit 50 --force     # re-fetch 50
docker compose run --rm compress --replace            # drop the originals
```

### Thumbnail compression

The Refero screenshots are 1440×900 JPEGs, ~115 KB each: 150.6 MB for the
full catalog, more than the JSON catalog itself.

The gallery never renders them at that size: a grid card is 349 CSS px wide
and the detail page 716 CSS px. So the fetcher re-encodes to **WebP at
1000px** before the bytes touch the disk:

| | size | per image |
|---|---|---|
| Original JPEG | 150.6 MB | ~115 KB |
| Compressed WebP | **55.9 MB** | ~43 KB |

That is 37% of the original. Measured against a Lanczos reference the
result is a mean **PSNR of 42.5 dB and SSIM of 0.990**, visually
indistinguishable at both display sizes. A gallery page load drops from
25.3 MB to 9.3 MB.

To re-encode a cache that was fetched before the compressor existed:

```bash
docker compose run --rm compress            # write .webp beside the .jpg
docker compose run --rm compress --replace  # and delete the originals
docker compose run --rm compress --width 720 --quality 80
```

`--full` additionally writes a 1440px `@full` tier for retina detail pages.

### Point at a cache elsewhere

The default mount is `./cache`. To use a cache populated elsewhere:

```bash
REFERO_CACHE_DIR="$HOME/.design-cache" docker compose up -d gallery
```

### Verify both surfaces

```bash
curl -s http://127.0.0.1:8787/healthz
# {"ok":true,"styles":1342,"updatedAt":1794274864435}

npm test        # end-to-end checks across all cached layers and servers
```

### Routes

| Route | Returns |
|---|---|
| `/` | design systems gallery (1,540 cards) |
| `/design/:id` | detail page: cover, colour tokens, type scale, do/don't |
| `/preview/:id/open-design` | the rendered Open Design preview for one system |
| `/preview/:id/claude` | the same system in Claude's Design System format |
| `/preview/:id/claude/file/*` | a Claude Design package file |
| `/api/designs/:id/file/*` | an Open Design package file |
| `/thumb/:id` | local thumbnail bytes |
| `/api/designs` | catalog rows (paginated) |
| `/api/facets` | font/theme distributions |
| `/design.md/:id` | rendered DESIGN.md |
| `/components` | component library (109 components, 250 variants) |
| `/component/:slug` | one component: variants, source, FAQ |
| `/presets` | preset catalogs |
| `/presets/:kind` | one catalog with real CSS |
| `/templates` | the seven vendored design-system templates |
| `/template/:slug` | one template: tokens, theme knobs, starters, and manifest |
| `/reui` | ReUI gallery: 1,264 components in 87 categories |
| `/reui/:category` | one category with live offline previews |
| `/dashboards` | dashboard starters with offline downloads |
| `/dashboard/:slug` | one dashboard: file tree, cover, and zips |
| `/mantine` | Mantine UI catalog: 123 components in 24 categories, live offline previews |
| `/daisyui` | daisyUI catalog: 68 components, live offline previews with all 35 themes |
| `/skill` | the skill zip (`designer-mcp-skill.zip`) |
| `/skill/SKILL.md` | the skill source |
| `/healthz` | status + style count |

---

## Published image

```bash
docker pull ghcr.io/whit3rabbit/designer-mcp:latest
```

Public on GitHub Container Registry, multi-arch (`linux/amd64`, `linux/arm64`),
~570MB, most of it the baked catalog.

`:latest` tracks the newest release, and the publish workflow pushes it
alongside every version tag. Pin to a specific tag (`v1.0.4`) when you want
a reproducible deployment.

**The image ships the catalog**, so the gallery works with no setup at all:

```bash
docker run -d --name designer-mcp-gallery \
  -p 127.0.0.1:8787:8787 \
  ghcr.io/whit3rabbit/designer-mcp:latest
```

That container has 1,540 designs, 109 AI components, 1,264 ReUI components,
2 dashboard starters, and 159 presets baked in, and makes **no outbound
calls**, verified with `--network none`.

**The image also ships the fetchers**, so you can refresh against a volume:

```bash
# 1. populate a cache (reads only public pages, /api/ is never requested)
docker volume create refero-cache
docker run --rm -v refero-cache:/cache \
  ghcr.io/whit3rabbit/designer-mcp:latest \
  node scripts/refero-public-fetch.js --limit 0

# 2. run the gallery against that cache instead of the baked one
docker run -d --name designer-mcp-gallery \
  -p 127.0.0.1:8787:8787 \
  -v refero-cache:/cache:ro \
  ghcr.io/whit3rabbit/designer-mcp:latest
```

### From a clone

`docker-compose.yml` points at the published image, so a fresh clone runs
without building:

```bash
git clone https://github.com/whit3rabbit/designer-mcp-docker.git
cd designer-mcp-docker
docker compose pull
docker compose run --rm fetch          # populate ./cache
docker compose up -d gallery
```

Override the host port to run a second instance alongside the first:

```bash
GALLERY_PORT=8788 docker compose up -d gallery
```

`docker compose build` still rebuilds from the Dockerfile in the repo.

### Registering with an agent

See [Install](#install) at the top of this README. Step 3 has the skill
write the config for you, and the manual blocks cover Claude Code, Codex,
GitHub Copilot, and ZCode.

The published image needs no build step and no cache mount. Swap
`node scripts/mcp-server.mjs` for `node scripts/mcp-entry.mjs` to get the
upstream `refero_*` tools instead (7 tools, styles only).

### Updating and publishing

```bash
npm run update              # refresh the cache + rebuild the image
npm run update:dry          # print the plan without executing
npm run publish             # + push to GHCR
npm run publish -- --tag v1.2.0
```

`scripts/update.mjs` is the entry point. It refreshes the cache, rebuilds the
image, and optionally publishes:

| Flag | Effect |
|---|---|
| `--fetch-only` | refresh the style cache, skip the build |
| `--build-only` | rebuild the image, skip the fetch |
| `--publish` | push to the registry after building |
| `--tag <version>` | tag the image (implies `--publish`) and record it in `CHANGELOG.md` |
| `--registry <host>` `--owner <name>` `--name <image>` | override the image coordinates |
| `--cache <dir>` | cache location (default `~/.refero-cache`) |
| `--dry-run` | print the commands without running them |
| `--yes` | skip the confirmation prompt |

A local build targets the host architecture, because `--load` cannot hold a
multi-platform manifest. A publishing build goes multi-arch straight to the
registry.

**Publishing runs through GitHub Actions**, not locally: pushing to GHCR needs
the `write:packages` scope, and the local `gh` token does not carry it. The
workflow's own token has it by default, so a tag push publishes with no stored
secret:

```bash
git tag v1.2.0 && git push origin v1.2.0    # publishes v1.2.0 + latest
```

To publish from your own machine instead, refresh the token scope once:

```bash
gh auth refresh -h github.com -s write:packages
docker login ghcr.io -u <owner> --password-stdin < <(gh auth token)
```

---

## The plugin

`plugins/designer-mcp/` is a marketplace plugin with four skills. Two carry
the core surface: `design-system` is the research-first design methodology
with 11 craft reference files (typography, color, motion, icons, craft
details, copywriting, anti-AI-slop, visual workflow, example workflow) and
bundles the `design-template-authoring` sub-skill, and `designer-mcp` owns
the offline catalog: MCP setup, tool routing, and MCP install snippets for
24 harnesses. `designer-documents` bundles the document toolchains (docx,
pptx, xlsx, pdf, pdf-reading), and `designer-ui` bundles the craft and SDK
layers (frontend-design, ui-sdk). The repo root carries the marketplace
manifests: `.claude-plugin/marketplace.json` (Claude Code and ZCode),
`.agents/plugins/marketplace.json` (Codex), and `.cursor-plugin/marketplace.json`
(Cursor).

The methodology is adapted from Refero's MIT-licensed
[`refero_skill`](https://github.com/referodesign/refero_skill), with two
changes that matter for this deployment:

- **Tool names.** This server exposes `refero_search` / `refero_get`, not the
  official `refero_search_styles` / `refero_get_style`.
- **Honest scope.** There is **no screens or flows layer** here: those need
  the paid API. The skills route those questions to the craft references
  instead of inventing precedent, and document which tools fail and why.

The skills ship **inside the Docker image**, are served for download at
`/skill` from a running gallery, and are published with the static site:

```bash
# from the published Pages site (no Docker needed)
curl -LO https://whit3rabbit.github.io/designer-mcp-docker/skill/designer-mcp-skill.zip

# or from a running local gallery
curl -O http://127.0.0.1:8787/skill     # designer-mcp-skill.zip
```

Build the distributable zip from a checkout:

```bash
node scripts/package-skill.mjs      # → dist/designer-mcp-skill.zip
```

The zip carries `skills/<four skill directories, with the bundled
sub-skills inside>`, the plugin-root `evals/` routing suite, and the
dependency manifests at the zip root. Because of that `skills/` prefix,
extract it aside and copy the four skill folders into the skills directory
your agent reads (unzipping straight into it lands them one level too deep):

```bash
DEST=~/.claude/skills    # see the table below for other agents
TMP=$(mktemp -d) && unzip -q designer-mcp-skill.zip -d "$TMP" && mkdir -p "$DEST" && cp -R "$TMP/skills/." "$DEST/"
```

#### Offline Claude Code plugin install

The image also serves the whole plugin (skills, harness manifests,
`.mcp.json`) as a local marketplace. No GitHub access is needed:

```bash
curl -o designer-mcp-marketplace.zip http://127.0.0.1:8787/skill/marketplace.zip
```

```bash
unzip -oq designer-mcp-marketplace.zip -d ~/designer-mcp-marketplace
```

```bash
claude plugin marketplace add ~/designer-mcp-marketplace
```

```bash
claude plugin install designer-mcp@designer-mcp-docker
```

The plugin's `.mcp.json` runs `ghcr.io/whit3rabbit/designer-mcp:<version>`
with `--network none`, pinned to the plugin version. Docker cannot pull on
an air-gapped host, so that exact tag must already be loaded there
(`docker save` on a connected machine, `docker load` on the target).

| Agent | User-level skills directory |
|---|---|
| Claude Code | `~/.claude/skills/` |
| Codex | `~/.agents/skills/` |
| OpenCode | register the extracted folder under `"skills"` in `opencode.json` |
| Pi | `~/.pi/skills/` or `~/.agents/skills/` |
| Hermes | `~/.hermes/skills/` |
| ZCode | `~/.zcode/skills/` |

A checkout can install itself with the same CLI, which offers the four
skills:

```bash
npx -y skills add .
```

### Skill quality

The bundle is audited with
[`rabbit-skills-audit`](https://github.com/whit3rabbit/rabbit-skills). The
latest audit (2026-11-20) ends **PASS WITH WARNINGS**: 0 errors and two
accepted vendor constraints in the vendored ui-sdk docs. The cross-model
eval evidence it tracked is recorded in the two skills' `evals/evals.json`
files.

The one error the audit found (a SKILL.md over the 500-line limit) was
fixed by moving detail into the catalog and tool references, and the
one broken link it surfaced in the vendored ui-sdk docs is fixed too.

Remaining, all deliberate:

- **ST-04 (vendor)**: 138 files in the vendored `ui-sdk/docs/` bundle exceed
  100 lines without a per-file table of contents. The `llms.txt` indexes
  and `design_docs_search` mitigate, and generating TOCs would rewrite 138
  vendor files for marginal gain.
- **MD-07**: `name` is not gerund form. The linter's own guidance says noun
  phrases are acceptable, and `designer-mcp` matches the container image and
  MCP server names.

The plugin and marketplace also pass
[`rabbit-plugin-audit`](https://github.com/whit3rabbit/rabbit-skills)
(2026-11-22, PASS with zero findings, clean under `--strict`). Skill
descriptions are tightened to about 148 always-on tokens for the whole
plugin. The fuller routing detail lives in the skill bodies and the
skill-directory reference where it costs nothing at trigger time. Evals run
in two layers: plugin-root `evals/` holds four cross-skill routing cases
with prompt and grader rubrics, and each core skill keeps its
guide-structured `evals/evals.json` suite. The 2026-11-22 skills re-audit
ends 0 errors on all 12 skills.

Audit the marketplace from the repo root,
not the `marketplace.json` path, so plugin sources resolve correctly.

Re-run the audit with:

```bash
python3 <path-to>/rabbit-skills-audit/scripts/audit_static.py \
  plugins/designer-mcp/skills/design-system --format text
python3 <path-to>/rabbit-skills-audit/scripts/audit_static.py \
  plugins/designer-mcp/skills/designer-mcp --format text
```

---

## Layout

```
designer-mcp-docker/
├── Dockerfile              # one image, two entrypoints
├── docker-compose.yml      # gallery service, cache mounted read-only
├── package.json
├── scripts/
│   ├── refero-public-fetch.js  # cache builder (public pages only)
│   ├── preview.mjs             # gallery + HTTP API
│   ├── mcp-server.mjs          # generic stdio MCP server (design_*)
│   ├── mcp-entry.mjs           # stdio MCP entrypoint (upstream refero_*)
│   ├── fetch-reui.mjs          # cache the ReUI component library
│   ├── fetch-mantine.mjs       # cache the Mantine UI catalog + vendored packages
│   ├── fetch-daisyui.mjs       # cache the daisyUI layer: compiled css + agent docs
│   ├── fetch-dashboards.mjs    # cache dashboard starters, offline assets
│   ├── build-static.mjs        # build the self-contained static site
│   ├── static-serve.mjs        # serve a static build over HTTP
│   ├── package-skill.mjs       # build the skill zip
│   └── selftest.mjs            # end-to-end checks across all surfaces
├── .claude-plugin/marketplace.json   # Claude Code & ZCode marketplace
├── .agents/plugins/marketplace.json  # Codex marketplace (+ Antigravity workspace plugin)
├── .cursor-plugin/marketplace.json   # Cursor marketplace
├── plugins/designer-mcp/       # the marketplace plugin
│   ├── .zcode-plugin/plugin.json
│   ├── .claude-plugin/plugin.json
│   ├── .codex-plugin/plugin.json
│   ├── .cursor-plugin/plugin.json
│   ├── .mcp.json               # auto-registered Docker MCP server
│   ├── requirements.txt, package.json
│   └── skills/                 # four skills
│       ├── design-system/      # methodology, capture workflow, craft refs
│       ├── designer-mcp/       # catalog tools, MCP setup, install snippets
│       ├── designer-documents/ # bundles docx/ pptx/ xlsx/ pdf/ pdf-reading/
│       └── designer-ui/        # bundles frontend-design/ ui-sdk/
├── docs/
│   ├── DATA-SOURCE.md      # what's permitted and why
│   └── ARCHITECTURE.md     # how the pieces fit
├── dist/                   # built skill zip
└── cache/                  # populated, gitignored
```

---

## Refreshing

```bash
npm run fetch          # all styles
npm run fetch:quick    # 60 styles, for a fast top-up
node scripts/refero-public-fetch.js --limit 0 --force   # re-fetch everything
node scripts/refero-public-fetch.js --search "railway"   # resolve by name first
```

Already-cached styles are skipped, so re-runs are incremental.

---

## Notes

- **`OPENAI_API_KEY` changes search quality.** Without it the package falls back
  to a BM25-lite keyword scorer, usable but clearly worse on vibe queries.
- **The cache TTL is deliberately huge** (`REFERO_CACHE_TTL_MS=315360000000`,
  ten years). With a short TTL the package treats the cache as expired and
  tries the live API on a read, which fails offline. Refresh by re-running
  the fetcher instead.
- **`colorScheme` can be `"mixed"`**: upstream's type only declares light and
  dark, so theme filters silently drop 133 styles.

See [docs/DATA-SOURCE.md](docs/DATA-SOURCE.md) for the robots.txt / Terms of Use
analysis and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the internals.

## License

MIT for this project. The vendored upstream package keeps its own license.
Refero's design data belongs to Refero and the sites depicted. This project
reads publicly available pages and caches them locally. It does not
redistribute them.
