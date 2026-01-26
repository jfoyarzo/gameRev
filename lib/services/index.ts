import { IgdbAdapter } from "@/lib/adapters/igdb-adapter";
import { RawgAdapter } from "@/lib/adapters/rawg-adapter";
import { SearchService } from "./search";
import { GameService } from "./game-service";

const igdbAdapter = new IgdbAdapter();
const rawgAdapter = new RawgAdapter();

export const searchService = new SearchService([
    igdbAdapter,
    rawgAdapter
]);

export const gameService = new GameService([
    igdbAdapter,
    rawgAdapter
]);
