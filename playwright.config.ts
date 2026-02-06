import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './test/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 0, // No retries - fail fast to surface real issues
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
    },
    timeout: 10000, // 10 seconds max per test - fail fast
    expect: {
        timeout: 5000, // 5 seconds max for assertions
    },
    projects: process.env.CI
        ? [
            {
                name: 'chromium',
                use: { ...devices['Desktop Chrome'] },
            },
        ]
        : [
            {
                name: 'chromium',
                use: { ...devices['Desktop Chrome'] },
            },
            {
                name: 'firefox',
                use: { ...devices['Desktop Firefox'] },
            },
            {
                name: 'webkit',
                use: { ...devices['Desktop Safari'] },
            },
        ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000, // 2 minutes max to start server
        stderr: 'pipe', // Show server errors
        env: Object.fromEntries(
            Object.entries(process.env).filter(([_, v]) => v !== undefined)
        ) as Record<string, string>,
    },
});
