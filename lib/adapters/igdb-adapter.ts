import { RatingAdapter, RatingData } from "./ratings";
import { fetchIGDB, IGDBGame } from "@/lib/igdb";

export class IgdbAdapter implements RatingAdapter {
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
