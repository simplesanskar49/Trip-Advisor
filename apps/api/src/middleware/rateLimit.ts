import type { MiddlewareHandler } from 'hono';

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(opts: { max: number; windowMs: number }): MiddlewareHandler {
  return async (c, next) => {
    const ip =
      c.req.header('cf-connecting-ip') ??
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
      'unknown';
    const now = Date.now();
    const key = `${ip}:${c.req.path}`;
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    } else {
      bucket.count += 1;
      if (bucket.count > opts.max) {
        const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
        return c.json({ error: 'rate_limited', retryAfter }, 429, {
          'Retry-After': String(retryAfter),
        });
      }
    }
    await next();
  };
}
