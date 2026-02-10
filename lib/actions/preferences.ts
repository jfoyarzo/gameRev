'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { UserPreferences, UserPreferencesSchema } from "@/lib/types/preferences";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updatePreferences(data: UserPreferences) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const result = UserPreferencesSchema.safeParse(data);

    if (!result.success) {
        throw new Error("Invalid preferences data");
    }

    try {
        await db.update(users)
            .set({ preferences: result.data })
            .where(eq(users.id, session.user.id));

        revalidateTag(`user-preferences-${session.user.id}`, {});
        revalidatePath("/");
        revalidatePath("/search");
        revalidatePath("/settings/preferences");

        return { success: true };
    } catch (error) {
        console.error("Failed to update preferences:", error);
        return { success: false, error: "Failed to update preferences" };
    }
}
