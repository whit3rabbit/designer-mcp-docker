# OpenCode

OpenCode reads an `mcp` object keyed by server name from
`~/.config/opencode/opencode.json` (user) and `<root>/opencode.json`
(project). JSONC is accepted. Local servers use a command array.

## Docker install

Paste this into the config file. The image serves the baked catalog and
makes no outbound calls.

```json
{
  "mcp": {
    "designer": {
      "type": "local",
      "command": [
        "docker",
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
  "mcp": {
    "designer": {
      "type": "local",
      "command": [
        "node",
        "/path/to/designer-mcp-docker/scripts/mcp-server.mjs"
      ]
    }
  }
}
```

The env block in the local snippet is optional. The fetchers and the server
both default to `~/.design-cache`, so a default cache needs no variables.
Set `DESIGN_CACHE_DIR` only when the cache lives elsewhere.

## Notes

- OpenCode V2 adds a nested `mcp.servers` shape and keeps the flat `mcp` object working. The snippets target the flat object.

