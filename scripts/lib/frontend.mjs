import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { validAssetPath, validSlug, variantFingerprint } from "./frontend-paths.mjs";

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ts": "text/plain; charset=utf-8",
  ".tsx": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".zip": "application/zip",
};

export function documentPolicy(kind = "gallery") {
  const sandbox = ["demo", "deck", "landing", "tailwind"].includes(kind);
  const script = kind === "deck" ? "'self' 'unsafe-inline' 'unsafe-eval'" :
    kind === "demo" ? "'self'" : "'self' 'unsafe-inline'";
  return [
    "default-src 'none'", "base-uri 'none'", "object-src 'none'", "form-action 'none'",
    `script-src ${script}`, "style-src 'self' 'unsafe-inline'", "font-src 'self'",
    "img-src 'self' data: blob:", "media-src 'self' data: blob:", "frame-ancestors 'self'",
    kind === "gallery" ? "frame-src 'self'" : "frame-src 'none'",
    ["demo", "tailwind"].includes(kind) ? "connect-src 'none'" : "connect-src 'self'",
    ...(sandbox ? ["sandbox allow-scripts"] : []),
  ].join("; ");
}

export function htmlHeaders(kind) {
  return {
    "content-type": MIME[".html"],
    "content-security-policy": documentPolicy(kind),
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-dns-prefetch-control": "off",
  };
}

export function previewHtml(module, css) {
  return `<!doctype html>
<html lang="en" data-preview="loading">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Component preview</title>
<link rel="stylesheet" href="${css}">
<script type="module" src="${module}" crossorigin="anonymous"></script>
</head>
<body><div id="preview-root"></div></body>
</html>`;
}

export async function loadFrontend(directory) {
  let manifest = null;
  try {
    manifest = JSON.parse(await readFile(join(directory, "manifest.json"), "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (manifest && !/^[a-f0-9]{20}$/.test(manifest.version)) throw new Error("Invalid frontend cache version");
  const files = manifest?.files ?? {};
  const base = `/assets/${manifest?.version}`;
  const assetUrl = (file) => `${base}/${file}`;
  const publicManifest = manifest ? {
    version: manifest.version,
    starter: assetUrl("starter/index.html"),
    archive: { url: "/assets/starter.zip", ...files["starter.zip"] },
    packages: manifest.packages,
    vendorSnapshot: manifest.vendorSnapshot,
    files: Object.entries(files).filter(([file]) => file.startsWith("starter/"))
      .map(([path, info]) => ({ path: path.slice("starter/".length), url: assetUrl(path), ...info })),
  } : null;

  function variant(slug, item) {
    if (!manifest || !validSlug(slug) || !validSlug(item.id)) return null;
    const entry = manifest.previews[slug]?.[item.id];
    return entry?.fingerprint === variantFingerprint(item) &&
      Object.hasOwn(files, entry.module) && Object.hasOwn(files, "previews/preview.css") ? entry : null;
  }

  function templateLinks(slug) {
    if (!manifest || !validSlug(slug)) return {};
    return Object.fromEntries(Object.keys(manifest.templates[slug] ?? {}).map((entry) => [
      entry, assetUrl(`templates/${slug}/${entry}`),
    ]));
  }

  async function asset(req, res, pathname, cacheControl) {
    const file = pathname === "/assets/starter.zip" ? "starter.zip" :
      pathname.startsWith(`${base}/`) ? pathname.slice(base.length + 1) : "";
    if (!validAssetPath(file) || !Object.hasOwn(files, file)) return false;
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { allow: "GET, HEAD" }).end();
      return true;
    }

    let bytes;
    try {
      bytes = await readFile(join(directory, "public", file));
    } catch (error) {
      if (error.code === "ENOENT") return false;
      throw error;
    }
    const extension = extname(file);
    const [, slug, entry] = /^templates\/([a-z0-9-]+)\/(.+)$/.exec(file) ?? [];
    const kind = file.startsWith("tailwind/") ? "tailwind" : manifest.templates[slug]?.[entry]?.kind;
    const headers = {
      ...(extension === ".html" ? htmlHeaders(kind ?? "starter") : {}),
      "content-type": MIME[extension] ?? "application/octet-stream",
      "content-length": bytes.length,
      "x-content-type-options": "nosniff",
      // Sandboxed documents have opaque origins. Only these public, built assets need CORS.
      "access-control-allow-origin": "*",
      "cache-control": cacheControl ?? (pathname === "/assets/starter.zip" || extension === ".html" ? "no-cache" : "public, max-age=31536000, immutable"),
      etag: `"${files[file].sha256}"`,
      ...(file === "starter.zip" ? { "content-disposition": 'attachment; filename="designer-frontend-starter.zip"' } : {}),
    };
    res.writeHead(200, headers);
    res.end(req.method === "HEAD" ? undefined : bytes);
    return true;
  }

  return {
    publicManifest, asset, templateLinks,
    tailwindGroups(source) {
      return (manifest?.tailwindGallery?.[source] ?? []).map((group) => ({
        ...group, thumbnail: group.thumbnail && assetUrl(group.thumbnail),
      }));
    },
    async tailwindExample(item) {
      if (![item.source, item.preview].every((path) => validAssetPath(path) && Object.hasOwn(files, path))) return null;
      return {
        preview: assetUrl(item.preview),
        download: assetUrl(item.source),
        code: await readFile(join(directory, "public", item.source), "utf8"),
      };
    },
    thumbnailPath(slug, id) {
      const thumbnail = manifest?.previews[slug]?.[id]?.thumbnail;
      if (!thumbnail || !Object.hasOwn(files, thumbnail)) return null;
      return `/component/${slug}/thumbnail/${id}?v=${manifest.version}`;
    },
    thumbnailAsset(slug, item) {
      const thumbnail = variant(slug, item)?.thumbnail;
      return thumbnail && Object.hasOwn(files, thumbnail) ? assetUrl(thumbnail) : null;
    },
    previewPath(slug, item) {
      return variant(slug, item) ? `/component/${slug}/preview/${item.id}` : null;
    },
    previewDocument(slug, item) {
      const entry = variant(slug, item);
      return entry ? previewHtml(assetUrl(entry.module), assetUrl("previews/preview.css")) : null;
    },
  };
}
