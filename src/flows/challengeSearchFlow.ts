import type { Page } from '@playwright/test';
import { testConfig } from '../config/testConfig';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { PlpSearchInterceptor } from '../services/plpSearchInterceptor';

/** Full challenge PLP flow: search → White/Blanco filter → lowest price sort. */
export async function runFilteredSortedSearch(page: Page): Promise<void> {
  const interceptor = new PlpSearchInterceptor();
  const home = new HomePage(page);
  const results = new SearchResultsPage(page);

  await home.open();
  await home.search(testConfig.searchTerm);
  await results.waitForResults();

  await interceptor.waitForSearchResponse(page, () =>
    results.applyColorFilter(testConfig.colorFilter.uiLabel),
  );

  await interceptor.waitForSearchResponse(page, () => results.sortByLowestPrice());
}

/** Measures from search submit until PLP cards are visible (home must already be open). */
export async function runSearchUntilResults(page: Page): Promise<number> {
  const home = new HomePage(page);
  const results = new SearchResultsPage(page);

  await home.open();
  const startedAt = Date.now();
  await home.search(testConfig.searchTerm);
  await results.waitForResults();
  return Date.now() - startedAt;
}
