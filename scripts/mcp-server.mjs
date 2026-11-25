#!/usr/bin/env node
/**
 * design-mcp — a generic, offline-first MCP server over the design catalog.
 *
 * Ultra-fast zero-dependency stdio JSON-RPC 2.0 entrypoint:
 *   - Answers `initialize`, `ping`, `tools/list`, and `resources/list`
 *     immediately with zero npm imports and zero catalog disk I/O.
 *   - Lazy-loads `scripts/lib/mcp-runtime.mjs` on the first `tools/call` or
 *     `resources/read` request, and `scripts/lib/mcp-legacy-tools.mjs` only
 *     when `--legacy-tools` / `DESIGN_LEGACY_TOOLS` is enabled.
 *   - Heavy parsers (markdown-it, culori, postcss, yaml, upstream Refero
 *     renderer) and the 4 MB design catalog are further deferred inside the
 *     runtime until a tool that actually needs them runs.
 *
 * By default everything is served from the local cache and this server makes
 * NO outbound network calls. The one exception is opt-in: DESIGN_REMOTE_URL
 * or --url points the readers at a hosted static copy of the same cache.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

const LATEST_PROTOCOL_VERSION = "2025-11-25";
const SUPPORTED_PROTOCOL_VERSIONS = [
  LATEST_PROTOCOL_VERSION,
  "2025-06-18",
  "2025-03-26",
  "2024-11-05",
  "2024-10-07",
];

const SERVER_INSTRUCTIONS =
  "design-mcp provides 100% offline access to local design systems, components, presets, templates, UI kit docs, and styles. " +
  "Rules: (1) Do not guess names or slugs; use the appropriate *_list or *_search tools to discover exact identifiers. " +
  "(2) Large documents and source files are paged via offset and nextOffset; use outline: true on doc tools to view sections before reading. " +
  "(3) All operations execute offline against cached assets; no outbound network calls are made.";

const DEFAULT_ANNOTATIONS = {
  readOnlyHint: true,
  idempotentHint: true,
  destructiveHint: false,
  openWorldHint: false,
};

const RESOURCES = [
  {
    uri: "designer://picks",
    name: "Gallery MCP Picks Queue",
    description: "Items sent from the Designer gallery via '+ Send to MCP' (canonical designer:* references + notes).",
    mimeType: "application/json",
  },
];

// ------------------------------------------------------------------ schemas
const SOURCES = ["refero", "opendesign"];
const THEMES = ["light", "dark", "mixed"];
const DASHBOARD_LIST_KINDS = ["all", "stacks", "starters", "presets", "verticals", "frameworks", "references", "subskills"];
const DASHBOARD_GET_KINDS = ["stack", "starter", "preset", "vertical", "framework", "reference", "skill"];
const UIKIT_MAX_ROWS = 500;
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
const DESIGN_IDENTIFIER = {
  type: "string",
  description: "Exact gallery reference (designer:<source>:<id>), cached id, site name, hostname, or URL.",
};
const DESIGN_MD_INPUT = {
  identifier: DESIGN_IDENTIFIER,
  content: { type: "string", description: "Raw DESIGN.md markdown, up to 200,000 UTF-8 bytes." },
  source: { type: "string", enum: SOURCES, description: "Disambiguate a cached identifier." },
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
const DESIGN_MD_ONE_INPUT_NOTE = " Pass exactly one of identifier or content.";

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

// ------------------------------------------------------------------ config
const LEGACY_TOOLS_MODE =
  process.argv.includes("--legacy-tools") ||
  /^(1|true|yes)$/i.test(process.env.DESIGN_LEGACY_TOOLS || "");

const urlIdx = process.argv.indexOf("--url");
const cliUrl = urlIdx !== -1 && process.argv[urlIdx + 1] ? process.argv[urlIdx + 1] : "";

const toolsetIdx = process.argv.indexOf("--toolsets");
const rawToolsets = (
  toolsetIdx !== -1 && process.argv[toolsetIdx + 1]
    ? process.argv[toolsetIdx + 1]
    : process.env.DESIGN_TOOLSETS || ""
).trim();

function validateRemoteUrlStartup(raw) {
  const text = String(raw || "").trim().replace(/\/+$/, "");
  if (!text) return;
  let valid = false;
  try {
    const { protocol } = new URL(text);
    valid = protocol === "http:" || protocol === "https:";
  } catch {
    valid = false;
  }
  if (valid) {
    console.error(`[design-mcp] reading catalog from remote static server: ${text}`);
  } else {
    console.error(
      "[design-mcp] The configured remote URL is not an http(s) URL. It was ignored; replies come from the local cache.",
    );
  }
}

validateRemoteUrlStartup(cliUrl || process.env.DESIGN_REMOTE_URL);

let pkgVersion = null;
function getPkgVersion() {
  if (pkgVersion !== null) return pkgVersion;
  pkgVersion = "1.0.0";
  try {
    const pkg = JSON.parse(readFileSync(join(HERE, "..", "package.json"), "utf8"));
    if (pkg?.version) pkgVersion = String(pkg.version);
  } catch {
    // Fall back when package.json is absent.
  }
  return pkgVersion;
}

function filterToolsets(allTools, raw) {
  if (!raw || raw === "all") return allTools;
  const requested = new Set(raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean));
  if (requested.has("all")) return allTools;
  const allowedNames = new Set();
  for (const set of requested) {
    if (TOOL_SETS[set]) {
      for (const name of TOOL_SETS[set]) allowedNames.add(name);
    }
  }
  return allTools.filter((t) => allowedNames.has(t.name));
}

function withAnnotations(tools) {
  return tools.map((tool) => ({
    ...tool,
    annotations: tool.annotations || DEFAULT_ANNOTATIONS,
  }));
}

let toolsState = null;
let toolsStatePromise = null;

function buildToolsState(allTools) {
  const configured = filterToolsets(allTools, rawToolsets);
  if (rawToolsets) {
    console.error(`[design-mcp] active toolsets (${rawToolsets}): ${configured.length} of ${allTools.length} tools enabled`);
  }
  return {
    annotated: withAnnotations(configured),
    names: new Set(configured.map((t) => t.name)),
  };
}

if (!LEGACY_TOOLS_MODE) {
  toolsState = buildToolsState(CORE_TOOLS);
} else {
  // Kick off legacy schema import immediately without blocking initialize/ping.
  toolsStatePromise = import("./lib/mcp-legacy-tools.mjs").then(({ LEGACY_TOOLS }) => {
    const allTools = [...CORE_TOOLS, ...LEGACY_TOOLS.filter((t) => !CORE_TOOL_NAMES.has(t.name))];
    toolsState = buildToolsState(allTools);
    return toolsState;
  });
}

function getToolsState() {
  return toolsState ? toolsState : toolsStatePromise;
}

let runtimePromise = null;
function getRuntime() {
  if (!runtimePromise) {
    runtimePromise = import("./lib/mcp-runtime.mjs").then((mod) => {
      mod.configureRuntime({ cliUrl, legacyToolsMode: LEGACY_TOOLS_MODE });
      return mod;
    });
  }
  return runtimePromise;
}

// ------------------------------------------------------------------ stdio MCP
const MAX_BUFFER_BYTES = 64 * 1024 * 1024;
const ERR_INVALID_REQUEST = -32600;
const ERR_METHOD_NOT_FOUND = -32601;
const ERR_INVALID_PARAMS = -32602;
const ERR_INTERNAL = -32603;

function safeMessage(err) {
  if (err instanceof Error && err.message) {
    return err.message.replace(/https?:\/\/[^\s)]+/g, "[redacted-url]");
  }
  return "An unexpected error occurred";
}

function sendJson(payload) {
  const line = JSON.stringify(payload) + "\n";
  if (!process.stdout.write(line)) {
    return new Promise((resolve) => process.stdout.once("drain", resolve));
  }
}

function sendResult(id, result) {
  return sendJson({ jsonrpc: "2.0", id, result });
}

function sendError(id, code, message) {
  return sendJson({ jsonrpc: "2.0", id, error: { code, message } });
}

class RpcError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

async function handleRequest(msg) {
  const { method, params = {} } = msg;
  switch (method) {
    case "initialize": {
      const requested = params?.protocolVersion;
      const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requested)
        ? requested
        : LATEST_PROTOCOL_VERSION;
      return {
        protocolVersion,
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: "design-mcp", version: getPkgVersion() },
        instructions: SERVER_INSTRUCTIONS,
      };
    }
    case "ping":
      return {};
    case "resources/list":
      return { resources: RESOURCES };
    case "resources/read": {
      if (params?.uri !== "designer://picks") {
        throw new RpcError(ERR_INTERNAL, `Unknown resource: ${params?.uri}`);
      }
      const runtime = await getRuntime();
      const payload = await runtime.readPicksResource();
      return {
        contents: [
          {
            uri: "designer://picks",
            mimeType: "application/json",
            text: JSON.stringify(payload, null, 2),
          },
        ],
      };
    }
    case "tools/list": {
      const state = await getToolsState();
      return { tools: state.annotated };
    }
    case "tools/call": {
      if (!params || typeof params !== "object" || typeof params.name !== "string" || !params.name) {
        throw new RpcError(ERR_INVALID_PARAMS, "Invalid tools/call request: name must be a non-empty string");
      }
      if (params.arguments !== undefined && (params.arguments === null || typeof params.arguments !== "object" || Array.isArray(params.arguments))) {
        throw new RpcError(ERR_INVALID_PARAMS, "Invalid tools/call request: arguments must be an object");
      }
      const state = await getToolsState();
      if (!state.names.has(params.name)) {
        throw new RpcError(
          ERR_INTERNAL,
          `Tool '${params.name}' is not enabled in active toolsets (${rawToolsets || "default"}). Available toolsets: ${Object.keys(TOOL_SETS).join(", ")}`,
        );
      }
      const runtime = await getRuntime();
      return runtime.executeTool(params.name, params.arguments ?? {});
    }
    default:
      throw new RpcError(ERR_METHOD_NOT_FOUND, `Method not found: ${method}`);
  }
}

let pendingBuf = null;
let inFlight = 0;
let stdinEnded = false;

function maybeExitOnEof() {
  if (stdinEnded && inFlight === 0) {
    process.stdin.pause();
  }
}

function processLine(line) {
  if (!line) return;
  let msg;
  try {
    msg = JSON.parse(line);
  } catch (err) {
    console.error(`[design-mcp] transport error: ${safeMessage(err).slice(0, 300)}`);
    return;
  }
  if (!msg || typeof msg !== "object" || Array.isArray(msg)) {
    console.error("[design-mcp] transport error: invalid JSON-RPC message");
    return;
  }
  // Notifications carry no `id` and never get a response.
  if (!Object.prototype.hasOwnProperty.call(msg, "id") || msg.id === undefined) {
    return;
  }
  if (typeof msg.method !== "string") {
    void sendError(msg.id, ERR_INVALID_REQUEST, "Invalid Request");
    return;
  }
  inFlight++;
  handleRequest(msg)
    .then((result) => sendResult(msg.id, result))
    .catch((err) => {
      const code = err instanceof RpcError ? err.code : ERR_INTERNAL;
      return sendError(msg.id, code, safeMessage(err));
    })
    .finally(() => {
      inFlight--;
      maybeExitOnEof();
    });
}

process.stdin.on("data", (chunk) => {
  const buf = pendingBuf ? Buffer.concat([pendingBuf, chunk]) : chunk;
  if (buf.length > MAX_BUFFER_BYTES) {
    pendingBuf = null;
    console.error("[design-mcp] transport error: message exceeds maximum buffer size");
    return;
  }
  let start = 0;
  let nl;
  while ((nl = buf.indexOf(0x0a, start)) !== -1) {
    const end = nl > start && buf[nl - 1] === 0x0d ? nl - 1 : nl;
    const line = buf.toString("utf8", start, end).trim();
    start = nl + 1;
    processLine(line);
  }
  pendingBuf = start < buf.length ? buf.subarray(start) : null;
});

process.stdin.on("end", () => {
  if (pendingBuf && pendingBuf.length > 0) {
    const line = pendingBuf.toString("utf8").trim();
    pendingBuf = null;
    processLine(line);
  }
  stdinEnded = true;
  maybeExitOnEof();
});

process.stdin.on("error", (err) => {
  console.error(`[design-mcp] transport error: ${safeMessage(err).slice(0, 300)}`);
});

const shutdown = () => {
  process.stdin.pause();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
