/**
 * Mock API responses for E2E tests
 * Used when E2E_TEST environment variable is set to 'true'
 */

// Local placeholder image for testing
export const MOCK_IMAGE = "/placeholder-game.jpg";

export const MOCK_OPENCRITIC_SEARCH_RESULTS: Record<string, any[]> = {
    'hades': [
        { id: 7414, name: 'Hades', dist: 0.0 },
        { id: 16698, name: 'Hades II', dist: 0.1 } // Changed to match IGDB naming
    ],
    'witcher': [
        { id: 123, name: 'The Witcher 3: Wild Hunt', dist: 0.0 }
    ]
};

export const MOCK_OPENCRITIC_GAME_DETAILS: Record<number, any> = {
    7414: {
        id: 7414,
        name: 'Hades',
        description: 'Defy the god of the dead in this hack-and-slash rogue-like from Supergiant Games.',
        firstReleaseDate: '2020-09-17T00:00:00.000Z',
        topCriticScore: 93,
        tier: 'Mighty',
        images: {
            box: { og: MOCK_IMAGE },
            banner: { og: MOCK_IMAGE }
        }
    },
    16698: {
        id: 16698,
        name: 'Hades II', // Changed to match IGDB naming
        description: 'Battle beyond the Underworld using dark sorcery in this sequel to the award-winning rogue-like dungeon crawler.',
        firstReleaseDate: '2024-05-06T00:00:00.000Z',
        topCriticScore: 88,
        tier: 'Mighty',
        images: {
            box: { og: MOCK_IMAGE },
            banner: { og: MOCK_IMAGE }
        }
    },
    123: {
        id: 123,
        name: 'The Witcher 3: Wild Hunt',
        description: 'The Witcher 3: Wild Hunt is a 2015 action role-playing game developed and published by CD Projekt.',
        firstReleaseDate: '2015-05-19T00:00:00.000Z',
        topCriticScore: 92,
        tier: 'Mighty',
        images: {
            box: { og: MOCK_IMAGE },
            banner: { og: MOCK_IMAGE }
        }
    }
};

export const MOCK_IGDB_GAMES: any[] = [
    {
        id: 119171,
        name: 'Hades II',
        cover: { url: MOCK_IMAGE },
        first_release_date: 1715040000,
        summary: 'Battle beyond the Underworld using dark sorcery.',
        screenshots: [
            { url: MOCK_IMAGE }
        ]
    },
    {
        id: 1942,
        name: 'The Witcher 3: Wild Hunt',
        cover: { url: MOCK_IMAGE },
        first_release_date: 1431993600,
        summary: 'The Witcher 3: Wild Hunt is a story-driven, next-generation open world role-playing game.',
        screenshots: [
            { url: MOCK_IMAGE }
        ]
    }
];

export const MOCK_RAWG_RESULTS = {
    results: [
        {
            id: 622378,
            name: 'Hades II',
            background_image: MOCK_IMAGE,
            rating: 4.5,
            released: '2024-05-06'
        },
        {
            id: 3328,
            name: 'The Witcher 3: Wild Hunt',
            background_image: MOCK_IMAGE,
            rating: 4.66,
            released: '2015-05-19'
        }
    ]
};

export const MOCK_RAWG_GAME_DETAILS = {
    id: 3328,
    name: "The Witcher 3: Wild Hunt",
    description_raw: "The Witcher 3: Wild Hunt is a story-driven, next-generation open world role-playing game set in a visually stunning fantasy universe.",
    released: "2015-05-19",
    background_image: MOCK_IMAGE,
    website: "https://thewitcher.com/witcher3",
    rating: 4.66,
    metacritic: 92
};
