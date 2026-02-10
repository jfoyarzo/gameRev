import { Search } from "lucide-react";
import { auth } from "@/auth";
import { SearchResult } from "@/lib/types/search";
import { UserPreferences } from "@/lib/types/preferences";
import { searchService } from "@/lib/services";
import { getUserPreferences } from "@/lib/services/user-preferences";
import { GameCard } from "@/components/game-card";

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
    }>;
}


export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q } = await searchParams;
    const query = q || "";
    const session = await auth();
    let userPreferences: UserPreferences | undefined;

    if (session?.user?.id) {
        userPreferences = await getUserPreferences(session.user.id);
    }

    const results: SearchResult[] = query ? await searchService.search(query, userPreferences) : [];

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Search className="w-8 h-8 text-primary" />
                    Search Results
                </h1>
                <p className="text-muted-foreground mt-2">
                    {query
                        ? `Showing results for "${query}"`
                        : "Enter a search term to find games."}
                </p>
            </div>

            {results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {results.map((result) => (
                        <GameCard
                            key={Object.values(result.sourceIds).join("-")}
                            game={{
                                id: result.sourceIds.IGDB || Object.values(result.sourceIds)[0],
                                sourceIds: result.sourceIds,
                                name: result.name,
                                releaseDate: result.releaseDate,
                                cover: { url: result.coverUrl || "" },
                                total_rating: result.rating,
                                platforms: result.platforms,
                                releaseType: result.releaseType,
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/20 rounded-xl">
                    {query ? (
                        <>
                            <p className="text-xl font-semibold mb-2">No games found.</p>
                            <p className="text-muted-foreground">Try searching for a different title.</p>
                        </>
                    ) : (
                        <p className="text-xl font-semibold">Start typing to search...</p>
                    )}
                </div>
            )}
        </div>
    );
}
