#!/usr/bin/env node
/**
 * Designer Dashboards Navigation IR & Modern Web Guidance Linter
 * Checks Nav IR schema hygiene, single-tree discipline, RTL logical CSS,
 * and modern-web-guidance CSS/JS/a11y rules (Popover API, Anchor Positioning,
 * @starting-style, <dialog> drawers, and site-nav semantics).
 *
 * Usage:
 *   node scripts/lint-nav.mjs <project-dir-or-file>
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function walk(target, files = []) {
  if (!fs.existsSync(target)) return files;
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (['node_modules', '.git', '.next', 'dist', 'build', 'design-system'].includes(entry.name)) continue;
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

export function lintNavigation(targetPath) {
  const root = path.resolve(targetPath);
  const errors = [];
  const warnings = [];
  const isDir = fs.existsSync(root) && fs.statSync(root).isDirectory();

  // 1. Nav IR config checks (when linting a project or template directory)
  if (isDir) {
    const navCandidates = [
      path.join(root, 'src', 'configs', 'navigation.config.ts'),
      path.join(root, 'configs', 'navigation.config.ts'),
    ];
    const navConfigPath = navCandidates.find((p) => fs.existsSync(p));
    if (navConfigPath) {
      const navSrc = fs.readFileSync(navConfigPath, 'utf8');

      // Duplicate key detection
      const seenKeys = new Map();
      for (const match of navSrc.matchAll(/\bkey:\s*['"]([^'"]+)['"]/g)) {
        const key = match[1];
        seenKeys.set(key, (seenKeys.get(key) || 0) + 1);
      }
      for (const [key, count] of seenKeys.entries()) {
        if (count > 1) {
          errors.push(`[nav/duplicate-key] navigation.config.ts defines duplicate key '${key}' (${count}x).`);
        }
      }

      // JSX icon in config (must be string registry key)
      if (/\bicon:\s*</.test(navSrc)) {
        errors.push('[nav/jsx-icon] navigation.config.ts passes JSX to `icon` — use an IconRegistry string key instead.');
      }

      // Contradictory activeUrl + activeOptions.exact
      if (/activeUrl:\s*['"][^'"]+['"][\s\S]{0,120}exact:\s*true|exact:\s*true[\s\S]{0,120}activeUrl:\s*['"]/.test(navSrc)) {
        warnings.push('[nav/contradictory-active] `activeUrl` combined with `activeOptions.exact: true` in navigation.config.ts — verify intent.');
      }
    }

    // Duplicated horizontal nav config check
    const allProjectFiles = walk(path.join(root, 'src'));
    for (const file of allProjectFiles) {
      if (/(horizontalMenuData|Menudata|horizontal-nav\.config)\.(tsx?|jsx?)$/i.test(file)) {
        warnings.push(`[nav/duplicate-tree] Separate horizontal menu file (${path.relative(root, file)}) detected — derive horizontal items from navigation.config.ts via getHorizontalNav().`);
      }
    }
  }

  // 2. Source & markup scan (modern-web-guidance + 17-template anti-patterns)
  const scanRoot = isDir && fs.existsSync(path.join(root, 'src')) ? path.join(root, 'src') : root;
  const files = walk(scanRoot).filter((f) => /\.(tsx?|jsx?|vue|html|css|scss)$/.test(f));

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const rel = isDir ? path.relative(root, file) : path.basename(file);
    const isNavOrMenu = /(nav|menu|shell|drawer|header|sidebar)/i.test(rel);

    // DOM cloneNode in nav/menu anti-pattern
    if (isNavOrMenu && /\.cloneNode\s*\(/.test(content)) {
      errors.push(`[nav/dom-clone] ${rel} uses DOM cloneNode() — use declarative ResizeObserver state instead.`);
    }

    // <details>/<summary> inside <nav> (modern-web-guidance `navbar` rule)
    if (/<nav\b[\s\S]*?<details\b/i.test(content)) {
      warnings.push(`[mwg/details-in-nav] ${rel} uses <details>/<summary> inside <nav> — use <button aria-expanded aria-controls> instead.`);
    }

    // role="menubar" / role="menu" on site navigation <nav> (modern-web-guidance `navbar` rule)
    if (/<nav\b[^>]*>[\s\S]*?role=["'](menubar|menu)["']/i.test(content) && !/role=["']menu["'][^>]*\bflyout\b/i.test(content)) {
      warnings.push(`[mwg/menubar-in-site-nav] ${rel} places role="menu"/"menubar" inside <nav> — site navigation links should stay in Tab order without ARIA menu roles.`);
    }

    // transition: ... allow-discrete shorthand bug (modern-web-guidance `navbar`/`menu` rule)
    if (/transition\s*:[^;{}]*\ballow-discrete\b/.test(content)) {
      errors.push(`[mwg/allow-discrete-shorthand] ${rel} puts allow-discrete inside the \`transition\` shorthand — declare \`transition-behavior: allow-discrete;\` as a separate property.`);
    }

    // .popover IDL property assignment (modern-web-guidance `navbar` polyfill caveat)
    if (/\.popover\s*=/.test(content)) {
      warnings.push(`[mwg/popover-idl] ${rel} assigns the \`.popover\` IDL property — use setAttribute('popover', ...)/removeAttribute('popover') for polyfill compatibility.`);
    }

    // Unconditional @oddbird/popover-polyfill or @oddbird/css-anchor-positioning import
    if (/@oddbird\/popover-polyfill/.test(content) && !/HTMLElement\.prototype/.test(content)) {
      warnings.push(`[mwg/unconditional-polyfill] ${rel} imports @oddbird/popover-polyfill without \`Object.hasOwn(HTMLElement.prototype, 'popover')\` feature detection.`);
    }
    if (/@oddbird\/css-anchor-positioning/.test(content) && !/CSS\.supports\s*\(/.test(content)) {
      warnings.push(`[mwg/unconditional-polyfill] ${rel} imports @oddbird/css-anchor-positioning without \`CSS.supports('anchor-name: --a')\` feature detection.`);
    }

    // position-area without @supports guard (modern-web-guidance `viewport-aware-dropdowns` rule)
    if (/position-area\s*:/.test(content) && !/@supports\s*\(\s*position-area\s*:/.test(content)) {
      warnings.push(`[mwg/unscoped-position-area] ${rel} uses \`position-area\` without \`@supports (position-area: block-end)\` — unsupported browsers may strand the popover.`);
    }

    // Physical CSS directional properties in CSS/SCSS nav/layout files (RTL safety)
    if (/\.(css|scss|html)$/.test(rel) && isNavOrMenu) {
      const styleBlocks = rel.endsWith('.html')
        ? (content.match(/<style\b[^>]*>([\s\S]*?)<\/style>/gi) || []).join('\n')
        : content;
      if (/(?:^|[;{\s])(margin-left|margin-right|padding-left|padding-right)\s*:/m.test(styleBlocks)) {
        warnings.push(`[rtl/physical-css] ${rel} uses physical margin/padding-left/right — prefer logical properties (margin-inline-start/end, padding-inline-start/end).`);
      }
    }
  }

  return { errors, warnings };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node scripts/lint-nav.mjs <project-dir-or-file>');
    process.exit(1);
  }
  const { errors, warnings } = lintNavigation(target);
  console.log(`\nDesigner Dashboards Nav & Modern Web Linter: ${path.resolve(target)}`);
  console.log(`  Errors:   ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  for (const e of errors) console.error(`  [ERROR] ${e}`);
  for (const w of warnings) console.warn(`  [WARN]  ${w}`);
  if (errors.length > 0) process.exit(1);
  console.log('PASSED: Navigation IR and modern web guidance checks passed.\n');
}
