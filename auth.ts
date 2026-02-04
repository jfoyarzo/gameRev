import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db } from "@/lib/db";
import { verifyPassword } from '@/lib/auth/password';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    const user = await db.query.users.findFirst({
                        where: (users, { eq }) => eq(users.email, email),
                    });

                    if (!user || !user.password_hash) return null;

                    const isValidPassword = await verifyPassword(password, user.password_hash);

                    if (!isValidPassword) return null;

                    return {
                        id: user.id,
                        name: user.username,
                        email: user.email,
                        image: user.avatar_url,
                    };
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
