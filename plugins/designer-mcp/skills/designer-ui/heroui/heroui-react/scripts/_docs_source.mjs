/**
 * Locate HeroUI v3 React docs, fully offline.
 *
 * Resolution order:
 *   1. The project's installed `@heroui/react` (`node_modules/@heroui/react/docs`),
 *      so what the agent reads matches the version the project runs. The nearest
 *      `package.json` above the working directory must depend on `@heroui/react`,
 *      so a parent folder's install is never mistaken for this project's.
 *   2. The baked designer-mcp HeroUI layer: `$HEROUI_DOCS_DIR`, or
 *      `<cache>/heroui/docs` where `<cache>` is `$DESIGN_CACHE_DIR` /
 *      `$REFERO_CACHE_DIR`, `/cache` inside the designer-mcp image, or
 *      `~/.design-cache`. Written by the designer-mcp fetcher
 *      (scripts/fetch-heroui.mjs).
 *
 * No network access, ever: when neither source exists, callers print
 * OFFLINE_NOTE and exit non-zero.
 */
import {existsSync, readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {homedir} from "node:os";

const DEPENDENCY_FIELDS = ["dependencies", "devDependencies", "peerDependencies"];

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch {
    return null;
  }
};

/** Walks up from `start` to the filesystem root, yielding every directory. */
function* ancestors(start) {
  for (let dir = start; ; dir = dirname(dir)) {
    yield dir;
    if (dirname(dir) === dir) return;
  }
}

/** True when the nearest `package.json` above `cwd` declares `@heroui/react`. */
const projectUsesHeroUI = (cwd) => {
  for (const dir of ancestors(cwd)) {
    const pkg = existsSync(join(dir, "package.json")) && readJson(join(dir, "package.json"));

    if (pkg) return DEPENDENCY_FIELDS.some((field) => pkg[field]?.["@heroui/react"]);
  }

  return false;
};

/** The docs of the baked designer-mcp layer (image or checkout), or null. */
export const findBakedDocs = () => {
  if (process.env.HEROUI_DOCS_DIR) {
    const docsDir = process.env.HEROUI_DOCS_DIR;
    if (!existsSync(join(docsDir, "llms.txt"))) return null;

    return {
      docsDir,
      version: readJson(join(docsDir, "..", "catalog.json"))?.version?.react ?? "baked",
      source: "$HEROUI_DOCS_DIR",
    };
  }

  const cacheRoot =
    process.env.DESIGN_CACHE_DIR ||
    process.env.REFERO_CACHE_DIR ||
    (existsSync("/cache") ? "/cache" : join(homedir(), ".design-cache"));
  const docsDir = join(cacheRoot, "heroui", "docs");

  if (!existsSync(join(docsDir, "llms.txt"))) return null;

  return {
    docsDir,
    version: readJson(join(cacheRoot, "heroui", "catalog.json"))?.version?.react ?? "baked",
    source: "the baked designer-mcp layer",
  };
};

/**
 * Returns `{docsDir, version, source}` for the docs to read, or null when
 * nothing is available offline. The installed package wins so the docs always
 * match the version the project runs.
 */
export const findLocalDocs = (cwd = process.cwd()) => {
  if (projectUsesHeroUI(cwd)) {
    for (const dir of ancestors(cwd)) {
      const docsDir = join(dir, "node_modules", "@heroui", "react", "docs");

      if (existsSync(join(docsDir, "llms.txt"))) {
        const version = readJson(join(docsDir, "..", "package.json"))?.version ?? "unknown";

        return {docsDir, version, source: "the installed @heroui/react"};
      }
    }
  }

  return findBakedDocs();
};

/** Printed to stderr when no offline docs exist anywhere. */
export const OFFLINE_NOTE = [
  "# Offline: no HeroUI docs available.",
  "#   1. npm i @heroui/react (the docs ship inside the package)",
  "#   2. bake the designer-mcp layer: npm run heroui && npm run bake",
  "#   3. or set HEROUI_DOCS_DIR to a directory containing llms.txt",
  "#   4. the design_heroui_* MCP tools serve this same catalog when registered",
].join("\n");

/** PascalCase component name -> kebab-case doc slug ("ToggleButton" -> "toggle-button"). */
export const toKebabCase = (name) =>
  String(name || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");

/**
 * Parse llms.txt into component and guide entries:
 * `- [Name](components/x.md): description` under `### Group` headings.
 */
export const parseLlmsTxt = (text) => {
  const components = [];
  const guides = [];
  let section = null;
  let group = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line === "## Components") {
      section = "components";
      group = null;
      continue;
    }
    if (line === "## Guides") {
      section = "guides";
      group = null;
      continue;
    }
    if (line.startsWith("## ") && line !== "## Components" && line !== "## Guides") {
      section = null;
      continue;
    }
    if (line.startsWith("### ")) {
      group = line.slice(4).trim();
      continue;
    }

    const match = /^- \[(.+?)\]\(([^)]+?)\)(?::\s*(.*))?$/.exec(line);
    if (!match || !section) continue;

    const [, name, link, description = ""] = match;
    const entry = {
      name,
      slug: toKebabCase(name),
      group: group || "",
      description: description.trim(),
      path: link,
    };

    if (section === "components" && link.startsWith("components/")) components.push(entry);
    if (section === "guides" && link.startsWith("guides/")) guides.push(entry);
  }

  return {components, guides};
};
