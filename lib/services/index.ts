import 'server-only';
import { getEnabledAdapters } from "@/lib/adapters/registry";
import { SearchService } from "./search";
import { GameService, setGameServiceInstance } from "./game-service";

const adapters = getEnabledAdapters();

export const searchService = new SearchService(adapters);
export const gameService = new GameService(adapters);

// Set the singleton instance for preloading
setGameServiceInstance(gameService);

// Re-export preload functions for use in Server Components
export { preloadGame } from "./game-service";
