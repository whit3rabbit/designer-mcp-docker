# Amp

Amp reads JSON with a standard `mcpServers` object from
`~/.config/amp/settings.json` (user) and `<root>/.amp/settings.json` (project).

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

- Amp's CLI schema also defines `amp.mcpServers`. Use the standard `mcpServers` object shown here.

