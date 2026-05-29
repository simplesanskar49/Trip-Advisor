import { ApiError, createApiClient } from '@trip/api-client';
import Constants from 'expo-constants';

// Resolution order, most → least reliable in a standalone build:
//   1. EXPO_PUBLIC_API_URL  — statically inlined into the JS bundle at build time (always present in release)
//   2. expoConfig.extra.apiUrl — works in dev / Expo Go, but can be undefined in some standalone builds
//   3. fallback — the deployed worker in release, localhost only in dev (never silently hit localhost on a device)
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  (__DEV__ ? 'http://localhost:8787' : 'https://api.trip-advisor.workers.dev');

const client = createApiClient({ baseUrl: API_URL });

export const generateItinerary = client.generateItinerary;
export const refineItinerary = client.refineItinerary;
export const getRecommendations = client.getRecommendations;
export { ApiError };
