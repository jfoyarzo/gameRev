"use client";

import { useGame } from "@/lib/context/game-context";
import { useState } from "react";

export function GameDetails() {
    const { game } = useGame();
    const sourceNames = Object.keys(game.sources);
    const [activeTab, setActiveTab] = useState(sourceNames[0]);

    const sourceData = game.sources[activeTab];

    return (
        <div className="lg:col-span-2 space-y-12">
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">About</h2>
                    {sourceNames.length > 1 && (
                        <div className="flex gap-2">
                            {sourceNames.map(name => (
                                <button
                                    key={name}
                                    onClick={() => setActiveTab(name)}
                                    className={`text-xs px-2 py-1 rounded border transition-colors ${activeTab === name
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-muted text-muted-foreground border-transparent hover:border-muted-foreground/30"
                                        }`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-card/30 p-6 rounded-xl border border-white/5">
                    <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">
                        {sourceData?.description || `No description available from ${activeTab}.`}
                    </p>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-6">Gallery</h2>
                {sourceData?.screenshots && sourceData.screenshots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sourceData.screenshots.slice(0, 4).map((shot) => (
                            <div key={shot.id} className="rounded-lg overflow-hidden border bg-card aspect-video group relative">
                                <img
                                    src={shot.url.startsWith('http') ? shot.url : `https:${shot.url.replace("t_thumb", "t_720p")}`}
                                    alt="Screenshot"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-muted-foreground py-12 text-center bg-muted/20 rounded-xl border border-dashed">
                        No screenshots available from {activeTab}.
                    </div>
                )}
            </section>
        </div>
    );
}
