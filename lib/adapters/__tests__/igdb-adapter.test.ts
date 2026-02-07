import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IgdbAdapter } from '../igdb-adapter';
import { searchIGDBGames, getIGDBGameById, getIGDBGameRatings } from '@/lib/api/igdb-client';
import { IGDBGame } from '@/lib/types/igdb';

// Mock the entire client module
vi.mock('@/lib/api/igdb-client');

describe('IgdbAdapter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should search games and normalize them correctly', async () => {
        const mockGames: Partial<IGDBGame>[] = [
            {
                id: 100,
                name: 'IGDB Game',
                first_release_date: 1672531200, // 2023-01-01
                cover: { id: 123, url: '//images.igdb.com/igdb/image/upload/t_thumb/123.jpg' },
                total_rating: 85.5,
                platforms: [{ name: 'PC' }, { name: 'PS5' }]
            }
        ];

        vi.mocked(searchIGDBGames).mockResolvedValue(mockGames as IGDBGame[]);

        const adapter = new IgdbAdapter();
        const results = await adapter.search('test query');

        expect(searchIGDBGames).toHaveBeenCalledWith('test query', expect.any(Number));
        expect(results).toHaveLength(1);
        expect(results[0]).toEqual(expect.objectContaining({
            sources: ['IGDB'],
            name: 'IGDB Game',
            releaseDate: '2023-01-01',
            coverUrl: 'https://images.igdb.com/igdb/image/upload/t_720p/123.jpg', // formated url
            rating: 85.5,
            sourceIds: { IGDB: 100 },
        }));
        expect(results[0].platforms).toContain('PC');
    });

    it('should return empty array on search failure', async () => {
        vi.mocked(searchIGDBGames).mockRejectedValue(new Error('IGDB API Error'));

        const adapter = new IgdbAdapter();
        const results = await adapter.search('fail');

        expect(results).toEqual([]);
    });

    it('should fetch game details by ID', async () => {
        const mockGame: Partial<IGDBGame> = {
            id: 100,
            name: 'IGDB Game',
            summary: 'Game Summary',
            first_release_date: 1672531200,
            cover: { id: 123, url: '//images.igdb.com/igdb/image/upload/t_thumb/123.jpg' },
            involved_companies: [{ company: { name: 'Dev Corp' } }],
            total_rating: 85,
            total_rating_count: 10,
            aggregated_rating: 80,
            aggregated_rating_count: 5,
            rating: 90,
            rating_count: 5,
            url: 'http://igdb.com/game',
            game_type: 0 // MAIN_GAME
        };

        vi.mocked(getIGDBGameById).mockResolvedValue(mockGame as IGDBGame);
        vi.mocked(getIGDBGameRatings).mockResolvedValue(mockGame as IGDBGame);

        const adapter = new IgdbAdapter();
        const details = await adapter.getGameDetails({ IGDB: 100 });

        expect(getIGDBGameById).toHaveBeenCalledWith(100);
        expect(getIGDBGameRatings).toHaveBeenCalledWith(100);

        expect(details).not.toBeNull();
        expect(details?.name).toBe('IGDB Game');
        expect(details?.developer).toBe('Dev Corp');
        expect(details?.ratings).toHaveLength(3); // Aggregate, Critics, Users
        expect(details?.releaseType).toBe('BASE_GAME');
    });

    it('should return null if game details fetch fails', async () => {
        vi.mocked(getIGDBGameById).mockRejectedValue(new Error('Fetch Error'));

        const adapter = new IgdbAdapter();
        const details = await adapter.getGameDetails({ IGDB: 999 });

        expect(details).toBeNull();
    });
});
