#!/usr/bin/env node
/**
 * fetch-daisyui.mjs — bake the daisyUI layer into the cache (build-time network).
 *
 * daisyUI 5 publishes everything this layer needs through first-party,
 * permissively licensed channels, so no docs scraping happens at all:
 *
 *   - daisyui npm tarball -> the fully compiled `daisyui.css` (every component
 *     class, usable standalone with no Tailwind install; upstream compiles
 *     only the light and dark themes into it) plus the variables-only
 *     `themes.css`. MIT, zero dependencies. This fetcher appends the 34
 *     per-theme sheets so the vendored css drives all 35 themes.
 *   - saadeghi/daisyui GitHub tarball (pinned tag) -> the official agent docs
 *     under skills/daisyui/ (per-component class tables, syntax HTML and rules,
 *     written by upstream for coding agents) and the MIT licence text.
 *
 * The component examples are rendered here from upstream's syntax templates:
 * each `{PLACEHOLDER}` is filled with a concrete, offline-safe value, and a
 * small per-component override supplies a richer example where a bare template
 * renders closed or empty (modals, dropdowns, carousels). The templates stay
 * verbatim in each record's `syntax` field. Component groups are authored:
 * upstream ships no machine-readable grouping (provenance.records.groups).
 *
 * The runtime surfaces (preview, MCP, static site) never run this script and
 * never repeat any of these requests: they read <cache>/daisyui/ from disk.
 *
 * Cache layout (per data/daisyui/pin.json):
 *   <cache>/daisyui/catalog.json         component + theme index
 *   <cache>/daisyui/components/<slug>.json  docs, classes, syntax, example
 *   <cache>/daisyui/css/daisyui.css      the full compiled css (all themes)
 *   <cache>/daisyui/css/themes.css       theme variables only
 *   <cache>/daisyui/css/compat.css       authored utilities the examples use
 *   <cache>/daisyui/themes.json          ordered theme list from themes.css
 *   <cache>/daisyui/docs/                the vendored skills/daisyui tree
 *   <cache>/daisyui/LICENSE              upstream MIT licence, verbatim
 *   <cache>/daisyui/provenance.json      versions, urls, sha256 checksums, gaps
 *
 * Every stage is fail-soft except the two tarballs: a failed stage is recorded
 * in provenance.gaps and previously baked content is left untouched.
 *
 * Usage:
 *   node scripts/fetch-daisyui.mjs
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CACHE_DIR, writeJsonAtomic } from "./lib/cache.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PIN_PATH = join(HERE, "..", "data", "daisyui", "pin.json");
const DAISYUI_DIR = join(CACHE_DIR, "daisyui");

const UA = "designer-mcp-docker fetch-daisyui";
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Verify an npm registry `dist.integrity` string ("sha512-<base64>"). */
function integrityOk(buf, integrity) {
  const [algo, digest] = String(integrity || "").split("-");
  if (algo !== "sha512" || !digest) return false;
  return createHash("sha512").update(buf).digest("base64") === digest;
}

/** Extract a .tgz into destDir with the system tar (spawnSync, like fetch-heroui). */
function extractTarball(tgzPath, destDir) {
  const res = spawnSync("tar", ["-xzf", tgzPath, "-C", destDir], { stdio: "pipe" });
  if (res.status !== 0) {
    throw new Error(`tar extraction failed for ${tgzPath}: ${res.stderr?.toString().slice(0, 300)}`);
  }
}

async function fetchNpmPackage(name, version) {
  const metaUrl = `https://registry.npmjs.org/${name}/${version}`;
  const meta = JSON.parse((await fetchBuffer(metaUrl)).toString("utf8"));
  const tarballUrl = meta.dist?.tarball;
  const integrity = meta.dist?.integrity;
  if (!tarballUrl) throw new Error(`registry metadata for ${name}@${version} has no tarball`);
  const buf = await fetchBuffer(tarballUrl);
  if (integrity && !integrityOk(buf, integrity)) {
    throw new Error(`integrity mismatch for ${name}@${version}`);
  }
  const dir = await mkdtemp(join(tmpdir(), "daisyui-pkg-"));
  const tgz = join(dir, "pkg.tgz");
  await writeFile(tgz, buf);
  extractTarball(tgz, dir);
  return { pkgDir: join(dir, "package"), version: meta.version, integrity: integrity || "", tarballUrl };
}

async function fetchDocsTree(pin) {
  const { repo, tag } = pin.source || {};
  if (!repo || !tag) throw new Error("pin.json source.repo/source.tag missing");
  const tarballUrl = `https://codeload.github.com/${repo}/tar.gz/${tag}`;
  const buf = await fetchBuffer(tarballUrl);
  const dir = await mkdtemp(join(tmpdir(), "daisyui-src-"));
  const tgz = join(dir, "repo.tgz");
  await writeFile(tgz, buf);
  extractTarball(tgz, dir);
  // The GitHub tarball unpacks to <repo>-<tag without v>. Find it rather than guess.
  const entries = await readdir(dir, { withFileTypes: true });
  const root = entries.find((e) => e.isDirectory() && e.name.startsWith(repo.split("/")[1]))?.name;
  if (!root) throw new Error("unexpected GitHub tarball layout");
  const repoDir = join(dir, root);
  const docsDir = join(repoDir, "skills", "daisyui");
  if (!existsSync(join(docsDir, "components"))) {
    throw new Error(`skills/daisyui/ missing from the ${tag} tarball (upstream moved the docs?)`);
  }
  // Resolve the tag to a commit sha via the API when possible (best effort).
  let sha = "";
  try {
    const commit = JSON.parse((await fetchBuffer(`https://api.github.com/repos/${repo}/commits/${tag}`)).toString("utf8"));
    sha = commit.sha || "";
  } catch (e) {
    // The sha is provenance metadata only; record the miss and move on.
    console.warn(`  could not resolve ${tag} to a commit sha (${e.message})`);
  }
  return { docsDir, licencePath: join(repoDir, "LICENSE"), sha, tarballUrl };
}

/** "ToggleButton" -> "toggle-button", matching the upstream doc filenames. */
const slugify = (name) =>
  String(name || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ---------------------------------------------------------------------------
// Authored grouping. The upstream docs ship no machine-readable component
// grouping (the daisyui.com sidebar is a client-rendered app, and /api/ paths
// are off limits by repo policy), so the groups below mirror the published
// docs sidebar by hand. provenance.records.groups records this.
const GROUPS = {
  button: "Actions", dropdown: "Actions", fab: "Actions", filter: "Actions",
  join: "Actions", loading: "Actions", modal: "Actions", swap: "Actions",
  "theme-controller": "Actions", status: "Actions",
  accordion: "Data display", avatar: "Data display", aura: "Data display",
  badge: "Data display", calendar: "Data display", card: "Data display",
  carousel: "Data display", chat: "Data display", collapse: "Data display",
  countdown: "Data display", diff: "Data display", "hover-3d": "Data display",
  "hover-gallery": "Data display", kbd: "Data display", list: "Data display",
  progress: "Data display", "radial-progress": "Data display", rating: "Data display",
  stack: "Data display", stat: "Data display", steps: "Data display",
  table: "Data display", "text-rotate": "Data display", timeline: "Data display",
  checkbox: "Data input", fieldset: "Data input", "file-input": "Data input",
  input: "Data input", label: "Data input", otp: "Data input", radio: "Data input",
  range: "Data input", select: "Data input", textarea: "Data input",
  toggle: "Data input", validator: "Data input",
  alert: "Feedback", skeleton: "Feedback", toast: "Feedback", tooltip: "Feedback",
  divider: "Layout", drawer: "Layout", footer: "Layout", hero: "Layout",
  indicator: "Layout", mask: "Layout",
  breadcrumbs: "Navigation", dock: "Navigation", link: "Navigation", menu: "Navigation",
  megamenu: "Navigation", navbar: "Navigation", pagination: "Navigation", tab: "Navigation",
  "mockup-browser": "Mockup", "mockup-code": "Mockup", "mockup-phone": "Mockup",
  "mockup-window": "Mockup",
};

// Components whose primary syntax cannot render with the vendored css alone
// (the calendar needs the Cally web component, not just css classes).
const NOT_PREVIEWABLE = new Set(["calendar"]);

/** An offline-safe placeholder image: a neutral portrait as an SVG data url. */
const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 240'%3E" +
  "%3Crect width='320' height='240' rx='12' fill='%23d1d5db'/%3E" +
  "%3Ccircle cx='160' cy='96' r='44' fill='%239ca3af'/%3E" +
  "%3Cpath d='M64 208c14-44 52-64 96-64s82 20 96 64z' fill='%239ca3af'/%3E%3C/svg%3E";

/**
 * Generic fills for the placeholders the upstream syntax templates use.
 * Specific shapes are handled by the per-component overrides below.
 */
const SUBSTITUTIONS = {
  MODIFIER: "",
  CONTENT: "Hello!",
  DIRECTION: "",
  COLOR: "",
  PLACEMENT: "chat-start",
  "image-url": PLACEHOLDER_IMG,
  "alt-text": "Placeholder",
  title: "Card title",
  number: "42",
  type: "text",
  name: "example-name",
  NAME: "example-filter",
  checked: "checked",
  id: "example-popover",
  anchor: "example-anchor",
  button: "Open menu",
  SIDEBAR: '<ul class="menu bg-base-200 w-80 min-h-full"><li><a>Item 1</a></li><li><a>Item 2</a></li></ul>',
  description: "Optional description text",
  "label text": "Full name",
  "indicator content": "New",
  "main content": '<button class="btn">Open</button>',
  "content when active": "ON",
  "content when inactive": "OFF",
  "theme-name": "dim",
  IconOriginal: "★",
  Icon1: "✎",
  Icon2: "☺",
  Icon3: "✆",
  start: "Title",
  end: "Description",
  icon: "<span></span>",
  value: "1",
};

/**
 * Authored examples for components whose bare syntax template renders closed,
 * empty, or awkward in a static preview. Everything else renders from the
 * template with the substitutions above.
 */
const OVERRIDES = {
  button: () => `<button class="btn">Default</button>
<button class="btn btn-primary">Primary</button>
<button class="btn btn-outline">Outline</button>`,
  badge: () => `<span class="badge">badge</span>
<span class="badge badge-primary">primary</span>
<span class="badge badge-outline">outline</span>
<span class="badge badge-soft">soft</span>`,
  alert: () => `<div role="alert" class="alert alert-info"><span>An alert for your information.</span></div>
<div role="alert" class="alert alert-success"><span>The operation completed.</span></div>`,
  card: () => `<div class="card w-full max-w-80 bg-base-100 shadow-sm">
  <figure><img src="${PLACEHOLDER_IMG}" alt="Placeholder" /></figure>
  <div class="card-body">
    <h2 class="card-title">Card title</h2>
    <p>A card groups related content and actions about a single topic.</p>
    <div class="card-actions justify-end"><button class="btn btn-primary">Buy now</button></div>
  </div>
</div>`,
  modal: () => `<dialog class="modal modal-open">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Hello!</h3>
    <p class="py-4">This modal is shown with the modal-open class.</p>
    <div class="modal-action"><button class="btn">Close</button></div>
  </div>
</dialog>`,
  dropdown: () => `<div class="dropdown dropdown-open">
  <div tabindex="0" role="button" class="btn m-1">Open menu</div>
  <ul class="dropdown-content menu bg-base-100 rounded-box w-56 p-2 shadow-sm">
    <li><a>Item 1</a></li><li><a>Item 2</a></li>
  </ul>
</div>`,
  accordion: () => `<div class="collapse collapse-arrow collapse-open bg-base-200">
  <input type="radio" name="example-accordion" checked="checked" />
  <div class="collapse-title text-xl font-medium">How do I use this component?</div>
  <div class="collapse-content"><p>The collapse-open class keeps this panel expanded.</p></div>
</div>`,
  collapse: () => `<div tabindex="0" class="collapse collapse-open collapse-arrow bg-base-200">
  <div class="collapse-title text-xl font-medium">Click to collapse</div>
  <div class="collapse-content"><p>The collapse-open class keeps this panel expanded.</p></div>
</div>`,
  carousel: () => `<div class="carousel w-full">
  ${["base-200", "primary", "secondary", "accent"].map((c, i) => `<div class="carousel-item w-full" id="slide${i + 1}"><div class="w-full h-32 grid place-items-center bg-${c} text-base-content">Slide ${i + 1}</div></div>`).join("\n  ")}
</div>`,
  chat: () => `<div class="chat chat-start"><div class="chat-bubble">Where are you?</div></div>
<div class="chat chat-end"><div class="chat-bubble chat-bubble-primary">Right here!</div></div>`,
  dock: () => `<div class="dock">
  <button class="dock-active"><span class="dock-label">Home</span></button>
  <button><span class="dock-label">Search</span></button>
  <button><span class="dock-label">Saved</span></button>
  <button><span class="dock-label">Settings</span></button>
</div>`,
  steps: () => `<ul class="steps">
  <li class="step step-primary">Register</li>
  <li class="step step-primary">Choose plan</li>
  <li class="step">Purchase</li>
  <li class="step">Receive product</li>
</ul>`,
  progress: () => `<progress class="progress progress-primary" value="70" max="100"></progress>
<progress class="progress" value="30" max="100"></progress>`,
  "radial-progress": () => `<div class="radial-progress" style="--value:70;" aria-valuenow="70" role="progressbar">70%</div>`,
  rating: () => `<div class="rating">
  <input type="radio" name="example-rating" class="mask mask-star-2" aria-label="1 star" />
  <input type="radio" name="example-rating" class="mask mask-star-2" aria-label="2 star" />
  <input type="radio" name="example-rating" class="mask mask-star-2" aria-label="3 star" checked="checked" />
  <input type="radio" name="example-rating" class="mask mask-star-2" aria-label="4 star" />
  <input type="radio" name="example-rating" class="mask mask-star-2" aria-label="5 star" />
</div>`,
  navbar: () => `<div class="navbar bg-base-200 rounded-box">
  <div class="flex-1"><a class="btn btn-ghost text-xl">daisyUI</a></div>
  <div class="flex-none"><input type="text" placeholder="Search" class="input input-sm w-24" /></div>
  <div class="flex-none"><button class="btn btn-primary btn-sm">Sign in</button></div>
</div>`,
  menu: () => `<ul class="menu bg-base-200 rounded-box w-56">
  <li><a class="menu-active">Item 1</a></li>
  <li><a>Item 2</a></li>
  <li><a>Item 3</a></li>
</ul>`,
  tab: () => `<div role="tablist" class="tabs tabs-box">
  <input type="radio" name="example-tabs" role="tab" class="tab" aria-label="Tab 1" checked="checked" />
  <div class="tab-content bg-base-100 border-base-300 p-4">Tab 1 content</div>
  <input type="radio" name="example-tabs" role="tab" class="tab" aria-label="Tab 2" />
  <div class="tab-content bg-base-100 border-base-300 p-4">Tab 2 content</div>
</div>`,
  table: () => `<div class="overflow-x-auto">
  <table class="table">
    <thead><tr><th></th><th>Name</th><th>Role</th></tr></thead>
    <tbody>
      <tr><th>1</th><td>Daisy</td><td>Flower</td></tr>
      <tr><th>2</th><td>Tulip</td><td>Bulb</td></tr>
      <tr><th>3</th><td>Fern</td><td>Plant</td></tr>
    </tbody>
  </table>
</div>`,
  stat: () => `<div class="stats">
  <div class="stat">
    <div class="stat-title">Page views</div>
    <div class="stat-value">42,700</div>
    <div class="stat-desc">21% more than last week</div>
  </div>
</div>`,
  timeline: () => `<ul class="timeline">
  <li><div class="timeline-start">Shipped</div><div class="timeline-middle"></div><div class="timeline-end timeline-box">Package on the way</div></li>
  <li><hr class="bg-primary" /><div class="timeline-start">Packed</div><div class="timeline-middle"></div><div class="timeline-end timeline-box">Box sealed</div></li>
</ul>`,
  list: () => `<ul class="list bg-base-100 rounded-box shadow-sm">
  <li class="list-row"><div><div class="font-bold">Cloud Nine</div><div class="list-col-grow text-sm opacity-70">Cumulus</div></div></li>
  <li class="list-row"><div><div class="font-bold">Low Level</div><div class="list-col-grow text-sm opacity-70">Stratus</div></div></li>
</ul>`,
  avatar: () => `<div class="avatar avatar-online"><div class="w-16 rounded-full"><img src="${PLACEHOLDER_IMG}" alt="Placeholder" /></div></div>
<div class="avatar avatar-placeholder"><div class="bg-neutral text-neutral-content w-16 rounded-full"><span>D</span></div></div>`,
  indicator: () => `<div class="indicator">
  <span class="indicator-item badge badge-primary">New</span>
  <button class="btn">Inbox</button>
</div>`,
  kbd: () => `<kbd class="kbd kbd-sm">⌘</kbd><kbd class="kbd">K</kbd>`,
  countdown: () => `<span class="countdown font-mono text-3xl"><span style="--value:42;--digits:2;">42</span></span>`,
  skeleton: () => `<div class="flex flex-col gap-4 w-full max-w-60">
  <div class="skeleton h-24 w-full"></div>
  <div class="skeleton h-4 w-full"></div>
  <div class="skeleton h-4 w-2/3"></div>
</div>`,
  toast: () => `<div class="toast">
  <div class="alert alert-info"><span>New message arrived.</span></div>
  <div class="alert alert-success"><span>Message sent.</span></div>
</div>`,
  tooltip: () => `<div class="tooltip tooltip-open" data-tip="Hello there!"><button class="btn">Hover me</button></div>`,
  swap: () => `<label class="swap">
  <input type="checkbox" />
  <div class="swap-on">ON</div>
  <div class="swap-off">OFF</div>
</label>`,
  toggle: () => `<input type="checkbox" class="toggle toggle-primary" checked="checked" />
<input type="checkbox" class="toggle" />`,
  checkbox: () => `<input type="checkbox" checked="checked" class="checkbox checkbox-primary" />
<input type="checkbox" checked="checked" class="checkbox" />`,
  radio: () => `<div class="flex gap-3">
  <input type="radio" name="example-radio" class="radio radio-primary" checked="checked" />
  <input type="radio" name="example-radio" class="radio" />
  <input type="radio" name="example-radio" class="radio" />
</div>`,
  range: () => `<input type="range" class="range range-primary" value="60" />`,
  select: () => `<select class="select select-primary w-full max-w-60">
  <option>Option 1</option>
  <option>Option 2</option>
  <option>Option 3</option>
</select>`,
  input: () => `<input type="text" placeholder="Type here" class="input input-primary w-full max-w-60" />`,
  textarea: () => `<textarea class="textarea w-full max-w-60" placeholder="Bio"></textarea>`,
  "file-input": () => `<input type="file" class="file-input file-input-primary w-full max-w-60" />`,
  label: () => `<label class="input w-full max-w-60"><span class="label">Name</span><input type="text" placeholder="Type here" /></label>`,
  fieldset: () => `<fieldset class="fieldset w-full max-w-60">
  <legend class="fieldset-legend">Page title</legend>
  <input type="text" class="input w-full" placeholder="My account" />
  <p class="label">You can edit this text.</p>
</fieldset>`,
  validator: () => `<input type="text" class="input validator" required placeholder="Username" />
<p class="validator-hint">Must be 3 to 30 characters long.</p>`,
  otp: () => `<label class="otp">
  <span></span><span></span><span></span><span></span>
  <input type="text" autocomplete="one-time-code" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" required value="4219" />
</label>`,
  hero: () => `<div class="hero bg-base-200 min-h-48 rounded-box">
  <div class="hero-content text-center">
    <div class="max-w-md"><h1 class="text-3xl font-bold">Hello there</h1><p class="py-4">A hero puts a message front and center.</p><button class="btn btn-primary">Get started</button></div>
  </div>
</div>`,
  footer: () => `<footer class="footer bg-base-200 text-base-content rounded-box p-4">
  <nav><h6 class="footer-title">Services</h6><a class="link link-hover">Branding</a><a class="link link-hover">Design</a></nav>
  <nav><h6 class="footer-title">Company</h6><a class="link link-hover">About us</a><a class="link link-hover">Contact</a></nav>
</footer>`,
  breadcrumbs: () => `<div class="breadcrumbs text-sm"><ul><li><a>Home</a></li><li><a>Documents</a></li><li>Readme</li></ul></div>`,
  pagination: () => `<div class="join"><button class="btn join-item">1</button><button class="btn join-item btn-active">2</button><button class="btn join-item">3</button></div>`,
  link: () => `<a class="link link-primary">A primary link</a><a class="link">A plain link</a>`,
  divider: () => `<div class="divider">OR</div>`,
  drawer: () => `<div class="drawer drawer-open">
  <input id="example-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content bg-base-200 p-4 rounded-box">Main content</div>
  <div class="drawer-side"><ul class="menu bg-base-100 w-80 min-h-full"><li><a>Item 1</a></li><li><a>Item 2</a></li></ul></div>
</div>`,
  "mockup-code": () => `<div class="mockup-code">
  <pre data-prefix="$"><code>npm i daisyui</code></pre>
  <pre data-prefix=">" class="text-success"><code>installing...</code></pre>
  <pre data-prefix=">" class="text-success"><code>done!</code></pre>
</div>`,
  "mockup-browser": () => `<div class="mockup-browser border-base-300 border w-full">
  <div class="mockup-browser-toolbar"><div class="input">https://daisyui.com</div></div>
  <div class="grid place-items-center border-t border-base-300 h-40">Content</div>
</div>`,
  "mockup-window": () => `<div class="mockup-window border-base-300 border">
  <div class="grid place-items-center border-t border-base-300 h-40 bg-base-200">Content</div>
</div>`,
  "mockup-phone": () => `<div class="mockup-phone"><div class="mockup-phone-camera"></div><div class="mockup-phone-display grid place-items-center"><div class="px-4 py-2 bg-base-100 rounded-box">Hello!</div></div></div>`,
  mask: () => `<img class="mask mask-heart" src="${PLACEHOLDER_IMG}" alt="Placeholder" style="width:120px;height:120px;object-fit:cover;" />
<img class="mask mask-squircle" src="${PLACEHOLDER_IMG}" alt="Placeholder" style="width:120px;height:120px;object-fit:cover;" />`,
  "hover-3d": () => `<div class="hover-3d mx-2"><figure class="rounded-2xl"><img src="${PLACEHOLDER_IMG}" alt="Placeholder" style="width:200px;display:block;" /></figure></div>`,
  "hover-gallery": () => `<figure class="hover-gallery">
  <img src="${PLACEHOLDER_IMG}" alt="Placeholder 1" style="width:88px;height:88px;object-fit:cover;" />
  <img src="${PLACEHOLDER_IMG}" alt="Placeholder 2" style="width:88px;height:88px;object-fit:cover;" />
  <img src="${PLACEHOLDER_IMG}" alt="Placeholder 3" style="width:88px;height:88px;object-fit:cover;" />
</figure>`,
  "text-rotate": () => `<span class="text-rotate" style="font-size:2rem;"><span><span>fast</span><span>small</span><span>themeable</span></span></span>`,
  aura: () => `<div class="aura aura-primary"><div class="bg-base-100 rounded-box p-4">Hover me</div></div>`,
  stack: () => `<div class="stack"><div class="grid place-items-center bg-base-200 rounded-box h-24 w-24">1</div><div class="grid place-items-center bg-base-300 rounded-box h-24 w-24">2</div><div class="grid place-items-center bg-neutral rounded-box h-24 w-24 text-neutral-content">3</div></div>`,
  status: () => `<span class="status status-success"></span><span class="status status-error"></span>`,
  "theme-controller": () => `<input type="checkbox" value="dim" class="theme-controller toggle toggle-primary" checked="checked" />`,
  loading: () => `<span class="loading loading-spinner"></span>
<span class="loading loading-dots loading-sm"></span>
<span class="loading loading-ring loading-lg"></span>
<span class="loading loading-bars loading-xl"></span>`,
  join: () => `<div class="join"><button class="btn join-item">Left</button><button class="btn join-item">Middle</button><button class="btn join-item">Right</button></div>`,
  filter: () => `<div class="filter">
  <input class="btn filter-reset" type="radio" name="example-filter" aria-label="Reset" />
  <input class="btn" type="radio" name="example-filter" aria-label="Books" checked="checked" />
  <input class="btn" type="radio" name="example-filter" aria-label="Movies" />
</div>`,
  fab: () => `<div class="fab">
  <button class="btn btn-lg btn-circle btn-primary">★</button>
  <button class="btn btn-lg btn-circle">✎</button>
</div>`,
  diff: () => `<div class="diff rounded-box">
  <div class="diff-item-1 grid place-items-center bg-base-200 h-40"><div class="text-2xl font-bold">New</div></div>
  <div class="diff-item-2 grid place-items-center bg-base-300 h-40"><div class="text-2xl font-bold">Old</div></div>
  <div class="diff-resizer"></div>
</div>`,
  megamenu: () => `<div class="megamenu p-2 border border-base-300 rounded-box bg-base-100">
  <button class="btn">Products</button>
  <button class="btn">Services</button>
  <button class="btn">About</button>
</div>`,
};

/**
 * Render one example HTML fragment from the upstream syntax template, or take
 * the authored override when one exists. Placeholders longer than one segment
 * are replaced first, so "{content when active}" wins over "{content}".
 */
function renderExample(slug, syntax, name) {
  const override = OVERRIDES[slug];
  if (override) return override(name).trim();
  let html = syntax;
  const keys = Object.keys(SUBSTITUTIONS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const token = key.startsWith("{") ? key : `{${key}}`;
    html = html.split(token).join(SUBSTITUTIONS[key]);
  }
  // Anything left unsubstituted is a template variable upstream expects the
  // author to fill; leave it visible rather than ship a broken fragment.
  return html.trim();
}

/**
 * Parse one component doc into a record. The docs are plain markdown written
 * by upstream for agents; this is a tolerant read, not a renderer: anything
 * the parser cannot recognise still lands in `docs` verbatim.
 */
function parseComponentDoc(raw, { slug, group }) {
  const heading = /^###\s+(.+)$/m.exec(raw);
  const name = heading ? heading[1].trim() : slug;
  // Description: the first non-empty prose line after the heading (the docs
  // put one line of prose between the heading and the documentation link).
  const afterHeading = raw.slice(heading ? heading.index + heading[0].length : 0);
  const descLine = afterHeading.split(/\r?\n/).map((s) => s.trim()).find(Boolean);
  const description = descLine && !descLine.startsWith("[") ? descLine : "";
  const docLink = /\[([^\]]+) documentation\]\((https:\/\/daisyui\.com[^\)]+)\)/.exec(raw);
  // Class names: flat "- kind: `a`, `b`" rows; the calendar doc nests instead,
  // which the flat regex simply skips.
  const classes = [];
  const classSection = /####\s+Class names\n([\s\S]*?)(?=\n####|\n*$)/.exec(raw);
  if (classSection) {
    for (const line of classSection[1].split(/\r?\n/)) {
      const flat = /^-\s+([\w-]+):\s+(.+)$/.exec(line.trim());
      if (flat) {
        const names = [...flat[2].matchAll(/`([\w.:-]+)`/g)].map((m) => m[1]);
        if (names.length) classes.push({ kind: flat[1], classes: names });
        continue;
      }
      const nested = /^-\s+([\w-]+)\s*$/.exec(line.trim());
      if (nested) {
        const names = [];
        for (const sub of classSection[1].split(/\r?\n/)) {
          const m = /^\s+-\s+`([\w.:-]+)`/.exec(sub);
          if (m) names.push(m[1]);
        }
        if (names.length) classes.push({ kind: nested[1], classes: names });
        break;
      }
    }
  }
  // Syntax: the first ```html fenced block, kept verbatim.
  const syntaxMatch = /```html\n([\s\S]*?)```/.exec(raw);
  const syntax = syntaxMatch ? syntaxMatch[1].replace(/\n$/, "") : "";
  return {
    slug,
    name,
    group: group || "Other",
    description,
    docUrl: docLink ? docLink[2] : `https://daisyui.com/components/${slug}/`,
    classes,
    syntax,
    docs: raw,
    example: syntax ? renderExample(slug, syntax, name) : "",
    previewable: !NOT_PREVIEWABLE.has(slug) && Boolean(syntax),
  };
}

/**
 * The Tailwind utilities the upstream example markup references, mapped onto
 * daisyUI's own theme variables. daisyui.css carries the component classes and
 * theme colors but not Tailwind utilities; this authored sheet keeps the baked
 * examples looking right in a standalone preview (provenance.records.compat).
 */
const COMPAT_CSS = `/* compat.css — authored by designer-mcp-docker: the Tailwind utilities the
   daisyUI example markup references, mapped to daisyUI theme variables. */
.flex { display: flex; }
.flex-1 { flex: 1 1 0%; }
.flex-none { flex: none; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.hidden { display: none; }
.grid { display: grid; }
.place-items-center { place-items: center; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-items-center { justify-items: center; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.gap-2 { gap: .5rem; }
.gap-3 { gap: .75rem; }
.gap-4 { gap: 1rem; }
.p-2 { padding: .5rem; }
.p-4 { padding: 1rem; }
.px-2 { padding-left: .5rem; padding-right: .5rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-2 { padding-top: .5rem; padding-bottom: .5rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.m-1 { margin: .25rem; }
.m-2 { margin: .5rem; }
.mx-2 { margin-left: .5rem; margin-right: .5rem; }
.my-12 { margin-top: 3rem; margin-bottom: 3rem; }
.w-full { width: 100%; }
.w-16 { width: 4rem; }
.w-24 { width: 6rem; }
.w-56 { width: 14rem; }
.w-80 { width: 20rem; }
.w-2\\/3 { width: 66.666667%; }
.h-4 { height: 1rem; }
.h-24 { height: 6rem; }
.h-32 { height: 8rem; }
.h-40 { height: 10rem; }
.h-48 { min-height: 12rem; height: 12rem; }
.min-h-full { min-height: 100%; }
.min-h-48 { min-height: 12rem; }
.max-w-60 { max-width: 15rem; }
.max-w-80 { max-width: 20rem; }
.max-w-100 { max-width: 25rem; }
.max-w-md { max-width: 28rem; }
.text-sm { font-size: .875rem; line-height: 1.43; }
.text-lg { font-size: 1.125rem; line-height: 1.5; }
.text-xl { font-size: 1.25rem; line-height: 1.5; }
.text-2xl { font-size: 1.5rem; line-height: 1.9; }
.text-3xl { font-size: 1.875rem; line-height: 2.2; }
.text-7xl { font-size: 4.5rem; line-height: 1; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.rounded-2xl { border-radius: 1rem; }
.rounded-full { border-radius: 9999px; }
.border { border-width: 1px; border-style: solid; }
.border-t { border-top-width: 1px; border-top-style: solid; }
.border-base-300 { border-color: var(--color-base-300); }
.bg-base-100 { background-color: var(--color-base-100); }
.bg-base-200 { background-color: var(--color-base-200); }
.bg-base-300 { background-color: var(--color-base-300); }
.bg-neutral { background-color: var(--color-neutral); }
.text-base-content { color: var(--color-base-content); }
.text-neutral-content { color: var(--color-neutral-content); }
.text-success { color: var(--color-success); }
.opacity-70 { opacity: .7; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / .05); }
.overflow-x-auto { overflow-x: auto; }
/* Previews are screenshots: the entrance animation and @starting-style
   transition would be caught mid-fade, so open-state content appears
   instantly. Interactive previews just lose the fade. */
.dropdown-content, [popover] { animation: none; transition: none; }
`;

/** sha256 for every file under dir, keyed by path relative to rootDir. */
async function checksumTree(rootDir, rel = "") {
  const out = {};
  for (const entry of await readdir(join(rootDir, rel), { withFileTypes: true })) {
    const child = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) Object.assign(out, await checksumTree(rootDir, child));
    else out[child] = sha256(await readFile(join(rootDir, child)));
  }
  return out;
}

/** The ordered theme names, read from themes.css's data-theme selectors. */
function parseThemes(themesCss) {
  const themes = [];
  for (const match of themesCss.matchAll(/\[data-theme="?([a-z0-9-]+)"?\]/g)) {
    if (!themes.includes(match[1])) themes.push(match[1]);
  }
  return themes;
}

async function main() {
  const force = process.argv.includes("--force");
  const pin = await readPin();
  if (!force && existsSync(join(DAISYUI_DIR, "catalog.json")) && existsSync(join(DAISYUI_DIR, "css", "daisyui.css"))) {
    try {
      const prior = JSON.parse(await readFile(join(DAISYUI_DIR, "provenance.json"), "utf8"));
      if (prior && JSON.stringify(prior.pin) === JSON.stringify(pin)) {
        console.log(`daisyUI layer -> ${DAISYUI_DIR} (up to date, matches pin; pass --force to refetch)`);
        return;
      }
    } catch {}
  }
  const gaps = [];
  const stage = async (label, fn) => {
    try {
      return await fn();
    } catch (e) {
      gaps.push(`${label}: ${e.message}`);
      console.warn(`  ${label} failed (recorded as a gap): ${e.message}`);
      return null;
    }
  };

  console.log(`daisyUI layer -> ${DAISYUI_DIR}`);
  console.log(`  pin: css ${pin.version}, docs ${pin.source?.tag}`);

  // ---------------------------------------------------------- npm tarball
  // The compiled css is the floor of this layer: without it there is nothing
  // to preview or serve, so a failure here aborts the run.
  const pkg = await stage("npm tarball", () => fetchNpmPackage("daisyui", pin.version));
  if (!pkg?.pkgDir || !existsSync(join(pkg.pkgDir, "daisyui.css"))) {
    throw new Error("the compiled daisyui.css is the core of this layer; fix the fetch and re-run");
  }
  const compiledCss = await readFile(join(pkg.pkgDir, "daisyui.css"), "utf8");
  const themesCss = await readFile(join(pkg.pkgDir, "themes.css"), "utf8");
  const cssVersion = (/daisyUI\s+(\d+\.\d+\.\d+)/.exec(compiledCss) || [])[1] || pkg.version;
  const themes = parseThemes(themesCss);
  // The compiled css carries only the light and dark themes; every other
  // theme ships as its own variables sheet (theme/<name>.css). Concatenate
  // them onto the vendored css so a single stylesheet drives every baked
  // theme — with light.css excluded, whose bare `:root` block would
  // otherwise re-assert light over the darker themes on the same element.
  const themeSheets = [];
  for (const theme of themes) {
    if (theme === "light") continue;
    const file = join(pkg.pkgDir, "theme", `${theme}.css`);
    if (existsSync(file)) themeSheets.push(await readFile(file, "utf8"));
    else gaps.push(`css: no per-theme sheet for '${theme}' (its ?theme= preview will fall back to light)`);
  }
  const fullCss = [compiledCss, ...themeSheets].join("\n");

  // ------------------------------------------------------------ repo docs
  const source = await stage("repo docs", () => fetchDocsTree(pin));

  // ------------------------------------------------------------- swap into the cache
  // Only now touch the cache: a failure above leaves the previous bake intact.
  await mkdir(DAISYUI_DIR, { recursive: true });
  await rm(join(DAISYUI_DIR, "css"), { recursive: true, force: true });
  await mkdir(join(DAISYUI_DIR, "css"), { recursive: true });
  await writeFile(join(DAISYUI_DIR, "css", "daisyui.css"), fullCss);
  await writeFile(join(DAISYUI_DIR, "css", "themes.css"), themesCss);
  await writeFile(join(DAISYUI_DIR, "css", "compat.css"), COMPAT_CSS);
  if (source?.docsDir) {
    await rm(join(DAISYUI_DIR, "docs"), { recursive: true, force: true });
    await cp(source.docsDir, join(DAISYUI_DIR, "docs"), { recursive: true });
    // The upstream MIT licence travels with the layer.
    const licence = source.licencePath && existsSync(source.licencePath) ? source.licencePath : join(pkg.pkgDir, "LICENSE");
    if (existsSync(licence)) await cp(licence, join(DAISYUI_DIR, "LICENSE"));
  }

  // ------------------------------------------------------------- catalog
  let components = [];
  if (source?.docsDir) {
    const docsComponentsDir = join(DAISYUI_DIR, "docs", "components");
    const files = (await readdir(docsComponentsDir)).filter((f) => f.endsWith(".md")).sort();
    components = files.map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = readFileSync(join(docsComponentsDir, file), "utf8");
      return parseComponentDoc(raw, { slug, group: GROUPS[slug] || "Other" });
    });
    const ungrouped = components.filter((c) => !GROUPS[c.slug]).map((c) => c.slug);
    if (ungrouped.length) gaps.push(`groups: no authored group for ${ungrouped.join(", ")} (fell back to "Other")`);
  }
  const previewableCount = components.filter((c) => c.previewable).length;
  const catalog = {
    updatedAt: Date.now(),
    version: { css: cssVersion, source: pin.source?.tag || null },
    totals: { components: components.length, previewable: previewableCount, themes: themes.length },
    components: components.map(({ docs, syntax, example, ...entry }) => entry),
    themes,
  };
  await writeJsonAtomic(join(DAISYUI_DIR, "catalog.json"), catalog);
  await writeJsonAtomic(join(DAISYUI_DIR, "themes.json"), { updatedAt: Date.now(), total: themes.length, themes });
  console.log(`  catalog: ${components.length} components (${previewableCount} previewable), ${themes.length} themes`);

  // Per-component records: docs, classes, the verbatim syntax and the rendered example.
  await rm(join(DAISYUI_DIR, "components"), { recursive: true, force: true });
  await mkdir(join(DAISYUI_DIR, "components"), { recursive: true });
  for (const record of components) {
    await writeJsonAtomic(join(DAISYUI_DIR, "components", `${record.slug}.json`), record);
  }

  // ---------------------------------------------------------- provenance
  const provenance = {
    fetchedAt: new Date().toISOString(),
    pin,
    npm: { package: "daisyui", version: pkg.version, integrity: pkg.integrity, tarballUrl: pkg.tarballUrl, cssVersion },
    source: source
      ? { repo: pin.source.repo, tag: pin.source.tag, sha: source.sha, tarballUrl: source.tarballUrl }
      : null,
    records: {
      groups: "authored — upstream ships no machine-readable component grouping; this map mirrors the published docs sidebar",
      examples:
        "rendered from upstream's syntax templates with placeholder substitutions, plus authored overrides for components whose bare template renders closed or empty",
      compat: "compat.css is authored: the Tailwind utilities the upstream examples reference, mapped to daisyUI theme variables",
      css: "css/daisyui.css is the upstream compiled css with the 34 non-light per-theme sheets appended (upstream compiles only light and dark into it)",
    },
    gaps,
    checksums: await checksumTree(DAISYUI_DIR),
  };
  await writeJsonAtomic(join(DAISYUI_DIR, "provenance.json"), provenance);

  console.log(`  provenance: ${Object.keys(provenance.checksums).length} files checksummed`);
  if (gaps.length) {
    console.warn(`  ${gaps.length} gap(s) recorded:`);
    for (const g of gaps) console.warn(`    - ${g}`);
  }
  console.log("done");
}

async function readPin() {
  if (!existsSync(PIN_PATH)) throw new Error(`missing ${PIN_PATH}`);
  try {
    const pin = JSON.parse(await readFile(PIN_PATH, "utf8"));
    if (!pin?.version || !pin?.source?.repo || !pin?.source?.tag) throw new Error("pin fields missing");
    return pin;
  } catch (e) {
    throw new Error(`invalid ${PIN_PATH}: ${e.message}`);
  }
}

main().catch((e) => {
  console.error("fetch-daisyui failed:", e.message);
  process.exit(1);
});
