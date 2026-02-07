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
    timeout: 30000, // 30 seconds max per test - increased for CI environments
    expect: {
        timeout: 10000, // 10 seconds max for assertions - increased for CI
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
    webServer: [
        {
            command: 'TS_NODE_PROJECT=tsconfig.json npx tsx test/mocks/standalone-server.ts',
            url: 'http://localhost:4000',
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
        },
        {
            command: 'npm run dev',
            url: 'http://localhost:3000',
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
            env: {
                ...Object.fromEntries(
                    Object.entries(process.env).filter(([_, v]) => v !== undefined)
                ) as Record<string, string>,
                // Redirect API calls to the standalone mock server
                IGDB_BASE_URL: 'http://localhost:4000/v4',
                RAWG_BASE_URL: 'http://localhost:4000/api',
                OPENCRITIC_BASE_URL: 'http://localhost:4000',
                TWITCH_ID_URL: 'http://localhost:4000',
                NEXT_PUBLIC_API_MOCKING: 'enabled',
            },
        }
    ],
});
