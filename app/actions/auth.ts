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
            throw error;
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

    if (!recaptchaToken) {
        throw new Error('reCAPTCHA verification is required');
    }

    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaResult.success) {
        throw new Error(recaptchaResult.error || 'reCAPTCHA verification failed');
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

    await db.insert(users).values({
        username,
        email,
        password_hash: passwordHash,
    });

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
