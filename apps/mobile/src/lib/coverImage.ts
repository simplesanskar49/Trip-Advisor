/**
 * Deterministic cover image URL. picsum is a free, no-key CDN of curated
 * photography; using a destination-derived seed means the same place always
 * shows the same photo.
 */
export function coverImageFor(destination: string, w = 1200, h = 750): string {
  const seed = encodeURIComponent(destination.toLowerCase().replace(/\s+/g, '-'));
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}
