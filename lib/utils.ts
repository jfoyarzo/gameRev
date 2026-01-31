import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats an image URL with proper protocol and size optimization
 * @param url The image URL to format
 * @param options Formatting options
 * @returns Formatted URL or placeholder
 */
export function formatImageUrl(
  url: string | undefined | null,
  options: {
    addProtocol?: boolean;
    replaceThumbnail?: string;
    placeholder?: string;
  } = {}
): string {
  const {
    addProtocol = true,
    replaceThumbnail,
    placeholder = "/placeholder-game.jpg"
  } = options;

  if (!url) {
    return placeholder;
  }

  let formattedUrl = url;

  // Add protocol if needed
  if (addProtocol && formattedUrl.startsWith("//")) {
    formattedUrl = `https:${formattedUrl}`;
  }

  // Replace thumbnail size if specified
  if (replaceThumbnail) {
    formattedUrl = formattedUrl.replace("t_thumb", replaceThumbnail);
  }

  return formattedUrl;
}
