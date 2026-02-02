import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    // MOCKED USER FOR TESTING
                    // In a real app, you would query your database here.
                    if (email === 'test@example.com' && password === 'password123') {
                        return {
                            id: '1',
                            name: 'Test User',
                            email: 'test@example.com',
                        };
                    }
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
