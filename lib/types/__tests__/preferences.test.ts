import { describe, it, expect } from 'vitest';
import { UserPreferencesSchema } from '../preferences';

describe('UserPreferencesSchema', () => {
    describe('valid inputs', () => {
        it('accepts a fully specified preferences object', () => {
            const input = {
                preferredSources: {
                    details: ['IGDB', 'RAWG', 'OpenCritic'],
                    ratings: ['OpenCritic', 'IGDB'],
                },
            };

            const result = UserPreferencesSchema.safeParse(input);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(input);
        });

        it('accepts an empty preferredSources (optional field)', () => {
            const result = UserPreferencesSchema.safeParse({});

            expect(result.success).toBe(true);
            expect(result.data?.preferredSources).toBeUndefined();
        });

        it('applies default adapter lists when details/ratings are omitted', () => {
            const result = UserPreferencesSchema.safeParse({
                preferredSources: {},
            });

            expect(result.success).toBe(true);
            expect(result.data?.preferredSources?.details).toEqual(['IGDB', 'RAWG', 'OpenCritic']);
            expect(result.data?.preferredSources?.ratings).toEqual(['IGDB', 'RAWG', 'OpenCritic']);
        });

        it('accepts a single adapter in details and ratings', () => {
            const input = {
                preferredSources: {
                    details: ['IGDB'],
                    ratings: ['OpenCritic'],
                },
            };

            const result = UserPreferencesSchema.safeParse(input);

            expect(result.success).toBe(true);
            expect(result.data?.preferredSources?.details).toEqual(['IGDB']);
            expect(result.data?.preferredSources?.ratings).toEqual(['OpenCritic']);
        });

        it('accepts empty arrays for both details and ratings', () => {
            const input = {
                preferredSources: {
                    details: [],
                    ratings: [],
                },
            };

            const result = UserPreferencesSchema.safeParse(input);

            expect(result.success).toBe(true);
            expect(result.data?.preferredSources?.details).toEqual([]);
            expect(result.data?.preferredSources?.ratings).toEqual([]);
        });

        it('allows different orderings of the same adapters', () => {
            const input = {
                preferredSources: {
                    details: ['OpenCritic', 'RAWG', 'IGDB'],
                    ratings: ['RAWG', 'OpenCritic', 'IGDB'],
                },
            };

            const result = UserPreferencesSchema.safeParse(input);

            expect(result.success).toBe(true);
            expect(result.data?.preferredSources?.details).toEqual(['OpenCritic', 'RAWG', 'IGDB']);
            expect(result.data?.preferredSources?.ratings).toEqual(['RAWG', 'OpenCritic', 'IGDB']);
        });

        it('allows details and ratings to hold different subsets', () => {
            const input = {
                preferredSources: {
                    details: ['IGDB'],
                    ratings: ['RAWG', 'OpenCritic'],
                },
            };

            const result = UserPreferencesSchema.safeParse(input);

            expect(result.success).toBe(true);
        });
    });

    describe('invalid inputs', () => {
        it('rejects unknown adapter names', () => {
            const input = {
                preferredSources: {
                    details: ['IGDB', 'SteamDB'],
                    ratings: ['RAWG'],
                },
            };

            const result = UserPreferencesSchema.safeParse(input);

            expect(result.success).toBe(false);
        });

        it('rejects non-string values in adapter arrays', () => {
            const input = {
                preferredSources: {
                    details: [42, true],
                    ratings: ['IGDB'],
                },
            };

            const result = UserPreferencesSchema.safeParse(input);

            expect(result.success).toBe(false);
        });

        it('rejects non-array values for details or ratings', () => {
            const input = {
                preferredSources: {
                    details: 'IGDB',
                    ratings: ['RAWG'],
                },
            };

            const result = UserPreferencesSchema.safeParse(input);

            expect(result.success).toBe(false);
        });

        it('rejects null as the preferredSources value', () => {
            const input = {
                preferredSources: null,
            };

            const result = UserPreferencesSchema.safeParse(input);

            expect(result.success).toBe(false);
        });
    });
});
