# Kilo Code

Kilo Code reads JSONC with an `mcp` object keyed by server name. User scope
is `~/.config/kilo/kilo.jsonc`. Project scope is `<root>/kilo.jsonc` or
`<root>/.kilo/kilo.jsonc`. Local entries use a command array and an
`environment` object for variables.

## Docker install

Paste this into the config file. The image serves the baked catalog and
makes no outbound calls.

```jsonc
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

```jsonc
{
  "mcp": {
    "designer": {
      "type": "local",
      "command": [
        "node",
        "/path/to/designer-mcp-docker/scripts/mcp-server.mjs"
      ],
      "environment": {
        "DESIGN_CACHE_DIR": "/path/to/designer-mcp-docker/cache"
      }
    }
  }
}
```

The env block in the local snippet is optional. The fetchers and the server
both default to `~/.design-cache`, so a default cache needs no variables.
Set `DESIGN_CACHE_DIR` only when the cache lives elsewhere.

