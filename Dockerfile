# designer-mcp — Refero design styles: MCP server + live preview gallery.
#
# The upstream package (fidgetcoding-refero-mcp) is vendored UNMODIFIED and
# runs against a prebuilt cache. The cache is NOT baked into the image — it is
# mounted, and populated OUTSIDE the container by scripts/refero-public-fetch.js
# reading only public pages.
FROM node:22-alpine

WORKDIR /app

# `zip` is needed to build the distributable skill archive at image build time.
RUN apk add --no-cache zip

# Upstream package, unmodified.
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

# Fetcher, preview server, MCP entrypoint.
COPY scripts/ ./scripts/

# The skill ships inside the image so a container-only deployment can serve
# it for download, and so `docker run ... cat /app/skills/...` works offline.
COPY skills/ ./skills/

# Prebuilt zip so /skill serves a proper .zip rather than a tarball.
RUN node scripts/package-skill.mjs --out /app/dist && \
    cp /app/dist/designer-mcp-skill.zip /app/skills/ && \
    rm -rf /app/dist

ENV REFERO_CACHE_DIR=/cache \
    REFERO_CACHE_TTL_MS=86400000 \
    PORT=8787 \
    HOST=0.0.0.0 \
    NODE_ENV=production

VOLUME ["/cache"]
EXPOSE 8787

# Default: the preview gallery on 8787.
# `docker run ... node scripts/mcp-entry.mjs` starts the stdio MCP server.
CMD ["node", "scripts/preview.mjs"]
