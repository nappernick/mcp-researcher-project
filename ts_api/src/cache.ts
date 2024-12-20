import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // TTL set to 1 hour

/**
 * Retrieves a cached summary for the given text.
 * 
 * @param text - The original text for which the summary is requested.
 * @returns The cached summary if available, otherwise undefined.
 */
export function getCachedSummary(text: string): string | undefined {
  return cache.get<string>(`summary:${hashText(text)}`);
}

/**
 * Stores a summary for the given text in the cache.
 * 
 * @param text - The original text that was summarized.
 * @param summary - The summarized version of the original text.
 */
export function setCachedSummary(text: string, summary: string): void {
  cache.set(`summary:${hashText(text)}`, summary);
}

/**
 * Generates a simple hash for the given text to use as a cache key.
 * 
 * @param text - The text to hash.
 * @returns A hashed string representing the text.
 */
function hashText(text: string): string {
  let hash = 0, i, chr;
  if (text.length === 0) return hash.toString();
  for (i = 0; i < text.length; i++) {
    chr   = text.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
} 