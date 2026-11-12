import assert from "node:assert/strict";
import { sha256 } from "./lib/frontend-paths.mjs";

const origin = process.argv[2] ?? "http://127.0.0.1:8787";
const get = (path) => fetch(new URL(path, origin), { redirect: "error", signal: AbortSignal.timeout(10000) });
const checked = async (path, mime) => {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  if (mime) assert.match(response.headers.get("content-type"), mime, path);
  return response;
};

await checked("/healthz", /json/);
const page = await checked("/", /html/);
assert.match(page.headers.get("content-security-policy"), /default-src 'none'/);
assert.match(await page.text(), /href="\/assets"/);

const assets = await checked("/assets", /html/);
assert.match(await assets.text(), /Download starter ZIP/);
const components = await (await checked("/components", /html/)).text();
const thumbnail = components.match(/<img src="([^"]+\/thumbnail\/[^"]+)"/)?.[1];
assert.ok(thumbnail, "Component grid should include a thumbnail");
await checked(thumbnail, /image\/jpeg/);
const patterns = await (await checked("/presets/patterns", /html/)).text();
assert.match(patterns, /background-size: 100% 100%/);
const glass = await (await checked("/presets/liquid-glass", /html/)).text();
assert.match(glass, /data-material style="[^"]*--glass-backdrop: blur\(18px\)/);
assert.match(glass, /Show effect/);
const hyperui = await (await checked("/tailwind", /html/)).text();
assert.match(hyperui, /Search HyperUI components/);
assert.match(await (await checked("/tailwind/shadcn", /html/)).text(), /Search shadcn\/ui components/);
for (const route of ["/tailwind/hyperui/application-accordions", "/tailwind/shadcn/dialog"]) {
  const detail = await (await checked(route, /html/)).text();
  const url = detail.match(/<iframe sandbox="allow-scripts" src="([^"]+)"/)?.[1];
  assert.ok(url, route);
  const frame = await checked(url, /html/);
  assert.match(frame.headers.get("content-security-policy"), /connect-src 'none'.*sandbox allow-scripts/);
}
const manifest = await (await checked("/assets/manifest.json", /json/)).json();
const first = (await (await checked("/api/component/voice-orb", /json/)).json()).variants[0];
const preview = await checked(`/component/voice-orb/preview/${first.id}`, /html/);
assert.match(preview.headers.get("content-security-policy"), /sandbox allow-scripts/);
assert.doesNotMatch(preview.headers.get("content-security-policy"), /unsafe-eval/);
const html = await preview.text();
const modulePath = html.match(/<script type="module" src="([^"]+)"/)[1];
const module = await checked(modulePath, /javascript/);
assert.match(module.headers.get("cache-control"), /immutable/);
assert.equal(module.headers.get("access-control-allow-origin"), "*");
await checked(html.match(/<link rel="stylesheet" href="([^"]+)"/)[1], /text\/css/);

const template = await (await checked("/template/nocturne", /html/)).text();
const deckPath = template.match(/data-preview="([^"]+Deck\.dc\.html)"/)[1];
const deck = await checked(deckPath, /html/);
assert.match(deck.headers.get("content-security-policy"), /unsafe-eval.*sandbox allow-scripts/);
const support = await (await checked(new URL("./support.js", new URL(deckPath, origin)), /javascript/)).text();
assert.doesNotMatch(support, /https:\/\/unpkg\.com/);

const archive = await checked(manifest.archive.url, /application\/zip/);
const bytes = Buffer.from(await archive.arrayBuffer());
assert.equal(bytes.subarray(0, 4).toString("hex"), "504b0304");
assert.equal(bytes.length, manifest.archive.bytes);
assert.equal(sha256(bytes), manifest.archive.sha256);
const font = manifest.files.find(({ path }) => path.endsWith(".woff2"));
const fontBytes = Buffer.from(await (await checked(font.url, /font\/woff2/)).arrayBuffer());
assert.equal(sha256(fontBytes), font.sha256);

for (const path of [
  `/assets/${manifest.version}/unknown.mjs`,
  `/assets/${manifest.version}/starter/%2e%2e%2fmanifest.json`,
  "/component/voice-orb/preview/missing",
]) {
  assert.equal((await get(path)).status, 404, path);
}
console.log("Offline gallery, preview, deck, manifest, starter ZIP and missing asset checks passed.");
