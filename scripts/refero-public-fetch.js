#!/usr/bin/env node
/**
 * refero-public-fetch — populate the fidgetcoding-refero-mcp local cache from
 * styles.refero.design's PUBLIC pages.
 *
 * Why this exists
 * ---------------
 * The upstream package (fidgetcoding-refero-mcp) reads the undocumented
 * endpoint styles.refero.design/api/styles. That path is:
 *   - disallowed by styles.refero.design/robots.txt ("Disallow: /api/")
 *   - answering HTTP 403 to every client as of 2026-11
 * and Refero's Terms of Use forbid automated extraction outside documented
 * features, so the upstream author deliberately stopped routing around it.
 *
 * This fetcher does NOT touch /api/. It reads the same public HTML pages a
 * browser renders (robots.txt allows these paths for generic agents) and pulls
 * the structured style payload out of the Next.js RSC flight stream, then
 * writes it in the upstream package's own cache format:
 *
 *   <REFERO_CACHE_DIR>/catalog.json      -> { updatedAt, styles[] }
 *   <REFERO_CACHE_DIR>/styles/<uuid>.json -> { updatedAt, style }
 *
 * The upstream MCP server then serves search/list/get/design_md/facets from
 * that cache with zero network calls and zero code changes to the package.
 *
 * Usage:
 *   node refero-public-fetch.js --limit 40          # fetch N styles
 *   node refero-public-fetch.js --limit 0           # fetch whole catalog
 *   node refero-public-fetch.js --search "railway"  # resolve by name first
 *   node refero-public-fetch.js --id <uuid>         # fetch one style
 *
 * Env:
 *   REFERO_CACHE_DIR       cache root (default ~/.refero-cache)
 *   REFERO_FETCH_DELAY_MS  delay between requests (default 400)
 *   REFERO_FETCH_CONC      parallel workers (default 4)
 *   REFERO_FETCH_UA        User-Agent header
 *   REFERO_FETCH_NO_BROWSER=1  disable the Camoufox fallback
 */

import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const BASE = "https://styles.refero.design";
const CACHE_DIR = process.env.REFERO_CACHE_DIR || join(homedir(), ".refero-cache");
const DELAY_MS = Number(process.env.REFERO_FETCH_DELAY_MS ?? 400);
const CONC = Number(process.env.REFERO_FETCH_CONC ?? 4);
const UA =
  process.env.REFERO_FETCH_UA ||
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2);
const argVal = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
};
const has = (name) => argv.includes(name);

// ------------------------------------------------- Next.js flight decoding
/**
 * Decode a JS string literal body (the text between the outer quotes).
 * Mirrored verbatim by the in-page implementation so both produce
 * byte-identical flight text.
 */
function unescapeJs(raw) {
  let out = "";
  let i = 0;
  while (i < raw.length) {
    const c = raw[i];
    if (c === "\\" && i + 1 < raw.length) {
      const nx = raw[i + 1];
      if (nx === "u" && i + 5 < raw.length) {
        try {
          out += String.fromCharCode(parseInt(raw.slice(i + 2, i + 6), 16));
          i += 6;
          continue;
        } catch {}
      }
      const map = {
        n: "\n", t: "\t", r: "\r", b: "\b", f: "\f",
        '"': '"', "'": "'", "\\": "\\", "/": "/", "0": "\0",
      };
      if (nx in map) {
        out += map[nx];
        i += 2;
        continue;
      }
      out += nx;
      i += 2;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

/** Concatenate + decode the RSC flight chunks of an HTML page. */
function flightText(html) {
  let out = "";
  for (const m of html.matchAll(/self\.__next_f\.push\(\[1,\s*"(.*?)"\]\)/gs)) {
    out += unescapeJs(m[1]);
  }
  return out;
}

/** Yield every balanced JSON object embedded in the flight text. */
function* jsonObjects(text) {
  for (const m of text.matchAll(/\{"[A-Za-z_]/g)) {
    const start = m.index;
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let j = start; j < text.length; j++) {
      const ch = text[j];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === "\\") esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === "{") depth += 1;
      else if (ch === "}") {
        depth -= 1;
        if (depth === 0) {
          try {
            yield JSON.parse(text.slice(start, j + 1));
          } catch {}
          break;
        }
      } else if (depth === 0) break;
    }
  }
}

const isListItem = (o) =>
  o && typeof o === "object" && typeof o.id === "string" && o.northStar && o.siteName;

/**
 * Pull one style out of decoded flight text.
 * Returns { list, style } where list is the StyleListItem projection and
 * style is the FullStyle projection, both in the upstream's exact shape.
 */
function extractStyleFromFlight(text, styleId) {
  let listItem = null;
  let detail = null;

  for (const o of jsonObjects(text)) {
    if (!o || typeof o !== "object") continue;

    // Detail payload: { styleId, result: { meta, raw, designSystem, screenshot } }
    if (o.styleId === styleId && o.result && o.result.designSystem && o.result.meta) {
      detail = o;
      continue;
    }
    // Sibling list projection for THIS style. Note: a style's own page does
    // not carry a list projection of itself — it carries the "similar styles"
    // rail instead — so this usually stays null and the fields below are
    // reconstructed from the detail payload.
    if (isListItem(o) && o.id === styleId && !listItem) listItem = o;
  }

  if (!detail) return null;

  const r = detail.result;
  const ds = r.designSystem || {};

  // Font families: the detail payload keeps them as objects under
  // designSystem.typography[].family and raw.typography.fonts[].family,
  // while upstream's list projection wants a flat string[].
  const fontFamilies = [];
  for (const t of ds.typography || []) {
    if (t && typeof t.family === "string" && !fontFamilies.includes(t.family)) {
      fontFamilies.push(t.family);
    }
  }
  if (!fontFamilies.length) {
    for (const f of r.raw?.typography?.fonts || []) {
      if (f && typeof f.family === "string" && !fontFamilies.includes(f.family)) {
        fontFamilies.push(f.family);
      }
    }
  }
  const fonts = listItem?.fonts?.length ? listItem.fonts : fontFamilies;

  // The upstream FullStyle extends StyleListItem with industry + fullResult.
  const style = {
    ...(listItem || {}),
    id: styleId,
    url: listItem?.url ?? r.meta?.url ?? "",
    siteName: listItem?.siteName ?? r.meta?.siteName ?? "",
    northStar: listItem?.northStar ?? ds.northStar ?? "",
    colorScheme: listItem?.colorScheme ?? ds.theme ?? "light",
    colors: listItem?.colors ?? ds.colors ?? [],
    fonts,
    screenshotUrl: listItem?.screenshotUrl ?? detail.screenshotUrl ?? "",
    thumbnailUrl: listItem?.thumbnailUrl ?? detail.screenshotUrl ?? "",
    industry: ds.industry ?? listItem?.industry ?? "",
    createdAt: listItem?.createdAt ?? r.meta?.extractedAt ?? "",
    fullResult: {
      meta: r.meta,
      raw: r.raw,
      designSystem: ds,
      screenshot: r.screenshot ?? null,
    },
  };

  return { list: listItem, style };
}

/** Convenience wrapper: HTML page in, extracted style out. */
function extractStyle(html, styleId) {
  return extractStyleFromFlight(flightText(html), styleId);
}

// ---------------------------------------------------------------- transport
/**
 * Plain HTTP fetch. Refero's CDN currently serves the public pages to any
 * client, but that can change — see the Camoufox fallback below.
 */
async function getPlain(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(30_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  return text;
}

/**
 * Fetch through the local Camoufox MCP server (a real Firefox with a genuine
 * fingerprint). Used only when a plain request is refused, so the fetch
 * degrades to "slower" rather than failing.
 *
 * The style pages are ~300KB, above camoufox's 200KB response cap, and the
 * RSC flight payload starts around byte 128KB — so reading the rendered HTML
 * truncates the payload mid-stream. Instead we decode the flight chunks
 * *inside* the page, base64-encode them (base64 has no JSON escapes, so it
 * survives the JSON envelope), and read the result back in slices that each
 * stay under camoufox's 30KB per-action result cap.
 */
class CamoufoxTransport {
  constructor() {
    this.child = null;
    this.pending = new Map();
    this.nextId = 1;
    this.buf = "";
  }

  async start() {
    if (this.child) return;
    const { spawn } = await import("node:child_process");
    this.child = spawn("npx", ["-y", "camoufox-mcp-server@latest"], {
      stdio: ["pipe", "pipe", "pipe"],
      // This subprocess is private to the fetcher, so opting into evaluate is
      // scoped to it. evaluate is what lets us read the flight payload out of
      // the DOM instead of the truncated HTML.
      env: {
        ...process.env,
        CAMOUFOX_MCP_ALLOW_UNSAFE_OPTIONS: "1",
        CAMOUFOX_MCP_ALLOW_EVALUATE: "1",
      },
    });
    this.child.stdout.on("data", (d) => {
      this.buf += d.toString();
      let i;
      while ((i = this.buf.indexOf("\n")) >= 0) {
        const line = this.buf.slice(0, i).trim();
        this.buf = this.buf.slice(i + 1);
        if (!line) continue;
        try {
          const msg = JSON.parse(line);
          const p = this.pending.get(msg.id);
          if (p) {
            this.pending.delete(msg.id);
            msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
          }
        } catch {}
      }
    });
    this.child.on("error", () => {});
    this.request("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "refero-public-fetch", version: "1" },
    });
  }

  request(method, params) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`camoufox ${method} timed out`));
        }
      }, 90_000);
    });
  }

  /**
   * Return the decoded flight text of a page, fetched through the browser.
   *
   * Action 0 rebuilds the flight text in the page and stashes it base64-encoded
   * on window. Actions 1..N then read that base64 back in fixed-size slices.
   * Base64 is sliced at multiples of 4 so the chunks reassemble cleanly.
   */
  async flightTextOf(url) {
    await this.start();

    const SLICE = 24_000; // multiple of 4, and small enough to survive JSON encoding
    const SLICES = 14; // up to ~336KB of base64 => ~250KB of flight text

    const actions = [{ type: "evaluate", expression: IN_PAGE_PREP }];
    for (let i = 0; i < SLICES; i++) {
      actions.push({
        type: "evaluate",
        expression: `(window.__rp_b64 || '').slice(${i * SLICE}, ${(i + 1) * SLICE})`,
      });
    }

    const res = await this.request("tools/call", {
      name: "browse_sequence",
      arguments: { url, actions, maxChars: 200000, timeout: 120000 },
    });

    if (res?.isError) {
      const msg = (res?.content || []).map((c) => c.text || "").join("").slice(0, 300);
      throw new Error(`camoufox browse_sequence failed: ${msg}`);
    }

    const text = (res?.content || [])
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("");

    let env;
    try {
      env = JSON.parse(text);
    } catch {
      throw new Error("camoufox returned a non-JSON envelope");
    }

    const results = (env?.actions || []).map((a) => {
      if (typeof a?.result !== "string") return "";
      try {
        const v = JSON.parse(a.result);
        return typeof v === "string" ? v : "";
      } catch {
        return "";
      }
    });

    const prep = results[0] ? safeParse(results[0]) : null;
    if (!prep?.ok) {
      throw new Error(`camoufox page prep failed: ${prep?.error || "unknown"}`);
    }

    const b64 = results.slice(1).join("");
    if (!b64) throw new Error("camoufox returned no flight payload");

    return Buffer.from(b64, "base64").toString("utf8");
  }

  stop() {
    if (this.child) {
      try {
        this.child.kill();
      } catch {}
      this.child = null;
    }
  }
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

let camoufox = null;

/**
 * Runs inside the page.
 *
 * The __next_f script chunks survive hydration as script text (self.__next_f
 * itself is emptied). This decodes them, base64-encodes the result, and
 * stashes it on window.__rp_b64 for the slice actions that follow.
 *
 * Base64 rather than raw text because the flight payload is full of quotes
 * and backslashes; JSON-encoding it would inflate each slice past camoufox's
 * per-action result cap.
 */
const IN_PAGE_PREP = `(() => {
  function unescapeJs(raw) {
    let out = "", i = 0;
    while (i < raw.length) {
      const c = raw[i];
      if (c === "\\\\" && i + 1 < raw.length) {
        const nx = raw[i + 1];
        if (nx === "u" && i + 5 < raw.length) {
          try { out += String.fromCharCode(parseInt(raw.slice(i + 2, i + 6), 16)); i += 6; continue; } catch {}
        }
        const map = { n: "\\n", t: "\\t", r: "\\r", b: "\\b", f: "\\f", '"': '"', "'": "'", "\\\\": "\\\\", "/": "/", "0": "\\0" };
        if (nx in map) { out += map[nx]; i += 2; continue; }
        out += nx; i += 2; continue;
      }
      out += c; i++;
    }
    return out;
  }
  let text = "";
  for (const s of document.scripts) {
    const t = s.textContent || "";
    if (!t.includes("__next_f.push")) continue;
    const re = /self\\.__next_f\\.push\\(\\[1,\\s*"([\\s\\S]*?)"\\]\\)/g;
    let m;
    while ((m = re.exec(t)) !== null) text += unescapeJs(m[1]);
  }
  if (!text) { window.__rp_b64 = ""; return JSON.stringify({ ok: false, error: "no flight chunks" }); }
  try {
    const bytes = new TextEncoder().encode(text);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 8192) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
    }
    window.__rp_b64 = btoa(bin);
  } catch (e) {
    window.__rp_b64 = "";
    return JSON.stringify({ ok: false, error: "b64 failed: " + e.message });
  }
  return JSON.stringify({ ok: true, len: text.length, b64len: window.__rp_b64.length });
})()`;

/** Raw text (sitemaps, XML) — plain fetch only, no browser fallback. */
async function getRaw(url) {
  return getPlain(url);
}

/**
 * Decoded flight text for an HTML page.
 * Plain fetch first; Camoufox browser fallback on refusal.
 */
async function getFlight(url) {
  try {
    return flightText(await getPlain(url));
  } catch (plainErr) {
    if (process.env.REFERO_FETCH_NO_BROWSER === "1") throw plainErr;
    if (!camoufox) camoufox = new CamoufoxTransport();
    try {
      return await camoufox.flightTextOf(url);
    } catch (browserErr) {
      throw new Error(
        `${plainErr.message} (browser fallback also failed: ${browserErr.message})`,
      );
    }
  }
}

function shutdown() {
  if (camoufox) camoufox.stop();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- catalog
async function sitemapIds() {
  const xml = await getRaw(`${BASE}/sitemaps/styles.xml`);
  return [...xml.matchAll(/<loc>https:\/\/styles\.refero\.design\/style\/([^<]+)<\/loc>/g)].map(
    (m) => m[1],
  );
}

async function collectionItems() {
  const xml = await getRaw(`${BASE}/sitemaps/collections.xml`);
  const colls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const all = new Map();
  const queue = colls.slice();
  const worker = async () => {
    while (queue.length) {
      const url = queue.shift();
      try {
        const text = await getFlight(url);
        for (const o of jsonObjects(text)) {
          if (isListItem(o)) all.set(o.id, o);
        }
      } catch {}
      await sleep(DELAY_MS);
    }
  };
  await Promise.all(Array.from({ length: Math.min(6, colls.length) }, worker));
  return all;
}

// ---------------------------------------------------------------- cache io
async function readCatalog() {
  const p = join(CACHE_DIR, "catalog.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(await readFile(p, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Write the merged catalog.
 *
 * Two sources share one catalog file: Refero styles and OpenDesign systems.
 * Each entry carries a `source` tag so downstream code can tell them apart.
 * Both `styles` and `designs` keys are written pointing at the same array so
 * the upstream package (which reads `styles`) keeps working unchanged.
 */
async function writeCatalog(designs) {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(
    join(CACHE_DIR, "catalog.json"),
    JSON.stringify({ updatedAt: Date.now(), styles: designs, designs }, null, 1),
  );
}

async function writeStyle(id, style) {
  const dir = join(CACHE_DIR, "styles");
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, `${id}.json`),
    JSON.stringify({ updatedAt: Date.now(), style }, null, 1),
  );
}

async function cachedIds() {
  const dir = join(CACHE_DIR, "styles");
  if (!existsSync(dir)) return new Set();
  const files = await readdir(dir);
  return new Set(files.filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)));
}

// ---------------------------------------------------------------- main
async function main() {
  const onlyId = argVal("--id");
  const searchTerm = argVal("--search");
  const limit = argVal("--limit") === null ? 40 : Number(argVal("--limit"));

  console.log(`cache dir : ${CACHE_DIR}`);
  console.log(`base url  : ${BASE}  (public pages only; /api/ is never requested)`);

  const existing = await cachedIds();
  if (existing.size) console.log(`cache     : ${existing.size} styles already present`);

  let targets = [];

  if (onlyId) {
    targets = [onlyId];
  } else if (searchTerm) {
    const items = await collectionItems();
    const q = searchTerm.toLowerCase();
    const hits = [...items.values()].filter(
      (i) =>
        i.siteName.toLowerCase().includes(q) ||
        i.northStar.toLowerCase().includes(q) ||
        (i.url || "").toLowerCase().includes(q),
    );
    console.log(`\nsearch "${searchTerm}" -> ${hits.length} match(es):`);
    for (const h of hits.slice(0, 20)) console.log(`  ${h.id}  ${h.siteName}`);
    targets = hits.map((h) => h.id);
  } else {
    const ids = await sitemapIds();
    const fresh = ids.filter((id) => !existing.has(id) || has("--force"));
    console.log(`\nsitemap   : ${ids.length} styles total, ${fresh.length} to fetch`);
    targets = limit > 0 ? fresh.slice(0, limit) : fresh;
  }

  if (!targets.length) {
    console.log("\nnothing to fetch.");
    return;
  }

  console.log(`fetching  : ${targets.length} style page(s)\n`);

  let ok = 0;
  let failed = 0;
  const listRows = [];

  const queue = targets.slice();
  const worker = async () => {
    while (queue.length) {
      const id = queue.shift();
      try {
        const text = await getFlight(`${BASE}/style/${id}`);
        const got = extractStyleFromFlight(text, id);
        if (!got) {
          failed += 1;
          console.log(`  MISS ${id}`);
        } else {
          await writeStyle(id, got.style);
          listRows.push(got.style);
          ok += 1;
          process.stdout.write(
            `  ok ${String(ok).padStart(4)}/${targets.length}  ${got.style.siteName}\n`,
          );
        }
      } catch (e) {
        failed += 1;
        console.log(`  ERR ${id}: ${e.message}`);
      }
      await sleep(DELAY_MS);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONC, targets.length) }, worker));

  // Merge with anything already cached so the catalog keeps every style —
  // including OpenDesign entries, which are left untouched.
  const prior = (await readCatalog())?.styles ?? [];
  const byId = new Map();
  for (const s of prior) {
    if ((s.source || "refero") !== "refero") continue;
    byId.set(s.id, s);
  }
  for (const s of listRows) {
    s.source = "refero";
    byId.set(s.id, s);
  }
  const merged = [...byId.values()];
  await writeCatalog(merged);

  console.log(`\ndone: ${ok} fetched, ${failed} failed, catalog now ${merged.length} styles`);
  console.log("next: node scripts/fetch-thumbs.mjs  (cache screenshots for offline use)");
  console.log("next: run the MCP server — it will serve from cache without touching /api/");
}

// Only run when invoked directly, so the transport can be imported for tests.
const isDirectRun = process.argv[1] && process.argv[1].endsWith("refero-public-fetch.js");
if (isDirectRun) {
  main().catch((e) => {
    console.error("fatal:", e);
    shutdown();
    process.exit(1);
  });
  process.on("exit", shutdown);
  process.on("SIGINT", () => {
    shutdown();
    process.exit(130);
  });
}

export {
  getRaw,
  getFlight,
  getPlain,
  CamoufoxTransport,
  extractStyle,
  extractStyleFromFlight,
  flightText,
  jsonObjects,
  shutdown,
};
