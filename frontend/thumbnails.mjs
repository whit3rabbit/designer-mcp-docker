import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { htmlHeaders, previewHtml } from "../scripts/lib/frontend.mjs";
import { validAssetPath } from "../scripts/lib/frontend-paths.mjs";
import { write } from "./templates.mjs";

const origin = "http://preview.test";
const viewport = { width: 640, height: 400 };
const framing = `
  html { scrollbar-width: none; }
  body { background: #eef0f5; }
  #preview-root { box-sizing: border-box; padding: 16px; }
`;

export async function captureThumbnails(output, previews, tailwindGallery, nativePreviews = {}, mantinePreviews = null, daisyuiPreviews = null) {
  const cards = Object.entries(previews).flatMap(([slug, variants]) => {
    const preview = Object.values(variants)[0];
    return preview ? [{ url: `/capture/${slug}`, name: `components/${slug}`, preview, target: preview }] : [];
  });
  // Native HTML previews (non-React catalog entries) screenshot from their
  // self-contained documents instead of module previews.
  const nativeCards = Object.entries(nativePreviews).flatMap(([slug, variants]) => {
    if (previews[slug]) return [];
    const preview = Object.values(variants)[0];
    return preview
      ? [{ url: `/capture/${slug}`, name: `components/${slug}`, preview, target: preview,
          native: true, ready: "body > *" }]
      : [];
  });
  for (const [source, groups] of Object.entries(tailwindGallery)) {
    for (const group of groups) {
      cards.push({ url: `/${group.variants[0].preview}`, name: `tailwind/${source}/${group.slug}`, target: group,
        ready: source === "hyperui" ? "body > *" : 'html[data-preview="ready"] #preview-root > *',
        center: source === "hyperui", focus: group.slug === "application-skip-links" ? 'a[href^="#"]' : null });
    }
  }
  cards.push(...nativeCards);
  // Mantine UI demos: same module-preview pipeline, but the document carries
  // the import map that resolves react and the vendored @mantine chunk.
  const mantineByPath = new Map();
  if (mantinePreviews?.css) {
    for (const [slug, entry] of Object.entries(mantinePreviews.previews || {})) {
      const url = `/capture/mantine/${slug}`;
      mantineByPath.set(url, entry);
      cards.push({ url, name: `mantine/${slug}`, mantine: true, target: entry });
    }
  }
  // daisyUI previews: css-linked markup documents; the built doc points its
  // stylesheet link at the shared copy beside it, rewritten to that path here.
  const daisyuiByPath = new Map();
  if (daisyuiPreviews?.css) {
    for (const [slug, entry] of Object.entries(daisyuiPreviews.previews || {})) {
      const url = `/capture/daisyui/${slug}`;
      daisyuiByPath.set(url, entry);
      cards.push({ url, name: `daisyui/${slug}`, daisyui: true, target: entry,
        ready: 'html[data-preview="ready"] #preview-root > *' });
    }
  }
  if (!cards.length) return;
  const previewsByPath = new Map(cards.filter(({ preview, native, mantine, daisyui }) => preview && !native && !mantine && !daisyui).map(({ url, preview }) => [url, preview]));
  const nativesByPath = new Map(cards.filter(({ native }) => native).map(({ url, preview }) => [url, preview]));
  const daisyuiPaths = new Map(cards.filter(({ daisyui }) => daisyui).map(({ url }) => [url, daisyuiByPath.get(url)]));
  const types = { ".css": "text/css", ".mjs": "text/javascript", ".js": "text/javascript", ".woff2": "font/woff2", ".jpg": "image/jpeg" };
  const browser = await chromium.launch({
    executablePath: process.env.DESIGN_CHROMIUM_PATH || undefined,
    args: ["--disable-dev-shm-usage"],
  });
  try {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce", colorScheme: "light", serviceWorkers: "block" });
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) return route.abort();
      const preview = previewsByPath.get(url.pathname);
      if (preview) {
        const html = previewHtml(`/${preview.module}`, "/previews/preview.css")
          .replace("</head>", `<style>${framing}</style></head>`);
        return route.fulfill({ headers: htmlHeaders("demo"), body: html });
      }
      const nativePreview = nativesByPath.get(url.pathname);
      if (nativePreview) {
        // Self-contained document: just tame the scrollbar, CSP must allow
        // the inlined framework script, so serve with the native policy.
        const html = (await readFile(join(output, nativePreview.native), "utf8"))
          .replace("</head>", "<style>html { scrollbar-width: none; }</style></head>");
        return route.fulfill({ headers: htmlHeaders("native"), body: html });
      }
      const mantineEntry = mantineByPath.get(url.pathname);
      if (mantineEntry) {
        const html = previewHtml(`/${mantineEntry.module}`, `/${mantinePreviews.css}`, "", {
          imports: Object.fromEntries(
            Object.entries(mantinePreviews.vendor).map(([specifier, file]) => [specifier, `/${file}`]),
          ),
        }).replace("</head>", `<style>${framing}</style></head>`);
        return route.fulfill({ headers: htmlHeaders("mantine"), body: html });
      }
      const daisyuiEntry = daisyuiPaths.get(url.pathname);
      if (daisyuiEntry) {
        // The built documents link the shared stylesheets beside them;
        // rewrite the links to the served copies so the frame resolves them.
        const cssDir = daisyuiPreviews.css.replace(/[^/]+$/, "");
        const html = (await readFile(join(output, daisyuiEntry.file), "utf8"))
          .replaceAll('href="./', `href="/${cssDir}`)
          .replace("</head>", "<style>html { scrollbar-width: none; }</style></head>");
        return route.fulfill({ headers: htmlHeaders("native"), body: html });
      }
      const asset = url.pathname.slice(1);
      if (!validAssetPath(asset) || !/^(?:previews|starter|tailwind)\//.test(asset)) return route.abort();
      const extension = extname(asset);
      const headers = extension === ".html" ? htmlHeaders("tailwind") : { "content-type": types[extension] };
      if (!headers["content-type"]) return route.abort();
      return route.fulfill({
        headers: { ...headers, "access-control-allow-origin": "*" },
        body: await readFile(join(output, asset)),
      });
    });

    let next = 0;
    let mantineSkipped = 0;
    let daisyuiSkipped = 0;
    await Promise.all(Array.from({ length: Math.min(cards.length, 4) }, async () => {
      const page = await context.newPage();
      try {
        while (next < cards.length) {
          const card = cards[next++];
          const { url, name, target, ready, center, focus, mantine, daisyui } = card;
          try {
            await page.goto(origin + url, { waitUntil: "load", timeout: 15000 });
            await page.locator(ready ?? 'html[data-preview="ready"] #preview-root > *').first().waitFor({ state: "attached", timeout: 5000 });
            await page.evaluate(() => document.fonts.ready);
            if (center) await page.evaluate(() => {
              const body = document.body;
              const height = body.getBoundingClientRect().height;
              if (height < innerHeight / 2) body.style.marginTop = `${(innerHeight - height) / 2}px`;
            });
            if (focus) await page.locator(focus).first().focus();
            const bytes = await page.screenshot({
              type: "jpeg", quality: 84, animations: "disabled", caret: "hide", timeout: 10000,
            });
            const filename = `thumbnails/${name}.jpg`;
            await write(join(output, filename), bytes);
            target.thumbnail = filename;
          } catch (error) {
            // A Mantine demo or daisyUI preview that cannot render still ships
            // with its source page; the other layers stay build-breaking on purpose.
            if (!mantine && !daisyui) throw error;
            if (mantine) mantineSkipped++;
            if (daisyui) daisyuiSkipped++;
            delete target.thumbnail;
          }
        }
      } finally {
        await page.close();
      }
    }));
    console.log(`Captured ${cards.length - mantineSkipped - daisyuiSkipped} component thumbnails` +
      (mantineSkipped ? ` (${mantineSkipped} Mantine previews did not render)` : "") +
      (daisyuiSkipped ? ` (${daisyuiSkipped} daisyUI previews did not render)` : ""));
  } finally {
    await browser.close();
  }
}
