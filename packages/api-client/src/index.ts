import {
  type GenerateItineraryRequest,
  type Itinerary,
  ItinerarySchema,
  type RecommendationsResponse,
  RecommendationsResponseSchema,
} from '@trip/schemas';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ApiClientOptions = {
  baseUrl: string;
  fetchImpl?: typeof fetch;
};

export type ApiClient = {
  generateItinerary: (input: GenerateItineraryRequest) => Promise<Itinerary>;
  refineItinerary: (itinerary: Itinerary, instruction: string) => Promise<Itinerary>;
  getRecommendations: (seedDestinations: string[]) => Promise<RecommendationsResponse>;
};

export function createApiClient({ baseUrl, fetchImpl }: ApiClientOptions): ApiClient {
  const f = fetchImpl ?? fetch;

  async function postJson<T>(path: string, body: unknown): Promise<T> {
    const res = await f(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        (json as { message?: string; error?: string } | null)?.message ??
        (json as { error?: string } | null)?.error ??
        `Request failed (${res.status})`;
      throw new ApiError(res.status, message, json);
    }
    return json as T;
  }

  return {
    async generateItinerary(input) {
      const data = await postJson<{ itinerary: unknown }>('/api/itinerary/generate', input);
      return ItinerarySchema.parse(data.itinerary);
    },
    async refineItinerary(itinerary, instruction) {
      const data = await postJson<{ itinerary: unknown }>('/api/itinerary/refine', {
        itinerary,
        instruction,
      });
      return ItinerarySchema.parse(data.itinerary);
    },
    async getRecommendations(seedDestinations) {
      const data = await postJson<unknown>('/api/explore/recommendations', { seedDestinations });
      return RecommendationsResponseSchema.parse(data);
    },
  };
}
