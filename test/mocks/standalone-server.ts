
import { createServer } from 'node:http';
import { URL } from 'node:url';
import {
    MOCK_RAWG_RESULTS,
    MOCK_IGDB_GAMES,
    MOCK_OPENCRITIC_SEARCH_RESULTS,
    MOCK_OPENCRITIC_GAME_DETAILS,
    MOCK_RAWG_GAME_DETAILS
} from '../../lib/api/mock-data';

const PORT = 4000;

const server = createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Client-ID, Accept');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const { pathname, searchParams } = new URL(req.url || '', `http://localhost:${PORT}`);
    console.log(`[Mock Server] ${req.method} ${pathname} ${searchParams}`);

    // --- RAWG ---
    // GET /api/games?key=... OR /api/games/3328
    if (pathname.includes('/api/games')) {
        // Game Screenshots
        if (pathname.includes('/screenshots')) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ count: 0, results: [] }));
            return;
        }

        // Game Details
        if (pathname.match(/\/api\/games\/\d+/)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(MOCK_RAWG_GAME_DETAILS));
            return;
        }

        // Game Search
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(MOCK_RAWG_RESULTS));
        return;
    }

    // --- IGDB ---
    // POST /v4/games (Query via body, but we just return static mock)
    // POST /v4/anything...
    if (pathname.startsWith('/v4/')) {
        // Collect body just to consume it
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(MOCK_IGDB_GAMES));
        });
        return;
    }

    // --- TWITCH AUTH ---
    // POST /oauth2/token
    if (pathname === '/oauth2/token') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            access_token: 'mock-access-token',
            expires_in: 3600,
            token_type: 'bearer'
        }));
        return;
    }

    // --- OPENCRITIC ---
    // GET /game/search
    if (pathname === '/game/search') {
        const criteria = searchParams.get('criteria')?.toLowerCase() || '';
        for (const [key, results] of Object.entries(MOCK_OPENCRITIC_SEARCH_RESULTS)) {
            if (criteria.includes(key)) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(results));
                return;
            }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
        return;
    }

    // GET /game/{id}
    if (pathname.match(/\/game\/\d+/)) {
        const id = pathname.split('/').pop();
        const game = MOCK_OPENCRITIC_GAME_DETAILS[Number(id)];
        if (game) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(game));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found' }));
        }
        return;
    }

    // Health check for Playwright
    if (pathname === '/') {
        res.writeHead(200);
        res.end('Mock Server Running');
        return;
    }

    // Default 404
    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`🔷 Mock Server running at http://localhost:${PORT}`);
});
