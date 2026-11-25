#!/usr/bin/env node
/**
 * static-serve.mjs — lightweight zero-dependency static file server for dist/static.
 *
 * Useful for testing the GitHub/GitLab Pages static build locally or inside Docker
 * without any dynamic routing or MCP dependencies. Supports ETag 304 validation,
 * cache headers, and gzip compression for text/JSON/HTML/JS/CSS/SVG assets.
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(process.env.DESIGN_STATIC_DIR || join(HERE, "..", "dist", "static"));
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".zip": "application/zip",
};

const COMPRESSIBLE = new Set([".html", ".js", ".mjs", ".css", ".json", ".md", ".txt", ".svg"]);
const gzipCache = new Map();
const GZIP_CACHE_LIMIT = 256;

function cacheControlFor(rel, ext) {
  if (rel.startsWith("shell/") || /^assets\/[a-f0-9]{20}\//.test(rel)) {
    return ext === ".html" ? "public, max-age=60, must-revalidate" : "public, max-age=31536000, immutable";
  }
  if (ext === ".webp" || ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".woff2" || ext === ".svg") {
    return "public, max-age=86400";
  }
  return "public, max-age=60, must-revalidate";
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    let rel = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (!rel || rel.endsWith("/")) rel += "index.html";
    let target = resolve(ROOT, rel);
    if (!target.startsWith(ROOT)) return res.writeHead(403).end("Forbidden");

    let info = await stat(target).catch(() => null);
    if (!info) return res.writeHead(404).end("Not found");
    if (info.isDirectory()) {
      target = join(target, "index.html");
      rel = rel.replace(/\/?$/, "/index.html");
      info = await stat(target).catch(() => null);
      if (!info) return res.writeHead(404).end("Not found");
    }

    const ext = extname(target).toLowerCase();
    const etag = `W/"${info.size}-${Math.trunc(info.mtimeMs)}"`;
    const cacheControl = cacheControlFor(rel, ext);

    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304, {
        etag,
        "cache-control": cacheControl,
        "access-control-allow-origin": "*",
      });
      return res.end();
    }

    const data = await readFile(target);
    const acceptsGzip = /\bgzip\b/i.test(String(req.headers["accept-encoding"] || ""));
    const compress = acceptsGzip && data.length >= 1024 && COMPRESSIBLE.has(ext);
    let body = data;
    if (compress) {
      const key = `${target}:${etag}`;
      let gz = gzipCache.get(key);
      if (!gz) {
        gz = gzipSync(data, { level: 6 });
        if (gzipCache.size >= GZIP_CACHE_LIMIT) gzipCache.delete(gzipCache.keys().next().value);
        gzipCache.set(key, gz);
      }
      body = gz;
    }

    res.writeHead(200, {
      "content-type": MIME[ext] || "application/octet-stream",
      "content-length": body.length,
      etag,
      "cache-control": cacheControl,
      "access-control-allow-origin": "*",
      ...(compress ? { "content-encoding": "gzip", vary: "accept-encoding" } : {}),
    });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    res.writeHead(404).end("Not found");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`static-serve on http://${HOST}:${server.address().port} serving ${ROOT}`);
});
