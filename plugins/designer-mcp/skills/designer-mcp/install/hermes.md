# Hermes Agent

Hermes reads MCP config from `$HERMES_HOME/config.yaml` (default
`~/.hermes/config.yaml`) under `mcp_servers`. MCP is global-only.

## Docker install

Paste this into the config file. The image serves the baked catalog and
makes no outbound calls.

```yaml
mcp_servers:
  designer:
    command: docker
    args:
      - run
      - --rm
      - -i
      - --network
      - none
      - ghcr.io/whit3rabbit/designer-mcp:latest
      - node
      - scripts/mcp-server.mjs
```

## Local checkout install

Same registration, running your clone directly.

```yaml
mcp_servers:
  designer:
    command: node
    args:
      - /path/to/designer-mcp-docker/scripts/mcp-server.mjs
    env:
      DESIGN_CACHE_DIR: /path/to/designer-mcp-docker/cache
```

The env block in the local snippet is optional. The fetchers and the server
both default to `~/.design-cache`, so a default cache needs no variables.
Set `DESIGN_CACHE_DIR` only when the cache lives elsewhere.

## Notes

- After editing, restart the gateway or run `/reload-mcp` so the tools register.

