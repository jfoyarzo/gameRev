import { z } from "zod";
import { AVAILABLE_ADAPTERS } from "@/lib/constants";

export const UserPreferencesSchema = z.object({
    preferredSources: z.object({
        details: z.array(z.enum(AVAILABLE_ADAPTERS)).default([...AVAILABLE_ADAPTERS]),
        ratings: z.array(z.enum(AVAILABLE_ADAPTERS)).default([...AVAILABLE_ADAPTERS]),
    }).optional(),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
