#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const frontend = new URL("../frontend/", import.meta.url);
const vendor = new URL("vendor/", frontend);
const registry = "https://ui.shadcn.com/r/styles/radix-vega/";
const items = ["style", "utils", "button", "card", "dialog", "tabs", "tooltip",
  "dropdown-menu", "accordion", "input", "badge"];
const latest = process.argv.includes("--latest");

async function download(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

const packages = JSON.parse(await readFile(new URL("package.json", frontend), "utf8"));
const snapshot = await readFile(new URL("checksums.json", vendor), "utf8").then(JSON.parse, (error) => {
  if (error.code === "ENOENT") return [];
  throw error;
});
const shadcnVersion = snapshot.find(({ file }) => file === "shadcn-tailwind.css")?.package.version ?? "4.23.0";
const shadcn = JSON.parse(await download(`https://registry.npmjs.org/shadcn/${latest ? "latest" : shadcnVersion}`));
const shadcnTarball = await download(shadcn.dist.tarball);
if (`sha512-${createHash("sha512").update(shadcnTarball).digest("base64")}` !== shadcn.dist.integrity) {
  throw new Error("shadcn package integrity mismatch");
}
if (latest) {
  for (const group of [packages.dependencies, packages.devDependencies]) {
    await Promise.all(Object.keys(group).map(async (name) => {
      const metadata = JSON.parse(await download(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`));
      group[name] = metadata.version;
    }));
  }
}
const source = Object.fromEntries(items.map((item) => [`${item}.json`, `${registry}${item}.json`]));
source["theme.json"] = "https://ui.shadcn.com/r/themes/neutral.json";
source["shadcn-LICENSE.md"] = "https://raw.githubusercontent.com/shadcn-ui/ui/dd41d19e2f80ff6891951f7ced74c2c9a650b065/LICENSE.md";
source["react-remove-scroll-bar-LICENSE.txt"] = "https://raw.githubusercontent.com/theKashey/react-remove-scroll-bar/8ca9ba5ea52de03308fe8ced94f7b159a44d28ff/LICENSE";
source["gsap-license.html"] = "https://gsap.com/community/standard-license/";
const files = await Promise.all(Object.entries(source).map(async ([file, url]) => {
  const bytes = await download(url);
  if (file.endsWith(".json")) {
    const item = JSON.parse(bytes);
    for (const dependency of item.registryDependencies ?? []) {
      if (!items.includes(dependency)) throw new Error(`${file} depends on unpinned item ${dependency}`);
    }
    for (const dependency of [...item.dependencies ?? [], ...item.devDependencies ?? []]) {
      if (dependency !== "shadcn" && !packages.dependencies[dependency]) {
        throw new Error(`${file} depends on unpinned package ${dependency}`);
      }
    }
  }
  return { file, url, bytes, sha256: createHash("sha256").update(bytes).digest("hex") };
}));
// Keep the license text without copying the site's active HTML and remote scripts.
const gsap = files.find((item) => item.file === "gsap-license.html");
const body = gsap.bytes.toString().replace(/<!--[\s\S]*?-->/g, "")
  .match(/<h2[^>]*>Standard[^<]*GSAP License<\/h2>[\s\S]*?(?=<h2[^>]*>FAQ<\/h2>|<h1[^>]*>FAQ<\/h1>)/i)?.[0];
if (!body) throw new Error("Could not identify the GSAP license text");
gsap.file = "gsap-LICENSE.txt";
gsap.bytes = Buffer.from(body.replace(/<\/\s*(?:p|li|h[1-6]|ol|ul)>/gi, "\n")
  .replace(/<[^>]+>/g, "").replaceAll("&amp;", "&").replaceAll("&nbsp;", " ")
  .split("\n").map((line) => line.trim()).filter(Boolean).join("\n") + "\n");
gsap.sha256 = createHash("sha256").update(gsap.bytes).digest("hex");
const shadcnCss = execFileSync("tar", ["-xzOf", "-", "package/dist/tailwind.css"], { input: shadcnTarball });
files.push({
  file: "shadcn-tailwind.css", url: shadcn.dist.tarball, bytes: shadcnCss,
  sha256: createHash("sha256").update(shadcnCss).digest("hex"),
  package: { name: shadcn.name, version: shadcn.version, license: shadcn.license },
});

let refreshedLock;
const packageText = JSON.stringify(packages, null, 2) + "\n";
if (latest) {
  const directory = await mkdtemp(join(tmpdir(), "designer-frontend-refresh-"));
  try {
    await writeFile(join(directory, "package.json"), packageText);
    await writeFile(join(directory, "package-lock.json"), await readFile(new URL("package-lock.json", frontend)));
    const result = spawnSync("npm", ["install", "--package-lock-only", "--ignore-scripts"], {
      cwd: directory, stdio: "inherit",
    });
    if (result.status !== 0) throw new Error("Frontend lockfile refresh failed");
    refreshedLock = await readFile(join(directory, "package-lock.json"));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

await mkdir(vendor, { recursive: true });
for (const { file, bytes } of files) await writeFile(new URL(file, vendor), bytes);
await writeFile(new URL("checksums.json", vendor),
  JSON.stringify(files.map(({ bytes, ...item }) => item), null, 2) + "\n");
if (refreshedLock) {
  await writeFile(new URL("package.json", frontend), packageText);
  await writeFile(new URL("package-lock.json", frontend), refreshedLock);
}
console.log(`Pinned ${files.length} upstream frontend files`);
