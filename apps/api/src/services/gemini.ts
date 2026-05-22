import { GoogleGenAI, Type } from '@google/genai';
import {
  ItinerarySchema,
  RecommendationsResponseSchema,
  type Itinerary,
  type RecommendationsResponse,
} from '@trip/schemas';

const MODEL = 'gemini-flash-latest';

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = (err as Error).message ?? '';
      const retryable = /\b(503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|temporar)/i.test(msg);
      if (!retryable || i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, 500 * 2 ** i));
    }
  }
  throw lastErr;
}

const itineraryResponseSchema = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING },
    summary: { type: Type.STRING },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          title: { type: Type.STRING },
          blocks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timeOfDay: { type: Type.STRING, enum: ['morning', 'afternoon', 'evening'] },
                title: { type: Type.STRING },
                place: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedCost: { type: Type.STRING },
                durationMinutes: { type: Type.INTEGER },
              },
              required: ['timeOfDay', 'title', 'place', 'description'],
            },
          },
        },
        required: ['day', 'title', 'blocks'],
      },
    },
  },
  required: ['destination', 'summary', 'days'],
};

const recommendationsResponseSchema = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          destination: { type: Type.STRING },
          country: { type: Type.STRING },
          blurb: { type: Type.STRING },
          reason: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['destination', 'country', 'blurb', 'reason', 'tags'],
      },
    },
  },
  required: ['recommendations'],
};

export class GeminiError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'GeminiError';
  }
}

export async function generateItinerary(
  apiKey: string,
  input: { destination: string; days: number; vibe?: string | undefined },
): Promise<Itinerary> {
  const client = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert travel planner. Build a ${input.days}-day itinerary for ${input.destination}.
${input.vibe ? `Traveler vibe: ${input.vibe}` : ''}

Rules:
- Each day must have a short, evocative title.
- Each day must contain 3 blocks: one morning, one afternoon, one evening (in that order).
- Each block: a concrete venue or activity, the neighborhood/place, a 2-3 sentence description focused on what makes it special.
- estimatedCost: short string like "$15-25" or "free". durationMinutes: realistic.
- Prefer locally loved spots over tourist traps. Be specific (real place names).
- Tone: warm, editorial, like a friend who lived there.`;

  let response;
  try {
    response = await withRetry(() =>
      client.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: itineraryResponseSchema,
          temperature: 0.9,
        },
      }),
    );
  } catch (err) {
    console.error('Gemini generateItinerary error:', err);
    throw new GeminiError(`Gemini request failed: ${(err as Error).message ?? err}`, err);
  }

  const text = response.text;
  if (!text) throw new GeminiError('Empty response from Gemini');

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new GeminiError('Gemini returned non-JSON', err);
  }

  const result = ItinerarySchema.safeParse(parsed);
  if (!result.success) {
    throw new GeminiError(`Schema validation failed: ${result.error.message}`);
  }
  return result.data;
}

export async function refineItinerary(
  apiKey: string,
  input: { itinerary: Itinerary; instruction: string },
): Promise<Itinerary> {
  const client = new GoogleGenAI({ apiKey });

  const prompt = `You are revising a travel itinerary based on the traveler's instruction.

Current itinerary (JSON):
${JSON.stringify(input.itinerary, null, 2)}

Instruction:
"${input.instruction}"

Return the full updated itinerary in the same JSON shape. Keep the destination, summary tone, and any days/blocks that weren't mentioned by the instruction. Only change what the traveler asked for.`;

  let response;
  try {
    response = await withRetry(() =>
      client.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: itineraryResponseSchema,
          temperature: 0.7,
        },
      }),
    );
  } catch (err) {
    throw new GeminiError(`Gemini request failed: ${(err as Error).message ?? err}`, err);
  }

  const text = response.text;
  if (!text) throw new GeminiError('Empty response from Gemini');

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new GeminiError('Gemini returned non-JSON', err);
  }

  const result = ItinerarySchema.safeParse(parsed);
  if (!result.success) {
    throw new GeminiError(`Schema validation failed: ${result.error.message}`);
  }
  return result.data;
}

export async function generateRecommendations(
  apiKey: string,
  seedDestinations: string[],
): Promise<RecommendationsResponse> {
  const client = new GoogleGenAI({ apiKey });

  const seedLine =
    seedDestinations.length > 0
      ? `The user has previously planned trips to: ${seedDestinations.join(', ')}.`
      : 'The user is a curious traveler with no saved trips yet — suggest a mix of regions.';

  const prompt = `${seedLine}

Recommend exactly 6 destinations they'd love next. For each:
- destination: city name
- country
- blurb: 1-2 sentences capturing the feel of the place
- reason: short personalized reason tied to their travel pattern (or "a great starting point" if no history)
- tags: 3-5 short descriptors (e.g. "coastal", "design", "food", "ancient")

Mix well-known and lesser-known spots. Avoid recommending destinations already in their history.`;

  let response;
  try {
    response = await withRetry(() =>
      client.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: recommendationsResponseSchema,
          temperature: 1.0,
        },
      }),
    );
  } catch (err) {
    console.error('Gemini generateRecommendations error:', err);
    throw new GeminiError(`Gemini request failed: ${(err as Error).message ?? err}`, err);
  }

  const text = response.text;
  if (!text) throw new GeminiError('Empty response from Gemini');

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new GeminiError('Gemini returned non-JSON', err);
  }

  const result = RecommendationsResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new GeminiError(`Schema validation failed: ${result.error.message}`);
  }
  return result.data;
}
