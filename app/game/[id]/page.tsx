import { notFound } from "next/navigation";
import { gameService } from "@/lib/services";
import { GameProvider } from "@/lib/context/game-context";
import { GameHero } from "@/components/game-hero";
import { GameDetails } from "@/components/game-details";
import { GameRatings } from "@/components/game-ratings";

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

export default async function GamePage({ searchParams }: PageProps) {
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

    // Fetch unified game data from all registered sources
    const game = await gameService.getGame(sourceIds, name, releaseDate);

    if (!game) {
        notFound();
    }

    return (
        <GameProvider game={game}>
            <div className="min-h-screen bg-background pb-20">
                <GameHero />

                <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <GameDetails />
                    <GameRatings />
                </div>
            </div>
        </GameProvider>
    );
}
