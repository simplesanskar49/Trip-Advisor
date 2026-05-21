import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

type Bindings = {
  GEMINI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  UNSPLASH_ACCESS_KEY: string;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', logger());
app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'] }));

app.get('/', (c) => c.json({ name: 'trip-architect-api', status: 'ok' }));
app.get('/health', (c) => c.json({ ok: true, env: c.env.ENVIRONMENT }));

// Routes wired in later steps:
// app.route('/api/itinerary', itineraryRoutes);
// app.route('/api/explore', exploreRoutes);
// app.route('/api/trips', tripsRoutes);

export default app;
