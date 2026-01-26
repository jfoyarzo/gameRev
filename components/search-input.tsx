"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

export function SearchInput() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative flex items-center w-full max-w-[300px]">
            <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search games..."
                    className="w-full bg-background pl-9 md:w-[200px] lg:w-[300px] rounded-full focus-visible:ring-primary"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
        </form>
    );
}
