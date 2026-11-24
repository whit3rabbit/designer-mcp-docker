/**
 * picks.mjs — Shared "Send to MCP" picks queue & canonical `designer:*` URI parser.
 *
 * Used by both `scripts/preview.mjs` (HTTP `/api/picks`) and `scripts/mcp-server.mjs`
 * (`design_picks` and `design_resolve` tools).
 *
 * State is stored outside `/cache` (`DESIGN_PICKS_FILE`, defaulting to
 * `~/.designer-mcp/picks.json`) so read-only cache mounts still support live picks.
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const MAX_PICKS = 50;
const MAX_NOTE_LEN = 240;
const MAX_LABEL_LEN = 140;

const SAFE_SEG = /^[a-zA-Z0-9._-]+$/;
const SAFE_THEME = /^[a-z0-9-]+$/;

export function picksFilePath() {
  if (process.env.DESIGN_PICKS_FILE) return process.env.DESIGN_PICKS_FILE;
  return join(homedir(), ".designer-mcp", "picks.json");
}

/**
 * Parse and validate any canonical `designer:<kind>:...` reference URI.
 *
 * Supported forms:
 *   - designer:refero:<uuid>
 *   - designer:opendesign:<slug>
 *   - designer:style:<uuid>
 *   - designer:template:<slug>
 *   - designer:component:<slug>[:<variant>]
 *   - designer:heroui:<slug>
 *   - designer:mantine:<slug>
 *   - designer:daisyui:<slug>[?theme=<theme>]
 *   - designer:baseui:<slug>
 *   - designer:uikit:<kit>:<slug>
 *   - designer:preset:<presetKind>:<id>
 *   - designer:reui:<category>[:<item>]
 *   - designer:compare:<concept>
 *   - designer:dashboard:<slug>
 *   - designer:icon:<set>:<name>
 *   - designer:font:<familySlug>
 *   - designer:chart:<library>
 *   - designer:library:<id>
 */
export function parseDesignerRef(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("designer:") || trimmed.length > 220) return null;
  if (trimmed.includes("..") || /[\r\n\0]/.test(trimmed)) return null;

  const [basePart, queryPart = ""] = trimmed.split("?");
  const parts = basePart.split(":");
  if (parts.length < 3 || parts[0] !== "designer") return null;

  const kind = parts[1].toLowerCase();
  const rest = parts.slice(2);
  if (rest.some((seg) => !seg || !SAFE_SEG.test(seg))) return null;

  const params = {};
  if (queryPart) {
    for (const pair of queryPart.split("&")) {
      const [k, v = ""] = pair.split("=");
      if (k === "theme" && SAFE_THEME.test(v)) params.theme = v;
    }
  }

  switch (kind) {
    case "refero":
    case "opendesign":
    case "style":
    case "template":
    case "heroui":
    case "mantine":
    case "baseui":
    case "compare":
    case "dashboard":
    case "font":
    case "chart":
    case "library":
      if (rest.length !== 1) return null;
      return { kind, id: rest[0], ref: `designer:${kind}:${rest[0]}` };

    case "daisyui": {
      if (rest.length !== 1) return null;
      const theme = params.theme || null;
      return {
        kind,
        id: rest[0],
        ...(theme ? { theme } : {}),
        ref: theme ? `designer:daisyui:${rest[0]}?theme=${theme}` : `designer:daisyui:${rest[0]}`,
      };
    }

    case "component": {
      if (rest.length < 1 || rest.length > 2) return null;
      const [id, variant] = rest;
      return {
        kind,
        id,
        ...(variant ? { variant } : {}),
        ref: variant ? `designer:component:${id}:${variant}` : `designer:component:${id}`,
      };
    }

    case "reui": {
      if (rest.length < 1 || rest.length > 2) return null;
      const [category, item] = rest;
      return {
        kind,
        category,
        id: item || category,
        ...(item ? { item } : {}),
        ref: item ? `designer:reui:${category}:${item}` : `designer:reui:${category}`,
      };
    }

    case "uikit": {
      if (rest.length !== 2) return null;
      const [kit, id] = rest;
      return { kind, kit, id, ref: `designer:uikit:${kit}:${id}` };
    }

    case "preset": {
      if (rest.length !== 2) return null;
      const [presetKind, id] = rest;
      return { kind, presetKind, id, ref: `designer:preset:${presetKind}:${id}` };
    }

    case "icon": {
      if (rest.length !== 2) return null;
      const [set, id] = rest;
      return { kind, set, id, ref: `designer:icon:${set}:${id}` };
    }

    default:
      return null;
  }
}

export async function readPicks(filePath = picksFilePath()) {
  if (!existsSync(filePath)) {
    return { version: 1, updatedAt: null, picks: [] };
  }
  try {
    const raw = JSON.parse(await readFile(filePath, "utf8"));
    const picks = Array.isArray(raw?.picks)
      ? raw.picks.filter((p) => p && typeof p.ref === "string" && parseDesignerRef(p.ref))
      : [];
    return {
      version: 1,
      updatedAt: raw?.updatedAt || null,
      picks: picks.slice(0, MAX_PICKS),
    };
  } catch {
    return { version: 1, updatedAt: null, picks: [] };
  }
}

async function writePicks(store, filePath = picksFilePath()) {
  await mkdir(dirname(filePath), { recursive: true });
  const payload = JSON.stringify(
    {
      version: 1,
      updatedAt: new Date().toISOString(),
      picks: store.picks.slice(0, MAX_PICKS),
    },
    null,
    2,
  );
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, payload, "utf8");
  await rename(tmp, filePath);
  return JSON.parse(payload);
}

export async function addPick({ ref, label, note, meta } = {}, filePath = picksFilePath()) {
  const parsed = parseDesignerRef(ref);
  if (!parsed) {
    throw new Error(`Invalid designer reference "${String(ref ?? "")}". Expected designer:<kind>:<id>.`);
  }
  const cleanLabel = String(label || parsed.id).trim().slice(0, MAX_LABEL_LEN);
  const cleanNote = note !== undefined && note !== null ? String(note).trim().slice(0, MAX_NOTE_LEN) : undefined;
  const store = await readPicks(filePath);
  const now = new Date().toISOString();
  const idx = store.picks.findIndex((p) => p.ref === parsed.ref);
  const existing = idx >= 0 ? store.picks[idx] : null;
  const entry = {
    ref: parsed.ref,
    kind: parsed.kind,
    label: cleanLabel || existing?.label || parsed.id,
    ...(cleanNote !== undefined ? (cleanNote ? { note: cleanNote } : {}) : existing?.note ? { note: existing.note } : {}),
    ...(meta && typeof meta === "object" ? { meta } : existing?.meta ? { meta: existing.meta } : {}),
    pickedAt: now,
  };
  const next = store.picks.filter((p) => p.ref !== parsed.ref);
  next.unshift(entry);
  const saved = await writePicks({ picks: next.slice(0, MAX_PICKS) }, filePath);
  return { pick: entry, ...saved };
}

export async function removePick(ref, filePath = picksFilePath()) {
  const parsed = parseDesignerRef(ref);
  const target = parsed ? parsed.ref : String(ref || "").trim();
  const store = await readPicks(filePath);
  const before = store.picks.length;
  const next = store.picks.filter((p) => p.ref !== target);
  const saved = await writePicks({ picks: next }, filePath);
  return { removed: before - next.length, ...saved };
}

export async function clearPicks(filePath = picksFilePath()) {
  return writePicks({ picks: [] }, filePath);
}
