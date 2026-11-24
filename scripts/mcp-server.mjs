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
 * Those five are the core. The same server also carries the component,
 * preset, library, asset, template, DESIGN.md, ui-sdk docs, HeroUI, Mantine,
 * daisyUI and Base UI layers: the TOOLS array below is the full list.
 *
 * By default everything is served from the local cache and this server makes
 * NO outbound network calls. The one exception is opt-in: DESIGN_REMOTE_URL
 * or --url points the readers at a hosted static copy of the same cache.
 *
 * The upstream package stays untouched and remains registered as its own MCP
 * server for the Refero-specific tools.
 */

import { existsSync, statSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  CACHE_DIR,
  SYSTEMS_DIR,
  SOURCE,
  getRemoteUrl,
  setRemoteUrl,
  remoteStatus,
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
  readLibrariesIndex,
  readLibraryEntry,
  readDesignSystemsIndex,
  readDesignSystem,
  readDesignSystemFile,
  readReuiIndex,
  readReuiCategory,
  readDashboard,
} from "./lib/cache.mjs";
import {
  addPick,
  clearPicks,
  parseDesignerRef,
  picksFilePath,
  readPicks,
  removePick,
} from "./lib/picks.mjs";
import { blankManifestTemplate } from "./lib/ds-manifest.mjs";
import { parseDesignMd, manifestFromDesignMd } from "./lib/design-md-parse.mjs";
import {
  combineTokens, isRecord, readCssTokens, renderDesignMdDraft, STITCH_TOKEN_GROUPS, validateDesignObservations,
} from "./lib/design-md-tokens.mjs";
import { resolveDesignDetailed } from "./lib/resolve.mjs";
import { isPackagePath, legacyPackageFiles } from "./lib/opendesign-package.mjs";
import { score, searchText } from "./lib/score.mjs";
import { listUiSdkDocs, readUiSdkDoc, searchUiSdkDocs } from "./lib/ui-sdk-docs.mjs";
import {
  heroUiSlug,
  readHeroUiCatalog,
  readHeroUiDoc,
  readHeroUiMigrationDoc,
  readHeroUiMigrationIndex,
  readHeroUiSource,
  readHeroUiStyles,
  readHeroUiTheme,
  searchHeroUiDocs,
} from "./lib/heroui-docs.mjs";
import {
  readMantineCatalog,
  readMantineComponent,
  readMantineProvenance,
  searchMantine,
} from "./lib/mantine-docs.mjs";
import {
  readDaisyuiCatalog,
  readDaisyuiComponent,
  readDaisyuiProvenance,
  searchDaisyui,
} from "./lib/daisyui-docs.mjs";
import { baseUiSlug, readBaseUiCatalog, readBaseUiDoc, searchBaseUiDocs } from "./lib/baseui-docs.mjs";
import {
  findUikitItem,
  readUikitCatalog,
  readUikitFile,
  readUikitFiles,
  readUikitsIndex,
  searchUikits,
} from "./lib/uikit-docs.mjs";
import {
  readReferoStyle,
  readReferoStylesCatalog,
  readReferoStylesProvenance,
  searchReferoStyles,
} from "./lib/refero-styles-docs.mjs";
import { loadFrontend } from "./lib/frontend.mjs";
import { buildUnifiedDesignsIndex } from "./lib/designs-index.mjs";
import { buildUnifiedComponentsHub, LIBRARY_META } from "./lib/components-index.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DASHBOARDS_DIR = process.env.DESIGN_DASHBOARDS_DIR
  ? process.env.DESIGN_DASHBOARDS_DIR
  : process.env.SKILLS_ROOT && existsSync(join(process.env.SKILLS_ROOT, "designer-dashboards"))
    ? join(process.env.SKILLS_ROOT, "designer-dashboards")
    : process.env.SKILL_DIR && existsSync(join(process.env.SKILL_DIR, "designer-dashboards"))
      ? join(process.env.SKILL_DIR, "designer-dashboards")
      : join(HERE, "..", "plugins", "designer-mcp", "skills", "designer-dashboards");
const DASHBOARD_LIST_KINDS = ["all", "stacks", "starters", "presets", "verticals", "frameworks", "references", "subskills"];
const DASHBOARD_GET_KINDS = ["stack", "starter", "preset", "vertical", "framework", "reference", "skill"];

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
// Why the catalog tools cannot answer, or "" when they can. The server starts
// either way: exiting here used to surface in the client as a bare
// "Connection closed", and took down the layers that need no catalog.
let catalogProblem = "";
// True while the catalog in memory is the disk copy standing in for a remote
// host that did not answer. Catalog replies say so until the host is back.
let catalogFellBack = false;
let catalogCheckedAt = 0;
const CATALOG_RETRY_MS = 15_000;
const CATALOG_FALLBACK_RETRY_MS = 60_000;

async function loadCatalog() {
  catalogCheckedAt = Date.now();
  const failuresBefore = remoteStatus().failures;
  const { designs, updatedAt } = await readCatalog();
  const remoteFailed = remoteStatus().failures > failuresBefore;
  catalogProblem = designs.length > 0 ? "" : describeMissingCatalog(remoteFailed);
  catalogFellBack = remoteFailed && designs.length > 0;

  if (designs.length > 0) {
    try {
      const desc = await readDescriptors().catch(() => ({}));
      const descMap = desc?.systems || {};
      const rsCatalog = await readReferoStylesCatalog().catch(() => null);
      const domainToStyle = new Map();
      if (rsCatalog?.styles) {
        for (const s of rsCatalog.styles) {
          if (s.domain) domainToStyle.set(s.domain.toLowerCase(), s);
        }
      }
      for (const d of designs) {
        if (d.source === SOURCE.OPENDESIGN && descMap[d.id]) {
          const info = descMap[d.id];
          if (info.moods) d.moods = info.moods;
          if (info.surfaces) d.surfaces = info.surfaces;
        }
        const domain = (d.url ? String(d.url).replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase() : "");
        if (domain) {
          d.domain = domain;
          const matchedStyle = domainToStyle.get(domain);
          if (matchedStyle) {
            d.styleProfile = {
              uuid: matchedStyle.uuid,
              siteName: matchedStyle.siteName,
              recipesCount: matchedStyle.componentRecipesCount || 0,
            };
          }
        }
      }
    } catch {
      // enrichment failure is non-fatal
    }
  }

  catalog = designs;
  // The catalog's own timestamp. Falls back to load time for a catalog
  // written before the field existed.
  loadedAt = updatedAt || Date.now();
  catalogWarning = await findCatalogWarning();
  if (catalogWarning) console.error(`[design-mcp] ${catalogWarning}`);
}

/** Why there are no designs, and what to do about it, for stderr and for tool errors. */
function describeMissingCatalog(remoteFailed) {
  const path = join(CACHE_DIR, "catalog.json");
  const scope =
    " Only the style and design-system tools need it: the component, preset, template, " +
    "and UI library tools work without it.";
  const remote = remoteStatus();
  if (remote.configured && remoteFailed) {
    return (
      `The remote catalog host did not answer (${remote.lastError}) and there is no local catalog ` +
      `at ${path} to fall back to. Call again once the host is reachable.` + scope
    );
  }
  if (remote.configured) {
    return "The remote host has no api/catalog.json, so there are no designs to read." + scope;
  }
  return (
    `No designs in the catalog at ${path} (missing or empty). Populate the cache ` +
    "(npm run fetch && npm run opendesign, or mount a cache volume) and call again: " +
    "no restart is needed." + scope
  );
}

/**
 * Fail a catalog tool with the reason rather than an empty result. A server
 * that answers "0 designs" looks like a working server with no data.
 *
 * Looks again first, at most every CATALOG_RETRY_MS: the cache may have been
 * populated, or the remote host may be back, since startup.
 */
async function ensureCatalog() {
  if (catalogFellBack && Date.now() - catalogCheckedAt >= CATALOG_FALLBACK_RETRY_MS) {
    // There is a usable catalog, so do not make this call wait on a host
    // that may still be timing out: ask again in the background.
    void loadCatalog().catch(() => {});
  }
  if (!catalogProblem) return;
  if (Date.now() - catalogCheckedAt >= CATALOG_RETRY_MS) await loadCatalog();
  if (catalogProblem) throw new Error(catalogProblem);
}

// The tools that read the design catalog. The three DESIGN.md tools need it
// only when given an identifier; pasted content needs no catalog.
const CATALOG_TOOLS = new Set([
  "design_search", "design_get", "design_file", "design_package_file", "design_claude_package",
  "design_list", "design_facets", "design_markdown", "design_markdown_check",
  "design_markdown_parse", "design_manifest_from", "design_markdown_validate",
]);
const CONTENT_INPUT_TOOLS = new Set([
  "design_markdown_check", "design_markdown_parse", "design_manifest_from", "design_markdown_validate",
]);
const LEGACY_TOOLS_MODE =
  process.argv.includes("--legacy-tools") ||
  /^(1|true|yes)$/i.test(process.env.DESIGN_LEGACY_TOOLS || "");

/**
 * Detect a catalog that lost its OpenDesign half.
 *
 * The upstream `refero_refresh` tool rewrites catalog.json with Refero rows
 * only. The OpenDesign records stay on disk but drop out of every search and
 * list, and nothing else would say why. Local cache only: a remote host
 * serves whatever catalog it built.
 */
let catalogWarning = "";
async function findCatalogWarning() {
  if (getRemoteUrl()) return "";
  if (catalog.some((d) => d.source === SOURCE.OPENDESIGN)) return "";
  let onDisk = 0;
  try {
    onDisk = (await readdir(SYSTEMS_DIR)).filter((name) => name.endsWith(".json")).length;
  } catch {
    return ""; // No systems directory: a Refero-only cache, which is fine.
  }
  if (onDisk === 0) return "";
  return (
    `The catalog lists no OpenDesign design systems, but ${onDisk} are cached on disk. ` +
    "catalog.json was probably rewritten by refero_refresh, which keeps Refero rows only. " +
    "Re-run `npm run opendesign` (or re-bake) to merge them back."
  );
}

// A search or list row is for choosing a design, not for building from it.
// The full palette (every swatch with a sentence of role prose) was 70% of
// each row, so rows carry a short palette and design_get carries the rest.
const ROW_COLOR_LIMIT = 8;

/** A short palette: hex, name and group, accents before neutrals. */
function rowColors(colors) {
  if (!Array.isArray(colors)) return [];
  // Cached order lists neutrals first; a plain "first N" cut would drop the
  // brand color of most designs. sort() is stable, so order within each
  // half is kept.
  const isNeutral = (c) => c?.group === "neutral";
  return [...colors]
    .sort((a, b) => Number(isNeutral(a)) - Number(isNeutral(b)))
    .slice(0, ROW_COLOR_LIMIT)
    .map((c) => ({ hex: c.hex, name: c.name, ...(c.group && { group: c.group }) }));
}

/**
 * Projection used by search and list rows, and as the head of design_get.
 *
 * `full` returns every swatch with its role text and both image fields, the
 * shape these tools returned up to v1.8.0.
 */
function shorthand(item, full = false) {
  const base = {
    id: item.id,
    source: item.source || SOURCE.REFERO,
    siteName: item.siteName,
    url: item.url,
    northStar: item.northStar,
    theme: item.colorScheme,
    industry: item.industry,
    ...(item.styleProfile ? { styleProfile: item.styleProfile } : {}),
  };
  if (full) {
    return {
      ...base,
      colors: item.colors,
      fonts: item.fonts,
      thumbnailUrl: item.thumbnailUrl || "",
      screenshotUrl: item.screenshotUrl || "",
    };
  }
  const total = Array.isArray(item.colors) ? item.colors.length : 0;
  return {
    ...base,
    colors: rowColors(item.colors),
    // Only when the palette was cut, so the caller knows design_get has more.
    ...(total > ROW_COLOR_LIMIT && { colorCount: total }),
    fonts: item.fonts,
  };
}

// ------------------------------------------------------------------ tools
const MARKDOWN_INPUT_BYTES = 200_000;
// Closed sets, shared by the schemas and the handlers so they cannot drift.
const THEMES = ["light", "dark", "mixed"];
const SOURCES = Object.values(SOURCE);
const DOC_KINDS = ["component", "guide"];
const DOC_SECTIONS = ["core", "react", "web", "references", "skill"];
// UI kits layer. Kit ids must match data/uikits/pins.json; the selftest
// sweeps every kit, so drift between the two fails loudly there.
const UIKIT_IDS = [
  "chakra", "mui", "antd", "primereact", "coss", "magicui", "motion",
  "unocss", "panda", "vanilla-extract", "stylex", "openprops", "ark",
  "reactbits", "aceternity", "twentyfirst",
];
const UIKIT_ALIASES = {
  "coss-ui": "coss",
  "magic-ui": "magicui",
  "motion-primitives": "motion",
  "panda-css": "panda",
  "open-props": "openprops",
  "ark-ui": "ark",
  "react-bits": "reactbits",
  "aceternity-ui": "aceternity",
  "21st-dev": "twentyfirst",
  "21st": "twentyfirst",
  "material-ui": "mui",
  "ant-design": "antd",
  "chakra-ui": "chakra",
};

function normalizeUikitId(val) {
  if (typeof val !== "string") return val;
  const s = val.trim().toLowerCase();
  return UIKIT_ALIASES[s] || s;
}

function asUikitId(value, field = "kit", { required = false } = {}) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${field} is required; must be one of: ${UIKIT_IDS.join(", ")}`);
    return undefined;
  }
  const norm = normalizeUikitId(value);
  if (!UIKIT_IDS.includes(norm)) {
    throw new Error(`${field} must be one of: ${UIKIT_IDS.join(", ")}`);
  }
  return norm;
}

const UIKIT_KINDS = ["component", "guide", "topic", "tokens", "index"];
// Rows in one page of a kit's item list (design_kit_list / design_uikit_list).
const UIKIT_PAGE_ROWS = 40;
const UIKIT_MAX_ROWS = 500;
const UIKIT_SCHEMA = {
  type: "string",
  enum: UIKIT_IDS,
  description: "Kit id from design_uikit_list (see that tool's description for the full set).",
};
// Long documents are returned a page at a time. The default keeps one call
// near 10k tokens; the ceiling stays under the reply limit after JSON escaping.
const DEFAULT_PAGE_BYTES = 40_000;
const MAX_PAGE_BYTES = 100_000;
const PAGE_PROPERTIES = {
  offset: {
    type: "integer",
    minimum: 0,
    maximum: 100_000_000,
    description: "Resume at previous nextOffset.",
  },
  maxBytes: {
    type: "integer",
    minimum: 1000,
    maximum: MAX_PAGE_BYTES,
    description: "Max bytes per reply (default 40000).",
  },
};
const OUTLINE_PROPERTIES = {
  ...PAGE_PROPERTIES,
  outline: {
    type: "boolean",
    description: "Return heading outline with byte offsets rather than full text.",
  },
  section: {
    type: "string",
    description: "Extract only this section by heading title.",
  },
};
const MAX_PRESET_IDS = 20;
const DETAIL_LEVELS = ["summary", "full"];
const DETAIL_PROPERTY = {
  type: "string",
  enum: DETAIL_LEVELS,
  description: '"summary" (default) or "full".',
};
// One component doc runs 15 to 350 KB. Without a cap a single call could
// return every doc in the layer (megabytes).
const MAX_DOC_COMPONENTS = 5;
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
// "Exactly one of identifier or content" is enforced in readMarkdownInput, not
// in the schema: a top-level oneOf is rejected by strict tool-schema
// validators, and one rejected schema can fail the whole tool list.
const DESIGN_MD_ONE_INPUT_NOTE =
  " Pass exactly one of identifier or content.";

const LEGACY_TOOLS = [
  {
    name: "design_search",
    description:
      "Natural-language search over local design systems (Refero, OpenDesign) by vibe, industry, font, color. Runs offline.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: 'Natural-language query, e.g. "warm healthcare" or "dark developer tools".',
        },
        theme: { type: "string", enum: THEMES, description: "Filter by theme." },
        source: {
          type: "string",
          enum: Object.values(SOURCE),
          description: "Filter by source: refero or opendesign.",
        },
        limit: { type: "integer", minimum: 1, maximum: 50, description: "How many results (default 10, max 50)." },
        detail: { ...DETAIL_PROPERTY, description: '"summary" (default, short palette) or "full" (every swatch with its role).' },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "design_get",
    description:
      "Resolve a gallery ref, id, site, host, or URL to full design record, color tokens, and package files.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: DESIGN_IDENTIFIER,
        source: { type: "string", enum: SOURCES, description: "Restrict the lookup to one source." },
        detail: { ...DETAIL_PROPERTY, description: '"summary" (default) or "full" (adds the raw token dump).' },
      },
      required: ["identifier"],
      additionalProperties: false,
    },
  },
  {
    name: "design_package_file",
    description:
      "Read one cached OpenDesign package file (e.g. DESIGN.md, tokens.css) by relative path.",
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
      "Read one file from a Claude Design package (README.md, tokens.json, components) by relative path.",
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
        theme: { type: "string", enum: THEMES, description: "Filter by theme." },
        source: { type: "string", enum: SOURCES, description: "Filter by source: refero or opendesign." },
        industry: { type: "string", description: "Exact industry label, as listed by design_facets." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "How many (default 25, max 100). Page with offset." },
        offset: { type: "integer", minimum: 0, maximum: 1000000, description: "How many to skip (default 0)." },
        detail: { ...DETAIL_PROPERTY, description: '"summary" (default, short palette) or "full" (every swatch with its role).' },
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
        source: { type: "string", enum: SOURCES, description: "Restrict the lookup to one source." },
      },
      required: ["identifier"],
      additionalProperties: false,
    },
  },
  {
    name: "design_component_search",
    description:
      "Search the AI component library — AI/agent React components (chat, voice, agent activity) + Slopstrap " +
      "with full source code (shadcn-style registry exports), not HeroUI, Mantine, daisyUI, or Base UI. " +
      "Filter by category or free-text query.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text match on name, description, category, variants." },
        category: { type: "string", description: "Component category, e.g. chat, voice, writing. Every search reply lists them all." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_component_get",
    description:
      "One component's record: description, install command, FAQ, and each variant's id, file, and " +
      "dependencies. Source comes from design_component_code.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Component slug, e.g. prompt-input." },
        detail: { ...DETAIL_PROPERTY, description: '"summary" (default) or "full" (inlines every variant\'s source).' },
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
        ...PAGE_PROPERTIES,
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
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_preset_get",
    description:
      "Presets from one catalog with their CSS style and React code template, a page at a time; " +
      "pass ids from design_preset_search to fetch specific ones.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", description: "Catalog kind, e.g. patterns." },
        ids: {
          type: "array",
          items: { type: "string" },
          maxItems: MAX_PRESET_IDS,
          description: "Preset ids to return. Omit to page through the catalog.",
        },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Page size (default 20, max 100)." },
        offset: { type: "integer", minimum: 0, maximum: 100000, description: "How many to skip (default 0)." },
      },
      required: ["kind"],
      additionalProperties: false,
    },
  },
  {
    name: "design_library_search",
    description:
      "Search the vendored library catalog: common frontend libraries (react, tailwind, shadcn, " +
      "radix-ui, lucide, heroicons, motion) and font sources (google-fonts, fontsource) with the " +
      "exact files and steps needed to install each. Use design_library_get for the full entry " +
      "with file contents.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text match on name, id, category, summary, keywords." },
        category: { type: "string", description: "Filter by category, e.g. framework, css, components, fonts, icons." },
        limit: { type: "integer", minimum: 1, maximum: 50, description: "Max results (default 20, max 50)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_library_get",
    description:
      "One library entry in full: install steps (cli, npm, cdn), the files the setup needs with " +
      "their contents (components.json, cn helper, theme css, font wiring), and what depends on " +
      "what. This answers 'what files would I need to install X'.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Library id from design_library_search, e.g. shadcn, tailwind." },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "design_asset_list",
    description:
      "Inventory built frontend CDN assets: starter, bundled modules, Tailwind examples, and packages.",
    inputSchema: {
      type: "object",
      properties: {
        detail: { ...DETAIL_PROPERTY, description: '"summary" (default, grouped counts) or "full" (includes all 200+ vendored packages).' },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_asset_importmap",
    description:
      "Import map resolving bare module specifiers to content-addressed asset URLs for offline usage.",
    inputSchema: {
      type: "object",
      properties: {
        origin: {
          type: "string",
          description: "Gallery origin to compose absolute URLs against, e.g. http://127.0.0.1:8787. Omit for origin-relative paths under base.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_template_list",
    description:
      "List the vendored design-system templates: seven complete, generic systems " +
      "(Swiss modernist, classical serif, dark nocturne, organic rounded, newsprint " +
      "broadsheet, blueprint industry, slide-first loam). Each entry carries swatches, " +
      "fonts, token and file counts, and its starter templates. Runs entirely offline.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Free-text match on slug, name, description, heading font.",
        },
        limit: { type: "integer", minimum: 1, maximum: 50, description: "Max results (default 20, max 50)." },
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
        offset: PAGE_PROPERTIES.offset,
        maxBytes: { ...PAGE_PROPERTIES.maxBytes, description: "Max bytes of text per reply (default 100000, the maximum)." },
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
      "and WebDesignHot. Returns prose, rules, typed token paths, sources, and diagnostics. Runs offline." +
      DESIGN_MD_ONE_INPUT_NOTE,
    inputSchema: {
      type: "object",
      properties: DESIGN_MD_INPUT,
      additionalProperties: false,
    },
  },
  {
    name: "design_manifest_from",
    description:
      "Seed a design-system-manifest/v1 from a catalog or pasted DESIGN.md and optional companion tokens. " +
      "Returns the fields populated from source evidence, remaining gaps, and diagnostics." +
      DESIGN_MD_ONE_INPUT_NOTE,
    inputSchema: {
      type: "object",
      properties: DESIGN_MD_INPUT,
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
        description: { type: "string", description: "One-line summary for the document front matter." },
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
      "observed values from a rendered webpage or document. Supply requiredTokens to check coverage of applied roles." +
      DESIGN_MD_ONE_INPUT_NOTE,
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
      additionalProperties: false,
    },
  },
  {
    name: "design_docs_search",
    description:
      "@ui-sdk/* only — search offline ui-sdk (@ui-sdk/core, @ui-sdk/react, @ui-sdk/web) documentation and skill references by keyword or section. Not for HeroUI, Mantine, daisyUI, or Base UI (use design_{heroui,mantine,daisyui,baseui}_search).",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords (e.g. 'select', 'dialog', 'webmcp', 'roving focus'). Omit to list docs." },
        section: { type: "string", enum: DOC_SECTIONS, description: "Filter to one doc section." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_docs_get",
    description:
      "Read an offline ui-sdk documentation page or skill reference by path (from design_docs_search, e.g. 'docs/react/components/select.md' or 'docs/web/llms.txt').",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Relative doc path inside the ui-sdk bundle." },
        ...OUTLINE_PROPERTIES,
      },
      required: ["path"],
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_list_components",
    description:
      "List the offline HeroUI v3 (@heroui/react) catalog: every component with a description and group, the guide index, and the baked versions.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "design_heroui_search",
    description:
      "Search the offline HeroUI v3 catalog of components and guides by keyword (e.g. 'date picker', 'toast', 'theming').",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords. Omit to list everything." },
        kind: { type: "string", enum: DOC_KINDS, description: "Filter to components or guides." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_get_docs",
    description:
      "Read HeroUI v3 component docs (examples, props, anatomy, accessibility) for @heroui/react components.",
    inputSchema: {
      type: "object",
      properties: {
        components: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: MAX_DOC_COMPONENTS,
          description: "Up to 5 component names in PascalCase or kebab-case (e.g. 'Button', 'date-picker').",
        },
        ...OUTLINE_PROPERTIES,
      },
      required: ["components"],
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_get_guide",
    description:
      "Read a HeroUI v3 guide (theming, styling, composition, dark-mode, animation, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Guide slug ('theming-for-agents') or catalog path ('guides/theming.md')." },
        ...OUTLINE_PROPERTIES,
      },
      required: ["path"],
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_get_source",
    description:
      "Read HeroUI v3 component TSX source from the pinned upstream tag.",
    inputSchema: {
      type: "object",
      properties: {
        component: { type: "string", description: "Component name (e.g. 'Button' or 'date-picker')." },
        includeStories: { type: "boolean", description: "Also return the large *.stories.tsx demos (default false)." },
      },
      required: ["component"],
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_get_styles",
    description:
      "Read @heroui/styles CSS for one component: BEM classes, variants, and states.",
    inputSchema: {
      type: "object",
      properties: {
        component: { type: "string", description: "Component name (e.g. 'Button' or 'date-picker')." },
      },
      required: ["component"],
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_get_theme_variables",
    description:
      "Read the default HeroUI v3 theme variables and design tokens (oklch color space) for light and dark modes, the base for custom themes.",
    inputSchema: {
      type: "object",
      properties: {
        part: { type: "string", description: "Optional filter by token part (e.g. 'colors', 'layout', 'base')." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_migration_guide",
    description:
      "HeroUI v2-to-v3 migration guides ('index' lists them; or pass a slug like 'styling', 'button').",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "'index' or a migration guide slug." },
        ...OUTLINE_PROPERTIES,
      },
      required: ["name"],
      additionalProperties: false,
    },
  },
  {
    name: "design_mantine_list_components",
    description:
      "List the offline Mantine UI catalog (ui.mantine.dev): every ready-made component with title and category, the category tree, and the vendored @mantine package versions the live previews run on.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "design_mantine_search",
    description:
      "Search the offline Mantine UI catalog of ready-made components by keyword (e.g. 'navbar', 'table', 'carousel', 'stats').",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords. Omit to list everything." },
        category: { type: "string", description: "Filter to one category slug (e.g. 'navbars', 'stats')." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_mantine_get_component",
    description:
      "Read a Mantine ready-made component: full source (TSX + CSS module), packages, and preview availability.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Component slug, e.g. 'article-card', 'navbar-nested', 'user-button'." },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "design_daisyui_list_components",
    description:
      "List offline daisyUI 5 catalog: components, groups, compiled CSS version, and themes.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "design_daisyui_search",
    description:
      "Search the offline daisyUI catalog by keyword (e.g. 'dropdown', 'chat bubble', 'table zebra', 'btn-primary'). Matches names, groups, descriptions and class names.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords. Omit to list everything." },
        group: { type: "string", description: "Filter to one group (e.g. 'Actions', 'Data input', 'Navigation')." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_daisyui_get_component",
    description:
      "Read one daisyUI component: class names by category, syntax, example HTML, and usage rules.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Component slug, e.g. 'button', 'modal', 'chat', 'range'." },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "design_style_list",
    description: "List the offline Refero Styles catalog: per-site design profiles with palette, fonts, counts.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 200, description: "Max rows (default 40)." },
        offset: { type: "integer", minimum: 0, maximum: 100000000, description: "Row offset: the previous reply's nextOffset." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_style_search",
    description: "Search Refero Styles: names, domains, descriptions, fonts, palette colors.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords. Omit to list everything." },
        limit: { type: "integer", minimum: 1, maximum: 200, description: "Max results (default 20)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_style_get",
    description: "Read one Refero style profile in full; the markdown export is design_style_get_md.",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Style uuid." },
      },
      required: ["uuid"],
      additionalProperties: false,
    },
  },
  {
    name: "design_style_get_md",
    description: "Read a Refero style's DESIGN.md export, paged.",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Style uuid." },
        ...OUTLINE_PROPERTIES,
      },
      required: ["uuid"],
      additionalProperties: false,
    },
  },
  {
    name: "design_baseui_list_components",
    description:
      "List offline Base UI docs catalog: headless components, guides, release version, and licence.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["components", "guides", "all"], description: "Filter to components, guides, or all (default all)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_baseui_search",
    description:
      "Search the offline Base UI docs catalog of components and guides by keyword (e.g. 'dialog', 'form', 'animation', 'rtl').",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords. Omit to list everything." },
        kind: { type: "string", enum: DOC_KINDS, description: "Filter to components or guides (guides cover overview, handbook and utilities)." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_baseui_get_docs",
    description:
      "Read Base UI component docs (examples, anatomy, props, accessibility) for @base-ui/react components.",
    inputSchema: {
      type: "object",
      properties: {
        components: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: MAX_DOC_COMPONENTS,
          description: "Up to 5 component names in PascalCase, kebab-case or plain English (e.g. 'Dialog', 'alert-dialog', 'Number Field').",
        },
        ...OUTLINE_PROPERTIES,
      },
      required: ["components"],
      additionalProperties: false,
    },
  },
  {
    name: "design_baseui_get_guide",
    description:
      "Read a Base UI guide: handbook (styling, animation, forms), utilities, or overview.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Guide slug ('styling'), a section path ('handbook/styling'), or a catalog path ('handbook/styling.md').",
        },
        ...OUTLINE_PROPERTIES,
      },
      required: ["path"],
      additionalProperties: false,
    },
  },
  {
    name: "design_uikit_list",
    description:
      "List the offline UI kits layer (16 kits). Without kit: list all kits. With kit: that kit's items, paged.",
    inputSchema: {
      type: "object",
      properties: {
        kit: { ...UIKIT_SCHEMA, description: "A kit id to list its items instead of the kit index." },
        limit: { type: "integer", minimum: 1, maximum: 500, description: "Max items (default 150)." },
        offset: { type: "integer", minimum: 0, maximum: 100000000, description: "Item offset: the previous reply's nextOffset." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_uikit_search",
    description:
      "Search the offline UI kits layer by keyword across every kit, or inside one kit. Kits and their items are listed by design_uikit_list.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords. Omit to list everything." },
        kit: { ...UIKIT_SCHEMA, description: "Narrow to one kit." },
        kind: { type: "string", enum: UIKIT_KINDS, description: "Filter by item kind (component, guide, topic, tokens, index)." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_uikit_get_docs",
    description:
      "Read one UI kit item's markdown doc page offline. Pointer kits return their llms.txt index only.",
    inputSchema: {
      type: "object",
      properties: {
        kit: UIKIT_SCHEMA,
        item: { type: "string", description: "Item slug from design_uikit_list or design_uikit_search." },
        path: { type: "string", description: "Specific doc path to read if the item has multiple docs." },
        ...OUTLINE_PROPERTIES,
      },
      required: ["kit", "item"],
      additionalProperties: false,
    },
  },
  {
    name: "design_uikit_get_source",
    description:
      "Read one UI kit item's code offline (demos, component source, CSS tokens, or baked files).",
    inputSchema: {
      type: "object",
      properties: {
        kit: UIKIT_SCHEMA,
        item: { type: "string", description: "Item slug from design_uikit_list or design_uikit_search." },
        path: { type: "string", description: "File to read, as listed by the item ('demo/base.tsx') or any baked path ('registry/accordion.json')." },
        ...PAGE_PROPERTIES,
      },
      required: ["kit", "item"],
      additionalProperties: false,
    },
  },
  {
    name: "design_dashboards_list",
    description:
      "List designer-dashboards stacks, starters, presets, verticals, frameworks, references, sub-skills.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: DASHBOARD_LIST_KINDS, description: "Category filter (default 'all')." },
        query: { type: "string", description: "Keyword filter. Omit to list a whole category." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max matches (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_dashboards_get",
    description:
      "Read a designer-dashboards stack, starter, preset, vertical, framework kit, reference, or sub-skill offline.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: DASHBOARD_GET_KINDS, description: "Artifact kind." },
        id: { type: "string", description: "Id from design_dashboards_list." },
        path: { type: "string", description: "Optional relative file path inside a framework kit or starter." },
        ...PAGE_PROPERTIES,
      },
      required: ["kind", "id"],
      additionalProperties: false,
    },
  },
  {
    name: "design_picks",
    description:
      "Read or manage items sent from the gallery's 'Send to MCP' button (picks queue). Use when the user asks to use what they picked in the browser.",
    annotations: { readOnlyHint: false, idempotentHint: false, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["list", "add", "remove", "clear"], description: "Queue action (default 'list')." },
        ref: { type: "string", description: "Canonical designer:<kind>:<id> ref (for add/remove)." },
        label: { type: "string", description: "Human label (for add)." },
        note: { type: "string", description: "Optional user note (for add)." },
        resolve: { type: "boolean", description: "Also resolve each pick into a compact summary (default false)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_resolve",
    description:
      "Resolve any canonical designer:<kind>:<id> reference (from 'Send to MCP' or gallery) into a compact summary and follow-up tool hints.",
    inputSchema: {
      type: "object",
      properties: {
        ref: { type: "string", description: "Canonical reference, e.g. designer:opendesign:arc, designer:heroui:button, designer:daisyui:card?theme=nord." },
      },
      required: ["ref"],
      additionalProperties: false,
    },
  },
];

const CORE_TOOLS = [
  {
    name: "design_search",
    description:
      "Search or list design systems across Refero, Refero Styles, OpenDesign, and System Templates. Omit query to browse/filter.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Optional search query (vibe, industry, font, color, or site)." },
        source: { type: "string", enum: ["all", "refero", "opendesign", "style", "template"], description: "Filter by source." },
        theme: { type: "string", enum: THEMES },
        hue: { type: "string", description: "Accent hue family (red, orange, amber, green, teal, blue, indigo, purple, pink, neutral)." },
        ground: { type: "string", description: "Canvas/ground tone (white, warm, cool-gray, charcoal, black, tinted)." },
        industry: { type: "string" },
        mood: { type: "string" },
        surface: { type: "string" },
        offset: { type: "integer", minimum: 0, description: "Row offset when listing (default 0)." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max rows (default 10 for search, 25 for list)." },
        detail: DETAIL_PROPERTY,
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_facets",
    description: "Return counts for themes, sources, hues, grounds, industries, moods, surfaces, and fonts.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "design_get",
    description:
      "Get a design system or Refero Style by id, reference (designer:<source>:<id>), hostname, or site name. Supports include: summary|style|markdown|full.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: DESIGN_IDENTIFIER,
        source: { type: "string", enum: ["refero", "opendesign", "style"], description: "Optional source disambiguation." },
        include: { type: "string", enum: ["summary", "style", "markdown", "full"], description: 'What to include (default "summary").' },
        detail: DETAIL_PROPERTY,
        ...OUTLINE_PROPERTIES,
      },
      required: ["identifier"],
      additionalProperties: false,
    },
  },
  {
    name: "design_file",
    description: "Read one file from an OpenDesign package, Claude Design export, or vendored template.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["opendesign", "claude", "template"], description: "Package kind." },
        identifier: { type: "string", description: "OpenDesign reference (designer:opendesign:<slug>) or template slug." },
        path: { type: "string", description: "Relative file path inside the package." },
        ...PAGE_PROPERTIES,
      },
      required: ["kind", "identifier", "path"],
      additionalProperties: false,
    },
  },
  {
    name: "design_template",
    description: "List vendored design-system templates, get one by slug, or generate a blank/filled manifest template.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Template slug to inspect." },
        query: { type: "string", description: "Filter template list." },
        limit: { type: "integer", minimum: 1, maximum: 50 },
        detail: DETAIL_PROPERTY,
        manifest: { type: "boolean", description: "True to generate a blank or preset-filled manifest template." },
        name: { type: "string", description: "System name when manifest: true." },
        preset: { type: "string", description: "Optional starter preset when manifest: true." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_markdown_check",
    description: "Parse, extract a manifest from, or validate a DESIGN.md document." + DESIGN_MD_ONE_INPUT_NOTE,
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["parse", "manifest", "validate"], description: 'Operation mode (default "parse").' },
        ...DESIGN_MD_INPUT,
        slug: { type: "string", description: "Override slug when mode is manifest." },
        name: { type: "string", description: "Override name when mode is manifest." },
        observed: { type: "object", description: "Observed token map when mode is validate." },
        required: { type: "array", items: { type: "string" }, description: "Required token paths when mode is validate." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_markdown_render",
    description: "Render a DESIGN.md draft from a system name, normalized token rows, and optional guidance sections.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "System display name." },
        tokens: DESIGN_MD_INPUT.tokens,
        body: { type: "string", description: "Optional Markdown guidance." },
      },
      required: ["name"],
      additionalProperties: false,
    },
  },
  {
    name: "design_kit_list",
    description: "List all 24+ UI kits and component libraries, or page items inside one kit (default 40 rows).",
    inputSchema: {
      type: "object",
      properties: {
        kit: { type: "string", description: "Kit id (e.g. heroui, mantine, daisyui, baseui, ui-sdk, gradientdeck, reui, hyperui, shadcn, chakra, mui, antd, magicui, openprops...)." },
        offset: { type: "integer", minimum: 0 },
        limit: { type: "integer", minimum: 1, maximum: UIKIT_MAX_ROWS, description: "Default 40." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_kit_search",
    description: "Search components, guides, and docs across all UI kits or within one kit (accepts aliases like magic-ui, 21st-dev).",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keyword." },
        kit: { type: "string", description: "Optional kit filter." },
        kind: { type: "string", description: "Optional item kind (component, guide, topic, tokens, index)." },
        section: { type: "string", description: "Optional section/category/group filter." },
        limit: { type: "integer", minimum: 1, maximum: 100 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_kit_docs",
    description: "Read offline component docs, guides, or migration guides for ui-sdk, heroui, baseui, or uikits. Supports outline: true and section.",
    inputSchema: {
      type: "object",
      properties: {
        kit: { type: "string", description: "Kit id (ui-sdk, heroui, baseui, or uikit id like chakra, mui, antd...)." },
        item: { type: "string", description: "Component slug, guide path, or doc path." },
        kind: { type: "string", enum: ["component", "guide", "migration"], description: 'Doc kind (default "component").' },
        ...OUTLINE_PROPERTIES,
      },
      required: ["kit", "item"],
      additionalProperties: false,
    },
  },
  {
    name: "design_kit_code",
    description: "Read component source, CSS, or theme variables for gradientdeck, heroui, mantine, daisyui, reui, hyperui, shadcn, or uikits.",
    inputSchema: {
      type: "object",
      properties: {
        kit: { type: "string", description: "Kit id (gradientdeck, heroui, mantine, daisyui, reui, hyperui, shadcn, or uikit id)." },
        item: { type: "string", description: "Component slug (or theme name for heroui theme)." },
        variant: { type: "string", description: "Variant id (gradientdeck) or 'radix'/'base' (reui)." },
        path: { type: "string", description: "Relative file path inside a uikit item." },
        kind: { type: "string", enum: ["source", "styles", "theme"], description: 'Code kind (default "source").' },
        detail: DETAIL_PROPERTY,
        ...PAGE_PROPERTIES,
      },
      required: ["kit", "item"],
      additionalProperties: false,
    },
  },
  {
    name: "design_preset",
    description: "Search background patterns, gradients, and liquid-glass presets, or fetch their CSS by kind + ids.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        kind: { type: "string", enum: ["patterns", "gradients", "glass"] },
        ids: { type: "array", items: { type: "string" }, maxItems: MAX_PRESET_IDS, description: "Preset ids to fetch full CSS/code for." },
        limit: { type: "integer", minimum: 1, maximum: 50 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_library",
    description: "Search vendored library install manifests (react, tailwind, shadcn, radix-ui, lucide, etc.) or get one by id.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Library id to fetch install steps and setup files." },
        query: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 50 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_assets",
    description: "Inspect built offline frontend CDN assets: summary (default), full packages list, or importmap.",
    inputSchema: {
      type: "object",
      properties: {
        view: { type: "string", enum: ["summary", "packages", "importmap"], description: 'Output view (default "summary").' },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_dashboards",
    description: "List/search offline designer-dashboards artifacts (stacks, starters, presets, verticals, frameworks, references, subskills) or read one by kind + id.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: [...new Set([...DASHBOARD_LIST_KINDS, ...DASHBOARD_GET_KINDS])] },
        id: { type: "string", description: "Artifact id to read." },
        path: { type: "string", description: "Relative file path inside a starter or framework kit." },
        query: { type: "string", description: "Keyword filter when listing." },
        limit: { type: "integer", minimum: 1, maximum: 100 },
        ...PAGE_PROPERTIES,
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_picks",
    description: "Read or manage the user's queued gallery picks ('+ Send to MCP').",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["list", "add", "remove", "clear"], description: "Action (default list)." },
        ref: { type: "string", description: "Canonical designer:<kind>:<id> reference (required for add/remove)." },
        label: { type: "string" },
        note: { type: "string" },
        resolve: { type: "boolean", description: "Also resolve each pick into a compact summary (default false)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_resolve",
    description: "Resolve any canonical designer:<kind>:<id> reference into a compact summary and follow-up tool hints.",
    inputSchema: {
      type: "object",
      properties: {
        ref: { type: "string", description: "Canonical reference, e.g. designer:opendesign:arc, designer:heroui:button." },
      },
      required: ["ref"],
      additionalProperties: false,
    },
  },
];

const CORE_TOOL_NAMES = new Set(CORE_TOOLS.map((t) => t.name));
const TOOLS = LEGACY_TOOLS_MODE
  ? [...CORE_TOOLS, ...LEGACY_TOOLS.filter((t) => !CORE_TOOL_NAMES.has(t.name))]
  : CORE_TOOLS;

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
function optionalString(value, field = "query") {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  return value;
}

/**
 * An optional value from a closed set.
 *
 * The SDK's low-level Server does not check arguments against inputSchema, so
 * an unknown filter value would otherwise filter everything out and read as
 * "nothing is cached" rather than "bad argument".
 */
function asEnum(value, field, allowed) {
  if (value === undefined || value === null || value === "") return undefined;
  if (!allowed.includes(value)) throw new Error(`${field} must be one of: ${allowed.join(", ")}`);
  return value;
}

function asBoolean(value, def = true, field = "boolean") {
  if (value === undefined || value === null) return def;
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;
  throw new Error(`${field} must be a boolean`);
}

function asLimit(value, def, max, min = 1, field = "limit") {
  if (value === undefined || value === null) return def;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${field} must be a number`);
  }
  return Math.min(Math.max(Math.floor(value), min), max);
}

/** The paging arguments shared by the document tools. */
function pageArgs(args, defaultBytes = DEFAULT_PAGE_BYTES) {
  return {
    offset: asLimit(args.offset, 0, 100_000_000, 0, "offset"),
    maxBytes: asLimit(args.maxBytes, defaultBytes, MAX_PAGE_BYTES, 1000, "maxBytes"),
  };
}

/**
 * One page of a long document, measured in UTF-8 bytes.
 *
 * A page ends on a line break, so it never splits a line or a multi-byte
 * character. `nextOffset` is present only when text remains, which is how a
 * caller tells a complete document from a cut one.
 */
function pageText(text, { offset, maxBytes }) {
  const buf = Buffer.from(text, "utf8");
  const totalBytes = buf.length;
  if (offset === 0 && totalBytes <= maxBytes) return { content: text, totalBytes };
  if (offset >= totalBytes) {
    throw new Error(`offset ${offset} is past the end of the document (${totalBytes} bytes)`);
  }
  // A caller-supplied offset may land inside a character: move to its start.
  let start = offset;
  while (start < totalBytes && (buf[start] & 0xc0) === 0x80) start++;
  let end = Math.min(start + maxBytes, totalBytes);
  if (end < totalBytes) {
    const lineBreak = buf.lastIndexOf(0x0a, end - 1);
    if (lineBreak > start) end = lineBreak + 1;
    // One line longer than the page: fall back to a character boundary.
    else while (end > start && (buf[end] & 0xc0) === 0x80) end--;
  }
  return {
    content: buf.subarray(start, end).toString("utf8"),
    totalBytes,
    offset: start,
    ...(end < totalBytes && { nextOffset: end }),
  };
}

function extractOutline(text) {
  const headings = [];
  const lines = String(text || "").split(/\r?\n/);
  let byteOffset = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        title: match[2].trim(),
        offset: byteOffset,
      });
    }
    byteOffset += Buffer.byteLength(line, "utf8") + 1;
  }
  return headings;
}

function extractSection(text, sectionTitle) {
  if (!sectionTitle || typeof sectionTitle !== "string") return null;
  const target = sectionTitle.trim().toLowerCase();
  const lines = String(text || "").split(/\r?\n/);
  let inSection = false;
  let sectionLevel = 0;
  const sectionLines = [];
  let found = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const title = match[2].trim();
      if (!inSection) {
        if (title.toLowerCase() === target || title.toLowerCase().includes(target)) {
          inSection = true;
          sectionLevel = level;
          found = true;
          sectionLines.push(line);
          continue;
        }
      } else {
        if (level <= sectionLevel) {
          break;
        }
      }
    }
    if (inSection) {
      sectionLines.push(line);
    }
  }

  if (!found) return null;
  return sectionLines.join("\n");
}

function pageDoc(text, args = {}) {
  if (args.outline === true) {
    const outline = extractOutline(text);
    return { outline, totalHeadings: outline.length, totalBytes: Buffer.byteLength(text, "utf8") };
  }
  let targetText = text;
  let sectionHeading = null;
  if (args.section) {
    const sec = extractSection(text, args.section);
    if (sec) {
      targetText = sec;
      sectionHeading = args.section;
    } else {
      const outline = extractOutline(text);
      throw new Error(`Section "${args.section}" not found. Available headings: ${outline.map((h) => h.title).slice(0, 15).join(", ")}`);
    }
  }
  const page = pageText(targetText, pageArgs(args));
  return {
    ...(sectionHeading ? { section: sectionHeading } : {}),
    ...page,
  };
}

function componentsUnavailableNote() {
  return "The component library is not baked into this deployment. In a checkout run: npm run bake.";
}

function presetsUnavailableNote() {
  return "The presets layer is not baked into this deployment. In a checkout run: npm run bake.";
}

function librariesUnavailableNote() {
  return "The library catalog is not baked into this deployment. In a checkout run: npm run bake.";
}

function templatesUnavailableNote() {
  return "The design-systems templates layer is not baked into this deployment. In a checkout run: npm run bake.";
}

function uiSdkUnavailableNote() {
  return "The @ui-sdk/* documentation is not present in this deployment.";
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

  const source = asEnum(args.source, "source", SOURCES);
  const theme = asEnum(args.theme, "theme", THEMES);
  const full = asEnum(args.detail, "detail", DETAIL_LEVELS) === "full";
  let pool = catalog;
  if (source) pool = pool.filter((d) => (d.source || SOURCE.REFERO) === source);
  if (theme) pool = pool.filter((d) => d.colorScheme === theme);

  const items = pool.map((d) => ({ id: d.id, text: searchText(d) }));
  const scored = score(query, items);
  const byId = new Map(pool.map((d) => [d.id, d]));

  const results = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => ({ ...shorthand(byId.get(s.id), full), score: Number(s.score.toFixed(4)) }));

  return { query, count: results.length, ...(catalogWarning && { warning: catalogWarning }), results };
}

function findCatalogDesign(identifier, source) {
  return findCatalogDesignDetailed(identifier, source).match;
}

/**
 * As findCatalogDesign, plus `guess` when the identifier was resolved by a
 * substring or fuzzy site-name match rather than an exact one.
 */
function findCatalogDesignDetailed(identifier, source) {
  // Every upstream package has the same hostname. Match the package slug
  // before the generic hostname resolver can pick an unrelated system.
  const repo = /^https?:\/\/(?:www\.)?github\.com\/nexu-io\/open-design(?=[/?#]|$)([^?#]*)/i.exec(identifier);
  if (repo) {
    const slug = /^\/(?:tree|blob)\/.+?\/design-systems\/([a-z0-9-]+)(?:\/|$)/.exec(repo[1])?.[1];
    if (!slug) throw new Error("OpenDesign repository URL does not identify a package. Use a package URL or a gallery reference.");
    identifier = `designer:opendesign:${slug}`;
  }
  if (!identifier.startsWith("designer:")) {
    const { item, matchedBy, candidates } = resolveDesignDetailed(identifier, catalog, { source });
    const guessed = matchedBy === "substring" || matchedBy === "fuzzy";
    return { match: item, ...(guessed && { guess: { matchedBy, candidates } }) };
  }

  const parts = /^designer:([^:]+):([a-zA-Z0-9_-]+)$/.exec(identifier);
  if (!parts || !Object.values(SOURCE).includes(parts[1])) {
    throw new Error("Expected a gallery reference in the form designer:<source>:<id>.");
  }
  const [, exactSource, id] = parts;
  if (source !== undefined && source !== exactSource) throw new Error("source conflicts with the gallery reference.");
  const match = catalog.find((entry) => entry.id === id && (entry.source || SOURCE.REFERO) === exactSource);
  if (!match) throw new Error("Gallery theme is not in this cache. Open its DESIGN.md link in the gallery and pass the Markdown as content.");
  return { match };
}

/** Response fields that tell the caller an identifier was guessed, not matched exactly. */
function guessNote(guess) {
  if (!guess) return {};
  return {
    matchedBy: guess.matchedBy,
    matchNote:
      "The identifier is not an exact id, hostname, or site name. This is the closest site name; " +
      "confirm it is the design you meant, or use design_search.",
    ...(guess.candidates.length > 0 && { otherCandidates: guess.candidates }),
  };
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
  const { match, guess } = findCatalogDesignDetailed(identifier, asEnum(args.source, "source", SOURCES));
  if (!match) {
    throw new Error(
      `No design matched ${JSON.stringify(identifier)}. ` +
        `Tried: exact id, hostname, exact site name, close site name. ` +
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
  const wantFull = asEnum(args.detail, "detail", DETAIL_LEVELS) === "full";
  const colors = full.colors ?? match.colors;
  const { fullResult, omitted } = wantFull
    ? { fullResult: full.fullResult, omitted: [] }
    : trimFullResult(full.fullResult, colors);
  return {
    ...guessNote(guess),
    ...shorthand(match, true),
    northStar: full.northStar ?? match.northStar,
    colors,
    fonts: full.fonts ?? match.fonts,
    fullResult,
    ...(omitted.length > 0 && { omitted, omittedNote: 'Pass detail: "full" for the omitted fields.' }),
    ...(packageInfo && { package: packageInfo }),
  };
}

/**
 * design_get's default body: the record without the parts that repeat.
 *
 * `raw` is the extractor's token dump, about half the record, and restates
 * what `designSystem` already says in structured form. `designSystem.colors`
 * is dropped only when it is byte-identical to the top-level `colors`, so
 * nothing unique is ever removed. Returns the names of what was left out.
 */
function trimFullResult(fullResult, colors) {
  if (!isRecord(fullResult)) return { fullResult, omitted: [] };
  const omitted = [];
  const { raw, ...rest } = fullResult;
  if (raw !== undefined) omitted.push("fullResult.raw");
  if (isRecord(rest.designSystem) && rest.designSystem.colors !== undefined &&
      JSON.stringify(rest.designSystem.colors) === JSON.stringify(colors)) {
    const { colors: _same, ...designSystem } = rest.designSystem;
    rest.designSystem = designSystem;
    omitted.push("fullResult.designSystem.colors (same as colors)");
  }
  return { fullResult: rest, omitted };
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
  // 100 summary rows is about 90 KB. The old ceiling of 200 could not fit
  // under the reply limit, so it is no longer advertised.
  const limit = asLimit(args.limit, 25, 100);
  const offset = asLimit(args.offset, 0, 1_000_000, 0, "offset");
  const source = asEnum(args.source, "source", SOURCES);
  const theme = asEnum(args.theme, "theme", THEMES);
  const industry = optionalString(args.industry, "industry");
  let pool = catalog;
  if (source) pool = pool.filter((d) => (d.source || SOURCE.REFERO) === source);
  if (theme) pool = pool.filter((d) => d.colorScheme === theme);
  if (industry) pool = pool.filter((d) => String(d.industry || "").toLowerCase() === industry.toLowerCase());
  const full = asEnum(args.detail, "detail", DETAIL_LEVELS) === "full";
  const page = pool.slice(offset, offset + limit).map((d) => shorthand(d, full));
  return {
    total: pool.length,
    offset,
    limit,
    count: page.length,
    ...(catalogWarning && { warning: catalogWarning }),
    designs: page,
  };
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
    ...(catalogWarning && { warning: catalogWarning }),
  };
}

async function handleMarkdown(args) {
  const identifier = asString(args.identifier, "identifier");
  const { match, guess, md } = await resolveMarkdown(identifier, args.source);
  return {
    ...guessNote(guess),
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
  if (!index?.components?.length) return { available: false, note: componentsUnavailableNote() };
  // `query` is optional — browsing by category alone is a valid request.
  const q = optionalString(args.query ?? args.q).trim().toLowerCase();
  const category = args.category ? asString(args.category, "category").toLowerCase() : null;

  let list = index.components || [];
  if (category) {
    list = list.filter((c) => (c.category || "").toLowerCase() === category);
  }
  if (q) {
    const terms = q.split(/\s+/).filter(Boolean);
    list = list.filter((c) => {
      const hay = `${c.title} ${c.description || ""} ${c.category || ""} ${c.slug} ${(c.variants || [])
        .map((v) => `${v.name} ${v.id} ${v.filename}`)
        .join(" ")}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }

  const limit = asLimit(args.limit, 20, 100);
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
  if (asEnum(args.detail, "detail", DETAIL_LEVELS) === "full") return component;
  // Every variant's source inline made this the largest everyday reply
  // (median 24 KB, up to 194 KB). design_component_code returns one variant.
  return {
    ...component,
    variants: (component.variants || []).map(({ code, ...variant }) => ({
      ...variant,
      codeBytes: typeof code === "string" ? Buffer.byteLength(code) : 0,
    })),
  };
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

  const includeCode = asBoolean(args.includeCode, true, "includeCode");
  const codeContent = variant.code || "";
  const codePage = args.offset !== undefined || args.maxBytes !== undefined
    ? pageText(codeContent, pageArgs(args))
    : { code: codeContent };
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
    ...(includeCode ? codePage : {}),
  };
}

// ----------------------------------------------------------------- presets
/** Search within the preset catalogs (gradients, patterns, glass, colors). */
async function handlePresetSearch(args) {
  const index = await readPresetsIndex();
  if (!index?.catalogs?.length) return { available: false, note: presetsUnavailableNote() };
  // `query` is optional — listing every preset in a catalog is valid.
  const q = optionalString(args.query ?? args.q).trim().toLowerCase();
  const allowedKinds = (index.catalogs || []).map((c) => c.kind);
  const kind = args.kind ? asEnum(args.kind, "kind", allowedKinds) : null;

  const catalogs = (index.catalogs || []).filter((c) => !kind || c.kind === kind);
  if (!catalogs.length) {
    return {
      total: 0,
      returned: 0,
      kinds: allowedKinds,
      presets: [],
    };
  }

  const limit = asLimit(args.limit, 20, 100);
  const terms = q ? q.split(/\s+/).filter(Boolean) : [];
  const loaded = await Promise.all(
    catalogs.map(async (c) => ({ kind: c.kind, catalog: await readPresetCatalog(c.kind) })),
  );

  const hits = [];
  for (const { kind: cKind, catalog } of loaded) {
    if (!catalog) continue;
    for (const p of catalog.presets || []) {
      if (terms.length) {
        const hay = `${p.name || ""} ${p.label || ""} ${p.id || ""} ${p.category || ""} ${p.description || ""}`.toLowerCase();
        if (!terms.every((t) => hay.includes(t))) continue;
      }
      hits.push({
        kind: cKind,
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
    kinds: allowedKinds,
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
  const { presets = [], ...meta } = catalog;
  let selected = presets;
  let missing = [];
  if (args.ids !== undefined) {
    if (!Array.isArray(args.ids) || args.ids.length > MAX_PRESET_IDS || args.ids.some((id) => typeof id !== "string")) {
      throw new Error(`ids must be an array of up to ${MAX_PRESET_IDS} preset ids`);
    }
    const wanted = new Set(args.ids);
    selected = presets.filter((p) => wanted.has(p.id));
    const found = new Set(selected.map((p) => p.id));
    missing = [...wanted].filter((id) => !found.has(id));
  }
  const limit = asLimit(args.limit, 20, 100);
  const offset = asLimit(args.offset, 0, 100_000, 0, "offset");
  const page = selected.slice(offset, offset + limit);
  return {
    ...meta,
    // `total` stays the size of the whole catalog; `matched` is what the
    // request selected, which paging then walks.
    total: presets.length,
    matched: selected.length,
    offset,
    returned: page.length,
    ...(offset + page.length < selected.length && { nextOffset: offset + page.length }),
    ...(missing.length > 0 && { missing }),
    presets: page,
  };
}

// ------------------------------------------------------------------ assets
/**
 * The built frontend assets (browser modules, starter, tailwind examples)
 * are a separate cache from /cache: DESIGN_FRONTEND_DIR in the image,
 * dist/frontend in a checkout. Missing build degrades to a note.
 */
let frontendPromise = null;
function loadFrontendOnce() {
  if (!frontendPromise) {
    const dir = process.env.DESIGN_FRONTEND_DIR || join(HERE, "..", "dist", "frontend");
    frontendPromise = loadFrontend(dir).catch(() => null);
  }
  return frontendPromise;
}

/** The asset CDN inventory: version, groups, vendored packages, starter. */
async function handleAssetList(args = {}) {
  const frontend = await loadFrontendOnce();
  let pub = frontend?.publicManifest;
  let map = frontend?.importMap();
  if (!pub && getRemoteUrl()) {
    pub = await remoteJson("assets/manifest.json");
    if (pub === REMOTE_DOWN) pub = null;
    map = await remoteJson("assets/importmap.json");
    if (map === REMOTE_DOWN) map = null;
  }
  if (!pub) {
    return {
      available: false,
      note: "frontend assets have not been built. The gallery image ships them; in a checkout run npm run frontend:build.",
    };
  }
  const full = args?.detail === "full";
  const allPackages = (pub.packages || []).map((p) => ({ name: p.name, version: p.version, license: p.license }));
  const importsCount = map ? Object.keys(map.imports || {}).length : 0;
  return {
    available: true,
    version: pub.version,
    servedAt: "/assets/<version>/<file>",
    groups: pub.groups,
    starter: { url: pub.starter, archive: pub.archive },
    packageCount: allPackages.length,
    ...(full
      ? { packages: allPackages }
      : {
          topPackages: Object.keys(map?.imports || {}).slice(0, 15),
          packagesNote: `Omitted ${allPackages.length} packages for context economy. Pass detail: 'full' to list all.`,
        }),
    importMap: map ? { specifiers: importsCount, route: "/assets/importmap.json" } : null,
  };
}

/**
 * The bare-specifier import map that turns a running gallery into an
 * offline module CDN. origin (or the configured DESIGN_REMOTE_URL) makes
 * the URLs absolute; without one they stay origin-relative under `base`.
 */
async function handleAssetImportmap(args) {
  const frontend = await loadFrontendOnce();
  let map = frontend?.importMap();
  if (!map && getRemoteUrl()) {
    map = await remoteJson("assets/importmap.json");
    if (map === REMOTE_DOWN) map = null;
  }
  if (!map) {
    throw new Error(
      "No frontend assets in this deployment. The gallery image ships them at /app/frontend-cache; " +
        "in a checkout run npm run frontend:build.",
    );
  }
  const origin = (optionalString(args.origin, "origin").trim().replace(/\/+$/, "") || getRemoteUrl());
  const imports = Object.fromEntries(
    Object.entries(map.imports).map(([specifier, path]) => [specifier, origin ? `${origin}${path}` : path]),
  );
  return {
    version: map.version,
    origin: origin || null,
    base: origin ? `${origin}${map.base}` : map.base,
    imports,
    usage: origin
      ? "Embed as <script type=\"importmap\"> with the imports object. Modules carry CORS *, so any page on any origin can import them."
      : "No origin available: URLs are origin-relative under `base`. Pass origin (e.g. http://127.0.0.1:8787) for absolute URLs.",
  };
}

// ---------------------------------------------------------------- libraries
/** Search the vendored library catalog (install manifests for common libraries). */
async function handleLibrarySearch(args) {
  const index = await readLibrariesIndex();
  if (!index?.libraries?.length) return { available: false, note: librariesUnavailableNote() };
  // `query` is optional — listing every cached library is valid.
  const q = optionalString(args.query ?? args.q).trim().toLowerCase();
  const category = optionalString(args.category, "category").trim().toLowerCase();

  const limit = asLimit(args.limit, 20, 50);
  let libs = index.libraries || [];
  if (category) {
    libs = libs.filter((l) => String(l.category || "").toLowerCase() === category);
  }
  if (q) {
    const terms = q.split(/\s+/).filter(Boolean);
    const loaded = await Promise.all(
      libs.map(async (l) => {
        const entry = await readLibraryEntry(l.id);
        const keywords = entry ? (entry.keywords || []).join(" ") : "";
        const hay = `${l.id} ${l.name} ${l.category} ${l.summary || ""} ${keywords}`.toLowerCase();
        return { lib: l, matches: terms.every((t) => hay.includes(t)) };
      }),
    );
    libs = loaded.filter((item) => item.matches).map((item) => item.lib);
  }

  return {
    total: libs.length,
    returned: Math.min(libs.length, limit),
    categories: [...new Set((index.libraries || []).map((l) => l.category).filter(Boolean))],
    libraries: libs.slice(0, limit),
  };
}

/** One library entry, with install steps and setup file contents. */
async function handleLibraryGet(args) {
  const id = asString(args.id, "id");
  const entry = (await readLibraryEntry(id)) || (await readLibraryEntry(id.toLowerCase()));
  if (!entry) {
    throw new Error(
      `No library "${id}" in the catalog. ` +
        `Run design_library_search to see what is cached. ` +
        `If the library the user wants is not cached, say so plainly and answer from knowledge.`,
    );
  }
  return entry;
}

// ------------------------------------------------------------- templates
async function handleTemplateList(args) {
  const query = optionalString(args.query).trim().toLowerCase();
  const limit = asLimit(args.limit, 20, 50);
  const index = await readDesignSystemsIndex();
  if (!index?.systems?.length) return { available: false, note: templatesUnavailableNote() };
  let systems = index.systems || [];
  if (query) {
    const terms = query.split(/\s+/).filter(Boolean);
    systems = systems.filter((s) => {
      const hay = `${s.slug} ${s.name} ${s.description} ${s.headingFont}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
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
        `Run design_template (or design_template_list) to see what is cached.`,
    );
  }
  const full = asEnum(args.detail, "detail", DETAIL_LEVELS) === "full";
  if (full || record.manifest === undefined) return record;
  const { manifest: _manifest, ...rest } = record;
  return {
    ...rest,
    omitted: ["manifest"],
    omittedNote: 'Pass detail: "full" for the full manifest.',
  };
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
  const content = await readDesignSystemFile(slug, filePath);
  if (content === null) {
    throw new Error(`"${filePath}" could not be read from ${slug}.`);
  }
  // Template files are copied verbatim, so the page defaults to the largest
  // size the reply limit allows: only the few files past 100 KB (the deck
  // stage script) arrive in parts, and the parts concatenate to the file.
  const page = pageText(content, pageArgs(args, MAX_PAGE_BYTES));
  return { slug, path: filePath, bytes: page.totalBytes, ...page };
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
  const { match, guess } = findCatalogDesignDetailed(identifier, asEnum(source, "source", SOURCES));
  if (!match) {
    throw new Error(
      `No design matched ${JSON.stringify(identifier)}. ` +
        `Run design_search or design_list to see what is cached.`,
    );
  }
  const payload = await readDesign(match.id, match.source);
  if (!payload) throw new Error(`design ${match.id} is in the catalog but its record is missing`);
  const full = mergeDesign(match, payload);
  return { match, guess, full, md: designMarkdown(full) };
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
  const { match, guess, full, md } = await resolveMarkdown(identifier, args.source);
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
    ...guessNote(guess),
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

/**
 * The `components` argument of the *_get_docs tools: a short list of names,
 * de-duplicated by slug so a repeated name cannot multiply the response.
 */
function docComponentNames(value, toSlug) {
  const names = Array.isArray(value) ? value : [];
  if (!names.length || names.some((n) => typeof n !== "string" || !n.trim())) {
    throw new Error("components must be a non-empty array of component names");
  }
  const seen = new Set();
  const unique = [];
  for (const raw of names) {
    const name = raw.trim();
    const key = toSlug(name) || name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(name);
  }
  if (unique.length > MAX_DOC_COMPONENTS) {
    throw new Error(
      `components accepts at most ${MAX_DOC_COMPONENTS} names per call (got ${unique.length}); ` +
        `call again for the rest`,
    );
  }
  return unique;
}

/**
 * Paging for a *_get_docs call: `maxBytes` is the budget for the whole reply,
 * split evenly, so asking for five docs costs the same as asking for one.
 * An offset is a position in one document, so it needs a single component.
 */
function docPaging(args, count) {
  const { offset, maxBytes } = pageArgs(args);
  if (offset > 0 && count > 1) {
    throw new Error("offset applies to one document: request a single component to page through it");
  }
  return { offset, maxBytes: Math.max(1000, Math.floor(maxBytes / count)) };
}

// ------------------------------------------------------------- heroui layer
function heroUiUnavailableNote() {
  return (
    "The HeroUI layer is not baked into this deployment. The gallery image ships it; " +
    "in a checkout run: npm run heroui && npm run bake."
  );
}

async function handleHeroUiList() {
  const catalog = await readHeroUiCatalog();
  if (!catalog.components.length) return { available: false, note: heroUiUnavailableNote() };
  return catalog;
}

async function handleHeroUiGetDocs(args) {
  const names = docComponentNames(args.components, heroUiSlug);
  const paging = docPaging(args, names.length);
  const catalog = await readHeroUiCatalog();
  if (!catalog.components.length) return { available: false, note: heroUiUnavailableNote() };
  const bySlug = new Map(catalog.components.map((c) => [c.slug, c]));
  const results = [];
  for (const raw of names) {
    const entry = bySlug.get(heroUiSlug(raw));
    if (!entry) {
      results.push({
        component: raw,
        error: "unknown HeroUI component; use design_heroui_list_components or design_heroui_search for exact names",
      });
      continue;
    }
    const content = await readHeroUiDoc(entry.path);
    const result = { component: entry.name, slug: entry.slug, path: entry.path };
    if (content === null) result.error = "doc missing from the baked layer; re-run npm run heroui";
    else Object.assign(result, args.outline || args.section ? pageDoc(content, args) : pageText(content, paging));
    results.push(result);
  }
  return { version: catalog.version, results };
}

async function handleHeroUiGetGuide(args) {
  const raw = asString(args.path, "path").replace(/^\/+/, "");
  const catalog = await readHeroUiCatalog();
  if (!catalog.guides.length) return { available: false, note: heroUiUnavailableNote() };
  // Resolve through the catalog guides strictly:
  const guide = catalog.guides.find(
    (g) => g.slug === raw || g.path === raw || g.path === `${raw}.md` || g.path === `guides/${raw}.md` || g.slug === raw.replace(/^guides\//, "").replace(/\.md$/, ""),
  );
  if (!guide) {
    throw new Error(`guide not found: ${raw}; use design_heroui_list_components for the guide index`);
  }
  const content = await readHeroUiDoc(guide.path);
  if (content === null) {
    throw new Error(`guide not found: ${raw}; use design_heroui_list_components for the guide index`);
  }
  return { path: guide.path, ...pageDoc(content, args) };
}

async function handleHeroUiGetSource(args) {
  const component = asString(args.component, "component");
  const catalog = await readHeroUiCatalog();
  if (!catalog.components.length) return { available: false, note: heroUiUnavailableNote() };
  if (!catalog.hasSource) {
    return {
      available: false,
      note:
        "Component source was not baked into this deployment (the fetcher records a gap when the " +
        "pinned GitHub tag is unreachable). Docs and styles are unaffected; re-run npm run heroui to bake source.",
    };
  }
  const src = await readHeroUiSource(component, { includeStories: args.includeStories === true });
  if (!src) {
    throw new Error(`no source directory for ${component}; use design_heroui_list_components for exact names`);
  }
  return { tag: catalog.version.source, ...src };
}

async function handleHeroUiGetStyles(args) {
  const component = asString(args.component, "component");
  const catalog = await readHeroUiCatalog();
  if (!catalog.components.length) return { available: false, note: heroUiUnavailableNote() };
  const css = await readHeroUiStyles(component);
  if (css === null) {
    throw new Error(
      `no styles css found for ${component}` +
        (catalog.hasStyles ? "" : " (the styles tree was not baked into this deployment; re-run npm run heroui)"),
    );
  }
  return { component: heroUiSlug(component), css };
}

async function handleHeroUiGetThemeVariables(args = {}) {
  const catalog = await readHeroUiCatalog();
  if (!catalog.components.length) return { available: false, note: heroUiUnavailableNote() };
  const theme = await readHeroUiTheme();
  if (!theme) {
    return {
      available: false,
      note: "Theme css was not baked into this deployment; re-run npm run heroui.",
    };
  }
  const part = asEnum(args.part, "part", ["variables", "theme", "default", "all"]) || "all";
  if (part === "variables") return { version: catalog.version, variables: theme.variables };
  if (part === "theme") return { version: catalog.version, theme: theme.theme };
  if (part === "default") return { version: catalog.version, default: theme.default };
  return { version: catalog.version, ...theme };
}

async function handleHeroUiMigration(args) {
  const name = asString(args.name, "name");
  const catalog = await readHeroUiCatalog();
  if (!catalog.components.length) return { available: false, note: heroUiUnavailableNote() };
  if (name === "index" || name === "list") {
    const index = await readHeroUiMigrationIndex();
    if (!index) {
      return {
        available: false,
        note: "Migration guides were not baked into this deployment; re-run npm run heroui.",
      };
    }
    return index;
  }
  const content = await readHeroUiMigrationDoc(name);
  if (content === null) {
    throw new Error(`migration guide not found: ${name}; use name 'index' to list the guides`);
  }
  return { name, ...pageText(content, pageArgs(args)) };
}

// ------------------------------------------------------------ mantine layer
function mantineUnavailableNote() {
  return (
    "The Mantine UI layer is not baked into this deployment. The gallery image ships it; " +
    "in a checkout run: npm run mantine && npm run bake."
  );
}

async function handleMantineList() {
  const [catalog, provenance] = await Promise.all([readMantineCatalog(), readMantineProvenance()]);
  if (!catalog.components?.length) return { available: false, note: mantineUnavailableNote() };
  return {
    ...catalog,
    components: (catalog.components || []).map((c) => {
      const row = { ...c };
      if (Array.isArray(row.requires) && row.requires.length === 0) delete row.requires;
      if (row.responsive === false) delete row.responsive;
      return row;
    }),
    vendor: provenance?.packages
      ? Object.fromEntries(Object.entries(provenance.packages).map(([name, rec]) => [name, rec.version]))
      : {},
  };
}

async function handleMantineGetComponent(args) {
  const slug = asString(args.slug, "slug").toLowerCase();
  const catalog = await readMantineCatalog();
  if (!catalog.components?.length) return { available: false, note: mantineUnavailableNote() };
  const detail = await readMantineComponent(slug);
  if (!detail) {
    throw new Error(`unknown Mantine component slug: ${slug}; use design_mantine_list_components or design_mantine_search for exact slugs`);
  }
  const category = (catalog.groups || []).flatMap((g) => g.categories.map((c) => ({ ...c, group: g.name })))
    .find((c) => c.slug === detail.category);
  const frontend = await loadFrontendOnce().catch(() => null);
  return {
    slug: detail.slug,
    name: detail.name,
    title: detail.title,
    category: detail.category,
    group: category?.group || null,
    responsive: Boolean(detail.responsive),
    packages: detail.packages || [],
    // Sibling components this demo imports (e.g. NavbarNested -> UserButton).
    requires: (detail.requires || []).map((r) => r.slug),
    livePreview: frontend?.mantinePreviewPath?.(detail.slug) != null,
    files: (detail.files || []).map((file) => ({ name: file.name, language: file.language, code: file.code })),
  };
}

// ------------------------------------------------------------ daisyui layer
function daisyuiUnavailableNote() {
  return (
    "The daisyUI layer is not baked into this deployment. The gallery image ships it; " +
    "in a checkout run: npm run daisyui && npm run bake."
  );
}

async function handleDaisyuiList() {
  const [catalog, provenance] = await Promise.all([readDaisyuiCatalog(), readDaisyuiProvenance()]);
  if (!catalog.components?.length) return { available: false, note: daisyuiUnavailableNote() };
  return {
    ...catalog,
    // Rows without the per-component class tables (a third of the reply);
    // design_daisyui_search still matches on class names, and
    // design_daisyui_get_component returns them.
    components: catalog.components.map(({ classes: _classes, ...row }) => row),
    docsSource: provenance?.source
      ? `${provenance.source.repo}@${provenance.source.tag}`
      : null,
  };
}

async function handleDaisyuiGetComponent(args) {
  const slug = asString(args.slug, "slug").toLowerCase();
  const catalog = await readDaisyuiCatalog();
  if (!catalog.components?.length) return { available: false, note: daisyuiUnavailableNote() };
  const detail = await readDaisyuiComponent(slug);
  if (!detail) {
    throw new Error(`unknown daisyUI component slug: ${slug}; use design_daisyui_list_components or design_daisyui_search for exact slugs`);
  }
  const frontend = await loadFrontendOnce().catch(() => null);
  const full = asEnum(args.detail, "detail", DETAIL_LEVELS) === "full";
  return {
    slug: detail.slug,
    name: detail.name,
    group: detail.group || null,
    description: detail.description,
    ...(full && detail.docUrl ? { docUrl: detail.docUrl } : {}),
    classes: detail.classes || [],
    syntax: detail.syntax || "",
    example: detail.example || "",
    docs: detail.docs || "",
    livePreview: frontend?.daisyuiPreviewPath?.(detail.slug) != null,
  };
}

// --------------------------------------------------------- refero-styles layer
function referoStylesUnavailableNote() {
  return (
    "The Refero Styles layer is not baked into this deployment. The gallery image ships it; " +
    "in a checkout run: npm run refero-styles && npm run bake."
  );
}

const STYLE_LIST_DEFAULT = 40;
const STYLE_LIST_MAX = 200;

async function referoStylesChecked() {
  const catalog = await readReferoStylesCatalog();
  if (!catalog.styles?.length) return { available: false, note: referoStylesUnavailableNote() };
  return catalog;
}

/** List/search rows are summaries: hex palette, no asset file names. */
function styleRowSlim(row) {
  return {
    uuid: row.uuid,
    name: row.name,
    domain: row.domain,
    description: row.description,
    palette: (row.palette || []).map((c) => c.value),
    fonts: (row.fonts || []).map((f) => (f.substitute ? `${f.family} (sub: ${f.substitute})` : f.family)),
    counts: row.counts,
    mdBytes: row.mdBytes,
  };
}

async function handleStyleList(args = {}) {
  const catalog = await referoStylesChecked();
  if (catalog.available === false) return catalog;
  const limit = asLimit(args.limit, STYLE_LIST_DEFAULT, STYLE_LIST_MAX);
  const offset = asLimit(args.offset, 0, catalog.styles.length, 0, "offset");
  const styles = catalog.styles.slice(offset, offset + limit).map(styleRowSlim);
  return {
    updatedAt: catalog.updatedAt,
    totals: catalog.totals,
    total: catalog.styles.length,
    count: styles.length,
    ...(offset + limit < catalog.styles.length ? { nextOffset: offset + limit } : {}),
    ...(offset > 0 ? { offset } : {}),
    styles,
  };
}

async function handleStyleSearch(args = {}) {
  const catalog = await referoStylesChecked();
  if (catalog.available === false) return catalog;
  const { query, total, results } = await searchReferoStyles({
    query: optionalString(args.query),
    limit: asLimit(args.limit, 20, STYLE_LIST_MAX),
  });
  return { query, total, count: results.length, results: results.map(styleRowSlim) };
}

/** The analysis without the markdown export or the local asset mapping. */
async function handleStyleGet(args) {
  const uuid = asString(args.uuid, "uuid").toLowerCase();
  const catalog = await referoStylesChecked();
  if (catalog.available === false) return catalog;
  const record = await readReferoStyle(uuid);
  if (!record) {
    throw new Error(`unknown refero style uuid: ${uuid}; use design_style_list or design_style_search for exact uuids`);
  }
  const data = record.data || {};
  const row = catalog.styles.find((r) => r.uuid === uuid) || {};
  const counts = row.counts || {
    components: Array.isArray(data.components) ? data.components.length : 0,
    typography: Array.isArray(data.typography) ? data.typography.length : 0,
    surfaces: Array.isArray(data.surfaces) ? data.surfaces.length : 0,
    colors: data.colors ? Object.keys(data.colors).length : 0,
  };
  return {
    uuid: record.uuid,
    name: record.site?.name || row.name || null,
    domain: record.site?.domain || row.domain || null,
    description: record.site?.description || row.description || null,
    counts,
    ...(row.palette ? { palette: row.palette } : {}),
    intent: data.intent || null,
    essentials: data.essentials || [],
    colors: data.colors || {},
    surfaces: data.surfaces || [],
    typography: data.typography || [],
    fonts: data.fonts || {},
    components: data.components || [],
    dos: data.dos || [],
    donts: data.donts || [],
    mdBytes: record.views?.design_md ? Buffer.byteLength(record.views.design_md) : 0,
    note: "The DESIGN.md export for this style is design_style_get_md.",
  };
}

async function handleStyleGetMd(args) {
  const uuid = asString(args.uuid, "uuid").toLowerCase();
  const catalog = await referoStylesChecked();
  if (catalog.available === false) return catalog;
  const record = await readReferoStyle(uuid);
  if (!record) {
    throw new Error(`unknown refero style uuid: ${uuid}; use design_style_list or design_style_search for exact uuids`);
  }
  const md = record.views?.design_md || "";
  if (!md) {
    return { uuid: record.uuid, available: false, note: "no DESIGN.md export is baked for this style; re-run npm run refero-styles" };
  }
  return {
    uuid: record.uuid,
    name: record.site?.name || null,
    domain: record.site?.domain || null,
    ...pageDoc(md, args),
  };
}

// ------------------------------------------------------------- baseui layer
function baseUiUnavailableNote() {
  return (
    "The Base UI docs layer is not baked into this deployment. The gallery image ships it; " +
    "in a checkout run: npm run baseui && npm run bake."
  );
}

async function handleBaseUiList(args = {}) {
  const catalog = await readBaseUiCatalog();
  if (!catalog.components.length) return { available: false, note: baseUiUnavailableNote() };
  const kind = asEnum(args.kind, "kind", ["components", "guides", "all"]);
  return {
    ...catalog,
    components: (catalog.components || []).map(({ docUrl: _d, ...c }) => c),
    guides: (catalog.guides || []).map(({ docUrl: _d, ...g }) => g),
    ...(kind === "components" ? { guides: [] } : {}),
    ...(kind === "guides" ? { components: [] } : {}),
  };
}

async function handleBaseUiGetDocs(args) {
  const names = docComponentNames(args.components, baseUiSlug);
  const paging = docPaging(args, names.length);
  const catalog = await readBaseUiCatalog();
  if (!catalog.components.length) return { available: false, note: baseUiUnavailableNote() };
  const bySlug = new Map(catalog.components.map((c) => [c.slug, c]));
  const results = [];
  for (const raw of names) {
    const entry = bySlug.get(baseUiSlug(raw));
    if (!entry) {
      results.push({
        component: raw,
        error: "unknown Base UI component; use design_baseui_list_components or design_baseui_search for exact names",
      });
      continue;
    }
    const content = await readBaseUiDoc(entry.path);
    const result = { component: entry.name, slug: entry.slug, path: entry.path };
    if (content === null) result.error = "doc missing from the baked layer; re-run npm run baseui";
    else Object.assign(result, args.outline || args.section ? pageDoc(content, args) : pageText(content, paging));
    results.push(result);
  }
  return { version: catalog.version, license: catalog.license?.spdx || null, results };
}

async function handleBaseUiGetGuide(args) {
  const raw = asString(args.path, "path").replace(/^\/+/, "");
  const catalog = await readBaseUiCatalog();
  if (!catalog.guides.length) return { available: false, note: baseUiUnavailableNote() };
  // Accept 'handbook/styling', 'handbook/styling.md', or a bare slug that is
  // unique across the guide pool ('styling'); ambiguous slugs list candidates.
  const clean = raw.replace(/\.md$/, "");
  // The catalog path wins: release notes sit three segments deep
  // ('overview/releases/v1-0-0.md'), and splitting on the first two used to
  // return 'overview/releases.md' for every one of them.
  let entry = catalog.guides.find((g) => g.path === `${clean}.md`) ?? null;
  if (entry) {
    // found by path
  } else if (clean.includes("/")) {
    const parts = clean.split("/");
    const section = parts[0];
    const slug = parts[parts.length - 1];
    entry = catalog.guides.find((g) => g.section === section && g.slug === slug);
  } else {
    const matches = catalog.guides.filter((g) => g.slug === clean);
    if (matches.length > 1) {
      throw new Error(
        `ambiguous guide slug '${clean}'; qualify it (${matches.map((g) => `${g.section}/${g.slug}`).join(", ")})`,
      );
    }
    entry = matches[0];
  }
  if (!entry) {
    throw new Error(`guide not found: ${raw}; use design_baseui_list_components for the guide index`);
  }
  const content = await readBaseUiDoc(entry.path);
  if (content === null) {
    throw new Error(`doc missing from the baked layer (${entry.path}); re-run npm run baseui`);
  }
  return { path: entry.path, section: entry.section, name: entry.name, ...pageDoc(content, args) };
}

// -------------------------------------------------------------- uikits layer
function uikitsUnavailableNote() {
  return (
    "The UI kits layer is not baked into this deployment. The gallery image ships it; " +
    "in a checkout run: npm run uikits && npm run bake."
  );
}

async function handleUikitList(args = {}) {
  const kit = args.kit === undefined ? "" : asUikitId(args.kit, "kit", { required: false });
  if (!kit) {
    const index = await readUikitsIndex();
    if (!index.kits.length) return { available: false, note: uikitsUnavailableNote() };
    return {
      updatedAt: index.updatedAt,
      totals: index.totals,
      kits: index.kits.map((row) => ({
        kit: row.kit,
        name: row.name,
        category: row.category,
        kind: row.kind,
        homepage: row.homepage,
        usesTailwind: row.usesTailwind,
        license: row.license?.spdx || null,
        ...(row.note ? { note: row.note } : {}),
        totals: row.totals,
        ...(row.error ? { error: row.error } : {}),
      })),
    };
  }
  const catalog = await readUikitCatalog(kit);
  if (!catalog) return { available: false, note: uikitsUnavailableNote() };
  // Rows, not bytes: a cut JSON array would not parse. One row is a short
  // summary, so a page stays near what a document page is allowed.
  const limit = asLimit(args.limit, UIKIT_PAGE_ROWS, UIKIT_MAX_ROWS);
  const offset = asLimit(args.offset, 0, 100_000, 0, "offset");
  if (offset > 0 && offset >= catalog.items.length) {
    throw new Error(`offset ${offset} is past the end of the item list (${catalog.items.length} items)`);
  }
  const page = catalog.items.slice(offset, offset + limit);
  return {
    kit: catalog.kit,
    name: catalog.name,
    kind: catalog.kind,
    license: catalog.license?.spdx || null,
    ...(catalog.note ? { note: catalog.note } : {}),
    ...(catalog.pointer ? { pointer: catalog.pointer } : {}),
    // `totals.items` is the whole list; `returned` is this page of it.
    totals: catalog.totals,
    offset,
    returned: page.length,
    ...(offset + page.length < catalog.items.length && { nextOffset: offset + page.length }),
    items: page.map((i) => ({
      slug: i.slug,
      title: i.title,
      group: i.group || null,
      kind: i.kind,
      summary: i.summary,
      docs: i.docs.length,
      source: (i.source?.length || 0) + (i.demo?.length || 0) + (i.registry?.length || 0),
    })),
  };
}

async function handleUikitGetDocs(args) {
  const kit = asUikitId(args.kit, "kit", { required: true });
  const catalog = await readUikitCatalog(kit);
  if (!catalog) return { available: false, note: uikitsUnavailableNote() };
  const wanted = asString(args.item, "item");
  const item = findUikitItem(catalog, wanted);
  if (!item) {
    throw new Error(`unknown item '${wanted}' in kit ${kit}; use design_uikit_list with kit:'${kit}' or design_uikit_search for exact slugs`);
  }
  if (!item.docs.length) {
    return {
      kit,
      item: item.slug,
      available: false,
      note: `no doc page is baked for ${item.slug}; use design_uikit_get_source for its files`,
    };
  }
  const pathArg = optionalString(args.path, "path");
  let targetDoc = "";
  if (pathArg) {
    if (item.docs.includes(pathArg)) {
      targetDoc = pathArg;
    } else {
      const candidates = item.docs.filter((d) => d.endsWith(`/${pathArg}`) || d.endsWith(pathArg));
      if (candidates.length === 1) targetDoc = candidates[0];
      else if (candidates.length > 1) {
        throw new Error(`ambiguous doc path '${pathArg}' (${candidates.join(", ")}); pass the full doc path`);
      } else {
        throw new Error(`doc '${pathArg}' not found for ${kit}/${item.slug}; available docs: ${item.docs.join(", ")}`);
      }
    }
  } else {
    targetDoc = item.primaryDoc && item.docs.includes(item.primaryDoc) ? item.primaryDoc : item.docs[0];
  }
  const content = await readUikitFile(kit, targetDoc);
  if (content === null) {
    return { kit, item: item.slug, error: `doc missing from the baked layer (${targetDoc}); re-run npm run uikits` };
  }
  const otherDocs = item.docs.filter((d) => d !== targetDoc);
  return {
    kit,
    item: item.slug,
    title: item.title,
    path: targetDoc,
    license: catalog.license?.spdx || null,
    ...(otherDocs.length > 0 ? { otherDocs } : {}),
    ...pageDoc(content, args),
  };
}

async function handleUikitGetSource(args) {
  const kit = asUikitId(args.kit, "kit", { required: true });
  const catalog = await readUikitCatalog(kit);
  if (!catalog) return { available: false, note: uikitsUnavailableNote() };
  const wanted = asString(args.item, "item");
  const item = findUikitItem(catalog, wanted);
  if (!item) {
    throw new Error(`unknown item '${wanted}' in kit ${kit}; use design_uikit_list with kit:'${kit}' or design_uikit_search for exact slugs`);
  }
  if (catalog.kind === "pointer") {
    return {
      kit,
      item: item.slug,
      available: false,
      note:
        (catalog.license?.note || "component code is not cached for this kit") +
        (catalog.pointer?.install ? ` Install from upstream instead: ${catalog.pointer.install}.` : ""),
    };
  }
  const files = [...(item.source || []), ...(item.demo || []), ...(item.registry || [])];
  const pathArg = optionalString(args.path, "path");
  if (!pathArg) {
    // An item with no files of its own still answers a kit-wide path below.
    if (!files.length) return { kit, item: item.slug, files: [], note: "no source files are baked for this item" };
    return { kit, item: item.slug, total: files.length, files };
  }
  // An exact path wins. Otherwise the argument may be the tail of one path,
  // on a "/" boundary ("index.tsx" is a file named index.tsx, never
  // button/index.tsx), and it must name exactly one file: the item's own
  // first, then anything baked in the kit (registry JSONs, asset css).
  const manifest = await readUikitFiles(kit);
  const baked = Object.keys(manifest?.files || {});
  let path = files.includes(pathArg) || baked.includes(pathArg) ? pathArg : "";
  let matchedBy;
  if (!path) {
    const suffix = (pool) => pool.filter((f) => f.endsWith(`/${pathArg}`));
    const candidates = suffix(files).length ? suffix(files) : suffix(baked);
    if (candidates.length > 1) {
      const shown = candidates.slice(0, 5).join(", ");
      throw new Error(
        `'${pathArg}' matches ${candidates.length} baked files (${shown}${candidates.length > 5 ? ", ..." : ""}); pass the full path`,
      );
    }
    if (candidates.length === 1) {
      path = candidates[0];
      matchedBy = "suffix";
    }
  }
  if (!path) {
    throw new Error(`no baked file '${pathArg}' for ${kit}/${item.slug}; call without path to list the item's files`);
  }
  const content = await readUikitFile(kit, path);
  if (content === null) {
    return { kit, item: item.slug, path, error: `file missing from the baked layer (${path}); re-run npm run uikits` };
  }
  return { kit, item: item.slug, path, ...(matchedBy ? { matchedBy } : {}), ...pageText(content, pageArgs(args)) };
}

async function listDirFilesRecursive(dir, base = "") {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      out.push(...(await listDirFilesRecursive(join(dir, entry.name), rel)));
    } else {
      out.push(rel);
    }
  }
  return out.sort();
}

/**
 * `relPath` under `rootDir`, or an error. The check is on the resolved path
 * with a separator, so a sibling directory that merely shares the root's
 * name is outside it (a plain startsWith let it through).
 */
function safeChildPath(rootDir, relPath) {
  const root = resolve(rootDir);
  const resolved = resolve(root, relPath);
  if (resolved !== root && !resolved.startsWith(root + sep)) {
    throw new Error(`Invalid path outside root: ${relPath}`);
  }
  return resolved;
}

const isFile = (path) => existsSync(path) && statSync(path).isFile();

/** A skill file as text. Binary assets (fonts, images) are refused, never served mangled. */
async function readSkillText(file) {
  const buf = await readFile(file);
  if (buf.subarray(0, 8192).includes(0)) {
    throw new Error("that file is binary (a font, image or archive), so it is not served as text");
  }
  return buf.toString("utf8");
}

function dashboardsUnavailableNote() {
  return (
    "The designer-dashboards skill is not present in this deployment, so its stacks, starters and presets cannot be read. " +
    "The gallery image ships it; a checkout has it under plugins/designer-mcp/skills/."
  );
}

let cachedSkillDashboardsIndex = null;

/** The skill's index, or null when the skill directory itself is absent. */
async function readDashboardsIndex() {
  if (cachedSkillDashboardsIndex) return cachedSkillDashboardsIndex;
  if (!existsSync(DASHBOARDS_DIR)) return null;
  const tplDir = join(DASHBOARDS_DIR, "templates");
  // A broken catalog is a broken skill. Say that, not the host path a raw
  // read error would print.
  const readCatalog = async (rel) => {
    try {
      return JSON.parse(await readFile(join(tplDir, rel), "utf8"));
    } catch {
      throw new Error(`the designer-dashboards skill is incomplete: templates/${rel} is missing or not valid JSON`);
    }
  };
  const dirNames = async (dir) =>
    existsSync(dir)
      ? (await readdir(dir, { withFileTypes: true }))
          .filter((d) => d.isDirectory())
          .map((d) => d.name)
          .sort()
      : [];
  const baseNames = async (dir, ext) =>
    existsSync(dir)
      ? (await readdir(dir)).filter((f) => f.endsWith(ext)).map((f) => f.slice(0, -ext.length)).sort()
      : [];
  const stacksCatalog = await readCatalog(join("tech-stacks", "catalog.json"));
  const presetsCatalog = await readCatalog(join("design-presets", "catalog.json"));
  // A sub-skill is any directory of the skill that carries a SKILL.md, so
  // adding one needs no edit here.
  const subskills = (await dirNames(DASHBOARDS_DIR)).filter((d) => isFile(join(DASHBOARDS_DIR, d, "SKILL.md")));
  cachedSkillDashboardsIndex = {
    stacks: (Array.isArray(stacksCatalog.profiles) ? stacksCatalog.profiles : []).map((p) => ({
      id: p.id,
      name: p.name,
      framework: p.framework,
      starter: p.starter,
      useCase: p.useCase,
      summary: p.summary,
    })),
    starters: await dirNames(join(tplDir, "starters")),
    presets: (presetsCatalog.presets || presetsCatalog.themes || []).map((p) =>
      typeof p === "string" ? { slug: p } : { slug: p.slug || p.id, name: p.name, category: p.category },
    ),
    verticals: await baseNames(join(tplDir, "verticals"), ".json"),
    frameworks: await dirNames(join(tplDir, "components", "frameworks")),
    references: await baseNames(join(DASHBOARDS_DIR, "references"), ".md"),
    subskills,
  };
  return cachedSkillDashboardsIndex;
}

/** Every listable entry of the skill as one searchable row. */
function dashboardEntries(index) {
  return [
    ...index.stacks.map((s) => ({ kind: "stack", id: s.id, title: s.name, detail: `${s.framework} · ${s.summary}` })),
    ...index.starters.map((id) => ({ kind: "starter", id, title: id, detail: "Runnable starter template" })),
    ...index.presets.map((p) => ({ kind: "preset", id: p.slug, title: p.name || p.slug, detail: p.category || "OpenDesign preset" })),
    ...index.verticals.map((id) => ({ kind: "vertical", id, title: id, detail: "Industry vertical widget recipe" })),
    ...index.frameworks.map((id) => ({ kind: "framework", id, title: id, detail: "Framework component kit & OpenDesign bridge" })),
    ...index.references.map((id) => ({ kind: "reference", id, title: id, detail: "Reference doc" })),
    ...index.subskills.map((id) => ({ kind: "skill", id, title: id, detail: "Sub-skill" })),
  ];
}

const DASHBOARD_SINGULAR = {
  stacks: "stack",
  starters: "starter",
  presets: "preset",
  verticals: "vertical",
  frameworks: "framework",
  references: "reference",
  subskills: "skill",
};

async function handleDashboardsList(args = {}) {
  const kind = asEnum(args.kind, "kind", DASHBOARD_LIST_KINDS) ?? "all";
  const query = optionalString(args.query).trim().toLowerCase();
  const index = await readDashboardsIndex();
  if (!index) return { available: false, note: dashboardsUnavailableNote() };
  // With a query the reply is the matches inside the requested categories.
  if (query) {
    const limit = asLimit(args.limit, 20, 100);
    const wanted = DASHBOARD_SINGULAR[kind];
    const words = query.split(/\s+/).filter(Boolean);
    const matches = dashboardEntries(index)
      .filter((c) => !wanted || c.kind === wanted)
      .filter((c) => {
        const text = `${c.id} ${c.title} ${c.detail}`.toLowerCase();
        return words.every((w) => text.includes(w));
      });
    return { query, kind, total: matches.length, results: matches.slice(0, limit) };
  }
  if (kind === "all") return index;
  return { kind, items: index[kind], count: index[kind].length };
}

async function handleDashboardsGet(args) {
  const kind = asEnum(args.kind, "kind", DASHBOARD_GET_KINDS);
  if (!kind) throw new Error(`kind must be one of: ${DASHBOARD_GET_KINDS.join(", ")}`);
  const id = asString(args.id, "id");
  const index = await readDashboardsIndex();
  if (!index) return { available: false, note: dashboardsUnavailableNote() };
  const pathArg = optionalString(args.path, "path").trim();
  const tplDir = join(DASHBOARDS_DIR, "templates");

  // An id is only ever one the index already lists, so a traversal string or
  // the name of some other file is simply unknown. Nothing is stripped from
  // it and nothing is resolved by guesswork.
  const known = (ids, what) => {
    if (ids.includes(id)) return;
    throw new Error(`Unknown ${what} '${id}'. design_dashboards_list names the valid ids.`);
  };
  const readPaged = async (file) => ({ kind, id, ...pageText(await readSkillText(file), pageArgs(args)) });

  // stack, preset and vertical are one JSON file each, named after the id.
  const single = {
    stack: [index.stacks.map((s) => s.id), join(tplDir, "tech-stacks")],
    preset: [index.presets.map((p) => p.slug), join(tplDir, "design-presets")],
    vertical: [index.verticals, join(tplDir, "verticals")],
  }[kind];
  if (single) {
    known(single[0], kind);
    const file = safeChildPath(single[1], `${id}.json`);
    if (!isFile(file)) throw new Error(`${kind} '${id}' is listed but its file is missing from the skill`);
    return readPaged(file);
  }
  if (kind === "reference") {
    known(index.references, "reference");
    const file = safeChildPath(join(DASHBOARDS_DIR, "references"), `${id}.md`);
    if (!isFile(file)) throw new Error(`reference '${id}' is listed but its file is missing from the skill`);
    return readPaged(file);
  }
  if (kind === "skill") {
    // "designer-dashboards" is the root skill; every other id is a sub-skill directory.
    if (id !== "designer-dashboards") known(index.subskills, "sub-skill");
    const file =
      id === "designer-dashboards" ? join(DASHBOARDS_DIR, "SKILL.md") : safeChildPath(DASHBOARDS_DIR, join(id, "SKILL.md"));
    if (!isFile(file)) throw new Error(`skill '${id}' is listed but its SKILL.md is missing`);
    return readPaged(file);
  }

  // starter and framework are directories: listed, or one file read by relative path.
  known(kind === "starter" ? index.starters : index.frameworks, kind);
  const dirRoot = safeChildPath(
    kind === "starter" ? join(tplDir, "starters") : join(tplDir, "components", "frameworks"),
    id,
  );
  if (!pathArg) {
    const files = await listDirFilesRecursive(dirRoot);
    return { kind, id, total: files.length, files };
  }
  const target = safeChildPath(dirRoot, pathArg);
  if (!isFile(target)) {
    throw new Error(`File '${pathArg}' not found in ${kind} '${id}'. Call without path to list the files.`);
  }
  return { kind, id, path: pathArg, ...pageText(await readSkillText(target), pageArgs(args)) };
}


function galleryPicksUrl() {
  const raw = (process.env.DESIGN_GALLERY_URL || "").trim();
  if (!raw || !/^https?:\/\//i.test(raw)) return null;
  return `${raw.replace(/\/+$/, "")}/api/picks`;
}

async function galleryPicksRequest(method, suffix = "", body = null) {
  const base = galleryPicksUrl();
  if (!base) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2000);
  try {
    const res = await fetch(suffix ? `${base}/${encodeURIComponent(suffix)}` : base, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.live ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveOneRef(rawRef) {
  const parsed = parseDesignerRef(rawRef);
  if (!parsed) {
    throw new Error(
      `Invalid reference "${String(rawRef ?? "")}". Expected designer:<kind>:<id> (e.g. designer:opendesign:arc, designer:heroui:button).`,
    );
  }

  switch (parsed.kind) {
    case "refero":
    case "opendesign": {
      await ensureCatalog();
      const rec = await handleGet({ identifier: parsed.ref, source: parsed.kind });
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: rec.siteName || parsed.id,
        nextTools: LEGACY_TOOLS_MODE
          ? (parsed.kind === "opendesign"
            ? ["design_markdown", "design_package_file", "design_claude_package"]
            : ["design_markdown", "design_get"])
          : (parsed.kind === "opendesign" ? ["design_get", "design_file"] : ["design_get"]),
        data: rec,
      };
    }
    case "style": {
      const rec = await readReferoStyle(parsed.id);
      if (!rec) return { ref: parsed.ref, kind: parsed.kind, found: false, error: "Refero style not found in cache" };
      const data = rec.data || {};
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: rec.site?.name || parsed.id,
        nextTools: LEGACY_TOOLS_MODE ? ["design_style_get", "design_style_get_md"] : ["design_get"],
        data: {
          uuid: rec.uuid,
          domain: rec.site?.domain || null,
          description: rec.site?.description || "",
          counts: {
            colors: data.colors ? Object.keys(data.colors).length : 0,
            surfaces: Array.isArray(data.surfaces) ? data.surfaces.length : 0,
            typography: Array.isArray(data.typography) ? data.typography.length : 0,
            components: Array.isArray(data.components) ? data.components.length : 0,
          },
          fonts: Object.values(data.fonts || {}).map((f) => ({ family: f.family, substitute: f.substitute || null })),
        },
      };
    }
    case "template": {
      const rec = await readDesignSystem(parsed.id);
      if (!rec) return { ref: parsed.ref, kind: parsed.kind, found: false, error: "Template not found in cache" };
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: rec.name || parsed.id,
        nextTools: LEGACY_TOOLS_MODE ? ["design_template_get", "design_template_file"] : ["design_template", "design_file"],
        data: {
          slug: rec.slug,
          description: rec.description || "",
          tokensCount: (rec.tokens || []).length,
          filesCount: (rec.files || []).length,
          starterTemplates: (rec.manifest?.starterTemplates?.all || []).map((s) => ({
            name: s.name,
            entryPath: s.entryPath,
          })),
        },
      };
    }
    case "component": {
      const comp = await readComponent(parsed.id);
      if (!comp) return { ref: parsed.ref, kind: parsed.kind, found: false, error: "Component not found in cache" };
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: comp.title || comp.name || parsed.id,
        nextTools: LEGACY_TOOLS_MODE ? ["design_component_code", "design_component_get"] : ["design_kit_code"],
        data: {
          slug: comp.slug,
          category: comp.category || null,
          description: comp.description || "",
          install: comp.install || null,
          variant: parsed.variant || null,
          variants: (comp.variants || []).map((v) => ({ id: v.id, name: v.name, filename: v.filename })),
        },
      };
    }
    case "heroui": {
      const cat = await readHeroUiCatalog();
      const hit = (cat.components || []).find((c) => c.slug === parsed.id || heroUiSlug(c.name) === parsed.id);
      if (!hit) return { ref: parsed.ref, kind: parsed.kind, found: false, error: "HeroUI component not found in cache" };
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: hit.name,
        nextTools: LEGACY_TOOLS_MODE
          ? ["design_heroui_get_docs", "design_heroui_get_styles", "design_heroui_get_source"]
          : ["design_kit_docs", "design_kit_code"],
        data: hit,
      };
    }
    case "mantine": {
      const rec = await readMantineComponent(parsed.id);
      if (!rec) return { ref: parsed.ref, kind: parsed.kind, found: false, error: "Mantine component not found in cache" };
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: rec.name || parsed.id,
        nextTools: LEGACY_TOOLS_MODE ? ["design_mantine_get_component"] : ["design_kit_code"],
        data: {
          slug: rec.slug,
          category: rec.category,
          title: rec.title || "",
          files: (rec.files || []).map((f) => f.name || f.path),
        },
      };
    }
    case "daisyui": {
      const rec = await readDaisyuiComponent(parsed.id);
      if (!rec) return { ref: parsed.ref, kind: parsed.kind, found: false, error: "daisyUI component not found in cache" };
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: rec.name || parsed.id,
        nextTools: LEGACY_TOOLS_MODE ? ["design_daisyui_get_component"] : ["design_kit_code"],
        data: {
          slug: rec.slug,
          group: rec.group || null,
          theme: parsed.theme || "light",
          description: rec.description || "",
          classCount: (rec.classes || []).length,
        },
      };
    }
    case "baseui": {
      const cat = await readBaseUiCatalog();
      const hit = (cat.components || []).find((c) => c.slug === parsed.id || baseUiSlug(c.name) === parsed.id);
      if (!hit) return { ref: parsed.ref, kind: parsed.kind, found: false, error: "Base UI component not found in cache" };
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: hit.name,
        nextTools: LEGACY_TOOLS_MODE ? ["design_baseui_get_docs"] : ["design_kit_docs"],
        data: hit,
      };
    }
    case "uikit": {
      const cat = await readUikitCatalog(parsed.kit);
      const item = cat ? findUikitItem(cat, parsed.id) : null;
      if (!item) return { ref: parsed.ref, kind: parsed.kind, found: false, error: `UI kit item ${parsed.kit}:${parsed.id} not found` };
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: `${cat.name} — ${item.title || item.slug}`,
        nextTools: LEGACY_TOOLS_MODE ? ["design_uikit_get_docs", "design_uikit_get_source"] : ["design_kit_docs", "design_kit_code"],
        data: {
          kit: parsed.kit,
          slug: item.slug,
          kind: item.kind,
          docs: item.docs || [],
          source: (item.source || []).slice(0, 12),
          demo: (item.demo || []).slice(0, 12),
        },
      };
    }
    case "preset": {
      const cat = await readPresetCatalog(parsed.presetKind);
      const hit = (cat?.presets || []).find((p) => (p.id || p.slug || p.name) === parsed.id);
      if (!hit) return { ref: parsed.ref, kind: parsed.kind, found: false, error: `Preset ${parsed.presetKind}:${parsed.id} not found` };
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: hit.name || hit.label || parsed.id,
        nextTools: LEGACY_TOOLS_MODE ? ["design_preset_get"] : ["design_preset"],
        data: { kind: parsed.presetKind, ...hit },
      };
    }
    case "reui": {
      const cat = await readReuiCategory(parsed.category);
      if (!cat) return { ref: parsed.ref, kind: parsed.kind, found: false, error: `ReUI category ${parsed.category} not found` };
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: `ReUI — ${cat.label || parsed.category}`,
        nextTools: [],
        data: {
          category: parsed.category,
          description: cat.description || "",
          count: (cat.items || []).length,
          galleryRoute: `/reui/${parsed.category}`,
          items: (cat.items || []).slice(0, 15).map((i) => ({ name: i.name, label: i.label || i.title })),
        },
      };
    }
    case "dashboard": {
      const rec = await readDashboard(parsed.id);
      if (!rec) return { ref: parsed.ref, kind: parsed.kind, found: false, error: `Dashboard ${parsed.id} not found` };
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: rec.name || parsed.id,
        nextTools: LEGACY_TOOLS_MODE ? ["design_dashboards_list", "design_dashboards_get"] : ["design_dashboards"],
        data: {
          slug: rec.slug,
          description: rec.description || "",
          stack: rec.stack || rec.frameworks || [],
          galleryRoute: `/dashboard/${rec.slug}`,
        },
      };
    }
    case "icon": {
      const pascal = parsed.id
        .split("-")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("");
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: `${parsed.set}:${parsed.id}`,
        nextTools: LEGACY_TOOLS_MODE ? ["design_asset_importmap"] : ["design_assets"],
        data: {
          set: parsed.set,
          kebab: parsed.id,
          component: pascal,
          reactImport: `import { ${pascal} } from "lucide-react";`,
          jsx: `<${pascal} size={20} strokeWidth={2} />`,
          html: `<i data-lucide="${parsed.id}"></i>`,
        },
      };
    }
    case "font": {
      const family = parsed.id
        .split("-")
        .map((w) => (w === "4" ? "4" : w.charAt(0).toUpperCase() + w.slice(1)))
        .join(" ");
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: family,
        nextTools: LEGACY_TOOLS_MODE ? ["design_asset_list"] : ["design_assets"],
        data: {
          slug: parsed.id,
          family,
          css: `font-family: "${family}", sans-serif;`,
          note: "Bundled offline in /assets/<version>/starter/fonts/fonts.css via @fontsource.",
        },
      };
    }
    case "chart": {
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: parsed.id,
        nextTools: LEGACY_TOOLS_MODE ? ["design_asset_list", "design_asset_importmap"] : ["design_assets"],
        data: {
          library: parsed.id,
          note: "Bundled offline under /assets/<version>/starter/vendor/ and showcased at /components/charts.",
        },
      };
    }
    case "library": {
      const lib = await readLibraryEntry(parsed.id);
      if (!lib) return { ref: parsed.ref, kind: parsed.kind, found: false, error: `Library ${parsed.id} not found` };
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: lib.name || parsed.id,
        nextTools: LEGACY_TOOLS_MODE ? ["design_library_get"] : ["design_library"],
        data: lib,
      };
    }
    case "compare": {
      return {
        ref: parsed.ref,
        kind: parsed.kind,
        found: true,
        name: `Generic component: ${parsed.id}`,
        nextTools: LEGACY_TOOLS_MODE
          ? [
              "design_heroui_search",
              "design_mantine_search",
              "design_daisyui_search",
              "design_baseui_search",
              "design_uikit_search",
            ]
          : ["design_kit_search"],
        data: { concept: parsed.id, galleryRoute: `/components/compare/${parsed.id}` },
      };
    }
    default:
      return { ref: parsed.ref, kind: parsed.kind, found: false, error: "Unsupported reference kind" };
  }
}

async function handlePicks(args) {
  const action = asEnum(args.action, "action", ["list", "add", "remove", "clear"]) || "list";
  const wantResolve = args.resolve === true;

  if (action === "add") {
    const ref = asString(args.ref, "ref");
    const label = optionalString(args.label, "label") || undefined;
    const note = optionalString(args.note, "note") || undefined;
    const remote = await galleryPicksRequest("POST", "", { ref, label, note });
    if (remote) return { source: "gallery-http", total: remote.picks.length, ...remote };
    const saved = await addPick({ ref, label, note });
    return { source: "local-file", picksFile: picksFilePath(), total: saved.picks.length, ...saved };
  }
  if (action === "remove") {
    const ref = asString(args.ref, "ref");
    const remote = await galleryPicksRequest("DELETE", ref);
    if (remote) return { source: "gallery-http", total: remote.picks.length, ...remote };
    const saved = await removePick(ref);
    return { source: "local-file", picksFile: picksFilePath(), total: saved.picks.length, ...saved };
  }
  if (action === "clear") {
    const remote = await galleryPicksRequest("DELETE");
    if (remote) return { source: "gallery-http", total: 0, ...remote };
    const saved = await clearPicks();
    return { source: "local-file", picksFile: picksFilePath(), total: 0, ...saved };
  }

  const remote = await galleryPicksRequest("GET");
  const store = remote || (await readPicks());
  const source = remote ? "gallery-http" : "local-file";
  const picks = store.picks || [];
  const out = {
    source,
    ...(source === "local-file" ? { picksFile: picksFilePath() } : {}),
    updatedAt: store.updatedAt || null,
    total: picks.length,
    picks,
  };
  if (wantResolve && picks.length) {
    const resolved = [];
    for (const p of picks.slice(0, 15)) {
      try {
        resolved.push(await resolveOneRef(p.ref));
      } catch (err) {
        resolved.push({ ref: p.ref, found: false, error: safeMessage(err) });
      }
    }
    out.resolved = resolved;
  }
  return out;
}

async function handleResolve(args) {
  const ref = asString(args.ref, "ref");
  return resolveOneRef(ref);
}

// ------------------------------------------------ consolidated v2 handlers
let cachedUnifiedDesigns = null;
async function getUnifiedDesignsIndex() {
  if (cachedUnifiedDesigns) return cachedUnifiedDesigns;
  await ensureCatalog();
  const [desc, rsCat, dsIdx] = await Promise.all([
    readDescriptors().catch(() => ({})),
    readReferoStylesCatalog().catch(() => null),
    readDesignSystemsIndex().catch(() => null),
  ]);
  cachedUnifiedDesigns = buildUnifiedDesignsIndex({
    catalog,
    descriptors: desc || {},
    referoStyles: rsCat?.styles || [],
    templates: dsIdx?.systems || [],
  });
  return cachedUnifiedDesigns;
}

let cachedComponentsHub = null;
async function getUnifiedComponentsHub() {
  if (cachedComponentsHub) return cachedComponentsHub;
  const [compIdx, reuiIdx, heroCat, mantineCat, daisyCat, baseCat, uikitsIdx, frontend] = await Promise.all([
    readComponentsIndex().catch(() => null),
    readReuiIndex().catch(() => null),
    readHeroUiCatalog().catch(() => null),
    readMantineCatalog().catch(() => null),
    readDaisyuiCatalog().catch(() => null),
    readBaseUiCatalog().catch(() => null),
    readUikitsIndex().catch(() => null),
    loadFrontendOnce().catch(() => null),
  ]);
  const uikitCatalogs = new Map();
  for (const k of uikitsIdx?.kits || []) {
    const c = await readUikitCatalog(k.kit).catch(() => null);
    if (c) uikitCatalogs.set(k.kit, c);
  }
  cachedComponentsHub = buildUnifiedComponentsHub({
    componentsIndex: compIdx,
    reuiIndex: reuiIdx,
    herouiCatalog: heroCat,
    mantineCatalog: mantineCat,
    daisyuiCatalog: daisyCat,
    baseuiCatalog: baseCat,
    uikitsIndex: uikitsIdx,
    uikitCatalogs,
    tailwindShadcn: frontend?.tailwindGroups?.("shadcn") || [],
    tailwindHyperui: frontend?.tailwindGroups?.("hyperui") || [],
    slopstrap: frontend?.publicManifest?.slopstrap || null,
  });
  return cachedComponentsHub;
}

const KIT_ALIASES = {
  ...UIKIT_ALIASES,
  "ui-sdk": "ui-sdk",
  uisdk: "ui-sdk",
  "hero-ui": "heroui",
  "daisy-ui": "daisyui",
  "base-ui": "baseui",
  "gradient-deck": "gradientdeck",
  components: "gradientdeck",
  "re-ui": "reui",
  "hyper-ui": "hyperui",
  "shadcn-ui": "shadcn",
};
function normalizeKitId(raw) {
  if (typeof raw !== "string") return "";
  const s = raw.trim().toLowerCase();
  return KIT_ALIASES[s] || s;
}

async function handleUnifiedSearch(args = {}) {
  const query = optionalString(args.query, "query").trim();
  const source = args.source ? asEnum(args.source, "source", ["all", "refero", "opendesign", "style", "template"]) : undefined;
  const hasFacetFilters = Boolean(args.hue || args.ground || args.industry || args.mood || args.surface);

  if (query && (!source || source === "refero" || source === "opendesign") && !hasFacetFilters && args.offset === undefined) {
    return handleSearch({ ...args, query, ...(source ? { source } : {}) });
  }
  if (!query && (!source || source === "refero" || source === "opendesign") && !hasFacetFilters && !args.hue) {
    return handleList({ ...args, ...(source ? { source } : {}) });
  }
  if (source === "style" && !hasFacetFilters && !args.theme) {
    return query ? handleStyleSearch({ query, limit: args.limit }) : handleStyleList({ offset: args.offset, limit: args.limit });
  }

  const idx = await getUnifiedDesignsIndex();
  const theme = asEnum(args.theme, "theme", THEMES);
  const hue = optionalString(args.hue, "hue").trim().toLowerCase();
  const ground = optionalString(args.ground, "ground").trim().toLowerCase();
  const industry = optionalString(args.industry, "industry").trim().toLowerCase();
  const mood = optionalString(args.mood, "mood").trim().toLowerCase();
  const surface = optionalString(args.surface, "surface").trim().toLowerCase();

  let pool = idx.designs || [];
  if (source && source !== "all") {
    pool = pool.filter((it) => (it.sources || [it.source]).includes(source) || (source === "style" && (it.sources?.includes("refero-style") || it.hasStyleProfile)));
  }
  if (theme) pool = pool.filter((it) => it.theme === theme);
  if (hue) pool = pool.filter((it) => (it.hues || []).includes(hue));
  if (ground) pool = pool.filter((it) => it.groundTone === ground);
  if (industry) pool = pool.filter((it) => String(it.industry || "").toLowerCase().includes(industry));
  if (mood) pool = pool.filter((it) => (it.moods || []).some((m) => String(m).toLowerCase().includes(mood)));
  if (surface) pool = pool.filter((it) => (it.surfaces || []).some((s) => String(s).toLowerCase().includes(surface)));

  if (query) {
    const limit = asLimit(args.limit, 10, 50);
    const docs = pool.map((it) => ({
      id: it.id,
      text: `${it.name || ""} ${it.domain || ""} ${it.industry || ""} ${it.northStar || ""} ${(it.moods || []).join(" ")} ${(it.fonts || []).join(" ")}`,
    }));
    const scored = score(query, docs).filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
    const byId = new Map(pool.map((it) => [it.id, it]));
    return {
      query,
      total: scored.length,
      count: scored.length,
      results: scored.map((s) => {
        const it = byId.get(s.id);
        return {
          id: it.id,
          ref: it.ref,
          source: it.source,
          name: it.name,
          domain: it.domain || null,
          theme: it.theme,
          hues: it.hues || [],
          ground: it.groundTone || null,
          industry: it.industry || null,
          fonts: it.fonts || [],
          score: Number(s.score.toFixed(4)),
        };
      }),
    };
  }

  const limit = asLimit(args.limit, 25, 100);
  const offset = asLimit(args.offset, 0, 1_000_000, 0, "offset");
  const page = pool.slice(offset, offset + limit);
  return {
    total: pool.length,
    offset,
    limit,
    count: page.length,
    ...(offset + page.length < pool.length && { nextOffset: offset + page.length }),
    designs: page.map((it) => ({
      id: it.id,
      ref: it.ref,
      source: it.source,
      name: it.name,
      domain: it.domain || null,
      theme: it.theme,
      hues: it.hues || [],
      ground: it.groundTone || null,
      industry: it.industry || null,
      fonts: it.fonts || [],
    })),
  };
}

async function handleUnifiedFacets() {
  const base = await handleFacets();
  const idx = await getUnifiedDesignsIndex();
  return {
    ...base,
    unifiedTotal: idx.total || base.total,
    hues: idx.facets?.hues || [],
    grounds: idx.facets?.groundTones || [],
    moods: (idx.facets?.moods || []).slice(0, 30),
    surfaces: (idx.facets?.surfaces || []).slice(0, 30),
  };
}

async function handleUnifiedGet(args = {}) {
  const identifier = asString(args.identifier, "identifier");
  const include = asEnum(args.include, "include", ["summary", "style", "markdown", "full"]) || "summary";
  const source = args.source ? asEnum(args.source, "source", ["refero", "opendesign", "style"]) : undefined;

  if (source === "style" || identifier.startsWith("designer:style:")) {
    const uuid = identifier.replace(/^designer:style:/, "");
    if (include === "markdown") return handleStyleGetMd({ uuid, ...args });
    const style = await handleStyleGet({ uuid });
    if (include === "full") {
      const md = await handleStyleGetMd({ uuid, ...args }).catch(() => null);
      if (md) style.markdown = md;
    }
    return style;
  }

  if (include === "markdown") {
    const { match, guess, md } = await resolveMarkdown(identifier, source);
    return {
      ...guessNote(guess),
      id: match.id,
      source: match.source || SOURCE.REFERO,
      siteName: match.siteName,
      ...pageDoc(md, args),
    };
  }

  const rec = await handleGet({
    identifier,
    ...(source ? { source } : {}),
    detail: include === "full" ? "full" : args.detail,
  });

  if (include === "style" || include === "full") {
    if (rec.styleProfile?.uuid) {
      rec.style = await handleStyleGet({ uuid: rec.styleProfile.uuid }).catch(() => null);
    }
    if (include === "full") {
      const mdRes = await resolveMarkdown(identifier, source).catch(() => null);
      if (mdRes?.md) rec.markdown = pageDoc(mdRes.md, args);
    }
  }
  return rec;
}

async function handleUnifiedFile(args = {}) {
  const kind = asEnum(args.kind, "kind", ["opendesign", "claude", "template"]);
  if (!kind) throw new Error("kind is required (opendesign, claude, or template)");
  if (kind === "opendesign") return handlePackageFile({ identifier: args.identifier, path: args.path });
  if (kind === "claude") return handleClaudePackageFile({ identifier: args.identifier, path: args.path });
  return handleTemplateFile({ slug: args.identifier, path: args.path, offset: args.offset, maxBytes: args.maxBytes });
}

async function handleUnifiedTemplate(args = {}) {
  if (args.manifest === true) {
    return handleManifestTemplate({ name: args.name, preset: args.preset });
  }
  if (args.slug) {
    return handleTemplateGet({ slug: args.slug, detail: args.detail });
  }
  return handleTemplateList({ query: args.query, limit: args.limit });
}

async function handleMarkdownCheck(args = {}) {
  const mode = asEnum(args.mode, "mode", ["parse", "manifest", "validate"]) || "parse";
  if (mode === "manifest") return handleManifestFrom(args);
  if (mode === "validate") return handleMarkdownValidate(args);
  return handleMarkdownParse(args);
}

async function handleKitList(args = {}) {
  const kit = normalizeKitId(optionalString(args.kit, "kit"));
  if (!kit) {
    const hub = await getUnifiedComponentsHub();
    const uiSdk = await listUiSdkDocs().catch(() => ({ total: 0 }));
    const kits = (hub.libraries || []).map((l) => ({
      kit: l.id,
      name: l.name,
      stack: l.stack,
      styling: l.styling,
      count: l.count,
      previewable: Boolean(l.previewable),
    }));
    if (uiSdk?.total) {
      kits.push({ kit: "ui-sdk", name: "@ui-sdk/* Docs", stack: "React / Web", styling: "Headless", count: uiSdk.total, previewable: false });
    }
    return { totalKits: kits.length, totalComponents: hub.total || 0, kits };
  }
  if (kit === "heroui") return handleHeroUiList();
  if (kit === "mantine") return handleMantineList();
  if (kit === "daisyui") return handleDaisyuiList();
  if (kit === "baseui") return handleBaseUiList(args);
  if (kit === "ui-sdk") return listUiSdkDocs();
  if (UIKIT_IDS.includes(kit)) return handleUikitList({ kit, offset: args.offset, limit: args.limit });
  if (LIBRARY_META[kit]) {
    const hub = await getUnifiedComponentsHub();
    const items = (hub.items || []).filter((it) => it.library === kit);
    const limit = asLimit(args.limit, UIKIT_PAGE_ROWS, UIKIT_MAX_ROWS);
    const offset = asLimit(args.offset, 0, 100_000, 0, "offset");
    const page = items.slice(offset, offset + limit);
    return {
      kit,
      name: LIBRARY_META[kit].name,
      total: items.length,
      offset,
      returned: page.length,
      ...(offset + page.length < items.length && { nextOffset: offset + page.length }),
      items: page,
    };
  }
  throw new Error(`Unknown kit '${kit}'. Run design_kit_list without kit to list all available kits.`);
}

async function handleKitSearch(args = {}) {
  const query = optionalString(args.query, "query");
  const kit = normalizeKitId(optionalString(args.kit, "kit"));
  const limit = asLimit(args.limit, 20, 100);

  if (kit === "ui-sdk") {
    const idx = await listUiSdkDocs();
    if (!idx.total) return { available: false, note: uiSdkUnavailableNote() };
    return searchUiSdkDocs({ query, section: asEnum(args.section, "section", DOC_SECTIONS) ?? "", limit });
  }
  if (kit === "heroui") {
    const cat = await readHeroUiCatalog();
    if (!cat.components?.length) return { available: false, note: herouiUnavailableNote() };
    return searchHeroUiDocs({ query, kind: asEnum(args.kind, "kind", DOC_KINDS) ?? "", limit });
  }
  if (kit === "mantine") {
    const cat = await readMantineCatalog();
    if (!cat.components?.length) return { available: false, note: mantineUnavailableNote() };
    return searchMantine({ query, category: optionalString(args.section, "section"), limit });
  }
  if (kit === "daisyui") {
    const cat = await readDaisyuiCatalog();
    if (!cat.components?.length) return { available: false, note: daisyuiUnavailableNote() };
    const res = await searchDaisyui({ query, group: optionalString(args.section, "section"), limit });
    if (Array.isArray(res.results)) res.results = res.results.map(({ classes: _c, ...row }) => row);
    return res;
  }
  if (kit === "baseui") {
    const cat = await readBaseUiCatalog();
    if (!cat.components?.length) return { available: false, note: baseUiUnavailableNote() };
    return searchBaseUiDocs({ query, kind: asEnum(args.kind, "kind", DOC_KINDS) ?? "", limit });
  }
  if (kit === "gradientdeck") {
    return handleComponentSearch({ query, category: optionalString(args.section, "section"), limit });
  }
  if (kit && UIKIT_IDS.includes(kit)) {
    const idx = await readUikitsIndex();
    if (!idx.kits?.length) return { available: false, note: uikitsUnavailableNote() };
    return searchUikits({ query, kit, kind: asEnum(args.kind, "kind", UIKIT_KINDS) ?? "", limit });
  }

  const hub = await getUnifiedComponentsHub();
  let pool = hub.items || [];
  if (kit) pool = pool.filter((it) => it.library === kit);
  if (args.section) {
    const sec = args.section.toLowerCase();
    pool = pool.filter((it) => String(it.category || "").toLowerCase().includes(sec));
  }
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = terms.length
    ? pool.filter((it) => {
        const hay = `${it.name} ${it.slug} ${it.library} ${it.category || ""} ${it.concept || ""} ${it.summary || ""}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      })
    : pool;
  return {
    query,
    ...(kit ? { kit } : {}),
    total: matches.length,
    returned: Math.min(limit, matches.length),
    results: matches.slice(0, limit),
  };
}

async function handleKitDocs(args = {}) {
  const kit = normalizeKitId(asString(args.kit, "kit"));
  const item = asString(args.item, "item");
  const kind = asEnum(args.kind, "kind", ["component", "guide", "migration"]) || "component";

  if (kit === "ui-sdk") {
    const content = await readUiSdkDoc(item);
    if (content === null) throw new Error(`ui-sdk doc not found: ${item}`);
    return { kit, path: item, ...pageDoc(content, args) };
  }
  if (kit === "heroui") {
    if (kind === "guide") return handleHeroUiGetGuide({ path: item, ...args });
    if (kind === "migration") return handleHeroUiMigration({ path: item, ...args });
    const res = await handleHeroUiGetDocs({ components: [item], ...args });
    return res.results?.length === 1 ? { kit, ...res.results[0] } : res;
  }
  if (kit === "baseui") {
    if (kind === "guide") return handleBaseUiGetGuide({ path: item, ...args });
    const res = await handleBaseUiGetDocs({ components: [item], ...args });
    return res.results?.length === 1 ? { kit, ...res.results[0] } : res;
  }
  if (UIKIT_IDS.includes(kit)) {
    return handleUikitGetDocs({ kit, item, ...args });
  }
  throw new Error(`No markdown docs endpoint for kit '${kit}'. Try ui-sdk, heroui, baseui, or a uikit id (chakra, mui, antd, etc.), or use design_kit_code for component source.`);
}

async function handleKitCode(args = {}) {
  const kit = normalizeKitId(asString(args.kit, "kit"));
  const item = asString(args.item, "item");
  const kind = asEnum(args.kind, "kind", ["source", "styles", "theme"]) || "source";

  if (kit === "gradientdeck") {
    if (args.variant) return handleComponentCode({ slug: item, variant: args.variant });
    return handleComponentGet({ slug: item, detail: args.detail });
  }
  if (kit === "heroui") {
    if (kind === "styles") return handleHeroUiGetStyles({ component: item });
    if (kind === "theme") return handleHeroUiGetThemeVariables({ theme: item });
    return handleHeroUiGetSource({ component: item });
  }
  if (kit === "mantine") return handleMantineGetComponent({ slug: item });
  if (kit === "daisyui") return handleDaisyuiGetComponent({ slug: item, detail: args.detail });
  if (UIKIT_IDS.includes(kit)) {
    return handleUikitGetSource({ kit, item, path: args.path, offset: args.offset, maxBytes: args.maxBytes });
  }
  if (kit === "reui") {
    const cat = await readReuiCategory(item);
    if (!cat) throw new Error(`Unknown ReUI category '${item}'. Run design_kit_list with kit:'reui'.`);
    return cat;
  }
  if (kit === "hyperui" || kit === "shadcn") {
    const frontend = await loadFrontendOnce();
    const groups = frontend?.tailwindGroups?.(kit) || [];
    const group = groups.find((g) => g.slug === item);
    if (!group) throw new Error(`Unknown ${kit} group '${item}'. Run design_kit_list with kit:'${kit}'.`);
    const examples = [];
    for (const ex of (group.items || []).slice(0, 10)) {
      const code = await frontend.tailwindExample(ex).catch(() => null);
      examples.push({ id: ex.id, title: ex.title || ex.id, code });
    }
    return { kit, slug: group.slug, title: group.title, examples };
  }
  throw new Error(`No code/source endpoint for kit '${kit}'.`);
}

async function handlePreset(args = {}) {
  if (Array.isArray(args.ids) && args.ids.length) {
    return handlePresetGet({ kind: args.kind, ids: args.ids });
  }
  return handlePresetSearch({ query: args.query, kind: args.kind, limit: args.limit });
}

async function handleLibrary(args = {}) {
  if (args.id) return handleLibraryGet({ id: args.id });
  return handleLibrarySearch({ query: args.query, limit: args.limit });
}

async function handleAssets(args = {}) {
  const view = asEnum(args.view, "view", ["summary", "packages", "importmap"]) || "summary";
  if (view === "importmap") return handleAssetImportmap();
  return handleAssetList({ detail: view === "packages" ? "full" : "summary" });
}

async function handleDashboards(args = {}) {
  if (args.id && args.kind) {
    return handleDashboardsGet({ kind: args.kind, id: args.id, path: args.path, offset: args.offset, maxBytes: args.maxBytes });
  }
  return handleDashboardsList({ kind: args.kind, query: args.query, limit: args.limit });
}

async function dispatch(name, args) {
  if (CATALOG_TOOLS.has(name) && !(CONTENT_INPUT_TOOLS.has(name) && args.identifier === undefined) && !(name === "design_get" && (args.source === "style" || String(args.identifier || "").startsWith("designer:style:"))) && !(name === "design_file" && args.kind === "template")) {
    await ensureCatalog();
  }
  switch (name) {
    case "design_search":
      return handleUnifiedSearch(args);
    case "design_facets":
      return handleUnifiedFacets();
    case "design_get":
      return handleUnifiedGet(args);
    case "design_file":
      return handleUnifiedFile(args);
    case "design_template":
      return handleUnifiedTemplate(args);
    case "design_markdown_check":
      return handleMarkdownCheck(args);
    case "design_kit_list":
      return handleKitList(args);
    case "design_kit_search":
      return handleKitSearch(args);
    case "design_kit_docs":
      return handleKitDocs(args);
    case "design_kit_code":
      return handleKitCode(args);
    case "design_preset":
      return handlePreset(args);
    case "design_library":
      return handleLibrary(args);
    case "design_assets":
      return handleAssets(args);
    case "design_dashboards":
      return handleDashboards(args);
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
    case "design_library_search":
      return handleLibrarySearch(args);
    case "design_library_get":
      return handleLibraryGet(args);
    case "design_asset_list":
      return handleAssetList(args);
    case "design_asset_importmap":
      return handleAssetImportmap(args);
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
    case "design_docs_search": {
      const idx = await listUiSdkDocs();
      if (!idx.total) return { available: false, note: uiSdkUnavailableNote() };
      return searchUiSdkDocs({
        query: optionalString(args.query),
        section: asEnum(args.section, "section", DOC_SECTIONS) ?? "",
        limit: asLimit(args.limit, 20, 100),
      });
    }
    case "design_docs_get": {
      const docPath = asString(args.path, "path");
      const content = await readUiSdkDoc(docPath);
      if (content === null) throw new Error(`ui-sdk doc not found: ${docPath}`);
      return { path: docPath, ...pageDoc(content, args) };
    }
    case "design_heroui_list_components":
      return handleHeroUiList();
    case "design_heroui_search": {
      const cat = await readHeroUiCatalog();
      if (!cat.components?.length) return { available: false, note: herouiUnavailableNote() };
      return searchHeroUiDocs({
        query: optionalString(args.query),
        kind: asEnum(args.kind, "kind", DOC_KINDS) ?? "",
        limit: asLimit(args.limit, 20, 100),
      });
    }
    case "design_heroui_get_docs":
      return handleHeroUiGetDocs(args);
    case "design_heroui_get_guide":
      return handleHeroUiGetGuide(args);
    case "design_heroui_get_source":
      return handleHeroUiGetSource(args);
    case "design_heroui_get_styles":
      return handleHeroUiGetStyles(args);
    case "design_heroui_get_theme_variables":
      return handleHeroUiGetThemeVariables(args);
    case "design_heroui_migration_guide":
      return handleHeroUiMigration(args);
    case "design_mantine_list_components":
      return handleMantineList();
    case "design_mantine_search": {
      const cat = await readMantineCatalog();
      if (!cat.components?.length) return { available: false, note: mantineUnavailableNote() };
      return searchMantine({
        query: optionalString(args.query),
        category: optionalString(args.category, "category"),
        limit: asLimit(args.limit, 20, 100),
      });
    }
    case "design_mantine_get_component":
      return handleMantineGetComponent(args);
    case "design_daisyui_list_components":
      return handleDaisyuiList();
    case "design_daisyui_search": {
      const cat = await readDaisyuiCatalog();
      if (!cat.components?.length) return { available: false, note: daisyuiUnavailableNote() };
      const res = await searchDaisyui({
        query: optionalString(args.query),
        group: optionalString(args.group, "group"),
        limit: asLimit(args.limit, 20, 100),
      });
      if (Array.isArray(res.results)) {
        res.results = res.results.map(({ classes: _classes, ...row }) => row);
      }
      return res;
    }
    case "design_daisyui_get_component":
      return handleDaisyuiGetComponent(args);
    case "design_style_list":
      return handleStyleList(args);
    case "design_style_search":
      return handleStyleSearch(args);
    case "design_style_get":
      return handleStyleGet(args);
    case "design_style_get_md":
      return handleStyleGetMd(args);
    case "design_baseui_list_components":
      return handleBaseUiList(args);
    case "design_baseui_search": {
      const cat = await readBaseUiCatalog();
      if (!cat.components?.length) return { available: false, note: baseUiUnavailableNote() };
      return searchBaseUiDocs({
        query: optionalString(args.query),
        kind: asEnum(args.kind, "kind", DOC_KINDS) ?? "",
        limit: asLimit(args.limit, 20, 100),
      });
    }
    case "design_baseui_get_docs":
      return handleBaseUiGetDocs(args);
    case "design_baseui_get_guide":
      return handleBaseUiGetGuide(args);
    case "design_uikit_list":
      return handleUikitList(args);
    case "design_uikit_search": {
      const idx = await readUikitsIndex();
      if (!idx.kits?.length) return { available: false, note: uikitsUnavailableNote() };
      return searchUikits({
        query: optionalString(args.query),
        kit: args.kit === undefined ? "" : asUikitId(args.kit, "kit", { required: false }),
        kind: asEnum(args.kind, "kind", UIKIT_KINDS) ?? "",
        limit: asLimit(args.limit, 20, 100),
      });
    }
    case "design_uikit_get_docs":
      return handleUikitGetDocs(args);
    case "design_uikit_get_source":
      return handleUikitGetSource(args);
    case "design_dashboards_list":
      return handleDashboardsList(args);
    case "design_dashboards_get":
      return handleDashboardsGet(args);
    case "design_picks":
      return handlePicks(args);
    case "design_resolve":
      return handleResolve(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ------------------------------------------------------------------ server
/**
 * The largest reply this server sends, in UTF-8 bytes of JSON text.
 *
 * A reply goes straight into the calling model's context. Past this size it
 * is rejected with a message naming what to change, never truncated: cut
 * JSON does not parse, and a silently shortened reply reads as complete.
 */
const DEFAULT_MAX_RESPONSE_BYTES = 120_000;
function maxResponseBytes() {
  const configured = Number(process.env.DESIGN_MCP_MAX_RESPONSE_BYTES);
  return Number.isFinite(configured) && configured >= 1_000 ? Math.floor(configured) : DEFAULT_MAX_RESPONSE_BYTES;
}

/** What to change to make each tool's reply smaller. */
const NARROWING_HINT = {
  design_search: 'Lower limit, or drop detail: "full".',
  design_list: 'Lower limit and page with offset, or drop detail: "full".',
  design_get: 'Drop detail: "full".',
  design_component_get: 'Drop detail: "full" and read one variant with design_component_code.',
  design_component_search: "Lower limit, or add a query or category.",
  design_preset_get: "Lower limit, page with offset, or pass ids.",
  design_docs_get: "Lower maxBytes and page with offset.",
  design_heroui_get_docs: "Request fewer components, or lower maxBytes and page with offset.",
  design_baseui_get_docs: "Request fewer components, or lower maxBytes and page with offset.",
  design_heroui_get_guide: "Lower maxBytes and page with offset.",
  design_baseui_get_guide: "Lower maxBytes and page with offset.",
  design_heroui_migration_guide: "Lower maxBytes and page with offset.",
  design_heroui_get_source: "Drop includeStories.",
  design_uikit_list: "Lower limit, or page with offset.",
  design_uikit_search: "Lower limit, or add a query or kit.",
  design_uikit_get_docs: "Lower maxBytes and page with offset.",
  design_uikit_get_source: "Lower maxBytes and page with offset, or drop path to list files.",
  design_template_file: "Lower maxBytes and page with offset.",
  design_dashboards_list: "Pass kind, or add a query.",
  design_dashboards_get: "Lower maxBytes and page with offset, or omit path to list files.",
  design_style_list: "Lower limit, or page with offset.",
  design_style_search: "Lower limit, or add a query.",
  design_style_get_md: "Lower maxBytes and page with offset.",
  design_file: "Lower maxBytes and page with offset.",
  design_template: 'Omit detail: "full", or pass query/limit.',
  design_kit_list: "Lower limit (default 40), or page with offset.",
  design_kit_search: "Lower limit, or add a query or kit.",
  design_kit_docs: "Use outline: true, section, or lower maxBytes and page with offset.",
  design_kit_code: "Lower maxBytes, drop detail: \"full\", or pass variant/path.",
  design_preset: "Lower limit or pass fewer ids.",
  design_assets: 'Use view: "summary" instead of "packages".',
  design_dashboards: "Pass kind, lower maxBytes, or omit path to list files.",
  design_picks: "Drop resolve: true and inspect individual refs with design_resolve.",
  design_resolve: "Use the layer-specific tool named in nextTools to page large docs.",
};

function serializeResult(name, result) {
  const text = JSON.stringify(result);
  const bytes = Buffer.byteLength(text);
  const max = maxResponseBytes();
  if (bytes > max) {
    throw new Error(
      `${name} would return ${bytes} bytes, over this server's ${max}-byte reply limit. ` +
        (NARROWING_HINT[name] || "Narrow the request.") +
        " (Operators can raise the limit with DESIGN_MCP_MAX_RESPONSE_BYTES.)",
    );
  }
  return text;
}

/**
 * Rule 1: a reply that came from the local cache because the remote host
 * failed has to say so. Empty when remote mode is off or nothing failed
 * during this call.
 */
function remoteNote(name, failuresBefore) {
  const status = remoteStatus();
  if (status.configNote) return status.configNote;
  const staleCatalog = catalogFellBack && CATALOG_TOOLS.has(name);
  if (status.failures === failuresBefore && !staleCatalog) return "";
  return (
    `The remote catalog host did not answer (${status.lastError}). This reply was read from ` +
    "the local cache, which may be older or missing layers."
  );
}

function safeMessage(err) {
  if (err instanceof Error && err.message) {
    return err.message.replace(/https?:\/\/[^\s)]+/g, "[redacted-url]");
  }
  return "An unexpected error occurred";
}

const TOOL_SETS = {
  core: [
    "design_search", "design_facets", "design_get", "design_file",
    "design_template", "design_markdown_check", "design_markdown_render",
    "design_package_file", "design_claude_package", "design_list", "design_markdown",
    "design_manifest_template", "design_markdown_parse", "design_manifest_from", "design_markdown_validate",
  ],
  kits: [
    "design_kit_list", "design_kit_search", "design_kit_docs", "design_kit_code",
  ],
  extras: [
    "design_preset", "design_library", "design_assets",
  ],
  components: [
    "design_component_search", "design_component_get", "design_component_code",
    "design_preset_search", "design_preset_get", "design_library_search", "design_library_get",
    "design_asset_list", "design_asset_importmap", "design_template_list", "design_template_get",
    "design_template_file", "design_docs_search", "design_docs_get",
  ],
  heroui: [
    "design_heroui_list_components", "design_heroui_search", "design_heroui_get_docs",
    "design_heroui_get_guide", "design_heroui_get_source", "design_heroui_get_styles",
    "design_heroui_get_theme_variables", "design_heroui_migration_guide",
  ],
  mantine: ["design_mantine_list_components", "design_mantine_search", "design_mantine_get_component"],
  daisyui: ["design_daisyui_list_components", "design_daisyui_search", "design_daisyui_get_component"],
  style: ["design_style_list", "design_style_search", "design_style_get", "design_style_get_md"],
  baseui: ["design_baseui_list_components", "design_baseui_search", "design_baseui_get_docs", "design_baseui_get_guide"],
  uikits: ["design_uikit_list", "design_uikit_search", "design_uikit_get_docs", "design_uikit_get_source"],
  dashboards: ["design_dashboards", "design_dashboards_list", "design_dashboards_get"],
  picks: ["design_picks", "design_resolve"],
};

function activeTools(rawToolsets) {
  if (!rawToolsets || rawToolsets === "all") return TOOLS;
  const requested = new Set(rawToolsets.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean));
  if (requested.has("all")) return TOOLS;
  const allowedNames = new Set();
  for (const set of requested) {
    if (TOOL_SETS[set]) {
      for (const name of TOOL_SETS[set]) allowedNames.add(name);
    }
  }
  return TOOLS.filter((t) => allowedNames.has(t.name));
}

async function main() {
  const urlIdx = process.argv.indexOf("--url");
  if (urlIdx !== -1 && process.argv[urlIdx + 1]) {
    setRemoteUrl(process.argv[urlIdx + 1]);
  }
  const toolsetIdx = process.argv.indexOf("--toolsets");
  const rawToolsets = (
    toolsetIdx !== -1 && process.argv[toolsetIdx + 1]
      ? process.argv[toolsetIdx + 1]
      : process.env.DESIGN_TOOLSETS || ""
  ).trim();
  const configuredTools = activeTools(rawToolsets);
  if (rawToolsets) {
    console.error(`[design-mcp] active toolsets (${rawToolsets}): ${configuredTools.length} of ${TOOLS.length} tools enabled`);
  }
  const remote = getRemoteUrl();
  if (remote) console.error(`[design-mcp] reading catalog from remote static server: ${remote}`);
  const configNote = remoteStatus().configNote;
  if (configNote) console.error(`[design-mcp] ${configNote}`);

  await loadCatalog();
  if (catalogProblem) {
    // stdout is the MCP transport, so this goes to stderr. The server keeps
    // running: the catalog tools return this same text as their error.
    console.error(
      `[design-mcp] ${catalogProblem}\n` +
        `[design-mcp] this image ships the fetchers:\n` +
        `[design-mcp]   node scripts/refero-public-fetch.js --limit 0\n` +
        `[design-mcp]   node scripts/fetch-opendesign.mjs\n` +
        `[design-mcp]   node scripts/fetch-thumbs.mjs`,
    );
  }

  let pkgVersion = "1.0.0";
  try {
    const pkg = JSON.parse(await readFile(join(HERE, "..", "package.json"), "utf8"));
    if (pkg?.version) pkgVersion = String(pkg.version);
  } catch {
    // Fall back when package.json is absent.
  }

  const server = new Server(
    { name: "design-mcp", version: pkgVersion },
    {
      capabilities: { tools: {}, resources: {} },
      instructions:
        "design-mcp provides 100% offline access to local design systems, components, presets, templates, UI kit docs, and styles. " +
        "Rules: (1) Do not guess names or slugs; use the appropriate *_list or *_search tools to discover exact identifiers. " +
        "(2) Large documents and source files are paged via offset and nextOffset; use outline: true on doc tools to view sections before reading. " +
        "(3) All operations execute offline against cached assets; no outbound network calls are made.",
    },
  );

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: "designer://picks",
        name: "Gallery MCP Picks Queue",
        description: "Items sent from the Designer gallery via '+ Send to MCP' (canonical designer:* references + notes).",
        mimeType: "application/json",
      },
    ],
  }));
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri !== "designer://picks") {
      throw new Error(`Unknown resource: ${request.params.uri}`);
    }
    const payload = await handlePicks({ action: "list" });
    return {
      contents: [
        {
          uri: "designer://picks",
          mimeType: "application/json",
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: configuredTools.map((tool) => ({
      ...tool,
      annotations: tool.annotations || {
        readOnlyHint: true,
        idempotentHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
    })),
  }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (!configuredTools.some((t) => t.name === name)) {
      throw new Error(`Tool '${name}' is not enabled in active toolsets (${rawToolsets || "default"}). Available toolsets: ${Object.keys(TOOL_SETS).join(", ")}`);
    }
    const startedAt = Date.now();
    const remoteFailuresBefore = remoteStatus().failures;
    try {
      const result = await dispatch(name, args ?? {});
      const note = remoteNote(name, remoteFailuresBefore);
      const text = serializeResult(name, note && isRecord(result) ? { ...result, remoteNote: note } : result);
      console.error(
        JSON.stringify({
          event: "tool_call",
          tool: name,
          status: "success",
          durationMs: Date.now() - startedAt,
        }),
      );
      return { content: [{ type: "text", text }] };
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
      const note = remoteNote(name, remoteFailuresBefore);
      return { content: [{ type: "text", text: `Error: ${message}${note ? ` ${note}` : ""}` }], isError: true };
    }
  });

  // The SDK drops a line it cannot parse and sends no reply. Without a log
  // line, a client that sends bad JSON sees only a server that never answers.
  server.onerror = (err) => {
    console.error(`[design-mcp] transport error: ${safeMessage(err).slice(0, 300)}`);
  };

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
