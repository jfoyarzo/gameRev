import { test, expect } from '@playwright/test';

test('game details flow', async ({ page }) => {
    // Mock OpenCritic API to avoid hitting rate limits and needing real creds in E2E
    await page.route('**/opencritic-api.p.rapidapi.com/**', async route => {
        const url = route.request().url();

        if (url.includes('/game/search')) {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{
                    id: 123,
                    name: 'The Witcher 3: Wild Hunt',
                    dist: 0.1
                }])
            });
        } else if (url.includes('/game/123')) {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 123,
                    name: 'The Witcher 3: Wild Hunt',
                    description: 'The Witcher 3: Wild Hunt is a 2015 action role-playing game developed and published by CD Projekt.',
                    firstReleaseDate: '2015-05-19T00:00:00.000Z',
                    topCriticScore: 92,
                    tier: 'Mighty',
                    images: {
                        box: { og: 'https://example.com/witcher3-box.jpg' },
                        banner: { og: 'https://example.com/witcher3-banner.jpg' }
                    }
                })
            });
        } else {
            await route.continue();
        }
    });

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
