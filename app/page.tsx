import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Discover Your Next Favorite Game
          </h1>
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Aggregated reviews from critics and players. Unbiased scores. Community driven.
          </p>
          <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Button size="lg" asChild>
              <Link href="/search">Browse Games</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup">Join the Community</Link>
            </Button>
          </div>
        </div>
        
        {/* Background gradient blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -z-10" />
      </section>

      {/* Placeholder Features */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4 mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-card border-none shadow-lg">
            <CardHeader>
              <CardTitle>Comprehensive Data</CardTitle>
              <CardDescription>Powered by IGDB</CardDescription>
            </CardHeader>
            <CardContent>
              Access a massive database of games, including cover art, screenshots, and developer info.
            </CardContent>
          </Card>
          <Card className="bg-card border-none shadow-lg">
            <CardHeader>
              <CardTitle>Community Reviews</CardTitle>
              <CardDescription>Real opinions</CardDescription>
            </CardHeader>
            <CardContent>
              Read and write reviews. Share your experience with the community.
            </CardContent>
          </Card>
           <Card className="bg-card border-none shadow-lg">
            <CardHeader>
              <CardTitle>Modern Interface</CardTitle>
              <CardDescription>Built with speed in mind</CardDescription>
            </CardHeader>
            <CardContent>
              Enjoy a fast, responsive, and beautiful dark-mode interface.
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
