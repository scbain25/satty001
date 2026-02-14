import { test, expect } from '@playwright/test';

/**
 * Small smoke test: verifies we can load a page and interact via role-based locators.
 * Uses getByRole as per repo testing rules.
 */
test('homepage loads and has expected content', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  await expect(page).toHaveTitle(/Playwright/);

  const nav = page.getByRole('navigation');
  await expect(nav).toBeVisible();

  const getStarted = page.getByRole('link', { name: 'Get started' });
  await expect(getStarted).toBeVisible();
  await getStarted.click();

  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
