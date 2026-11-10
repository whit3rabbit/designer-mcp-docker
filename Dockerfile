# designer-mcp — design-system catalog: MCP server + live preview gallery.
#
# The upstream package (fidgetcoding-refero-mcp) is vendored UNMODIFIED and
# runs against a prebuilt cache. The cache is NOT baked into the image — it is
# mounted, and populated OUTSIDE the container by the fetchers:
#
#   scripts/refero-public-fetch.js  Refero styles (public pages only)
#   scripts/fetch-opendesign.mjs    OpenDesign design systems (sparse clone)
#   scripts/fetch-thumbs.mjs        screenshots, cached locally for offline use
FROM node:22-alpine

WORKDIR /app

# `zip` builds the distributable skill archive at image build time.
# `git` lets fetch-opendesign.mjs sparse-clone the design-systems subtree.
RUN apk add --no-cache zip git

# Upstream package, unmodified.
# `sharp` is optional: it is only needed by the thumbnail compressor. It
# ships prebuilt binaries for linux-x64, linux-arm64 and darwin, so the
# same script runs on the host and in this multi-arch image.
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

# Fetchers, preview server, MCP entrypoints.
COPY scripts/ ./scripts/

# The skill ships inside the image so a container-only deployment can serve
# it for download, and so `docker run ... cat /app/skills/...` works offline.
COPY skills/ ./skills/

# Prebuilt zip so /skill serves a proper .zip rather than a tarball.
RUN node scripts/package-skill.mjs --out /app/dist && \
    cp /app/dist/designer-mcp-skill.zip /app/skills/ && \
    rm -rf /app/dist

ENV DESIGN_CACHE_DIR=/cache \
    REFERO_CACHE_DIR=/cache \
    REFERO_CACHE_TTL_MS=86400000 \
    PORT=8787 \
    HOST=0.0.0.0 \
    NODE_ENV=production

VOLUME ["/cache"]
EXPOSE 8787

# Default: the preview gallery on 8787.
#   node scripts/mcp-entry.mjs     the upstream Refero MCP server (7 tools)
#   node scripts/mcp-server.mjs    the generic design MCP server (5 tools)
CMD ["node", "scripts/preview.mjs"]
