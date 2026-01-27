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

export const appConfig: AppConfig = {
    twitch: {
        clientId: getRequiredEnvVar("TWITCH_CLIENT_ID"),
        clientSecret: getRequiredEnvVar("TWITCH_CLIENT_SECRET"),
    },
    rawg: {
        apiKey: getRequiredEnvVar("RAWG_API_KEY"),
    },
};

if (typeof window === "undefined") {
    console.log("✓ Environment variables validated successfully");
}
