import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyRecaptcha } from '../recaptcha';

// Mock the config
vi.mock('@/lib/dal/config', () => ({
    appConfig: {
        recaptcha: {
            secretKey: 'test-secret-key',
        },
    },
}));

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('reCAPTCHA Verification', () => {
    beforeEach(() => {
        // Set to production so we actually test the verification logic
        vi.stubEnv('NODE_ENV', 'production');

        vi.clearAllMocks();
        fetchMock.mockReset();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('should successfully verify token with good score', async () => {
        const mockResponse = {
            success: true,
            score: 0.9,
            challenge_ts: '2024-01-01T00:00:00Z',
            hostname: 'localhost',
        };

        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await verifyRecaptcha('valid-token');

        expect(result.success).toBe(true);
        expect(result.score).toBe(0.9);
        expect(result.error).toBeUndefined();

        // Verify fetch was called with correct parameters
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            'https://www.google.com/recaptcha/api/siteverify',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
        );
    });

    it('should reject token with score below threshold', async () => {
        const mockResponse = {
            success: true,
            score: 0.3, // Below 0.5 threshold
            challenge_ts: '2024-01-01T00:00:00Z',
            hostname: 'localhost',
        };

        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await verifyRecaptcha('low-score-token');

        expect(result.success).toBe(false);
        expect(result.score).toBe(0.3);
        expect(result.error).toBe('Suspicious activity detected. Please try again.');
    });

    it('should accept token with score at threshold', async () => {
        const mockResponse = {
            success: true,
            score: 0.5, // Exactly at threshold
            challenge_ts: '2024-01-01T00:00:00Z',
            hostname: 'localhost',
        };

        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await verifyRecaptcha('threshold-token');

        expect(result.success).toBe(true);
        expect(result.score).toBe(0.5);
    });

    it('should handle reCAPTCHA API returning success: false', async () => {
        const mockResponse = {
            success: false,
            'error-codes': ['invalid-input-secret', 'timeout-or-duplicate'],
        };

        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await verifyRecaptcha('invalid-token');

        expect(result.success).toBe(false);
        expect(result.error).toBe('reCAPTCHA verification failed');
    });

    it('should handle HTTP error response', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        const result = await verifyRecaptcha('token');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to verify reCAPTCHA');
    });

    it('should handle network errors', async () => {
        fetchMock.mockRejectedValueOnce(new Error('Network error'));

        const result = await verifyRecaptcha('token');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to verify reCAPTCHA');
    });

    it('should handle missing score in response', async () => {
        const mockResponse = {
            success: true,
            // No score field
            challenge_ts: '2024-01-01T00:00:00Z',
            hostname: 'localhost',
        };

        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await verifyRecaptcha('token');

        // Should succeed if score is undefined (not checked)
        expect(result.success).toBe(true);
        expect(result.score).toBeUndefined();
    });

    it('should handle error codes without message', async () => {
        const mockResponse = {
            success: false,
            // No error-codes field
        };

        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await verifyRecaptcha('token');

        expect(result.success).toBe(false);
        expect(result.error).toBe('reCAPTCHA verification failed');
    });
});
