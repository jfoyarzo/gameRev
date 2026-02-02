import 'server-only';
import { auth } from '@/auth';
import { cache } from 'react';

export const verifySession = cache(async () => {
    const session = await auth();
    if (!session?.user) {
        return null;
    }
    return session;
});

export const getSession = async () => {
    return await verifySession();
};
