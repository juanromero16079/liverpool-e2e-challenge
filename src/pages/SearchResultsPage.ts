import { expect } from '@playwright/test';
import { testConfig } from '../config/testConfig';
import type { UiProduct } from '../types/product';
import { parseMexicanPrice } from '../utils/price';
import { BasePage } from './BasePage';

export class SearchResultsPage extends BasePage {
  private readonly productCards = this.page.locator('a[data-testid$="-card-card-link"]');

  async waitForResults(): Promise<void> {
    await expect(this.productCards.first()).toBeVisible({ timeout: 60_000 });
  }

  async applyColorFilter(uiColorLabel: string): Promise<void> {
    await this.dismissBlockingOverlays();

    const colorOption = new RegExp(`${uiColorLabel}\\s*\\(`, 'i');
    const colorCheckbox = this.page.getByRole('checkbox', { name: colorOption });
    const colorGroup = this.page.getByRole('button', { name: /^Color$/i });

    if (!(await colorCheckbox.first().isVisible().catch(() => false))) {
      await colorGroup.scrollIntoViewIfNeeded();
      await colorGroup.click();
      await expect(colorCheckbox.first()).toBeVisible({ timeout: 30_000 });
    }

    await colorCheckbox.first().scrollIntoViewIfNeeded();
    await colorCheckbox.first().click({ force: true });
    await this.waitForResults();
  }

  async sortByLowestPrice(): Promise<void> {
    await this.dismissBlockingOverlays();
    const sortButton = this.page.getByRole('button', { name: /Ordenar por/i });
    await sortButton.scrollIntoViewIfNeeded();
    await sortButton.click();
    await this.page
      .getByText(testConfig.sortByLowestPriceLabel, { exact: true })
      .filter({ visible: true })
      .first()
      .click();
    await this.waitForResults();
  }

  async extractTopProducts(count: number): Promise<UiProduct[]> {
    await this.waitForResults();
    const cards = this.productCards;
    await expect(cards).toHaveCount(await cards.count());

    const total = Math.min(count, await cards.count());
    const products: UiProduct[] = [];

    for (let index = 0; index < total; index += 1) {
      const card = cards.nth(index);
      const testId = (await card.getAttribute('data-testid')) ?? '';
      const productId = testId.replace('-card-card-link', '');
      const name = (await card.locator('h3').first().innerText()).trim();
      const priceRoot = card.locator(`[data-testid="${productId}-price"]`);
      const priceDisplay = (
        await priceRoot.evaluate((root) => {
          const discounted = root.querySelector('[data-testid="discounted"]');
          const primary =
            discounted ?? root.querySelector('.text-price-primary') ?? root;
          return (primary.textContent ?? '').replace(/\s/g, '');
        })
      ).trim();
      const price = parseMexicanPrice(priceDisplay);

      products.push({ productId, name, price, priceDisplay });
    }

    return products;
  }
}
