# MCP Server Guide

`designer-mcp-docker` exposes two stdio JSON-RPC MCP servers over the same local cache. Neither listens on a network port; register one with your coding agent or local LLM client via `docker run -i` or Node.

## The Two MCP Servers

| Server | Entrypoint | Tools | Network |
|---|---|---|---|
| **Generic (recommended)** | `scripts/mcp-server.mjs` | 17 `design_*` tools (`--legacy-tools` for 50+ granular aliases) | 100% offline (`--network none`), or optional remote static site |
| **Upstream** | `scripts/mcp-entry.mjs` | 7 `refero_*` tools | Offline except `refero_similar` and `refero_refresh` |

See [mcp-tools.md](../plugins/designer-mcp/skills/designer-mcp/references/mcp-tools.md) for the full list of `design_*` tools, arguments, and response shapes.

---

## Manual MCP Configuration

If you installed the skills via `npx -y skills add whit3rabbit/designer-mcp-docker` (instead of the full Claude Code / ZCode plugin), you can ask your agent:

> Install the designer MCP server for \<your agent\>

Or add the server manually using one of the snippets below. See [plugins/designer-mcp/skills/designer-mcp/install/](../plugins/designer-mcp/skills/designer-mcp/install/README.md) for all 24 supported harnesses and local-checkout variants.

### Claude Code

```bash
claude mcp add designer -- \
  docker run --rm -i --network none \
  ghcr.io/whit3rabbit/designer-mcp:latest node scripts/mcp-server.mjs
```

Or add to a project `.mcp.json`:

```json
{
  "mcpServers": {
    "designer": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i", "--network", "none",
        "ghcr.io/whit3rabbit/designer-mcp:latest",
        "node", "scripts/mcp-server.mjs"
      ]
    }
  }
}
```

### GitHub Copilot

Add to `~/.copilot/mcp-config.json` (or `<root>/.mcp.json` for project scope):

```json
{
  "mcpServers": {
    "designer": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i", "--network", "none",
        "ghcr.io/whit3rabbit/designer-mcp:latest",
        "node", "scripts/mcp-server.mjs"
      ]
    }
  }
}
```

### Codex

Add to `~/.codex/config.toml` (or `<root>/.codex/config.toml` for trusted projects):

```toml
[mcp_servers.designer]
command = "docker"
args = ["run", "--rm", "-i", "--network", "none",
        "ghcr.io/whit3rabbit/designer-mcp:latest",
        "node", "scripts/mcp-server.mjs"]
```

### ZCode

Merge into `~/.zcode/cli/config.json` under `mcp.servers`:

```json
{
  "mcp": {
    "servers": {
      "designer": {
        "type": "stdio",
        "command": "docker",
        "args": [
          "run", "--rm", "-i", "--network", "none",
          "ghcr.io/whit3rabbit/designer-mcp:latest",
          "node", "scripts/mcp-server.mjs"
        ]
      }
    }
  }
}
```

---

## Runtime Flags & Context-Saving Options

- **`--toolsets <list>` / `DESIGN_TOOLSETS=<list>`**: Enable only specific toolsets (`core`, `kits`, `extras`, `dashboards`, `picks`, or `all`).
- **`--legacy-tools` / `DESIGN_LEGACY_TOOLS=1`**: Also expose the 50 pre-v2 granular `design_*` tool names in `tools/list` for backwards compatibility.
- **Heading-based doc navigation (`outline: true` & `section`)**: On `design_kit_docs` and `design_get` (`include: "markdown"`), pass `outline: true` to list headings with byte offsets, then `section: "<heading>"` to read just one section.

---

## Using the Upstream `refero_*` Server

To use the vendored upstream `refero_*` tools instead of `design_*`, swap the entrypoint to `node scripts/mcp-entry.mjs` and drop `--network none` if you need `refero_similar` or `refero_refresh`.

---

## Online / Remote Mode (`DESIGN_REMOTE_URL`)

The generic `design_*` server defaults to the baked offline cache, but can also read from a hosted static site (such as the GitHub Pages deployment) via `DESIGN_REMOTE_URL` or `--url`:

```bash
DESIGN_REMOTE_URL=https://whit3rabbit.github.io/designer-mcp-docker/ \
  node scripts/mcp-server.mjs
```

If the remote host is unreachable, `scripts/mcp-server.mjs` falls back to the local disk cache and includes a `remoteNote` in the response.

---

## Running from a Local Checkout or Custom Cache

To run directly from a cloned repository without Docker:

```bash
DESIGN_CACHE_DIR="$PWD/bake" node scripts/mcp-server.mjs
```

To mount a refreshed cache volume into the Docker container instead of using the baked cache:

```bash
docker volume create designer-cache
docker run --rm -v designer-cache:/cache \
  ghcr.io/whit3rabbit/designer-mcp:latest \
  node scripts/refero-public-fetch.js --limit 0
# Then add -v designer-cache:/cache:ro to your MCP docker run args
```

---

## Upgrade Notes

- **Skills newer than the Docker image:** `npx skills add` installs from `main`, while manual `:latest` registrations keep using a previously pulled image. If a skill references a tool your client does not list, run `docker pull ghcr.io/whit3rabbit/designer-mcp:latest` and restart your client. (Plugin installs pin the matching image tag in `.mcp.json`.)
- **Upgrading from v1.7.0 or earlier:** v1.8.0 split the single `designer-mcp` skill into four skills. If your installed `designer-mcp` folder still has `docx/` at its top level, delete that folder and reinstall.
