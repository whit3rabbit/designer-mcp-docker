/**
 * ui-sdk-docs.mjs — offline index and reader for bundled @ui-sdk/* documentation.
 *
 * Reads Markdown docs from `plugins/designer-mcp/skills/designer-ui/ui-sdk/`
 * on disk (offline) or from `DESIGN_REMOTE_URL/api/ui-sdk-docs.json` when
 * pointed at a static host.
 */

import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { getRemoteUrl, remoteJson, remoteText, REMOTE_DOWN, createBoundedCache } from "./cache.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
// SKILL_DIR keeps two legacy meanings: the old single-skill dir (which held
// ui-sdk/ directly) or the skills root. Prefer whichever layout exists.
const DEFAULT_UI_SDK_DIR = resolve(
  process.env.SKILLS_ROOT
    ? join(process.env.SKILLS_ROOT, "designer-ui", "ui-sdk")
    : process.env.SKILL_DIR && existsSync(join(process.env.SKILL_DIR, "ui-sdk"))
      ? join(process.env.SKILL_DIR, "ui-sdk")
      : process.env.SKILL_DIR
        ? join(process.env.SKILL_DIR, "designer-ui", "ui-sdk")
        : join(HERE, "..", "..", "plugins", "designer-mcp", "skills", "designer-ui", "ui-sdk"),
);

let cachedIndex = null;
const docContentCache = createBoundedCache(64);

async function walkMarkdown(dir, base, out) {
  if (!existsSync(dir)) return;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkMarkdown(full, base, out);
    } else if (/\.(md|txt)$/i.test(entry.name)) {
      const rel = relative(base, full).replaceAll("\\", "/");
      const text = await readFile(full, "utf8");
      const titleMatch = /^#\s+(.+)$/m.exec(text);
      const section = rel.startsWith("docs/") ? rel.split("/")[1] : rel.startsWith("references/") ? "references" : "skill";
      out.push({
        path: rel,
        section,
        title: titleMatch?.[1]?.trim() || entry.name,
        bytes: Buffer.byteLength(text, "utf8"),
      });
    }
  }
}

export async function listUiSdkDocs(dir = DEFAULT_UI_SDK_DIR) {
  if (cachedIndex) return cachedIndex;
  let remoteDown = false;
  if (getRemoteUrl()) {
    const remote = await remoteJson("api/ui-sdk-docs.json");
    if (remote === null) return { total: 0, docs: [] };
    if (remote !== REMOTE_DOWN && Array.isArray(remote?.docs)) {
      cachedIndex = remote;
      return cachedIndex;
    }
    remoteDown = true;
  }
  const docs = [];
  await walkMarkdown(dir, dir, docs);
  docs.sort((a, b) => a.path.localeCompare(b.path));
  const index = { total: docs.length, docs };
  // The local index stands in while the host is unreachable, but is not
  // kept: the next call asks the host again.
  if (!remoteDown) cachedIndex = index;
  return index;
}

export async function readUiSdkDoc(docPath, dir = DEFAULT_UI_SDK_DIR) {
  const clean = String(docPath || "").replace(/^\/+/, "");
  if (!clean || clean.includes("..") || !/^[a-z0-9._/-]+$/i.test(clean)) return null;
  if (docContentCache.has(clean)) return docContentCache.get(clean);

  let remoteDown = false;
  if (getRemoteUrl()) {
    const text = await remoteText(`api/ui-sdk-docs/${clean}`);
    if (typeof text === "string") {
      docContentCache.set(clean, text);
      return text;
    }
    // A 404 is the host's answer. Only an unreachable host falls back to disk.
    if (text !== REMOTE_DOWN) return null;
    remoteDown = true;
  }

  const base = resolve(dir);
  const full = resolve(base, clean);
  if (!full.startsWith(base + sep) || !existsSync(full)) return null;
  const text = await readFile(full, "utf8");
  // The local doc stands in while the host is unreachable, but is not
  // permanently cached: the next call asks the host again.
  if (!remoteDown) docContentCache.set(clean, text);
  return text;
}

export async function searchUiSdkDocs({ query = "", section = "", limit = 20 }, dir = DEFAULT_UI_SDK_DIR) {
  const { docs } = await listUiSdkDocs(dir);
  const q = String(query || "").trim().toLowerCase();
  const terms = q ? q.split(/\s+/) : [];
  const filtered = docs.filter((d) => {
    if (section && d.section !== section) return false;
    if (!terms.length) return true;
    const hay = `${d.path} ${d.title} ${d.section}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
  return {
    total: filtered.length,
    docs: filtered.slice(0, Math.min(Number(limit) || 20, 100)),
  };
}
