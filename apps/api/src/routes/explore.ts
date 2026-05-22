import { Hono } from 'hono';
import { z } from 'zod';
import { generateRecommendations, GeminiError } from '../services/gemini';
import { rateLimit } from '../middleware/rateLimit';
import type { Bindings } from '../types';

const RequestSchema = z.object({
  seedDestinations: z.array(z.string().min(1).max(120)).max(20).default([]),
});

export const exploreRoutes = new Hono<{ Bindings: Bindings }>();

exploreRoutes.use('*', rateLimit({ max: 10, windowMs: 60_000 }));

exploreRoutes.post('/recommendations', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid_request', details: parsed.error.flatten() }, 400);
  }

  if (!c.env.GEMINI_API_KEY) {
    return c.json({ error: 'server_misconfigured', message: 'GEMINI_API_KEY missing' }, 500);
  }

  try {
    const result = await generateRecommendations(c.env.GEMINI_API_KEY, parsed.data.seedDestinations);
    return c.json(result);
  } catch (err) {
    console.error('Explore route error:', err);
    if (err instanceof GeminiError) {
      const cause = err.cause as { message?: string } | undefined;
      return c.json({ error: 'generation_failed', message: err.message, cause: cause?.message }, 502);
    }
    return c.json({ error: 'internal_error', message: String(err) }, 500);
  }
});
