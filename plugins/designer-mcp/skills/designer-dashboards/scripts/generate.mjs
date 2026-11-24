#!/usr/bin/env node
/**
 * Designer Dashboards On-Demand Generator CLI
 * Usage:
 *   node scripts/generate.mjs vertical <slug> [--framework react|vue|angular] --out <project-dir>
 *   node scripts/generate.mjs chart <type|all> --framework <react|vue|angular> --out <project-dir>
 *   node scripts/generate.mjs emails --out <project-dir> [--brand "Acme"]
 *   node scripts/generate.mjs auth-suite --out <project-dir>
 *   node scripts/generate.mjs nav --framework <react|vue|angular|agnostic> --out <project-dir>
 *   node scripts/generate.mjs layout --framework <react|vue|angular|agnostic> --out <project-dir>
 *   node scripts/generate.mjs app-shell <list-detail|board|stream|full-canvas|pos|map-split|docs-toc|workspace-rail|affix-form|masonry|resizable-split> --name <app> --framework <react|vue|angular|agnostic> --out <project-dir>
 *   node scripts/generate.mjs page <kind> --out <project-dir>
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function toPascal(slug) {
  return slug
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join('');
}

function parseOpts(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--') && argv[i + 1]) {
      flags[argv[i].slice(2)] = argv[++i];
    } else {
      positional.push(argv[i]);
    }
  }
  return { positional, flags };
}

function getDefaultChartSpec(chartType) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  switch (chartType) {
    case 'dashedLine':
      return {
        type: 'dashedLine',
        categories: months,
        series: [
          { name: 'Actual', data: [38, 46, 52, 61, 69] },
          { name: 'Target', data: [40, 45, 50, 55, 62] },
          { name: 'Baseline', data: [30, 32, 35, 38, 40] },
        ],
      };
    case 'stepline':
      return { type: 'stepline', categories: months, series: [{ name: 'Capacity', data: [20, 20, 45, 45, 80] }] };
    case 'slope':
      return {
        type: 'slope',
        series: [
          { name: 'North America', data: [{ x: '2024', y: 42 }, { x: '2025', y: 68 }] },
          { name: 'Europe', data: [{ x: '2024', y: 54 }, { x: '2025', y: 61 }] },
          { name: 'APAC', data: [{ x: '2024', y: 28 }, { x: '2025', y: 52 }] },
        ],
      };
    case 'bullet':
      return {
        type: 'bullet',
        series: [
          {
            name: 'Actual',
            data: [
              { x: 'MRR', y: 84, goals: [{ name: 'Target', value: 90, strokeWidth: 4, strokeColor: 'var(--color-error)' }] },
              { x: 'NPS', y: 72, goals: [{ name: 'Target', value: 65, strokeWidth: 4, strokeColor: 'var(--color-success)' }] },
            ],
          },
        ],
      };
    case 'donut':
    case 'semiDonut':
    case 'pie':
      return { type: chartType, categories: ['Primary', 'Secondary', 'Other'], series: [58, 28, 14] };
    case 'radialBar':
      return { type: 'radialBar', categories: ['Goal', 'Uptime', 'Coverage'], series: [84, 96, 72] };
    case 'gauge':
      return { type: 'gauge', categories: ['Capacity'], series: [76] };
    case 'polarArea':
      return { type: 'polarArea', categories: ['Search', 'Direct', 'Social', 'Email'], series: [42, 34, 26, 19] };
    case 'funnel':
      return { type: 'funnel', categories: ['Visitors', 'Signups', 'Qualified', 'Proposal', 'Won'], series: [{ name: 'Conversion', data: [1420, 860, 520, 290, 165] }] };
    case 'mixed':
      return {
        type: 'mixed',
        categories: months,
        series: [
          { name: 'Orders', type: 'column', data: [38, 46, 42, 54, 61] },
          { name: 'Forecast', type: 'area', data: [34, 42, 45, 51, 58] },
          { name: 'Avg Order', type: 'line', data: [48, 52, 49, 58, 63] },
        ],
      };
    case 'candlestick':
      return {
        type: 'candlestick',
        series: [{ name: 'OHLC', data: [{ x: 'Mon', y: [6120, 6280, 6050, 6210] }, { x: 'Tue', y: [6210, 6340, 6180, 6290] }, { x: 'Wed', y: [6290, 6310, 6110, 6150] }, { x: 'Thu', y: [6150, 6410, 6140, 6380] }] }],
      };
    case 'boxPlot':
      return {
        type: 'boxPlot',
        series: [{ name: 'Latency (ms)', data: [{ x: 'API', y: [42, 68, 84, 112, 148] }, { x: 'Auth', y: [28, 41, 52, 74, 96] }, { x: 'Search', y: [65, 92, 118, 154, 210] }] }],
      };
    case 'rangeBar':
    case 'dumbbell':
      return {
        type: 'rangeBar',
        series: [{ name: 'Schedule', data: [{ x: 'Design', y: [1, 4] }, { x: 'API', y: [3, 8] }, { x: 'Frontend', y: [5, 11] }] }],
      };
    case 'rangeArea':
      return {
        type: 'rangeArea',
        series: [
          { name: 'Range', type: 'rangeArea', data: [{ x: 'Jan', y: [24, 38] }, { x: 'Feb', y: [29, 44] }, { x: 'Mar', y: [35, 52] }] },
          { name: 'Median', type: 'line', data: [{ x: 'Jan', y: 31 }, { x: 'Feb', y: 37 }, { x: 'Mar', y: 44 }] },
        ],
      };
    case 'heatmap':
      return {
        type: 'heatmap',
        series: [
          { name: 'Mon', data: [{ x: '09:00', y: 22 }, { x: '12:00', y: 48 }, { x: '15:00', y: 64 }] },
          { name: 'Tue', data: [{ x: '09:00', y: 35 }, { x: '12:00', y: 72 }, { x: '15:00', y: 58 }] },
        ],
      };
    case 'treemap':
      return {
        type: 'treemap',
        series: [{ name: 'Allocation', data: [{ x: 'Compute', y: 420 }, { x: 'Storage', y: 260 }, { x: 'Bandwidth', y: 185 }] }],
      };
    case 'scatter':
      return {
        type: 'scatter',
        series: [{ name: 'Cohort A', data: [[12, 44], [18, 58], [24, 52], [31, 74]] }, { name: 'Cohort B', data: [[8, 22], [15, 34], [21, 29], [28, 45]] }],
      };
    case 'bubble':
      return {
        type: 'bubble',
        series: [{ name: 'Campaigns', data: [{ x: 14, y: 42, z: 24 }, { x: 26, y: 65, z: 38 }, { x: 38, y: 54, z: 29 }] }],
      };
    case 'radar':
      return {
        type: 'radar',
        categories: ['Speed', 'Reliability', 'Security', 'UX', 'Cost'],
        series: [{ name: 'Current', data: [85, 92, 88, 79, 74] }, { name: 'Target', data: [75, 82, 80, 75, 80] }],
      };
    default:
      return { type: chartType, categories: months, series: [{ name: 'Primary', data: [32, 45, 41, 59, 68] }] };
  }
}

function generateVertical(slug, outDir, framework = 'react') {
  const recipePath = path.join(REPO_ROOT, 'templates', 'verticals', `${slug}.json`);
  if (!fs.existsSync(recipePath)) {
    console.error(`Unknown vertical "${slug}". Available: analytics, ecommerce, crm, ai-ops, crypto, saas-projects, pos, hrm, lms, logistics, medical, finance, helpdesk, real-estate, social-media, nft-gaming`);
    process.exit(1);
  }
  const recipe = JSON.parse(fs.readFileSync(recipePath, 'utf8'));
  const compName = `${toPascal(slug)}Dashboard`;
  const kpiRow = recipe.rows.find((r) => r.kind === 'kpi-row');
  const chartRow = recipe.rows.find((r) => r.kind === 'chart-row');
  const fullWidthRow = recipe.rows.find((r) => r.kind === 'full-width');
  const hasFilter = Boolean(recipe.header?.dateRange);
  const widgets = chartRow?.widgets ?? [];
  const hasDataGrid = (fullWidthRow?.widgets ?? []).some((w) => w.component === 'DataGrid');
  const hasLive = widgets.some((w) => w.chartType === 'live-line');
  const hasMap = widgets.some((w) => w.chartType === 'map');
  const hasCharts = widgets.some((w) => w.chartType !== 'live-line' && w.chartType !== 'map');
  const hasRightRail = Array.isArray(recipe.rightRail) && recipe.rightRail.length > 0;

  if (framework === 'vue') {
    const kpiVue = (kpiRow?.widgets ?? [])
      .map((w, idx) => `      <KpiCard label="${w.label}" :value="${(idx + 1) * 1240}" format="number" :delta="${idx % 2 === 0 ? 8.4 : -1.9}" icon="${w.icon}" tone="${w.tone}" />`)
      .join('\n');
    const chartWidgets = widgets
      .filter((w) => w.chartType && w.chartType !== 'map')
      .slice(0, 2)
      .map(
        (w) =>
          `      <WidgetCard title="${w.title}" skeleton-variant="chart" allow-fullscreen allow-pin class="lg:col-span-6">\n        <ChartWrapper type="${w.chartType === 'live-line' ? 'area' : w.chartType}" :height="280" :series="[{ name: '${w.title}', data: [24, 32, 29, 41, 48, 56] }]" :options="{ xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] } }" label="${w.title}" />\n      </WidgetCard>`,
      )
      .join('\n');
    const code = `<script setup lang="ts">\nimport KpiCard from '../../components/ui/KpiCard.vue';\nimport WidgetCard from '../../components/ui/WidgetCard.vue';\nimport ChartWrapper from '../../components/ui/ChartWrapper.vue';\n</script>\n\n<template>\n  <div class="space-y-6">\n    <div class="anim-in grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">\n${kpiVue}\n    </div>\n    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">\n${chartWidgets || `      <WidgetCard title="${recipe.name}" skeleton-variant="chart" allow-fullscreen class="lg:col-span-12">\n        <ChartWrapper type="area" :height="280" :series="[{ name: '${recipe.name}', data: [24, 32, 29, 41, 48, 56] }]" :options="{ xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] } }" label="${recipe.name}" />\n      </WidgetCard>`}\n    </div>\n  </div>\n</template>\n`;
    const target = path.join(outDir, 'src', 'features', slug, `${compName}.vue`);
    writeFile(target, code);
    console.log(`Generated Vue vertical dashboard: ${target}`);
    return;
  }

  if (framework === 'angular') {
    const kpiNg = (kpiRow?.widgets ?? [])
      .map((w, idx) => `      <rd-kpi-card label="${w.label}" [value]="${(idx + 1) * 1240}" [delta]="${idx % 2 === 0 ? 8.4 : -1.9}" tone="${w.tone}" />`)
      .join('\n');
    const chartWidgets = widgets
      .filter((w) => w.chartType && w.chartType !== 'map')
      .slice(0, 2)
      .map(
        (w) =>
          `        <rd-widget-card title="${w.title}" [allowFullscreen]="true" class="lg:col-span-6">\n          <rd-chart-wrapper type="${w.chartType === 'live-line' ? 'area' : w.chartType}" [height]="280" [series]="[{ name: '${w.title}', data: [24, 32, 29, 41, 48, 56] }]" title="${w.title}" />\n        </rd-widget-card>`,
      )
      .join('\n');
    const code = `import { Component } from '@angular/core';\nimport { KpiCardComponent } from '../../components/ui/kpi-card.component';\nimport { WidgetCardComponent } from '../../components/ui/widget-card.component';\nimport { ChartWrapperComponent } from '../../components/ui/chart-wrapper.component';\n\n@Component({\n  selector: 'app-${slug}-dashboard',\n  standalone: true,\n  imports: [KpiCardComponent, WidgetCardComponent, ChartWrapperComponent],\n  template: \`\n    <div class="space-y-6">\n      <div class="anim-in grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">\n${kpiNg}\n      </div>\n      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">\n${chartWidgets || `        <rd-widget-card title="${recipe.name}" [allowFullscreen]="true" class="lg:col-span-12">\n          <rd-chart-wrapper type="area" [height]="280" [series]="[{ name: '${recipe.name}', data: [24, 32, 29, 41, 48, 56] }]" title="${recipe.name}" />\n        </rd-widget-card>`}\n      </div>\n    </div>\n  \`,\n})\nexport class ${compName}Component {}\n`;
    const target = path.join(outDir, 'src', 'features', slug, `${slug}.dashboard.component.ts`);
    writeFile(target, code);
    console.log(`Generated Angular vertical dashboard: ${target}`);
    return;
  }

  const spanMap = {
    3: 'xl:col-span-3',
    4: 'xl:col-span-4',
    5: 'xl:col-span-5',
    6: 'xl:col-span-6',
    7: 'xl:col-span-7',
    8: 'xl:col-span-8',
    9: 'xl:col-span-9',
    12: 'xl:col-span-12',
  };

  const kpiJsx = (kpiRow?.widgets ?? [])
    .map(
      (w, idx) => `        <KpiCard label="${w.label}" value={${(idx + 1) * 1240}} format="number" delta={${idx % 2 === 0 ? 8.4 : -1.9}} icon="${w.icon}" tone="${w.tone}"${w.sparkline ? ' sparkline={[24, 32, 29, 41, 38, 52]}' : ''} />`,
    )
    .join('\n');

  const chartSpecs = [];
  const chartJsx = widgets
    .map((w, idx) => {
      const span = spanMap[chartRow.split?.[idx]] ?? 'xl:col-span-6';
      if (w.chartType === 'live-line') {
        return `        <WidgetCard title="${w.title}" skeletonVariant="chart" allowFullscreen allowPin className="${span}">\n          <LiveChart title="${w.title}" height={${w.height ?? 300}} />\n        </WidgetCard>`;
      }
      if (w.chartType === 'map') {
        return `        <WidgetCard title="${w.title}" skeletonVariant="chart" allowFullscreen allowPin className="${span}">\n          <RegionMap title="${w.title}" height={${w.height ?? 300}} regions={[{ code: 'US', name: 'United States', value: 420 }, { code: 'DE', name: 'Germany', value: 280 }, { code: 'GB', name: 'United Kingdom', value: 195 }]} />\n        </WidgetCard>`;
      }
      const specName = `chartSpec${idx}`;
      const sample = getDefaultChartSpec(w.chartType);
      chartSpecs.push(
        `export const ${specName} = {\n  type: '${sample.type}' as const,\n  height: ${w.height ?? 300},${sample.categories ? `\n  categories: ${JSON.stringify(sample.categories)},` : ''}\n  series: ${JSON.stringify(sample.series)},\n  options: getChartPreset('${w.chartType}'),\n};`,
      );
      return `        <WidgetCard title="${w.title}" skeletonVariant="chart" allowFullscreen allowPin className="${span}">\n          <ChartWrapper title="${w.title}" {...${specName}} />\n        </WidgetCard>`;
    })
    .join('\n');

  if (hasCharts) {
    const chartsCode = `import { getChartPreset } from '../../components/ui/chartPresets';\n\n${chartSpecs.join('\n\n')}\n`;
    writeFile(path.join(outDir, 'src', 'features', slug, `${slug}.charts.ts`), chartsCode);
  }

  const chartSpecImports = hasCharts
    ? `\nimport { ${widgets
        .map((w, idx) => (w.chartType !== 'live-line' && w.chartType !== 'map' ? `chartSpec${idx}` : null))
        .filter(Boolean)
        .join(', ')} } from './${slug}.charts';`
    : '';

  const railCards = hasRightRail
    ? recipe.rightRail
        .map(
          (r) => `          <WidgetCard title="${r.title}" skeletonVariant="list">\n            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">${r.title} (${r.kind})</p>\n          </WidgetCard>`,
        )
        .join('\n')
    : '';

  const mainBody = `      <div className="anim-in grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
${kpiJsx}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
${chartJsx}
      </div>${hasDataGrid ? '\n      <WidgetCard title="Records" skeletonVariant="table" allowFullscreen>\n        <DataGrid data={[]} columns={[{ accessorKey: \'id\', header: \'ID\' }]} serverMode totalCount={0} pageCount={1} onFetchParamsChange={() => {}} />\n      </WidgetCard>' : ''}`;

  const code = `'use client';

import * as React from 'react';
import { KpiCard } from '../../components/ui/KpiCard';
import { WidgetCard } from '../../components/ui/WidgetCard';${hasRightRail ? "\nimport { WorkspaceRailShell } from '../../@layouts/AppShells';" : ''}${hasCharts ? "\nimport { ChartWrapper } from '../../components/ui/ChartWrapper';" : ''}${hasLive ? "\nimport { LiveChart } from '../../components/ui/LiveChart';" : ''}${hasMap ? "\nimport { RegionMap } from '../../components/ui/RegionMap';" : ''}${hasFilter ? "\nimport { FilterBar } from '../../components/ui/FilterBar';" : ''}${hasDataGrid ? "\nimport { DataGrid } from '../../components/ui/DataGrid';" : ''}${chartSpecImports}

export function ${compName}() {
  ${hasFilter ? "const [search, setSearch] = React.useState('');\n  const [dateRange, setDateRange] = React.useState({ from: '', to: '' });" : ''}
  return (
    <div className="space-y-6">
      ${hasFilter ? '<FilterBar search={search} onSearchChange={setSearch} dateRange={dateRange} onDateRangeChange={setDateRange} onReset={() => { setSearch(\'\'); setDateRange({ from: \'\', to: \'\' }); }} />' : ''}
${hasRightRail ? `      <WorkspaceRailShell\n        main={\n          <div className="space-y-6">\n${mainBody}\n          </div>\n        }\n        rail={\n          <>\n${railCards}\n          </>\n        }\n      />` : mainBody}
    </div>
  );
}
`;
  const target = path.join(outDir, 'src', 'features', slug, `${compName}.tsx`);
  writeFile(target, code);
  console.log(`Generated vertical dashboard: ${target}`);
}

function generateEmails(outDir, brand = 'Designer Dashboards') {
  const themePath = path.join(outDir, 'design-system', 'theme.json');
  let primary = '#5B4FE9';
  if (fs.existsSync(themePath)) {
    const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));
    primary = theme.colors?.semantic?.primary || primary;
  }
  const srcDir = path.join(REPO_ROOT, 'templates', 'emails');
  const destDir = path.join(outDir, 'emails');
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith('.html'))) {
    const html = fs
      .readFileSync(path.join(srcDir, file), 'utf8')
      .replace(/\{\{PRIMARY_COLOR\}\}/g, primary)
      .replace(/\{\{BRAND_NAME\}\}/g, brand);
    writeFile(path.join(destDir, file), html);
  }
  console.log(`Generated 5 themed transactional HTML emails in: ${destDir}`);
}

function generateAuthSuite(outDir, adapter = 'authjs-prisma') {
  const authCompDir = path.join(REPO_ROOT, 'templates', 'components', 'react', 'auth');
  const destAuthDir = path.join(outDir, 'src', '@core', 'auth');
  fs.mkdirSync(destAuthDir, { recursive: true });
  for (const f of ['AuthSuite.tsx', 'useZodForm.ts']) {
    const src = path.join(authCompDir, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(destAuthDir, f));
  }

  // Copy core AuthAdapter interface, security headers & chosen backend adapter template
  const adapterDir = path.join(REPO_ROOT, 'templates', 'auth-adapters');
  fs.copyFileSync(path.join(adapterDir, 'adapter.ts'), path.join(destAuthDir, 'adapter.ts'));
  if (fs.existsSync(path.join(adapterDir, 'security-headers.ts'))) {
    fs.copyFileSync(path.join(adapterDir, 'security-headers.ts'), path.join(destAuthDir, 'security-headers.ts'));
  }
  const adapterFile = `${adapter}.ts`;
  if (fs.existsSync(path.join(adapterDir, adapterFile))) {
    fs.copyFileSync(path.join(adapterDir, adapterFile), path.join(destAuthDir, adapterFile));
  } else {
    console.warn(`Warning: Unknown auth adapter "${adapter}". Available: authjs-prisma, supabase, better-auth, clerk, custom-jwt`);
  }

  // Generate remaining Next.js guest-only auth routes when Next.js app dir exists (Server Component wrappers + Client Islands)
  const nextAuthRoot = path.join(outDir, 'src', 'app', '(auth)', '(guest-only)');
  if (fs.existsSync(nextAuthRoot)) {
    const pages = [
      ['forgot-password', 'Forgot your password?', 'Enter your email to receive a reset link.', 'ForgotPasswordForm', '<ForgotPasswordForm />'],
      ['reset-password', 'Set a new password', 'Choose a strong password for your account.', 'ResetPasswordForm', '<ResetPasswordForm />'],
      ['two-factor', 'Two-factor verification', 'Enter the 6-digit code from your authenticator app.', 'TwoFactorForm', '<TwoFactorForm />'],
      ['verify-email', 'Verify your email', 'Confirm your address to finish setting up your workspace.', 'VerifyEmailView', '<VerifyEmailView />'],
      ['401', 'Access denied', 'You do not have permission to view this page.', 'Unauthorized401View', '<Unauthorized401View />'],
    ];
    for (const [route, title, subtitle, comp, jsx] of pages) {
      const code = `import { AuthShell } from '../../../../@layouts/AuthShell';
import { ${comp} } from '../../../../@core/auth/AuthSuite';

export default function Page() {
  return (
    <AuthShell variant="basic" title="${title}" subtitle="${subtitle}">
      ${jsx}
    </AuthShell>
  );
}
`;
      writeFile(path.join(nextAuthRoot, route, 'page.tsx'), code);
    }
  }

  console.log(`Installed User + Admin AuthSuite (adapter: ${adapter}) at: ${destAuthDir}`);
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

function generateNav(framework, outDir) {
  const valid = ['react', 'vue', 'angular', 'agnostic'];
  if (!valid.includes(framework)) {
    console.error(`Unknown framework "${framework}". Available: ${valid.join(', ')}`);
    process.exit(1);
  }
  if (framework === 'agnostic') {
    for (const file of ['app-shell.html', 'nav-modern.html']) {
      const src = path.join(REPO_ROOT, 'templates', 'components', 'agnostic', file);
      const dest = path.join(outDir, file);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }
    console.log(`Generated agnostic HTML navigation & shell (app-shell.html, nav-modern.html) in: ${outDir}`);
    return;
  }
  copyDir(
    path.join(REPO_ROOT, 'templates', 'components', 'react', 'configs'),
    path.join(outDir, 'src', 'configs'),
  );
  copyDir(
    path.join(REPO_ROOT, 'templates', 'components', framework, 'menu'),
    path.join(outDir, 'src', '@menu'),
  );
  console.log(`Generated ${framework} Nav IR + menu renderers in: ${path.join(outDir, 'src')}`);
}

function generateLayout(framework, outDir) {
  const valid = ['react', 'vue', 'angular', 'agnostic'];
  if (!valid.includes(framework)) {
    console.error(`Unknown framework "${framework}". Available: ${valid.join(', ')}`);
    process.exit(1);
  }
  if (framework === 'agnostic') {
    const src = path.join(REPO_ROOT, 'templates', 'components', 'agnostic', 'app-shell.html');
    const dest = path.join(outDir, 'app-shell.html');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`Generated agnostic HTML layout shell at: ${dest}`);
    return;
  }
  copyDir(
    path.join(REPO_ROOT, 'templates', 'components', framework, 'theme'),
    path.join(outDir, 'src', '@core', 'theme'),
  );
  copyDir(
    path.join(REPO_ROOT, 'templates', 'components', framework, 'layouts'),
    path.join(outDir, 'src', '@layouts'),
  );
  console.log(`Generated ${framework} theme store + AppShell in: ${path.join(outDir, 'src')}`);
}

function generateAppShell(shell, name, outDir, framework = 'react') {
  const valid = [
    'list-detail',
    'board',
    'stream',
    'full-canvas',
    'pos',
    'map-split',
    'docs-toc',
    'workspace-rail',
    'affix-form',
    'masonry',
    'resizable-split',
  ];
  if (!valid.includes(shell)) {
    console.error(`Unknown app-shell "${shell}". Available: ${valid.join(', ')}`);
    process.exit(1);
  }
  if (framework === 'agnostic') {
    const src = path.join(REPO_ROOT, 'templates', 'components', 'agnostic', 'app-shells.html');
    const dest = path.join(outDir, `${name}-shells.html`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`Generated agnostic ${shell} app-shell snippets at: ${dest}`);
    return;
  }
  if (framework === 'vue') {
    const compName = `${toPascal(name)}App`;
    const code = `<script setup lang="ts">\nimport AppShells from '../../../@layouts/AppShells.vue';\n</script>\n\n<template>\n  <AppShells kind="${shell}">\n    <p class="text-sm">${compName} (${shell}) workspace</p>\n  </AppShells>\n</template>\n`;
    const target = path.join(outDir, 'src', 'apps', name, 'features', `${compName}.vue`);
    writeFile(target, code);
    console.log(`Generated Vue ${shell} app module: ${target}`);
    return;
  }
  if (framework === 'angular') {
    const compName = `${toPascal(name)}AppComponent`;
    const code = `import { Component } from '@angular/core';\nimport { AppShellsComponent } from '../../../@layouts/app-shells.component';\n\n@Component({\n  selector: 'app-${name}',\n  standalone: true,\n  imports: [AppShellsComponent],\n  template: \`<rd-app-shells kind="${shell}"><p class="text-sm">${toPascal(name)} (${shell}) workspace</p></rd-app-shells>\`,\n})\nexport class ${compName} {}\n`;
    const target = path.join(outDir, 'src', 'apps', name, 'features', `${name}.component.ts`);
    writeFile(target, code);
    console.log(`Generated Angular ${shell} app module: ${target}`);
    return;
  }
  const compName = `${toPascal(name)}App`;
  const map = {
    'list-detail': `ListDetailShell`,
    board: `BoardShell`,
    stream: `ThreadedStreamShell`,
    'full-canvas': `FullCanvasShell`,
    pos: `PosSplitShell`,
    'map-split': `MapSplitShell`,
    'docs-toc': `DocsTocShell`,
    'workspace-rail': `WorkspaceRailShell`,
    'affix-form': `AffixFormShell`,
    masonry: `MasonryGridShell`,
    'resizable-split': `ResizableSplitShell`,
  };
  const shellComp = map[shell];
  const body =
    shell === 'board'
      ? `  const [columns, setColumns] = React.useState([\n    { id: 'todo', title: 'To Do', cards: [{ id: '1', title: 'Audit tokens', meta: 'High priority' }] },\n    { id: 'doing', title: 'In Progress', cards: [{ id: '2', title: 'Wire RBAC guard', meta: 'Auth' }] },\n    { id: 'done', title: 'Done', cards: [{ id: '3', title: 'WCAG AA contrast', meta: 'Verified' }] },\n  ]);\n  const move = (cardId: string, fromId: string, toId: string) => {\n    setColumns((cols) => {\n      const card = cols.find((c) => c.id === fromId)?.cards.find((x) => x.id === cardId);\n      if (!card) return cols;\n      return cols.map((c) => {\n        if (c.id === fromId) return { ...c, cards: c.cards.filter((x) => x.id !== cardId) };\n        if (c.id === toId) return { ...c, cards: [...c.cards, card] };\n        return c;\n      });\n    });\n  };\n  return <BoardShell columns={columns} onMoveCard={move} />;`
      : shell === 'list-detail'
        ? `  return <ListDetailShell list={<div className="p-4 text-sm">${shell} list</div>} detail={<div className="text-sm">Select an item to view details.</div>} />;`
        : shell === 'pos'
          ? `  return <PosSplitShell catalog={<div className="text-sm">Catalog grid</div>} ticket={<div className="text-sm">Order ticket</div>} />;`
          : shell === 'map-split'
            ? `  return <MapSplitShell list={<div className="text-sm">Locations list</div>} map={<div className="p-4 text-sm">Interactive map canvas</div>} />;`
            : shell === 'docs-toc'
              ? `  return <DocsTocShell nav={<div className="text-sm">Docs nav</div>} content={<div className="text-sm">Article content</div>} toc={<div className="text-sm">On this page</div>} />;`
              : shell === 'workspace-rail'
                ? `  return <WorkspaceRailShell main={<div className="text-sm">Main dashboard rows</div>} rail={<div className="text-sm">Right rail summary</div>} />;`
                : shell === 'affix-form'
                  ? `  return <AffixFormShell nav={<div className="text-sm">Form sections</div>}><div className="text-sm">Multi-section form</div></AffixFormShell>;`
                  : shell === 'masonry'
                    ? `  return <MasonryGridShell><div className="rd-card border p-4 text-sm">Masonry item 1</div><div className="rd-card border p-4 text-sm">Masonry item 2</div></MasonryGridShell>;`
                    : shell === 'resizable-split'
                      ? `  return <ResizableSplitShell left={<div className="text-sm">Left pane</div>} right={<div className="text-sm">Right pane</div>} />;`
                      : shell === 'stream'
                        ? `  return <ThreadedStreamShell stream={<div className="text-sm">Conversation stream</div>} composer={<div className="text-xs">Message composer</div>} />;`
                        : `  return <FullCanvasShell toolbar={<h2 className="text-sm font-semibold">${compName} (${shell})</h2>}><div className="text-sm">Full-canvas workspace</div></FullCanvasShell>;`;

  const code = `'use client';

import * as React from 'react';
import { ${shellComp} } from '../../../@layouts/AppShells';

export function ${compName}() {
${body}
}
`;
  const target = path.join(outDir, 'src', 'apps', name, 'features', `${compName}.tsx`);
  writeFile(target, code);
  console.log(`Generated ${shell} app module: ${target}`);
}

function generatePage(pageKind, outDir, framework = 'react') {
  const map = {
    invoice: 'InvoicePage.tsx',
    settings: 'SettingsPage.tsx',
    wizard: 'FormWizardPage.tsx',
    error: 'ErrorPage.tsx',
    landing: 'LandingPage.tsx',
    'form-inputs': 'FormInputsPage.tsx',
    'form-layouts': 'FormLayoutsPage.tsx',
    'form-validation': 'FormValidationPage.tsx',
    'ai-chat': 'AiChatPage.tsx',
    roles: 'RolesPage.tsx',
    calendar: 'CalendarPage.tsx',
    docs: 'DocsPage.tsx',
    mail: 'MailPage.tsx',
    'file-manager': 'FileManagerPage.tsx',
    kanban: 'KanbanPage.tsx',
    pos: 'PosPage.tsx',
    pricing: 'PricingPage.tsx',
    profile: 'ProfilePage.tsx',
    'api-keys': 'ApiKeysPage.tsx',
    'charts-gallery': 'ChartsGalleryPage.tsx',
    orders: 'OrdersPage.tsx',
    catalog: 'EcommerceCatalogPage.tsx',
    chat: 'ChatPage.tsx',
    'help-center': 'HelpCenterPage.tsx',
    timeline: 'TimelineActivityPage.tsx',
    status: 'StatusPages.tsx',
    integrations: 'IntegrationsPage.tsx',
    notes: 'NotesMasonryPage.tsx',
    directory: 'UserDirectoryPage.tsx',
    checkout: 'CheckoutPage.tsx',
    blog: 'BlogPage.tsx',
    gallery: 'GalleryPage.tsx',
  };
  const file = map[pageKind];
  if (!file) {
    console.error(`Unknown page "${pageKind}". Available: ${Object.keys(map).join(', ')}`);
    process.exit(1);
  }
  if (framework === 'react') {
    const src = path.join(REPO_ROOT, 'templates', 'components', 'react', 'pages', file);
    const dest = path.join(outDir, 'src', 'features', 'pages', file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    if (pageKind === 'orders') {
      const repoSrc = path.join(REPO_ROOT, 'templates', 'components', 'react', 'data', 'ordersRepository.ts');
      const repoDest = path.join(outDir, 'src', 'features', 'analytics', 'ordersRepository.ts');
      if (fs.existsSync(repoSrc) && !fs.existsSync(repoDest)) {
        fs.mkdirSync(path.dirname(repoDest), { recursive: true });
        fs.copyFileSync(repoSrc, repoDest);
      }
    }
    console.log(`Generated ${pageKind} page template at: ${dest}`);
    return;
  }

  const shellByPage = {
    mail: 'list-detail',
    'file-manager': 'list-detail',
    orders: 'list-detail',
    invoice: 'list-detail',
    kanban: 'board',
    chat: 'stream',
    'ai-chat': 'stream',
    pos: 'pos',
    docs: 'docs-toc',
    'help-center': 'docs-toc',
    notes: 'masonry',
    settings: 'affix-form',
    wizard: 'affix-form',
    'form-layouts': 'affix-form',
  };
  const shell = shellByPage[pageKind] || 'full-canvas';
  const pascal = toPascal(pageKind);

  if (framework === 'vue') {
    const target = path.join(outDir, 'src', 'features', 'pages', `${pascal}Page.vue`);
    const code = `<script setup lang="ts">
import AppShells from '../../@layouts/AppShells.vue';
import Badge from '../../components/ui/Badge.vue';
import Button from '../../components/ui/Button.vue';
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <h1 class="text-xl font-semibold">${pascal}</h1>
          <Badge tone="primary">${shell}</Badge>
        </div>
        <p style="color: var(--color-text-muted)" class="text-sm">${pascal} page composition.</p>
      </div>
      <Button size="sm" variant="solid" tone="primary">Primary Action</Button>
    </div>
    <AppShells kind="${shell}">
      <p style="color: var(--color-text-muted)" class="text-sm">${pascal} workspace (${shell} shell)</p>
    </AppShells>
  </div>
</template>
`;
    writeFile(target, code);
    console.log(`Generated Vue ${pageKind} page template at: ${target}`);
    return;
  }

  if (framework === 'angular') {
    const target = path.join(outDir, 'src', 'features', 'pages', `${pageKind}.page.component.ts`);
    const code = `import { Component } from '@angular/core';
import { AppShellsComponent } from '../../@layouts/app-shells.component';
import { BadgeComponent } from '../../components/ui/badge.component';
import { ButtonComponent } from '../../components/ui/button.component';

@Component({
  selector: 'app-${pageKind}-page',
  standalone: true,
  imports: [AppShellsComponent, BadgeComponent, ButtonComponent],
  template: \`
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-semibold">${pascal}</h1>
            <rd-badge tone="primary">${shell}</rd-badge>
          </div>
          <p style="color: var(--color-text-muted)" class="text-sm">${pascal} page composition.</p>
        </div>
        <rd-button size="sm" variant="solid" tone="primary">Primary Action</rd-button>
      </div>
      <rd-app-shells kind="${shell}">
        <p style="color: var(--color-text-muted)" class="text-sm">${pascal} workspace (${shell} shell)</p>
      </rd-app-shells>
    </div>
  \`,
})
export class ${pascal}PageComponent {}
`;
    writeFile(target, code);
    console.log(`Generated Angular ${pageKind} page template at: ${target}`);
    return;
  }

  console.error(`Unsupported framework "${framework}" for page command. Use react, vue, or angular.`);
  process.exit(1);
}

function generateChart(chartKind, outDir, framework = 'react') {
  if (chartKind === 'shadcn') {
    const uiSrc = path.join(REPO_ROOT, 'templates', 'components', 'react', 'ui', 'ShadcnChart.tsx');
    const exSrc = path.join(REPO_ROOT, 'templates', 'components', 'react', 'examples', 'ShadcnChartExample.tsx');
    const uiDest = path.join(outDir, 'src', 'components', 'ui', 'ShadcnChart.tsx');
    const exDest = path.join(outDir, 'src', 'features', 'charts', 'ShadcnChartExample.tsx');
    fs.mkdirSync(path.dirname(uiDest), { recursive: true });
    fs.mkdirSync(path.dirname(exDest), { recursive: true });
    fs.copyFileSync(uiSrc, uiDest);
    fs.copyFileSync(exSrc, exDest);
    console.log(`Generated Shadcn/Recharts adapter + example at:\n  ${uiDest}\n  ${exDest}\nNote: Install recharts@^3.11.0 (and remove apexcharts to keep a single chart engine).`);
    return;
  }
  if (chartKind === 'all') {
    if (framework !== 'react') {
      console.log(`Chart gallery page is React-first; generating Vue/Angular chart starter for 'area' instead.`);
    } else {
      const src = path.join(REPO_ROOT, 'templates', 'components', 'react', 'pages', 'ChartsGalleryPage.tsx');
      const dest = path.join(outDir, 'src', 'features', 'charts', 'ChartsGalleryPage.tsx');
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      console.log(`Generated full 23-type ChartsGalleryPage at: ${dest}`);
      return;
    }
  }
  const kind = chartKind === 'all' ? 'area' : chartKind;
  const pascal = toPascal(kind);
  if (kind === 'live-line') {
    const ext = framework === 'vue' ? 'vue' : framework === 'angular' ? 'component.ts' : 'tsx';
    const target = path.join(outDir, 'src', 'features', 'charts', `LiveTelemetryChart.${ext}`);
    const content =
      framework === 'vue'
        ? `<script setup lang="ts">\nimport WidgetCard from '../../components/ui/WidgetCard.vue';\nimport LiveChart from '../../components/ui/LiveChart.vue';\n</script>\n\n<template>\n  <WidgetCard title="Live Telemetry" skeleton-variant="chart" allow-fullscreen allow-pin>\n    <LiveChart title="Live Telemetry" :height="300" />\n  </WidgetCard>\n</template>\n`
        : framework === 'angular'
          ? `import { Component } from '@angular/core';\nimport { WidgetCardComponent } from '../../components/ui/widget-card.component';\nimport { LiveChartComponent } from '../../components/ui/live-chart.component';\n\n@Component({\n  selector: 'app-live-telemetry-chart',\n  standalone: true,\n  imports: [WidgetCardComponent, LiveChartComponent],\n  template: \`<rd-widget-card title="Live Telemetry" [allowFullscreen]="true"><rd-live-chart title="Live Telemetry" [height]="300" /></rd-widget-card>\`,\n})\nexport class LiveTelemetryChartComponent {}\n`
          : `'use client';\n\nimport { WidgetCard } from '../../components/ui/WidgetCard';\nimport { LiveChart } from '../../components/ui/LiveChart';\n\nexport function LiveTelemetryChart() {\n  return (\n    <WidgetCard title="Live Telemetry" skeletonVariant="chart" allowFullscreen allowPin>\n      <LiveChart title="Live Telemetry" height={300} />\n    </WidgetCard>\n  );\n}\n`;
    writeFile(target, content);
    console.log(`Generated ${framework} live chart at: ${target}`);
    return;
  }

  const sample = getDefaultChartSpec(kind);
  if (framework === 'vue') {
    const target = path.join(outDir, 'src', 'features', 'charts', `${pascal}Chart.vue`);
    const code = `<script setup lang="ts">\nimport WidgetCard from '../../components/ui/WidgetCard.vue';\nimport ChartWrapper from '../../components/ui/ChartWrapper.vue';\nimport { getChartPreset } from '../../components/ui/chartPresets';\n\nconst series = ${JSON.stringify(sample.series)};\nconst categories = ${JSON.stringify(sample.categories ?? [])};\nconst options = getChartPreset('${kind}');\n</script>\n\n<template>\n  <WidgetCard title="${pascal} Chart" skeleton-variant="chart" allow-fullscreen allow-pin>\n    <ChartWrapper label="${pascal} Chart" type="${sample.type}" :height="300" :categories="categories" :series="series" :options="options" />\n  </WidgetCard>\n</template>\n`;
    writeFile(target, code);
    console.log(`Generated Vue ${kind} chart at: ${target}`);
    return;
  }
  if (framework === 'angular') {
    const target = path.join(outDir, 'src', 'features', 'charts', `${kind}.chart.component.ts`);
    const code = `import { Component } from '@angular/core';\nimport { WidgetCardComponent } from '../../components/ui/widget-card.component';\nimport { ChartWrapperComponent } from '../../components/ui/chart-wrapper.component';\nimport { getChartPreset } from '../../components/ui/chart-presets';\n\n@Component({\n  selector: 'app-${kind}-chart',\n  standalone: true,\n  imports: [WidgetCardComponent, ChartWrapperComponent],\n  template: \`\n    <rd-widget-card title="${pascal} Chart" [allowFullscreen]="true">\n      <rd-chart-wrapper title="${pascal} Chart" type="${sample.type}" [height]="300" [categories]="categories" [series]="series" [options]="options" />\n    </rd-widget-card>\n  \`,\n})\nexport class ${pascal}ChartComponent {\n  readonly categories = ${JSON.stringify(sample.categories ?? [])};\n  readonly series = ${JSON.stringify(sample.series)};\n  readonly options = getChartPreset('${kind}');\n}\n`;
    writeFile(target, code);
    console.log(`Generated Angular ${kind} chart at: ${target}`);
    return;
  }

  const specTarget = path.join(outDir, 'src', 'features', 'charts', `${kind}.charts.ts`);
  const specCode = `import { getChartPreset } from '../../components/ui/chartPresets';\n\nexport const ${kind}ChartSpec = {\n  type: '${sample.type}' as const,\n  height: 300,${sample.categories ? `\n  categories: ${JSON.stringify(sample.categories)},` : ''}\n  series: ${JSON.stringify(sample.series)},\n  options: getChartPreset('${kind}'),\n};\n`;
  writeFile(specTarget, specCode);

  const compTarget = path.join(outDir, 'src', 'features', 'charts', `${pascal}Chart.tsx`);
  const compCode = `'use client';\n\nimport { WidgetCard } from '../../components/ui/WidgetCard';\nimport { ChartWrapper } from '../../components/ui/ChartWrapper';\nimport { ${kind}ChartSpec } from './${kind}.charts';\n\nexport function ${pascal}Chart() {\n  return (\n    <WidgetCard title="${pascal} Chart" skeletonVariant="chart" allowFullscreen allowPin>\n      <ChartWrapper title="${pascal} Chart" {...${kind}ChartSpec} />\n    </WidgetCard>\n  );\n}\n`;
  writeFile(compTarget, compCode);
  console.log(`Generated React ${kind} chart at: ${compTarget}`);
}

function generateForm(formKind, outDir) {
  if (formKind === 'shadcn' || formKind === 'tanstack') {
    const fileName = formKind === 'tanstack' ? 'TanStackFormExample.tsx' : 'ShadcnFormExample.tsx';
    const exSrc = path.join(REPO_ROOT, 'templates', 'components', 'react', 'examples', fileName);
    const exDest = path.join(outDir, 'src', 'features', 'forms', fileName);
    fs.mkdirSync(path.dirname(exDest), { recursive: true });
    fs.copyFileSync(exSrc, exDest);
    console.log(`Generated ${formKind} form example at: ${exDest}`);
    return;
  }
  console.error(`Unknown form preset "${formKind}". Available: shadcn, tanstack`);
  process.exit(1);
}

function generateDataLayer(name, outDir, framework = 'react') {
  const slug = String(name).toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const pascal = slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  const appDir = path.join(outDir, 'src', 'apps', slug);
  const dataDir = path.join(appDir, 'data');
  const storeDir = path.join(appDir, 'store');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(storeDir, { recursive: true });

  fs.writeFileSync(
    path.join(dataDir, 'model.ts'),
    `export interface ${pascal}Item {\n  id: string;\n  title: string;\n  status: 'active' | 'draft' | 'archived';\n  updatedAt: string;\n}\n\nexport interface ${pascal}ListParams {\n  search?: string;\n  status?: string;\n}\n`,
    'utf8',
  );

  fs.writeFileSync(
    path.join(dataDir, 'mock.ts'),
    `import type { ${pascal}Item } from './model';\n\nexport const MOCK_${slug.toUpperCase().replace(/-/g, '_')}_ITEMS: ${pascal}Item[] = [\n  { id: '${slug}-1', title: 'Primary ${pascal} Record', status: 'active', updatedAt: '2026-11-23T10:00:00Z' },\n  { id: '${slug}-2', title: 'Secondary ${pascal} Draft', status: 'draft', updatedAt: '2026-11-22T14:30:00Z' },\n];\n`,
    'utf8',
  );

  fs.writeFileSync(
    path.join(dataDir, 'service.ts'),
    `import type { ${pascal}Item, ${pascal}ListParams } from './model';\nimport { MOCK_${slug.toUpperCase().replace(/-/g, '_')}_ITEMS } from './mock';\n\nconst isLiveMode = (): boolean =>\n  (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_DATA_MODE || process.env.DATA_MODE) === 'live');\n\nexport async function list${pascal}Items(params: ${pascal}ListParams = {}): Promise<${pascal}Item[]> {\n  if (isLiveMode()) {\n    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => Boolean(v)) as [string, string][]);\n    const res = await fetch(\`/api/${slug}\${qs.toString() ? \`?\${qs}\` : ''}\`);\n    if (!res.ok) throw new Error(\`Failed to fetch ${slug}: \${res.status}\`);\n    return (await res.json()) as ${pascal}Item[];\n  }\n  const q = params.search?.toLowerCase().trim();\n  return MOCK_${slug.toUpperCase().replace(/-/g, '_')}_ITEMS.filter(\n    (item) => (!q || item.title.toLowerCase().includes(q)) && (!params.status || item.status === params.status),\n  );\n}\n`,
    'utf8',
  );

  fs.writeFileSync(
    path.join(appDir, 'routes.ts'),
    `export const ${slug.replace(/-/g, '_')}_ROUTES = {\n  root: '/apps/${slug}',\n  detail: (id: string) => \`/apps/${slug}/\${id}\`,\n} as const;\n`,
    'utf8',
  );

  if (framework === 'vue') {
    fs.writeFileSync(
      path.join(storeDir, `${slug}Store.ts`),
      `import { defineStore } from 'pinia';\nimport type { ${pascal}Item } from '../data/model';\n\nexport const use${pascal}Store = defineStore('rd-${slug}', {\n  state: () => ({\n    items: [] as ${pascal}Item[],\n    selectedId: null as string | null,\n    search: '',\n  }),\n  actions: {\n    setItems(items: ${pascal}Item[]) { this.items = items; },\n    select(id: string | null) { this.selectedId = id; },\n  },\n});\n`,
      'utf8',
    );
  } else if (framework === 'angular') {
    fs.writeFileSync(
      path.join(storeDir, `${slug}.store.ts`),
      `import { Injectable, signal } from '@angular/core';\nimport type { ${pascal}Item } from '../data/model';\n\n@Injectable({ providedIn: 'root' })\nexport class ${pascal}Store {\n  readonly items = signal<${pascal}Item[]>([]);\n  readonly selectedId = signal<string | null>(null);\n  readonly search = signal<string>('');\n}\n`,
      'utf8',
    );
  } else {
    fs.writeFileSync(
      path.join(storeDir, `${slug}Store.ts`),
      `'use client';\n\nimport { create } from 'zustand';\nimport type { ${pascal}Item } from '../data/model';\n\nexport interface ${pascal}State {\n  items: ${pascal}Item[];\n  selectedId: string | null;\n  search: string;\n  setItems: (items: ${pascal}Item[]) => void;\n  setSelectedId: (id: string | null) => void;\n  setSearch: (search: string) => void;\n}\n\nexport const use${pascal}Store = create<${pascal}State>()((set) => ({\n  items: [],\n  selectedId: null,\n  search: '',\n  setItems: (items) => set({ items }),\n  setSelectedId: (selectedId) => set({ selectedId }),\n  setSearch: (search) => set({ search }),\n}));\n`,
      'utf8',
    );
  }

  console.log(`Generated production-shaped data-layer (${framework}) at: ${appDir}`);
}

function main() {
  const { positional, flags } = parseOpts(process.argv.slice(2));
  const [command, arg] = positional;
  const outDir = path.resolve(flags.out || process.cwd());

  const framework = flags.framework || 'react';
  if (command === 'vertical' && arg) return generateVertical(arg, outDir, framework);
  if (command === 'chart' && arg) return generateChart(arg, outDir, framework);
  if (command === 'form' && arg) return generateForm(arg, outDir);
  if (command === 'emails') return generateEmails(outDir, flags.brand);
  if (command === 'auth-suite') return generateAuthSuite(outDir, flags.adapter || 'authjs-prisma');
  if (command === 'nav') return generateNav(framework, outDir);
  if (command === 'layout') return generateLayout(framework, outDir);
  if (command === 'data-layer' && arg) return generateDataLayer(arg, outDir, framework);
  if (command === 'app-shell' && arg) {
    generateDataLayer(flags.name || arg, outDir, framework);
    return generateAppShell(arg, flags.name || arg, outDir, framework);
  }
  if (command === 'page' && arg) return generatePage(arg, outDir, framework);

  console.error('Usage: node scripts/generate.mjs <vertical|chart|form|emails|auth-suite|nav|layout|data-layer|app-shell|page> [target] [--framework react|vue|angular|agnostic] --out <project-dir>');
  process.exit(1);
}

main();
