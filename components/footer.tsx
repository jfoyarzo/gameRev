import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container mx-auto py-8 px-4 md:flex md:items-center md:justify-between">
                <div className="flex items-center gap-2 mb-4 md:mb-0">
                    <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        © 2026 GameRev built with Next.js & IGDB.
                    </p>
                </div>

                <div className="flex gap-6 text-sm text-muted-foreground">
                    <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
                    <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                    <a href="https://github.com/jfoyarzo/gaming-reviews" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
                </div>
            </div>
        </footer>
    );
}
