# designer-mcp — design-system catalog: MCP server + live preview gallery.
#
# The upstream package (fidgetcoding-refero-mcp) is vendored UNMODIFIED and
# runs against a prebuilt cache. The cache is baked into the image so a
# plain `docker run` works offline with data already present:
#
#   scripts/refero-public-fetch.js  Refero styles (public pages only)
#   scripts/fetch-opendesign.mjs    OpenDesign design systems (sparse clone)
#   scripts/fetch-agentkit.mjs      the Agent Kit layer: 46 more systems,
#                                   the Claude Design packages, the previews
#   scripts/fetch-thumbs.mjs        screenshots, cached locally for offline use
#   scripts/fetch-gradientdeck.mjs  AI components (shadcn registry exports)
#   scripts/fetch-presets.mjs       gradient / pattern / glass preset catalogs
#   scripts/bake-cache.mjs          assembles the cache that goes in the image
#
# The baked cache is produced OUTSIDE the container by `npm run bake`, from a
# cache that was populated by the fetchers above. A mounted /cache still
# overrides it at runtime, so a deployment can refresh without rebuilding.
FROM --platform=$BUILDPLATFORM node:22-alpine AS frontend-build

WORKDIR /build
RUN apk add --no-cache zip chromium font-liberation
ENV DESIGN_CHROMIUM_PATH=/usr/bin/chromium
COPY frontend/package.json frontend/package-lock.json ./frontend/
COPY frontend/deck/package.json frontend/deck/package-lock.json ./frontend/deck/
RUN npm ci --prefix frontend --ignore-scripts && \
    npm ci --prefix frontend/deck --ignore-scripts
COPY frontend/ ./frontend/
COPY scripts/lib/frontend-paths.mjs scripts/lib/frontend.mjs scripts/lib/slopstrap.mjs ./scripts/lib/
COPY scripts/fetch-tailwind.mjs ./scripts/
RUN node scripts/fetch-tailwind.mjs
COPY bake/components.json bake/design-systems.json ./bake/
COPY bake/components/ ./bake/components/
COPY bake/reui/ ./bake/reui/
COPY bake/mantine/ ./bake/mantine/
COPY bake/daisyui/ ./bake/daisyui/
COPY bake/design-systems/ ./bake/design-systems/
COPY bake/slopstrap/ ./bake/slopstrap/
RUN --network=none node frontend/build.mjs --out /frontend-cache

FROM node:22-alpine

WORKDIR /app

# `zip` builds the distributable skill archive at image build time.
# `git` lets fetch-opendesign.mjs sparse-clone the design-systems subtree.
RUN apk add --no-cache zip git

# Upstream package, unmodified.
# `sharp` is optional: it is only needed by the thumbnail compressor. It
# ships prebuilt binaries for linux-x64, linux-arm64 and darwin, so the
# same script runs on the host and in this multi-arch image.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Fetchers, preview server, MCP entrypoints.
COPY scripts/ ./scripts/

# The plugin (manifests, four top-level skills, and bundled sub-skills) ships
# inside the image so a container-only deployment can serve it for download,
# and so `docker run ... cat /app/plugins/...` works offline.
COPY plugins/designer-mcp/ ./plugins/designer-mcp/
# Marketplace manifests, so package-skill.mjs can build the offline
# local-marketplace zip (claude plugin marketplace add <dir>).
COPY .claude-plugin/marketplace.json ./.claude-plugin/
COPY .cursor-plugin/marketplace.json ./.cursor-plugin/
COPY .agents/plugins/marketplace.json ./.agents/plugins/

# A catalog volume can hide /cache, so keep immutable browser assets alongside the skill.
COPY --from=frontend-build /frontend-cache/ /app/frontend-cache/

# The baked catalog: designs, AI components and preset catalogs.
# Produced by `npm run bake`. Kept last so it is one layer.
COPY bake/ /cache/

# Prebuilt zip so /skill serves a proper .zip rather than a tarball.
# It lands beside the skills root, where the /skill route looks for it.
RUN node scripts/package-skill.mjs --out /app/dist && \
    cp /app/dist/designer-mcp-skill.zip /app/dist/designer-mcp-marketplace.zip /app/plugins/designer-mcp/ && \
    rm -rf /app/dist

# Pre-warm Node's V8 bytecode compile cache so MCP stdio containers skip
# script parsing/compilation on cold startup.
RUN mkdir -p /app/.compile-cache && \
    NODE_COMPILE_CACHE=/app/.compile-cache node --input-type=module -e ' \
      await Promise.all([ \
        import("./scripts/lib/mcp-runtime.mjs"), \
        import("./scripts/lib/mcp-legacy-tools.mjs"), \
      ]); \
    ' && \
    printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"warmup","version":"1"}}}\n{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}\n' \
      | DESIGN_CACHE_DIR=/cache NODE_COMPILE_CACHE=/app/.compile-cache node scripts/mcp-server.mjs > /dev/null && \
    printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"warmup","version":"1"}}}\n' \
      | DESIGN_CACHE_DIR=/cache REFERO_CACHE_DIR=/cache NODE_COMPILE_CACHE=/app/.compile-cache node scripts/mcp-entry.mjs > /dev/null

ENV DESIGN_CACHE_DIR=/cache \
    DESIGN_FRONTEND_DIR=/app/frontend-cache \
    REFERO_CACHE_DIR=/cache \
    REFERO_CACHE_TTL_MS=315360000000 \
    NODE_COMPILE_CACHE=/app/.compile-cache \
    PORT=8787 \
    HOST=0.0.0.0 \
    NODE_ENV=production

VOLUME ["/cache"]
EXPOSE 8787

# Default: the preview gallery on 8787.
#   node scripts/mcp-entry.mjs     the upstream Refero MCP server (7 tools)
#   node scripts/mcp-server.mjs    the generic design MCP server (design_* tools)
CMD ["node", "scripts/preview.mjs"]
