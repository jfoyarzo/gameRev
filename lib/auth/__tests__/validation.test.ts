import { describe, it, expect } from 'vitest';
import { signInSchema, signUpSchema, getFirstValidationError } from '../validation';
import { z } from 'zod';

describe('Auth Validation Schemas', () => {
    describe('signInSchema', () => {
        it('should validate valid sign in data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123',
            };

            const result = signInSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject invalid email format', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'password123',
            };

            const result = signInSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid email format');
            }
        });

        it('should reject password shorter than minimum length', () => {
            const invalidData = {
                email: 'test@example.com',
                password: '12345', // Only 5 characters
            };

            const result = signInSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('at least 6 characters');
            }
        });

        it('should reject empty email', () => {
            const invalidData = {
                email: '',
                password: 'password123',
            };

            const result = signInSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should reject empty password', () => {
            const invalidData = {
                email: 'test@example.com',
                password: '',
            };

            const result = signInSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('signUpSchema', () => {
        it('should validate valid sign up data', () => {
            const validData = {
                username: 'johndoe',
                email: 'john@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            };

            const result = signUpSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject username shorter than minimum length', () => {
            const invalidData = {
                username: 'ab', // Only 2 characters
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            };

            const result = signUpSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('at least 3 characters');
            }
        });

        it('should reject username longer than maximum length', () => {
            const invalidData = {
                username: 'a'.repeat(51), // 51 characters
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            };

            const result = signUpSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('at most 50 characters');
            }
        });

        it('should reject invalid email format', () => {
            const invalidData = {
                username: 'johndoe',
                email: 'not-an-email',
                password: 'password123',
                confirmPassword: 'password123',
            };

            const result = signUpSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid email format');
            }
        });

        it('should reject password shorter than minimum length', () => {
            const invalidData = {
                username: 'johndoe',
                email: 'test@example.com',
                password: '12345',
                confirmPassword: '12345',
            };

            const result = signUpSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('at least 6 characters');
            }
        });

        it('should reject when passwords do not match', () => {
            const invalidData = {
                username: 'johndoe',
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'different123',
            };

            const result = signUpSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Passwords do not match');
                expect(result.error.issues[0].path).toContain('confirmPassword');
            }
        });

        it('should accept valid username at minimum length', () => {
            const validData = {
                username: 'abc', // Exactly 3 characters
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            };

            const result = signUpSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should accept valid username at maximum length', () => {
            const validData = {
                username: 'a'.repeat(50), // Exactly 50 characters
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            };

            const result = signUpSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });

    describe('getFirstValidationError', () => {
        it('should return first error message from ZodError', () => {
            const invalidData = {
                email: 'invalid-email',
                password: '123',
            };

            const result = signInSchema.safeParse(invalidData);
            if (!result.success) {
                const errorMessage = getFirstValidationError(result.error);
                expect(errorMessage).toBe('Invalid email format');
            }
        });

        it('should return default message for empty error', () => {
            const emptyError = new z.ZodError([]);
            const errorMessage = getFirstValidationError(emptyError);
            expect(errorMessage).toBe('Validation failed');
        });

        it('should return the message from the first issue', () => {
            const invalidData = {
                username: 'ab',
                email: 'invalid',
                password: '123',
                confirmPassword: '456',
            };

            const result = signUpSchema.safeParse(invalidData);
            if (!result.success) {
                const errorMessage = getFirstValidationError(result.error);
                // Should return the first error encountered
                expect(typeof errorMessage).toBe('string');
                expect(errorMessage.length).toBeGreaterThan(0);
            }
        });
    });
});
