import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAuth = vi.fn();
vi.mock('@/auth', () => ({ auth: () => mockAuth() }));
const mockWhere = vi.fn();
const mockSet = vi.fn();
const mockUpdate = vi.fn();
vi.mock('@/lib/db', () => ({
    db: { update: (...args: unknown[]) => mockUpdate(...args) },
}));

vi.mock('@/lib/db/schema', () => ({
    users: Symbol('users'),
}));

vi.mock('next/cache', () => ({
    revalidateTag: vi.fn(),
    revalidatePath: vi.fn(),
}));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn((_col, val) => ({ _eq: val })),
}));

import { updatePreferences } from '@/lib/actions/preferences';
import { revalidateTag, revalidatePath } from 'next/cache';
import type { UserPreferences } from '@/lib/types/preferences';

const VALID_USER_ID = 'user-123';

const validPreferences: UserPreferences = {
    preferredSources: {
        details: ['IGDB', 'RAWG'],
        ratings: ['OpenCritic'],
    },
};

describe('updatePreferences', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Re-wire the mock chain after each reset
        mockWhere.mockResolvedValue(undefined);
        mockSet.mockReturnValue({ where: mockWhere });
        mockUpdate.mockReturnValue({ set: mockSet });
    });

    it('throws when user is not authenticated', async () => {
        mockAuth.mockResolvedValue(null);

        await expect(updatePreferences(validPreferences)).rejects.toThrow('Unauthorized');
    });

    it('throws when session has no user id', async () => {
        mockAuth.mockResolvedValue({ user: {} });

        await expect(updatePreferences(validPreferences)).rejects.toThrow('Unauthorized');
    });

    it('throws on invalid preferences data', async () => {
        mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } });

        const invalidData = {
            preferredSources: {
                details: ['InvalidSource'],
                ratings: ['IGDB'],
            },
        } as unknown as UserPreferences;

        await expect(updatePreferences(invalidData)).rejects.toThrow('Invalid preferences data');
    });

    it('updates the database with validated data', async () => {
        mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } });

        const result = await updatePreferences(validPreferences);

        expect(result).toEqual({ success: true });
        expect(mockUpdate).toHaveBeenCalledOnce();
        expect(mockSet).toHaveBeenCalledWith({ preferences: validPreferences });
        expect(mockWhere).toHaveBeenCalledOnce();
    });

    it('revalidates cache tags and paths after successful update', async () => {
        mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } });

        await updatePreferences(validPreferences);

        expect(revalidateTag).toHaveBeenCalledWith(
            `user-preferences-${VALID_USER_ID}`,
            expect.anything()
        );
        expect(revalidatePath).toHaveBeenCalledWith('/');
        expect(revalidatePath).toHaveBeenCalledWith('/search');
        expect(revalidatePath).toHaveBeenCalledWith('/settings/preferences');
    });

    it('returns error payload when database update fails', async () => {
        mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } });
        mockWhere.mockRejectedValueOnce(new Error('DB connection lost'));

        const result = await updatePreferences(validPreferences);

        expect(result).toEqual({
            success: false,
            error: 'Failed to update preferences',
        });
    });

    it('applies schema defaults when preferredSources is omitted', async () => {
        mockAuth.mockResolvedValue({ user: { id: VALID_USER_ID } });

        const minimalData = {} as UserPreferences;
        const result = await updatePreferences(minimalData);

        expect(result).toEqual({ success: true });
        expect(mockSet).toHaveBeenCalledOnce();
    });
});
