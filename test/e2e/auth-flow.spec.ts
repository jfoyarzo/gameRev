import { test, expect } from '@playwright/test';

/**
 * E2E tests for authentication flows
 * Tests sign up, sign in, and sign out user journeys
 */

test.describe('Authentication Flow', () => {
    // Generate unique test user credentials for each test run
    const timestamp = Date.now();
    const testUser = {
        username: `testuser${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'TestPassword123!',
    };

    test.describe('Sign Up Flow', () => {
        test('should successfully sign up with valid credentials', async ({ page }) => {
            // Navigate to sign up page
            await page.goto('/signup');
            await expect(page).toHaveURL(/\/signup/);

            // Fill in the form
            await page.fill('input[name="username"]', testUser.username);
            await page.fill('input[name="email"]', testUser.email);
            await page.fill('input[name="password"]', testUser.password);
            await page.fill('input[name="confirmPassword"]', testUser.password);

            // Submit the form
            await page.click('button[type="submit"]');

            // Should redirect to home page after successful sign up
            await expect(page).toHaveURL('/', { timeout: 10000 });
        });

        test('should show error for invalid email format', async ({ page }) => {
            await page.goto('/signup');

            await page.fill('input[name="username"]', 'testuser');
            await page.fill('input[name="email"]', 'invalid-email');
            await page.fill('input[name="password"]', 'password123');
            await page.fill('input[name="confirmPassword"]', 'password123');

            await page.click('button[type="submit"]');

            // Should show validation error (browser native or custom)
            // Check if still on signup page
            await expect(page).toHaveURL(/\/signup/);
        });

        test('should show error for password mismatch', async ({ page }) => {
            await page.goto('/signup');

            await page.fill('input[name="username"]', 'testuser2');
            await page.fill('input[name="email"]', 'test2@example.com');
            await page.fill('input[name="password"]', 'password123');
            await page.fill('input[name="confirmPassword"]', 'different456');

            await page.click('button[type="submit"]');

            // Should show error message
            await expect(page.getByText(/passwords do not match/i)).toBeVisible({ timeout: 5000 });
        });

        test('should show error for username too short', async ({ page }) => {
            await page.goto('/signup');

            await page.fill('input[name="username"]', 'ab'); // Only 2 characters
            await page.fill('input[name="email"]', 'test3@example.com');
            await page.fill('input[name="password"]', 'password123');
            await page.fill('input[name="confirmPassword"]', 'password123');

            await page.click('button[type="submit"]');

            // Should still be on signup page or show error
            await expect(page).toHaveURL(/\/signup/);
        });

        test('should show error for duplicate email', async ({ page }) => {
            // First, create the user
            await page.goto('/signup');
            const uniqueUser = {
                username: `duplicate${Date.now()}`,
                email: `duplicate${Date.now()}@example.com`,
                password: 'password123',
            };

            await page.fill('input[name="username"]', uniqueUser.username);
            await page.fill('input[name="email"]', uniqueUser.email);
            await page.fill('input[name="password"]', uniqueUser.password);
            await page.fill('input[name="confirmPassword"]', uniqueUser.password);
            await page.click('button[type="submit"]');

            // Wait for redirect
            await expect(page).toHaveURL('/', { timeout: 10000 });

            // Sign out
            const signOutButton = page.getByRole('button', { name: /sign out/i });
            if (await signOutButton.isVisible()) {
                await signOutButton.click();
            }

            // Try to sign up again with same email
            await page.goto('/signup');
            await page.fill('input[name="username"]', 'differentuser');
            await page.fill('input[name="email"]', uniqueUser.email); // Same email
            await page.fill('input[name="password"]', uniqueUser.password);
            await page.fill('input[name="confirmPassword"]', uniqueUser.password);
            await page.click('button[type="submit"]');

            // Should show error message
            await expect(page.getByText(/email already exists/i)).toBeVisible({ timeout: 5000 });
        });

        test('should show error for duplicate username', async ({ page }) => {
            // First, create the user
            await page.goto('/signup');
            const uniqueUser = {
                username: `dupuser${Date.now()}`,
                email: `dupuser${Date.now()}@example.com`,
                password: 'password123',
            };

            await page.fill('input[name="username"]', uniqueUser.username);
            await page.fill('input[name="email"]', uniqueUser.email);
            await page.fill('input[name="password"]', uniqueUser.password);
            await page.fill('input[name="confirmPassword"]', uniqueUser.password);
            await page.click('button[type="submit"]');

            // Wait for redirect
            await expect(page).toHaveURL('/', { timeout: 10000 });

            // Sign out
            const signOutButton = page.getByRole('button', { name: /sign out/i });
            if (await signOutButton.isVisible()) {
                await signOutButton.click();
            }

            // Try to sign up again with same username
            await page.goto('/signup');
            await page.fill('input[name="username"]', uniqueUser.username); // Same username
            await page.fill('input[name="email"]', 'different@example.com');
            await page.fill('input[name="password"]', uniqueUser.password);
            await page.fill('input[name="confirmPassword"]', uniqueUser.password);
            await page.click('button[type="submit"]');

            // Should show error message
            await expect(page.getByText(/username.*taken/i)).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Sign In Flow', () => {
        test.beforeEach(async ({ page }) => {
            // Create a test user before each sign in test
            await page.goto('/signup');
            const uniqueUser = {
                username: `signin${Date.now()}`,
                email: `signin${Date.now()}@example.com`,
                password: 'TestPassword123!',
            };

            await page.fill('input[name="username"]', uniqueUser.username);
            await page.fill('input[name="email"]', uniqueUser.email);
            await page.fill('input[name="password"]', uniqueUser.password);
            await page.fill('input[name="confirmPassword"]', uniqueUser.password);
            await page.click('button[type="submit"]');

            await expect(page).toHaveURL('/', { timeout: 10000 });

            // Sign out before testing sign in
            const signOutButton = page.getByRole('button', { name: /sign out/i });
            if (await signOutButton.isVisible()) {
                await signOutButton.click();
            }

            // Store credentials for this test
            page.context().storageState;
            (page as any).testCredentials = uniqueUser;
        });

        test('should successfully sign in with valid credentials', async ({ page }) => {
            const credentials = (page as any).testCredentials;

            await page.goto('/login');
            await expect(page).toHaveURL(/\/login/);

            await page.fill('input[name="email"]', credentials.email);
            await page.fill('input[name="password"]', credentials.password);
            await page.click('button[type="submit"]');

            // Should redirect to home page
            await expect(page).toHaveURL('/', { timeout: 10000 });
        });

        test('should show error for invalid credentials', async ({ page }) => {
            await page.goto('/login');

            await page.fill('input[name="email"]', 'nonexistent@example.com');
            await page.fill('input[name="password"]', 'wrongpassword');
            await page.click('button[type="submit"]');

            // Should stay on login page or show error
            await expect(page).toHaveURL(/\/login/);
        });

        test('should show error for invalid email format', async ({ page }) => {
            await page.goto('/login');

            await page.fill('input[name="email"]', 'not-an-email');
            await page.fill('input[name="password"]', 'password123');
            await page.click('button[type="submit"]');

            // Browser validation should prevent submission
            await expect(page).toHaveURL(/\/login/);
        });

        test('should redirect away from login when already authenticated', async ({ page }) => {
            const credentials = (page as any).testCredentials;

            // First sign in
            await page.goto('/login');
            await page.fill('input[name="email"]', credentials.email);
            await page.fill('input[name="password"]', credentials.password);
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL('/', { timeout: 10000 });

            // Try to visit login page again
            await page.goto('/login');

            // Should be redirected away from login (middleware check)
            await page.waitForLoadState('networkidle');
            // Either stays at home or immediately redirects
            const currentUrl = page.url();
            expect(currentUrl === '/' || !currentUrl.includes('/login')).toBeTruthy();
        });
    });

    test.describe('Sign Out Flow', () => {
        test('should successfully sign out', async ({ page }) => {
            // Create and sign in user
            await page.goto('/signup');
            const uniqueUser = {
                username: `signout${Date.now()}`,
                email: `signout${Date.now()}@example.com`,
                password: 'TestPassword123!',
            };

            await page.fill('input[name="username"]', uniqueUser.username);
            await page.fill('input[name="email"]', uniqueUser.email);
            await page.fill('input[name="password"]', uniqueUser.password);
            await page.fill('input[name="confirmPassword"]', uniqueUser.password);
            await page.click('button[type="submit"]');

            await expect(page).toHaveURL('/', { timeout: 10000 });

            // Sign out
            const signOutButton = page.getByRole('button', { name: /sign out/i });
            await expect(signOutButton).toBeVisible();
            await signOutButton.click();

            // Should redirect to home page
            await expect(page).toHaveURL('/', { timeout: 10000 });

            // Sign out button should no longer be visible (user is signed out)
            await expect(signOutButton).not.toBeVisible();
        });
    });

    test.describe('Protected Routes', () => {
        test('should deny access to protected routes when not authenticated', async ({ page }) => {
            // Try to access dashboard without authentication
            await page.goto('/dashboard');

            // Should be redirected to login page
            await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
        });

        test('should allow access to protected routes when authenticated', async ({ page }) => {
            // Create and sign in user
            await page.goto('/signup');
            const uniqueUser = {
                username: `protected${Date.now()}`,
                email: `protected${Date.now()}@example.com`,
                password: 'TestPassword123!',
            };

            await page.fill('input[name="username"]', uniqueUser.username);
            await page.fill('input[name="email"]', uniqueUser.email);
            await page.fill('input[name="password"]', uniqueUser.password);
            await page.fill('input[name="confirmPassword"]', uniqueUser.password);
            await page.click('button[type="submit"]');

            await expect(page).toHaveURL('/', { timeout: 10000 });

            // Now try to access protected route
            await page.goto('/dashboard');

            // Should be able to access dashboard
            await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
        });
    });
});
