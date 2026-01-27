import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";

export default function GameNotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="p-4 bg-purple-500/10 rounded-full">
                        <Gamepad2 className="w-12 h-12 text-purple-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Game Not Found</h1>
                    <p className="text-muted-foreground">
                        We couldn't find the game you're looking for. It may have been removed or doesn't exist in our database.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button size="lg" asChild>
                        <Link href="/search">Search Games</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                        <Link href="/">Browse Popular</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
