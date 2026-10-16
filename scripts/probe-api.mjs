import { chromium } from '@playwright/test';
import fs from 'fs';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
let lastSearchBody = null;

page.on('response', async (response) => {
  if (response.url().includes('/api/plp/search') && response.status() === 200) {
    lastSearchBody = await response.text();
  }
});

await page.goto('https://www.liverpool.com.mx/tienda/home', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);
await page.locator('input[placeholder*="Buscar"]').first().fill('playstation 5');
await page.locator('input[placeholder*="Buscar"]').first().press('Enter');
await page.waitForURL(/s=playstation/i);
await page.waitForTimeout(3000);
fs.writeFileSync('scripts/search-response-1.json', lastSearchBody ?? 'null');

await page.locator('label').filter({ hasText: /^Blanco\s*\(/i }).first().click();
await page.waitForTimeout(4000);
fs.writeFileSync('scripts/search-response-2.json', lastSearchBody ?? 'null');

await page.getByRole('button', { name: /Ordenar por/i }).click();
await page.getByText('Menor precio', { exact: true }).click();
await page.waitForTimeout(5000);
fs.writeFileSync('scripts/search-response-3.json', lastSearchBody ?? 'null');

if (lastSearchBody) {
  const json = JSON.parse(lastSearchBody);
  console.log('top keys', Object.keys(json));
  const products = json.records ?? json.products ?? json.plpResults ?? json.data?.records;
  console.log('products sample keys', products?.[0] ? Object.keys(products[0]) : 'none');
  console.log('count', products?.length);
}

await browser.close();
