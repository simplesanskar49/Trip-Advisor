import type { Itinerary } from '@trip/schemas';
import { describe, expect, it, vi } from 'vitest';
import { ApiError, createApiClient } from './index';

const validItinerary: Itinerary = {
  destination: 'Tokyo, Japan',
  summary: 'A short test trip.',
  days: [
    {
      day: 1,
      title: 'Day 1',
      blocks: [
        {
          timeOfDay: 'morning',
          title: 'Senso-ji',
          place: 'Asakusa',
          description: 'Visit the ancient temple.',
        },
      ],
    },
  ],
};

function fetchOk(payload: unknown): typeof fetch {
  return vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => payload,
  })) as unknown as typeof fetch;
}

function fetchErr(status: number, payload: unknown): typeof fetch {
  return vi.fn(async () => ({
    ok: false,
    status,
    json: async () => payload,
  })) as unknown as typeof fetch;
}

describe('createApiClient', () => {
  it('generateItinerary posts to /api/itinerary/generate and parses response', async () => {
    const fetchImpl = fetchOk({ itinerary: validItinerary });
    const client = createApiClient({ baseUrl: 'https://api.test', fetchImpl });
    const result = await client.generateItinerary({ destination: 'Tokyo', days: 1 });
    expect(result.destination).toBe('Tokyo, Japan');
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.test/api/itinerary/generate',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('refineItinerary sends itinerary + instruction', async () => {
    const fetchImpl = fetchOk({ itinerary: validItinerary });
    const client = createApiClient({ baseUrl: 'https://api.test', fetchImpl });
    await client.refineItinerary(validItinerary, 'make it cheaper');
    const call = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    if (!call) throw new Error('fetch was not called');
    const init = call[1] as { body: string };
    expect(JSON.parse(init.body)).toEqual({
      itinerary: validItinerary,
      instruction: 'make it cheaper',
    });
  });

  it('getRecommendations validates response shape', async () => {
    const fetchImpl = fetchOk({
      recommendations: [
        {
          destination: 'Lisbon',
          country: 'Portugal',
          blurb: 'Sunny capital.',
          reason: 'Pairs with Madrid.',
          tags: ['coast'],
        },
      ],
    });
    const client = createApiClient({ baseUrl: 'https://api.test', fetchImpl });
    const result = await client.getRecommendations(['Madrid']);
    expect(result.recommendations).toHaveLength(1);
  });

  it('throws ApiError with status and server message', async () => {
    const fetchImpl = fetchErr(429, { message: 'rate limited' });
    const client = createApiClient({ baseUrl: 'https://api.test', fetchImpl });
    await expect(client.generateItinerary({ destination: 'X', days: 1 })).rejects.toMatchObject({
      name: 'ApiError',
      status: 429,
      message: 'rate limited',
    });
  });

  it('falls back to a default message when server omits one', async () => {
    const fetchImpl = fetchErr(500, {});
    const client = createApiClient({ baseUrl: 'https://api.test', fetchImpl });
    try {
      await client.generateItinerary({ destination: 'X', days: 1 });
      expect.fail('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).message).toMatch(/500/);
    }
  });

  it('throws ZodError when server returns malformed itinerary', async () => {
    const fetchImpl = fetchOk({ itinerary: { destination: 'Tokyo' } });
    const client = createApiClient({ baseUrl: 'https://api.test', fetchImpl });
    await expect(client.generateItinerary({ destination: 'X', days: 1 })).rejects.toThrow();
  });
});
