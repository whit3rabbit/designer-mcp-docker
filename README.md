# designer-mcp-docker

**Offline design for local LLMs and coding agents, and usable online as well.** A self-contained design system and UI catalog for both **humans** (a browsable web gallery) and **AI agents** (MCP server + skills).

**[Browse the live gallery → whit3rabbit.github.io/designer-mcp-docker](https://whit3rabbit.github.io/designer-mcp-docker/)**. Explore design systems, live component previews, UI kit docs, presets, and templates in your browser with zero setup.

[![image: ghcr.io](assets/badges/image.svg)](https://github.com/whit3rabbit/designer-mcp-docker/pkgs/container/designer-mcp)
[![publish: GitHub Actions](assets/badges/publish.svg)](https://github.com/whit3rabbit/designer-mcp-docker/actions/workflows/publish.yml)
[![license: MIT](assets/badges/license.svg)](LICENSE)

## What's inside

- **Design Systems (`DESIGN.md` & tokens)**: 1,540+ real product design systems with color tokens, typography scales, screenshots, and ready-to-use `DESIGN.md` specs, plus 788 deep Refero Styles profiles (named tokens, component recipes, dos/donts).
- **UI Components & Kits**: AI components with live previews, ReUI, HeroUI v3, Mantine UI, daisyUI 5, Base UI, and 16 UI kit catalogs (Chakra, MUI, Ant Design, Magic UI, Motion Primitives, Open Props, and more).
- **Presets, Templates & Starters**: CSS gradients, patterns, glass effects, 7 design-system templates, and offline dashboard starters.
- **Offline-first, online-capable**: everything is baked into the Docker image for air-gapped local LLM workflows (`--network none`), or you can browse and query the hosted GitHub Pages gallery online.

---

## Quick Start

### 1. Install the Plugin (Claude Code & ZCode)

Installing the plugin sets up all five agent skills and registers the Docker MCP server automatically.

**Claude Code:**

```bash
claude plugin marketplace add whit3rabbit/designer-mcp-docker
claude plugin install designer-mcp@designer-mcp-docker
```

**ZCode:** Open **Plugin Marketplace → Add → Add Plugin Marketplace**, paste `https://github.com/whit3rabbit/designer-mcp-docker`, and install **Designer MCP**.

### 2. Install for Any Other Agent (Codex, Cursor, Copilot, Gemini CLI, etc.)

Install the skills with the skills CLI:

```bash
npx -y skills add whit3rabbit/designer-mcp-docker
```

Then ask your agent to configure the MCP server (24 harnesses supported):

> Install the designer MCP server for \<your agent\>

For manual MCP configuration, remote URL mode, and developer options, see [the MCP setup guide](docs/MCP.md).

### 3. Run the Gallery Locally in Docker

Run the container and open `http://127.0.0.1:8787` to browse offline or download the offline skill/marketplace bundles:

```bash
docker run -d --name designer-mcp-gallery \
  -p 127.0.0.1:8787:8787 \
  ghcr.io/whit3rabbit/designer-mcp:latest
```

---

## Bundled Skills

- **`designer-mcp`**: Query the catalog via the 17-tool MCP server and configure agent harnesses.
- **`design-system`**: Design system methodology, `DESIGN.md` capture workflow, and template authoring.
- **`designer-dashboards`**: Multi-framework admin dashboards, SaaS consoles, and internal tools (`init`, `design`, `ui`, `login`, `pages`, `audit`).
- **`designer-ui`**: Frontend UI craft, `@ui-sdk/*` behavior/accessibility docs, and HeroUI v3 guides.
- **`designer-documents`**: Create, edit, and convert Word, PowerPoint, Excel, and PDF deliverables.

---

## Documentation & License

- [The MCP setup guide](docs/MCP.md): manual MCP configuration, remote URL mode (`DESIGN_REMOTE_URL`), `refero_*` server, and tool reference.
- [The architecture guide](docs/ARCHITECTURE.md): internals, fetchers, cache layout, static site builds, and local development.
- [The data source guide](docs/DATA-SOURCE.md): data sources, `robots.txt` / Terms of Use compliance, and attribution.

**License:** MIT for this project. Vendored packages and upstream design data retain their respective licenses. Cached data is for local use and not redistributed.
