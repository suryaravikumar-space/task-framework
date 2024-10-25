import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://www.nseindia.com/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('NSE - National Stock Exchange of India Ltd: Live Share/Stock Market News & Updates, Quotes- Nseindia.com');

});

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
