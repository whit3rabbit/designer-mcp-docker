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

import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
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
} from "./lib/cache.mjs";
import { blankManifestTemplate } from "./lib/ds-manifest.mjs";
import { parseDesignMd, manifestFromDesignMd } from "./lib/design-md-parse.mjs";
import {
  combineTokens, isRecord, readCssTokens, renderDesignMdDraft, STITCH_TOKEN_GROUPS, validateDesignObservations,
} from "./lib/design-md-tokens.mjs";
import { resolveDesignDetailed } from "./lib/resolve.mjs";
import { isPackagePath, legacyPackageFiles } from "./lib/opendesign-package.mjs";
import { score, searchText } from "./lib/score.mjs";
import { readUiSdkDoc, searchUiSdkDocs } from "./lib/ui-sdk-docs.mjs";
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
import { loadFrontend } from "./lib/frontend.mjs";

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
  "design_search", "design_get", "design_package_file", "design_claude_package", "design_list",
  "design_facets", "design_markdown", "design_markdown_parse", "design_manifest_from",
  "design_markdown_validate",
]);
const CONTENT_INPUT_TOOLS = new Set(["design_markdown_parse", "design_manifest_from", "design_markdown_validate"]);

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
    // screenshotUrl is left out: it holds the same URL as thumbnailUrl.
    thumbnailUrl: item.thumbnailUrl || "",
  };
}

// ------------------------------------------------------------------ tools
const MARKDOWN_INPUT_BYTES = 200_000;
// Closed sets, shared by the schemas and the handlers so they cannot drift.
const THEMES = ["light", "dark", "mixed"];
const SOURCES = Object.values(SOURCE);
const DOC_KINDS = ["component", "guide"];
const DOC_SECTIONS = ["core", "react", "web", "references", "skill"];
// Long documents are returned a page at a time. The default keeps one call
// near 10k tokens; the ceiling stays under the reply limit after JSON escaping.
const DEFAULT_PAGE_BYTES = 40_000;
const MAX_PAGE_BYTES = 100_000;
const PAGE_PROPERTIES = {
  offset: {
    type: "integer",
    minimum: 0,
    maximum: 100_000_000,
    description: "Resume at this byte offset: the previous reply's nextOffset.",
  },
  maxBytes: {
    type: "integer",
    minimum: 1000,
    maximum: MAX_PAGE_BYTES,
    description: "Max bytes of text per reply (default 40000).",
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

const TOOLS = [
  {
    name: "design_search",
    description:
      "Natural-language search over the local design-system catalog. Searches every source " +
      "(Refero styles, OpenDesign design systems) by name, vibe, industry, font, and color. " +
      "For website/brand visual direction and DESIGN.md only — use design_component_search for AI components, " +
      "design_library_search for install manifests, or design_{heroui,mantine,daisyui,baseui}_search / " +
      "design_docs_search for UI kit docs. Runs entirely offline against the local cache.",
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
      "Resolve a gallery reference, id, site name, hostname, or URL to the full design record, " +
      "including color tokens and fonts. For OpenDesign, returns the package manifest and cached file list. " +
      "Use design_markdown for the design prose and design_package_file to read package files.",
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
      "Inventory the built frontend assets the gallery serves as a local CDN: the offline starter " +
      "(page plus zip), bundled browser modules for react/motion/gsap/lucide/phosphor/radix, Tailwind " +
      "example sources, template files, and thumbnails. Returns the content-hash version, per-group " +
      "file counts, and the vendored packages with licenses.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "design_asset_importmap",
    description:
      "The import map that turns a running gallery into an offline module CDN: bare specifiers " +
      "(react, react-dom/client, motion/react, gsap, lucide-react, @phosphor-icons/react, radix-ui, cn, " +
      "class-variance-authority, shadcn/*) resolved to content-addressed asset URLs. Pass origin for " +
      "absolute URLs, or omit for origin-relative paths under base.",
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
        ...PAGE_PROPERTIES,
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
      "Read HeroUI v3 component docs (usage examples, props, anatomy, accessibility) for one or more @heroui/react components. Always read the docs before implementing a HeroUI component.",
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
        offset: { ...PAGE_PROPERTIES.offset, description: "Resume one doc at its nextOffset (single component only)." },
        maxBytes: { ...PAGE_PROPERTIES.maxBytes, description: "Max bytes of text for the whole reply (default 40000)." },
      },
      required: ["components"],
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_get_guide",
    description:
      "Read a HeroUI v3 guide: quick-start, frameworks, composition, styling, theming, theming-for-agents, colors, dark-mode, design-principles, animation, and more.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Guide slug ('theming-for-agents') or catalog path ('guides/theming.md')." },
        ...PAGE_PROPERTIES,
      },
      required: ["path"],
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_get_source",
    description:
      "Read HeroUI v3 component TSX source from the pinned upstream tag, to learn how a component is built or to debug its behavior.",
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
      "Read the @heroui/styles CSS for one component: its BEM classes, variants, and states, used when restyling components globally.",
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
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "design_heroui_migration_guide",
    description:
      "HeroUI v2-to-v3 migration guides. name='index' lists them; others read one: 'agent-guide-full', 'agent-guide-incremental', 'styling', 'hooks', or a component slug like 'button'.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "'index' or a migration guide slug." },
        ...PAGE_PROPERTIES,
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
      "Read one Mantine UI ready-made component in full: every source file (TSX plus its CSS module) exactly as authored on ui.mantine.dev, with its npm packages and live-preview availability. This is the copy-the-example tool; always read a component here before writing Mantine code from scratch.",
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
      "List the offline daisyUI 5 catalog: every component with its group and description, the baked compiled-CSS version, and the full daisyUI theme list the vendored css carries (plain HTML class names, no React, no Tailwind install).",
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
      "Read one daisyUI component in full: its class names by category, the upstream syntax template, the rendered offline-safe example HTML (drop it in any page with daisyUI's css), the upstream usage rules, and live-preview availability. This is the copy-the-example tool; always read a component here before writing daisyUI markup from scratch.",
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
    name: "design_baseui_list_components",
    description:
      "List the offline Base UI (@base-ui/react) docs catalog: every headless component with a description, the guide index (overview, handbook, utilities), the recorded latest release, and the licence checksum. Base UI is headless — pair these docs with the ReUI gallery's Base UI variants.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
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
      "Read Base UI component docs (usage examples, anatomy, props, accessibility notes) for one or more @base-ui/react components. Always read the docs before implementing a Base UI component; for a styled, rendered version use the ReUI gallery it cross-links.",
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
        offset: { ...PAGE_PROPERTIES.offset, description: "Resume one doc at its nextOffset (single component only)." },
        maxBytes: { ...PAGE_PROPERTIES.maxBytes, description: "Max bytes of text for the whole reply (default 40000)." },
      },
      required: ["components"],
      additionalProperties: false,
    },
  },
  {
    name: "design_baseui_get_guide",
    description:
      "Read a Base UI guide: the handbook (styling, animation, composition, customization, forms, typescript), the utilities (CSP Provider, Direction Provider, mergeProps, useRender), or an overview page including release notes.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Guide slug ('styling'), a section path ('handbook/styling'), or a catalog path ('handbook/styling.md').",
        },
        ...PAGE_PROPERTIES,
      },
      required: ["path"],
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
  if (industry) pool = pool.filter((d) => d.industry === industry);
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

  const limit = asLimit(args.limit, 20, 100);
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
async function handleAssetList() {
  const frontend = await loadFrontendOnce();
  const pub = frontend?.publicManifest;
  if (!pub) {
    return {
      available: false,
      note: "frontend assets have not been built. The gallery image ships them; in a checkout run npm run frontend:build.",
    };
  }
  const map = frontend.importMap();
  return {
    available: true,
    version: pub.version,
    servedAt: "/assets/<version>/<file>",
    groups: pub.groups,
    starter: { url: pub.starter, archive: pub.archive },
    packages: (pub.packages || []).map((p) => ({ name: p.name, version: p.version, license: p.license })),
    importMap: map ? { specifiers: Object.keys(map.imports).length, route: "/assets/importmap.json" } : null,
  };
}

/**
 * The bare-specifier import map that turns a running gallery into an
 * offline module CDN. origin (or the configured DESIGN_REMOTE_URL) makes
 * the URLs absolute; without one they stay origin-relative under `base`.
 */
async function handleAssetImportmap(args) {
  const frontend = await loadFrontendOnce();
  const map = frontend?.importMap();
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
  // `query` is optional — listing every cached library is valid.
  const q = optionalString(args.query ?? args.q).trim().toLowerCase();
  const category = optionalString(args.category, "category").trim().toLowerCase();

  const limit = asLimit(args.limit, 20, 50);
  let libs = index.libraries || [];
  if (category) {
    libs = libs.filter((l) => String(l.category || "").toLowerCase() === category);
  }
  if (q) {
    // Match against the full entries too: keywords live only there, and the
    // catalog is small enough that reading all of it stays cheap.
    const matched = [];
    for (const l of libs) {
      const entry = await readLibraryEntry(l.id);
      const keywords = entry ? (entry.keywords || []).join(" ") : "";
      const hay = `${l.id} ${l.name} ${l.category} ${l.summary || ""} ${keywords}`;
      if (hay.toLowerCase().includes(q)) matched.push(l);
    }
    libs = matched;
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
    else Object.assign(result, pageText(content, paging));
    results.push(result);
  }
  return { version: catalog.version, results };
}

async function handleHeroUiGetGuide(args) {
  const raw = asString(args.path, "path").replace(/^\/+/, "");
  const catalog = await readHeroUiCatalog();
  if (!catalog.guides.length) return { available: false, note: heroUiUnavailableNote() };
  // Resolve through the catalog first: a guide's slug is not always its file
  // name ('theming-with-agents' lives at guides/theming-for-agents.md), and
  // callers pass 'theming', 'guides/theming' and 'guides/theming.md' alike.
  const guide = catalog.guides.find(
    (g) => g.slug === raw || g.path === raw || g.path === `${raw}.md` || g.path === `guides/${raw}.md`,
  );
  const path = guide ? guide.path : raw.endsWith(".md") ? raw : `guides/${raw}.md`;
  const content = await readHeroUiDoc(path);
  if (content === null) {
    throw new Error(`guide not found: ${raw}; use design_heroui_list_components for the guide index`);
  }
  return { path, ...pageText(content, pageArgs(args)) };
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

async function handleHeroUiGetThemeVariables() {
  const catalog = await readHeroUiCatalog();
  if (!catalog.components.length) return { available: false, note: heroUiUnavailableNote() };
  const theme = await readHeroUiTheme();
  if (!theme) {
    return {
      available: false,
      note: "Theme css was not baked into this deployment; re-run npm run heroui.",
    };
  }
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
  return {
    slug: detail.slug,
    name: detail.name,
    group: detail.group || null,
    description: detail.description,
    docUrl: detail.docUrl,
    classes: detail.classes || [],
    syntax: detail.syntax || "",
    example: detail.example || "",
    docs: detail.docs || "",
    livePreview: frontend?.daisyuiPreviewPath?.(detail.slug) != null,
  };
}

// ------------------------------------------------------------- baseui layer
function baseUiUnavailableNote() {
  return (
    "The Base UI docs layer is not baked into this deployment. The gallery image ships it; " +
    "in a checkout run: npm run baseui && npm run bake."
  );
}

async function handleBaseUiList() {
  const catalog = await readBaseUiCatalog();
  if (!catalog.components.length) return { available: false, note: baseUiUnavailableNote() };
  return catalog;
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
    else Object.assign(result, pageText(content, paging));
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
  return { path: entry.path, section: entry.section, name: entry.name, ...pageText(content, pageArgs(args)) };
}


async function dispatch(name, args) {
  if (CATALOG_TOOLS.has(name) && !(CONTENT_INPUT_TOOLS.has(name) && args.identifier === undefined)) {
    await ensureCatalog();
  }
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
    case "design_docs_search":
      return searchUiSdkDocs({
        query: optionalString(args.query),
        section: asEnum(args.section, "section", DOC_SECTIONS) ?? "",
        limit: asLimit(args.limit, 20, 100),
      });
    case "design_docs_get": {
      const docPath = asString(args.path, "path");
      const content = await readUiSdkDoc(docPath);
      if (content === null) throw new Error(`ui-sdk doc not found: ${docPath}`);
      const page = pageText(content, pageArgs(args));
      return { path: docPath, bytes: page.totalBytes, ...page };
    }
    case "design_heroui_list_components":
      return handleHeroUiList();
    case "design_heroui_search":
      return searchHeroUiDocs({
        query: optionalString(args.query),
        kind: asEnum(args.kind, "kind", DOC_KINDS) ?? "",
        limit: asLimit(args.limit, 20, 100),
      });
    case "design_heroui_get_docs":
      return handleHeroUiGetDocs(args);
    case "design_heroui_get_guide":
      return handleHeroUiGetGuide(args);
    case "design_heroui_get_source":
      return handleHeroUiGetSource(args);
    case "design_heroui_get_styles":
      return handleHeroUiGetStyles(args);
    case "design_heroui_get_theme_variables":
      return handleHeroUiGetThemeVariables();
    case "design_heroui_migration_guide":
      return handleHeroUiMigration(args);
    case "design_mantine_list_components":
      return handleMantineList();
    case "design_mantine_search":
      return searchMantine({
        query: optionalString(args.query),
        category: optionalString(args.category, "category"),
        limit: asLimit(args.limit, 20, 100),
      });
    case "design_mantine_get_component":
      return handleMantineGetComponent(args);
    case "design_daisyui_list_components":
      return handleDaisyuiList();
    case "design_daisyui_search":
      return searchDaisyui({
        query: optionalString(args.query),
        group: optionalString(args.group, "group"),
        limit: asLimit(args.limit, 20, 100),
      });
    case "design_daisyui_get_component":
      return handleDaisyuiGetComponent(args);
    case "design_baseui_list_components":
      return handleBaseUiList();
    case "design_baseui_search":
      return searchBaseUiDocs({
        query: optionalString(args.query),
        kind: asEnum(args.kind, "kind", DOC_KINDS) ?? "",
        limit: asLimit(args.limit, 20, 100),
      });
    case "design_baseui_get_docs":
      return handleBaseUiGetDocs(args);
    case "design_baseui_get_guide":
      return handleBaseUiGetGuide(args);
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
  design_template_file: "Lower maxBytes and page with offset.",
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

async function main() {
  const urlIdx = process.argv.indexOf("--url");
  if (urlIdx !== -1 && process.argv[urlIdx + 1]) {
    setRemoteUrl(process.argv[urlIdx + 1]);
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
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map((tool) => ({
      ...tool,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
    })),
  }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
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
