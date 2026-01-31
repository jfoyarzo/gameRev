import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { Star } from "lucide-react";
import { formatImageUrl } from "@/lib/utils";
import { RATING_EXCELLENT_THRESHOLD, RATING_GOOD_THRESHOLD } from "@/lib/constants";

interface GameCardProps {
    game: {
        id: string | number;
        sourceIds?: Record<string, string | number>;
        name: string;
        releaseDate?: string;
        cover?: { url: string };
        total_rating?: number;
    };
}

export function GameCard({ game }: GameCardProps) {
    const coverUrl = formatImageUrl(game.cover?.url, "t_720p") || "/placeholder-game.jpg";

    const rating = game.total_rating ? Math.round(game.total_rating) : 0;

    const getRatingColor = (score: number) => {
        if (score >= RATING_EXCELLENT_THRESHOLD) return "bg-green-500/10 text-green-500 border-green-500/20";
        if (score >= RATING_GOOD_THRESHOLD) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }

    const sourceIdsParams = Object.entries(game.sourceIds || {})
        .map(([source, id]) => `sid_${source}=${id}`)
        .join("&");

    return (
        <Link href={`/game/${game.id}?name=${encodeURIComponent(game.name)}&rd=${encodeURIComponent(game.releaseDate || "")}&${sourceIdsParams}`} className="group">
            <Card className="overflow-hidden border-none bg-card/40 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-3/4 overflow-hidden relative">
                    <Image
                        src={coverUrl}
                        alt={game.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
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
