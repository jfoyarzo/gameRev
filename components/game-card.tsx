import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { IGDBGame } from "@/lib/types/igdb";

interface GameCardProps {
    game: IGDBGame;
}

export function GameCard({ game }: GameCardProps) {
    const coverUrl = game.cover?.url
        ? `https:${game.cover.url.replace("t_thumb", "t_720p")}`
        : "/placeholder-game.jpg";

    const rating = game.total_rating ? Math.round(game.total_rating) : 0;

    const getRatingColor = (score: number) => {
        if (score >= 90) return "bg-green-500/10 text-green-500 border-green-500/20";
        if (score >= 75) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }

    return (
        <Link href={`/game/${game.id}`} className="group">
            <Card className="overflow-hidden border-none bg-card/40 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-3/4 overflow-hidden relative">
                    <img
                        src={coverUrl}
                        alt={game.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                    <div className="absolute top-2 right-2">
                        {rating > 0 && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold backdrop-blur-md border ${getRatingColor(rating)}`}>
                                <Star className="w-3 h-3 fill-current" />
                                {rating}
                            </div>
                        )}
                    </div>
                </div>

                <CardContent className="p-4">
                    <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {game.name}
                    </h3>
                </CardContent>
            </Card>
        </Link>
    );
}
