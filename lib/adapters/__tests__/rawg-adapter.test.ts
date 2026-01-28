import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RawgAdapter } from '../rawg-adapter';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('RawgAdapter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset fetch mock implementation
        fetchMock.mockReset();
    });

    it('should fetch games and normalize them correctly', async () => {
        const mockResponse = {
            results: [
                {
                    id: 1,
                    name: 'Test Game',
                    released: '2023-01-01',
                    background_image: 'http://example.com/image.jpg',
                    rating: 4.5,
                },
            ],
        };

        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const adapter = new RawgAdapter();
        const games = await adapter.search('Test');

        expect(fetchMock).toHaveBeenCalledTimes(1);
        // Verify URL contains query
        expect(fetchMock.mock.calls[0][0]).toContain('search=Test');

        expect(games).toHaveLength(1);
        expect(games[0]).toEqual(expect.objectContaining({
            name: 'Test Game',
            releaseDate: '2023-01-01',
            coverUrl: 'http://example.com/image.jpg',
            rating: 90,
            sourceIds: { RAWG: 1 },
            sources: ['RAWG'],
        }));
    });

    it('should return empty array on failure', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false,
        });

        const adapter = new RawgAdapter();
        const games = await adapter.search('Test');

        expect(games).toEqual([]);
    });

    it('should handle exception during fetch', async () => {
        fetchMock.mockRejectedValueOnce(new Error('Network Error'));

        const adapter = new RawgAdapter();
        const games = await adapter.search('Test');

        expect(games).toEqual([]);
    });
});
