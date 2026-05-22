import Constants from 'expo-constants';
import {
  ItinerarySchema,
  RecommendationsResponseSchema,
  type GenerateItineraryRequest,
  type Itinerary,
  type RecommendationsResponse,
} from '@trip/schemas';

const API_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? 'http://localhost:8787';

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
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

export async function generateItinerary(input: GenerateItineraryRequest): Promise<Itinerary> {
  const data = await postJson<{ itinerary: unknown }>('/api/itinerary/generate', input);
  return ItinerarySchema.parse(data.itinerary);
}

export async function refineItinerary(
  itinerary: Itinerary,
  instruction: string,
): Promise<Itinerary> {
  const data = await postJson<{ itinerary: unknown }>('/api/itinerary/refine', {
    itinerary,
    instruction,
  });
  return ItinerarySchema.parse(data.itinerary);
}

export async function getRecommendations(
  seedDestinations: string[],
): Promise<RecommendationsResponse> {
  const data = await postJson<unknown>('/api/explore/recommendations', { seedDestinations });
  return RecommendationsResponseSchema.parse(data);
}
