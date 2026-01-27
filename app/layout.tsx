import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GameRev - Trusted Video Game Ratings",
    template: "%s | GameRev",
  },
  description: "Discover the highest-rated games from critics and players alike. Unbiased scores, community reviews, and comprehensive game information.",
  keywords: ["video games", "game ratings", "game reviews", "IGDB", "RAWG", "metacritic", "gaming"],
  authors: [{ name: "GameRev" }],
  creator: "GameRev",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gamerev.app", // To be determined
    siteName: "GameRev",
    title: "GameRev - Trusted Video Game Ratings",
    description: "Discover the highest-rated games from critics and players alike.",
    images: [
      {
        url: "/og-image.png", // TODO: Generate a proper OG image
        width: 1200,
        height: 630,
        alt: "GameRev - Video Game Ratings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GameRev - Trusted Video Game Ratings",
    description: "Discover the highest-rated games from critics and players alike.",
    images: ["/og-image.png"], // TODO: Generate a proper OG image
  },
  robots: { // TODO: Update robots.txt
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background`}
      >
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
