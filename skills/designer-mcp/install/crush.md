# Charm Crush

Crush keys servers under `mcp` (not `mcpServers`) in `<crush_home>/crush.json`
(user) and `<root>/crush.json` (project). Each entry needs a `type`
discriminant, `stdio` here.

## Docker install

Paste this into the config file. The image serves the baked catalog and
makes no outbound calls.

```json
{
  "mcp": {
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
```

## Local checkout install

Same registration, running your clone directly.

```json
{
  "mcp": {
    "designer": {
      "type": "stdio",
      "command": "node",
      "args": [
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

- If your cache lives outside `~/.design-cache`, export `DESIGN_CACHE_DIR` in the shell that launches Crush.

