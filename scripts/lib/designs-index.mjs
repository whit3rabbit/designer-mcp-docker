/**
 * designs-index.mjs — Unified Design Systems index & multi-facet classifier.
 *
 * Merges all four DESIGN.md-backed corpora into one de-duplicated catalog:
 *   1. Classic Refero designs (catalog.json)
 *   2. Refero Styles deep profiles (refero-styles/catalog.json) — 588 joined by
 *      domain onto Classic Refero entries + 200 standalone deep profiles
 *   3. OpenDesign systems (catalog.json source === "opendesign" + descriptors.json)
 *   4. Vendored System Templates (design-systems.json)
 *
 * Computes deterministic, 100% offline filter facets for every record:
 *   - Theme polarity (light / dark / mixed)
 *   - Accent hue families (red, orange, amber, green, teal, blue, indigo, purple, pink, neutral)
 *   - Canvas / ground tone (white, warm, cool-gray, charcoal, black, tinted)
 *   - Palette temperature & contrast character
 *   - Typography classification & pairing
 *   - Industry, moods, surfaces, and deliverable capabilities
 */

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHex(raw) {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!HEX_RE.test(s)) return null;
  if (s.length === 4) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`.toLowerCase();
  }
  return s.toLowerCase();
}

export function hexToRgb(hex) {
  const n = normalizeHex(hex);
  if (!n) return null;
  return [
    parseInt(n.slice(1, 3), 16),
    parseInt(n.slice(3, 5), 16),
    parseInt(n.slice(5, 7), 16),
  ];
}

export function relativeLuminance([r, g, b]) {
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function rgbToHsl([r, g, b]) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;
  if (d === 0) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
  else if (max === gn) h = ((bn - rn) / d + 2) * 60;
  else h = ((rn - gn) / d + 4) * 60;
  return [h, s, l];
}

export const HUE_FAMILIES = [
  { id: "red", label: "Red", swatch: "#ef4444" },
  { id: "orange", label: "Orange", swatch: "#f97316" },
  { id: "amber", label: "Amber", swatch: "#eab308" },
  { id: "green", label: "Green", swatch: "#22c55e" },
  { id: "teal", label: "Teal", swatch: "#14b8a6" },
  { id: "blue", label: "Blue", swatch: "#3b82f6" },
  { id: "indigo", label: "Indigo", swatch: "#6366f1" },
  { id: "purple", label: "Purple", swatch: "#a855f7" },
  { id: "pink", label: "Pink", swatch: "#ec4899" },
  { id: "neutral", label: "Monochrome", swatch: "#94a3b8" },
];

export function classifyHue(rgb) {
  const [h, s, l] = rgbToHsl(rgb);
  // Filter out near-whites, near-blacks, and desaturated grays
  if (s < 0.16 || l < 0.09 || l > 0.94) return null;
  if (h < 14 || h >= 342) return "red";
  if (h < 38) return "orange";
  if (h < 68) return "amber";
  if (h < 155) return "green";
  if (h < 196) return "teal";
  if (h < 236) return "blue";
  if (h < 268) return "indigo";
  if (h < 306) return "purple";
  return "pink";
}

export function classifyGroundTone(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "cool-gray";
  const [h, s, l] = rgbToHsl(rgb);
  if (l >= 0.97 && s <= 0.12) return "white";
  if (l <= 0.06 && s <= 0.2) return "black";
  if (l <= 0.22) {
    return s >= 0.28 ? "tinted" : "charcoal";
  }
  if (l >= 0.82) {
    if (s >= 0.18) {
      if (h >= 18 && h <= 65) return "warm";
      return "tinted";
    }
    if (s >= 0.05 && h >= 18 && h <= 65) return "warm";
    return "cool-gray";
  }
  return s >= 0.22 ? "tinted" : "cool-gray";
}

function detectGroundHex(rawColors, explicitGround) {
  const g = normalizeHex(explicitGround);
  if (g) return g;
  // Prefer colors whose name/role indicates background/canvas/ground
  for (const c of rawColors || []) {
    const hex = normalizeHex(typeof c === "string" ? c : c?.hex || c?.value);
    if (!hex) continue;
    const label = `${c?.name || ""} ${c?.role || ""}`.toLowerCase();
    if (/\b(bg|background|canvas|ground|page|surface-0|base)\b/.test(label)) return hex;
  }
  for (const c of rawColors || []) {
    const hex = normalizeHex(typeof c === "string" ? c : c?.hex || c?.value);
    if (hex) return hex;
  }
  return null;
}

export function classifyPaletteMeta(rawColors, explicitScheme, explicitGround) {
  const hexes = [];
  const seen = new Set();
  for (const c of rawColors || []) {
    const hex = normalizeHex(typeof c === "string" ? c : c?.hex || c?.value);
    if (hex && !seen.has(hex)) {
      seen.add(hex);
      hexes.push(hex);
    }
  }
  const groundHex = detectGroundHex(rawColors, explicitGround) || hexes[0] || "#808080";
  const groundRgb = hexToRgb(groundHex) || [128, 128, 128];
  const lum = relativeLuminance(groundRgb);
  const groundTone = classifyGroundTone(groundHex);

  let theme = explicitScheme && ["light", "dark", "mixed"].includes(explicitScheme)
    ? explicitScheme
    : lum < 0.22 ? "dark" : "light";

  // Check if palette mixes dark and light major surfaces when scheme not explicit
  if (!explicitScheme && hexes.length >= 3) {
    const lums = hexes.slice(0, 5).map((h) => relativeLuminance(hexToRgb(h)));
    const hasVeryDark = lums.some((v) => v < 0.08);
    const hasVeryLight = lums.some((v) => v > 0.82);
    // Keep primary polarity from ground, only mark mixed if ground itself is mid-tone
    if (lum >= 0.22 && lum <= 0.55 && hasVeryDark && hasVeryLight) theme = "mixed";
  }

  const hueSet = new Set();
  let warmCount = 0;
  let coolCount = 0;
  let maxSat = 0;
  let minLum = 1;
  let maxLum = 0;

  for (const hex of hexes) {
    const rgb = hexToRgb(hex);
    if (!rgb) continue;
    const [h, s, l] = rgbToHsl(rgb);
    const rl = relativeLuminance(rgb);
    if (rl < minLum) minLum = rl;
    if (rl > maxLum) maxLum = rl;
    if (s > maxSat && l > 0.12 && l < 0.92) maxSat = s;
    const fam = classifyHue(rgb);
    if (fam) {
      hueSet.add(fam);
      if (fam === "red" || fam === "orange" || fam === "amber" || fam === "pink") warmCount++;
      else coolCount++;
    }
  }

  const hues = hueSet.size ? [...hueSet] : ["neutral"];
  const temp =
    warmCount === 0 && coolCount === 0
      ? "neutral"
      : warmCount > coolCount
        ? "warm"
        : coolCount > warmCount
          ? "cool"
          : "neutral";

  const contrastRatio = (maxLum + 0.05) / (minLum + 0.05);
  const contrast =
    maxSat >= 0.65 && hueSet.size >= 1
      ? "vibrant"
      : contrastRatio >= 10
        ? "high"
        : "soft";

  return {
    theme,
    colors: hexes.slice(0, 6),
    ground: groundHex,
    groundTone,
    lum: Math.round(lum * 100),
    hues,
    temp,
    contrast,
  };
}

const SERIF_RE = /\b(serif|garamond|georgia|times|playfair|merriweather|lora|newsreader|instrument serif|fraunces|eb garamond|libre baskerville|baskerville|crimson|bodoni|didot|caslon|cormorant|editorial|recife|canela|tiempos|plantin|freight|charter|cambria|palatino|pt serif|source serif|ibm plex serif|dm serif|young serif|spectral|bitter|domine|abril)\b/i;
const MONO_RE = /\b(mono|code|consolas|menlo|courier|fira code|jetbrains|ibm plex mono|space mono|roboto mono|source code|geist mono|sf mono|inconsolata|berkeley|martian mono|dm mono|ubuntu mono|hack|iosevka|cascadia)\b/i;
const DISPLAY_RE = /\b(display|condensed|extended|wide|grotesque|clash|cabinet|syne|unbounded|bebas|oswald|caprasimo|archivo black|anton|monument|druk|pp mori|migra|switzer|satoshi|general sans|bricolage|space grotesk)\b/i;

export function classifyFonts(fonts = []) {
  const clean = [];
  const seen = new Set();
  for (const f of fonts || []) {
    const name = typeof f === "string" ? f.trim() : String(f?.family || "").trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    clean.push(name);
  }
  const styles = new Set();
  for (const f of clean) {
    if (MONO_RE.test(f)) styles.add("mono");
    else if (SERIF_RE.test(f)) styles.add("serif");
    else {
      styles.add("sans");
      if (DISPLAY_RE.test(f)) styles.add("display");
    }
  }
  if (!styles.size && clean.length) styles.add("sans");
  const list = [...styles];
  let pairing = "all-sans";
  if (styles.has("serif") && styles.has("sans")) pairing = "serif+sans";
  else if (styles.has("mono") && styles.has("sans")) pairing = "sans+mono";
  else if (styles.has("serif") && styles.has("mono")) pairing = "serif+mono";
  else if (styles.has("serif") && !styles.has("sans")) pairing = "all-serif";
  else if (styles.has("mono") && !styles.has("sans")) pairing = "all-mono";
  return { fonts: clean.slice(0, 4), fontStyles: list, fontPairing: pairing };
}

const MOOD_RULES = [
  ["minimal", /\b(minimal|quiet|restraint|sparse|clean|crisp|understated|austere|whitespace|zen|swiss)\b/i],
  ["editorial", /\b(editorial|magazine|broadsheet|newspaper|journal|book|typographic|print|literary|publication)\b/i],
  ["technical", /\b(technical|control room|telemetry|terminal|developer|engineering|precision|instrument|grid|monospaced|code|system|dashboard)\b/i],
  ["bold", /\b(bold|high-impact|brutal|punchy|stark|dramatic|loud|expressive|vivid|neon|electric)\b/i],
  ["warm", /\b(warm|paper|cream|organic|earthy|terracotta|sand|parchment|human|tactile|craft)\b/i],
  ["playful", /\b(playful|whimsical|fun|friendly|cheerful|bubbly|toy|vibrant|colorful|candy)\b/i],
  ["premium", /\b(premium|luxury|refined|elevated|sophisticated|bespoke|high-end|gallery|studio|boutique)\b/i],
  ["calm", /\b(calm|serene|gentle|soft|airy|peaceful|tranquil|muted|pastel)\b/i],
  ["futuristic", /\b(futuristic|sci-fi|cyber|spatial|glow|holographic|ai-first|agentic|glass)\b/i],
  ["corporate", /\b(corporate|enterprise|institutional|banking|trustworthy|formal|b2b)\b/i],
  ["retro", /\b(retro|vintage|classic|heritage|nostalgic|analog|mid-century|90s|80s)\b/i],
];

export function inferMoods(text, existing = []) {
  const out = new Set((existing || []).map((m) => String(m).toLowerCase()));
  const hay = String(text || "");
  if (hay) {
    for (const [mood, re] of MOOD_RULES) {
      if (re.test(hay)) out.add(mood);
    }
  }
  return [...out].slice(0, 5);
}

function hostOf(rawUrl) {
  if (!rawUrl) return "";
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return String(rawUrl).replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase();
  }
}

function countFacet(items, getter) {
  const map = new Map();
  for (const item of items) {
    const val = getter(item);
    if (!val) continue;
    for (const v of Array.isArray(val) ? val : [val]) {
      if (!v) continue;
      map.set(v, (map.get(v) || 0) + 1);
    }
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .map(([value, count]) => ({ value, count }));
}

/**
 * Build the unified design systems catalog + precomputed facets.
 */
export function buildUnifiedDesignsIndex({
  catalog = [],
  descriptors = {},
  referoStyles = [],
  templates = [],
  galleryIds = new Set(),
  claudeIds = new Set(),
  thumbFor = (id) => `/thumb/${encodeURIComponent(id)}`,
  rsAssetFor = (file) => `/refero-styles/asset/${encodeURIComponent(file)}`,
  templateThumbFor = (slug) => `/template/${encodeURIComponent(slug)}/thumb`,
} = {}) {
  const descMap = descriptors?.systems || descriptors || {};
  const rsByDomain = new Map();
  for (const r of referoStyles || []) {
    const dom = hostOf(r.domain);
    if (dom && !rsByDomain.has(dom)) rsByDomain.set(dom, r);
  }

  const matchedRsUuids = new Set();
  const items = [];

  // 1. Main catalog (Classic Refero + OpenDesign), enriched with matching Refero Styles
  for (const entry of catalog || []) {
    const rawSrc = entry.source || "refero";
    const dom = hostOf(entry.url);
    const rsMatch = rawSrc === "refero" && dom ? rsByDomain.get(dom) : null;
    if (rsMatch) matchedRsUuids.add(rsMatch.uuid);

    const desc = descMap[entry.id] || null;
    const rawColors = [
      ...(entry.colors || []),
      ...((rsMatch?.palette || []).map((c) => ({ hex: c.value, name: c.name }))),
    ];
    const palette = classifyPaletteMeta(rawColors, entry.colorScheme, null);
    const fontMeta = classifyFonts([
      ...(entry.fonts || []),
      ...((rsMatch?.fonts || []).flatMap((f) => [f.family, f.substitute].filter(Boolean))),
    ]);
    const textForMood = `${entry.northStar || ""} ${rsMatch?.description || ""}`;
    const moods = inferMoods(textForMood, desc?.moods || []);
    const industry = String(entry.industry || desc?.industries?.[0] || "").toLowerCase();
    const surfaces = desc?.surfaces?.length ? [...desc.surfaces] : ["web"];

    const caps = [];
    if (rawSrc === "opendesign" && galleryIds.has(entry.id)) caps.push("live-preview");
    if (rawSrc === "opendesign") caps.push("tokens-css");
    if (claudeIds.has(entry.id)) caps.push("claude-design");
    if (rsMatch) {
      if ((rsMatch.counts?.components || 0) > 0) caps.push("deep-recipes");
      caps.push("dos-donts");
    }

    const sources = [rawSrc];
    if (rsMatch) sources.push("refero-styles");
    const primarySource = rsMatch ? "refero-styles" : rawSrc;

    const richness =
      (palette.colors.length * 2) +
      (rsMatch ? 40 + (rsMatch.counts?.components || 0) * 2 + (rsMatch.counts?.surfaces || 0) : 0) +
      (rawSrc === "opendesign" ? 30 : 0) +
      (galleryIds.has(entry.id) ? 20 : 0) +
      (claudeIds.has(entry.id) ? 15 : 0);

    items.push({
      id: entry.id,
      name: entry.siteName || entry.id,
      href: `/design/${encodeURIComponent(entry.id)}`,
      deepHref: rsMatch ? `/refero-styles/style/${encodeURIComponent(rsMatch.uuid)}` : null,
      source: primarySource,
      sources,
      thumb: thumbFor(entry.id),
      theme: palette.theme,
      colors: palette.colors,
      ground: palette.ground,
      groundTone: palette.groundTone,
      lum: palette.lum,
      hues: palette.hues,
      temp: palette.temp,
      contrast: palette.contrast,
      industry,
      moods,
      surfaces,
      fonts: fontMeta.fonts,
      fontStyles: fontMeta.fontStyles,
      fontPairing: fontMeta.fontPairing,
      caps,
      richness,
      desc: String(entry.northStar || rsMatch?.description || "").slice(0, 160),
      domain: dom,
      recipeCount: rsMatch?.counts?.components || 0,
    });
  }

  // 2. Standalone Refero Styles (the ~200 sites not in Classic Refero)
  for (const r of referoStyles || []) {
    if (matchedRsUuids.has(r.uuid)) continue;
    const rawColors = (r.palette || []).map((c) => ({ hex: c.value, name: c.name }));
    const palette = classifyPaletteMeta(rawColors, null, null);
    const fontMeta = classifyFonts((r.fonts || []).flatMap((f) => [f.family, f.substitute].filter(Boolean)));
    const moods = inferMoods(r.description || "", []);
    const caps = ["dos-donts"];
    if ((r.counts?.components || 0) > 0) caps.push("deep-recipes");
    const previewFile = r.screenshots?.[0] || r.preview || null;

    items.push({
      id: `rs:${r.uuid}`,
      name: r.name || r.domain || r.uuid,
      href: `/refero-styles/style/${encodeURIComponent(r.uuid)}`,
      deepHref: null,
      source: "refero-styles",
      sources: ["refero-styles"],
      thumb: previewFile ? rsAssetFor(previewFile) : "",
      theme: palette.theme,
      colors: palette.colors,
      ground: palette.ground,
      groundTone: palette.groundTone,
      lum: palette.lum,
      hues: palette.hues,
      temp: palette.temp,
      contrast: palette.contrast,
      industry: "",
      moods,
      surfaces: ["web"],
      fonts: fontMeta.fonts,
      fontStyles: fontMeta.fontStyles,
      fontPairing: fontMeta.fontPairing,
      caps,
      richness: 38 + (r.counts?.components || 0) * 2 + (r.counts?.surfaces || 0) + palette.colors.length,
      desc: String(r.description || "").slice(0, 160),
      domain: hostOf(r.domain),
      recipeCount: r.counts?.components || 0,
    });
  }

  // 3. Vendored System Templates (Modernist, Classical, Nocturne, Organic, Broadsheet, Industry, Loam)
  for (const t of templates || []) {
    const rawColors = [
      t.ground ? { hex: t.ground, name: "ground" } : null,
      t.text ? { hex: t.text, name: "text" } : null,
      t.accent ? { hex: t.accent, name: "accent" } : null,
    ].filter(Boolean);
    const palette = classifyPaletteMeta(rawColors, null, t.ground);
    const fontMeta = classifyFonts([t.headingFont, t.bodyFont].filter(Boolean));
    const moods = inferMoods(`${t.name} ${t.description || ""}`, []);
    const surfaces = ["web"];
    for (const st of t.starterTemplates || []) {
      const n = String(st.name || "").toLowerCase();
      if (n.includes("deck") || n.includes("slide")) surfaces.push("slides");
      if (n.includes("doc") || n.includes("report")) surfaces.push("document");
      if (n.includes("dash")) surfaces.push("dashboard");
    }

    items.push({
      id: `template:${t.slug}`,
      name: t.name || t.slug,
      href: `/template/${encodeURIComponent(t.slug)}`,
      deepHref: null,
      source: "template",
      sources: ["template"],
      thumb: templateThumbFor(t.slug),
      theme: palette.theme,
      colors: palette.colors,
      ground: palette.ground,
      groundTone: palette.groundTone,
      lum: palette.lum,
      hues: palette.hues,
      temp: palette.temp,
      contrast: palette.contrast,
      industry: "template",
      moods,
      surfaces: [...new Set(surfaces)],
      fonts: fontMeta.fonts,
      fontStyles: fontMeta.fontStyles,
      fontPairing: fontMeta.fontPairing,
      caps: ["live-preview", "starter-kit", "tokens-css"],
      richness: 95 + (t.tokensCount || 48),
      desc: String(t.description || "").slice(0, 160),
      domain: "",
      recipeCount: t.tokensCount || 48,
    });
  }

  // Default order: most complete first, then alphabetical
  items.sort((a, b) => b.richness - a.richness || a.name.localeCompare(b.name));

  const facets = {
    total: items.length,
    sources: countFacet(items, (d) => d.sources),
    themes: countFacet(items, (d) => d.theme),
    hues: countFacet(items, (d) => d.hues),
    groundTones: countFacet(items, (d) => d.groundTone),
    temperatures: countFacet(items, (d) => d.temp),
    contrasts: countFacet(items, (d) => d.contrast),
    industries: countFacet(items, (d) => d.industry).slice(0, 36),
    moods: countFacet(items, (d) => d.moods),
    fontStyles: countFacet(items, (d) => d.fontStyles),
    fontPairings: countFacet(items, (d) => d.fontPairing),
    surfaces: countFacet(items, (d) => d.surfaces),
    capabilities: countFacet(items, (d) => d.caps),
    topFonts: countFacet(items, (d) => d.fonts).slice(0, 40),
  };

  return { total: items.length, facets, designs: items };
}
