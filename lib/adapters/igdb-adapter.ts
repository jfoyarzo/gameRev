import { RatingAdapter, RatingData } from "./ratings";
import { SearchAdapter, SearchResult } from "@/lib/types/search";
import { fetchIGDB } from "@/lib/api/igdb-client";
import { IGDBGame } from "@/lib/types/igdb";
import { searchGames } from "@/lib/services/igdb-service";

export class IgdbAdapter implements RatingAdapter, SearchAdapter {
    name = "IGDB";

    // --- Search Implementation ---
    async search(query: string): Promise<SearchResult[]> {
        try {
            const games = await searchGames(query);

            return games.map(game => ({
                id: game.id,
                name: game.name,
                coverUrl: game.cover?.url?.replace("t_thumb", "t_720p") || "/placeholder-game.jpg",
                releaseDate: game.release_dates?.[0]?.human,
                rating: game.total_rating,
                sources: ["IGDB"],
                platforms: game.platforms?.map(p => p.name) || []
            }));
        } catch (error) {
            console.error("IGDB Search Failed:", error);
            return [];
        }
    }

    // --- Rating Implementation ---
    async getGameRatings(gameId: string | number): Promise<RatingData[]> {
        const query = `
      fields total_rating, total_rating_count, aggregated_rating, aggregated_rating_count, rating, rating_count, url;
      where id = ${gameId};
    `;

        const games = await fetchIGDB<IGDBGame[]>("/games", query);
        const game = games[0];

        if (!game) return [];

        const ratings: RatingData[] = [];

        this.addRating(ratings, {
            score: game.total_rating,
            count: game.total_rating_count,
            sourceName: "IGDB Aggregate",
            url: game.url,
            summary: "Weighted average of critic and user scores."
        });

        this.addRating(ratings, {
            score: game.aggregated_rating,
            count: game.aggregated_rating_count,
            sourceName: "IGDB Critics",
            url: game.url,
            summary: "Aggregated score from external critics (Ign, GameSpot, etc)."
        });

        this.addRating(ratings, {
            score: game.rating,
            count: game.rating_count,
            sourceName: "IGDB Users",
            url: game.url,
            summary: "Average score submitted by IGDB community members."
        });

        return ratings;
    }

    private addRating(
        ratings: RatingData[],
        data: {
            score: number | undefined;
            count: number | undefined;
            sourceName: string;
            url: string | undefined;
            summary: string;
        }
    ) {
        if (data.score) {
            ratings.push({
                sourceName: data.sourceName,
                score: Math.round(data.score),
                count: data.count || 0,
                url: data.url,
                summary: data.summary,
            });
        }
    }
}
