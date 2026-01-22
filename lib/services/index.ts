import { IgdbAdapter } from "@/lib/adapters/igdb-adapter";
import { SearchService } from "./search";

export const searchService = new SearchService([
    new IgdbAdapter()
]);
