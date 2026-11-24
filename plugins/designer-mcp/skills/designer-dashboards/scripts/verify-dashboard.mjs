#!/usr/bin/env node
/**
 * Designer Dashboards Adherence, A11y, RTL, Localization, Dependency & Security Verifier
 * Usage:
 *   node scripts/verify-dashboard.mjs <project-dir>
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { lintNavigation } from './lint-nav.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.next', 'dist', 'build', 'design-system'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node scripts/verify-dashboard.mjs <project-dir>');
    process.exit(1);
  }
  const root = path.resolve(target);
  const errors = [];
  const warnings = [];

  // 1. Design system parity, pure-black guard & WCAG AA contrast
  const dsDir = path.join(root, 'design-system');
  const requiredDs = ['DESIGN.md', 'theme.json', 'DESIGN.evidence.json', 'styles.css', '_ds_manifest.json', '_adherence.oxlintrc.json'];
  for (const f of requiredDs) {
    if (!fs.existsSync(path.join(dsDir, f))) {
      errors.push(`Missing design-system/${f}`);
    }
  }
  const themeJsonPath = path.join(dsDir, 'theme.json');
  if (fs.existsSync(themeJsonPath)) {
    const rawTheme = fs.readFileSync(themeJsonPath, 'utf8');
    if (/#000000\b/i.test(rawTheme)) {
      errors.push('Pure black (#000000) detected in design-system/theme.json — use dark slate/navy instead.');
    }
    try {
      execFileSync(process.execPath, [path.join(__dirname, 'build-tokens.mjs'), dsDir, '--check'], { stdio: 'pipe' });
    } catch (e) {
      errors.push(`Design token check failed: ${e.stderr?.toString().trim() || e.message}`);
    }
  }

  // 2. Hygiene files (.env.example, committed .env / SQLite DBs, locales key parity)
  if (!fs.existsSync(path.join(root, '.env.example'))) {
    errors.push('Missing .env.example (every secret must be documented via env vars).');
  }
  if (fs.existsSync(path.join(root, '.env')) || fs.existsSync(path.join(root, '.env.staging'))) {
    warnings.push('Committed .env / .env.staging detected — verify it is gitignored and contains no live secrets.');
  }
  for (const dbRel of ['prisma/dev.db', 'src/prisma/dev.db', 'database/database.sqlite']) {
    if (fs.existsSync(path.join(root, dbRel))) {
      warnings.push(`Local SQLite database (${dbRel}) present — do not commit dev databases containing tokens or users.`);
    }
  }
  const localesDir = path.join(root, 'locales');
  if (!fs.existsSync(path.join(localesDir, 'ar.json'))) {
    warnings.push('Missing locales/ar.json (recommended Arabic RTL test locale).');
  } else if (fs.existsSync(path.join(localesDir, 'en.json'))) {
    const enKeys = Object.keys(JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'))).sort();
    for (const file of fs.readdirSync(localesDir).filter((f) => f.endsWith('.json') && f !== 'en.json')) {
      const otherKeys = Object.keys(JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'))).sort();
      const missing = enKeys.filter((k) => !otherKeys.includes(k));
      if (missing.length > 0) {
        errors.push(`Locale ${file} is missing keys present in en.json: ${missing.join(', ')}`);
      }
    }
  }

  // 2b. Unified Navigation IR validation
  const navConfigPath = path.join(root, 'src', 'configs', 'navigation.config.ts');
  if (!fs.existsSync(navConfigPath)) {
    errors.push('Missing src/configs/navigation.config.ts — the nav IR must be the single source for routes, breadcrumbs, titles, and RBAC.');
  } else {
    const navSrc = fs.readFileSync(navConfigPath, 'utf8');
    // Walk each `type: 'item'` object and require `path` + `translateKey` on it.
    for (const match of navSrc.matchAll(/type:\s*'item'/g)) {
      // Backward scan: find the opening `{` of the enclosing object literal.
      let start = match.index;
      let depth = 0;
      while (start >= 0) {
        if (navSrc[start] === '}') depth++;
        if (navSrc[start] === '{') {
          if (depth === 0) break;
          depth--;
        }
        start--;
      }
      if (start < 0) continue; // malformed source; not a lint target
      // Forward scan from the opening brace to its matching close.
      let inner = 0;
      let end = start;
      for (let i = start; i < navSrc.length; i++) {
        if (navSrc[i] === '{') inner++;
        if (navSrc[i] === '}') {
          inner--;
          if (inner === 0) {
            end = i + 1;
            break;
          }
        }
      }
      const item = navSrc.slice(start, end);
      if (!/\bpath:\s*['"]/.test(item)) {
        errors.push('navigation.config.ts: an item with `type: \'item\'` is missing its `path`.');
      }
      if (!/\btranslateKey:\s*['"]/.test(item)) {
        errors.push('navigation.config.ts: an item is missing its `translateKey` i18n key.');
      }
    }
    // Every translateKey in the nav IR must exist in en.json.
    const enJsonPath = path.join(root, 'locales', 'en.json');
    if (fs.existsSync(enJsonPath)) {
      const enKeys = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));
      for (const match of navSrc.matchAll(/translateKey:\s*'([^']+)'/g)) {
        if (!(match[1] in enKeys)) {
          errors.push(`navigation.config.ts uses translateKey '${match[1]}' that is missing from locales/en.json.`);
        }
      }
    }
  }

  // 2c. Navigation IR & Modern Web Guidance lint (duplicate keys, JSX icons, DOM cloneNode, popover/anchor-positioning rules)
  const navLint = lintNavigation(root);
  errors.push(...navLint.errors);
  warnings.push(...navLint.warnings);

  // 3. Single-engine dependency hygiene
  const pkgPath = path.join(root, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    const depNames = Object.keys(allDeps);

    const chartLibs = ['apexcharts', 'chart.js', 'echarts', 'recharts'].filter((d) => depNames.includes(d));
    if (chartLibs.length > 1) errors.push(`Multiple chart engines detected (${chartLibs.join(', ')}). Keep one.`);

    const toastLibs = ['sonner', 'react-toastify', 'notistack', 'sweetalert2', 'vue3-toastify'].filter((d) => depNames.includes(d));
    if (toastLibs.length > 1) errors.push(`Multiple toast libraries detected (${toastLibs.join(', ')}). Keep one.`);

    const iconLibs = ['lucide-react', 'lucide-vue-next', 'lucide-angular', '@tabler/icons-react', '@remixicon/react', '@phosphor-icons/react', '@iconify/react', 'react-icons', 'bootstrap-icons'].filter((d) => depNames.includes(d));
    if (iconLibs.length > 1) errors.push(`Multiple icon libraries detected (${iconLibs.join(', ')}). Keep one primary set.`);

    const mapLibs = ['leaflet', 'mapbox-gl', 'react-simple-maps'].filter((d) => depNames.includes(d));
    if (mapLibs.length > 1) errors.push(`Multiple map libraries detected (${mapLibs.join(', ')}). Keep one.`);

    const tableLibs = ['@tanstack/react-table', '@tanstack/vue-table', 'datatables.net', 'tabulator-tables'].filter((d) => depNames.includes(d));
    if (tableLibs.length > 1) errors.push(`Multiple table libraries detected (${tableLibs.join(', ')}). Keep one.`);

    const formLibs = ['react-hook-form', '@tanstack/react-form', 'formik'].filter((d) => depNames.includes(d));
    if (formLibs.length > 1) errors.push(`Multiple form engines detected (${formLibs.join(', ')}). Keep one.`);

    const stateLibs = ['zustand', 'redux', '@reduxjs/toolkit'].filter((d) => depNames.includes(d));
    if (stateLibs.length > 1) errors.push(`Multiple state engines detected (${stateLibs.join(', ')}). Keep one.`);

    const dndLibs = ['@dnd-kit/core', 'dragula', 'sortablejs', 'react-beautiful-dnd'].filter((d) => depNames.includes(d));
    if (dndLibs.length > 1) errors.push(`Multiple DnD libraries detected (${dndLibs.join(', ')}). Keep one.`);

    const dateLibs = ['dayjs', 'date-fns', 'luxon'].filter((d) => depNames.includes(d));
    if (dateLibs.length > 1) warnings.push(`Multiple date libraries detected (${dateLibs.join(', ')}). Prefer dayjs only.`);

    if (depNames.includes('moment')) errors.push('Legacy moment.js detected. Use dayjs instead.');
    if (depNames.includes('jquery')) warnings.push('jQuery detected — avoid mixing jQuery plugins in modern dashboards.');
  }

  // 4. Source code scan: raw hex, unauthorized font families, physical RTL classes, iconOnly without aria-label, hardcoded secrets, XSS/eval/client-secret leaks
  const manifestPath = path.join(dsDir, '_ds_manifest.json');
  let adherencePolicy = { forbidRawHexInSrc: true, allowedFontFamilies: [] };
  if (fs.existsSync(manifestPath)) {
    try {
      const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (m.adherence) adherencePolicy = { ...adherencePolicy, ...m.adherence };
    } catch {
      // malformed manifest is already caught by build-tokens --check
    }
  }
  const allowedFontTokens = new Set(
    (adherencePolicy.allowedFontFamilies || [])
      .flatMap((f) => String(f).split(','))
      .map((s) => s.replace(/['"]/g, '').trim().toLowerCase())
      .filter(Boolean),
  );
  const genericFonts = new Set([
    'inherit', 'initial', 'unset', 'sans-serif', 'serif', 'monospace', 'system-ui',
    '-apple-system', 'blinkmacsystemfont', 'ui-sans-serif', 'ui-serif', 'ui-monospace',
    'segoe ui', 'roboto', 'arial', 'helvetica', 'noto sans',
  ]);

  const srcFiles = walk(path.join(root, 'src')).filter((f) => /\.(tsx?|jsx?|vue|css|html)$/.test(f));
  const rawHexRe = /#[0-9a-fA-F]{6}\b/;
  const fontFamilyDeclRe = /font-family\s*:\s*([^;}{]+);/gi;
  const physicalRtlRe = /\b(ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r)-[a-z0-9[\].]+\b|\btext-(left|right)\b/;
  const cssPhysicalRtlRe = /\b(margin-left|margin-right|padding-left|padding-right|border-left|border-right)\s*:|text-align\s*:\s*(left|right)\b/;
  const googleFontsRe = /fonts\.googleapis\.com/;
  const secretRe = /(AIza[0-9A-Za-z_-]{35}|sk-(?:proj-|svcacct-|ant-)?[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{36})/;
  const clientSecretEnvRe = /\b(NEXT_PUBLIC_|VITE_)[A-Z0-9_]*(SERVICE_ROLE|SECRET|PRIVATE_KEY|DATABASE_URL|GEMINI_API_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY|AI_API_KEY|GROQ_API_KEY|MISTRAL_API_KEY|COHERE_API_KEY|OPENROUTER_API_KEY|TOGETHER_API_KEY|XAI_API_KEY)\b/;
  const clientLlmSdkRe = /from\s+['"](@google\/generative-ai|@google\/genai|openai|@anthropic-ai\/sdk)['"]/;
  const dangerouslyAllowBrowserRe = /\bdangerouslyAllowBrowser\s*:\s*true\b/;
  const evalRe = /\b(eval|new Function)\s*\(/;
  const htmlSinkRe = /(dangerouslySetInnerHTML|v-html|\[innerHTML\]|insertAdjacentHTML|\{@html)/;
  const targetBlankRe = /target\s*=\s*["']_blank["'][^>]*>/g;
  const iconOnlyBtnRe = /<(?:Button|rd-button)\b(?:[^>=]|=[^>]|=>)*\b(?:iconOnly|icon-only)\b(?:[^>=]|=[^>]|=>)*>/g;
  const directApexRe = /from\s+['"](react-apexcharts|vue3-apexcharts|apexcharts)['"]/;

  const contextFiles = srcFiles.filter((f) => /src\/contexts?\/.*(Context|Provider)\.(tsx?|jsx?)$/.test(f));
  if (contextFiles.length > 3) {
    warnings.push(`Detected ${contextFiles.length} React Context files in src/context(s)/ — prefer scoped Zustand micro-stores over Context pyramids.`);
  }

  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const rel = path.relative(root, file);
    const cssBody = rel.endsWith('.css') ? content.replace(/\/\*[\s\S]*?\*\//g, '') : content;
    if (
      directApexRe.test(content) &&
      !/(ChartWrapper|ChartCard|LiveChart|chartPresets)\.(tsx|ts|vue)$/.test(rel) &&
      !/(chart-wrapper|live-chart)\.component\.ts$/.test(rel) &&
      !/chart-presets\.ts$/.test(rel)
    ) {
      warnings.push(`Direct ApexCharts import in ${rel} — render charts through <ChartWrapper> or <LiveChart> for theme/RTL/a11y parity.`);
    }
    if (adherencePolicy.forbidRawHexInSrc && rawHexRe.test(cssBody)) {
      warnings.push(`Raw hex literal in ${rel} — use CSS variables from design-system/styles.css.`);
    }
    if (rel.endsWith('.css') && allowedFontTokens.size > 0) {
      for (const m of cssBody.matchAll(fontFamilyDeclRe)) {
        const val = m[1].trim();
        if (val.includes('var(')) continue;
        const primary = val.split(',')[0].replace(/['"]/g, '').trim().toLowerCase();
        if (primary && !genericFonts.has(primary) && !allowedFontTokens.has(primary)) {
          warnings.push(`Unauthorized font-family "${primary}" in ${rel} — use var(--font-sans) / var(--font-mono) from design-system/theme.json.`);
        }
      }
    }
    if (physicalRtlRe.test(content)) warnings.push(`Physical RTL-breaking utility in ${rel} — use logical properties (ms-/me-/ps-/pe-/border-s-/border-e-/text-start/text-end).`);
    if (rel.endsWith('.css') && cssPhysicalRtlRe.test(cssBody)) warnings.push(`Physical CSS directional property in ${rel} — use CSS logical properties (margin-inline-start, padding-inline-end, text-align: start).`);
    if (googleFontsRe.test(content)) warnings.push(`External Google Fonts CDN reference in ${rel} — use self-hosted woff2 fonts in public/fonts/.`);
    if (/src\/app\/.*\/page\.tsx$/.test(rel) && /^\s*['"]use client['"]/.test(content)) {
      warnings.push(`Next.js page ${rel} has 'use client' — prefer async Server Component + Client Island.`);
    }
    if (secretRe.test(content)) errors.push(`Possible hardcoded API key/secret in ${rel}!`);
    if (clientSecretEnvRe.test(content)) errors.push(`Server secret exposed via NEXT_PUBLIC_/VITE_ prefix in ${rel}!`);
    if (dangerouslyAllowBrowserRe.test(content)) errors.push(`dangerouslyAllowBrowser: true exposes AI API keys to the browser in ${rel}!`);
    if (/^\s*['"]use client['"]/.test(content) && clientLlmSdkRe.test(content)) {
      errors.push(`Client component ${rel} imports an LLM SDK directly — proxy AI calls through a server Route Handler (/api/ai/*).`);
    }
    if (evalRe.test(content)) errors.push(`Unsafe dynamic code execution (eval/new Function) in ${rel}!`);
    if (htmlSinkRe.test(content) && !/(DOMPurify|sanitize|FOUC_THEME_SCRIPT)/i.test(content)) {
      warnings.push(`Unsanitized HTML sink in ${rel} — wrap dynamic HTML with DOMPurify.sanitize().`);
    }
    for (const tag of content.match(targetBlankRe) || []) {
      if (!/rel\s*=\s*["'][^"']*noopener/.test(tag)) {
        warnings.push(`target="_blank" without rel="noopener noreferrer" in ${rel}.`);
      }
    }

    const matches = content.match(iconOnlyBtnRe) || [];
    for (const tag of matches) {
      if (!/aria-label\s*=/.test(tag)) {
        errors.push(`Icon-only <Button iconOnly> missing aria-label in ${rel}.`);
      }
    }
  }

  console.log(`\nDesigner Dashboards Audit: ${root}`);
  console.log(`  Errors:   ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  for (const e of errors) console.error(`  [ERROR] ${e}`);
  for (const w of warnings) console.warn(`  [WARN]  ${w}`);

  if (errors.length > 0) process.exit(1);
  console.log('PASSED: Dashboard meets Designer Dashboards adherence, a11y, RTL, i18n & hygiene gates.\n');
}

main();
