# OpenClaw

OpenClaw keeps outbound MCP servers in its JSON5 config
`~/.openclaw/openclaw.json` under `mcp.servers`. MCP is global-only.

## Docker install

Paste this into the config file. The image serves the baked catalog and
makes no outbound calls.

```json5
{
  "mcp": {
    "servers": {
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
}
```

## Local checkout install

Same registration, running your clone directly.

```json5
{
  "mcp": {
    "servers": {
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
}
```

The env block in the local snippet is optional. The fetchers and the server
both default to `~/.design-cache`, so a default cache needs no variables.
Set `DESIGN_CACHE_DIR` only when the cache lives elsewhere.

## Notes

- `openclaw mcp set` and `openclaw mcp unset` write the same config shape.

