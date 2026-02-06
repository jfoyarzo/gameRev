import 'server-only';

/**
 * Data Access Layer (DAL) Configuration
 * 
 * This module validates and exports environment variables at app startup.
 * Following Next.js 15+ best practices for secure credential management.
 * 
 */

interface AppConfig {
    twitch: {
        clientId: string;
        clientSecret: string;
    };
    rawg: {
        apiKey: string;
    };
    opencritic: {
        rapidApiKey: string;
    };
    recaptcha: {
        siteKey: string;
        secretKey: string;
    };
    database: {
        url: string;
    };
}

function getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(
            `Missing required environment variable: ${name}\n` +
            `Please add it to your .env.local file.\n` +
            `See .env.example for reference.`
        );
    }
    return value;
}

export const appConfig: AppConfig & {
    igdb: { baseUrl: string };
    rawg: { baseUrl: string };
    opencritic: { baseUrl: string };
} = {
    twitch: {
        clientId: getRequiredEnvVar("TWITCH_CLIENT_ID"),
        clientSecret: getRequiredEnvVar("TWITCH_CLIENT_SECRET"),
    },
    igdb: {
        baseUrl: process.env.IGDB_BASE_URL || "https://api.igdb.com/v4",
    },
    rawg: {
        apiKey: getRequiredEnvVar("RAWG_API_KEY"),
        baseUrl: process.env.RAWG_BASE_URL || "https://api.rawg.io/api",
    },
    opencritic: {
        rapidApiKey: getRequiredEnvVar("OPENCRITIC_API_KEY"),
        baseUrl: process.env.OPENCRITIC_BASE_URL || "https://opencritic-api.p.rapidapi.com",
    },
    recaptcha: {
        siteKey: getRequiredEnvVar("NEXT_PUBLIC_RECAPTCHA_SITE_KEY"),
        secretKey: getRequiredEnvVar("RECAPTCHA_SECRET_KEY"),
    },
    database: {
        url: getRequiredEnvVar("DATABASE_URL"),
    },
};

if (typeof window === "undefined") {
    console.log("✓ Environment variables validated successfully");
}
