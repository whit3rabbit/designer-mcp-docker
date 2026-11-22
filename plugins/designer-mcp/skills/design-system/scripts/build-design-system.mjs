#!/usr/bin/env node
import { readFile, mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const PREFIX = { colors: "color", typography: "font", spacing: "space", rounded: "radius", components: "component" };
const KINDS = { colors: "color", typography: "font", spacing: "spacing", rounded: "radius", components: "component" };
const PATH = /^[a-zA-Z0-9][a-zA-Z0-9_-]*(?:\.[a-zA-Z0-9][a-zA-Z0-9_-]*)+$/;
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function tokenName(path) {
  const [group, ...parts] = path.split(".");
  const name = parts.map((part) => part.replace(/[a-z0-9][A-Z]/g, (pair) => `${pair[0]}-${pair[1]}`).toLowerCase());
  if (group === "typography" && name.at(-1) === "font-family") name.pop();
  return `--${[PREFIX[group], ...name].join("-")}`;
}

function compileTokens(rows) {
  if (!Array.isArray(rows)) throw new Error("theme.json needs a tokens array of parsed DESIGN.md token rows.");
  const paths = new Map();
  const names = new Set();
  for (const row of rows) {
    if (!row || typeof row.path !== "string" || !PATH.test(row.path)) throw new Error("Invalid token path in theme.json.");
    const group = row.path.split(".")[0];
    if (!Object.hasOwn(PREFIX, group)) throw new Error(`Unsupported token group: ${group}`);
    // The Markdown parser emits composite component aliases and their usable scalar children.
    if (row.value && !Array.isArray(row.value) && typeof row.value === "object" && row.reference && group === "components") continue;
    if (typeof row.value !== "string" && !Number.isFinite(row.value)) throw new Error(`Expected a scalar for ${row.path}.`);
    const value = String(row.value).trim();
    if (!value || /[{};\r\n]|\/\*|\burl\s*\(/i.test(value)) throw new Error(`Invalid CSS token value for ${row.path}.`);
    const name = tokenName(row.path);
    if (names.has(name)) throw new Error(`Multiple token paths map to ${name}.`);
    names.add(name);
    paths.set(row.path, { name, value, reference: row.reference, kind: KINDS[group] });
  }
  const checked = new Set();
  const active = new Set();
  function checkReference(path) {
    if (checked.has(path)) return;
    if (active.has(path)) throw new Error(`Circular CSS alias at ${path}.`);
    active.add(path);
    const { reference } = paths.get(path);
    if (reference !== undefined) {
      if (!paths.has(reference)) throw new Error(`Missing CSS alias target ${reference} for ${path}.`);
      checkReference(reference);
    }
    active.delete(path);
    checked.add(path);
  }
  return [...paths].map(([path, { name, value, reference, kind }]) => {
    checkReference(path);
    if (reference !== undefined) {
      value = `var(${paths.get(reference).name})`;
    }
    return { name, value, kind, definedIn: "styles.css", path };
  });
}

function tokenPreview(name, tokens) {
  const rows = tokens.map((token) => {
    const sample = token.kind === "color" ? `<span class="swatch" style="background:var(${token.name})"></span>` : "";
    return `    <tr><th scope="row">${esc(token.path)}</th><td>${sample}<code>${esc(token.name)}</code></td><td>${esc(token.value)}</td></tr>`;
  });
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(name)} tokens</title><link rel="stylesheet" href="../styles.css">
<style>
  main { max-width: 64rem; margin: auto; padding: 1rem; overflow-wrap: anywhere; }
  table { width: 100%; text-align: left; border-collapse: collapse; }
  th, td { padding: .5rem; border-bottom: 1px solid; }
  .swatch { display: inline-block; width: 1em; height: 1em; margin-right: .5em; border: 1px solid; vertical-align: middle; }
</style></head>
<body><main><h1>${esc(name)} tokens</h1>
<table><thead><tr><th scope="col">Role</th><th scope="col">CSS variable</th><th scope="col">Value</th></tr></thead><tbody>
${rows.join("\n")}
</tbody></table></main></body></html>\n`;
}

async function readOptional(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return null;
  }
}

async function entries(root, rows, field, pathKey, pathPattern) {
  if (!Array.isArray(rows)) throw new Error(`${field} must be an array.`);
  for (const row of rows) {
    if (typeof row?.name !== "string" || !row.name.trim() || typeof row[pathKey] !== "string" || !pathPattern.test(row[pathKey])) {
      throw new Error(`Each ${field} entry needs a name and a package-relative ${pathKey}.`);
    }
    const entry = await stat(join(root, row[pathKey]));
    if (!entry.isFile()) throw new Error(`Expected a file for ${row[pathKey]}.`);
  }
  return rows;
}

async function build(root, check) {
  const theme = JSON.parse(await readFile(join(root, "theme.json"), "utf8"));
  if (theme?.version !== 1 || typeof theme.name !== "string" || !theme.name.trim()) {
    throw new Error("theme.json needs version 1 and a name.");
  }
  const tokens = compileTokens(theme.tokens);
  const cards = await entries(root, theme.cards ?? [], "cards", "path", /^(?:foundations|components)\/[\w-]+\.html$/);
  const templates = await entries(root, theme.templates ?? [], "templates", "entryPath", /^templates\/(?:[\w-]+\/)*[\w.-]+\.[\w-]+$/);
  const recipes = (await readOptional(join(root, "recipes.css")))?.trim();
  const css = tokens.map(({ name, value }) => `  ${name}: ${value};`).join("\n");
  const stylesheet = `/* Generated from theme.json and recipes.css. */\n:root {\n${css}\n}\n${recipes ? `\n${recipes}\n` : ""}`;
  const manifest = {
    namespace: theme.name.trim().replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "") || "design_system",
    globalCssPaths: ["styles.css"],
    cards: [{ path: "foundations/tokens.html", group: "Foundations", name: "Tokens" }, ...cards],
    templates: templates.map((template) => ({ ...template, folder: dirname(template.entryPath) })),
    tokens,
  };
  const files = {
    "styles.css": stylesheet,
    "foundations/tokens.html": tokenPreview(theme.name, tokens),
    "_ds_manifest.json": JSON.stringify(manifest, null, 2) + "\n",
    "scripts/build-design-system.mjs": await readFile(new URL(import.meta.url), "utf8"),
  };
  if (check) {
    const stale = [];
    for (const [relative, content] of Object.entries(files)) {
      if (await readOptional(join(root, relative)) !== content) stale.push(relative);
    }
    if (stale.length) throw new Error(`Regenerate stale files: ${stale.join(", ")}`);
    return;
  }
  for (const [relative, content] of Object.entries(files)) {
    const path = join(root, relative);
    if (await readOptional(path) === content) continue;
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content);
  }
}

const [directory, flag, ...rest] = process.argv.slice(2);
if (!directory || rest.length || (flag !== undefined && flag !== "--check")) {
  console.error("Usage: node build-design-system.mjs <package-directory> [--check]");
  process.exitCode = 1;
} else {
  try {
    await build(resolve(directory), flag === "--check");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
