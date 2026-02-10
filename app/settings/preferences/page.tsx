import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SourcePreferenceForm } from "@/components/preferences/source-preference-form";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UserPreferences } from "@/lib/types/preferences";
import { Settings } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Preferences",
    description: "Customize which sources are used for game details and ratings.",
};

export default async function PreferencesPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
    });

    const userPreferences = user?.preferences as UserPreferences | undefined;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-background">
            <div className="border-b bg-card/30">
                <div className="container mx-auto px-4 py-8 md:py-12">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Settings className="h-5 w-5 text-primary" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Source Preferences</h1>
                    </div>
                    <p className="text-muted-foreground max-w-xl ml-12">
                        Control which sources provide game details and ratings.
                        Drag to reorder priority — higher sources take precedence when displaying content.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <SourcePreferenceForm initialPreferences={userPreferences} />
            </div>
        </div>
    );
}
