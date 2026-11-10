#!/usr/bin/env node
/**
 * fetch-gradientdeck.mjs — cache GradientDeck's AI component library.
 *
 * GradientDeck publishes its components as a shadcn registry: every
 * component variant has a JSON endpoint at
 *
 *     https://gradientdeck.com/ai-components/r/<variant>.json
 *
 * which is the same URL the site prints in its own install instructions:
 *
 *     npx shadcn@latest add https://gradientdeck.com/ai-components/r/prompt-input-card.json
 *
 * That makes it a documented, machine-readable export — the sanctioned
 * install path — rather than a scraped internal API. The registry payload
 * is byte-identical to the source the component page serves in its React
 * tree (verified).
 *
 * The component list comes from the site's own sitemap. Each component
 * page lists the registry URLs for its own variants, so the fetcher:
 *
 *   1. reads the sitemap for the component slugs
 *   2. fetches each component page and extracts its registry URLs
 *   3. fetches each registry JSON and stores it under the cache
 *
 * Cache layout:
 *   <cache>/components.json          { updatedAt, components[] }
 *   <cache>/components/<slug>.json    { slug, name, description, variants[] }
 *
 * Everything here runs at fetch time. The server, the MCP tools and the
 * skill read only from the cache — no outbound calls at runtime.
 *
 * Usage
 *   node scripts/fetch-gradientdeck.mjs
 *   node scripts/fetch-gradientdeck.mjs --limit 10
 *   node scripts/fetch-gradientdeck.mjs --conc 6
 *   node scripts/fetch-gradientdeck.mjs --force
 *
 * Env
 *   DESIGN_CACHE_DIR   cache root (default ~/.design-cache)
 *   GRADIENTDECK_UA    User-Agent header
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
const has = (name) => argv.includes(name);

const UA =
  process.env.GRADIENTDECK_UA ||
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const CONC = Math.max(1, Number(argVal("--conc") || 6));
const LIMIT = Number(argVal("--limit") || 0);
const FORCE = has("--force");

const SITE = "https://gradientdeck.com";
const COMPONENTS_DIR = join(CACHE_DIR, "components");

// ------------------------------------------------------------------ helpers
async function get(url, { as = "text" } = {}) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "*/*" },
    signal: AbortSignal.timeout(45_000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}`);
  return as === "json" ? res.json() : res.text();
}

/**
 * The component slugs, from the site's own sitemap.
 *
 * The sitemap lists category pages too (e.g. /ai-components/chat groups 33
 * components). Those are not components themselves — a component page has
 * its own registry entries. The fetcher discovers the real components by
 * asking each page for its registry URLs; a category page returns none.
 */
async function listComponentSlugs() {
  const xml = await get(`${SITE}/sitemap.xml`);
  const slugs = new Set();
  for (const m of xml.matchAll(
    /<loc>https:\/\/gradientdeck\.com\/ai-components\/([^<]+)<\/loc>/g,
  )) {
    const slug = m[1];
    // /ai-components/guides/... are tutorials, not components.
    if (slug.startsWith("guides/")) continue;
    slugs.add(slug);
  }
  return [...slugs].sort();
}

/**
 * Extract the registry URLs a component page offers.
 *
 * These appear in the page's install instructions and in the React tree.
 * Both are the same set, so one regex over the HTML is enough.
 */
function registryUrlsFrom(html) {
  const urls = new Set();
  for (const m of html.matchAll(
    /https:\/\/gradientdeck\.com\/ai-components\/r\/([a-z0-9.-]+)\.json/g,
  )) {
    urls.add(m[1]);
  }
  return [...urls];
}

/**
 * Human-readable component metadata from the page's JSON-LD.
 *
 * The page emits two ld+json scripts, both using a `@graph` array:
 *   - a TechArticle / SoftwareApplication with the headline and description
 *   - a SoftwareSourceCode per variant
 *   - a BreadcrumbList giving the category path
 *   - a FAQPage with the component's real questions
 */
function metaFromPage(html) {
  const out = { title: null, description: null, breadcrumb: null, faq: [] };
  for (const m of html.matchAll(
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    let doc;
    try {
      doc = JSON.parse(m[1].trim());
    } catch {
      continue;
    }
    // Every node lives inside @graph, one level down.
    const nodes = [];
    const collect = (n) => {
      if (!n || typeof n !== "object") return;
      if (Array.isArray(n)) {
        n.forEach(collect);
        return;
      }
      if (Array.isArray(n["@graph"])) {
        n["@graph"].forEach(collect);
        return;
      }
      nodes.push(n);
    };
    collect(doc);

    for (const node of nodes) {
      const type = node["@type"];
      if (type === "TechArticle" || type === "SoftwareApplication" || type === "WebPage") {
        out.title = node.headline || node.name || out.title;
        out.description = node.description || out.description;
      }
      if (type === "BreadcrumbList") {
        out.breadcrumb = (node.itemListElement || [])
          .map((i) => i.name)
          .filter(Boolean)
          .join(" / ");
      }
      if (type === "FAQPage") {
        for (const q of node.mainEntity || []) {
          out.faq.push({
            question: q.name,
            answer: q.acceptedAnswer?.text || "",
          });
        }
      }
    }
  }
  return out;
}

/** Decode one Next.js flight chunk (the React source of a variant). */
function flightChunks(html) {
  const chunks = [];
  for (const m of html.matchAll(/self\.__next_f\.push\(\[1,\s*"([\s\S]*?)"\]\)/g)) {
    let text;
    try {
      text = JSON.parse(`"${m[1]}"`);
    } catch {
      text = m[1];
    }
    chunks.push(text);
  }
  return chunks;
}

/**
 * The variant names, keyed by the SHORT variant id.
 *
 * Two sources, both needed:
 *  - the server-rendered tab buttons ("…variant">Card with toolbar</button>)
 *  - the RSC flight payload, where the quotes are backslash-escaped:
 *    \"variants\":[{\"id\":\"card\",\"name\":\"Card with toolbar\",…
 *
 * The page keys variants by the short id ("card") while the registry file is
 * prefixed with the component slug ("prompt-input-card"), so match on the
 * suffix.
 */
function variantNames(html) {
  const names = [];
  const seen = new Set();
  const push = (id, name) => {
    if (!id || !name || seen.has(id)) return;
    seen.add(id);
    names.push({ id, name });
  };

  // RSC flight payload — escaped quotes. This is the source of truth:
  //   \"variants\":[{\"id\":\"card\",\"name\":\"Card with toolbar\",…
  // Each variant is an array element, so only the first one directly
  // follows the "variants" key — match the id/name pairs themselves.
  for (const m of html.matchAll(
    /\\"id\\":\\"([a-z0-9-]+)\\",\\"name\\":\\"([^"\\]{1,60})\\"/g,
  )) {
    push(m[1], m[2]);
  }
  if (names.length) return names;

  // Fallback: pair the rendered tab labels with the variant ids, in order.
  // The tabs carry no id, but both lists are in the same document order.
  const ids = [...html.matchAll(/\\"id\\":\\"([a-z0-9-]+)\\",\\"file\\":\\"([a-z0-9-]+\.tsx)\\"/g)]
    .map((m) => m[1]);
  const labels = [...html.matchAll(
    /class="[^"]*__variant(?:Active)?"[^>]*>(?:<span[^>]*><\/span>)?([^<]{1,60})<\/button>/g,
  )]
    .map((m) => m[1].trim())
    .filter(Boolean);

  labels.forEach((label, i) => {
    if (ids[i]) push(ids[i], label);
  });

  return names;
}

/**
 * Match a registry id to its page variant.
 *
 * The registry file for the "card" variant of "prompt-input" is
 * "prompt-input-card", so the short id is the registry id minus the
 * component slug. Match exactly that first, then fall back to any variant
 * whose id is a suffix of the registry id.
 */
function matchVariant(registryId, slug, names) {
  const prefix = `${slug}-`;
  if (registryId.startsWith(prefix)) {
    const short = registryId.slice(prefix.length);
    const exact = names.find((n) => n.id === short);
    if (exact) return exact;
  }
  const suffix = names.find(
    (n) => registryId === n.id || registryId.endsWith(`-${n.id}`),
  );
  return suffix || null;
}

/**
 * The component's category, from its breadcrumb.
 *
 * The breadcrumb reads "GradientDeck / AI Components / Chat / Prompt input".
 * "AI Components" is the section marker, so the segment after it is the
 * category.
 */
function categoryFromBreadcrumb(breadcrumb) {
  if (!breadcrumb) return null;
  const parts = breadcrumb.split("/").map((s) => s.trim()).filter(Boolean);
  const i = parts.findIndex((p) => /^ai components$/i.test(p));
  if (i >= 0 && parts[i + 1]) return parts[i + 1].toLowerCase();
  // Fall back to the second-to-last segment.
  return parts.length >= 2 ? parts[parts.length - 2].toLowerCase() : null;
}

// ------------------------------------------------------------------ main
async function main() {
  console.log(`cache dir : ${CACHE_DIR}`);
  console.log(`components: ${COMPONENTS_DIR}`);

  const slugs = await listComponentSlugs();
  console.log(`sitemap   : ${slugs.length} candidate component pages`);

  const targets = LIMIT > 0 ? slugs.slice(0, LIMIT) : slugs;

  await mkdir(COMPONENTS_DIR, { recursive: true });

  const components = [];
  let ok = 0;
  let failed = 0;
  let skipped = 0;
  let variantCount = 0;
  const queue = targets.slice();

  const worker = async () => {
    while (queue.length) {
      const slug = queue.shift();
      const dest = join(COMPONENTS_DIR, `${slug}.json`);
      try {
        let record = null;
        if (!FORCE && existsSync(dest)) {
          try {
            const cached = JSON.parse(
              await (await import("node:fs/promises")).readFile(dest, "utf8"),
            );
            if (cached?.variants?.length) {
              components.push(cached);
              ok += 1;
              variantCount += cached.variants.length;
              process.stdout.write(
                `  ok ${String(ok).padStart(4)}/${targets.length}  ${String(cached.variants.length).padStart(2)} variants  ${slug}\n`,
              );
              continue;
            }
          } catch {
            // fall through and re-fetch
          }
        }

        const html = await get(`${SITE}/ai-components/${slug}`);
        const registryIds = registryUrlsFrom(html);

        if (!registryIds.length) {
          // A category/landing page groups other components but has no
          // components of its own. Not an error — skip it.
          skipped++;
          continue;
        }

        const meta = metaFromPage(html);
        const names = variantNames(html);

        const variants = [];
        for (const rid of registryIds) {
          const reg = await get(`${SITE}/ai-components/r/${rid}.json`, { as: "json" });
          const file = reg.files?.[0];
          if (!file) continue;
          // The display name comes from the page, matched by registry id.
          const matched = matchVariant(rid, slug, names);
          const label = matched?.name || rid;
          variants.push({
            id: rid,
            variantId: matched?.id || rid,
            name: label,
            filename: file.path || `${rid}.tsx`,
            dependencies: reg.dependencies || [],
            registryDependencies: reg.registryDependencies || [],
            code: file.content || "",
          });
        }

        if (!variants.length) throw new Error("registry entries had no files");

        record = {
          slug,
          source: "gradientdeck",
          title: meta.title || slug,
          description: meta.description || null,
          breadcrumb: meta.breadcrumb || null,
          // The breadcrumb is "GradientDeck / AI Components / Chat / Prompt
          // input" — the segment before the component name is its category.
          category: categoryFromBreadcrumb(meta.breadcrumb),
          url: `${SITE}/ai-components/${slug}`,
          install: `npx shadcn@latest add ${SITE}/ai-components/r/${variants[0].id}.json`,
          faq: meta.faq,
          variants,
          updatedAt: new Date().toISOString(),
        };

        const tmp = `${dest}.tmp.${process.pid}`;
        await writeFile(tmp, JSON.stringify(record, null, 2));
        await rename(tmp, dest);

        components.push(record);
        ok += 1;
        variantCount += variants.length;
        process.stdout.write(
          `  ok ${String(ok).padStart(4)}/${targets.length}  ${String(variants.length).padStart(2)} variants  ${slug}\n`,
        );
      } catch (e) {
        failed += 1;
        console.log(`  ERR ${slug}: ${e.message.split("\n")[0]}`);
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONC, targets.length) }, worker));

  components.sort((a, b) => a.slug.localeCompare(b.slug));

  const index = {
    updatedAt: new Date().toISOString(),
    total: components.length,
    variants: components.reduce((n, c) => n + c.variants.length, 0),
    components: components.map((c) => ({
      slug: c.slug,
      title: c.title,
      description: c.description,
      category: c.category,
      breadcrumb: c.breadcrumb,
      url: c.url,
      variants: c.variants.map((v) => ({
        id: v.id,
        variantId: v.variantId,
        name: v.name,
        filename: v.filename,
        dependencies: v.dependencies,
      })),
    })),
  };

  const indexPath = join(CACHE_DIR, "components.json");
  const tmp = `${indexPath}.tmp.${process.pid}`;
  await writeFile(tmp, JSON.stringify(index, null, 2));
  await rename(tmp, indexPath);

  console.log(
    `\ndone: ${ok} components, ${failed} failed, ${variantCount} variants`,
  );
  console.log(`index: ${indexPath}`);
  if (failed) {
    console.log("tip: re-run to retry only the failures — cached pages are skipped.");
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error("fatal:", e.message);
  process.exit(1);
});
