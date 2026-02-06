'use server';

import { signIn, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { signInSchema, signUpSchema, getFirstValidationError } from '@/lib/auth/validation';
import { verifyRecaptcha } from '@/lib/auth/recaptcha';

export async function handleSignIn(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validationResult = signInSchema.safeParse({ email, password });

    if (!validationResult.success) {
        const errorMessage = getFirstValidationError(validationResult.error);
        throw new Error(errorMessage);
    }

    try {
        await signIn('credentials', {
            email,
            password,
            redirect: false,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    throw new Error('Invalid email or password');
                default:
                    throw new Error('An error occurred during sign in');
            }
        }
        throw error;
    }
    redirect('/');
}

export async function handleSignUp(formData: FormData) {
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const recaptchaToken = formData.get('recaptchaToken') as string;
    const isE2EMocking = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';

    if (process.env.NODE_ENV === 'production' && !isE2EMocking) {
        if (!recaptchaToken || recaptchaToken === 'bypass') {
            throw new Error('reCAPTCHA verification is required');
        }

        const recaptchaResult = await verifyRecaptcha(recaptchaToken);
        if (!recaptchaResult.success) {
            throw new Error(recaptchaResult.error || 'reCAPTCHA verification failed');
        }
    }

    const validationResult = signUpSchema.safeParse({
        username,
        email,
        password,
        confirmPassword,
    });

    if (!validationResult.success) {
        const errorMessage = getFirstValidationError(validationResult.error);
        throw new Error(errorMessage);
    }

    const existingUserByEmail = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUserByEmail) {
        throw new Error('An account with this email already exists');
    }

    const existingUserByUsername = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, username),
    });

    if (existingUserByUsername) {
        throw new Error('This username is already taken');
    }

    const passwordHash = await hashPassword(password);

    try {
        await db.insert(users).values({
            username,
            email,
            password_hash: passwordHash,
        });
    } catch (error) {
        // Define Postgres error shape
        const pgError = error as { code?: string; constraint_name?: string; detail?: string };

        if (pgError.code === '23505') {
            if (pgError.constraint_name?.includes('email') || pgError.detail?.includes('email')) {
                throw new Error('An account with this email already exists');
            }
            if (pgError.constraint_name?.includes('username') || pgError.detail?.includes('username')) {
                throw new Error('This username is already taken');
            }
        }
        throw new Error('An error occurred during account creation');
    }

    try {
        await signIn('credentials', {
            email,
            password,
            redirect: false,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            throw error;
        }
        throw error;
    }

    redirect('/');
}

export async function handleSignOut() {
    await signOut({ redirectTo: '/' });
}
