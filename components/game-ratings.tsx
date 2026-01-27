"use client";

import { UnifiedGameData } from "@/lib/types/game";
import { Star } from "lucide-react";
import { RATING_EXCELLENT_THRESHOLD, RATING_GOOD_THRESHOLD } from "@/lib/constants";

interface GameRatingsProps {
    game: UnifiedGameData;
}

export function GameRatings({ game }: GameRatingsProps) {
    const allRatings = Object.values(game.sources).flatMap(s => s.ratings);

    return (
        <div className="space-y-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm sticky top-24">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Star className="w-5 h-5 fill-primary text-primary" />
                    Rating Breakdown
                </h3>

                <div className="space-y-4">
                    {allRatings.map((rating, idx) => (
                        <div key={`${rating.sourceName}-${idx}`} className="p-4 rounded-lg bg-muted/40 border transition-colors hover:bg-muted/60">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col">
                                    <span className="font-semibold">{rating.sourceName}</span>
                                    {rating.count !== undefined && rating.count > 0 && (
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{rating.count} reviews</span>
                                    )}
                                </div>
                                <span className={`text-2xl font-bold ${rating.score >= RATING_EXCELLENT_THRESHOLD ? "text-green-500" : rating.score >= RATING_GOOD_THRESHOLD ? "text-yellow-500" : "text-muted-foreground"}`}>
                                    {rating.score}
                                </span>
                            </div>
                            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full ${rating.score >= RATING_EXCELLENT_THRESHOLD ? "bg-green-500" : rating.score >= RATING_GOOD_THRESHOLD ? "bg-yellow-500" : "bg-slate-500"}`}
                                    style={{ width: `${rating.score}%` }}
                                />
                            </div>
                            {rating.summary && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {rating.summary}
                                </p>
                            )}
                        </div>
                    ))}

                    {allRatings.length === 0 && (
                        <p className="text-muted-foreground text-center py-8">
                            No ratings available yet.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
