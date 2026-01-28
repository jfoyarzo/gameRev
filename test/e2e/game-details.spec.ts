import { test, expect } from '@playwright/test';

test('game details flow', async ({ page }) => {
    // 1. Navigate to home
    await page.goto('/');

    // 2. Search for a game
    const searchInput = page.getByPlaceholder('Search games...');
    await searchInput.fill('The Witcher 3');
    await searchInput.press('Enter');

    // 3. Wait for results
    const gameCard = page.locator('a[href*="/game/"]').first();
    await expect(gameCard).toBeVisible({ timeout: 10000 });

    // Get the name of the game to verify later
    const gameTitle = await gameCard.innerText();

    // 4. Click on a game card
    await gameCard.click();

    // 5. Verify navigation to details page
    await expect(page).toHaveURL(/\/game\/\d+/);

    // 6. Verify game details are displayed
    await expect(page.locator('h1')).toBeVisible();

    // Verify Description
    await expect(page.getByRole('heading', { name: /About|Description/i })).toBeVisible();

    // Verify Screenshots or other details
    // Just check if some images are present
    const images = page.locator('img');
    expect(await images.count()).toBeGreaterThan(0);
});
