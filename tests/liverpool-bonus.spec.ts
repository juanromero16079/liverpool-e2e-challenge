import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { testConfig } from '../src/config/testConfig';
import { runFilteredSortedSearch, runSearchUntilResults } from '../src/flows/challengeSearchFlow';

test.describe('Liverpool bonus checks', () => {
  test.describe.configure({ mode: 'serial' });
  test('visual regression on filtered search results page', async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    await runFilteredSortedSearch(page);

    const productGrid = page.locator('a[data-testid$="-card-card-link"]').first();
    await expect(productGrid).toBeVisible({ timeout: 60_000 });

    await expect(page).toHaveScreenshot('plp-search-results-viewport.png', {
      fullPage: false,
      timeout: 60_000,
      mask: [
        page.locator('[data-testid$="-price"]'),
        page.locator('[data-testid$="-rating"]'),
        page.locator('[data-testid$="-image-slider"]'),
      ],
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    });

    testInfo.annotations.push({ type: 'visual', description: 'Viewport snapshot; prices/images masked' });
  });

  test('accessibility scan reports axe-core violations', async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    await runFilteredSortedSearch(page);

    const axeResults = await new AxeBuilder({ page })
      .include('main')
      .exclude('[data-testid*="pagination"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const summary = axeResults.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      nodes: violation.nodes.length,
    }));

    console.log('\n--- axe-core violations ---');
    console.log(JSON.stringify(summary, null, 2));
    console.log(
      `Total: ${axeResults.violations.length} | Critical: ${summary.filter((v) => v.impact === 'critical').length} | Serious: ${summary.filter((v) => v.impact === 'serious').length}`,
    );

    await testInfo.attach('axe-violations.json', {
      body: JSON.stringify(axeResults.violations, null, 2),
      contentType: 'application/json',
    });

    expect(Array.isArray(axeResults.violations)).toBe(true);
    expect(
      axeResults.violations.filter((v) => v.impact === 'critical'),
      'Critical violations after excluding pagination controls',
    ).toEqual([]);
  });

  test('search results page loads within configured threshold', async ({ page }) => {
    test.setTimeout(180_000);
    const loadMs = await runSearchUntilResults(page);

    console.log(`\nSearch results load time: ${loadMs} ms (limit: ${testConfig.maxSearchResultsLoadMs} ms)`);
    expect(loadMs).toBeLessThanOrEqual(testConfig.maxSearchResultsLoadMs);
  });
});
