import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { gzipSync } from "node:zlib";
import { validAssetPath, validSlug, variantFingerprint } from "./frontend-paths.mjs";

const COMPRESSIBLE_EXT = new Set([".css", ".js", ".mjs", ".html", ".json", ".md", ".txt", ".ts", ".tsx", ".svg"]);
const gzipAssetCache = new Map();
const GZIP_CACHE_LIMIT = 256;

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
  const sandbox = ["demo", "deck", "landing", "tailwind", "native", "mantine"].includes(kind);
  const script = kind === "deck" ? "'self' 'unsafe-inline' 'unsafe-eval'" :
    // Native HTML previews inline the framework script, unlike module demos.
    // Mantine previews inline exactly one script: the import map that
    // resolves react and the vendored @mantine chunk.
    kind === "mantine" ? "'self' 'unsafe-inline'" :
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
    ["demo", "tailwind", "native", "mantine"].includes(kind) ? "connect-src 'none'" : "connect-src 'self'",
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

export function previewHtml(module, css, rootClass = "", importMap = null) {
  return `<!doctype html>
<html lang="en" data-preview="loading"${rootClass ? ` class="${rootClass}"` : ""}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Component preview</title>
<link rel="stylesheet" href="${css}">
${importMap ? `<script type="importmap">${JSON.stringify(importMap)}</script>\n` : ""}<script type="module" src="${module}" crossorigin="anonymous"></script>
</head>
<body><div id="preview-root"></div></body>
</html>`;
}

/**
 * A daisyUI preview document: the component's example HTML on the theme
 * surface, with the compiled daisyUI css plus the authored compat utilities
 * linked (one shared pair of stylesheets beside the documents, never inlined
 * per document) and the same readiness handshake the native previews honor:
 * html flips data-preview from "loading" to "ready" and reports its height to
 * the framing page. A ?theme= query parameter swaps the data-theme attribute
 * client-side, so the same built document serves every baked theme, gallery
 * and static site alike.
 */
export function daisyuiPreviewDocument(example, cssBase, theme = "light", title = "daisyUI preview") {
  return `<!doctype html>
<html lang="en" data-preview="loading" data-theme="${theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<script>
try {
  var t = new URLSearchParams(location.search).get("theme");
  if (t && /^[a-z0-9-]+$/.test(t)) document.documentElement.setAttribute("data-theme", t);
} catch (e) {}
</script>
<link rel="stylesheet" href="${cssBase}daisyui.css">
<link rel="stylesheet" href="${cssBase}compat.css">
<style>
body { margin: 0; background: var(--color-base-100); color: var(--color-base-content); }
#preview-root { padding: 24px; min-height: 100vh; display: flow-root; }
</style>
</head>
<body><div id="preview-root">
${example}
</div>
<script>
(function () {
  var root = document.documentElement;
  var send = function () {
    parent.postMessage({ source: "design-preview", type: "height", height: document.documentElement.scrollHeight }, "*");
  };
  var ready = function () {
    root.setAttribute("data-preview", "ready");
    send();
    setTimeout(send, 250);
  };
  window.addEventListener("load", ready);
  if (window.ResizeObserver) new ResizeObserver(send).observe(document.documentElement);
}());
</script>
</body>
</html>`;
}

/**
 * Swap the data-theme attribute of a daisyUI preview document. `theme` must
 * be one of the themes the vendored css carries (the caller checks against
 * the catalog list); a missing attribute or theme returns the doc unchanged.
 */
export function applyDaisyuiTheme(doc, theme) {
  if (!doc || !theme) return doc;
  if (!/^[a-z0-9-]+$/.test(theme)) return doc;
  return doc.replace(/(<html[^>]*?data-theme=")[^"]*(")/i, `$1${theme}$2`);
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
  // Native HTML previews are self-contained documents; preload them so
  // previewDocument stays synchronous. A missing file degrades to no preview.
  const nativeDocs = new Map();
  if (manifest) {
    for (const variants of Object.values(manifest.previews ?? {})) {
      for (const entry of Object.values(variants)) {
        if (!entry?.native || !Object.hasOwn(files, entry.native) || nativeDocs.has(entry.native)) continue;
        try {
          nativeDocs.set(entry.native, await readFile(join(directory, "public", entry.native), "utf8"));
        } catch { /* degrade to no preview */ }
      }
    }
  }
  // daisyUI preview documents are css-linked (one shared stylesheet, not one
  // inlined copy per document); preload them like the native docs. A missing
  // file degrades to no preview.
  const daisyuiDocs = new Map();
  if (manifest?.daisyuiPreviews) {
    for (const entry of Object.values(manifest.daisyuiPreviews.previews ?? {})) {
      if (!entry?.file || !Object.hasOwn(files, entry.file) || daisyuiDocs.has(entry.file)) continue;
      try {
        daisyuiDocs.set(entry.file, await readFile(join(directory, "public", entry.file), "utf8"));
      } catch { /* degrade to no preview */ }
    }
  }
  const publicManifest = manifest ? {
    version: manifest.version,
    starter: assetUrl("starter/index.html"),
    archive: { url: "/assets/starter.zip", ...files["starter.zip"] },
    packages: manifest.packages,
    vendorSnapshot: manifest.vendorSnapshot,
    // Raw bare-specifier map (asset-base-relative paths), published by the
    // build when it bundles the browser modules. null in older builds.
    importMap: manifest.importMap ?? null,
    // Vendored Slopstrap framework (zip, css, js), null when the build
    // predates the layer or the cache lacks it.
    slopstrap: manifest.slopstrap ? Object.fromEntries(
      Object.entries(manifest.slopstrap).map(([key, path]) => [
        key, { path, url: assetUrl(path), ...files[path] },
      ]),
    ) : null,
    groups: groupCounts(files),
    files: Object.entries(files).filter(([file]) => file.startsWith("starter/"))
      .map(([path, info]) => ({ path: path.slice("starter/".length), url: assetUrl(path), ...info })),
  } : null;

  function variant(slug, item) {
    if (!manifest || !validSlug(slug) || !validSlug(item.id)) return null;
    const entry = manifest.previews[slug]?.[item.id];
    // Module entries need the shared preview stylesheet; native entries are
    // self-contained documents.
    const supported = entry?.module
      ? Object.hasOwn(files, "previews/preview.css")
      : Boolean(entry?.native);
    const file = entry?.module ?? entry?.native;
    return entry?.fingerprint === variantFingerprint(item) &&
      file && Object.hasOwn(files, file) && supported ? entry : null;
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
    const acceptsGzip = /\bgzip\b/i.test(String(req.headers["accept-encoding"] || ""));
    const shouldCompress = acceptsGzip && bytes.length >= 1024 && COMPRESSIBLE_EXT.has(extension);
    let body = bytes;
    if (shouldCompress) {
      let gz = gzipAssetCache.get(etag);
      if (!gz) {
        gz = gzipSync(bytes, { level: 6 });
        if (gzipAssetCache.size >= GZIP_CACHE_LIMIT) gzipAssetCache.delete(gzipAssetCache.keys().next().value);
        gzipAssetCache.set(etag, gz);
      }
      body = gz;
    }
    const headers = {
      ...(extension === ".html" ? htmlHeaders(kind ?? "starter") : {}),
      "content-type": MIME[extension] ?? "application/octet-stream",
      "content-length": body.length,
      "x-content-type-options": "nosniff",
      // Sandboxed documents have opaque origins. Only these public, built assets need CORS.
      "access-control-allow-origin": "*",
      "cache-control": cacheHeader,
      etag,
      ...(shouldCompress ? { "content-encoding": "gzip", vary: "accept-encoding" } : {}),
      ...(file === "starter.zip" ? { "content-disposition": 'attachment; filename="designer-frontend-starter.zip"' } : {}),
    };
    res.writeHead(200, headers);
    res.end(req.method === "HEAD" ? undefined : body);
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
    thumbnailAssetById(slug, id) {
      if (!manifest || !validSlug(slug) || !validSlug(id)) return null;
      const thumbnail = manifest.previews?.[slug]?.[id]?.thumbnail;
      return thumbnail && Object.hasOwn(files, thumbnail) ? assetUrl(thumbnail) : null;
    },
    previewPath(slug, item) {
      return variant(slug, item) ? `/component/${slug}/preview/${item.id}` : null;
    },
    previewDocument(slug, item) {
      const entry = variant(slug, item);
      if (!entry) return null;
      return entry.native
        ? nativeDocs.get(entry.native) ?? null
        : previewHtml(assetUrl(entry.module), assetUrl("previews/preview.css"));
    },
    // The CSP policy kind for a preview document: module demos ban inline
    // scripts, native documents need them.
    previewKind(slug, item) {
      const entry = variant(slug, item);
      return entry ? (entry.native ? "native" : "demo") : null;
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
    // The Mantine previews: module demos that resolve react and the vendored
    // @mantine chunk through an import map embedded in the preview document.
    // react rides the starter's module re-exports so demos, the vendor chunk
    // and anything else on the origin share one react instance.
    mantineImportMap() {
      const vendor = manifest?.mantinePreviews?.vendor;
      if (!vendor) return null;
      const reactFamily = ["react", "react-dom", "react-dom/client", "react/jsx-runtime"];
      const imports = {};
      for (const specifier of reactFamily) {
        const file = manifest.importMap?.[specifier];
        if (file) imports[specifier] = assetUrl(file);
      }
      for (const [specifier, file] of Object.entries(vendor)) imports[specifier] = assetUrl(file);
      return { imports };
    },
    mantinePreviewPath(slug) {
      const layer = manifest?.mantinePreviews;
      if (!layer || !validSlug(slug)) return null;
      const entry = layer.previews?.[slug];
      return entry && Object.hasOwn(files, entry.module) && Object.hasOwn(files, layer.css)
        ? `/mantine/preview/${slug}`
        : null;
    },
    mantineThumbnailPath(slug) {
      const layer = manifest?.mantinePreviews;
      if (!layer || !validSlug(slug)) return null;
      const file = layer.previews?.[slug]?.thumbnail;
      return file && Object.hasOwn(files, file) ? assetUrl(file) : null;
    },
    mantinePreviewDocument(slug) {
      const layer = manifest?.mantinePreviews;
      if (!layer || !validSlug(slug)) return null;
      const entry = layer.previews?.[slug];
      if (!entry || !Object.hasOwn(files, entry.module) || !Object.hasOwn(files, layer.css)) return null;
      return previewHtml(assetUrl(entry.module), assetUrl(layer.css), "", this.mantineImportMap());
    },
    // The daisyUI previews: self-contained markup documents that link the one
    // shared compiled stylesheet. The built document points at its own
    // directory, so serving rewrites the link to the /daisyui/css route; an
    // optional theme name (validated against the baked theme list) swaps the
    // data-theme attribute.
    daisyuiPreviewPath(slug) {
      const layer = manifest?.daisyuiPreviews;
      if (!layer || !validSlug(slug)) return null;
      const entry = layer.previews?.[slug];
      return entry && Object.hasOwn(files, entry.file) ? `/daisyui/preview/${slug}` : null;
    },
    daisyuiThumbnailPath(slug) {
      const layer = manifest?.daisyuiPreviews;
      if (!layer || !validSlug(slug)) return null;
      const file = layer.previews?.[slug]?.thumbnail;
      return file && Object.hasOwn(files, file) ? assetUrl(file) : null;
    },
    daisyuiPreviewDocument(slug, theme) {
      const layer = manifest?.daisyuiPreviews;
      if (!layer || !validSlug(slug)) return null;
      const entry = layer.previews?.[slug];
      const doc = daisyuiDocs.get(entry?.file);
      if (!doc) return null;
      // The built documents link the stylesheets beside them; the server
      // routes serve the same bytes at /daisyui/css/<name>.css.
      const served = doc.replaceAll('href="./', 'href="/daisyui/css/');
      const next = theme && layer.themes?.includes(theme) ? theme : null;
      return next ? applyDaisyuiTheme(served, next) : served;
    },
  };
}
