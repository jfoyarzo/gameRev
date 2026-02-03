'use server';

import { signIn, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';

export async function handleSignIn(formData: FormData) {
    try {
        await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
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
