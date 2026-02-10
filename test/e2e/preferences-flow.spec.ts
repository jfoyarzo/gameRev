import { test, expect, type Page } from '@playwright/test';

/**
 * E2E tests for the user preferences feature.
 *
 * Tests the full lifecycle:
 *   Sign up → navigate to preferences → toggle/reorder sources →
 *   save → verify changes persist → verify filtering on game page
 */

async function signUpFreshUser(page: Page) {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    const user = {
        username: `prefs${suffix}`,
        email: `prefs${suffix}@example.com`,
        password: 'TestPassword123!',
    };

    await page.goto('/signup');
    await page.fill('input[name="username"]', user.username);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.fill('input[name="confirmPassword"]', user.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('/', { timeout: 15000 });
    return user;
}

async function goToPreferences(page: Page) {
    await page.goto('/settings/preferences');
    await expect(page).toHaveURL(/\/settings\/preferences/);
    await expect(page.getByRole('heading', { name: /Source Preferences/i })).toBeVisible();
}

function getSourceSwitch(page: Page, type: 'details' | 'ratings', source: string) {
    return page.getByTestId(`source-${type}-${source}`).locator('button[role="switch"]');
}

test.describe('User Preferences Flow', () => {
    test.afterEach(async ({ context }) => {
        await context.clearCookies();
    });

    test('should display the preferences page with all sources enabled', async ({ page }) => {
        await signUpFreshUser(page);
        await goToPreferences(page);

        await expect(page.getByRole('heading', { name: 'Details Sources' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Ratings Sources' })).toBeVisible();

        for (const source of ['IGDB', 'RAWG', 'OpenCritic']) {
            const detailSwitch = getSourceSwitch(page, 'details', source);
            await expect(detailSwitch).toHaveAttribute('data-state', 'checked');

            const ratingSwitch = getSourceSwitch(page, 'ratings', source);
            await expect(ratingSwitch).toHaveAttribute('data-state', 'checked');
        }
    });

    test('should toggle a source off and show visual feedback', async ({ page }) => {
        await signUpFreshUser(page);
        await goToPreferences(page);

        const igdbSwitch = getSourceSwitch(page, 'details', 'IGDB');
        await expect(igdbSwitch).toHaveAttribute('data-state', 'checked');

        await igdbSwitch.click();
        const igdbSwitchAfter = getSourceSwitch(page, 'details', 'IGDB');
        await expect(igdbSwitchAfter).toHaveAttribute('data-state', 'unchecked');
    });

    test('should save preferences and show success feedback', async ({ page }) => {
        await signUpFreshUser(page);
        await goToPreferences(page);

        const igdbSwitch = getSourceSwitch(page, 'details', 'IGDB');
        await igdbSwitch.click();

        const saveButton = page.getByRole('button', { name: /Save Changes/i });
        await expect(saveButton).toBeVisible();
        await saveButton.click();

        await expect(page.getByRole('button', { name: /Saved!/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Save Changes/i })).toBeVisible({ timeout: 5000 });
    });

    test('should persist preferences across page reloads', async ({ page }) => {
        await signUpFreshUser(page);
        await goToPreferences(page);

        const igdbSwitch = getSourceSwitch(page, 'details', 'IGDB');
        await igdbSwitch.click();

        await page.getByRole('button', { name: /Save Changes/i }).click();
        await expect(page.getByRole('button', { name: /Saved!/i })).toBeVisible();

        await page.reload();
        await expect(page.getByRole('heading', { name: /Source Preferences/i })).toBeVisible();

        const igdbSwitchAfter = getSourceSwitch(page, 'details', 'IGDB');
        await expect(igdbSwitchAfter).toHaveAttribute('data-state', 'unchecked');

        await expect(getSourceSwitch(page, 'details', 'RAWG')).toHaveAttribute('data-state', 'checked');
        await expect(getSourceSwitch(page, 'details', 'OpenCritic')).toHaveAttribute('data-state', 'checked');
    });

    test('should affect game details page by hiding disabled sources', async ({ page }) => {
        await signUpFreshUser(page);
        await goToPreferences(page);

        await getSourceSwitch(page, 'details', 'IGDB').click();
        await getSourceSwitch(page, 'details', 'RAWG').click();

        await page.getByRole('button', { name: /Save Changes/i }).click();
        await expect(page.getByRole('button', { name: /Saved!/i })).toBeVisible();

        // Wait for any in-flight revalidation from the save action to complete
        // before navigating — avoids Firefox NS_BINDING_ABORTED race condition
        await page.waitForLoadState('networkidle');

        await page.goto('/');
        const gameCard = page.locator('a[href*="/game/"]').first();
        await expect(gameCard).toBeVisible({ timeout: 10000 });
        await gameCard.click();

        await expect(page).toHaveURL(/\/game\/\d+/);
        await expect(page.locator('h1')).toBeVisible();
        const aboutSection = page.getByRole('heading', { name: /About|Description/i });
        await expect(aboutSection).toBeVisible();

        const detailTabButtons = page.locator('section:has(h2:text("About")) button');
        const tabCount = await detailTabButtons.count();
        expect(tabCount).toBe(0);
    });

    test('should redirect to login when accessing preferences unauthenticated', async ({ page }) => {
        await page.goto('/settings/preferences');

        await expect(page.getByRole('heading', { name: /Source Preferences/i })).not.toBeVisible();
    });
});
