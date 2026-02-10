import { notFound } from "next/navigation";
import { gameService } from "@/lib/services";
import { GameHero } from "@/components/game-hero";
import { GameDetails } from "@/components/game-details";
import { GameRatings } from "@/components/game-ratings";
import { auth } from "@/auth";
import { getUserPreferences } from "@/lib/services/user-preferences";
import { filterSources } from "@/lib/utils/filter-sources";
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

    const game = await gameService.getGame(sourceIds, name, releaseDate);

    if (!game) {
        notFound();
    }

    // Fetch user preferences (if authenticated) to filter displayed sources
    const session = await auth();
    const preferences = session?.user?.id
        ? await getUserPreferences(session.user.id)
        : undefined;

    const detailSources = filterSources(game.sources, preferences?.preferredSources?.details);
    const ratingSources = filterSources(game.sources, preferences?.preferredSources?.ratings);

    return (
        <div className="min-h-screen bg-background pb-20">
            <GameHero game={game} />

            <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <GameDetails game={game} sources={detailSources} />
                <GameRatings game={game} sources={ratingSources} />
            </div>
        </div>
    );
}

