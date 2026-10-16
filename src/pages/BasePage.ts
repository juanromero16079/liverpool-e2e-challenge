import type { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async dismissBlockingOverlays(): Promise<void> {
    const candidates = [/Aceptar/i, /Entendido/i, /Cerrar/i, /Continuar/i, /close/i];
    for (const pattern of candidates) {
      const button = this.page.getByRole('button', { name: pattern }).first();
      if (await button.isVisible().catch(() => false)) {
        await button.click().catch(() => undefined);
      }
    }

    const cookieClose = this.page
      .locator('button')
      .filter({ has: this.page.locator('svg, img') })
      .filter({ hasText: /^$/ })
      .first();
    if (await cookieClose.isVisible().catch(() => false)) {
      await cookieClose.click().catch(() => undefined);
    }
  }

  protected async assertNotBlocked(): Promise<void> {
    const title = await this.page.title();
    if (/access denied/i.test(title)) {
      throw new Error(
        'Liverpool blocked this browser session (Akamai). Re-run with HEADED=1 (see README).',
      );
    }
  }
}
