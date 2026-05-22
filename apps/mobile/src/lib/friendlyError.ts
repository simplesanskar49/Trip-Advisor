/**
 * Map raw API/network/Gemini errors into short, friendly user-facing messages.
 * Keeps internal/technical details out of the UI.
 */
export function friendlyError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const m = message.toLowerCase();

  if (m.includes('network') || m.includes('fetch') || m.includes('failed to fetch')) {
    return 'Connection problem. Check your internet and try again.';
  }
  if (m.includes('429') || m.includes('rate_limited') || m.includes('resource_exhausted') || m.includes('quota')) {
    return "We've hit today's request limit. Please try again later.";
  }
  if (m.includes('503') || m.includes('unavailable') || m.includes('overload')) {
    return 'Our travel planner is busy. Give it a moment and try again.';
  }
  if (m.includes('schema') || m.includes('validation') || m.includes('non-json')) {
    return "Couldn't create a clean itinerary this time. Try again or tweak your prompt.";
  }
  if (m.includes('safety')) {
    return "We couldn't draft that one. Try a different destination or vibe.";
  }
  if (m.includes('not found') || m.includes('404')) {
    return 'Something went missing on our end. Try again.';
  }
  return 'Something went wrong. Please try again.';
}
