import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

const hits = [];
page.on('response', async (response) => {
  const url = response.url();
  if (!/json|graphql|search|plp|browse|catalog|typeahead|suggest|bff|api/i.test(url)) return;
  const ct = response.headers()['content-type'] || '';
  if (!/json|text\/plain|graphql/i.test(ct) && !/json/i.test(url)) return;
  try {
    const body = await response.text();
    if (body.length < 800) return;
    if (!/product|title|displayName|sku|price|records|plp|name/i.test(body)) return;
    hits.push({ url, status: response.status(), len: body.length });
  } catch {
    /* ignore */
  }
});

await page.goto('https://www.liverpool.com.mx/tienda/home', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
const search = page.locator('input[placeholder*="Buscar"]').first();
await search.fill('playstation 5');
await search.press('Enter');
await page.waitForURL(/s=playstation/i, { timeout: 60000 });
await page.locator('label').filter({ hasText: /^Blanco\s*\(/i }).first().click();
await page.waitForTimeout(4000);
await page.getByRole('button', { name: /Ordenar por/i }).click();
await page.getByText('Menor precio', { exact: true }).click();
await page.waitForTimeout(5000);

console.log(JSON.stringify(hits, null, 2));
await browser.close();
