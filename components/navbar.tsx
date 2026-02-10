import Link from "next/link";
import { Button } from "./ui/button";
import { Gamepad2, Search } from "lucide-react";
import { SearchInput } from "./search-input";
import { verifySession } from "@/lib/auth";
import { SignOut } from "@/components/auth/sign-out-button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export async function Navbar() {
    const session = await verifySession();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-16 items-center px-4">
                {/* Logo */}
                <Link href="/" className="mr-6 flex items-center gap-2 font-bold text-xl hover:opacity-90 transition-opacity">
                    <Gamepad2 className="h-6 w-6 text-primary" />
                    <span>GameRev</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                    <Link href="/trending" className="hover:text-foreground transition-colors">Trending</Link>
                    <Link href="/top-rated" className="hover:text-foreground transition-colors">Top Rated</Link>
                    <Link href="/new-releases" className="hover:text-foreground transition-colors">New Releases</Link>
                </nav>

                <div className="flex flex-1 items-center justify-end gap-4">
                    {/* Search Input */}
                    <div className="hidden md:block mr-4">
                        <SearchInput />
                    </div>

                    {/* Search Trigger (Mobile Only) */}
                    <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground">
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>

                    {/* Auth Actions */}
                    <div className="flex items-center gap-2">
                        {session?.user ? (
                            <div className="flex items-center gap-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-8 w-fit px-2 rounded-full font-normal">
                                            <span className="text-sm font-medium hidden md:inline-block">
                                                {session.user.name || session.user.email}
                                            </span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href="/settings/preferences">Edit Preferences</Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <SignOut />
                            </div>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/signup">Sign up</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
