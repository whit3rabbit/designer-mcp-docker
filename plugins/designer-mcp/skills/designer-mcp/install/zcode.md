# ZCode

ZCode keeps MCP servers in `~/.zcode/cli/config.json` under a top-level
`mcp.servers` object. Each entry takes a `type`, `command`, and `args`.

## Docker install

Paste this into the config file. The image serves the baked catalog and
makes no outbound calls.

```json
{
  "mcp": {
    "servers": {
      "designer": {
        "type": "stdio",
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

```json
{
  "mcp": {
    "servers": {
      "designer": {
        "type": "stdio",
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

- Merge the `designer` entry into an existing `mcp.servers` object. Do not
  replace the whole file: it also holds skills and plugin state.
- The plugin route skips this file. Install the designer-mcp plugin from the
  Plugin Marketplace and its `.mcp.json` registers the `designer` server
  automatically.
- ZCode reads skills from `~/.zcode/skills/` (or `~/.agents/skills/`), so the
  skills CLI and the manual zip install land in the right place.
