import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../password';

describe('Password Utility Functions', () => {
    describe('hashPassword', () => {
        it('should generate a bcrypt hash', async () => {
            const password = 'testPassword123';
            const hash = await hashPassword(password);

            // Bcrypt hashes start with $2a$ or $2b$
            expect(hash).toMatch(/^\$2[ab]\$/);
            expect(hash.length).toBeGreaterThan(50);
        });

        it('should generate different hashes for the same password', async () => {
            const password = 'testPassword123';
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);

            // Different salts should produce different hashes
            expect(hash1).not.toBe(hash2);
        });
    });

    describe('verifyPassword', () => {
        it('should return true for matching password', async () => {
            const password = 'testPassword123';
            const hash = await hashPassword(password);

            const result = await verifyPassword(password, hash);
            expect(result).toBe(true);
        });

        it('should return false for incorrect password', async () => {
            const password = 'testPassword123';
            const wrongPassword = 'wrongPassword';
            const hash = await hashPassword(password);

            const result = await verifyPassword(wrongPassword, hash);
            expect(result).toBe(false);
        });

        it('should handle empty password', async () => {
            const password = '';
            const hash = await hashPassword(password);

            const result = await verifyPassword(password, hash);
            expect(result).toBe(true);
        });

        it('should be case sensitive', async () => {
            const password = 'TestPassword123';
            const hash = await hashPassword(password);

            const result = await verifyPassword('testpassword123', hash);
            expect(result).toBe(false);
        });
    });
});
