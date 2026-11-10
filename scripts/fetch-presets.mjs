#!/usr/bin/env node
/**
 * fetch-presets.mjs — cache GradientDeck's tool preset catalogs.
 *
 * GradientDeck's design tools (patterns, gradients, liquid glass, Tailwind
 * colors) ship their preset libraries inside the client bundle. Each
 * catalog is an array of plain records, minified but regular:
 *
 *   {id:"top-gradient-radial",name:"Top Gradient Radial",category:"decorative",
 *    textColor:"black",style:{background:"radial-gradient(...)"},
 *    code:`<div className="...">...</div>`}
 *
 * The values are JS object literals (unquoted keys, backtick templates),
 * so they are not JSON. This module parses that literal subset.
 *
 * The catalogs are found by diffing each tool page's script list against a
 * baseline: the tool's own catalog lives in a chunk the other tools do not
 * load. That keeps the fetch proportional to the number of tools instead of
 * downloading every chunk of every page.
 *
 * Cache layout:
 *   <cache>/presets.json            { updatedAt, catalogs[] }
 *   <cache>/presets/<kind>.json     one catalog per kind
 *
 * Usage
 *   node scripts/fetch-presets.mjs
 *   node scripts/fetch-presets.mjs --only patterns
 *
 * Env
 *   DESIGN_CACHE_DIR   cache root (default ~/.design-cache)
 */

import { mkdir, writeFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { CACHE_DIR } from "./lib/cache.mjs";

const argv = process.argv.slice(2);
const argVal = (name) => {
  const i = argv.lastIndexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
};

const UA =
  process.env.GRADIENTDECK_UA ||
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const SITE = "https://gradientdeck.com";
const ONLY = argVal("--only");

const PRESETS_DIR = join(CACHE_DIR, "presets");

/**
 * The tools to mirror, and what a preset record looks like for each.
 *
 * `kind` is the cache name. `match` decides whether a record in an array
 * belongs to this catalog.
 */
const TOOLS = [
  {
    kind: "patterns",
    tool: "pattern-backgrounds",
    match: (r) => r.id && r.name && r.style && typeof r.style === "object",
    label: "Background patterns and gradients",
  },
  {
    kind: "liquid-glass",
    tool: "liquid-glass",
    match: (r) => r.id && r.name && ("blur" in r || "edgeBlur" in r),
    label: "Liquid glass effects",
  },
  {
    kind: "tailwind-colors",
    tool: "tailwind-colors",
    match: (r) => Array.isArray(r.colors) && r.colors.length > 2 && !r.id,
    label: "Tailwind color scales",
  },
];

// ------------------------------------------------------------------ fetch
async function get(url, as = "text") {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "*/*" },
    signal: AbortSignal.timeout(45_000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return as === "json" ? res.json() : res.text();
}

/** The script chunks a page loads. */
async function chunksFor(path) {
  const html = await get(`${SITE}/${path}`);
  const found = new Set();
  for (const m of html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+?\.js)"/g)) {
    found.add(m[1]);
  }
  return [...found];
}

// ------------------------------------------------------------------ parser
/**
 * A scanner for the JS object-literal subset the bundles use.
 * Handles unquoted keys, quoted strings, backtick templates, numbers,
 * booleans, nested objects and arrays.
 */
class LiteralScanner {
  constructor(src, start = 0) {
    this.s = src;
    this.i = start;
  }

  ws() {
    while (this.i < this.s.length && " \t\n\r".includes(this.s[this.i])) this.i++;
    return this;
  }

  str() {
    const q = this.s[this.i];
    this.i++;
    let out = "";
    while (this.i < this.s.length) {
      const c = this.s[this.i];
      if (c === "\\") {
        const n = this.s[this.i + 1];
        const map = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", v: "\v", "0": "\0" };
        if (n === "x") {
          out += String.fromCharCode(parseInt(this.s.slice(this.i + 2, this.i + 4), 16));
          this.i += 4;
          continue;
        }
        if (n === "u") {
          if (this.s[this.i + 2] === "{") {
            const end = this.s.indexOf("}", this.i + 3);
            out += String.fromCodePoint(parseInt(this.s.slice(this.i + 3, end), 16));
            this.i = end + 1;
            continue;
          }
          out += String.fromCharCode(parseInt(this.s.slice(this.i + 2, this.i + 6), 16));
          this.i += 6;
          continue;
        }
        out += map[n] ?? n;
        this.i += 2;
        continue;
      }
      if (c === q) {
        this.i++;
        return out;
      }
      out += c;
      this.i++;
    }
    return out;
  }

  value() {
    this.ws();
    const c = this.s[this.i];
    if (c === '"' || c === "'" || c === "`") return this.str();
    if (c === "{") return this.object();
    if (c === "[") return this.array();
    const num = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(this.s.slice(this.i));
    if (num) {
      this.i += num[0].length;
      return Number(num[0]);
    }
    if (this.s.startsWith("true", this.i)) { this.i += 4; return true; }
    if (this.s.startsWith("false", this.i)) { this.i += 5; return false; }
    if (this.s.startsWith("null", this.i)) { this.i += 4; return null; }
    if (this.s.startsWith("undefined", this.i)) { this.i += 9; return undefined; }
    // an identifier — a minified module reference; keep it as a marker
    const id = /^[A-Za-z_$][\w$]*/.exec(this.s.slice(this.i));
    if (id) {
      this.i += id[0].length;
      return { __ref: id[0] };
    }
    this.i++;
    return null;
  }

  object() {
    const obj = {};
    this.i++; // {
    for (;;) {
      this.ws();
      if (this.i >= this.s.length) break;
      if (this.s[this.i] === "}") { this.i++; break; }
      if (this.s[this.i] === ",") { this.i++; continue; }
      let key;
      const c = this.s[this.i];
      if (c === '"' || c === "'" || c === "`") key = this.str();
      else {
        const m = /^[A-Za-z_$][\w$]*/.exec(this.s.slice(this.i));
        if (!m) { this.i++; continue; }
        key = m[0];
        this.i += m[0].length;
      }
      this.ws();
      if (this.s[this.i] === ":") {
        this.i++;
        obj[key] = this.value();
      } else {
        obj[key] = true;
      }
    }
    return obj;
  }

  array() {
    const arr = [];
    this.i++; // [
    for (;;) {
      this.ws();
      if (this.i >= this.s.length) break;
      if (this.s[this.i] === "]") { this.i++; break; }
      if (this.s[this.i] === ",") { this.i++; continue; }
      arr.push(this.value());
    }
    return arr;
  }
}

/** Find every array in a chunk whose elements look like preset records. */
function findPresetArrays(js) {
  const out = [];
  for (let i = 0; i < js.length - 1; i++) {
    if (js[i] !== "[") continue;
    if (js[i + 1] !== "{") continue;
    // Only consider arrays that start a value position, so we do not parse
    // array literals nested inside a record we already captured.
    const before = js.slice(Math.max(0, i - 40), i);
    if (/[=,:(\[]\s*$/.test(before) === false && !/=\s*$/.test(before)) {
      // still allowed — a bare literal in a module body
    }
    let scanner;
    let val;
    try {
      scanner = new LiteralScanner(js, i);
      val = scanner.value();
    } catch {
      continue;
    }
    if (!Array.isArray(val) || val.length < 3) continue;
    if (!val.every((x) => x && typeof x === "object" && !Array.isArray(x))) continue;
    out.push(val);
    i = scanner.i - 1;
  }
  return out;
}

// ------------------------------------------------------------------ main
async function main() {
  console.log(`cache dir : ${CACHE_DIR}`);
  console.log(`presets   : ${PRESETS_DIR}`);

  const tools = ONLY ? TOOLS.filter((t) => t.kind === ONLY) : TOOLS;
  if (!tools.length) {
    console.error(`no tool matches --only ${ONLY}`);
    console.error(`known kinds: ${TOOLS.map((t) => t.kind).join(", ")}`);
    process.exit(1);
  }

  // The baseline tool shares its chunks with every other tool, so anything
  // NOT in the baseline is specific to the tool being scanned.
  const baseline = new Set(await chunksFor("mesh-gradients"));
  console.log(`baseline  : ${baseline.size} shared chunks`);

  await mkdir(PRESETS_DIR, { recursive: true });

  const catalogs = [];
  const chunkCache = new Map();

  for (const tool of tools) {
    process.stdout.write(`${tool.kind.padEnd(16)}`);
    try {
      const chunks = await chunksFor(tool.tool);
      const unique = chunks.filter((c) => !baseline.has(c));
      const records = [];

      for (const c of unique) {
        if (!chunkCache.has(c)) {
          try {
            chunkCache.set(c, await get(`${SITE}${c}`));
          } catch {
            chunkCache.set(c, null);
          }
        }
        const js = chunkCache.get(c);
        if (!js) continue;
        for (const arr of findPresetArrays(js)) {
          for (const rec of arr) {
            if (tool.match(rec)) records.push(rec);
          }
        }
      }

      // De-duplicate by id (or by name for the color scales).
      const seen = new Set();
      const unique_records = [];
      for (const r of records) {
        const key = r.id || r.label || r.name || JSON.stringify(r).slice(0, 80);
        if (seen.has(key)) continue;
        seen.add(key);
        unique_records.push(r);
      }

      if (!unique_records.length) {
        console.log("no presets found");
        continue;
      }

      const payload = {
        kind: tool.kind,
        label: tool.label,
        source: "gradientdeck",
        tool: tool.tool,
        updatedAt: new Date().toISOString(),
        total: unique_records.length,
        presets: unique_records,
      };

      const dest = join(PRESETS_DIR, `${tool.kind}.json`);
      const tmp = `${dest}.tmp.${process.pid}`;
      await writeFile(tmp, JSON.stringify(payload, null, 2));
      await rename(tmp, dest);

      catalogs.push({
        kind: tool.kind,
        label: tool.label,
        tool: tool.tool,
        total: unique_records.length,
        path: `presets/${tool.kind}.json`,
      });
      console.log(`${unique_records.length} presets`);
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
    }
  }

  const index = {
    updatedAt: new Date().toISOString(),
    total: catalogs.reduce((n, c) => n + c.total, 0),
    catalogs,
  };
  const indexPath = join(CACHE_DIR, "presets.json");
  const tmp = `${indexPath}.tmp.${process.pid}`;
  await writeFile(tmp, JSON.stringify(index, null, 2));
  await rename(tmp, indexPath);

  console.log(`\ndone: ${index.total} presets across ${catalogs.length} catalogs`);
  console.log(`index: ${indexPath}`);
}

main().catch((e) => {
  console.error("fatal:", e.message);
  process.exit(1);
});
