import { describe, expect, it, vi } from 'vitest';
import { geocodeDestination } from './geocode';

function mockFetch(payload: unknown, ok = true): typeof fetch {
  return vi.fn(async () => ({
    ok,
    json: async () => payload,
  })) as unknown as typeof fetch;
}

describe('geocodeDestination', () => {
  it('returns null for empty input', async () => {
    const result = await geocodeDestination('   ', mockFetch([]));
    expect(result).toBeNull();
  });

  it('parses Nominatim response into lat/lng', async () => {
    const fetchImpl = mockFetch([{ lat: '35.6762', lon: '139.6503' }]);
    const result = await geocodeDestination('Tokyo, Japan', fetchImpl);
    expect(result).toEqual({ lat: 35.6762, lng: 139.6503 });
  });

  it('returns null when response is empty', async () => {
    const result = await geocodeDestination('Atlantis', mockFetch([]));
    expect(result).toBeNull();
  });

  it('returns null on non-ok response', async () => {
    const result = await geocodeDestination('Tokyo', mockFetch(null, false));
    expect(result).toBeNull();
  });

  it('returns null on network failure', async () => {
    const failing = vi.fn(async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;
    const result = await geocodeDestination('Tokyo', failing);
    expect(result).toBeNull();
  });

  it('caches identical lookups (case- and whitespace-insensitive)', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => [{ lat: '48.8566', lon: '2.3522' }],
    })) as unknown as typeof fetch;
    const first = await geocodeDestination('Paris, France', fetchImpl);
    const second = await geocodeDestination('  paris, france  ', fetchImpl);
    expect(first).toEqual(second);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
