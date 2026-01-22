import { cache } from "react";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;

export const getAccessToken = cache(async () => {
    if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
        throw new Error("Missing Twitch Credentials in .env.local");
    }

    const response = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to authenticate with Twitch");
    }

    const data = await response.json();
    return data.access_token as string;
});

export async function fetchIGDB<T>(endpoint: string, query: string): Promise<T> {
    const token = await getAccessToken();

    const response = await fetch(`https://api.igdb.com/v4${endpoint}`, {
        method: "POST",
        headers: {
            "Client-ID": TWITCH_CLIENT_ID,
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
        },
        body: query,
        // We cache the results for 1 hour (3600s) to speed up the app
        // and save our API rate limits.
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`IGDB API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    return response.json();
}
