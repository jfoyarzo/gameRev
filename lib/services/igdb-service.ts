import { fetchIGDB } from "@/lib/api/igdb-client";
import { IGDBGame } from "@/lib/types/igdb";

// Fetch games for the home page
export async function getPopularGames(limit = 12): Promise<IGDBGame[]> {
  const query = `
    fields name, cover.url, total_rating, summary;
    sort popularity desc;
    where cover != null & total_rating != null;
    limit ${limit};
  `;

  return fetchIGDB<IGDBGame[]>("/games", query);
}

export async function getNewGames(limit = 4): Promise<IGDBGame[]> {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const query = `
    fields name, cover.url, total_rating, summary, first_release_date;
    sort first_release_date desc;
    where first_release_date < ${currentTimestamp} & cover != null & total_rating != null;
    limit ${limit};
  `;

  return fetchIGDB<IGDBGame[]>("/games", query);
}

export async function searchGames(query: string, limit = 20): Promise<IGDBGame[]> {
  const sanitizedQuery = query.replace(/"/g, '\\"');
  const igdbQuery = `
        search "${sanitizedQuery}";
        fields name, cover.url, total_rating, summary, first_release_date, release_dates.human, platforms.name;
        where cover != null;
        limit ${limit};
    `;

  return fetchIGDB<IGDBGame[]>("/games", igdbQuery);
}

