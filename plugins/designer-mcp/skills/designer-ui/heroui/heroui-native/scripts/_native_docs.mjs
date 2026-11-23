/**
 * Locate HeroUI Native docs, fully offline.
 *
 * HeroUI Native docs are NOT baked into the designer-mcp layer (that layer
 * covers @heroui/react for web). The offline source is the project's own
 * install: `node_modules/heroui-native/docs`, resolved like Node module
 * resolution so hoisted workspace installs are found. The nearest
 * `package.json` above the working directory must depend on
 * `heroui-native`, so an unrelated install is never reported.
 *
 * `$HEROUI_NATIVE_DOCS_DIR` overrides. No network access, ever.
 */
import {existsSync, readFileSync} from "node:fs";
import {dirname, join} from "node:path";

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

/** True when the nearest `package.json` above `cwd` declares `heroui-native`. */
const projectUsesHeroUiNative = (cwd) => {
  for (const dir of ancestors(cwd)) {
    const pkg = existsSync(join(dir, "package.json")) && readJson(join(dir, "package.json"));

    if (pkg) return DEPENDENCY_FIELDS.some((field) => pkg[field]?.["heroui-native"]);
  }

  return false;
};

/**
 * Returns `{docsDir, version, source}` for the installed docs, or null.
 * Callers print OFFLINE_NOTE when null.
 */
export const findLocalDocs = (cwd = process.cwd()) => {
  if (process.env.HEROUI_NATIVE_DOCS_DIR) {
    const docsDir = process.env.HEROUI_NATIVE_DOCS_DIR;

    return existsSync(join(docsDir, "llms.txt"))
      ? {docsDir, version: "env", source: "$HEROUI_NATIVE_DOCS_DIR"}
      : null;
  }

  if (!projectUsesHeroUiNative(cwd)) return null;

  for (const dir of ancestors(cwd)) {
    const docsDir = join(dir, "node_modules", "heroui-native", "docs");

    if (existsSync(join(docsDir, "llms.txt"))) {
      const version = readJson(join(docsDir, "..", "package.json"))?.version ?? "unknown";

      return {docsDir, version, source: "the installed heroui-native"};
    }
  }

  return null;
};

/** Printed to stderr when no offline docs exist. */
export const OFFLINE_NOTE = [
  "# Offline: no HeroUI Native docs available.",
  "#   The designer-mcp layer does not bake native docs; install the library",
  "#   in the project and its docs ship inside the package:",
  "#     npm i heroui-native   (then re-run this script from the project)",
  "#   or set HEROUI_NATIVE_DOCS_DIR to a directory containing llms.txt.",
].join("\n");
