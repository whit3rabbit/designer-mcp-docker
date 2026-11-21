#!/usr/bin/env node
/* Verify a scaffolded/filled design-system template against the vendored
   anatomy contract: required files, token parity, readme headings, card and
   starter paths, runtime presence, TODO gates, and (optionally) the
   registration entry in data/design-systems/manifest.json. Plain Node. */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const argv = process.argv.slice(2);
const dir = resolve(argv.find((a) => !a.startsWith("--")) || "");
const strict = argv.includes("--strict");
const manifestPath = argv.includes("--manifest") ? resolve(argv[argv.indexOf("--manifest") + 1]) : undefined;
const forbidIndex = argv.indexOf("--forbid");
const forbid = forbidIndex > -1 ? argv[forbidIndex + 1] : undefined;

if (!dir || !existsSync(dir) || !statSync(dir).isDirectory()) {
  console.error("usage: node verify.mjs <system-folder> [--forbid <name>] [--manifest <path>] [--strict]");
  process.exit(1);
}

let failures = 0;
let warnings = 0;
const ok = (msg) => console.log(`  ok   ${msg}`);
const bad = (msg) => { console.log(`  FAIL ${msg}`); failures++; };
const warn = (msg) => { console.log(`  warn ${msg}`); warnings++; };

/* 1. required files */
const REQUIRED = [
  "theme.json", "styles.css", "readme.md", "_ds_manifest.json",
  "_adherence.oxlintrc.json", "_ds_bundle.js", "theme.html", "thumbnail.html",
  "thumbnail.webp", "assets/photo.jpg",
  "foundations/color.html", "foundations/type.html", "foundations/image.html",
  "foundations/layout.html", "foundations/icons.html",
  "components/buttons.html", "components/cards.html", "components/stats.html",
  "components/grids.html", "components/navigation.html", "components/table.html",
  "templates/deck/Deck.dc.html", "templates/deck/deck-stage.js",
  "templates/deck/support.js", "templates/deck/image-slot.js",
  "templates/deck/ds-base.js", "templates/landing/index.html",
];
const missing = REQUIRED.filter((f) => !existsSync(join(dir, f)));
missing.length ? missing.forEach((f) => bad(`missing file: ${f}`)) : ok(`${REQUIRED.length} required files present`);

/* 2. tokens: styles.css sheet, parity with the registry, count floor */
const styles = readFileSync(join(dir, "styles.css"), "utf8");
const rootBlock = styles.includes(":root") ? styles.split(":root")[1].split("}")[0] : "";
const cssTokens = new Map(
  [...rootBlock.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map((m) => [`--${m[1]}`, m[2].trim()]),
);
cssTokens.size >= 48
  ? ok(`${cssTokens.size} tokens in styles.css`)
  : bad(`styles.css has ${cssTokens.size} tokens, expected 48+`);

const registry = JSON.parse(readFileSync(join(dir, "_ds_manifest.json"), "utf8"));
const regTokens = new Map(registry.tokens.map((t) => [t.name, t.value]));
const mismatch = [...cssTokens].filter(([n, v]) => regTokens.get(n) !== v)
  .concat([...regTokens].filter(([n]) => !cssTokens.has(n)).map(([n]) => [n, "<absent>"]));
mismatch.length
  ? bad(`registry/styles.css token mismatch: ${mismatch.slice(0, 5).map(([n]) => n).join(", ")}${mismatch.length > 5 ? " ..." : ""}`)
  : ok(`registry carries all ${regTokens.size} tokens, values identical`);

/* 3. readme heading contract */
const readme = readFileSync(join(dir, "readme.md"), "utf8");
const headings = new Set([...readme.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim()));
const REQUIRED_HEADINGS = ["How to use this", "Direction", "Color", "Type", "Icons",
  "Interaction states", "Components", "Do", "Don't", "Files"];
const missingHeadings = REQUIRED_HEADINGS.filter((h) => !headings.has(h));
missingHeadings.length ? bad(`readme missing H2s: ${missingHeadings.join(", ")}`) : ok(`readme carries all ${REQUIRED_HEADINGS.length} parsed headings`);
/\| Class \| What it is \| Shown in \|/.test(readme)
  ? ok("readme Components table present")
  : bad("readme Components table (| Class | What it is | Shown in |) missing");

/* 4. cards and starter entry paths exist */
const cardMissing = registry.cards.filter((c) => !existsSync(join(dir, c.path)));
cardMissing.length ? bad(`card paths missing: ${cardMissing.map((c) => c.path).join(", ")}`) : ok(`all ${registry.cards.length} card paths exist`);
const starterMissing = registry.templates.filter((t) => !existsSync(join(dir, t.entryPath)));
starterMissing.length ? bad(`starter entry paths missing: ${starterMissing.map((t) => t.entryPath).join(", ")}`) : ok(`all ${registry.templates.length} starter entry paths exist`);
const deckStarter = registry.templates.find((t) => t.entryPath.includes("/deck/"));
(deckStarter && existsSync(join(dir, "templates/deck/deck-stage.js")))
  ? ok("deck runtime present beside the deck starter")
  : deckStarter ? bad("deck starter declared but deck runtime files missing (copy them verbatim from an existing system)") : ok("no deck starter declared");

/* 5. TODO and unfilled-marker gates */
const authoredExts = [".css", ".html", ".json", ".md"];
const authored = (function walk(d, base = "") {
  return readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith(".") || e.name.endsWith(".js") || e.name.endsWith(".webp") || e.name.endsWith(".jpg")) return [];
    const rel = base ? `${base}/${e.name}` : e.name;
    const full = join(d, e.name);
    return statSync(full).isDirectory() ? walk(full, rel) : [{ rel, full }];
  });
})(dir);
const todoFiles = [];
const forbidFiles = [];
for (const { rel, full } of authored) {
  if (!authoredExts.some((e) => rel.endsWith(e))) continue;
  const body = readFileSync(full, "utf8");
  if (/TODO|__SLUG__|__NAME__|__FONT__|REPLACE ME/.test(body)) todoFiles.push(rel);
  if (forbid && body.toLowerCase().includes(forbid.toLowerCase())) forbidFiles.push(rel);
}
todoFiles.length
  ? (strict ? todoFiles.forEach((f) => bad(`unfilled markers in ${f}`)) : warn(`${todoFiles.length} files still carry TODO markers: ${todoFiles.slice(0, 4).join(", ")}${todoFiles.length > 4 ? " ..." : ""}`))
  : ok("no unfilled markers");
forbid !== undefined
  ? (forbidFiles.length
      ? forbidFiles.forEach((f) => bad(`reference name "${forbid}" appears in ${f}`))
      : ok(`no occurrence of the reference name "${forbid}"`))
  : warn("pass --forbid \"<reference name>\" to prove the clone scrub");

/* 6. registration entry (optional) */
if (manifestPath) {
  if (!existsSync(manifestPath)) {
    bad(`manifest not found at ${manifestPath}`);
  } else {
    const m = JSON.parse(readFileSync(manifestPath, "utf8"));
    const entry = (m.systems || []).find((s) => s.slug === dir.split("/").pop());
    if (!entry) {
      bad(`no systems entry for slug "${dir.split("/").pop()}" in ${manifestPath}`);
    } else {
      ok(`registered in manifest (${entry.name})`);
      const onDisk = (function walk(d, base = "") {
        return readdirSync(d, { withFileTypes: true }).flatMap((e) => {
          if (e.name.startsWith(".") || e.name === "thumbnail.webp") return [];
          const rel = base ? `${base}/${e.name}` : e.name;
          const full = join(d, e.name);
          return statSync(full).isDirectory() ? walk(full, rel) : [rel];
        });
      })(dir).sort();
      const listed = entry.files.map((f) => f.path).sort();
      const missingFromList = onDisk.filter((f) => !listed.includes(f));
      const listedMissing = listed.filter((f) => !onDisk.includes(f));
      (missingFromList.length || listedMissing.length)
        ? bad(`files[] vs folder mismatch — unlisted: ${missingFromList.join(", ") || "none"}; listed but absent: ${listedMissing.join(", ") || "none"}`)
        : ok(`files[] matches the folder (${listed.length} files)`);
      existsSync(join(dir, "thumbnail.webp")) && entry.thumbnailImage
        ? ok("thumbnailImage registered")
        : warn("render thumbnail.webp and set thumbnailImage in the manifest entry");
    }
  }
} else {
  warn("pass --manifest data/design-systems/manifest.json after registering");
}

console.log(failures ? `\n${failures} failure(s), ${warnings} warning(s)` : `\nall checks passed (${warnings} warning(s))`);
process.exit(failures ? 1 : 0);
