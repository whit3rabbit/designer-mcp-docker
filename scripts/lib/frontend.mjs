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

/** The content type for a package file path. */
export function contentTypeFor(path) {
  return MIME[extname(String(path)).toLowerCase()] ?? "application/octet-stream";
}

export function documentPolicy(kind = "gallery") {
  const sandbox = ["demo", "deck", "landing", "tailwind"].includes(kind);
  const script = kind === "deck" ? "'self' 'unsafe-inline' 'unsafe-eval'" :
    kind === "demo" ? "'self'" : "'self' 'unsafe-inline'";
  // The cached Agent Kit artifacts are self-contained static documents: no
  // external references, no inline event handlers beyond one cover scaler.
  // They are framed by the gallery, so they need to be able to frame and to
  // style themselves.
  if (kind === "kit") {
    return [
      "default-src 'none'", "base-uri 'none'", "object-src 'none'", "form-action 'none'",
      "script-src 'self' 'unsafe-inline'", "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:", "img-src 'self' data: blob:",
      "frame-src 'self' data: blob:", "connect-src 'none'",
    ].join("; ");
  }
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

export function previewHtml(module, css, rootClass = "") {
  return `<!doctype html>
<html lang="en" data-preview="loading"${rootClass ? ` class="${rootClass}"` : ""}>
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

/** Parse If-None-Match into a set of etags, weak prefixes stripped. */
function ifNoneMatch(req) {
  const raw = req.headers["if-none-match"];
  if (!raw) return new Set();
  const etags = new Set();
  for (const part of String(raw).split(",")) {
    const value = part.trim();
    if (!value) continue;
    etags.add(value);
    if (value.startsWith("W/")) etags.add(value.slice(2));
  }
  return etags;
}

/** File counts per top-level group of the build manifest. */
function groupCounts(files) {
  const counts = {};
  for (const file of Object.keys(files)) {
    const group = file.startsWith("starter.zip") ? "starter" : file.split("/")[0] || "other";
    counts[group] = (counts[group] || 0) + 1;
  }
  return counts;
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
    // Raw bare-specifier map (asset-base-relative paths), published by the
    // build when it bundles the browser modules. null in older builds.
    importMap: manifest.importMap ?? null,
    groups: groupCounts(files),
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

    const extension = extname(file);
    const cacheHeader = cacheControl ?? (pathname === "/assets/starter.zip" || extension === ".html" ?
      "no-cache" : "public, max-age=31536000, immutable");
    const etag = `"${files[file].sha256}"`;

    // The manifest carries each file's sha256, so a revalidation answer is
    // known before any disk read. 304 shares the cache headers, never the body.
    if (req.method === "GET" && ifNoneMatch(req).has(etag)) {
      res.writeHead(304, {
        "cache-control": cacheHeader,
        etag,
        "access-control-allow-origin": "*",
      });
      res.end();
      return true;
    }

    let bytes;
    try {
      bytes = await readFile(join(directory, "public", file));
    } catch (error) {
      if (error.code === "ENOENT") return false;
      throw error;
    }
    const [, slug, entry] = /^templates\/([a-z0-9-]+)\/(.+)$/.exec(file) ?? [];
    const kind = file.startsWith("tailwind/") ? "tailwind" : manifest.templates[slug]?.[entry]?.kind;
    const headers = {
      ...(extension === ".html" ? htmlHeaders(kind ?? "starter") : {}),
      "content-type": MIME[extension] ?? "application/octet-stream",
      "content-length": bytes.length,
      "x-content-type-options": "nosniff",
      // Sandboxed documents have opaque origins. Only these public, built assets need CORS.
      "access-control-allow-origin": "*",
      "cache-control": cacheHeader,
      etag,
      ...(file === "starter.zip" ? { "content-disposition": 'attachment; filename="designer-frontend-starter.zip"' } : {}),
    };
    res.writeHead(200, headers);
    res.end(req.method === "HEAD" ? undefined : bytes);
    return true;
  }

  /**
   * The bare-specifier import map with origin-relative absolute paths, or
   * null when the build predates it. Serving origin gets composed from the
   * request by the /assets/importmap.json route.
   */
  function importMap() {
    if (!manifest?.importMap) return null;
    return {
      version: manifest.version,
      base,
      imports: Object.fromEntries(
        Object.entries(manifest.importMap).map(([specifier, file]) => [specifier, `${base}/${file}`]),
      ),
    };
  }

  return {
    publicManifest, asset, importMap, templateLinks,
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
    reuiPreviewPath(category, name) {
      if (!manifest || !validSlug(category) || !validSlug(name)) return null;
      const entry = manifest.reuiPreviews?.[category]?.[name];
      return entry && Object.hasOwn(files, entry.module) && Object.hasOwn(files, "previews/reui.css")
        ? `/reui/preview/${category}/${name}`
        : null;
    },
    reuiPreviewDocument(category, name) {
      if (!manifest || !validSlug(category) || !validSlug(name)) return null;
      const entry = manifest.reuiPreviews?.[category]?.[name];
      if (!entry || !Object.hasOwn(files, entry.module) || !Object.hasOwn(files, "previews/reui.css")) return null;
      return previewHtml(assetUrl(entry.module), assetUrl("previews/reui.css"), "style-nova");
    },
  };
}
