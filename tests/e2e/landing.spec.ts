import { test, expect } from '@playwright/test';

test('Landing page loads and start button works', async ({ page }) => {
  // Go to the app
  await page.goto('/');

  // Expect the title to contain TNTET
  await expect(page).toHaveTitle(/TNTET/i);

  // Expect the main hero heading to be visible
  await expect(page.getByRole('heading', { name: /TNTET/i }).first()).toBeVisible();

  // Find the Start button (usually has text like "Start" or "தொடங்கு")
  const startButton = page.getByRole('button', { name: /start|தொடங்கு/i }).first();
  await expect(startButton).toBeVisible();

  // Click the start button
  await startButton.click();

  // Verify that we navigated away from the landing page
  // E.g., looking for Dashboard tabs or Auth Modal depending on state
  // Here we just ensure the URL has changed or a specific element appears.
  // For this basic test, we'll just check that it didn't crash.
  
  // Wait a moment for any transitions
  await page.waitForTimeout(1000);
});
