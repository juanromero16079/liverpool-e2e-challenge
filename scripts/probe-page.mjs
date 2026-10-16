import { chromium } from '@playwright/test';

const browser = await chromium.launch({
  headless: true,
  args: [
    '--disable-blink-features=AutomationControlled',
    '--disable-dev-shm-usage',
    '--no-sandbox',
  ],
});
const context = await browser.newContext({
  locale: 'es-MX',
  timezoneId: 'America/Mexico_City',
  viewport: { width: 1366, height: 768 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
});
const page = await context.newPage();
await page.goto('https://www.liverpool.com.mx/tienda/home', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);
console.log({ title: await page.title(), inputs: await page.locator('input').count() });
await browser.close();
