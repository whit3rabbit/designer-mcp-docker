/**
 * ui-sdk-docs.mjs — offline index and reader for bundled @ui-sdk/* documentation.
 *
 * Reads Markdown docs from `plugins/designer-mcp/skills/designer-ui/ui-sdk/`
 * on disk (offline) or from `DESIGN_REMOTE_URL/api/ui-sdk-docs.json` when
 * pointed at a static host.
 */

import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getRemoteUrl } from "./cache.mjs";

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
const docContentCache = new Map();

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
  const remote = getRemoteUrl();
  if (remote) {
    if (cachedIndex) return cachedIndex;
    const res = await fetch(`${remote}/api/ui-sdk-docs.json`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return { total: 0, docs: [] };
    cachedIndex = await res.json();
    return cachedIndex;
  }
  if (cachedIndex) return cachedIndex;
  const docs = [];
  await walkMarkdown(dir, dir, docs);
  docs.sort((a, b) => a.path.localeCompare(b.path));
  cachedIndex = { total: docs.length, docs };
  return cachedIndex;
}

export async function readUiSdkDoc(docPath, dir = DEFAULT_UI_SDK_DIR) {
  const clean = String(docPath || "").replace(/^\/+/, "");
  if (!clean || clean.includes("..") || !/^[a-z0-9._/-]+$/i.test(clean)) return null;
  if (docContentCache.has(clean)) return docContentCache.get(clean);

  const remote = getRemoteUrl();
  if (remote) {
    const res = await fetch(`${remote}/api/ui-sdk-docs/${clean}`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const text = await res.text();
    docContentCache.set(clean, text);
    return text;
  }

  const full = resolve(dir, clean);
  if (!full.startsWith(resolve(dir) + "/") || !existsSync(full)) return null;
  const text = await readFile(full, "utf8");
  docContentCache.set(clean, text);
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
