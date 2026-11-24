#!/usr/bin/env node
/**
 * Designer Dashboards OpenDesign Token Compiler & Contrast Verifier
 * Usage:
 *   node scripts/build-tokens.mjs <design-system-dir> [--check]
 *
 * Reads <dir>/theme.json and deterministically generates:
 *   - styles.css               (:root + [data-theme="dark"] + @theme bridge + focus/motion rules)
 *   - _ds_manifest.json        (token registry + WCAG 2.1 AA contrast audit)
 *   - _adherence.oxlintrc.json (OpenDesign-style lint contract)
 */

import fs from 'node:fs';
import path from 'node:path';

function hexToRgb(hex) {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }) {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  return '#' + [r, g, b].map((n) => clamp(n).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function adjustLightness(hex, delta) {
  const { r, g, b } = hexToRgb(hex);
  const factor = delta < 0 ? 1 + delta : delta;
  if (delta < 0) {
    return rgbToHex({ r: r * factor, g: g * factor, b: b * factor });
  }
  return rgbToHex({
    r: r + (255 - r) * factor,
    g: g + (255 - g) * factor,
    b: b + (255 - b) * factor,
  });
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const bright = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return Number(((bright + 0.05) / (dark + 0.05)).toFixed(2));
}

function buildOutputs(theme) {
  const tokens = {};
  const lightLines = [];
  const darkLines = [];
  const twThemeLines = [];

  // Semantic colors + programmatic 6-subtoken soft/tonal ladder
  tokens['--color-on-solid'] = '#FFFFFF';
  lightLines.push('  --color-on-solid: #FFFFFF;');
  twThemeLines.push('  --color-on-solid: var(--color-on-solid);');

  for (const [role, hex] of Object.entries(theme.colors.semantic)) {
    const rgb = hexToRgb(hex);
    const rgbStr = `${rgb.r} ${rgb.g} ${rgb.b}`;

    const entries = [
      [`--color-${role}`, hex],
      [`--color-${role}-rgb`, rgbStr],
      [`--color-${role}-surface`, `color-mix(in oklch, ${hex} 12%, transparent)`],
      [`--color-${role}-border`, `color-mix(in oklch, ${hex} 28%, transparent)`],
      [`--color-${role}-hover`, `color-mix(in oklch, ${hex} 92%, black)`],
      [`--color-${role}-pressed`, `color-mix(in oklch, ${hex} 85%, black)`],
      [`--color-${role}-focus`, `color-mix(in oklch, ${hex} 26%, transparent)`],
    ];
    for (const [k, v] of entries) {
      tokens[k] = v;
      lightLines.push(`  ${k}: ${v};`);
    }
    darkLines.push(`  --color-${role}-surface: color-mix(in oklch, ${hex} 18%, transparent);`);
    darkLines.push(`  --color-${role}-border: color-mix(in oklch, ${hex} 36%, transparent);`);
    twThemeLines.push(`  --color-${role}: var(--color-${role});`);
    twThemeLines.push(`  --color-${role}-surface: var(--color-${role}-surface);`);
  }

  // Neutrals & surfaces (light + dark)
  const surfaceMap = [
    ['canvas', 'canvas'],
    ['surface', 'surface'],
    ['surface-elevated', 'surfaceElevated'],
    ['border', 'border'],
    ['text', 'text'],
    ['text-muted', 'textMuted'],
  ];
  for (const [cssKey, objKey] of surfaceMap) {
    const lv = theme.colors.light[objKey];
    const dv = theme.colors.dark[objKey];
    tokens[`--color-${cssKey}`] = lv;
    lightLines.push(`  --color-${cssKey}: ${lv};`);
    darkLines.push(`  --color-${cssKey}: ${dv};`);
    twThemeLines.push(`  --color-${cssKey}: var(--color-${cssKey});`);
  }
  tokens['--color-surface-subtle'] = 'color-mix(in oklch, var(--color-text) 5%, var(--color-surface))';
  lightLines.push('  --color-surface-subtle: color-mix(in oklch, var(--color-text) 5%, var(--color-surface));');
  darkLines.push('  --color-surface-subtle: color-mix(in oklch, var(--color-text) 8%, var(--color-surface));');
  twThemeLines.push('  --color-surface-subtle: var(--color-surface-subtle);');

  // 10-hue categorical chart palette (+ RGB triplets & Tailwind @theme bridge)
  theme.colors.chart.forEach((hex, idx) => {
    const k = `--chart-${idx + 1}`;
    const { r, g, b } = hexToRgb(hex);
    tokens[k] = hex;
    lightLines.push(`  ${k}: ${hex};`);
    lightLines.push(`  ${k}-rgb: ${r} ${g} ${b};`);
    twThemeLines.push(`  ${k}: var(${k});`);
  });

  // Chart chrome tokens & 5-step sequential choropleth ramp derived from primary
  const primaryHex = theme.colors.semantic.primary;
  const seqStepsLight = [0.75, 0.5, 0.25, 0, -0.22];
  const seqStepsDark = [-0.45, -0.22, 0, 0.22, 0.45];
  seqStepsLight.forEach((delta, idx) => {
    const k = `--chart-seq-${idx + 1}`;
    const hex = adjustLightness(primaryHex, delta);
    tokens[k] = hex;
    lightLines.push(`  ${k}: ${hex};`);
    darkLines.push(`  ${k}: ${adjustLightness(primaryHex, seqStepsDark[idx])};`);
    twThemeLines.push(`  ${k}: var(${k});`);
  });
  lightLines.push('  --chart-grid: var(--color-border);');
  lightLines.push('  --chart-tooltip-bg: var(--color-surface-elevated);');
  lightLines.push('  --chart-tooltip-border: var(--color-border);');
  tokens['--chart-grid'] = 'var(--color-border)';
  tokens['--chart-tooltip-bg'] = 'var(--color-surface-elevated)';
  tokens['--chart-tooltip-border'] = 'var(--color-border)';

  // Typography
  const typoEntries = [
    ['--font-sans', theme.typography.fontSans],
    ['--font-mono', theme.typography.fontMono],
    ['--text-2xs', '0.6875rem'],
    ['--text-xs', '0.75rem'],
    ['--text-sm', theme.typography.compactSize || '0.8125rem'],
    ['--text-base', theme.typography.baseSize || '0.875rem'],
    ['--text-lg', '1rem'],
    ['--text-xl', '1.25rem'],
    ['--text-2xl', '1.625rem'],
    ['--font-heading-weight', String(theme.typography.headingWeight || 600)],
  ];
  for (const [k, v] of typoEntries) {
    tokens[k] = v;
    lightLines.push(`  ${k}: ${v};`);
  }
  twThemeLines.push('  --font-sans: var(--font-sans);');
  twThemeLines.push('  --font-mono: var(--font-mono);');

  // Layout magic numbers
  const layoutEntries = [
    ['--space-unit', '0.25rem'],
    ['--bp-drawer', '1024px'],
    ['--color-scrim', 'rgba(15, 23, 42, 0.45)'],
    ['--color-primary-focus-ring', 'var(--color-primary-focus)'],
    ['--sidebar-width', theme.layout.sidebarWidth],
    ['--sidebar-collapsed-width', theme.layout.sidebarCollapsedWidth],
    ['--header-height', theme.layout.headerHeight],
    ['--content-max-width', theme.layout.contentMaxWidth],
    ['--space-gutter', theme.layout.gutter],
    ['--space-card-padding', theme.layout.cardPadding],
    ['--transition-layout', '240ms cubic-bezier(0.2, 0, 0, 1)'],
  ];
  for (const [k, v] of layoutEntries) {
    tokens[k] = v;
    lightLines.push(`  ${k}: ${v};`);
  }

  // Radius ladder
  for (const [step, val] of Object.entries(theme.radius)) {
    const k = `--radius-${step}`;
    tokens[k] = val;
    lightLines.push(`  ${k}: ${val};`);
    twThemeLines.push(`  ${k}: var(${k});`);
  }

  // Shadows (navy-tinted restrained; modal uses border + scrim without heavy shadow)
  const shadows = {
    '--shadow-sm': '0 2px 6px rgba(31, 45, 61, 0.05)',
    '--shadow-md': '0 4px 14px rgba(31, 45, 61, 0.07)',
    '--shadow-lg': '0 10px 28px rgba(31, 45, 61, 0.10)',
    '--shadow-modal': 'none',
  };
  for (const [k, v] of Object.entries(shadows)) {
    tokens[k] = v;
    lightLines.push(`  ${k}: ${v};`);
    twThemeLines.push(`  ${k}: var(${k});`);
  }
  darkLines.push('  --shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.22);');
  darkLines.push('  --shadow-md: 0 4px 14px rgba(0, 0, 0, 0.28);');
  darkLines.push('  --shadow-lg: 0 10px 28px rgba(0, 0, 0, 0.36);');

  // Z-index ladder
  for (const [layer, val] of Object.entries(theme.zIndex)) {
    const k = `--z-${layer}`;
    tokens[k] = String(val);
    lightLines.push(`  ${k}: ${val};`);
    twThemeLines.push(`  ${k}: var(${k});`);
  }

  const stylesCss = `/* Generated by designer-dashboards build-tokens.mjs — DO NOT EDIT DIRECTLY. Edit theme.json and re-run. */

@layer theme, base, vendor, mui, components, utilities;
@custom-variant dark (&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));

:root {
  color-scheme: light;
  --layout-header-height: var(--header-height);
  --space-boxed-width: 1440px;
  --space-narrow-width: 1280px;
${lightLines.join('\n')}
}

[data-theme="dark"],
.dark {
  color-scheme: dark;
${darkLines.join('\n')}
}

@theme inline {
  --breakpoint-2xl: 87.5rem;
  --breakpoint-3xl: 103.125rem;
${twThemeLines.join('\n')}
}

/* Card skin & density attribute contracts */
[data-card-style="bordered"] .rd-card {
  box-shadow: none !important;
  border-width: 1px;
}

[data-card-style="elevated"] .rd-card {
  box-shadow: var(--shadow-sm);
}

[data-card-style="borderless"] .rd-card {
  border-width: 0;
  box-shadow: var(--shadow-md);
}

[data-card-style="flat"] .rd-card {
  border-width: 0;
  box-shadow: none !important;
}

[data-card-style="glass"] .rd-card {
  background-color: color-mix(in oklch, var(--color-surface) 78%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--shadow-sm);
}

[data-density="compact"] {
  --space-card-padding: 1rem;
  --text-base: var(--text-sm);
}

/* Container-query & fixed-viewport app-shell helpers */
.rd-container {
  container-type: inline-size;
  margin-inline: auto;
  width: 100%;
}

[data-content-width="boxed"] .rd-container {
  max-width: var(--space-boxed-width);
}

[data-content-width="narrow"] .rd-container {
  max-width: var(--space-narrow-width);
}

.rd-content-fixed {
  height: calc(100dvh - var(--header-height));
  min-height: 540px;
  overflow: hidden;
}

/* Design-system ApexCharts skinning inside @layer vendor */
@layer vendor {
  .apexcharts-tooltip {
    background: var(--chart-tooltip-bg) !important;
    border-color: var(--chart-tooltip-border) !important;
    color: var(--color-text) !important;
    box-shadow: var(--shadow-md) !important;
    border-radius: var(--radius-md) !important;
    font-family: var(--font-sans) !important;
  }
  .apexcharts-tooltip-title {
    background: var(--color-canvas) !important;
    border-bottom-color: var(--chart-tooltip-border) !important;
    color: var(--color-text) !important;
    font-weight: var(--font-heading-weight) !important;
  }
  .apexcharts-xaxistooltip,
  .apexcharts-yaxistooltip {
    background: var(--chart-tooltip-bg) !important;
    border-color: var(--chart-tooltip-border) !important;
    color: var(--color-text) !important;
    border-radius: var(--radius-sm) !important;
  }
  .apexcharts-legend-text {
    color: var(--color-text-muted) !important;
    font-family: var(--font-sans) !important;
  }
  [dir="rtl"] .apexcharts-tooltip-marker {
    margin-inline-end: 0;
    margin-inline-start: 8px;
  }
}

/* Sidebar skin attribute contract */
[data-sidebar-skin="dark"] .rd-sidebar {
  background-color: ${theme.colors.dark.surface};
  color: ${theme.colors.dark.text};
  border-color: ${theme.colors.dark.border};
}

[data-sidebar-skin="brand"] .rd-sidebar {
  background-color: var(--color-primary);
  color: var(--color-on-solid);
  border-color: var(--color-primary-border);
}

[data-sidebar-skin="gradient"] .rd-sidebar {
  background-image: linear-gradient(180deg, var(--color-primary), color-mix(in oklch, var(--color-primary) 72%, ${theme.colors.dark.canvas}));
  color: var(--color-on-solid);
  border-color: var(--color-primary-border);
}

[data-sidebar-skin="transparent"] .rd-sidebar {
  background-color: transparent;
}

/* Navbar style & layout position attribute contracts */
[data-navbar-style="floating"] .rd-header {
  margin: 0.75rem 1.25rem 0;
  border-radius: var(--radius-lg);
  border-width: 1px;
  box-shadow: var(--shadow-sm);
}

[data-navbar-style="detached"] .rd-header {
  margin: 0.5rem 0.75rem 0;
  border-radius: var(--radius-md);
  border-width: 1px;
}

[data-navbar-style="blur"] .rd-header {
  background-color: color-mix(in oklch, var(--color-surface) 78%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

[data-layout-position="scrollable"] .rd-header {
  position: static;
}

/* Extended layout mode attribute contracts */
[data-layout="hover"] .rd-sidebar {
  width: var(--sidebar-collapsed-width);
  transition: width var(--transition-layout);
}
[data-layout="hover"] .rd-sidebar:hover {
  width: var(--sidebar-width);
}

[data-layout="frameless"] .rd-sidebar,
[data-layout="frameless"] .rd-header {
  border-color: transparent;
  box-shadow: none;
  background-color: transparent;
}

[data-layout="sidebarless"] .rd-sidebar {
  display: none;
}

[data-layout="compact-topbar"] .rd-header {
  --header-height: 48px;
}

[data-layout="content-overlay"] .rd-sidebar {
  position: fixed;
  inset-block: 0;
  inset-inline-start: 0;
  z-index: var(--z-drawer);
}

/* Global accessible focus-visible ring */
:focus-visible {
  outline: 2px solid var(--color-primary-focus-ring);
  outline-offset: 2px;
}

.rd-card-interactive {
  transition: box-shadow 180ms ease, border-color 180ms ease;
}
.rd-card-interactive:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-border);
}

/* High contrast & forced-colors safe fallbacks */
@media (prefers-contrast: more) {
  :root {
    --shadow-sm: none;
    --shadow-md: none;
  }
  .rd-card {
    border-width: 2px;
  }
}

@media (forced-colors: active) {
  :focus-visible {
    outline: 2px solid Highlight;
  }
}

/* Tabular numbers utility for KPIs and tables */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Directional shimmer skeleton */
@keyframes rd-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.rd-shimmer {
  background: linear-gradient(
    90deg,
    var(--color-canvas) 25%,
    var(--color-border) 50%,
    var(--color-canvas) 75%
  );
  background-size: 200% 100%;
  animation: rd-shimmer 1.4s ease-in-out infinite;
}

/* AI/Chat typing indicator dots */
@keyframes rd-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.typing-dots span {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: currentColor;
  animation: rd-bounce 1.2s infinite ease-in-out both;
}
.typing-dots span:nth-child(2) { animation-delay: 0.16s; }
.typing-dots span:nth-child(3) { animation-delay: 0.32s; }

/* Restrained staggered widget entrance */
@keyframes rd-fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.anim-in > * {
  animation: rd-fade-up 220ms ease-out both;
}
.anim-in > *:nth-child(2) { animation-delay: 35ms; }
.anim-in > *:nth-child(3) { animation-delay: 70ms; }
.anim-in > *:nth-child(4) { animation-delay: 105ms; }
.anim-in > *:nth-child(5) { animation-delay: 140ms; }
.anim-in > *:nth-child(6) { animation-delay: 175ms; }
.anim-in > *:nth-child(7) { animation-delay: 210ms; }
.anim-in > *:nth-child(8) { animation-delay: 245ms; }

@media (prefers-reduced-motion: reduce) {
  .anim-in > * {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
  .rd-shimmer,
  .typing-dots span {
    animation: none !important;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Print stylesheet for invoices and reports */
@media print {
  @page {
    size: A4;
    margin: 12mm;
  }
  [data-theme="dark"],
  .dark {
    color-scheme: light;
    --color-canvas: #FFFFFF;
    --color-surface: #FFFFFF;
    --color-surface-elevated: #FFFFFF;
    --color-text: #111827;
    --color-text-muted: #4B5563;
    --color-border: #D1D5DB;
  }
  .rd-sidebar,
  .rd-topbar,
  .no-print,
  .print\\:hidden {
    display: none !important;
  }
  thead {
    display: table-header-group;
  }
  body,
  main {
    background: #FFFFFF !important;
    color: #111827 !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .rd-card {
    box-shadow: none !important;
    break-inside: avoid;
  }
}
`;

  // WCAG 2.1 AA Contrast Checks (>= 4.5:1 normal text)
  const contrastPairs = [
    { pair: 'light.text on light.surface', fg: theme.colors.light.text, bg: theme.colors.light.surface, min: 4.5 },
    { pair: 'light.text on light.canvas', fg: theme.colors.light.text, bg: theme.colors.light.canvas, min: 4.5 },
    { pair: 'light.textMuted on light.surface', fg: theme.colors.light.textMuted, bg: theme.colors.light.surface, min: 4.5 },
    { pair: 'dark.text on dark.surface', fg: theme.colors.dark.text, bg: theme.colors.dark.surface, min: 4.5 },
    { pair: 'dark.text on dark.canvas', fg: theme.colors.dark.text, bg: theme.colors.dark.canvas, min: 4.5 },
    { pair: 'dark.textMuted on dark.surface', fg: theme.colors.dark.textMuted, bg: theme.colors.dark.surface, min: 4.5 },
    { pair: '#FFFFFF on semantic.primary', fg: '#FFFFFF', bg: theme.colors.semantic.primary, min: 4.5 },
    { pair: '#FFFFFF on semantic.error', fg: '#FFFFFF', bg: theme.colors.semantic.error, min: 4.5 },
  ].map((item) => {
    const ratio = contrastRatio(item.fg, item.bg);
    return { ...item, ratio, pass: ratio >= item.min };
  });

  const advisoryChecks = ['secondary', 'success', 'info', 'warning']
    .filter((role) => theme.colors.semantic[role])
    .map((role) => {
      const bg = theme.colors.semantic[role];
      const ratioWhite = contrastRatio('#FFFFFF', bg);
      const ratioDark = contrastRatio(theme.colors.light.text, bg);
      return {
        pair: `best-fg on semantic.${role}`,
        bestFg: ratioWhite >= ratioDark ? '#FFFFFF' : theme.colors.light.text,
        bg,
        ratio: Math.max(ratioWhite, ratioDark),
        passLargeUi: Math.max(ratioWhite, ratioDark) >= 3.0,
      };
    });

  const adherencePolicy = {
    forbidRawHexInSrc: true,
    forbidPureBlack: true,
    forbidPhysicalRtlClasses: ['ml-', 'mr-', 'pl-', 'pr-', 'text-left', 'text-right', 'left-', 'right-'],
    allowedFontFamilies: [theme.typography.fontSans, theme.typography.fontMono],
  };

  const manifest = {
    version: 1,
    name: theme.name,
    slug: theme.slug,
    tokenCount: Object.keys(tokens).length,
    tokens,
    adherence: adherencePolicy,
    contrastAudit: {
      target: 'WCAG 2.1 AA',
      allPassed: contrastPairs.every((c) => c.pass),
      checks: contrastPairs,
      advisorySemanticChecks: advisoryChecks,
    },
  };

  // Strictly schema-compliant OxLint config (adherence policy lives in _ds_manifest.json)
  const adherenceLint = {
    $schema: 'https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json',
    rules: {
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/no-autofocus': 'warn',
    },
  };

  return {
    stylesCss,
    manifestJson: JSON.stringify(manifest, null, 2) + '\n',
    adherenceJson: JSON.stringify(adherenceLint, null, 2) + '\n',
    contrastAudit: manifest.contrastAudit,
  };
}

function main() {
  const args = process.argv.slice(2);
  const checkMode = args.includes('--check');
  const targetDir = args.find((a) => !a.startsWith('--'));

  if (!targetDir) {
    console.error('Usage: node scripts/build-tokens.mjs <design-system-dir> [--check]');
    process.exit(1);
  }

  const absDir = path.resolve(targetDir);
  const themePath = path.join(absDir, 'theme.json');
  if (!fs.existsSync(themePath)) {
    console.error(`Missing theme.json at ${themePath}`);
    process.exit(1);
  }

  const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));
  const { stylesCss, manifestJson, adherenceJson, contrastAudit } = buildOutputs(theme);

  const files = [
    [path.join(absDir, 'styles.css'), stylesCss],
    [path.join(absDir, '_ds_manifest.json'), manifestJson],
    [path.join(absDir, '_adherence.oxlintrc.json'), adherenceJson],
  ];

  if (checkMode) {
    let failed = false;
    for (const [filePath, expected] of files) {
      if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== expected) {
        console.error(`DRIFT: ${path.basename(filePath)} is out of sync with theme.json. Run build-tokens.mjs.`);
        failed = true;
      }
    }
    if (!contrastAudit.allPassed) {
      console.error('CONTRAST FAILURES:');
      for (const c of contrastAudit.checks.filter((x) => !x.pass)) {
        console.error(`  - ${c.pair}: ${c.ratio}:1 (min ${c.min}:1)`);
      }
      failed = true;
    }
    if (failed) process.exit(1);
    console.log(`OK: ${theme.name} — ${Object.keys(JSON.parse(manifestJson).tokens).length} tokens in sync, all ${contrastAudit.checks.length} WCAG AA contrast checks passed.`);
    return;
  }

  for (const [filePath, content] of files) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  const overridesPath = path.join(absDir, 'user-overrides.css');
  if (!fs.existsSync(overridesPath)) {
    fs.writeFileSync(
      overridesPath,
      '/* Safe project-level CSS overrides imported after design-system/styles.css */\n',
      'utf8',
    );
  }

  const failedChecks = contrastAudit.checks.filter((x) => !x.pass);
  console.log(`Generated styles.css, _ds_manifest.json, _adherence.oxlintrc.json for "${theme.name}" (${Object.keys(JSON.parse(manifestJson).tokens).length} tokens).`);
  if (failedChecks.length > 0) {
    console.warn(`WARNING: ${failedChecks.length} WCAG AA contrast check(s) failed:`);
    for (const c of failedChecks) {
      console.warn(`  - ${c.pair}: ${c.ratio}:1 (min ${c.min}:1)`);
    }
    process.exit(2);
  }
  console.log(`All ${contrastAudit.checks.length} WCAG 2.1 AA contrast checks passed.`);
}

main();
