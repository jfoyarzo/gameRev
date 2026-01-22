import { notFound } from "next/navigation";
import { fetchIGDB, IGDBGame } from "@/lib/igdb";
import { IgdbAdapter } from "@/lib/adapters/igdb-adapter";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Building2 } from "lucide-react";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

async function getGameDetails(id: string) {
    const query = `
    fields name, cover.url, summary, release_dates.human, release_dates.y, involved_companies.company.name, screenshots.url;
    where id = ${id};
  `;
    const games = await fetchIGDB<IGDBGame[]>("/games", query);
    return games[0];
}

export default async function GamePage({ params }: PageProps) {
    const { id } = await params;
    const game = await getGameDetails(id);

    if (!game) {
        notFound();
    }

    const adapter = new IgdbAdapter();
    const ratings = await adapter.getGameRatings(game.id);

    const coverUrl = game.cover?.url
        ? `https:${game.cover.url.replace("t_thumb", "t_1080p")}`
        : "/placeholder-game.jpg";

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Banner with Blur Effect */}
            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center blur-sm opacity-80 scale-110"
                    style={{ backgroundImage: `url(${coverUrl})` }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />

                <div className="container relative z-10 mx-auto px-4 h-full flex items-end pb-12">
                    <div className="flex flex-col md:flex-row gap-8 items-end">
                        {/* Cover Art Card */}
                        <div className="hidden md:block w-[200px] shrink-0 rounded-lg overflow-hidden shadow-2xl skew-y-0 hover:skew-y-1 transition-transform border border-white/10">
                            <img src={coverUrl} alt={game.name} className="w-full h-auto" />
                        </div>

                        <div className="mb-4">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 drop-shadow-lg">
                                {game.name}
                            </h1>
                            <div className="flex flex-wrap gap-3 mb-4">
                                {game.release_dates?.[0] && (
                                    <Badge variant="secondary" className="text-md px-3 py-1 flex gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {game.release_dates[0].y}
                                    </Badge>
                                )}
                                {game.involved_companies?.[0] && (
                                    <Badge variant="outline" className="text-md px-3 py-1 flex gap-2 bg-black/40 backdrop-blur-md text-white border-white/20">
                                        <Building2 className="w-4 h-4" />
                                        {game.involved_companies[0].company.name}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">

                    {/* Section: About */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">About</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            {game.summary || "No summary available for this game."}
                        </p>
                    </section>

                    {/* Section: Screenshots */}
                    {game.screenshots && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Gallery</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {game.screenshots.slice(0, 4).map((shot) => (
                                    <div key={shot.id} className="rounded-lg overflow-hidden border bg-card">
                                        <img
                                            src={`https:${shot.url.replace("t_thumb", "t_720p")}`}
                                            alt="Screenshot"
                                            className="w-full h-auto"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar: Ratings */}
                <div className="space-y-6">
                    <div className="bg-card border rounded-xl p-6 shadow-sm sticky top-24">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Star className="w-5 h-5 fill-primary text-primary" />
                            Rating Breakdown
                        </h3>

                        <div className="space-y-4">
                            {ratings.map((rating) => (
                                <div key={rating.sourceName} className="p-4 rounded-lg bg-muted/40 border transition-colors hover:bg-muted/60">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold">{rating.sourceName}</span>
                                        <span className={`text-2xl font-bold ${rating.score >= 90 ? "text-green-500" : rating.score >= 75 ? "text-yellow-500" : "text-muted-foreground"}`}>
                                            {rating.score}
                                        </span>
                                    </div>
                                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-2">
                                        <div
                                            className={`h-full ${rating.score >= 90 ? "bg-green-500" : rating.score >= 75 ? "bg-yellow-500" : "bg-slate-500"}`}
                                            style={{ width: `${rating.score}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {rating.summary}
                                    </p>
                                </div>
                            ))}

                            {ratings.length === 0 && (
                                <p className="text-muted-foreground text-center py-8">
                                    No ratings available yet.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
