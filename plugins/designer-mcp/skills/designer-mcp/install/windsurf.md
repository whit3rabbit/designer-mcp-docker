# Windsurf

Windsurf reads JSON from `~/.codeium/windsurf/mcp_config.json` (user) and
`.windsurf/mcp_config.json` (project) under `mcpServers`.

## Docker install

Paste this into the config file. The image serves the baked catalog and
makes no outbound calls.

```json
{
  "mcpServers": {
    "designer": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--network",
        "none",
        "ghcr.io/whit3rabbit/designer-mcp:latest",
        "node",
        "scripts/mcp-server.mjs"
      ]
    }
  }
}
```

## Local checkout install

Same registration, running your clone directly.

```json
{
  "mcpServers": {
    "designer": {
      "command": "node",
      "args": [
        "/path/to/designer-mcp-docker/scripts/mcp-server.mjs"
      ],
      "env": {
        "DESIGN_CACHE_DIR": "/path/to/designer-mcp-docker/cache"
      }
    }
  }
}
```

The env block in the local snippet is optional. The fetchers and the server
both default to `~/.design-cache`, so a default cache needs no variables.
Set `DESIGN_CACHE_DIR` only when the cache lives elsewhere.

## Notes

- Windsurf caps MCP tools at 100 across all servers. The generic server exposes 20, so one registration fits comfortably.

