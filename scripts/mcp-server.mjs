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
import { readFile } from "node:fs/promises";
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
  readOpenDesignPackage,
  readClaudePackage,
  readDescriptors,
  mergeDesign,
  readComponentsIndex,
  readComponent,
  readPresetsIndex,
  readPresetCatalog,
  readDesignSystemsIndex,
  readDesignSystem,
} from "./lib/cache.mjs";
import { blankManifestTemplate } from "./lib/ds-manifest.mjs";
import { parseDesignMd, manifestFromDesignMd } from "./lib/design-md-parse.mjs";
import {
  combineTokens, isRecord, readCssTokens, renderDesignMdDraft, STITCH_TOKEN_GROUPS, validateDesignObservations,
} from "./lib/design-md-tokens.mjs";
import { resolveDesign } from "./lib/resolve.mjs";
import { isPackagePath, legacyPackageFiles } from "./lib/opendesign-package.mjs";
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
const MARKDOWN_INPUT_BYTES = 200_000;
const DESIGN_IDENTIFIER = {
  type: "string",
  description: "Exact gallery reference (designer:<source>:<id>), cached id, site name, hostname, or URL.",
};
const DESIGN_MD_INPUT = {
  identifier: DESIGN_IDENTIFIER,
  content: { type: "string", description: "Raw DESIGN.md markdown, up to 200,000 UTF-8 bytes." },
  source: { type: "string", enum: Object.values(SOURCE), description: "Disambiguate a cached identifier." },
  css: { type: "string", description: "Companion CSS text. Reads unconditional :root custom properties." },
  tokens: {
    type: "array",
    description: "Optional companion token rows from JSON or CSS. Document values take precedence for the same token path.",
    maxItems: 1000,
    items: {
      type: "object",
      properties: {
        name: { type: "string" },
        value: { type: ["string", "number"] },
        type: { type: "string", description: "Optional category, e.g. color, fontFamily, spacing, radius, shadow, or dimension." },
      },
      required: ["name", "value"],
    },
  },
};
const DESIGN_MD_ONE_INPUT = [
  { required: ["identifier"], not: { required: ["content"] } },
  { required: ["content"], not: { anyOf: [{ required: ["identifier"] }, { required: ["source"] }] } },
];

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
      "Resolve a gallery reference, id, site name, hostname, or URL to the full design record, " +
      "including color tokens and fonts. For OpenDesign, returns the package manifest and cached file list. " +
      "Use design_markdown for the design prose and design_package_file to read package files.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: DESIGN_IDENTIFIER,
        source: { type: "string", description: "Restrict the lookup to one source." },
      },
      required: ["identifier"],
      additionalProperties: false,
    },
  },
  {
    name: "design_package_file",
    description:
      "Read one cached OpenDesign package file, such as DESIGN.md, tokens.css, or components.html. " +
      "Get the exact reference and available paths from design_get. Files are returned as source.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          pattern: "^designer:opendesign:[a-z0-9-]+$",
          description: "Exact OpenDesign gallery reference, e.g. designer:opendesign:arc.",
        },
        path: { type: "string", description: "Exact relative file path from the package inventory." },
      },
      required: ["identifier", "path"],
      additionalProperties: false,
    },
  },
  {
    name: "design_claude_package",
    description:
      "Read one file from a system's Claude Design package — the same files Claude's own " +
      "Design System format uses (README.md, tokens.json, design-system.json, components). " +
      "Get the available paths from design_get. Files are returned as source.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          pattern: "^designer:opendesign:[a-z0-9-]+$",
          description: "Exact OpenDesign gallery reference, e.g. designer:opendesign:arc.",
        },
        path: { type: "string", description: "Exact relative file path from the package inventory." },
      },
      required: ["identifier", "path"],
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
        identifier: DESIGN_IDENTIFIER,
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
  {
    name: "design_template_list",
    description:
      "List the vendored design-system templates: six complete, generic systems " +
      "(Swiss modernist, classical serif, dark nocturne, organic rounded, newsprint " +
      "broadsheet, blueprint industry). Each entry carries swatches, fonts, token " +
      "and file counts, and its starter templates. Runs entirely offline.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Free-text match on slug, name, description, heading font.",
        },
        limit: { type: "number", description: "Max results (default 20, max 50)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_template_get",
    description:
      "One design-system template in full: the theme parameters it was generated " +
      "from, every token (name, value, kind), the component class table, the " +
      "starter templates, the complete file listing, and the filled design-system " +
      "manifest. Use design_template_file to read an individual file's content.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Template slug, e.g. modernist." },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "design_template_file",
    description:
      "One text file from a design-system template: the token sheet (styles.css), " +
      "a starter landing page, the written guide (readme.md), a foundation or " +
      "component card, a theme file. The path must be listed in the template's " +
      "files[] (see design_template_get). Binary assets are refused.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Template slug, e.g. nocturne." },
        path: {
          type: "string",
          description: "Folder-relative path from files[], e.g. styles.css.",
        },
      },
      required: ["slug", "path"],
      additionalProperties: false,
    },
  },
  {
    name: "design_manifest_template",
    description:
      "The design-system manifest JSON: the machine-readable contract for one " +
      "design system, with sections for overview/principles, colors, typography, " +
      "spacing, corner radius, shadows, components, and assets. Without arguments " +
      "returns the blank template; pass slug to get it filled from one of the " +
      "vendored design-system templates. Fill it in (or adapt a filled one) and " +
      "keep it beside the work as the token and component contract.",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "Optional template slug. Omit for the blank template.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_markdown_parse",
    description:
      "Import DESIGN.md from the catalog or pasted content. Reads Refero, OpenDesign, Google Stitch, " +
      "and WebDesignHot. Returns prose, rules, typed token paths, sources, and diagnostics. Runs offline.",
    inputSchema: {
      type: "object",
      properties: DESIGN_MD_INPUT,
      oneOf: DESIGN_MD_ONE_INPUT,
      additionalProperties: false,
    },
  },
  {
    name: "design_manifest_from",
    description:
      "Seed a design-system-manifest/v1 from a catalog or pasted DESIGN.md and optional companion tokens. " +
      "Returns the fields populated from source evidence, remaining gaps, and diagnostics.",
    inputSchema: {
      type: "object",
      properties: DESIGN_MD_INPUT,
      oneOf: DESIGN_MD_ONE_INPUT,
      additionalProperties: false,
    },
  },
  {
    name: "design_markdown_render",
    description:
      "Generate Google Stitch-style DESIGN.md from named design tokens and optional Markdown guidance. " +
      "Provide values from the source artifact, retaining unresolved design decisions in prose.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Name of the design system." },
        description: { type: "string" },
        tokens: {
          type: "object",
          properties: Object.fromEntries(STITCH_TOKEN_GROUPS.map((group) => [group, { type: "object" }])),
          additionalProperties: false,
          description: "Token tree keyed by colors, typography, spacing, rounded, and components.",
        },
        body: { type: "string", description: "Optional Markdown guidance with Overview, Colors, Typography, and other relevant sections." },
      },
      required: ["name", "tokens"],
      additionalProperties: false,
    },
  },
  {
    name: "design_markdown_validate",
    description:
      "Check a DESIGN.md for parse and token reference errors. Optionally compare named token paths with " +
      "observed values from a rendered webpage or document. Supply requiredTokens to check coverage of applied roles.",
    inputSchema: {
      type: "object",
      properties: {
        ...DESIGN_MD_INPUT,
        requiredTokens: {
          type: "array",
          minItems: 1,
          maxItems: 1000,
          uniqueItems: true,
          items: { type: "string", minLength: 1 },
          description: "Applied token paths that must each have a passing observation.",
        },
        observations: {
          type: "array",
          maxItems: 1000,
          items: {
            type: "object",
            properties: {
              location: { type: "string", description: "Selector, slide/shape, page/span, or other observable location." },
              token: { type: "string", description: "Expected token path, e.g. colors.primary." },
              value: { type: ["string", "number", "null"], description: "Observed value, or null when it could not be measured." },
              rootFontSize: { type: "number", exclusiveMinimum: 0, description: "Computed root font size in CSS px, for rem comparisons." },
            },
            required: ["location", "token", "value"],
          },
        },
      },
      oneOf: DESIGN_MD_ONE_INPUT,
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

function findCatalogDesign(identifier, source) {
  // Every upstream package has the same hostname. Match the package slug
  // before the generic hostname resolver can pick an unrelated system.
  const repo = /^https?:\/\/(?:www\.)?github\.com\/nexu-io\/open-design(?=[/?#]|$)([^?#]*)/i.exec(identifier);
  if (repo) {
    const slug = /^\/(?:tree|blob)\/.+?\/design-systems\/([a-z0-9-]+)(?:\/|$)/.exec(repo[1])?.[1];
    if (!slug) throw new Error("OpenDesign repository URL does not identify a package. Use a package URL or a gallery reference.");
    identifier = `designer:opendesign:${slug}`;
  }
  if (!identifier.startsWith("designer:")) return resolveDesign(identifier, catalog, { source });

  const parts = /^designer:([^:]+):([a-zA-Z0-9_-]+)$/.exec(identifier);
  if (!parts || !Object.values(SOURCE).includes(parts[1])) {
    throw new Error("Expected a gallery reference in the form designer:<source>:<id>.");
  }
  const [, exactSource, id] = parts;
  if (source !== undefined && source !== exactSource) throw new Error("source conflicts with the gallery reference.");
  const match = catalog.find((entry) => entry.id === id && (entry.source || SOURCE.REFERO) === exactSource);
  if (!match) throw new Error("Gallery theme is not in this cache. Open its DESIGN.md link in the gallery and pass the Markdown as content.");
  return match;
}

async function getPackageFiles(id, payload) {
  const record = await readOpenDesignPackage(id);
  const hasInventory = Array.isArray(record?.files);
  return {
    files: hasInventory ? record.files : legacyPackageFiles(payload),
    legacyCache: !hasInventory,
  };
}

async function handleGet(args) {
  const identifier = asString(args.identifier, "identifier");
  const match = findCatalogDesign(identifier, args.source);
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
  let packageInfo;
  if (match.source === SOURCE.OPENDESIGN) {
    const { files, legacyCache } = await getPackageFiles(match.id, payload);
    packageInfo = {
      reference: `designer:opendesign:${match.id}`,
      manifest: payload.manifest ?? null,
      legacyCache,
      files: files.map(({ path, bytes, encoding }) => ({ path, bytes, encoding })),
    };
    // The curated descriptors: the mood, the industry and the surface.
    // The tokens say what the system looks like; these say what it is for.
    const descriptor = (await readDescriptors())[match.id];
    if (descriptor) packageInfo.descriptor = descriptor;
    // The Claude Design files, for handing the system to Claude.
    const claude = await readClaudePackage(match.id);
    if (claude?.files?.length) {
      packageInfo.claudeFiles = claude.files.map(({ path, bytes, encoding }) => ({ path, bytes, encoding }));
    }
  }
  return {
    ...shorthand(match),
    northStar: full.northStar ?? match.northStar,
    colors: full.colors ?? match.colors,
    fonts: full.fonts ?? match.fonts,
    fullResult: full.fullResult,
    ...(packageInfo && { package: packageInfo }),
  };
}

async function handlePackageFile(args) {
  const identifier = asString(args.identifier, "identifier");
  if (!/^designer:opendesign:[a-z0-9-]+$/.test(identifier)) {
    throw new Error("Use an exact OpenDesign reference, such as designer:opendesign:arc.");
  }
  if (!isPackagePath(args.path)) throw new Error("path must be a safe relative package file path.");
  const match = findCatalogDesign(identifier, SOURCE.OPENDESIGN);
  const payload = await readDesign(match.id, match.source);
  if (!payload) throw new Error(`design ${match.id} is in the catalog but its record is missing`);
  const { files, legacyCache } = await getPackageFiles(match.id, payload);
  // Request paths are compared with the stored inventory, never opened on disk.
  const file = files.find((item) => item.path === args.path);
  if (!file) {
    throw new Error(legacyCache
      ? "File is not in this cache. Use design_get to list available files, or refresh the OpenDesign cache."
      : "File is not in the cached package. Use design_get to list available files.");
  }
  return { id: match.id, source: match.source, ...file };
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
  const { match, md } = await resolveMarkdown(identifier, args.source);
  return {
    id: match.id,
    source: match.source || SOURCE.REFERO,
    siteName: match.siteName,
    designMd: md,
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

// ------------------------------------------------------------- templates
async function handleTemplateList(args) {
  const query = optionalString(args.query).trim().toLowerCase();
  const limit = asLimit(args.limit, 20, 50);
  const index = await readDesignSystemsIndex();
  let systems = index.systems || [];
  if (query) {
    systems = systems.filter((s) =>
      `${s.slug} ${s.name} ${s.description} ${s.headingFont}`
        .toLowerCase()
        .includes(query),
    );
  }
  return {
    total: systems.length,
    catalogTotal: index.total || systems.length,
    templates: systems.slice(0, limit),
  };
}

async function handleTemplateGet(args) {
  const slug = asString(args.slug, "slug");
  const record = await readDesignSystem(slug);
  if (!record) {
    throw new Error(
      `No design-system template "${slug}". ` +
        `Run design_template_list to see what is cached.`,
    );
  }
  return record;
}

async function handleTemplateFile(args) {
  const slug = asString(args.slug, "slug");
  const filePath = asString(args.path, "path");
  const record = await readDesignSystem(slug);
  if (!record) {
    throw new Error(
      `No design-system template "${slug}". ` +
        `Run design_template_list to see what is cached.`,
    );
  }
  const entry = (record.files || []).find((f) => f.path === filePath);
  if (!entry) {
    throw new Error(
      `"${filePath}" is not part of ${slug}. ` +
        `Check files[] from design_template_get.`,
    );
  }
  if (entry.binary) {
    throw new Error(`"${filePath}" is binary and cannot be served as text.`);
  }
  // files[] is generated from the vendored index, but stay defensive about
  // traversal before it becomes a filesystem path.
  if (filePath.includes("..")) {
    throw new Error(`"path" must not contain "..".`);
  }
  const full = join(CACHE_DIR, "design-systems", slug, filePath);
  const content = await readFile(full, "utf8");
  return { slug, path: filePath, bytes: Buffer.byteLength(content), content };
}

async function handleManifestTemplate(args) {
  if (args.slug === undefined || args.slug === null || args.slug === "") {
    return blankManifestTemplate();
  }
  const slug = asString(args.slug, "slug");
  const record = await readDesignSystem(slug);
  if (!record) {
    throw new Error(
      `No design-system template "${slug}". ` +
        `Run design_template_list to see what is cached.`,
    );
  }
  return record.manifest;
}

// ---------------------------------------------------------- design markdown
/** Resolve an identifier to its DESIGN.md text. */
async function resolveMarkdown(identifier, source) {
  const match = findCatalogDesign(identifier, source);
  if (!match) {
    throw new Error(
      `No design matched ${JSON.stringify(identifier)}. ` +
        `Run design_search or design_list to see what is cached.`,
    );
  }
  const payload = await readDesign(match.id, match.source);
  if (!payload) throw new Error(`design ${match.id} is in the catalog but its record is missing`);
  const full = mergeDesign(match, payload);
  return { match, full, md: designMarkdown(full) };
}

function markdownContent(value) {
  if (typeof value !== "string" || !value.trim()) throw new Error("content must be a non-empty string");
  if (Buffer.byteLength(value) > MARKDOWN_INPUT_BYTES) throw new Error("content exceeds 200,000 UTF-8 bytes");
  return value;
}

function inputRows(value, name) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 1000 || Buffer.byteLength(JSON.stringify(value)) > MARKDOWN_INPUT_BYTES) {
    throw new Error(`${name} must be an array of up to 1,000 rows and 200,000 UTF-8 bytes`);
  }
  return value;
}

async function readMarkdownInput(args) {
  const hasId = args.identifier !== undefined;
  const hasContent = args.content !== undefined;
  if (hasId === hasContent) throw new Error("Provide exactly one of identifier or content.");
  const suppliedTokens = [...inputRows(args.tokens, "tokens")];
  if (args.css !== undefined) {
    if (typeof args.css !== "string" || Buffer.byteLength(args.css) > MARKDOWN_INPUT_BYTES) {
      throw new Error("css must be text of at most 200,000 UTF-8 bytes");
    }
    try {
      suppliedTokens.push(...inputRows(readCssTokens(args.css), "CSS tokens"));
    } catch (error) {
      if (error.name !== "CssSyntaxError") throw error;
      throw new Error(`Invalid companion CSS at line ${error.line}, column ${error.column}: ${error.reason}`);
    }
  }
  if (hasContent) {
    if (args.source !== undefined) throw new Error("source requires a catalog identifier");
    const md = markdownContent(args.content);
    return { bytes: Buffer.byteLength(md), parsed: combineTokens(parseDesignMd(md), suppliedTokens) };
  }

  const identifier = asString(args.identifier, "identifier");
  if (args.source !== undefined && !Object.values(SOURCE).includes(args.source)) throw new Error("unknown source");
  const { match, full, md } = await resolveMarkdown(identifier, args.source);
  const source = match.source || SOURCE.REFERO;
  const parsed = parseDesignMd(md, { source });
  let cachedTokens = full.tokens?.tokens;
  if (!Array.isArray(cachedTokens) || !cachedTokens.length) {
    try {
      cachedTokens = full.tokensCss ? readCssTokens(full.tokensCss) : [];
    } catch (error) {
      if (error.name !== "CssSyntaxError") throw error;
      parsed.diagnostics.push({ severity: "warning", code: "invalid-cached-css", line: error.line });
      cachedTokens = [];
    }
  }
  return {
    id: match.id,
    source,
    siteName: match.siteName,
    bytes: Buffer.byteLength(md),
    parsed: combineTokens(parsed, [...suppliedTokens, ...cachedTokens]),
  };
}

async function handleMarkdownParse(args) {
  const { parsed, ...source } = await readMarkdownInput(args);
  return { ...source, format: parsed.format, parsed };
}

async function handleManifestFrom(args) {
  const { parsed, bytes: _bytes, ...source } = await readMarkdownInput(args);
  const manifest = manifestFromDesignMd(parsed);
  return { ...source, schemaVersion: manifest.schemaVersion, manifest };
}

function handleMarkdownRender(args) {
  const name = asString(args.name, "name");
  const description = args.description === undefined ? "" : asString(args.description, "description");
  if (args.body !== undefined && typeof args.body !== "string") throw new Error("body must be a string");
  if (!isRecord(args.tokens) || Object.entries(args.tokens).some(
    ([group, value]) => !STITCH_TOKEN_GROUPS.includes(group) || !isRecord(value),
  )) throw new Error("tokens must contain supported token groups as objects");
  if (Buffer.byteLength(JSON.stringify(args.tokens)) + Buffer.byteLength(args.body ?? "") > MARKDOWN_INPUT_BYTES) {
    throw new Error("draft exceeds 200,000 UTF-8 bytes");
  }
  const designMd = markdownContent(renderDesignMdDraft({ name, description, tokens: args.tokens, body: args.body }));
  const parsed = parseDesignMd(designMd);
  return { designMd, format: parsed.format, diagnostics: parsed.diagnostics };
}

async function handleMarkdownValidate(args) {
  const observations = inputRows(args.observations, "observations");
  for (const row of observations) {
    if (!isRecord(row) || typeof row.location !== "string" || !row.location.trim() ||
        typeof row.token !== "string" || !row.token.trim() ||
        (row.value !== null && typeof row.value !== "string" && typeof row.value !== "number") ||
        (row.rootFontSize !== undefined && (!Number.isFinite(row.rootFontSize) || row.rootFontSize <= 0))) {
      throw new Error("each observation needs a location, token path, and string, number, or null value");
    }
  }
  let requiredTokens;
  if (args.requiredTokens !== undefined) {
    requiredTokens = inputRows(args.requiredTokens, "requiredTokens");
    if (!requiredTokens.length || requiredTokens.some((path) => typeof path !== "string" || !path.trim() || path !== path.trim()) ||
        new Set(requiredTokens).size !== requiredTokens.length) {
      throw new Error("requiredTokens must contain distinct, non-empty token paths without surrounding whitespace.");
    }
  }
  const { parsed } = await readMarkdownInput(args);
  return validateDesignObservations(parsed, observations, requiredTokens);
}

async function handleClaudePackageFile(args) {
  const identifier = asString(args.identifier, "identifier");
  if (!/^designer:opendesign:[a-z0-9-]+$/.test(identifier)) {
    throw new Error("Use an exact OpenDesign reference, such as designer:opendesign:arc.");
  }
  if (!isPackagePath(args.path)) throw new Error("path must be a safe relative package file path.");
  const match = findCatalogDesign(identifier, SOURCE.OPENDESIGN);
  if (!match) throw new Error(`No design matched ${JSON.stringify(identifier)}`);
  const pkg = await readClaudePackage(match.id);
  const files = pkg?.files ?? [];
  if (!files.length) {
    throw new Error(
      `No Claude Design package is cached for ${match.id}. ` +
        `Run the Agent Kit fetcher (scripts/fetch-agentkit.mjs) to populate it.`,
    );
  }
  // Request paths are compared with the stored inventory, never opened on disk.
  const file = files.find((item) => item.path === args.path);
  if (!file) {
    throw new Error("File is not in the cached Claude Design package. Use design_get to list available files.");
  }
  return { id: match.id, source: match.source, ...file };
}

async function dispatch(name, args) {
  switch (name) {
    case "design_search":
      return handleSearch(args);
    case "design_get":
      return handleGet(args);
    case "design_package_file":
      return handlePackageFile(args);
    case "design_claude_package":
      return handleClaudePackageFile(args);
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
    case "design_template_list":
      return handleTemplateList(args);
    case "design_template_get":
      return handleTemplateGet(args);
    case "design_template_file":
      return handleTemplateFile(args);
    case "design_manifest_template":
      return handleManifestTemplate(args);
    case "design_markdown_parse":
      return handleMarkdownParse(args);
    case "design_manifest_from":
      return handleManifestFrom(args);
    case "design_markdown_render":
      return handleMarkdownRender(args);
    case "design_markdown_validate":
      return handleMarkdownValidate(args);
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

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map((tool) => ({ ...tool, annotations: { readOnlyHint: true, openWorldHint: false } })),
  }));
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
