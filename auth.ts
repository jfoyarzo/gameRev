import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { db } from "@/lib/db";
import { verifyPassword } from '@/lib/auth/password';
import { signInSchema } from '@/lib/auth/validation';

/** Maximum session duration in seconds (4 hours) - OWASP recommended */
const SESSION_MAX_AGE_SECONDS = 4 * 60 * 60;

/** Session refresh interval in seconds (30 minutes) - updates active sessions */
const SESSION_UPDATE_AGE_SECONDS = 30 * 60;

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    session: {
        strategy: "jwt",
        maxAge: SESSION_MAX_AGE_SECONDS,
        updateAge: SESSION_UPDATE_AGE_SECONDS,
    },
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id && session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = signInSchema.safeParse(credentials);

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
