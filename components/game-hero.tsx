"use client";

import { UnifiedGameData } from "@/lib/types/game";
import { Badge } from "./ui/badge";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { formatImageUrl } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface GameHeroProps {
    game: UnifiedGameData;
    activeSource?: string;
}

export function GameHero({ game, activeSource: propActiveSource }: GameHeroProps) {
    const activeSource = propActiveSource || game.primarySource;
    const sourceData = game.sources[activeSource] || Object.values(game.sources)[0];

    const coverUrl = sourceData.coverUrl
        ? formatImageUrl(sourceData.coverUrl)
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
                        <Image
                            src={coverUrl}
                            alt={game.name}
                            width={200}
                            height={300}
                            className="w-full h-auto"
                        />
                        <Badge className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md border-white/20">
                            Source: {sourceData.sourceName}
                        </Badge>
                    </div>

                    <div className="mb-4 flex-1">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 drop-shadow-lg">
                            {game.name}
                        </h1>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {game.releaseType && game.releaseType !== 'BASE_GAME' && game.releaseType !== 'UNKNOWN' && (
                                <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 text-xs px-2.5 py-1 font-bold uppercase tracking-wider shadow-lg shadow-amber-900/20">
                                    {game.releaseType.replace('_', ' ')}
                                </Badge>
                            )}

                            {game.releaseDate && (
                                <Badge variant="secondary" className="text-sm px-3 py-1 flex gap-2 bg-black/60 hover:bg-black/70 backdrop-blur-md text-white border border-white/10 shadow-sm">
                                    <Calendar className="w-3.5 h-3.5 text-white/90" />
                                    <span className="font-medium text-white/90">{game.releaseDate}</span>
                                </Badge>
                            )}

                            {sourceData?.platforms && sourceData.platforms.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pl-2 border-l border-white/20 ml-1">
                                    {sourceData.platforms.slice(0, 4).map(p => (
                                        <Badge key={p} variant="outline" className="text-xs text-white bg-black/40 hover:bg-black/50 border-white/20 backdrop-blur-md font-medium shadow-sm">
                                            {p}
                                        </Badge>
                                    ))}
                                    {sourceData.platforms.length > 4 && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Badge variant="outline" className="text-xs text-white bg-black/40 hover:bg-black/50 border-white/20 backdrop-blur-md font-medium shadow-sm cursor-help">
                                                        +{sourceData.platforms.length - 4}
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-black/80 border-white/10 text-white backdrop-blur-md">
                                                    <p>{sourceData.platforms.slice(4).join(", ")}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
