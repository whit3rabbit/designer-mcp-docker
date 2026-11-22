# Pi

Pi 1.0+ reads a standard `mcpServers` JSON map from `~/.pi/agent/mcp.json`
(or `$PI_CODING_AGENT_DIR/mcp.json`). Project scope is `<root>/.pi/mcp.json`.
Older `pi-mcp-adapter` setups use the identical format.

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

- The `PI_CODING_AGENT_DIR` environment variable moves the user-level agent directory.

