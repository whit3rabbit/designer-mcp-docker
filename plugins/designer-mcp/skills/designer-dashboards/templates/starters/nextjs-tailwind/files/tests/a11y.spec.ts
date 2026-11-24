/**
 * WCAG 2.1 AA Automated Smoke Test Template (Playwright + @axe-core/playwright)
 * Install: pnpm add -D @playwright/test @axe-core/playwright
 * Run:     npx playwright test tests/a11y.spec.ts
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = ['/dashboard/analytics', '/ui/icons', '/ui/styleguide', '/login'];

for (const route of ROUTES) {
  test(`WCAG 2.1 AA audit on ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
