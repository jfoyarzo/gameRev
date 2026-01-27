import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <SearchX className="w-12 h-12 text-primary" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-6xl font-bold text-primary">404</h1>
                    <h2 className="text-3xl font-bold">Page Not Found</h2>
                    <p className="text-muted-foreground">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button size="lg" asChild>
                        <Link href="/">Go Home</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                        <Link href="/search">Search Games</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
