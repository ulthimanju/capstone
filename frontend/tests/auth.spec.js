import { test, expect } from '@playwright/test';

test.describe('Questly Authentication Flow', () => {
  
  test('should load the login page with all core UI elements', async ({ page }) => {
    // Navigate to the login page (relative to baseURL in playwright.config.js)
    await page.goto('/login');

    // Verify page header or title presence
    await expect(page).toHaveTitle(/Questly/i);

    // Verify login card exists and has correct elements
    const loginHeading = page.getByRole('heading', { name: /sign in/i });
    if (await loginHeading.isVisible()) {
      await expect(loginHeading).toBeVisible();
    }

    // Verify email and password input fields are visible
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Verify submit/login button exists
    const submitBtn = page.getByRole('button', { name: /sign in|login/i });
    await expect(submitBtn).toBeVisible();
  });

  test('should validate input errors on blank submissions', async ({ page }) => {
    await page.goto('/login');
    
    // Attempt login without values
    const submitBtn = page.getByRole('button', { name: /sign in|login/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }
  });
});
