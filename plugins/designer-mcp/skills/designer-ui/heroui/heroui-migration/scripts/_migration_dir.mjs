/**
 * Locate the baked HeroUI v2-to-v3 migration guides, fully offline.
 *
 * `$HEROUI_MIGRATION_DIR`, or `<cache>/heroui/migration` where `<cache>` is
 * `$DESIGN_CACHE_DIR` / `$REFERO_CACHE_DIR`, `/cache` inside the
 * designer-mcp image, or `~/.design-cache`. The guides are baked by the
 * designer-mcp fetcher from the pinned upstream tag (see provenance.json).
 *
 * No network access, ever: callers print OFFLINE_NOTE when the layer is
 * missing.
 */
import {existsSync} from "node:fs";
import {homedir} from "node:os";
import {join} from "node:path";

export const OFFLINE_NOTE = [
  "# Offline: no baked HeroUI migration guides available.",
  "#   Bake them in a designer-mcp checkout: npm run heroui && npm run bake",
  "#   or set HEROUI_MIGRATION_DIR to a directory containing agent-guide-full.mdx.",
  "#   The design_kit_docs (kit: \"heroui\", kind: \"migration\") MCP tool serves the same guides when registered.",
].join("\n");

/** Directory holding agent-guide-full.mdx, or null. */
export const findMigrationDir = () => {
  if (process.env.HEROUI_MIGRATION_DIR) {
    const dir = process.env.HEROUI_MIGRATION_DIR;
    return existsSync(join(dir, "agent-guide-full.mdx")) ? dir : null;
  }

  const cacheRoot =
    process.env.DESIGN_CACHE_DIR ||
    process.env.REFERO_CACHE_DIR ||
    (existsSync("/cache") ? "/cache" : join(homedir(), ".design-cache"));
  const dir = join(cacheRoot, "heroui", "migration");

  return existsSync(join(dir, "agent-guide-full.mdx")) ? dir : null;
};

/** Read one guide by slug ("button") or file name ("button.mdx"), or null. */
export const readMigrationDoc = (dir, name) => {
  const clean = String(name || "").replace(/^\/+/, "");
  if (!clean || clean.includes("..") || !/^[\w.-]+$/.test(clean)) return null;
  const file = clean.endsWith(".mdx") ? clean : `${clean}.mdx`;
  const path = join(dir, file);

  return existsSync(path) ? {file, path, content: null} : null;
};
