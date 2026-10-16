import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.goto('https://www.liverpool.com.mx/tienda?s=playstation%205');
await page.waitForTimeout(5000);
const card = page.locator('a[data-testid$="-card-card-link"]').first();
const info = await card.evaluate((el) => {
  const section = el.querySelector('section');
  return {
    headings: Array.from(el.querySelectorAll('h2,h3,p,span')).map((n) => ({
      tag: n.tagName,
      class: n.className,
      text: n.textContent?.trim().slice(0, 80),
    })).slice(0, 15),
    imgAlt: el.querySelector('img')?.getAttribute('alt'),
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
