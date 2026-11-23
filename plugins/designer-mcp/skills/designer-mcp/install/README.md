# MCP install for every agent harness

Ready-made MCP registration for the designer-mcp servers. Pick your harness in
the table, open its file, and paste the snippet. Every snippet registers the
generic `design_*` server: 44 tools across both sources and the component,
preset, template, and UI library layers, fully offline.

The upstream `refero_*` server (`scripts/mcp-entry.mjs`) is an optional
fallback for Refero-only reads. Swap the last script argument in any snippet to
`scripts/mcp-entry.mjs` to register it instead. Two of its tools
(`refero_similar`, `refero_refresh`) need the live API and fail by design
offline.

## Contents

- [Two ways to install](#two-ways-to-install)
- [The command each snippet registers](#the-command-each-snippet-registers)
- [Harness table](#harness-table)

## Two ways to install

Each harness file shows two snippets for the same registration.

**Docker.** The published image serves the baked catalog with zero setup and
no outbound calls. Nothing to build.

**Local checkout.** The server runs from a clone. The clone needs a cache
before first use, so build it once:

```bash
git clone https://github.com/whit3rabbit/designer-mcp-docker
cd designer-mcp-docker
npm install
npm run fetch && npm run opendesign && npm run components && npm run presets
npm run templates
# the UI library layers; skip any you do not need
npm run heroui && npm run mantine && npm run daisyui && npm run baseui
```

Without that last line the `design_heroui_*`, `design_mantine_*`,
`design_daisyui_*`, and `design_baseui_*` tools still register, and answer
`available: false` with the command to run.

The fetchers and the server share one cache default (`~/.design-cache`), so no
environment variables are needed. `npm run all` adds thumbnails and serves the
gallery only, not the MCP tools. Set `DESIGN_CACHE_DIR` when the cache lives
somewhere else.

## The command each snippet registers

Docker snippets all register this stdio command:

```bash
docker run --rm -i --network none \
  ghcr.io/whit3rabbit/designer-mcp:latest node scripts/mcp-server.mjs
```

Local snippets replace it with:

```bash
node /path/to/designer-mcp-docker/scripts/mcp-server.mjs
```

### Keeping the image current

The snippets use the `:latest` tag, and Docker keeps running a `:latest` it
already has. Skills installed with the skills CLI update from `main`, so an
old image can lack a tool a newer skill names. When a tool is missing, pull
and restart the client:

```bash
docker pull ghcr.io/whit3rabbit/designer-mcp:latest
```

To stay on one release instead, replace `:latest` with a version tag such as
`:v1.9.1`. The plugin install does that for you in its `.mcp.json`.

On an air-gapped host Docker cannot pull, so the tag a snippet names must
already be loaded (`docker save` elsewhere, `docker load` there). The
running gallery serves the plugin as a local marketplace at
`/skill/marketplace.zip` for `claude plugin marketplace add <unzipped dir>`.

## Harness table

| Harness | Global config | Local config | Shape | File |
|---|---|---|---|---|
| Claude Code | `~/.claude.json` | `.mcp.json` | ``mcpServers`` | [claude.md](claude.md) |
| Cursor | `~/.cursor/mcp.json` | `<root>/.cursor/mcp.json` | ``mcpServers`` | [cursor.md](cursor.md) |
| Gemini CLI | `~/.gemini/settings.json` | `<root>/.gemini/settings.json` | ``mcpServers`` | [gemini.md](gemini.md) |
| OpenClaw | `~/.openclaw/openclaw.json` (JSON5) | global only | ``mcp.servers`` | [openclaw.md](openclaw.md) |
| Hermes Agent | `~/.hermes/config.yaml` (YAML) | global only | ``mcp_servers`` | [hermes.md](hermes.md) |
| Codex CLI | `~/.codex/config.toml` (TOML) | `<root>/.codex/config.toml` | ``[mcp_servers.*]`` | [codex.md](codex.md) |
| GitHub Copilot | `~/.copilot/mcp-config.json` | `<root>/.mcp.json` | ``mcpServers`` | [copilot.md](copilot.md) |
| OpenCode | `~/.config/opencode/opencode.json` | `<root>/opencode.json` | ``mcp` (command array)` | [opencode.md](opencode.md) |
| Cline | `~/.cline/data/settings/cline_mcp_settings.json` | global only | ``mcpServers`` | [cline.md](cline.md) |
| Roo Code | VS Code globalStorage for Roo | `<root>/.roo/mcp.json` | ``mcpServers`` | [roo.md](roo.md) |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | `.windsurf/mcp_config.json` | ``mcpServers`` | [windsurf.md](windsurf.md) |
| Kilo Code | `~/.config/kilo/kilo.jsonc` (JSONC) | `<root>/kilo.jsonc` | ``mcp` (command array)` | [kilocode.md](kilocode.md) |
| Google Antigravity | `~/.gemini/config/mcp_config.json` | `<root>/.agents/mcp_config.json` | ``mcpServers`` | [antigravity.md](antigravity.md) |
| Antigravity CLI | `~/.gemini/antigravity-cli/mcp_config.json` | `<root>/.agents/mcp_config.json` | ``mcpServers`` | [antigravitycli.md](antigravitycli.md) |
| Amp | `~/.config/amp/settings.json` | `<root>/.amp/settings.json` | ``mcpServers`` | [amp.md](amp.md) |
| Charm Crush | `<crush_home>/crush.json` | `<root>/crush.json` | ``mcp` (`type: stdio`)` | [crush.md](crush.md) |
| Forge | `~/.forge/.mcp.json` | `<root>/.mcp.json` | ``mcpServers`` | [forge.md](forge.md) |
| iFlow CLI | `~/.iflow/settings.json` | `<root>/.iflow/settings.json` | ``mcpServers`` | [iflow.md](iflow.md) |
| JetBrains Junie | `~/.junie/mcp/mcp.json` | `<root>/.junie/mcp/mcp.json` | ``mcpServers`` | [junie.md](junie.md) |
| Pi | `~/.pi/agent/mcp.json` | `<root>/.pi/mcp.json` | ``mcpServers`` | [pi.md](pi.md) |
| Qoder CLI | `~/.qoder.json` | `<root>/.mcp.json` | ``mcpServers`` | [qodercli.md](qodercli.md) |
| Qwen Code | `~/.qwen/settings.json` | `<root>/.qwen/settings.json` | ``mcpServers`` | [qwen.md](qwen.md) |
| Tabnine CLI | `~/.tabnine/agent/settings.json` | `<root>/.tabnine/agent/settings.json` | ``mcpServers`` | [tabnine.md](tabnine.md) |
| ZCode | `~/.zcode/cli/config.json` | global only | ``mcp.servers`` | [zcode.md](zcode.md) |

Config paths follow
[whit3rabbit/agent-config](https://github.com/whit3rabbit/agent-config)'s
harness docs (`docs/agents/`, last updated 2026-11-08). Where a harness ships
its own MCP CLI, the harness file notes it.
