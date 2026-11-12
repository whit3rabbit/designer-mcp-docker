import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

const root = fileURLToPath(new URL("../", import.meta.url));
const scratch = await mkdtemp(join(tmpdir(), "designer-preview-test-"));
const errors = new Set();
let gallery;
let staticServer;
let browser;

async function startGallery() {
  gallery = spawn(process.execPath, ["scripts/preview.mjs"], {
    cwd: root,
    env: { ...process.env, PORT: "0", HOST: "127.0.0.1", DESIGN_CACHE_DIR: join(root, "bake"), DESIGN_CATALOG_WAIT_MS: "5000" },
    stdio: ["ignore", "pipe", "inherit"],
  });
  return new Promise((resolve, reject) => {
    gallery.once("error", reject);
    gallery.once("exit", (code) => reject(new Error(`Gallery exited with status ${code}`)));
    gallery.stdout.on("data", (chunk) => {
      const url = chunk.toString().match(/design-preview on (http:\/\/127\.0\.0\.1:\d+)/)?.[1];
      if (url) resolve(url);
    });
  });
}

async function monitor(origin, options = {}) {
  const context = await browser.newContext({ serviceWorkers: "block", ...options });
  await context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (!["http:", "https:", "ws:", "wss:"].includes(url.protocol) || url.origin === origin) return route.continue();
    errors.add(`Off-origin request: ${url.href}`);
    return route.abort();
  });
  await context.addInitScript(() => {
    addEventListener("securitypolicyviolation", (event) => {
      console.error("Offline policy blocked", event.violatedDirective, event.blockedURI);
    });
  });
  context.on("page", (page) => {
    page.on("pageerror", (error) => errors.add(`${page.url()}: ${error.message}`));
    page.on("requestfailed", (request) => {
      // Replacing an iframe or navigating a page can cancel pending local work.
      if (request.failure()?.errorText !== "net::ERR_ABORTED") errors.add(`Request failed: ${request.url()}`);
    });
    page.on("response", (response) => {
      if (response.status() >= 400) errors.add(`HTTP ${response.status()}: ${response.url()}`);
    });
    page.on("console", (message) => {
      if (message.text().startsWith("Offline policy blocked")) errors.add(`${page.url()}: ${message.text()}`);
    });
  });
  return context;
}

async function localStarter(origin, archive) {
  const response = await fetch(new URL(archive.url, origin));
  assert.equal(response.status, 200);
  const file = join(scratch, "starter.zip");
  const directory = join(scratch, "starter");
  await writeFile(file, Buffer.from(await response.arrayBuffer()));
  execFileSync("unzip", ["-q", file, "-d", directory]);
  const mime = { ".html": "text/html", ".mjs": "text/javascript", ".css": "text/css", ".woff2": "font/woff2" };
  staticServer = createServer(async (req, res) => {
    const { pathname } = new URL(req.url, "http://localhost");
    const file = resolve(directory, pathname === "/" ? "index.html" : `.${pathname}`);
    if (!file.startsWith(directory + "/")) return res.writeHead(404).end();
    try {
      const bytes = await readFile(file);
      res.writeHead(200, { "content-type": mime[extname(file)] ?? "application/octet-stream" })
        .end(bytes);
    } catch {
      if (!res.headersSent) res.writeHead(404);
      res.end();
    }
  });
  staticServer.listen(0, "127.0.0.1");
  await once(staticServer, "listening");
  return `http://127.0.0.1:${staticServer.address().port}`;
}

async function checkFonts(frame, fonts) {
  await expect.poll(() => frame.locator("html").evaluate(async (_, families) => {
    const faces = await Promise.all(families.map((family) => document.fonts.load(`16px "${family}"`)));
    return families.filter((name) => !faces.flat().some((face) => face.family === name));
  }, fonts), { message: "Wait for the local heading and body font faces" }).toEqual([]);
}

try {
  const origin = new URL(process.env.GALLERY_URL || await startGallery()).origin;
  browser = await chromium.launch();
  const context = await monitor(origin, { permissions: ["clipboard-read", "clipboard-write"] });
  const page = await context.newPage();
  const json = async (path) => {
    const response = await context.request.get(origin + path);
    assert.equal(response.status(), 200, path);
    return response.json();
  };

  for (const path of ["/", "/components", "/presets", "/presets/patterns", "/templates", "/assets"]) {
    await page.goto(origin + path);
  }
  await expect(page.getByRole("link", { name: "Download starter ZIP" })).toBeVisible();

  await page.goto(origin + "/components");
  const card = page.getByRole("link", { name: /^Agent card/ });
  await expect(card).toBeVisible();
  await expect.poll(() => card.locator("img").evaluate((image) => image.naturalWidth)).toBe(640);
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: /^Voice \d+$/ }).click();
  await page.getByRole("searchbox").fill("voice orb");
  await expect(page.locator(".browse-card:visible")).toHaveCount(1);
  await expect(page.getByRole("link", { name: /^Voice orb/ })).toBeVisible();

  await page.goto(origin + "/presets/patterns");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("searchbox").fill("radial teal glow");
  const preset = page.getByRole("button", { name: /^Teal Glow/i });
  await expect(preset).toBeVisible();
  assert.equal(await preset.locator(".swatch").evaluate((swatch) => getComputedStyle(swatch).backgroundSize), "100% 100%");
  await preset.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Copy code" }).click();
  assert.match(await page.evaluate(() => navigator.clipboard.readText()), /radial-gradient/);
  await page.keyboard.press("Escape");
  await expect(preset).toBeFocused();

  await page.goto(origin + "/presets/liquid-glass");
  const glass = page.getByRole("button", { name: /^iOS Clear/ });
  const cardFilter = await glass.locator(".liquid-glass").evaluate((sample) => getComputedStyle(sample).backdropFilter);
  assert.equal(cardFilter, "blur(18px) saturate(1.88) contrast(1.08)");
  await glass.click();
  const glassDialog = page.getByRole("dialog", { name: "iOS Clear" });
  const scene = glassDialog.locator(".glass-scene");
  const withGlass = await scene.screenshot({ animations: "disabled" });
  await glassDialog.getByRole("checkbox", { name: "Show effect" }).uncheck();
  await expect(scene.locator(".liquid-glass")).toBeHidden();
  assert.notDeepEqual(await scene.screenshot({ animations: "disabled" }), withGlass);
  await glassDialog.getByRole("button", { name: "Copy CSS" }).click();
  assert.match(await page.evaluate(() => navigator.clipboard.readText()), /--glass-backdrop: blur\(18px\) saturate\(188%\) contrast\(108%\)/);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /^Dark \d+$/ }).click();
  await expect(glass).toBeHidden();
  await expect(page.getByRole("button", { name: /^Graphite/ })).toBeVisible();

  await page.goto(origin + "/tailwind");
  await page.getByRole("link", { name: /^Accordions Application/ }).click();
  const hyperui = page.locator("iframe").contentFrame();
  await hyperui.getByText("What are the basic features?", { exact: true }).click();
  await expect(hyperui.locator("details[open]")).toHaveCount(1);
  await page.getByRole("link", { name: "1 dark", exact: true }).click();
  await expect(page.locator("iframe")).toHaveAttribute("src", /1-dark\.html$/);
  await page.goto(origin + "/tailwind/hyperui/application-charts");
  await expect.poll(() => page.locator("iframe").contentFrame().locator("canvas").first().evaluate(
    (canvas) => Boolean(window.Chart?.getChart(canvas)), { timeout: 3000 },
  )).toBe(true);

  await page.goto(origin + "/tailwind/shadcn");
  await page.getByRole("link", { name: /^Dialog / }).click();
  const shadcn = page.locator("iframe").contentFrame();
  await shadcn.getByRole("button", { name: "Open dialog" }).click();
  await expect(shadcn.getByRole("dialog", { name: "Project settings" })).toBeVisible();
  console.log("Verified thumbnail grids, pattern filtering and copy, and both Tailwind catalogs");

  const { components } = await json("/api/components");
  const batches = components.flatMap(({ slug, variants }) => variants.map(({ id }) => ({ slug, id })));
  assert.ok(batches.length > 0);
  let index = 0;
  const failures = [];
  await Promise.all(Array.from({ length: 4 }, async () => {
    const worker = await context.newPage();
    try {
      while (index < batches.length) {
        const { slug, id } = batches[index++];
        try {
          const response = await worker.goto(`${origin}/component/${slug}/preview/${id}`, { waitUntil: "domcontentloaded" });
          assert.equal(response.status(), 200);
          await expect(worker.locator("html")).toHaveAttribute("data-preview", "ready", { timeout: 5000 });
          assert.ok(await worker.locator("#preview-root").evaluate((root) => root.childNodes.length));
        } catch (error) {
          failures.push(`${slug}/${id}: ${error.message.split("\n")[0]}`);
        }
      }
    } finally {
      await worker.close();
    }
  }));
  assert.deepEqual(failures, []);
  console.log(`Mounted all ${batches.length} component demos`);

  await page.goto(origin + "/component/voice-orb");
  const preview = page.locator("#preview-slot iframe");
  await expect(preview).toHaveAttribute("sandbox", "allow-scripts");
  await expect(preview.contentFrame().locator("html")).toHaveAttribute("data-preview", "ready");
  const canvas = preview.contentFrame().locator("canvas").first();
  await expect(canvas).toBeVisible();
  const initialPixels = await canvas.evaluate((canvas) => canvas.toDataURL());
  await expect.poll(() => canvas.evaluate((canvas) => canvas.toDataURL())).not.toBe(initialPixels);
  await page.getByRole("button", { name: "Waves", exact: true }).click();
  await expect(preview).toHaveAttribute("src", /voice-orb-wave$/);
  await expect(preview.contentFrame().locator("html")).toHaveAttribute("data-preview", "ready");
  await expect(preview).toHaveCount(1);
  await page.locator(".panel.on").getByRole("button", { name: "Copy" }).click();
  await expect(page.locator(".panel.on").getByRole("button", { name: "Copied" })).toBeVisible();
  assert.match(await page.evaluate(() => navigator.clipboard.readText()), /export default function Demo/);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(origin + "/component/mic-picker");
  const microphone = page.locator("#preview-slot iframe").contentFrame();
  await expect(microphone.getByText("Sample devices and simulated levels")).toBeVisible();
  await microphone.getByRole("button", { name: /Shure MV7/ }).click();
  await microphone.getByRole("option", { name: /AirPods Pro/ }).click();
  await expect(microphone.getByRole("button", { name: /AirPods Pro/ })).toBeVisible();
  assert.ok(await microphone.locator("html").evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches));
  assert.equal(await microphone.locator("html").evaluate(() => getComputedStyle(document.body).animationDuration), "1e-05s");
  await page.emulateMedia({ reducedMotion: "no-preference" });

  const { systems } = await json("/api/templates");
  assert.ok(systems.length > 0);
  for (const { slug } of systems) {
    const { manifest } = await json(`/api/template/${slug}`);
    const { heading, body } = manifest.typography;
    const fonts = [...new Set([heading.family, body.family])];
    await page.goto(`${origin}/template/${slug}`);
    await page.getByRole("button", { name: "Preview Landing" }).click();
    const frame = page.locator("#template-frame iframe");
    await expect(frame.contentFrame().locator("h1").first()).toBeVisible();
    await checkFonts(frame.contentFrame(), fonts);
    await page.getByRole("button", { name: "Preview Deck" }).click();
    const deck = frame.contentFrame().locator("deck-stage");
    await expect(deck.locator("[data-deck-active]")).toBeVisible();
    await checkFonts(frame.contentFrame(), fonts);
    const active = deck.locator("[data-deck-active]");
    const first = await active.evaluate((slide) => [...slide.parentElement.children].indexOf(slide));
    await frame.click({ position: { x: 180, y: 120 } });
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => active.evaluate((slide) => [...slide.parentElement.children].indexOf(slide))).toBe(first + 1);
  }
  console.log(`Loaded local fonts and navigated decks in all ${systems.length} templates`);

  const manifest = await json("/assets/manifest.json");
  const starterOrigin = await localStarter(origin, manifest.archive);
  const starterContext = await monitor(starterOrigin);
  const starter = await starterContext.newPage();
  await starter.goto(starterOrigin);
  await starter.getByRole("button", { name: "Open example" }).click();
  await expect(starter.getByRole("dialog", { name: "Local dialog" })).toBeVisible();
  const gsap = await starter.evaluate(async () => {
    const { gsap } = await import("gsap");
    const { ScrollTrigger } = await import("gsap/ScrollTrigger");
    gsap.registerPlugin(ScrollTrigger);
    return gsap.version;
  });
  assert.equal(gsap, manifest.packages.find(({ name }) => name === "gsap").version);
  assert.deepEqual([...errors], []);
  console.log("Variant switching, source copy, canvas animation, reduced motion, and the extracted starter passed with zero off-origin requests");
} finally {
  await browser?.close();
  staticServer?.close();
  gallery?.kill();
  await rm(scratch, { recursive: true, force: true });
}
