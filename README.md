# designer-mcp-docker

**1,342 real product design systems, queryable by an agent and browsable by a human.**

Two surfaces over one cache:

- **MCP server** (stdio) — 7 tools for agents: search, get, render DESIGN.md, facets
- **Live gallery** (HTTP) — thumbnail grid, detail pages, live color swatches

The upstream package [`fidgetcoding-refero-mcp`](https://github.com/fidgetcoding/refero-design-mcp)
is vendored **unmodified** and runs against a prebuilt cache, so upstream
updates drop in cleanly.

---

## Quick start

```bash
cd ~/Documents/Github/designer-mcp-docker

npm install          # upstream package
npm run fetch        # populate ./cache from public pages (~2.5 min, 1,342 styles)
npm test             # self-test everything

docker compose up -d # gallery → http://127.0.0.1:8787
```

Register the MCP server with your agent:

```bash
hermes mcp add designer \
  --command docker \
  --args run --rm -i -v "$PWD/cache:/cache:ro" \
         designer-mcp:latest node scripts/mcp-entry.mjs
```

Restart the gateway (or `/reload-mcp`) so the tools register.

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

The upstream package's own format, so upgrades stay safe:

```
cache/catalog.json       { updatedAt, styles[] }
cache/styles/<uuid>.json { updatedAt, style }
cache/embeddings.json    { model, vectors }   (only with OPENAI_API_KEY)
```

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
