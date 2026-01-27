"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="p-4 bg-destructive/10 rounded-full">
                        <AlertCircle className="w-12 h-12 text-destructive" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Something went wrong!</h1>
                    <p className="text-muted-foreground">
                        We encountered an unexpected error. Please try again.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={reset} size="lg">
                        Try Again
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                        <a href="/">Go Home</a>
                    </Button>
                </div>

                {process.env.NODE_ENV === "development" && error.message && (
                    <div className="mt-8 p-4 bg-muted rounded-lg text-left">
                        <p className="text-xs font-mono text-muted-foreground break-all">
                            {error.message}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
