import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.goto('https://www.liverpool.com.mx/tienda?s=playstation%205');
await page.waitForTimeout(5000);
await page.locator('label').filter({ hasText: /^Blanco\s*\(/i }).first().click();
await page.waitForTimeout(2000);
await page.getByRole('button', { name: /Ordenar por/i }).click();
await page.getByText('Menor precio', { exact: true }).click();
await page.waitForTimeout(3000);

const card = page.locator('a[data-testid$="-card-card-link"]').first();
const priceHtml = await card.locator('[data-testid$="-price"]').first().evaluate((el) => el.innerHTML);
console.log(priceHtml);
await browser.close();
