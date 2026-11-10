#!/usr/bin/env node
/**
 * design-mcp — a generic, offline-first MCP server over the design catalog.
 *
 * The upstream `fidgetcoding-refero-mcp` package registers seven tools named
 * `refero_*` and talks to styles.refero.design. This server sits alongside it
 * and exposes the SAME catalog under source-neutral names, so one client can
 * query Refero styles and OpenDesign design systems through one interface.
 *
 *   design_search   natural-language search across every source
 *   design_get      resolve an identifier to the full design record
 *   design_list     browse the catalog
 *   design_facets   distributions (theme, source, industry, font)
 *   design_markdown the DESIGN.md for one design
 *
 * Everything is served from the local cache. This server makes NO outbound
 * network calls: the catalog, the style records, and the thumbnails are all
 * read from disk.
 *
 * The upstream package stays untouched and remains registered as its own MCP
 * server for the Refero-specific tools.
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  CACHE_DIR,
  SOURCE,
  readCatalog,
  readDesign,
  mergeDesign,
  readComponentsIndex,
  readComponent,
  readPresetsIndex,
  readPresetCatalog,
} from "./lib/cache.mjs";
import { resolveDesign } from "./lib/resolve.mjs";
import { score, searchText } from "./lib/score.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

// ------------------------------------------------------------------ renderer
/**
 * Refero entries are rendered by the upstream renderer so the DESIGN.md is
 * byte-identical to what the upstream `refero_design_md` tool returns.
 * OpenDesign entries ship their own DESIGN.md, served verbatim.
 */
async function loadRenderer() {
  const candidates = [];
  let dir = HERE;
  for (let i = 0; i < 5; i++) {
    candidates.push(join(dir, "node_modules/fidgetcoding-refero-mcp/dist/design-md.js"));
    dir = dirname(dir);
  }
  for (const c of candidates) {
    if (existsSync(c)) return import(`file://${c}`);
  }
  const require = createRequire(join(process.cwd(), "index.js"));
  return import(`file://${require.resolve("fidgetcoding-refero-mcp/dist/design-md.js")}`);
}
const { renderDesignMd } = await loadRenderer();

function designMarkdown(full) {
  if (full?.designMd) return full.designMd;
  return renderDesignMd(full);
}

// ------------------------------------------------------------------ catalog
let catalog = [];
let loadedAt = 0;

async function loadCatalog() {
  const { designs } = await readCatalog();
  catalog = designs;
  loadedAt = Date.now();
}

/** Compact projection used by search/list/facets responses. */
function shorthand(item) {
  return {
    id: item.id,
    source: item.source || SOURCE.REFERO,
    siteName: item.siteName,
    url: item.url,
    northStar: item.northStar,
    theme: item.colorScheme,
    industry: item.industry,
    colors: item.colors,
    fonts: item.fonts,
    thumbnailUrl: item.thumbnailUrl || "",
    screenshotUrl: item.screenshotUrl || "",
  };
}

// ------------------------------------------------------------------ tools
const TOOLS = [
  {
    name: "design_search",
    description:
      "Natural-language search over the local design-system catalog. Searches every source " +
      "(Refero styles, OpenDesign design systems) by name, vibe, industry, font, and color. " +
      "Runs entirely offline against the local cache.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: 'Natural-language query, e.g. "warm healthcare" or "dark developer tools".',
        },
        theme: { type: "string", enum: ["light", "dark"], description: "Filter by theme." },
        source: {
          type: "string",
          description: "Filter by source: refero or opendesign.",
        },
        limit: { type: "number", description: "How many results (default 10, max 50)." },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "design_get",
    description:
      "Resolve an identifier (id, site name, hostname, or URL) to the full design record, " +
      "including every color token, font, and the design prose. Serves from the local cache.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description: 'Design id, site name, hostname, or URL — e.g. "linear", "linear.app".',
        },
        source: { type: "string", description: "Restrict the lookup to one source." },
      },
      required: ["identifier"],
      additionalProperties: false,
    },
  },
  {
    name: "design_list",
    description:
      "List designs in the local catalog, optionally filtered by theme, source, or industry.",
    inputSchema: {
      type: "object",
      properties: {
        theme: { type: "string", enum: ["light", "dark"] },
        source: { type: "string" },
        industry: { type: "string" },
        limit: { type: "number", description: "How many (default 25, max 200)." },
        offset: { type: "number", description: "How many to skip (default 0)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_facets",
    description:
      "Distribution counts across the catalog: total designs, and breakdowns by theme, source, " +
      "industry, and font.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "design_markdown",
    description:
      "The DESIGN.md for one design — the canonical, agent-readable design brief. For Refero " +
      "entries it is rendered from the cached record; for OpenDesign entries it is the original " +
      "hand-written document.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: { type: "string", description: "Design id, site name, hostname, or URL." },
        source: { type: "string" },
      },
      required: ["identifier"],
      additionalProperties: false,
    },
  },
  {
    name: "design_component_search",
    description:
      "Search the AI component library — real React components with full source code " +
      "(shadcn-style registry exports). Filter by category or free-text query.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text match on name, description, category, variants." },
        category: { type: "string", description: "Component category, e.g. chat, voice, canvas." },
        limit: { type: "number", description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_component_get",
    description:
      "One component's full record: description, install command, FAQ, and every variant's " +
      "source code and dependencies.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Component slug, e.g. prompt-input." },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "design_component_code",
    description:
      "The source code for one component variant. Use this when you need to copy the " +
      "implementation into a project.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Component slug, e.g. prompt-input." },
        variant: { type: "string", description: "Variant id or name. Defaults to the first variant." },
        includeCode: { type: "boolean", description: "Include the source (default true)." },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "design_preset_search",
    description:
      "Search the preset catalogs — background gradients and patterns, liquid glass effects, " +
      "and color scales. Returns preset ids and names; use design_preset_get for the CSS.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text match on name, id, category." },
        kind: { type: "string", description: "Catalog to search, e.g. patterns, liquid-glass." },
        limit: { type: "number", description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_preset_get",
    description:
      "One preset catalog in full, with each preset's CSS style and React code template.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", description: "Catalog kind, e.g. patterns." },
      },
      required: ["kind"],
      additionalProperties: false,
    },
  },
];

// ------------------------------------------------------------------ handlers
function asString(value, field) {
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  const t = value.trim();
  if (!t) throw new Error(`${field} is required`);
  return t;
}

/**
 * A string that is allowed to be absent.
 *
 * Used for search queries, where listing everything is a valid request —
 * `asString` would reject the empty string.
 */
function optionalString(value) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") throw new Error("query must be a string");
  return value;
}

function asLimit(value, def, max) {
  if (value === undefined || value === null) return def;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("limit must be a number");
  }
  return Math.min(Math.floor(value), max);
}

function rankFacet(values, limit = 25) {
  const counts = new Map();
  const display = new Map();
  for (const raw of values) {
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (!display.has(key)) display.set(key, trimmed);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ value: display.get(key), count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, limit);
}

async function handleSearch(args) {
  const query = asString(args.query, "query");
  const limit = asLimit(args.limit, 10, 50);

  let pool = catalog;
  if (args.source) pool = pool.filter((d) => (d.source || SOURCE.REFERO) === args.source);
  if (args.theme) pool = pool.filter((d) => d.colorScheme === args.theme);

  const items = pool.map((d) => ({ id: d.id, text: searchText(d) }));
  const scored = score(query, items);
  const byId = new Map(pool.map((d) => [d.id, d]));

  const results = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => ({ ...shorthand(byId.get(s.id)), score: Number(s.score.toFixed(4)) }));

  return { query, count: results.length, results };
}

async function handleGet(args) {
  const identifier = asString(args.identifier, "identifier");
  const match = resolveDesign(identifier, catalog, { source: args.source });
  if (!match) {
    throw new Error(
      `No design matched ${JSON.stringify(identifier)}. ` +
        `Tried: exact id, hostname, exact site name, fuzzy site name. ` +
        `Run design_search or design_list to see what is cached.`,
    );
  }
  const payload = await readDesign(match.id, match.source);
  if (!payload) throw new Error(`design ${match.id} is in the catalog but its record is missing`);
  const full = mergeDesign(match, payload);
  return {
    ...shorthand(match),
    northStar: full.northStar ?? match.northStar,
    colors: full.colors ?? match.colors,
    fonts: full.fonts ?? match.fonts,
    fullResult: full.fullResult,
  };
}

async function handleList(args) {
  const limit = asLimit(args.limit, 25, 200);
  const offset = asLimit(args.offset, 0, 1_000_000);
  let pool = catalog;
  if (args.source) pool = pool.filter((d) => (d.source || SOURCE.REFERO) === args.source);
  if (args.theme) pool = pool.filter((d) => d.colorScheme === args.theme);
  if (args.industry) pool = pool.filter((d) => d.industry === args.industry);
  const page = pool.slice(offset, offset + limit).map(shorthand);
  return { total: pool.length, offset, limit, count: page.length, designs: page };
}

async function handleFacets() {
  const collect = (fn) => {
    const out = [];
    for (const d of catalog) {
      const v = fn(d);
      if (!v) continue;
      out.push(...(Array.isArray(v) ? v : [v]));
    }
    return out;
  };
  return {
    total: catalog.length,
    themes: rankFacet(collect((d) => d.colorScheme)),
    sources: rankFacet(collect((d) => d.source || SOURCE.REFERO)),
    industries: rankFacet(collect((d) => d.industry)),
    fonts: rankFacet(collect((d) => d.fonts), 50),
    updatedAt: loadedAt,
  };
}

async function handleMarkdown(args) {
  const identifier = asString(args.identifier, "identifier");
  const match = resolveDesign(identifier, catalog, { source: args.source });
  if (!match) {
    throw new Error(
      `No design matched ${JSON.stringify(identifier)}. ` +
        `Run design_search or design_list to see what is cached.`,
    );
  }
  const payload = await readDesign(match.id, match.source);
  if (!payload) throw new Error(`design ${match.id} is in the catalog but its record is missing`);
  const full = mergeDesign(match, payload);
  return {
    id: match.id,
    source: match.source || SOURCE.REFERO,
    siteName: match.siteName,
    designMd: designMarkdown(full),
  };
}

// ------------------------------------------------------------- components
/**
 * Component catalog search.
 *
 * The catalog is the merged index written by scripts/fetch-gradientdeck.mjs:
 * every component with its metadata and its variants' ids and filenames.
 */
async function handleComponentSearch(args) {
  const index = await readComponentsIndex();
  // `query` is optional — browsing by category alone is a valid request.
  const q = optionalString(args.query ?? args.q).trim().toLowerCase();
  const category = args.category ? asString(args.category, "category").toLowerCase() : null;

  let list = index.components || [];
  if (category) {
    list = list.filter((c) => (c.category || "").toLowerCase() === category);
  }
  if (q) {
    list = list.filter((c) =>
      `${c.title} ${c.description || ""} ${c.category || ""} ${c.slug} ${(c.variants || [])
        .map((v) => `${v.name} ${v.id} ${v.filename}`)
        .join(" ")}`
        .toLowerCase()
        .includes(q),
    );
  }

  const limit = Math.min(Math.max(Number(args.limit) || 20, 1), 100);
  return {
    total: list.length,
    returned: Math.min(list.length, limit),
    categories: [...new Set((index.components || []).map((c) => c.category).filter(Boolean))].sort(),
    components: list.slice(0, limit).map((c) => ({
      slug: c.slug,
      title: c.title,
      description: c.description,
      category: c.category,
      variantCount: (c.variants || []).length,
      variants: (c.variants || []).map((v) => ({ id: v.id, name: v.name, filename: v.filename })),
    })),
  };
}

/** One component's full record, including each variant's source code. */
async function handleComponentGet(args) {
  const slug = asString(args.slug, "slug");
  const component = await readComponent(slug);
  if (!component) {
    throw new Error(
      `No component "${slug}" in the cache. ` +
        `Run design_component_search to see what is cached.`,
    );
  }
  return component;
}

/**
 * The source code for one variant (or the first variant when unspecified).
 *
 * `includeCode` defaults to true; set it false to get just the metadata.
 */
async function handleComponentCode(args) {
  const slug = asString(args.slug, "slug");
  const component = await readComponent(slug);
  if (!component) {
    throw new Error(
      `No component "${slug}" in the cache. ` +
        `Run design_component_search to see what is cached.`,
    );
  }
  const variants = component.variants || [];
  if (!variants.length) {
    throw new Error(`Component "${slug}" has no variants cached.`);
  }

  let variant = variants[0];
  if (args.variant) {
    const wanted = asString(args.variant, "variant");
    const hit = variants.find((v) => v.id === wanted || v.variantId === wanted || v.name === wanted);
    if (!hit) {
      throw new Error(
        `Component "${slug}" has no variant "${wanted}". ` +
          `Available: ${variants.map((v) => v.id).join(", ")}`,
      );
    }
    variant = hit;
  }

  const includeCode = args.includeCode !== false;
  return {
    slug: component.slug,
    title: component.title,
    description: component.description,
    category: component.category,
    install: component.install,
    variant: {
      id: variant.id,
      name: variant.name,
      filename: variant.filename,
      dependencies: variant.dependencies,
      registryDependencies: variant.registryDependencies,
    },
    ...(includeCode ? { code: variant.code } : {}),
  };
}

// ----------------------------------------------------------------- presets
/** Search within the preset catalogs (gradients, patterns, glass, colors). */
async function handlePresetSearch(args) {
  const index = await readPresetsIndex();
  // `query` is optional — listing every preset in a catalog is valid.
  const q = optionalString(args.query ?? args.q).trim().toLowerCase();
  const kind = args.kind ? asString(args.kind, "kind") : null;

  const catalogs = (index.catalogs || []).filter((c) => !kind || c.kind === kind);
  if (!catalogs.length) {
    return {
      total: 0,
      returned: 0,
      kinds: (index.catalogs || []).map((c) => c.kind),
      presets: [],
    };
  }

  const limit = Math.min(Math.max(Number(args.limit) || 20, 1), 100);
  const hits = [];
  for (const c of catalogs) {
    const catalog = await readPresetCatalog(c.kind);
    if (!catalog) continue;
    for (const p of catalog.presets || []) {
      const hay = `${p.name || ""} ${p.label || ""} ${p.id || ""} ${p.category || ""} ${p.description || ""}`;
      if (q && !hay.toLowerCase().includes(q)) continue;
      hits.push({
        kind: c.kind,
        id: p.id,
        name: p.name || p.label,
        category: p.category,
        description: p.description,
      });
    }
  }

  return {
    total: hits.length,
    returned: Math.min(hits.length, limit),
    kinds: (index.catalogs || []).map((c) => c.kind),
    presets: hits.slice(0, limit),
  };
}

/** One preset catalog, with every preset record. */
async function handlePresetGet(args) {
  const kind = asString(args.kind, "kind");
  const catalog = await readPresetCatalog(kind);
  if (!catalog) {
    throw new Error(
      `No preset catalog "${kind}" in the cache. ` +
        `Run design_preset_search to see what is cached.`,
    );
  }
  return catalog;
}

async function dispatch(name, args) {
  switch (name) {
    case "design_search":
      return handleSearch(args);
    case "design_get":
      return handleGet(args);
    case "design_list":
      return handleList(args);
    case "design_facets":
      return handleFacets();
    case "design_markdown":
      return handleMarkdown(args);
    case "design_component_search":
      return handleComponentSearch(args);
    case "design_component_get":
      return handleComponentGet(args);
    case "design_component_code":
      return handleComponentCode(args);
    case "design_preset_search":
      return handlePresetSearch(args);
    case "design_preset_get":
      return handlePresetGet(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ------------------------------------------------------------------ server
function safeMessage(err) {
  if (err instanceof Error && err.message) {
    return err.message.replace(/https?:\/\/[^\s)]+/g, "[redacted-url]");
  }
  return "An unexpected error occurred";
}

async function main() {
  const catalogPath = join(CACHE_DIR, "catalog.json");
  if (!existsSync(catalogPath)) {
    console.error(
      `[design-mcp] no catalog at ${catalogPath}\n` +
        `[design-mcp] populate it first — this image ships the fetchers:\n` +
        `[design-mcp]   node scripts/refero-public-fetch.js --limit 0\n` +
        `[design-mcp]   node scripts/fetch-opendesign.mjs\n` +
        `[design-mcp]   node scripts/fetch-thumbs.mjs`,
    );
    process.exit(1);
  }
  await loadCatalog();

  const server = new Server(
    { name: "design-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const startedAt = Date.now();
    try {
      const result = await dispatch(name, args ?? {});
      console.error(
        JSON.stringify({
          event: "tool_call",
          tool: name,
          status: "success",
          durationMs: Date.now() - startedAt,
        }),
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      const message = safeMessage(err);
      console.error(
        JSON.stringify({
          event: "tool_call",
          tool: name,
          status: "error",
          durationMs: Date.now() - startedAt,
          error: message,
        }),
      );
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  });

  const transport = new StdioServerTransport();
  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    try {
      await server.close();
    } catch (err) {
      console.error(`[design-mcp] Error during shutdown (${signal}):`, err);
    }
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  await server.connect(transport);
}

main().catch((err) => {
  console.error("[design-mcp] Fatal startup error:", err);
  process.exit(1);
});