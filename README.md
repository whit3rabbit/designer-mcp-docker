# designer-mcp-docker

**1,494 real product design systems, queryable by an agent and browsable by a human.**

Three surfaces over one cache:

- **MCP server** (stdio) — 7 upstream `refero_*` tools for agents
- **Generic MCP server** (stdio) — 5 source-neutral `design_*` tools across both sources
- **Live gallery** (HTTP) — thumbnail grid, detail pages, live color swatches

The upstream package [`fidgetcoding-refero-mcp`](https://github.com/fidgetcoding/refero-design-mcp)
is vendored **unmodified** and runs against a prebuilt cache, so upstream
updates drop in cleanly.

**Runs fully offline.** Every thumbnail is cached on disk, so the gallery
makes zero outbound requests. Verified against a container with
`--network none`.

---

## Sources

| Source | Count | What it is |
|---|---|---|
| `refero` | 1,342 | Styles scraped from `styles.refero.design`'s public pages |
| `opendesign` | 152 | Design systems from [nexu-io/open-design](https://github.com/nexu-io/open-design) (Apache-2.0) |

Both land in **one catalog** with a `source` tag on every entry, so a single
query searches both.

OpenDesign is imported with a sparse clone of just the `design-systems/`
subtree — **38 MB**, not the 3.6 GB full repo (that figure is git history;
the working tree is 323 MB).

---

## Quick start

```bash
cd ~/Documents/Github/designer-mcp-docker

npm install          # upstream package
npm run fetch        # populate ./cache from public pages (~2.5 min, 1,342 styles)
npm run opendesign   # import the 152 OpenDesign design systems (~30s, 38 MB)
npm run thumbs       # cache every screenshot locally (~150 MB)
npm test             # self-test everything

docker compose up -d # gallery → http://127.0.0.1:8787
```

Register the MCP server with your agent:

```bash
hermes mcp add designer \
  --command docker \
  --args run --rm -i -v "$HOME/.design-cache:/cache:ro" \
         ghcr.io/whit3rabbit/designer-mcp:latest \
         node scripts/mcp-server.mjs
```

The command prompts to enable tools — answer `y`. If stdin is not a TTY it
cancels, so pipe it: `printf 'y\n' | hermes mcp add designer ...`.

Restart the gateway (or `/reload-mcp`) so the tools register.

### The two MCP servers

`design_*` (generic, recommended) — source-neutral, works across both sources:

| Tool | What it does |
|---|---|
| `design_search` | Natural-language search over the whole catalog |
| `design_get` | Resolve an id, name, hostname, or URL to the full record |
| `design_list` | Browse with theme/source/industry filters |
| `design_facets` | Distributions: theme, source, industry, font |
| `design_markdown` | The DESIGN.md for one design |

`refero_*` (upstream) — Refero-specific, includes `refero_similar` and
`refero_refresh`, which need network. Swap the command to
`node scripts/mcp-entry.mjs` to use it.

---

## Why it works this way

The upstream package reads `styles.refero.design/api/styles` — an undocumented
endpoint that is **`Disallow`ed by robots.txt** and answers **HTTP 403** to
every client. The upstream author deliberately stopped routing around it,
because Refero's Terms of Use forbid automated extraction outside documented
features.

So this project never requests `/api/`. It reads the **public** style pages,
which robots.txt permits for generic agents, and pulls the structured payload
out of the Next.js RSC flight stream. The result is written in the upstream
package's own cache format, so the package runs unmodified and offline.

Each public page also ships a **"Download DESIGN.md"** button — the export is
a first-class product feature, not an extraction loophole.

### Cache layout

The upstream package's own format, plus the extra directories the generic
server and the offline thumbnails need:

```
cache/catalog.json       { updatedAt, styles[], designs[] }   <- merged, both sources
cache/styles/<uuid>.json { updatedAt, style }                 <- Refero detail
cache/systems/<slug>.json{ updatedAt, system }                <- OpenDesign package
cache/thumbs/<id>.jpg    cached screenshot bytes               <- offline gallery
cache/index.json         { updatedAt, total, counts }         <- per-source counts
```

`styles` and `designs` in `catalog.json` point at the same array — the
upstream package reads `styles`, the generic server reads `designs`. Every
entry carries a `source` tag (`refero` or `opendesign`).

The cache dir is `DESIGN_CACHE_DIR` (default `~/.design-cache`);
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
| `refero_similar` | Refero's similar-style ranking | no — needs `/api/` |
| `refero_refresh` | force a re-fetch | no — needs `/api/` |

---

## Gallery

```
GET /                            gallery UI
GET /style/:id                   detail page — live screenshot, color tokens, type scale
GET /api/styles?q=&theme=&industry=&limit=&offset=
GET /api/styles/:id              full style JSON
GET /api/styles/:id/design.md    rendered DESIGN.md
GET /api/facets                  theme/industry/font distributions
GET /api/search?q=               ranked search
GET /thumb/:id                   302 → upstream screenshot on the CDN
GET /healthz                     readiness probe
```

The gallery's DESIGN.md is **byte-identical** to what `refero_design_md`
returns — both call the upstream package's own `renderDesignMd`.

Thumbnails are served as a redirect to `images.refero.design`, whose
robots.txt permits generic agents (only `GPTBot` is disallowed).

---

## Two surfaces, one image

The `designer-mcp` image runs both surfaces over the same cache:

| Surface | How to run | What it is |
|---|---|---|
| **Gallery** | `docker compose up -d gallery` | HTTP preview on `127.0.0.1:8787` — thumbnails, colour swatches, type scales, DESIGN.md |
| **MCP** | `docker compose run --rm design` | stdio JSON-RPC server, 5 `design_*` tools over both sources |
| **MCP (upstream)** | `docker compose run --rm mcp` | stdio JSON-RPC server, 7 `refero_*` tools, Refero-only |
| **Fetch** | `docker compose run --rm fetch` | populates the cache from Refero's public pages |
| **OpenDesign** | `docker compose run --rm opendesign` | imports the 152 design-system packages |
| **Thumbs** | `docker compose run --rm thumbs` | caches every screenshot locally (~150 MB) |

The MCP and fetch services sit behind compose profiles because `up` cannot
supervise them: one speaks JSON-RPC over stdin/stdout, the others are
one-shot jobs.

A full offline cache is three commands:

```bash
docker compose run --rm fetch        # 1,342 Refero styles   (~2.5 min)
docker compose run --rm opendesign   # 152 OpenDesign systems (~30 s)
docker compose run --rm thumbs       # 1,342 screenshots     (~150 MB)
```

Each accepts trailing arguments, which append to the script's defaults:

```bash
docker compose run --rm fetch --limit 20              # just 20 styles
docker compose run --rm opendesign --slug linear-app  # one design system
docker compose run --rm thumbs --limit 50 --force     # re-fetch 50
```

### Point at a cache elsewhere

The default mount is `./cache`. To use a cache populated elsewhere:

```bash
REFERO_CACHE_DIR=/Users/whit3rabbit/.refero-cache docker compose up -d gallery
```

### Verify both surfaces

```bash
curl -s http://127.0.0.1:8787/healthz
# {"ok":true,"styles":1342,"updatedAt":1794274864435}

npm test        # 17 checks across cache, renderer, preview, and MCP
```

### Routes

| Route | Returns |
|---|---|
| `/` | gallery grid (1,342 cards) |
| `/style/:id` | detail page — screenshot, colour tokens, type scale, do/don't |
| `/thumb/:id` | 302 to the screenshot on Refero's CDN |
| `/api/styles` | catalog rows (paginated) |
| `/api/facets` | font/theme distributions |
| `/design.md/:id` | rendered DESIGN.md |
| `/skill` | the skill zip (`designer-mcp-skill.zip`) |
| `/skill/SKILL.md` | the skill source |
| `/healthz` | status + style count |

---

## Published image

```bash
docker pull ghcr.io/whit3rabbit/designer-mcp:latest
```

Public on GitHub Container Registry, multi-arch (`linux/amd64`, `linux/arm64`),
~285MB.

`:latest` tracks the newest release — the publish workflow pushes it
alongside every version tag. Pin to a specific tag (`v1.0.4`) when you want
a reproducible deployment.

**The image ships the fetcher**, so a fresh machine needs no repo checkout —
just Docker and a volume:

```bash
# 1. populate the cache (reads only public pages; /api/ is never requested)
docker volume create refero-cache
docker run --rm -v refero-cache:/cache \
  ghcr.io/whit3rabbit/designer-mcp:latest \
  node scripts/refero-public-fetch.js --limit 0

# 2. run the gallery
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

### Registering with an agent (Hermes)

```bash
hermes mcp add designer --command docker --args \
  run --rm -i \
  -v ~/.refero-cache:/cache:ro \
  ghcr.io/whit3rabbit/designer-mcp:latest \
  node scripts/mcp-entry.mjs
```

The command prompts to enable tools; answer `y` (or pipe `y` if stdin is not
a TTY, or it cancels).

Point it at the published tag rather than a locally built image — the
registry tag works on any machine without a build step.

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

## The skill

`skills/designer-mcp/` is a research-first design skill: methodology, MCP
instructions, and 11 craft reference files (typography, color, motion, icons,
craft details, copywriting, anti-AI-slop, visual workflow, example workflow).

It is adapted from Refero's MIT-licensed
[`refero_skill`](https://github.com/referodesign/refero_skill), with two
changes that matter for this deployment:

- **Tool names.** This server exposes `refero_search` / `refero_get`, not the
  official `refero_search_styles` / `refero_get_style`.
- **Honest scope.** There is **no screens or flows layer** here — those need
  the paid API. The skill routes those questions to the craft references
  instead of inventing precedent, and documents which tools fail and why.

The skill ships **inside the Docker image** and is served for download at
`/skill` from the running gallery.

```bash
curl -O http://127.0.0.1:8787/skill     # designer-mcp-skill.zip
```

Build the distributable zip from a checkout:

```bash
node scripts/package-skill.mjs      # → dist/designer-mcp-skill.zip
```

Install it:

```bash
# Hermes
cp -r skills/designer-mcp ~/.hermes/skills/

# any client that installs from a path
npx -y skills add ./skills/designer-mcp --skill designer-mcp
```

### Skill quality

The skill is audited with
[`rabbit-skills-audit`](https://github.com/whit3rabbit/rabbit-skills):

```
Verdict: PASS  (errors: 0, warnings: 0, info: 3)
```

For reference, the upstream `refero-design` skill it derives from currently
fails the same audit (7 ST-04 warnings + an ST-01 error — its SKILL.md is 530
lines and its long reference files have no table of contents). This version
fixes all three: SKILL.md is 389 lines, every reference over 100 lines has a
generated `## Contents`, and the detail that would have overflowed the body
lives in `references/research-playbook.md`.

Three info-level findings remain, all deliberate:

- **CQ-05** — a heuristic false positive: it reads upstream's rule *"Default is
  NO cards"* as an option dump, when it is literally stating a default.
- **MD-07** — `name` is not gerund form. The linter's own guidance says noun
  phrases are acceptable, and `designer-mcp` matches the container image and
  MCP server names.
- **EV-02** — no cross-model test results recorded. `evals/evals.json` has 7
  scenarios (including 2 trigger-paraphrase cases), but running them across
  Haiku/Sonnet/Opus needs live model runs.

Re-run the audit with:

```bash
python3 ~/.hermes/skills/rabbit-skills-audit/scripts/audit_static.py \
  skills/designer-mcp --format text
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
│   ├── mcp-entry.mjs           # stdio MCP entrypoint
│   ├── package-skill.mjs       # build the skill zip
│   └── selftest.mjs            # 17 checks across all four surfaces
├── skills/designer-mcp/
│   ├── SKILL.md            # agent skill
│   ├── references/         # 11 craft reference files
│   └── agents/openai.yaml
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
  to a BM25-lite keyword scorer — usable, but clearly worse on vibe queries.
- **The cache TTL is deliberately long** (`REFERO_CACHE_TTL_MS=86400000`). With
  a short TTL the package tries the live API on expiry, fails, and serves a
  stale copy with a warning banner. Refresh by re-running the fetcher instead.
- **`colorScheme` can be `"mixed"`** — upstream's type only declares light and
  dark, so theme filters silently drop 133 styles.

See [docs/DATA-SOURCE.md](docs/DATA-SOURCE.md) for the robots.txt / Terms of Use
analysis and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the internals.

## License

MIT for this project. The vendored upstream package keeps its own license.
Refero's design data belongs to Refero and the sites depicted — this project
reads publicly available pages and caches them locally; it does not redistribute
them.
