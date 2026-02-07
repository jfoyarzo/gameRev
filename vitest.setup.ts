import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { stubAllEnvVars } from './test/helpers/env-stub';

// Mock server-only to avoid errors in tests
vi.mock('server-only', () => { return {}; });

// Stub all required environment variables
stubAllEnvVars();

afterEach(() => {
    cleanup();
});
