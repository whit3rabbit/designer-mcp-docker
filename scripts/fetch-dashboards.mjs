#!/usr/bin/env node
/**
 * fetch-dashboards.mjs — cache dashboard starter templates with offline assets.
 *
 * Designed to be easily extensible: add new entries to `TEMPLATES` below and
 * re-run `npm run dashboards` (or `--slug <slug> --source <dir>`).
 *
 * For each dashboard template, this script:
 *   1. Clones the upstream repo (or reads --source <dir>)
 *   2. Copies the source tree into <cache>/dashboards/<slug>/source/
 *   3. Injects offline font bundles (Inter, Manrope woff2 + public/fonts/fonts.css)
 *      from frontend/node_modules/@fontsource-variable/* and patches index.html
 *      to remove Google Fonts CDN links
 *   4. Writes OFFLINE-SETUP.md and setup.sh inside the template
 *   5. Packages <slug>-offline.zip (`template.zip`) and `fonts.zip`
 *   6. Extracts metadata, file list, and cover screenshot into <cache>/dashboards/
 *
 * Usage:
 *   node scripts/fetch-dashboards.mjs
 *   node scripts/fetch-dashboards.mjs --slug shadcn-admin --source /path/to/shadcn-admin
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import {
  chmod,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CACHE_DIR, writeJsonAtomic } from "./lib/cache.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const FRONTEND_MODULES = join(ROOT, "frontend", "node_modules");
const DASHBOARDS_DIR = join(CACHE_DIR, "dashboards");

const argv = process.argv.slice(2);
const argVal = (name) => {
  const i = argv.lastIndexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
};

/**
 * Extensible dashboard template registry.
 * Add more templates here as needed.
 */
const TEMPLATES = [
  {
    slug: "shadcn-admin",
    name: "Shadcn Admin Dashboard",
    tagline: "Admin Dashboard UI crafted with Shadcn, Vite, and TanStack Router.",
    description:
      "Production-ready admin dashboard template with 10+ pages, light/dark mode, RTL support, Command-K global search, TanStack Table data grids, Recharts analytics, and custom UI components.",
    repo: "https://github.com/satnaing/shadcn-admin",
    coverPath: "public/images/shadcn-admin.png",
    framework: "React 19 + Vite + TanStack Router",
    styling: "Tailwind CSS v4 + shadcn/ui + Radix UI",
    fonts: ["inter", "manrope"],
    features: [
      "Light / Dark mode",
      "RTL support",
      "Global Command-K search",
      "Built-in collapsible Sidebar",
      "10+ ready-to-use pages",
      "TanStack Table & Query",
      "Recharts analytics",
      "Clerk auth routes (optional)",
    ],
    pages: [
      { path: "/", label: "Dashboard Overview" },
      { path: "/tasks", label: "Tasks (Data Table)" },
      { path: "/apps", label: "Apps Integrations" },
      { path: "/chats", label: "Chats" },
      { path: "/users", label: "Users Management" },
      { path: "/settings", label: "Settings (Profile, Account, Appearance, Notifications, Display)" },
      { path: "/help-center", label: "Help Center" },
      { path: "/sign-in", label: "Auth (Sign In, Sign Up, Forgot Password, OTP)" },
      { path: "/404", label: "Error Pages (401, 403, 404, 500, 503)" },
    ],
    offlineNotes: [
      "Self-hosted Inter & Manrope variable WOFF2 fonts bundled in public/fonts/",
      "index.html patched to load /fonts/fonts.css instead of fonts.googleapis.com",
      "Includes setup.sh and OFFLINE-SETUP.md for quick local/air-gapped installation",
    ],
  },
  {
    slug: "next-shadcn-dashboard-starter",
    name: "Next.js Shadcn Dashboard Starter",
    tagline: "Admin Dashboard Starter with Next.js 16 App Router, Shadcn UI, and TypeScript.",
    description:
      "Full-featured Next.js App Router dashboard starter with parallel-route analytics (@area_stats, @bar_stats, @pie_stats, @sales), Kanban drag-and-drop, TanStack Table + nuqs URL state, multi-step forms, AI chat, workspaces, and Clerk auth.",
    repo: "https://github.com/Kiranism/next-shadcn-dashboard-starter",
    coverPath: "public/shadcn-dashboard.png",
    framework: "Next.js 16 (App Router) + React 19",
    styling: "Tailwind CSS v4 + shadcn/ui + Base UI / Radix",
    fonts: ["inter", "google-sans-flex"],
    features: [
      "Next.js 16 App Router + Parallel Routes",
      "Kanban Board (@dnd-kit)",
      "TanStack Table + nuqs URL filters",
      "Multi-step & Sheet Forms (TanStack Form)",
      "AI Chat & Messaging views",
      "Multi-theme & Font Switcher",
      "KBar Command Palette (Cmd+K)",
      "Clerk Auth + Sentry (optional)",
    ],
    pages: [
      { path: "/dashboard/overview", label: "Overview (Parallel Route Analytics & Sales)" },
      { path: "/dashboard/product", label: "Products (TanStack Data Table + Detail)" },
      { path: "/dashboard/kanban", label: "Kanban Board (Drag & Drop)" },
      { path: "/dashboard/forms", label: "Forms (Basic, Multi-step, Advanced, Sheet)" },
      { path: "/dashboard/ai-chat", label: "AI Chat" },
      { path: "/dashboard/chat", label: "Team Chat" },
      { path: "/dashboard/users", label: "Users" },
      { path: "/dashboard/workspaces", label: "Workspaces & Billing" },
      { path: "/dashboard/notifications", label: "Notifications" },
      { path: "/auth/sign-in", label: "Auth (Sign In & Sign Up)" },
    ],
    offlineNotes: [
      "Self-hosted Inter & Google Sans Flex variable WOFF2 fonts bundled in public/fonts/fonts.css",
      "Copy env.example.txt to .env.local (Clerk & Sentry keys are optional for local UI dev)",
      "Includes setup.sh (auto-detects bun/pnpm/npm) and OFFLINE-SETUP.md",
    ],
  },
];

async function copyTree(src, dst) {
  let count = 0;
  await mkdir(dst, { recursive: true });
  for (const entry of await readdir(src, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "dist") continue;
    const s = join(src, entry.name);
    const d = join(dst, entry.name);
    if (entry.isDirectory()) {
      count += await copyTree(s, d);
    } else if (entry.isFile()) {
      await copyFile(s, d);
      count++;
    }
  }
  return count;
}

async function listFiles(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listFiles(full, base)));
    } else if (entry.isFile()) {
      const info = await stat(full);
      out.push({ path: relative(base, full), bytes: info.size });
    }
  }
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

async function bundleOfflineFonts(fontsDir, fontNames) {
  await mkdir(fontsDir, { recursive: true });
  const imports = [];
  const bundled = [];

  for (const family of fontNames) {
    const pkgDir = join(FRONTEND_MODULES, `@fontsource-variable`, family);
    if (!existsSync(pkgDir)) {
      console.warn(`  ! Missing @fontsource-variable/${family} in frontend/node_modules`);
      continue;
    }
    const famDir = join(fontsDir, family);
    await mkdir(famDir, { recursive: true });

    const sheets = [];
    for (const style of ["wght", "wght-italic"]) {
      const cssPath = join(pkgDir, `${style}.css`);
      if (!existsSync(cssPath)) continue;
      let css = (await readFile(cssPath, "utf8"))
        .replace(/(font-family:\s*'[^']+) Variable'/g, "$1'")
        .replace(/, url\(\.\/files\/[^)]+\.woff\) format\('woff'\)/g, "");
      for (const [, file] of css.matchAll(/url\(\.\/files\/([a-z0-9-]+\.woff2)\)/g)) {
        const srcFile = join(pkgDir, "files", file);
        if (existsSync(srcFile)) {
          await copyFile(srcFile, join(famDir, file));
        }
      }
      css = css.replaceAll("./files/", `./${family}/`);
      sheets.push(css);
    }

    if (sheets.length) {
      await writeFile(join(fontsDir, `${family}.css`), sheets.join("\n"), "utf8");
      imports.push(`@import "./${family}.css";`);
      bundled.push(family);
    }
  }

  await writeFile(join(fontsDir, "fonts.css"), imports.join("\n") + "\n", "utf8");
  return bundled;
}

function patchIndexHtmlOffline(html) {
  return html
    .replace(/\s*<link[^>]+fonts\.googleapis\.com[^>]*>\s*/gi, "\n")
    .replace(/\s*<link[^>]+fonts\.gstatic\.com[^>]*>\s*/gi, "\n")
    .replace(
      /<meta name="theme-color"/i,
      '<!-- Self-hosted offline fonts -->\n    <link rel="stylesheet" href="/fonts/fonts.css" />\n\n    <meta name="theme-color"',
    );
}

function buildOfflineDocs(tpl, pkg, bundledFonts) {
  const installCmd = existsSync(join(ROOT, "pnpm-lock.yaml")) ? "pnpm" : "npm";
  const setupSh = `#!/usr/bin/env bash
set -euo pipefail

echo "Setting up ${tpl.name} (offline-ready)..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm install
  echo "Done! Run: pnpm dev"
else
  npm install
  echo "Done! Run: npm run dev"
fi
`;

  const readme = `# ${tpl.name} — Offline Template Package

Source: ${tpl.repo}
Version: ${pkg?.version || "latest"}
License: ${pkg?.license || "MIT"}

## What's Included for Offline Use

- **Self-hosted Fonts** (\`public/fonts/fonts.css\`): ${bundledFonts.join(", ") || "none"} variable WOFF2 font faces.
- **Patched \`index.html\`**: Google Fonts CDN links (\`fonts.googleapis.com\` / \`fonts.gstatic.com\`) have been replaced with \`<link rel="stylesheet" href="/fonts/fonts.css" />\`.
- **Quick Setup Script**: Run \`./setup.sh\` to install dependencies.

## Quick Start

\`\`\`bash
# 1. Install dependencies (use your local npm/pnpm registry or offline cache if air-gapped)
pnpm install   # or: npm install

# 2. Start the development server
pnpm dev       # or: npm run dev

# 3. Build for production
pnpm build     # or: npm run build
\`\`\`

> Note: Clerk authentication routes under \`/clerk\` are optional and only active if \`VITE_CLERK_PUBLISHABLE_KEY\` is configured in \`.env\`. All standard dashboard routes (\`/\`, \`/tasks\`, \`/apps\`, \`/chats\`, \`/users\`, \`/settings\`) work out of the box with zero external services.
`;

  return { setupSh, readme, installCmd };
}

function makeZip(cwd, outZip, target = ".") {
  const res = spawnSync("zip", ["-rq", outZip, target], { cwd, stdio: "inherit" });
  if (res.status !== 0) throw new Error(`zip failed with status ${res.status}`);
}

async function processTemplate(tpl, customSource) {
  let sourceDir = customSource;
  let tempDir = null;

  if (!sourceDir) {
    tempDir = await mkdtemp(join(tmpdir(), `dashboard-${tpl.slug}-`));
    sourceDir = tempDir;
    console.log(`Cloning ${tpl.repo}...`);
    const res = spawnSync("git", ["clone", "--depth", "1", `${tpl.repo}.git`, sourceDir], {
      stdio: "inherit",
    });
    if (res.status !== 0) {
      await rm(tempDir, { recursive: true, force: true });
      throw new Error(`git clone failed for ${tpl.repo}`);
    }
  }

  try {
    const tplDir = join(DASHBOARDS_DIR, tpl.slug);
    const dstSource = join(tplDir, "source");
    await rm(tplDir, { recursive: true, force: true });
    await mkdir(dstSource, { recursive: true });

    const copied = await copyTree(sourceDir, dstSource);

    // Cover image
    const srcCover = join(sourceDir, tpl.coverPath);
    if (existsSync(srcCover)) {
      await copyFile(srcCover, join(tplDir, "cover.png"));
    }

    // Bundle offline fonts into source/public/fonts/
    const fontsDir = join(dstSource, "public", "fonts");
    const bundledFonts = await bundleOfflineFonts(fontsDir, tpl.fonts || []);

    // Patch index.html to use /fonts/fonts.css instead of Google Fonts CDN
    const indexHtmlPath = join(dstSource, "index.html");
    if (existsSync(indexHtmlPath)) {
      const origHtml = await readFile(indexHtmlPath, "utf8");
      await writeFile(indexHtmlPath, patchIndexHtmlOffline(origHtml), "utf8");
    }

    const pkg = existsSync(join(dstSource, "package.json"))
      ? JSON.parse(await readFile(join(dstSource, "package.json"), "utf8"))
      : {};

    const { setupSh, readme } = buildOfflineDocs(tpl, pkg, bundledFonts);
    await writeFile(join(dstSource, "setup.sh"), setupSh, "utf8");
    await chmod(join(dstSource, "setup.sh"), 0o755);
    await writeFile(join(dstSource, "OFFLINE-SETUP.md"), readme, "utf8");

    // Package downloadable ZIPs
    const templateZip = join(tplDir, "template.zip");
    const fontsZip = join(tplDir, "fonts.zip");
    makeZip(dstSource, templateZip, ".");
    if (bundledFonts.length) {
      makeZip(join(dstSource, "public"), fontsZip, "fonts");
    }

    const files = await listFiles(dstSource);
    const zipBytes = (await stat(templateZip)).size;
    const fontsZipBytes = existsSync(fontsZip) ? (await stat(fontsZip)).size : 0;

    const record = {
      slug: tpl.slug,
      name: tpl.name,
      tagline: tpl.tagline,
      description: tpl.description,
      repo: tpl.repo,
      version: pkg.version || "1.0.0",
      license: pkg.license || "MIT",
      framework: tpl.framework,
      styling: tpl.styling,
      fonts: bundledFonts,
      features: tpl.features || [],
      pages: tpl.pages || [],
      offlineNotes: tpl.offlineNotes || [],
      dependencies: Object.keys(pkg.dependencies || {}),
      devDependencies: Object.keys(pkg.devDependencies || {}),
      scripts: pkg.scripts || {},
      fileCount: files.length,
      zipBytes,
      fontsZipBytes,
      hasCover: existsSync(join(tplDir, "cover.png")),
      files,
    };

    await writeJsonAtomic(join(tplDir, "dashboard.json"), record);
    console.log(
      `Cached dashboard '${tpl.slug}': ${copied} source files, ${bundledFonts.length} offline fonts, ${(zipBytes / 1024 / 1024).toFixed(2)} MB zip`,
    );
    return record;
  } finally {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
}

async function run() {
  const onlySlug = argVal("--slug");
  const customSource = argVal("--source");
  const targets = onlySlug ? TEMPLATES.filter((t) => t.slug === onlySlug) : TEMPLATES;
  if (!targets.length) throw new Error(`Unknown dashboard slug: ${onlySlug}`);

  if (
    !customSource &&
    process.argv.includes("--if-missing") &&
    !process.argv.includes("--force") &&
    existsSync(join(DASHBOARDS_DIR, "index.json")) &&
    targets.every((t) => existsSync(join(DASHBOARDS_DIR, t.slug, "dashboard.json")) && existsSync(join(DASHBOARDS_DIR, t.slug, "template.zip")))
  ) {
    console.log(`Dashboards layer -> ${DASHBOARDS_DIR} (already cached; skipping due to --if-missing)`);
    return;
  }

  await mkdir(DASHBOARDS_DIR, { recursive: true });

  // Merge with any existing dashboards in index.json so adding one template keeps others
  const existingPath = join(DASHBOARDS_DIR, "index.json");
  const existing = existsSync(existingPath)
    ? JSON.parse(await readFile(existingPath, "utf8"))
    : { dashboards: [] };
  const bySlug = new Map((existing.dashboards || []).map((d) => [d.slug, d]));

  for (const tpl of targets) {
    const rec = await processTemplate(tpl, customSource);
    const { files: _files, dependencies: _deps, devDependencies: _devDeps, ...summary } = rec;
    bySlug.set(rec.slug, summary);
  }

  const dashboards = [...bySlug.values()];
  await writeJsonAtomic(existingPath, {
    updatedAt: new Date().toISOString(),
    total: dashboards.length,
    dashboards,
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
