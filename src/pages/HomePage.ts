import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  private readonly searchInput = this.page.locator('input[placeholder*="Buscar"]').first();

  async open(): Promise<void> {
    await this.page.goto('/tienda/home', { waitUntil: 'domcontentloaded' });
    await this.dismissBlockingOverlays();
    await this.assertNotBlocked();
    await expect(this.searchInput).toBeVisible({ timeout: 60_000 });
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter');
    await Promise.race([
      this.page.waitForURL(/[?&]s=/i, { timeout: 60_000 }),
      this.page
        .locator('a[data-testid$="-card-card-link"]')
        .first()
        .waitFor({ state: 'visible', timeout: 60_000 }),
    ]).catch(async () => {
      await this.searchInput.press('Enter');
      await this.page.waitForURL(/[?&]s=/i, { timeout: 60_000 });
    });
    await this.assertNotBlocked();
  }
}
