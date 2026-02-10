import { describe, it, expect } from 'vitest';
import { SearchService } from '../search';
import { SearchAdapter, SearchResult } from '@/lib/types/search';

// Mock adapters
import { AdapterName } from "@/lib/constants";

class MockAdapter implements SearchAdapter {
    constructor(
        public name: AdapterName,
        private results: SearchResult[]
    ) { }

    async search(_query: string): Promise<SearchResult[]> {
        return this.results;
    }
}

describe('SearchService', () => {
    let service: SearchService;

    // Helper to create a basic result
    const createResult = (source: string, name: string, coverUrl?: string, releaseDate: string = '2023-01-01'): SearchResult => ({
        sourceIds: { [source]: '1' },
        name,
        sources: [source],
        coverUrl,
        coverSource: coverUrl ? source : undefined,
        releaseDate,
    });

    it('prioritizes IGDB cover image over RAWG even if RAWG matches query better', async () => {
        // Setup: RAWG returns a result that matches "better" (higher score)
        // IGDB returns the same game but with a slightly different name (lower score)
        // In the current implementation, the one with the higher score comes first
        // and its image is used.

        const rawgResult = createResult('RAWG', 'Hades', 'https://rawg.io/hades.jpg');
        const igdbResult = createResult('IGDB', 'Hades Game', 'https://igdb.com/hades.jpg');

        // We manually force the order in the mock to simulate sorting
        // But SearchService sorts internally. 
        // Let's assume the query is "Hades". 
        // RAWG "Hades" -> Exact match -> Score 100
        // IGDB "Hades Game" -> Starts with -> Score 90

        const rawgAdapter = new MockAdapter('RAWG', [rawgResult]);
        const igdbAdapter = new MockAdapter('IGDB', [igdbResult]);

        service = new SearchService([rawgAdapter, igdbAdapter]);

        const results = await service.search('Hades');

        expect(results.length).toBe(1); // Should merge

        const merged = results[0];

        // EXPECTATION: Should use IGDB cover because IGDB > RAWG
        expect(merged.sources).toContain('RAWG');
        expect(merged.sources).toContain('IGDB');
        expect(merged.coverUrl).toBe('https://igdb.com/hades.jpg');
    });

    it('prioritizes OpenCritic cover over RAWG', async () => {
        const rawgResult = createResult('RAWG', 'Celeste', 'https://rawg.io/celeste.jpg');
        const ocResult = createResult('OpenCritic', 'Celeste', 'https://opencritic.com/celeste.jpg');

        // Both exact match, so score is same. 
        // Merge logic determines which image wins.

        const rawgAdapter = new MockAdapter('RAWG', [rawgResult]);
        const ocAdapter = new MockAdapter('OpenCritic', [ocResult]);

        service = new SearchService([rawgAdapter, ocAdapter]);

        const results = await service.search('Celeste');

        const merged = results[0];
        expect(merged.coverUrl).toBe('https://opencritic.com/celeste.jpg');
    });

    it('prioritizes IGDB cover over OpenCritic', async () => {
        const igdbResult = createResult('IGDB', 'Portal 2', 'https://igdb.com/portal2.jpg');
        const ocResult = createResult('OpenCritic', 'Portal 2', 'https://opencritic.com/portal2.jpg');

        const igdbAdapter = new MockAdapter('IGDB', [igdbResult]);
        const ocAdapter = new MockAdapter('OpenCritic', [ocResult]);

        service = new SearchService([igdbAdapter, ocAdapter]);

        const results = await service.search('Portal 2');

        const merged = results[0];
        expect(merged.coverUrl).toBe('https://igdb.com/portal2.jpg');
    });

    it('falls back to RAWG if it is the only source with an image', async () => {
        const rawgResult = createResult('RAWG', 'Indie Gem', 'https://rawg.io/gem.jpg');
        const igdbResult = createResult('IGDB', 'Indie Gem', undefined); // No image

        const rawgAdapter = new MockAdapter('RAWG', [rawgResult]);
        const igdbAdapter = new MockAdapter('IGDB', [igdbResult]);

        service = new SearchService([rawgAdapter, igdbAdapter]);

        const results = await service.search('Indie Gem');

        const merged = results[0];
        expect(merged.coverUrl).toBe('https://rawg.io/gem.jpg');
    });
    it('merges results when one source lacks release date/platforms but names match exactly', async () => {
        // Fallout 4 case simulation
        const igdbResult = createResult('IGDB', 'Fallout 4 - Far Harbor', 'img', '2016-05-19');
        igdbResult.platforms = ['PC', 'PS4'];

        const ocResult = createResult('OpenCritic', 'Fallout 4: Far Harbor', undefined, undefined); // Missing date
        ocResult.platforms = []; // Missing platforms
        ocResult.releaseDate = undefined; // Force undefined to override default param

        const igdbAdapter = new MockAdapter('IGDB', [igdbResult]);
        const ocAdapter = new MockAdapter('OpenCritic', [ocResult]);

        service = new SearchService([igdbAdapter, ocAdapter]);

        const results = await service.search('Fallout 4');

        // Should be merged into one result
        expect(results.length).toBe(1);
        const merged = results[0];
        expect(merged.sources).toContain('IGDB');
        expect(merged.sources).toContain('OpenCritic');
        // Should preserve the date from IGDB
        expect(merged.releaseDate).toBe('2016-05-19');
    });
});
