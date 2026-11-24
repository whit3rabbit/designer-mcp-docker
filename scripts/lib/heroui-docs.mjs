/**
 * heroui-docs.mjs — offline readers for the baked HeroUI layer.
 *
 * Reads `<cache>/heroui/` on disk (docs, per-component CSS, oklch theme
 * variables, component TSX source, v2-to-v3 migration guides) or the same
 * endpoints on a `DESIGN_REMOTE_URL` static host. Every path a caller can
 * influence is checked against traversal before it touches the filesystem.
 *
 * Layer layout (written by scripts/fetch-heroui.mjs):
 *   heroui/catalog.json       { version, totals, components[], guides[] }
 *   heroui/docs/              components/<slug>.md, guides/<slug>.md, llms.txt
 *   heroui/theme/             variables.css, theme.css, default.css
 *   heroui/styles/            components/<slug>.css, index.css, variants.css, base/
 *   heroui/source/            react/components/<slug>/..., styles/...
 *   heroui/migration/         <slug>.mdx + index.json
 */

import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { getRemoteUrl, remoteJson, remoteOr, REMOTE_DOWN, HEROUI_DIR, createBoundedCache } from "./cache.mjs";

const EMPTY_CATALOG = {
  updatedAt: null,
  version: { react: null, styles: null, source: null },
  totals: { components: 0, guides: 0 },
  components: [],
  guides: [],
  hasSource: false,
  hasStyles: false,
  hasMigration: false,
};

const contentCache = createBoundedCache(64);

/** PascalCase component name -> kebab-case doc slug ("ToggleButton" -> "toggle-button"). */
export function heroUiSlug(name) {
  return String(name || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The names a component can be filed under upstream.
 *
 * The docs catalog slugs every component in kebab-case ("text-field"), but
 * the source tree and @heroui/styles name a few folders and css files without
 * the hyphen ("textfield", "textarea"). Try the catalog slug first.
 */
function slugVariants(slug) {
  const joined = slug.replace(/-/g, "");
  return joined === slug ? [slug] : [slug, joined];
}

async function readTextUnder(base, rel) {
  const clean = String(rel || "").replace(/^\/+/, "");
  if (!clean || clean.includes("..") || clean.includes("\\") || !/^[\w./-]+$/.test(clean)) return null;
  const root = resolve(base);
  const full = resolve(root, clean);
  if (!full.startsWith(root + sep) || !existsSync(full)) return null;
  if (contentCache.has(full)) return contentCache.get(full);
  const text = await readFile(full, "utf8");
  contentCache.set(full, text);
  return text;
}

/**
 * One file from this layer's tree on the remote host, else `local()`.
 *
 * A 404 is the host's answer (null), the same rule as the catalog: a layer
 * the host does not publish must not reappear item by item from disk. Only
 * an unreachable host falls back to disk, and that is reported in the reply.
 */
function remoteFirst(kind, rel, local) {
  return remoteOr(kind, `api/heroui/${rel}`, local);
}

/** The catalog written by the fetcher, or an empty one when the layer is missing. */
export async function readHeroUiCatalog() {
  if (getRemoteUrl()) {
    const remote = await remoteJson("api/heroui.json");
    // A 404 is the host's answer: this layer is not published there.
    if (remote === null) return EMPTY_CATALOG;
    // Unreachable, or not a catalog: fall back to the one on disk.
    if (remote !== REMOTE_DOWN && Array.isArray(remote?.components)) return remote;
  }
  const raw = await readTextUnder(HEROUI_DIR, "catalog.json");
  if (!raw) return EMPTY_CATALOG;
  try {
    return JSON.parse(raw);
  } catch {
    return EMPTY_CATALOG;
  }
}

/** One component or guide doc by its catalog path ("components/button.md"). */
export async function readHeroUiDoc(docPath) {
  const clean = String(docPath || "").replace(/^\/+/, "");
  return remoteFirst("text", `doc/${clean}`, () => readTextUnder(join(HEROUI_DIR, "docs"), docPath));
}

const STORY_FILE = /\.stories\.tsx?$/;

/**
 * One component's source files: the named .tsx plus its directory siblings.
 *
 * `includeStories: false` leaves out the Storybook files. They are usage
 * demos, not the component, and more than half of the baked source by size.
 * `storiesOmitted` then names the ones skipped so a caller can ask for them.
 * The default keeps them: the gallery and the static build show the whole
 * folder, and only the MCP tool, whose reply costs context, opts out.
 */
export async function readHeroUiSource(component, { includeStories = true } = {}) {
  const wanted = heroUiSlug(component);
  if (!wanted) return null;
  for (const slug of slugVariants(wanted)) {
    const found = await readHeroUiSourceAt(slug);
    if (!found) continue;
    if (includeStories) return found;
    const files = found.files.filter((f) => !STORY_FILE.test(f.path));
    const storiesOmitted = found.files.filter((f) => STORY_FILE.test(f.path)).map((f) => f.path);
    // A folder holding only stories still returns them rather than nothing.
    if (!files.length) return found;
    return { ...found, files, ...(storiesOmitted.length > 0 && { storiesOmitted }) };
  }
  return null;
}

function readHeroUiSourceAt(slug) {
  return remoteFirst("json", `source/${slug}.json`, () => readHeroUiSourceLocal(slug));
}

async function readHeroUiSourceLocal(slug) {
  const relBase = join(HEROUI_DIR, "source", "react", "components");
  const compDir = join(relBase, slug);
  const primary = join(compDir, `${slug}.tsx`);
  if (!existsSync(compDir)) return null;
  const files = [];
  if (existsSync(primary)) {
    files.push({ path: `${slug}/${slug}.tsx`, content: await readFile(primary, "utf8") });
  }
  for (const entry of await readdir(compDir, { withFileTypes: true })) {
    if (files.length >= 12) break;
    if (entry.isFile() && entry.name !== `${slug}.tsx` && /\.(ts|tsx|css)$/.test(entry.name)) {
      files.push({
        path: `${slug}/${entry.name}`,
        content: await readFile(join(compDir, entry.name), "utf8"),
      });
    }
  }
  return files.length ? { component: slug, files } : null;
}

/** One component's CSS from @heroui/styles ("button" -> components/button.css). */
export async function readHeroUiStyles(component) {
  const wanted = heroUiSlug(component);
  if (!wanted) return null;
  for (const slug of slugVariants(wanted)) {
    const css = await remoteFirst("text", `styles/${slug}.css`, () =>
      readTextUnder(join(HEROUI_DIR, "styles", "components"), `${slug}.css`),
    );
    if (css !== null) return css;
  }
  return null;
}

/** The oklch theme variables plus the shared and default theme css. */
export function readHeroUiTheme() {
  return remoteFirst("json", "theme.json", readHeroUiThemeLocal);
}

async function readHeroUiThemeLocal() {
  const variables = await readTextUnder(join(HEROUI_DIR, "theme"), "variables.css");
  if (!variables) return null;
  return {
    variables,
    theme: await readTextUnder(join(HEROUI_DIR, "theme"), "theme.css"),
    default: await readTextUnder(join(HEROUI_DIR, "theme"), "default.css"),
  };
}

/** The migration guide index ({ total, files[] }), or null when not baked. */
export function readHeroUiMigrationIndex() {
  return remoteFirst("json", "migration/index.json", readHeroUiMigrationIndexLocal);
}

async function readHeroUiMigrationIndexLocal() {
  const raw = await readTextUnder(join(HEROUI_DIR, "migration"), "index.json");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** One migration guide ("button" or "button.mdx" or "agent-guide-full"). */
export async function readHeroUiMigrationDoc(name) {
  const clean = String(name || "").replace(/^\/+/, "");
  const file = clean.endsWith(".mdx") ? clean : `${clean}.mdx`;
  return remoteFirst("text", `migration/${file}`, () => readTextUnder(join(HEROUI_DIR, "migration"), file));
}

/**
 * Term search over the catalog index (names, slugs, groups, descriptions).
 * Cheap on purpose: the catalog already carries one description per entry.
 */
export async function searchHeroUiDocs({ query = "", kind = "", limit = 20 } = {}) {
  const catalog = await readHeroUiCatalog();
  const q = String(query || "").trim().toLowerCase();
  const terms = q ? q.split(/\s+/) : [];
  const pool = [
    ...catalog.components.map((c) => ({ ...c, kind: "component" })),
    ...catalog.guides.map((g) => ({ ...g, kind: "guide" })),
  ];
  const filtered = pool.filter((entry) => {
    if (kind && entry.kind !== kind) return false;
    if (!terms.length) return true;
    const hay = `${entry.name} ${entry.slug} ${entry.group} ${entry.description}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
  return {
    query: q,
    total: filtered.length,
    results: filtered.slice(0, Math.min(Number(limit) || 20, 100)),
  };
}
