import { describe, it, expect } from 'vitest';
import { filterSources, getDefaultPreferredSources } from '../filter-sources';
import { GameSourceInfo } from '@/lib/types/game';

const createSource = (name: string): GameSourceInfo => ({
    sourceName: name,
    description: `Description from ${name}`,
    coverUrl: `https://${name.toLowerCase()}.com/cover.jpg`,
    screenshots: [{ id: `${name}-1`, url: `https://${name.toLowerCase()}.com/ss.jpg` }],
    ratings: [{ sourceName: name, score: 85, count: 100 }],
    releaseDate: '2024-01-01',
    developer: 'Test Dev',
    platforms: ['PC'],
});

const allSources: Record<string, GameSourceInfo> = {
    IGDB: createSource('IGDB'),
    RAWG: createSource('RAWG'),
    OpenCritic: createSource('OpenCritic'),
};

describe('filterSources', () => {
    it('returns all sources when preferredList is undefined', () => {
        const result = filterSources(allSources, undefined);

        expect(Object.keys(result)).toEqual(['IGDB', 'RAWG', 'OpenCritic']);
    });

    it('returns empty record when preferredList is empty array', () => {
        const result = filterSources(allSources, []);

        expect(Object.keys(result)).toHaveLength(0);
    });

    it('returns only sources matching the preferred list', () => {
        const result = filterSources(allSources, ['IGDB', 'OpenCritic']);

        expect(Object.keys(result)).toEqual(['IGDB', 'OpenCritic']);
        expect(result['RAWG']).toBeUndefined();
    });

    it('preserves preference priority order', () => {
        const result = filterSources(allSources, ['OpenCritic', 'IGDB']);

        // Key order should match preference order, not the original record order
        expect(Object.keys(result)).toEqual(['OpenCritic', 'IGDB']);
    });

    it('gracefully handles preferred sources not present in the data', () => {
        const partialSources = { IGDB: allSources['IGDB'] };
        const result = filterSources(partialSources, ['IGDB', 'RAWG', 'OpenCritic']);

        expect(Object.keys(result)).toEqual(['IGDB']);
    });

    it('returns a single source when only one is preferred', () => {
        const result = filterSources(allSources, ['RAWG']);

        expect(Object.keys(result)).toEqual(['RAWG']);
        expect(result['RAWG'].sourceName).toBe('RAWG');
    });
});

describe('getDefaultPreferredSources', () => {
    it('returns all available adapters', () => {
        const defaults = getDefaultPreferredSources();

        expect(defaults).toEqual(['IGDB', 'RAWG', 'OpenCritic']);
    });

    it('returns a new array each time (not a shared reference)', () => {
        const a = getDefaultPreferredSources();
        const b = getDefaultPreferredSources();

        expect(a).not.toBe(b);
        expect(a).toEqual(b);
    });
});
