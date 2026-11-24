#!/usr/bin/env node
/**
 * Designer Dashboards Starter Scaffolder
 * Usage:
 *   node scripts/scaffold-starter.mjs \
 *     --starter nextjs-tailwind \
 *     --stack nextjs-shadcn-enterprise \
 *     --name my-admin \
 *     --out ./my-admin \
 *     --pm pnpm \
 *     --hosting vercel \
 *     --preset saas-violet
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const opts = {
    starter: 'nextjs-tailwind',
    starterExplicit: false,
    stack: '',
    name: 'my-dashboard',
    out: '',
    pm: 'pnpm',
    hosting: 'vercel',
    preset: 'saas-violet',
    mode: 'demo',
    backend: 'mock',
    allFonts: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === '--all-fonts') {
      opts.allFonts = true;
    } else if (key.startsWith('--') && argv[i + 1]) {
      const name = key.slice(2);
      opts[name] = argv[++i];
      if (name === 'starter') opts.starterExplicit = true;
    }
  }
  if (!opts.out) {
    opts.out = path.resolve(process.cwd(), opts.name);
  } else {
    opts.out = path.resolve(opts.out);
  }
  return opts;
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  let stack = null;
  if (opts.stack) {
    const stackPath = path.join(REPO_ROOT, 'templates', 'tech-stacks', `${opts.stack}.json`);
    if (!fs.existsSync(stackPath)) {
      const available = fs
        .readdirSync(path.join(REPO_ROOT, 'templates', 'tech-stacks'))
        .filter((f) => f.endsWith('.json') && f !== 'catalog.json')
        .map((f) => f.replace(/\.json$/, ''))
        .sort()
        .join(', ');
      console.error(`Unknown tech stack "${opts.stack}". Available: ${available}`);
      process.exit(1);
    }
    stack = JSON.parse(fs.readFileSync(stackPath, 'utf8'));
    if (!opts.starterExplicit && stack.starter) {
      opts.starter = stack.starter;
    }
  }

  const starterPath = path.join(REPO_ROOT, 'templates', 'starters', opts.starter, 'starter.json');
  const presetPath = path.join(REPO_ROOT, 'templates', 'design-presets', `${opts.preset}.json`);

  if (!fs.existsSync(starterPath)) {
    const availableStarters = fs
      .readdirSync(path.join(REPO_ROOT, 'templates', 'starters'), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()
      .join(', ');
    console.error(`Unknown starter "${opts.starter}". Available: ${availableStarters}`);
    process.exit(1);
  }
  if (!fs.existsSync(presetPath)) {
    const available = fs
      .readdirSync(path.join(REPO_ROOT, 'templates', 'design-presets'))
      .filter((f) => f.endsWith('.json') && f !== 'catalog.json')
      .map((f) => f.replace(/\.json$/, ''))
      .sort()
      .join(', ');
    console.error(`Unknown preset "${opts.preset}". Available: ${available}`);
    process.exit(1);
  }

  const starter = JSON.parse(fs.readFileSync(starterPath, 'utf8'));
  const preset = JSON.parse(fs.readFileSync(presetPath, 'utf8'));
  const out = opts.out;

  // 1. package.json
  const pkg = {
    name: opts.name,
    version: '0.1.0',
    private: true,
    packageManager: opts.pm === 'pnpm' ? 'pnpm@12.21.0' : opts.pm === 'bun' ? 'bun@1.4.5' : undefined,
    scripts: stack?.scripts || starter.scripts,
    dependencies: stack?.dependencies || starter.dependencies,
    devDependencies: stack?.devDependencies || starter.devDependencies,
  };
  if (stack?.tooling?.husky) {
    pkg['lint-staged'] = {
      '*.{ts,tsx,js,jsx}': ['oxlint', 'oxfmt --write'],
    };
  }
  writeFile(path.join(out, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

  // 2. OpenDesign package (design-system/)
  const dsDir = path.join(out, 'design-system');
  const designMd = `---
version: alpha
name: ${preset.name}
colors:
  primary: "${preset.colors.semantic.primary}"
  canvas: "${preset.colors.light.canvas}"
  surface: "${preset.colors.light.surface}"
  text: "${preset.colors.light.text}"
typography:
  sans: "${preset.typography.fontSans}"
  mono: "${preset.typography.fontMono}"
  baseSize: "${preset.typography.baseSize}"
spacing:
  gutter: "${preset.layout.gutter}"
  cardPadding: "${preset.layout.cardPadding}"
rounded:
  base: "${preset.radius.md}"
---

# ${preset.name} — Dashboard Design System

${preset.description}

## Role Rules

- **Primary (\`${preset.colors.semantic.primary}\`):** Primary CTAs, active nav indicator, and \`:focus-visible\` ring only.
- **Soft/Tonal Surfaces:** Programmatically derived via \`--color-*-surface\` for KPI icon chips, tonal buttons, and inline alerts.
- **No Pure Black:** Light body text uses slate (\`${preset.colors.light.text}\`); dark canvas uses stepped navy/slate (\`${preset.colors.dark.canvas}\` / \`${preset.colors.dark.surface}\`).
- **Accessibility:** WCAG 2.1 AA contrast enforced via \`npm run tokens:check\`.
`;
  const evidenceJson = {
    version: 1,
    source: preset.provenance.source,
    theme: {
      reference: preset.provenance.source,
      name: preset.name,
      via: 'designer-dashboards-preset',
    },
    tokenOrigins: {
      'colors.semantic.primary': { from: 'preset', path: `${preset.slug}.colors.semantic.primary` },
      'colors.light.canvas': { from: 'preset', path: `${preset.slug}.colors.light.canvas` },
      'colors.dark.canvas': { from: 'preset', path: `${preset.slug}.colors.dark.canvas` },
      'typography.fontSans': { from: 'preset', path: `${preset.slug}.typography.fontSans` },
    },
    gaps: [],
  };

  writeFile(path.join(dsDir, 'DESIGN.md'), designMd);
  writeFile(path.join(dsDir, 'theme.json'), JSON.stringify(preset, null, 2) + '\n');
  writeFile(path.join(dsDir, 'DESIGN.evidence.json'), JSON.stringify(evidenceJson, null, 2) + '\n');
  fs.mkdirSync(path.join(dsDir, 'scripts'), { recursive: true });
  fs.copyFileSync(
    path.join(REPO_ROOT, 'scripts', 'build-tokens.mjs'),
    path.join(dsDir, 'scripts', 'build-tokens.mjs'),
  );

  // Compile design-system artifacts immediately
  execFileSync(process.execPath, [path.join(dsDir, 'scripts', 'build-tokens.mjs'), dsDir], {
    stdio: 'inherit',
  });

  // Safe project-level override boundary (never overwritten by build-tokens.mjs)
  const overridesPath = path.join(dsDir, 'user-overrides.css');
  if (!fs.existsSync(overridesPath)) {
    writeFile(
      overridesPath,
      '/* Safe project-level CSS overrides imported after design-system/styles.css */\n',
    );
  }

  // 3. Unified Navigation IR (primary schema) — canonical exemplar is copied
  //    from templates/components/react/configs in step 7 for every framework.

  // 4. FOUC-free dark mode inline script & Intl formatter
  const foucScript = `export const FOUC_THEME_SCRIPT = \`(function(){try{var k='rd-theme';var m=localStorage.getItem(k)||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.setAttribute('data-theme',d?'dark':'light');r.classList.toggle('dark',d);}catch(e){}})();\`;
`;
  writeFile(path.join(out, 'src', '@core', 'theme', 'fouc-script.ts'), foucScript);

  const intlHelper = `export function formatCurrency(value: number, locale = 'en-US', currency = 'USD'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatDate(date: Date | string, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(date));
}
`;
  writeFile(path.join(out, 'src', '@core', 'i18n', 'format.ts'), intlHelper);

  // 5. Locales (en, es, fr, de, ar RTL proof + ICU plural example) — keys mirror
  //    the translateKey values in templates/components/react/configs/navigation.config.ts
  const localeBundles = {
    en: {
      'nav.sectionMain': 'Main',
      'nav.dashboards': 'Dashboards',
      'nav.analytics': 'Analytics',
      'nav.ecommerce': 'E-commerce',
      'nav.sectionPlatform': 'Platform',
      'nav.uiToolkit': 'UI Toolkit',
      'nav.uiElements': 'Elements',
      'nav.icons': 'Icon Catalog',
      'nav.styleguide': 'Styleguide',
      'nav.docs': 'Documentation',
      'nav.pinned': 'Pinned',
      'nav.settings': 'Settings',
      'items.count': '{count, plural, one {# item} other {# items}}',
    },
    es: {
      'nav.sectionMain': 'Principal',
      'nav.dashboards': 'Paneles',
      'nav.analytics': 'Analítica',
      'nav.ecommerce': 'Comercio electrónico',
      'nav.sectionPlatform': 'Plataforma',
      'nav.uiToolkit': 'Kit de IU',
      'nav.uiElements': 'Elementos',
      'nav.icons': 'Catálogo de Iconos',
      'nav.styleguide': 'Guía de Estilo',
      'nav.docs': 'Documentación',
      'nav.pinned': 'Fijados',
      'nav.settings': 'Configuración',
      'items.count': '{count, plural, one {# elemento} other {# elementos}}',
    },
    fr: {
      'nav.sectionMain': 'Principal',
      'nav.dashboards': 'Tableaux de bord',
      'nav.analytics': 'Analytique',
      'nav.ecommerce': 'E-commerce',
      'nav.sectionPlatform': 'Plateforme',
      'nav.uiToolkit': 'Boîte à outils UI',
      'nav.uiElements': 'Éléments',
      'nav.icons': 'Catalogue d’icônes',
      'nav.styleguide': 'Guide de style',
      'nav.docs': 'Documentation',
      'nav.pinned': 'Épinglés',
      'nav.settings': 'Paramètres',
      'items.count': '{count, plural, one {# élément} other {# éléments}}',
    },
    de: {
      'nav.sectionMain': 'Hauptbereich',
      'nav.dashboards': 'Dashboards',
      'nav.analytics': 'Analytik',
      'nav.ecommerce': 'E-Commerce',
      'nav.sectionPlatform': 'Plattform',
      'nav.uiToolkit': 'UI-Toolkit',
      'nav.uiElements': 'Elemente',
      'nav.icons': 'Icon-Katalog',
      'nav.styleguide': 'Styleguide',
      'nav.docs': 'Dokumentation',
      'nav.pinned': 'Angepinnt',
      'nav.settings': 'Einstellungen',
      'items.count': '{count, plural, one {# Element} other {# Elemente}}',
    },
    ar: {
      'nav.sectionMain': 'الرئيسية',
      'nav.dashboards': 'لوحات التحكم',
      'nav.analytics': 'التحليلات',
      'nav.ecommerce': 'التجارة الإلكترونية',
      'nav.sectionPlatform': 'المنصة',
      'nav.uiToolkit': 'أدوات الواجهة',
      'nav.uiElements': 'العناصر',
      'nav.icons': 'كتالوج الأيقونات',
      'nav.styleguide': 'دليل التصميم',
      'nav.docs': 'التوثيق',
      'nav.pinned': 'المثبتة',
      'nav.settings': 'الإعدادات',
      'items.count': '{count, plural, one {عنصر واحد} other {# عناصر}}',
    },
  };
  for (const [loc, messages] of Object.entries(localeBundles)) {
    writeFile(path.join(out, 'locales', `${loc}.json`), JSON.stringify(messages, null, 2) + '\n');
  }

  // 6. .env.example
  const stackEnvLines = stack?.envVars && Object.keys(stack.envVars).length > 0
    ? `\n# Stack Provider Keys (${stack.id})\n` +
      Object.entries(stack.envVars)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n') +
      '\n'
    : '';
  const envExample = `# Application
APP_URL=http://localhost:3000

# Data, Auth & AI Modes (mock | live)
DATA_MODE=mock
AUTH_MODE=demo
AI_MODE=mock

# Replace with real provider credentials before production
DATABASE_URL=
AUTH_SECRET=
GEMINI_API_KEY=
OPENAI_API_KEY=
${stackEnvLines}`;
  writeFile(path.join(out, '.env.example'), envExample);

  // 7. Copy unified Navigation IR exemplar (every framework) + shared React
  //    component library + framework entrypoints
  copyDir(
    path.join(REPO_ROOT, 'templates', 'components', 'react', 'configs'),
    path.join(out, 'src', 'configs'),
  );
  const FRAMEWORK_KIT_MAP = {
    'react-mantine': 'mantine',
    'react-heroui': 'heroui',
    'react-chakra': 'chakra',
    'react-mui': 'mui',
    'react-antd': 'antd',
    'react-primereact': 'primereact',
    'react-daisyui': 'daisyui',
    'react-baseui': 'base-ui',
    'react-cossui': 'coss-ui',
    'react-reactbits': 'react-bits',
    'react-magicui': 'magic-ui',
    'react-aceternity': 'aceternity-ui',
    'react-21stdev': '21st-dev',
    'react-motion': 'motion-primitives',
    'react-arkui': 'ark-ui',
    'react-unocss': 'unocss',
    'react-pandacss': 'panda-css',
    'react-vanilla-extract': 'vanilla-extract',
    'react-stylex': 'stylex',
    'react-open-props': 'open-props',
  };

  if (starter.framework === 'nextjs' || starter.framework.startsWith('react-')) {
    const reactLib = path.join(REPO_ROOT, 'templates', 'components', 'react');
    const depNames = Object.keys(pkg.dependencies || {});
    const usesRecharts = depNames.includes('recharts') && !depNames.includes('apexcharts');
    const usesTanStackFormOnly = depNames.includes('@tanstack/react-form') && !depNames.includes('react-hook-form');
    const usesReactQuery = depNames.includes('@tanstack/react-query');

    copyDir(path.join(reactLib, 'icons'), path.join(out, 'src', '@core', 'icons'));
    copyDir(path.join(reactLib, 'theme'), path.join(out, 'src', '@core', 'theme'));
    copyDir(path.join(reactLib, 'ai'), path.join(out, 'src', '@core', 'ai'));
    copyDir(path.join(reactLib, 'auth'), path.join(out, 'src', '@core', 'auth'));
    copyDir(path.join(reactLib, 'menu'), path.join(out, 'src', '@menu'));
    copyDir(path.join(reactLib, 'layouts'), path.join(out, 'src', '@layouts'));
    copyDir(path.join(reactLib, 'ui'), path.join(out, 'src', 'components', 'ui'));

    // Copy pages cleanly: lean set for starter-kit, full showcase for demo
    const analyticsDir = path.join(out, 'src', 'features', 'analytics');
    fs.mkdirSync(analyticsDir, { recursive: true });
    if (opts.mode === 'starter-kit') {
      for (const f of ['AnalyticsDashboard.tsx', 'IconCatalogPage.tsx', 'StyleguidePage.tsx', 'ChartsGalleryPage.tsx']) {
        const src = path.join(reactLib, 'pages', f);
        if (fs.existsSync(src)) fs.copyFileSync(src, path.join(analyticsDir, f));
      }
    } else {
      copyDir(path.join(reactLib, 'pages'), analyticsDir);
    }

    // Copy data layer cleanly without duplicating httpClient or leaking unused react-query hooks
    for (const f of ['analyticsRepository.ts', 'ordersRepository.ts']) {
      const src = path.join(reactLib, 'data', f);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(analyticsDir, f));
    }
    if (usesReactQuery) {
      const qSrc = path.join(reactLib, 'data', 'useDataGridQuery.ts');
      if (fs.existsSync(qSrc)) fs.copyFileSync(qSrc, path.join(analyticsDir, 'useDataGridQuery.ts'));
    }
    if (fs.existsSync(path.join(reactLib, 'data', 'httpClient.ts'))) {
      fs.mkdirSync(path.join(out, 'src', '@core', 'data'), { recursive: true });
      fs.copyFileSync(
        path.join(reactLib, 'data', 'httpClient.ts'),
        path.join(out, 'src', '@core', 'data', 'httpClient.ts'),
      );
    }

    // Framework-specific kit (theme bridge, UI primitives, assets, ShowcasePage)
    const kitDirName = FRAMEWORK_KIT_MAP[starter.framework];
    if (kitDirName) {
      const kitSrc = path.join(REPO_ROOT, 'templates', 'components', 'frameworks', kitDirName);
      if (fs.existsSync(kitSrc)) {
        copyDir(kitSrc, path.join(out, 'src', 'components', 'framework'));
      }
    }

    // Stack-aware overlays: align copied UI primitives with the selected stack's chart/form engine
    const uiDir = path.join(out, 'src', 'components', 'ui');
    const uiIndexPath = path.join(uiDir, 'index.ts');
    if (usesRecharts) {
      for (const f of ['ChartWrapper.tsx', 'LiveChart.tsx', 'chartPresets.ts']) {
        const p = path.join(uiDir, f);
        if (fs.existsSync(p)) fs.rmSync(p);
      }
      if (fs.existsSync(uiIndexPath)) {
        const cleaned = fs
          .readFileSync(uiIndexPath, 'utf8')
          .split('\n')
          .filter((line) => !/\.\/(ChartWrapper|LiveChart|chartPresets)['"]/.test(line))
          .join('\n')
          .trimEnd() + "\nexport * from './ShadcnChart';\n";
        fs.writeFileSync(uiIndexPath, cleaned, 'utf8');
      }
      const rechartsDash = path.join(reactLib, 'examples', 'AnalyticsDashboardRecharts.tsx');
      const rechartsGallery = path.join(reactLib, 'examples', 'ChartsGalleryRecharts.tsx');
      const rechartsExample = path.join(reactLib, 'examples', 'ShadcnChartExample.tsx');
      if (fs.existsSync(rechartsDash)) fs.copyFileSync(rechartsDash, path.join(analyticsDir, 'AnalyticsDashboard.tsx'));
      if (fs.existsSync(rechartsGallery)) fs.copyFileSync(rechartsGallery, path.join(analyticsDir, 'ChartsGalleryPage.tsx'));
      if (fs.existsSync(rechartsExample)) fs.copyFileSync(rechartsExample, path.join(analyticsDir, 'ShadcnChartExample.tsx'));
    } else {
      // Remove Recharts-only ShadcnChart from ApexCharts stacks to avoid undeclared recharts imports
      const shadcnChartDest = path.join(uiDir, 'ShadcnChart.tsx');
      if (fs.existsSync(shadcnChartDest)) fs.rmSync(shadcnChartDest);
    }

    if (usesTanStackFormOnly) {
      // Drop RHF-only demo pages and emit the TanStack Form example instead
      for (const rhfPage of ['SettingsPage.tsx', 'FormValidationPage.tsx']) {
        const p = path.join(analyticsDir, rhfPage);
        if (fs.existsSync(p)) fs.rmSync(p);
      }
      const tsForm = path.join(reactLib, 'examples', 'TanStackFormExample.tsx');
      if (fs.existsSync(tsForm)) {
        fs.mkdirSync(path.join(out, 'src', 'features', 'forms'), { recursive: true });
        fs.copyFileSync(tsForm, path.join(out, 'src', 'features', 'forms', 'TanStackFormExample.tsx'));
      }
    }
  } else if (starter.framework === 'vue-vite') {
    const vueLib = path.join(REPO_ROOT, 'templates', 'components', 'vue');
    copyDir(path.join(vueLib, 'icons'), path.join(out, 'src', '@core', 'icons'));
    copyDir(path.join(vueLib, 'theme'), path.join(out, 'src', '@core', 'theme'));
    copyDir(path.join(vueLib, 'menu'), path.join(out, 'src', '@menu'));
    copyDir(path.join(vueLib, 'layouts'), path.join(out, 'src', '@layouts'));
    copyDir(path.join(vueLib, 'ui'), path.join(out, 'src', 'components', 'ui'));
  } else if (starter.framework === 'angular') {
    const ngLib = path.join(REPO_ROOT, 'templates', 'components', 'angular');
    copyDir(path.join(ngLib, 'icons'), path.join(out, 'src', '@core', 'icons'));
    copyDir(path.join(ngLib, 'theme'), path.join(out, 'src', '@core', 'theme'));
    copyDir(path.join(ngLib, 'menu'), path.join(out, 'src', '@menu'));
    copyDir(path.join(ngLib, 'layouts'), path.join(out, 'src', '@layouts'));
    copyDir(path.join(ngLib, 'ui'), path.join(out, 'src', 'components', 'ui'));
  }
  copyDir(path.join(REPO_ROOT, 'templates', 'starters', opts.starter, 'files'), out);

  // 7a. Wire --backend auth adapter & --mode starter-kit
  const adapterDir = path.join(REPO_ROOT, 'templates', 'auth-adapters');
  if (opts.backend && opts.backend !== 'mock') {
    const destAuthDir = path.join(out, 'src', '@core', 'auth');
    fs.mkdirSync(destAuthDir, { recursive: true });
    fs.copyFileSync(path.join(adapterDir, 'adapter.ts'), path.join(destAuthDir, 'adapter.ts'));
    if (fs.existsSync(path.join(adapterDir, 'security-headers.ts'))) {
      fs.copyFileSync(path.join(adapterDir, 'security-headers.ts'), path.join(destAuthDir, 'security-headers.ts'));
    }
    const adapterSrc = path.join(adapterDir, `${opts.backend}.ts`);
    if (fs.existsSync(adapterSrc)) {
      fs.copyFileSync(adapterSrc, path.join(destAuthDir, `${opts.backend}.ts`));
    } else {
      const available = fs
        .readdirSync(adapterDir)
        .filter((f) => f.endsWith('.ts') && f !== 'adapter.ts' && f !== 'security-headers.ts')
        .map((f) => f.replace(/\.ts$/, ''))
        .sort()
        .join(', ');
      console.warn(`Warning: Unknown backend adapter "${opts.backend}". Available: ${available}`);
    }
  }
  if (opts.mode === 'starter-kit') {
    writeFile(
      path.join(out, 'src', 'configs', 'navigation.config.ts'),
      `import type { NavItem } from '../@menu/useMenu';\n\nexport const navigationConfig: NavItem[] = [\n  {\n    key: 'group.main',\n    title: 'Main',\n    translateKey: 'nav.sectionMain',\n    type: 'group',\n    children: [\n      {\n        key: 'dashboard.analytics',\n        title: 'Analytics',\n        translateKey: 'nav.analytics',\n        icon: 'bar-chart-3',\n        path: '/dashboard/analytics',\n        type: 'item',\n      },\n      {\n        key: 'settings',\n        title: 'Settings',\n        translateKey: 'nav.settings',\n        icon: 'settings',\n        path: '/settings',\n        type: 'item',\n        bottom: true,\n      },\n    ],\n  },\n];\n`,
    );
  }

  // 7b. Copy bundled self-hosted SIL OFL variable fonts (filtered to preset unless --all-fonts) + offline Lucide SVG sprite
  const fontsSrcDir = path.join(REPO_ROOT, 'templates', 'assets', 'fonts');
  const fontsDestDir = path.join(out, 'public', 'fonts');
  if (opts.allFonts) {
    copyDir(fontsSrcDir, fontsDestDir);
  } else {
    fs.mkdirSync(fontsDestDir, { recursive: true });
    const fontSpec = `${preset.typography?.fontSans || ''} ${preset.typography?.fontMono || ''}`.toLowerCase();
    const fontCatalog = JSON.parse(fs.readFileSync(path.join(fontsSrcDir, 'catalog.json'), 'utf8'));
    const neededSlugs = new Set();
    for (const entry of fontCatalog.fonts || []) {
      const names = [entry.slug, ...String(entry.family || '').split('+').map((s) => s.trim().toLowerCase())];
      if (names.some((n) => n && fontSpec.includes(n))) {
        neededSlugs.add(entry.slug);
      }
    }
    if (neededSlugs.size === 0) {
      neededSlugs.add('inter');
      neededSlugs.add('jetbrains-mono');
    }
    for (const slug of neededSlugs) {
      copyDir(path.join(fontsSrcDir, slug), path.join(fontsDestDir, slug));
    }
    const rawFontsCss = fs.readFileSync(path.join(fontsSrcDir, 'fonts.css'), 'utf8');
    const filteredBlocks = rawFontsCss
      .split(/\n(?=@font-face\b)/)
      .filter((block, idx) => idx === 0 || [...neededSlugs].some((s) => block.includes(`./${s}/`)));
    writeFile(path.join(fontsDestDir, 'fonts.css'), filteredBlocks.join('\n').trimEnd() + '\n');
    const filteredCatalog = {
      ...fontCatalog,
      fonts: (fontCatalog.fonts || []).filter((f) => neededSlugs.has(f.slug)),
    };
    writeFile(path.join(fontsDestDir, 'catalog.json'), JSON.stringify(filteredCatalog, null, 2) + '\n');
  }
  fs.mkdirSync(path.join(out, 'public', 'icons'), { recursive: true });
  fs.copyFileSync(
    path.join(REPO_ROOT, 'templates', 'assets', 'icons', 'lucide-dashboard-sprite.svg'),
    path.join(out, 'public', 'icons', 'lucide-dashboard-sprite.svg'),
  );

  // 8. Hosting config
  if (opts.hosting === 'vercel') {
    const vercelFramework =
      starter.framework === 'nextjs' ? 'nextjs' : starter.framework === 'angular' ? 'angular' : 'vite';
    writeFile(path.join(out, 'vercel.json'), JSON.stringify({ framework: vercelFramework }, null, 2) + '\n');
  } else if (opts.hosting === 'docker') {
    const isBun = opts.pm === 'bun';
    const buildImage = isBun ? 'oven/bun:1-alpine' : 'node:22-alpine';
    const installCmd = isBun ? 'bun install --frozen-lockfile || bun install' : `corepack enable && ${opts.pm} install`;
    const runBuild = `${opts.pm} run build`;
    const dockerignore = `node_modules\n.git\n.next\ndist\n.env\n.env.*\n!.env.example\n*.db\n*.sqlite\n*.log\n`;
    writeFile(path.join(out, '.dockerignore'), dockerignore);

    if (starter.framework === 'nextjs') {
      writeFile(
        path.join(out, 'Dockerfile'),
        `FROM ${buildImage} AS builder\nWORKDIR /app\nCOPY package.json ./\nRUN ${installCmd}\nCOPY . .\nRUN ${runBuild}\n\nFROM ${buildImage} AS runner\nWORKDIR /app\nENV NODE_ENV=production\nCOPY --from=builder /app ./\nUSER ${isBun ? 'bun' : 'node'}\nEXPOSE 3000\nCMD ["${opts.pm}", "run", "start"]\n`,
      );
    } else {
      const distSubdir = starter.framework === 'angular' ? `dist/${opts.name}/browser` : 'dist';
      writeFile(
        path.join(out, 'Dockerfile'),
        `FROM ${buildImage} AS builder\nWORKDIR /app\nCOPY package.json ./\nRUN ${installCmd}\nCOPY . .\nRUN ${runBuild}\n\nFROM nginxinc/nginx-unprivileged:1.27-alpine AS runner\nCOPY nginx.conf.example /etc/nginx/conf.d/default.conf\nCOPY --from=builder /app/${distSubdir} /usr/share/nginx/html\nEXPOSE 8080\nCMD ["nginx", "-g", "daemon off;"]\n`,
      );
      writeFile(
        path.join(out, 'nginx.conf.example'),
        `server {\n  listen 8080;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n\n  add_header X-Frame-Options "DENY" always;\n  add_header X-Content-Type-Options "nosniff" always;\n  add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n`,
      );
    }
  } else if (opts.hosting === 'cloudflare') {
    writeFile(path.join(out, 'wrangler.toml'), `name = "${opts.name}"\ncompatibility_date = "2026-01-01"\n`);
  }

  // 8b. Stack tooling configs (OxLint / Husky)
  if (stack?.tooling?.oxlint) {
    const oxlintCfg = {
      $schema: './node_modules/oxlint/configuration_schema.json',
      extends: ['./design-system/_adherence.oxlintrc.json'],
      plugins: ['react', 'typescript', 'jsx-a11y', 'nextjs'],
      ignorePatterns: ['.next/**', 'node_modules/**', 'dist/**', 'design-system/**'],
    };
    writeFile(path.join(out, '.oxlintrc.json'), JSON.stringify(oxlintCfg, null, 2) + '\n');
  }
  if (stack?.tooling?.husky) {
    writeFile(
      path.join(out, '.husky', 'pre-commit'),
      `${opts.pm} exec lint-staged\n${opts.pm} run tokens:check\n`,
    );
  }

  const stackLabel = stack ? `, stack: ${stack.id}` : '';
  console.log(`\nScaffolded "${opts.name}" (${starter.name}${stackLabel}, preset: ${preset.slug}, pm: ${opts.pm}, hosting: ${opts.hosting}) at:\n  ${out}\n`);
}

main();
