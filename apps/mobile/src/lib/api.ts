import Constants from 'expo-constants';

const API_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? 'http://localhost:8787';

export async function pingApi(): Promise<{ ok: boolean; env: string }> {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error(`API ping failed: ${res.status}`);
  return res.json();
}

export const apiBaseUrl = API_URL;
