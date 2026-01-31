import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats image URL to handle different URL formats from various sources.
 * Defaults to 1080p resolution for IGDB-style URLs.
 */
export function formatImageUrl(url: string | undefined | null, resolution = "t_1080p"): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url.replace("t_thumb", resolution)}`;
  return url;
}
