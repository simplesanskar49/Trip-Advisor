import { ApiError, createApiClient } from '@trip/api-client';
import Constants from 'expo-constants';

const API_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? 'http://localhost:8787';

const client = createApiClient({ baseUrl: API_URL });

export const generateItinerary = client.generateItinerary;
export const refineItinerary = client.refineItinerary;
export const getRecommendations = client.getRecommendations;
export { ApiError };
