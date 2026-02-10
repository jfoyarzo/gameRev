import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UserPreferences } from "@/lib/types/preferences";
import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS } from "@/lib/constants";

export const getUserPreferences = async (userId: string): Promise<UserPreferences | undefined> => {
    return unstable_cache(
        async () => {
            const user = await db.query.users.findFirst({
                where: eq(users.id, userId),
                columns: {
                    preferences: true,
                }
            });
            return user?.preferences as UserPreferences | undefined;
        },
        [`user-preferences-${userId}`],
        {
            tags: [`user-preferences-${userId}`],
            revalidate: CACHE_REVALIDATE_SECONDS
        }
    )();
};
