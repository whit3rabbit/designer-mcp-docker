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

export async function captureThumbnails(output, previews, tailwindGallery) {
  const cards = Object.entries(previews).flatMap(([slug, variants]) => {
    const preview = Object.values(variants)[0];
    return preview ? [{ url: `/capture/${slug}`, name: `components/${slug}`, preview, target: preview }] : [];
  });
  for (const [source, groups] of Object.entries(tailwindGallery)) {
    for (const group of groups) {
      cards.push({ url: `/${group.variants[0].preview}`, name: `tailwind/${source}/${group.slug}`, target: group,
        ready: source === "hyperui" ? "body > *" : 'html[data-preview="ready"] #preview-root > *',
        center: source === "hyperui", focus: group.slug === "application-skip-links" ? 'a[href^="#"]' : null });
    }
  }
  if (!cards.length) return;
  const previewsByPath = new Map(cards.filter(({ preview }) => preview).map(({ url, preview }) => [url, preview]));
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
    await Promise.all(Array.from({ length: Math.min(cards.length, 4) }, async () => {
      const page = await context.newPage();
      try {
        while (next < cards.length) {
          const { url, name, target, ready, center, focus } = cards[next++];
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
        }
      } finally {
        await page.close();
      }
    }));
    console.log(`Captured ${cards.length} component thumbnails`);
  } finally {
    await browser.close();
  }
}
