import { test, expect } from '@playwright/test';
import { testConfig } from '../src/config/testConfig';
import { HomePage } from '../src/pages/HomePage';
import { SearchResultsPage } from '../src/pages/SearchResultsPage';
import { PlpSearchInterceptor } from '../src/services/plpSearchInterceptor';
import { ProductCrossValidator } from '../src/services/productCrossValidator';
import { runFilteredSortedSearch } from '../src/flows/challengeSearchFlow';

test.describe('Liverpool PLP search flow', () => {
  test('search, filter, sort, and cross-validate UI vs API', async ({ page }) => {
    test.setTimeout(180_000);
    const interceptor = new PlpSearchInterceptor();

    const home = new HomePage(page);
    const results = new SearchResultsPage(page);
    const validator = new ProductCrossValidator();

    await home.open();
    await home.search(testConfig.searchTerm);
    await results.waitForResults();

    await interceptor.waitForSearchResponse(page, () =>
      results.applyColorFilter(testConfig.colorFilter.uiLabel),
    );

    await interceptor.waitForSearchResponse(page, () => results.sortByLowestPrice());

    const uiProducts = await results.extractTopProducts(testConfig.resultsCount);
    const apiProducts = interceptor.getLatestProducts();

    console.log('\n--- Top UI results ---');
    uiProducts.forEach((product, index) => {
      console.log(
        `${index + 1}. ${product.name} | ${product.priceDisplay} (id: ${product.productId})`,
      );
    });

    expect(uiProducts).toHaveLength(testConfig.resultsCount);
    expect(apiProducts.length).toBeGreaterThanOrEqual(testConfig.resultsCount);

    const { matchedCount, discrepancies } = validator.validate(uiProducts, apiProducts);

    if (discrepancies.length > 0) {
      console.log('\n--- UI vs API discrepancies ---');
      discrepancies.forEach((item) => {
        console.log(
          `[${item.productId}] ${item.reason} | UI: "${item.uiName}" $${item.uiPrice}` +
            (item.apiTitle ? ` | API: "${item.apiTitle}" $${item.apiPrice}` : ''),
        );
      });
    }

    expect(matchedCount).toBeGreaterThanOrEqual(testConfig.minUiResultsInApiResponse);

    for (let index = 1; index < uiProducts.length; index += 1) {
      expect(uiProducts[index - 1].price).toBeLessThanOrEqual(uiProducts[index].price);
    }
  });

  test('data-driven search term via SEARCH_TERM env', async ({ page }) => {
    test.skip(
      !process.env.SEARCH_TERM || process.env.SEARCH_TERM === 'playstation 5',
      'Set SEARCH_TERM to a different value to run this variant',
    );
    test.setTimeout(180_000);
    await runFilteredSortedSearch(page);
    await expect(page.locator('a[data-testid$="-card-card-link"]').first()).toBeVisible();
  });
});
