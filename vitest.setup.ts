import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock server-only to avoid errors in tests
vi.mock('server-only', () => { return {}; });

// Stub env vars
vi.stubEnv('TWITCH_CLIENT_ID', 'test_id');
vi.stubEnv('TWITCH_CLIENT_SECRET', 'test_secret');
vi.stubEnv('RAWG_API_KEY', 'test_key');

afterEach(() => {
    cleanup();
});
