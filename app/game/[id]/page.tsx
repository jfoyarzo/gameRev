import { notFound } from "next/navigation";
import { gameService } from "@/lib/services";
import { GameHero } from "@/components/game-hero";
import { GameDetails } from "@/components/game-details";
import { GameRatings } from "@/components/game-ratings";
import type { Metadata } from "next";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{
        name?: string;
        rd?: string;
        [key: string]: string | string[] | undefined;
    }>;
}

/**
 * Extracts game parameters from searchParams.
 * Shared by both generateMetadata and page component to ensure
 * React cache() deduplication works correctly.
 */
async function getGameParams(searchParams: PageProps["searchParams"]) {
    const sParams = await searchParams;
    const { name, rd: releaseDate } = sParams;

    // Extract source IDs from query params (e.g. sid_IGDB=123, sid_RAWG=456)
    const sourceIds: Record<string, string | number> = {};
    Object.entries(sParams).forEach(([key, value]) => {
        if (key.startsWith("sid_") && value) {
            const source = key.replace("sid_", "");
            sourceIds[source] = value as string;
        }
    });

    return { sourceIds, name, releaseDate };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const { sourceIds, name, releaseDate } = await getGameParams(searchParams);

    // Fetch game data for metadata
    const game = await gameService.getGame(sourceIds, name, releaseDate);

    if (!game) {
        return {
            title: "Game Not Found",
        };
    }

    const coverUrl = game.mainCoverUrl?.startsWith("http")
        ? game.mainCoverUrl
        : game.mainCoverUrl
            ? `https:${game.mainCoverUrl.replace("t_thumb", "t_1080p")}`
            : undefined;

    return {
        title: game.name,
        description: game.mainDescription || `Explore ${game.name} ratings, details, and reviews from multiple trusted sources.`,
        openGraph: {
            title: game.name,
            description: game.mainDescription || `Explore ${game.name} ratings and reviews.`,
            images: coverUrl ? [{ url: coverUrl, width: 1920, height: 1080, alt: game.name }] : [],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: game.name,
            description: game.mainDescription || `Explore ${game.name} ratings and reviews.`,
            images: coverUrl ? [coverUrl] : [],
        },
    };
}


export default async function GamePage({ searchParams }: PageProps) {
    const { sourceIds, name, releaseDate } = await getGameParams(searchParams);

    // Fetch unified game data from all registered sources
    const game = await gameService.getGame(sourceIds, name, releaseDate);

    if (!game) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <GameHero game={game} />

            <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <GameDetails game={game} />
                <GameRatings game={game} />
            </div>
        </div>
    );
}
