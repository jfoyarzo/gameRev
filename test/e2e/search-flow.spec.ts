import { test, expect } from '@playwright/test';

test('search flow', async ({ page }) => {
    // Note: API calls are mocked server-side via E2E_TEST environment variable
    // No need for browser-level mocking as Next.js Server Components make API calls on the server

    // 1. Visit Homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/GameRev/i);

    // 2. Perform Search
    const searchInput = page.getByPlaceholder('Search games...');
    await searchInput.fill('Hades');
    await searchInput.press('Enter');

    // 3. Verify Search Results Page
    await expect(page).toHaveURL(/\/search\?q=Hades/);
    await expect(page.getByText('Hades II', { exact: false }).first()).toBeVisible();

    // 4. Navigate to Details
    // Click the first game card that contains "Hades"
    await page.getByText('Hades II', { exact: false }).first().click();

    // 5. Verify Details Page
    // URL should contain game ID or slug
    await expect(page).toHaveURL(/\/game\//);
    // Should show game title
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
