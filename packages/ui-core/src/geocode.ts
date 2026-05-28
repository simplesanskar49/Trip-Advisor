export type GeocodeResult = { lat: number; lng: number };

const cache = new Map<string, GeocodeResult>();

/**
 * Free Nominatim (OpenStreetMap) geocoder. No API key. In-memory cache.
 * Returns null when the destination can't be resolved.
 */
export async function geocodeDestination(
  destination: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GeocodeResult | null> {
  const key = destination.trim().toLowerCase();
  if (!key) return null;
  const hit = cache.get(key);
  if (hit) return hit;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(destination)}`;
    const res = await fetchImpl(url, {
      headers: { 'User-Agent': 'trip-advisor-app/0.1 (mobile)' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    const first = data[0];
    if (!first) return null;
    const coords: GeocodeResult = {
      lat: Number.parseFloat(first.lat),
      lng: Number.parseFloat(first.lon),
    };
    if (Number.isNaN(coords.lat) || Number.isNaN(coords.lng)) return null;
    cache.set(key, coords);
    return coords;
  } catch {
    return null;
  }
}
