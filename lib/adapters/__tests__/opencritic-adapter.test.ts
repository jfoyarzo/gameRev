import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpencriticAdapter } from '../opencritic-adapter';
import * as openCriticClient from '@/lib/api/opencritic-client';

// Mock API client functions
const searchMock = vi.spyOn(openCriticClient, 'searchOpenCritic');
const getGameMock = vi.spyOn(openCriticClient, 'getOpenCriticGame');
const getPopularMock = vi.spyOn(openCriticClient, 'getOpenCriticPopularGames');
const getRecentMock = vi.spyOn(openCriticClient, 'getOpenCriticRecentlyReleased');

describe('OpencriticAdapter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should search games and normalize results correctly', async () => {
        const mockSearchResults = [
            { id: 463, name: 'The Witcher 3: Wild Hunt' },
            { id: 7576, name: 'Elden Ring' }, // Won't match "witcher" query
        ];

        const mockGameDetails = {
            id: 463,
            name: 'The Witcher 3: Wild Hunt',
            firstReleaseDate: '2015-05-19T00:00:00.000Z',
            topCriticScore: 92,
            percentRecommended: 95,
            medianScore: 90,
            tier: 'Mighty' as const,
            numReviews: 177,
            numTopCriticReviews: 150,
            images: { square: { og: 'game/463/o/OVsgXNo2.jpg' } },
        };

        searchMock.mockResolvedValueOnce(mockSearchResults);
        getGameMock.mockResolvedValueOnce(mockGameDetails);

        const adapter = new OpencriticAdapter();
        const results = await adapter.search('witcher');

        expect(searchMock).toHaveBeenCalledWith('witcher');
        // Only "The Witcher 3: Wild Hunt" matches the query (contains "witcher")
        // "Elden Ring" is filtered out due to low relevance score
        expect(results).toHaveLength(1);
        expect(results[0]).toEqual(expect.objectContaining({
            sources: ['OpenCritic'],
            name: 'The Witcher 3: Wild Hunt',
            sourceIds: { OpenCritic: 463 },
            releaseDate: '2015-05-19', // Enriched from getOpenCriticGame
        }));
    });

    it('should return empty array on search failure', async () => {
        searchMock.mockRejectedValueOnce(new Error('API Error'));

        const adapter = new OpencriticAdapter();
        const results = await adapter.search('fail');

        expect(results).toEqual([]);
    });

    it('should fetch game details by ID', async () => {
        const mockGame = {
            id: 463,
            name: 'The Witcher 3: Wild Hunt',
            description: 'An open world RPG...',
            topCriticScore: 92.5,
            percentRecommended: 95.2,
            medianScore: 94,
            tier: 'Mighty',
            numReviews: 177,
            numTopCriticReviews: 152,
            firstReleaseDate: '2015-05-19T00:00:00.000Z',
            url: 'https://opencritic.com/game/463/the-witcher-3-wild-hunt',
            Companies: [
                { name: 'CD Projekt Red', type: 'DEVELOPER' as const },
                { name: 'Warner Bros.', type: 'PUBLISHER' as const },
            ],
            images: {
                square: { og: 'game/463/o/OVsgXNo2.jpg' },
            },
        };

        getGameMock.mockResolvedValueOnce(mockGame);

        const adapter = new OpencriticAdapter();
        const details = await adapter.getGameDetails({ OpenCritic: 463 });

        expect(getGameMock).toHaveBeenCalledWith(463);
        expect(details).not.toBeNull();
        expect(details?.name).toBe('The Witcher 3: Wild Hunt');
        expect(details?.description).toBe('An open world RPG...');
        expect(details?.developer).toBe('CD Projekt Red');
        expect(details?.releaseDate).toBe('2015-05-19');
        expect(details?.ratings).toHaveLength(3); // Top Critics, Median, Recommended
    });

    it('should return null when no OpenCritic ID provided (no fallback search)', async () => {
        const adapter = new OpencriticAdapter();

        // No OpenCritic ID in sourceIds - should return null immediately
        const details = await adapter.getGameDetails(
            { IGDB: 123, RAWG: 456 },
            'Some Game'
        );

        expect(searchMock).not.toHaveBeenCalled();
        expect(getGameMock).not.toHaveBeenCalled();
        expect(details).toBeNull();
    });

    it('should return null if game details fetch fails', async () => {
        getGameMock.mockRejectedValueOnce(new Error('Fetch Error'));

        const adapter = new OpencriticAdapter();
        const details = await adapter.getGameDetails({ OpenCritic: 999 });

        expect(details).toBeNull();
    });

    it('should fetch popular games', async () => {
        const mockGames = [
            {
                id: 7576,
                name: 'Elden Ring',
                topCriticScore: 95,
                tier: 'Mighty',
                firstReleaseDate: '2022-02-25T00:00:00.000Z',
                images: { square: { og: 'game/7576/square.jpg' } },
                Platforms: [{ id: 27, name: 'PC', shortName: 'PC' }],
            },
        ];

        getPopularMock.mockResolvedValueOnce(mockGames);

        const adapter = new OpencriticAdapter();
        const results = await adapter.getPopularGames();

        expect(getPopularMock).toHaveBeenCalled();
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Elden Ring');
        expect(results[0].rating).toBe(95);
    });

    it('should fetch recently released games', async () => {
        const mockGames = [
            {
                id: 16000,
                name: 'New Game',
                topCriticScore: 80,
                tier: 'Strong',
                firstReleaseDate: '2026-01-15T00:00:00.000Z',
            },
        ];

        getRecentMock.mockResolvedValueOnce(mockGames);

        const adapter = new OpencriticAdapter();
        const results = await adapter.getNewGames();

        expect(getRecentMock).toHaveBeenCalled();
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('New Game');
    });

    it('should extract ratings correctly from game details', async () => {
        const mockGame = {
            id: 100,
            name: 'Test Game',
            topCriticScore: 85.7,
            percentRecommended: 90.5,
            medianScore: 88,
            tier: 'Strong',
            numReviews: 50,
            numTopCriticReviews: 30,
            firstReleaseDate: '2024-01-01T00:00:00.000Z',
        };

        getGameMock.mockResolvedValueOnce(mockGame);

        const adapter = new OpencriticAdapter();
        const details = await adapter.getGameDetails({ OpenCritic: 100 });

        expect(details?.ratings).toEqual([
            expect.objectContaining({
                sourceName: 'OpenCritic Top Critics',
                score: 86, // Rounded
                count: 30,
            }),
            expect.objectContaining({
                sourceName: 'OpenCritic Median',
                score: 88,
                count: 50,
            }),
            expect.objectContaining({
                sourceName: 'OpenCritic Recommended',
                score: 91, // Rounded
                count: 50,
            }),
        ]);
    });
});
