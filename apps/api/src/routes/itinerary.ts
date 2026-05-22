import { Hono } from 'hono';
import { GenerateItineraryRequestSchema, RefineItineraryRequestSchema } from '@trip/schemas';
import { generateItinerary, refineItinerary, GeminiError } from '../services/gemini';
import { rateLimit } from '../middleware/rateLimit';
import type { Bindings } from '../types';

export const itineraryRoutes = new Hono<{ Bindings: Bindings }>();

itineraryRoutes.use('*', rateLimit({ max: 10, windowMs: 60_000 }));

itineraryRoutes.post('/generate', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = GenerateItineraryRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid_request', details: parsed.error.flatten() }, 400);
  }

  if (!c.env.GEMINI_API_KEY) {
    return c.json({ error: 'server_misconfigured', message: 'GEMINI_API_KEY missing' }, 500);
  }

  try {
    const itinerary = await generateItinerary(c.env.GEMINI_API_KEY, parsed.data);
    return c.json({ itinerary });
  } catch (err) {
    console.error('Itinerary route error:', err);
    if (err instanceof GeminiError) {
      const cause = err.cause as { message?: string } | undefined;
      return c.json({ error: 'generation_failed', message: err.message, cause: cause?.message }, 502);
    }
    return c.json({ error: 'internal_error', message: String(err) }, 500);
  }
});

itineraryRoutes.post('/refine', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = RefineItineraryRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid_request', details: parsed.error.flatten() }, 400);
  }
  if (!c.env.GEMINI_API_KEY) {
    return c.json({ error: 'server_misconfigured', message: 'GEMINI_API_KEY missing' }, 500);
  }
  try {
    const itinerary = await refineItinerary(c.env.GEMINI_API_KEY, parsed.data);
    return c.json({ itinerary });
  } catch (err) {
    console.error('Itinerary route error:', err);
    if (err instanceof GeminiError) {
      const cause = err.cause as { message?: string } | undefined;
      return c.json({ error: 'generation_failed', message: err.message, cause: cause?.message }, 502);
    }
    return c.json({ error: 'internal_error', message: String(err) }, 500);
  }
});
