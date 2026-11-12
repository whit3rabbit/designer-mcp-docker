# designer-mcp — design-system catalog: MCP server + live preview gallery.
#
# The upstream package (fidgetcoding-refero-mcp) is vendored UNMODIFIED and
# runs against a prebuilt cache. The cache is baked into the image so a
# plain `docker run` works offline with data already present:
#
#   scripts/refero-public-fetch.js  Refero styles (public pages only)
#   scripts/fetch-opendesign.mjs    OpenDesign design systems (sparse clone)
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
COPY scripts/lib/frontend-paths.mjs scripts/lib/frontend.mjs ./scripts/lib/
COPY scripts/fetch-tailwind.mjs ./scripts/
RUN node scripts/fetch-tailwind.mjs
COPY bake/components.json bake/design-systems.json ./bake/
COPY bake/components/ ./bake/components/
COPY bake/design-systems/ ./bake/design-systems/
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

# The skill ships inside the image so a container-only deployment can serve
# it for download, and so `docker run ... cat /app/skills/...` works offline.
COPY skills/ ./skills/

# A catalog volume can hide /cache, so keep immutable browser assets alongside the skill.
COPY --from=frontend-build /frontend-cache/ /app/frontend-cache/

# The baked catalog: designs, AI components and preset catalogs.
# Produced by `npm run bake`. Kept last so it is one layer.
COPY bake/ /cache/

# Prebuilt zip so /skill serves a proper .zip rather than a tarball.
RUN node scripts/package-skill.mjs --out /app/dist && \
    cp /app/dist/designer-mcp-skill.zip /app/skills/ && \
    rm -rf /app/dist

ENV DESIGN_CACHE_DIR=/cache \
    DESIGN_FRONTEND_DIR=/app/frontend-cache \
    REFERO_CACHE_DIR=/cache \
    REFERO_CACHE_TTL_MS=315360000000 \
    PORT=8787 \
    HOST=0.0.0.0 \
    NODE_ENV=production

VOLUME ["/cache"]
EXPOSE 8787

# Default: the preview gallery on 8787.
#   node scripts/mcp-entry.mjs     the upstream Refero MCP server (7 tools)
#   node scripts/mcp-server.mjs    the generic design MCP server (5 tools)
CMD ["node", "scripts/preview.mjs"]
