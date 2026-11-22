# Codex CLI

Codex CLI reads TOML from `$CODEX_HOME/config.toml` (default
`~/.codex/config.toml`) under `[mcp_servers.<name>]`. Project scope is
`<root>/.codex/config.toml`.

## Docker install

Paste this into the config file. The image serves the baked catalog and
makes no outbound calls.

```toml
[mcp_servers.designer]
command = "docker"
args = ["run", "--rm", "-i", "--network", "none", "ghcr.io/whit3rabbit/designer-mcp:latest", "node", "scripts/mcp-server.mjs"]
```

## Local checkout install

Same registration, running your clone directly.

```toml
[mcp_servers.designer]
command = "node"
args = ["/path/to/designer-mcp-docker/scripts/mcp-server.mjs"]

[mcp_servers.designer.env]
DESIGN_CACHE_DIR = "/path/to/designer-mcp-docker/cache"
```

The env block in the local snippet is optional. The fetchers and the server
both default to `~/.design-cache`, so a default cache needs no variables.
Set `DESIGN_CACHE_DIR` only when the cache lives elsewhere.

## Notes

- Project scope loads only when Codex trusts the project.
- SSE is not a supported Codex transport. The stdio entries here are the supported shape.

