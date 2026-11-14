#!/usr/bin/env node
/**
 * static-serve.mjs — lightweight zero-dependency static file server for dist/static.
 *
 * Useful for testing the GitLab Pages static build locally or inside Docker
 * without any dynamic routing or MCP dependencies.
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    let rel = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (!rel || rel.endsWith("/")) rel += "index.html";
    let target = resolve(ROOT, rel);
    if (!target.startsWith(ROOT)) return res.writeHead(403).end("Forbidden");

    const info = await stat(target).catch(() => null);
    if (!info) return res.writeHead(404).end("Not found");
    if (info.isDirectory()) target = join(target, "index.html");

    const data = await readFile(target);
    res.writeHead(200, {
      "content-type": MIME[extname(target).toLowerCase()] || "application/octet-stream",
      "content-length": data.length,
      "access-control-allow-origin": "*",
    });
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    res.writeHead(404).end("Not found");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`static-serve on http://${HOST}:${server.address().port} serving ${ROOT}`);
});
