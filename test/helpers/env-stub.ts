import { vi } from 'vitest';

/**
 * Test helper to automatically stub all required environment variables
 * used by the app config (lib/dal/config.ts).
 * 
 * This prevents the need to manually update test setup when new env vars are added.
 */

const ENV_VAR_MOCKS: Record<string, string> = {
    TWITCH_CLIENT_ID: 'test_twitch_id',
    TWITCH_CLIENT_SECRET: 'test_twitch_secret',
    RAWG_API_KEY: 'test_rawg_key',
    OPENCRITIC_API_KEY: 'test_opencritic_key',
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: 'test_recaptcha_site_key',
    RECAPTCHA_SECRET_KEY: 'test_recaptcha_secret_key',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
};

/**
 * Stub all required environment variables for tests.
 * Call this in vitest.setup.ts to ensure all env vars are available.
 */
export function stubAllEnvVars(): void {
    Object.entries(ENV_VAR_MOCKS).forEach(([key, value]) => {
        vi.stubEnv(key, value);
    });
}

/**
 * Get a mock value for a specific environment variable.
 * Useful for individual test assertions.
 */
export function getMockEnvVar(key: string): string | undefined {
    return ENV_VAR_MOCKS[key];
}
