import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { itineraryRoutes } from './routes/itinerary';
import { exploreRoutes } from './routes/explore';
import type { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', logger());
app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'] }));

app.get('/', (c) => c.json({ name: 'trip-advisor', status: 'ok' }));
app.get('/health', (c) => c.json({ ok: true, env: c.env.ENVIRONMENT }));

app.route('/api/itinerary', itineraryRoutes);
app.route('/api/explore', exploreRoutes);

app.notFound((c) => c.json({ error: 'not_found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'internal_error' }, 500);
});

export default app;
