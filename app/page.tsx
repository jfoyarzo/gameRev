import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game-card";
import { getPopularGames, getNewGames } from "@/lib/igdb";
import Link from "next/link";
import { ArrowRight, Flame, Sparkles } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const popularGames = await getPopularGames(8);
  const newGames = await getNewGames(4);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden border-b bg-muted/20">
        <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 bg-linear-to-r from-primary to-purple-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Your Next Favorite Game <br /> Is Waiting.
          </h1>
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Discover the highest-rated games from critics and players alike. Unbiased scores, community reviews.
          </p>
          <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Button size="lg" asChild>
              <Link href="/popular">Browse Popular</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* New Releases Section */}
      <section className="container px-4 mx-auto py-16 border-b">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-full text-purple-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">New Releases</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/new" className="group">
              View All
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {newGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Popular Section */}
      <section className="container px-4 mx-auto py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Flame className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Popular Games</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/popular" className="group">
              View All
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}
