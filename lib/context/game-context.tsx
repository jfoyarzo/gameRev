"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { UnifiedGameData } from "@/lib/types/game";

interface GameContextType {
    game: UnifiedGameData;
    activeSource: string;
    setActiveSource: (source: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({
    children,
    game
}: {
    children: ReactNode;
    game: UnifiedGameData;
}) {
    const [activeSource, setActiveSource] = useState(game.primarySource);

    return (
        <GameContext.Provider value={{ game, activeSource, setActiveSource }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error("useGame must be used within a GameProvider");
    }
    return context;
}
