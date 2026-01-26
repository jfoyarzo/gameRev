"use client";

import { useGame } from "@/lib/context/game-context";
import { Badge } from "./ui/badge";
import { Calendar } from "lucide-react";

export function GameHero() {
    const { game, activeSource } = useGame();
    const sourceData = game.sources[activeSource] || Object.values(game.sources)[0];

    const coverUrl = sourceData.coverUrl
        ? (sourceData.coverUrl.startsWith('http') ? sourceData.coverUrl : `https:${sourceData.coverUrl.replace("t_thumb", "t_1080p")}`)
        : game.mainCoverUrl;

    return (
        <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center blur-sm opacity-80 scale-110"
                style={{ backgroundImage: `url(${coverUrl})` }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />

            <div className="container relative z-10 mx-auto px-4 h-full flex items-end pb-12">
                <div className="flex flex-col md:flex-row gap-8 items-end w-full">
                    {/* Cover Art Card */}
                    <div className="hidden md:block w-[200px] shrink-0 rounded-lg overflow-hidden shadow-2xl skew-y-0 hover:skew-y-1 transition-transform border border-white/10 relative group">
                        <img src={coverUrl} alt={game.name} className="w-full h-auto" />
                        <Badge className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md border-white/20">
                            Source: {sourceData.sourceName}
                        </Badge>
                    </div>

                    <div className="mb-4 flex-1">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 drop-shadow-lg">
                            {game.name}
                        </h1>
                        <div className="flex flex-wrap gap-3 mb-4">
                            {game.releaseDate && (
                                <Badge variant="secondary" className="text-md px-3 py-1 flex gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {game.releaseDate}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
