import type { Page, Response } from '@playwright/test';
import { testConfig } from '../config/testConfig';
import { parsePlpSearchResponse } from './plpResponseParser';
import type { ApiProduct } from '../types/product';

export class PlpSearchInterceptor {
  private latestProducts: ApiProduct[] = [];

  getLatestProducts(): ApiProduct[] {
    return this.latestProducts;
  }

  /**
   * Waits for the PLP search XHR triggered by `trigger`. Only this method reads the
   * response body (Playwright allows a single read per response).
   */
  async waitForSearchResponse(page: Page, trigger: () => Promise<void>): Promise<ApiProduct[]> {
    const [response] = await Promise.all([
      page.waitForResponse(
        (candidate) => this.isPlpSearch(candidate) && candidate.ok(),
        { timeout: 90_000 },
      ),
      trigger(),
    ]);

    return this.storeFromResponse(response);
  }

  private isPlpSearch(response: Response): boolean {
    return response.url().includes(testConfig.plpSearchPath);
  }

  private async storeFromResponse(response: Response): Promise<ApiProduct[]> {
    const json = (await response.json()) as unknown;
    this.latestProducts = parsePlpSearchResponse(json as Parameters<typeof parsePlpSearchResponse>[0]);
    return this.latestProducts;
  }
}
