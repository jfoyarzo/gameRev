import { z } from 'zod';

/**
 * Shared validation schemas for authentication
 * Used across server actions and NextAuth configuration
 */

const MIN_PASSWORD_LENGTH = 6;
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 50;

export const signInSchema = z.object({
    email: z.email('Invalid email format'),
    password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
});

export const signUpSchema = z.object({
    username: z.string()
        .min(MIN_USERNAME_LENGTH, `Username must be at least ${MIN_USERNAME_LENGTH} characters`)
        .max(MAX_USERNAME_LENGTH, `Username must be at most ${MAX_USERNAME_LENGTH} characters`),
    email: z.email('Invalid email format'),
    password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export function getFirstValidationError(error: z.ZodError): string {
    const firstIssue = error.issues[0];
    return firstIssue?.message || 'Validation failed';
}

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
