/**
 * Calculate reading time for a given text
 * @param text - The text content (markdown or HTML)
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(
  text: string,
  wordsPerMinute: number = 200
): number {
  if (!text) return 0;

  // Remove HTML tags
  const strippedText = text.replace(/<[^>]*>/g, " ");

  // Remove markdown syntax
  const cleanText = strippedText
    .replace(/[#*_~`\[\]()]/g, " ") // Remove markdown symbols
    .replace(/!\[.*?\]\(.*?\)/g, " ") // Remove images
    .replace(/\[.*?\]\(.*?\)/g, " ") // Remove links
    .replace(/```[\s\S]*?```/g, " ") // Remove code blocks
    .replace(/`.*?`/g, " "); // Remove inline code

  // Count words
  const words = cleanText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  const wordCount = words.length;

  // Calculate reading time
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  return minutes || 1; // Minimum 1 minute
}

/**
 * Format reading time as a string
 * @param minutes - Reading time in minutes
 * @returns Formatted string (e.g., "5 min read")
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return "< 1 min read";
  if (minutes === 1) return "1 min read";
  return `${minutes} min read`;
}
