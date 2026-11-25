#!/usr/bin/env node
/**
 * fetch-baseui.mjs — bake the Base UI docs layer into the cache (build-time network).
 *
 * Base UI (@base-ui/react) is headless: it ships no visuals of its own, so
 * this layer is the documentation, fetched through first-party channels:
 *
 *   - https://base-ui.com/llms.txt  -> the agent-facing doc index, parsed
 *     into the catalog (Overview, Handbook, Components, Utilities). Every
 *     entry links a plain markdown page at https://base-ui.com/react/...md,
 *     and robots.txt allows everything except /experiments/, /hydration-repro/,
 *     /playground/ and /docs-theme/ — the doc pages are fetched only after the
 *     robots check passes, sequentially, with a small delay. /api/ is never
 *     requested (Rule 4).
 *   - mui/base-ui GitHub ref (pinned in data/baseui/pin.json) -> the MIT
 *     licence text, checksummed into provenance.json.
 *
 * The rendered-live story lives in the ReUI layer, whose items carry Base UI
 * variants (`baseCode`); the gallery cross-links the two. The runtime
 * surfaces (preview, MCP, static site) never run this script and never
 * repeat any of these requests: they read <cache>/baseui/ from disk.
 *
 * Cache layout (per data/baseui/pin.json):
 *   <cache>/baseui/catalog.json       section + entry index, parsed from llms.txt
 *   <cache>/baseui/docs/              <section>/<slug>.md, mirroring /react/<section>/<slug>.md
 *   <cache>/baseui/LICENSE            upstream MIT licence, verbatim
 *   <cache>/baseui/provenance.json    robots status, urls, versions, sha256 checksums, gaps
 *
 * Fail-soft per document: a failed fetch is recorded in provenance.gaps (and
 * the entry stays out of no count) while previously baked content is left
 * untouched until the swap below.
 *
 * Usage:
 *   node scripts/fetch-baseui.mjs
 */

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BASEUI_DIR, CACHE_DIR, writeJsonAtomic } from "./lib/cache.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PIN_PATH = join(HERE, "..", "data", "baseui", "pin.json");

const UA = "designer-mcp-docker fetch-baseui";
// Politeness gap between doc fetches; ~80 pages, so this stays well under a minute.
const FETCH_DELAY_MS = 150;
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function readJsonSafe(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

/** sha256 for every file under dir, keyed by path relative to dir (like fetch-heroui). */
async function checksumTree(rootDir, rel = "") {
  const out = {};
  for (const entry of await readdir(join(rootDir, rel), { withFileTypes: true })) {
    const child = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) Object.assign(out, await checksumTree(rootDir, child));
    else out[child] = sha256(await readFile(join(rootDir, child)));
  }
  return out;
}

/**
 * robots.txt gate (Rule 4). Returns the disallowed path prefixes for `*`,
 * or throws when robots.txt itself is unreachable — a fetcher must not
 * guess. Doc URLs are checked against the result before anything is fetched.
 */
async function fetchRobots(pin) {
  const url = pin.robotsUrl || "https://base-ui.com/robots.txt";
  const text = (await fetchBuffer(url)).toString("utf8");
  const disallowed = [];
  let star = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split("#")[0].trim();
    if (/^user-agent:\s*\*$/i.test(line)) { star = true; continue; }
    if (/^user-agent:/i.test(line)) { star = false; continue; }
    if (star && /^disallow:\s*(\S*)$/i.test(line)) {
      const path = line.slice(line.indexOf(":") + 1).trim();
      if (path) disallowed.push(path);
    }
  }
  return { url, disallowed };
}

/** A doc URL path ("/react/components/dialog.md") must not match a Disallow prefix. */
function robotsAllows(robots, urlPath) {
  return !robots.disallowed.some((prefix) => urlPath.startsWith(prefix));
}

/**
 * Parse llms.txt into catalog entries. Format: `## <Section>` headings, then
 * one `- [Name](url): description` bullet per entry. Sections map to disk
 * directories: Overview -> overview, Handbook -> handbook, Components ->
 * components, Utilities -> utils (the upstream URL segment).
 */
const DOC_ROOT = "https://base-ui.com/react/";

function parseLlmsTxt(text) {
  const SECTION_DIRS = { overview: "overview", handbook: "handbook", components: "components", utilities: "utils" };
  const bySection = { overview: [], handbook: [], components: [], utils: [] };
  let section = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    const h = /^## (\S+)$/.exec(line);
    if (h) {
      section = SECTION_DIRS[h[1].toLowerCase()] || null;
      continue;
    }
    const m = /^- \[(.+?)\]\(([^)]+?)\)(?::\s*(.*))?$/.exec(line);
    if (!m || !section) continue;
    const [, name, url, description = ""] = m;
    // Upstream links are absolute (https://base-ui.com/react/<path>.md);
    // accept relative ones too so a base-url change cannot break the parser.
    const rel = url.startsWith(DOC_ROOT) ? url.slice(DOC_ROOT.length) : url.replace(/^\.?\//, "");
    const parts = rel.replace(/\.md$/, "").split("/");
    bySection[section].push({
      name: name.trim(),
      slug: parts[parts.length - 1],
      section,
      group: groupFor(section, rel),
      description: description.trim(),
      path: rel,
      docUrl: url,
    });
  }
  return bySection;
}

/** Sidebar group: release notes nest under Overview but read as their own group. */
function groupFor(section, rel) {
  if (section === "overview" && rel.startsWith("overview/releases/")) return "Releases";
  return { overview: "Overview", handbook: "Handbook", components: "Components", utils: "Utilities" }[section];
}

/**
 * Latest stable release from the parsed release-note entries. The bullet
 * names are dotted ("v1.9.0", "v1.0.0-alpha.4"); stable beats prerelease and
 * a higher tuple wins. Returns "" when none parse.
 */
function latestRelease(entries) {
  const parse = (name) => {
    const m = /^v(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(name);
    return m
      ? { major: +m[1], minor: +m[2], patch: +m[3], pre: m[4] || null }
      : null;
  };
  const best = entries
    .map((e) => ({ name: e.name, v: parse(e.name) }))
    .filter((e) => e.v)
    .sort((a, b) => {
      const byTuple = b.v.major - a.v.major || b.v.minor - a.v.minor || b.v.patch - a.v.patch;
      if (byTuple) return byTuple;
      // A prerelease sorts below its stable.
      if (a.v.pre && !b.v.pre) return 1;
      if (!a.v.pre && b.v.pre) return -1;
      return (b.v.pre || "").localeCompare(a.v.pre || "");
    })[0];
  return best ? best.name.replace(/^v/, "") : "";
}

async function main() {
  const force = process.argv.includes("--force");
  const pin = await readJsonSafe(PIN_PATH);
  if (!pin?.docsSource || !pin?.docsBaseUrl) throw new Error(`missing or invalid ${PIN_PATH}`);
  const gaps = [];

  if (!force && existsSync(join(BASEUI_DIR, "catalog.json"))) {
    const prior = await readJsonSafe(join(BASEUI_DIR, "provenance.json"));
    if (prior && JSON.stringify(prior.pin) === JSON.stringify(pin)) {
      console.log(`Base UI docs layer -> ${BASEUI_DIR} (up to date, matches pin; pass --force to refetch)`);
      return;
    }
  }

  console.log(`Base UI docs layer -> ${BASEUI_DIR}`);
  console.log(`  pin: docs ${pin.docsSource}, licence ${pin.license?.repo}@${pin.license?.ref}`);

  // ------------------------------------------------------------ robots gate
  let robots;
  try {
    robots = await fetchRobots(pin);
  } catch (e) {
    throw new Error(`robots.txt unreachable at ${pin.robotsUrl}; not fetching anything (${e.message})`);
  }
  console.log(`  robots: ${robots.disallowed.length} disallowed prefix(es) for User-agent: *`);
  if (!robotsAllows(robots, new URL(pin.docsSource).pathname)) {
    throw new Error(`robots.txt disallows ${new URL(pin.docsSource).pathname}; not fetching anything`);
  }

  // ------------------------------------------------------------- llms.txt
  const llms = await fetchBuffer(pin.docsSource);
  const sections = parseLlmsTxt(llms.toString("utf8"));
  const entries = Object.values(sections).flat();
  const docTotal = entries.length;
  if (!docTotal) throw new Error("llms.txt parsed to zero entries; not swapping the cache");
  const version = latestRelease(sections.overview.filter((e) => e.path.startsWith("overview/releases/")));
  console.log(`  llms.txt: ${docTotal} entries (components ${sections.components.length}, handbook ${sections.handbook.length}, overview ${sections.overview.length}, utils ${sections.utils.length}), latest release ${version || "unparsed"}`);

  // ------------------------------------------------------ the docs, into tmp
  // Fetch into a temp dir and swap only at the end: a failure above (or a
  // gap below) leaves the previous bake intact.
  const tmp = await mkdtemp(join(tmpdir(), "baseui-docs-"));
  const docsDir = join(tmp, "docs");
  await mkdir(docsDir, { recursive: true });
  let fetched = 0;
  for (const entry of entries) {
    const urlPath = `/react/${entry.path}`;
    if (!/^[\w./-]+$/.test(entry.path)) {
      gaps.push(`docs: ${entry.path} has unexpected characters, skipped`);
      continue;
    }
    if (!robotsAllows(robots, urlPath)) {
      gaps.push(`docs: ${entry.path} is disallowed by robots.txt, skipped`);
      continue;
    }
    try {
      const buf = await fetchBuffer(pin.docsBaseUrl + entry.path);
      const file = join(docsDir, entry.path);
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, buf);
      entry.bytes = buf.length;
      fetched += 1;
    } catch (e) {
      gaps.push(`docs: ${entry.path} failed (${e.message})`);
    }
    await sleep(FETCH_DELAY_MS);
  }
  console.log(`  docs: ${fetched}/${docTotal} fetched`);
  // Catalog honesty: only entries whose doc actually landed are listed.
  const okEntries = entries.filter((e) => e.bytes != null);
  const okSections = { overview: [], handbook: [], components: [], utils: [] };
  for (const e of okEntries) okSections[e.section].push(e);
  if (!okSections.components.length) {
    throw new Error("no component doc was fetched; the layer would be empty — fix the fetch and re-run");
  }

  // ---------------------------------------------------------------- licence
  // From the pinned GitHub ref, never scraped from the website.
  let licenseBuf = null;
  const license = pin.license || {};
  if (license.repo && license.ref && license.file) {
    const licenseUrl = `https://raw.githubusercontent.com/${license.repo}/${license.ref}/${license.file}`;
    try {
      licenseBuf = await fetchBuffer(licenseUrl);
      await writeFile(join(tmp, "LICENSE"), licenseBuf);
      console.log(`  licence: ${license.spdx} from ${license.repo}@${license.ref} (${licenseBuf.length} bytes)`);
    } catch (e) {
      gaps.push(`license: ${licenseUrl} failed (${e.message})`);
    }
  } else {
    gaps.push("license: pin.json carries no license.repo/ref/file; not fetched");
  }

  // ---------------------------------------------------------- swap + catalog
  await mkdir(BASEUI_DIR, { recursive: true });
  await rm(join(BASEUI_DIR, "docs"), { recursive: true, force: true });
  await cp(docsDir, join(BASEUI_DIR, "docs"), { recursive: true });
  if (licenseBuf && existsSync(join(tmp, "LICENSE"))) {
    await cp(join(tmp, "LICENSE"), join(BASEUI_DIR, "LICENSE"));
  }

  const catalog = {
    updatedAt: Date.now(),
    version: version || null,
    license: licenseBuf
      ? {
          spdx: license.spdx || null,
          repo: license.repo,
          ref: license.ref,
          sha256: sha256(licenseBuf),
        }
      : null,
    totals: {
      components: okSections.components.length,
      guides: okSections.overview.length + okSections.handbook.length + okSections.utils.length,
      pages: okEntries.length,
      upstreamPages: docTotal,
    },
    sections: {
      overview: { label: "Overview", count: okSections.overview.length },
      handbook: { label: "Handbook", count: okSections.handbook.length },
      components: { label: "Components", count: okSections.components.length },
      utils: { label: "Utilities", count: okSections.utils.length },
    },
    components: okSections.components,
    guides: [...okSections.overview, ...okSections.handbook, ...okSections.utils],
    hasLicense: Boolean(licenseBuf),
  };
  await writeJsonAtomic(join(BASEUI_DIR, "catalog.json"), catalog);
  console.log(`  catalog: ${catalog.totals.components} components, ${catalog.totals.guides} guides`);

  // ------------------------------------------------------------- provenance
  const prior = await readJsonSafe(join(BASEUI_DIR, "provenance.json"));
  const provenance = {
    fetchedAt: new Date().toISOString(),
    pin,
    robots: {
      url: robots.url,
      checked: true,
      disallowed: robots.disallowed,
      statement:
        "Fetched only the public doc pages robots.txt permits for generic agents; /api/ was never requested.",
    },
    docs: {
      llmsUrl: pin.docsSource,
      baseUrl: pin.docsBaseUrl,
      fetched,
      total: docTotal,
      version,
    },
    license: licenseBuf
      ? { url: `https://raw.githubusercontent.com/${license.repo}/${license.ref}/${license.file}`, repo: license.repo, ref: license.ref, spdx: license.spdx, sha256: sha256(licenseBuf), bytes: licenseBuf.length }
      : null,
    priorFetchedAt: prior?.fetchedAt || null,
    gaps,
    checksums: await checksumTree(BASEUI_DIR),
  };
  await writeJsonAtomic(join(BASEUI_DIR, "provenance.json"), provenance);

  console.log(`  provenance: ${Object.keys(provenance.checksums).length} files checksummed`);
  if (gaps.length) {
    console.warn(`  ${gaps.length} gap(s) recorded:`);
    for (const g of gaps) console.warn(`    - ${g}`);
  }
  console.log("done");
}

main().catch((e) => {
  console.error("fetch-baseui failed:", e.message);
  process.exit(1);
});
