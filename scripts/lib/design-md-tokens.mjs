import { converter, parse as parseColor } from "culori";
import { parse as parseCss } from "postcss";
import { parseDocument, stringify } from "yaml";

const GROUPS = ["colors", "typography", "spacing", "rounded", "components"];
const EXTENDED_GROUPS = [
  ...GROUPS, "radius", "shadows", "motion", "breakpoints", "layout",
  "accessibility", "aliases", "themes",
];
const REF = /^\{([^{}]+)\}$/;
const FONT_VAR = /^font-(?:body$|display$|heading$|mono$|primary$|family-)/;
const rgb = converter("rgb");

export const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

export function readYaml(text, line, diagnostics) {
  try {
    const doc = parseDocument(text, { strict: true, uniqueKeys: true });
    if (doc.errors.length) {
      for (const error of doc.errors) {
        const errorLine = error.linePos?.[0]?.line ?? 1;
        diagnostics.push({ severity: "error", code: "invalid-yaml", line: line + errorLine - 1, message: error.message });
      }
      return null;
    }
    const value = doc.toJS({ maxAliasCount: 0 });
    if (isRecord(value)) return value;
    throw new Error("Expected a YAML mapping.");
  } catch (error) {
    diagnostics.push({ severity: "error", code: "invalid-yaml", line, message: error.message });
    return null;
  }
}

export function readCssTokens(css) {
  const declarations = new Map();
  for (const rule of parseCss(css).nodes) {
    if (rule.type !== "rule" || !rule.selectors.includes(":root")) continue;
    for (const node of rule.nodes) {
      if (node.type !== "decl" || !node.prop.startsWith("--")) continue;
      const previous = declarations.get(node.prop);
      if (previous?.important && !node.important) continue;
      declarations.set(node.prop, node);
    }
  }
  const resolved = new Map();
  function resolve(name) {
    const seen = new Set();
    let key = name;
    let value;
    while (declarations.has(key) && !seen.has(key)) {
      if (resolved.has(key)) {
        value = resolved.get(key);
        break;
      }
      seen.add(key);
      const raw = declarations.get(key).value;
      const alias = raw.match(/^var\(\s*(--[\w-]+)\s*\)$/)?.[1];
      if (!alias) {
        value = raw;
        break;
      }
      key = alias;
    }
    for (const visited of seen) resolved.set(visited, value);
    return value;
  }
  return [...declarations.keys()].map((name) => {
    const value = resolve(name) ?? declarations.get(name).value;
    return { name, value, origin: "css" };
  });
}

export function isColorValue(value) {
  if (typeof value !== "string") return false;
  return Boolean(parseColor(value) || /^(?:color-mix|light-dark)\(/i.test(value));
}

export function structuredFormat(frontmatter, blocks) {
  if (/^webdesignhot\//i.test(String(frontmatter?.spec ?? ""))) return "webdesignhot";
  if (frontmatter?.version === "alpha") return "stitch";
  if ([frontmatter, ...blocks.map((block) => block.value)].some(
    (data) => GROUPS.some((key) => isRecord(data?.[key])),
  )) return "stitch";
  return null;
}

function tokenKind(parts) {
  const [group] = parts;
  const property = parts.at(-1);
  if (group === "colors" || (group === "components" && /color$/i.test(property ?? ""))) return "color";
  if (property === "fontFamily" || property === "family") return "font";
  if (property === "fontSize" || (group === "typography" && property === "size")) return "fontSize";
  if (group === "rounded" || group === "radius") return "radius";
  if (group === "spacing") return "spacing";
  if (group === "shadows") return "shadow";
  return group;
}

export function structuredTokens(format, frontmatter, blocks, diagnostics) {
  const groups = format === "webdesignhot" ? EXTENDED_GROUPS : GROUPS;
  const tree = new Map();
  const sources = new Map();
  for (const { value, source, line } of [{ value: frontmatter, source: "frontmatter", line: 2 }, ...blocks]) {
    for (const [key, tokenGroup] of Object.entries(value ?? {})) {
      if (!groups.includes(key)) continue;
      if (tree.has(key)) {
        diagnostics.push({ severity: "error", code: "duplicate-token-group", path: key, line });
        continue;
      }
      if (!isRecord(tokenGroup)) {
        diagnostics.push({ severity: "error", code: "invalid-token-group", path: key, line });
        continue;
      }
      tree.set(key, tokenGroup);
      sources.set(key, source);
    }
  }

  const definitions = new Map();
  const leaves = [];
  function visit(value, parts) {
    const path = parts.join(".");
    if (definitions.has(path)) {
      diagnostics.push({ severity: "error", code: "ambiguous-token-path", path });
      return;
    }
    definitions.set(path, { value, parts });
    if (isRecord(value)) {
      for (const [name, child] of Object.entries(value)) visit(child, [...parts, name]);
    } else if (parts.length > 1) {
      leaves.push(path);
    }
  }
  for (const [group, value] of tree) visit(value, [group]);

  const resolved = new Map();
  const resolving = new Set();
  function resolve(path) {
    if (resolved.has(path)) return resolved.get(path);
    const definition = definitions.get(path);
    if (!definition) return undefined;
    if (resolving.has(path)) {
      diagnostics.push({ severity: "error", code: "cyclic-token-reference", path });
      return undefined;
    }
    resolving.add(path);
    const raw = definition.value;
    const reference = typeof raw === "string" ? raw.match(REF)?.[1] : null;
    let value = raw;
    if (reference) {
      if (!definitions.has(reference)) {
        diagnostics.push({ severity: "error", code: "unknown-token-reference", path, reference });
      } else if (isRecord(definitions.get(reference).value) && definition.parts[0] !== "components") {
        diagnostics.push({ severity: "error", code: "invalid-composite-reference", path, reference });
        resolving.delete(path);
        resolved.set(path, undefined);
        return undefined;
      }
      value = resolve(reference);
    } else if (isRecord(raw)) {
      value = Object.fromEntries(Object.keys(raw).map((key) => [key, resolve(`${path}.${key}`)]));
      if (Object.values(value).includes(undefined)) value = undefined;
    } else if (raw === null) {
      diagnostics.push({ severity: "error", code: "empty-token", path });
      value = undefined;
    }
    resolving.delete(path);
    resolved.set(path, value);
    return value;
  }

  const tokens = [];
  for (const path of leaves) {
    const { value: raw, parts } = definitions.get(path);
    const value = resolve(path);
    if (value === undefined) continue;
    const kind = tokenKind(parts);
    if (kind === "color" && !isColorValue(value)) {
      diagnostics.push({ severity: "error", code: "invalid-color", path });
      continue;
    }
    const reference = typeof raw === "string" ? raw.match(REF)?.[1] : null;
    const source = sources.get(parts[0]);
    tokens.push({ path, kind, value, source, ...(reference ? { reference } : {}) });
    if (reference && isRecord(value)) {
      for (const [key, child] of Object.entries(value)) {
        tokens.push({ path: `${path}.${key}`, kind: tokenKind([...parts, key]), value: child, source, reference: `${reference}.${key}` });
      }
    }
  }
  return { tokenTree: Object.fromEntries(tree), tokens };
}

export function nameKey(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function sidecarToken(row) {
  if (typeof row?.name !== "string" || !row.name.trim() || typeof row.value !== "string" && typeof row.value !== "number") return null;
  const { name, value, type, kind = type, origin } = row;
  const key = name.replace(/^--/, "");
  let path;
  let normalizedKind = kind;
  if (kind === "color" || kind === undefined && isColorValue(value)) {
    if (!isColorValue(value)) return null;
    path = `colors.${key.replace(/^color-/, "")}`;
    normalizedKind = "color";
  } else if (kind === "fontFamily" || kind === "font" || kind === undefined && FONT_VAR.test(key)) {
    path = `typography.${key.replace(/^font-(?:family-)?/, "")}.fontFamily`;
    normalizedKind = "font";
  } else if (kind === "spacing" || /^(?:space|spacing)-/.test(key)) {
    path = `spacing.${key.replace(/^(?:space|spacing)-/, "")}`;
    normalizedKind = "spacing";
  } else if (kind === "radius" || /^(?:radius|rounded)-/.test(key)) {
    path = `rounded.${key.replace(/^(?:radius|rounded)-/, "")}`;
    normalizedKind = "radius";
  } else if (kind === "shadow" || /^(?:shadow|elev)-/.test(key)) {
    path = `shadows.${key.replace(/^(?:shadow|elev)-/, "")}`;
    normalizedKind = "shadow";
  } else if ((kind === "dimension" || kind === undefined) && key.startsWith("text-") && numberWithUnit.test(String(value))) {
    path = `typography.${key.slice(5)}.fontSize`;
    normalizedKind = "fontSize";
  } else {
    path = `sidecar.${key}`;
  }
  return { path, kind: normalizedKind ?? "other", name, value, source: "sidecar", ...(origin === "css" ? { origin } : {}) };
}

export function combineTokens(parsed, sidecar = []) {
  const byPath = new Map();
  for (const token of parsed.tokens) {
    if (!byPath.has(token.path)) byPath.set(token.path, token);
  }
  const diagnostics = [...parsed.diagnostics];
  for (const row of sidecar) {
    const token = sidecarToken(row);
    if (!token) {
      diagnostics.push({ severity: "warning", code: "invalid-sidecar-token" });
      continue;
    }
    const existing = byPath.get(token.path);
    if (!existing) {
      byPath.set(token.path, token);
    } else if (compareValues(existing, token.value) !== true) {
      diagnostics.push({
        severity: "warning", code: "token-conflict", path: token.path,
        declared: existing.value, sidecar: token.value,
      });
    }
  }
  return { ...parsed, tokens: [...byPath.values()], diagnostics };
}

const numberWithUnit = /^(-?(?:\d+\.?\d*|\.\d+))([a-z%]*)$/i;
function compareValues(expected, observed, rootFontSize) {
  const value = expected.value;
  if (expected.kind === "color") {
    const a = typeof value === "string" ? rgb(value) : null;
    const b = typeof observed === "string" ? rgb(observed) : null;
    if (a && b) {
      const tolerance = 0.5 / 255;
      return ["r", "g", "b"].every((channel) => Math.abs(a[channel] - b[channel]) < tolerance)
        && Math.abs((a.alpha ?? 1) - (b.alpha ?? 1)) < tolerance;
    }
  }
  if (typeof value === "object" || typeof observed === "object") return null;
  const a = String(value).trim();
  const b = String(observed).trim();
  if (a === b) return true;
  if (expected.kind === "color") return null;
  if (/^(?:var|calc|clamp|min|max)\(/i.test(a) || /^(?:var|calc|clamp|min|max)\(/i.test(b)) return null;
  if (expected.kind === "shadow" && a !== "none" && b !== "none") return null;
  if (expected.kind === "font") {
    const families = (text) => (text.match(/(?:[^,"']|"[^"]*"|'[^']*')+/g) ?? [])
      .map((family) => family.trim().replace(/^(['"])(.*)\1$/, "$2").toLowerCase());
    return JSON.stringify(families(a)) === JSON.stringify(families(b));
  }
  const left = a.match(numberWithUnit);
  const right = b.match(numberWithUnit);
  if (left && right) {
    if (left[2] === right[2] || Number(left[1]) === 0 && Number(right[1]) === 0) {
      return Number(left[1]) === Number(right[1]);
    }
    const toPixels = { px: 1, pt: 96 / 72, ...(rootFontSize ? { rem: rootFontSize } : {}) };
    const aFactor = toPixels[left[2]];
    const bFactor = toPixels[right[2]];
    if (typeof aFactor === "number" && typeof bFactor === "number") {
      return Math.abs(Number(left[1]) * aFactor - Number(right[1]) * bFactor) < 0.02;
    }
    return null;
  }
  return false;
}

export function validateDesignObservations(parsed, observations, requiredTokens) {
  const byPath = new Map(parsed.tokens.map((token) => [token.path, token]));
  const checks = observations.map(({ location, token, value, rootFontSize }) => {
    const expected = byPath.get(token);
    const equal = expected && value != null ? compareValues(expected, value, rootFontSize) : null;
    const reason = !expected ? "unknown-token" : value == null ? "missing-observation" : "values-not-comparable";
    return {
      location, token, observed: value ?? null, expected: expected?.value ?? null,
      status: equal === true ? "pass" : equal === false ? "fail" : "unverified",
      ...(equal === null ? { reason } : {}),
    };
  });
  const summary = { pass: 0, fail: 0, unverified: 0 };
  for (const check of checks) summary[check.status]++;
  const documentValid = !parsed.diagnostics.some(({ severity }) => severity === "error");
  const result = {
    format: parsed.format,
    diagnostics: parsed.diagnostics,
    documentValid,
    conforms: documentValid && checks.length > 0 && summary.pass === checks.length,
    summary,
    checks,
  };
  if (requiredTokens === undefined) return result;

  // A mismatch takes precedence over an unmeasurable sample or a match at a different location.
  const priority = { pass: 1, unverified: 2, fail: 3 };
  const byToken = new Map();
  for (const { token, status, reason } of checks) {
    const previous = byToken.get(token);
    if (!previous || priority[status] > priority[previous.status]) {
      byToken.set(token, { status, ...(reason ? { reason } : {}) });
    }
  }
  const coverage = { required: requiredTokens.length, pass: 0, fail: 0, unverified: 0, missing: 0 };
  coverage.checks = requiredTokens.map((token) => {
    const check = byToken.get(token) ?? (byPath.has(token)
      ? { status: "missing", reason: "no-observation" }
      : { status: "unverified", reason: "unknown-token" });
    coverage[check.status]++;
    return { token, ...check };
  });
  return { ...result, conforms: result.conforms && coverage.pass === coverage.required, coverage };
}

export function renderDesignMdDraft({ name, description, tokens, body }) {
  const frontmatter = { version: "alpha", name, ...(description ? { description } : {}), ...tokens };
  return `---\n${stringify(frontmatter, { lineWidth: 0 })}---\n${body ? `\n${body.trim()}\n` : ""}`;
}

export const STITCH_TOKEN_GROUPS = GROUPS;
